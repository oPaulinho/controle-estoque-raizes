
const formulario = document.getElementById("cadastro-produto-form");

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let movimentacoes = JSON.parse(localStorage.getItem("movimentacoes")) || [];
let transferencias = JSON.parse(localStorage.getItem("transferencias")) || [];

// ESTOQUE POR FILIAL

function normalizarFilial(filial) {
    const nome = filial.trim();
    return nome.toLowerCase() === "diadema" ? "Diadema" : nome;
}

function obterEstoqueFilial(produto, filial) {
    if (!produto.estoquesPorFilial) {
        produto.estoquesPorFilial = {
            Diadema: Number(produto.estoque) || 0
        };
    }

    const nome = normalizarFilial(filial);
    const chave = Object.keys(produto.estoquesPorFilial).find(
        item => item.toLowerCase() === nome.toLowerCase()
    );

    return chave ? Number(produto.estoquesPorFilial[chave]) || 0 : 0;
}

function atualizarEstoqueFilial(produto, filial, quantidade) {
    if (!produto.estoquesPorFilial) {
        produto.estoquesPorFilial = {};
    }

    const nome = normalizarFilial(filial);
    const chave = Object.keys(produto.estoquesPorFilial).find(
        item => item.toLowerCase() === nome.toLowerCase()
    ) || nome;

    produto.estoquesPorFilial[chave] = quantidade;

    if (chave.toLowerCase() === "diadema") {
        produto.estoque = quantidade;
    }
}

// MIGRAR ESTOQUES ANTIGOS

produtos.forEach(function (produto) {
    if (!produto.estoquesPorFilial) {
        produto.estoquesPorFilial = {};
    }

    if (produto.estoquesPorFilial.Diadema === undefined) {
        produto.estoquesPorFilial.Diadema = Number(produto.estoque) || 0;
    }

    produto.estoque = Number(produto.estoquesPorFilial.Diadema) || 0;
});

// SALVAMENTO

function salvarProdutos() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

function salvarTransferencias() {
    localStorage.setItem("transferencias", JSON.stringify(transferencias));
}

function salvarMovimentacoes() {
    localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));
}

// CADASTRO E LISTAGEM DE PRODUTOS

function carregarProdutos() {
    const tabela = document.getElementById("lista-produtos");
    if (!tabela) return;

    tabela.innerHTML = "";

    produtos.forEach(function (produto) {
        const linha = document.createElement("tr");

        [
            produto.codigo,
            produto.nome,
            produto.categoria,
            produto.unidade,
            produto.estoque,
            produto.estoqueMinimo
        ].forEach(function (valor) {
            const coluna = document.createElement("td");
            coluna.textContent = valor;
            linha.appendChild(coluna);
        });

        let situacao = "Normal";

        if (produto.estoque === 0) {
            situacao = "Sem estoque";
        } else if (produto.estoque <= produto.estoqueMinimo) {
            situacao = "Estoque baixo";
        }

        const colunaSituacao = document.createElement("td");
        colunaSituacao.textContent = situacao;
        linha.appendChild(colunaSituacao);

        const colunaAcoes = document.createElement("td");

        const botaoEditar = document.createElement("button");
        botaoEditar.textContent = "Editar";
        botaoEditar.addEventListener("click", function () {
            editarProduto(produto.codigo);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.addEventListener("click", function () {
            excluirProduto(produto.codigo);
        });

        colunaAcoes.appendChild(botaoEditar);
        colunaAcoes.appendChild(botaoExcluir);
        linha.appendChild(colunaAcoes);

        tabela.appendChild(linha);
    });
}

function editarProduto(codigo) {
    const produto = produtos.find(item => item.codigo === codigo);
    if (!produto) return;

    const nome = prompt("Nome do produto:", produto.nome);
    if (nome === null) return;

    const categoria = prompt("Categoria:", produto.categoria);
    if (categoria === null) return;

    const unidade = prompt("Unidade:", produto.unidade);
    if (unidade === null) return;

    const minimo = prompt("Estoque mínimo:", produto.estoqueMinimo);
    if (minimo === null) return;

    if (!nome.trim() || !categoria.trim() || !unidade.trim() ||
        minimo.trim() === "" || !Number.isFinite(Number(minimo)) ||
        Number(minimo) < 0) {
        alert("Preencha os dados corretamente.");
        return;
    }

    produto.nome = nome.trim();
    produto.categoria = categoria.trim();
    produto.unidade = unidade.trim();
    produto.estoqueMinimo = Number(minimo);

    salvarProdutos();
    carregarProdutos();
    alert("Produto atualizado com sucesso!");
}

function excluirProduto(codigo) {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    produtos = produtos.filter(item => item.codigo !== codigo);

    salvarProdutos();
    carregarProdutos();

    alert("Produto excluído com sucesso!");
}

if (formulario) {
    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const codigo = document.getElementById("codigo").value.trim();
        const nome = document.getElementById("nome-produto").value.trim();
        const categoria = document.getElementById("categoria-produto").value.trim();
        const unidade = document.getElementById("unidade-produto").value.trim();
        const estoque = Number(document.getElementById("estoque-inicial").value);
        const minimo = Number(document.getElementById("estoque-minimo").value);

        if (produtos.some(item => item.codigo === codigo)) {
            alert("Já existe um produto cadastrado com esse código.");
            return;
        }

        if (!codigo || !nome || !categoria || !unidade ||
            !Number.isFinite(estoque) || estoque < 0 ||
            !Number.isFinite(minimo) || minimo < 0) {
            alert("Verifique os dados do produto.");
            return;
        }

        produtos.push({
            codigo: codigo,
            nome: nome,
            categoria: categoria,
            unidade: unidade,
            estoque: estoque,
            estoqueMinimo: minimo,
            estoquesPorFilial: {
                Diadema: estoque
            }
        });

        salvarProdutos();
        carregarProdutos();
        formulario.reset();

        alert("Produto cadastrado com sucesso!");
    });
}

