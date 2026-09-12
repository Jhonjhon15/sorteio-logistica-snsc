document.addEventListener('DOMContentLoaded', async () => {
  const formCadastro = document.getElementById('form-cadastro-inicial');
  const gridNumeros = document.getElementById('grid-numeros');
  const qtdSelecionadosEl = document.getElementById('qtd-selecionados');
  const valorTotalEl = document.getElementById('valor-total-selecao');
  const btnGerarPix = document.getElementById('btn-gerar-pix');

  const valorUnitario = 10.00;
  let numerosSelecionados = [];

  formCadastro?.addEventListener('submit', (e) => {
    e.preventDefault();
    const participante = {
      nome: document.getElementById('nome').value.trim(),
      whatsapp: document.getElementById('whatsapp').value.trim(),
      endereco: document.getElementById('endereco').value.trim(),
      cidade: document.getElementById('cidade').value.trim()
    };

    sessionStorage.setItem('participante_dados', JSON.stringify(participante));
    window.location.href = 'numeros.html';
  });

  if (gridNumeros) {
    const dadosSalvos = sessionStorage.getItem('participante_dados');
    if (!dadosSalvos) {
      alert('Por favor, preencha seus dados de participante primeiro.');
      window.location.href = 'index.html';
      return;
    }

    let numerosOcupados = [];
    try {
      const { data } = await supabaseClient
        .from('doacoes')
        .select('quantidade_numeros')
        .eq('status', 'pago');
      
      numerosOcupados = [];
    } catch (err) {
      console.warn('Erro ao consultar ocupados:', err);
    }

    function atualizarTotais() {
      const qtd = numerosSelecionados.length;
      const total = qtd * valorUnitario;
      if (qtdSelecionadosEl) qtdSelecionadosEl.textContent = qtd;
      if (valorTotalEl) valorTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
      
      if (btnGerarPix) {
        btnGerarPix.disabled = qtd === 0;
      }
    }

    for (let i = 1; i <= 100; i++) {
      const card = document.createElement('button');
      card.type = 'button';
      const isOcupado = numerosOcupados.includes(i);

      card.className = `p-3 text-center rounded-xl font-extrabold border text-sm transition shadow ${
        isOcupado 
          ? 'bg-red-600 border-red-500 text-white cursor-not-allowed opacity-80' 
          : 'bg-emerald-800 border-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
      }`;
      card.textContent = i.toString().padStart(2, '0');

      if (!isOcupado) {
        card.addEventListener('click', () => {
          if (numerosSelecionados.includes(i)) {
            numerosSelecionados = numerosSelecionados.filter(n => n !== i);
            card.className = 'p-3 text-center rounded-xl font-extrabold border text-sm transition shadow bg-emerald-800 border-emerald-600 text-white hover:bg-emerald-700 cursor-pointer';
          } else {
            numerosSelecionados.push(i);
            card.className = 'p-3 text-center rounded-xl font-extrabold border text-sm transition shadow bg-blue-600 border-blue-400 text-white cursor-pointer ring-2 ring-blue-300';
          }
          atualizarTotais();
        });
      }

      gridNumeros.appendChild(card);
    }

    btnGerarPix?.addEventListener('click', async () => {
      if (numerosSelecionados.length === 0) return;

      const participante = JSON.parse(sessionStorage.getItem('participante_dados'));
      const quantidade = numerosSelecionados.length;
      const valorTotal = quantidade * valorUnitario;
      const codigoReferencia = 'REF-' + Math.random().toString(36).substring(2, 9).toUpperCase();

      try {
        const { data, error } = await supabaseClient
          .from('doacoes')
          .insert([{
            nome: participante.nome,
            whatsapp: participante.whatsapp,
            quantidade_numeros: quantidade,
            valor: valorTotal,
            codigo_referencia: codigoReferencia,
            status: 'pendente'
          }])
          .select()
          .single();

        if (error) throw error;
        
        sessionStorage.removeItem('participante_dados');
        window.location.href = `confirmacao.html?id=${data.id}`;
      } catch (err) {
        console.error(err);
        alert('Erro ao registrar a doação no banco de dados.');
      }
    });
  }
});