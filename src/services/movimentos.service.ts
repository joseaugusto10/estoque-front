import { http } from '@/shared/api/http'
import type { Page } from '@/types/paginacao'
import type {
  ListarMovimentosParams,
  MovimentoEstoqueCreateRequest,
  MovimentoEstoqueResponse,
} from '@/types/movimentacao-estoque'

// Converte um objeto em query string válida, ignorando parâmetros vazios.
function buildParams(params?: Record<string, any>) {
  const p = new URLSearchParams()
  if (!params) return p

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    p.set(key, String(value))
  })

  return p
}

export const movimentosService = {
  async criar(payload: MovimentoEstoqueCreateRequest): Promise<MovimentoEstoqueResponse> {
    const { data } = await http.post<MovimentoEstoqueResponse>('/movimentos', payload)
    return data
  },

  async listar(params?: ListarMovimentosParams): Promise<Page<MovimentoEstoqueResponse>> {
    const query = buildParams({
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort ?? 'codigoMovimentacao,desc',
      codigoProduto: params?.codigoProduto,
      tipoMovimentacao: params?.tipoMovimentacao,
    })

    const { data } = await http.get<Page<MovimentoEstoqueResponse>>(
      `/movimentos?${query.toString()}`,
    )
    return data
  },

  async buscarPorId(codigoMovimentacao: number): Promise<MovimentoEstoqueResponse> {
    const { data } = await http.get<MovimentoEstoqueResponse>(`/movimentos/${codigoMovimentacao}`)
    return data
  },
}
