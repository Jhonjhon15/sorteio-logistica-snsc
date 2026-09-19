document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('conteudo-confirmacao');
  if (!container) return;

  const doacaoId = sessionStorage.getItem('doacao_id');
  const nome = sessionStorage.getItem('doacao_nome') || '-';
  const whatsapp = sessionStorage.getItem('doacao_whatsapp') || '-';
  const numeros = JSON.parse(sessionStorage.getItem('doacao_numeros') || '[]');
  const valor = sessionStorage.getItem('doacao_valor_total') || sessionStorage.getItem('doacao_valor') || '0';

  if (!doacaoId) {
    container.innerHTML = `
      <div class="card-glass border border-red-500/30 rounded-2xl p-6 text-center shadow-xl">
        <h2 class="text-xl font-bold text-red-300 mb-2">Doação não encontrada</h2>
        <p class="text-emerald-200/70 text-sm mb-6">
          Não foi possível localizar os dados da sua doação.
          Volte e selecione os números novamente.
        </p>
        <a href="doar.html"
           class="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold rounded-xl transition shadow-lg">
          Ir para seleção de números →
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card-glass border border-emerald-800/50 rounded-2xl p-6 md:p-8 shadow-2xl text-center">
      <div class="mb-6">
        <div class="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3">
          <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-extrabold text-emerald-100">Doação Registrada!</h2>
        <p class="text-sm text-emerald-200/70 mt-1">
          Seus números foram reservados com sucesso. Siga para a etapa de pagamento ou envio de comprovante.
        </p>
      </div>

      <div class="text-left bg-forest-950/60 border border-emerald-900/60 rounded-xl p-5 text-sm space-y-2.5 mb-6">
        <p class="text-emerald-100"><strong class="text-emerald-300">Nome:</strong> ${nome}</p>
        <p class="text-emerald-100"><strong class="text-emerald-300">WhatsApp:</strong> ${formatarWhatsApp(whatsapp)}</p>
        <p class="text-emerald-100"><strong class="text-emerald-300">Números:</strong> ${numeros.join(', ') || 'Nenhum número selecionado (Apenas doação/extra)'}</p>
        <p class="text-emerald-100"><strong class="text-emerald-300">Valor Total:</strong> ${formatarMoeda(valor)}</p>
        <p class="text-xs text-emerald-400/50 pt-2 border-t border-emerald-900/40 font-mono">ID da Doação: ${doacaoId}</p>
      </div>

      <div class="space-y-3">
        <a href="pagamento.html?id=${doacaoId}" class="w-full inline-flex items-center justify-center px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold rounded-xl transition shadow-lg shadow-emerald-900/40">
          Ir para Pagamento / PIX →
        </a>
        <p class="text-xs text-emerald-300/60 pt-2">
          Após o envio do comprovante, a equipe confirmará o pagamento. Você poderá acompanhar o status na página de <a href="numeros.html" class="underline hover:text-emerald-300">consulta</a>.
        </p>
      </div>
    </div>
  `;
});