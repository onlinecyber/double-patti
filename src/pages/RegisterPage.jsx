import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ password: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/home', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const update = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); setErrors(prev => ({ ...prev, [field]: '' })); };

  const validate = () => {
    const errs = {};
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Min 6 characters';
    if (!formData.phone.trim()) errs.phone = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.phone)) errs.phone = 'Enter valid 10-digit number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Create a dummy email from phone number for Firebase
      const dummyEmail = `${formData.phone}@dp.com`;
      await register(dummyEmail, formData.password, { 
        name: `User_${formData.phone.slice(-4)}`, 
        phone: formData.phone, 
        referralCode: '' 
      });
      setShowSuccess(true);
      setTimeout(() => navigate('/home', { replace: true }), 2000);
    } catch {}
    setLoading(false);
  };

  const fields = [
    { key: 'phone', label: 'Mobile Number', type: 'tel', placeholder: 'Enter 10-digit number', required: true, autoComplete: 'tel' },
    { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true, autoComplete: 'new-password' },
  ];

  return (
    <div className="min-h-screen bg-[#06061a] flex items-center justify-center px-4 py-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-brand" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-[380px]">
        <div className="text-center mb-5">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-2.5 shadow-xl shadow-indigo-900/30 border border-white/10">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </motion.div>
          <h1 className="font-outfit font-bold text-xl text-white">Create Account</h1>
          <p className="text-gray-500 text-xs mt-1">Join the premium gaming experience</p>
        </div>

        <div className="glass-card-strong p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            {fields.map((field, idx) => (
              <motion.div key={field.key} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}>
                <label className="text-[11px] text-gray-400 font-medium mb-1 block">{field.label}</label>
                <input type={field.type} value={formData[field.key]} onChange={(e) => update(field.key, e.target.value)} placeholder={field.placeholder}
                  className={`input-dark ${errors[field.key] ? 'border-rose-500/50' : ''}`} required={field.required} id={`register-${field.key}`} autoComplete={field.autoComplete} />
                {errors[field.key] && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-400 text-[10px] mt-0.5">{errors[field.key]}</motion.p>}
              </motion.div>
            ))}
            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="btn-neon-brand w-full py-3.5 text-sm mt-1 disabled:opacity-50" id="register-submit">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</span> : 'Create Account'}
            </motion.button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-3.5">Already have an account? <Link to="/login" className="text-indigo-400 font-semibold active:text-indigo-300">Login</Link></p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="glass-card-strong p-6 sm:p-8 text-center max-w-sm mx-4">
              <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-4xl sm:text-5xl mb-3">🎉</motion.div>
              <h3 className="font-outfit font-bold text-lg text-white mb-1.5">Account Created!</h3>
              <p className="text-gray-400 text-xs">Welcome to Double Patti. You've received ₹5 bonus! Redirecting...</p>
              <div className="mt-3 w-full h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2, ease: 'linear' }} className="h-full bg-gradient-to-r from-indigo-600 to-green-500 rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterPage;
