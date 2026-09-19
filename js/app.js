document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
  if (typeof carregarConfiguracoes === 'function') carregarConfiguracoes();
});

function renderNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const current = window.location.pathname.split('/').pop() || 'index.html';

  nav.innerHTML = `
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <a href="index.html" class="flex items-center gap-2 group">
          <div class="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <span class="font-bold text-lg tracking-tight text-emerald-50">Ação Solidária</span>
        </a>

        <div class="hidden md:flex items-center gap-1">
          ${navLink('index.html', 'Início', current)}
          ${navLink('doar.html', 'Doar', current)}
          ${navLink('sorteio.html', 'Sorteio', current)}
          ${navLink('numeros.html', 'Consultar Números', current)}
          ${navLink('instituicoes.html', 'Instituições', current)}
          ${navLink('cadastro.html', 'Cadastro', current)}
        </div>

        <button id="btn-mobile-menu" class="md:hidden p-2 rounded-lg text-emerald-100 hover:bg-emerald-800/50 transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>

      <div id="mobile-menu" class="hidden md:hidden pb-4 space-y-1">
        ${navLink('index.html', 'Início', current, true)}
        ${navLink('doar.html', 'Doar', current, true)}
        ${navLink('sorteio.html', 'Sorteio', current, true)}
        ${navLink('numeros.html', 'Consultar Números', current, true)}
        ${navLink('instituicoes.html', 'Instituições', current, true)}
        ${navLink('cadastro.html', 'Cadastro', current, true)}
      </div>
    </div>
  `;

  const btn = document.getElementById('btn-mobile-menu');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  }
}

function navLink(href, label, current, mobile = false) {
  const isActive = current === href || (current === '' && href === 'index.html');
  const base = mobile
    ? 'block px-4 py-2.5 rounded-lg text-sm font-medium transition'
    : 'px-3 py-2 rounded-lg text-sm font-medium transition';

  const active = isActive
    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
    : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/40';

  return `<a href="${href}" class="${base} ${active}">${label}</a>`;
}

function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-10">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
            </svg>
          </div>
          <span class="text-emerald-100 font-medium">Ação Solidária 2026</span>
        </div>
        <p class="text-emerald-300/60 text-sm text-center">
          Todos os valores arrecadados são destinados às instituições cadastradas.
        </p>
      </div>
    </div>
  `;
}