import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { listenToActiveBet } from '../../services/gameService';

const GameCard = ({ game, onJoinClick }) => {
  const { userData } = useAuth();
  const [bet, setBet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.id) {
      setLoading(false);
      return;
    }
    
    // Listen to real-time updates for this specific game's active bet
    const unsubscribe = listenToActiveBet(userData.id, game.id, (activeBet) => {
      if (activeBet && activeBet.createdAt) {
        const betDate = activeBet.createdAt.toDate ? activeBet.createdAt.toDate() : new Date(activeBet.createdAt);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // If the bet is from a previous day, ignore it to show JOIN NOW
        if (betDate < startOfToday) {
          setBet(null);
        } else {
          setBet(activeBet);
        }
      } else {
        setBet(null);
      }
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, [userData?.id, game.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#12142b]/80 backdrop-blur-xl border border-indigo-500/20 shadow-lg hover:border-indigo-400/40 transition-all duration-300"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-fuchsia-500/5 group-hover:from-indigo-500/10 group-hover:to-fuchsia-500/10 transition-colors duration-500" />
      
      <div className="p-5 sm:p-6 flex flex-col w-full h-full relative z-10">
        {/* TOP: Game title */}
        <div className="w-full text-center mb-5 sm:mb-6">
          <h3 className="font-outfit font-black text-xl sm:text-2xl text-white tracking-wide">{game.title}</h3>
        </div>
        
        {/* MIDDLE: Details Row */}
        <div className="flex items-center justify-center w-full mb-6 sm:mb-8">
          <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg border border-white/5">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Draw Time</span>
              <span className="text-xs sm:text-sm text-amber-400 font-bold leading-none">{game.openingTime}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM: Dynamic Status Area */}
        <div className="mt-auto w-full flex flex-col items-center justify-center">
          {loading ? (
            <div className="w-full sm:w-[85%] px-6 py-4 sm:py-5 rounded-2xl bg-white/5 animate-pulse text-center text-gray-400 font-bold">
              Loading...
            </div>
          ) : !bet ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="group/btn relative overflow-hidden w-full sm:w-[90%] px-6 py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-black shadow-lg hover:shadow-xl transition-all"
              onClick={onJoinClick}
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              <span className="text-base sm:text-lg tracking-widest relative z-10">JOIN NOW</span>
            </motion.button>
          ) : (
            <div className={`w-full sm:w-[95%] p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
              bet.status === 'waiting' ? 'bg-indigo-900/40 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' :
              bet.status === 'won' ? 'bg-emerald-900/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
              'bg-red-900/40 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
            }`}>
              {/* Status Header */}
              <div className="mb-3">
                {bet.status === 'waiting' && (
                  <span className="text-indigo-300 font-black tracking-widest uppercase text-sm sm:text-base animate-pulse">
                    WAITING FOR RESULT ⏳
                  </span>
                )}
                {bet.status === 'won' && (
                  <span className="text-emerald-400 font-black tracking-widest uppercase text-lg drop-shadow-md">
                    🏆 YOU WON ₹{bet.prize}!
                  </span>
                )}
                {bet.status === 'lost' && (
                  <span className="text-red-400 font-black tracking-widest uppercase text-lg drop-shadow-md">
                    😔 YOU LOST
                  </span>
                )}
              </div>

              {/* Selected Numbers */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Your Numbers:</span>
                <div className="flex gap-2">
                  {bet.numbers.map((num, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 ${
                      bet.status === 'won' && bet.winningNumber === num 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.5)] scale-110' 
                        : 'bg-black/30 text-white border-white/10'
                    }`}>
                      {num}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Winning Number Reveal (if resolved) */}
              {bet.status !== 'waiting' && (bet.winningNumbers || bet.winningNumber) && (
                <div className="mt-3 pt-3 border-t border-white/10 w-full flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block mb-2">Winning Sequence</span>
                  <div className="flex gap-2.5">
                    {(Array.isArray(bet.winningNumbers) ? bet.winningNumbers : [bet.winningNumber]).filter(n => n !== undefined).map((num, i) => (
                      <div key={i} className="w-11 h-11 rounded-full bg-amber-500/10 text-amber-400 border-2 border-amber-500/40 flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
