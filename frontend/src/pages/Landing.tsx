import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div>
      <h1>Welcome to LockTalk!</h1>
      <button><Link to="/login">Login</Link></button>
    </div>
  );
};

export default Landing;
