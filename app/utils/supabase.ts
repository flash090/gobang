import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://svmkbnmsjmmyspgfjjmw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2bWtibm1zam1teXNwZ2Zqam13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjQ5NzIsImV4cCI6MjA2MjA0MDk3Mn0.T14gNcCSIRJTACX3wJlS6L07qXuqn2IMRSElLCXDPpk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase 