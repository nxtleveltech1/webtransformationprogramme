/** Clerk's default OTP resend cooldown is 30 seconds. */
export const OTP_RESEND_COUNTDOWN_DEFAULT_SECONDS = 30;

/** Resend cooldown shown to users during email verification (doubled from Clerk default). */
export const OTP_RESEND_COUNTDOWN_SECONDS = OTP_RESEND_COUNTDOWN_DEFAULT_SECONDS * 2;
