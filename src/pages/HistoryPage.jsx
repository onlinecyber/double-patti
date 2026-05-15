import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { getGameHistory } from '../services/gameService';
import { formatTime } from '../utils/helpers';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { getDepositHistory, getWithdrawalHistory } = useWallet();
  
  const [activeTab, setActiveTab] = useState('games');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const tabs = [
    { id: 'games', label: 'Game History', icon: '🎮' },
    { id: 'deposits', label: 'Recharges', icon: '💰' },
    { id: 'withdrawals', label: 'Withdrawals', icon: '📤' },
  ];

  useEffect(() => {
    loadData();
  }, [activeTab, userData?.id]);

  const loadData = async () => {
    if (!userData?.id) return;
    setLoading(true);
    try {
      let results = [];
      if (activeTab === 'games') {
        results = await getGameHistory(userData.id);
      } else if (activeTab === 'deposits') {
        results = await getDepositHistory();
      } else if (activeTab === 'withdrawals') {
        results = await getWithdrawalHistory();
      }
      setData(results);
    } catch (error) {
      console.error("Load error:", error);
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
            onClick={() => navigate('/profile')}
            className="w-11 h-11 rounded-2xl bg-[#1a1a1a] flex items-center justify-center border border-white/5"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </motion.button>
          <h1 className="text-xl font-bold">History</h1>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-[#121212] p-1.5 rounded-2xl border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 w-full bg-[#121212] rounded-[24px] animate-pulse" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="py-20 text-center opacity-30">
              <div className="text-5xl mb-4">📜</div>
              <p className="text-xs font-bold uppercase tracking-widest">No history found</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {data.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#121212] p-5 rounded-[24px] border border-white/5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black tracking-tight">
                          ₹{item.amount || item.entryFee}
                        </span>
                        {activeTab === 'games' && item.prize > 0 && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                            + ₹{item.prize} WIN
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium">
                        {item.gameTitle || (activeTab === 'deposits' ? 'Recharge' : 'Withdrawal')} • {formatTime(item.createdAt)}
                      </p>
                      {activeTab === 'games' && item.numbers && (
                        <p className="text-[9px] text-indigo-400/60 font-bold uppercase tracking-widest">
                          Numbers: {item.numbers.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                        (item.status === 'completed' || item.status === 'approved' || item.status === 'won') ? 'text-green-400 bg-green-400/10' : 
                        (item.status === 'pending' || item.status === 'waiting') ? 'text-amber-400 bg-amber-400/10' : 'text-red-400 bg-red-400/10'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
