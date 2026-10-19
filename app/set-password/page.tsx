'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Loader2, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InviteInfo {
  username: string;
  name: string;
  office: string;
  hasPassword: boolean;
}

export default function SetPasswordPage() {
  const [token, setToken] = useState('');
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [status, setStatus] = useState<'loading' | 'invalid' | 'ready' | 'done'>('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('token') || '';
    setToken(value);
    if (!value) {
      setStatus('invalid');
      return;
    }
    fetch(`/api/auth/invite?token=${encodeURIComponent(value)}`)
      .then((res) => res.json())
      .then((result) => {
        if (result?.success) {
          setInfo(result.data);
          setStatus('ready');
        } else {
          setStatus('invalid');
        }
      })
      .catch(() => setStatus('invalid'));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.error || 'Could not set password.');
        return;
      }
      setStatus('done');
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="relative min-h-screen w-full flex items-center justify-center bg-center bg-cover"
      style={{ backgroundImage: "url('/psir-ms-bg.webp')" }}
    >
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 w-full max-w-md px-4 page-transition">
        <Card className="shadow-xl border-none">
          <CardContent className="p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <Image src="/Parole_and_Probation_Administration_(PPA).svg" alt="PPA logo" width={64} height={64} unoptimized priority />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {info?.hasPassword ? 'Reset your password' : 'Set your password'}
                </h1>
                <p className="text-sm text-gray-500">PSIR Management System</p>
              </div>
            </div>

            {status === 'loading' && (
              <p className="text-center text-sm text-gray-500"><Loader2 className="inline h-4 w-4 animate-spin" /> Checking link…</p>
            )}

            {status === 'invalid' && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-destructive">This link is invalid, expired, or already used.</p>
                <p className="text-sm text-gray-500">Ask your administrator for a new link.</p>
                <Link href="/login" className="text-sm underline">Back to sign in</Link>
              </div>
            )}

            {status === 'done' && (
              <div className="space-y-4 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
                <p className="text-sm text-gray-700">Password saved. You can sign in now.</p>
                <Button asChild className="w-full"><Link href="/login">Go to sign in</Link></Button>
              </div>
            )}

            {status === 'ready' && info && (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="rounded-md bg-muted px-3 py-2 text-sm">
                  <div className="font-medium text-gray-900">{info.name}</div>
                  <div className="text-gray-500">{info.username} · {info.office}</div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input id="password" type="password" autoComplete="new-password" autoFocus required value={password} onChange={(e) => setPassword(e.target.value)} />
                  <p className="text-xs text-gray-500">At least 8 characters.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={submitting || !password || !confirm}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                  Save password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
