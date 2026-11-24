import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Loader } from '../../components/system/Loader'

/**
 * Web landing target for email-confirmation links (`?code=...`).
 * On the browser, `detectSessionInUrl` exchanges the code automatically —
 * this page simply waits for the session, then hands off to the guards.
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        navigate('/', { replace: true })
      }
    })
    void supabase.auth.getSession().then(({ data: s }) => {
      if (s.session) navigate('/', { replace: true })
    })
    // If verification failed or the link was already used, fall back to login.
    const fallback = setTimeout(() => navigate('/login', { replace: true }), 8000)
    return () => {
      data.subscription.unsubscribe()
      clearTimeout(fallback)
    }
  }, [navigate])

  return <Loader />
}
