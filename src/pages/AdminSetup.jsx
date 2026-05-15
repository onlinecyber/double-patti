import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminSetup = () => {
  const { user, refreshUserData, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAdmin) {
      toast.success('You are already an admin!');
      setTimeout(() => navigate('/admin'), 2000);
    }
  }, [isAdmin, navigate]);

  const handlePromote = async () => {
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    if (password !== 'admin786') {
      toast.error('Incorrect setup password');
      return;
    }

    if (userData?.phone !== '7369072024') {
      toast.error('Unauthorized: This account cannot be promoted to admin.');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { role: 'admin' });
      await refreshUserData();
      toast.success('Success! You are now an admin.');
      setTimeout(() => navigate('/admin'), 2000);
    } catch (error) {
      toast.error('Failed to promote user: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#06061a] flex items-center justify-center p-4">
      <div className="glass-card-strong p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Admin Access Setup</h1>
        <p className="text-gray-400 mb-6 text-sm">
          Enter the secret setup password to grant admin permissions to your account ({user?.email}).
        </p>
        <div className="mb-4">
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter Setup Password" 
            className="input-dark text-center"
          />
        </div>
        <button
          onClick={handlePromote}
          disabled={loading || isAdmin}
          className="btn-neon-brand w-full py-3 disabled:opacity-50"
        >
          {loading ? 'Processing...' : isAdmin ? 'Already Admin' : 'Grant Admin Access'}
        </button>
      </div>
    </div>
  );
};

export default AdminSetup;
