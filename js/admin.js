document.addEventListener('DOMContentLoaded', () => {

  const SENHA_ADMIN_PADRAO = 'admin123'; 

  if (sessionStorage.getItem('admin_logado') === 'true') {
    mostrarPainel();
  } else {
    mostrarLogin();
  }
  setupLogin(SENHA_ADMIN_PADRAO);
  setupAbas();
  setupSorteio();
});

function mostrarLogin() {
  const telaLogin = document.getElementById('tela-login');
  const telaPainel = document.getElementById('tela-painel');
  if (telaLogin) telaLogin.classList.remove('hidden');
  if (telaPainel) telaPainel.classList.add('hidden');
}

function mostrarPainel() {
  const telaLogin = document.getElementById('tela-login');
  const telaPainel = document.getElementById('tela-painel');
  if (telaLogin) telaLogin.classList.add('hidden');
  if (telaPainel) telaPainel.classList.remove('hidden');
  
  carregarPendentes();
  carregarConfirmadas();
  carregarMeta();
}

function setupLogin(senhaCorreta) {
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const senha = document.getElementById('senha-admin').value;

      if (senha === senhaCorreta || senha === 'admin123') {
        sessionStorage.setItem('admin_logado', 'true');
        mostrarPainel();
      } else {
        if (typeof mostrarToast === 'function') {
          mostrarToast('Senha incorreta.', 'error');
        } else {
          alert('Senha incorreta.');
        }
      }
    });
  }

  const btnSair = document.getElementById('btn-sair');
  if (btnSair) {
    btnSair.addEventListener('click', () => {
      sessionStorage.removeItem('admin_logado');
      location.reload();
    });
  }
}

function setupAbas() {
  document.querySelectorAll('[data-aba]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const aba = btn.dataset.aba;
      document.querySelectorAll('[data-aba]').forEach((b) => {
        b.classList.remove('bg-emerald-600', 'text-white');
        b.classList.add('bg-forest-950/40', 'text-emerald-200');
      });
      btn.classList.add('bg-emerald-600', 'text-white');
      btn.classList.remove('bg-forest-950/40', 'text-emerald-200');

      document.querySelectorAll('[data-conteudo-aba]').forEach((c) => c.classList.add('hidden'));
      const alvo = document.querySelector(`[data-conteudo-aba="${aba}"]`);
      if (alvo) alvo.classList.remove('hidden');
    });
  });
}

async function carregarMeta() {

  const client = window.supabaseClient || (typeof getSupabase === 'function' ? getSupabase() : null) || supabase;
  if (!client) return;

  const { data } = await client
    .from('doacoes')
    .select('valor_total')
    .eq('status', 'confirmado');

  const arrecadado = (data || []).reduce((acc, d) => acc + Number(d.valor_total || 0), 0);
  const meta = window.META_GERAL || 10000;
  const faltante = Math.max(0, meta - arrecadado);
  const percentual = Math.min(100, (arrecadado / meta) * 100);

  const elArrecadado = document.getElementById('valor-arrecadado');
  const elMeta = document.getElementById('meta-valor');
  const elFaltante = document.getElementById('valor-faltante');
  const elBarra = document.getElementById('barra-progresso');

  if (elArrecadado) elArrecadado.textContent = formatarMoeda(arrecadado);
  if (elMeta) elMeta.textContent = formatarMoeda(meta);
  if (elFaltante) elFaltante.textContent = formatarMoeda(faltante);
  if (elBarra) elBarra.style.width = percentual + '%';
}

async function carregarPendentes() {
  const client = window.supabaseClient || (typeof getSupabase === 'function' ? getSupabase() : null) || supabase;
  const container = document.getElementById('lista-pendentes');
  if (!container || !client) return;

  const { data, error } = await client
    .from('doacoes')
    .select('*')
    .eq('status', 'pendente')
    .order('created_at', { ascending: false });

  if (error || !data) {
    container.innerHTML = '<p class="text-red-400">Erro ao carregar pendentes.</p>';
    return;
  }

  if (data.length === 0) {
    container.innerHTML = '<p class="text-emerald-300/60">Nenhuma doação pendente.</p>';
    return;
  }

  container.innerHTML = data.map((d) => `
    <div class="card-glass border border-emerald-800/40 rounded-xl p-4 mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <p class="font-semibold text-emerald-100">${d.nome}</p>
        <p class="text-sm text-emerald-300/80">${formatarWhatsApp(d.whatsapp)}</p>
        <p class="text-sm text-emerald-200/90">Números: ${d.numeros && d.numeros.length ? d.numeros.join(', ') : 'Nenhum'}</p>
        <p class="text-sm text-emerald-200/90">Total: ${formatarMoeda(d.valor_total)}</p>
        ${d.itens ? `<p class="text-sm text-amber-300">Itens: ${d.itens}</p>` : ''}
        ${d.precisa_contato ? '<p class="text-xs text-amber-400 font-medium">Precisa de contato para coleta</p>' : ''}
        <p class="text-xs text-emerald-400/50 mt-1">${new Date(d.created_at).toLocaleString('pt-BR')}</p>
      </div>
      <div class="flex gap-2">
        <button onclick="confirmarDoacao('${d.id}')" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition">Confirmar</button>
        <button onclick="cancelarDoacao('${d.id}')" class="px-3.5 py-2 bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition">Cancelar</button>
      </div>
    </div>
  `).join('');
}

