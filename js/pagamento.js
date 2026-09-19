document.addEventListener('DOMContentLoaded', async () => {
  if (typeof carregarConfiguracoes === 'function') {
    await carregarConfiguracoes();
  }

  let doacao = null;
  const raw = sessionStorage.getItem('doacao_atual');
  
  if (raw) {
    try {
      doacao = JSON.parse(raw);
    } catch (e) {
      console.error('Erro ao parsear doacao_atual', e);
    }
  }

  if (!doacao) {
    const doacaoId = sessionStorage.getItem('doacao_id');
    if (doacaoId) {
      doacao = {
        id: doacaoId,
        nome: sessionStorage.getItem('doacao_nome') || '',
        whatsapp: sessionStorage.getItem('doacao_whatsapp') || '',
        numeros: JSON.parse(sessionStorage.getItem('doacao_numeros') || '[]'),
        valor_total: parseFloat(sessionStorage.getItem('doacao_valor_total') || '0'),
        item_categoria: sessionStorage.getItem('doacao_itens') || ''
      };
    }
  }

  if (!doacao || !doacao.id) {
    if (typeof mostrarToast === 'function') {
      mostrarToast('Nenhuma doação encontrada. Volte e preencha o formulário.', 'error');
    } else {
      alert('Nenhuma doação encontrada. Volte e preencha o formulário.');
    }
    setTimeout(() => window.location.href = 'doar.html', 2000);
    return;
  }

  renderResumo(doacao);
  renderPix();
  renderBotoesWhatsApp(doacao);

  const client = window.supabaseClient;
  if (client && doacao.id) {
    await client
      .from('doacoes')
      .update({ status_pagamento: 'aguardando_comprovante' })
      .eq('id', doacao.id);
  }

  const btnCopiar = document.getElementById('btn-copiar-pix');
  if (btnCopiar) {
    btnCopiar.addEventListener('click', () => {
      const elChave = document.getElementById('chave-pix');
      if (!elChave) return;
      const chave = elChave.textContent;
      
      navigator.clipboard.writeText(chave).then(() => {
        if (typeof mostrarToast === 'function') {
          mostrarToast('Chave PIX copiada!', 'success');
        } else {
          alert('Chave PIX copiada com sucesso!');
        }
      }).catch(() => {
        if (typeof mostrarToast === 'function') {
          mostrarToast('Não foi possível copiar. Selecione manualmente.', 'warning');
        } else {
          alert('Não foi possível copiar. Selecione manualmente.');
        }
      });
    });
  }
});

function renderResumo(doacao) {
  const el = document.getElementById('resumo-doacao');
  if (!el) return;

  const numerosStr = (doacao.numeros && doacao.numeros.length)
    ? doacao.numeros.map(n => String(n).padStart(3, '0')).join(', ')
    : null;

  el.innerHTML = `
    <div class="flex justify-between items-center py-1"><span class="text-emerald-300/70">Nome</span><span class="font-semibold text-emerald-100">${doacao.nome}</span></div>
    <div class="flex justify-between items-center py-1"><span class="text-emerald-300/70">WhatsApp</span><span class="font-semibold text-emerald-100">${formatarWhatsApp(doacao.whatsapp)}</span></div>
    ${numerosStr ? `<div class="flex justify-between items-center py-1"><span class="text-emerald-300/70">Números</span><span class="font-semibold text-emerald-100 text-right max-w-[60%]">${numerosStr}</span></div>` : ''}
    ${doacao.item_categoria ? `<div class="flex justify-between items-center py-1"><span class="text-emerald-300/70">Item</span><span class="font-semibold text-emerald-100">${doacao.item_categoria}</span></div>` : ''}
    <div class="border-t border-emerald-800/60 pt-3 mt-3 flex justify-between items-center text-base">
      <span class="font-semibold text-emerald-200">Total a pagar</span>
      <span class="font-extrabold text-emerald-300 text-xl">${formatarMoeda(doacao.valor_total)}</span>
    </div>
  `;
}

function renderPix() {
  const elChave = document.getElementById('chave-pix');
  const elNome = document.getElementById('nome-beneficiario');

  if (elChave) elChave.textContent = window.CHAVE_PIX || 'sua-chave-pix-aqui@email.com';
  if (elNome) elNome.textContent = window.NOME_BENEFICIARIO || 'Ação Solidária 2026';
}

function renderBotoesWhatsApp(doacao) {
  const container = document.getElementById('botoes-whatsapp');
  if (!container) return;

  const numeros = (doacao.numeros || []).map(n => String(n).padStart(3, '0')).join(', ');
  const mensagem = encodeURIComponent(
    `Olá! Acabei de fazer uma contribuição na Ação Solidária.\n\n` +
    `Nome: ${doacao.nome}\n` +
    `WhatsApp: ${doacao.whatsapp}\n` +
    (numeros ? `Números: ${numeros}\n` : '') +
    (doacao.item_categoria ? `Item: ${doacao.item_categoria}\n` : '') +
    `Valor: ${formatarMoeda(doacao.valor_total)}\n\n` +
    `Segue o comprovante do PIX.`
  );

  const telefones = window.WHATSAPP_COORDENACAO || ['5511999999999'];

  container.innerHTML = telefones.map((tel, i) => `
    <a href="https://wa.me/${tel}?text=${mensagem}" target="_blank" rel="noopener"
      class="flex items-center justify-center gap-3 w-full px-6 py-3.5 rounded-xl ${i === 0 ? 'bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold shadow-lg shadow-emerald-900/40' : 'card-glass border border-emerald-800/60 hover:border-emerald-500 text-emerald-100 font-semibold'} transition">
      Enviar Comprovante ${i === 0 ? '(Principal)' : `(${i + 1})`}
    </a>
  `).join('');
}