import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../components/auth.css';
import logoImg from '../assets/InvesTechy.jpg';
import api, {
  getResetPasswordEmail,
  setResetPasswordEmail,
  setResetPasswordOtpVerified,
} from '../services/api';

const OTP_LENGTH = 4;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [email, setEmail] = useState(
    location.state?.email || getResetPasswordEmail() || '',
  );
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.remove('auth-page-exit');
    const timer = window.setTimeout(() => setIsLoaded(true), 100);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
      return;
    }

    setResetPasswordEmail(email);
  }, [email, navigate]);

  const handleOtpChange = (event) => {
    const numericOtp = event.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(numericOtp);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/verify-otp', {
        email,
        otp,
      });

      setResetPasswordOtpVerified(true);
      navigate('/reset-password', {
        state: { email, otpVerified: true },
      });
    } catch (requestError) {
      setError(requestError.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className={`auth-container ${isLoaded ? 'auth-page-enter' : ''}`}>
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
            <h2 style={{ color: '#053B29' }}>Verify OTP</h2>
            <h3 style={{ color: '#D4AF37', fontWeight: '400', fontSize: '32px', marginTop: '-10px' }}>
              Forgot password
            </h3>

            <p className="form-subtext" style={{ marginTop: '20px' }}>
              Enter the 4-digit OTP sent to <strong>{email}</strong>.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>OTP Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{4}"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={handleOtpChange}
                  className="otp-input"
                  maxLength={OTP_LENGTH}
                  required
                />
              </div>

              {error ? <p className="auth-feedback auth-feedback-error">{error}</p> : null}

              <button
                type="submit"
                className="btn-auth-primary"
                style={{ marginTop: '10px' }}
                disabled={loading || otp.length !== OTP_LENGTH}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <p className="form-subtext" style={{ marginTop: '20px', marginBottom: 0 }}>
              Wrong email? <Link to="/forgot-password">Go back</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
