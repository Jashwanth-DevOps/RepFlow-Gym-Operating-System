const express = require('express');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

const DB_FILE = path.join(__dirname, 'repflow_db.json');

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return {};
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    return {};
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function logAudit(db, action, user) {
  if (!db.auditLog) db.auditLog = [];
  const now = new Date();
  const timeStr = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  db.auditLog.unshift({ action, user: user || 'Owner', time: timeStr });
}

app.prepare().then(() => {
  const server = express();
  server.use(express.json());

  server.use((req, res, nextRoute) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    nextRoute();
  });

  server.get('/api/data', (req, res) => res.json(readDB()));

  // AUTH
  server.post('/api/auth/login', (req, res) => {
    const db = readDB();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    let matched = (db.staff || []).find(s => s.email && s.email.trim().toLowerCase() === email);
    if (!matched) {
      const tr = (db.trainers || []).find(t => t.email && t.email.trim().toLowerCase() === email);
      if (tr) matched = { name: tr.name, email: tr.email, password: tr.password, role: 'Trainer' };
    }

    if (!matched) return res.status(401).json({ success: false, message: 'Account not found.' });
    if (matched.password && matched.password !== password) return res.status(401).json({ success: false, message: 'Incorrect password.' });

    logAudit(db, `Logged in`, matched.name);
    writeDB(db);
    res.json({ success: true, user: { name: matched.name, email: matched.email, role: matched.role || 'Owner' } });
  });

  // RESET PASSWORD
  server.post('/api/auth/reset-password', (req, res) => {
    const db = readDB();
    const email = (req.body.email || '').trim().toLowerCase();
    const newPassword = (req.body.newPassword || '').trim();

    let found = false;
    db.staff = (db.staff || []).map(s => {
      if (s.email && s.email.trim().toLowerCase() === email) {
        found = true;
        return { ...s, password: newPassword };
      }
      return s;
    });

    db.trainers = (db.trainers || []).map(t => {
      if (t.email && t.email.trim().toLowerCase() === email) {
        found = true;
        return { ...t, password: newPassword };
      }
      return t;
    });

    if (found) {
      logAudit(db, `Reset password for ${email}`, 'System');
      writeDB(db);
      return res.json({ success: true, message: 'Password reset successfully!' });
    }
    res.status(404).json({ success: false, message: 'Email address not found in system.' });
  });

  // MEMBERS: POST
  server.post('/api/members', (req, res) => {
    const db = readDB();
    if (!db.members) db.members = [];

    const cleanPhone = (req.body.phone || '').replace(/[^0-9]/g, '');
    const duplicate = db.members.find(m => (m.phone || '').replace(/[^0-9]/g, '') === cleanPhone);
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Member with mobile number ${cleanPhone} is already registered (${duplicate.name} - ${duplicate.id}).` });
    }

    const newMember = {
      id: `IT${1000 + db.members.length + 1}`,
      name: req.body.name,
      phone: cleanPhone,
      gender: req.body.gender || 'Male',
      plan: req.body.plan,
      startDate: req.body.startDate,
      expires: req.body.expires,
      status: 'Active',
      dues: Number(req.body.dues || 0)
    };
    db.members.unshift(newMember);
    logAudit(db, `Added member ${newMember.name} (${newMember.id})`, req.body.operator || 'Owner');
    writeDB(db);
    res.json({ success: true, member: newMember });
  });

  // MEMBERS: PUT (Edit Details)
  server.put('/api/members/:id', (req, res) => {
    const db = readDB();
    if (!db.members) db.members = [];
    const idx = db.members.findIndex(m => m.id === req.params.id);
    if (idx !== -1) {
      db.members[idx] = {
        ...db.members[idx],
        name: req.body.name,
        phone: req.body.phone,
        plan: req.body.plan,
        status: req.body.status,
        dues: Number(req.body.dues || 0),
        startDate: req.body.startDate,
        expires: req.body.expires
      };
      logAudit(db, `Updated member details for ${db.members[idx].name}`, req.body.operator || 'Owner');
      writeDB(db);
      return res.json({ success: true, member: db.members[idx] });
    }
    res.status(404).json({ success: false, message: 'Member not found.' });
  });

  // MEMBERS: RENEW MEMBERSHIP
  server.post('/api/members/:id/renew', (req, res) => {
    const db = readDB();
    if (!db.members) db.members = [];
    const idx = db.members.findIndex(m => m.id === req.params.id);
    if (idx !== -1) {
      const current = db.members[idx];
      db.members[idx] = {
        ...current,
        plan: req.body.plan || current.plan,
        status: 'Active',
        startDate: req.body.startDate || new Date().toISOString().split('T')[0],
        expires: req.body.endDate,
        dues: Number(req.body.dues || 0)
      };

      if (Number(req.body.amount || 0) > 0) {
        if (!db.payments) db.payments = [];
        const newP = {
          receipt: `RCPT-${Math.floor(1000 + Math.random() * 9000)}`,
          member: current.name,
          phone: current.phone,
          amount: Number(req.body.amount),
          method: req.body.method || 'UPI',
          plan: req.body.plan,
          note: 'Membership Renewal',
          date: new Date().toISOString().split('T')[0],
          operator: req.body.operator || 'Owner'
        };
        db.payments.unshift(newP);
      }

      logAudit(db, `Renewed membership for ${current.name} (${current.id})`, req.body.operator || 'Owner');
      writeDB(db);
      return res.json({ success: true, member: db.members[idx] });
    }
    res.status(404).json({ success: false, message: 'Member not found.' });
  });

  // LEADS: POST & PATCH
  server.post('/api/leads', (req, res) => {
    const db = readDB();
    if (!db.leads) db.leads = [];
    const newLead = {
      id: `L${db.leads.length + 1}`,
      name: req.body.name,
      phone: req.body.phone,
      source: req.body.source || 'Walk-in',
      stage: req.body.stage || 'New',
      followUp: req.body.followUp || new Date().toISOString().split('T')[0],
      plan: req.body.plan || 'Monthly',
      note: req.body.note || ''
    };
    db.leads.unshift(newLead);
    logAudit(db, `Added lead ${newLead.name}`, req.body.operator || 'Owner');
    writeDB(db);
    res.json({ success: true, lead: newLead });
  });

  server.patch('/api/leads/:id/stage', (req, res) => {
    const db = readDB();
    if (!db.leads) db.leads = [];
    db.leads = db.leads.map(l => l.id === req.params.id ? { ...l, stage: req.body.stage } : l);
    logAudit(db, `Moved lead status to ${req.body.stage}`, req.body.operator || 'Owner');
    writeDB(db);
    res.json({ success: true });
  });

  // TRAINERS: POST & PUT
  server.post('/api/trainers', (req, res) => {
    const db = readDB();
    if (!db.trainers) db.trainers = [];
    const newTr = {
      id: `TR${db.trainers.length + 1}`,
      name: req.body.name,
      email: (req.body.email || '').trim().toLowerCase(),
      password: req.body.password || 'password123',
      phone: req.body.phone,
      specialty: req.body.specialty || 'General Fitness',
      rating: 5.0,
      clients: 0,
      sessions: 0,
      sold: 0,
      commission: 0
    };
    db.trainers.push(newTr);

    if (!db.staff) db.staff = [];
    db.staff.push({ id: `S${db.staff.length + 1}`, name: newTr.name, email: newTr.email, password: newTr.password, role: 'Trainer', active: true });
    logAudit(db, `Created trainer ${newTr.name}`, 'Owner');
    writeDB(db);
    res.json({ success: true, trainer: newTr });
  });

  server.put('/api/trainers/:id', (req, res) => {
    const db = readDB();
    if (!db.trainers) db.trainers = [];
    const idx = db.trainers.findIndex(t => t.id === req.params.id);
    if (idx !== -1) {
      db.trainers[idx] = {
        ...db.trainers[idx],
        name: req.body.name,
        email: (req.body.email || '').trim().toLowerCase(),
        password: req.body.password || db.trainers[idx].password,
        phone: req.body.phone,
        specialty: req.body.specialty
      };
      logAudit(db, `Updated trainer ${db.trainers[idx].name}`, 'Owner');
      writeDB(db);
      return res.json({ success: true, trainer: db.trainers[idx] });
    }
    res.status(404).json({ success: false, message: 'Trainer not found' });
  });

  // ASSIGN PT
  server.post('/api/pt-assign', (req, res) => {
    const db = readDB();
    if (!db.ptAssignments) db.ptAssignments = [];
    const newPt = {
      id: `PT${db.ptAssignments.length + 1}`,
      trainer: req.body.trainer,
      member: req.body.member,
      sessions: Number(req.body.sessions || 12),
      price: Number(req.body.price || 0),
      startDate: req.body.startDate,
      endDate: req.body.endDate
    };
    db.ptAssignments.unshift(newPt);

    db.trainers = (db.trainers || []).map(tr => {
      if (tr.name === req.body.trainer) {
        return {
          ...tr,
          clients: (tr.clients || 0) + 1,
          sessions: (tr.sessions || 0) + Number(req.body.sessions || 12),
          sold: (tr.sold || 0) + Number(req.body.price || 0),
          commission: (tr.commission || 0) + (Number(req.body.price || 0) * 0.15)
        };
      }
      return tr;
    });

    logAudit(db, `Assigned ${newPt.sessions} PT sessions to ${newPt.member}`, req.body.operator || 'Owner');
    writeDB(db);
    res.json({ success: true, pt: newPt });
  });

  server.put('/api/pt-assign/:id', (req, res) => {
    const db = readDB();
    if (!db.ptAssignments) db.ptAssignments = [];
    const idx = db.ptAssignments.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      db.ptAssignments[idx] = {
        ...db.ptAssignments[idx],
        member: req.body.member || db.ptAssignments[idx].member,
        trainer: req.body.trainer || db.ptAssignments[idx].trainer,
        sessions: Number(req.body.sessions || db.ptAssignments[idx].sessions),
        price: Number(req.body.price || db.ptAssignments[idx].price),
        startDate: req.body.startDate || db.ptAssignments[idx].startDate,
        endDate: req.body.endDate || db.ptAssignments[idx].endDate
      };
      logAudit(db, `Updated PT assignment ${db.ptAssignments[idx].id} for ${db.ptAssignments[idx].member}`, req.body.operator || 'Owner');
      writeDB(db);
      return res.json({ success: true, pt: db.ptAssignments[idx] });
    }
    res.status(404).json({ success: false, message: 'PT assignment not found' });
  });

  // COMPLETE PT SESSION (Reduces sessions remaining by 1)
  server.post('/api/pt-assign/:id/complete-session', (req, res) => {
    const db = readDB();
    if (!db.ptAssignments) db.ptAssignments = [];
    const idx = db.ptAssignments.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      if (db.ptAssignments[idx].sessions > 0) {
        db.ptAssignments[idx].sessions = Math.max(0, db.ptAssignments[idx].sessions - 1);
        logAudit(db, `Completed 1 session for ${db.ptAssignments[idx].member} (${db.ptAssignments[idx].sessions} remaining)`, req.body.operator || 'Trainer');
        writeDB(db);
        return res.json({ success: true, pt: db.ptAssignments[idx] });
      } else {
        return res.status(400).json({ success: false, message: 'No sessions remaining in package.' });
      }
    }
    res.status(404).json({ success: false, message: 'PT assignment not found' });
  });

  // PAYMENTS: POST
  server.post('/api/payments', (req, res) => {
    const db = readDB();
    if (!db.payments) db.payments = [];
    const newP = {
      receipt: `RCPT-${Math.floor(1000 + Math.random() * 9000)}`,
      member: req.body.member,
      phone: req.body.phone,
      amount: Number(req.body.amount || 0),
      method: req.body.method || 'UPI',
      plan: req.body.plan || 'Membership',
      note: req.body.note || '',
      date: new Date().toISOString().split('T')[0],
      operator: req.body.operator || 'Owner'
    };
    db.payments.unshift(newP);
    logAudit(db, `Recorded payment ${newP.amount} (${newP.receipt}) for ${newP.member}`, newP.operator);
    writeDB(db);
    res.json({ success: true, payment: newP });
  });

  // EXPENSES: POST & DELETE
  server.post('/api/expenses', (req, res) => {
    const db = readDB();
    if (!db.expenses) db.expenses = [];
    const newExp = {
      id: `E${db.expenses.length + 1}`,
      category: req.body.category,
      paidTo: req.body.paidTo,
      amount: Number(req.body.amount || 0),
      method: req.body.method || 'UPI',
      date: req.body.date || new Date().toISOString().split('T')[0]
    };
    db.expenses.unshift(newExp);
    logAudit(db, `Added expense ${newExp.amount} for ${newExp.category}`, 'Owner');
    writeDB(db);
    res.json({ success: true, expense: newExp });
  });

  server.delete('/api/expenses/:id', (req, res) => {
    const db = readDB();
    if (!db.expenses) db.expenses = [];
    db.expenses = db.expenses.filter(e => e.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  // PLANS: POST & DELETE
  server.post('/api/plans', (req, res) => {
    const db = readDB();
    if (!db.plans) db.plans = [];
    const newPlan = {
      id: `P${db.plans.length + 1}`,
      name: req.body.name,
      days: Number(req.body.days || 30),
      sessions: req.body.sessions || 'Standard Gym Access',
      price: Number(req.body.price || 1500)
    };
    db.plans.push(newPlan);
    logAudit(db, `Created plan ${newPlan.name} (${newPlan.price})`, 'Owner');
    writeDB(db);
    res.json({ success: true, plan: newPlan });
  });

  server.delete('/api/plans/:id', (req, res) => {
    const db = readDB();
    if (!db.plans) db.plans = [];
    db.plans = db.plans.filter(p => p.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  // SETTINGS
  server.post('/api/settings/profile', (req, res) => {
    const db = readDB();
    db.gymProfile = { ...db.gymProfile, ...req.body };
    logAudit(db, `Updated gym profile`, 'Owner');
    writeDB(db);
    res.json({ success: true, gymProfile: db.gymProfile });
  });

  server.post('/api/settings/billing', (req, res) => {
    const db = readDB();
    db.billingSettings = { ...db.billingSettings, ...req.body };
    logAudit(db, `Updated billing settings`, 'Owner');
    writeDB(db);
    res.json({ success: true, billingSettings: db.billingSettings });
  });

  // PERMISSIONS
  server.post('/api/permissions', (req, res) => {
    const db = readDB();
    if (!db.permissions) db.permissions = {};
    if (!db.permissions[req.body.action]) db.permissions[req.body.action] = {};
    db.permissions[req.body.action][req.body.role] = req.body.value;
    logAudit(db, `Updated permission '${req.body.action}' for ${req.body.role}`, 'Owner');
    writeDB(db);
    res.json({ success: true });
  });

  server.all('*', (req, res) => handle(req, res));

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> RepFlow Engine running on http://localhost:${port}`);
  });
});