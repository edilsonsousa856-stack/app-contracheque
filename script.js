// ============================================
// SISTEMA DE CONTRA CHEQUES - CADA UM COM SEU PDF
// ============================================

let funcionarios = [];
let contracheques = [];

// ========== CARREGAR DADOS ==========
function carregarDados() {
    const funcSalvos = localStorage.getItem('funcionarios');
    const contSalvos = localStorage.getItem('contracheques');
    
    if (funcSalvos) funcionarios = JSON.parse(funcSalvos);
    if (contSalvos) contracheques = JSON.parse(contSalvos);
    
    // Funcionários de exemplo
    if (funcionarios.length === 0) {
        funcionarios = [
            { id: 1, codigo: "FUNC001", nome: "João Silva", senha: "123456" },
            { id: 2, codigo: "FUNC002", nome: "Maria Santos", senha: "123456" },
            { id: 3, codigo: "FUNC003", nome: "Carlos Souza", senha: "123456" }
        ];
        salvarFuncionarios();
    }
}

function salvarFuncionarios() {
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
}

function salvarContracheques() {
    localStorage.setItem('contracheques', JSON.stringify(contracheques));
}

// ========== PARTE DO COLABORADOR (index.html) ==========
function fazerLogin() {
    const codigo = document.getElementById('codigoLogin').value;
    const senha = document.getElementById('senhaLogin').value;
    
    if (!codigo || !senha) {
        mostrarErro('Digite código e senha!');
        return;
    }
    
    const funcionario = funcionarios.find(f => f.codigo === codigo && f.senha === senha);
    
    if (!funcionario) {
        mostrarErro('Código ou senha incorretos!');
        return;
    }
    
    // Buscar contracheques deste funcionário
    const meusContraches = contracheques.filter(c => c.funcionarioId === funcionario.id);
    
    if (meusContraches.length === 0) {
        mostrarErro('Nenhum contracheque encontrado para você.');
        return;
    }
    
    // Mostrar tela do contracheque
    document.getElementById('telaLogin').style.display = 'none';
    document.getElementById('telaContracheque').style.display = 'block';
    
    const conteudoDiv = document.getElementById('conteudoContracheque');
    conteudoDiv.innerHTML = `
        <div style="text-align:center;">
            <h2>Olá, ${funcionario.nome}! 👋</h2>
            <p>Seus contracheques estão abaixo:</p>
        </div>
    `;
    
    meusContraches.forEach(cont => {
        conteudoDiv.innerHTML += `
            <div class="item-contracheque" style="margin:15px 0; flex-direction:column; text-align:center;">
                <strong style="font-size:18px;">📄 ${cont.mes}</strong>
                <small>Enviado em: ${cont.dataEnvio}</small>
                <a href="${cont.link}" target="_blank" class="btn-pdf" style="margin-top:10px;">
                    VER CONTRA CHEQUE
                </a>
            </div>
        `;
    });
}

function mostrarErro(msg) {
    const erroDiv = document.getElementById('msgErro');
    erroDiv.innerHTML = msg;
    setTimeout(() => erroDiv.innerHTML = '', 3000);
}

function voltarLogin() {
    document.getElementById('telaLogin').style.display = 'block';
    document.getElementById('telaContracheque').style.display = 'none';
    document.getElementById('codigoLogin').value = '';
    document.getElementById('senhaLogin').value = '';
}

// ========== PARTE DO ADMINISTRADOR (admin.html) ==========
function loginAdmin() {
    const senha = document.getElementById('senhaAdmin').value;
    if (senha === 'admin123') {
        document.getElementById('telaLoginAdmin').style.display = 'none';
        document.getElementById('painelAdmin').style.display = 'block';
        carregarAdmin();
    } else {
        alert('Senha incorreta! Use: admin123');
    }
}

function logoutAdmin() {
    document.getElementById('telaLoginAdmin').style.display = 'block';
    document.getElementById('painelAdmin').style.display = 'none';
    document.getElementById('senhaAdmin').value = '';
}

function carregarAdmin() {
    carregarSelectFuncionarios();
    listarFuncionariosAdmin();
    listarTodosContraches();
}

function carregarSelectFuncionarios() {
    const select = document.getElementById('selFuncionario');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Selecione um funcionário --</option>';
    funcionarios.forEach(func => {
        select.innerHTML += `<option value="${func.id}">${func.codigo} - ${func.nome}</option>`;
    });
}

function enviarContracheque() {
    const funcionarioId = parseInt(document.getElementById('selFuncionario').value);
    const mes = document.getElementById('mesContracheque').value;
    const link = document.getElementById('linkPDF').value;
    
    if (!funcionarioId || !mes || !link) {
        alert('Preencha todos os campos!');
        return;
    }
    
    const funcionario = funcionarios.find(f => f.id === funcionarioId);
    
    // Adicionar contracheque
    contracheques.push({
        id: Date.now(),
        funcionarioId: funcionarioId,
        funcionarioNome: funcionario.nome,
        funcionarioCodigo: funcionario.codigo,
        mes: mes,
        link: link,
        dataEnvio: new Date().toLocaleString()
    });
    
    salvarContracheques();
    
    // Limpar campos
    document.getElementById('mesContracheque').value = '';
    document.getElementById('linkPDF').value = '';
    
    alert(`✅ Contracheque de ${mes} enviado para ${funcionario.nome}!`);
    
    listarTodosContraches();
}

