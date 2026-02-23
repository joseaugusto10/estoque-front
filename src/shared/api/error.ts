import type { AxiosError } from 'axios'

type BackendError = {
  message?: string
  status?: number
  error?: string
  path?: string
  timestamp?: string
}

export function extrairMensagemErro(e: unknown, fallback = 'Ocorreu um erro.') {
  const ax = e as AxiosError<BackendError>
  const msg = ax?.response?.data?.message

  return msg && msg.trim() ? msg : fallback
}
