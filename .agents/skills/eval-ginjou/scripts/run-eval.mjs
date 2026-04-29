#!/usr/bin/env node
// run-eval — orchestrator for the ginjou skill regression eval.
//
// Bundled as part of the eval-ginjou skill at:
//   .agents/skills/eval-ginjou/scripts/run-eval.mjs
//
// Subcommands:
//   prepare [N|--next]     bootstrap iteration + emit dispatch/grader prompts
//   validate [N]           validate grading.json schema
//   fix [N]                backfill missing fields in grading.json
//   finalize [N]           validate (auto-fix) + aggregate + generate-review
//   all [N|--next]         alias: prepare → wait for agent dispatches → finalize

import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import * as process from 'node:process'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url)) // .agents/skills/eval-ginjou/scripts/
const skillSelfDir = join(here, '..') // .agents/skills/eval-ginjou/
const repoRoot = join(skillSelfDir, '..', '..', '..') // ginjou repo root
const skillUnderTestDir = join(repoRoot, 'skills', 'ginjou') // skill being tested
const maintainScripts = '/Users/zhong666/.agents/skills/maintain-skill/scripts'

function usage(code = 0) {
	console.log(`Usage:
  node run-eval.mjs prepare [N|--next]   bootstrap iteration + emit prompts
  node run-eval.mjs validate [N]         validate grading.json schema
  node run-eval.mjs fix [N]              backfill missing/wrong fields
  node run-eval.mjs finalize [N]         validate(+autofix) + aggregate + review
  node run-eval.mjs all [N|--next]       prepare; (you dispatch); finalize`)
	process.exit(code)
}

function resolveN(arg) {
	if (arg === '--next') {
		const existing = readdirSync(skillSelfDir)
			.map(n => n.match(/^iteration-(\d+)$/)?.[1])
			.filter(Boolean)
			.map(Number)
		return existing.length ? Math.max(...existing) + 1 : 1
	}
	const n = Number.parseInt(arg ?? '1', 10)
	if (!Number.isInteger(n) || n < 1) {
		console.error(`✗ invalid iteration number: ${arg}`)
		process.exit(1)
	}
	return n
}

function loadEvals() {
	return JSON.parse(readFileSync(join(skillSelfDir, 'references', 'evals.json'), 'utf8'))
}

function findGradingFiles(root) {
	const out = []
	if (!existsSync(root))
		return out
	for (const name of readdirSync(root)) {
		const p = join(root, name)
		if (statSync(p).isDirectory())
			out.push(...findGradingFiles(p))
		else if (name === 'grading.json')
			out.push(p)
	}
	return out
}

// ────────────────────────────────────────────────────────────────────
// validate
// ────────────────────────────────────────────────────────────────────

function validateOne(file) {
	const errs = []
	let g
	try {
		g = JSON.parse(readFileSync(file, 'utf8'))
	}
	catch (e) { return [`invalid JSON: ${e.message}`] }

	if (!Array.isArray(g.expectations)) {
		errs.push('expectations must be an array')
	}
	else {
		for (const [i, e] of g.expectations.entries()) {
			if (typeof e?.text !== 'string')
				errs.push(`expectations[${i}].text must be string`)
			if (typeof e?.passed !== 'boolean')
				errs.push(`expectations[${i}].passed must be boolean`)
			if (e?.evidence == null)
				errs.push(`expectations[${i}].evidence required`)
		}
	}

	const s = g.summary
	if (s == null || typeof s !== 'object' || Array.isArray(s)) {
		errs.push('summary must be an object')
	}
	else {
		for (const k of ['passed', 'failed', 'total']) {
			if (!Number.isInteger(s[k]))
				errs.push(`summary.${k} must be integer`)
		}
		if (typeof s.pass_rate !== 'number' || s.pass_rate < 0 || s.pass_rate > 1)
			errs.push('summary.pass_rate must be number in [0,1]')
		if (Number.isInteger(s.passed) && Number.isInteger(s.total) && s.total > 0) {
			const expected = s.passed / s.total
			if (typeof s.pass_rate === 'number' && Math.abs(s.pass_rate - expected) > 5e-4)
				errs.push(`summary.pass_rate (${s.pass_rate}) != passed/total (${expected.toFixed(6)})`)
		}
		if (Number.isInteger(s.passed) && Number.isInteger(s.failed) && Number.isInteger(s.total)
			&& s.passed + s.failed !== s.total) {
			errs.push(`summary.total (${s.total}) != passed+failed (${s.passed + s.failed})`)
		}
		if (Array.isArray(g.expectations) && g.expectations.length !== s.total)
			errs.push(`expectations.length (${g.expectations.length}) != summary.total (${s.total})`)
		if (!['PASS', 'PARTIAL', 'FAIL'].includes(s.verdict))
			errs.push(`summary.verdict must be PASS|PARTIAL|FAIL, got ${JSON.stringify(s.verdict)}`)
	}

	if (g.contamination == null || typeof g.contamination.clean !== 'boolean')
		errs.push('contamination.clean must be boolean')

	return errs
}

