document.addEventListener('DOMContentLoaded', async () => {
  const TOTAL_NUMEROS = 100; 
  const VALOR_POR_NUMERO = 10.00; 

  const gridNumeros = document.getElementById('grid-numeros');
  const qtdSelecionadosEl = document.getElementById('qtd-selecionados');
  const valorNumerosEl = document.getElementById('valor-numeros');
  const valorTotalDisplayEl = document.getElementById('valor-total-display');
  const btnAleatorio = document.getElementById('btn-aleatorio');
  const btnLimpar = document.getElementById('btn-limpar');
  const formSorteio = document.getElementById('form-sorteio');

  let numerosSelecionados = new Set();
  let numerosIndisponiveis = [];

  async function carregarStatusNumeros() {
    try {
      const { data, error } = await supabaseClient
        .from('numeros_escolhidos')
        .select('numero, status');

      if (error) throw error;

      if (data) {
        numerosIndisponiveis = data.map(item => Number(item.numero));
      }

      renderizarGrid();
    } catch (err) {
      console.error('Erro ao carregar números:', err);

      renderizarGrid();
    }
  }

  function renderizarGrid() {
    gridNumeros.innerHTML = '';

    for (let i = 1; i <= TOTAL_NUMEROS; i++) {
      const numeroStr = String(i).padStart(3, '0');
      const isIndisponivel = numerosIndisponiveis.includes(i);
      const isSelecionado = numerosSelecionados.has(i);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `num-btn ${isIndisponivel ? 'num-indisponivel' : isSelecionado ? 'num-selecionado' : 'num-disponivel'}`;
      btn.innerText = numeroStr;

      if (isIndisponivel) {
        btn.disabled = true;
        btn.title = 'Número já escolhido ou em processamento';
      } else {
        btn.addEventListener('click', () => alternarSelecao(i));
      }

      gridNumeros.appendChild(btn);
    }

    atualizarResumo();
  }

  function alternarSelecao(num) {
    if (numerosSelecionados.has(num)) {
      numerosSelecionados.delete(num);
    } else {
      numerosSelecionados.add(num);
    }
    renderizarGrid();
  }

  function atualizarResumo() {
    const qtd = numerosSelecionados.size;
    const total = qtd * VALOR_POR_NUMERO;

    qtdSelecionadosEl.innerText = qtd;
    valorNumerosEl.innerText = `R$ ${total.toFixed(2)}`;
    valorTotalDisplayEl.innerText = `R$ ${total.toFixed(2)}`;
  }

  if (btnAleatorio) {
    btnAleatorio.addEventListener('click', () => {

      let disponiveis = [];
      for (let i = 1; i <= TOTAL_NUMEROS; i++) {
        if (!numerosIndisponiveis.includes(i) && !numerosSelecionados.has(i)) {
          disponiveis.push(i);
        }
      }

      if (disponiveis.length === 0) {
        alert('Não há números disponíveis no momento!');
        return;
      }

      const randomIndex = Math.floor(Math.random() * disponiveis.length);
      numerosSelecionados.add(disponiveis[randomIndex]);
      renderizarGrid();
    });
  }

  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      numerosSelecionados.clear();
      renderizarGrid();
    });
  }

  if (formSorteio) {
    formSorteio.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (numerosSelecionados.size === 0) {
        alert('Por favor, selecione pelo menos um número antes de continuar.');
        return;
      }

      const nome = document.getElementById('nome').value.trim();
      const whatsapp = document.getElementById('whatsapp').value.trim();
      const numerosArray = Array.from(numerosSelecionados);
      const valorTotal = numerosArray.length * VALOR_POR_NUMERO;

      const btnContinuar = document.getElementById('btn-continuar');
      btnContinuar.disabled = true;
      btnContinuar.innerText = 'Salvando bilhetes...';

      try {

        for (let num of numerosArray) {
          const { error } = await supabaseClient
            .from('numeros_escolhidos')
            .insert([{
              numero: num,
              nome_doador: nome,
              whatsapp: whatsapp,
              valor: VALOR_POR_NUMERO,
              status: 'pendente'
            }]);

          if (error) throw error;
        }

        await supabaseClient
          .from('doacoes')
          .insert([{
            nome_doador: nome,
            whatsapp: whatsapp,
            metodo: 'pix',
            valor: valorTotal,
            status: 'pendente'
          }]);

        sessionStorage.setItem('doacao_atual', JSON.stringify({
          nome,
          whatsapp,
          numeros: numerosArray,
          valor: valorTotal
        }));

        window.location.href = 'pagamento.html';

      } catch (err) {
        console.error('Erro ao salvar no banco:', err);
        alert('Ocorreu um erro ao registrar seus números. Tente novamente.');
        btnContinuar.disabled = false;
        btnContinuar.innerText = 'Continuar para pagamento →';
      }
    });
  }

  await carregarStatusNumeros();
});