// CAMPOS DE PRODUTOS

function carregarProdutosEntrada() {
    const campo = document.getElementById("produto-entrada");
    if (!campo) return;

    campo.innerHTML = '<option value="">Selecione um produto</option>';

    produtos.forEach(function (produto) {
        const opcao = document.createElement("option");
        opcao.value = produto.codigo;
        opcao.textContent = produto.nome;
        campo.appendChild(opcao);
    });
}

function carregarProdutosSaida() {
    const campo = document.getElementById("produto-saida");
    if (!campo) return;

    campo.innerHTML = '<option value="">Selecione um produto</option>';

    produtos.forEach(function (produto) {
        const opcao = document.createElement("option");
        opcao.value = produto.codigo;
        opcao.textContent = produto.nome + " (Estoque: " + produto.estoque + ")";
        campo.appendChild(opcao);
    });
}

// ENTRADAS

function registrarEntrada(event) {
    event.preventDefault();

    const codigo = document.getElementById("produto-entrada").value;
    const quantidade = Number(document.getElementById("quantidade-entrada").value);
    const responsavel = document.getElementById("responsavel-entrada").value.trim();
    const documento = document.getElementById("documento-entrada").value.trim();

    const produto = produtos.find(item => item.codigo === codigo);

    if (!produto || !Number.isFinite(quantidade) ||
        quantidade <= 0 || !responsavel || !documento) {
        alert("Verifique os dados da entrada.");
        return;
    }

    produto.estoque += quantidade;
    atualizarEstoqueFilial(produto, "Diadema", produto.estoque);

    movimentacoes.push({
        tipo: "Entrada",
        codigo: produto.codigo,
        produto: produto.nome,
        quantidade: quantidade,
        responsavel: responsavel,
        documento: documento,
        data: new Date().toLocaleString("pt-BR")
    });

    salvarProdutos();
    salvarMovimentacoes();
    carregarProdutos();
    carregarProdutosEntrada();
    carregarProdutosSaida();

    document.getElementById("form-entrada").reset();
    alert("Entrada registrada! Estoque atualizado para " + produto.estoque + ".");
}

// SAÍDAS

