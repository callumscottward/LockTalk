import './App.css'
import { Routes, Route } from 'react-router-dom';
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

function App() {
  // Below is what a sample API call might look like to Django once backend and frontend are more linked
  // const [data, setData] = useState('');

  // useEffect(() => {
  //   fetch("http://localhost:8000/user_messages/get_messages/")
  //     .then((res) => res.json())
  //     .then((data) => setData(data.message));
  // }, []);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/userProfile" element={<UserProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/members" element={<Members />} />
        <Route path="/userManagement" element={<UserManagement />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/members/details/:id" element={<MemberDetails />} />
      </Routes>
    </div>
  )
}

export default App
