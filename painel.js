
(function () {
const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
const movimentacoes = JSON.parse(localStorage.getItem("movimentacoes")) || [];
const transferencias = JSON.parse(localStorage.getItem("transferencias")) || [];

// TOTAL DE PRODUTOS
document.getElementById("total-itens").textContent =
    "Total de produtos: " + produtos.length;

// PRODUTOS QUE PRECISAM DE ATENÇÃO
const produtosVerificar = produtos.filter(produto =>
    Number(produto.estoque) <= Number(produto.estoqueMinimo)
);

document.getElementById("total-verificar").textContent =
    "Produtos para verificar: " + produtosVerificar.length;

// TRANSFERÊNCIAS PENDENTES
const transferenciasPendentes = transferencias.filter(transferencia =>
    transferencia.situacao === "Divergência pendente" ||
    transferencia.situacao === "Aguardando aprovação"
);

document.getElementById("total-pendentes").textContent =
    "Transferências pendentes: " + transferenciasPendentes.length;

// ÚLTIMAS MOVIMENTAÇÕES
const tabela = document.getElementById("ultimas-movimentacoes");

if (tabela) {
    tabela.innerHTML = "";

    const ultimas = [...movimentacoes].reverse().slice(0, 5);

    if (ultimas.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5">Nenhuma movimentação registrada.</td>
            </tr>
        `;
    } else {
        ultimas.forEach(movimentacao => {
            const linha = document.createElement("tr");

            [
                movimentacao.data,
                movimentacao.produto,
                movimentacao.tipo,
                movimentacao.quantidade,
                movimentacao.responsavel
            ].forEach(valor => {
                const coluna = document.createElement("td");
                coluna.textContent = valor ?? "-";
                linha.appendChild(coluna);
            });

            tabela.appendChild(linha);
        });
    }
}
})();
