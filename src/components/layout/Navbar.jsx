import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/helpers';

const Navbar = () => {
  const { balance } = useWallet();
  const { userData } = useAuth();
  const location = useLocation();

  const hideOn = ['/', '/login', '/register'];
  if (hideOn.includes(location.pathname)) return null;

  return (
    <motion.nav
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 safe-top"
      style={{ background: 'rgba(6,6,26,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-indigo-900/30">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-outfit font-bold text-base sm:text-lg text-white hidden xs:block">
            Double <span className="text-indigo-400">Patti</span>
          </span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wallet Badge */}
          <Link to="/deposit" className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(255,255,255,0.02))', border: '1px solid rgba(99,102,241,0.2)' }}>
            <span className="text-[9px] sm:text-[10px] text-amber-400 font-semibold">₹</span>
            <motion.span
              key={balance}
              initial={{ scale: 1.15, color: '#fbbf24' }}
              animate={{ scale: 1, color: '#f0f0ff' }}
              className="font-bold text-xs sm:text-sm"
            >
              {balance.toLocaleString('en-IN')}
            </motion.span>
          </Link>

          {/* Notification */}
          <button className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 flex items-center justify-center active:bg-white/10 transition-colors">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          </button>

          {/* Profile */}
          <Link to="/profile" className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-600/30 to-violet-700/30 border border-indigo-500/20 flex items-center justify-center overflow-hidden shrink-0">
            {userData?.photoURL ? (
              <img src={userData.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-indigo-300 font-bold text-xs sm:text-sm">
                {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
