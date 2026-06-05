"use client";

import * as React from "react";

import { OTP_RESEND_COUNTDOWN_SECONDS } from "@/lib/clerk-config";

export function useOtpResendCountdown(
  durationSeconds: number = OTP_RESEND_COUNTDOWN_SECONDS,
) {
  const [secondsLeft, setSecondsLeft] = React.useState(durationSeconds);

  React.useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [secondsLeft]);

  const restart = React.useCallback(() => {
    setSecondsLeft(durationSeconds);
  }, [durationSeconds]);

  return {
    secondsLeft,
    canResend: secondsLeft === 0,
    restart,
  };
}
