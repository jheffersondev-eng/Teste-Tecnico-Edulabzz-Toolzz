'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { t } = useI18n()

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const currentTheme = theme === 'system' ? systemTheme : theme

  return (
    <button
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      className="group relative rounded-lg p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110 active:scale-95"
      aria-label={t('nav.theme.toggle')}
    >
      <div className="relative w-5 h-5">
        {currentTheme === 'dark' ? (
          <Sun className="h-5 w-5 text-yellow-500 animate-in spin-in-180 duration-500" />
        ) : (
          <Moon className="h-5 w-5 text-indigo-600 animate-in spin-in-180 duration-500" />
        )}
      </div>
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {currentTheme === 'dark' ? t('nav.theme.light') : t('nav.theme.dark')}
      </span>
    </button>
  )
}
