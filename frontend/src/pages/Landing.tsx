import { Link } from 'react-router-dom';

/**
 * @name Landing
 * ## Landing Component
 * This is where users land by default when entering
 * the application. Its purpose is to redirect them to
 * the login page so they can enter their account, or
 * click the new account button.
 * @category Pages
 * @returns A redirection to the login page.
 */

function Landing() {
  return (
    <div>
      <h1>Welcome to LockTalk!</h1>
      <button><Link to="/login">Login</Link></button>
    </div>
  );
};

export default Landing;
