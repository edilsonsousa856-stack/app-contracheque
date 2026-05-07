// ============================================
// TOPGEO - CONTRA CHEQUES (VERSÃO SIMPLES)
// ============================================

// FUNCIONÁRIOS PADRÃO
let funcionarios = [];
let contracheques = [];

// ========== CARREGAR DADOS ==========
function carregarDados() {
    const funcSalvos = localStorage.getItem('funcionarios');
    const contSalvos = localStorage.getItem('contracheques');
    
    if (funcSalvos) {
        funcionarios = JSON.parse(funcSalvos);
    } else {
        funcionarios = [
            { id: 1, codigo: "FUNC001", nome: "João Silva", senha: "123456", email: "joao@email.com" },
            { id: 2, codigo: "FUNC002", nome: "Maria Santos", senha: "123456", email: "maria@email.com" },
            { id: 3, codigo: "FUNC003", nome: "Carlos Souza", senha: "123456", email: "carlos@email.com" }
        ];
        salvarFuncionarios();
    }
    
    if (contSalvos) {
        contracheques = JSON.parse(contSalvos);
    }
}

function salvarFuncionarios() {
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
}

function salvarContracheques() {
    localStorage.setItem('contracheques', JSON.stringify(contracheques));
}

// ========== FUNÇÕES DO COLABORADOR ==========
function fazerLogin() {
    const codigo = document.getElementById('codigoLogin')?.value;
    const senha = document.getElementById('senhaLogin')?.value;
    
    if (!codigo || !senha) {
        mostrarErro('Digite código e senha!');
        return;
    }
    
    const funcionario = funcionarios.find(f => f.codigo === codigo && f.senha === senha);
    
    if (!funcionario) {
        mostrarErro('Código ou senha incorretos!');
        return;
    }
    
    const meusContraches = contracheques.filter(c => c.funcionarioId === funcionario.id);
    
    document.getElementById('telaLogin').style.display = 'none';
    document.getElementById('telaContracheque').style.display = 'block';
    
    const conteudoDiv = document.getElementById('conteudoContracheque');
    
    if (meusContraches.length === 0) {
        conteudoDiv.innerHTML = `
            <div class="logo">
                <div class="logo-nome">TOPGEO</div>
                <div class="logo-sub">ENGENHARIA E SERVIÇOS LTDA</div>
            </div>
            <h2>Olá, ${funcionario.nome}! 👋</h2>
            <p>Nenhum contracheque encontrado.</p>
        `;
    } else {
        conteudoDiv.innerHTML = `
            <div class="logo">
                <div class="logo-nome">TOPGEO</div>
                <div class="logo-sub">ENGENHARIA E SERVIÇOS LTDA</div>
            </div>
            <h2>Olá, ${funcionario.nome}! 👋</h2>
            <p>Seus contracheques:</p>
        `;
        
        for (let cont of meusContraches) {
            conteudoDiv.innerHTML += `
                <div class="item-contracheque" style="margin:15px 0; flex-direction:column; text-align:center;">
                    <strong style="font-size:18px; color:#003399;">📄 ${cont.mes}</strong>
                    <small>Enviado: ${cont.dataEnvio}</small>
                    <div class="botoes-acao">
                        <a href="${cont.link}" target="_blank" class="btn-pdf">👀 Visualizar</a>
                        <button onclick="baixarPDF('${cont.link}', '${cont.mes}')" class="btn-baixar">📥 Baixar</button>
                        <button onclick="compartilharWhatsApp('${cont.link}', '${cont.mes}')" class="btn-whatsapp">📱 WhatsApp</button>
                    </div>
                </div>
            `;
        }
    }
}

function baixarPDF(link, mes) {
    window.open(link, '_blank');
    alert(`✅ PDF de ${mes} aberto. Toque nos 3 pontos ⋮ e escolha "Baixar".`);
}

