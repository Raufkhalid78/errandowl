import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials are missing on the server. Check your .env.local file.')
  }

  const client = createServerClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  // Wrap client.auth.getUser to support admin impersonation
  const originalGetUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = async (token?: string) => {
    const res = await originalGetUser(token);
    if (res.data?.user) {
      const impersonateId = cookieStore.get('sb-impersonate-id')?.value;
      if (impersonateId) {
        // Security check: verify if the actual logged-in user is an admin
        const { data: adminCheck } = await client
          .from("admins")
          .select("id")
          .eq("email", res.data.user.email)
          .maybeSingle();

        if (adminCheck) {
          // Fetch target profile
          const { data: targetProfile } = await client
            .from("profiles")
            .select("*")
            .eq("auth_id", impersonateId)
            .maybeSingle();

          if (targetProfile) {
            return {
              data: {
                user: {
                  ...res.data.user,
                  id: targetProfile.auth_id,
                  email: targetProfile.email,
                  user_metadata: {
                    ...res.data.user.user_metadata,
                    full_name: targetProfile.name,
                    role: targetProfile.role || 'client'
                  }
                }
              },
              error: null
            };
          }
        }
      }
    }
    return res;
  };

  return client;
}
