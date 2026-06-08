import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials are missing. Check your .env.local file.')
    // Return a dummy client or handle it in components
  }

  const client = createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  )

  // Wrap client.auth.getUser to support admin impersonation
  const originalGetUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = async (token?: string) => {
    const res = await originalGetUser(token);
    if (res.data?.user) {
      // Read cookie in browser
      const cookies = document.cookie.split(';').reduce((acc, c) => {
        const [name, val] = c.trim().split('=');
        acc[name] = val;
        return acc;
      }, {} as { [key: string]: string });

      const impersonateId = cookies['sb-impersonate-id'];
      if (impersonateId) {
        const { data: adminCheck } = await client
          .from("admins")
          .select("id")
          .eq("email", res.data.user.email)
          .maybeSingle();

        if (adminCheck) {
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
