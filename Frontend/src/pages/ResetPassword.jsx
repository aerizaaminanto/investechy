import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/auth.css';
import logoImg from '../assets/InvesTechy.jpg';
import {
  clearResetPasswordFlow,
  getResetPasswordEmail,
  isResetPasswordOtpVerified,
} from '../services/api';
import { usePopup } from '../components/PopupProvider';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const popup = usePopup();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState(getResetPasswordEmail() || location.state?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const otpVerified =
    location.state?.otpVerified === true || isResetPasswordOtpVerified();

  const eyeOpen = "https://img.icons8.com/?size=100&id=4y6r43dyjbzw&format=png&color=000000";
  const eyeClosed = "https://img.icons8.com/?size=100&id=FThUtBIXcPnM&format=png&color=000000";

  useEffect(() => {
    document.body.classList.remove('auth-page-exit');
    const timer = window.setTimeout(() => setIsLoaded(true), 100);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!otpVerified) {
      navigate('/verify-otp', { replace: true });
      return;
    }

    if (!email) {
      const storedEmail = getResetPasswordEmail() || '';
      setEmail(storedEmail);
    }
  }, [email, navigate, otpVerified]);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      await popup.alert({
        title: { id: "Password Tidak Cocok", en: "Passwords Do Not Match" },
        message: {
          id: "Password dan konfirmasi password harus sama.",
          en: "Password and confirm password must match.",
        },
        tone: "danger",
      });
      return;
    }
    // Logika API reset password di sini
    console.log("Password updated!");
    clearResetPasswordFlow();
    popup.notify({
      title: { id: "Password Diperbarui", en: "Password Updated" },
      message: {
        id: "Password baru sudah disimpan. Silakan login kembali.",
        en: "Your new password has been saved. Please sign in again.",
      },
    });
    navigate('/login'); // Pindah ke login setelah sukses
  };

  return (
    <div className="auth-body">
      <div className={`auth-container ${isLoaded ? 'auth-page-enter' : ''}`}>
        {/* --- BANNER KIRI --- */}
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
              Make smarter digital investment decisions in minutes <br/>
              no complexity, just data-driven insights.
            </p>
          </div>
        </div>

        {/* --- FORM KANAN --- */}
        <div className="auth-form-section">
          <div className="form-box">
            <h2 style={{ color: '#053B29' }}>Create New Password</h2>
            <h3 style={{ color: '#D4AF37', fontWeight: '400', fontSize: '32px', marginTop: '-10px' }}>Reset password</h3>
            
            <p className="form-subtext" style={{ marginTop: '20px' }}>
              Please enter your new password to secure <br/>
              your account.
            </p>

            {email ? (
              <p className="form-subtext" style={{ marginTop: '-20px' }}>
                Resetting password for <strong>{email}</strong>
              </p>
            ) : null}

            <form onSubmit={handleResetSubmit}>
              <div className="input-group">
                <label>Enter New Password</label>
                <div className="input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter New Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  {password.length > 0 && (
                    <span className="password-icon" onClick={() => setShowPassword(!showPassword)}>
                      <img src={showPassword ? eyeOpen : eyeClosed} alt="toggle view" />
                    </span>
                  )}
                </div>
              </div>

              <div className="input-group">
                <label>Confirm New Password</label>
                <div className="input-wrapper">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm New Password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                  {confirmPassword.length > 0 && (
                    <span className="password-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <img src={showConfirmPassword ? eyeOpen : eyeClosed} alt="toggle view" />
                    </span>
                  )}
                </div>
              </div>

              <button type="submit" className="btn-auth-primary" style={{ marginTop: '10px' }}>
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
