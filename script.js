const formulario = document.getElementById("cadastro-produto-form");

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const codigoProduto = document.getElementById("codigo").value;

    alert("Código do produto: " + codigoProduto);
});