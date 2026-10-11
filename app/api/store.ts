export const memoryDb: any = {
  gymProfile: {
    name: 'Iron Temple Fitness',
    branch: 'Indiranagar, Bengaluru',
    phone: '9845012345',
    publicUrl: 'https://rep-flow-gym-operating-system-4o78.vercel.app'
  },
  billingSettings: {
    receiptType: 'GST tax invoice',
    gstin: '29AABCI1234F1Z8',
    taxPercent: 18,
    maxStaffDiscount: 20
  },
  members: [],
  payments: [],
  expenses: [],
  leads: [],
  trainers: [],
  ptAssignments: [],
  plans: [
    { id: 'P1', name: 'Monthly', days: 30, sessions: 'Standard Gym Access', price: 1500 },
    { id: 'P2', name: 'Quarterly', days: 90, sessions: 'Standard Gym Access', price: 4000 },
    { id: 'P3', name: 'Half-yearly', days: 180, sessions: 'Standard Gym Access', price: 7000 },
    { id: 'P4', name: 'Annual', days: 365, sessions: 'Standard Gym Access', price: 12000 }
  ],
  staff: [
    { id: 'S1', name: 'Gym Owner', email: 'owner@gym.com', role: 'Owner', active: true }
  ],
  permissions: {
    'See revenue dashboard': { Owner: true, Trainer: false, Accountant: true },
    'Check in members': { Owner: true, Trainer: true, Accountant: false },
    'Add & edit members': { Owner: true, Trainer: false, Accountant: false },
    'Manage PT sessions': { Owner: true, Trainer: true, Accountant: false },
    'Collect payments': { Owner: true, Trainer: false, Accountant: true },
    'Record expenses': { Owner: true, Trainer: false, Accountant: true }
  },
  auditLog: []
};

export function logAudit(action: string, user: string = 'Owner') {
  const now = new Date();
  const timeStr = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  memoryDb.auditLog.unshift({ action, user, time: timeStr });
}

