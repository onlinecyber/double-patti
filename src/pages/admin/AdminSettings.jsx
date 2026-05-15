import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAppSettings, updateAppSettings } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    upiId: '',
    qrUrl: '',
    dailyBonus: 5,
    minWithdrawal: 100,
    minDeposit: 50
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getAppSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAppSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-outfit font-bold text-xl text-white mb-6">Platform Settings</h1>
      
      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSave} 
        className="glass-card p-6 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">UPI ID for Deposits</label>
            <input 
              type="text" 
              value={settings.upiId} 
              onChange={e => setSettings({...settings, upiId: e.target.value})}
              className="input-dark"
              placeholder="example@upi"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Daily Bonus (₹)</label>
            <input 
              type="number" 
              value={settings.dailyBonus} 
              onChange={e => setSettings({...settings, dailyBonus: Number(e.target.value)})}
              className="input-dark"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Min. Deposit (₹)</label>
            <input 
              type="number" 
              value={settings.minDeposit} 
              onChange={e => setSettings({...settings, minDeposit: Number(e.target.value)})}
              className="input-dark"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Min. Withdrawal (₹)</label>
            <input 
              type="number" 
              value={settings.minWithdrawal} 
              onChange={e => setSettings({...settings, minWithdrawal: Number(e.target.value)})}
              className="input-dark"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">QR Code Data/URL</label>
          <textarea 
            value={settings.qrUrl} 
            onChange={e => setSettings({...settings, qrUrl: e.target.value})}
            className="input-dark min-h-[100px] py-3"
            placeholder="UPI Payment URL or QR Image URL"
          />
          <p className="text-[10px] text-gray-500">You can use a UPI link like: upi://pay?pa=ID&pn=NAME&cu=INR</p>
        </div>

        <div className="pt-4 border-t border-white/5">
          <button 
            type="submit" 
            disabled={saving}
            className="btn-neon-brand w-full py-3.5 text-sm font-bold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </motion.form>

      <div className="mt-8 glass-card p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <span>🔍</span> Preview Deposit QR
        </h3>
        <div className="flex justify-center bg-white p-4 rounded-2xl w-48 mx-auto">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(settings.qrUrl)}`} 
            alt="QR Preview"
            className="w-40 h-40 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
