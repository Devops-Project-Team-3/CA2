# 📚 StudySpark – Adaptive Study Planner

PORT=3000

DB_HOST=[database host]

DB_USER=[database username]

DB_PASSWORD=[database password]

DB_NAME=studyplanner

## Overview

**StudySpark** is an adaptive study planner designed to help students plan their studies, track learning progress, and prepare for exams more effectively.

Unlike traditional study planners that only schedule study sessions, StudySpark adapts to each student's learning progress. Based on completed topics and quiz performance, the application recommends what students should revise next.

> **Note:** AI is an additional supporting feature and is **not** the core functionality of the application.

---

# Problem Statement

Many students know when they should study but struggle to determine whether they truly understand the topics they have learned.

Existing study planners mainly focus on scheduling, while AI tools such as ChatGPT require students to manually explain what they have learned before generating quizzes.

StudySpark solves this by combining:

- 📅 Study planning
- 📈 Progress tracking
- 🤖 AI-powered revision support

into a single application.

---

# Unique Selling Point (USP)

The primary feature of StudySpark is its **Adaptive Study Planner**.

Instead of only creating study schedules, the application continuously tracks:

- ✅ Completed topics
- 📝 Quiz performance
- 📊 Overall study progress

Using this information, StudySpark automatically recommends when a student should revise a topic.

## Revision Recommendation Rules

| Quiz Score | Recommended Revision |
|------------|----------------------|
| Below 60% | Revise tomorrow |
| 60% – 80% | Revise in 3 days |
| Above 80% | Revise in 7 days |

This creates a personalised revision schedule tailored to each student's learning performance.

---

# AI Feature (Supporting Feature)

The AI feature is designed to **support learning**, not replace the study planner.

After completing a study topic, students can choose to generate an AI-powered quiz.

Using the **Gemini API**, the application sends the completed topic(s) to generate:

- Multiple-choice questions
- Correct answers
- Short explanations

## Smart Dashboard Prompts

The dashboard can also encourage students to test themselves by displaying messages such as:

> "You've completed **3 topics today**. Try an AI quiz to test your understanding!"

> "You haven't taken a quiz for your recent study sessions. Testing yourself can improve memory and exam performance."

---

# Target Users

StudySpark is designed for:

- 🎓 Polytechnic students
- 🎓 University students
- 📖 Junior College (JC) students
- 📝 Anyone preparing for examinations

---

# Feature Breakdown

## 1. User Authentication *(Izzul)*

- User Registration
- User Login
- Secure Password Hashing
- User Profile

---

## 2. Study Planner (CRUD) *(Yuki)*

- Create Study Sessions
- View Study Sessions
- Edit Study Sessions
- Delete Study Sessions
- Mark Topics as Completed

---

## 3. Adaptive Dashboard *(Zachary)*

Displays:

- Upcoming Study Sessions
- Study Streak
- Learning Progress
- Completed Topics
- Adaptive Revision Recommendations

---

## 4. Notifications *(Rui Feng)*

Provides:

- 📅 Study Reminders
- 🔁 Revision Reminders
- 💪 Motivational Notifications
- 🤖 AI Quiz Reminders

---

## 5. AI Quiz Generator *(Kenneth)*

Students can generate quizzes based on completed study topics.

The AI generates:

- Multiple-choice Questions
- Correct Answers
- Explanations

---

## 6. GitHub & System Design *(Ryan)*

Responsible for:

- Repository Management
- Git Branching Strategy
- Pull Requests
- Overall System Architecture

---
