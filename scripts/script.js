(function() {
    const form = document.getElementById('formAgendamento');
    const feedbackDiv = document.getElementById('formFeedback');
    
    // === FUNÇÕES DE VALIDAÇÃO DE TELEFONE ===
    
    /**
     * Valida número de telefone
     * @param {string} telefone - Número a ser validado
     * @returns {object} { isValid: boolean, message: string, formatted: string }
     */
    function validarTelefone(telefone) {
        // Remove tudo que não for dígito (espaços, traços, parênteses, etc.)
        let numeros = telefone.replace(/\D/g, '');
        
        // Verifica se está vazio
        if (numeros.length === 0) {
            return { 
                isValid: false, 
                message: 'Digite um telefone para contato.',
                formatted: ''
            };
        }
        
        // Verifica se tem entre 10 e 11 dígitos (com ou sem 9º dígito)
        if (numeros.length < 10 || numeros.length > 11) {
            return { 
                isValid: false, 
                message: 'Número inválido. Digite com DDD + 8 ou 9 dígitos (ex: 11999999999).',
                formatted: ''
            };
        }
        
        // Extrai DDD (primeiros 2 dígitos)
        const ddd = numeros.substring(0, 2);
        
        // Valida DDD (deve estar entre 11 e 99)
        const dddNum = parseInt(ddd, 10);
        if (dddNum < 11 || dddNum > 99) {
            return { 
                isValid: false, 
                message: 'DDD inválido. Digite um DDD válido do Brasil (11 a 99).',
                formatted: ''
            };
        }
        
        // Extrai o número após o DDD
        let numero = numeros.substring(2);
        
        // Valida tamanho do número (8 ou 9 dígitos)
        if (numero.length !== 8 && numero.length !== 9) {
            return { 
                isValid: false, 
                message: 'Número de telefone inválido. Deve ter 8 ou 9 dígitos após o DDD.',
                formatted: ''
            };
        }
        
        // Se tem 9 dígitos, o primeiro deve ser 9 (celular)
        if (numero.length === 9 && numero.charAt(0) !== '9') {
            return { 
                isValid: false, 
                message: 'Número de celular inválido. Celular deve começar com 9.',
                formatted: ''
            };
        }
        
        // Se tem 8 dígitos, é telefone fixo (válido)
        // Não permite números com dígitos repetidos (ex: 11111111)
        if (/^(\d)\1+$/.test(numero)) {
            return { 
                isValid: false, 
                message: 'Número de telefone inválido. Digite um número real.',
                formatted: ''
            };
        }
        
        // Formata o número para exibição amigável
        let telefoneFormatado;
        if (numero.length === 11) { // com 9º dígito
            telefoneFormatado = `(${ddd}) ${numero.substring(0, 5)}-${numero.substring(5)}`;
        } else if (numero.length === 10) { // fixo
            telefoneFormatado = `(${ddd}) ${numero.substring(0, 4)}-${numero.substring(4)}`;
        } else {
            telefoneFormatado = `(${ddd}) ${numero}`;
        }
        
        return { 
            isValid: true, 
            message: '',
            formatted: telefoneFormatado,
            raw: numeros
        };
    }
    
    /**
     * Formata o telefone enquanto o usuário digita (máscara)
     * @param {string} telefone - Número parcial
     * @returns {string} Telefone formatado
     */
    function formatarTelefone(telefone) {
        let numeros = telefone.replace(/\D/g, '');
        
        if (numeros.length === 0) return '';
        if (numeros.length <= 2) return `(${numeros}`;
        if (numeros.length <= 7) return `(${numeros.substring(0, 2)}) ${numeros.substring(2)}`;
        if (numeros.length <= 11) {
            const ddd = numeros.substring(0, 2);
            const parte1 = numeros.substring(2, 7);
            const parte2 = numeros.substring(7, 11);
            if (parte2) {
                return `(${ddd}) ${parte1}-${parte2}`;
            }
            return `(${ddd}) ${parte1}`;
        }
        // Limita a 11 dígitos
        numeros = numeros.substring(0, 11);
        const ddd = numeros.substring(0, 2);
        const parte1 = numeros.substring(2, 7);
        const parte2 = numeros.substring(7, 11);
        return `(${ddd}) ${parte1}-${parte2}`;
    }
    
    // === APLICA MÁSCARA AO CAMPO DE TELEFONE ===
    const telefoneInput = document.getElementById('telefone');
    
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let cursorPos = e.target.selectionStart;
            let oldLength = e.target.value.length;
            
            // Aplica a máscara
            let formatado = formatarTelefone(e.target.value);
            e.target.value = formatado;
            
            // Ajusta a posição do cursor
            let newLength = formatado.length;
            let diff = newLength - oldLength;
            e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
        });
        
        // Previne colagem de textos inválidos
        telefoneInput.addEventListener('keydown', function(e) {
            // Permite backspace, delete, tab, enter, setas, etc.
            const teclasPermitidas = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
            if (teclasPermitidas.includes(e.key)) return;
            
            // Permite Ctrl+V, Ctrl+C, etc.
            if (e.ctrlKey || e.metaKey) return;
            
            // Permite apenas números e os caracteres da máscara
            const regex = /^[\d\(\)\s\-]$/;
            if (!regex.test(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    // === VALIDAÇÃO EM TEMPO REAL DO TELEFONE (enquanto digita) ===
    if (telefoneInput) {
        const telefoneFeedback = document.createElement('small');
        telefoneFeedback.style.display = 'block';
        telefoneFeedback.style.fontSize = '0.7rem';
        telefoneFeedback.style.marginTop = '4px';
        telefoneFeedback.style.paddingLeft = '12px';
        telefoneInput.parentNode.appendChild(telefoneFeedback);
        
        telefoneInput.addEventListener('blur', function() {
            const resultado = validarTelefone(this.value);
            if (this.value.trim() !== '' && !resultado.isValid) {
                telefoneFeedback.innerHTML = `<span style="color:#c24a2f;">⚠️ ${resultado.message}</span>`;
                this.style.borderColor = '#c24a2f';
            } else if (this.value.trim() !== '' && resultado.isValid) {
                telefoneFeedback.innerHTML = `<span style="color:#1e4a6e;">✅ ${resultado.formatted}</span>`;
                this.style.borderColor = '#2c5f8a';
            } else {
                telefoneFeedback.innerHTML = '';
                this.style.borderColor = '';
            }
        });
        
        telefoneInput.addEventListener('focus', function() {
            if (this.value.trim() !== '') {
                const resultado = validarTelefone(this.value);
                if (!resultado.isValid) {
                    telefoneFeedback.innerHTML = `<span style="color:#c24a2f;">⚠️ ${resultado.message}</span>`;
                }
            }
        });
        
        telefoneInput.addEventListener('input', function() {
            this.style.borderColor = '';
            if (this.value.trim() === '') {
                telefoneFeedback.innerHTML = '';
            } else {
                const resultado = validarTelefone(this.value);
                if (resultado.isValid) {
                    telefoneFeedback.innerHTML = `<span style="color:#1e4a6e;">✅ ${resultado.formatted}</span>`;
                } else if (this.value.length > 3) {
                    telefoneFeedback.innerHTML = `<span style="color:#c24a2f;">⚠️ ${resultado.message}</span>`;
                }
            }
        });
    }
    
    // === SUBMISSÃO DO FORMULÁRIO COM VALIDAÇÃO ===
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Coleta os valores
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const interesse = document.getElementById('interesse').value;
        const mensagem = document.getElementById('mensagem').value.trim();
        
        // === VALIDAÇÕES ===
        
        // Valida nome
        if (!nome) {
            feedbackDiv.innerHTML = '<span style="color:#c24a2f;">⚠️ Por favor, digite seu nome completo.</span>';
            document.getElementById('nome').focus();
            return;
        }
        
        if (nome.length < 3) {
            feedbackDiv.innerHTML = '<span style="color:#c24a2f;">⚠️ Por favor, digite seu nome completo.</span>';
            document.getElementById('nome').focus();
            return;
        }
        
        // Valida email
        if (!email) {
            feedbackDiv.innerHTML = '<span style="color:#c24a2f;">⚠️ Por favor, digite seu e-mail.</span>';
            document.getElementById('email').focus();
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            feedbackDiv.innerHTML = '<span style="color:#c24a2f;">⚠️ Digite um e-mail válido (ex: nome@email.com).</span>';
            document.getElementById('email').focus();
            return;
        }
        
        // Valida telefone (mais rigorosa)
        if (!telefone) {
            feedbackDiv.innerHTML = '<span style="color:#c24a2f;">⚠️ Por favor, digite seu telefone com DDD.</span>';
            document.getElementById('telefone').focus();
            return;
        }
        
        const telefoneValidado = validarTelefone(telefone);
        if (!telefoneValidado.isValid) {
            feedbackDiv.innerHTML = `<span style="color:#c24a2f;">⚠️ ${telefoneValidado.message}</span>`;
            document.getElementById('telefone').focus();
            return;
        }
        
        // Valida interesse
        if (!interesse) {
            feedbackDiv.innerHTML = '<span style="color:#c24a2f;">⚠️ Selecione o motivo do contato.</span>';
            document.getElementById('interesse').focus();
            return;
        }
        
        // Desabilita o botão durante o envio
        const botao = document.getElementById('btnEnviar');
        const textoOriginal = botao.innerHTML;
        botao.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Enviando...';
        botao.disabled = true;
        
        // --- CONFIGURAÇÕES DO WHATSAPP ---       
        const numeroWhatsApp = '5573981879728'; // Formato: 55 + DDD + número
                
        // Usa o telefone já formatado pela validação
        const telefoneEnvio = telefoneValidado.formatted;
        
        // Monta a mensagem com formatação amigável
        const textoMensagem = `*🧠 UM NOVO INTERESSADO NA PSICOTERAPIA ENTROU EM CONTATO ATRAVÉS DO SITE*%0A%0A` +
            `*Nome:* ${nome}%0A` +
            `*E-mail:* ${email}%0A` +
            `*Telefone:* ${telefoneEnvio}%0A` +
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
        
        // Limpa o feedback do telefone
        const telefoneFeedback = telefoneInput.parentNode.querySelector('small');
        if (telefoneFeedback) telefoneFeedback.innerHTML = '';
        
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
