document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('form-doacao');
  const inputQuantidade = document.getElementById('quantidade');
  const btnMenos = document.getElementById('btn-menos');
  const btnMais = document.getElementById('btn-mais');
  const valorTotalEl = document.getElementById('valor-total');
  
  let valorUnitario = 10.00;

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
});