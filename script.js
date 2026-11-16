
const formulario = document.getElementById("cadastro-produto-form");

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let movimentacoes = JSON.parse(localStorage.getItem("movimentacoes")) || [];
let transferencias = JSON.parse(localStorage.getItem("transferencias")) || [];

// SALVAR PRODUTOS
function salvarProdutos() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

// CARREGAR PRODUTOS
function carregarProdutos() {
    const tabela = document.getElementById("lista-produtos");

    if (!tabela) return;

    tabela.innerHTML = "";

    produtos.forEach(function (produto) {
        const linha = document.createElement("tr");

        const dados = [
            produto.codigo,
            produto.nome,
            produto.categoria,
            produto.unidade,
            produto.estoque,
            produto.estoqueMinimo
        ];

        dados.forEach(function (valor) {
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

// EDITAR PRODUTO
function editarProduto(codigo) {
    const produto = produtos.find(function (item) {
        return item.codigo === codigo;
    });

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
        minimo.trim() === "" || Number(minimo) < 0 ||
        !Number.isFinite(Number(minimo))) {
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

// EXCLUIR PRODUTO
function excluirProduto(codigo) {
    const confirmar = confirm("Deseja realmente excluir este produto?");

    if (!confirmar) return;

    produtos = produtos.filter(function (produto) {
        return produto.codigo !== codigo;
    });

    salvarProdutos();
    carregarProdutos();

    alert("Produto excluído com sucesso!");
}

// CADASTRAR PRODUTO
if (formulario) {
    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const codigoProduto = document.getElementById("codigo").value.trim();
        const nomeProduto = document.getElementById("nome-produto").value.trim();
        const categoriaProduto = document.getElementById("categoria-produto").value.trim();
        const unidadeProduto = document.getElementById("unidade-produto").value.trim();
        const estoqueInicial = Number(document.getElementById("estoque-inicial").value);
        const estoqueMinimo = Number(document.getElementById("estoque-minimo").value);

        const produtoExistente = produtos.find(function (produto) {
            return produto.codigo === codigoProduto;
        });

        if (produtoExistente) {
            alert("Já existe um produto cadastrado com esse código.");
            return;
        }

        if (estoqueInicial < 0 || estoqueMinimo < 0) {
            alert("As quantidades não podem ser negativas.");
            return;
        }

        const novoProduto = {
            codigo: codigoProduto,
            nome: nomeProduto,
            categoria: categoriaProduto,
            unidade: unidadeProduto,
            estoque: estoqueInicial,
            estoqueMinimo: estoqueMinimo
        };

        produtos.push(novoProduto);

        salvarProdutos();
        carregarProdutos();

        alert("Produto cadastrado com sucesso!");

        formulario.reset();
    });
}

// CARREGAR PRODUTOS NO CAMPO DE ENTRADAS
function carregarProdutosEntrada() {
    const campoProduto = document.getElementById("produto-entrada");

    if (!campoProduto) return;

    produtos.forEach(function (produto) {
        const opcao = document.createElement("option");

        opcao.value = produto.codigo;
        opcao.textContent = produto.nome;

        campoProduto.appendChild(opcao);
    });
}

// CARREGAR PRODUTOS NO CAMPO DE SAÍDAS
function carregarProdutosSaida() {
    const campoProduto = document.getElementById("produto-saida");

    if (!campoProduto) return;

    produtos.forEach(function (produto) {
        const opcao = document.createElement("option");

        opcao.value = produto.codigo;
        opcao.textContent = produto.nome + " (Estoque: " + produto.estoque + ")";

        campoProduto.appendChild(opcao);
    });
}

// REGISTRAR ENTRADA
function registrarEntrada(event) {
    event.preventDefault();

    const codigo = document.getElementById("produto-entrada").value;
    const quantidade = Number(document.getElementById("quantidade-entrada").value);
    const responsavel = document.getElementById("responsavel-entrada").value.trim();
    const documento = document.getElementById("documento-entrada").value.trim();

    const produto = produtos.find(function (item) {
        return item.codigo === codigo;
    });

    if (!produto || quantidade <= 0 || !Number.isFinite(quantidade) ||
        !responsavel || !documento) {
        alert("Verifique os dados da entrada.");
        return;
    }

    produto.estoque += quantidade;

    const movimentacao = {
        tipo: "Entrada",
        codigo: produto.codigo,
        produto: produto.nome,
        quantidade: quantidade,
        responsavel: responsavel,
        documento: documento,
        data: new Date().toLocaleString("pt-BR")
    };

    movimentacoes.push(movimentacao);

    localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));

    salvarProdutos();

    alert("Entrada registrada! Estoque atualizado para " + produto.estoque + ".");

    document.getElementById("form-entrada").reset();
}

//REGISTRAR SAÍDA
function registrarSaida(event) {
    event.preventDefault();

    const codigo = document.getElementById("produto-saida").value;
    const quantidade = Number(document.getElementById("quantidade-saida").value);
    const responsavel = document.getElementById("responsavel-saida").value.trim();
    const documento = document.getElementById("documento-saida").value.trim();

    const produto = produtos.find(function (item) {
        return item.codigo === codigo;
    });

    if (!produto || quantidade <= 0 || !Number.isFinite(quantidade) ||
        !responsavel || !documento) {
        alert("Verifique os dados da saída.");
        return;
    }

    if (quantidade > produto.estoque) {
        alert("Estoque insuficiente! Disponível: " + produto.estoque);
        return;
    }

    produto.estoque -= quantidade;

    const movimentacao = {
        tipo: "Saída",
        codigo: produto.codigo,
        produto: produto.nome,
        quantidade: quantidade,
        responsavel: responsavel,
        documento: documento,
        data: new Date().toLocaleString("pt-BR")
    };

    movimentacoes.push(movimentacao);

    localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));

    salvarProdutos();

    alert("Saída registrada! Estoque atualizado para " + produto.estoque + ".");

    document.getElementById("form-saida").reset();
}

