import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { completeSetup } from '@/lib/actions';
import { SubmitButton } from '@/components/ui';
import {
  CheckCircle2,
  Wallet,
  ArrowLeftRight,
  Car,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default async function Setup() {
  const u = await requireUser();
  if (!u) redirect('/login');
  if (u.setupCompleted) redirect('/dashboard');

  const sectionNumberStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    background: 'rgba(191,90,242,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const sectionNumberTextStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '900',
    color: '#BF5AF2',
    fontFamily: '-apple-system, system-ui, sans-serif',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: '-apple-system, system-ui, sans-serif',
    letterSpacing: '-0.3px',
  };

  const sectionDescStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.45)',
    fontFamily: '-apple-system, system-ui, sans-serif',
    marginTop: '2px',
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
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    cursor: 'pointer',
  };

  const subCardStyle: React.CSSProperties = {
    padding: '16px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.06)',
  };

  return (
    <div style={{ background: '#000000', minHeight: '100vh', padding: '24px 16px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '32px', maxWidth: '768px', marginLeft: 'auto', marginRight: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px',
          }}
        >
          <Sparkles size={22} style={{ color: '#BF5AF2' }} />
          <h1
            style={{
              fontSize: '26px',
              fontWeight: '900',
              color: '#FFFFFF',
              fontFamily: '-apple-system, system-ui, sans-serif',
              letterSpacing: '-0.5px',
            }}
          >
            Setup Awal
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
          Isi data awal untuk memulai. Bagian selain rekening boleh dikosongkan.
        </p>
      </div>

      <form
        action={completeSetup}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          maxWidth: '768px',
          margin: '0 auto',
        }}
      >
        {/* Step 1: Account */}
        <div
          className="ios-card"
          style={{
            padding: '24px',
            borderRadius: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              marginBottom: '24px',
            }}
          >
            <div style={sectionNumberStyle}>
              <span style={sectionNumberTextStyle}>1</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
              <Wallet size={20} style={{ color: '#64D2FF', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <h2 style={sectionTitleStyle}>Rekening & Saldo Awal</h2>
                <p style={sectionDescStyle}>Wajib diisi untuk memulai</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nama Rekening</label>
              <input
                name="account"
                placeholder="Kas Utama"
                required
                className="active-scale"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <div>
                <label style={labelStyle}>Tipe</label>
                <select
                  name="accountType"
                  className="active-scale"
                  style={selectStyle}
                >
                  <option value="BANK">Bank</option>
                  <option value="CASH">Cash</option>
                  <option value="EWALLET">E-Wallet</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Saldo Awal</label>
                <input
                  name="balance"
                  placeholder="0"
                  type="number"
                  required
                  className="active-scale"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2-3: Debt & Receivable */}
        <div
          className="ios-card"
          style={{
            padding: '24px',
            borderRadius: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              marginBottom: '24px',
            }}
          >
            <div style={sectionNumberStyle}>
              <span style={sectionNumberTextStyle}>2-3</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
              <ArrowLeftRight size={20} style={{ color: '#FF9F0A', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <h2 style={sectionTitleStyle}>Hutang & Piutang Awal</h2>
                <p style={sectionDescStyle}>Opsional - bisa dikosongkan</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Hutang */}
            <div
              className="active-scale"
              style={{
                ...subCardStyle,
                borderColor: 'rgba(255,69,58,0.2)',
                background: 'rgba(255,69,58,0.06)',
              }}
            >
              <p
                style={{
                  ...labelStyle,
                  color: '#FF453A',
                  marginBottom: '16px',
                }}
              >
                Hutang
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <input
                  name="debtName"
                  placeholder="Nama pemberi hutang"
                  className="active-scale"
                  style={{ ...inputStyle, gridColumn: 'span 2' }}
                />
                <input
                  name="debtAmount"
                  placeholder="Nominal hutang"
                  type="number"
                  className="active-scale"
                  style={inputStyle}
                />
                <input
                  name="debtDue"
                  type="date"
                  className="active-scale"
                  style={inputStyle}
                />
                <input
                  name="debtNotes"
                  placeholder="Catatan"
                  className="active-scale"
                  style={{ ...inputStyle, gridColumn: 'span 2' }}
                />
              </div>
            </div>

            {/* Piutang */}
            <div
              className="active-scale"
              style={{
                ...subCardStyle,
                borderColor: 'rgba(48,209,88,0.2)',
                background: 'rgba(48,209,88,0.06)',
              }}
            >
              <p
                style={{
                  ...labelStyle,
                  color: '#30D158',
                  marginBottom: '16px',
                }}
              >
                Piutang
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <input
                  name="recName"
                  placeholder="Nama pihak piutang"
                  className="active-scale"
                  style={{ ...inputStyle, gridColumn: 'span 2' }}
                />
                <input
                  name="recAmount"
                  placeholder="Nominal piutang"
                  type="number"
                  className="active-scale"
                  style={inputStyle}
                />
                <input
                  name="recDue"
                  type="date"
                  className="active-scale"
                  style={inputStyle}
                />
                <input
                  name="recNotes"
                  placeholder="Catatan"
                  className="active-scale"
                  style={{ ...inputStyle, gridColumn: 'span 2' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 4-6: Car & Investment */}
        <div
          className="ios-card"
          style={{
            padding: '24px',
            borderRadius: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              marginBottom: '24px',
            }}
          >
            <div style={sectionNumberStyle}>
              <span style={sectionNumberTextStyle}>4-6</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
              <Car size={20} style={{ color: '#0A84FF', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <h2 style={sectionTitleStyle}>Mobil & Investasi Awal</h2>
                <p style={sectionDescStyle}>Opsional - bisa dikosongkan</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Mobil */}
            <div className="active-scale" style={subCardStyle}>
              <p
                style={{
                  ...labelStyle,
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '16px',
                }}
              >
                Mobil Awal
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <input
                  name="carName"
                  placeholder="Nama mobil"
                  className="active-scale"
                  style={{ ...inputStyle, gridColumn: 'span 2' }}
                />
                <input
                  name="brand"
                  placeholder="Merek"
                  className="active-scale"
                  style={inputStyle}
                />
                <input
                  name="model"
                  placeholder="Tipe"
                  className="active-scale"
                  style={inputStyle}
                />
                <input
                  name="year"
                  placeholder="Tahun"
                  type="number"
                  className="active-scale"
                  style={inputStyle}
                />
                <input
                  name="purchasePrice"
                  placeholder="Harga beli/modal"
                  type="number"
                  className="active-scale"
                  style={inputStyle}
                />
                <input
                  name="estimatedSellPrice"
                  placeholder="Estimasi jual"
                  type="number"
                  className="active-scale"
                  style={{ ...inputStyle, gridColumn: 'span 2' }}
                />
              </div>
              <p
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: '-apple-system, system-ui, sans-serif',
                  marginTop: '12px',
                }}
              >
                Stok mobil awal tidak memotong saldo rekening.
              </p>
            </div>

            {/* Investasi */}
            <div
              className="active-scale"
              style={{
                ...subCardStyle,
                borderColor: 'rgba(100,210,255,0.2)',
                background: 'rgba(100,210,255,0.06)',
              }}
            >
              <p
                style={{
                  ...labelStyle,
                  color: '#64D2FF',
                  marginBottom: '16px',
                }}
              >
                Investasi Awal
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <select
                  name="invCat"
                  className="active-scale"
                  style={{ ...selectStyle, gridColumn: 'span 2' }}
                >
                  <option value="">Skip investasi</option>
                  <option value="Saham">Saham</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Reksa Dana">Reksa Dana</option>
                  <option value="Emas">Emas</option>
                  <option value="Properti">Properti</option>
                  <option value="R&D / Eksperimen">R&D / Eksperimen</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                <input
                  name="invBalance"
                  placeholder="Saldo investasi"
                  type="number"
                  className="active-scale"
                  style={inputStyle}
                />
                <input
                  name="invNotes"
                  placeholder="Catatan investasi"
                  className="active-scale"
                  style={{ ...inputStyle, gridColumn: 'span 2' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <SubmitButton />
        </div>

        {/* Footer note */}
        <div
          className="ios-card"
          style={{
            padding: '16px 20px',
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Sparkles size={16} style={{ color: '#BF5AF2', flexShrink: 0, marginTop: '2px' }} />
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.45)',
                fontFamily: '-apple-system, system-ui, sans-serif',
                lineHeight: '1.5',
              }}
            >
              Setelah setup selesai, kamu bisa menambah data lebih lanjut di halaman masing-masing fitur.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
