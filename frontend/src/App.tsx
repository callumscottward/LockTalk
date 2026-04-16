import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import MemberDetails from './pages/MemberDetails';
import Members from './pages/Members';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Messages from './pages/Messages';
import UserManagement from './pages/UserManagement';
import Logs from './pages/Logs';
import Signup from './pages/Signup';
import ChatDirectory from './pages/ChatDirectory';
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
  // Below is what a sample API call might look like to Django once backend and frontend are more linked
  // const [data, setData] = useState('');

  // useEffect(() => {
  //   fetch("http://localhost:8000/user_messages/get_messages/")
  //     .then((res) => res.json())
  //     .then((data) => setData(data.message));
  // }, []);

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
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/userProfile" element={<UserProfile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/details/:id" element={<MemberDetails />} />

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
      </Routes>
    </div>
  )
}

export default App
