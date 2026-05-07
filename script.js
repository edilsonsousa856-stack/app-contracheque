// ============================================
// TOPGEO - CONTRA CHEQUES
// ============================================

let funcionarios = [];
let contracheques = [];

// ========== CARREGAR DADOS ==========
function carregarDados() {
    const funcSalvos = localStorage.getItem('funcionarios');
    const contSalvos = localStorage.getItem('contracheques');
    
    if (funcSalvos) {
        funcionarios = JSON.parse(funcSalvos);
        console.log("Funcionários carregados:", funcionarios.length);
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
        console.log("Contracheques carregados:", contracheques.length);
    } else {
        contracheques = [];
    }
    
    // Se estiver no admin, atualiza o select
    if (document.getElementById('painelAdmin') && document.getElementById('painelAdmin').style.display !== 'none') {
        atualizarSelectFuncionarios();
    }
}

function salvarFuncionarios() {
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
}

function salvarContracheques() {
    localStorage.setItem('contracheques', JSON.stringify(contracheques));
}

// ========== ATUALIZAR SELECT (DROPDOWN) ==========
function atualizarSelectFuncionarios() {
    const select = document.getElementById('selFuncionario');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Selecione um funcionário --</option>';
    
    for (let func of funcionarios) {
        let option = document.createElement('option');
        option.value = func.id;
        option.textContent = `${func.codigo} - ${func.nome}`;
        select.appendChild(option);
    }
    
    console.log("Select atualizado com", funcionarios.length, "funcionários");
}

// ========== FUNÇÕES DO ADMIN ==========
function loginAdmin() {
    const senha = document.getElementById('senhaAdmin')?.value;
    if (senha === 'admin123') {
        document.getElementById('telaLoginAdmin').style.display = 'none';
        document.getElementById('painelAdmin').style.display = 'block';
        carregarDados();
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
    atualizarSelectFuncionarios();
    listarFuncionariosAdmin();
    listarTodosContraches();
    carregarRelatorio();
}

function listarFuncionariosAdmin() {
    const listaDiv = document.getElementById('listaFuncionarios');
    if (!listaDiv) return;
    
    listaDiv.innerHTML = '';
    for (let func of funcionarios) {
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
    }
}

function listarTodosContraches() {
    const listaDiv = document.getElementById('listaEnviados');
    if (!listaDiv) return;
    
    if (contracheques.length === 0) {
        listaDiv.innerHTML = '<p>Nenhum contracheque enviado.</p>';
        return;
    }
    
    listaDiv.innerHTML = '';
    for (let i = contracheques.length - 1; i >= 0; i--) {
        const cont = contracheques[i];
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
    }
}

function enviarContracheque() {
    const select = document.getElementById('selFuncionario');
    const funcionarioId = parseInt(select?.value);
    const mes = document.getElementById('mesContracheque')?.value;
    const link = document.getElementById('linkPDF')?.value;
    
    console.log("Enviando:", { funcionarioId, mes, link });
    
    if (!funcionarioId || !mes || !link) {
        alert('Preencha todos os campos!');
        return;
    }
    
    const funcionario = funcionarios.find(f => f.id === funcionarioId);
    if (!funcionario) {
        alert('Funcionário não encontrado!');
        return;
    }
    
    const novoId = Date.now();
    contracheques.push({
        id: novoId,
        funcionarioId: funcionario.id,
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

function excluirContracheque(id) {
    if (confirm('Excluir este contracheque?')) {
        contracheques = contracheques.filter(c => c.id !== id);
        salvarContracheques();
        listarTodosContraches();
        carregarRelatorio();
        alert('Removido!');
    }
}

function carregarRelatorio() {
    const relatorioDiv = document.getElementById('relatorioVisualizacao');
    if (!relatorioDiv) return;
    
    if (contracheques.length === 0) {
        relatorioDiv.innerHTML = '<p>Nenhum contracheque enviado.</p>';
        return;
    }
    
    const relatorio = {};
    for (let cont of contracheques) {
        if (!relatorio[cont.funcionarioId]) {
            relatorio[cont.funcionarioId] = {
                nome: cont.funcionarioNome,
                total: 0,
                vistos: 0
            };
        }
        relatorio[cont.funcionarioId].total++;
        if (cont.visualizado) relatorio[cont.funcionarioId].vistos++;
    }
    
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

// ========== FUNCIONÁRIOS (CRUD) ==========
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
        atualizarSelectFuncionarios();
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

// ========== FUNÇÕES DO COLABORADOR ==========
function fazerLogin() {
    const codigo = document.getElementById('codigoLogin')?.value;
    const senha = document.getElementById('senhaLogin')?.value;
    
    if (!codigo || !senha) {
        alert('Digite código e senha!');
        return;
    }
    
    carregarDados();
    
    const funcionario = funcionarios.find(f => f.codigo === codigo && f.senha === senha);
    
    if (!funcionario) {
        alert('Código ou senha incorretos!');
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
            if (!cont.visualizado) {
                cont.visualizado = true;
                cont.dataVisualizacao = new Date().toLocaleString();
                salvarContracheques();
            }
            
            conteudoDiv.innerHTML += `
                <div class="item-contracheque" style="margin:15px 0; flex-direction:column; text-align:center;">
                    <strong style="font-size:18px;">📄 ${cont.mes}</strong>
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
    
    carregarDados();
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

function voltarLogin() {
    document.getElementById('telaLogin').style.display = 'block';
    document.getElementById('telaContracheque').style.display = 'none';
    document.getElementById('codigoLogin').value = '';
    document.getElementById('senhaLogin').value = '';
}

function mostrarAba(aba) {
    document.querySelectorAll('.aba-conteudo').forEach(el => el.style.display = 'none');
    document.getElementById(`aba${aba.charAt(0).toUpperCase() + aba.slice(1)}`).style.display = 'block';
    
    document.querySelectorAll('.abas button').forEach(btn => btn.classList.remove('aba-ativa'));
    if(event && event.target) event.target.classList.add('aba-ativa');
    
    if (aba === 'relatorios') carregarRelatorio();
}

// INICIAR TUDO
carregarDados();

// Se for página de admin, prepara o select
if (document.getElementById('selFuncionario')) {
    atualizarSelectFuncionarios();
}
