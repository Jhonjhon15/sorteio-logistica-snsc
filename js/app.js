document.addEventListener('DOMContentLoaded', () => {
  const formCadastro = document.getElementById('form-cadastro-inicial');

  if (formCadastro) {
    formCadastro.addEventListener('submit', (e) => {
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
  }
});