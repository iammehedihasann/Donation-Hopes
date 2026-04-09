/** মক OTP স্টোর (ইন-মেমোরি) — প্রোডাকশনে SMS প্রদানকারীর সাথে বদলান */
const store = new Map<string, { otp: string; expires: number }>();

const TTL_MS = 5 * 60 * 1000;

export function setOtp(phone: string, otp: string): void {
  store.set(phone, { otp, expires: Date.now() + TTL_MS });
}

export function verifyOtp(phone: string, otp: string): boolean {
  const row = store.get(phone);
  if (!row) return false;
  if (Date.now() > row.expires) {
    store.delete(phone);
    return false;
  }
  const ok = row.otp === otp;
  if (ok) store.delete(phone);
  return ok;
}

export function peekOtpForDev(phone: string): string | undefined {
  return store.get(phone)?.otp;
}
