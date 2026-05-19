import {
  collection, doc, getDocs, getDoc, updateDoc, query,
  where, orderBy, serverTimestamp, deleteDoc, setDoc, increment, writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ===== USERS =====
export const getAllUsers = async () => {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const banUser = async (userId, ban = true) => {
  await updateDoc(doc(db, 'users', userId), { isBanned: ban });
};

export const updateUserWallet = async (userId, amount) => {
  await updateDoc(doc(db, 'users', userId), { walletBalance: amount });
};

// ===== DEPOSITS =====
export const getPendingDeposits = async () => {
  const q = query(collection(db, 'deposits'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllDeposits = async () => {
  const snap = await getDocs(query(collection(db, 'deposits'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const approveDeposit = async (depositId, userId, amount) => {
  const batch = writeBatch(db);
  
  batch.update(doc(db, 'deposits', depositId), {
    status: 'approved',
    processedAt: serverTimestamp(),
  });
  
  batch.update(doc(db, 'users', userId), {
    walletBalance: increment(amount),
  });

  // Add credit transaction
  const transactionRef = doc(collection(db, 'wallet'));
  batch.set(transactionRef, {
    userId: userId,
    type: 'credit',
    amount: amount,
    description: 'Deposit Approved',
    createdAt: serverTimestamp(),
  });

  await batch.commit();
};

export const rejectDeposit = async (depositId) => {
  await updateDoc(doc(db, 'deposits', depositId), {
    status: 'rejected',
    processedAt: serverTimestamp(),
  });
};

// ===== WITHDRAWALS =====
export const getPendingWithdrawals = async () => {
  const q = query(collection(db, 'withdrawals'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllWithdrawals = async () => {
  const snap = await getDocs(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const approveWithdrawal = async (withdrawalId, userId, amount) => {
  // Balance was already deducted when request was made.
  // This just updates the status.
  await updateDoc(doc(db, 'withdrawals', withdrawalId), {
    status: 'approved',
    processedAt: serverTimestamp(),
  });
};

export const rejectWithdrawal = async (withdrawalId) => {
  const withdrawalRef = doc(db, 'withdrawals', withdrawalId);
  const snap = await getDoc(withdrawalRef);
  if (!snap.exists()) return;
  const data = snap.data();
  if (data.status !== 'pending') return;

  const batch = writeBatch(db);
  
  // Update status
  batch.update(withdrawalRef, {
    status: 'rejected',
    processedAt: serverTimestamp(),
  });

  // Refund user
  const userRef = doc(db, 'users', data.userId);
  batch.update(userRef, {
    walletBalance: increment(data.amount)
  });

  // Add credit transaction
  const transactionRef = doc(collection(db, 'wallet'));
  batch.set(transactionRef, {
    userId: data.userId,
    type: 'credit',
    amount: data.amount,
    description: 'Withdrawal Rejected (Refund)',
    createdAt: serverTimestamp(),
  });

  await batch.commit();
};

export const getActiveBets = async (gameId) => {
  const q = query(
    collection(db, 'activeBets'),
    where('gameId', '==', gameId),
    where('status', '==', 'waiting')
  );
  const snap = await getDocs(q);
  const bets = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Sort in memory to avoid composite index requirement
  const sortedBets = bets.sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  });

  // Fetch phone numbers for each user in the bets
  const betsWithUser = await Promise.all(sortedBets.map(async (bet) => {
    const userSnap = await getDoc(doc(db, 'users', bet.userId));
    return { ...bet, userPhone: userSnap.exists() ? userSnap.data().phone : 'Unknown' };
  }));

  return betsWithUser;
};

// ===== GAMES =====
export const createGame = async (gameData) => {
  const id = 'game_' + Date.now();
  await setDoc(doc(db, 'games', id), {
    ...gameData,
    status: 'open',
    winningNumber: null,
    createdAt: serverTimestamp(),
  });
  return id;
};

export const declareResult = async (gameId, winningNumbers) => {
  // winningNumbers is an array [num1, num2]
  try {
    await setDoc(doc(db, 'games', gameId), {
      winningNumbers,
      status: 'completed',
      declaredAt: serverTimestamp()
    }, { merge: true });

    // Archive the declared result in gameResults collection
    const historyRef = doc(collection(db, 'gameResults'));
    await setDoc(historyRef, {
      gameId,
      winningNumbers,
      declaredAt: serverTimestamp(),
      dateStr: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    });
  } catch (e) {
    console.error("Error setting game result:", e);
  }

  const q = query(
    collection(db, 'activeBets'),
    where('gameId', '==', gameId),
    where('status', '==', 'waiting')
  );
  const snap = await getDocs(q);

  if (snap.empty) return;

  const batch = writeBatch(db);

  snap.docs.forEach(betDoc => {
    const bet = betDoc.data();
    
    // Strict Match: Both numbers must match in the EXACT SAME ORDER
    const isWin = Array.isArray(bet.numbers) && 
                  bet.numbers.length === 2 && 
                  bet.numbers[0] === winningNumbers[0] && 
                  bet.numbers[1] === winningNumbers[1];

    let prize = 0;
    if (isWin) {
      if (bet.entryFee === 10) prize = 20000;
      else if (bet.entryFee === 20) prize = 50000;
      else if (bet.entryFee === 50) prize = 150000;
      else if (bet.entryFee === 100) prize = 500000;
      else prize = bet.entryFee * 100; // Default 100x
    }

    batch.update(betDoc.ref, {
      status: isWin ? 'won' : 'lost',
      prize,
      winningNumbers // Storing the 2-number result
    });

    if (isWin) {
      const userRef = doc(db, 'users', bet.userId);
      batch.update(userRef, {
        walletBalance: increment(prize),
        totalWins: increment(1)
      });

      const walletRef = doc(collection(db, 'wallet'));
      batch.set(walletRef, {
        userId: bet.userId,
        type: 'credit',
        amount: prize,
        description: `Won ${bet.gameTitle} (Exact Match)`,
        createdAt: serverTimestamp(),
      });
    } else {
      const userRef = doc(db, 'users', bet.userId);
      batch.update(userRef, { totalLosses: increment(1) });
    }
  });

  await batch.commit();
};

export const getAnalytics = async () => {
  const users = await getDocs(collection(db, 'users'));
  const deposits = await getDocs(collection(db, 'deposits'));
  const withdrawals = await getDocs(collection(db, 'withdrawals'));
  const games = await getDocs(collection(db, 'games'));

  let totalDeposits = 0;
  let totalWithdrawals = 0;
  let todayDeposits = 0;
  
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  deposits.docs.forEach(d => {
    const data = d.data();
    if (data.status === 'approved') {
      totalDeposits += data.amount;
      
      // Check if it was created today
      const createdAt = data.createdAt?.toDate();
      if (createdAt && createdAt >= startOfToday) {
        todayDeposits += data.amount;
      }
    }
  });

  withdrawals.docs.forEach(d => {
    if (d.data().status === 'approved') totalWithdrawals += d.data().amount;
  });

  return {
    totalUsers: users.size,
    totalGames: games.size,
    totalDeposits,
    todayDeposits, // New field
    totalWithdrawals,
    revenue: totalDeposits - totalWithdrawals,
    pendingDeposits: deposits.docs.filter(d => d.data().status === 'pending').length,
    pendingWithdrawals: withdrawals.docs.filter(d => d.data().status === 'pending').length,
  };
};

// ===== SETTINGS =====
export const getAppSettings = async () => {
  const docSnap = await getDoc(doc(db, 'config', 'settings'));
  if (docSnap.exists()) return docSnap.data();
  return {
    upiId: '8406884196@ptaxis',
    qrUrl: 'upi://pay?pa=8406884196@ptaxis&pn=DoublePatti&cu=INR',
    dailyBonus: 5,
    minWithdrawal: 100,
    minDeposit: 50
  };
};

export const updateAppSettings = async (settings) => {
  await setDoc(doc(db, 'config', 'settings'), settings, { merge: true });
};
