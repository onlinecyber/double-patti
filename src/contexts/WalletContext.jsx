import { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, increment, addDoc, collection, serverTimestamp, query, where, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WalletContext = createContext(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};

export const WalletProvider = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time wallet listener
  useEffect(() => {
    if (!user) {
      setBalance(0);
      setTransactions([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setBalance(docSnap.data().walletBalance || 0);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Wallet listener error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const deductBalance = async (amount, description = 'Game entry') => {
    if (!user) return false;
    if (balance < amount) {
      toast.error('Insufficient balance!');
      return false;
    }
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        walletBalance: increment(-amount),
      });
      await addDoc(collection(db, 'wallet'), {
        userId: user.uid,
        type: 'debit',
        amount: amount,
        description,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      toast.error('Transaction failed');
      return false;
    }
  };

  const addBalance = async (amount, description = 'Game winnings') => {
    if (!user) return false;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        walletBalance: increment(amount),
      });
      await addDoc(collection(db, 'wallet'), {
        userId: user.uid,
        type: 'credit',
        amount: amount,
        description,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      toast.error('Transaction failed');
      return false;
    }
  };

  const createDepositRequest = async (amount, transactionId = '') => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'deposits'), {
        userId: user.uid,
        userName: user.displayName || 'User',
        email: user.email,
        amount: Number(amount),
        transactionId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast.success('Deposit request submitted!');
    } catch (error) {
      toast.error('Failed to submit deposit');
      throw error;
    }
  };

  const createWithdrawalRequest = async (amount, bankDetails) => {
    if (!user) return;
    if (balance < amount) {
      toast.error('Insufficient balance!');
      return;
    }
    if (amount < 100) {
      toast.error('Minimum withdrawal is ₹100');
      return;
    }

    try {
      const batch = writeBatch(db);
      
      // Create withdrawal request
      const withdrawalRef = doc(collection(db, 'withdrawals'));
      batch.set(withdrawalRef, {
        userId: user.uid,
        userName: user.displayName || 'User',
        email: user.email,
        amount: Number(amount),
        upiId: bankDetails.upiId || '',
        bankAccount: bankDetails.bankAccount || '',
        ifsc: bankDetails.ifsc || '',
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Deduct from user wallet immediately
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        walletBalance: increment(-amount)
      });

      // Add wallet transaction
      const transactionRef = doc(collection(db, 'wallet'));
      batch.set(transactionRef, {
        userId: user.uid,
        type: 'debit',
        amount: amount,
        description: 'Withdrawal Request',
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      toast.success('Withdrawal request submitted!');
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to submit withdrawal');
      throw error;
    }
  };

  const getDepositHistory = async () => {
    if (!user) return [];
    try {
      const q = query(
        collection(db, 'deposits'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      return [];
    }
  };

  const getWithdrawalHistory = async () => {
    if (!user) return [];
    try {
      const q = query(
        collection(db, 'withdrawals'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      return [];
    }
  };

  const value = {
    balance,
    transactions,
    loading,
    deductBalance,
    addBalance,
    createDepositRequest,
    createWithdrawalRequest,
    getDepositHistory,
    getWithdrawalHistory,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
