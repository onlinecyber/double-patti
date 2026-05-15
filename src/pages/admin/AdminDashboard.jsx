import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAnalytics } from '../../services/adminService';
import { formatCurrency } from '../../utils/helpers';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const data = await getAnalytics(); setStats(data); }
      catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const cards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-600/20 to-blue-800/10' },
    { label: 'Total Deposits', value: formatCurrency(stats.totalDeposits), icon: '📥', color: 'from-green-600/20 to-green-800/10' },
    { label: 'Total Withdrawals', value: formatCurrency(stats.totalWithdrawals), icon: '📤', color: 'from-amber-600/20 to-amber-800/10' },
    { label: 'Revenue', value: formatCurrency(stats.revenue), icon: '💰', color: 'from-yellow-600/20 to-yellow-800/10' },
    { label: 'Total Games', value: stats.totalGames, icon: '🎮', color: 'from-purple-600/20 to-purple-800/10' },
    { label: 'Pending Deposits', value: stats.pendingDeposits, icon: '⏳', color: 'from-amber-600/20 to-amber-800/10' },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <h1 className="font-outfit font-bold text-xl text-white mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`glass-card p-5 bg-gradient-to-br ${card.color}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="font-outfit font-black text-2xl text-white mb-1">{card.value}</p>
            <p className="text-gray-400 text-xs uppercase tracking-wider">{card.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
