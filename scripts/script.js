(function() {
    const form = document.getElementById('formAgendamento');
    const feedbackDiv = document.getElementById('formFeedback');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const interesse = document.getElementById('interesse').value;
        const mensagem = document.getElementById('mensagem').value;
        
        if(!nome || !email || !telefone || !interesse) {
            feedbackDiv.innerHTML = '<span style="color:#c24a2f;">⚠️ Preencha nome, e-mail, telefone e o motivo de contato.</span>';
            return;
        }
        
        const botao = document.getElementById('btnEnviar');
        const textoOriginal = botao.innerHTML;
        botao.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Enviando...';
        botao.disabled = true;
        
        setTimeout(() => {
            const textoWhats = `Olá Izabel, meu nome é ${nome}. Gostaria de agendar uma conversa sobre: ${interesse}. Telefone: ${telefone} | E-mail: ${email}. Mensagem: ${mensagem.substring(0, 150)}`;
            const url = `https://wa.me/5511987654321?text=${encodeURIComponent(textoWhats)}`;
            window.open(url, '_blank');
            
            feedbackDiv.innerHTML = '<span style="color:#1e4a6e;">✅ Mensagem direcionada! Você será redirecionado ao WhatsApp. Em breve retornarei seu contato.</span>';
            form.reset();
            botao.innerHTML = textoOriginal;
            botao.disabled = false;
            setTimeout(() => {
                feedbackDiv.innerHTML = '';
            }, 7000);
        }, 600);
    });
})();