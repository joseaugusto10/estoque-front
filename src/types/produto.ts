import type { TipoProduto } from './enums'

export type ProdutoCreateRequest = {
  descricao: string
  tipoProduto: TipoProduto
  valorNoFornecedor: number
  estoque: number
}

export type ProdutoUpdateRequest = {
  descricao: string
  tipoProduto: TipoProduto
  valorNoFornecedor: number
  estoque: number
}

export type ProdutoResponse = {
  codigo: number
  descricao: string
  tipoProduto: TipoProduto
  valorNoFornecedor: number
  estoque: number
}

export type ProdutoResumoResponse = {
  codigo: number
  descricao: string
  tipoProduto: TipoProduto
  valorNoFornecedor: number
  estoqueDisponivel: number
  quantidadeTotalSaida: number
}

export type LucroProdutoResponse = {
  codigoProduto: number
  descricao: string
  tipoProduto: TipoProduto
  quantidadeTotalSaida: number
  lucroTotal: number
}

export type ListarProdutosParams = {
  page?: number
  size?: number
  sort?: string
  tipo?: TipoProduto
  descricao?: string
}
