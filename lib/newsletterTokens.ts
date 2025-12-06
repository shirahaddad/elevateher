import crypto from 'crypto';

function getSecret(): string {
  const secret = process.env.NEWSLETTER_SECRET;
  if (!secret) {
    throw new Error('Missing NEWSLETTER_SECRET environment variable');
  }
  return secret;
}

function base64url(input: Buffer | string): string {
  return (typeof input === 'string' ? Buffer.from(input) : input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64url(input: string): Buffer {
  const pad = 4 - (input.length % 4 || 4);
  const str = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
  return Buffer.from(str, 'base64');
}

export function signUnsubscribeToken(email: string, purpose: 'newsletter', expiresInDays = 365): string {
  const payload = {
    email: email.toLowerCase(),
    purpose,
    exp: Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60,
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64url(payloadStr);
  const hmac = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest();
  const sig = base64url(hmac);
  return `${payloadB64}.${sig}`;
}

export function verifyUnsubscribeToken(token: string): { email: string; purpose: 'newsletter' } {
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) throw new Error('Invalid token format');
  const expected = base64url(crypto.createHmac('sha256', getSecret()).update(payloadB64).digest());
  if (!crypto.timingSafeEqual(fromBase64url(sig), fromBase64url(expected))) {
    throw new Error('Invalid token signature');
  }
  const payload = JSON.parse(fromBase64url(payloadB64).toString('utf8')) as {
    email: string;
    purpose: 'newsletter';
    exp?: number;
  };
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }
  if (payload.purpose !== 'newsletter') throw new Error('Invalid token purpose');
  return { email: payload.email.toLowerCase(), purpose: 'newsletter' };
}



