document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('form-doacao');
  const inputQuantidade = document.getElementById('quantidade');
  const btnMenos = document.getElementById('btn-menos');
  const btnMais = document.getElementById('btn-mais');
  const valorTotalEl = document.getElementById('valor-total');
  const gridNumeros = document.getElementById('grid-numeros');

  let valorUnitario = 10.00;

  async function carregarGradeNumeros() {
    if (!gridNumeros) return;
    gridNumeros.innerHTML = '';

    let numerosOcupados = [];
    try {
      const { data } = await supabaseClient.from('numeros_gerados').select('numero');
      if (data) {
        numerosOcupados = data.map(n => n.numero);
      }
    } catch (err) {
      console.error('Erro ao carregar números:', err);
    }

    for (let i = 1; i <= 100; i++) {
      const card = document.createElement('div');
      const isOcupado = numerosOcupados.includes(i);

      card.className = `p-2 text-center rounded-xl font-extrabold border text-sm transition ${
        isOcupado 
          ? 'bg-red-600/80 border-red-500 text-white shadow-inner cursor-not-allowed' 
          : 'bg-emerald-800 border-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
      }`;
      card.textContent = i.toString().padStart(2, '0');
      gridNumeros.appendChild(card);
    }
  }

  function atualizarCalculo() {
    let qtd = parseInt(inputQuantidade.value) || 1;
    if (qtd < 1) qtd = 1;
    if (qtd > 100) qtd = 100;
    inputQuantidade.value = qtd;
    
    const total = qtd * valorUnitario;
    valorTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  }

  btnMenos?.addEventListener('click', () => {
    inputQuantidade.value = Math.max(1, parseInt(inputQuantidade.value) - 1);
    atualizarCalculo();
  });

  btnMais?.addEventListener('click', () => {
    inputQuantidade.value = Math.min(100, parseInt(inputQuantidade.value) + 1);
    atualizarCalculo();
  });

  inputQuantidade?.addEventListener('input', atualizarCalculo);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const quantidade = parseInt(inputQuantidade.value);
    const valorTotal = quantidade * valorUnitario;
    const codigoReferencia = 'REF-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    try {
      const { data, error } = await supabaseClient
        .from('doacoes')
        .insert([{
          nome: nome,
          whatsapp: whatsapp,
          quantidade_numeros: quantidade,
          valor: valorTotal,
          codigo_referencia: codigoReferencia,
          status: 'pendente'
        }])
        .select()
        .single();

      if (error) throw error;
      window.location.href = `confirmacao.html?id=${data.id}`;
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar doação. Verifique a conexão e tente novamente.');
    }
  });

  carregarGradeNumeros();
});