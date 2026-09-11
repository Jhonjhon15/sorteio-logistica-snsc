const urlParams = new URLSearchParams(window.location.search);
const doacaoId = urlParams.get('id');

const resumoNome = document.getElementById('resumo-nome');
const resumoWhatsapp = document.getElementById('resumo-whatsapp');
const resumoQuantidade = document.getElementById('resumo-quantidade');
const resumoValor = document.getElementById('resumo-valor');
const resumoCodigo = document.getElementById('resumo-codigo');
const chavePixEl = document.getElementById('chave-pix');
const btnCopiar = document.getElementById('btn-copiar');
const btnWhatsapp = document.getElementById('btn-whatsapp');

const WHATSAPP_GRUPO = '5598XXXXXXXXX'; 

async function carregarDoacao() {
  if (!doacaoId) {
    alert('Doação não encontrada.');
    window.location.href = 'index.html';
    return;
  }

  const { data: doacao, error } = await supabaseClient
    .from('doacoes')
    .select('*')
    .eq('id', doacaoId)
    .single();

  if (error || !doacao) {
    console.error(error);
    alert('Não foi possível carregar a doação.');
    window.location.href = 'index.html';
    return;
  }

  resumoNome.textContent = doacao.nome;
  resumoWhatsapp.textContent = doacao.whatsapp;
  resumoQuantidade.textContent = doacao.quantidade_numeros;
  resumoValor.textContent = 'R$ ' + parseFloat(doacao.valor).toFixed(2).replace('.', ',');
  resumoCodigo.textContent = doacao.codigo_referencia;

  const { data: config } = await supabaseClient
    .from('configuracoes')
    .select('chave_pix, nome_titular_pix')
    .limit(1)
    .single();

  if (config && config.chave_pix) {
    chavePixEl.textContent = config.chave_pix;
  } else {
    chavePixEl.textContent = 'Chave Pix ainda não cadastrada. Avise o administrador.';
  }

  const mensagem = `Olá! Fiz uma doação no site do sorteio Logística SNSC.

Nome: ${doacao.nome}
WhatsApp: ${doacao.whatsapp}
Valor: R$ ${parseFloat(doacao.valor).toFixed(2)}
Quantidade de números: ${doacao.quantidade_numeros}
Código de referência: ${doacao.codigo_referencia}

Segue o comprovante do Pix.`;

  const linkWhatsapp = `https://wa.me/${WHATSAPP_GRUPO}?text=${encodeURIComponent(mensagem)}`;
  btnWhatsapp.href = linkWhatsapp;
}

btnCopiar.addEventListener('click', () => {
  const texto = chavePixEl.textContent;
  navigator.clipboard.writeText(texto).then(() => {
    btnCopiar.textContent = 'Chave copiada!';
    setTimeout(() => {
      btnCopiar.textContent = 'Copiar Chave Pix';
    }, 2000);
  });
});

carregarDoacao();