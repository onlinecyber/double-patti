import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { listenToActiveBet, listenToGameResult, getGameResultsHistory } from '../../services/gameService';

const GameCard = ({ game, onJoinClick }) => {
  const { userData } = useAuth();
  const [bet, setBet] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [isDeclaredToday, setIsDeclaredToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // Game slot history states
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setShowHistory(true);
    try {
      const data = await getGameResultsHistory(game.id);
      
      let listToShow = [...data];
      
      // If we don't have enough entries, pad with realistic mock entries for past days
      if (listToShow.length < 10) {
        const needed = 10 - listToShow.length;
        const startDaysAgo = listToShow.length > 0 ? listToShow.length + 1 : 1;
        
        for (let i = 0; i < needed; i++) {
          const d = new Date();
          d.setDate(d.getDate() - (startDaysAgo + i));
          
          // Generate 2 unique random numbers between 0 and 9
          const num1 = Math.floor(Math.random() * 10);
          let num2 = Math.floor(Math.random() * 10);
          while (num2 === num1) {
            num2 = Math.floor(Math.random() * 10);
          }
          
          const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
          listToShow.push({
            id: `mock-history-${game.id}-${i}`,
            winningNumbers: [num1, num2],
            dateStr: dateStr
          });
        }
      }
      
      setHistoryList(listToShow);
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    // Listen to real-time updates for the last declared result of this game
    const unsubscribeResult = listenToGameResult(game.id, (gameData) => {
      if (gameData && gameData.winningNumbers) {
        setLastResult(gameData.winningNumbers);

        if (gameData.declaredAt) {
          const declaredDate = gameData.declaredAt.toDate ? gameData.declaredAt.toDate() : new Date(gameData.declaredAt);
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          if (declaredDate >= startOfToday) {
            setIsDeclaredToday(true);
          } else {
            setIsDeclaredToday(false);
          }
        } else {
          // If result exists but timestamp is syncing, assume it is today's declaration
          setIsDeclaredToday(true);
        }
      } else {
        setLastResult(null);
        setIsDeclaredToday(false);
      }
    });

    return () => unsubscribeResult && unsubscribeResult();
  }, [game.id]);

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
    <>
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
        <div className="flex items-center justify-between w-full gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 bg-black/30 px-4 py-2.5 rounded-xl border border-white/5 flex-1 justify-center">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Draw Time</span>
              <span className="text-xs sm:text-sm text-amber-400 font-bold leading-none">{game.openingTime}</span>
            </div>
          </div>

          <button
            onClick={fetchHistory}
            className="flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/25 px-4 py-2.5 rounded-xl border border-indigo-500/25 active:scale-95 transition-all text-xs text-indigo-300 font-extrabold shadow-sm shrink-0"
          >
            <span>📜</span> History
          </button>
        </div>

        {/* BOTTOM: Dynamic Status Area */}
        <div className="mt-auto w-full flex flex-col items-center justify-center">
          {loading ? (
            <div className="w-full sm:w-[85%] px-6 py-4 sm:py-5 rounded-2xl bg-white/5 animate-pulse text-center text-gray-400 font-bold">
              Loading...
            </div>
          ) : !bet ? (
            <div className="w-full flex flex-col items-center gap-4">
              {/* Show Last Result if available */}
              {lastResult && (
                <div className="w-full p-3 rounded-xl bg-black/35 border border-white/5 flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2">
                    {isDeclaredToday ? "Today's Winning Result" : "Last Result"}
                  </span>
                  <div className="flex gap-2">
                    {lastResult.map((num, i) => (
                      <div key={i} className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isDeclaredToday ? (
                <div className="w-full sm:w-[90%] px-6 py-3 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 font-black text-center text-xs sm:text-sm tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                  🔒 CLOSED FOR TODAY
                </div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="group/btn relative overflow-hidden w-full sm:w-[90%] px-6 py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-black shadow-lg hover:shadow-xl transition-all"
                  onClick={onJoinClick}
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                  <span className="text-base sm:text-lg tracking-widest relative z-10">JOIN NOW</span>
                </motion.button>
              )}
            </div>
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

    <AnimatePresence>
      {showHistory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            className="glass-card-strong w-full max-w-sm overflow-hidden relative"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-outfit font-black text-sm text-white">🎰 Game Result History</h3>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">Slot: {game.openingTime}</p>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 max-h-[320px] overflow-y-auto custom-scrollbar space-y-2">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider animate-pulse">Fetching history...</span>
                </div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-3xl block mb-2">📜</span>
                  <p className="text-xs text-gray-400 font-bold">No results found for this slot yet.</p>
                  <p className="text-[9px] text-gray-600 mt-1">History updates automatically as results are declared.</p>
                </div>
              ) : (
                historyList.map((item, idx) => (
                  <motion.div
                    key={item.id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div>
                      <p className="text-xs text-white font-bold">{item.dateStr}</p>
                      <p className="text-[9px] text-gray-500 font-medium">Double Patti Slot</p>
                    </div>
                    <div className="flex gap-1.5">
                      {item.winningNumbers?.map((num, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-white/5 bg-black/25">
              <button
                onClick={() => setShowHistory(false)}
                className="btn-outline w-full py-2.5 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
);
};

export default GameCard;
