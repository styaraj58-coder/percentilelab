import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="Percentile Lab"
        width={36}
        height={36}
        className="h-9 w-9 object-contain"
        priority
      />
      <span className="font-semibold text-lg leading-tight text-brand-navy">
        Percentile <span className="text-brand-gold">Lab</span>
      </span>
    </Link>
  );
}
