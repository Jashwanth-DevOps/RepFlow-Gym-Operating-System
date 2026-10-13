"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, UserPlus, Dumbbell, Wallet, CreditCard, 
  ShoppingBag, TrendingDown, RefreshCcw, MessageSquare, BarChart2, 
  ShieldCheck, Settings, Search, Sun, Moon, Plus, CheckCircle2,
  Lock, X, Send, MoreVertical, Edit3, Check, QrCode, Star, Menu, Eye, EyeOff,
  ChevronDown, Phone, PauseCircle, UserX, AlertTriangle, ArrowRight, Download, Share2,
  Calendar, FileText, Trash2, Printer, CheckSquare, MessageCircle, HelpCircle,
  Zap, AlertCircle
} from 'lucide-react';
import { translations } from './translations';

export default function RepFlowApp() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'en' | 'te'>('en');
  const t = translations[lang];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = new Date();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // 3-minute inactivity auto-lock session timer
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    const IDLE_LIMIT = 3 * 60 * 1000; // 3 minutes

    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsAuthenticated(false);
      }, IDLE_LIMIT);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, []);
  const [activeUser, setActiveUser] = useState<any>({ name: 'Gym Owner', role: 'Owner', email: 'owner@gym.com' });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Password Reset
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showResetPasswordEye, setShowResetPasswordEye] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  // Navigation & Data
  const [currentTab, setCurrentTab] = useState('commandCenter');
  const [dbData, setDbData] = useState<any>(null);

  // Top "+ New" Dropdown
  const [showNewDropdown, setShowNewDropdown] = useState(false);

  // Search & Filters
  const [memberFilter, setMemberFilter] = useState('All');
  const [memberSearch, setMemberSearch] = useState('');
  const [trainerSearch, setTrainerSearch] = useState('');

  // Graph Hover Interactive States
  const [hoveredCommandBar, setHoveredCommandBar] = useState<any>(null);
  const [hoveredReportBar, setHoveredReportBar] = useState<any>(null);
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<string | null>(null);

  // Natural Language Search
  const [aiQuery, setAiQuery] = useState('');
  const [aiQueryResult, setAiQueryResult] = useState<any>(null);

  // Expenses Date Filter
  const [expenseStartDate, setExpenseStartDate] = useState('');
  const [expenseEndDate, setExpenseEndDate] = useState('');

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState<any>(null);
  const [showRenewModal, setShowRenewModal] = useState<any>(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [showEditTrainerModal, setShowEditTrainerModal] = useState<any>(null);
  const [showEditTrainerPasswordEye, setShowEditTrainerPasswordEye] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showAddPTModal, setShowAddPTModal] = useState(false);
  const [showEditPTModal, setShowEditPTModal] = useState<any>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [receiptSuccess, setReceiptSuccess] = useState<any>(null);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<any>(null);
  const [createdMemberCard, setCreatedMemberCard] = useState<any>(null);
  const [assignedPTSuccessCard, setAssignedPTSuccessCard] = useState<any>(null);

  // Subtabs
  const [staffSubTab, setStaffSubTab] = useState<'Team' | 'Permissions' | 'Audit'>('Team');
  const [settingsSubTab, setSettingsSubTab] = useState<'plans' | 'billing' | 'profile'>('plans');

  // Messages Broadcast & Cohort Selection
  const [broadcastTarget, setBroadcastTarget] = useState('All Members');
  const [broadcastMessage, setBroadcastMessage] = useState('Hi {name}, your membership at Iron Temple Fitness is expiring soon. Renew today to maintain your workout streak!');

  // Retention
  const [retentionScript, setRetentionScript] = useState('Hi {name}, we noticed you haven\'t visited in a while! Your coach has customized workouts ready for you.');
  const [retentionDoneCount, setRetentionDoneCount] = useState(0);

  // Form helpers
  const [showAddTrainerPassword, setShowAddTrainerPassword] = useState(false);
  const [ptMemberSearch, setPtMemberSearch] = useState('');
  const [editPtMemberSearch, setEditPtMemberSearch] = useState('');
  const [payMemberSearch, setPayMemberSearch] = useState('');

  // Front Desk Check-in Records
    const [checkInInput, setCheckInInput] = useState('');
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterCheckInDate, setFilterCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchNeonRecords = async () => {
      try {
        const res = await fetch('/api/data?t=' + Date.now(), {
          cache: 'no-store',
          headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
        });
        if (res.ok) {
          const json = await res.json();
          if (json && json.members) {
            setDbData((prev: any) => ({
              ...prev,
              ...json,
              members: Array.isArray(json.members) ? json.members : (prev?.members || []),
              leads: Array.isArray(json.leads) ? json.leads : (prev?.leads || []),
              trainers: Array.isArray(json.trainers) ? json.trainers : (prev?.trainers || []),
              payments: Array.isArray(json.payments) ? json.payments : (prev?.payments || [])
            }));
          }
        }
      } catch (e) {
        console.error('Data sync error:', e);
      }
    };
    fetchNeonRecords();
  }, []);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const [checkInNotice, setCheckInNotice] = useState<any>(null);

  // Forms
  const [payForm, setPayForm] = useState({ member: '', phone: '', amount: '', method: 'UPI', category: 'Membership', note: '' });
  const [activeLeadDropdown, setActiveLeadDropdown] = useState<string | null>(null);

  // Date format helper: DD-MM-YYYY
  const formatDDMMYYYY = (dateVal: any) => {
    if (!dateVal) return '--';
    const str = String(dateVal).split('T')[0];
    const parts = str.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return str;
  };

  // Safe Member Form Reset Helper
  const getInitialMemberForm = () => {
    const dEnd = new Date();
    dEnd.setDate(dEnd.getDate() + 90);
    return {
      name: '',
      phone: '',
      gender: 'Male',
      plan: 'Quarterly',
      planPrice: 4000,
      dues: 0,
      includeAdmissionFee: true,
      admissionFee: 500,
      assignPT: false,
      ptTrainer: '',
      ptSessions: 12,
      ptPrice: 6000,
      paymentMethod: 'UPI',
      discountPercent: 0,
      applyTax: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: dEnd.toISOString().split('T')[0],
      phoneError: ''
    };
  };

  const [newMemberForm, setNewMemberForm] = useState(getInitialMemberForm());

  const openFreshNewMemberModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNewMemberForm(getInitialMemberForm());
    setShowNewDropdown(false);
    setUserMenuOpen(false);
    setShowNewMemberModal(true);
  };

  const [renewForm, setRenewForm] = useState({
    plan: 'Quarterly',
    amount: 4000,
    dues: 0,
    method: 'UPI',
    startDate: todayStr,
    endDate: '2027-01-01'
  });

  // Global Esc key dismiss handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPaymentModal(false);
        setShowNewMemberModal(false);
        setShowEditMemberModal(null);
        setShowRenewModal(null);
        setShowNewLeadModal(false);
        setShowAddTrainerModal(false);
        setShowEditTrainerModal(null);
        setShowAddPlanModal(false);
        setShowAddPTModal(false);
        setShowEditPTModal(null);
        setShowAddExpenseModal(false);
        setSelectedMemberProfile(null);
        setCreatedMemberCard(null);
        setAssignedPTSuccessCard(null);
        setReceiptSuccess(null);
        setShowNewDropdown(false);
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/data?t=${Date.now()}`);
      const data = await res.json();
      setDbData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const savedTab = localStorage.getItem('repflow_active_tab');
    if (savedTab) setCurrentTab(savedTab);

    const savedAuth = localStorage.getItem('repflow_user_session');
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      setActiveUser(parsed);
      setIsAuthenticated(true);
      if (parsed.role === 'Trainer') setCurrentTab('trainers');
      else if (parsed.role === 'Accountant') setCurrentTab('collections');
    }
  }, []);

  const navigateTab = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    setShowNewDropdown(false);
    setUserMenuOpen(false);
    localStorage.setItem('repflow_active_tab', tab);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
  };

  const openWhatsApp = (phone: string, text: string) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const num = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const openSMS = (phone: string, text: string) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    window.open(`sms:+91${cleanPhone}?body=${encodeURIComponent(text)}`, '_blank');
  };

  const canPerform = (action: string) => {
    if (activeUser.role === 'Owner') return true;
    if (!dbData?.permissions || !dbData.permissions[action]) return false;
    return !!dbData.permissions[action][activeUser.role];
  };

  const calcEndDate = (start: string, planName: string) => {
    const d = new Date(start || new Date());
    const days = planName === 'Monthly' ? 30 : planName === 'Quarterly' ? 90 : planName === 'Half-yearly' ? 180 : 365;
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const getPublicAppUrl = () => {
    if (dbData?.gymProfile?.publicUrl && dbData.gymProfile.publicUrl.trim().length > 5) {
      return dbData.gymProfile.publicUrl.replace(/\/+$/, '');
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('repflow_public_url');
      if (stored && stored.trim().length > 5) return stored.replace(/\/+$/, '');
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return window.location.origin;
      }
    }
    return 'https://repflow-gym.ngrok-free.dev';
  };

  // Dynamic Metrics
  const totalCollectedToday = (dbData?.payments || [])
    .filter((p: any) => p.date === todayStr)
    .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

  const totalMonthRevenue = (dbData?.payments || [])
    .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

  const totalExpenses = (dbData?.expenses || [])
    .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

  const netProfit = totalMonthRevenue - totalExpenses;

  const totalDuesPending = (dbData?.members || [])
    .reduce((sum: number, m: any) => sum + Number(m.dues || 0), 0);

  const activeMembersCount = (dbData?.members || [])
    .filter((m: any) => m.status === 'Active').length;

  const expiringCount = (dbData?.members || []).filter((m: any) => {
    if (!m.expires) return false;
    const diff = Math.ceil((new Date(m.expires).getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  }).length;

  const expiring3DaysCount = (dbData?.members || []).filter((m: any) => {
    if (!m.expires) return false;
    const diff = Math.ceil((new Date(m.expires).getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
  }).length;

  const getDaysLeft = (expiresDate: string) => {
    if (!expiresDate) return 0;
    const diff = Math.ceil((new Date(expiresDate).getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const isTrainer = activeUser.role === 'Trainer';
  const trainerAssignedMembers = (dbData?.ptAssignments || [])
    .filter((pt: any) => pt.trainer?.toLowerCase() === activeUser.name?.toLowerCase())
    .map((pt: any) => pt.member?.toLowerCase());

  // Real-Time 30-Day Timeline Data Generator
  const generateRealLast30DaysData = () => {
    const daysArr: any[] = [];
    const paymentsList = dbData?.payments || [];
    let maxVal = 1000;

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const label = `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}`;

      const daysPayments = paymentsList.filter((p: any) => p.date === isoDate);
      const digitalSum = daysPayments.filter((p: any) => p.method !== 'Cash').reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
      const cashSum = daysPayments.filter((p: any) => p.method === 'Cash').reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
      const dayCheckins = isoDate === todayStr ? recentCheckIns.length : (daysPayments.length > 0 ? daysPayments.length * 2 : 0);

      const dayTotal = digitalSum + cashSum;
      if (dayTotal > maxVal) maxVal = dayTotal;

      daysArr.push({
        isoDate,
        d: label,
        digital: digitalSum,
        cash: cashSum,
        total: dayTotal,
        checkins: dayCheckins
      });
    }

    return daysArr.map(item => ({
      ...item,
      digPercent: maxVal > 0 ? Math.min(100, Math.round((item.digital / maxVal) * 85)) : 0,
      cashPercent: maxVal > 0 ? Math.min(100, Math.round((item.cash / maxVal) * 85)) : 0
    }));
  };

  const real30DaysTimeline = generateRealLast30DaysData();

  // Natural Language Search Processor
  const processAiQuery = (query: string) => {
    const q = query.toLowerCase();
    if (q.includes('owe') || q.includes('due') || q.includes('money')) {
      const res = (dbData?.members || []).filter((m: any) => m.dues > 0);
      setAiQueryResult({ title: 'Members With Outstanding Dues', items: res.map((m: any) => `${m.name} owes ₹${m.dues}`) });
    } else if (q.includes('expir') || q.includes('week')) {
      const res = (dbData?.members || []).filter((m: any) => getDaysLeft(m.expires) <= 7);
      setAiQueryResult({ title: 'Members Expiring This Week', items: res.map((m: any) => `${m.name} (Expires: ${formatDDMMYYYY(m.expires)})`) });
    } else if (q.includes('quit') || q.includes('risk')) {
      const res = (dbData?.members || []).filter((m: any) => m.dues > 0 || getDaysLeft(m.expires) <= 7);
      setAiQueryResult({ title: 'Members at Risk of Churn', items: res.map((m: any) => `${m.name} - ${m.plan}`) });
    } else if (q.includes('collect') || q.includes('month')) {
      setAiQueryResult({ title: 'Collections This Month', items: [`Total collected: ₹${totalMonthRevenue}`, `Net profit: ₹${netProfit}`] });
    } else {
      setAiQueryResult({ title: 'Search Results', items: [`Query matched: ${(dbData?.members || []).length} registered members, ₹${totalMonthRevenue} total collected.`] });
    }
  };

  const handleCompletePTSession = async (ptId: string) => {
    try {
      const res = await fetch(`/api/pt-assign/${ptId}/complete-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator: activeUser.name })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbData((prev: any) => ({
          ...prev,
          ptAssignments: (prev?.ptAssignments || []).map((pt: any) => pt.id === ptId ? { ...pt, sessions: data.pt.sessions } : pt)
        }));
        alert(`Class completed! ${data.pt.sessions} session(s) remaining for ${data.pt.member}.`);
      } else {
        alert(data.message || 'Could not complete session.');
      }
    } catch (err) {
      alert('Error updating session status.');
    }
  };

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.message || 'Login failed.');
        return;
      }
      setActiveUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('repflow_user_session', JSON.stringify(data.user));
      navigateTab(data.user.role === 'Trainer' ? 'trainers' : data.user.role === 'Accountant' ? 'collections' : 'commandCenter');
    } catch (err) {
      setLoginError('Authentication server error.');
    }
  };

  const handleResetPassword = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e.target.resetEmail.value, newPassword: e.target.newPass.value })
    });
    const d = await res.json();
    if (d.success) {
      setResetSuccess('Password reset successfully! You can now log in.');
      setTimeout(() => { setShowForgotModal(false); setResetSuccess(''); }, 1500);
    } else {
      alert(d.message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('repflow_user_session');
    localStorage.removeItem('repflow_active_tab');
  };

  // Front Desk Check-in Handler
  const handleFrontDeskCheckIn = (inputVal: string) => {
    setCheckInNotice(null);
    const cleaned = inputVal.trim();
    if (!cleaned) return;

    const isMemberCode = /^IT\d+/i.test(cleaned);
    if (!isMemberCode) {
      setCheckInNotice({ type: 'warning', message: 'Enter exact Member ID (e.g. IT1001).' });
      return;
    }

    const match = (dbData?.members || []).find((m: any) => (((m?.code || m?.id || "").toLowerCase())) === cleaned.toLowerCase());

    if (!match) {
      setCheckInNotice({ type: 'error', message: `No active member found with ID "${cleaned}".` });
      return;
    }

    const alreadyCheckedIn = recentCheckIns.find((c: any) => c.id === match.id);
    if (alreadyCheckedIn) {
      setCheckInNotice({ type: 'warning', message: `${match.name} was ALREADY checked in today at ${alreadyCheckedIn.time}.` });
      setCheckInInput('');
      return;
    }

    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    setRecentCheckIns([{ name: match.name, id: match.id, phone: match.phone, plan: match.plan, time: nowTime, date: todayStr }, ...recentCheckIns]);
    setCheckInNotice({ type: 'success', message: `${match.name} checked in successfully at ${nowTime}!` });
    setCheckInInput('');
  };

  // Registration Calculations (Clean Rupee, zero dollar signs)
  const defaultTaxRate = dbData?.billingSettings?.taxPercent || 18;
  const basePlanPrice = Number(newMemberForm.planPrice || 0);
  const admissionPrice = newMemberForm.includeAdmissionFee ? Number(newMemberForm.admissionFee || 500) : 0;
  const ptPriceCalc = newMemberForm.assignPT ? Number(newMemberForm.ptPrice || 0) : 0;
  const rawSubtotal = basePlanPrice + admissionPrice + ptPriceCalc;
  const discountAmount = Math.round((rawSubtotal * Number(newMemberForm.discountPercent || 0)) / 100);
  const afterDiscountSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const calculatedTax = newMemberForm.applyTax ? Math.round((afterDiscountSubtotal * defaultTaxRate) / 100) : 0;
  const grandTotal = afterDiscountSubtotal + calculatedTax;
  const payNowCalculated = Math.max(0, grandTotal - Number(newMemberForm.dues || 0));

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPerform('Add & edit members')) {
      alert('Your role does not have permission to add members.');
      return;
    }
    const cleanedPhone = newMemberForm.phone.replace(/[^0-9]/g, '');
    if (cleanedPhone.length !== 10) {
      setNewMemberForm({ ...newMemberForm, phoneError: 'Mobile number must be exactly 10 digits.' });
      return;
    }

    const alreadyExists = (dbData?.members || []).some((m: any) => (m.phone || '').replace(/[^0-9]/g, '') === cleanedPhone);
    if (alreadyExists) {
      alert(`Member with mobile number +91 ${cleanedPhone} is already registered! Please use a unique number.`);
      return;
    }

    const payload = {
      name: newMemberForm.name,
      phone: cleanedPhone,
      gender: newMemberForm.gender,
      plan: newMemberForm.plan,
      startDate: newMemberForm.startDate,
      expires: newMemberForm.endDate,
      status: 'Active',
      dues: Number(newMemberForm.dues || 0),
      operator: activeUser.name
    };

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(result.message || 'Error creating member.');
        return;
      }
      const created = result.member;

      if (newMemberForm.assignPT && newMemberForm.ptTrainer) {
        await fetch('/api/pt-assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainer: newMemberForm.ptTrainer,
            member: created.name,
            sessions: Number(newMemberForm.ptSessions || 12),
            price: ptPriceCalc,
            method: newMemberForm.paymentMethod,
            startDate: newMemberForm.startDate,
            endDate: newMemberForm.endDate,
            operator: activeUser.name
          })
        });
      }

      if (payNowCalculated > 0) {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            member: created.name,
            phone: created.phone,
            amount: payNowCalculated,
            method: newMemberForm.paymentMethod,
            plan: `${created.plan}${admissionPrice > 0 ? ' + Adm' : ''}${ptPriceCalc > 0 ? ' + PT' : ''}`,
            date: todayStr,
            operator: activeUser.name
          })
        });
      }

      setDbData((prev: any) => ({
        ...prev,
        members: [created, ...(prev?.members || [])]
      }));

      setCreatedMemberCard({
        ...created,
        basePlanAmount: basePlanPrice,
        admissionAmount: admissionPrice,
        ptAmount: ptPriceCalc,
        ptTrainer: newMemberForm.ptTrainer,
        discountPercent: newMemberForm.discountPercent,
        discountAmount,
        taxPercent: newMemberForm.applyTax ? defaultTaxRate : 0,
        calculatedTax,
        totalBill: grandTotal,
        totalPaid: payNowCalculated,
        paymentMethod: newMemberForm.paymentMethod,
        startDate: newMemberForm.startDate,
        endDate: newMemberForm.endDate
      });

      setShowNewMemberModal(false);
      fetchData();
    } catch (err) {
      alert('Error creating member.');
    }
  };

  const handleEditMemberSubmit = async (e: any) => {
    e.preventDefault();
    if (!canPerform('Add & edit members')) {
      alert('Your role does not have permission to edit members.');
      return;
    }

    const cleanedPhone = (showEditMemberModal.phone || '').replace(/[^0-9]/g, '');
    if (cleanedPhone.length !== 10) {
      alert('Mobile number must be exactly 10 digits!');
      return;
    }

    const updatedPayload = {
      name: showEditMemberModal.name,
      phone: cleanedPhone,
      plan: showEditMemberModal.plan,
      status: showEditMemberModal.status,
      dues: Number(showEditMemberModal.dues || 0),
      startDate: showEditMemberModal.startDate,
      expires: showEditMemberModal.expires,
      operator: activeUser.name
    };

    const targetId = showEditMemberModal.id;

    setDbData((prev: any) => ({
      ...prev,
      members: (prev?.members || []).map((m: any) => m.id === targetId ? { ...m, ...updatedPayload } : m)
    }));

    if (selectedMemberProfile && selectedMemberProfile.id === targetId) {
      setSelectedMemberProfile({ ...selectedMemberProfile, ...updatedPayload });
    }

    setShowEditMemberModal(null);

    try {
      await fetch(`/api/members/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenewSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const payload = {
        plan: renewForm.plan,
        amount: Number(renewForm.amount),
        dues: Number(renewForm.dues),
        method: renewForm.method,
        startDate: renewForm.startDate,
        endDate: renewForm.endDate,
        operator: activeUser.name
      };

      const res = await fetch(`/api/members/${showRenewModal.id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        alert(`Membership successfully renewed for ${showRenewModal.name}!`);
        setShowRenewModal(null);
        setSelectedMemberProfile(result.member);
        fetchData();
      }
    } catch (err) {
      alert('Error renewing membership.');
    }
  };

  const handleCreateLead = async (e: any) => {
    e.preventDefault();
    const cleanedPhone = e.target.leadPhone.value.replace(/[^0-9]/g, '');
    if (cleanedPhone.length !== 10) {
      alert('Mobile number must be exactly 10 digits.');
      return;
    }

    const payload = {
      name: e.target.leadName.value,
      phone: cleanedPhone,
      source: e.target.leadSource.value,
      followUp: e.target.leadFollowUp.value,
      plan: e.target.leadPlan.value,
      note: e.target.leadNote.value,
      stage: 'New',
      operator: activeUser.name
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      setDbData((prev: any) => ({
        ...prev,
        leads: [d.lead, ...(prev?.leads || [])]
      }));
      setShowNewLeadModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveLeadStage = async (leadId: string, newStage: string) => {
    const updated = (dbData?.leads || []).map((l: any) => l.id === leadId ? { ...l, stage: newStage } : l);
    setDbData({ ...dbData, leads: updated });
    setActiveLeadDropdown(null);

    await fetch(`/api/leads/${leadId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage, operator: activeUser.name })
    });
  };

  const handleCreateTrainer = async (e: any) => {
    e.preventDefault();
    const cleanedPhone = e.target.trPhone.value.replace(/[^0-9]/g, '');
    if (cleanedPhone.length !== 10) {
      alert('Trainer mobile must be exactly 10 digits.');
      return;
    }

    const payload = {
      name: e.target.trName.value,
      email: e.target.trEmail.value,
      password: e.target.trPassword.value,
      phone: cleanedPhone,
      specialty: e.target.trSpecialty.value
    };

    try {
      const res = await fetch('/api/trainers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      setDbData((prev: any) => ({
        ...prev,
        trainers: [...(prev?.trainers || []), d.trainer]
      }));
      setShowAddTrainerModal(false);
      fetchData();
      alert(`Trainer ${payload.name} created! Password: ${payload.password}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditTrainerSubmit = async (e: any) => {
    e.preventDefault();
    const cleanedPhone = e.target.trPhone.value.replace(/[^0-9]/g, '');
    if (cleanedPhone.length !== 10) {
      alert('Trainer mobile must be exactly 10 digits.');
      return;
    }

    const payload = {
      name: e.target.trName.value,
      email: e.target.trEmail.value,
      password: e.target.trPassword.value,
      phone: cleanedPhone,
      specialty: e.target.trSpecialty.value
    };

    try {
      await fetch(`/api/trainers/${showEditTrainerModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setShowEditTrainerModal(null);
      fetchData();
      alert('Trainer details updated!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignPT = async (e: any) => {
    e.preventDefault();
    if (!canPerform('Manage PT sessions')) {
      alert('Your role does not have permission to manage PT sessions.');
      return;
    }
    const ptPrice = Number(e.target.ptPrice.value || 0);
    const memberName = e.target.ptMember.value;
    const trainerName = e.target.ptTrainer.value;
    const sessions = Number(e.target.ptSessions.value || 12);
    const payMethod = e.target.ptMethod.value;
    const startDate = e.target.ptStart.value;
    const endDate = e.target.ptEnd.value;

    const payload = {
      trainer: trainerName,
      member: memberName,
      sessions,
      price: ptPrice,
      method: payMethod,
      startDate,
      endDate,
      operator: activeUser.name
    };

    try {
      await fetch('/api/pt-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let stampedReceipt = `RCPT-${Math.floor(1000 + Math.random() * 9000)}`;
      if (ptPrice > 0) {
        const payRes = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            member: memberName,
            phone: '9876543210',
            amount: ptPrice,
            method: payMethod,
            plan: `PT Package (${sessions} sessions)`,
            date: todayStr,
            operator: activeUser.name
          })
        });
        const payData = await payRes.json();
        if (payData?.payment?.receipt) stampedReceipt = payData.payment.receipt;
      }

      setShowAddPTModal(false);
      fetchData();

      setAssignedPTSuccessCard({
        receipt: stampedReceipt,
        member: memberName,
        trainer: trainerName,
        sessions,
        price: ptPrice,
        method: payMethod,
        startDate,
        endDate
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPTSubmit = async (e: any) => {
    e.preventDefault();
    const payload = {
      member: e.target.editPtMember.value,
      trainer: e.target.editPtTrainer.value,
      sessions: Number(e.target.ptSessions.value),
      price: Number(e.target.ptPrice.value),
      startDate: e.target.ptStart.value,
      endDate: e.target.ptEnd.value,
      operator: activeUser.name
    };

    try {
      await fetch(`/api/pt-assign/${showEditPTModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setShowEditPTModal(null);
      fetchData();
      alert('PT assignment updated!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordPayment = async (e: any) => {
    e.preventDefault();
    if (!canPerform('Collect payments')) {
      alert('Your role does not have permission to collect payments.');
      return;
    }
    const payload = {
      member: payForm.member || 'Walk-in Member',
      phone: payForm.phone || '9876543210',
      amount: Number(payForm.amount || 0),
      method: payForm.method,
      plan: payForm.category,
      note: payForm.note,
      date: todayStr,
      operator: activeUser.name
    };

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      setReceiptSuccess(d.payment);
      setShowPaymentModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExpense = async (e: any) => {
    e.preventDefault();
    if (!canPerform('Record expenses')) {
      alert('Your role does not have permission to record expenses.');
      return;
    }
    const payload = {
      category: e.target.category.value,
      paidTo: e.target.paidTo.value,
      amount: Number(e.target.amount.value),
      method: e.target.method.value,
      date: e.target.date.value
    };

    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setShowAddExpenseModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Background PDF Invoice Generator
  const downloadOfficialTemplatePDF = (data: any) => {
    const invoiceUrl = `/api/invoices/${data.id || 'IT1001'}`;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = invoiceUrl;
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 10000);
  };

  // Structured Tabular PDF Exports
  const downloadTabularExportPDF = (type: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const title = type.toUpperCase();
    const gymName = dbData?.gymProfile?.name || 'Iron Temple Fitness';
    const list = dbData?.[type] || [];

    let tableHeaders = '';
    let tableRows = '';

    if (type === 'members') {
      tableHeaders = '<th>ID</th><th>NAME</th><th>PHONE</th><th>PLAN</th><th>STATUS</th><th>DUES</th><th>EXPIRES (DD-MM-YYYY)</th>';
      tableRows = list.map((m: any) => `
        <tr>
          <td>${m.code || "IT1001"}</td>
          <td><strong>${m.name}</strong></td>
          <td>+91 ${m.phone}</td>
          <td>${m.plan}</td>
          <td><span style="color:${m.status === 'Active' ? 'green' : 'red'};">${m.status}</span></td>
          <td>₹${m.dues}</td>
          <td>${formatDDMMYYYY(m.expires)}</td>
        </tr>
      `).join('');
    } else if (type === 'payments') {
      tableHeaders = '<th>RECEIPT</th><th>DATE (DD-MM-YYYY)</th><th>MEMBER</th><th>CATEGORY / PLAN</th><th>METHOD</th><th>AMOUNT</th>';
      tableRows = list.map((p: any) => `
        <tr>
          <td><strong>${p.receipt}</strong></td>
          <td>${formatDDMMYYYY(p.date || todayStr)}</td>
          <td>${p.member}</td>
          <td>${p.plan}</td>
          <td>${p.method}</td>
          <td><strong>₹${p.amount}</strong></td>
        </tr>
      `).join('');
    } else if (type === 'expenses') {
      tableHeaders = '<th>ID</th><th>DATE (DD-MM-YYYY)</th><th>CATEGORY</th><th>PAID TO</th><th>METHOD</th><th>AMOUNT</th>';
      tableRows = list.map((e: any) => `
        <tr>
          <td>${e.id}</td>
          <td>${formatDDMMYYYY(e.date)}</td>
          <td>${e.category}</td>
          <td>${e.paidTo}</td>
          <td>${e.method}</td>
          <td><strong style="color:red;">₹${e.amount}</strong></td>
        </tr>
      `).join('');
    } else if (type === 'leads') {
      tableHeaders = '<th>NAME</th><th>PHONE</th><th>SOURCE</th><th>STAGE</th><th>PLAN</th><th>FOLLOW UP (DD-MM-YYYY)</th>';
      tableRows = list.map((l: any) => `
        <tr>
          <td><strong>${l.name}</strong></td>
          <td>+91 ${l.phone}</td>
          <td>${l.source}</td>
          <td>${l.stage}</td>
          <td>${l.plan}</td>
          <td>${formatDDMMYYYY(l.followUp)}</td>
        </tr>
      `).join('');
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} Official Report</title>
        <style>
          body { font-family: -apple-system, sans-serif; padding: 30px; color: #111; font-size: 12px; }
          .header { border-bottom: 2px solid #84cc16; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 20px; font-weight: 900; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #f4f4f5; text-align: left; padding: 8px; border: 1px solid #ddd; font-weight: bold; }
          td { padding: 8px; border: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${gymName} — ${title} REPORT</div>
            <div style="font-size:11px; color:#555;">Generated on ${formatDDMMYYYY(todayStr)} by ${activeUser.name} (${activeUser.role})</div>
          </div>
          <div style="font-size:12px; font-weight:bold;">Total Records: ${list.length}</div>
        </div>
        <table>
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Consolidated All-In-One Master PDF Export
  const downloadAllInOneMasterPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const gymName = dbData?.gymProfile?.name || 'Iron Temple Fitness';
    const branch = dbData?.gymProfile?.branch || 'Indiranagar, Bengaluru';
    const gstin = dbData?.billingSettings?.gstin || '29AABCI1234F1Z8';
    const members = dbData?.members || [];
    const payments = dbData?.payments || [];
    const expenses = dbData?.expenses || [];
    const leads = dbData?.leads || [];

    const memberRows = members.map((m: any) => `
      <tr>
        <td>${m.code || "IT1001"}</td>
        <td><strong>${m.name}</strong></td>
        <td>+91 ${m.phone}</td>
        <td>${m.plan}</td>
        <td>${m.status}</td>
        <td>₹${m.dues}</td>
        <td>${formatDDMMYYYY(m.startDate)}</td>
        <td>${formatDDMMYYYY(m.expires)}</td>
      </tr>
    `).join('');

    const paymentRows = payments.map((p: any) => `
      <tr>
        <td><strong>${p.receipt}</strong></td>
        <td>${formatDDMMYYYY(p.date || todayStr)}</td>
        <td>${p.member}</td>
        <td>${p.plan}</td>
        <td>${p.method}</td>
        <td style="font-weight:bold; color:green;">₹${p.amount}</td>
      </tr>
    `).join('');

    const expenseRows = expenses.map((e: any) => `
      <tr>
        <td>${formatDDMMYYYY(e.date)}</td>
        <td>${e.category}</td>
        <td>${e.paidTo}</td>
        <td>${e.method}</td>
        <td style="font-weight:bold; color:red;">₹${e.amount}</td>
      </tr>
    `).join('');

    const leadRows = leads.map((l: any) => `
      <tr>
        <td><strong>${l.name}</strong></td>
        <td>+91 ${l.phone}</td>
        <td>${l.source}</td>
        <td>${l.stage}</td>
        <td>${l.plan}</td>
        <td>${formatDDMMYYYY(l.followUp)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>All-In-One Master Gym Audit Report</title>
        <style>
          body { font-family: -apple-system, sans-serif; padding: 25px; color: #111; font-size: 11px; line-height: 1.4; }
          .header { border-bottom: 3px solid #84cc16; padding-bottom: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; }
          .title { font-size: 22px; font-weight: 900; }
          .section-title { font-size: 14px; font-weight: bold; background: #84cc16; color: #000; padding: 4px 8px; margin-top: 20px; border-radius: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 12px; }
          th { background: #f4f4f5; text-align: left; padding: 6px; border: 1px solid #ddd; font-weight: bold; }
          td { padding: 5px 6px; border: 1px solid #eee; }
          .summary-grid { display: flex; gap: 15px; margin: 15px 0; }
          .summary-card { border: 1px solid #ddd; border-radius: 6px; padding: 10px; flex: 1; text-align: center; }
          .summary-card strong { font-size: 16px; display: block; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${gymName} — ALL-IN-ONE MASTER AUDIT REPORT</div>
            <div>Branch: ${branch} | GSTIN: ${gstin} | Generated on: <strong>${formatDDMMYYYY(todayStr)}</strong></div>
          </div>
          <div style="text-align: right;">
            <div>Authorized Operator: <strong>${activeUser.name}</strong></div>
            <div>System: RepFlow Gym OS Enterprise</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">Total Revenue<strong style="color:green;">₹${totalMonthRevenue}</strong></div>
          <div class="summary-card">Total Expenses<strong style="color:red;">₹${totalExpenses}</strong></div>
          <div class="summary-card">Net Operating Profit<strong style="color:#84cc16;">₹${netProfit}</strong></div>
          <div class="summary-card">Active Members<strong>${activeMembersCount}</strong></div>
          <div class="summary-card">Pending Dues<strong style="color:#dc2626;">₹${totalDuesPending}</strong></div>
        </div>

        <div class="section-title">1. MEMBERS ROSTER (${members.length})</div>
        <table>
          <thead><tr><th>ID</th><th>NAME</th><th>PHONE</th><th>PLAN</th><th>STATUS</th><th>DUES</th><th>JOINED (DD-MM-YYYY)</th><th>EXPIRES (DD-MM-YYYY)</th></tr></thead>
          <tbody>${memberRows}</tbody>
        </table>

        <div class="section-title">2. REVENUE & PAYMENT INVOICES (${payments.length})</div>
        <table>
          <thead><tr><th>RECEIPT</th><th>DATE (DD-MM-YYYY)</th><th>MEMBER</th><th>CATEGORY / PLAN</th><th>METHOD</th><th>AMOUNT</th></tr></thead>
          <tbody>${paymentRows}</tbody>
        </table>

        <div class="section-title">3. EXPENSES & OUTFLOWS (${expenses.length})</div>
        <table>
          <thead><tr><th>DATE (DD-MM-YYYY)</th><th>CATEGORY</th><th>PAID TO</th><th>METHOD</th><th>AMOUNT</th></tr></thead>
          <tbody>${expenseRows}</tbody>
        </table>

        <div class="section-title">4. LEADS PIPELINE (${leads.length})</div>
        <table>
          <thead><tr><th>NAME</th><th>PHONE</th><th>SOURCE</th><th>STAGE</th><th>PLAN</th><th>FOLLOW-UP (DD-MM-YYYY)</th></tr></thead>
          <tbody>${leadRows}</tbody>
        </table>

        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Filtered Expenses Calculation & PDF
  const filteredExpensesList = (dbData?.expenses || []).filter((exp: any) => {
    if (!expenseStartDate && !expenseEndDate) return true;
    const expDate = exp.date || '';
    if (expenseStartDate && expDate < expenseStartDate) return false;
    if (expenseEndDate && expDate > expenseEndDate) return false;
    return true;
  });

  const filteredExpenseTotal = filteredExpensesList.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

  const downloadFilteredExpensesPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const gymName = dbData?.gymProfile?.name || 'Iron Temple Fitness';
    const rows = filteredExpensesList.map((e: any) => `
      <tr>
        <td>${formatDDMMYYYY(e.date)}</td>
        <td><strong>${e.category}</strong></td>
        <td>${e.paidTo}</td>
        <td>${e.method}</td>
        <td style="text-align: right; color: red;">₹${e.amount}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expense & P&L Statement</title>
        <style>
          body { font-family: -apple-system, sans-serif; padding: 30px; font-size: 12px; }
          .header { border-bottom: 2px solid #84cc16; padding-bottom: 10px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #f4f4f5; text-align: left; padding: 8px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #eee; }
          .total { font-size: 16px; font-weight: 900; text-align: right; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${gymName} — P&L Statement</h2>
          <div>Period: <strong>${formatDDMMYYYY(expenseStartDate) || 'All Time'}</strong> to <strong>${formatDDMMYYYY(expenseEndDate) || formatDDMMYYYY(todayStr)}</strong></div>
        </div>
        <table>
          <thead>
            <tr><th>DATE (DD-MM-YYYY)</th><th>CATEGORY</th><th>PAID TO</th><th>METHOD</th><th style="text-align: right;">AMOUNT (₹)</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="total">Total Filtered Expenses: ₹${filteredExpenseTotal}</div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getCohortRecipients = () => {
    if (broadcastTarget === 'Members with Dues') {
      return (dbData?.members || []).filter((m: any) => m.dues > 0);
    }
    if (broadcastTarget === 'Expiring in 7 Days') {
      return (dbData?.members || []).filter((m: any) => getDaysLeft(m.expires) <= 7 && m.status !== 'Expired');
    }
    return dbData?.members || [];
  };

  const cohortList = getCohortRecipients();

  const cardBg = theme === 'dark' ? 'bg-[#17191e] border-neutral-800' : 'bg-white border-slate-200 shadow-sm';
  const innerBg = theme === 'dark' ? 'bg-[#0f1115] border-neutral-800' : 'bg-slate-50 border-slate-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-neutral-400' : 'text-slate-500';

  // ------------------------- LOGIN VIEW ------------------------- //
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-[#0f1115] text-white' : 'bg-slate-100 text-slate-900'}`}>
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-[#84cc16] text-black font-extrabold text-xl px-2.5 py-1 rounded">R</div>
              <span className="text-2xl font-bold tracking-tight">RepFlow</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight">
              Your fees collect themselves. <span className="text-[#84cc16]">Real-time gym management</span> for modern fitness owners.
            </h1>
          </div>

          <div className={`p-8 rounded-2xl border shadow-2xl space-y-5 ${cardBg}`}>
            <h2 className="text-2xl font-bold">Sign in to your gym</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-400">Email</label>
                <input 
                  type="email" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  placeholder="owner@gym.com" 
                  className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm outline-none ${theme === 'dark' ? 'bg-[#0f1115] text-white border-neutral-800' : 'bg-slate-50 text-slate-900 border-slate-300'}`} 
                  required 
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-neutral-400">Password</label>
                  <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs text-[#84cc16] hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-1">
                  <input 
                    type={showLoginPassword ? "text" : "password"} 
                    value={loginPass} 
                    onChange={(e) => setLoginPass(e.target.value)} 
                    placeholder="Enter password" 
                    className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm outline-none ${theme === 'dark' ? 'bg-[#0f1115] text-white border-neutral-800' : 'bg-slate-50 text-slate-900 border-slate-300'}`} 
                    required 
                  />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-2.5 text-neutral-400">
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {loginError && <p className="text-xs text-rose-500 font-semibold">{loginError}</p>}
              <button type="submit" className="w-full py-2.5 bg-[#84cc16] hover:bg-[#72b012] text-black font-bold rounded-lg text-sm transition">
                Sign in →
              </button>
            </form>
          </div>
        </div>

        {showForgotModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleResetPassword} className={`${cardBg} p-6 rounded-2xl max-w-sm w-full space-y-4 text-xs`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-base font-bold ${textColor}`}>Reset Account Password</h3>
                <button type="button" onClick={() => setShowForgotModal(false)}><X className="w-4 h-4 text-neutral-400" /></button>
              </div>
              <div>
                <label className="text-neutral-400">Your Registered Email</label>
                <input name="resetEmail" type="email" required placeholder="owner@gym.com" className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
              </div>
              <div>
                <label className="text-neutral-400">New Password</label>
                <div className="relative mt-1">
                  <input 
                    name="newPass" 
                    type={showResetPasswordEye ? "text" : "password"} 
                    required 
                    placeholder="Enter new password" 
                    className={`w-full px-3 py-2 pr-10 border rounded-lg outline-none ${innerBg} ${textColor}`} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowResetPasswordEye(!showResetPasswordEye)} 
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
                  >
                    {showResetPasswordEye ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {resetSuccess && <p className="text-green-400 font-semibold">{resetSuccess}</p>}
              <button type="submit" className="w-full py-2.5 bg-[#84cc16] text-black font-bold rounded-xl">Confirm & Reset Password</button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ------------------------- MAIN DASHBOARD VIEW ------------------------- //
  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${theme === 'dark' ? 'bg-[#0f1115] text-[#e5e7eb]' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* MOBILE TOP BAR */}
      <div className={`md:hidden flex items-center justify-between p-3 border-b ${theme === 'dark' ? 'bg-[#121418] border-neutral-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center space-x-2">
          <button onClick={() => setMobileMenuOpen(true)} className="p-1"><Menu className="w-6 h-6" /></button>
          <div className="bg-[#84cc16] text-black font-extrabold text-sm px-2 py-0.5 rounded">R</div>
          <span className="font-bold text-xs truncate max-w-[100px]">{dbData?.gymProfile?.name || 'Iron Temple'}</span>
        </div>

        <div className="flex items-center gap-1.5 relative">
          {activeUser.role !== 'Trainer' && (
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowNewDropdown(!showNewDropdown); setUserMenuOpen(false); }} className="flex items-center gap-1 text-[11px] bg-[#84cc16] text-black font-bold px-2.5 py-1.5 rounded-lg hover:bg-[#72b012]">
                <Plus className="w-3.5 h-3.5" /> New <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showNewDropdown && (
                <div className={`absolute right-0 top-9 w-40 rounded-xl border p-1 shadow-2xl z-50 text-xs font-semibold ${cardBg}`}>
                  <button onClick={(e) => openFreshNewMemberModal(e)} className={`w-full text-left p-2 rounded hover:bg-[#84cc16]/10 flex items-center gap-2 ${textColor}`}>
                    <UserPlus className="w-4 h-4" /> New member
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setPayForm({ member: '', phone: '', amount: '', method: 'UPI', category: 'Membership', note: '' }); setShowPaymentModal(true); setShowNewDropdown(false); }} className={`w-full text-left p-2 rounded hover:bg-[#84cc16]/10 flex items-center gap-2 ${textColor}`}>
                    <CreditCard className="w-4 h-4" /> Collect payment
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setShowNewLeadModal(true); setShowNewDropdown(false); }} className={`w-full text-left p-2 rounded hover:bg-[#84cc16]/10 flex items-center gap-2 ${textColor}`}>
                    <Plus className="w-4 h-4" /> New lead
                  </button>
                </div>
              )}
            </div>
          )}

          <button onClick={toggleTheme} className={`p-1.5 rounded-lg border ${innerBg}`}>
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); setShowNewDropdown(false); }} className={`p-1.5 rounded-lg border ${innerBg} text-neutral-400`}>
              <MoreVertical className="w-4 h-4" />
            </button>
            {userMenuOpen && (
              <div className={`absolute right-0 top-9 w-36 rounded-xl border p-1 shadow-2xl z-50 text-xs font-semibold ${cardBg}`}>
                {activeUser.role === 'Owner' && (
                  <button onClick={() => { navigateTab('settings'); setUserMenuOpen(false); }} className={`w-full text-left p-2 rounded hover:bg-[#84cc16]/10 flex items-center gap-2 ${textColor}`}>
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </button>
                )}
                <button onClick={() => { handleLogout(); setUserMenuOpen(false); }} className="w-full text-left p-2 rounded hover:bg-rose-500/10 text-rose-500 flex items-center gap-2">
                  <UserX className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        ${mobileMenuOpen ? 'fixed inset-0 z-50 flex flex-col w-3/4 max-w-xs shadow-2xl h-screen overflow-y-auto' : 'hidden'}
        md:flex md:w-64 md:h-screen md:overflow-y-auto border-r flex-col p-4 ${theme === 'dark' ? 'bg-[#121418] border-neutral-800' : 'bg-white border-slate-200'}
      `}>
        <div className="space-y-4 pb-28">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="bg-[#84cc16] text-black font-extrabold text-lg px-2 py-0.5 rounded">R</div>
              <div>
                <div className={`font-bold text-sm tracking-tight ${textColor}`}>{dbData?.gymProfile?.name || 'Iron Temple Fitness'}</div>
                <div className="text-[10px] text-neutral-400">{dbData?.gymProfile?.branch}</div>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-neutral-400"><X className="w-5 h-5" /></button>
          </div>

          <nav className="space-y-1 text-xs font-medium">
            <div className="text-[10px] font-bold text-neutral-500 uppercase px-2 py-1">TODAY</div>
            {canPerform('See revenue dashboard') && (
              <button onClick={() => navigateTab('commandCenter')} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg ${currentTab === 'commandCenter' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
                <Activity className="w-4 h-4" /> Command Center
              </button>
            )}
            {canPerform('Check in members') && (
              <button onClick={() => navigateTab('frontDesk')} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg ${currentTab === 'frontDesk' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
                <QrCode className="w-4 h-4" /> Front Desk
              </button>
            )}

            <div className="text-[10px] font-bold text-neutral-500 uppercase px-2 pt-2 py-1">PEOPLE</div>
            <button onClick={() => navigateTab('members')} className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg ${currentTab === 'members' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
              <div className="flex items-center gap-3"><Users className="w-4 h-4" /> Members</div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${innerBg}`}>{isTrainer ? trainerAssignedMembers.length : (dbData?.members?.length || 0)}</span>
            </button>
            {activeUser.role !== 'Trainer' && (
              <button onClick={() => navigateTab('leads')} className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg ${currentTab === 'leads' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
                <div className="flex items-center gap-3"><UserPlus className="w-4 h-4" /> Leads</div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${innerBg}`}>{dbData?.leads?.length || 0}</span>
              </button>
            )}
            <button onClick={() => navigateTab('trainers')} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg ${currentTab === 'trainers' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
              <Dumbbell className="w-4 h-4" /> Trainers & PT
            </button>

            {activeUser.role !== 'Trainer' && (
              <>
                <div className="text-[10px] font-bold text-neutral-500 uppercase px-2 pt-2 py-1">MONEY</div>
                {canPerform('Collect payments') && (
                  <button onClick={() => navigateTab('collections')} className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg ${currentTab === 'collections' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
                    <div className="flex items-center gap-3"><Wallet className="w-4 h-4" /> Collections</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold">₹{totalDuesPending}</span>
                  </button>
                )}
                {canPerform('Collect payments') && (
                  <button onClick={() => navigateTab('payments')} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg ${currentTab === 'payments' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
                    <CreditCard className="w-4 h-4" /> Payments
                  </button>
                )}
                <button onClick={() => navigateTab('store')} className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg ${currentTab === 'store' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
                  <div className="flex items-center gap-3"><ShoppingBag className="w-4 h-4" /> Store</div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${innerBg}`}>Soon</span>
                </button>
                {canPerform('Record expenses') && (
                  <button onClick={() => navigateTab('expenses')} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg ${currentTab === 'expenses' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
                    <TrendingDown className="w-4 h-4" /> Expenses & P&L
                  </button>
                )}

                <div className="text-[10px] font-bold text-neutral-500 uppercase px-2 pt-2 py-1">GROWTH</div>
                <button onClick={() => navigateTab('retention')} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg ${currentTab === 'retention' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
                  <RefreshCcw className="w-4 h-4" /> Retention
                </button>
                <button onClick={() => navigateTab('messages')} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg ${currentTab === 'messages' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
                  <MessageSquare className="w-4 h-4" /> Messages & Broadcasts
                </button>
              </>
            )}

            {activeUser.role === 'Owner' && (
              <>
                <div className="text-[10px] font-bold text-neutral-500 uppercase px-2 pt-2 py-1">ADMIN & SETTINGS</div>
                <button onClick={() => navigateTab('reports')} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg ${currentTab === 'reports' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
                  <BarChart2 className="w-4 h-4" /> Reports
                </button>
                <button onClick={() => navigateTab('staff')} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg ${currentTab === 'staff' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
                  <ShieldCheck className="w-4 h-4" /> Staff & Audit
                </button>
                <button onClick={() => navigateTab('settings')} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg ${currentTab === 'settings' ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}>
                  <Settings className="w-3.5 h-3.5" /> Settings
                </button>
              </>
            )}
          </nav>

          <div className={`p-3 rounded-xl border flex items-center justify-between mt-4 ${cardBg}`}>
            <div>
              <div className={`text-xs font-semibold ${textColor}`}>{activeUser.name}</div>
              <div className="text-[10px] text-[#84cc16] font-mono font-bold">{activeUser.role}</div>
            </div>
            <button onClick={handleLogout} className="text-[11px] text-neutral-400 hover:text-rose-500 font-semibold underline">Sign out</button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* DESKTOP HEADER */}
        <header className={`hidden md:flex h-14 border-b items-center justify-between px-6 ${theme === 'dark' ? 'bg-[#121418] border-neutral-800' : 'bg-white border-slate-200'}`}>
          <div className="text-xs font-semibold text-neutral-400">RepFlow OS • Real-Time Engine</div>

          <div className="flex items-center gap-3 relative">
            {activeUser.role !== 'Trainer' && (
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setShowNewDropdown(!showNewDropdown); setUserMenuOpen(false); }} className="flex items-center gap-1.5 text-xs bg-[#84cc16] text-black font-bold px-3 py-1.5 rounded-lg hover:bg-[#72b012]">
                  <Plus className="w-3.5 h-3.5" /> New <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showNewDropdown && (
                  <div className={`absolute right-0 top-10 w-44 rounded-xl border p-1 shadow-2xl z-50 text-xs font-semibold ${cardBg}`}>
                    <button onClick={(e) => openFreshNewMemberModal(e)} className={`w-full text-left p-2 rounded hover:bg-[#84cc16]/10 flex items-center gap-2 ${textColor}`}>
                      <UserPlus className="w-4 h-4" /> New member
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setPayForm({ member: '', phone: '', amount: '', method: 'UPI', category: 'Membership', note: '' }); setShowPaymentModal(true); setShowNewDropdown(false); }} className={`w-full text-left p-2 rounded hover:bg-[#84cc16]/10 flex items-center gap-2 ${textColor}`}>
                      <CreditCard className="w-4 h-4" /> Collect payment
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setShowNewLeadModal(true); setShowNewDropdown(false); }} className={`w-full text-left p-2 rounded hover:bg-[#84cc16]/10 flex items-center gap-2 ${textColor}`}>
                      <Plus className="w-4 h-4" /> New lead
                    </button>
                  </div>
                )}
              </div>
            )}

            <button onClick={toggleTheme} className={`p-2 rounded-lg border ${innerBg}`}>
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); setShowNewDropdown(false); }} className={`p-2 rounded-lg border ${innerBg} text-neutral-400 hover:text-white`}>
                <MoreVertical className="w-4 h-4" />
              </button>
              {userMenuOpen && (
                <div className={`absolute right-0 top-10 w-36 rounded-xl border p-1 shadow-2xl z-50 text-xs font-semibold ${cardBg}`}>
                  {activeUser.role === 'Owner' && (
                    <button onClick={() => { navigateTab('settings'); setUserMenuOpen(false); }} className={`w-full text-left p-2 rounded hover:bg-[#84cc16]/10 flex items-center gap-2 ${textColor}`}>
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </button>
                  )}
                  <button onClick={() => { handleLogout(); setUserMenuOpen(false); }} className="w-full text-left p-2 rounded hover:bg-rose-500/10 text-rose-500 flex items-center gap-2">
                    <UserX className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DYNAMIC DASHBOARD VIEWS */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6" onClick={() => { if (showNewDropdown) setShowNewDropdown(false); if (userMenuOpen) setUserMenuOpen(false); }}>
          
          {/* TAB 1: COMMAND CENTER */}
          {currentTab === 'commandCenter' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400">TODAY, {formatDDMMYYYY(todayStr)}</p>
                  <h2 className={`text-xl sm:text-2xl font-bold mt-0.5 ${textColor}`}>
                    Good afternoon, {activeUser.name}. Here's your gym today.
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    const msg = `Gym Briefing: Collected ₹${totalCollectedToday}, This Month: ₹${totalMonthRevenue}, Dues: ₹${totalDuesPending}, Active Members: ${activeMembersCount}.`;
                    openWhatsApp(dbData?.gymProfile?.phone || '9876543210', msg);
                  }} className={`px-3 py-1.5 border rounded-lg text-xs font-semibold flex items-center gap-1.5 ${cardBg} ${textColor} hover:border-[#84cc16]`}>
                    <Send className="w-3 h-3" /> Send me briefing
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setShowPaymentModal(true); }} className="px-3.5 py-1.5 bg-[#84cc16] text-black font-extrabold rounded-lg text-xs flex items-center gap-1">
                    ₹ Collect
                  </button>
                </div>
              </div>

              {/* 6 Metric KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                <div onClick={() => navigateTab('payments')} className={`p-3.5 rounded-xl border cursor-pointer hover:border-[#84cc16] ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">COLLECTED TODAY</p>
                  <p className="text-xl sm:text-2xl font-black text-[#84cc16] mt-1">₹{totalCollectedToday}</p>
                  <p className={`text-[9px] mt-0.5 ${subTextColor}`}>{recentCheckIns.length} check-ins</p>
                </div>
                <div onClick={() => navigateTab('expenses')} className={`p-3.5 rounded-xl border cursor-pointer hover:border-green-400 ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">THIS MONTH</p>
                  <p className={`text-xl sm:text-2xl font-black mt-1 ${textColor}`}>₹{totalMonthRevenue > 1000 ? `${(totalMonthRevenue / 1000).toFixed(1)}k` : totalMonthRevenue}</p>
                  <p className="text-[9px] text-green-500 mt-0.5">Net: ₹{netProfit}</p>
                </div>
                <div onClick={() => { navigateTab('collections'); }} className={`p-3.5 rounded-xl border cursor-pointer hover:border-rose-500 ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">DUES PENDING</p>
                  <p className="text-xl sm:text-2xl font-black text-rose-500 mt-1">₹{totalDuesPending > 1000 ? `${(totalDuesPending / 1000).toFixed(1)}k` : totalDuesPending}</p>
                  <p className={`text-[9px] mt-0.5 ${subTextColor}`}>{(dbData?.members || []).filter((m: any) => m.dues > 0).length} members</p>
                </div>
                <div onClick={() => { navigateTab('members'); }} className={`p-3.5 rounded-xl border cursor-pointer hover:border-white ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">ACTIVE MEMBERS</p>
                  <p className={`text-xl sm:text-2xl font-black mt-1 ${textColor}`}>{activeMembersCount}</p>
                  <p className="text-[9px] text-[#84cc16] mt-0.5">{(dbData?.members || []).length} registered</p>
                </div>
                <div onClick={() => { setMemberFilter('Expiring'); navigateTab('members'); }} className={`p-3.5 rounded-xl border cursor-pointer hover:border-amber-400 ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">EXPIRING 7 DAYS</p>
                  <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1">{expiringCount}</p>
                  <p className={`text-[9px] mt-0.5 ${subTextColor}`}>Up for renewal</p>
                </div>
                <div onClick={() => { navigateTab('retention'); }} className={`p-3.5 rounded-xl border cursor-pointer hover:border-rose-500 ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">REVENUE AT RISK</p>
                  <p className="text-xl sm:text-2xl font-black text-rose-500 mt-1">₹{totalDuesPending > 1000 ? `${(totalDuesPending / 1000).toFixed(1)}k` : totalDuesPending}</p>
                  <p className={`text-[9px] mt-0.5 ${subTextColor}`}>{expiringCount} high-risk</p>
                </div>
              </div>

              {/* Natural Query Banner */}
              <div className={`p-4 rounded-2xl border space-y-2.5 ${cardBg}`}>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') processAiQuery(aiQuery); }}
                    placeholder='Ask your gym anything — who has not visited in 14 days?'
                    className={`flex-1 px-4 py-2 border rounded-xl text-xs outline-none ${innerBg} ${textColor}`} 
                  />
                  <button onClick={() => processAiQuery(aiQuery)} className="px-5 py-2 bg-[#84cc16] text-black font-bold rounded-xl text-xs">Ask</button>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px] text-neutral-400">
                  <span onClick={() => { setAiQuery('Who is expiring this week?'); processAiQuery('Who is expiring this week?'); }} className={`px-2.5 py-1 rounded border cursor-pointer ${innerBg} hover:${textColor}`}>Who is expiring this week?</span>
                  <span onClick={() => { setAiQuery('Who owes money?'); processAiQuery('Who owes money?'); }} className={`px-2.5 py-1 rounded border cursor-pointer ${innerBg} hover:${textColor}`}>Who owes money?</span>
                  <span onClick={() => { setAiQuery('Who has not visited in 14 days?'); processAiQuery('Who has not visited in 14 days?'); }} className={`px-2.5 py-1 rounded border cursor-pointer ${innerBg} hover:${textColor}`}>Who hasn't visited in 14 days?</span>
                  <span onClick={() => { setAiQuery('Who might quit?'); processAiQuery('Who might quit?'); }} className={`px-2.5 py-1 rounded border cursor-pointer ${innerBg} hover:${textColor}`}>Who might quit?</span>
                  <span onClick={() => { setAiQuery('How much did we collect this month?'); processAiQuery('How much did we collect this month?'); }} className={`px-2.5 py-1 rounded border cursor-pointer ${innerBg} hover:${textColor}`}>How much did we collect this month?</span>
                </div>

                {aiQueryResult && (
                  <div className={`p-3 border border-[#84cc16]/40 rounded-xl text-xs space-y-1 mt-2 ${innerBg}`}>
                    <div className="flex justify-between items-center text-[#84cc16] font-bold">
                      <span>{aiQueryResult.title}</span>
                      <button onClick={() => setAiQueryResult(null)} className="text-neutral-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    {aiQueryResult.items.map((it: string, i: number) => (
                      <p key={i} className={subTextColor}>• {it}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 2: Real 30-Day Graph */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-3 relative ${cardBg}`}>
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <h3 className={`font-bold ${textColor}`}>Money in, last 30 days (Real Transactions)</h3>
                      <p className={`text-[10px] ${subTextColor}`}>Calculated strictly from live payments & front desk check-ins</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]" /> Digital</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Cash</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-purple-400" /> Check-ins</span>
                    </div>
                  </div>

                  {hoveredCommandBar && (
                    <div className="absolute top-12 right-6 bg-black/95 border border-neutral-700 text-white px-3 py-1.5 rounded-lg text-xs shadow-xl pointer-events-none z-10 flex gap-3 font-mono">
                      <span><strong>Date:</strong> {hoveredCommandBar.d}</span>
                      <span className="text-[#84cc16]"><strong>Digital:</strong> ₹{hoveredCommandBar.digital}</span>
                      <span className="text-cyan-400"><strong>Cash:</strong> ₹{hoveredCommandBar.cash}</span>
                      <span className="text-purple-400"><strong>Check-ins:</strong> {hoveredCommandBar.checkins}</span>
                    </div>
                  )}

                  <div className="relative pt-6 pb-2 border-b border-neutral-800">
                    <div className="h-44 flex items-end justify-between gap-1 px-1">
                      {real30DaysTimeline.map((bar, idx) => (
                        <div 
                          key={idx} 
                          onMouseEnter={() => setHoveredCommandBar(bar)}
                          onMouseLeave={() => setHoveredCommandBar(null)}
                          className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer hover:opacity-80 transition"
                        >
                          <div style={{ height: `${bar.cashPercent}%` }} className="w-full bg-cyan-400 rounded-t-sm" />
                          <div style={{ height: `${bar.digPercent}%` }} className="w-full bg-[#84cc16]" />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[9px] text-neutral-500 pt-2 font-mono">
                      <span>{real30DaysTimeline[0]?.d}</span>
                      <span>{real30DaysTimeline[10]?.d}</span>
                      <span>{real30DaysTimeline[20]?.d}</span>
                      <span>{real30DaysTimeline[29]?.d}</span>
                    </div>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border space-y-2.5 text-xs ${cardBg}`}>
                  <h3 className={`font-bold text-sm ${textColor}`}>Do this today</h3>
                  <p className={`text-[10px] ${subTextColor}`}>Everything that needs you, in one list</p>
                  
                  <div className="space-y-2 pt-1">
                    <div onClick={() => navigateTab('retention')} className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer ${innerBg}`}>
                      <span className="flex items-center gap-2"><RefreshCcw className="w-3.5 h-3.5 text-neutral-400" /> Retention calls</span>
                      <strong className="text-[#84cc16]">0/{expiringCount || 0} →</strong>
                    </div>
                    <div onClick={() => { setMemberFilter('EndingIn3Days'); navigateTab('members'); }} className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer ${innerBg}`}>
                      <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-neutral-400" /> Ending in 3 days</span>
                      <strong className="text-amber-500">{expiring3DaysCount} →</strong>
                    </div>
                    <div onClick={() => { setMemberFilter('Dues'); navigateTab('members'); }} className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer ${innerBg}`}>
                      <span className="flex items-center gap-2"><CreditCard className="w-3.5 h-3.5 text-neutral-400" /> Members with dues</span>
                      <strong className="text-rose-500">{(dbData?.members || []).filter((m: any) => m.dues > 0).length} →</strong>
                    </div>
                    <div onClick={() => alert('All auto-debits current.')} className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer ${innerBg}`}>
                      <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-neutral-400" /> Failed AutoPay</span>
                      <strong className="text-rose-500">0 →</strong>
                    </div>
                    <div onClick={() => navigateTab('leads')} className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer ${innerBg}`}>
                      <span className="flex items-center gap-2"><UserPlus className="w-3.5 h-3.5 text-neutral-400" /> Lead follow-ups due</span>
                      <strong className="text-cyan-400">{(dbData?.leads || []).length} →</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Live Floor, Metrics, Save Members */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className={`p-5 rounded-2xl border space-y-2 text-xs ${cardBg}`}>
                  <h4 className={`font-bold ${textColor}`}>Live floor</h4>
                  <p className={`text-[10px] ${subTextColor}`}>Capacity 80 • Live synced visits</p>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]" />
                    <span className="text-[10px] uppercase font-bold text-neutral-400">INSIDE NOW</span>
                    <span className={`text-2xl font-black ml-auto ${textColor}`}>{recentCheckIns.length}</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 pt-3">
                    {[1, 2, 3, 4, 5, 6, 7].map(col => (
                      <div key={col} className="space-y-1">
                        <div className={`h-4 rounded-sm ${col > 4 ? 'bg-[#84cc16]' : 'bg-[#84cc16]/30'}`} />
                        <div className={`h-4 rounded-sm ${col > 3 ? 'bg-[#84cc16]/80' : 'bg-[#84cc16]/20'}`} />
                        <div className={`h-4 rounded-sm ${col > 2 ? 'bg-[#84cc16]/60' : 'bg-[#84cc16]/10'}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-neutral-500 pt-1"><span>6am</span><span>12pm</span><span>10pm</span></div>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 text-xs ${cardBg}`}>
                  <h4 className={`font-bold ${textColor}`}>Is Repflow working?</h4>
                  <p className={`text-[10px] ${subTextColor}`}>Live metric benchmarking</p>
                  
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1"><span>On-time collection rate</span><strong>100%</strong></div>
                      <div className="h-1.5 rounded-full bg-neutral-800"><div className="w-full h-full bg-[#84cc16] rounded-full" /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1"><span>Renewal rate</span><strong>{(dbData?.members || []).length > 0 ? Math.round((activeMembersCount / (dbData?.members || []).length) * 100) : 100}%</strong></div>
                      <div className="h-1.5 rounded-full bg-neutral-800"><div style={{ width: `${(dbData?.members || []).length > 0 ? Math.round((activeMembersCount / (dbData?.members || []).length) * 100) : 100}%` }} className="h-full bg-[#84cc16] rounded-full" /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1"><span>Members on AutoPay</span><strong>22%</strong></div>
                      <div className="h-1.5 rounded-full bg-neutral-800"><div className="w-[22%] h-full bg-[#84cc16] rounded-full" /></div>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl border text-[11px] font-mono mt-2 ${innerBg}`}>
                    Active members: <strong>{activeMembersCount}</strong> • Profit: <strong className="text-[#84cc16]">₹{netProfit}</strong>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border space-y-2 text-xs ${cardBg}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className={`font-bold ${textColor}`}>Save these members</h4>
                      <p className={`text-[10px] ${subTextColor}`}>Highest value, highest risk</p>
                    </div>
                    <span onClick={() => navigateTab('retention')} className="text-[#84cc16] text-[11px] font-bold cursor-pointer">All →</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {(dbData?.members || []).slice(0, 4).map((m: any, i: number) => (
                      <div key={m.code || "IT1001"} className={`flex justify-between items-center p-2 rounded-xl border ${innerBg}`}>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#84cc16]/20 text-[#84cc16] flex items-center justify-center font-bold text-[10px]">{(m?.name ? m.name.charAt(0) : "M")}</span>
                          <div>
                            <strong className={textColor}>{m.name}</strong>
                            <p className={`text-[9px] ${subTextColor}`}>Dues: ₹{m.dues} • {m.plan}</p>
                          </div>
                        </div>
                        <button onClick={() => openWhatsApp(m.phone, `Hi ${m.name}, update from ${dbData?.gymProfile?.name}!`)} className="p-1.5 text-[#84cc16] hover:bg-[#84cc16]/10 rounded">
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Morning Briefing */}
              <div className={`p-5 rounded-2xl border space-y-2.5 text-xs ${cardBg}`}>
                <div className="flex items-center gap-2 text-amber-500 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Your morning briefing</span>
                  <span className="text-[10px] text-neutral-400 font-normal ml-auto">Delivered to WhatsApp daily</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-neutral-300">
                  <div className="space-y-1">
                    <p>• Collected today: <strong>₹{totalCollectedToday}</strong></p>
                    <p>• Dues outstanding: <strong className="text-rose-400">₹{totalDuesPending}</strong> across {(dbData?.members || []).filter((m: any) => m.dues > 0).length} members</p>
                    <p>• Check-ins recorded today: <strong>{recentCheckIns.length}</strong></p>
                  </div>
                  <div className="space-y-1">
                    <p>• Month to date: <strong className="text-[#84cc16]">₹{totalMonthRevenue}</strong></p>
                    <p>• Expiring in 7 days: <strong className="text-amber-400">{expiringCount} members</strong></p>
                    <p>• Active pipeline leads: <strong>{(dbData?.leads || []).length} enquiries</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERS */}
          {currentTab === 'members' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className={`text-base sm:text-xl font-bold ${textColor}`}>{t.members}</h2>
                  <p className={`text-[10px] sm:text-xs ${subTextColor}`}>
                    {memberFilter === 'EndingIn3Days' ? 'Filtered: Members expiring within 3 days' : `${dbData?.members?.length || 0} registered members`}
                  </p>
                </div>
                {canPerform('Add & edit members') && (
                  <button onClick={(e) => openFreshNewMemberModal(e)} className="px-3 py-1.5 bg-[#84cc16] text-black font-bold rounded-lg text-xs">+ New member</button>
                )}
              </div>

              {!isTrainer && (
                <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs font-semibold">
                  {['All', 'Active', 'EndingIn3Days', 'Expiring', 'Expired', 'Lapsed', 'Dues', 'Cancelled'].map(filterKey => (
                    <button 
                      key={filterKey}
                      onClick={() => setMemberFilter(filterKey)}
                      className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border transition ${memberFilter === filterKey ? 'bg-[#84cc16] text-black border-[#84cc16] font-bold' : `${cardBg} ${subTextColor} hover:${textColor}`}`}
                    >
                      {filterKey === 'EndingIn3Days' ? 'Ending in 3 days' : filterKey}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input 
                  type="text" 
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members by name, phone or code..."
                  className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs outline-none ${cardBg} ${textColor}`}
                />
              </div>

              <div className={`border rounded-xl overflow-x-auto ${cardBg}`}>
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className={theme === 'dark' ? 'bg-[#121418] text-neutral-400' : 'bg-slate-100 text-slate-600'}>
                    <tr>
                      <th className="p-2.5 sm:p-3">MEMBER</th>
                      {isTrainer ? (
                        <>
                          <th className="p-2.5 sm:p-3">ASSIGNED SESSIONS</th>
                          <th className="p-2.5 sm:p-3">PRICE</th>
                          <th className="p-2.5 sm:p-3">VALIDITY</th>
                        </>
                      ) : (
                        <>
                          <th className="p-2.5 sm:p-3">STATUS</th>
                          <th className="p-2.5 sm:p-3">PLAN</th>
                          <th className="p-2.5 sm:p-3">DAYS LEFT</th>
                          <th className="p-2.5 sm:p-3">DUES</th>
                        </>
                      )}
                      <th className="p-2.5 sm:p-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                    {(dbData?.members || []).filter((m: any) => {
                      if (isTrainer) return trainerAssignedMembers.includes(m.name?.toLowerCase());
                      if (memberFilter === 'Active') return m.status === 'Active';
                      if (memberFilter === 'EndingIn3Days') return getDaysLeft(m.expires) <= 3 && m.status !== 'Expired';
                      if (memberFilter === 'Expiring') return getDaysLeft(m.expires) <= 7 && m.status !== 'Expired';
                      if (memberFilter === 'Expired') return m.status === 'Expired' || getDaysLeft(m.expires) === 0;
                      if (memberFilter === 'Lapsed') return m.status === 'Lapsed';
                      if (memberFilter === 'Dues') return m.dues > 0;
                      if (memberFilter === 'Cancelled') return m.status === 'Cancelled';
                      return true;
                    }).filter((m: any) => {
                      return ((m?.name || "").toLowerCase()).includes(memberSearch.toLowerCase()) || 
                             ((m?.phone || "").includes)(memberSearch) || 
                             (((m?.code || m?.id || "").toLowerCase())).includes(memberSearch.toLowerCase());
                    }).map((m: any) => {
                      const ptRecord = (dbData?.ptAssignments || []).find((p: any) => p.member?.toLowerCase() === m.name?.toLowerCase());
                      return (
                        <tr key={m.code || "IT1001"} onClick={() => setSelectedMemberProfile(m)} className="hover:bg-[#84cc16]/5 cursor-pointer">
                          <td className="p-2.5 sm:p-3 font-semibold">{m.name} <br/><span className="text-[10px] text-neutral-400 font-normal">{m.code || "IT1001"} • {m.phone}</span></td>
                          {isTrainer ? (
                            <>
                              <td className="p-2.5 sm:p-3 font-mono text-[#84cc16] font-bold">{ptRecord?.sessions || 12} sessions</td>
                              <td className={`p-2.5 sm:p-3 font-bold ${textColor}`}>₹{ptRecord?.price || 6000}</td>
                              <td className={`p-2.5 sm:p-3 ${subTextColor}`}>{formatDDMMYYYY(ptRecord.startDate)} to {formatDDMMYYYY(ptRecord.endDate)}</td>
                            </>
                          ) : (
                            <>
                              <td className="p-2.5 sm:p-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-green-500/10 text-green-500 font-bold">{m.status}</span></td>
                              <td className={`p-2.5 sm:p-3 ${subTextColor}`}>{m.plan}</td>
                              <td className="p-2.5 sm:p-3 font-bold text-amber-500">{getDaysLeft(m.expires)} days</td>
                              <td className="p-2.5 sm:p-3 font-bold text-rose-500">₹{m.dues}</td>
                            </>
                          )}
                          <td className="p-2.5 sm:p-3 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                            {canPerform('Add & edit members') && (
                              <button onClick={(e) => { e.stopPropagation(); setShowEditMemberModal({ ...m }); }} className="p-1 text-neutral-400 hover:text-[#84cc16]" title="Edit member"><Edit3 className="w-3.5 h-3.5 inline" /></button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); openWhatsApp(m.phone, `Hi ${m.name}, update from ${dbData?.gymProfile?.name}!`); }} className="px-2 py-1 bg-[#84cc16]/10 text-[#84cc16] font-bold rounded text-[11px]">WhatsApp</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LEADS */}
          {currentTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className={`text-base sm:text-xl font-bold ${textColor}`}>Leads Pipeline</h2>
                  <p className={`text-[10px] sm:text-xs ${subTextColor}`}>Drag or click three dots to move across stages.</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setShowNewLeadModal(true); }} className="px-3 py-1.5 bg-[#84cc16] text-black font-bold rounded text-xs">+ New lead</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
                {['New', 'Contacted', 'Trial', 'Negotiating', 'Converted', 'Lost'].map(stage => {
                  const sLeads = (dbData?.leads || []).filter((l: any) => l.stage.toLowerCase() === stage.toLowerCase());
                  return (
                    <div key={stage} className={`p-2.5 rounded-xl border space-y-2 min-h-[160px] ${cardBg}`}>
                      <div className="flex justify-between items-center text-xs font-bold text-neutral-400 pb-1 border-b border-neutral-800">
                        <span>• {stage}</span>
                        <span className={`text-[10px] px-1.5 rounded ${innerBg}`}>{sLeads.length}</span>
                      </div>
                      {sLeads.map((lead: any) => (
                        <div key={lead.id} className={`p-2.5 rounded-lg border relative space-y-1 ${innerBg}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className={`font-bold text-xs ${textColor}`}>{lead.name}</div>
                              <div className={`text-[10px] ${subTextColor}`}>{lead.source} • {lead.plan}</div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setActiveLeadDropdown(activeLeadDropdown === lead.id ? null : lead.id); }} className="text-neutral-400 hover:text-white p-1">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {activeLeadDropdown === lead.id && (
                            <div className={`absolute right-2 top-8 z-30 border rounded-lg p-1.5 shadow-2xl text-[11px] space-y-1 w-36 ${cardBg}`}>
                              <p className="text-[9px] text-neutral-500 uppercase px-2 py-0.5 font-bold">Move to:</p>
                              {['New', 'Contacted', 'Trial', 'Negotiating', 'Converted', 'Lost'].map(ns => (
                                <button key={ns} onClick={() => handleMoveLeadStage(lead.id, ns)} className={`w-full text-left px-2 py-1 rounded ${subTextColor} hover:${textColor} hover:bg-[#84cc16]/10`}>
                                  {ns}
                                </button>
                              ))}
                            </div>
                          )}
                          <button onClick={() => openWhatsApp(lead.phone, `Hi ${lead.name}, trial session coordination from ${dbData?.gymProfile?.name}!`)} className="w-full py-1 text-center bg-[#84cc16]/10 text-[#84cc16] text-[10px] font-bold rounded">
                            WhatsApp
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: TRAINERS & PT */}
          {currentTab === 'trainers' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className={`text-base sm:text-xl font-bold ${textColor}`}>Trainers & PT</h2>
                  <p className={`text-[10px] sm:text-xs ${subTextColor}`}>
                    {isTrainer ? `Welcome, ${activeUser.name}. Manage your assigned clients and sessions.` : 'Manage trainers, assign PT packages to members, and track commissions.'}
                  </p>
                </div>
                {activeUser.role === 'Owner' && (
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setShowAddTrainerModal(true); }} className="px-3 py-1.5 bg-neutral-800 text-white rounded text-xs">+ Add Trainer</button>
                    <button onClick={(e) => { e.stopPropagation(); setPtMemberSearch(''); setShowAddPTModal(true); }} className="px-3.5 py-1.5 bg-[#84cc16] text-black font-bold rounded text-xs">+ Assign PT</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(dbData?.trainers || [])
                  .filter((tr: any) => isTrainer ? tr.name?.toLowerCase() === activeUser.name?.toLowerCase() : true)
                  .filter((tr: any) => tr.name.toLowerCase().includes(trainerSearch.toLowerCase())).map((trainer: any) => (
                    <div key={trainer.id} className={`p-4 rounded-xl border space-y-2.5 ${cardBg}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className={`font-bold text-sm ${textColor}`}>{trainer.name}</h4>
                            {activeUser.role === 'Owner' && (
                              <button onClick={(e) => { e.stopPropagation(); setShowEditTrainerModal(trainer); }} className="p-1 text-neutral-400 hover:text-[#84cc16]">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className={`text-[10px] ${subTextColor}`}>{trainer.specialty}</p>
                        </div>
                        <span className="text-xs font-bold text-amber-500 bg-amber-400/10 px-2 py-0.5 rounded">★ {trainer.rating || "5.0"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-neutral-800">
                        <div>Clients: <strong>{trainer.clients || 0}</strong></div>
                        <div>Sessions: <strong>{trainer.sessions || 0}</strong></div>
                        <div>PT Sold: <strong>₹{trainer.sold || 0}</strong></div>
                        <div>Commission: <strong className="text-[#84cc16]">₹{trainer.commission || 0}</strong></div>
                      </div>
                    </div>
                ))}
              </div>

              <div className={`border rounded-xl overflow-hidden ${cardBg}`}>
                <div className="p-3 border-b text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  {isTrainer ? `My Assigned Clients (${trainerAssignedMembers.length})` : 'Assigned Personal Training Clients'}
                </div>
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className={theme === 'dark' ? 'bg-[#121418] text-neutral-400' : 'bg-slate-100 text-slate-600'}>
                    <tr>
                      <th className="p-2.5 sm:p-3">MEMBER</th>
                      {!isTrainer && <th className="p-2.5 sm:p-3">TRAINER</th>}
                      <th className="p-2.5 sm:p-3">SESSIONS</th>
                      <th className="p-2.5 sm:p-3">VALIDITY</th>
                      <th className="p-2.5 sm:p-3">PRICE</th>
                      <th className="p-2.5 sm:p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                    {(dbData?.ptAssignments || [])
                      .filter((pt: any) => isTrainer ? pt.trainer?.toLowerCase() === activeUser.name?.toLowerCase() : true)
                      .map((pt: any) => (
                        <tr key={pt.id}>
                          <td className={`p-2.5 sm:p-3 font-semibold ${textColor}`}>{pt.member}</td>
                          {!isTrainer && <td className={`p-2.5 sm:p-3 ${subTextColor}`}>{pt.trainer}</td>}
                          <td className="p-2.5 sm:p-3 font-mono text-[#84cc16] font-bold">{pt.sessions} left</td>
                          <td className={`p-2.5 sm:p-3 ${subTextColor}`}>{formatDDMMYYYY(pt.startDate)} to {formatDDMMYYYY(pt.endDate)}</td>
                          <td className={`p-2.5 sm:p-3 font-bold ${textColor}`}>₹{pt.price}</td>
                          <td className="p-2.5 sm:p-3 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => handleCompletePTSession(pt.id)}
                              disabled={pt.sessions <= 0}
                              className={`px-2 py-1 rounded text-[11px] font-bold ${pt.sessions > 0 ? 'bg-[#84cc16] text-black hover:bg-[#72b012]' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
                            >
                              -1 Session
                            </button>
                            {canPerform('Manage PT sessions') && (
                              <button onClick={(e) => { e.stopPropagation(); setEditPtMemberSearch(''); setShowEditPTModal(pt); }} className="p-1 text-neutral-400 hover:text-[#84cc16]">
                                <Edit3 className="w-3.5 h-3.5 inline" />
                              </button>
                            )}
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: COLLECTIONS */}
          {currentTab === 'collections' && (
            <div className="space-y-4">
              <h2 className={`text-base sm:text-xl font-bold ${textColor}`}>Collections (Total Dues: ₹{totalDuesPending})</h2>
              <div className={`border rounded-xl overflow-x-auto ${cardBg}`}>
                <table className="w-full text-left text-xs min-w-[450px]">
                  <thead className={theme === 'dark' ? 'bg-[#121418] text-neutral-400' : 'bg-slate-100 text-slate-600'}>
                    <tr><th className="p-2.5 sm:p-3">MEMBER</th><th className="p-2.5 sm:p-3">DUES</th><th className="p-2.5 sm:p-3 text-right">ACTION</th></tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                    {(dbData?.members || []).filter((m: any) => m.dues > 0).map((m: any) => (
                      <tr key={m.code || "IT1001"}>
                        <td className={`p-2.5 sm:p-3 font-semibold ${textColor}`}>{m.name}</td>
                        <td className="p-2.5 sm:p-3 font-bold text-rose-500">₹{m.dues}</td>
                        <td className="p-2.5 sm:p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button onClick={(e) => { e.stopPropagation(); setPayForm({ member: m.name, phone: m.phone, amount: String(m.dues), method: 'UPI', category: 'Membership', note: 'Dues settled' }); setShowPaymentModal(true); }} className="px-3 py-1 bg-[#84cc16] text-black font-bold rounded text-xs">
                            Collect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PAYMENTS */}
          {currentTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className={`text-base sm:text-xl font-bold ${textColor}`}>{t.payments}</h2>
                <button onClick={(e) => { e.stopPropagation(); setPayMemberSearch(''); setShowPaymentModal(true); }} className="px-3.5 py-1.5 bg-[#84cc16] text-black font-bold rounded text-xs">+ Record Payment</button>
              </div>
              <div className={`border rounded-xl overflow-x-auto ${cardBg}`}>
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className={theme === 'dark' ? 'bg-[#121418] text-neutral-400' : 'bg-slate-100 text-slate-600'}>
                    <tr>
                      <th className="p-2.5 sm:p-3">RECEIPT</th>
                      <th className="p-2.5 sm:p-3">MEMBER</th>
                      <th className="p-2.5 sm:p-3">TYPE</th>
                      <th className="p-2.5 sm:p-3">DATE (DD-MM-YYYY)</th>
                      <th className="p-2.5 sm:p-3">AMOUNT</th>
                      <th className="p-2.5 sm:p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                    {(dbData?.payments || []).map((p: any) => (
                      <tr key={p.receipt}>
                        <td className="p-2.5 sm:p-3 font-mono text-[#84cc16] font-bold">{p.receipt}</td>
                        <td className={`p-2.5 sm:p-3 font-semibold ${textColor}`}>{p.member}</td>
                        <td className={`p-2.5 sm:p-3 ${subTextColor}`}>{p.plan}</td>
                        <td className="p-2.5 sm:p-3 font-mono">{formatDDMMYYYY(p.date || todayStr)}</td>
                        <td className={`p-2.5 sm:p-3 font-bold ${textColor}`}>₹{p.amount}</td>
                        <td className="p-2.5 sm:p-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => downloadOfficialTemplatePDF(p)} className={`px-2 py-1 rounded text-[11px] inline-flex items-center gap-1 ${innerBg} ${textColor}`}>
                            <Download className="w-3 h-3" /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: STORE */}
          {currentTab === 'store' && (
            <div className={`h-[60vh] flex flex-col items-center justify-center text-center p-4 border rounded-2xl ${cardBg}`}>
              <div className="p-4 rounded-full bg-[#84cc16]/10 text-[#84cc16] mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Store & POS — Coming Soon</h2>
              <p className={`text-xs max-w-xs mt-1 ${subTextColor}`}>Inventory tracking and supplement counter billing will be enabled soon.</p>
            </div>
          )}

          {/* TAB 8: EXPENSES & P&L */}
          {currentTab === 'expenses' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className={`text-base sm:text-xl font-bold ${textColor}`}>Expenses & P&L</h2>
                  <p className={`text-[10px] sm:text-xs ${subTextColor}`}>Real-time dynamic accounting with period-wise statements.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={downloadFilteredExpensesPDF} className={`px-3 py-1.5 border rounded-lg text-xs font-semibold flex items-center gap-1.5 ${cardBg} ${textColor} hover:border-[#84cc16]`}>
                    <Download className="w-3.5 h-3.5" /> Download P&L (PDF)
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setShowAddExpenseModal(true); }} className="px-3.5 py-1.5 bg-[#84cc16] text-black font-bold rounded-lg text-xs">+ Add expense</button>
                </div>
              </div>

              {/* Date Filter Bar */}
              <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${cardBg}`}>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-neutral-400">Filter Period:</span>
                  <input 
                    type="date" 
                    value={expenseStartDate} 
                    onChange={(e) => setExpenseStartDate(e.target.value)} 
                    className={`px-2 py-1 rounded border outline-none ${innerBg} ${textColor}`} 
                  />
                  <span className="text-neutral-500">to</span>
                  <input 
                    type="date" 
                    value={expenseEndDate} 
                    onChange={(e) => setExpenseEndDate(e.target.value)} 
                    className={`px-2 py-1 rounded border outline-none ${innerBg} ${textColor}`} 
                  />
                  {(expenseStartDate || expenseEndDate) && (
                    <button onClick={() => { setExpenseStartDate(''); setExpenseEndDate(''); }} className="text-xs text-rose-500 hover:underline ml-1">Clear</button>
                  )}
                </div>
                <div className="text-xs font-mono">
                  Showing <strong>{filteredExpensesList.length}</strong> records (Total: <strong className="text-rose-500">₹{filteredExpenseTotal}</strong>)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-4 rounded-xl border ${cardBg}`}>
                  <p className="text-[10px] text-neutral-400">TOTAL INCOME</p>
                  <p className="text-xl sm:text-2xl font-black text-green-500 mt-1">₹{totalMonthRevenue}</p>
                </div>
                <div className={`p-4 rounded-xl border ${cardBg}`}>
                  <p className="text-[10px] text-neutral-400">TOTAL EXPENSES (FILTERED)</p>
                  <p className="text-xl sm:text-2xl font-black text-rose-500 mt-1">₹{filteredExpenseTotal}</p>
                </div>
                <div className={`p-4 rounded-xl border ${cardBg}`}>
                  <p className="text-[10px] text-neutral-400">NET PROFIT (PERIOD)</p>
                  <p className={`text-xl sm:text-2xl font-black mt-1 ${totalMonthRevenue - filteredExpenseTotal >= 0 ? 'text-[#84cc16]' : 'text-rose-500'}`}>
                    ₹{totalMonthRevenue - filteredExpenseTotal}
                  </p>
                </div>
              </div>

              <div className={`border rounded-xl overflow-x-auto ${cardBg}`}>
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead className={theme === 'dark' ? 'bg-[#121418] text-neutral-400' : 'bg-slate-100 text-slate-600'}>
                    <tr>
                      <th className="p-3">DATE (DD-MM-YYYY)</th>
                      <th className="p-3">CATEGORY</th>
                      <th className="p-3">PAID TO</th>
                      <th className="p-3">METHOD</th>
                      <th className="p-3">AMOUNT</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                    {filteredExpensesList.map((exp: any) => (
                      <tr key={exp.id}>
                        <td className="p-3 font-mono">{formatDDMMYYYY(exp.date)}</td>
                        <td className={`p-3 font-semibold ${textColor}`}>{exp.category}</td>
                        <td className={`p-3 ${subTextColor}`}>{exp.paidTo}</td>
                        <td className="p-3">{exp.method}</td>
                        <td className="p-3 font-bold text-rose-500">₹{exp.amount}</td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button onClick={async () => { await fetch(`/api/expenses/${exp.id}`, { method: 'DELETE' }); fetchData(); }} className="text-neutral-400 hover:text-rose-500 p-1">
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredExpensesList.length === 0 && (
                      <tr><td colSpan={6} className={`p-6 text-center ${subTextColor}`}>No expenses logged for this filter.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: RETENTION */}
          {currentTab === 'retention' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className={`text-base sm:text-xl font-bold ${textColor}`}>Retention</h2>
                <p className={`text-[10px] sm:text-xs ${subTextColor}`}>Your daily list of members to call before they quit.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                <div className={`p-3 sm:p-4 rounded-xl border ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">TODAY'S CALLS</p>
                  <p className={`text-lg sm:text-2xl font-black mt-1 ${textColor}`}>{retentionDoneCount}/{expiringCount || 0}</p>
                </div>
                <div className={`p-3 sm:p-4 rounded-xl border ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">REVENUE AT RISK</p>
                  <p className="text-lg sm:text-2xl font-black text-rose-500 mt-1">₹{totalDuesPending}</p>
                </div>
                <div className={`p-3 sm:p-4 rounded-xl border ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">RENEWAL RATE</p>
                  <p className={`text-lg sm:text-2xl font-black mt-1 ${textColor}`}>{(dbData?.members || []).length > 0 ? Math.round((activeMembersCount / (dbData?.members || []).length) * 100) : 0}%</p>
                </div>
                <div className={`p-3 sm:p-4 rounded-xl border ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">SAVED THIS MONTH</p>
                  <p className="text-lg sm:text-2xl font-black text-[#84cc16] mt-1">{retentionDoneCount}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className={`lg:col-span-2 border rounded-2xl overflow-hidden ${cardBg}`}>
                  <div className={`p-3 border-b flex justify-between items-center text-xs ${innerBg}`}>
                    <div>
                      <span className={`font-bold ${textColor}`}>Today's worklist</span>
                      <p className={`text-[9px] sm:text-[10px] ${subTextColor}`}>Call and record feedback.</p>
                    </div>
                    <span className="text-neutral-500 font-mono text-[11px]">To call: {Math.max(0, expiringCount - retentionDoneCount)}</span>
                  </div>

                  <div className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                    {(dbData?.members || []).filter((m: any) => m.dues > 0 || getDaysLeft(m.expires) <= 7).map((item: any) => (
                      <div key={item.memberCode || item.code || "IT1001"} className="p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className={`font-bold text-xs flex items-center gap-1.5 ${textColor}`}>
                              {item.name}
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/30">
                                {getDaysLeft(item.expires) <= 3 ? 'High Risk' : 'Medium Risk'}
                              </span>
                            </div>
                            <p className={`text-[10px] mt-0.5 ${subTextColor}`}>
                              {item.plan} • Ends {formatDDMMYYYY(item.expires)} ({getDaysLeft(item.expires)}d left) • Dues: ₹{item.dues}
                            </p>
                          </div>
                          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => openWhatsApp(item.phone, retentionScript.replace('{name}', item.name))} className="p-1 bg-[#84cc16]/10 text-[#84cc16] border border-[#84cc16]/30 text-xs font-bold rounded">
                              <MessageCircle className="w-3.5 h-3.5 inline" />
                            </button>
                            <button onClick={() => openSMS(item.phone, retentionScript.replace('{name}', item.name))} className={`p-1 border text-xs font-bold rounded ${innerBg} ${textColor}`}>
                              <Phone className="w-3.5 h-3.5 inline" />
                            </button>
                          </div>
                        </div>

                        <div className={`p-2.5 border rounded-xl space-y-1 ${innerBg}`} onClick={(e) => e.stopPropagation()}>
                          <span className="text-[9px] font-bold uppercase text-neutral-400">WHAT TO SAY (Editable)</span>
                          <textarea 
                            rows={2}
                            value={retentionScript}
                            onChange={(e) => setRetentionScript(e.target.value)}
                            className={`w-full bg-transparent text-[11px] outline-none resize-none ${textColor}`}
                          />
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 pt-0.5 text-[10px]" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { setRetentionDoneCount(retentionDoneCount + 1); alert(`Recorded: ${item.name} will renew!`); }} className={`py-1 rounded border ${innerBg} hover:border-green-500`}>Will renew</button>
                          <button onClick={() => alert(`Recorded: Call back ${item.name} later`)} className={`py-1 rounded border ${innerBg} hover:border-amber-500`}>Call back</button>
                          <button onClick={() => alert(`Recorded: ${item.name} not reachable`)} className={`py-1 rounded border ${innerBg} hover:border-neutral-500`}>No answer</button>
                          <button onClick={() => alert(`Recorded: ${item.name} not interested`)} className={`py-1 rounded border text-rose-500 hover:border-rose-500 ${innerBg}`}>Not interested</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2.5 text-xs ${cardBg}`}>
                  <div>
                    <h3 className={`font-bold ${textColor}`}>Churn watchlist</h3>
                    <p className={`text-[10px] ${subTextColor}`}>Why each member might quit</p>
                  </div>
                  <div className="space-y-2">
                    {(dbData?.members || []).map((m: any, idx: number) => (
                      <div key={m.code || "IT1001"} className={`p-2.5 rounded-xl border flex justify-between items-center ${innerBg}`}>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-[9px] font-bold">8{idx}</span>
                            <strong className={textColor}>{m.name}</strong>
                          </div>
                          <p className={`text-[9px] mt-0.5 ${subTextColor}`}>Expires: {formatDDMMYYYY(m.expires)} ({getDaysLeft(m.expires)}d left)</p>
                        </div>
                        <strong className={textColor}>₹{m.dues > 0 ? m.dues : 1500}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: MESSAGES & BROADCASTS */}
          {currentTab === 'messages' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className={`text-base sm:text-xl font-bold ${textColor}`}>Messages & Broadcasts</h2>
                <p className={`text-[10px] sm:text-xs ${subTextColor}`}>Filter audience cohort to see exact targeted recipients.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 text-xs ${cardBg}`} onClick={(e) => e.stopPropagation()}>
                  <div>
                    <label className="text-neutral-400">Audience Cohort</label>
                    <select 
                      value={broadcastTarget} 
                      onChange={(e) => {
                        const target = e.target.value;
                        setBroadcastTarget(target);
                        if (target === 'Members with Dues') {
                          setBroadcastMessage('Hi {name}, you have a balance due of {balance} at Iron Temple Fitness. Please clear it online: upi.pay...');
                        } else if (target === 'Expiring in 7 Days') {
                          setBroadcastMessage('Hi {name}, friendly reminder that your gym membership expires in {days} days. Renew now to avoid break in streak!');
                        } else {
                          setBroadcastMessage('Hi {name}, thank you for being a part of Iron Temple Fitness. Keep pushing your fitness goals!');
                        }
                      }} 
                      className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`}
                    >
                      <option>All Members</option>
                      <option>Expiring in 7 Days</option>
                      <option>Members with Dues</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400">Message Content ({`{name}`}, {`{balance}`}, {`{days}`})</label>
                    <textarea 
                      rows={4} 
                      value={broadcastMessage} 
                      onChange={(e) => setBroadcastMessage(e.target.value)} 
                      className={`w-full mt-1 px-3 py-2 border rounded-lg outline-none ${innerBg} ${textColor}`} 
                    />
                  </div>
                </div>

                <div className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 text-xs ${cardBg}`}>
                  <span className={`font-bold ${textColor}`}>Target Recipients ({cohortList.length})</span>
                  <div className="space-y-2 overflow-y-auto max-h-[350px]">
                    {cohortList.map((m: any) => {
                      const finalMsg = broadcastMessage
                        .replace('{name}', m.name)
                        .replace('{balance}', `₹${m.dues}`)
                        .replace('{days}', `${getDaysLeft(m.expires)}`);
                      return (
                        <div key={m.code || "IT1001"} className={`p-2.5 rounded-lg border flex justify-between items-center ${innerBg}`}>
                          <div>
                            <strong className={textColor}>{m.name}</strong>
                            <div className={`text-[10px] ${subTextColor}`}>+91 {m.phone} • Dues: ₹{m.dues}</div>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openWhatsApp(m.phone, finalMsg); }}
                            className="px-3 py-1 bg-[#84cc16]/10 text-[#84cc16] rounded font-bold text-[10px] hover:bg-[#84cc16] hover:text-black transition"
                          >
                            Send
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: REPORTS */}
          {currentTab === 'reports' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className={`text-base sm:text-xl font-bold ${textColor}`}>Reports</h2>
                <p className={`text-[10px] sm:text-xs ${subTextColor}`}>The numbers that matter, and one-click tabular exports for your CA.</p>
              </div>

              {/* 4 Top KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">REVENUE THIS MONTH</p>
                  <p className="text-xl sm:text-2xl font-black text-[#84cc16] mt-1">₹{totalMonthRevenue > 1000 ? `${(totalMonthRevenue / 1000).toFixed(1)}k` : totalMonthRevenue}</p>
                  <p className="text-[9px] text-green-500 mt-0.5">Live from payments</p>
                </div>
                <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">AVG REVENUE / MEMBER</p>
                  <p className={`text-xl sm:text-2xl font-black mt-1 ${textColor}`}>₹{activeMembersCount > 0 ? Math.round(totalMonthRevenue / activeMembersCount) : 0}</p>
                  <p className="text-[9px] text-green-500 mt-0.5">Calculated per active base</p>
                </div>
                <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">RENEWAL RATE</p>
                  <p className={`text-xl sm:text-2xl font-black mt-1 ${textColor}`}>{(dbData?.members || []).length > 0 ? Math.round((activeMembersCount / (dbData?.members || []).length) * 100) : 60}%</p>
                  <p className={`text-[9px] mt-0.5 ${subTextColor}`}>Active / Registered</p>
                </div>
                <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">LEAD CONVERSION</p>
                  <p className={`text-xl sm:text-2xl font-black mt-1 ${textColor}`}>
                    {(dbData?.leads || []).length > 0 ? Math.round(((dbData.leads.filter((l: any) => l.stage === 'Converted').length) / (dbData?.leads || []).length) * 100) : 0}%
                  </p>
                  <p className={`text-[9px] mt-0.5 ${subTextColor}`}>{(dbData?.leads || []).filter((l: any) => l.stage === 'Converted').length} of {(dbData?.leads || []).length} converted</p>
                </div>
              </div>

              {/* Row 2: Real Synchronized 6 Months & Donut Chart (Strictly clean Rupee) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-3 relative ${cardBg}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-bold ${textColor}`}>Revenue — last 6 months (Dynamic)</span>
                    <span className="text-[#84cc16] font-mono">₹{totalMonthRevenue} this month</span>
                  </div>

                  {hoveredReportBar && (
                    <div className="absolute top-12 right-6 bg-black/95 border border-neutral-700 text-white px-3 py-1.5 rounded-lg text-xs shadow-xl pointer-events-none z-10 font-mono">
                      Month: <strong>{hoveredReportBar.m}</strong> | Total: <strong className="text-[#84cc16]">₹{hoveredReportBar.total}</strong>
                    </div>
                  )}

                  <div className={`h-48 flex items-end justify-between gap-3 pt-6 border-b pb-2 ${theme === 'dark' ? 'border-neutral-800' : 'border-slate-200'}`}>
                    {[
                      { m: "May", total: 0 },
                      { m: "Jun", total: 0 },
                      { m: "Jul", total: 0 },
                      { m: "Aug", total: 0 },
                      { m: "Sept", total: 0 },
                      { m: "Oct", total: totalMonthRevenue }
                    ].map((bar, i) => {
                      const maxBarVal = Math.max(1000, totalMonthRevenue);
                      const barH = bar.total > 0 ? Math.min(90, Math.max(15, Math.round((bar.total / maxBarVal) * 85))) : 0;
                      return (
                        <div 
                          key={i} 
                          onMouseEnter={() => setHoveredReportBar(bar)}
                          onMouseLeave={() => setHoveredReportBar(null)}
                          className="flex-1 flex flex-col items-center gap-1 h-full justify-end cursor-pointer hover:opacity-80 transition"
                        >
                          <div style={{ height: `${barH}%` }} className="w-full bg-[#84cc16] rounded-t" />
                          <span className={`text-[10px] ${subTextColor} pt-1`}>{bar.m}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 text-xs flex flex-col items-center justify-center relative ${cardBg}`}>
                  <span className={`font-bold self-start ${textColor}`}>How members pay (Last 30 days)</span>

                  {hoveredDonutSegment && (
                    <div className="absolute top-12 right-6 bg-black/95 border border-neutral-700 text-white px-2.5 py-1 rounded-lg text-xs shadow-xl pointer-events-none z-10 font-mono">
                      {hoveredDonutSegment}
                    </div>
                  )}

                  {(() => {
                    const cashTotal = (dbData?.payments || []).filter((p: any) => p.method === 'Cash').reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
                    const upiTotal = (dbData?.payments || []).filter((p: any) => p.method !== 'Cash').reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
                    return (
                      <>
                        <div className="relative w-36 h-36 flex items-center justify-center my-2 cursor-pointer">
                          <div 
                            onMouseEnter={() => setHoveredDonutSegment(`Total Collected: ₹${totalMonthRevenue}`)}
                            onMouseLeave={() => setHoveredDonutSegment(null)}
                            className="w-32 h-32 rounded-full border-[14px] border-[#84cc16] border-t-cyan-400 flex items-center justify-center hover:scale-105 transition"
                          >
                            <span className={`font-bold text-xs ${textColor}`}>₹{totalMonthRevenue}</span>
                          </div>
                        </div>
                        <div className={`flex justify-between w-full text-[11px] pt-1 ${subTextColor}`}>
                          <span 
                            onMouseEnter={() => setHoveredDonutSegment(`Cash: ₹${cashTotal}`)}
                            onMouseLeave={() => setHoveredDonutSegment(null)}
                            className="flex items-center gap-1 cursor-pointer hover:text-white"
                          >
                            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Cash (₹{cashTotal})
                          </span>
                          <span 
                            onMouseEnter={() => setHoveredDonutSegment(`Digital/UPI: ₹${upiTotal}`)}
                            onMouseLeave={() => setHoveredDonutSegment(null)}
                            className="flex items-center gap-1 cursor-pointer hover:text-white"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#84cc16]" /> Digital (₹{upiTotal})
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Row 3: Daily Collections & Real Check-ins Line */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-3 ${cardBg}`}>
                  <span className={`font-bold text-xs ${textColor}`}>Daily collections & check-ins (Real-Time 30-Day Activity)</span>
                  <div className={`h-36 flex items-end justify-between gap-1 pt-4 border-b pb-2 ${theme === 'dark' ? 'border-neutral-800' : 'border-slate-200'}`}>
                    {real30DaysTimeline.map((item, idx) => (
                      <div 
                        key={idx} 
                        style={{ height: `${Math.max(item.total > 0 ? item.digPercent + item.cashPercent : 0, item.checkins > 0 ? 30 : 0)}%` }} 
                        title={`${item.d}: ₹${item.total} (${item.checkins} check-ins)`}
                        className="flex-1 bg-cyan-400 rounded-t-sm hover:bg-[#84cc16] cursor-pointer transition" 
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
                    <span>{real30DaysTimeline[0]?.d}</span>
                    <span>{real30DaysTimeline[10]?.d}</span>
                    <span>{real30DaysTimeline[20]?.d}</span>
                    <span>{real30DaysTimeline[29]?.d}</span>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 text-xs ${cardBg}`}>
                  <span className={`font-bold text-xs ${textColor}`}>Revenue by type (Last 30 days)</span>
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Membership & Training</span>
                        <strong className={textColor}>₹{totalMonthRevenue}</strong>
                      </div>
                      <div className="h-1.5 rounded-full bg-neutral-800"><div className="w-full h-full bg-[#84cc16] rounded-full" /></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Member Base, Lead Funnel, Where Leads Come From */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className={`p-5 rounded-2xl border space-y-3 text-xs ${cardBg}`}>
                  <span className={`font-bold ${textColor}`}>Member base</span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-amber-400"><span>• Expiring</span> <strong>{expiringCount}</strong></div>
                    <div className="flex justify-between text-[#84cc16]"><span>• Active</span> <strong>{activeMembersCount}</strong></div>
                    <div className="flex justify-between text-rose-400"><span>• Expired</span> <strong>{(dbData?.members || []).filter((m: any) => m.status === 'Expired').length}</strong></div>
                    <div className="flex justify-between text-neutral-400"><span>• Cancelled</span> <strong>{(dbData?.members || []).filter((m: any) => m.status === 'Cancelled').length}</strong></div>
                    <div className="flex justify-between text-neutral-500"><span>• Lapsed</span> <strong>{(dbData?.members || []).filter((m: any) => m.status === 'Lapsed').length}</strong></div>
                  </div>
                  <div className={`pt-3 border-t text-[11px] space-y-1 ${theme === 'dark' ? 'border-neutral-800' : 'border-slate-200'}`}>
                    <span className="text-[10px] uppercase font-bold text-neutral-400">ACTIVE BY PLAN</span>
                    <div className="flex justify-between"><span>Quarterly</span><strong>{(dbData?.members || []).filter((m: any) => m.plan === 'Quarterly').length}</strong></div>
                    <div className="flex justify-between"><span>Monthly</span><strong>{(dbData?.members || []).filter((m: any) => m.plan === 'Monthly').length}</strong></div>
                    <div className="flex justify-between"><span>Half-yearly</span><strong>{(dbData?.members || []).filter((m: any) => m.plan === 'Half-yearly').length}</strong></div>
                    <div className="flex justify-between"><span>Annual</span><strong>{(dbData?.members || []).filter((m: any) => m.plan === 'Annual').length}</strong></div>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 text-xs ${cardBg}`}>
                  <span className={`font-bold ${textColor}`}>Lead funnel</span>
                  <div className="space-y-3 pt-2">
                    {['New', 'Contacted', 'Trial', 'Negotiating', 'Converted'].map((stage) => {
                      const count = (dbData?.leads || []).filter((l: any) => l.stage.toLowerCase() === stage.toLowerCase()).length;
                      return (
                        <div key={stage}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span>{stage}</span>
                            <strong>{count}</strong>
                          </div>
                          <div className="h-2 rounded-full bg-neutral-800">
                            <div style={{ width: `${Math.max(10, count * 20)}%` }} className="h-full bg-[#84cc16] rounded-full" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 text-xs ${cardBg}`}>
                  <span className={`font-bold ${textColor}`}>Where leads come from</span>
                  <div className="space-y-2.5 pt-2">
                    {['Poster', 'Phone', 'WhatsApp', 'Referral', 'Instagram', 'Google', 'Walk-in'].map(src => {
                      const count = (dbData?.leads || []).filter((l: any) => l.source === src).length;
                      return (
                        <div key={src} className="flex justify-between items-center">
                          <span className="w-16">{src}</span>
                          <div className="flex-1 mx-2 h-2 rounded-full bg-neutral-800">
                            <div style={{ width: `${Math.max(10, count * 25)}%` }} className="h-full bg-[#84cc16] rounded-full" />
                          </div>
                          <strong>{count}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Exports Bar */}
              <div className={`p-5 rounded-2xl border space-y-3 ${cardBg}`} onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className={`font-bold text-xs ${textColor}`}>Exports & CA Reports</h3>
                    <p className={`text-[10px] ${subTextColor}`}>Download structured reports with formatted DD-MM-YYYY dates.</p>
                  </div>
                  <button onClick={downloadAllInOneMasterPDF} className="px-3.5 py-1.5 bg-[#84cc16] text-black font-extrabold rounded-lg text-xs flex items-center gap-1.5 hover:bg-[#72b012] shadow-lg">
                    <Download className="w-3.5 h-3.5" /> Complete Gym Master Audit Report (All-In-One PDF)
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <button onClick={() => downloadTabularExportPDF('members')} className={`p-2 border rounded-lg flex items-center justify-center gap-1 ${innerBg} ${textColor} hover:border-[#84cc16]`}><Download className="w-3.5 h-3.5" /> Members (PDF)</button>
                  <button onClick={() => downloadTabularExportPDF('payments')} className={`p-2 border rounded-lg flex items-center justify-center gap-1 ${innerBg} ${textColor} hover:border-[#84cc16]`}><Download className="w-3.5 h-3.5" /> Payments (PDF)</button>
                  <button onClick={() => downloadTabularExportPDF('expenses')} className={`p-2 border rounded-lg flex items-center justify-center gap-1 ${innerBg} ${textColor} hover:border-[#84cc16]`}><Download className="w-3.5 h-3.5" /> Expenses (PDF)</button>
                  <button onClick={() => downloadTabularExportPDF('leads')} className={`p-2 border rounded-lg flex items-center justify-center gap-1 ${innerBg} ${textColor} hover:border-[#84cc16]`}><Download className="w-3.5 h-3.5" /> Leads (PDF)</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: STAFF & AUDIT */}
          {currentTab === 'staff' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className={`text-base sm:text-xl font-bold ${textColor}`}>Staff & access</h2>
                <p className={`text-[10px] sm:text-xs ${subTextColor}`}>Who can do what — and a permanent record of every sensitive action.</p>
              </div>

              <div className="flex gap-2 border-b border-neutral-800 pb-2 text-xs font-semibold">
                {(['Team', 'Permissions', 'Audit'] as const).map(st => (
                  <button 
                    key={st} 
                    onClick={() => setStaffSubTab(st)} 
                    className={`px-3 py-1.5 rounded-lg transition ${staffSubTab === st ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}
                  >
                    {st === 'Audit' ? 'Audit log' : st}
                  </button>
                ))}
              </div>

              {staffSubTab === 'Team' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(dbData?.staff || []).map((st: any, i: number) => (
                    <div key={i} className={`p-3 sm:p-4 rounded-xl border flex justify-between items-center ${cardBg}`}>
                      <div>
                        <div className={`font-bold text-sm ${textColor}`}>{st.name}</div>
                        <div className={`text-[10px] ${subTextColor}`}>{st.email}</div>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-neutral-800 text-[#84cc16] font-mono mt-1 inline-block font-bold">{st.role}</span>
                      </div>
                      <div className="w-7 h-4 rounded-full bg-[#84cc16] p-0.5">
                        <div className="w-3 h-3 rounded-full bg-black ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {staffSubTab === 'Permissions' && (
                <div className={`border rounded-xl overflow-x-auto text-xs ${cardBg}`}>
                  <table className="w-full text-left min-w-[400px]">
                    <thead className={theme === 'dark' ? 'bg-[#121418] text-neutral-400' : 'bg-slate-100 text-slate-600'}>
                      <tr>
                        <th className="p-2.5 sm:p-3">ACTION</th>
                        <th className="p-2.5 sm:p-3 text-center">OWNER</th>
                        <th className="p-2.5 sm:p-3 text-center">TRAINER</th>
                        <th className="p-2.5 sm:p-3 text-center">ACCOUNTANT</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                      {Object.keys(dbData?.permissions || {}).map((action) => (
                        <tr key={action}>
                          <td className={`p-2.5 sm:p-3 font-semibold ${textColor}`}>{action}</td>
                          <td className="p-2.5 sm:p-3 text-center text-[#84cc16] font-bold">✓</td>
                          {['Trainer', 'Accountant'].map(role => (
                            <td 
                              key={role} 
                              className="p-2.5 sm:p-3 text-center font-bold"
                            >
                              {(() => {
                        const isAllowed = !!dbData?.permissions?.[action]?.[role];
                        return (
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const nextVal = !isAllowed;
                              setDbData((prev: any) => ({
                                ...prev,
                                permissions: {
                                  ...prev?.permissions,
                                  [action]: {
                                    ...(prev?.permissions?.[action] || {}),
                                    [role]: nextVal
                                  }
                                }
                              }));
                              await fetch('/api/permissions', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action, role, value: nextVal })
                              });
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition border ${
                              isAllowed
                                ? 'bg-[#84cc16]/10 text-[#84cc16] border-[#84cc16]/40 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30'
                                : 'bg-neutral-800/40 text-neutral-500 border-neutral-700 hover:bg-[#84cc16]/10 hover:text-[#84cc16] hover:border-[#84cc16]/30'
                            }`}
                            title={`Click to toggle ${action} for ${role}`}
                          >
                            {isAllowed ? '✓ Allowed' : '— Denied'}
                          </button>
                        );
                      })()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {staffSubTab === 'Audit' && (
                <div className={`border rounded-xl overflow-hidden text-xs ${cardBg}`}>
                  <div className="p-2.5 border-b text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Permanent System Audit Trail</div>
                  <div className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                    {(dbData?.auditLog || []).map((entry: any, idx: number) => (
                      <div key={idx} className="p-2.5 flex justify-between items-center text-xs">
                        <div>
                          <strong className={textColor}>{entry.action}</strong>
                          <div className={`text-[9px] ${subTextColor}`}>By {entry.user}</div>
                        </div>
                        <span className="font-mono text-neutral-400 text-[9px]">{entry.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 13: SETTINGS */}
          {currentTab === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className={`text-base sm:text-xl font-bold ${textColor}`}>Settings</h2>
                <p className={`text-[10px] sm:text-xs ${subTextColor}`}>Configure plans, official GSTIN, tax percentage, and live public URL.</p>
              </div>

              <div className="flex gap-2 border-b border-neutral-800 pb-2 text-xs font-semibold">
                {[
                  { id: 'plans', label: 'Plans' },
                  { id: 'billing', label: 'Billing & Tax' },
                  { id: 'profile', label: 'Gym Profile' }
                ].map(st => (
                  <button 
                    key={st.id} 
                    onClick={() => setSettingsSubTab(st.id as any)} 
                    className={`px-3 py-1.5 rounded-lg transition ${settingsSubTab === st.id ? 'bg-[#84cc16] text-black font-bold' : `${subTextColor} hover:${textColor}`}`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {settingsSubTab === 'plans' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${subTextColor}`}>{dbData?.plans?.length || 0} active plans</span>
                    <button onClick={(e) => { e.stopPropagation(); setShowAddPlanModal(true); }} className="px-3.5 py-1.5 bg-[#84cc16] text-black font-bold rounded-lg text-xs">+ Add plan</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(dbData?.plans || []).map((plan: any) => (
                      <div key={plan.id} className={`p-4 rounded-xl border space-y-1.5 ${cardBg}`}>
                        <div className={`font-bold text-sm ${textColor}`}>{plan.name}</div>
                        <div className="text-xl font-black text-[#84cc16]">₹{plan.price}</div>
                        <div className={`text-xs ${subTextColor}`}>{plan.days} days • {plan.sessions}</div>
                        <button onClick={async () => { await fetch(`/api/plans/${plan.id}`, { method: 'DELETE' }); fetchData(); }} className="text-xs text-rose-500 hover:underline pt-1">Retire</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settingsSubTab === 'billing' && (
                <form 
                  onSubmit={async (e: any) => {
                    e.preventDefault();
                    await fetch('/api/settings/billing', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        receiptType: e.target.receiptType.value,
                        gstin: e.target.gstin.value,
                        taxPercent: Number(e.target.taxPercent.value || 18),
                        maxStaffDiscount: Number(e.target.maxDiscount.value || 20)
                      })
                    });
                    alert('Billing & Tax settings updated!');
                    fetchData();
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border max-w-lg space-y-3.5 text-xs ${cardBg}`}
                >
                  <div>
                    <label className="text-neutral-400 font-bold">Receipt Type</label>
                    <select name="receiptType" defaultValue={dbData?.billingSettings?.receiptType || "GST tax invoice"} className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`}>
                      <option>GST tax invoice</option>
                      <option>Simple receipt</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400 font-bold">GSTIN / Tax ID</label>
                    <input name="gstin" defaultValue={dbData?.billingSettings?.gstin || "29AABCI1234F1Z8"} className={`w-full mt-1 px-3 py-2 border rounded-lg font-mono font-bold ${innerBg} ${textColor}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-neutral-400 font-bold">Tax / GST Rate (%)</label>
                      <input name="taxPercent" type="number" defaultValue={dbData?.billingSettings?.taxPercent || 18} className={`w-full mt-1 px-3 py-2 border rounded-lg font-bold text-[#84cc16] ${innerBg}`} />
                    </div>
                    <div>
                      <label className="text-neutral-400 font-bold">Max Staff Discount (%)</label>
                      <input name="maxDiscount" type="number" defaultValue={dbData?.billingSettings?.maxStaffDiscount || 20} className={`w-full mt-1 px-3 py-2 border rounded-lg font-bold ${innerBg} ${textColor}`} />
                    </div>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-[#84cc16] text-black font-extrabold rounded-xl">Save Billing Settings</button>
                </form>
              )}

              {settingsSubTab === 'profile' && (
                <form 
                  onSubmit={async (e: any) => {
                    e.preventDefault();
                    const pubUrl = e.target.publicUrl.value.trim();
                    if (pubUrl) {
                      localStorage.setItem('repflow_public_url', pubUrl);
                    }
                    await fetch('/api/settings/profile', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: e.target.gymName.value,
                        branch: e.target.gymBranch.value,
                        phone: e.target.gymPhone.value,
                        publicUrl: pubUrl
                      })
                    });
                    alert('Profile and Public Invoice URL updated!');
                    fetchData();
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border max-w-lg space-y-3.5 text-xs ${cardBg}`}
                >
                  <div>
                    <label className="text-neutral-400">Gym Name</label>
                    <input name="gymName" defaultValue={dbData?.gymProfile?.name || 'Iron Temple Fitness'} className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} required />
                  </div>
                  <div>
                    <label className="text-neutral-400">Branch Location</label>
                    <input name="gymBranch" defaultValue={dbData?.gymProfile?.branch || 'Indiranagar, Bengaluru'} className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} required />
                  </div>
                  <div>
                    <label className="text-neutral-400">Phone</label>
                    <input name="gymPhone" defaultValue={dbData?.gymProfile?.phone || '9845012345'} className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
                  </div>
                  <div>
                    <label className="text-neutral-400 font-bold">Public Domain / Ngrok Link (Used for WhatsApp Invoices)</label>
                    <input 
                      name="publicUrl" 
                      defaultValue={dbData?.gymProfile?.publicUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://repflow-gym.ngrok-free.dev')} 
                      placeholder="https://your-domain.ngrok-free.dev" 
                      className={`w-full mt-1 px-3 py-2 border rounded-lg font-mono text-[#84cc16] font-bold ${innerBg}`} 
                    />
                    <p className={`text-[10px] mt-1 ${subTextColor}`}>Allows customers to download invoice PDFs directly from WhatsApp on their phones.</p>
                  </div>
                  <button type="submit" className="px-5 py-2.5 bg-[#84cc16] text-black font-extrabold rounded-xl">Save Profile & Public Link</button>
                </form>
              )}
            </div>
          )}

          {/* TAB 14: FRONT DESK */}
          {currentTab === 'frontDesk' && (
            <div className="space-y-4">
              <h2 className={`text-base sm:text-xl font-bold ${textColor}`}>Front Desk Check-In</h2>
              {checkInNotice && (
                <div className={`p-2.5 rounded-xl border text-xs font-semibold ${checkInNotice.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}>
                  {checkInNotice.message}
                </div>
              )}
              <div className={`p-4 sm:p-6 rounded-2xl border-2 border-[#84cc16] space-y-3 ${cardBg}`}>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={checkInInput} 
                    onChange={(e) => setCheckInInput(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') handleFrontDeskCheckIn(checkInInput); }} 
                    placeholder="Enter exact Member ID (e.g. IT1001)..." 
                    className={`flex-1 px-3 sm:px-4 py-2 border rounded-xl font-mono text-xs sm:text-sm outline-none ${innerBg} ${textColor}`} 
                  />
                  <button onClick={() => handleFrontDeskCheckIn(checkInInput)} className="px-4 sm:px-6 py-2 bg-[#84cc16] text-black font-extrabold rounded-xl text-xs sm:text-sm">
                    Check In
                  </button>
                </div>
              </div>

              <div className={`border rounded-xl overflow-hidden ${cardBg}`}>
                <div className="p-3 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-900/60">
  <div className="flex items-center gap-2">
    <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-300">CHECK-IN HISTORY</span>
    <span className="text-[10px] font-mono font-bold bg-[#84cc16]/20 text-[#84cc16] px-2.5 py-0.5 rounded-full">
      {(recentCheckIns || []).filter((item: any) => (item.date || new Date().toISOString().split('T')[0]) === selectedHistoryDate).length} Checked In
    </span>
  </div>
  <div className="flex items-center gap-2">
    <span className="text-[11px] font-bold text-neutral-400">Date:</span>
    <input
      type="date"
      value={selectedHistoryDate}
      onChange={(e) => setSelectedHistoryDate(e.target.value)}
      className="px-2.5 py-1 text-xs rounded-lg border border-neutral-700 bg-black text-[#84cc16] focus:outline-none focus:border-[#84cc16]"
    />
  </div>
</div>
                <div className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                  {(recentCheckIns || []).filter((item: any) => (item.date || new Date().toISOString().split('T')[0]) === selectedHistoryDate).map((item: any, idx: number) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center text-xs">
                      <div><div className={`font-bold ${textColor}`}>{item.name}</div><div className={`text-[10px] ${subTextColor}`}>{item.memberCode || item.code || "IT1001"}</div></div>
                      <span className="font-mono text-[#84cc16] font-bold">{item.time}</span>
                    </div>
                  ))}
                  {recentCheckIns.length === 0 && (
                    <p className={`p-6 text-center text-xs ${subTextColor}`}>No members checked in yet today.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ------------------------- MODALS ------------------------- */}
      {/* MEMBER PROFILE MODAL */}
      {selectedMemberProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <div className={`${cardBg} p-5 rounded-2xl max-w-sm sm:max-w-md w-full space-y-3.5 text-xs`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`text-base sm:text-lg font-bold ${textColor}`}>{selectedMemberProfile.name}</h3>
                <p className={subTextColor}>{selectedMemberProfile.code || "IT1001"} • +91 {selectedMemberProfile.phone}</p>
              </div>
              <button onClick={() => setSelectedMemberProfile(null)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <div className={`grid grid-cols-2 gap-2.5 py-2 border-y ${theme === 'dark' ? 'border-neutral-800' : 'border-slate-200'}`}>
              <div><span className="text-neutral-400">Plan:</span> <strong className={`block mt-0.5 ${textColor}`}>{selectedMemberProfile.plan}</strong></div>
              <div><div className="flex justify-between py-1 text-xs"><span className="text-neutral-400">Check-ins in last 30 days:</span><span className="text-lime-400 font-bold">{selectedMemberProfile?.checkInsCount || 14} days</span></div>
<span className="text-neutral-400">Status:</span> <strong className="text-green-500 block mt-0.5">{selectedMemberProfile.status}</strong></div>
              <div><span className="text-neutral-400">Validity (DD-MM-YYYY):</span> <strong className={`block mt-0.5 ${textColor}`}>{formatDDMMYYYY(selectedMemberProfile.startDate)} to {formatDDMMYYYY(selectedMemberProfile.expires)}</strong></div>
              <div><span className="text-neutral-400">Days Left:</span> <strong className="text-amber-500 block mt-0.5">{getDaysLeft(selectedMemberProfile.expires)} days</strong></div>
              <div><span className="text-neutral-400">Outstanding Dues:</span> <strong className="text-rose-500 block mt-0.5">₹{selectedMemberProfile.dues}</strong></div>
            </div>
            <div className="flex gap-1.5 pt-1">
              <button 
                onClick={() => { handleFrontDeskCheckIn(selectedMemberProfile.id); setSelectedMemberProfile(null); }}
                className="flex-1 py-2 bg-[#84cc16] text-black font-bold rounded-lg text-xs"
              >
                Check In
              </button>
              <button 
                onClick={() => {
                  const d = new Date(); d.setDate(d.getDate() + 90);
                  setRenewForm({ plan: selectedMemberProfile.plan || 'Quarterly', amount: 4000, dues: 0, method: 'UPI', startDate: todayStr, endDate: d.toISOString().split('T')[0] });
                  setShowRenewModal(selectedMemberProfile);
                }}
                className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-xs"
              >
                Renew
              </button>
              {canPerform('Add & edit members') && (
                <button 
                  onClick={() => { setShowEditMemberModal({ ...selectedMemberProfile }); setSelectedMemberProfile(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border ${innerBg} ${textColor}`}
                >
                  Edit
                </button>
              )}
              <button 
                onClick={() => openWhatsApp(selectedMemberProfile.phone, `Hi ${selectedMemberProfile.name}, update from ${dbData?.gymProfile?.name}!`)}
                className="flex-1 py-2 bg-[#84cc16]/10 text-[#84cc16] font-bold rounded-lg text-xs"
              >
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENEW MEMBERSHIP MODAL */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleRenewSubmit} className={`${cardBg} p-5 rounded-2xl max-w-sm sm:max-w-md w-full space-y-3.5 text-xs`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`text-base font-bold ${textColor}`}>Renew Membership</h3>
                <p className={`text-[11px] ${subTextColor}`}>{showRenewModal.name} • {showRenewModal.id}</p>
              </div>
              <button type="button" onClick={() => setShowRenewModal(null)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <div>
              <label className="text-neutral-400">Select Plan Duration</label>
              <select 
                value={renewForm.plan} 
                onChange={(e) => {
                  const p = e.target.value;
                  const price = p === 'Monthly' ? 1500 : p === 'Quarterly' ? 4000 : p === 'Half-yearly' ? 7000 : 12000;
                  const newEnd = calcEndDate(renewForm.startDate, p);
                  setRenewForm({ ...renewForm, plan: p, amount: price, dues: 0, endDate: newEnd });
                }}
                className={`w-full mt-1 px-3 py-2 border rounded-lg font-semibold ${innerBg} ${textColor}`}
              >
                <option>Monthly (30 days)</option>
                <option>Quarterly (90 days)</option>
                <option>Half-yearly (180 days)</option>
                <option>Annual (365 days)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400">Amount Paid (₹)</label>
                <input type="number" required value={renewForm.amount} onChange={(e) => setRenewForm({ ...renewForm, amount: Number(e.target.value) })} className={`w-full mt-1 px-3 py-2 border rounded-lg font-bold text-[#84cc16] ${innerBg}`} />
              </div>
              <div>
                <label className="text-neutral-400">Remaining Dues (₹)</label>
                <input type="number" value={renewForm.dues} onChange={(e) => setRenewForm({ ...renewForm, dues: Number(e.target.value) })} className={`w-full mt-1 px-3 py-2 border rounded-lg font-bold text-rose-500 ${innerBg}`} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400">Renewal Start Date</label>
                <input 
                  type="date" 
                  required 
                  value={renewForm.startDate} 
                  onChange={(e) => {
                    const start = e.target.value;
                    const newEnd = calcEndDate(start, renewForm.plan);
                    setRenewForm({ ...renewForm, startDate: start, endDate: newEnd });
                  }} 
                  className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} 
                />
              </div>
              <div>
                <label className="text-neutral-400">New End Date</label>
                <input type="date" required value={renewForm.endDate} onChange={(e) => setRenewForm({ ...renewForm, endDate: e.target.value })} className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} />
              </div>
            </div>
            <div>
              <label className="text-neutral-400">Payment Method</label>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {['UPI', 'Cash', 'Card', 'Bank'].map(m => (
                  <button key={m} type="button" onClick={() => setRenewForm({ ...renewForm, method: m })} className={`py-1.5 rounded font-bold ${renewForm.method === m ? 'bg-[#84cc16] text-black' : `border ${innerBg} ${subTextColor}`}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-[#84cc16] text-black font-extrabold rounded-xl text-xs sm:text-sm">
              Confirm Renewal & Record ₹{renewForm.amount}
            </button>
          </form>
        </div>
      )}

      {/* NEW MEMBER REGISTRATION MODAL */}
      {showNewMemberModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleCreateMember} className={`${cardBg} p-5 rounded-2xl max-w-sm sm:max-w-md w-full space-y-3 text-xs max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-base font-bold ${textColor}`}>New Member Registration</h3>
              <button type="button" onClick={() => setShowNewMemberModal(false)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <div>
              <label className="text-neutral-400">Full Name</label>
              <input type="text" required value={newMemberForm.name} onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })} placeholder="Full Name" className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <div>
              <label className="text-neutral-400">Mobile Phone (Mandatory 10 digits)</label>
              <input type="tel" maxLength={10} required value={newMemberForm.phone} onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value.replace(/[^0-9]/g, ''), phoneError: '' })} placeholder="9876543210" className={`w-full mt-1 px-3 py-2 border rounded-lg font-mono ${innerBg} ${textColor}`} />
              {newMemberForm.phoneError && <p className="text-rose-500 font-semibold mt-1">{newMemberForm.phoneError}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400">Plan</label>
                <select value={newMemberForm.plan} onChange={(e) => {
                  const price = e.target.value === 'Monthly' ? 1500 : e.target.value === 'Quarterly' ? 4000 : e.target.value === 'Half-yearly' ? 7000 : 12000;
                  const newEnd = calcEndDate(newMemberForm.startDate, e.target.value);
                  setNewMemberForm({ ...newMemberForm, plan: e.target.value, planPrice: price, endDate: newEnd });
                }} className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`}>
                  <option>Monthly</option><option>Quarterly</option><option>Half-yearly</option><option>Annual</option>
                </select>
              </div>
              <div>
                <label className="text-neutral-400">Plan Price (₹)</label>
                <input type="number" value={newMemberForm.planPrice} onChange={(e) => setNewMemberForm({ ...newMemberForm, planPrice: Number(e.target.value) })} className={`w-full mt-1 px-3 py-2 border rounded-lg font-bold text-[#84cc16] ${innerBg}`} />
              </div>
            </div>

            {/* Admission Fee Toggle */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${innerBg}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newMemberForm.includeAdmissionFee} 
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, includeAdmissionFee: e.target.checked })} 
                  className="w-4 h-4 accent-[#84cc16] cursor-pointer rounded" 
                />
                <span className={`font-semibold ${textColor}`}>Charge Admission Fee (₹500)</span>
              </label>
              <span className="text-[11px] font-bold text-[#84cc16]">{newMemberForm.includeAdmissionFee ? '+₹500' : 'Waived'}</span>
            </div>

            {/* Assign Personal Trainer (PT) */}
            <div className={`p-2.5 rounded-xl border space-y-2 ${innerBg}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newMemberForm.assignPT} 
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, assignPT: e.target.checked, ptTrainer: e.target.checked ? (dbData?.trainers?.[0]?.name || '') : '' })} 
                  className="w-4 h-4 accent-[#84cc16] cursor-pointer rounded" 
                />
                <span className={`font-semibold ${textColor}`}>Assign Personal Trainer (PT Package)</span>
              </label>

              {newMemberForm.assignPT && (
                <div className="pt-2 border-t border-neutral-800 space-y-2">
                  <div>
                    <label className="text-[10px] text-neutral-400">Select Trainer</label>
                    <select 
                      value={newMemberForm.ptTrainer} 
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, ptTrainer: e.target.value })} 
                      className={`w-full mt-1 px-2.5 py-1.5 border rounded-lg text-xs font-semibold ${cardBg} ${textColor}`}
                    >
                      {(dbData?.trainers || []).map((tr: any) => <option key={tr.id} value={tr.name}>{tr.name} ({tr.specialty})</option>)}
                      {(dbData?.trainers || []).length === 0 && <option value="">No trainers available</option>}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400">Sessions</label>
                      <input 
                        type="number" 
                        value={newMemberForm.ptSessions} 
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, ptSessions: Number(e.target.value) })} 
                        className={`w-full mt-1 px-2 py-1.5 border rounded-lg font-bold text-xs ${cardBg} ${textColor}`} 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400">PT Fee (₹)</label>
                      <input 
                        type="number" 
                        value={newMemberForm.ptPrice} 
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, ptPrice: Number(e.target.value) })} 
                        className={`w-full mt-1 px-2 py-1.5 border rounded-lg font-bold text-[#84cc16] text-xs ${cardBg}`} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Discount (%) & Payment Method */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400 font-semibold">Discount (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={newMemberForm.discountPercent} 
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, discountPercent: Number(e.target.value) })} 
                  placeholder="0" 
                  className={`w-full mt-1 px-3 py-2 border rounded-lg font-bold text-[#84cc16] ${innerBg}`} 
                />
              </div>
              <div>
                <label className="text-neutral-400 font-semibold">Payment Method</label>
                <select 
                  value={newMemberForm.paymentMethod} 
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, paymentMethod: e.target.value })} 
                  className={`w-full mt-1 px-3 py-2 border rounded-lg font-semibold ${innerBg} ${textColor}`}
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>
            </div>

            {/* Tax / GST Checkbox (Clean Rupee Symbol) */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${innerBg}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newMemberForm.applyTax} 
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, applyTax: e.target.checked })} 
                  className="w-4 h-4 accent-[#84cc16] cursor-pointer rounded" 
                />
                <span className={`font-semibold ${textColor}`}>Apply Tax / GST ({defaultTaxRate}%)</span>
              </label>
              <span className="text-[11px] font-bold text-[#84cc16]">{newMemberForm.applyTax ? `+ ₹${calculatedTax}` : 'No Tax'}</span>
            </div>

            <div>
              <label className="text-neutral-400">Outstanding Dues (₹)</label>
              <input type="number" value={newMemberForm.dues} onChange={(e) => setNewMemberForm({ ...newMemberForm, dues: Number(e.target.value) })} placeholder="0" className={`w-full mt-1 px-3 py-2 border rounded-lg text-rose-500 font-bold ${innerBg}`} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400">Start Date</label>
                <input 
                  type="date" 
                  required 
                  value={newMemberForm.startDate} 
                  onChange={(e) => {
                    const start = e.target.value;
                    const newEnd = calcEndDate(start, newMemberForm.plan);
                    setNewMemberForm({ ...newMemberForm, startDate: start, endDate: newEnd });
                  }} 
                  className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} 
                />
              </div>
              <div>
                <label className="text-neutral-400">End Date</label>
                <input type="date" required value={newMemberForm.endDate} onChange={(e) => setNewMemberForm({ ...newMemberForm, endDate: e.target.value })} className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} />
              </div>
            </div>

            {/* Summary Breakdown Footer (Clean Rupee Only) */}
            <div className={`p-2.5 rounded-xl border space-y-1 text-[11px] ${innerBg}`}>
              <div className="flex justify-between"><span>Subtotal:</span><span>₹{rawSubtotal}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-rose-500"><span>Discount ({newMemberForm.discountPercent}%):</span><span>- ₹{discountAmount}</span></div>}
              {calculatedTax > 0 && <div className="flex justify-between text-amber-500"><span>GST / Tax ({defaultTaxRate}%):</span><span>+ ₹{calculatedTax}</span></div>}
              <div className="flex justify-between font-bold pt-1 border-t border-neutral-800"><span>Grand Total:</span><span className={textColor}>₹{grandTotal}</span></div>
              <div className="flex justify-between font-bold text-[#84cc16]"><span>Pay Now ({newMemberForm.paymentMethod}):</span><span>₹{payNowCalculated}</span></div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-[#84cc16] text-black font-extrabold rounded-xl">Register & Generate Invoice</button>
          </form>
        </div>
      )}

      {/* EDIT MEMBER DETAILS MODAL */}
      {showEditMemberModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleEditMemberSubmit} className={`${cardBg} p-5 rounded-2xl max-w-sm sm:max-w-md w-full space-y-3.5 text-xs`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-base font-bold ${textColor}`}>Edit Member Details</h3>
              <button type="button" onClick={() => setShowEditMemberModal(null)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <div>
              <label className="text-neutral-400">Full Name</label>
              <input 
                value={showEditMemberModal.name} 
                onChange={(e) => setShowEditMemberModal({ ...showEditMemberModal, name: e.target.value })}
                required 
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} 
              />
            </div>
            <div>
              <label className="text-neutral-400">Phone (Exact 10 digits)</label>
              <input 
                type="tel"
                maxLength={10}
                value={showEditMemberModal.phone} 
                onChange={(e) => setShowEditMemberModal({ ...showEditMemberModal, phone: e.target.value.replace(/[^0-9]/g, '') })}
                required 
                className={`w-full mt-1 px-3 py-2 border rounded-lg font-mono ${innerBg} ${textColor}`} 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400">Plan</label>
                <select 
                  value={showEditMemberModal.plan} 
                  onChange={(e) => {
                    const nextPlan = e.target.value;
                    const newEnd = calcEndDate(showEditMemberModal.startDate, nextPlan);
                    setShowEditMemberModal({ ...showEditMemberModal, plan: nextPlan, expires: newEnd });
                  }}
                  className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} 
                >
                  <option>Monthly</option><option>Quarterly</option><option>Half-yearly</option><option>Annual</option>
                </select>
              </div>
              <div>
                <label className="text-neutral-400">Status</label>
                <select 
                  value={showEditMemberModal.status} 
                  onChange={(e) => setShowEditMemberModal({ ...showEditMemberModal, status: e.target.value })}
                  className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} 
                >
                  <option>Active</option><option>Expiring</option><option>Expired</option><option>Lapsed</option><option>Cancelled</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-neutral-400">Dues (₹)</label>
                <input 
                  type="number" 
                  value={showEditMemberModal.dues || 0} 
                  onChange={(e) => setShowEditMemberModal({ ...showEditMemberModal, dues: Number(e.target.value) })}
                  className={`w-full mt-1 px-2 py-2 border rounded-lg text-rose-500 font-bold ${innerBg}`} 
                />
              </div>
              <div>
                <label className="text-neutral-400">Start Date</label>
                <input 
                  type="date" 
                  value={showEditMemberModal.startDate || todayStr} 
                  onChange={(e) => {
                    const nextStart = e.target.value;
                    const newEnd = calcEndDate(nextStart, showEditMemberModal.plan);
                    setShowEditMemberModal({ ...showEditMemberModal, startDate: nextStart, expires: newEnd });
                  }}
                  className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} 
                />
              </div>
              <div>
                <label className="text-neutral-400">Expires</label>
                <input 
                  type="date" 
                  value={showEditMemberModal.expires || '2026-12-31'} 
                  onChange={(e) => setShowEditMemberModal({ ...showEditMemberModal, expires: e.target.value })}
                  className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} 
                />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-[#84cc16] text-black font-extrabold rounded-xl">Save Changes</button>
          </form>
        </div>
      )}

      {/* NEW LEAD MODAL */}
      {showNewLeadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleCreateLead} className={`${cardBg} p-5 rounded-2xl max-w-sm w-full space-y-3.5 text-xs`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`text-base font-bold ${textColor}`}>New lead</h3>
                <p className={`text-[11px] ${subTextColor}`}>Walk-in, call, or social enquiry.</p>
              </div>
              <button type="button" onClick={() => setShowNewLeadModal(false)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <div>
              <label className="text-neutral-400">Name</label>
              <input name="leadName" required placeholder="Full Name" className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <div>
              <label className="text-neutral-400">Mobile (10 digits)</label>
              <input name="leadPhone" maxLength={10} required placeholder="9876543210" className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400">Source</label>
                <select name="leadSource" className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`}>
                  <option>Walk-in</option><option>Instagram</option><option>Google</option><option>Referral</option><option>Poster</option>
                </select>
              </div>
              <div>
                <label className="text-neutral-400">Follow up date</label>
                <input name="leadFollowUp" type="date" defaultValue={todayStr} className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} />
              </div>
            </div>
            <div>
              <label className="text-neutral-400">Interested In</label>
              <select name="leadPlan" className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`}>
                <option>Monthly</option><option>Quarterly</option><option>Half-yearly</option><option>Annual</option><option>Personal training</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-400">Notes</label>
              <input name="leadNote" placeholder="Goals, budget, timings" className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <button type="submit" className="w-full py-2.5 bg-[#84cc16] text-black font-extrabold rounded-xl">Save lead</button>
          </form>
        </div>
      )}

      {/* ADD TRAINER MODAL */}
      {showAddTrainerModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleCreateTrainer} className={`${cardBg} p-5 rounded-2xl max-w-sm sm:max-w-md w-full space-y-3 text-xs`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-base font-bold ${textColor}`}>Add Trainer & Set Login</h3>
              <button type="button" onClick={() => setShowAddTrainerModal(false)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <div>
              <label className="text-neutral-400">Full Name</label>
              <input name="trName" required placeholder="e.g. Sameer Khan" className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400">Login Email</label>
                <input name="trEmail" type="email" required placeholder="trainer@gym.com" className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
              </div>
              <div>
                <label className="text-neutral-400">Password</label>
                <div className="relative mt-1">
                  <input name="trPassword" type={showAddTrainerPassword ? "text" : "password"} required defaultValue="password123" className={`w-full px-3 py-2 pr-9 border rounded-lg outline-none ${innerBg} ${textColor}`} />
                  <button type="button" onClick={() => setShowAddTrainerPassword(!showAddTrainerPassword)} className="absolute right-2.5 top-2.5 text-neutral-400">
                    {showAddTrainerPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="text-neutral-400">Mobile Phone (10 digits)</label>
              <input name="trPhone" maxLength={10} required placeholder="9876543210" className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <div>
              <label className="text-neutral-400">Specialty</label>
              <input name="trSpecialty" defaultValue="Strength & HIIT" className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <button type="submit" className="w-full py-2.5 bg-[#84cc16] text-black font-extrabold rounded-xl">Save Trainer & Enable Login</button>
          </form>
        </div>
      )}

      {/* EDIT TRAINER DETAILS MODAL */}
      {showEditTrainerModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleEditTrainerSubmit} className={`${cardBg} p-5 rounded-2xl max-w-sm sm:max-w-md w-full space-y-3 text-xs`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-base font-bold ${textColor}`}>Edit Trainer Details</h3>
              <button type="button" onClick={() => setShowEditTrainerModal(null)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <div>
              <label className="text-neutral-400">Full Name</label>
              <input name="trName" defaultValue={showEditTrainerModal.name} required className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <div>
              <label className="text-neutral-400">Login Email</label>
              <input name="trEmail" type="email" defaultValue={showEditTrainerModal.email} required className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <div>
              <label className="text-neutral-400">Password</label>
              <div className="relative mt-1">
                <input 
                  name="trPassword" 
                  type={showEditTrainerPasswordEye ? "text" : "password"} 
                  defaultValue={showEditTrainerModal.password || 'password123'} 
                  required 
                  className={`w-full px-3 py-2 pr-9 border rounded-lg outline-none ${innerBg} ${textColor}`} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowEditTrainerPasswordEye(!showEditTrainerPasswordEye)} 
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white"
                >
                  {showEditTrainerPasswordEye ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-neutral-400">Mobile Phone (10 digits)</label>
              <input name="trPhone" maxLength={10} defaultValue={showEditTrainerModal.phone} required className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <div>
              <label className="text-neutral-400">Specialty</label>
              <input name="trSpecialty" defaultValue={showEditTrainerModal.specialty} className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <button type="submit" className="w-full py-2.5 bg-[#84cc16] text-black font-extrabold rounded-xl">Save Changes</button>
          </form>
        </div>
      )}

      {/* ASSIGN PT MODAL */}
      {showAddPTModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleAssignPT} className={`${cardBg} p-5 rounded-2xl max-w-sm w-full space-y-3.5 text-xs`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-base font-bold ${textColor}`}>Assign Personal Trainer</h3>
              <button type="button" onClick={() => setShowAddPTModal(false)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <div>
              <label className="text-neutral-400">Search Member by Name</label>
              <div className="relative mt-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                <input 
                  type="text" 
                  value={ptMemberSearch} 
                  onChange={(e) => setPtMemberSearch(e.target.value)} 
                  placeholder="Type member name..." 
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg outline-none ${innerBg} ${textColor}`} 
                />
              </div>
              <label className="text-neutral-400 block mt-2">Select Filtered Member</label>
              <select name="ptMember" className={`w-full mt-1 px-3 py-2 border rounded-lg font-semibold ${innerBg} ${textColor}`}>
                {(dbData?.members || []).filter((m: any) => ((m?.name || "").toLowerCase()).includes(ptMemberSearch.toLowerCase())).map((m: any) => (
                  <option key={m.code || "IT1001"} value={m.name}>{m.name} ({m.phone})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-neutral-400">Select Trainer</label>
              <select name="ptTrainer" className={`w-full mt-1 px-3 py-2 border rounded-lg font-semibold ${innerBg} ${textColor}`}>
                {(dbData?.trainers || []).map((tr: any) => <option key={tr.id} value={tr.name}>{tr.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400">Sessions</label>
                <input name="ptSessions" type="number" defaultValue="12" className={`w-full mt-1 px-3 py-2 border rounded-lg font-bold ${innerBg} ${textColor}`} />
              </div>
              <div>
                <label className="text-neutral-400">Total Fee (₹)</label>
                <input name="ptPrice" type="number" defaultValue="6000" className={`w-full mt-1 px-3 py-2 border rounded-lg font-bold text-[#84cc16] ${innerBg}`} />
              </div>
            </div>
            <div>
              <label className="text-neutral-400 font-semibold">Payment Method</label>
              <select name="ptMethod" defaultValue="UPI" className={`w-full mt-1 px-3 py-2 border rounded-lg font-semibold ${innerBg} ${textColor}`}>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank">Bank</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400">Start Date</label>
                <input name="ptStart" type="date" defaultValue={todayStr} className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} />
              </div>
              <div>
                <label className="text-neutral-400">End Date</label>
                <input name="ptEnd" type="date" defaultValue="2026-11-01" className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-[#84cc16] text-black font-extrabold rounded-xl">Confirm PT Assignment & Record Fee</button>
          </form>
        </div>
      )}

      {/* EDIT PT ASSIGNMENT MODAL */}
      {showEditPTModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleEditPTSubmit} className={`${cardBg} p-5 rounded-2xl max-w-sm w-full space-y-3.5 text-xs`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`text-base font-bold ${textColor}`}>Edit PT Assignment</h3>
                <p className={`text-[11px] ${subTextColor}`}>{showEditPTModal.member} • {showEditPTModal.trainer}</p>
              </div>
              <button type="button" onClick={() => setShowEditPTModal(null)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <div>
              <label className="text-neutral-400">Reselect Member</label>
              <select name="editPtMember" defaultValue={showEditPTModal.member} className={`w-full mt-1 px-3 py-2 border rounded-lg font-semibold ${innerBg} ${textColor}`}>
                {(dbData?.members || []).map((m: any) => (
                  <option key={m.code || "IT1001"} value={m.name}>{m.name} ({m.phone})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-neutral-400">Assigned Trainer</label>
              <select name="editPtTrainer" defaultValue={showEditPTModal.trainer} className={`w-full mt-1 px-3 py-2 border rounded-lg font-semibold ${innerBg} ${textColor}`}>
                {(dbData?.trainers || []).map((tr: any) => (
                  <option key={tr.id} value={tr.name}>{tr.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400">Sessions</label>
                <input name="ptSessions" type="number" defaultValue={showEditPTModal.sessions} className={`w-full mt-1 px-3 py-2 border rounded-lg font-bold ${innerBg} ${textColor}`} />
              </div>
              <div>
                <label className="text-neutral-400">Total Fee (₹)</label>
                <input name="ptPrice" type="number" defaultValue={showEditPTModal.price} className={`w-full mt-1 px-3 py-2 border rounded-lg font-bold text-[#84cc16] ${innerBg}`} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400">Start Date</label>
                <input name="ptStart" type="date" defaultValue={showEditPTModal.startDate} className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} />
              </div>
              <div>
                <label className="text-neutral-400">End Date</label>
                <input name="ptEnd" type="date" defaultValue={showEditPTModal.endDate} className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-[#84cc16] text-black font-extrabold rounded-xl">Save Changes</button>
          </form>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleRecordPayment} className={`${cardBg} p-5 rounded-2xl max-w-sm w-full space-y-3.5 text-xs`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`text-base font-bold ${textColor}`}>Collect payment</h3>
                <p className={`text-[11px] ${subTextColor}`}>Generates instant stamped receipt.</p>
              </div>
              <button type="button" onClick={() => setShowPaymentModal(false)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <div>
              <label className="text-neutral-400">Member Name / Walk-in</label>
              <div className="relative mt-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                <input 
                  type="text" 
                  value={payMemberSearch} 
                  onChange={(e) => {
                    setPayMemberSearch(e.target.value);
                    setPayForm({ ...payForm, member: e.target.value });
                  }} 
                  placeholder="Search member by name..." 
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg outline-none ${innerBg} ${textColor}`} 
                />
              </div>

              {payMemberSearch.trim() && (
                <div className={`mt-1 max-h-28 overflow-y-auto border rounded-lg divide-y ${innerBg}`}>
                  {(dbData?.members || []).filter((m: any) => ((m?.name || "").toLowerCase()).includes(payMemberSearch.toLowerCase())).map((m: any) => (
                    <div 
                      key={m.code || "IT1001"} 
                      onClick={() => {
                        setPayForm({ ...payForm, member: m.name, phone: m.phone, amount: String(m.dues || 1500) });
                        setPayMemberSearch(m.name);
                      }} 
                      className={`p-2 hover:bg-[#84cc16]/10 cursor-pointer flex justify-between ${textColor}`}
                    >
                      <strong>{m.name}</strong>
                      <span className={`text-[10px] ${subTextColor}`}>Dues: ₹{m.dues}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-neutral-400">Amount (₹)</label>
              <input type="number" required value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} placeholder="0" className={`w-full mt-1 px-3 py-2 border rounded-lg text-[#84cc16] font-bold text-sm ${innerBg}`} />
            </div>
            <div>
              <label className="text-neutral-400">Method</label>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {['UPI', 'Cash', 'Card', 'Bank'].map(m => (
                  <button key={m} type="button" onClick={() => setPayForm({ ...payForm, method: m })} className={`py-1.5 rounded font-bold ${payForm.method === m ? 'bg-[#84cc16] text-black' : `border ${innerBg} ${subTextColor}`}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-neutral-400">Category</label>
              <select value={payForm.category} onChange={(e) => setPayForm({ ...payForm, category: e.target.value })} className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`}>
                <option>Membership</option>
                <option>Personal training</option>
                <option>Admission</option>
                <option>Store</option>
                <option>Day pass</option>
              </select>
            </div>
            <button type="submit" className="w-full py-2.5 bg-[#84cc16] text-black font-extrabold rounded-xl text-sm">Record ₹{payForm.amount || 0}</button>
          </form>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleAddExpense} className={`${cardBg} p-5 rounded-2xl max-w-sm w-full space-y-3.5 text-xs`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-base font-bold ${textColor}`}>Add expense</h3>
              <button type="button" onClick={() => setShowAddExpenseModal(false)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <div>
              <label className="text-neutral-400">Category</label>
              <select name="category" className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`}>
                <option>Rent</option><option>Salaries</option><option>Electricity</option><option>Equipment</option><option>Marketing</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-400">Paid to</label>
              <input name="paidTo" defaultValue="BESCOM, Landlord" required className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <div>
              <label className="text-neutral-400">Amount (₹)</label>
              <input name="amount" type="number" required placeholder="5000" className={`w-full mt-1 px-3 py-2 border rounded-lg font-bold ${innerBg} ${textColor}`} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400">Paid by</label>
                <select name="method" className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`}><option>Bank</option><option>Cash</option><option>UPI</option></select>
              </div>
              <div>
                <label className="text-neutral-400">Date</label>
                <input name="date" type="date" defaultValue={todayStr} className={`w-full mt-1 px-2 py-2 border rounded-lg ${innerBg} ${textColor}`} />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-[#84cc16] text-black font-extrabold rounded-xl">Save expense</button>
          </form>
        </div>
      )}

      {/* ADD PLAN MODAL */}
      {showAddPlanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={async (e: any) => {
            e.preventDefault();
            await fetch('/api/plans', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: e.target.planName.value,
                days: Number(e.target.planDays.value),
                price: Number(e.target.planPrice.value),
                sessions: e.target.planSessions.value
              })
            });
            setShowAddPlanModal(false);
            fetchData();
          }} className={`${cardBg} p-5 rounded-2xl max-w-sm w-full space-y-3.5 text-xs`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-base font-bold ${textColor}`}>Add Membership Plan</h3>
              <button type="button" onClick={() => setShowAddPlanModal(false)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <div>
              <label className="text-neutral-400">Plan Name</label>
              <input name="planName" placeholder="e.g. 6-Month Gold Pass" required className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400">Duration (Days)</label>
                <input name="planDays" type="number" defaultValue="180" required className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
              </div>
              <div>
                <label className="text-neutral-400">Price (₹)</label>
                <input name="planPrice" type="number" placeholder="7000" required className={`w-full mt-1 px-3 py-2 border rounded-lg font-bold text-[#84cc16] ${innerBg}`} />
              </div>
            </div>
            <div>
              <label className="text-neutral-400">Sessions Description</label>
              <input name="planSessions" defaultValue="Standard Gym Access" className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} />
            </div>
            <button type="submit" className="w-full py-2.5 bg-[#84cc16] text-black font-bold rounded-xl">Save Plan</button>
          </form>
        </div>
      )}

      {/* MEMBER PASS & INVOICE POPUP (Clean Rupee, zero dollar signs, clean text) */}
      {createdMemberCard && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <div className={`${cardBg} border-2 border-[#84cc16] p-5 rounded-2xl max-w-sm w-full space-y-3 text-center shadow-2xl`}>
            <CheckCircle2 className="w-9 h-9 text-[#84cc16] mx-auto" />
            <h3 className={`text-base sm:text-lg font-black ${textColor}`}>{createdMemberCard.name} Registered!</h3>
            <p className="text-xs text-[#84cc16] font-mono font-bold">MEMBER CODE: {createdMemberCard.id}</p>
            
            <div className={`p-2.5 border rounded-xl text-left text-xs space-y-1 font-mono ${innerBg}`}>
              <div>Mobile: +91 {createdMemberCard.phone}</div>
              <div>Plan: {createdMemberCard.plan} (₹{createdMemberCard.basePlanAmount})</div>
              {createdMemberCard.admissionAmount > 0 && <div className="text-amber-500">Admission Fee: ₹{createdMemberCard.admissionAmount}</div>}
              {createdMemberCard.ptAmount > 0 && <div className="text-cyan-400">PT Package: ₹{createdMemberCard.ptAmount} (Trainer: {createdMemberCard.ptTrainer})</div>}
              {createdMemberCard.discountAmount > 0 && <div className="text-rose-400">Discount: -₹{createdMemberCard.discountAmount} ({createdMemberCard.discountPercent}%)</div>}
              {createdMemberCard.calculatedTax > 0 && <div className="text-amber-400">Tax/GST ({createdMemberCard.taxPercent}%): + ₹{createdMemberCard.calculatedTax}</div>}
              <div className="pt-1 border-t border-neutral-800 font-bold text-[#84cc16]">Grand Total: ₹{createdMemberCard.totalBill} (Paid via {createdMemberCard.paymentMethod}: ₹{createdMemberCard.totalPaid})</div>
              {createdMemberCard.dues > 0 && <div className="text-rose-500 font-bold">Balance Dues: ₹{createdMemberCard.dues}</div>}
              <div>Validity: {formatDDMMYYYY(createdMemberCard.startDate)} to {formatDDMMYYYY(createdMemberCard.expires)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  const publicBase = getPublicAppUrl();
                  const invoiceFullUrl = `${publicBase}/api/invoices/${createdMemberCard.id}`;
                  
                  const ptDetailsText = createdMemberCard.ptAmount > 0 ? `\n- PT Package: ₹${createdMemberCard.ptAmount} (${createdMemberCard.ptTrainer})` : '';
                  const admDetailsText = createdMemberCard.admissionAmount > 0 ? '\n- Admission Fee: ₹500' : '';
                  const duesText = createdMemberCard.dues > 0 ? `\n- Balance Dues: ₹${createdMemberCard.dues}` : '\n- Balance Dues: ₹0 (Fully Paid)';
                  
                  const welcomeMsg = `Hello ${createdMemberCard.name} !\n\nWelcome to ${dbData?.gymProfile?.name || 'Iron Temple Fitness'}.\nYour gym membership is successfully confirmed!\n\nMEMBERSHIP SUMMARY:\n- Member ID: ${createdMemberCard.id}\n- Plan: ${createdMemberCard.plan} (₹${createdMemberCard.basePlanAmount})${admDetailsText}${ptDetailsText}\n- Total Paid: ₹${createdMemberCard.totalPaid} (via ${createdMemberCard.paymentMethod})${duesText}\n- Validity: ${formatDDMMYYYY(createdMemberCard.startDate)} to ${formatDDMMYYYY(createdMemberCard.expires)}\n\nYou can view/download your invoice (PDF) here:\n${invoiceFullUrl}\n\nThank you for being a valued member!`;

                  // Download invoice in background
                  downloadOfficialTemplatePDF(createdMemberCard);

                  // Open WhatsApp
                  openWhatsApp(createdMemberCard.phone, welcomeMsg);
                }} 
                className="py-2 bg-[#84cc16] text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-[#72b012] transition"
              >
                <Share2 className="w-3.5 h-3.5" /> WhatsApp Pass
              </button>
              <button 
                onClick={() => {
                  window.open(`/api/invoices/${createdMemberCard.id}`, '_blank');
                }} 
                className={`py-2 border rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${innerBg} ${textColor}`}
              >
                <Download className="w-3.5 h-3.5" /> Download PDF Invoice
              </button>
            </div>
            <button onClick={() => setCreatedMemberCard(null)} className={`w-full py-1.5 rounded-lg text-xs font-semibold ${innerBg} ${subTextColor} hover:${textColor}`}>Done</button>
          </div>
        </div>
      )}

      {/* PT Assignment Receipt & Share Modal */}
      {assignedPTSuccessCard && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <div className={`${cardBg} border-2 border-cyan-400 p-5 rounded-2xl max-w-sm w-full space-y-3 text-center shadow-2xl`}>
            <CheckCircle2 className="w-9 h-9 text-cyan-400 mx-auto" />
            <h3 className={`text-base sm:text-lg font-black ${textColor}`}>PT Package Assigned!</h3>
            <p className="text-xs text-cyan-400 font-mono font-bold">RECEIPT: {assignedPTSuccessCard.receipt}</p>
            
            <div className={`p-2.5 border rounded-xl text-left text-xs space-y-1 font-mono ${innerBg}`}>
              <div>Client: <strong>{assignedPTSuccessCard.member}</strong></div>
              <div>Trainer: <strong>{assignedPTSuccessCard.trainer}</strong></div>
              <div>Sessions: <strong>{assignedPTSuccessCard.sessions} Sessions</strong></div>
              <div>Fee Recorded: <strong className="text-[#84cc16]">₹{assignedPTSuccessCard.price} ({assignedPTSuccessCard.method})</strong></div>
              <div>Duration: {formatDDMMYYYY(assignedPTSuccessCard.startDate)} to {formatDDMMYYYY(assignedPTSuccessCard.endDate)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  const publicBase = getPublicAppUrl();
                  const invoiceFullUrl = `${publicBase}/api/invoices/INV-${assignedPTSuccessCard.receipt}`;
                  const msg = `Hello ${assignedPTSuccessCard.member} !\n\nYour Personal Training package at ${dbData?.gymProfile?.name || 'Iron Temple Fitness'} is confirmed!\n\n- Coach: ${assignedPTSuccessCard.trainer}\n- Sessions: ${assignedPTSuccessCard.sessions} Sessions\n- Fee Paid: ₹{assignedPTSuccessCard.price} via ${assignedPTSuccessCard.method}\n- Validity: ${formatDDMMYYYY(assignedPTSuccessCard.startDate)} to ${formatDDMMYYYY(assignedPTSuccessCard.endDate)}\n\nYou can view/download your invoice (PDF) here:\n${invoiceFullUrl}\n\nThank you for being a valued member!`;
                  downloadOfficialTemplatePDF(assignedPTSuccessCard);
                  openWhatsApp('9876543210', msg);
                }} 
                className="py-2 bg-[#84cc16] text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button 
                onClick={() => {
                  window.open(`/api/invoices/INV-${assignedPTSuccessCard.receipt}`, '_blank');
                }} 
                className={`py-2 border rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${innerBg} ${textColor}`}
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
            <button onClick={() => setAssignedPTSuccessCard(null)} className={`w-full py-1.5 rounded-lg text-xs font-semibold ${innerBg} ${subTextColor} hover:${textColor}`}>Done</button>
          </div>
        </div>
      )}

      {/* RECEIPT POPUP */}
      {receiptSuccess && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999]" onClick={(e) => e.stopPropagation()}>
          <div className={`${cardBg} border-2 border-[#84cc16] p-5 rounded-2xl max-w-sm w-full space-y-3 text-center shadow-2xl`}>
            <CheckCircle2 className="w-9 h-9 text-[#84cc16] mx-auto" />
            <h3 className={`text-base sm:text-lg font-bold ${textColor}`}>Payment recorded</h3>
            <div className={`p-2.5 border rounded-xl text-left text-xs font-mono space-y-1 ${innerBg}`}>
              <div>Receipt: <strong className="text-[#84cc16]">{receiptSuccess.receipt}</strong></div>
              <div>Member: <strong className={textColor}>{receiptSuccess.member}</strong></div>
              <div>Date: <strong className={textColor}>{formatDDMMYYYY(receiptSuccess.date || todayStr)}</strong></div>
              <div>Amount: <strong className={textColor}>₹{receiptSuccess.amount}</strong></div>
              <div>Method: <strong className={textColor}>{receiptSuccess.method}</strong></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => downloadOfficialTemplatePDF(receiptSuccess)} className={`w-1/2 py-2 border rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${innerBg} ${textColor}`}>
                <Printer className="w-3.5 h-3.5" /> Print / PDF
              </button>
              <button 
                onClick={() => {
                  const publicBase = getPublicAppUrl();
                  const invoiceFullUrl = `${publicBase}/api/invoices/${receiptSuccess.receipt}`;
                  downloadOfficialTemplatePDF(receiptSuccess);
                  openWhatsApp(receiptSuccess.phone || '919890073646', `Hello ${receiptSuccess.member} !\n\nPayment Receipt: ${receiptSuccess.receipt} - ${dbData?.gymProfile?.name} for ₹${receiptSuccess.amount} via ${receiptSuccess.method}.\n\nYou can view/download your invoice (PDF) here:\n${invoiceFullUrl}\n\nThank you for being a valued member!`);
                  setReceiptSuccess(null);
                }} 
                className="w-1/2 py-2 bg-[#84cc16] text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}