function registrarSaida(event) {
    event.preventDefault();

    const codigo = document.getElementById("produto-saida").value;
    const quantidade = Number(document.getElementById("quantidade-saida").value);
    const responsavel = document.getElementById("responsavel-saida").value.trim();
    const documento = document.getElementById("documento-saida").value.trim();

    const produto = produtos.find(item => item.codigo === codigo);

    if (!produto || !Number.isFinite(quantidade) ||
        quantidade <= 0 || !responsavel || !documento) {
        alert("Verifique os dados da saída.");
        return;
    }

    if (quantidade > produto.estoque) {
        alert("Estoque insuficiente! Disponível: " + produto.estoque);
        return;
    }

    produto.estoque -= quantidade;
    atualizarEstoqueFilial(produto, "Diadema", produto.estoque);

    movimentacoes.push({
        tipo: "Saída",
        codigo: produto.codigo,
        produto: produto.nome,
        quantidade: quantidade,
        responsavel: responsavel,
        documento: documento,
        data: new Date().toLocaleString("pt-BR")
    });

    salvarProdutos();
    salvarMovimentacoes();
    carregarProdutos();
    carregarProdutosSaida();

    document.getElementById("form-saida").reset();
    alert("Saída registrada! Estoque atualizado para " + produto.estoque + ".");
}

// CONECTAR FORMULÁRIOS

const formularioEntrada = document.getElementById("form-entrada");
if (formularioEntrada) {
    formularioEntrada.addEventListener("submit", registrarEntrada);
}

const formularioSaida = document.getElementById("form-saida");
if (formularioSaida) {
    formularioSaida.addEventListener("submit", registrarSaida);
}

// HISTÓRICO

function carregarHistorico() {
    const tabela = document.getElementById("lista-movimentacoes");
    if (!tabela) return;

    tabela.innerHTML = "";

    movimentacoes.forEach(function (movimentacao) {
        const linha = document.createElement("tr");

        [
            movimentacao.data,
            movimentacao.tipo,
            movimentacao.codigo,
            movimentacao.produto,
            movimentacao.quantidade,
            movimentacao.responsavel,
            movimentacao.documento
        ].forEach(function (valor) {
            const coluna = document.createElement("td");
            coluna.textContent = valor;
            linha.appendChild(coluna);
        });

        tabela.appendChild(linha);
    });
}

// TRANSFERÊNCIAS

function carregarProdutosTransferencia() {
    const campo = document.getElementById("produto-transferencia");
    const campoOrigem = document.getElementById("filial-origem");

    if (!campo || !campoOrigem) return;

    const origem = campoOrigem.value.trim();
    campo.innerHTML = '<option value="">Selecione um produto</option>';

    produtos.forEach(function (produto) {
        const saldo = obterEstoqueFilial(produto, origem);
        const opcao = document.createElement("option");

        opcao.value = produto.codigo;
        opcao.textContent = produto.nome + " (Estoque: " + saldo + ")";

        campo.appendChild(opcao);
    });
}

function carregarTransferencias() {
    const tabela = document.getElementById("lista-transferencias");
    if (!tabela) return;

    tabela.innerHTML = "";

    transferencias.forEach(function (transferencia) {
        const linha = document.createElement("tr");

        [
            transferencia.produto,
            transferencia.origem,
            transferencia.destino,
            transferencia.quantidadeEnviada,
            transferencia.quantidadeRecebida ?? "-",
            transferencia.responsavelRecebimento || "-",
            transferencia.divergencia || 0,
            transferencia.situacao
        ].forEach(function (valor) {
            const coluna = document.createElement("td");
            coluna.textContent = valor;
            linha.appendChild(coluna);
        });

        const colunaAcoes = document.createElement("td");

        if (transferencia.situacao === "Em trânsito") {
            const botao = document.createElement("button");
            botao.textContent = "Registrar recebimento";
            botao.addEventListener("click", function () {
                registrarRecebimento(transferencia.id);
            });
            colunaAcoes.appendChild(botao);
        }

        if (transferencia.situacao === "Divergência pendente") {
            const botao = document.createElement("button");
            botao.textContent = "Justificar divergência";
            botao.addEventListener("click", function () {
                justificarDivergencia(transferencia.id);
            });
            colunaAcoes.appendChild(botao);
        }

        if (transferencia.situacao === "Aguardando aprovação") {
            const botaoAprovar = document.createElement("button");
            botaoAprovar.textContent = "Aprovar";
            botaoAprovar.addEventListener("click", function () {
                decidirDivergencia(transferencia.id, "Aprovada");
            });

            const botaoReprovar = document.createElement("button");
            botaoReprovar.textContent = "Reprovar";
            botaoReprovar.addEventListener("click", function () {
                decidirDivergencia(transferencia.id, "Reprovada");
            });

            colunaAcoes.appendChild(botaoAprovar);
            colunaAcoes.appendChild(botaoReprovar);
        }

        linha.appendChild(colunaAcoes);
        tabela.appendChild(linha);
    });
}

