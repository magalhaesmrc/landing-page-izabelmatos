(function() {
    const form = document.getElementById('formAgendamento');
    const feedbackDiv = document.getElementById('formFeedback');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Coleta os valores
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const interesse = document.getElementById('interesse').value;
        const mensagem = document.getElementById('mensagem').value.trim();
        
        // Validação básica
        if(!nome || !email || !telefone || !interesse) {
            feedbackDiv.innerHTML = '<span style="color:#c24a2f;">⚠️ Preencha nome, e-mail, telefone e o motivo de contato.</span>';
            return;
        }
        
        // Desabilita o botão durante o envio
        const botao = document.getElementById('btnEnviar');
        const textoOriginal = botao.innerHTML;
        botao.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Enviando...';
        botao.disabled = true;
        
        // --- CONFIGURAÇÕES DO WHATSAPP ---        
        const numeroWhatsApp = '5573981879728'; // Formato: 55 + DDD + número
        const numeroWhatsAppTest = '5573988329508'; // Formato: 55 + DDD + número
        // Monta a mensagem com formatação amigável
        const textoMensagem = `*🧠 NOVO CONTATO DO SITE*%0A%0A` +
            `*Nome:* ${nome}%0A` +
            `*E-mail:* ${email}%0A` +
            `*Telefone:* ${telefone}%0A` +
            `*Interesse:* ${interesse}%0A` +
            `*Mensagem:* ${mensagem || "Não informada"}%0A%0A` +
            `🔹 Enviado automaticamente pelo formulário do site.`;
        
        // Cria o link do WhatsApp
        const url = `https://wa.me/${numeroWhatsApp}?text=${textoMensagem}`;
        
        // Abre o WhatsApp (funciona no celular e no WhatsApp Web)
        window.open(url, '_blank');
        
        // Feedback de sucesso
        feedbackDiv.innerHTML = '<span style="color:#1e4a6e;">✅ Mensagem preparada! O WhatsApp será aberto para você enviar. Aguarde o retorno em breve.</span>';
        
        // Limpa o formulário
        form.reset();
        
        // Restaura o botão após 2 segundos
        setTimeout(() => {
            botao.innerHTML = textoOriginal;
            botao.disabled = false;
        }, 2000);
        
        // Remove o feedback após 8 segundos
        setTimeout(() => {
            feedbackDiv.innerHTML = '';
        }, 8000);
    });
})();


/*
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
*/