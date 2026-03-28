const STORAGE_KEY = "sistema-estoque-produtos";
const REQ_STORAGE_KEY = "sistema-estoque-requisicoes";

let produtos = carregarProdutos();
let requisicoes = carregarRequisicoes();

function carregarProdutos() {
  const dados = localStorage.getItem(STORAGE_KEY);
  if (!dados) return [];

  try {
    return JSON.parse(dados);
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    return [];
  }
}

function carregarRequisicoes() {
  const dados = localStorage.getItem(REQ_STORAGE_KEY);
  if (!dados) return [];

  try {
    return JSON.parse(dados);
  } catch (error) {
    console.error("Erro ao carregar requisicoes:", error);
    return [];
  }
}

function salvarProdutos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));
}

function salvarRequisicoes() {
  localStorage.setItem(REQ_STORAGE_KEY, JSON.stringify(requisicoes));
}

function obterStatus(produto) {
  if (produto.quantidade <= produto.emergencia) return "emergencia";
  if (produto.quantidade <= produto.minimo) return "alerta";
  return "normal";
}

function obterTextoStatus(produto) {
  const status = obterStatus(produto);
  if (status === "emergencia") return "Emergencia";
  if (status === "alerta") return "Atencao";
  return "Normal";
}

function adicionarProduto(event) {
  if (event) event.preventDefault();

  const codigo = document.getElementById("codigo").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const quantidade = Number(document.getElementById("quantidade").value);
  const minimo = Number(document.getElementById("minimo").value);
  const emergencia = Number(document.getElementById("emergencia").value);

  if (!codigo || !nome || Number.isNaN(quantidade) || Number.isNaN(minimo) || Number.isNaN(emergencia)) {
    mostrarMensagem("mensagemCadastro", "Preencha todos os campos corretamente.", true);
    return;
  }

  if (emergencia > minimo) {
    mostrarMensagem("mensagemCadastro", "O estoque de emergencia nao pode ser maior que o estoque minimo.", true);
    return;
  }

  const codigoJaExiste = produtos.some((produto) => produto.codigo.toLowerCase() === codigo.toLowerCase());

  if (codigoJaExiste) {
    mostrarMensagem("mensagemCadastro", "Ja existe um produto cadastrado com esse codigo.", true);
    return;
  }

  produtos.push({ codigo, nome, quantidade, minimo, emergencia });
  salvarProdutos();
  limparCampos("formCadastro");
  mostrarMensagem("mensagemCadastro", "Produto cadastrado com sucesso.", false);
  renderizarTudo();
}

function registrarRequisicao(event) {
  event.preventDefault();

  const responsavel = document.getElementById("responsavel").value.trim();
  const produtoIndex = Number(document.getElementById("produtoRequisicao").value);
  const quantidade = Number(document.getElementById("quantidadeRequisicao").value);
  const setor = document.getElementById("setorRequisicao").value.trim();

  if (!responsavel || Number.isNaN(produtoIndex) || Number.isNaN(quantidade) || !setor || quantidade <= 0) {
    mostrarMensagem("mensagemRequisicao", "Preencha os dados da requisicao corretamente.", true);
    return;
  }

  const produto = produtos[produtoIndex];

  if (!produto) {
    mostrarMensagem("mensagemRequisicao", "Produto invalido.", true);
    return;
  }

  if (quantidade > produto.quantidade) {
    mostrarMensagem("mensagemRequisicao", "Quantidade solicitada maior que o estoque disponivel.", true);
    return;
  }

  produto.quantidade -= quantidade;

  requisicoes.unshift({
    data: new Date().toLocaleString("pt-BR"),
    responsavel,
    produto: produto.nome,
    codigo: produto.codigo,
    quantidade,
    setor
  });

  salvarProdutos();
  salvarRequisicoes();
  limparCampos("formRequisicao");
  mostrarMensagem("mensagemRequisicao", "Requisicao registrada com sucesso.", false);
  renderizarTudo();
}

function mostrarMensagem(id, texto, erro) {
  const mensagem = document.getElementById(id);
  if (!mensagem) return;

  mensagem.textContent = texto;
  mensagem.className = erro ? "mensagem erro" : "mensagem sucesso";
}

