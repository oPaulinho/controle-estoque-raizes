const formulario = document.getElementById("cadastro-produto-form");

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

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

    const novoProduto = {
        codigo: codigoProduto,
        nome: nomeProduto,
        categoria: categoriaProduto,
        unidade: unidadeProduto,
        estoque: estoqueInicial,
        estoqueMinimo: estoqueMinimo
    };

    produtos.push(novoProduto);

    localStorage.setItem("produtos", JSON.stringify(produtos));

    alert("Produto cadastrado com sucesso!");

    formulario.reset();
});