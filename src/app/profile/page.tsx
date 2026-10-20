'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { currentUser, role } = useAuth();

  useEffect(() => {
    if (role === 'visitor') {
      router.replace('/login');
    } else if (currentUser) {
      router.replace(`/members/${currentUser.id}`);
    } else {
      router.replace('/members');
    }
  }, [currentUser, role, router]);

  return <div className="p-12 text-center text-slate-400">Redirecting to your profile...</div>;
}
