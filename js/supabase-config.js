const SUPABASE_URL = 'https://vjciwtsyffejghxlpygb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqY2l3dHN5ZmZlamdoeGxweWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNjA1NTksImV4cCI6MjEwNDczNjU1OX0.cCwYBTVbKq0So_lNz-t-rbSujsD2c2D-8qvgiORCG2o';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('ERRO: URL ou Chave do Supabase não configuradas!');
} else {
  console.log('Credenciais do Supabase carregadas com sucesso.');
}

window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);