function compartilharWhatsApp(link, mes) {
    const texto = `📄 TOPGEO - Contracheque ${mes}\n\nLink: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
}

function mostrarRecuperarSenha() {
    document.getElementById('telaLogin').style.display = 'none';
    document.getElementById('telaRecuperar').style.display = 'block';
}

function voltarLoginRecuperar() {
    document.getElementById('telaRecuperar').style.display = 'none';
    document.getElementById('telaLogin').style.display = 'block';
}

function recuperarSenha() {
    const codigo = document.getElementById('codigoRecuperar')?.value;
    if (!codigo) {
        document.getElementById('msgRecuperar').innerHTML = 'Digite seu código!';
        return;
    }
    
    const funcionario = funcionarios.find(f => f.codigo === codigo);
    
    if (!funcionario) {
        document.getElementById('msgRecuperar').innerHTML = 'Código não encontrado!';
        return;
    }
    
    const novaSenha = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    funcionario.senha = novaSenha;
    salvarFuncionarios();
    
    document.getElementById('msgRecuperar').innerHTML = `<div class="sucesso">✅ Sua nova senha: ${novaSenha}</div>`;
}

function mostrarErro(msg) {
    const erroDiv = document.getElementById('msgErro');
    if (erroDiv) erroDiv.innerHTML = msg;
    setTimeout(() => { if(erroDiv) erroDiv.innerHTML = ''; }, 3000);
}

function voltarLogin() {
    document.getElementById('telaLogin').style.display = 'block';
    document.getElementById('telaContracheque').style.display = 'none';
    document.getElementById('codigoLogin').value = '';
    document.getElementById('senhaLogin').value = '';
}

// ========== FUNÇÕES DO ADMIN ==========
function loginAdmin() {
    const senha = document.getElementById('senhaAdmin')?.value;
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
}

function carregarAdmin() {
    carregarSelectFuncionarios();
    listarFuncionariosAdmin();
    listarTodosContraches();
    carregarRelatorio();
}

function carregarSelectFuncionarios() {
    const select = document.getElementById('selFuncionario');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Selecione --</option>';
    funcionarios.forEach(func => {
        select.innerHTML += `<option value="${func.id}">${func.codigo} - ${func.nome}</option>`;
    });
}

function enviarContracheque() {
    const funcionarioId = parseInt(document.getElementById('selFuncionario')?.value);
    const mes = document.getElementById('mesContracheque')?.value;
    const link = document.getElementById('linkPDF')?.value;
    
    if (!funcionarioId || !mes || !link) {
        alert('Preencha todos os campos!');
        return;
    }
    
    const funcionario = funcionarios.find(f => f.id === funcionarioId);
    
    contracheques.push({
        id: Date.now(),
        funcionarioId: funcionarioId,
        funcionarioNome: funcionario.nome,
        mes: mes,
        link: link,
        dataEnvio: new Date().toLocaleString(),
        visualizado: false,
        dataVisualizacao: null
    });
    
    salvarContracheques();
    
    alert(`✅ Contracheque de ${mes} enviado para ${funcionario.nome}!`);
    
    document.getElementById('mesContracheque').value = '';
    document.getElementById('linkPDF').value = '';
    
    listarTodosContraches();
    carregarRelatorio();
}

function listarFuncionariosAdmin() {
    const listaDiv = document.getElementById('listaFuncionarios');
    if (!listaDiv) return;
    
    listaDiv.innerHTML = '';
    funcionarios.forEach(func => {
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
                    <button onclick="editarFuncionario(${func.id})" style="background:#ffc107;">✏️</button>
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
        listaDiv.innerHTML = '<p>Nenhum contracheque enviado.</p>';
        return;
    }
    
    listaDiv.innerHTML = '';
    [...contracheques].reverse().forEach(cont => {
        const status = cont.visualizado ? 
            `<span class="status-visualizado">✓ Visto em ${cont.dataVisualizacao}</span>` : 
            `<span class="status-nao-visualizado">⏳ Não visualizado</span>`;
        
        listaDiv.innerHTML += `
            <div class="item-contracheque">
                <div>
                    <strong>${cont.funcionarioNome}</strong><br>
                    Mês: ${cont.mes}<br>
                    <small>Enviado: ${cont.dataEnvio}</small><br>
                    ${status}
                </div>
                <div>
                    <a href="${cont.link}" target="_blank">📄 Ver PDF</a>
                    <button onclick="excluirContracheque(${cont.id})" style="background:#dc3545;">❌</button>
                </div>
            </div>
        `;
    });
}

function carregarRelatorio() {
    const relatorioDiv = document.getElementById('relatorioVisualizacao');
    if (!relatorioDiv) return;
    
    if (contracheques.length === 0) {
        relatorioDiv.innerHTML = '<p>Nenhum contracheque enviado.</p>';
        return;
    }
    
    const relatorio = {};
    contracheques.forEach(cont => {
        if (!relatorio[cont.funcionarioId]) {
            relatorio[cont.funcionarioId] = {
                nome: cont.funcionarioNome,
                total: 0,
                vistos: 0
            };
        }
        relatorio[cont.funcionarioId].total++;
        if (cont.visualizado) relatorio[cont.funcionarioId].vistos++;
    });
    
    relatorioDiv.innerHTML = '';
    for (let id in relatorio) {
        const r = relatorio[id];
        const naoVistos = r.total - r.vistos;
        relatorioDiv.innerHTML += `
            <div class="card" style="margin-bottom:15px;">
                <h3>${r.nome}</h3>
                <p>📊 Total: ${r.total} | ✅ Vistos: ${r.vistos} | ❌ Não vistos: ${naoVistos}</p>
            </div>
        `;
    }
}

function excluirContracheque(id) {
    if (confirm('Excluir este contracheque?')) {
        contracheques = contracheques.filter(c => c.id !== id);
        salvarContracheques();
        listarTodosContraches();
        carregarRelatorio();
        alert('Removido!');
    }
}

function abrirModalFuncionario() {
    const modal = document.getElementById('modalFuncionario');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('novoCodigo').value = '';
        document.getElementById('novoNome').value = '';
        document.getElementById('novoEmail').value = '';
        document.getElementById('novaSenha').value = '123456';
    }
}

function fecharModal() {
    const modal = document.getElementById('modalFuncionario');
    if (modal) modal.style.display = 'none';
}

function salvarFuncionario() {
    const codigo = document.getElementById('novoCodigo')?.value;
    const nome = document.getElementById('novoNome')?.value;
    const email = document.getElementById('novoEmail')?.value;
    const senha = document.getElementById('novaSenha')?.value;
    
    if (!codigo || !nome) {
        alert('Preencha código e nome!');
        return;
    }
    
    const novoId = Math.max(...funcionarios.map(f => f.id), 0) + 1;
    funcionarios.push({
        id: novoId,
        codigo: codigo.toUpperCase(),
        nome: nome,
        email: email || '',
        senha: senha || '123456'
    });
    
    salvarFuncionarios();
    fecharModal();
    carregarAdmin();
    alert(`✅ ${nome} adicionado!`);
}

function editarFuncionario(id) {
    const func = funcionarios.find(f => f.id === id);
    if (!func) return;
    
    const novaSenha = prompt(`Nova senha para ${func.nome}:`, func.senha);
    if (novaSenha && novaSenha !== func.senha) {
        func.senha = novaSenha;
        salvarFuncionarios();
        listarFuncionariosAdmin();
        alert(`Senha alterada!`);
    }
}

function excluirFuncionario(id) {
    const func = funcionarios.find(f => f.id === id);
    if (!func) return;
    
    if (confirm(`Excluir ${func.nome} e todos seus contracheques?`)) {
        funcionarios = funcionarios.filter(f => f.id !== id);
        contracheques = contracheques.filter(c => c.funcionarioId !== id);
        salvarFuncionarios();
        salvarContracheques();
        carregarAdmin();
        alert(`Removido!`);
    }
}

function mostrarAba(aba) {
    document.querySelectorAll('.aba-conteudo').forEach(el => el.style.display = 'none');
    document.getElementById(`aba${aba.charAt(0).toUpperCase() + aba.slice(1)}`).style.display = 'block';
    
    document.querySelectorAll('.abas button').forEach(btn => btn.classList.remove('aba-ativa'));
    if(event && event.target) event.target.classList.add('aba-ativa');
    
    if (aba === 'relatorios') carregarRelatorio();
}

// INICIAR
carregarDados();
