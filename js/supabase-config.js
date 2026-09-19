const SUPABASE_URL = 'https://vjciwtsyffejghxlpygb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqY2l3dHN5ZmZlbGdodHhscHlnYiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg5MTYwNTU5LCJleHAiOjIxMDQ3MzY1NTl9.cCwYBTVbKq0So_lNz-t-rbSujsD2c2D-8qvgiORCG2o';

if (!window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const VALOR_POR_NUMERO = 10;   
const META_GERAL = 10000;      

const WHATSAPP_COORDENACAO = [
  '5511999999999', 
  '5511888888888'  
];

let CHAVE_PIX = 'sua-chave-pix-aqui@email.com';
let NOME_BENEFICIARIO = 'Ação Solidária 2026';

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
}

function formatarWhatsApp(numero) {
  const limpo = String(numero).replace(/\D/g, '');
  if (limpo.length === 11) {
    return `(${limpo.slice(0,2)}) ${limpo.slice(2,7)}-${limpo.slice(7)}`;
  }
  if (limpo.length === 13 && limpo.startsWith('55')) {
    return `+55 (${limpo.slice(2,4)}) ${limpo.slice(4,9)}-${limpo.slice(9)}`;
  }
  return numero;
}

function apenasDigitos(str) {
  return String(str).replace(/\D/g, '');
}

function mostrarToast(mensagem, tipo = 'info') {
  const antigo = document.getElementById('toast-global');
  if (antigo) antigo.remove();

  const cores = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-slate-700',
    warning: 'bg-amber-600'
  };

  const toast = document.createElement('div');
  toast.id = 'toast-global';
  toast.className = `fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl text-white shadow-2xl ${cores[tipo] || cores.info}`;
  toast.textContent = mensagem;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function setLoading(btn, loading = true) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<svg class="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
  }
}

async function carregarConfiguracoes() {
  try {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('chave, valor');

    if (error) throw error;

    if (data) {
      data.forEach(cfg => {
        if (cfg.chave === 'chave_pix') CHAVE_PIX = cfg.valor;
        if (cfg.chave === 'nome_beneficiario') NOME_BENEFICIARIO = cfg.valor;
        if (cfg.chave === 'valor_por_numero') window.VALOR_POR_NUMERO = Number(cfg.valor) || 10;
      });
    }
  } catch (err) {
    console.warn('Não foi possível carregar configurações:', err.message);
  }
}

function getSupabase() {
  return window.supabaseClient;
}

window.formatarMoeda = formatarMoeda;
window.formatarWhatsApp = formatarWhatsApp;
window.apenasDigitos = apenasDigitos;
window.mostrarToast = mostrarToast;
window.setLoading = setLoading;
window.carregarConfiguracoes = carregarConfiguracoes;
window.VALOR_POR_NUMERO = VALOR_POR_NUMERO;
window.META_GERAL = META_GERAL;
window.WHATSAPP_COORDENACAO = WHATSAPP_COORDENACAO;
window.CHAVE_PIX = CHAVE_PIX;
window.NOME_BENEFICIARIO = NOME_BENEFICIARIO;