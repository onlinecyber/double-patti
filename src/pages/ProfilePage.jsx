import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userData, logout } = useAuth();
  const { balance } = useWallet();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };
  const handleShare = () => {
    const text = `Join Double Patti! Use code: ${userData?.referralCode || 'DPXXXX'}`;
    if (navigator.share) { navigator.share({ text }); } else { navigator.clipboard.writeText(text); toast.success('Copied!'); }
  };

  const stats = [
    { label: 'Balance', value: formatCurrency(balance), icon: '💰', color: 'text-green-400' },
    { label: 'Wins', value: userData?.totalWins || 0, icon: '🏆', color: 'text-yellow-400' },
    { label: 'Losses', value: userData?.totalLosses || 0, icon: '📉', color: 'text-rose-400' },
    { label: 'Referral', value: formatCurrency(userData?.referralEarnings || 0), icon: '🤝', color: 'text-indigo-400' },
  ];

  return (
    <div className="min-h-screen bg-[#06061a] pb-20 md:pb-8">
      <div className="bg-mesh-brand min-h-screen">
        <div className="max-w-lg mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 mb-4">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/home')} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </motion.button>
            <h1 className="font-outfit font-bold text-base sm:text-lg text-white">Profile</h1>
          </div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card-strong p-5 text-center mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center mx-auto mb-2.5 border-2 border-indigo-400/30 shadow-xl shadow-indigo-900/20">
              <span className="text-white font-black text-xl sm:text-2xl font-outfit">{userData?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <h2 className="font-outfit font-bold text-base sm:text-lg text-white">{userData?.name || 'User'}</h2>
            <p className="text-gray-500 text-xs truncate px-4">{userData?.email}</p>
            {userData?.phone && <p className="text-indigo-400/70 text-[10px] mt-0.5 font-medium">{userData?.phone}</p>}
          </motion.div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-3 sm:p-4 text-center">
                <span className="text-xl sm:text-2xl">{s.icon}</span>
                <p className={`font-outfit font-bold text-base sm:text-lg mt-0.5 ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-[9px] uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-brand p-4 mb-4">
            <h3 className="font-outfit font-bold text-xs text-white mb-2">🎁 Referral Code</h3>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex-1 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5 overflow-hidden">
                <span className="text-white font-mono font-bold text-xs sm:text-sm">{userData?.referralCode || 'DPXXXX'}</span>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleShare} className="btn-neon-brand py-2.5 px-4 text-[11px] shrink-0">Share</motion.button>
            </div>
            <p className="text-gray-400 text-[10px]">Earn ₹10 per referral!</p>
          </motion.div>

          <div className="space-y-1.5 mb-4">
            {[
              { label: 'Deposit History', path: '/deposit', icon: '📥' },
              { label: 'Withdrawal History', path: '/withdraw', icon: '📤' },
              { label: 'Leaderboard', path: '/leaderboard', icon: '🏅' },
            ].map((item, idx) => (
              <motion.button key={item.label} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.05 }}
                onClick={() => navigate(item.path)} className="w-full glass-card p-3.5 flex items-center gap-3 active:bg-white/5 transition-colors text-left min-h-[48px]">
                <span className="text-base">{item.icon}</span>
                <span className="text-white text-xs sm:text-sm font-medium flex-1">{item.label}</span>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </motion.button>
            ))}
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowLogout(true)} className="w-full py-3.5 rounded-xl bg-rose-600/10 border border-rose-600/20 text-rose-400 font-semibold text-sm active:bg-rose-600/20 min-h-[48px]" id="logout-btn">Logout</motion.button>

          {showLogout && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-3 pb-4 sm:pb-0">
              <motion.div initial={{ y: 80 }} animate={{ y: 0 }} className="glass-card-strong p-5 max-w-sm w-full text-center">
                <p className="text-white font-medium text-sm mb-4">Are you sure you want to logout?</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowLogout(false)} className="btn-outline flex-1 py-3 text-sm">Cancel</button>
                  <button onClick={handleLogout} className="btn-neon-brand flex-1 py-3 text-sm">Logout</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
