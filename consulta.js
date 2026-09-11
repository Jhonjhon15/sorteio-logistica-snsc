const formConsulta = document.getElementById('form-consulta');
const resultadoDiv = document.getElementById('resultado');

formConsulta.addEventListener('submit', async (e) => {
  e.preventDefault();

  const whatsapp = document.getElementById('whatsapp-consulta').value.trim();

  if (!whatsapp) {
    alert('Digite o WhatsApp');
    return;
  }

  const { data: doacoes, error } = await supabaseClient
    .from('doacoes')
    .select('*, numeros(*)')
    .eq('whatsapp', whatsapp)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    alert('Erro ao consultar. Tente novamente.');
    return;
  }

  if (!doacoes || doacoes.length === 0) {
    resultadoDiv.innerHTML = `
      <div class="bg-white rounded-xl shadow p-6 text-center">
        <p class="text-red-600 font-medium">Nenhuma doação encontrada com este WhatsApp.</p>
        <p class="text-sm text-gray-500 mt-2">Verifique se digitou o mesmo número usado na doação.</p>
        <a href="index.html" class="inline-block mt-4 text-blue-600 hover:underline text-sm">Fazer uma doação</a>
      </div>
    `;
    resultadoDiv.classList.remove('hidden');
    return;
  }

  let html = '';

  doacoes.forEach(doacao => {
    const statusCor = doacao.status === 'confirmado' 
      ? 'bg-green-100 text-green-800' 
      : doacao.status === 'pendente' 
        ? 'bg-yellow-100 text-yellow-800' 
        : 'bg-red-100 text-red-800';

    const statusTexto = doacao.status === 'confirmado' 
      ? 'Confirmado' 
      : doacao.status === 'pendente' 
        ? 'Aguardando confirmação' 
        : 'Rejeitado';

    const numeros = doacao.numeros && doacao.numeros.length > 0
      ? doacao.numeros.map(n => n.numero).sort((a,b) => a - b).join(', ')
      : 'Números serão gerados após a confirmação do pagamento';

    html += `
      <div class="bg-white rounded-xl shadow p-6 mb-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <p class="font-bold">${doacao.nome}</p>
            <p class="text-sm text-gray-500">${doacao.whatsapp}</p>
          </div>
          <span class="text-xs font-medium px-3 py-1 rounded-full ${statusCor}">
            ${statusTexto}
          </span>
        </div>

        <div class="text-sm space-y-1 mb-4">
          <p><span class="text-gray-500">Valor:</span> <strong>R$ ${parseFloat(doacao.valor).toFixed(2).replace('.', ',')}</strong></p>
          <p><span class="text-gray-500">Quantidade:</span> ${doacao.quantidade_numeros} número(s)</p>
          <p><span class="text-gray-500">Código:</span> ${doacao.codigo_referencia}</p>
          <p><span class="text-gray-500">Data:</span> ${new Date(doacao.created_at).toLocaleString('pt-BR')}</p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-500 mb-1">Seus números:</p>
          <p class="font-mono font-bold text-blue-700 text-lg">${numeros}</p>
        </div>
      </div>
    `;
  });

  resultadoDiv.innerHTML = html;
  resultadoDiv.classList.remove('hidden');
});