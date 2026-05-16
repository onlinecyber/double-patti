import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { defaultGames, placeBet } from '../services/gameService';
import { formatCurrency, generateFakeWinners } from '../utils/helpers';
import toast from 'react-hot-toast';
import GameCard from '../components/game/GameCard';
import NumberSelectionModal from '../components/game/NumberSelectionModal';

const HomePage = () => {
  const { userData } = useAuth();
  const { balance, addBalance } = useWallet();
  const navigate = useNavigate();
  const [showBonus, setShowBonus] = useState(false);
  const [winners, setWinners] = useState(() => generateFakeWinners(15));
  const [currentWinnerIdx, setCurrentWinnerIdx] = useState(0);
  const [selectedGameForModal, setSelectedGameForModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    });

    return () => window.removeEventListener('beforeinstallprompt', null);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleBetSubmit = async (selectedNumbers, betAmount) => {
    if (!userData?.id) {
      toast.error('Please login to place a bet!');
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      await placeBet(userData.id, selectedGameForModal.id, selectedGameForModal.title, selectedNumbers, betAmount);
      toast.success('Bet placed successfully! Waiting for results.');
      setSelectedGameForModal(null);
    } catch (error) {
      toast.error(error.message || 'Failed to place bet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const last = localStorage.getItem('lastBonusClaim');
    const now = Date.now();
    if (!last || now - Number(last) > 24 * 60 * 60 * 1000) {
      setTimeout(() => setShowBonus(true), 1500);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Rotate the index
      setCurrentWinnerIdx(prev => (prev + 1) % winners.length);
      
      // Every few seconds, update a random winner in the list to keep it fresh
      if (Math.random() > 0.6) {
        setWinners(prev => {
          const newWinners = [...prev];
          const randIdx = Math.floor(Math.random() * newWinners.length);
          // Importing helpers inside to avoid circular deps or scope issues if any
          const names = ['Rahul K.', 'Priya S.', 'Amit J.', 'Sneha R.', 'Vikram P.', 'Deepak H.', 'Ankit L.', 'Swati N.', 'Manish J.', 'Kunal B.', 'Abhishek K.', 'Roshni S.', 'Yash P.', 'Varun G.', 'Sakshi R.', 'Aditya B.', 'Gaurav H.', 'Sameer W.', 'Preeti J.', 'Aryan N.'];
          const amounts = [50000, 150000, 500000, 20000, 80000];
          
          newWinners[randIdx] = {
            id: Date.now() + Math.random(),
            name: names[Math.floor(Math.random() * names.length)],
            amount: amounts[Math.floor(Math.random() * amounts.length)],
            game: 'Double Patti'
          };
          return newWinners;
        });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [winners.length]);

  const claimBonus = async () => {
    try {
      const { getAppSettings } = await import('../services/adminService');
      const settings = await getAppSettings();
      const bonusAmount = settings?.dailyBonus || 5;
      
      const success = await addBalance(bonusAmount, 'Daily Login Bonus');
      if (success) {
        localStorage.setItem('lastBonusClaim', Date.now().toString());
        setShowBonus(false);
        toast.success(`₹${bonusAmount} added to your wallet!`);
      }
    } catch (error) {
      toast.error('Failed to claim bonus');
    }
  };

  const currentWinner = winners[currentWinnerIdx];

  return (
    <div className="min-h-screen bg-[#070814] pb-32 md:pb-12 text-white font-sans">
      <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#070814] to-[#070814] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* ===== INSTALL APP BANNER ===== */}
          <AnimatePresence>
            {showInstallBanner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative overflow-hidden rounded-2xl bg-indigo-600 p-4 shadow-lg border border-indigo-400/30 flex items-center justify-between gap-4 mb-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Install Double Patti</h4>
                    <p className="text-[10px] text-indigo-100">Get the best experience on your phone</p>
                  </div>
                </div>
                <button 
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-white text-indigo-600 text-xs font-black rounded-lg shadow-md hover:bg-indigo-50 transition-colors shrink-0"
                >
                  INSTALL
                </button>
                <button 
                  onClick={() => setShowInstallBanner(false)}
                  className="absolute top-1 right-2 text-indigo-200 hover:text-white"
                >
                  <span className="text-sm">×</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== WALLET CARD ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-indigo-500/20 p-5 sm:p-6 shadow-xl"
          >
            <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-indigo-500/10 blur-[60px]" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                    <span className="text-amber-400 text-[9px]">₹</span>
                  </div>
                  <span className="text-[11px] text-indigo-200 font-bold uppercase tracking-wider">Balance</span>
                </div>
                <motion.h2
                  key={balance}
                  initial={{ scale: 1.05, color: '#fbbf24' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  className="font-outfit font-black text-4xl sm:text-5xl tracking-tight"
                >
                  {formatCurrency(balance)}
                </motion.h2>
              </div>

              <div className="flex gap-2.5 w-full sm:w-auto">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/withdraw')}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-700/80 border border-white/5 text-white text-xs sm:text-sm font-bold transition-all"
                >
                  Withdraw
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/deposit')}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs sm:text-sm font-black shadow-lg transition-all border border-emerald-400/30"
                >
                  Deposit
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* ===== GAME WINNING SYSTEM INFO ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {[
              { join: 20, win: '50,000' },
              { join: 50, win: '1,50,000' },
              { join: 100, win: '5,00,000' },
            ].map((tier, i) => (
              <div key={i} className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3.5 border border-white/5 flex items-center justify-between shadow-sm hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-[11px] font-medium uppercase">Join</span>
                  <span className="text-amber-400 text-sm font-black">₹{tier.join}</span>
                </div>
                <div className="h-px flex-1 bg-white/5 mx-2" />
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 text-[11px] font-medium uppercase">Win</span>
                  <span className="text-emerald-400 text-sm font-black">₹{tier.win}</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* ===== TODAY'S WINNERS TICKER ===== */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-indigo-950/20 backdrop-blur-md p-3 rounded-xl flex items-center justify-between gap-2.5 sm:gap-4 border border-white/5 shadow-sm"
          >
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <span className="text-base">🔥</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0 relative h-8 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentWinnerIdx}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "backOut" }}
                  className="absolute inset-0 flex items-center"
                >
                  <div className="flex items-center gap-1.5 w-full min-w-0">
                    <span className="text-white font-bold text-xs sm:text-sm truncate min-w-0 max-w-[80px] sm:max-w-none">
                      {currentWinner?.name}
                    </span>
                    <span className="text-gray-500 text-[10px] sm:text-xs shrink-0">won</span>
                    <span className="text-emerald-400 font-black bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-lg text-xs sm:text-sm shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                      {formatCurrency(currentWinner?.amount)}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={() => navigate('/leaderboard')}
              className="shrink-0 flex items-center gap-1 bg-indigo-600/10 hover:bg-indigo-600/20 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all group"
            >
              <span className="text-[10px] sm:text-xs text-indigo-300 font-bold uppercase tracking-wider">Ranks</span>
              <svg className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
          </motion.div>

          {/* ===== GAME CARDS HEADER ===== */}
          <div className="flex items-center justify-between pt-2">
            <h2 className="font-outfit font-black text-xl sm:text-2xl text-white flex items-center gap-2.5">
              <span className="text-2xl">🎰</span> Live Games
            </h2>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[9px] font-bold text-emerald-400 tracking-widest uppercase">{defaultGames.length} Live</span>
            </div>
          </div>

          {/* ===== GAME CARDS ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {defaultGames.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onJoinClick={() => setSelectedGameForModal(game)} 
              />
            ))}
          </div>

          {/* ===== TOP WINNERS ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/30 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-outfit font-black text-base sm:text-lg text-white flex items-center gap-2">
                🏆 Top Winners
              </h3>
              <button onClick={() => navigate('/leaderboard')} className="text-sm text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {winners.slice(0, 3).map((w, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5 hover:bg-white/10 transition-all cursor-default">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 border-2 ${
                    i === 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                    i === 1 ? 'bg-slate-400/20 text-slate-300 border-slate-400/40' :
                    'bg-orange-700/20 text-orange-500 border-orange-700/40'
                  }`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-bold truncate">{w.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium truncate uppercase">{w.game}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-emerald-400 font-black text-sm block">{formatCurrency(w.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ===== DAILY BONUS POPUP ===== */}
      <AnimatePresence>
        {showBonus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-5"
            onClick={claimBonus}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-slate-900/90 p-8 sm:p-10 text-center max-w-sm w-full relative overflow-hidden rounded-[32px] border border-indigo-500/40 shadow-[0_20px_60px_rgba(79,70,229,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-indigo-600/30 blur-[60px]" />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-amber-500/30 blur-[60px]" />
              
              <motion.div animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-6xl sm:text-7xl mb-5">🎁</motion.div>
              <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white mb-2">Daily Bonus!</h3>
              <p className="text-gray-400 text-base mb-6 font-medium">Claim your daily login reward</p>
              
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-5 rounded-2xl mb-8 shadow-inner">
                <span className="gradient-text-gold font-outfit font-black text-4xl">₹5 FREE</span>
              </div>
              
              <motion.button whileTap={{ scale: 0.95 }} onClick={claimBonus} className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-black text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-shadow">
                Claim Bonus 🎉
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== NUMBER SELECTION MODAL ===== */}
      {selectedGameForModal && (
        <NumberSelectionModal
          game={selectedGameForModal}
          onClose={() => setSelectedGameForModal(null)}
          onSubmit={handleBetSubmit}
        />
      )}
    </div>
  );
};

export default HomePage;
