async function testLiveAuth() {
  const url = 'https://grand-bandhan.onrender.com/api/auth/login';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: '23cyber57@ecajmer.ac.in',
      password: 'Bandhan@2025!',
    }),
  });

  const data = await res.json();
  console.log('Login Status:', res.status);
  console.log('Response keys:', Object.keys(data.data || {}));
  console.log('User Role:', data.data?.user?.role);
  
  const token = data.data?.accessToken || data.data?.token || data.data?.jwt;
  console.log('Token exists:', !!token);

  if (token) {
    // Test fetching enquiries
    const enqRes = await fetch('https://grand-bandhan.onrender.com/api/enquiries', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const enqData = await enqRes.json();
    console.log('Enquiries fetched from live API:', enqData.data?.length || 0);

    // Test fetching weddings
    const wedRes = await fetch('https://grand-bandhan.onrender.com/api/weddings', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const wedData = await wedRes.json();
    console.log('Weddings fetched from live API:', wedData.data?.length || 0);

    // Test fetching consultations
    const conRes = await fetch('https://grand-bandhan.onrender.com/api/consultations', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const conData = await conRes.json();
    console.log('Consultations fetched from live API:', conData.data?.length || 0);
  }
}

testLiveAuth().catch(console.error);
