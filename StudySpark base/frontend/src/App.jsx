import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import AIQuizKenneth from './pages/AIQuiz-Kenneth.jsx';
import DashboardZachary from './pages/Dashboard-Zachary.jsx';
import HomeShared from './pages/Home-Shared.jsx';
import LoginIzzul from './pages/Login-Izzul.jsx';
import NotificationsRuiFeng from './pages/Notifications-RuiFeng.jsx';
import ProfileIzzul from './pages/Profile-Izzul.jsx';
import RegisterIzzul from './pages/Register-Izzul.jsx';
import StudyPlannerYuki from './pages/StudyPlanner-Yuki.jsx';
import SystemDesignRyan from './pages/SystemDesign-Ryan.jsx';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomeShared />} />
        <Route path="/dashboard" element={<DashboardZachary />} />
        <Route path="/planner" element={<StudyPlannerYuki />} />
        <Route path="/study-planner" element={<Navigate to="/planner" replace />} />
        <Route path="/ai-quiz" element={<AIQuizKenneth />} />
        <Route path="/notifications" element={<NotificationsRuiFeng />} />
        <Route path="/profile" element={<ProfileIzzul />} />
        <Route path="/login" element={<LoginIzzul />} />
        <Route path="/register" element={<RegisterIzzul />} />
        <Route path="/system-design" element={<SystemDesignRyan />} />
      </Routes>
    </Layout>
  );
}

export default App;
