# Motorlife Motorhomers

Site institucional para apresentação da frota, diferenciais, roteiros e contato comercial da Motorlife Motorhomers.

## Visão geral

- Catálogo de motorhomes com filtros por capacidade.
- Comparador de modelos.
- Galeria e modal de detalhes por veículo.
- Formulário de orçamento integrado ao WhatsApp.
- Área administrativa local para edição do catálogo.
- Layout responsivo para desktop e mobile.

## Requisitos

- Node.js 18 ou superior.

## Como rodar localmente

```bash
npm install
npm start
```

Depois acesse:

```text
http://127.0.0.1:4173
```

## Estrutura

```text
assets/       Imagens e logo usados no site
app.js        Dados da frota e interações da interface
index.html    Estrutura principal da página
server.mjs    Servidor estático local
styles.css    Estilos e responsividade
```

## Administração do catálogo

O link de administração fica no rodapé. A edição do catálogo acontece no navegador e permite ajustar dados, imagens e informações dos modelos antes de exportar/importar o JSON atualizado.

## Observações

Este projeto é um protótipo funcional de remodelação do site. Para publicação final, recomenda-se integrar o catálogo a um CMS ou painel persistente no backend.
