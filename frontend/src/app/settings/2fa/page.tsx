'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export default function TwoFactorSettingsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [code, setCode] = useState('');
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/2fa/status');
      setEnabled(response.data.enabled);
      setConfirmed(response.data.confirmed);
    } catch (err) {
      console.error('Erro ao carregar status 2FA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (!token) {
      router.push('/');
      return;
    }
    loadStatus();
  }, [router]);

  const handleEnable = async () => {
    setError(null);
    setSuccess(null);
    setWorking(true);
    try {
      const response = await api.post('/api/2fa/enable');
      setQrCodeSvg(response.data.qr_code_svg);
      setRecoveryCodes(response.data.recovery_codes || []);
      setEnabled(response.data.enabled);
      setConfirmed(response.data.confirmed);
      setSuccess(t('settings.2fa.enabled'));
    } catch (err: any) {
      setError(err?.response?.data?.message || t('settings.2fa.error.enable'));
    } finally {
      setWorking(false);
    }
  };

  const handleConfirm = async () => {
    setError(null);
    setSuccess(null);
    setWorking(true);
    try {
      const response = await api.post('/api/2fa/confirm', { code });
      setConfirmed(response.data.confirmed);
      setRecoveryCodes(response.data.recovery_codes || []);
      setSuccess(t('settings.2fa.confirmed'));
    } catch (err: any) {
      setError(err?.response?.data?.message || t('settings.2fa.error.confirm'));
    } finally {
      setWorking(false);
    }
  };

  const handleDisable = async () => {
    setError(null);
    setSuccess(null);
    setWorking(true);
    try {
      const response = await api.post('/api/2fa/disable');
      setEnabled(response.data.enabled);
      setConfirmed(response.data.confirmed);
      setQrCodeSvg(null);
      setRecoveryCodes([]);
      setSuccess(t('settings.2fa.disabled'));
    } catch (err: any) {
      setError(err?.response?.data?.message || t('settings.2fa.error.disable'));
    } finally {
      setWorking(false);
    }
  };

  const handleRegenerateCodes = async () => {
    setError(null);
    setSuccess(null);
    setWorking(true);
    try {
      const response = await api.post('/api/2fa/recovery-codes');
      setRecoveryCodes(response.data.recovery_codes || []);
      setSuccess(t('settings.2fa.codes.updated'));
    } catch (err: any) {
      setError(err?.response?.data?.message || t('settings.2fa.error.codes'));
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('settings.back')}
        </button>

        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold">{t('settings.2fa.title')}</h1>
          </div>

          <p className="text-gray-400 mb-6">
            {t('settings.2fa.subtitle')}
          </p>

          {(error || success) && (
            <div className={`mb-4 rounded-lg p-3 ${error ? 'bg-red-900/40 text-red-200' : 'bg-green-900/40 text-green-200'}`}>
              {error || success}
            </div>
          )}

          <div className="space-y-4">
            {!enabled && (
              <button
                onClick={handleEnable}
                disabled={working}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold disabled:opacity-50"
              >
                {t('settings.2fa.button.enable')}
              </button>
            )}

            {enabled && !confirmed && qrCodeSvg && (
              <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <div className="text-center text-sm text-gray-300 mb-3">
                    {t('settings.2fa.qr.hint')}
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute -inset-2 rounded-xl bg-purple-500/20 blur-lg animate-pulse"></div>
                      <div className="relative bg-white rounded-lg p-4" dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">{t('settings.2fa.input.code')}</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="123456"
                  />
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={working || !code}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold disabled:opacity-50"
                >
                  {t('settings.2fa.button.confirm')}
                </button>
              </div>
            )}

            {enabled && confirmed && (
              <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-300 mb-3">{t('settings.2fa.codes.title')}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-200">
                    {recoveryCodes.length > 0 ? (
                      recoveryCodes.map((codeItem) => (
                        <span key={codeItem} className="bg-gray-800 rounded-md px-2 py-1">{codeItem}</span>
                      ))
                    ) : (
                      <span className="text-gray-400">{t('settings.2fa.codes.empty')}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleRegenerateCodes}
                    disabled={working}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t('settings.2fa.button.regenerate')}
                  </button>

                  <button
                    onClick={handleDisable}
                    disabled={working}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {t('settings.2fa.button.disable')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
