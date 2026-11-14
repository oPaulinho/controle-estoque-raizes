const formulario = document.getElementById("cadastro-produto-form");

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const codigoProduto = document.getElementById("codigo").value;

    alert("Código do produto: " + codigoProduto);
});