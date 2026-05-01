import { useState } from "react";

/**
 * @name Signup
 * ## Signup Component
 * This is the sign up page where new users enter new credentials to create
 * an account. This requires them to input a username and password as well
 * as some other identifying information to join the site.
 * @category Pages
 * @returns A centered sign up page for new users.
 */

interface SignupResponse {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}
function getCSRFToken() {
  const regex = /csrftoken=([\w-]+)/;
  const match = regex.exec(document.cookie);

  return match ? match[1] : "";
}

export default function Signup() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

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

    const sanitizeText = (value: string) =>
      value
        .normalize("NFKC")
        .trim();

    const isValidName = (name: string) =>
      /^[a-zA-Z\s'-]{1,50}$/.test(name);


    if (response.ok && data.success) {
      const safeFirst = sanitizeText(firstName)
      const safeLast = sanitizeText(lastName)

      if (!isValidName(safeFirst) || !isValidName(safeLast)) {
        setMessage("Invalid name format.");
        return;
      }

      localStorage.setItem("username", `${safeFirst} ${safeLast}`);
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
          <label htmlFor="email">Email:</label>
          <input
            id="email"
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
          <label htmlFor="firstName">First Name:</label>
          <input
            id="firstName"
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
          <label htmlFor="lastName">Last Name:</label>
          <input
            id="lastName"
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
          <label htmlFor="password">Password:</label>
          <input
            id="password"
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
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            id="confirmPassword"
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
