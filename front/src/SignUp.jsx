import React, { useState } from "react";
import { registerUser } from "./services";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(username, password);
      setError("");
      alert("Registered successfully!");
      navigate("/");
    } catch (err) {
      setError("Registration error. Check the data.");
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Register as a client</h1>
      <form onSubmit={handleSubmit} className="w-50 mx-auto">
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="form-control"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary w-100 mb-2">
          Register
        </button>
        <button
          type="button"
          onClick={handleBackToHome}
          className="btn btn-secondary w-100"
        >
          Back to Home
        </button>
      </form>
      {error && <p className="text-danger text-center mt-3">{error}</p>}
    </div>
  );
};

export default SignUp;
