import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutesIzzul from './routes/authRoutes-Izzul.js';
import databaseRoutesRyan from './routes/databaseRoutes-Ryan.js';
import dashboardRoutesZachary from './routes/dashboardRoutes-Zachary.js';
import notificationRoutesRuiFeng from './routes/notificationRoutes-RuiFeng.js';
import plannerRoutesYuki from './routes/plannerRoutes-Yuki.js';
import quizRoutesKenneth from './routes/quizRoutes-Kenneth.js';
import { processScheduledNotifications } from './services/notificationService-RuiFeng.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'StudySpark backend base server is running.' });
});

app.use('/api/auth', authRoutesIzzul);
app.use('/api/database', databaseRoutesRyan);
app.use('/api/planner', plannerRoutesYuki);
app.use('/api/dashboard', dashboardRoutesZachary);
app.use('/api/notifications', notificationRoutesRuiFeng);
app.use('/api/quiz', quizRoutesKenneth);

function startNotificationScheduler() {
  setInterval(async () => {
    try {
      const dueNotifications = await processScheduledNotifications();
      if (dueNotifications.length > 0) {
        console.log(`StudySpark scheduler: ${dueNotifications.length} reminder(s) are now due.`);
      }
    } catch (error) {
      console.error('StudySpark scheduler failed:', error.message);
    }
  }, 30 * 1000);
}

app.listen(PORT, () => {
  console.log(`StudySpark backend running on port ${PORT}`);
  startNotificationScheduler();
});
