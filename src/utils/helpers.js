// Utility helpers for Double Patti

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRandomName = () => {
  const names = [
    'Rahul K.', 'Priya S.', 'Amit J.', 'Sneha R.', 'Vikram P.',
    'Anjali M.', 'Rajesh D.', 'Pooja T.', 'Suresh B.', 'Meera L.',
    'Karan G.', 'Neha V.', 'Arun K.', 'Divya S.', 'Rohit M.',
    'Sunita P.', 'Manoj R.', 'Kavita D.', 'Sanjay T.', 'Ritu B.',
  ];
  return names[Math.floor(Math.random() * names.length)];
};

export const getRandomAmount = () => {
  const amounts = [50000, 150000, 500000];
  return amounts[Math.floor(Math.random() * amounts.length)];
};

export const generateFakeWinners = (count = 10) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: getRandomName(),
    amount: getRandomAmount(),
    game: 'Double Patti',
  }));
};

export const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  return name.slice(0, 2) + '***@' + domain;
};

export const maskPhone = (phone) => {
  if (!phone) return '';
  return phone.slice(0, 3) + '****' + phone.slice(-3);
};
