let valorPorNumero = 10;

const inputQuantidade = document.getElementById('quantidade');
const spanValorUnitario = document.getElementById('valor-unitario');
const spanValorTotal = document.getElementById('valor-total');
const btnMais = document.getElementById('btn-mais');
const btnMenos = document.getElementById('btn-menos');
const formDoacao = document.getElementById('form-doacao');

function atualizarTotal() {
  const qtd = parseInt(inputQuantidade.value) || 1;
  const total = qtd * valorPorNumero;
  spanValorTotal.textContent = total.toFixed(2).replace('.', ',');
}

btnMais.addEventListener('click', () => {
  inputQuantidade.value = parseInt(inputQuantidade.value) + 1;
  atualizarTotal();
});

btnMenos.addEventListener('click', () => {
  const atual = parseInt(inputQuantidade.value);
  if (atual > 1) {
    inputQuantidade.value = atual - 1;
    atualizarTotal();
  }
});

inputQuantidade.addEventListener('input', atualizarTotal);

async function carregarConfiguracoes() {
  const { data, error } = await supabaseClient
    .from('configuracoes')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Erro ao carregar configurações:', error);
    return;
  }

  if (data) {
    valorPorNumero = parseFloat(data.valor_por_numero);
    spanValorUnitario.textContent = valorPorNumero.toFixed(2).replace('.', ',');
    document.getElementById('total-arrecadado').textContent = 
      'R$ ' + parseFloat(data.total_arrecadado || 0).toFixed(2).replace('.', ',');
    document.getElementById('total-numeros').textContent = data.total_numeros || 0;
    document.getElementById('status-sorteio').textContent = 
      data.status === 'ativo' ? 'Ativo' : data.status;
    atualizarTotal();
  }
}

formDoacao.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const whatsapp = document.getElementById('whatsapp').value.trim();
  const quantidade = parseInt(inputQuantidade.value);
  const valor = quantidade * valorPorNumero;

  if (!nome || !whatsapp) {
    alert('Preencha nome e WhatsApp');
    return;
  }

  const codigo = 'SNSC-' + Date.now().toString().slice(-6);

  const { data, error } = await supabaseClient
    .from('doacoes')
    .insert([{
      nome,
      whatsapp,
      valor,
      quantidade_numeros: quantidade,
      status: 'pendente',
      codigo_referencia: codigo
    }])
    .select()
    .single();

  if (error) {
    console.error(error);
    alert('Erro ao registrar doação. Tente novamente.');
    return;
  }

  alert(`Doação registrada!\n\nSeu código de referência: ${codigo}\nValor: R$ ${valor.toFixed(2)}\n\nEm breve você será direcionado para o pagamento.`);

  console.log('Doação criada:', data);
});

carregarConfiguracoes();