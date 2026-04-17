const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD?.replace(/\s+/g, '');
const DEFAULT_FROM_NAME = process.env.EMAIL_FROM_NAME || 'TalentFlow';

let transporter = null;
let nodemailerModule = null;
let nodemailerLoadAttempted = false;

async function getNodemailer() {
  if (nodemailerModule) return nodemailerModule;
  if (nodemailerLoadAttempted) return null;
  nodemailerLoadAttempted = true;

  try {
    const mod = await import('nodemailer');
    nodemailerModule = mod.default || mod;
    return nodemailerModule;
  } catch (err) {
    console.warn(
      'Nodemailer is not installed. Email sending is disabled until you run: npm.cmd install',
      err?.message || err
    );
    return null;
  }
}

async function getTransporter() {
  if (transporter) return transporter;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    // Fallback: create a stub transporter that logs instead of sending
    transporter = {
      sendMail: async (mail) => {
        console.log('Mail not sent (missing SMTP config).', mail);
        return { accepted: [], rejected: [] };
      },
    };
    return transporter;
  }

  const nodemailer = await getNodemailer();
  if (!nodemailer) {
    transporter = {
      sendMail: async (mail) => {
        console.log('Mail not sent (nodemailer missing).', mail);
        return { accepted: [], rejected: [] };
      },
    };
    return transporter;
  }

  const smtpTimeoutMs = Number(process.env.SMTP_TIMEOUT_MS) || 40000;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports (STARTTLS)
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
    requireTLS: Number(SMTP_PORT) === 587,
    connectionTimeout: smtpTimeoutMs,
    greetingTimeout: smtpTimeoutMs,
    socketTimeout: smtpTimeoutMs,
  });

  // Verify transporter connectivity (fail fast and log helpful message)
  try {
    const verifyPromise = transporter.verify();
    // Ensure verify respects the same timeout
    await Promise.race([
      verifyPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`SMTP verify timeout after ${smtpTimeoutMs}ms`)), smtpTimeoutMs)
      ),
    ]);
    console.log('SMTP transporter verified');
  } catch (err) {
    console.warn('SMTP transporter verification failed', err?.message || err);
    // keep transporter — sendMail will handle failures and fallbacks
  }

  return transporter;
}

export async function sendMail({ to, subject, text, html, fromName }) {
  const transport = await getTransporter();

  const from = `${fromName || DEFAULT_FROM_NAME} <${SMTP_USER || 'no-reply@example.com'}>`;

  const mail = {
    from,
    to,
    subject,
    text,
    html,
  };

  try {
    const timeoutMs = Number(process.env.SMTP_TIMEOUT_MS) || 40000;

    // Retry logic for transient SMTP/network errors
    const maxAttempts = Number(process.env.SMTP_MAX_RETRIES) || 2;
    let attempt = 0;
    while (true) {
      attempt += 1;
      try {
        const sendPromise = transport.sendMail(mail);
        const result = await Promise.race([
          sendPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`SMTP send timeout after ${timeoutMs}ms`)), timeoutMs)
          ),
        ]);
        console.log('Email sent', { to, subject, attempt });
        return result;
      } catch (err) {
        const msg = (err && err.message) || String(err);
        const retryable = /timeout|ETIMEDOUT|ECONNRESET|EAI_AGAIN|ECONNREFUSED/i.test(msg);
        console.error('Error sending email', { to, subject, attempt, error: msg });

        if (!retryable || attempt > maxAttempts) {
          throw err;
        }

        // exponential backoff before retrying
        const backoffMs = Math.min(1000 * 2 ** (attempt - 1), 10000);
        console.log(`Retrying email send in ${backoffMs}ms (attempt ${attempt + 1})`);
        await new Promise((res) => setTimeout(res, backoffMs));
        // loop to retry
      }
    }
  } catch (err) {
    console.error('Error sending email', err);
    throw err;
  }
}

export async function sendVerificationEmail(to, token) {
  const subject = 'Verify your TalentFlow email';
  const text = `Your TalentFlow verification code is: ${token}`;
  const html = `<p>Your TalentFlow verification code is: <strong>${token}</strong></p><p>This code will expire in 24 hours.</p>`;

  return sendMail({ to, subject, text, html });
}

export async function sendPasswordResetEmail(to, token) {
  const subject = 'TalentFlow password reset';
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/set-new-password?token=${token}`;
  const text = `Reset your password using the link: ${resetUrl}\n\nOr use this reset code: ${token}`;
  const html = `<p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Or copy the reset code: <strong>${token}</strong></p>`;

  // Log the mail contents for debugging (do not expose in production logs)
  try {
    console.debug('Preparing password reset email', { to, subject, token, resetUrl });
  } catch (e) {
    // ignore
  }

  return sendMail({ to, subject, text, html });
}

export async function sendContactMessage({ name, email, message }) {
  const to = process.env.CONTACT_RECEIVER_EMAIL || SMTP_USER || 'support@example.com';
  const subject = `Contact form: ${name} <${email}>`;
  const text = `${message}\n\nFrom: ${name} <${email}>`;
  const html = `<p>${message.replace(/\n/g, '<br/>')}</p><hr/><p>From: <strong>${name}</strong> &lt;${email}&gt;</p>`;

  return sendMail({ to, subject, text, html });
}

export default { sendMail, sendVerificationEmail, sendPasswordResetEmail, sendContactMessage };
