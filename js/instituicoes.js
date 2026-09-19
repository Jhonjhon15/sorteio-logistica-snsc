document.addEventListener('DOMContentLoaded', async () => {
 
  const params = new URLSearchParams(window.location.search);
  const idInstituicao = params.get('id');

  if (idInstituicao) {
    await carregarDetalheInstituicao(idInstituicao);
  } else {
    await carregarInstituicoes();
    setupFiltros();
  }
});

let todasInstituicoes = [];

async function carregarInstituicoes() {
  const client = window.supabaseClient || supabase;
  const container = document.getElementById('lista-instituicoes');
  if (!container || !client) return;

  const { data, error } = await client
    .from('instituicoes')
    .select('*')
    .eq('ativo', true)
    .order('nome');

  if (error) {
    console.error(error);
    container.innerHTML = '<p class="text-red-400 col-span-full text-center">Erro ao carregar instituições.</p>';
    return;
  }

  todasInstituicoes = data || [];
  renderizarInstituicoes(todasInstituicoes);
}

function renderizarInstituicoes(lista) {
  const container = document.getElementById('lista-instituicoes');
  if (!container) return;

  if (!lista.length) {
    container.innerHTML = '<p class="text-emerald-300/60 col-span-full text-center py-8">Nenhuma instituição encontrada.</p>';
    return;
  }

  container.innerHTML = lista.map((inst) => `
    <a href="instituicoes.html?id=${inst.id}" class="card-glass border border-emerald-800/40 rounded-2xl overflow-hidden hover:border-emerald-500/60 hover:shadow-xl transition block group">
      <div class="h-44 bg-forest-900/60 flex items-center justify-center overflow-hidden">
        ${inst.foto_url 
          ? `<img src="${inst.foto_url}" alt="${inst.nome}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">` 
          : `<span class="text-emerald-300/70 font-medium">Sem foto</span>`}
      </div>
      <div class="p-5">
        <h3 class="font-bold text-lg mb-1.5 text-emerald-100 group-hover:text-emerald-300 transition">${inst.nome}</h3>
        <p class="text-sm text-emerald-200/70 mb-4 line-clamp-2">${inst.descricao || ''}</p>
        <span class="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-medium">${inst.categoria || 'Geral'}</span>
      </div>
    </a>
  `).join('');
}

async function carregarDetalheInstituicao(id) {
  const client = window.supabaseClient || supabase;
  const viewLista = document.getElementById('view-lista');
  const viewDetalhe = document.getElementById('view-detalhe');
  const conteudo = document.getElementById('conteudo-instituicao');

  if (viewLista) viewLista.classList.add('hidden');
  if (viewDetalhe) viewDetalhe.classList.remove('hidden');

  if (!client || !conteudo) return;

  const { data: inst, error } = await client
    .from('instituicoes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !inst) {
    conteudo.innerHTML = '<p class="text-red-400 text-center py-8">Instituição não encontrada ou desativada.</p>';
    return;
  }

  conteudo.innerHTML = `
    <div class="grid md:grid-cols-3 gap-8 items-start">
      <div class="h-64 md:h-80 bg-forest-900/60 rounded-2xl overflow-hidden border border-emerald-800/50 flex items-center justify-center">
        ${inst.foto_url 
          ? `<img src="${inst.foto_url}" alt="${inst.nome}" class="w-full h-full object-cover">` 
          : `<span class="text-emerald-300/70 font-medium">Sem foto disponível</span>`}
      </div>
      <div class="md:col-span-2 space-y-4">
        <span class="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg font-medium inline-block">${inst.categoria || 'Geral'}</span>
        <h1 class="text-2xl md:text-3xl font-extrabold text-emerald-100">${inst.nome}</h1>
        <p class="text-emerald-200/80 leading-relaxed">${inst.descricao || 'Sem descrição cadastrada.'}</p>
        
        ${inst.pix ? `<div class="p-4 rounded-xl card-glass border border-emerald-800/40"><p class="text-sm text-emerald-300 font-semibold mb-1">Chave PIX para doação direta:</p><p class="text-emerald-100 font-mono text-sm bg-forest-950/60 p-2 rounded-lg select-all">${inst.pix}</p></div>` : ''}
        
        <div class="pt-4">
          <a href="doar.html" class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold transition">
            Fazer uma Doação →
          </a>
        </div>
      </div>
    </div>
  `;

  const btnVoltar = document.getElementById('btn-voltar-lista');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'instituicoes.html';
    });
  }
}

function setupFiltros() {
  document.querySelectorAll('.filtro-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro-btn').forEach((b) => {
        b.classList.remove('bg-emerald-500', 'text-forest-950', 'font-semibold', 'shadow');
        b.classList.add('card-glass', 'border', 'border-emerald-800/60', 'text-emerald-200', 'hover:border-emerald-500');
      });
      btn.classList.add('bg-emerald-500', 'text-forest-950', 'font-semibold', 'shadow');
      btn.classList.remove('card-glass', 'border', 'border-emerald-800/60', 'text-emerald-200', 'hover:border-emerald-500');

      const filtro = btn.dataset.filtro;
      if (filtro === 'Todas') {
        renderizarInstituicoes(todasInstituicoes);
      } else {
        const filtradas = todasInstituicoes.filter((i) => i.categoria === filtro);
        renderizarInstituicoes(filtradas);
      }
    });
  });
}