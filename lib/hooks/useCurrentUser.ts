'use client';

import { useEffect, useState } from 'react';

export interface CurrentUser {
  id: number;
  username: string;
  name: string;
  role: 'ADMIN' | 'OFFICER';
  officeId: number;
  officeCode: string;
}

let cached: CurrentUser | null = null;
let inflight: Promise<CurrentUser | null> | null = null;

async function load(): Promise<CurrentUser | null> {
  if (cached) return cached;
  if (!inflight) {
    inflight = fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => (result?.success ? (cached = result.data as CurrentUser) : null))
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function clearCurrentUserCache() {
  cached = null;
}

/** Current signed-in user (cached per page load). `undefined` while loading. */
export function useCurrentUser(): CurrentUser | null | undefined {
  const [user, setUser] = useState<CurrentUser | null | undefined>(cached ?? undefined);

  useEffect(() => {
    let active = true;
    load().then((value) => {
      if (active) setUser(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return user;
}
