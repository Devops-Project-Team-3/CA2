import dotenv from 'dotenv';
import app from './app.js';
import { processScheduledNotifications } from './services/notificationService-RuiFeng.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

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
