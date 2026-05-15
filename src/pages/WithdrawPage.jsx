import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { formatCurrency, formatTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const WithdrawPage = () => {
  const navigate = useNavigate();
  const { balance, createWithdrawalRequest, getWithdrawalHistory } = useWallet();
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('withdraw'); // withdraw | history
  const [paymentMethod, setPaymentMethod] = useState('upi');

  useEffect(() => { loadHistory(); }, []);
  const loadHistory = async () => { setHistory(await getWithdrawalHistory()); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) < 100) {
      toast.error('Minimum withdrawal is ₹100');
      return;
    }
    if (Number(amount) > balance) {
      toast.error('Insufficient balance');
      return;
    }
    if (paymentMethod === 'upi' && !upiId) {
      toast.error('Enter UPI ID');
      return;
    }
    if (paymentMethod === 'bank' && (!bankAccount || !ifsc)) {
      toast.error('Enter full bank details');
      return;
    }

    setLoading(true);
    try { 
      await createWithdrawalRequest(Number(amount), { upiId, bankAccount, ifsc }); 
      setAmount(''); 
      setUpiId(''); 
      setBankAccount(''); 
      setIfsc(''); 
      toast.success('Withdrawal request submitted!');
      setView('history');
      loadHistory(); 
    } catch (err) {
      toast.error('Withdrawal failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Inter',sans-serif] pb-32">
      <div className="max-w-md mx-auto px-5">
        
        {/* Header */}
        <header className="flex items-center gap-4 py-8">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => view === 'history' ? setView('withdraw') : navigate('/home')}
            className="w-11 h-11 rounded-2xl bg-[#1a1a1a] flex items-center justify-center border border-white/5"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </motion.button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-xl">📤</span> Withdraw
          </h1>
        </header>

        <AnimatePresence mode="wait">
          {view === 'withdraw' ? (
            <motion.div
              key="withdraw-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              {/* Balance Card */}
              <div className="rounded-[32px] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] p-8 shadow-[0_10px_30px_rgba(99,102,241,0.3)] relative overflow-hidden">
                <div className="flex items-center gap-6">
                  <div className="w-18 h-18 flex items-center justify-center text-5xl">
                    💰
                  </div>
                  <div className="space-y-1">
                    <p className="text-indigo-100/80 text-sm font-medium">Available Balance</p>
                    <h2 className="text-4xl font-bold tracking-tight">₹{balance}</h2>
                  </div>
                </div>
              </div>

              {/* Amount Input Section */}
              <div className="space-y-4 pt-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                  <span>💵</span> Withdrawal Amount
                </label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 font-bold text-xl">₹</div>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Min ₹100"
                    className="w-full bg-[#121212] border border-white/5 rounded-[24px] py-6 pl-12 pr-6 text-xl font-bold text-white placeholder:text-[#333] outline-none"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                  <span>🏦</span> Receive Payment Via
                </label>
                <div className="flex gap-3">
                  {['upi', 'bank'].map((method) => (
                    <button 
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex-1 py-4 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${
                        paymentMethod === method 
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                          : 'bg-[#121212] border-white/5 text-gray-500'
                      }`}
                    >
                      {method === 'upi' ? '📱 UPI' : '🏛️ Bank'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Fields */}
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {paymentMethod === 'upi' ? (
                    <motion.div key="upi-fields" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">Your UPI ID</label>
                      <input 
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full bg-[#121212] border border-white/5 rounded-[20px] py-5 px-6 text-base font-bold outline-none"
                      />
                    </motion.div>
                  ) : (
                    <motion.div key="bank-fields" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">Account Number</label>
                        <input 
                          type="text"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          placeholder="000000000000"
                          className="w-full bg-[#121212] border border-white/5 rounded-[20px] py-5 px-6 text-base font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">IFSC Code</label>
                        <input 
                          type="text"
                          value={ifsc}
                          onChange={(e) => setIfsc(e.target.value)}
                          placeholder="SBIN0001234"
                          className="w-full bg-[#121212] border border-white/5 rounded-[20px] py-5 px-6 text-base font-bold outline-none uppercase"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={loading || !amount}
                  className="w-full py-5 rounded-[24px] bg-indigo-600 text-white font-bold text-lg shadow-xl shadow-indigo-600/30 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Withdraw ₹${amount || '0'}`}
                </motion.button>
                
                <button 
                  onClick={() => setView('history')}
                  className="w-full py-6 text-gray-500 text-sm font-medium hover:text-gray-300"
                >
                  View Withdrawal History
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Withdraw History</h2>
                <button onClick={() => setView('withdraw')} className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Back</button>
              </div>
              {history.length === 0 ? (
                <div className="py-20 text-center opacity-30">
                  <div className="text-5xl mb-4">📜</div>
                  <p className="text-xs font-bold uppercase tracking-widest">No history yet</p>
                </div>
              ) : (
                history.map((w) => (
                  <div key={w.id} className="bg-[#121212] p-6 rounded-[24px] border border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xl font-bold">₹{w.amount}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{formatTime(w.createdAt)}</p>
                      <p className="text-[9px] text-indigo-500/50 font-bold truncate max-w-[120px]">{w.upiId || w.bankAccount}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                      w.status === 'completed' ? 'text-green-400 bg-green-400/10' : 
                      w.status === 'pending' ? 'text-amber-400 bg-amber-400/10' : 'text-red-400 bg-red-400/10'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WithdrawPage;
