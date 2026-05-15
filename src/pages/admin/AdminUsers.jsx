import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllUsers, banUser, updateUserWallet } from '../../services/adminService';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editWallet, setEditWallet] = useState(null);
  const [newBalance, setNewBalance] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleBan = async (userId, ban) => {
    await banUser(userId, ban);
    toast.success(ban ? 'User banned' : 'User unbanned');
    loadUsers();
  };

  const handleWalletUpdate = async () => {
    if (!editWallet || !newBalance) return;
    await updateUserWallet(editWallet, Number(newBalance));
    toast.success('Wallet updated');
    setEditWallet(null);
    setNewBalance('');
    loadUsers();
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-outfit font-bold text-xl text-white mb-4">Users ({users.length})</h1>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-dark mb-4 max-w-sm" />
      <div className="space-y-2">
        {filtered.map((u, i) => (
          <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600/50 to-violet-800/50 flex items-center justify-center text-white font-bold text-xs shrink-0">{u.name?.charAt(0) || 'U'}</div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{u.name}</p>
                <p className="text-gray-500 text-[10px] truncate">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-green-400 font-bold text-xs">{formatCurrency(u.walletBalance || 0)}</span>
              <button onClick={() => { setEditWallet(u.id); setNewBalance(String(u.walletBalance || 0)); }} className="text-[10px] px-2 py-1 rounded bg-white/5 text-gray-400 hover:bg-white/10">Edit ₹</button>
              <button onClick={() => handleBan(u.id, !u.isBanned)} className={`text-[10px] px-2 py-1 rounded ${u.isBanned ? 'bg-green-600/20 text-green-400' : 'bg-rose-600/20 text-rose-400'}`}>
                {u.isBanned ? 'Unban' : 'Ban'}
              </button>
              {u.isBanned && <span className="badge-rejected text-[9px]">Banned</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {editWallet && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="glass-card-strong p-6 max-w-sm w-full">
            <h3 className="font-outfit font-bold text-white mb-3">Edit Wallet Balance</h3>
            <input type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} className="input-dark mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setEditWallet(null)} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
              <button onClick={handleWalletUpdate} className="btn-neon-green flex-1 py-2.5 text-sm">Update</button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminUsers;
