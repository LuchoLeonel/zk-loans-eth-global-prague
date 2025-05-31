'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { handleRequestCredential } from '@/lib/utils'

export function RedirectFromHome() {
  const router = useRouter()
  const isLoggedIn = useIsLoggedIn()

  useEffect(() => {
    if (isLoggedIn === undefined || isLoggedIn === null) return;

    if (isLoggedIn) {
      handleRequestCredential();
    }
  }, [isLoggedIn, router])

  return null
}



export function RedirectFromLoan() {
  const router = useRouter()
  const isLoggedIn = useIsLoggedIn()

  const [voiceprintStatus, setVoiceprintStatus] = useState<'unknown' | 'present' | 'missing'>('unknown')
  const hasCheckedLoginOnce = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const vp = localStorage.getItem('voiceprint')
    const isValid = vp && vp !== 'undefined' && vp !== 'null'
    setVoiceprintStatus(isValid ? 'present' : 'missing')
  }, [])

  useEffect(() => {
    if (isLoggedIn === undefined || isLoggedIn === null) return;
    if (voiceprintStatus === 'unknown') return;

    if (isLoggedIn) hasCheckedLoginOnce.current = true

    if (!hasCheckedLoginOnce.current) return;

    if (!isLoggedIn) {
      console.log('[Redirect] going to /')
      router.replace('/')
      return
    }

    if (isLoggedIn && voiceprintStatus === 'missing') {
      console.log('[Redirect] going to /create-voiceprint')
      router.replace('/create-voiceprint')
      return
    }
  }, [isLoggedIn, voiceprintStatus, router])

  return null
}