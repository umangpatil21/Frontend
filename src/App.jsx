import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SkillDetails from './pages/SkillDetails';
import Chat from './pages/Chat';
import VideoCall from './pages/VideoCall';
import Admin from './pages/Admin';
import RecordedLessons from './pages/RecordedLessons';
import Certificates from './pages/Certificates';
import Notifications from './pages/Notifications';
import AiHelper from './components/AiHelper';
import { MediaProvider } from './context/MediaContext';
import Profile from './pages/Profile';

import { ErrorBoundary } from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <MediaProvider>
        <Router>
          <div className="min-h-screen font-sans text-apple-dark bg-apple-gray relative">
            <Navbar />
            <AiHelper />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/skill/:id" element={<SkillDetails />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/video" element={<VideoCall />} />
              <Route path="/lessons" element={<RecordedLessons />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </div>
        </Router>
      </MediaProvider>
    </ErrorBoundary>
  );
}

export default App;
