import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qtycwpaqmucdutxmrdgt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0eWN3cGFxbXVjZHV0eG1yZGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTU3MDUsImV4cCI6MjA5MjYzMTcwNX0.0L48lcEVPKv2ze8SQvyug4Hb7qdcccjXZT3H39YD0jg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('public_profiles').select('*').limit(1)
  console.log("public_profiles:", data, error)
  const { data: d2, error: e2 } = await supabase.from('profiles').select('*').limit(1)
  console.log("profiles:", d2, e2)
}
test()
