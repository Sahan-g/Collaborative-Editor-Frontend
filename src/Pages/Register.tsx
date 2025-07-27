import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Email validation
  const isValidEmail = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email.length > 0 && emailRegex.test(email);
  }, [email]);

  // Password validation
  const isValidPassword = useMemo(() => {
    return password.length >= 6;
  }, [password]);

  // Passwords match validation
  const passwordsMatch = useMemo(() => {
    return password === confirmPassword && confirmPassword.length > 0;
  }, [password, confirmPassword]);

  // Form is valid when all conditions are met
  const isFormValid = isValidEmail && isValidPassword && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      setError("Please check all fields");
      return;
    }

    try {
      // Register the user
      const registerResponse = await fetch(
        "http://localhost:8081/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!registerResponse.ok) {
        const data = await registerResponse.json();
        setError(data.message || "Registration failed");
        return;
      }

      // Auto-login after successful registration
      const loginResponse = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        const data = await loginResponse.json();
        setError(data.message || "Login failed after registration");
        return;
      }

      const loginData = await loginResponse.json();

      // Store the JWT token
      localStorage.setItem("token", loginData.token);

      // Redirect to home page
      navigate("/");
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join us and start collaborating</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
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
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={
                password.length > 0 && !isValidPassword ? "invalid" : ""
              }
              required
            />
            {password.length > 0 && !isValidPassword && (
              <span className="field-error">
                Password must be at least 6 characters
              </span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={
                confirmPassword.length > 0 && !passwordsMatch ? "invalid" : ""
              }
              required
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <span className="field-error">Passwords do not match</span>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          <button
            type="submit"
            className={`register-btn ${isFormValid ? "enabled" : "disabled"}`}
            disabled={!isFormValid}
          >
            Create Account
          </button>
        </form>

        <div className="login-link">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")}>Sign in</button>
        </div>
      </div>
    </div>
  );
};

export default Register;