function limparCampos(formId) {
  const form = document.getElementById(formId);
  if (form) form.reset();
}

function renderizarEstoque() {
  const tabela = document.getElementById("listaProdutos");
  const contador = document.getElementById("contadorEstoque");

  if (!tabela) return;

  tabela.innerHTML = "";
  if (contador) contador.textContent = `${produtos.length} itens`;

  if (produtos.length === 0) {
    tabela.innerHTML = `<tr><td colspan="7" class="lista-vazia">Nenhum produto cadastrado.</td></tr>`;
    return;
  }

  produtos.forEach((produto, index) => {
    const status = obterStatus(produto);

    tabela.innerHTML += `
      <tr class="${status}">
        <td>${produto.codigo}</td>
        <td>${produto.nome}</td>
        <td>${produto.quantidade}</td>
        <td>${produto.minimo}</td>
        <td>${produto.emergencia}</td>
        <td><span class="status-chip ${status}">${obterTextoStatus(produto)}</span></td>
        <td class="acoes-tabela">
          <button type="button" onclick="entrada(${index})">Entrada</button>
          <button type="button" onclick="saida(${index})">Saida</button>
          <button type="button" class="botao-perigo" onclick="remover(${index})">Remover</button>
        </td>
      </tr>
    `;
  });
}

function renderizarMovimentacoes() {
  const container = document.getElementById("listaMovimentacoes");
  if (!container) return;

  if (produtos.length === 0) {
    container.innerHTML = `<div class="lista-vazia">Cadastre produtos para movimentar o estoque.</div>`;
    return;
  }

  container.innerHTML = produtos.map((produto, index) => `
    <article class="movimento-card ${obterStatus(produto)}">
      <div>
        <p class="etiqueta-card">${produto.codigo}</p>
        <h3>${produto.nome}</h3>
        <p>Quantidade atual: <strong>${produto.quantidade}</strong></p>
        <p>Minimo: ${produto.minimo} | Emergencia: ${produto.emergencia}</p>
      </div>
      <div class="movimento-acoes">
        <button type="button" onclick="entrada(${index})">Adicionar 1</button>
        <button type="button" class="secundario" onclick="saida(${index})">Retirar 1</button>
      </div>
    </article>
  `).join("");
}

function renderizarPainel() {
  const totalProdutos = document.getElementById("totalProdutos");
  const totalAlertas = document.getElementById("totalAlertas");
  const totalEmergencias = document.getElementById("totalEmergencias");
  const totalItens = document.getElementById("totalItens");
  const contadorCriticos = document.getElementById("contadorCriticos");
  const listaCriticos = document.getElementById("listaCriticos");

  if (!totalProdutos) return;

  const alertas = produtos.filter((produto) => obterStatus(produto) === "alerta");
  const emergencias = produtos.filter((produto) => obterStatus(produto) === "emergencia");
  const itens = produtos.reduce((total, produto) => total + produto.quantidade, 0);
  const criticos = produtos.filter((produto) => obterStatus(produto) !== "normal");

  totalProdutos.textContent = produtos.length;
  totalAlertas.textContent = alertas.length;
  totalEmergencias.textContent = emergencias.length;
  totalItens.textContent = itens;

  if (contadorCriticos) {
    contadorCriticos.textContent = `${criticos.length} itens`;
  }

  if (!listaCriticos) return;

  if (criticos.length === 0) {
    listaCriticos.innerHTML = `<div class="lista-vazia">Nenhum produto critico no momento.</div>`;
    return;
  }

  listaCriticos.innerHTML = criticos.map((produto) => `
    <div class="item-lista ${obterStatus(produto)}">
      <div>
        <strong>${produto.nome}</strong>
        <p>Codigo ${produto.codigo}</p>
      </div>
      <span>${produto.quantidade} unidades</span>
    </div>
  `).join("");
}

