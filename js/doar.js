const client = window.supabaseClient;
const PRECO = window.VALOR_POR_NUMERO || 10;

let numerosSelecionados = new Set();
let todosNumeros = [];

document.addEventListener('DOMContentLoaded', async () => {
  const querDoarCheck = document.getElementById('quer-doar-item');
  if (querDoarCheck) {
    querDoarCheck.addEventListener('change', (e) => {
      const campoItens = document.getElementById('campo-itens');
      if (campoItens) campoItens.classList.toggle('hidden', !e.target.checked);
    });
  }

  const valorExtraInput = document.getElementById('valor-extra');
  if (valorExtraInput) {
    valorExtraInput.addEventListener('input', atualizarResumo);
  }

  await carregarNumeros();
  renderizarGrade();
  setupFormulario();
});

async function carregarNumeros() {
  if (!client) return;
  const { data, error } = await client
    .from('numeros')
    .select('numero, status')
    .order('numero');

  if (error) {
    console.error(error);
    if (typeof mostrarToast === 'function') {
      mostrarToast('Erro ao carregar números.', 'error');
    } else {
      alert('Erro ao carregar números. Tente novamente.');
    }
    return;
  }
  todosNumeros = data || [];
}

function renderizarGrade() {
  const container = document.getElementById('grade-numeros');
  if (!container) return;
  container.innerHTML = '';

  todosNumeros.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = item.numero;
    btn.dataset.numero = item.numero;
    btn.className = 'w-12 h-12 rounded-xl border font-semibold text-sm transition-all flex items-center justify-center';

    if (item.status === 'disponivel') {
      btn.classList.add('card-glass', 'border-emerald-800/60', 'text-emerald-100', 'hover:bg-emerald-600', 'hover:border-emerald-500');
      btn.addEventListener('click', () => toggleNumero(item.numero, btn));
    } else if (item.status === 'reservado') {
      btn.classList.add('bg-amber-500/20', 'border-amber-500/40', 'text-amber-300', 'cursor-not-allowed', 'opacity-60');
      btn.disabled = true;
    } else {
      btn.classList.add('bg-emerald-950/40', 'border-emerald-800/20', 'text-emerald-600/50', 'cursor-not-allowed', 'opacity-40');
      btn.disabled = true;
    }

    if (numerosSelecionados.has(item.numero)) {
      btn.classList.remove('card-glass', 'border-emerald-800/60', 'text-emerald-100', 'hover:bg-emerald-600');
      btn.classList.add('bg-emerald-500', 'text-forest-950', 'border-emerald-400', 'shadow-lg', 'shadow-emerald-900/50');
    }

    container.appendChild(btn);
  });

  atualizarResumo();
}

function toggleNumero(numero, btn) {
  if (numerosSelecionados.has(numero)) {
    numerosSelecionados.delete(numero);
    btn.classList.remove('bg-emerald-500', 'text-forest-950', 'border-emerald-400', 'shadow-lg', 'shadow-emerald-900/50');
    btn.classList.add('card-glass', 'border-emerald-800/60', 'text-emerald-100', 'hover:bg-emerald-600');
  } else {
    numerosSelecionados.add(numero);
    btn.classList.remove('card-glass', 'border-emerald-800/60', 'text-emerald-100', 'hover:bg-emerald-600');
    btn.classList.add('bg-emerald-500', 'text-forest-950', 'border-emerald-400', 'shadow-lg', 'shadow-emerald-900/50');
  }
  atualizarResumo();
}

function atualizarResumo() {
  const qtd = numerosSelecionados.size;
  const precoAtual = window.VALOR_POR_NUMERO || PRECO;
  const valorNumeros = qtd * precoAtual;
  
  const inputExtra = document.getElementById('valor-extra');
  const valorExtra = inputExtra ? (parseFloat(inputExtra.value) || 0) : 0;
  const total = valorNumeros + valorExtra;

  const elQtd = document.getElementById('qtd-selecionados');
  const elValNum = document.getElementById('valor-numeros');
  const elTotal = document.getElementById('valor-total');
  const elTotalDisp = document.getElementById('valor-total-display');

  if (elQtd) elQtd.textContent = qtd;
  if (elValNum) elValNum.textContent = formatarMoeda(valorNumeros);
  if (elTotal) elTotal.textContent = formatarMoeda(total);
  if (elTotalDisp) elTotalDisp.textContent = formatarMoeda(total);
}

function setupFormulario() {
  const form = document.getElementById('form-doacao');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nomeInput = document.getElementById('nome');
    const wppInput = document.getElementById('whatsapp');
    const inputExtra = document.getElementById('valor-extra');
    const querItemCheck = document.getElementById('quer-doar-item');
    const itensInput = document.getElementById('itens');

    const nome = nomeInput ? nomeInput.value.trim() : '';
    const whatsapp = wppInput ? apenasDigitos(wppInput.value) : '';
    const valorExtra = inputExtra ? (parseFloat(inputExtra.value) || 0) : 0;
    const querItem = querItemCheck ? querItemCheck.checked : false;
    const itens = (querItem && itensInput) ? itensInput.value.trim() : null;

    if (!nome || whatsapp.length < 10) {
      alert('Preencha seu nome completo e um WhatsApp válido.');
      return;
    }

    if (numerosSelecionados.size === 0 && valorExtra <= 0 && !querItem) {
      alert('Selecione pelo menos um número, informe um valor extra ou declare um item para doação.');
      return;
    }

    const numerosArray = Array.from(numerosSelecionados).sort((a, b) => a - b);
    const precoAtual = window.VALOR_POR_NUMERO || PRECO;
    const valorNumeros = numerosArray.length * precoAtual;

    const btn = document.getElementById('btn-continuar');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Processando...';
    }

    try {
      const { data, error } = await client.rpc('reservar_numeros', {
        p_numeros: numerosArray,
        p_nome: nome,
        p_whatsapp: whatsapp,
        p_valor_numeros: valorNumeros,
        p_valor_extra: valorExtra,
        p_itens: itens,
        p_precisa_contato: querItem
      });

      if (error) throw error;

      const doacaoId = data;

      sessionStorage.setItem('doacao_id', doacaoId);
      sessionStorage.setItem('doacao_nome', nome);
      sessionStorage.setItem('doacao_whatsapp', whatsapp);
      sessionStorage.setItem('doacao_numeros', JSON.stringify(numerosArray));
      sessionStorage.setItem('doacao_valor_numeros', valorNumeros.toFixed(2));
      sessionStorage.setItem('doacao_valor_extra', valorExtra.toFixed(2));
      sessionStorage.setItem('doacao_valor_total', (valorNumeros + valorExtra).toFixed(2));
      sessionStorage.setItem('doacao_itens', itens || '');
      sessionStorage.setItem('doacao_precisa_contato', querItem ? '1' : '0');

      if (valorNumeros + valorExtra > 0) {
        window.location.href = `pagamento.html?id=${doacaoId}`;
      } else {
        window.location.href = `confirmacao.html`;
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Erro ao processar. Alguns números podem ter sido reservados. Atualize a página.');
      await carregarNumeros();
      renderizarGrade();
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Continuar para pagamento →';
      }
    }
  });
}