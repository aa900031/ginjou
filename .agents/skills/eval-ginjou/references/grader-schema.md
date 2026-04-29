# Grader Prompt Template

Use this exact template when dispatching grader subagents for ginjou evals. The schema below is non-negotiable — `aggregate-benchmark.mjs` reads it positionally and fails silently when fields are missing or mistyped.

---

## Required `grading.json` schema (top-level)

```jsonc
{
	"expectations": [
		{ "text": "<verbatim expectation>", "passed": true, "evidence": "<quote or path:line>" }
	],
	"summary": { // MUST be an object, NOT a string
		"passed": 7, // integer
		"failed": 0, // integer
		"total": 7, // integer = passed + failed
		"pass_rate": 1.0, // float in [0,1]; passed/total
		"verdict": "PASS", // "PASS" | "PARTIAL" | "FAIL"
		"notes": "<optional one-paragraph human summary>"
	},
	"contamination": {
		"clean": true,
		"details": "<which files/URLs were read; flag anything outside skills/ginjou/** for with_skill, or any read for baseline>"
	},
	"execution_metrics": {
		"files_read": [],
		"web_fetched": [],
		"tool_call_count": 0,
		"files_created": [],
		"errors": []
	},
	"timing": { "wall_time_seconds": null },
	"claims": ["<each factual API claim made in the answer, one per item>"],
	"user_notes_summary": "<copy from user_notes.md if present, else null>",
	"eval_feedback": {
		"discriminative": true,
		"suggestions": ["<concrete improvement to the eval, if any>"]
	}
}
```

### Validation rules graders MUST self-check before saving

1. `summary` is an **object**, never a string.
2. `summary.pass_rate === summary.passed / summary.total` (write the number, do NOT leave it for downstream code).
3. `summary.total === summary.passed + summary.failed`.
4. `expectations.length === summary.total`.
5. Every expectation has all three keys: `text`, `passed`, `evidence`.
6. `verdict` is one of `"PASS"` (all passed), `"PARTIAL"` (some passed), `"FAIL"` (none passed).
7. For `with_skill` runs: `contamination.clean` is `false` if any file outside `skills/ginjou/**` was read.
8. For `without_skill` runs: `contamination.clean` is `false` if **any** read tool was used at all (baseline must be answered from model knowledge only).

---

## Grader prompt template

Replace `{{...}}` placeholders. Send verbatim to the grader subagent.

```
You are a grader for the ginjou skill eval. Follow the protocol exactly. Save valid JSON or the aggregate script will silently miscount.

<grader-protocol>
1. Read the transcript at {{transcript_path}} fully.
2. Contamination check:
   - {{run_type}} == "with_skill" → only `skills/ginjou/**` reads + remote `https://ginjou.pages.dev/raw/...` URLs allowed.
   - {{run_type}} == "without_skill" → NO read tool calls allowed. Any read = contamination.
3. Examine the outputs at {{outputs_dir}} (answer.md + metrics.json).
4. For EACH expectation in the list below, decide PASS or FAIL.
   - PASS = clear textual evidence in answer.md AND factually correct API names.
   - FAIL = no evidence, superficial match only, OR fabricated/plausible-sounding APIs.
   - When uncertain, lean to FAIL.
5. Extract every factual API claim made in answer.md into `claims[]`.
6. Read user_notes.md if it exists; otherwise set user_notes_summary to null.
7. Critique the eval itself in `eval_feedback`.

CRITICAL: Save grading.json to {{save_path}} matching the schema in `.agents/skills/eval-ginjou/references/grader-schema.md`. Self-check before saving:
- summary is an OBJECT (not a string).
- summary.pass_rate is a number = passed/total.
- expectations.length === summary.total.
- summary.total === summary.passed + summary.failed.
- verdict ∈ {"PASS","PARTIAL","FAIL"}.

Reject any temptation to put narrative prose in `summary`; put it in `summary.notes` instead.
</grader-protocol>

## Eval being graded

- Run type: {{run_type}}
- Eval prompt: {{eval_prompt}}
- Expectations (verbatim from evals.json):
{{expectations_json_array}}
- Transcript: {{transcript_path}}
- Outputs: {{outputs_dir}}
- Save grading to: {{save_path}}

Return a 2-3 sentence summary including pass count and any contamination flag.
```

---

## Validator script

Run after grading to catch schema violations before aggregation:

```bash
node .agents/skills/eval-ginjou/scripts/run-eval.mjs validate 1
```

See the bundled `scripts/run-eval.mjs` (`validate` subcommand).
