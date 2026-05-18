import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { formatCurrency, formatTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const quickAmounts = [
  { amount: 100, label: 'STARTER' },
  { amount: 300, label: 'POPULAR' },
  { amount: 500, label: 'BEST VALUE', hot: true },
  { amount: 1000, label: 'PREMIUM' },
  { amount: 2000, label: 'VIP' },
  { amount: 5000, label: 'ULTIMATE' },
];

const DepositPage = () => {
  const navigate = useNavigate();
  const { balance, createDepositRequest, getDepositHistory } = useWallet();
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('recharge'); // recharge | payment | history
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [settings, setSettings] = useState({
    upiId: 'doublepatti@upi',
    qrUrl: 'upi://pay?pa=doublepatti@upi&pn=DoublePatti&cu=INR'
  });

  useEffect(() => {
    loadHistory();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { getAppSettings } = await import('../services/adminService');
      const data = await getAppSettings();
      if (data) setSettings(data);
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  };

  const loadHistory = async () => {
    const data = await getDepositHistory();
    setHistory(data);
  };

  const handleRechargeClick = () => {
    if (!amount || Number(amount) < 50) {
      toast.error('Minimum recharge is ₹50');
      return;
    }
    setView('payment');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId || transactionId.length < 6) {
      toast.error('Valid UTR is required');
      return;
    }
    setLoading(true);
    try {
      await createDepositRequest(Number(amount), transactionId);
      setAmount('');
      setTransactionId('');
      toast.success('Submitted! Credited after verification.');
      setView('history');
      loadHistory();
    } catch (err) {
      toast.error('System busy. Try later.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Inter',sans-serif] pb-32">
      <div className="max-w-md mx-auto px-5">

        {/* Header - Matches Screenshot */}
        <header className="flex items-center gap-4 py-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => view === 'payment' ? setView('recharge') : navigate('/home')}
            className="w-11 h-11 rounded-2xl bg-[#1a1a1a] flex items-center justify-center border border-white/5"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </motion.button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-xl">💳</span> Recharge
          </h1>
        </header>

        <AnimatePresence mode="wait">
          {view === 'recharge' && (
            <motion.div
              key="recharge-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Balance Card - Exact Screenshot Match */}
              <div className="rounded-[32px] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] p-8 shadow-[0_10px_40px_rgba(99,102,241,0.3)] relative overflow-hidden">
                <div className="flex items-center gap-6">
                  <div className="w-18 h-18 flex items-center justify-center text-5xl">
                    💰
                  </div>
                  <div className="space-y-1">
                    <p className="text-indigo-100/80 text-sm font-medium">Current Balance</p>
                    <h2 className="text-4xl font-black tracking-tight">₹{balance}</h2>
                  </div>
                </div>
              </div>

              {/* Enter Amount Section */}
              <div className="space-y-4 pt-6">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-300 ml-1">
                  <span>💵</span> Enter Amount
                </label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 font-bold text-2xl group-focus-within:text-indigo-400 transition-colors">₹</div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[#121212] border border-white/5 focus:border-indigo-500/50 rounded-[24px] py-7 pl-12 pr-6 text-2xl font-black text-white placeholder:text-[#333] outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Quick Select Grid */}
              <div className="space-y-4 pt-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-300 ml-1">
                  <span>⚡</span> Quick Select
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {quickAmounts.map((item) => (
                    <button
                      key={item.amount}
                      onClick={() => setAmount(item.amount.toString())}
                      className={`relative py-6 px-4 rounded-[24px] border-2 transition-all flex flex-col items-center justify-center gap-2 ${Number(amount) === item.amount
                          ? 'bg-indigo-600/10 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                          : 'bg-[#121212] border-white/5 hover:border-white/10'
                        }`}
                    >
                      {item.hot && (
                        <div className="absolute -top-3 -right-1 bg-gradient-to-r from-orange-500 to-red-600 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                          🔥 HOT
                        </div>
                      )}
                      <span className={`text-xl font-black ${Number(amount) === item.amount ? 'text-white' : 'text-gray-200'}`}>₹{item.amount}</span>
                      <span className="text-[10px] font-bold text-gray-600 tracking-widest uppercase">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Channel */}
              <div className="space-y-4 pt-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-300 ml-1">
                  <span>🏦</span> Payment Channel
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`w-full p-6 rounded-[28px] flex items-center justify-between border-2 transition-all ${paymentMethod === 'upi'
                        ? 'bg-gradient-to-r from-indigo-600/40 to-violet-600/40 border-indigo-500 shadow-xl shadow-indigo-900/20'
                        : 'bg-[#121212] border-white/5'
                      }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${paymentMethod === 'upi' ? 'bg-white/20' : 'bg-white/5'}`}>📱</div>
                      <span className="font-black text-lg">UPI / PayTM</span>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'upi' ? 'border-white' : 'border-gray-700'}`}>
                      {paymentMethod === 'upi' && <div className="w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_12px_white]" />}
                    </div>
                  </button>

                  <div className="w-full p-6 rounded-[28px] flex items-center justify-between border-2 border-white/5 bg-[#121212] opacity-40 cursor-not-allowed">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl grayscale">🏧</div>
                      <span className="font-black text-lg text-gray-500">Bank Transfer</span>
                    </div>
                    <div className="w-7 h-7 rounded-full border-2 border-gray-800" />
                  </div>
                </div>
              </div>

              {/* Recharge Button */}
              <div className="pt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRechargeClick}
                  className="w-full py-6 rounded-[28px] bg-indigo-600 text-white font-black text-xl shadow-2xl shadow-indigo-600/40 uppercase tracking-widest"
                >
                  Recharge Now
                </motion.button>

                <button
                  onClick={() => setView('history')}
                  className="w-full py-6 text-gray-600 text-sm font-bold uppercase tracking-widest hover:text-indigo-400 transition-colors"
                >
                  View History
                </button>
              </div>
            </motion.div>
          )}

          {view === 'payment' && (
            <motion.div
              key="payment-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8 text-center space-y-6 shadow-2xl">
                <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Step 2: Pay & Submit UTR</h3>
                <div className="bg-white p-4 rounded-3xl w-48 h-48 mx-auto shadow-2xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(settings.qrUrl)}`}
                    alt="QR"
                    className="w-full h-full"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 font-bold">UPI ID</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-base font-bold tracking-tight">{settings.upiId}</span>
                    <button onClick={() => { navigator.clipboard.writeText(settings.upiId); toast.success('Copied!'); }} className="text-[10px] bg-indigo-600/20 text-indigo-400 px-3 py-1.5 rounded-xl font-bold">COPY</button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-400 ml-1">Transaction UTR Number</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter 12-Digit UTR"
                  className="w-full bg-[#121212] border border-white/5 rounded-[24px] py-6 text-center text-xl font-bold text-white placeholder:text-[#222] outline-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading || !transactionId}
                className="w-full py-5 rounded-[24px] bg-green-600 text-white font-bold text-lg shadow-xl shadow-green-900/30"
              >
                {loading ? 'Processing...' : 'Verify Payment'}
              </motion.button>
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div
              key="history-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">History</h2>
                <button onClick={() => setView('recharge')} className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Back</button>
              </div>
              {history.map((d) => (
                <div key={d.id} className="bg-[#121212] p-6 rounded-[24px] border border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xl font-bold">₹{d.amount}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{formatTime(d.createdAt)}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${d.status === 'completed' ? 'text-green-400 bg-green-400/10' :
                      d.status === 'pending' ? 'text-amber-400 bg-amber-400/10' : 'text-red-400 bg-red-400/10'
                    }`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DepositPage;
