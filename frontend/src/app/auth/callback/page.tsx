'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get('token')
    const challenge = searchParams.get('challenge')
    
    if (token) {
      localStorage.setItem('token', token)
      localStorage.setItem('auth_token', token)
      router.push('/dashboard')
    } else if (challenge) {
      router.push(`/auth/2fa?challenge=${challenge}`)
    } else {
      router.push('/')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto" />
        <p className="text-lg text-white">Autenticando...</p>
      </div>
    </div>
  )
}
