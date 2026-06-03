import React, { useState, useRef, useEffect } from 'react';
import { Shield, Smartphone, Mail, User, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface GatewayProps {
  onLoginSuccess: (userInfo: { name: string; username: string; email: string; role: string }) => void;
}

export default function Gateway({ onLoginSuccess }: GatewayProps) {
  const [flow, setFlow] = useState<'login' | 'register' | 'forgot' | 'otp'>('login');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Detect input type to show dynamic icon
  const getIdentifierIcon = () => {
    if (!identifier) return <User className="h-4 w-4 text-gray-400" />;
    if (identifier.includes('@')) return <Mail className="h-4 w-4 text-blue-500" />;
    if (/^\+?\d[\d\s-]{4,14}$/.test(identifier)) return <Smartphone className="h-4 w-4 text-emerald-500" />;
    return <User className="h-4 w-4 text-amber-500" />;
  };

  const getIdentifierTypeLabel = () => {
    if (!identifier) return 'Any system-recognized credential';
    if (identifier.includes('@')) return 'Detected: Email Address';
    if (/^\+?\d[\d\s-]{4,14}$/.test(identifier)) return 'Detected: Phone Number';
    return 'Detected: Core Username';
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (flow === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [flow, otpTimer]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please provide your corporate email, username, or phone.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // For any "admin" simulation, we auto log in or go to OTP first
      setFlow('otp');
      // Reset OTP
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 50);
    }, 700);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !identifier.trim() || !password.trim()) {
      setError('Please fill in all requested fields.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setFlow('otp');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 50);
    }, 700);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your account identifier.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert(`OTP verification codes sent to dynamic destination linked to ${identifier}`);
      setFlow('otp');
    }, 800);
  };

  const handleOtpChange = (value: string, index: number) => {
    const cleanedValue = value.replace(/[^0-9]/g, '');
    if (!cleanedValue) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    // Handle pasting/multiple characters
    const digits = cleanedValue.split('');
    let focusIndex = index;

    for (let i = 0; i < digits.length && index + i < 6; i++) {
      newOtp[index + i] = digits[i];
      focusIndex = index + i + 1;
    }

    setOtp(newOtp);

    // Focus next
    if (focusIndex < 6) {
      otpRefs.current[focusIndex]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index] === '') {
        // Move back and delete
        if (index > 0) {
          newOtp[index - 1] = '';
          setOtp(newOtp);
          otpRefs.current[index - 1]?.focus();
        }
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const verifyOtpAndLogin = () => {
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) {
      setError('Please enter all 6 OTP digits.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Create simulation profiles
      let loggedInUser = {
        name: name || 'Clara Oswald',
        username: identifier.split('@')[0] || 'coswald',
        email: identifier.includes('@') ? identifier : `${identifier}@folksart.io`,
        role: identifier.toLowerCase().includes('admin') ? 'Administrator' : 'End User'
      };

      if (flow === 'login') {
        if (identifier.toLowerCase() === 'mvance') {
          loggedInUser = { name: 'Marcus Vance', username: 'mvance', email: 'marcus.vance@folksart.io', role: 'Security Officer' };
        } else if (identifier.toLowerCase() === 'jreyes') {
          loggedInUser = { name: 'Julian Reyes', username: 'jreyes', email: 'julian.reyes@partners.io', role: 'Operator' };
        } else if (identifier.toLowerCase() === 'erostova') {
          loggedInUser = { name: 'Elena Rostova', username: 'erostova', email: 'elena.rostova@gmail.com', role: 'End User' };
        }
      }

      onLoginSuccess(loggedInUser);
    }, 900);
  };

  // Auto trigger verification when 6th OTP is typed
  useEffect(() => {
    if (otp.join('').length === 6 && flow === 'otp') {
      verifyOtpAndLogin();
    }
  }, [otp]);

  // Quick setup helper for demo
  const quickSelectCredential = (user: string) => {
    setError('');
    if (user === 'admin') {
      setIdentifier('clara.oswald@folksart.io');
    } else if (user === 'officer') {
      setIdentifier('mvance');
    } else {
      setIdentifier('erostova');
    }
  };

  return (
    <div className="flex min-h-[550px] items-center justify-center bg-[#F9FAFB] px-4 py-8">
      <div id="auth-card" className="w-full max-w-[460px] rounded-xl bg-white p-8 shadow-[0px_4px_20px_rgba(17,24,39,0.05)] border border-gray-100">
        
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] mb-3">
            <Shield className="h-6 w-6" id="brand-shield-icon" />
          </div>
          <h2 id="brand-heading" className="text-2xl font-bold tracking-tight text-gray-900">Folksart Identity</h2>
          <p className="mt-1.5 text-sm text-gray-500 font-medium">Humane Governance Access Portal</p>
        </div>

        {error && (
          <div id="auth-error" className="mb-4 flex items-start gap-2.5 rounded-lg bg-red-50 p-3.5 text-xs text-red-700 border border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* --- LOGIN FLOW --- */}
        {flow === 'login' && (
          <form onSubmit={handleContinue} className="space-y-4">
            <div>
              <label htmlFor="identifier-input" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Identity Identifier
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  {getIdentifierIcon()}
                </div>
                <input
                  id="identifier-input"
                  type="text"
                  placeholder="Username, Email, or (+1) Phone No."
                  className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-colors"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400 flex justify-between">
                <span>{getIdentifierTypeLabel()}</span>
                <span className="text-[#2563EB] font-medium">Dynamic OR Logic Map</span>
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password-input" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  id="btn-forgot-password"
                  onClick={() => { setFlow('forgot'); setError(''); }}
                  className="text-xs font-medium text-[#2563EB] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-login-submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 transition-all"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Verify Credentials
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Quick-fill helpers to easily test different users */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Simulated Access Credentials (Click to load)</p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => quickSelectCredential('admin')}
                  className="px-2 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded hover:bg-blue-100 transition-colors"
                >
                  Admin Oswald
                </button>
                <button
                  type="button"
                  onClick={() => quickSelectCredential('officer')}
                  className="px-2 py-1 text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-100 rounded hover:bg-purple-100 transition-colors"
                >
                  Officer Vance
                </button>
                <button
                  type="button"
                  onClick={() => quickSelectCredential('user')}
                  className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded hover:bg-emerald-100 transition-colors"
                >
                  User Rostova
                </button>
              </div>
            </div>

            {/* SSO section */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 font-medium text-gray-400">Or sovereign sign on</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3" id="sso-buttons">
              <button
                type="button"
                id="btn-google-sso"
                onClick={() => {
                  setIdentifier('clara.oswald@folksart.io');
                  setFlow('otp');
                }}
                className="flex items-center justify-center gap-2.5 rounded-lg border border-gray-200 py-2 px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button
                type="button"
                id="btn-apple-sso"
                onClick={() => {
                  setIdentifier('julian.reyes@partners.io');
                  setFlow('otp');
                }}
                className="flex items-center justify-center gap-2.5 rounded-lg border border-gray-200 py-2 px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39" />
                </svg>
                Apple
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                New identity candidate?{' '}
                <button
                  type="button"
                  id="btn-toggle-register"
                  onClick={() => { setFlow('register'); setError(''); }}
                  className="font-semibold text-[#2563EB] hover:underline"
                >
                  Create credentials
                </button>
              </p>
            </div>
          </form>
        )}

        {/* --- REGISTER FLOW --- */}
        {flow === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                placeholder="Clara Oswald"
                className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="reg-identifier" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Platform Username or Email
              </label>
              <div className="relative">
                <input
                  id="reg-identifier"
                  type="text"
                  placeholder="name@organization.com or coswald"
                  className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Security Password
              </label>
              <input
                id="reg-password"
                type="password"
                placeholder="Make it strong & distinct"
                className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              id="btn-register-submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 transition-all"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Register Identity
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                id="btn-back-to-login"
                onClick={() => { setFlow('login'); setError(''); }}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to credentials login
              </button>
            </div>
          </form>
        )}

        {/* --- FORGOT PASSWORD FLOW --- */}
        {flow === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-xs text-gray-500 mb-2 leading-relaxed">
              Enter your email, phone, or username. Folksart will automatically identify the multi-channel fallback and send a 6-digit authentication token.
            </p>

            <div>
              <label htmlFor="forgot-identifier" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Registered Information
              </label>
              <input
                id="forgot-identifier"
                type="text"
                placeholder="coswald or clara@folksart.io"
                className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              id="btn-forgot-submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-2.5 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Issue Rescue OTP
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                id="btn-forgot-cancel"
                onClick={() => { setFlow('login'); setError(''); }}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to credentials login
              </button>
            </div>
          </form>
        )}

        {/* --- 6-DIGIT SPLIT-BOX OTP VALIDATION FLOW --- */}
        {flow === 'otp' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-xs font-semibold text-[#2563EB] tracking-widest uppercase mb-1">Dual-Factor Verification</p>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                We sent a security token challenge to your active channel corresponding to <span className="font-semibold text-gray-800">{identifier || "your account"}</span>.
              </p>
            </div>

            {/* Split OTP Fields */}
            <div className="flex justify-center gap-2" id="otp-split-container">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  id={`otp-digit-${idx}`}
                  type="text"
                  maxLength={6}
                  value={digit}
                  placeholder="•"
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  className="h-12 w-11 text-center text-lg font-bold text-gray-900 bg-gray-50 rounded-lg border border-gray-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white focus:outline-none transition-all placeholder-gray-300"
                />
              ))}
            </div>

            <p className="text-[11px] text-center text-gray-400">
              For evaluation, you can enter any 6 digits (e.g. <span className="font-mono text-[#2563EB] font-bold">123456</span>) to pass immediately.
            </p>

            <button
              type="button"
              id="btn-otp-verify"
              onClick={verifyOtpAndLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-75 transition-all"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Finalize MFA Clearance'
              )}
            </button>

            <div className="flex flex-col items-center gap-2 pt-2 text-center text-xs">
              <span className="text-gray-400">
                Didn't receive verification code?{' '}
                {otpTimer > 0 ? (
                  <span className="font-semibold text-gray-600">Resend in {otpTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOtpTimer(60)}
                    className="font-bold text-[#2563EB] hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </span>
              <button
                type="button"
                id="btn-change-identity"
                onClick={() => { setFlow('login'); setError(''); }}
                className="text-gray-400 hover:text-gray-600 font-medium hover:underline inline-flex items-center gap-1 mt-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Use a different identifier
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
