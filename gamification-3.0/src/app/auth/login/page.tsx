import { AuthForm } from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <main className="auth-page">
      {/* Animated background grid */}
      <div className="auth-bg-grid" aria-hidden="true" />
      {/* Glow orbs */}
      <div className="auth-orb auth-orb--1" aria-hidden="true" />
      <div className="auth-orb auth-orb--2" aria-hidden="true" />

      <div className="auth-page-inner">
        {/* Logo / Branding */}
        <div className="auth-brand">
          <span className="auth-brand-icon">⚔️</span>
          <span className="auth-brand-name">Gamification 3.0</span>
        </div>

        <AuthForm />
      </div>
    </main>
  )
}
