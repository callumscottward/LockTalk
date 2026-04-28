import { useEffect, useState } from "react";

/**
 * @name Login
 * ## Login Component
 * This module is where users can log in. They enter their
 * username or email and password. If it matches then they are
 * moved to the dashboard and enter their account, otherwise it
 * is a failed sign in attempt.
 * @category Pages
 * @returns The login page for returning users.
 */

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setCooldown(c => c - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  function getCSRFToken() {
    const match = document.cookie.match(/csrftoken=([\w-]+)/);
    return match ? match[1] : "";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/login/", {
      method: "POST", // unsafe method triggers CSRF check
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(), // must send CSRF token
      },
      credentials: "include", // ensures session cookie is sent
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 429) {
      setMessage("Too many attempts. Please wait a moment.");
      setCooldown(60);
      return;
    }


    const data = await response.json();

    if (data.success) {
      setMessage(data.message);
      window.location.href = "/dashboard";
    } else {
      setMessage(data.message);
      setCooldown(3);
    }
  };

  return (
    <>
      <h1>Welcome to LockTalk!</h1>
      <div style={{ maxWidth: "500px", margin: "50px auto", padding: "20px" }}>
        <h2>Login</h2>

        {message && (
          <div style={{ color: "red", marginBottom: "10px" }}>{message}</div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={cooldown > 0}
            style={{
              padding: "10px",
              backgroundColor: cooldown > 0 ? "#8e8e8eff" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {cooldown > 0 ? `Wait ${cooldown}s` : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "20px" }}>
          <strong>Don't have an account?</strong>
          <a href="/signup/"> Sign Up Now</a>
        </p>
      </div>
    </>
  );
}

export default Login;
