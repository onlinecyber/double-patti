import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generateFakeWinners, formatCurrency } from '../utils/helpers';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const winners = useMemo(() => generateFakeWinners(20).sort((a, b) => b.amount - a.amount), []);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-[#06061a] pb-20 md:pb-8">
      <div className="bg-mesh-brand min-h-screen">
        <div className="max-w-lg mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 mb-4">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/home')} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </motion.button>
            <h1 className="font-outfit font-bold text-base sm:text-lg text-white">🏆 Leaderboard</h1>
          </div>

          {/* Top 3 Podium */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-center gap-2 sm:gap-3 mb-5 px-2">
            {[1, 0, 2].map((rank) => {
              const w = winners[rank];
              if (!w) return null;
              const heights = ['h-24 sm:h-28', 'h-16 sm:h-20', 'h-12 sm:h-16'];
              const avatarSizes = ['w-12 h-12 sm:w-14 sm:h-14', 'w-10 h-10 sm:w-11 sm:h-11', 'w-10 h-10 sm:w-11 sm:h-11'];
              return (
                <motion.div key={rank} initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + rank * 0.12 }} className="flex flex-col items-center flex-1 max-w-[110px]">
                  <div className={`${avatarSizes[rank]} rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-bold text-xs sm:text-sm mb-1.5 border-2 ${rank === 0 ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : rank === 1 ? 'border-gray-400' : 'border-amber-700'}`}>
                    {w.name.charAt(0)}
                  </div>
                  <p className="text-white text-[10px] sm:text-xs font-medium mb-0.5 truncate w-full text-center">{w.name}</p>
                  <p className="text-green-400 text-[10px] sm:text-xs font-bold mb-1.5">{formatCurrency(w.amount)}</p>
                  <div className={`${heights[rank]} w-full rounded-t-xl bg-gradient-to-t ${rank === 0 ? 'from-yellow-600/20 to-yellow-500/10 border-yellow-500/20' : rank === 1 ? 'from-gray-500/20 to-gray-400/10 border-gray-400/20' : 'from-amber-700/20 to-amber-600/10 border-amber-600/20'} border border-b-0 flex items-start justify-center pt-1.5`}>
                    <span className="text-lg sm:text-xl">{medals[rank]}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Full List */}
          <div className="space-y-1.5">
            {winners.slice(3).map((w, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-2.5 sm:p-3 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">#{i + 4}</span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600/50 to-violet-700/50 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{w.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">{w.name}</p>
                  <p className="text-[9px] text-gray-500">{w.game}</p>
                </div>
                <span className="text-green-400 font-bold text-xs shrink-0">{formatCurrency(w.amount)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
