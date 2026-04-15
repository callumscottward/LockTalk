import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import Logs from './pages/Logs';
import Signup from './pages/Signup';
import ChatDirectory from './pages/ChatDirectory';
import ProtectedRoutes from './ProtectedRoutes';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/userProfile" element={<UserProfile />} />
          <Route path="/userManagement" element={<UserManagement />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/chatDirectory" element={<ChatDirectory />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
