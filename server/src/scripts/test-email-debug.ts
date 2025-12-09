
import 'dotenv/config';
import { sendWelcomeEmail, sendPasswordResetEmail, sendNewsletterBroadcast, sendNewsletterConfirmation } from '../services/email.service';

const testEmail = process.env.TEST_EMAIL || 'antigravity-test@example.com';

async function main() {
    console.log('--- Starting Email Debug Script ---');
    console.log('SMTP Config Check:');
    console.log('HOST:', process.env.SMTP_HOST);
    console.log('PORT:', process.env.SMTP_PORT);
    console.log('USER:', process.env.SMTP_USER ? '(Set)' : '(Not Set)');
    console.log('PASS:', process.env.SMTP_PASS ? '(Set)' : '(Not Set)');
    console.log('FROM:', process.env.SMTP_FROM);
    console.log('Test Recipient:', testEmail);

    try {
        console.log('\n1. Testing sendNewsletterBroadcast (Reported as WORKING)...');
        // Using a list with one email
        await sendNewsletterBroadcast([testEmail], 'Test Broadcast', 'This is a test broadcast to verify connection.');
        console.log('✅ sendNewsletterBroadcast completed without throwing.');
    } catch (error) {
        console.error('❌ sendNewsletterBroadcast failed:', error);
    }

    try {
        console.log('\n2. Testing sendWelcomeEmail (Reported as BROKEN)...');
        await sendWelcomeEmail(testEmail, 'Test User');
        console.log('✅ sendWelcomeEmail completed without throwing.');
    } catch (error) {
        console.error('❌ sendWelcomeEmail failed:', error);
    }

    try {
        console.log('\n3. Testing sendPasswordResetEmail (Reported as BROKEN)...');
        await sendPasswordResetEmail(testEmail, 'dummy-token-123');
        console.log('✅ sendPasswordResetEmail completed without throwing.');
    } catch (error) {
        console.error('❌ sendPasswordResetEmail failed:', error);
    }

    try {
        console.log('\n4. Testing sendNewsletterConfirmation (Reported as BROKEN)...');
        await sendNewsletterConfirmation(testEmail);
        console.log('✅ sendNewsletterConfirmation completed without throwing.');
    } catch (error) {
        console.error('❌ sendNewsletterConfirmation failed:', error);
    }
}

main().catch(console.error);
