'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';

export default function TwoFactorLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challenge = searchParams.get('challenge');

  const [code, setCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!challenge) {
      router.push('/');
    }
  }, [challenge, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/auth/2fa/verify', {
        challenge,
        code: code || null,
        recovery_code: recoveryCode || null,
      });

      const token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('auth_token', token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Código inválido.');
    } finally {
      setLoading(false);
    }
  };

  if (!challenge) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold">Verificação 2FA</h1>
        </div>

        <p className="text-sm text-gray-400">
          Digite o código do seu aplicativo autenticador ou um código de recuperação.
        </p>

        {error && (
          <div className="bg-red-900/40 text-red-200 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código 2FA"
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value)}
            placeholder="Código de recuperação (opcional)"
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || (!code && !recoveryCode)}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verificar'}
        </button>
      </form>
    </div>
  );
}
