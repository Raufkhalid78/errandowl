import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      const cookieStore = await cookies()
      const signupRole = cookieStore.get('signup_role')?.value

      if (signupRole === 'tasker' || signupRole === 'client') {
        // Update user's role in profiles table since OAuth signup defaults to 'client'
        await supabase
          .from('profiles')
          .update({ role: signupRole })
          .eq('auth_id', data.user.id)
        
        // Delete the cookie
        cookieStore.delete('signup_role')
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`)
}
