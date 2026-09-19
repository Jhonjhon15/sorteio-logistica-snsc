document.addEventListener('DOMContentLoaded', async () => {

  const isAdminLoggedIn = sessionStorage.getItem('admin_logged_in');

  if (!isAdminLoggedIn && !window.location.pathname.includes('admin.html')) {

  }

  const path = window.location.pathname;

  if (path.includes('admin-numeros.html')) {
    await carregarModeracaoNumeros();
  } else if (path.includes('admin-instituicao.html')) {
    await carregarGestaoInstituicoes();
  } else if (path.includes('admin-cadastros.html')) {
    await carregarGestaoCadastros();
  } else if (path.includes('admin-pagamentos.html')) {
    await carregarPagamentosAdmin();
  }
});

async function carregarModeracaoNumeros() {
  const tabela = document.getElementById('tabela-moderacao-numeros');
  if (!tabela) return;

  try {
    const { data, error } = await supabaseClient
      .from('numeros_escolhidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      tabela.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-emerald-300/65">Nenhum bilhete cadastrado no momento.</td></tr>`;
      return;
    }

    tabela.innerHTML = data.map(item => `
      <tr class="border-b border-emerald-800/40 hover:bg-emerald-900/20 transition">
        <td class="p-3 font-bold text-emerald-300">${String(item.numero).padStart(3, '0')}</td>
        <td class="p-3">${item.nome_doador || 'Não informado'}</td>
        <td class="p-3 font-mono text-xs">${item.whatsapp || '-'}</td>
        <td class="p-3">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${item.status === 'aprovado' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
            ${item.status === 'aprovado' ? 'Aprovado' : 'Pendente'}
          </span>
        </td>
        <td class="p-3 text-right space-x-2">
          ${item.status !== 'aprovado' ? `
            <button onclick="aprovarNumero(${item.id})" class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition">
              Aprovar PIX
            </button>
          ` : `
            <span class="text-xs text-emerald-400/60 font-medium">Liberado</span>
          `}
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Erro ao carregar moderação de números:', err);
    tabela.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-400">Erro ao carregar dados do servidor.</td></tr>`;
  }
}

window.aprovarNumero = async function(id) {
  try {
    const { error } = await supabaseClient
      .from('numeros_escolhidos')
      .update({ status: 'aprovado' })
      .eq('id', id);

    if (error) throw error;
    
    alert('Número aprovado com sucesso! Ele agora está fixado na cartela pública.');
    carregarModeracaoNumeros();
  } catch (err) {
    console.error('Erro ao aprovar:', err);
    alert('Não foi possível aprovar o número.');
  }
};

async function carregarPagamentosAdmin() {
  const tabela = document.getElementById('tabela-pagamentos');
  if (!tabela) return;

  try {
    const { data, error } = await supabaseClient
      .from('doacoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      tabela.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-emerald-300/60">Nenhuma transação registrada até o momento.</td></tr>`;
      return;
    }

    let totalAprovado = 0;
    let totalPendentes = 0;
    let totalCartoes = 0;

    tabela.innerHTML = data.map(item => {
      if (item.status === 'aprovado') totalAprovado += Number(item.valor || 0);
      if (item.status === 'pendente') totalPendentes++;
      if (item.metodo === 'cartao') totalCartoes++;

      let detalhesPagamento = '';
      if (item.metodo === 'pix') {
        detalhesPagamento = `<span class="text-xs text-emerald-400/70 font-mono">Chave PIX / Comprovante</span>`;
      } else {
        const ultimosDigitos = item.cartao_ultimos_digitos || '••••';
        detalhesPagamento = `<span class="text-xs font-mono text-emerald-300">Cartão: •••• •••• •••• ${ultimosDigitos}</span><br><span class="text-[10px] text-emerald-400/50">${item.titular_cartao || 'Titular não informado'}</span>`;
      }

      return `
        <tr class="hover:bg-emerald-900/20 transition">
          <td class="p-4">
            <div class="font-bold text-emerald-200">${item.nome_doador || 'Anônimo'}</div>
            <div class="text-xs text-emerald-400/60 font-mono">${item.whatsapp || '-'}</div>
          </td>
          <td class="p-4">
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${item.metodo === 'pix' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}">
              ${item.metodo === 'pix' ? '⚡ PIX' : '💳 Cartão'}
            </span>
          </td>
          <td class="p-4">${detalhesPagamento}</td>
          <td class="p-4 font-bold text-emerald-300">R$ ${Number(item.valor || 0).toFixed(2)}</td>
          <td class="p-4">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold ${item.status === 'aprovado' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
              ${item.status === 'aprovado' ? 'Aprovado' : 'Pendente'}
            </span>
          </td>
          <td class="p-4 text-right space-x-2">
            ${item.status !== 'aprovado' ? `
              <button onclick="validarDoacaoAdmin(${item.id})" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow">
                ✓ Validar Doação
              </button>
            ` : `
              <span class="text-xs text-emerald-400/60 font-medium">Validado</span>
            `}
          </td>
        </tr>
      `;
    }).join('');

    const elTotal = document.getElementById('stat-total');
    const elPendentes = document.getElementById('stat-pendentes');
    const elCartoes = document.getElementById('stat-cartoes');

    if (elTotal) elTotal.innerText = `R$ ${totalAprovado.toFixed(2)}`;
    if (elPendentes) elPendentes.innerText = totalPendentes;
    if (elCartoes) elCartoes.innerText = totalCartoes;

  } catch (err) {
    console.error('Erro ao carregar pagamentos:', err);
    tabela.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-red-400">Erro ao carregar transações do servidor.</td></tr>`;
  }
}

window.validarDoacaoAdmin = async function(id) {
  if (!confirm('Deseja aprovar esta doação e liberar o bilhete?')) return;

  try {
    const { error } = await supabaseClient
      .from('doacoes')
      .update({ status: 'aprovado' })
      .eq('id', id);

    if (error) throw error;

    alert('Doação validada com sucesso!');
    carregarPagamentosAdmin();
  } catch (err) {
    console.error('Erro ao validar doação:', err);
    alert('Erro ao tentar aprovar a doação.');
  }
};

async function carregarGestaoInstituicoes() {
  console.log('Painel de instituições carregado.');
}

async function carregarGestaoCadastros() {
  console.log('Painel de cadastros carregado.');
}