"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSignUp } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOtpResendCountdown } from "@/hooks/use-otp-resend-countdown";

function AuthFieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

export function SignUpForm() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();
  const { secondsLeft, canResend, restart } = useOtpResendCountdown();
  const [formError, setFormError] = React.useState<string | null>(null);
  const isSubmitting = fetchStatus === "fetching";

  React.useEffect(() => {
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, router]);

  const needsEmailVerification = signUp.unverifiedFields.includes("email_address");

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const emailAddress = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const { error } = await signUp.password({
      username,
      emailAddress,
      password,
    });

    if (error) {
      setFormError(error.message ?? "Unable to create account.");
      return;
    }

    const sendResult = await signUp.verifications.sendEmailCode();
    if (sendResult.error) {
      setFormError(sendResult.error.message ?? "Unable to send verification code.");
      return;
    }

    restart();
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") ?? "").trim();

    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status !== "complete") {
      setFormError("Verification incomplete. Check the code and try again.");
      return;
    }

    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          return;
        }

        const url = decorateUrl("/dashboard");
        if (url.startsWith("http")) {
          window.location.href = url;
          return;
        }

        router.push(url);
      },
    });
  };

  const handleResend = async () => {
    if (!canResend || isSubmitting) {
      return;
    }

    setFormError(null);
    const result = await signUp.verifications.sendEmailCode();

    if (result.error) {
      setFormError(result.error.message ?? "Unable to resend verification code.");
      return;
    }

    restart();
  };

  if (isSignedIn) {
    return null;
  }

  if (needsEmailVerification) {
    return (
      <Card className="border-[#d5e9e1] shadow-lg shadow-[#009677]/10">
        <CardHeader>
          <CardTitle className="text-[#062f27]">Verify your email</CardTitle>
          <CardDescription className="text-[#062f27]/70">
            Enter the verification code sent to{" "}
            <span className="font-medium text-[#062f27]">
              {signUp.emailAddress ?? "your email"}
            </span>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleVerify}>
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter code"
                required
              />
              <AuthFieldError message={errors.fields.code?.message} />
            </div>

            {formError && <AuthFieldError message={formError} />}

            <Button
              type="submit"
              className="w-full bg-[#009677] hover:bg-[#00483d]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify email"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-[#062f27]/70">
            {canResend ? (
              <button
                type="button"
                className="font-medium text-[#009677] hover:text-[#00483d]"
                onClick={handleResend}
                disabled={isSubmitting}
              >
                Resend code
              </button>
            ) : (
              <p>Resend code in {secondsLeft}s</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#d5e9e1] shadow-lg shadow-[#009677]/10">
      <CardHeader>
        <CardTitle className="text-[#062f27]">Create your account</CardTitle>
        <CardDescription className="text-[#062f27]/70">
          Sign up with username, email, and password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSignUp}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              placeholder="Choose a username"
              required
            />
            <AuthFieldError message={errors.fields.username?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
            />
            <AuthFieldError message={errors.fields.emailAddress?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              required
            />
            <AuthFieldError message={errors.fields.password?.message} />
          </div>

          {formError && <AuthFieldError message={formError} />}

          <div id="clerk-captcha" />

          <Button
            type="submit"
            className="w-full bg-[#009677] hover:bg-[#00483d]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Continue"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-[#062f27]/70">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-[#009677] hover:text-[#00483d]"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
