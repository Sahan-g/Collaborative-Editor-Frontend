import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Email validation
  const isValidEmail = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email.length > 0 && emailRegex.test(email);
  }, [email]);

  // Password validation
  const isValidPassword = useMemo(() => {
    return password.length > 0;
  }, [password]);

  // Form is valid when all conditions are met
  const isFormValid = isValidEmail && isValidPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      setError("Please check all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Login failed");
        return;
      }

      const loginData = await response.json();

      // Store the JWT token
      localStorage.setItem("token", loginData.token);

      // Redirect to home page
      navigate("/");
    } catch {
      setError("Incorrect email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue collaborating</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={email.length > 0 && !isValidEmail ? "invalid" : ""}
              required
            />
            {email.length > 0 && !isValidEmail && (
              <span className="field-error">Please enter a valid email</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button
            type="submit"
            className={`login-btn ${isFormValid ? "enabled" : "disabled"}`}
            disabled={!isFormValid}
          >
            Sign In
          </button>
        </form>

        <div className="register-link">
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")}>Create one</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
