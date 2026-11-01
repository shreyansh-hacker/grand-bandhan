import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

async function testGmailEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const senderEmail = process.env.GMAIL_SENDER_EMAIL;

  console.log('Testing Gmail credentials from .env:');
  console.log('Client ID present:', !!clientId);
  console.log('Client Secret present:', !!clientSecret);
  console.log('Refresh Token present:', !!refreshToken);
  console.log('Sender Email:', senderEmail);

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('Missing credentials in .env!');
    return;
  }

  const postData = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  }).toString();

  try {
    const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: postData,
    });

    const data = await res.json();
    console.log('Google OAuth2 response status:', res.status);
    if (res.ok && data.access_token) {
      console.log('SUCCESS! Google OAuth2 returned a valid access_token!');
      console.log('Token type:', data.token_type, 'Expires in:', data.expires_in, 's');
    } else {
      console.error('Google OAuth2 error:', data);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testGmailEnv();
