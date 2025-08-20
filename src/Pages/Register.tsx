import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Register.css";
import api from "../api/api";
import { isAxiosError } from "axios";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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

    if (!isFormValid || submitting) return;
    setSubmitting(true);

    try {
      const emailTrimmed = email.trim().toLowerCase();
      
      await api.register({ email: emailTrimmed, password });

      //  Auto-login after successful registration
      const loginRes = await api.login({ email: emailTrimmed, password });
      const { token } = loginRes.data;

      // Your auth context
      login(token, { email: emailTrimmed });

      navigate("/");
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 409) {
          setError(
            "That email is already registered. Try signing in or use “Forgot password”."
          );
          return;
        }
      } else {
        setError("Network error");
      }
    } finally {
      setSubmitting(false);
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
