import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { declareResult, getActiveBets } from '../../services/adminService';
import { defaultGames } from '../../services/gameService';
import toast from 'react-hot-toast';

const AdminResults = () => {
  const [gameId, setGameId] = useState('');
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [loading, setLoading] = useState(false);
  const [bets, setBets] = useState([]);
  const [fetchingBets, setFetchingBets] = useState(false);

  useEffect(() => {
    if (gameId) {
      loadBets();
    } else {
      setBets([]);
    }
  }, [gameId]);

  const loadBets = async () => {
    setFetchingBets(true);
    try {
      const data = await getActiveBets(gameId);
      setBets(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load bets');
    }
    setFetchingBets(false);
  };

  const getSafeSequences = () => {
    if (!gameId || bets.length === 0) return [];
    
    const allPossible = [];
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 9; j++) {
        allPossible.push([i, j]);
      }
    }

    // Filter out sequences that have been chosen by users
    const safe = allPossible.filter(seq => {
      return !bets.some(bet => bet.numbers[0] === seq[0] && bet.numbers[1] === seq[1]);
    });

    // Shuffle and pick 10
    return safe.sort(() => 0.5 - Math.random()).slice(0, 10);
  };

  const pickSafe = (seq) => {
    setNum1(seq[0].toString());
    setNum2(seq[1].toString());
    toast.success(`Selected safe sequence: ${seq[0]}, ${seq[1]}`);
  };

  const handleDeclare = async (e) => {
    e.preventDefault();
    if (!gameId || num1 === '' || num2 === '') return;
    const result = [Number(num1), Number(num2)];
    
    // Check if this result has winners
    const winnersCount = bets.filter(bet => bet.numbers[0] === result[0] && bet.numbers[1] === result[1]).length;
    const message = winnersCount > 0 
      ? `WARNING: This result has ${winnersCount} winners! Do you want to proceed?`
      : `Safe Result! No winners for ${result.join(', ')}. Proceed?`;

    if (!confirm(message)) return;
    
    setLoading(true);
    try {
      await declareResult(gameId, result);
      toast.success('Result declared and winners paid!');
      setGameId('');
      setNum1('');
      setNum2('');
      setBets([]);
    } catch { toast.error('Failed to declare result'); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-outfit font-bold text-xl text-white">Declare Result (2 Numbers)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 h-fit">
          <form onSubmit={handleDeclare} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Select Game</label>
              <select value={gameId} onChange={e => setGameId(e.target.value)} className="input-dark" required>
                <option value="">-- Choose Game --</option>
                {defaultGames.map(game => (
                  <option key={game.id} value={game.id}>{game.title} ({game.openingTime})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">1st Number</label>
                <input type="number" min="0" max="9" value={num1} onChange={e => setNum1(e.target.value)} placeholder="0-9" className="input-dark" required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">2nd Number</label>
                <input type="number" min="0" max="9" value={num2} onChange={e => setNum2(e.target.value)} placeholder="0-9" className="input-dark" required />
              </div>
            </div>
            <button type="submit" disabled={loading || !gameId} className="btn-neon-red w-full py-3 text-sm disabled:opacity-50">
              {loading ? 'Declaring...' : 'Declare Winning Sequence'}
            </button>
          </form>

          {/* Safe Suggestions UI */}
          {gameId && bets.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Safe Recommendations (0 Liability)</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">{getSafeSequences().length} Found</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {getSafeSequences().map((seq, idx) => (
                  <button
                    key={idx}
                    onClick={() => pickSafe(seq)}
                    className="px-3 py-2 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold transition-all"
                  >
                    {seq[0]}-{seq[1]}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-gray-600 mt-3 italic">* These numbers have 0 bets. Choosing them ensures 100% profit.</p>
            </div>
          )}
        </motion.div>

        {/* Bets List Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Active Bets</h2>
            {gameId && (
              <button onClick={loadBets} className="text-[10px] bg-white/5 px-2 py-1 rounded hover:bg-white/10 transition-colors">Refresh</button>
            )}
          </div>

          {!gameId ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
              Select a game to see user bets
            </div>
          ) : fetchingBets ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : bets.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
              No bets found for this game
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {bets.map((bet) => (
                <div key={bet.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-white font-bold text-sm">{bet.userPhone}</p>
                    <p className="text-[10px] text-gray-500">Entry: ₹{bet.entryFee}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {bet.numbers.map((n, i) => (
                      <span key={i} className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminResults;
