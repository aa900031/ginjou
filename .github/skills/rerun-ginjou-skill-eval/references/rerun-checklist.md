# Rerun Checklist

## Baseline Run

1. Confirm both candidate skill paths.
2. Read the current scenario bank version from `./skill-eval-scenarios.v1.yaml`.
3. Create a dated run report in `../.data/reports/` from `../assets/report-template.md` before doing any scoring.
4. Evaluate Candidate A with a subagent.
5. Evaluate Candidate B with a subagent.
6. Record totals, hit counts, and failure modes.

## Improvement Run

1. Keep the same scenario bank version.
2. Edit only the target candidate.
3. Re-run only the target candidate unless the user asks for a full comparison rerun.
4. Record the post-change score and remaining failure modes.

## Extending the Scenario Bank

1. Append new scenarios to `./skill-eval-scenarios.v1.yaml`.
2. Use the next stable id (`S10`, `S11`, ...).
3. Add tags and expected routing references.
4. Update future run reports to use the expanded scenario id set.
