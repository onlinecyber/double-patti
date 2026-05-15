import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/deposits', label: 'Deposits', icon: '📥' },
  { path: '/admin/withdrawals', label: 'Withdrawals', icon: '📤' },
  { path: '/admin/games', label: 'Games', icon: '🎮' },
  { path: '/admin/results', label: 'Results', icon: '🎯' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-60 glass-card border-r border-white/5 p-4" style={{ borderRadius: 0 }}>
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-outfit font-bold text-sm text-white">Admin Panel</span>
        </div>
        <nav className="space-y-1 flex-1">
          {menuItems.map(item => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${location.pathname === item.path ? 'bg-indigo-600/15 text-indigo-400 font-semibold' : 'text-gray-400 hover:bg-white/5'}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link to="/home" className="flex items-center gap-2 px-3 py-2.5 text-gray-500 text-sm hover:text-gray-300">
          ← Back to App
        </Link>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5 px-4 py-3 flex items-center justify-between" style={{ borderRadius: 0 }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <span className="font-outfit font-bold text-sm text-white">Admin Panel</span>
        <div className="w-9" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <motion.div initial={{ x: -260 }} animate={{ x: 0 }} className="absolute left-0 top-0 bottom-0 w-60 glass-card-strong p-4" style={{ borderRadius: 0 }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-6 px-2 pt-2">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-outfit font-bold text-sm text-white">Admin</span>
            </div>
            <nav className="space-y-1">
              {menuItems.map(item => (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${location.pathname === item.path ? 'bg-indigo-600/15 text-indigo-400 font-semibold' : 'text-gray-400 hover:bg-white/5'}`}>
                  <span>{item.icon}</span>{item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 mt-14 md:mt-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
