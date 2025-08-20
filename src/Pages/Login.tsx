import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Login.css";
import api from "../api/api";
import { isAxiosError } from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

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
      const res = await api.login({ email, password });
      const { token } = res.data;
      login(token, { email });
      navigate("/");
    } catch (err) {
      if (isAxiosError(err)) {
        setError( "invalid email or password");
      } else {
        setError("Login failed");
      }
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
