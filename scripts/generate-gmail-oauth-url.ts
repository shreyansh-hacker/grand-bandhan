import { GmailService } from '../apps/api/src/modules/email/gmail.service';

async function generateUrl() {
  const { url, state } = await GmailService.generateAuthUrl();
  console.log('\n=== GOOGLE GMAIL OAUTH AUTHORIZATION URL ===\n');
  console.log(url);
  console.log('\nState:', state);
}

generateUrl().catch(console.error);