function listarFuncionariosAdmin() {
    const listaDiv = document.getElementById('listaFuncionarios');
    if (!listaDiv) return;
    
    listaDiv.innerHTML = '';
    funcionarios.forEach(func => {
        // Contar quantos contracheques este funcionário tem
        const qtd = contracheques.filter(c => c.funcionarioId === func.id).length;
        
        listaDiv.innerHTML += `
            <div class="item-funcionario">
                <div>
                    <strong>${func.codigo}</strong><br>
                    ${func.nome}<br>
                    <small>Senha: ${func.senha}</small><br>
                    <small>📄 ${qtd} contracheque(s)</small>
                </div>
                <div>
                    <button onclick="editarFuncionario(${func.id})" style="background:#ffc107; color:#333;">✏️</button>
                    <button onclick="excluirFuncionario(${func.id})" style="background:#dc3545;">❌</button>
                </div>
            </div>
        `;
    });
}

function listarTodosContraches() {
    const listaDiv = document.getElementById('listaEnviados');
    if (!listaDiv) return;
    
    if (contracheques.length === 0) {
        listaDiv.innerHTML = '<p style="text-align:center;">Nenhum contracheque enviado ainda.</p>';
        return;
    }
    
    listaDiv.innerHTML = '';
    [...contracheques].reverse().forEach(cont => {
        listaDiv.innerHTML += `
            <div class="item-contracheque">
                <div>
                    <strong>${cont.funcionarioNome}</strong> (${cont.funcionarioCodigo})<br>
                    Mês: ${cont.mes}<br>
                    <small>Enviado: ${cont.dataEnvio}</small>
                </div>
                <div>
                    <a href="${cont.link}" target="_blank">📄 Ver PDF</a>
                    <button onclick="excluirContracheque(${cont.id})" style="background:#dc3545; margin-top:5px;">❌</button>
                </div>
            </div>
        `;
    });
}

function excluirContracheque(id) {
    if (confirm('Tem certeza que quer excluir este contracheque?')) {
        contracheques = contracheques.filter(c => c.id !== id);
        salvarContracheques();
        listarTodosContraches();
        listarFuncionariosAdmin();
        alert('Contracheque removido!');
    }
}

function abrirModalFuncionario() {
    document.getElementById('modalFuncionario').style.display = 'block';
    document.getElementById('novoCodigo').value = '';
    document.getElementById('novoNome').value = '';
    document.getElementById('novaSenha').value = '123456';
}

function fecharModal() {
    document.getElementById('modalFuncionario').style.display = 'none';
}

function salvarFuncionario() {
    const codigo = document.getElementById('novoCodigo').value;
    const nome = document.getElementById('novoNome').value;
    const senha = document.getElementById('novaSenha').value;
    
    if (!codigo || !nome) {
        alert('Preencha código e nome!');
        return;
    }
    
    const novoId = Math.max(...funcionarios.map(f => f.id), 0) + 1;
    funcionarios.push({
        id: novoId,
        codigo: codigo.toUpperCase(),
        nome: nome,
        senha: senha
    });
    
    salvarFuncionarios();
    fecharModal();
    carregarAdmin();
    alert(`✅ Funcionário ${nome} adicionado!`);
}

function editarFuncionario(id) {
    const func = funcionarios.find(f => f.id === id);
    if (!func) return;
    
    const novaSenha = prompt(`Digite a nova senha para ${func.nome}:`, func.senha);
    if (novaSenha && novaSenha !== func.senha) {
        func.senha = novaSenha;
        salvarFuncionarios();
        listarFuncionariosAdmin();
        alert(`Senha de ${func.nome} alterada para: ${novaSenha}`);
    }
}

function excluirFuncionario(id) {
    const func = funcionarios.find(f => f.id === id);
    if (!func) return;
    
    if (confirm(`Tem certeza que quer excluir ${func.nome}? Todos os contracheques dele também serão removidos.`)) {
        funcionarios = funcionarios.filter(f => f.id !== id);
        contracheques = contracheques.filter(c => c.funcionarioId !== id);
        salvarFuncionarios();
        salvarContracheques();
        carregarAdmin();
        alert(`Funcionário ${func.nome} removido!`);
    }
}

// Funções auxiliares para as abas
function mostrarAba(aba) {
    document.querySelectorAll('.aba-conteudo').forEach(el => el.style.display = 'none');
    document.getElementById(`aba${aba.charAt(0).toUpperCase() + aba.slice(1)}`).style.display = 'block';
    
    document.querySelectorAll('.abas button').forEach(btn => btn.classList.remove('aba-ativa'));
    event.target.classList.add('aba-ativa');
}

// INICIAR
carregarDados();

// Verificar qual página está rodando
if (window.location.pathname.includes('admin.html')) {
    setTimeout(() => {
        if (document.getElementById('painelAdmin')) {
            carregarAdmin();
        }
    }, 100);
}