import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/auth.css';
import logoImg from '../assets/InvesTechy.jpg';
import api, {
  clearResetPasswordFlow,
  setResetPasswordEmail,
} from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.remove('auth-page-exit');
    const timer = window.setTimeout(() => setIsLoaded(true), 100);

    return () => window.clearTimeout(timer);
  }, []);

  const navigateWithAuthTransition = (path) => {
    document.body.classList.add('auth-page-exit');
    window.setTimeout(() => {
      navigate(path);
    }, 260);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const normalizedEmail = email.trim();

      await api.post('/auth/forgot-password', {
        email: normalizedEmail,
      });

      clearResetPasswordFlow();
      setResetPasswordEmail(normalizedEmail);
      navigate('/verify-otp', {
        state: { email: normalizedEmail },
      });
    } catch (requestError) {
      setError(requestError.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <h2 style={{ color: '#053B29' }}>Confirm Your Email</h2>
            <h3 style={{ color: '#D4AF37', fontWeight: '400', fontSize: '32px', marginTop: '-10px' }}>Forgot password</h3>
            
            <p className="form-subtext" style={{ marginTop: '20px' }}>
              Enter your email for the verification process, we will send <br/>
              a 4-digit OTP to your email.
            </p>

            <p className="form-subtext" style={{ marginTop: '-20px', marginBottom: '24px' }}>
              Remembered your password?{' '}
              <button
                type="button"
                className="auth-text-link"
                onClick={() => navigateWithAuthTransition('/login')}
              >
                Back to Login
              </button>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>E-mail</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              {error ? <p className="auth-feedback auth-feedback-error">{error}</p> : null}

              <button
                type="submit"
                className="btn-auth-primary"
                style={{ marginTop: '10px' }}
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
