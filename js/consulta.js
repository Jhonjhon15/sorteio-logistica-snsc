const client = window.supabaseClient;

document.addEventListener('DOMContentLoaded', () => {
  const formConsulta = document.getElementById('form-consulta');
  if (formConsulta) {
    formConsulta.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputTermo = document.getElementById('termo-busca');
      const termo = inputTermo ? apenasDigitos(inputTermo.value) : '';
      
      if (termo.length < 10) {
        alert('Informe um número de WhatsApp válido (com DDD).');
        return;
      }
      await buscarPorWhatsApp(termo);
    });
  }
});

async function buscarPorWhatsApp(whatsapp) {
  const container = document.getElementById('resultado-consulta');
  if (!container || !client) return;
  
  container.innerHTML = '<p class="text-emerald-300/70 text-center py-6">Buscando doações...</p>';

  const { data, error } = await client
    .from('doacoes')
    .select('id, nome, whatsapp, numeros, valor_total, status, created_at, itens')
    .eq('whatsapp', whatsapp)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    container.innerHTML = '<p class="text-red-400 text-center py-6">Erro ao realizar a consulta. Tente novamente.</p>';
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-emerald-300/60 text-center py-6">Nenhuma doação encontrada para este WhatsApp.</p>';
    return;
  }

  let html = '';
  data.forEach((d) => {
    const statusClass =
      d.status === 'confirmado' ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30' :
      d.status === 'pendente' ? 'text-amber-300 bg-amber-500/20 border border-amber-500/30' :
      'text-red-300 bg-red-500/20 border border-red-500/30';

    const dataFormatada = d.created_at ? new Date(d.created_at).toLocaleString('pt-BR') : '';

    html += `
      <div class="card-glass border border-emerald-800/50 rounded-2xl p-5 mb-4 shadow-lg">
        <div class="flex justify-between items-start mb-3 gap-2">
          <div>
            <p class="font-bold text-lg text-emerald-100">${d.nome}</p>
            <p class="text-xs text-emerald-400/60">${dataFormatada}</p>
          </div>
          <span class="px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wide ${statusClass}">
            ${d.status}
          </span>
        </div>
        <div class="space-y-1.5 text-sm text-emerald-200/90 pt-2 border-t border-emerald-900/40">
          <p><strong class="text-emerald-300">Números:</strong> ${d.numeros && d.numeros.length ? d.numeros.join(', ') : 'Nenhum'}</p>
          <p><strong class="text-emerald-300">Valor total:</strong> ${formatarMoeda(d.valor_total)}</p>
          ${d.itens ? `<p class="mt-1"><strong class="text-amber-300">Itens declarados:</strong> ${d.itens}</p>` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}