function validate(iterDir) {
	const files = findGradingFiles(iterDir)
	if (files.length === 0) {
		console.log(`(no grading.json files under ${iterDir})`)
		return true
	}
	let bad = 0
	for (const f of files) {
		const errs = validateOne(f)
		const rel = f.replace(`${iterDir}/`, '')
		if (errs.length === 0) {
			console.log(`✅ ${rel}`)
		}
		else {
			bad++
			console.log(`❌ ${rel}`)
			for (const e of errs) console.log(`     - ${e}`)
		}
	}
	console.log(`\n${files.length - bad}/${files.length} valid`)
	return bad === 0
}

// ────────────────────────────────────────────────────────────────────
// fix (backfill)
// ────────────────────────────────────────────────────────────────────

function fix(iterDir) {
	const files = findGradingFiles(iterDir)
	let fixed = 0
	for (const f of files) {
		const g = JSON.parse(readFileSync(f, 'utf8'))
		const before = JSON.stringify(g)

		if (typeof g.summary === 'string') {
			const notes = g.summary
			const passed = Array.isArray(g.expectations) ? g.expectations.filter(e => e.passed).length : 0
			const total = Array.isArray(g.expectations) ? g.expectations.length : 0
			g.summary = { passed, failed: total - passed, total, pass_rate: total ? passed / total : 0, notes }
		}
		if (g.summary && !g.summary.verdict) {
			const pr = g.summary.pass_rate
			g.summary.verdict = pr === 1 ? 'PASS' : pr === 0 ? 'FAIL' : 'PARTIAL'
		}
		if (g.summary && Number.isInteger(g.summary.passed) && Number.isInteger(g.summary.total) && g.summary.total > 0)
			g.summary.pass_rate = g.summary.passed / g.summary.total

		if (g.contamination == null)
			g.contamination = { clean: true, details: '' }
		if (typeof g.contamination.clean !== 'boolean') {
			const details = String(g.contamination.details ?? g.contamination.notes ?? '').toLowerCase()
			g.contamination.clean = !/contaminat|leaked|forbidden|outside|violat/.test(details)
		}

		if (JSON.stringify(g) !== before) {
			writeFileSync(f, JSON.stringify(g, null, 2))
			fixed++
			console.log(`fixed: ${f.replace(`${iterDir}/`, '')}`)
		}
	}
	console.log(`\n${fixed} file(s) fixed.`)
}

// ────────────────────────────────────────────────────────────────────
// prompt generators
// ────────────────────────────────────────────────────────────────────

function dispatchPrompt(runType, ev, iterDir) {
	const dirName = ev.dir_name
	const allowed = runType === 'with_skill'
		? `- ${skillUnderTestDir}/SKILL.md
- ${skillUnderTestDir}/references/**/*.md
- Remote https://ginjou.pages.dev/raw/... URLs (optional)`
		: '- (none — answer purely from model knowledge)'
	const forbidden = runType === 'with_skill'
		? `- Do NOT read ${repoRoot}/packages/** or ${repoRoot}/docs/**
- Do NOT invent plausible-sounding APIs (only use names you can cite from references).`
		: `- Do NOT use ANY read tool (no skill, no references, no workspace, no web).
- Do NOT fetch any URL.
- Answer purely from model knowledge.`

	return `# Dispatch prompt — ${runType} / ${dirName}
# Send this to runSubagent.

You are answering a developer's question${runType === 'with_skill' ? ' using the ginjou skill' : ''}. Evaluation run — graded on factual API correctness.

## Allowed reads
${allowed}

## Forbidden
${forbidden}

## User prompt to answer (verbatim)
${ev.prompt}

## Required outputs (absolute paths)
1. ${iterDir}/${dirName}/${runType}/outputs/answer.md — full markdown answer with code samples${runType === 'with_skill' ? ' and citations' : ''}.
2. ${iterDir}/${dirName}/${runType}/outputs/metrics.json — { "files_read":[], "web_fetched":[], "tool_call_count":N, "files_created":[], "errors":[] }
3. ${iterDir}/${dirName}/${runType}/transcript.md — short routing notes${runType === 'with_skill' ? ' + which references consulted + guard rails honored' : ' (just confirm no reads were used)'}.

Return a 2-3 sentence summary.
`
}

