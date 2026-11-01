async function testRenderEmailEndpoint() {
  console.log('Logging in to live Render API as shreyanshsharma049@gmail.com...');

  const loginRes = await fetch('https://grand-bandhan.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'shreyanshsharma049@gmail.com', password: 'Password@123' }),
  });

  const loginData = await loginRes.json();
  console.log('Login response status:', loginRes.status, loginData.success);

  const token = loginData.data?.accessToken;
  if (!token) {
    console.error('Failed to get token:', loginData);
    return;
  }

  // 1. Check /api/email/status
  console.log('\nQuerying /api/email/status on Render...');
  const statusRes = await fetch('https://grand-bandhan.onrender.com/api/email/status', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Status HTTP code:', statusRes.status);
  const statusData = await statusRes.json();
  console.log('Email Status on Render:', JSON.stringify(statusData, null, 2));

  // 2. Try sending test email
  console.log('\nAttempting /api/email/test on Render...');
  const testRes = await fetch('https://grand-bandhan.onrender.com/api/email/test', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: 'shreyanshsharma049@gmail.com',
      subject: '👑 Grand Bandhan — Live Production Test',
      message: 'Checking if Gmail API dispatch works directly on Render!',
    }),
  });

  console.log('Test Email HTTP code:', testRes.status);
  const testData = await testRes.json();
  console.log('Test Email Response:', testData);
}

testRenderEmailEndpoint().catch(console.error);
