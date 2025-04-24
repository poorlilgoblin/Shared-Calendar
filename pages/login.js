// pages/login.js
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // When the user hits /login?access_token=...&refresh_token=..., this grabs & stores the session
    async function handleMagicLink() {
      try {
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
        if (error) throw error

        if (data.session) {
          // Successfully stored session—redirect home
          router.replace('/')
        } else {
          setErrorMsg('No session found in URL.')
        }
      } catch (err) {
        console.error('Error handling magic link:', err)
        setErrorMsg(err.message)
      }
    }

    // Wait for router to be ready (so query is populated)
    if (router.asPath.includes('access_token=')) {
      handleMagicLink()
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      {errorMsg ? (
        <p className="text-red-600">Error signing in: {errorMsg}</p>
      ) : (
        <p>Signing you in…</p>
      )}
    </div>
  )
}
