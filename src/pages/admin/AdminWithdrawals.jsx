import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllWithdrawals, approveWithdrawal, rejectWithdrawal } from '../../services/adminService';
import { formatCurrency, formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminWithdrawals = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); setItems(await getAllWithdrawals()); setLoading(false); };

  const handleApprove = async (w) => { await approveWithdrawal(w.id, w.userId, w.amount); toast.success('Withdrawal marked successful'); load(); };
  const handleReject = async (w) => { await rejectWithdrawal(w.id); toast.success('Rejected'); load(); };

  const filtered = filter === 'all' ? items : items.filter(w => w.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-outfit font-bold text-xl text-white mb-4">Withdrawals</h1>
      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'}`}>
            {f === 'approved' ? 'successful' : f}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((w, i) => (
          <motion.div key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white font-semibold text-sm">{w.userName || w.email}</p>
                <p className="text-gray-500 text-[10px]">{formatTime(w.createdAt)}</p>
              </div>
              <span className={`badge-${w.status}`}>{w.status === 'approved' ? 'successful' : w.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-400 font-bold text-lg">{formatCurrency(w.amount)}</p>
                <p className="text-gray-500 text-[10px]">{w.upiId || `A/C: ${w.bankAccount}`}</p>
              </div>
              {w.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(w)} className="px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 text-xs font-semibold">Successful</button>
                  <button onClick={() => handleReject(w)} className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 text-xs font-semibold">Reject</button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <div className="glass-card p-8 text-center"><p className="text-gray-500 text-sm">No withdrawals found</p></div>}
      </div>
    </div>
  );
};

export default AdminWithdrawals;
