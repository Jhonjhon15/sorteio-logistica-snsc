function mostrarAba(aba) {
  document.getElementById('aba-pendentes').classList.add('hidden');
  document.getElementById('aba-confirmados').classList.add('hidden');
  document.getElementById('aba-sorteio').classList.add('hidden');

  document.getElementById('tab-pendentes').className = 'px-4 py-2 rounded-lg font-medium bg-gray-200';
  document.getElementById('tab-confirmados').className = 'px-4 py-2 rounded-lg font-medium bg-gray-200';
  document.getElementById('tab-sorteio').className = 'px-4 py-2 rounded-lg font-medium bg-gray-200';

  document.getElementById(`aba-${aba}`).classList.remove('hidden');
  document.getElementById(`tab-${aba}`).className = 'px-4 py-2 rounded-lg font-medium bg-yellow-500 text-white';
}

async function carregarPendentes() {
  const { data, error } = await supabaseClient
    .from('doacoes')
    .select('*')
    .eq('status', 'pendente')
    .order('created_at', { ascending: false });

  const container = document.getElementById('lista-pendentes');

  if (error || !data || data.length === 0) {
    container.innerHTML = '<p class="text-gray-500">Nenhuma doação pendente.</p>';
    return;
  }

  container.innerHTML = data.map(d => `
    <div class="bg-white rounded-xl shadow p-5">
      <div class="flex justify-between items-start">
        <div>
          <p class="font-bold">${d.nome}</p>
          <p class="text-sm text-gray-500">${d.whatsapp}</p>
          <p class="text-sm mt-1">Valor: <strong>R$ ${parseFloat(d.valor).toFixed(2)}</strong> • ${d.quantidade_numeros} número(s)</p>
          <p class="text-sm text-gray-500">Código: ${d.codigo_referencia}</p>
          <p class="text-xs text-gray-400">${new Date(d.created_at).toLocaleString('pt-BR')}</p>
        </div>
        <div class="flex gap-2">
          <button onclick="confirmarDoacao('${d.id}', ${d.quantidade_numeros})" class="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg">
            Confirmar
          </button>
          <button onclick="rejeitarDoacao('${d.id}')" class="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg">
            Rejeitar
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

async function confirmarDoacao(id, quantidade) {
  if (!confirm('Confirmar esta doação e gerar os números?')) return;

  const { data: ultimo } = await supabaseClient
    .from('numeros')
    .select('numero')
    .order('numero', { ascending: false })
    .limit(1)
    .single();

  let proximoNumero = ultimo ? ultimo.numero + 1 : 1;

  const numerosParaInserir = [];
  for (let i = 0; i < quantidade; i++) {
    numerosParaInserir.push({
      numero: proximoNumero + i,
      doacao_id: id,
      status: 'ativo'
    });
  }

  const { error: erroNumeros } = await supabaseClient
    .from('numeros')
    .insert(numerosParaInserir);

  if (erroNumeros) {
    console.error(erroNumeros);
    alert('Erro ao gerar números');
    return;
  }

  const { error } = await supabaseClient
    .from('doacoes')
    .update({ 
      status: 'confirmado',
      confirmed_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    alert('Erro ao confirmar doação');
    return;
  }

  await atualizarTotais();

  alert('Doação confirmada e números gerados!');
  carregarPendentes();
  carregarConfirmados();
}

async function rejeitarDoacao(id) {
  if (!confirm('Rejeitar esta doação?')) return;

  const { error } = await supabaseClient
    .from('doacoes')
    .update({ status: 'rejeitado' })
    .eq('id', id);

  if (error) {
    alert('Erro ao rejeitar');
    return;
  }

  alert('Doação rejeitada');
  carregarPendentes();
}

async function carregarConfirmados() {
  const { data, error } = await supabaseClient
    .from('doacoes')
    .select('*, numeros(*)')
    .eq('status', 'confirmado')
    .order('confirmed_at', { ascending: false });

  const container = document.getElementById('lista-confirmados');

  if (error || !data || data.length === 0) {
    container.innerHTML = '<p class="text-gray-500">Nenhuma doação confirmada ainda.</p>';
    return;
  }

  container.innerHTML = data.map(d => {
    const nums = d.numeros ? d.numeros.map(n => n.numero).sort((a,b)=>a-b).join(', ') : '-';
    return `
      <div class="bg-white rounded-xl shadow p-5">
        <p class="font-bold">${d.nome} <span class="text-sm font-normal text-gray-500">(${d.whatsapp})</span></p>
        <p class="text-sm">R$ ${parseFloat(d.valor).toFixed(2)} • ${d.quantidade_numeros} número(s)</p>
        <p class="text-sm text-blue-700 font-mono mt-1">Números: ${nums}</p>
      </div>
    `;
  }).join('');
}

async function atualizarTotais() {
  const { data: confirmadas } = await supabaseClient
    .from('doacoes')
    .select('valor, quantidade_numeros')
    .eq('status', 'confirmado');

  if (!confirmadas) return;

  const totalArrecadado = confirmadas.reduce((acc, d) => acc + parseFloat(d.valor), 0);
  const totalNumeros = confirmadas.reduce((acc, d) => acc + d.quantidade_numeros, 0);

  await supabaseClient
    .from('configuracoes')
    .update({ 
      total_arrecadado: totalArrecadado,
      total_numeros: totalNumeros
    })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // atualiza o registro existente
}

document.getElementById('btn-sortear').addEventListener('click', async () => {
  if (!confirm('Deseja realmente realizar o sorteio agora?')) return;

  const { data: numeros, error } = await supabaseClient
    .from('numeros')
    .select('*, doacoes(nome, whatsapp)')
    .eq('status', 'ativo');

  if (error || !numeros || numeros.length === 0) {
    alert('Não há números confirmados para sortear.');
    return;
  }

  const sorteado = numeros[Math.floor(Math.random() * numeros.length)];

  await supabaseClient
    .from('resultado_sorteio')
    .insert([{
      numero_sorteado: sorteado.numero,
      doacao_id: sorteado.doacao_id,
      nome_ganhador: sorteado.doacoes.nome,
      whatsapp_ganhador: sorteado.doacoes.whatsapp
    }]);

  await supabaseClient
    .from('numeros')
    .update({ status: 'sorteado' })
    .eq('id', sorteado.id);

  const div = document.getElementById('resultado-sorteio');
  div.innerHTML = `
    <div class="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
      <p class="text-lg font-bold text-green-800">Resultado do Sorteio</p>
      <p class="text-3xl font-bold text-green-700 mt-2">Número ${sorteado.numero}</p>
      <p class="mt-2">Ganhador: <strong>${sorteado.doacoes.nome}</strong></p>
      <p class="text-sm text-gray-600">${sorteado.doacoes.whatsapp}</p>
    </div>
  `;
  div.classList.remove('hidden');
});

carregarPendentes();
carregarConfirmados();