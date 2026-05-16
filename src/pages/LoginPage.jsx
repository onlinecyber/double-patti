import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, login, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/home', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;
    setLoading(true);
    try { await login(identifier, password); navigate('/home', { replace: true }); } catch {}
    setLoading(false);
  };



  const handleForgotPassword = async () => {
    if (!forgotEmail) return;
    try { await resetPassword(forgotEmail); setShowForgot(false); } catch {}
  };

  return (
    <div className="min-h-screen bg-[#06061a] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-brand" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full bg-indigo-600/8 blur-[100px]" />

      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div key={i} className="absolute w-1 h-1 bg-indigo-400/30 rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
      ))}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-[380px]">
        <div className="text-center mb-6 sm:mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-3 shadow-xl shadow-indigo-900/30 border border-white/10">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </motion.div>
          <h1 className="font-outfit font-bold text-xl sm:text-2xl text-white">Welcome Back</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Sign in to continue playing</p>
        </div>

        <div className="glass-card-strong p-5 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="text-[11px] text-gray-400 font-medium mb-1.5 block">Mobile Number</label>
              <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter 10-digit number" className="input-dark" required id="login-identifier" />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 font-medium mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-dark" required id="login-password" autoComplete="current-password" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded bg-white/5 border-white/10 text-indigo-600 focus:ring-indigo-600" />
                <span className="text-[11px] text-gray-400">Remember me</span>
              </label>
              <button type="button" onClick={() => setShowForgot(true)} className="text-[11px] text-indigo-400 active:text-indigo-300 min-h-[44px] flex items-center">Forgot Password?</button>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="btn-neon-brand w-full py-3.5 text-sm disabled:opacity-50" id="login-submit">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing In...</span> : 'Sign In'}
            </motion.button>
          </form>



          <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">Don't have an account? <Link to="/register" className="text-indigo-400 font-semibold active:text-indigo-300">Sign Up</Link></p>
        </div>
      </motion.div>

      {showForgot && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-3 pb-4 sm:pb-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForgot(false)}>
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="glass-card-strong p-5 sm:p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-outfit font-bold text-base sm:text-lg text-white mb-1">Reset Password</h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-4">Enter your email to receive a reset link</p>
            <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" className="input-dark mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowForgot(false)} className="btn-outline flex-1 py-3 text-sm">Cancel</button>
              <button onClick={handleForgotPassword} className="btn-neon-brand flex-1 py-3 text-sm">Send Link</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LoginPage;
