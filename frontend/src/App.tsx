import './App.css'
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Messages from './pages/Messages';

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
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/userProfile" element={<UserProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </div>
  )
}

export default App
