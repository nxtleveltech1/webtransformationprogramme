export const clerkAppearance = {
  variables: {
    colorPrimary: "#009677",
    colorText: "#062f27",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#062f27",
    borderRadius: "0.875rem",
    fontFamily: "var(--font-sans), Montserrat, sans-serif",
  },
  elements: {
    rootBox: "mx-auto w-full",
    card: "shadow-lg shadow-[#009677]/10 border border-[#d5e9e1]",
    headerTitle: "font-semibold text-[#062f27]",
    headerSubtitle: "text-[#062f27]/70",
    socialButtonsBlockButton:
      "border border-[#d5e9e1] hover:bg-[#f4fbf7] transition-colors",
    formButtonPrimary:
      "bg-[#009677] hover:bg-[#00483d] text-white shadow-sm transition-colors",
    footerActionLink: "text-[#009677] hover:text-[#00483d]",
    formFieldInput:
      "border-[#d5e9e1] focus:ring-[#009677] focus:border-[#009677]",
    identityPreviewEditButton: "text-[#009677]",
    formResendCodeLink: "text-[#009677]",
  },
} as const;
