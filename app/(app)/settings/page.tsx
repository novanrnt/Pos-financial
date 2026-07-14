import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  Mail,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Code,
  Settings2,
  Bot,
  BookOpen,
  Terminal,
} from 'lucide-react';

async function linkTelegram(formData: FormData) {
  'use server';
  const user = await requireUser();
  if (!user) return;

  const telegramId = formData.get('telegramId') as string;
  if (!telegramId) return;

  await prisma.user.update({
    where: { id: user.id },
    data: { telegramId },
  });
}

async function saveApiKey(formData: FormData) {
  'use server';
  const user = await requireUser();
  if (!user) return;
  const apiKey = formData.get('apiKey') as string;
  await prisma.user.update({
    where: { id: user.id },
    data: { apiKey },
  });
}

export default async function Settings() {
  const u = await requireUser();

  const cardStyle: React.CSSProperties = {
    padding: '24px',
    borderRadius: '24px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '800',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    marginBottom: '8px',
    fontFamily: '-apple-system, system-ui, sans-serif',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: '-apple-system, system-ui, sans-serif',
    letterSpacing: '-0.3px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '14px',
    border: '0.5px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.06)',
    fontSize: '14px',
    color: '#FFFFFF',
    fontFamily: '-apple-system, system-ui, sans-serif',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.06)',
  };

  const codeBlockStyle: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    color: '#FFFFFF',
    padding: '12px 16px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.06)',
    display: 'block',
    lineHeight: '1.5',
    overflow: 'auto',
  };

  const commandCardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.06)',
  };

  return (
    <div style={{ background: '#000000', minHeight: '100vh', padding: '24px 16px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '32px', maxWidth: '672px', marginLeft: 'auto', marginRight: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px',
          }}
        >
          <Settings2 size={22} style={{ color: '#0A84FF' }} />
          <h1
            style={{
              fontSize: '26px',
              fontWeight: '900',
              color: '#FFFFFF',
              fontFamily: '-apple-system, system-ui, sans-serif',
              letterSpacing: '-0.5px',
            }}
          >
            Pengaturan
          </h1>
        </div>
        <p
          style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: '-apple-system, system-ui, sans-serif',
            lineHeight: '1.4',
          }}
        >
          Akun, integrasi, dan informasi aplikasi.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          maxWidth: '672px',
          margin: '0 auto',
        }}
      >
        {/* Account Section */}
        <div className="ios-card" style={cardStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <Mail size={18} style={{ color: '#0A84FF' }} />
            <h2 style={sectionTitleStyle}>Akun Saya</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="active-scale" style={infoRowStyle}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(10,132,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Mail size={18} style={{ color: '#0A84FF' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={labelStyle}>Email</p>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#FFFFFF',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    margin: 0,
                  }}
                >
                  {u?.email}
                </p>
              </div>
            </div>

            <div className="active-scale" style={infoRowStyle}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Code size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={labelStyle}>User ID</p>
                <p
                  style={{
                    fontSize: '12px',
                    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
                    color: 'rgba(255,255,255,0.6)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  {u?.id}
                </p>
              </div>
            </div>

            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.35)',
                fontFamily: '-apple-system, system-ui, sans-serif',
                lineHeight: '1.5',
                marginTop: '8px',
              }}
            >
              Untuk tambah user lain, jalankan seed/manual Prisma. Versi ini fokus POS pribadi.
            </p>
          </div>
        </div>

        {/* Telegram Integration */}
        <div className="ios-card" style={cardStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <Bot size={18} style={{ color: '#64D2FF' }} />
            <h2 style={sectionTitleStyle}>Integrasi Telegram Bot</h2>
          </div>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: '-apple-system, system-ui, sans-serif',
              lineHeight: '1.4',
            }}
          >
            Link akun Telegram kamu untuk input transaksi langsung dari bot.
          </p>

          <div style={{ marginTop: '24px' }}>
            {u?.telegramId ? (
              <div
                className="active-scale"
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(48,209,88,0.08)',
                  border: '0.5px solid rgba(48,209,88,0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle
                    size={20}
                    style={{ color: '#30D158', flexShrink: 0, marginTop: '2px' }}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: '900',
                        color: '#30D158',
                        fontFamily: '-apple-system, system-ui, sans-serif',
                        margin: 0,
                      }}
                    >
                      Telegram Terhubung
                    </p>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.45)',
                        fontFamily: '-apple-system, system-ui, sans-serif',
                        marginTop: '4px',
                      }}
                    >
                      Telegram ID:{' '}
                      <b style={{ color: '#FFFFFF' }}>{u.telegramId}</b>
                    </p>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.45)',
                        fontFamily: '-apple-system, system-ui, sans-serif',
                        marginTop: '8px',
                      }}
                    >
                      Bot sudah siap menerima transaksi dari Telegram kamu.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="active-scale"
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'rgba(255,159,10,0.08)',
                    border: '0.5px solid rgba(255,159,10,0.2)',
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <AlertCircle
                      size={20}
                      style={{ color: '#FF9F0A', flexShrink: 0, marginTop: '2px' }}
                    />
                    <div>
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: '900',
                          color: '#FF9F0A',
                          fontFamily: '-apple-system, system-ui, sans-serif',
                          margin: 0,
                        }}
                      >
                        Belum Terhubung
                      </p>
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.45)',
                          fontFamily: '-apple-system, system-ui, sans-serif',
                          marginTop: '8px',
                        }}
                      >
                        Ikuti langkah berikut untuk menghubungkan Telegram:
                      </p>
                      <ol
                        style={{
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.45)',
                          fontFamily: '-apple-system, system-ui, sans-serif',
                          marginTop: '12px',
                          paddingLeft: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          lineHeight: '1.5',
                        }}
                      >
                        <li>Buka Telegram dan cari bot POS Finance</li>
                        <li>
                          Kirim pesan{' '}
                          <code
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              color: '#FFFFFF',
                              fontSize: '11px',
                            }}
                          >
                            /start
                          </code>
                        </li>
                        <li>Bot akan memberikan Telegram ID kamu</li>
                        <li>Copy ID dan paste di form di bawah</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <form action={linkTelegram} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Telegram ID</label>
                    <input
                      type="text"
                      name="telegramId"
                      placeholder="Contoh: 123456789"
                      required
                      className="active-scale"
                      style={inputStyle}
                    />
                  </div>

                  <button
                    type="submit"
                    className="active-scale"
                    style={{
                      width: '100%',
                      padding: '15px 24px',
                      borderRadius: '14px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #64D2FF 0%, #0A84FF 100%)',
                      fontSize: '15px',
                      fontWeight: '800',
                      color: '#000000',
                      fontFamily: '-apple-system, system-ui, sans-serif',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    Link Telegram
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Format Guide */}
        <div className="ios-card" style={cardStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <BookOpen size={18} style={{ color: '#BF5AF2' }} />
            <h2 style={sectionTitleStyle}>Format Input Transaksi</h2>
          </div>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: '-apple-system, system-ui, sans-serif',
              lineHeight: '1.4',
            }}
          >
            Kirim pesan ke bot dengan format berikut:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            <div className="active-scale" style={commandCardStyle}>
              <div style={{ flex: 1 }}>
                <p style={labelStyle}>Pengeluaran</p>
                <code style={codeBlockStyle}>
                  19 mei 2026 makan 20.000 blue
                </code>
              </div>
            </div>

            <div className="active-scale" style={commandCardStyle}>
              <div style={{ flex: 1 }}>
                <p style={labelStyle}>Pemasukan</p>
                <code style={codeBlockStyle}>
                  19 mei 2026 gaji 500.000 blue income
                </code>
              </div>
            </div>

            <div className="active-scale" style={commandCardStyle}>
              <div style={{ flex: 1 }}>
                <p style={labelStyle}>Hutang</p>
                <code style={codeBlockStyle}>
                  19 mei 2026 pinjam 100.000 blue hutang
                </code>
              </div>
            </div>

            <div className="active-scale" style={commandCardStyle}>
              <div style={{ flex: 1 }}>
                <p style={labelStyle}>Piutang</p>
                <code style={codeBlockStyle}>
                  19 mei 2026 pinjamkan 50.000 blue piutang
                </code>
              </div>
            </div>
          </div>

          <div
            className="ios-card"
            style={{
              padding: '16px 20px',
              borderRadius: '16px',
              marginTop: '24px',
            }}
          >
            <p style={labelStyle}>Format Umum</p>
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'SF Mono, Monaco, Consolas, monospace',
                lineHeight: '1.5',
                margin: 0,
              }}
            >
              tanggal bulan tahun deskripsi nominal rekening [type]
            </p>
          </div>
        </div>

        {/* Bot Commands */}
        <div className="ios-card" style={cardStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <Terminal size={18} style={{ color: '#30D158' }} />
            <h2 style={sectionTitleStyle}>Perintah Bot</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="active-scale" style={commandCardStyle}>
              <MessageCircle
                size={18}
                style={{ color: '#64D2FF', flexShrink: 0, marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#FFFFFF',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    margin: 0,
                  }}
                >
                  <code
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  >
                    /start
                  </code>
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.45)',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    marginTop: '4px',
                    margin: 0,
                  }}
                >
                  Mulai bot dan dapatkan Telegram ID kamu
                </p>
              </div>
            </div>

            <div className="active-scale" style={commandCardStyle}>
              <MessageCircle
                size={18}
                style={{ color: '#64D2FF', flexShrink: 0, marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#FFFFFF',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    margin: 0,
                  }}
                >
                  <code
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  >
                    /help
                  </code>
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.45)',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    marginTop: '4px',
                    margin: 0,
                  }}
                >
                  Lihat bantuan format input transaksi
                </p>
              </div>
            </div>

            <div className="active-scale" style={commandCardStyle}>
              <MessageCircle
                size={18}
                style={{ color: '#64D2FF', flexShrink: 0, marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#FFFFFF',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    margin: 0,
                  }}
                >
                  <code
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  >
                    /accounts
                  </code>
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.45)',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    marginTop: '4px',
                    margin: 0,
                  }}
                >
                  Lihat daftar rekening kamu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI API Key */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Bot size={18} style={{ color: '#BF5AF2' }} />
            <h2 style={sectionTitleStyle}>AI Chat - API Key</h2>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: 16 }}>
            Masukkan API Key dari sumopod agar fitur AI Chat bisa jalan.
          </p>
          <form action={saveApiKey} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              name="apiKey"
              defaultValue={u?.apiKey || ''}
              placeholder="sk-... (API Key sumopod)"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 12, border: '0.5px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 13, outline: 'none',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Simpan API Key
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