// CONECTAR FORMULÁRIO DE ENTRADA
const formularioEntrada = document.getElementById("form-entrada");

if (formularioEntrada) {
    formularioEntrada.addEventListener("submit", registrarEntrada);
}

// CONECTAR FORMULÁRIO DE SAÍDA
const formularioSaida = document.getElementById("form-saida");

if (formularioSaida) {
    formularioSaida.addEventListener("submit", registrarSaida);
}

// CARREGAR HISTÓRICO DE MOVIMENTAÇÕES
function carregarHistorico() {
    const tabela = document.getElementById("lista-movimentacoes");

    if (!tabela) return;

    tabela.innerHTML = "";

    movimentacoes.forEach(function (movimentacao) {
        const linha = document.createElement("tr");

        const dados = [
            movimentacao.data,
            movimentacao.tipo,
            movimentacao.codigo,
            movimentacao.produto,
            movimentacao.quantidade,
            movimentacao.responsavel,
            movimentacao.documento
        ];

        dados.forEach(function (valor) {
            const coluna = document.createElement("td");
            coluna.textContent = valor;
            linha.appendChild(coluna);
        });

        tabela.appendChild(linha);
    });
}

// INICIALIZAÇÃO DAS PÁGINAS
carregarProdutos();
carregarProdutosEntrada();
carregarHistorico();
carregarProdutosSaida();


// CARREGAR PRODUTOS NO CAMPO DE TRANSFERÊNCIAS
function carregarProdutosTransferencia() {
    const campoProduto = document.getElementById("produto-transferencia");

    if (!campoProduto) return;

    campoProduto.innerHTML = '<option value="">Selecione um produto</option>';

    produtos.forEach(function (produto) {
        const opcao = document.createElement("option");

        opcao.value = produto.codigo;
        opcao.textContent = produto.nome + " (Estoque: " + produto.estoque + ")";

        campoProduto.appendChild(opcao);
    });
}

// INICIALIZAR CAMPO DE TRANSFERÊNCIAS
carregarProdutosTransferencia();


// SALVAR TRANSFERÊNCIAS
function salvarTransferencias() {
    localStorage.setItem("transferencias", JSON.stringify(transferencias));
}

// CARREGAR TRANSFERÊNCIAS NA TABELA
function carregarTransferencias() {
    const tabela = document.getElementById("lista-transferencias");

    if (!tabela) return;

    tabela.innerHTML = "";

    transferencias.forEach(function (transferencia) {
        const linha = document.createElement("tr");

        const dados = [
            transferencia.produto,
            transferencia.origem,
            transferencia.destino,
            transferencia.quantidadeEnviada,
            transferencia.quantidadeRecebida ?? "-",
            transferencia.situacao
        ];

        dados.forEach(function (valor) {
            const coluna = document.createElement("td");
            coluna.textContent = valor;
            linha.appendChild(coluna);
        });

        const colunaAcoes = document.createElement("td");

        if (transferencia.situacao === "Em trânsito") {
            const botaoReceber = document.createElement("button");
            botaoReceber.textContent = "Registrar recebimento";

            botaoReceber.addEventListener("click", function () {
                registrarRecebimento(transferencia.id);
            });

            colunaAcoes.appendChild(botaoReceber);
        }

        linha.appendChild(colunaAcoes);
        tabela.appendChild(linha);
    });
}


