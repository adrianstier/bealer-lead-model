/**
 * Login Screen Component
 * Enhanced password protection for the dashboard
 */

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, ShieldAlert } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

// SHA-256 hash of the password for obfuscation
// This isn't truly secure (client-side), but better than plaintext
const PASSWORD_HASH = 'b14b6fe1ab0c11ffe45fe560c52da6ddff25a98fba90be672c3d75e0cb2052d1'; // hash of "bealer2025"

// Rate limiting constants
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes window for attempts

// Hash function using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get failed attempts from localStorage
function getFailedAttempts(): { count: number; firstAttempt: number; lockedUntil: number } {
  try {
    const stored = localStorage.getItem('bealer_login_attempts');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { count: 0, firstAttempt: 0, lockedUntil: 0 };
}

// Save failed attempts to localStorage
function saveFailedAttempts(attempts: { count: number; firstAttempt: number; lockedUntil: number }) {
  localStorage.setItem('bealer_login_attempts', JSON.stringify(attempts));
}

// Clear failed attempts
function clearFailedAttempts() {
  localStorage.removeItem('bealer_login_attempts');
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_ATTEMPTS);

  // Check lockout status on mount and update timer
  useEffect(() => {
    // Initial check on mount
    const attempts = getFailedAttempts();
    const now = Date.now();

    if (attempts.lockedUntil > now) {
      setIsLocked(true);
      setLockoutRemaining(Math.ceil((attempts.lockedUntil - now) / 1000));
    } else if (attempts.firstAttempt && now - attempts.firstAttempt > ATTEMPT_WINDOW) {
      clearFailedAttempts();
      setAttemptsRemaining(MAX_ATTEMPTS);
    } else {
      setAttemptsRemaining(MAX_ATTEMPTS - attempts.count);
    }

    // Update countdown every second
    const interval = setInterval(() => {
      const currentAttempts = getFailedAttempts();
      const currentTime = Date.now();

      if (currentAttempts.lockedUntil > currentTime) {
        const remaining = Math.ceil((currentAttempts.lockedUntil - currentTime) / 1000);
        setLockoutRemaining(remaining);
        setIsLocked(true);
      } else if (currentAttempts.lockedUntil > 0) {
        // Lockout just expired
        clearFailedAttempts();
        setIsLocked(false);
        setLockoutRemaining(0);
        setAttemptsRemaining(MAX_ATTEMPTS);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) return;

    setError('');
    setIsLoading(true);

    // Add variable delay to prevent timing attacks
    const delay = 500 + Math.random() * 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Hash the input password and compare
    const inputHash = await hashPassword(password);

    if (inputHash === PASSWORD_HASH) {
      // Clear failed attempts on success
      clearFailedAttempts();

      // Generate a session token
      const sessionToken = crypto.randomUUID();

      // Store auth state in sessionStorage
      sessionStorage.setItem('bealer_auth', 'true');
      sessionStorage.setItem('bealer_auth_time', Date.now().toString());
      sessionStorage.setItem('bealer_session_token', sessionToken);

      onLogin();
    } else {
      // Record failed attempt
      const attempts = getFailedAttempts();
      const now = Date.now();

      const newAttempts = {
        count: attempts.count + 1,
        firstAttempt: attempts.firstAttempt || now,
        lockedUntil: 0
      };

      // Lock out after max attempts
      if (newAttempts.count >= MAX_ATTEMPTS) {
        newAttempts.lockedUntil = now + LOCKOUT_DURATION;
        setIsLocked(true);
        setLockoutRemaining(Math.ceil(LOCKOUT_DURATION / 1000));
        setError(`Too many failed attempts. Locked for 5 minutes.`);
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts.count;
        setAttemptsRemaining(remaining);
        setError(`Invalid password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
      }

      saveFailedAttempts(newAttempts);
      setPassword('');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="icon-container-lg bg-primary-600 rounded-full mb-4 mx-auto">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bealer Agency Dashboard
          </h1>
          <p className="text-primary-200">
            Enter your password to access the growth platform
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="card-lg p-8">
          {/* Lockout Warning */}
          {isLocked && (
            <div className="alert-danger mb-6">
              <div className="flex items-center mb-2">
                <ShieldAlert className="w-5 h-5 mr-2" />
                <span className="font-semibold">Account Temporarily Locked</span>
              </div>
              <p className="text-sm">
                Too many failed attempts. Please wait{' '}
                <span className="font-mono font-bold">
                  {Math.floor(lockoutRemaining / 60)}:{(lockoutRemaining % 60).toString().padStart(2, '0')}
                </span>
              </p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`form-input pr-12 ${
                  error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                required
                autoFocus
                disabled={isLocked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={isLocked}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {!isLocked && attemptsRemaining < MAX_ATTEMPTS && attemptsRemaining > 0 && (
              <p className="form-helper text-amber-600">
                {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining before lockout
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && !isLocked && (
            <div className="alert-danger mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !password || isLocked}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
              isLoading || !password || isLocked
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : isLocked ? (
              'Locked'
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-primary-200 text-sm mt-6">
          Derrick Bealer • Allstate Santa Barbara & Goleta
        </p>
      </div>
    </div>
  );
}
