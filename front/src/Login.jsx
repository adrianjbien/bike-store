import  { useState } from "react";
import { login } from "./services";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      setError("");
      alert("Zalogowano pomyślnie!");
      navigate("/products");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Błąd logowania. Sprawdź dane.");
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Sign in</h1>
      <form onSubmit={handleLogin} className="w-50 mx-auto">
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
          Sign in
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

export default Login;
