import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate do przekierowania
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

const HomePage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center">
      <div className="container text-center">
        <h1>Welcome to our shop!</h1>
        <p>Choose what you want to do:</p>
        <div className="d-flex justify-content-center">
          <button onClick={handleSignIn} className="btn btn-primary m-2">
            Sign In
          </button>
          <button onClick={handleSignUp} className="btn btn-secondary m-2">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