function renderizarRelatorios() {
  const total = document.getElementById("relatorioTotalProdutos");
  const normais = document.getElementById("relatorioNormais");
  const alertas = document.getElementById("relatorioAlertas");
  const emergencias = document.getElementById("relatorioEmergencias");
  const listaReposicao = document.getElementById("listaReposicao");
  const resumoOperacional = document.getElementById("resumoOperacional");

  if (!total) return;

  const totalNormais = produtos.filter((produto) => obterStatus(produto) === "normal").length;
  const totalAlertas = produtos.filter((produto) => obterStatus(produto) === "alerta").length;
  const totalEmergencias = produtos.filter((produto) => obterStatus(produto) === "emergencia").length;
  const itensCriticos = produtos.filter((produto) => obterStatus(produto) !== "normal");

  total.textContent = produtos.length;
  normais.textContent = totalNormais;
  alertas.textContent = totalAlertas;
  emergencias.textContent = totalEmergencias;

  if (listaReposicao) {
    if (itensCriticos.length === 0) {
      listaReposicao.innerHTML = `<div class="lista-vazia">Nenhum item precisa de reposicao.</div>`;
    } else {
      listaReposicao.innerHTML = itensCriticos.map((produto) => {
        const necessario = Math.max(produto.minimo - produto.quantidade, 0);

        return `
          <div class="item-lista ${obterStatus(produto)}">
            <div>
              <strong>${produto.nome}</strong>
              <p>Atual: ${produto.quantidade} | Minimo: ${produto.minimo}</p>
            </div>
            <span>Repor ${necessario}</span>
          </div>
        `;
      }).join("");
    }
  }

  if (resumoOperacional) {
    const itens = produtos.reduce((total, produto) => total + produto.quantidade, 0);
    resumoOperacional.innerHTML = `
      <p>O estoque possui <strong>${produtos.length}</strong> produtos cadastrados e <strong>${itens}</strong> unidades armazenadas no total.</p>
      <p><strong>${totalNormais}</strong> produtos estao em nivel normal, <strong>${totalAlertas}</strong> exigem atencao e <strong>${totalEmergencias}</strong> estao em situacao emergencial.</p>
      <p>As requisicoes registram retiradas com responsavel e destino, melhorando o controle das saidas.</p>
    `;
  }
}

function renderizarFormularioRequisicao() {
  const select = document.getElementById("produtoRequisicao");
  if (!select) return;

  if (produtos.length === 0) {
    select.innerHTML = `<option value="">Nenhum produto cadastrado</option>`;
    return;
  }

  select.innerHTML = `
    <option value="">Selecione um produto</option>
    ${produtos.map((produto, index) => `
      <option value="${index}">
        ${produto.codigo} - ${produto.nome} (${produto.quantidade} un)
      </option>
    `).join("")}
  `;
}

function renderizarRequisicoes() {
  const tabela = document.getElementById("listaRequisicoes");
  const contador = document.getElementById("contadorRequisicoes");

  if (!tabela) return;

  if (contador) {
    contador.textContent = `${requisicoes.length} registros`;
  }

  if (requisicoes.length === 0) {
    tabela.innerHTML = `<tr><td colspan="5" class="lista-vazia">Nenhuma requisicao registrada.</td></tr>`;
    return;
  }

  tabela.innerHTML = requisicoes.map((item) => `
    <tr>
      <td>${item.data}</td>
      <td>${item.responsavel}</td>
      <td>${item.codigo} - ${item.produto}</td>
      <td>${item.quantidade}</td>
      <td>${item.setor}</td>
    </tr>
  `).join("");
}

function entrada(index) {
  produtos[index].quantidade += 1;
  salvarProdutos();
  renderizarTudo();
}

function saida(index) {
  if (produtos[index].quantidade > 0) {
    produtos[index].quantidade -= 1;
    salvarProdutos();
    renderizarTudo();
  }
}

function remover(index) {
  produtos.splice(index, 1);
  salvarProdutos();
  renderizarTudo();
}

function renderizarTudo() {
  renderizarPainel();
  renderizarEstoque();
  renderizarMovimentacoes();
  renderizarRelatorios();
  renderizarFormularioRequisicao();
  renderizarRequisicoes();
}

document.addEventListener("DOMContentLoaded", () => {
  const formularioCadastro = document.getElementById("formCadastro");
  const formularioRequisicao = document.getElementById("formRequisicao");

  if (formularioCadastro) {
    formularioCadastro.addEventListener("submit", adicionarProduto);
  }

  if (formularioRequisicao) {
    formularioRequisicao.addEventListener("submit", registrarRequisicao);
  }

  renderizarTudo();
});
