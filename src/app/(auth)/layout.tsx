import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#009677]/8 via-transparent to-[#8dc63f]/10"
      />
      <div className="relative z-10 mb-8 flex flex-col items-center gap-3 text-center">
        <Image
          src="/brand/om-anchor-tick.svg"
          alt="Old Mutual"
          width={48}
          height={48}
          priority
        />
        <div>
          <p className="text-sm font-medium tracking-wide text-[#009677] uppercase">
            Programme Control Platform
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#062f27]">
            Web Transformation Programme
          </h1>
        </div>
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
