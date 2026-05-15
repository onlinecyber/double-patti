import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllDeposits, approveDeposit, rejectDeposit } from '../../services/adminService';
import { formatCurrency, formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); setDeposits(await getAllDeposits()); setLoading(false); };

  const handleApprove = async (d) => {
    await approveDeposit(d.id, d.userId, d.amount);
    toast.success('Deposit approved');
    load();
  };

  const handleReject = async (d) => {
    await rejectDeposit(d.id);
    toast.success('Deposit rejected');
    load();
  };

  const filtered = filter === 'all' ? deposits : deposits.filter(d => d.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-outfit font-bold text-xl text-white mb-4">Deposits</h1>
      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'}`}>{f}</button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white font-semibold text-sm">{d.userName || d.email}</p>
                <p className="text-gray-500 text-[10px]">{formatTime(d.createdAt)}</p>
              </div>
              <span className={`badge-${d.status}`}>{d.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 font-bold text-lg">{formatCurrency(d.amount)}</p>
                {d.transactionId && <p className="text-gray-500 text-[10px]">UTR: {d.transactionId}</p>}
              </div>
              {d.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(d)} className="px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 text-xs font-semibold hover:bg-green-600/30">Approve</button>
                  <button onClick={() => handleReject(d)} className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 text-xs font-semibold hover:bg-rose-600/30">Reject</button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <div className="glass-card p-8 text-center"><p className="text-gray-500 text-sm">No deposits found</p></div>}
      </div>
    </div>
  );
};

export default AdminDeposits;
