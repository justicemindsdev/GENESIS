import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvecnfdqakrevzaeifpk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZWNuZmRxYWtyZXZ6YWVpZnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODIwNjQsImV4cCI6MjA2Mzk1ODA2NH0.q-8ukkJZ4FGSbZyEYp0letP-S58hC2PA6lUOWUH9H2Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
