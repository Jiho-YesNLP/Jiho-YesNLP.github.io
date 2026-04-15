---
layout: page
title: Dynamic Reward Agents for LLM Reinforcement Learning
description: >
  This thesis project investigates whether dynamically regenerating an LLM-based reward rubric during
  reinforcement learning (RL) training can sustain improvements in LLM reasoning beyond what static reward
  mechanisms achieve. Using Group Relative Policy Optimization (GRPO) and the Phi-4 (14B) model, five
  training conditions are compared on the MMLU-Pro reasoning benchmark — from an untrained baseline and
  supervised fine-tuning to RL with a static scalar reward, a static LLM judge, and a fully dynamic
  LLM judge whose evaluation criteria evolve as the policy improves.
team: "Raymond Carl"
advisors: "Dr. Jiho Noh"
importance: 5
category: current
github: https://github.com/Jiho-YesNLP/dynamic-reward-llm-rl
---

This master's thesis investigates whether **periodically regenerating an LLM-based reward rubric** during RL training can overcome reward saturation — a key limitation of static reward models — and sustain improvements in chain-of-thought reasoning as the policy model grows more capable.

Most RL pipelines for LLMs rely on fixed reward models or static rubrics that may fail to discriminate between reasoning traces once model competence improves. The proposed approach addresses this by applying curriculum at the *evaluation* level: a meta-evaluator LLM (GPT-5) periodically regenerates the reward specification during GRPO training, progressively raising the bar for what counts as high-quality reasoning — without retraining the evaluator itself.

**Research Questions:**

1. Can an LLM-based judge provide a useful training signal for RL on reasoning tasks?
2. Does RL with a dynamic LLM-based reward model outperform SFT and static reward alternatives?
3. To what extent are any gains attributable to LLM-based ranking vs. dynamic updating?

**Approach:**

Five conditions are compared on MMLU-Pro (12K professional-level multiple-choice questions, 10 answer choices):

| Condition | Description |
|-----------|-------------|
| C0 — Baseline | Pretrained Phi-4, no additional training |
| C1 — SFT | Supervised fine-tuning on MMLU-Pro train split |
| C2 — Static Scalar RM | GRPO + fixed correctness-based reward |
| C3 — Static LLM Judge | GRPO + GPT-5 judge, fixed rubric |
| C4 — Dynamic LLM Judge | GRPO + GPT-5 judge, rubric regenerated every 30 steps |

The dynamic reward spec (C4) is structured as executable Python code with four components — *accuracy*, *reasoning*, *format*, and *other* — whose weights (summing to 100) are updated by the meta-evaluator conditioned on training history and sampled outputs.

**Evaluation:** Held-out accuracy on 2,407 MMLU-Pro test questions (20% partition, seed=42), with per-subject breakdown across 14 categories. Success requires C3 > C2, C4 > C3, and C4 achieving the highest overall accuracy among trained conditions.

**Team:** Raymond Carl, Dr. Jiho Noh

**Thesis Committee:** Dr. Jiho Noh (chair), Dr. Mahmut Karakaya, Dr. Zongxing Xie

**Code:** [github.com/Jiho-YesNLP/dynamic-reward-llm-rl](https://github.com/Jiho-YesNLP/dynamic-reward-llm-rl)
