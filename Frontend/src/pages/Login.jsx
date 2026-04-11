import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/InvesTechy.jpg";
import api, { extractAuthSession, getGoogleAuthURL, setSession } from "../services/api";
import "../components/auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const eyeOpen =
    "https://img.icons8.com/?size=100&id=4y6r43dyjbzw&format=png&color=000000";
  const eyeClosed =
    "https://img.icons8.com/?size=100&id=FThUtBIXcPnM&format=png&color=000000";

  useEffect(() => {
    document.body.classList.remove("auth-page-exit");
    const timer = window.setTimeout(() => setIsLoaded(true), 100);

    return () => window.clearTimeout(timer);
  }, []);

  const navigateWithAuthTransition = (path) => {
    document.body.classList.add("auth-page-exit");
    window.setTimeout(() => {
      navigate(path);
    }, 260);
  };

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", form);
      const { token, user } = extractAuthSession(response);
      setSession({
        token,
        user,
      });
      const destination = user?.role?.toLowerCase?.() === "admin"
        ? "/admin/dashboard"
        : "/dashboard";
      navigateWithAuthTransition(destination);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      document.body.classList.add("auth-page-exit");
      const googleAuthUrl = getGoogleAuthURL("/auth/google/callback");
      window.location.href = googleAuthUrl;
    } catch (err) {
      document.body.classList.remove("auth-page-exit");
      setError("Gagal membuka Google login. Coba lagi.");
      console.error("Google auth error:", err);
    }
  };

  return (
    <div className="auth-body">
      <div className={`auth-container ${isLoaded ? "auth-page-enter" : ""}`}>
        <div className="auth-banner">
          <div className="banner-content">
            <div className="banner-logo-container">
              <img src={logoImg} alt="InvesTechy Logo" className="banner-logo" />
            </div>
            <h1 className="banner-title">
              Smarter IT Investment <br />
              <span className="highlight">Starts Here</span>
            </h1>
            <p className="banner-subtitle">
              Make smarter digital investment decisions in minutes <br />
              no complexity, just data-driven insights.
            </p>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="form-box">
            <h2>Login</h2>
            <p className="form-subtext">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="auth-text-link"
                onClick={() => navigateWithAuthTransition("/register")}
              >
                Create Now
              </button>
            </p>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label>E-mail</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label>Password</label>
                  <button
                    type="button"
                    className="auth-inline-link"
                    onClick={() => navigateWithAuthTransition("/forgot-password")}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="**********"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />

                  {form.password.length > 0 && (
                    <span
                      className="password-icon"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      <img src={showPassword ? eyeOpen : eyeClosed} alt="toggle view" />
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <p style={{ color: "#b42318", marginBottom: "20px" }}>{error}</p>
              )}

              <div
                className="term-condition"
                style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}
              >
                <input type="checkbox" id="remember" style={{ margin: "0 10px 0 0" }} />
                <label htmlFor="remember" style={{ cursor: "pointer", fontSize: "14px" }}>
                  Remember me
                </label>
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </button>

              <div
                className="divider"
                style={{
                  textAlign: "center",
                  margin: "20px 0",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
                <span style={{ padding: "0 10px", color: "#718096", fontSize: "14px" }}>
                  OR
                </span>
                <span style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
              </div>

              <button
                type="button"
                className="btn-google"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
                onClick={handleGoogleLogin}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  width="18"
                />
                <span style={{ fontWeight: "600", color: "#4A5568" }}>
                  Continue with Google
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
