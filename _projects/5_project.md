---
layout: page
title: Automated Discourse Analysis of Reasoning Patterns in Science Classrooms
description: >
  This project investigates automated classification of reasoning components (RC) and utterance types (UT)
  in science classroom dialogue using LLM-based data augmentation and fine-tuned transformer models.
  By probing students' reasoning patterns with a revised 4-class RC scheme (ER, SR-D, SR-I, NA), the project
  analyzes co-occurrence and sequential discourse patterns, tracks cognitive complexity over lesson time, and
  identifies instructional moves associated with higher-order student reasoning.
team: "Mukhesh Raghava Katragadda, Raymond Carl"
advisors: "Dr. Soon Lee, Dr. Jiho Noh"
importance: 3
category: current
related_publications: false
---

This project investigates **automated classification of reasoning components (RC)** in science classroom dialogue — a subproject within the broader ADAS initiative — using fine-tuned transformer models and LLM-based data augmentation.

Classroom discourse encodes rich information about students' cognitive engagement, but manual coding is labor-intensive and difficult to scale. This project addresses both the modeling and analytical challenges of discourse coding at scale.

**Research Questions:**

1. To what extent can LLM-based data augmentation and semi-supervised learning improve utterance-type and reasoning-component classification accuracy?
2. What co-occurrence and sequential patterns of utterance types and reasoning components characterize science classroom discourse?
3. How does students' cognitive complexity evolve over a lesson, and which teacher moves are associated with shifts toward higher-order reasoning?

**Approach:**

A **RoBERTa-base** classifier processes each utterance within a surrounding context window (speaker-tagged), jointly predicting utterance type (10-class) and reasoning component (4-class). To address severe class imbalance, LLM-generated synthetic examples augment the minority RC classes (SR-I, ER) to ≥15% of the dominant class count. Discourse pattern analysis includes UT×RC co-occurrence tables, FP-Growth frequent itemset mining, temporal cognitive complexity tracking, and lag-sequential analysis of teacher move → student reasoning transitions.

**Coding Scheme (RC — 4 classes):**

| Code | Meaning |
|------|---------|
| ER   | Everyday Reasoning — informal, anecdotal, pre-scientific |
| SR-D | Scientific Reasoning (Descriptive) — declarative facts, observations |
| SR-I | Scientific Reasoning (Inferential) — patterns, hypotheses, models |
| NA   | Not Applicable — procedural or management talk |

**Team:** Raymond Carl, Mukhesh Raghava Katragadda, Dr. Soon Lee, Dr. Jiho Noh