// REGISTRAR ENVIO DE TRANSFERÊNCIA
function registrarTransferencia(event) {
    event.preventDefault();

    const origem = document.getElementById("filial-origem").value.trim();
    const destino = document.getElementById("filial-destino").value.trim();
    const codigo = document.getElementById("produto-transferencia").value;
    const quantidade = Number(document.getElementById("quantidade-transferencia").value);
    const responsavel = document.getElementById("responsavel-transferencia").value.trim();
    const documento = document.getElementById("documento-transferencia").value.trim();

    const produto = produtos.find(function (item) {
        return item.codigo === codigo;
    });

    if (!produto || !origem || !destino || !responsavel || !documento ||
        !Number.isFinite(quantidade) || quantidade <= 0) {
        alert("Verifique os dados da transferência.");
        return;
    }

    if (origem.toLowerCase() === destino.toLowerCase()) {
        alert("A filial de origem e destino não podem ser iguais.");
        return;
    }

    if (quantidade > produto.estoque) {
        alert("Estoque insuficiente! Disponível: " + produto.estoque);
        return;
    }

    produto.estoque -= quantidade;

    const novaTransferencia = {
        id: Date.now(),
        codigo: produto.codigo,
        produto: produto.nome,
        origem: origem,
        destino: destino,
        quantidadeEnviada: quantidade,
        quantidadeRecebida: null,
        responsavel: responsavel,
        documento: documento,
        situacao: "Em trânsito",
        data: new Date().toLocaleString("pt-BR")
    };

    transferencias.push(novaTransferencia);

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
    localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));

    carregarProdutosTransferencia();
    carregarTransferencias();

    alert("Transferência enviada! Quantidade retirada do estoque da filial de origem.");

    document.getElementById("form-transferencia").reset();
    document.getElementById("filial-origem").value = "Diadema";
}

// REGISTRAR RECEBIMENTO DA TRANSFERÊNCIA
function registrarRecebimento(id) {
    const transferencia = transferencias.find(function (item) {
        return item.id === id;
    });

    if (!transferencia || transferencia.situacao !== "Em trânsito") {
        alert("Transferência não encontrada ou já recebida.");
        return;
    }

    const quantidade = prompt(
        "Quantidade efetivamente recebida de " +
        transferencia.produto +
        " (enviada: " + transferencia.quantidadeEnviada + "):"
    );

    if (quantidade === null) return;

    const recebida = Number(quantidade);

    if (!Number.isInteger(recebida) || recebida <= 0 ||
        recebida > transferencia.quantidadeEnviada) {
        alert("Informe uma quantidade válida, maior que zero e não superior à enviada.");
        return;
    }

    transferencia.quantidadeRecebida = recebida;

    if (recebida === transferencia.quantidadeEnviada) {
        transferencia.situacao = "Recebida";
    } else {
        transferencia.situacao = "Divergência";
        transferencia.divergencia =
            transferencia.quantidadeEnviada - recebida;
    }

    transferencia.dataRecebimento = new Date().toLocaleString("pt-BR");

    movimentacoes.push({
        tipo: "Transferência recebida",
        codigo: transferencia.codigo,
        produto: transferencia.produto,
        quantidade: recebida,
        responsavel: transferencia.destino,
        documento: transferencia.documento,
        data: new Date().toLocaleString("pt-BR")
    });

    localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));

    salvarTransferencias();
    carregarTransferencias();

    alert(
        recebida === transferencia.quantidadeEnviada
            ? "Recebimento registrado com sucesso!"
            : "Divergência identificada! Faltaram " +
            transferencia.divergencia + " unidades."
    );
}
// CONECTAR FORMULÁRIO DE TRANSFERÊNCIA
const formularioTransferencia = document.getElementById("form-transferencia");

if (formularioTransferencia) {
    formularioTransferencia.addEventListener("submit", registrarTransferencia);
}

// INICIALIZAR TRANSFERÊNCIAS
carregarTransferencias();