import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { generateRandomNumbers, placeBet, defaultGames } from '../services/gameService';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { formatCurrency } from '../utils/helpers';

const STEP_SELECT = 'select';
const STEP_WAITING = 'waiting';
const STEP_RESULT = 'result';

const GamePage = () => {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, deductBalance } = useWallet();

  const game = location.state?.game || defaultGames.find(g => g.id === gameId) || defaultGames[0];

  const [step, setStep] = useState(STEP_SELECT);
  const [numbers, setNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [winningNumber, setWinningNumber] = useState(null);
  const [isWin, setIsWin] = useState(false);
  const [prize, setPrize] = useState(0);
  const [timer, setTimer] = useState(15);
  const [waitTimer, setWaitTimer] = useState(8);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => { setNumbers(generateRandomNumbers()); }, []);

  useEffect(() => {
    if (step !== STEP_SELECT || hasPlayed) return;
    if (timer <= 0) { if (!selectedNumber && numbers.length > 0) handleSelectNumber(numbers[0]); return; }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer, hasPlayed]);

  useEffect(() => {
    if (step !== STEP_WAITING) return;
    if (waitTimer <= 0) { showResult(); return; }
    const interval = setInterval(() => setWaitTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, waitTimer]);

  const [activeBetId, setActiveBetId] = useState(null);

  const handleSelectNumber = async (num) => {
    if (selectedNumber || hasPlayed) return;
    if (balance < game.entryFee) { navigate('/deposit'); return; }
    
    setSelectedNumber(num);
    setHasPlayed(true);
    setStep(STEP_WAITING);

    try {
      await placeBet(user.uid, game.id, game.title, [num], game.entryFee);
      // Logic moved to useEffect listener
    } catch (error) {
      setHasPlayed(false);
      setStep(STEP_SELECT);
      setSelectedNumber(null);
    }
  };

  // Real-time listener for the bet result
  useEffect(() => {
    if (step !== STEP_WAITING || !user) return;

    const q = query(
      collection(db, 'activeBets'),
      where('userId', '==', user.uid),
      where('gameId', '==', game.id),
      where('status', 'in', ['won', 'lost'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const betData = snapshot.docs[0].data();
        setWinningNumber(betData.winningNumber);
        setIsWin(betData.status === 'won');
        setPrize(betData.prize);
        setStep(STEP_RESULT);
        
        if (betData.status === 'won') {
          setTimeout(() => confetti({ 
            particleCount: 120, 
            spread: 70, 
            origin: { y: 0.7 }, 
            colors: ['#6366f1', '#22c55e', '#fbbf24', '#ffffff'] 
          }), 400);
        }
      }
    });

    return () => unsubscribe();
  }, [step, user, game.id]);

  const playAgain = () => {
    setStep(STEP_SELECT); 
    setNumbers(generateRandomNumbers()); 
    setSelectedNumber(null);
    setWinningNumber(null); 
    setIsWin(false); 
    setPrize(0); 
    setTimer(15); 
    setWaitTimer(8); 
    setHasPlayed(false);
  };

  const CircularTimer = ({ time, total, size = 72 }) => {
    const r = (size - 8) / 2;
    const c = 2 * Math.PI * r;
    const p = (time / total) * c;
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
          <circle cx={size/2} cy={size/2} r={r} stroke={time <= 3 ? '#ef4444' : '#6366f1'} strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - p} className="transition-all duration-1000 ease-linear" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-outfit font-black text-lg ${time <= 3 ? 'text-red-500' : 'text-white'}`}>{time}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#06061a] pb-20 md:pb-8">
      <div className="bg-mesh-brand min-h-screen">
        <div className="max-w-lg mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 mb-5">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/home')} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center active:bg-white/10 shrink-0">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </motion.button>
            <div className="min-w-0">
              <h1 className="font-outfit font-bold text-base sm:text-lg text-white truncate">{game.title}</h1>
              <p className="text-[10px] sm:text-xs text-gray-500">Entry: {formatCurrency(game.entryFee)} • Win: {formatCurrency(game.prizePool)}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === STEP_SELECT && (
              <motion.div key="select" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card-strong p-5 sm:p-6 text-center">
                <span className="text-3xl sm:text-4xl block mb-2">{game.icon}</span>
                <h2 className="font-outfit font-bold text-lg text-white mb-1">Pick Your Number</h2>
                <p className="text-gray-400 text-xs mb-5">Select one number to play</p>
                <div className="flex justify-center mb-5"><CircularTimer time={timer} total={15} size={80} /></div>
                <div className="flex justify-center gap-4 sm:gap-6 mb-5">
                  {numbers.map((num) => (
                    <motion.button key={num} whileTap={{ scale: 0.92 }} onClick={() => handleSelectNumber(num)} disabled={hasPlayed}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-outfit font-black transition-all duration-300 ${
                        selectedNumber === num
                          ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white glow-brand-strong border-2 border-indigo-400/40'
                          : 'bg-white/5 text-white border border-white/10 active:border-indigo-500/30 active:bg-white/8'
                      }`}>
                      {num}
                    </motion.button>
                  ))}
                </div>
                {selectedNumber && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 font-medium text-xs">✓ Selected {selectedNumber}</motion.p>}
                <div className="mt-4 pt-3 border-t border-white/5">
                  <p className="text-[11px] text-gray-500">Balance: <span className="text-white font-semibold">{formatCurrency(balance)}</span></p>
                </div>
              </motion.div>
            )}

            {step === STEP_WAITING && (
              <motion.div key="waiting" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card-strong p-6 sm:p-8 text-center">
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-4xl sm:text-5xl mb-3">🚀</motion.div>
                <h2 className="font-outfit font-bold text-lg text-white mb-1">Waiting For Result...</h2>
                <p className="text-gray-400 text-xs mb-5">Your number: <span className="text-indigo-400 font-bold text-sm">{selectedNumber}</span></p>
                <div className="flex justify-center mb-5"><CircularTimer time={waitTimer} total={8} size={90} /></div>
                <div className="relative w-16 h-16 mx-auto">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div key={i} className="absolute w-2.5 h-2.5 rounded-full bg-indigo-500" style={{ top: '50%', left: '50%' }}
                      animate={{ x: [0, 25, 0, -25, 0], y: [-25, 0, 25, 0, -25] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: 'linear' }} />
                  ))}
                </div>
                <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-500 text-[10px] mt-5">Processing result...</motion.p>
              </motion.div>
            )}

            {step === STEP_RESULT && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="glass-card-strong p-5 sm:p-6 text-center">
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.2 }} className="text-5xl sm:text-6xl mb-3">{isWin ? '🎉' : '😔'}</motion.div>
                <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`font-outfit font-black text-xl sm:text-2xl mb-2 ${isWin ? 'text-green-400' : 'text-rose-400'}`}>
                  {isWin ? 'You Won!' : 'Better Luck Next Time'}
                </motion.h2>
                {isWin && <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="gradient-text-gold font-outfit font-black text-2xl sm:text-3xl mb-3">+{formatCurrency(prize)}</motion.p>}

                <div className="flex justify-center gap-4 sm:gap-6 my-5">
                  <div className="text-center">
                    <p className="text-[9px] text-gray-500 mb-1.5 uppercase tracking-wider">Your Pick</p>
                    <motion.div initial={{ rotateY: 180 }} animate={{ rotateY: 0 }} transition={{ delay: 0.4 }}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-outfit font-black border-2 ${isWin ? 'bg-green-600/20 border-green-500/40 text-green-400 glow-green' : 'bg-rose-600/20 border-rose-500/40 text-rose-400'}`}>
                      {selectedNumber}
                    </motion.div>
                  </div>
                  <div className="flex items-center"><span className="text-gray-600 text-sm">vs</span></div>
                  <div className="text-center">
                    <p className="text-[9px] text-gray-500 mb-1.5 uppercase tracking-wider">Winning</p>
                    <motion.div initial={{ rotateY: 180 }} animate={{ rotateY: 0 }} transition={{ delay: 0.6 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-2 border-yellow-500/30 flex items-center justify-center text-xl sm:text-2xl font-outfit font-black text-yellow-400 glow-gold">
                      {winningNumber}
                    </motion.div>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-5">
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate('/home')} className="btn-outline flex-1 py-3 text-sm">Home</motion.button>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={playAgain} className="btn-neon-brand flex-1 py-3 text-sm">Play Again</motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
