Step 4: Fix Frontend Handlers in app/page.tsxOpen app/page.tsx in GitHub, click the edit pencil icon, and apply these specific edits:1. Fix "Collected Today" Not Adding Member Payments (Issue 2)In handleCreateMember, make sure the initial membership payment is logged immediately with date: todayStr:TypeScriptif (payNowCalculated > 0) {
  const pRes = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      member: created.name,
      phone: created.phone,
      amount: payNowCalculated,
      method: newMemberForm.paymentMethod,
      plan: created.plan,
      date: todayStr,
      operator: activeUser?.name || 'Owner'
    })
  });
  await fetchData();
}
And check that totalCollectedToday filters using:TypeScriptconst totalCollectedToday = (dbData?.payments || [])
  .filter((p: any) => String(p.date || '').split('T')[0] === todayStr)
  .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
2. Fix Expense PDF Generator Showing undefined (Issue 6)In downloadFilteredExpensesPDF, update the row mapping to check both paidTo and title:   TypeScriptconst rows = filteredExpensesList.map((e: any) => `
  <tr>
    <td>${formatDDMMYYYY(e.date)}</td>
    <td><strong>${e.category}</strong></td>
    <td>${e.paidTo || e.title || 'Vendor'}</td>
    <td>${e.method || 'UPI'}</td>
    <td style="text-align: right; color: red;">₹${e.amount}</td>
  </tr>
`).join('');
3. Fix Trainer Form Default Email & Password (Issue 4)In showAddTrainerModal, change the email and password inputs to be empty placeholders rather than pre-filling trainer@gym.com:TypeScript<input 
  name="trEmail" 
  type="email" 
  required 
  placeholder="Enter trainer's email" 
  className={`w-full mt-1 px-3 py-2 border rounded-lg ${innerBg} ${textColor}`} 
/>
<input 
  name="trPassword" 
  type={showAddTrainerPassword ? "text" : "password"} 
  required 
  placeholder="Set password" 
  className={`w-full px-3 py-2 pr-9 border rounded-lg outline-none ${innerBg} ${textColor}`} 
/>
4. Fix Collect Button in Collections Tab (Issue 5)In the Collections table, update the Collect button onClick handler:TypeScript<button 
  onClick={async (e) => { 
    e.stopPropagation(); 
    try {
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member: m.name,
          phone: m.phone || '',
          amount: Number(m.dues),
          method: 'UPI',
          plan: 'Dues Settlement',
          date: todayStr,
          operator: activeUser?.name || 'Owner'
        })
      });
      await fetch(`/api/members/${m.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dues: 0 })
      });
      await fetchData();
      alert(`Dues of ₹${m.dues} cleared for ${m.name}!`);
    } catch(err) {
      alert('Error clearing dues');
    }
  }} 
  className="px-3 py-1 bg-[#84cc16] text-black font-bold rounded text-xs"
>
  Collect
</button>
5. Fix Save Profile & Billing Settings (Issue 8)In the settings tab under settingsSubTab === 'profile', make sure the form submits and immediately refreshes dbData:TypeScript<form 
  onSubmit={async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/settings/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: e.target.gymName.value,
        branch: e.target.gymBranch.value,
        phone: e.target.gymPhone.value,
        publicUrl: e.target.publicUrl.value.trim()
      })
    });
    if (res.ok) {
      alert('Gym Profile updated successfully!');
      await fetchData();
    }
  }}
