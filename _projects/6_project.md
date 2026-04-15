---
layout: page
title: LLM-as-Judge for Scientific Creativity Scoring
description: >
  This project investigates prompt engineering strategies for using large language models (LLMs) as
  automated judges to predict human-assigned creativity scores on the Scientific Creative Thinking Test (SCTT).
  Through a systematic ablation study, the project compares zero-shot, few-shot, chain-of-thought, and
  multi-dimensional rubric-based prompting approaches, examining how prompt specificity and reasoning effort
  affect regression performance against psychometrically derived creativity scores.
team: "Stanley Nurnberger"
advisors: "Dr. Jiho Noh"
importance: 4
category: current
github: https://github.com/Jiho-YesNLP/ca-llm-judge-ce
---

This project investigates **LLM-based automated scoring of scientific creativity** using the Scientific Creative Thinking Test (SCTT) — a psychometrically validated instrument where students generate ideas (experiments, hypotheses, research questions) for 15 scientific scenarios.

The central questions are: 

1. which prompt engineering strategies best enable an LLM to predict human-assigned creativity scores without task-specific fine-tuning? 
2. To what extent the reasoning effort, available with recent OpenAI models, can improve performance, and which aspects of creativity it attends to?

**Research Questions:**

1. Which prompt engineering strategies most improve LLM-based creativity score prediction?
2. How does prompt specificity — decomposing creativity into fluency, flexibility, originality, and elaboration — affect prediction performance?

**Approach:**

The project frames creativity scoring as a regression task. Ground-truth labels are JRT (Joint Rating Theory) scores derived from human raters, normalized to [0, 1]. LLM outputs (1–5 scale) are mapped to this continuous target. An ablation study systematically varies five dimensions:

- Zero-shot vs. few-shot (1, 3, 5 examples)
- No rubric vs. coarse vs. fine-grained rubric
- Holistic scoring vs. per-dimension (fluency, flexibility, originality, elaboration)
- Without vs. with chain-of-thought reasoning steps
- Pointwise vs. pairwise comparative judgment

**Dataset:** SCTT (~18K student responses across train/val/test/heldout splits); OSF: [osf.io/439zs](https://osf.io/439zs/)

**Key Results (preliminary, val n=30):** Best prompt-only condition (few-shot + rubric + CoT) achieves r = 0.294. Adding high reasoning effort (`reasoning_effort="high"`) raises this to r = 0.523 — approaching the fine-tuned ceiling of r = 0.74 reported in prior work.

**Future Directions:**

A key open question is whether the large gain from `reasoning_effort="high"` reflects genuine creativity understanding or surface-level pattern matching. Planned work to investigate this includes:

- **Reasoning trace analysis** — Collect reasoning summaries (via the OpenAI Responses API) for high- and low-scoring responses to examine whether the model spontaneously attends to SCTT rubric dimensions (fluency, flexibility, originality, elaboration) without being prompted to.
- **Reasoning-score alignment** — Compare what the model reasons about vs. what it actually scores; systematic misalignment may explain error patterns on specific dimensions.
- **Prompted vs. internal CoT** — Directly compare prompt-level chain-of-thought traces against internal reasoning summaries on the same responses to determine whether explicit scaffolding constrains or enriches natural reasoning.
- **Creativity construct validity** — Analyze whether unprompted reasoning traces reference the same constructs specified in the SCTT rubric, informing whether LLM-as-judge is a valid proxy for human raters.
- **Post-hoc score calibration** — Fit a calibration mapping (e.g., isotonic regression) from LLM outputs to the JRT score distribution using a held-out set, as an alternative to fine-tuning.
- **Fine-tuning on SCTT** — Train on the 11,969 labeled responses as a ceiling-bound experiment.

**Team:** Stanley Nurnberger, Dr. Jiho Noh

**Code:** [github.com/Jiho-YesNLP/ca-llm-judge-ce](https://github.com/Jiho-YesNLP/ca-llm-judge-ce)
