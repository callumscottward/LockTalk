import { Link } from "react-router-dom";

function Login() {
  return (
    <div>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="text" id="email" name="email" placeholder="user@email.com"></input>
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" placeholder="Password"></input>
      </div>
      <button>
        <Link to="/messages">Messages</Link>
      </button>
    </div>
  );
}

export default Login;