function registrarTransferencia(event) {
    event.preventDefault();

    const origem = normalizarFilial(document.getElementById("filial-origem").value);
    const destino = normalizarFilial(document.getElementById("filial-destino").value);
    const codigo = document.getElementById("produto-transferencia").value;
    const quantidade = Number(document.getElementById("quantidade-transferencia").value);
    const responsavel = document.getElementById("responsavel-transferencia").value.trim();
    const documento = document.getElementById("documento-transferencia").value.trim();

    const produto = produtos.find(item => item.codigo === codigo);

    if (!produto || !origem || !destino || !responsavel || !documento ||
        !Number.isInteger(quantidade) || quantidade <= 0) {
        alert("Verifique os dados da transferência.");
        return;
    }

    if (origem.toLowerCase() === destino.toLowerCase()) {
        alert("A filial de origem e destino não podem ser iguais.");
        return;
    }

    const saldoOrigem = obterEstoqueFilial(produto, origem);

    if (quantidade > saldoOrigem) {
        alert("Estoque insuficiente na filial " + origem +
            ". Disponível: " + saldoOrigem);
        return;
    }

    atualizarEstoqueFilial(produto, origem, saldoOrigem - quantidade);

    transferencias.push({
        id: Date.now(),
        codigo: produto.codigo,
        produto: produto.nome,
        origem: origem,
        destino: destino,
        quantidadeEnviada: quantidade,
        quantidadeRecebida: null,
        responsavelEnvio: responsavel,
        responsavelRecebimento: "",
        documento: documento,
        situacao: "Em trânsito",
        divergencia: 0,
        data: new Date().toLocaleString("pt-BR")
    });

    movimentacoes.push({
        tipo: "Transferência enviada",
        codigo: produto.codigo,
        produto: produto.nome,
        quantidade: quantidade,
        responsavel: responsavel,
        documento: documento,
        data: new Date().toLocaleString("pt-BR")
    });

    salvarProdutos();
    salvarTransferencias();
    salvarMovimentacoes();
    carregarProdutos();
    carregarProdutosTransferencia();
    carregarTransferencias();

    document.getElementById("form-transferencia").reset();
    document.getElementById("filial-origem").value = "Diadema";
    carregarProdutosTransferencia();

    alert("Transferência enviada e estoque da origem atualizado!");
}

function registrarRecebimento(id) {
    const transferencia = transferencias.find(item => item.id === id);

    if (!transferencia || transferencia.situacao !== "Em trânsito") {
        alert("Transferência não encontrada ou já recebida.");
        return;
    }

    const responsavel = prompt("Nome de quem está recebendo:");

    if (responsavel === null || !responsavel.trim()) {
        alert("Informe o responsável pelo recebimento.");
        return;
    }

    const quantidade = prompt(
        "Quantidade efetivamente recebida (enviada: " +
        transferencia.quantidadeEnviada + "):"
    );

    if (quantidade === null) return;

    const recebida = Number(quantidade);

    if (!Number.isInteger(recebida) || recebida <= 0 ||
        recebida > transferencia.quantidadeEnviada) {
        alert("Informe uma quantidade válida.");
        return;
    }

    const produto = produtos.find(item => item.codigo === transferencia.codigo);

    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }

    const saldoDestino = obterEstoqueFilial(produto, transferencia.destino);

    atualizarEstoqueFilial(produto, transferencia.destino, saldoDestino + recebida);

    transferencia.quantidadeRecebida = recebida;
    transferencia.responsavelRecebimento = responsavel.trim();
    transferencia.dataRecebimento = new Date().toLocaleString("pt-BR");

    if (recebida === transferencia.quantidadeEnviada) {
        transferencia.situacao = "Recebida";
    } else {
        transferencia.situacao = "Divergência pendente";
        transferencia.divergencia = transferencia.quantidadeEnviada - recebida;
    }

    movimentacoes.push({
        tipo: "Transferência recebida",
        codigo: produto.codigo,
        produto: produto.nome,
        quantidade: recebida,
        responsavel: responsavel.trim(),
        documento: transferencia.documento,
        data: new Date().toLocaleString("pt-BR")
    });

    salvarProdutos();
    salvarTransferencias();
    salvarMovimentacoes();
    carregarProdutos();
    carregarTransferencias();

    alert(transferencia.situacao === "Recebida"
        ? "Recebimento registrado!"
        : "Divergência identificada: faltaram " + transferencia.divergencia + " unidades.");
}

