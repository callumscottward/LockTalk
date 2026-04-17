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
import { useState, useEffect } from 'react';

// Helpful for the staff stuff
const StaffRoute = ({ user, loading, children }: { user: any, loading: boolean, children: React.ReactElement }) => {
  if (loading) return <div>Loading...</div>; // Prevent redirect before we know who the user is
  
  if (!user || user.is_staff !== true) {
    // If not staff, redirect to dashboard (or landing)
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your actual auth-check endpoint 
    // This should return the user object with 'is_staff' from your serializer
    fetch("http://localhost:8000/api/verify-staff/", {
      credentials: "include"
    }) 
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not logged in");
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* These sites redirect to /login if not logged in */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/userProfile" element={<UserProfile />} />
          
          {/* Restricted Staff Routes */}
          <Route 
            path="/userManagement" 
            element={
              <StaffRoute user={user} loading={loading}>
                <UserManagement />
              </StaffRoute>
            } 
          />
          <Route 
            path="/logs" 
            element={
              <StaffRoute user={user} loading={loading}>
                <Logs />
              </StaffRoute>
            } 
          />
          <Route 
            path="/chatDirectory" 
            element={
              <StaffRoute user={user} loading={loading}>
                <ChatDirectory />
              </StaffRoute>
            } 
          />
        </Route>
      </Routes>
    </div>
  )
}

export default App
