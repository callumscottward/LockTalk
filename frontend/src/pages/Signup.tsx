import { useState } from "react";

interface SignupResponse {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export default function Signup() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  function getCSRFToken() {
    const match = document.cookie.match(/csrftoken=([\w-]+)/);
    return match ? match[1] : "";
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    setMessage("");

    const response = await fetch("/api/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(), // ⚠ important for session auth
      },
      credentials: "include", // ensures the session cookie is set
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        password1,
        password2,
      }),
    });

    const data: SignupResponse = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem("username", `${firstName} ${lastName}`);
      setMessage("Account created successfully!");
      window.location.href = "/dashboard"; // redirect to dashboard
    } else {
      if (data.errors) setErrors(data.errors);
      if (data.message) setMessage(data.message);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "20px" }}>
      <h2>Create an Account</h2>

      {message && (
        <div style={{ color: "red", marginBottom: "10px" }}>{message}</div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div>
          <label>Email:</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
          {errors.email && (
            <div style={{ color: "red", fontSize: "0.9em" }}>
              {errors.email.join(", ")}
            </div>
          )}
        </div>

        <div>
          <label>First Name:</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
          {errors.first_name && (
            <div style={{ color: "red", fontSize: "0.9em" }}>
              {errors.first_name.join(", ")}
            </div>
          )}
        </div>

        <div>
          <label>Last Name:</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
          {errors.last_name && (
            <div style={{ color: "red", fontSize: "0.9em" }}>
              {errors.last_name.join(", ")}
            </div>
          )}
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            required
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
          {errors.password1 && (
            <div style={{ color: "red", fontSize: "0.9em" }}>
              {errors.password1.join(", ")}
            </div>
          )}
        </div>

        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            required
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
          {errors.password2 && (
            <div style={{ color: "red", fontSize: "0.9em" }}>
              {errors.password2.join(", ")}
            </div>
          )}
        </div>

        {errors.non_field_errors && (
          <div style={{ color: "red" }}>
            {errors.non_field_errors.join(", ")}
          </div>
        )}

        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Sign Up
        </button>
      </form>

      <p style={{ marginTop: "20px" }}>
        <strong>Already have an account?</strong>
        <a href="/login/"> Login Now</a>
      </p>
    </div>
  );
}
