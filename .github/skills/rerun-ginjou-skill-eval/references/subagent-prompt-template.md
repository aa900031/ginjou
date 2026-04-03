# Subagent Prompt Template for Skill Evaluation

Use this template for each candidate skill separately.

## Prompt

You are doing strict skill evaluation. Research only; do not edit files.

Task:

Evaluate `<CANDIDATE_SKILL_PATH>` against scenario bank `<SCENARIO_BANK_PATH>`.

Rules:

1. Treat the candidate skill and its references as the only authority.
2. Do not borrow knowledge from other skill variants.
3. Score each scenario using:
   - Trigger hit: 0 / 0.5 / 1
   - Reference routing: 0 / 1 / 1.5 / 2
   - No hallucination / unnecessary assumption: 0 / 0.5 / 1
   - Backend-specific coverage: 0 / 0.5 / 1
4. Be strict and concise.

Output:

1. A compact markdown table:
   - Scenario | Trigger | Routed refs | Assumption risk | Backend coverage | Score | Verdict
2. Total score out of `scenario_count * 5`
3. Hit count out of `scenario_count`
4. Top 3 failure modes caused by the candidate skill itself
