App Proposal: StudySpark – Adaptive Study Planner

Overview:
StudySpark is an Adaptive Study Planner that helps students plan their studies, track their learning progress, and prepare for exams more effectively.
Unlike a normal study planner that only schedules study sessions, our app adapts to each student's learning progress. Based on completed topics and quiz performance, it recommends what the student should revise next.

The AI is an additional feature, not the main feature.

Problem Statement:
Many students know when they should study, but they don't know whether they actually understand the topics they have studied.
Most study planners only organize schedules, while AI tools like ChatGPT require students to manually explain what they have learned before generating quizzes.
Our app combines study planning, progress tracking, and AI-powered revision in one place.

Unique Selling Point (USP)
The main feature is the Adaptive Study Planner.
Instead of only helping students plan their study schedule, the app also tracks:
Completed topics
Quiz performance
Study progress
Using this information, the app recommends what topic the student should revise next.
Example:
  Quiz score < 60% → Recommend revising tomorrow.
  Quiz score 60–80% → Recommend revising in 3 days.
  Quiz score > 80% → Recommend revising in 7 days.
  This creates a personalized revision schedule for each student.

AI Feature (Additional Feature)
The AI is used to support learning, not replace the planner.
After completing a study topic, students can choose to generate an AI quiz.
The app sends the completed topics to the Gemini API, which generates:
Multiple-choice questions
Correct answers
Short explanations
The dashboard can also encourage students to use the AI feature with messages like:
"You've completed 3 topics today. Try an AI quiz to test your understanding!"
"You haven't taken a quiz for your recent study sessions. Testing yourself can improve memory and exam performance."

Target Users:
  Polytechnic students
  University students
  JC students
  Anyone preparing for exams

Main Features
1. User Authentication (Izzul)
   Sign up
   Login
   Secure password hashing
   User profile
   
3. Study Planner (CRUD) (Yuki)
   Create study sessions
   View study sessions
   Edit study sessions
   Delete study sessions
   Mark study topics as completed
   
5. Adaptive Dashboard (Zachary)
   Upcoming study sessions
   Study streak
   Progress
   Completed topics
   Revision recommendations
   
7. Notifications (Rui Feng)
   Study reminders
   Revision reminders
   Motivational notifications
   AI quiz reminders
   
9. AI Quiz Generator (Kenneth)
    Students can generate quizzes based on the topics they have completed.
   The AI generates:
   Multiple-choice questions
   Answers
   Explanations
   
11. GitHub & System Design (Ryan)
    Repository management
    Branching
    Pull requests
    System architecture
    
