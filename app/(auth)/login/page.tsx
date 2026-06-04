import { prisma } from '@/lib/prisma';
import { ArrowRight, Building2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Login() {
  const count = await prisma.user.count();

  return (
    <main
      style={{ background: '#000000' }}
      className="min-h-screen grid place-items-center p-4 relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(48,209,88,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(10,132,255,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="ios-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '32px',
          borderRadius: '24px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'rgba(48,209,88,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={24} style={{ color: '#30D158' }} />
            </div>
            <span
              style={{
                fontSize: '28px',
                fontWeight: '900',
                color: '#FFFFFF',
                fontFamily: '-apple-system, system-ui, sans-serif',
                letterSpacing: '-0.5px',
              }}
            >
              POS
            </span>
          </div>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: '-apple-system, system-ui, sans-serif',
              lineHeight: '1.4',
            }}
          >
            Dashboard keuangan & showroom
          </p>
        </div>

        {/* Login Form */}
        <form
          action="/api/login"
          method="post"
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '800',
                color: 'rgba(255,255,255,0.45)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '8px',
                fontFamily: '-apple-system, system-ui, sans-serif',
              }}
            >
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="admin@email.com"
              className="active-scale"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '14px',
                border: '0.5px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.06)',
                fontSize: '15px',
                color: '#FFFFFF',
                fontFamily: '-apple-system, system-ui, sans-serif',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '800',
                color: 'rgba(255,255,255,0.45)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '8px',
                fontFamily: '-apple-system, system-ui, sans-serif',
              }}
            >
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="active-scale"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '14px',
                border: '0.5px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.06)',
                fontSize: '15px',
                color: '#FFFFFF',
                fontFamily: '-apple-system, system-ui, sans-serif',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <button
            type="submit"
            className="active-scale"
            style={{
              width: '100%',
              padding: '16px 24px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #30D158 0%, #64D2FF 100%)',
              fontSize: '16px',
              fontWeight: '800',
              color: '#000000',
              fontFamily: '-apple-system, system-ui, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
              transition: 'opacity 0.2s',
            }}
          >
            Masuk
            <ArrowRight size={18} />
          </button>
        </form>

        {/* First admin link */}
        {count === 0 && (
          <a
            href="/setup-admin"
            className="active-scale"
            style={{
              display: 'block',
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: '700',
              color: '#30D158',
              fontFamily: '-apple-system, system-ui, sans-serif',
              textDecoration: 'none',
              padding: '10px',
              borderRadius: '12px',
              background: 'rgba(48,209,88,0.08)',
              transition: 'background 0.2s',
            }}
          >
            Buat admin pertama
          </a>
        )}
      </div>
    </main>
  );
}
