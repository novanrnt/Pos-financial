'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Receipt } from 'lucide-react';
import { payBill } from '@/lib/actions';

type Account = { id: string; name: string; type: string };

export function BillPaymentModal({
  bill,
  accounts,
}: {
  bill: { id: string; name: string; amount: number; dueDay: number; accountId: string };
  accounts: Account[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(bill.accountId || accounts[0]?.id || '');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const onSubmit = async () => {
    if (!selectedAccount) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('id', bill.id);
      formData.append('accountId', selectedAccount);
      formData.append('date', new Date().toISOString().split('T')[0]);
      formData.append('description', `Bayar tagihan ${bill.name}`);
      await payBill(formData);
      setIsOpen(false);
    } catch (error) {
      console.error('Error paying bill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const modal = isOpen ? (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }} onClick={() => setIsOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="ios-card w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-semibold text-white">Lunasi Tagihan</h2>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-[10px] flex items-center justify-center active-scale"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
          </div>

          <div className="mb-4 p-3.5 rounded-[14px]" style={{ background: 'rgba(255,159,10,0.12)', border: '0.5px solid rgba(255,159,10,0.25)' }}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(255,159,10,0.2)' }}>
                <Receipt size={16} style={{ color: '#FF9F0A' }} />
              </div>
              <span className="text-[15px] font-semibold text-white">{bill.name}</span>
            </div>
            <div className="text-[22px] font-semibold text-white" style={{ color: '#FF9F0A' }}>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(bill.amount)}
            </div>
            <div className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Jatuh tempo tgl {bill.dueDay} setiap bulan
            </div>
          </div>

          <div className="mb-5">
            <label className="text-[11px] font-medium uppercase" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>
              Bayar dari Rekening
            </label>
            <div className="space-y-2">
              {accounts.map(a => (
                <label key={a.id}
                  onClick={() => setSelectedAccount(a.id)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-[14px] cursor-pointer active-scale transition-all"
                  style={{
                    background: selectedAccount === a.id ? 'rgba(48,209,88,0.12)' : 'rgba(255,255,255,0.04)',
                    border: selectedAccount === a.id ? '0.5px solid rgba(48,209,88,0.3)' : '0.5px solid rgba(255,255,255,0.06)',
                  }}>
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                    style={{ background: selectedAccount === a.id ? 'rgba(48,209,88,0.2)' : 'rgba(255,255,255,0.06)' }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: 10,
                      background: selectedAccount === a.id ? '#30D158' : 'rgba(255,255,255,0.2)',
                      transition: 'all 0.2s',
                    }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-white">{a.name}</div>
                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{a.type}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={onSubmit}
            disabled={isLoading || !selectedAccount}
            className="active-scale w-full py-3.5 rounded-[14px] text-[14px] font-semibold text-white border-none cursor-pointer disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #FF9F0A, #FF453A)' }}
          >
            {isLoading ? 'Memproses...' : `Bayar Sekarang`}
          </button>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button
        onClick={() => { setSelectedAccount(bill.accountId || accounts[0]?.id || ''); setIsOpen(true); }}
        className="active-scale grid h-8 w-8 place-items-center rounded-xl transition"
        style={{ background: 'rgba(48,209,88,0.15)', color: '#30D158' }}
        title="Lunasi Tagihan"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>

      {mounted && createPortal(modal, document.body)}
    </>
  );
}
