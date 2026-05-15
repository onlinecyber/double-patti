import { useState } from 'react';
import { motion } from 'framer-motion';
import { declareResult } from '../../services/adminService';
import { defaultGames } from '../../services/gameService';
import toast from 'react-hot-toast';

const AdminResults = () => {
  const [gameId, setGameId] = useState('');
  const [winningNumber, setWinningNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeclare = async (e) => {
    e.preventDefault();
    if (!gameId || !winningNumber) return;
    setLoading(true);
    try {
      await declareResult(gameId, Number(winningNumber));
      toast.success('Result declared!');
      setGameId('');
      setWinningNumber('');
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="font-outfit font-bold text-xl text-white mb-6">Declare Result</h1>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 max-w-lg">
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
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Winning Number</label>
            <input type="number" value={winningNumber} onChange={e => setWinningNumber(e.target.value)} placeholder="0-9" className="input-dark" required />
          </div>
          <button type="submit" disabled={loading} className="btn-neon-red w-full py-3 text-sm disabled:opacity-50">
            {loading ? 'Declaring...' : 'Declare Result'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminResults;
