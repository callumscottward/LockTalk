import { useState } from 'react';

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
  const [user] = useState({
    username: 'emma.wilson',
    email: 'emmaW@gmail',
    phone: '+1 (402) 012-3456',
    role: 'Admin'
  });

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
      left: 0
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '500px', 
        background: 'white', 
        padding: '40px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
      }}>



        <h1 style={{ borderBottom: '2px solid #075E54', paddingBottom: '10px', marginBottom: '30px' }}>
          Account Details
        </h1>

        {/* Account Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontWeight: 'bold', color: 'gray', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Username</label>
            <div style={{ fontSize: '1.2rem', marginTop: '5px' }}>{user.username}</div>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', color: 'gray', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Role</label>
            <div style={{ fontSize: '1.1rem', marginTop: '5px', color: '#075E54', fontWeight: 'bold' }}>{user.role}</div>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', color: 'gray', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email Address</label>
            <div style={{ fontSize: '1.1rem', marginTop: '5px' }}>{user.email}</div>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', color: 'gray', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Phone Number</label>
            <div style={{ fontSize: '1.1rem', marginTop: '5px' }}>{user.phone}</div>
          </div>
        </div>

        <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Need to make a change?</p>
          <button 
            // onclick here, would have the call to do something
            style={{ 
              background: '#075E54', 
              color: 'black', 
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
    </div>
  );
}