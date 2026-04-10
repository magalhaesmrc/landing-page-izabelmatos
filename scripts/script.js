(function() {
    const form = document.getElementById('formAgendamento');
    const feedbackDiv = document.getElementById('formFeedback');
    
    // === FUNÇÕES DE VALIDAÇÃO DE TELEFONE ===
    
    /**
     * Valida número de telefone brasileiro
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
        if (numero.length === 9) { // celular com 9º dígito
            telefoneFormatado = `(${ddd}) ${numero.substring(0, 5)}-${numero.substring(5)}`;
        } else { // fixo
            telefoneFormatado = `(${ddd}) ${numero.substring(0, 4)}-${numero.substring(4)}`;
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
    
    // === FUNÇÕES DE VALIDAÇÃO DE TAMANHO E CONTADOR ===
    
    /**
     * Limita o tamanho de um campo de texto
     * @param {HTMLElement} campo - Campo de input/textarea
     * @param {number} maxLength - Tamanho máximo permitido
     */
    function limitarCaracteres(campo, maxLength) {
        if (campo.value.length > maxLength) {
            campo.value = campo.value.substring(0, maxLength);
        }
    }
    
    /**
     * Atualiza o contador de caracteres de um campo
     * @param {HTMLElement} campo - Campo de input/textarea
     * @param {number} maxLength - Tamanho máximo permitido
     * @param {HTMLElement} contadorElement - Elemento HTML que mostra o contador
     */
    function atualizarContador(campo, maxLength, contadorElement) {
        const atual = campo.value.length;
        const restante = maxLength - atual;
        contadorElement.innerHTML = `${atual}/${maxLength} caracteres`;
        
        if (restante < 0) {
            contadorElement.style.color = '#c24a2f';
        } else if (restante <= 10) {
            contadorElement.style.color = '#e68a2e';
        } else {
            contadorElement.style.color = '#4f6a78';
        }
    }
    
    /**
     * Calcula o tamanho total da mensagem que será enviada ao WhatsApp
     * @param {object} dados - Dados do formulário
     * @returns {number} Tamanho total da mensagem em caracteres
     */
    function calcularTamanhoMensagemWhatsApp(dados) {
        // Template da mensagem (sem os valores dinâmicos)
        const template = `*🧠 Olá Izabel, estou entrando em contato através do site para conversarmos sobre a psicoterapia*%0A%0A` +
            `*Nome:* ${dados.nome}%0A` +
            `*E-mail:* ${dados.email}%0A` +
            `*Telefone:* ${dados.telefone}%0A` +
            `*Interesse:* ${dados.interesse}%0A` +
            `*Mensagem:* ${dados.mensagem || "Não informada"}%0A%0A` +
            `🔹 Enviado automaticamente pelo formulário do site.`;
        
        return template.length;
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
    
    // === LIMITES DE CARACTERES PARA NOME E EMAIL ===
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const mensagemTextarea = document.getElementById('mensagem');
    
    // Limite de 300 caracteres para o nome
    if (nomeInput) {
        nomeInput.setAttribute('maxlength', '300');
        
        // Cria contador para o nome (opcional, mas útil)
        const nomeCounter = document.createElement('small');
        nomeCounter.style.display = 'block';
        nomeCounter.style.fontSize = '0.7rem';
        nomeCounter.style.marginTop = '4px';
        nomeCounter.style.paddingLeft = '12px';
        nomeCounter.style.color = '#4f6a78';
        nomeInput.parentNode.appendChild(nomeCounter);
        
        function atualizarContadorNome() {
            const atual = nomeInput.value.length;
            const restante = 300 - atual;
            nomeCounter.innerHTML = `${atual}/300 caracteres`;
            if (restante <= 10 && restante > 0) {
                nomeCounter.style.color = '#e68a2e';
            } else if (restante === 0) {
                nomeCounter.style.color = '#c24a2f';
            } else {
                nomeCounter.style.color = '#4f6a78';
            }
        }
        
        nomeInput.addEventListener('input', function() {
            limitarCaracteres(this, 300);
            atualizarContadorNome();
        });
        
        atualizarContadorNome();
    }
    
    // Limite de 300 caracteres para o email
    if (emailInput) {
        emailInput.setAttribute('maxlength', '300');
        
        // Cria contador para o email
        const emailCounter = document.createElement('small');
        emailCounter.style.display = 'block';
        emailCounter.style.fontSize = '0.7rem';
        emailCounter.style.marginTop = '4px';
        emailCounter.style.paddingLeft = '12px';
        emailCounter.style.color = '#4f6a78';
        emailInput.parentNode.appendChild(emailCounter);
        
        function atualizarContadorEmail() {
            const atual = emailInput.value.length;
            const restante = 300 - atual;
            emailCounter.innerHTML = `${atual}/300 caracteres`;
            if (restante <= 10 && restante > 0) {
                emailCounter.style.color = '#e68a2e';
            } else if (restante === 0) {
                emailCounter.style.color = '#c24a2f';
            } else {
                emailCounter.style.color = '#4f6a78';
            }
        }
        
        emailInput.addEventListener('input', function() {
            limitarCaracteres(this, 300);
            atualizarContadorEmail();
        });
        
        atualizarContadorEmail();
    }
    
    // === CONTADOR DE CARACTERES PARA MENSAGEM (limite 1000) ===
    if (mensagemTextarea) {
        mensagemTextarea.setAttribute('maxlength', '1000');
        
        // Cria elemento de contador
        const mensagemCounter = document.createElement('small');
        mensagemCounter.style.display = 'block';
        mensagemCounter.style.fontSize = '0.7rem';
        mensagemCounter.style.marginTop = '4px';
        mensagemCounter.style.paddingLeft = '12px';
        mensagemCounter.style.color = '#4f6a78';
        mensagemTextarea.parentNode.appendChild(mensagemCounter);
        
        function atualizarContadorMensagem() {
            const atual = mensagemTextarea.value.length;
            const restante = 1000 - atual;
            mensagemCounter.innerHTML = `${atual}/1000 caracteres`;
            
            if (restante <= 10 && restante > 0) {
                mensagemCounter.style.color = '#e68a2e';
            } else if (restante === 0) {
                mensagemCounter.style.color = '#c24a2f';
            } else {
                mensagemCounter.style.color = '#4f6a78';
            }
        }
        
        mensagemTextarea.addEventListener('input', function() {
            limitarCaracteres(this, 1000);
            atualizarContadorMensagem();
        });
        
        atualizarContadorMensagem();
    }
    
    // === SUBMISSÃO DO FORMULÁRIO COM VALIDAÇÕES ===
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Coleta os valores
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const interesse = document.getElementById('interesse').value;
        let mensagem = document.getElementById('mensagem').value.trim();
        
        // Limita mensagem a 1000 caracteres (segurança extra)
        if (mensagem.length > 1000) {
            mensagem = mensagem.substring(0, 1000);
        }
        
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
        
        if (nome.length > 300) {
            feedbackDiv.innerHTML = '<span style="color:#c24a2f;">⚠️ Nome excede o limite de 300 caracteres.</span>';
            document.getElementById('nome').focus();
            return;
        }
        
        // Valida email
        if (!email) {
            feedbackDiv.innerHTML = '<span style="color:#c24a2f;">⚠️ Por favor, digite seu e-mail.</span>';
            document.getElementById('email').focus();
            return;
        }
        
        if (email.length > 300) {
            feedbackDiv.innerHTML = '<span style="color:#c24a2f;">⚠️ E-mail excede o limite de 300 caracteres.</span>';
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
        
        // Valida tamanho da mensagem do WhatsApp (máximo 1000 caracteres)
        const dadosWhatsApp = {
            nome: nome,
            email: email,
            telefone: telefoneValidado.formatted,
            interesse: interesse,
            mensagem: mensagem || "Não informada"
        };
        
        const tamanhoMensagem = calcularTamanhoMensagemWhatsApp(dadosWhatsApp);
        
        if (tamanhoMensagem > 1000) {
            feedbackDiv.innerHTML = `<span style="color:#c24a2f;">⚠️ A mensagem excedeu o limite de 1000 caracteres (${tamanhoMensagem}/1000). Por favor, reduza o texto da mensagem.</span>`;
            document.getElementById('mensagem').focus();
            return;
        }
        
        // Desabilita o botão durante o envio
        const botao = document.getElementById('btnEnviar');
        const textoOriginal = botao.innerHTML;
        botao.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Enviando...';
        botao.disabled = true;
        
        // --- CONFIGURAÇÕES DO WHATSAPP ---        
        const numeroWhatsApp = '5573981879728'; // Formato: 55 + DDD + número        
        
        // Monta a mensagem com formatação amigável
        const textoMensagemWhats = `*🧠 Olá Izabel, estou entrando em contato através do site para conversarmos sobre a psicoterapia*%0A%0A` +
            `*Nome:* ${nome}%0A` +
            `*E-mail:* ${email}%0A` +
            `*Telefone:* ${telefoneValidado.formatted}%0A` +
            `*Interesse:* ${interesse}%0A` +
            `*Mensagem:* ${mensagem || "Não informada"}%0A%0A` +
            `🔹 Enviado automaticamente pelo formulário do site.`;
        
        // Cria o link do WhatsApp
        const url = `https://wa.me/${numeroWhatsApp}?text=${textoMensagemWhats}`;
        
        // Abre o WhatsApp (funciona no celular e no WhatsApp Web)
        window.open(url, '_blank');
        
        // Feedback de sucesso
        feedbackDiv.innerHTML = '<span style="color:#1e4a6e;">✅ Mensagem preparada! O WhatsApp será aberto para você enviar. Aguarde o retorno em breve.</span>';
        
        // Limpa o formulário
        form.reset();
        
        // Reseta os contadores
        if (nomeInput) {
            const nomeCounter = nomeInput.parentNode.querySelector('small');
            if (nomeCounter) nomeCounter.innerHTML = '0/300 caracteres';
        }
        if (emailInput) {
            const emailCounter = emailInput.parentNode.querySelector('small');
            if (emailCounter) emailCounter.innerHTML = '0/300 caracteres';
        }
        if (mensagemTextarea) {
            const mensagemCounter = mensagemTextarea.parentNode.querySelector('small');
            if (mensagemCounter) mensagemCounter.innerHTML = '0/1000 caracteres';
        }
        
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

    // === FAQ ACCORDION ===
    function initFaq() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        if (faqItems.length === 0) return;
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                // Fecha todos os outros itens (comportamento de accordion)
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Alterna o item atual
                item.classList.toggle('active');
            });
        });
        
        // Abre o primeiro item por padrão
        // if (faqItems.length > 0) {
        //     faqItems[0].classList.add('active');
        // }
    }
    
    // Inicializa o FAQ quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFaq);
    } else {
        initFaq();
    }

    /***********/
    // === ANO CORRENTE VIA API EXTERNA (WorldTimeAPI) ===
    async function obterAnoViaAPI() {
        const anoElement = document.getElementById('anoAtual');
        if (!anoElement) return;
        
        // Exibe "carregando..." enquanto busca o ano
        anoElement.textContent = '...';
        
        try {
            // Faz a requisição para a API de horário de Brasília
            const resposta = await fetch('https://worldtimeapi.org/api/timezone/America/Sao_Paulo');
            
            // Verifica se a requisição foi bem-sucedida
            if (!resposta.ok) {
                throw new Error(`Erro HTTP: ${resposta.status}`);
            }
            
            const dados = await resposta.json();
            const dataServidor = new Date(dados.datetime);
            const anoAtual = dataServidor.getFullYear();
            
            // Insere o ano no elemento
            anoElement.textContent = anoAtual;
            
        } catch (erro) {
            console.error('Erro ao obter ano da API:', erro);
            
            // Fallback: usa o ano do computador do usuário se a API falhar
            const anoFallback = new Date().getFullYear();
            anoElement.textContent = anoFallback;
            console.log(`Usando ano do navegador como fallback: ${anoFallback}`);
        }
    }
    
    // Executa a função quando a página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', obterAnoViaAPI);
    } else {
        obterAnoViaAPI();
    }
    /***********/
    
})();
