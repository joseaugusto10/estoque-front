Sistema de controle de estoque desenvolvido com Vue 3 + TypeScript, consumindo API REST do backend em Spring Boot.

OBS: o .env ta indo para o git, porque é algo que não está com dados sensíveis

Este frontend permite:

- CRUD completo de produtos
- Entrada e saída de estoque
- Filtros por tipo e descrição
- Paginação dinâmica
- Exclusão com validação de vínculo
- Exclusão forçada com confirmação
- Consulta de lucro por produto
- Resumo de produtos por tipo

## Tecnologias Utilizadas

- Vue 3
- TypeScript
- Vite
- Axios
- SweetAlert2
- Lucide Icons

## Requisitos

Verifique sua versão do Node.

No terminal digite:

node -v

Node.js v24.2.0  
(Eu utilizei essa versão. Você pode testar com outra, mas recomendo essa para evitar possíveis incompatibilidades.)

Também é necessário:

- npm ou yarn  
  (Eu utilizei o yarn)

## Instalação

### 1º Passo

Clone o repositório:

git clone <URL_DO_REPOSITORIO>

Entre na pasta do projeto:

cd estoque-front

### 2º Passo

Instale as dependências:

Com yarn:

yarn

Ou com npm:

npm install

## Executando o Projeto

Para iniciar o servidor de desenvolvimento:

Com yarn:

yarn dev

Ou com npm:

npm run dev

O projeto estará disponível em:

http://localhost:5173

## Configuração da API

A URL base da API está definida em:

src/.env

Certifique-se de que o backend esteja rodando antes de utilizar o sistema.

## Observações

- O campo de busca por descrição exige no mínimo 3 caracteres.
- A exclusão de produtos que possuem movimentações retorna erro 409.
- O sistema permite exclusão forçada mediante confirmação.
- A paginação é controlada pelo backend.

## Autor

José Augusto
Desenvolvedor Full Stack
