import { createClient } from '@supabase/supabase-js';
import { Story } from '@/lib/types';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function fetchStories(): Promise<Story[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('display_order');
  if (error) throw error;
  return (data ?? []) as Story[];
}
