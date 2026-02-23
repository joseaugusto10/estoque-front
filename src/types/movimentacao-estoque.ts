import type { TipoMovimentacao } from './enums'

export type MovimentoEstoqueCreateRequest = {
  codigoProduto: number
  tipoMovimentacao: TipoMovimentacao
  qtdMovimentada: number
  valorVenda?: number | null
  dataVenda?: string | null
}

export type MovimentoEstoqueResponse = {
  codigoMovimentacao: number
  codigoProduto: number
  descricaoProduto?: string | null
  tipoMovimentacao: TipoMovimentacao
  qtdMovimentada: number
  valorVenda?: number | null
  dataVenda?: string | null
  dataMovimento: string
  estoqueAtual: number
}

export type ListarMovimentosParams = {
  page?: number
  size?: number
  sort?: string
  codigoProduto?: number
  tipoMovimentacao?: TipoMovimentacao
}
