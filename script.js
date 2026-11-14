
const formulario = document.getElementById("cadastro-produto-form");

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

function salvarProdutos() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

function carregarProdutos() {
    const tabela = document.getElementById("lista-produtos");

    if (!tabela) return;

    tabela.innerHTML = "";

    produtos.forEach(function(produto) {
        const linha = document.createElement("tr");

        const dados = [
            produto.codigo,
            produto.nome,
            produto.categoria,
            produto.unidade,
            produto.estoque,
            produto.estoqueMinimo
        ];

        dados.forEach(function(valor) {
            const coluna = document.createElement("td");
            coluna.textContent = valor;
            linha.appendChild(coluna);
        });

        const colunaAcoes = document.createElement("td");

        const botaoEditar = document.createElement("button");
        botaoEditar.textContent = "Editar";
        botaoEditar.addEventListener("click", function() {
            editarProduto(produto.codigo);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.addEventListener("click", function() {
            excluirProduto(produto.codigo);
        });

        colunaAcoes.appendChild(botaoEditar);
        colunaAcoes.appendChild(botaoExcluir);
        linha.appendChild(colunaAcoes);

        tabela.appendChild(linha);
    });
}

function editarProduto(codigo) {
    const produto = produtos.find(function(item) {
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

function excluirProduto(codigo) {
    const confirmar = confirm("Deseja realmente excluir este produto?");

    if (!confirmar) return;

    produtos = produtos.filter(function(produto) {
        return produto.codigo !== codigo;
    });

    salvarProdutos();
    carregarProdutos();

    alert("Produto excluído com sucesso!");
}

if (formulario) {
    formulario.addEventListener("submit", function(event) {
        event.preventDefault();

        const codigoProduto = document.getElementById("codigo").value.trim();
        const nomeProduto = document.getElementById("nome-produto").value.trim();
        const categoriaProduto = document.getElementById("categoria-produto").value.trim();
        const unidadeProduto = document.getElementById("unidade-produto").value.trim();
        const estoqueInicial = Number(document.getElementById("estoque-inicial").value);
        const estoqueMinimo = Number(document.getElementById("estoque-minimo").value);

        const produtoExistente = produtos.find(function(produto) {
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

carregarProdutos();
