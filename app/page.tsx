import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <main
      className="relative min-h-screen w-full flex items-center justify-center bg-center bg-cover"
      style={{ backgroundImage: "url('/psir-ms-bg.webp')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4 page-transition">
        <Card className="shadow-xl border-none">
          <CardContent className="p-8 text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <Image
                src="/Parole_and_Probation_Administration_(PPA).svg"
                alt="Parole and Probation Administration Logo"
                width={80}
                height={80}
                unoptimized
                priority
              />
            </div>

            {/* Title block */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Post-Sentence Investigation Report System
              </h1>
              <p className="text-base font-medium text-gray-600">
                Tagbilaran City Parole and Probation Office
              </p>
              <p className="text-sm text-gray-400">
                Parole and Probation Administration — Region VII
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed">
              A digital system for creating, managing, and exporting
              Post-Sentence Investigation Reports for the Department of Justice.
            </p>

            {/* CTA */}
            <Link
              href="/dashboard"
              className="block w-full py-3 px-6 rounded-lg bg-[var(--brand-primary)] text-white font-semibold text-center transition-colors hover:bg-[var(--brand-primary)]/90"
            >
              Go to Dashboard
            </Link>

            {/* Version */}
            <p className="text-xs text-gray-400">Version 1.0.1</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
