# VPC – Sistema de Gestão de Produção

Sistema web para gerenciamento de escalas de produção da linha VPC.  
Funciona 100% no navegador — sem instalação, sem servidor, sem banco de dados.

---

## 📁 Estrutura do Projeto

```
vpc-producao/
│
├── index.html              ← Página principal (abrir no navegador)
│
├── css/
│   └── styles.css          ← Todos os estilos visuais
│
├── js/
│   ├── state.js            ← Estado global e dados dos funcionários
│   ├── escala.js           ← Drag & drop e lógica de montagem de escala
│   ├── dashboard.js        ← Renderização do painel principal
│   ├── funcionarios.js     ← Cadastro e gestão de funcionários
│   ├── historico.js        ← Histórico de escalas salvas
│   ├── exportar.js         ← Exportação PDF e Excel
│   └── app.js              ← Inicialização e navegação entre páginas
│
└── README.md               ← Este arquivo
```

---

## 🚀 Como usar

1. Faça o download ou clone a pasta `vpc-producao/`
2. Abra o arquivo `index.html` diretamente no navegador  
   _(Chrome, Firefox, Edge ou Safari — qualquer versão moderna)_
3. Pronto! O sistema já inicia com os 16 funcionários cadastrados.

> **Não precisa de servidor web.** Basta abrir o `index.html`.

---

## 📋 Funcionalidades

### 📊 Dashboard
- Visão geral da escala do dia
- Cards com total de operadores por setor
- Grid visual de carros por linha (Linha 1, 2 e 3)

### 📋 Montar Escala
- Arrastar e soltar funcionários para cada setor/linha
- **Gerar Automático**: distribui todos os operadores com 1 clique
  - Novatos vão automaticamente para a Linha 3
  - Cada função é respeitada (Movimentação, Adesivos, etc.)
- Duplo-clique no chip devolve o operador ao pool
- Salvar escala gera snapshot no histórico

### 👥 Funcionários
- Lista completa dos 16 operadores
- Adicionar novos funcionários
- Remover funcionários
- Campos: Nome, Função Padrão, Nível (experiente/novato)

### 📅 Histórico
- Todas as escalas salvas ficam registradas
- Carregar uma escala antiga para editar
- Excluir escalas do histórico

### 📄 Exportar
- **PDF**: arquivo `.pdf` profissional com banner VPC, pronto para WhatsApp
- **Excel**: arquivo `.xlsx` com aba de escala detalhada + aba de resumo
- **Visualizar**: prévia do relatório antes de baixar

---

## 🏭 Estrutura da Linha de Produção

| Setor              | Operadores | Observação                     |
|--------------------|------------|--------------------------------|
| Montagem de Mídia  | 5 a 8      | Preparação antes de ir ao carro|
| Movimentação       | 3 a 5      | Puxar os carros para a linha   |
| Adesivos           | 2 a 3      | Aplicar adesivos nos carros    |
| **Linha 1**        | 2          | Op. A: carros 1,2,3 / Op. B: 4,5,6 |
| **Linha 2**        | 2          | Op. A: carros 1,2,3 / Op. B: 4,5,6 |
| **Linha 3**        | 2 a 4      | Aprendizagem – novatos         |

---

## 🛠️ Tecnologias

- **HTML5 / CSS3 / JavaScript** puro — sem frameworks
- **jsPDF** (carregado via CDN) — geração de PDF
- **SheetJS / XLSX** (carregado via CDN) — geração de Excel
- **Google Fonts** — Barlow Condensed + Barlow

> As bibliotecas PDF e Excel são carregadas automaticamente na primeira vez que você clicar em "Baixar". Requer conexão com internet apenas para este passo.

---

## 📱 Compatibilidade

✅ Celular (Android e iPhone)  
✅ Computador (Windows, Mac, Linux)  
✅ Tablet  
✅ Qualquer navegador moderno

---

*Sistema desenvolvido para a equipe VPC — Produção*
