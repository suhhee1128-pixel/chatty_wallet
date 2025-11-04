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
  const { signIn, signUp } = useAuth();

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

