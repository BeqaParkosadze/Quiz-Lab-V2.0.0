import React, { useState } from 'react';
import { auth, googleProvider, facebookProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier } from '../firebase';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = async (provider: any) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else {
        setError('An error occurred during login. Please try again.');
        console.error('Social login error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
      console.error('Email auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      const confirmation = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setShowOtp(true);
    } catch (error: any) {
      setError(error.message || 'Phone auth error. Please try again.');
      console.error('Phone auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      onLoginSuccess();
    } catch (error: any) {
      setError(error.message || 'OTP verification failed. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-gray-800 relative">
        <button 
          onClick={onBackToHome}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold text-white mb-6 text-center mt-8">Welcome to Quiz Lab</h2>
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button disabled={loading} onClick={() => handleSocialLogin(googleProvider)} className="flex-1 bg-white text-gray-900 py-2 rounded-lg font-bold disabled:opacity-50">
            {loading ? '...' : 'Google'}
          </button>
          <button disabled={loading} onClick={() => handleSocialLogin(facebookProvider)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold disabled:opacity-50">
            {loading ? '...' : 'Facebook'}
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-800 text-white rounded-lg" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-800 text-white rounded-lg" />
          <button disabled={loading} onClick={handleEmailAuth} className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold disabled:opacity-50">
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
          <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-gray-400 text-sm">{isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}</button>
        </div>

        <div className="space-y-4">
          <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 bg-gray-800 text-white rounded-lg" />
          {!showOtp ? (
            <button disabled={loading} onClick={handlePhoneAuth} className="w-full bg-indigo-500 text-white py-3 rounded-lg font-bold disabled:opacity-50">
              {loading ? 'Loading...' : 'Send OTP'}
            </button>
          ) : (
            <div className="space-y-2">
              <input type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-3 bg-gray-800 text-white rounded-lg" />
              <button disabled={loading} onClick={verifyOtp} className="w-full bg-indigo-500 text-white py-3 rounded-lg font-bold disabled:opacity-50">
                {loading ? 'Loading...' : 'Verify OTP'}
              </button>
            </div>
          )}
        </div>
        <div id="recaptcha-container"></div>
      </motion.div>
    </div>
  );
};
