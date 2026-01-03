let movimentacoes = JSON.parse(localStorage.getItem('minhasFinancas')) || [];
let meuGrafico = null;

// Configurações iniciais
document.getElementById('data-movimentacao').valueAsDate = new Date();
atualizarTela();

function adicionarMovimentacao() {
    const tipo = document.getElementById('tipo').value;
    const categoria = document.getElementById('categoria').value;
    const data = document.getElementById('data-movimentacao').value;
    const desc = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);

    if (desc && valor > 0 && data) {
        const novaMov = { id: Date.now(), tipo, categoria, data, desc, valor };
        movimentacoes.push(novaMov);
        salvarDados();
        limparCampos();
        atualizarTela();
    } else {
        alert("Preencha todos os campos!");
    }
}

function salvarDados() {
    localStorage.setItem('minhasFinancas', JSON.stringify(movimentacoes));
}

function limparCampos() {
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';
}

function atualizarTela() {
    const listaHTML = document.getElementById('lista-gastos');
    listaHTML.innerHTML = '';
    
    let entradas = 0;
    let saidas = 0;
    const totaisPorCategoria = {};

    movimentacoes.forEach(mov => {
        if (mov.tipo === 'entrada') {
            entradas += mov.valor;
        } else {
            saidas += mov.valor;
            totaisPorCategoria[mov.categoria] = (totaisPorCategoria[mov.categoria] || 0) + mov.valor;
        }

        const dataBr = mov.data.split('-').reverse().join('/');
        const item = document.createElement('li');
        item.innerHTML = `
            <div>
                <small style="display:block; color:#888">${dataBr} - ${mov.categoria}</small>
                <span>${mov.desc}</span>
            </div>
            <strong class="${mov.tipo === 'entrada' ? 'positivo' : 'negativo'}">
                ${mov.tipo === 'entrada' ? '+' : '-'} R$ ${mov.valor.toFixed(2)}
            </strong>
            <button onclick="removerMov(${mov.id})" style="color:red; border:none; background:none; cursor:pointer; margin-left:10px">X</button>
        `;
        listaHTML.appendChild(item);
    });

    const saldo = entradas - saidas;
    document.getElementById('total-entradas').innerText = `R$ ${entradas.toFixed(2)}`;
    document.getElementById('total-saidas').innerText = `R$ ${saidas.toFixed(2)}`;
    document.getElementById('saldo-total').innerText = `R$ ${saldo.toFixed(2)}`;
    document.getElementById('saldo-total').className = saldo >= 0 ? 'positivo' : 'negativo';

    renderizarGrafico(totaisPorCategoria);
}

function renderizarGrafico(dadosCores) {
    const ctx = document.getElementById('meuGrafico').getContext('2d');
    if (meuGrafico) meuGrafico.destroy();
    if (Object.keys(dadosCores).length === 0) return;

    meuGrafico = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(dadosCores),
            datasets: [{
                data: Object.values(dadosCores),
                backgroundColor: ['#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c']
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}

function removerMov(id) {
    movimentacoes = movimentacoes.filter(m => m.id !== id);
    salvarDados();
    atualizarTela();
}

function limparTudo() {
    if (confirm("Apagar todos os dados?")) {
        movimentacoes = [];
        salvarDados();
        atualizarTela();
    }
}

function exportarPDF() {
    const elemento = document.querySelector(".container");
    html2pdf().from(elemento).save('financeiro.pdf');
}