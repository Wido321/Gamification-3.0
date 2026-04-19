'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, User, Eye, EyeOff, Shield } from 'lucide-react'

type AuthMode = 'login' | 'signup'

export function AuthForm() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account!')
      }
    }

    setIsLoading(false)
  }

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="auth-glass-card">
      {/* Header */}
      <div className="auth-header">
        <div className="auth-shield-icon">
          <Shield className="auth-shield-svg" />
        </div>
        <h1 className="auth-title">
          {mode === 'login' ? 'Access Portal' : 'Join the Quest'}
        </h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Enter your credentials to continue'
            : 'Create your account to begin'}
        </p>
      </div>

      {/* Error / Message */}
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-message">{message}</div>}

      {/* Form */}
      <form onSubmit={handleEmailAuth} className="auth-form">
        {mode === 'signup' && (
          <div className="auth-input-group">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrapper">
              <User className="auth-input-icon" />
              <input
                id="full-name-input"
                type="text"
                className="auth-input"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div className="auth-input-group">
          <label className="auth-label">Email Address</label>
          <div className="auth-input-wrapper">
            <Mail className="auth-input-icon" />
            <input
              id="email-input"
              type="email"
              className="auth-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="auth-input-group">
          <label className="auth-label">Password</label>
          <div className="auth-input-wrapper">
            <Lock className="auth-input-icon" />
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              className="auth-input auth-input--password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              id="toggle-password-btn"
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          id="auth-submit-btn"
          type="submit"
          className="auth-btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="auth-spinner" />
          ) : mode === 'login' ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="auth-divider">
        <span className="auth-divider-line" />
        <span className="auth-divider-text">or continue with</span>
        <span className="auth-divider-line" />
      </div>

      {/* Google Auth */}
      <button
        id="google-auth-btn"
        type="button"
        className="auth-btn-google"
        onClick={handleGoogleAuth}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="auth-spinner" />
        ) : (
          <>
            <svg className="auth-google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Mode Toggle */}
      <p className="auth-toggle-text">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          id="auth-mode-toggle-btn"
          type="button"
          className="auth-toggle-btn"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setError(null)
            setMessage(null)
          }}
        >
          {mode === 'login' ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  )
}