function graderPrompt(runType, ev, iterDir) {
	const dirName = ev.dir_name
	const tx = `${iterDir}/${dirName}/${runType}/transcript.md`
	const out = `${iterDir}/${dirName}/${runType}/outputs/`
	const save = `${iterDir}/${dirName}/${runType}/grading.json`
	const allowedNote = runType === 'with_skill'
		? 'with_skill: only `skills/ginjou/**` reads + remote ginjou.pages.dev URLs allowed'
		: 'without_skill: NO read tool calls allowed; ANY read = contamination'

	return `# Grader prompt — ${runType} / ${dirName}
# Send this to runSubagent. Save grading.json matching schema below.

Grader for the ginjou skill eval. Save valid JSON or aggregate will silently miscount.

<grader-protocol>
1. Read transcript at ${tx} fully.
2. Contamination check — ${allowedNote}.
3. Examine outputs at ${out} (answer.md + metrics.json).
4. For EACH expectation below, decide PASS or FAIL.
   - PASS = clear textual evidence + factually correct API names.
   - FAIL = no evidence, superficial match, OR fabricated/plausible-sounding APIs.
   - Lean to FAIL when uncertain.
5. Extract every factual API claim into claims[].
6. Read user_notes.md if exists, else null.
7. Critique the eval in eval_feedback.

Save grading.json to ${save} matching this schema:

{
  "expectations": [{"text": "...", "passed": true, "evidence": "..."}],
  "summary": {
    "passed": <int>,
    "failed": <int>,
    "total": <int>,
    "pass_rate": <passed/total as float in [0,1]>,
    "verdict": "PASS" | "PARTIAL" | "FAIL",
    "notes": "<optional human summary>"
  },
  "contamination": { "clean": <bool>, "details": "..." },
  "execution_metrics": { "files_read": [], "web_fetched": [], "tool_call_count": 0, "files_created": [], "errors": [] },
  "timing": { "wall_time_seconds": null },
  "claims": ["..."],
  "user_notes_summary": null,
  "eval_feedback": { "discriminative": <bool>, "suggestions": ["..."] }
}

Self-check before saving:
- summary is an OBJECT (not a string).
- summary.pass_rate === passed/total (numeric).
- summary.total === passed + failed.
- expectations.length === summary.total.
- verdict ∈ {"PASS","PARTIAL","FAIL"}.
</grader-protocol>

## Eval prompt
${ev.prompt}

## Expectations (verbatim)
${JSON.stringify(ev.expectations, null, 2)}

Return brief summary including pass count and contamination flag.
`
}

// ────────────────────────────────────────────────────────────────────
// commands
// ────────────────────────────────────────────────────────────────────

function prepare(n) {
	const iterDir = join(skillSelfDir, `iteration-${n}`)
	mkdirSync(iterDir, { recursive: true })
	copyFileSync(join(skillSelfDir, 'references', 'evals.json'), join(iterDir, 'evals.json'))
	console.log(`✓ iteration-${n} ready: ${iterDir}/evals.json`)

	const promptsDir = join(iterDir, '_prompts')
	mkdirSync(promptsDir, { recursive: true })
	const evals = loadEvals()
	for (const ev of evals.evals) {
		for (const runType of ['with_skill', 'without_skill']) {
			writeFileSync(join(promptsDir, `${ev.dir_name}.${runType}.dispatch.md`), dispatchPrompt(runType, ev, iterDir))
			writeFileSync(join(promptsDir, `${ev.dir_name}.${runType}.grader.md`), graderPrompt(runType, ev, iterDir))
		}
	}
	console.log(`✓ wrote ${evals.evals.length * 4} prompts to ${promptsDir}/`)
	console.log(`\nNext: dispatch each *.dispatch.md via runSubagent (with_skill + without_skill),`)
	console.log(`      then dispatch each *.grader.md, then run:`)
	console.log(`      node ${join(here, 'run-eval.mjs')} finalize ${n}`)
}

function finalize(n) {
	const iterDir = join(skillSelfDir, `iteration-${n}`)
	if (!existsSync(iterDir)) {
		console.error(`✗ ${iterDir} not found. Run prepare first.`)
		process.exit(1)
	}

	console.log('→ validating grading.json files…')
	if (!validate(iterDir)) {
		console.log('\n→ fixing schema issues…')
		fix(iterDir)
		console.log('\n→ re-validating…')
		if (!validate(iterDir)) {
			console.error('✗ validation still failing after fix; aborting')
			process.exit(1)
		}
	}

	console.log('\n→ aggregating benchmark…')
	execSync(`node ${maintainScripts}/aggregate-benchmark.mjs ${iterDir} --skill-name ginjou`, { stdio: 'inherit' })

	console.log('→ generating review…')
	const prevArg = n > 1 ? `--previous-workspace ${join(skillSelfDir, `iteration-${n - 1}`)}` : ''
	execSync(`node ${maintainScripts}/generate-review.mjs ${iterDir} --skill-name "ginjou" ${prevArg}`, { stdio: 'inherit' })

	console.log(`\n✓ done. Open ${iterDir}/review.html or read ${iterDir}/benchmark.md`)
}

const cmd = process.argv[2]
const arg = process.argv[3]
if (!cmd)
	usage(1)

if (cmd === 'prepare') {
	prepare(resolveN(arg))
}
else if (cmd === 'validate') {
	process.exit(validate(join(skillSelfDir, `iteration-${resolveN(arg)}`)) ? 0 : 1)
}
else if (cmd === 'fix') {
	fix(join(skillSelfDir, `iteration-${resolveN(arg)}`))
}
else if (cmd === 'finalize') {
	finalize(resolveN(arg))
}
else if (cmd === 'all') {
	const n = resolveN(arg)
	prepare(n)
	console.log('\n⚠ Now dispatch all subagents listed above, then re-run:')
	console.log(`  node ${join(here, 'run-eval.mjs')} finalize ${n}`)
}
else {
	usage(1)
}
