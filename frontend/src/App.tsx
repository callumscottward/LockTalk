import './App.css'
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import Logs from './pages/Logs';
import Signup from './pages/Signup';
import ChatDirectory from './pages/ChatDirectory';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/userProfile" element={<UserProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/userManagement" element={<UserManagement />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/chatDirectory" element={<ChatDirectory />} />
      </Routes>
    </div>
  )
}

export default App
