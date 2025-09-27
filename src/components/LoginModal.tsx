import React, { useState, useEffect } from 'react';
import { X, User, Heart, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Add this import
import { useAuth } from '../auth/AuthContext'; // Add this import

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (audience: 'self' | 'lovedOne') => void;
}

const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸', digits: 10 },
  { code: '+91', country: 'IN', flag: '🇮🇳', digits: 10 },
  { code: '+44', country: 'UK', flag: '🇬🇧', digits: 10 },
  { code: '+61', country: 'AU', flag: '🇦🇺', digits: 9 },
  { code: '+49', country: 'DE', flag: '🇩🇪', digits: 11 },
  { code: '+971', country: 'AE', flag: '🇦🇪', digits: 9 },
];

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<'dashboard-selection' | 'phone-verification' | 'otp-verification'>('dashboard-selection');
  const [selectedAudience, setSelectedAudience] = useState<'self' | 'lovedOne' | null>(null);
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Test OTP bypass
  const TEST_OTP_CODE = (import.meta.env as any).VITE_TEST_OTP_CODE || '123456';
  const BYPASS_OTP = ((import.meta.env as any).VITE_BYPASS_OTP === '1');

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleDashboardSelect = (audience: 'self' | 'lovedOne') => {
    setSelectedAudience(audience);
    setStep('phone-verification');
  };

  const handleSendOtp = async () => {
    setError(null);
    setLoading(true);

    // Bypass path for testing
    if (BYPASS_OTP) {
      setStep('otp-verification');
      setResendCooldown(30);
      setLoading(false);
      return;
    }

    try {
      const fullPhoneNumber = countryCode + phoneNumber;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: fullPhoneNumber,
        options: { channel: 'sms' }
      });

      if (otpError) {
        setError(otpError.message);
      } else {
        setStep('otp-verification');
        setResendCooldown(30);
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setLoading(true);
    if (otp.length === 6 && selectedAudience) {
      // Bypass path for testing
      if (BYPASS_OTP) {
        if (otp === TEST_OTP_CODE) {
          onComplete(selectedAudience);
        } else {
          setError('Invalid verification code.');
        }
        setLoading(false);
        return;
      }

      try {
        const fullPhoneNumber = countryCode + phoneNumber;
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone: fullPhoneNumber,
          token: otp,
          type: 'sms' as const,
        });

        if (verifyError) {
          setError(verifyError.message);
        } else {
          onComplete(selectedAudience);
        }
      } catch (err) {
        console.error('Error verifying OTP:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 'otp-verification') {
      setStep('phone-verification');
      setOtp('');
    } else if (step === 'phone-verification') {
      setStep('dashboard-selection');
      setPhoneNumber('');
      setSelectedAudience(null);
    }
  };

  const currentCountry = countryCodes.find(c => c.code === countryCode);
  const requiredDigits = currentCountry?.digits || 10;
  const isPhoneValid = phoneNumber.length === requiredDigits && /^\d+$/.test(phoneNumber);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2147483648] flex items-center justify-center min-h-screen p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full">
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 pt-6">
          {step === 'dashboard-selection' && (
            <div className="text-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Which dashboard would you like to access?
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <button
                  onClick={() => handleDashboardSelect('self')}
                  className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-[#F35E4A] hover:bg-[#F35E4A]/5 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center space-x-4">
                    <User className="h-8 w-8 text-gray-600 group-hover:text-[#F35E4A]" />
                    <span className="text-xl font-semibold text-gray-800 group-hover:text-[#F35E4A]">Elder Dashboard</span>
                  </div>
                </button>
                <button
                  onClick={() => handleDashboardSelect('lovedOne')}
                  className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-[#F35E4A] hover:bg-[#F35E4A]/5 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center space-x-4">
                    <Heart className="h-8 w-8 text-gray-600 group-hover:text-[#F35E4A]" />
                    <span className="text-xl font-semibold text-gray-800 group-hover:text-[#F35E4A]">Family Dashboard</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 'phone-verification' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verify Your Phone Number
                </h2>
                <p className="text-gray-600">
                  We'll send you a verification code to confirm your identity.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-3 pr-8 focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, requiredDigits))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleBack}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSendOtp}
                    disabled={!isPhoneValid || loading}
                    className="flex-1 px-4 py-3 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </div>
              {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>
          )}

          {step === 'otp-verification' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Enter Verification Code
                </h2>
                <p className="text-gray-600">
                  We sent a 6-digit code to {countryCode} {phoneNumber}
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent text-center text-lg tracking-widest"
                />

                <div className="text-center text-sm text-gray-500">
                  {resendCooldown > 0 ? (
                    <span>Resend OTP in {resendCooldown}s</span>
                  ) : (
                    <button onClick={() => setResendCooldown(30)} className="text-[#F35E4A] hover:underline">
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleBack}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || loading}
                    className="flex-1 px-4 py-3 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </div>
              </div>
              {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
