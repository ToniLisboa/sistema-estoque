let produtos = []

function cadastrarProduto() {
    const nomeProduto = document.getElementById("nomeProduto").value
    const codigoProduto = document.getElementById("codigoProduto").value
    const quantidadeProduto = Number(document.getElementById("quantidadeProduto").value)
    const estoqueMinimo = Number(document.getElementById("estoqueMinimo").value)
    const estoqueEmergencia = Number(document.getElementById("estoqueEmergencia").value)

    const produto = {
        nome: nomeProduto,
        codigo: codigoProduto,
        quantidade: quantidadeProduto,
        estoqueMinimo: estoqueMinimo,
        estoqueEmergencia: estoqueEmergencia
    }

    produtos.push(produto)
    mostrarProdutos()
}

function mostrarProdutos() {
    const tabela = document.getElementById("listaProdutos")
    tabela.innerHTML = ""

    produtos.forEach(produto => {
        let status = "Normal"

        if (produto.quantidade <= produto.estoqueEmergencia) {
            status = "Estoque Critico"
        } else if (produto.quantidade <= produto.estoqueMinimo) {
            status = "Estoque Baixo"
        }

        tabela.innerHTML += `
<tr>
<td>${produto.nome}</td>
<td>${produto.codigo}</td>
<td>${produto.quantidade}</td>
<td>${status}</td>
</tr>
`
    })
}
