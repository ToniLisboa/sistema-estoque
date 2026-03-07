let produtos = []

function adicionarProduto(){

const codigo = document.getElementById("codigo").value.trim()
const nome = document.getElementById("nome").value
const quantidade = parseInt(document.getElementById("quantidade").value)
const minimo = parseInt(document.getElementById("minimo").value)
const emergencia = parseInt(document.getElementById("emergencia").value)

if(codigo === "" || nome === "" || isNaN(quantidade)){
alert("Preencha os campos corretamente")
return
}

const produto = {
codigo,
nome,
quantidade,
minimo,
emergencia
}

produtos.push(produto)

limparCampos()

mostrarProdutos()

}

function limparCampos(){

document.getElementById("codigo").value = ""
document.getElementById("nome").value = ""
document.getElementById("quantidade").value = ""
document.getElementById("minimo").value = ""
document.getElementById("emergencia").value = ""

}

function mostrarProdutos(){

const tabela = document.getElementById("listaProdutos")

tabela.innerHTML = ""

produtos.forEach((produto, index)=>{

let classe = ""

if(produto.quantidade <= produto.emergencia){
classe = "emergencia"
}

else if(produto.quantidade <= produto.minimo){
classe = "alerta"
}

tabela.innerHTML += `
<tr class="${classe}">
<td>${produto.codigo}</td>
<td>${produto.nome}</td>
<td>${produto.quantidade}</td>
<td>${produto.minimo}</td>
<td>${produto.emergencia}</td>
<td>
<button onclick="entrada(${index})">➕</button>
<button onclick="saida(${index})">➖</button>
<button onclick="remover(${index})">🗑</button>
</td>
</tr>
`

})

}

function entrada(index){

produtos[index].quantidade++

mostrarProdutos()

}

function saida(index){

if(produtos[index].quantidade > 0){

produtos[index].quantidade--

}

mostrarProdutos()

}

function remover(index){

produtos.splice(index,1)

mostrarProdutos()

}
