const SUPABASE_URL = 'https://vjciwtsyffejghxlpygb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqY2l3dHN5ZmZlbGdodHhscHlnYiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg5MTYwNTU5LCJleHAiOjIxMDQ3MzY1NTl9.cCwYBTVbKq0So_lNz-t-rbSujsD2c2D-8qvgiORCG2o';

window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log(' Supabase inicializado com sucesso');