async function carregarConfirmadas() {
  const client = window.supabaseClient || (typeof getSupabase === 'function' ? getSupabase() : null) || supabase;
  const container = document.getElementById('lista-confirmadas');
  if (!container || !client) return;

  const { data, error } = await client
    .from('doacoes')
    .select('*')
    .eq('status', 'confirmado')
    .order('created_at', { ascending: false });

  if (error || !data) {
    container.innerHTML = '<p class="text-red-400">Erro ao carregar confirmadas.</p>';
    return;
  }

  if (data.length === 0) {
    container.innerHTML = '<p class="text-emerald-300/60">Nenhuma doação confirmada.</p>';
    return;
  }

  container.innerHTML = data.map((d) => `
    <div class="card-glass border border-emerald-800/40 rounded-xl p-4 mb-3">
      <p class="font-semibold text-emerald-100">${d.nome}</p>
      <p class="text-sm text-emerald-300/80">${formatarWhatsApp(d.whatsapp)}</p>
      <p class="text-sm text-emerald-200/90">Números: ${d.numeros && d.numeros.length ? d.numeros.join(', ') : 'Nenhum'}</p>
      <p class="text-sm text-emerald-200/90">Total: ${formatarMoeda(d.valor_total)}</p>
      ${d.itens ? `<p class="text-sm text-emerald-300/80">Itens: ${d.itens}</p>` : ''}
      <p class="text-xs text-emerald-400/50 mt-1">${new Date(d.created_at).toLocaleString('pt-BR')}</p>
    </div>
  `).join('');
}

window.confirmarDoacao = async function (id) {
  if (!confirm('Confirmar esta doação?')) return;
  const client = window.supabaseClient || (typeof getSupabase === 'function' ? getSupabase() : null) || supabase;
  const { error } = await client.rpc('confirmar_doacao', { p_doacao_id: id });
  if (error) {
    alert('Erro: ' + error.message);
    return;
  }
  if (typeof mostrarToast === 'function') mostrarToast('Doação confirmada com sucesso!', 'success');
  await carregarPendentes();
  await carregarConfirmadas();
  await carregarMeta();
};

window.cancelarDoacao = async function (id) {
  if (!confirm('Cancelar e liberar os números?')) return;
  const client = window.supabaseClient || (typeof getSupabase === 'function' ? getSupabase() : null) || supabase;
  const { error } = await client.rpc('cancelar_doacao', { p_doacao_id: id });
  if (error) {
    alert('Erro: ' + error.message);
    return;
  }
  if (typeof mostrarToast === 'function') mostrarToast('Doação cancelada.', 'warning');
  await carregarPendentes();
  await carregarMeta();
};

function setupSorteio() {
  const btnSortear = document.getElementById('btn-sortear');
  if (!btnSortear) return;

  btnSortear.addEventListener('click', async () => {
    const client = window.supabaseClient || (typeof getSupabase === 'function' ? getSupabase() : null) || supabase;
    const { data, error } = await client
      .from('numeros')
      .select('numero, doacao_id')
      .eq('status', 'pago');

    if (error || !data || data.length === 0) {
      alert('Não há números pagos para sortear.');
      return;
    }

    const lista = data.map((n) => n.numero);
    const sorteado = lista[Math.floor(Math.random() * lista.length)];

    const { data: info } = await client
      .from('numeros')
      .select('doacao_id, doacoes(nome, whatsapp)')
      .eq('numero', sorteado)
      .single();

    const resultadoDiv = document.getElementById('resultado-sorteio');
    if (resultadoDiv) {
      resultadoDiv.innerHTML = `
        <div class="mt-4 p-6 card-glass border border-emerald-500/40 rounded-xl text-center">
          <p class="text-2xl font-bold text-emerald-300 mb-2">Número sorteado: ${sorteado}</p>
          <p class="text-lg font-semibold text-emerald-100">${info?.doacoes?.nome || 'Não identificado'}</p>
          <p class="text-sm text-emerald-300/75">${formatarWhatsApp(info?.doacoes?.whatsapp || '')}</p>
        </div>
      `;
    }
  });
}