import { GmailService } from '../apps/api/src/modules/email/gmail.service';

async function checkStatus() {
  try {
    const status = await GmailService.getStatus();
    console.log('GmailService.getStatus() output:');
    console.log(JSON.stringify(status, null, 2));
  } catch (err: any) {
    console.error('Error in getStatus():', err.message);
  }
}

checkStatus();
