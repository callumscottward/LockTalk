import { useState, useEffect } from 'react';

/**
 * @name UserProfile
 * ## UserProfile Component
 * This module is the view of the user profile page with all
 * its data. 
 * It shows things like the users email, username, and role.
 * There is temporary data put in to mock user data while
 * the backend is implemented.
 * @category Pages
 * @returns A layout containing a centered card with user details.
 */
export default function UserProfile() {

  // The current calls
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserUsername, setCurrentUserUsername] = useState<string | null>(null);

  const authHeaders = {
    "Content-Type": "application/json",
  };

 // Fetch current user once you reach account details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/verify-staff/", {
          headers: authHeaders,
          credentials: "include"
        });
        const data = await res.json();
        setCurrentUser(data);
        setCurrentUserUsername(data.username);
        setCurrentUserEmail(data.email);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: '#f0f2f5',
      fontFamily: 'sans-serif',
      color: 'black',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      flexDirection: 'column'
    }}>

        <button 
          onClick={() => window.location.href = "/Dashboard"} 
          style={{
            background: "none",
            border: "none",
            color: "#000",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "0",
            marginBottom: "1px",
            fontSize: "2rem",
            fontWeight: "500",
            marginTop: "-15px",
            position: 'absolute',
            top: '30px',
            left: '30px'
          }}>
          <span style={{ marginRight: "5px" }}>←</span>
        </button>

        <h1 style={{ borderBottom: '2px solid #075E54', paddingBottom: '10px', marginBottom: '30px' }}>
          Account Details
        </h1>

        {/* Account Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontWeight: 'bold', color: 'gray', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Username</label>
            <div style={{ fontSize: '1.2rem', marginTop: '5px' }}>{currentUserUsername}</div>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', color: 'gray', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Role</label>
            <div style={{ fontSize: '1.1rem', marginTop: '5px', color: '#075E54', fontWeight: 'bold' }}>{currentUser?.is_staff ? 'Admin' : 'User'}</div>
          </div>

          {/* Username is saved as email */}
          <div>
            <label style={{ fontWeight: 'bold', color: 'gray', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email Address</label>
            <div style={{ fontSize: '1.1rem', marginTop: '5px' }}>{currentUserEmail}</div>
          </div>
        </div>

        <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Need to make a change?</p>
          <button 
            // onclick here, would have the call to do something
            style={{ 
              background: '#075E54', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Contact Admin
          </button>
        </div>
      </div>
  );
}