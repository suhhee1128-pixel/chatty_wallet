import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        throw error;
      }
      // Supabase will redirect for OAuth; keep loading state minimal
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.message || err.error_description || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('Form submitted:', { isLogin, email });

    if (!isLogin) {
      if (!name.trim()) {
        setError('Please enter your name or nickname');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        console.log('Attempting sign in...');
        const { data, error } = await signIn(email, password);
        console.log('Sign in result:', { data, error });
        if (error) {
          console.error('Sign in error:', error);
          throw error;
        }
        if (data) {
          console.log('Sign in successful');
        }
      } else {
        console.log('Attempting sign up...');
        const { data, error } = await signUp(email, password, name.trim());
        console.log('Sign up result:', { data, error });
        if (error) {
          console.error('Sign up error:', error);
          throw error;
        }
        if (data) {
          console.log('Sign up successful', data);
          // Check if email confirmation is required
          if (data.user && !data.session) {
            setSuccess('Account created! Please check your email to confirm your account, then sign in.');
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setLoading(false);
            // Switch to login mode after a moment
            setTimeout(() => {
              setIsLogin(true);
              setSuccess('');
            }, 3000);
            return;
          }
          // If session exists, user is automatically logged in
          if (data.session) {
            setSuccess('Account created and signed in successfully!');
            return;
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || error.error_description || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-black mb-2 text-center">
          Chatty Wallet
        </h1>
        <p className="text-gray-600 text-center mb-8">
          {isLogin ? 'Sign in to continue' : 'Create your account'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            <strong>Success:</strong> {success}
          </div>
        )}
        
        {!error && !success && !isLogin && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-sm">
            <strong>Note:</strong> After signing up, you may need to check your email to confirm your account.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name / Nickname
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your name or nickname"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center justify-center">
            <span className="px-3 text-xs uppercase tracking-wide text-gray-400 bg-white">or</span>
            <div className="absolute left-0 right-0 h-px bg-gray-200" aria-hidden="true"></div>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-4 w-full border border-gray-300 rounded-lg py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-5 w-5" aria-hidden="true">
              <path fill="#4285F4" d="M488 261.8c0-17.8-1.6-35.1-4.6-52H249v98.6h134.4c-5.8 31.4-23.3 58.1-49.7 75.8v63.1h80.5c47.1-43.4 73.8-107.4 73.8-185.5z"/>
              <path fill="#34A853" d="M249 492c65.7 0 120.8-21.9 161.1-59.4l-80.5-63.1c-22.4 15-50.8 23.7-80.6 23.7-61.9 0-114.3-41.8-133.1-98.1H32.2v61.6C72.8 449.9 156.8 492 249 492z"/>
              <path fill="#FBBC05" d="M115.9 294.8c-4.9-14.7-7.8-30.4-7.8-46.8s2.8-32.1 7.8-46.8v-61.6H32.2C11.6 179.9 0 215 0 248s11.6 68.1 32.2 108.4l83.7-61.6z"/>
              <path fill="#EA4335" d="M249 152.1c35.7 0 67.6 12.3 92.8 36.5l69.7-69.7C369.8 76.3 314.7 54 249 54 156.8 54 72.8 96.1 32.2 139.6l83.7 61.6C134.7 193.9 187.1 152.1 249 152.1z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
              setName('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="text-sm text-gray-600 hover:text-black"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

