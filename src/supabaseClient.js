import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvkkznqufszbwizoicqr.supabase.co'
const supabaseKey = 'sb_publishable_ocwooWJ9rA9adGQ-ZFiDAA_FzvIsUJJ'

export const supabase = createClient(supabaseUrl, supabaseKey)