import { useState } from 'react';
import { motion } from 'framer-motion';
import { createGame } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminGames = () => {
  const [form, setForm] = useState({ title: '', entryFee: '', prizePool: '', openingTime: '', closingTime: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.entryFee) return;
    setLoading(true);
    try {
      await createGame({
        title: form.title,
        entryFee: Number(form.entryFee),
        prizePool: Number(form.prizePool) || Number(form.entryFee) * 100,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
      });
      toast.success('Game created!');
      setForm({ title: '', entryFee: '', prizePool: '', openingTime: '', closingTime: '' });
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="font-outfit font-bold text-xl text-white mb-6">Create Game</h1>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Game Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Double Patti" className="input-dark" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Entry Fee (₹)</label>
              <input type="number" value={form.entryFee} onChange={e => setForm({ ...form, entryFee: e.target.value })} placeholder="50" className="input-dark" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Prize Pool (₹)</label>
              <input type="number" value={form.prizePool} onChange={e => setForm({ ...form, prizePool: e.target.value })} placeholder="5000" className="input-dark" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Opening Time</label>
              <input value={form.openingTime} onChange={e => setForm({ ...form, openingTime: e.target.value })} placeholder="10:00 AM" className="input-dark" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Closing Time</label>
              <input value={form.closingTime} onChange={e => setForm({ ...form, closingTime: e.target.value })} placeholder="10:00 PM" className="input-dark" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-neon-red w-full py-3 text-sm disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Game'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminGames;
