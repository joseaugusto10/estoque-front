import { http } from '@/shared/api/http'
import type { Page } from '@/types/paginacao'
import type {
  ProdutoCreateRequest,
  ProdutoUpdateRequest,
  ProdutoResponse,
  ProdutoResumoResponse,
  LucroProdutoResponse,
  ListarProdutosParams,
} from '@/types/produto'

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

export const produtosService = {
  async criar(payload: ProdutoCreateRequest): Promise<ProdutoResponse> {
    const { data } = await http.post<ProdutoResponse>('/produtos', payload)
    return data
  },

  async listar(params?: ListarProdutosParams): Promise<Page<ProdutoResponse>> {
    const query = buildParams({
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort ?? 'codigo,desc',
      tipo: params?.tipo,
      descricao: params?.descricao,
    })

    const { data } = await http.get<Page<ProdutoResponse>>(`/produtos?${query.toString()}`)
    return data
  },

  async buscarPorId(codigo: number): Promise<ProdutoResponse> {
    const { data } = await http.get<ProdutoResponse>(`/produtos/${codigo}`)
    return data
  },

  async atualizar(codigo: number, payload: ProdutoUpdateRequest): Promise<ProdutoResponse> {
    const { data } = await http.put<ProdutoResponse>(`/produtos/${codigo}`, payload)
    return data
  },

  async excluir(codigo: number): Promise<void> {
    await http.delete(`/produtos/${codigo}`)
  },

  async excluirForcado(codigo: number): Promise<void> {
    await http.delete(`/produtos/${codigo}/forcar`)
  },

  async listarResumo(params?: ListarProdutosParams): Promise<Page<ProdutoResumoResponse>> {
    const query = buildParams({
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort ?? 'codigo,desc',
      tipo: params?.tipo,
    })

    const { data } = await http.get<Page<ProdutoResumoResponse>>(
      `/produtos/resumo?${query.toString()}`,
    )
    return data
  },

  async consultarLucro(codigoProduto: number): Promise<LucroProdutoResponse> {
    const { data } = await http.get<LucroProdutoResponse>(`/produtos/${codigoProduto}/lucro`)
    return data
  },
}
