async function checkRenderStatus() {
  try {
    const res = await fetch('https://grand-bandhan.onrender.com/api/health');
    console.log('Render /api/health status:', res.status, await res.json());

    // Login as super admin to get token
    const loginRes = await fetch('https://grand-bandhan.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@grandbandhan.com', password: 'AdminPassword@2026' }),
    });
    console.log('Login status:', loginRes.status);
    const loginData = await loginRes.json();
    const token = loginData.data?.accessToken;

    if (token) {
      const emailStatusRes = await fetch('https://grand-bandhan.onrender.com/api/email/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Render /api/email/status:', emailStatusRes.status, await emailStatusRes.json());
    }
  } catch (err: any) {
    console.error('Fetch error:', err.message);
  }
}

checkRenderStatus();
