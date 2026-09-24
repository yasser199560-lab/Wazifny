import Image from "next/image";
import Link from "next/link";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-wazifny-navy px-4 py-12">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.svg')" }}
      />
      <div className="absolute inset-0 bg-wazifny-navy/70" />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <Link href="/" className="mb-6 flex items-center justify-center">
          <Image
            src="/images/wazifny-logo-horizontal.png"
            alt="Wazifny"
            width={132}
            height={34}
          />
        </Link>
        {children}
      </div>
    </div>
  );
}