function justificarDivergencia(id) {
    const transferencia = transferencias.find(item => item.id === id);

    if (!transferencia || transferencia.situacao !== "Divergência pendente") {
        alert("Não existe divergência pendente.");
        return;
    }

    const responsavel = prompt("Nome do responsável pela justificativa:");
    if (responsavel === null || !responsavel.trim()) return;

    const justificativa = prompt("Informe o motivo da divergência:");
    if (justificativa === null || !justificativa.trim()) return;

    transferencia.responsavelJustificativa = responsavel.trim();
    transferencia.justificativa = justificativa.trim();
    transferencia.dataJustificativa = new Date().toLocaleString("pt-BR");
    transferencia.situacao = "Aguardando aprovação";

    movimentacoes.push({
        tipo: "Justificativa de divergência",
        codigo: transferencia.codigo,
        produto: transferencia.produto,
        quantidade: transferencia.divergencia,
        responsavel: responsavel.trim(),
        documento: transferencia.documento,
        data: transferencia.dataJustificativa
    });

    salvarTransferencias();
    salvarMovimentacoes();
    carregarTransferencias();
    carregarHistorico();

    alert("Justificativa registrada. Aguardando aprovação da gestão.");
}

// APROVAR OU REPROVAR DIVERGÊNCIA

function decidirDivergencia(id, decisao) {
    const transferencia = transferencias.find(item => item.id === id);

    if (!transferencia || transferencia.situacao !== "Aguardando aprovação") {
        alert("Não existe divergência aguardando aprovação.");
        return;
    }

    const responsavel = prompt("Nome do responsável pela decisão:");

    if (responsavel === null || !responsavel.trim()) {
        alert("Informe o responsável pela decisão.");
        return;
    }

    if (!confirm("Confirma a decisão: " + decisao + "?")) return;

    transferencia.situacao = decisao;
    transferencia.responsavelAprovacao = responsavel.trim();
    transferencia.dataAprovacao = new Date().toLocaleString("pt-BR");

    movimentacoes.push({
        tipo: "Divergência " + decisao.toLowerCase(),
        codigo: transferencia.codigo,
        produto: transferencia.produto,
        quantidade: transferencia.divergencia,
        responsavel: responsavel.trim(),
        documento: transferencia.documento,
        data: transferencia.dataAprovacao
    });

    salvarTransferencias();
    salvarMovimentacoes();
    carregarTransferencias();
    carregarHistorico();

    alert("Decisão registrada com sucesso!");
}

// CONECTAR TRANSFERÊNCIAS

const formularioTransferencia = document.getElementById("form-transferencia");

if (formularioTransferencia) {
    formularioTransferencia.addEventListener("submit", registrarTransferencia);
}

const campoOrigemTransferencia = document.getElementById("filial-origem");

if (campoOrigemTransferencia) {
    campoOrigemTransferencia.addEventListener("input", carregarProdutosTransferencia);
}

// INICIALIZAÇÃO

salvarProdutos();
carregarProdutos();
carregarProdutosEntrada();
carregarProdutosSaida();
carregarHistorico();
carregarProdutosTransferencia();
carregarTransferencias();
