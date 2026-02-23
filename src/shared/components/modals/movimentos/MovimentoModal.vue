<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

import type {
  MovimentoEstoqueCreateRequest,
  MovimentoEstoqueResponse,
} from '@/types/movimentacao-estoque'
import type { TipoMovimentacao } from '@/types/enums'

import { movimentosService } from '@/services/movimentos.service'
import { toastErro, toastSucesso } from '@/shared/utils/alert'
import { extrairMensagemErro } from '@/shared/api/error'

type Props = {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', movimento: MovimentoEstoqueResponse): void
}>()

const state = reactive({
  loading: false,

  form: {
    codigoProduto: '' as unknown as number | '',
    tipoMovimentacao: '' as TipoMovimentacao | '',
    qtdMovimentada: '' as unknown as number | '',
    valorVenda: '' as unknown as number | '',
    dataVenda: '' as string | '',
  },
})

const titulo = computed(() => 'Nova movimentação')

const isSaida = computed(() => state.form.tipoMovimentacao === 'SAIDA')

const podeSalvar = computed(() => {
  const codigoProdutoOk = state.form.codigoProduto !== '' && Number(state.form.codigoProduto) > 0
  const tipoOk = state.form.tipoMovimentacao !== ''
  const qtdOk = state.form.qtdMovimentada !== '' && Number(state.form.qtdMovimentada) > 0

  if (!codigoProdutoOk || !tipoOk || !qtdOk) return false

  if (isSaida.value) {
    return state.form.valorVenda !== '' && Number(state.form.valorVenda) > 0
  }

  return true
})

function resetForm() {
  state.form.codigoProduto = '' as any
  state.form.tipoMovimentacao = '' as any
  state.form.qtdMovimentada = '' as any
  state.form.valorVenda = '' as any
  state.form.dataVenda = ''
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    resetForm()
  },
)

watch(
  () => state.form.tipoMovimentacao,
  (tipo) => {
    // Se mudar para entrada, zera os campos de venda pra não enviar lixo
    if (tipo !== 'SAIDA') {
      state.form.valorVenda = '' as any
      state.form.dataVenda = ''
    }
  },
)

function fechar() {
  if (state.loading) return
  emit('close')
}

function normalizarDataVenda(dataVenda: string): string | null {
  if (!dataVenda) return null
  return dataVenda.length === 16 ? `${dataVenda}:00` : dataVenda
}

async function salvar() {
  if (!podeSalvar.value) return

  try {
    state.loading = true

    const payload: MovimentoEstoqueCreateRequest = {
      codigoProduto: Number(state.form.codigoProduto),
      tipoMovimentacao: state.form.tipoMovimentacao as TipoMovimentacao,
      qtdMovimentada: Number(state.form.qtdMovimentada),
    }

    if (isSaida.value) {
      payload.valorVenda = Number(state.form.valorVenda)
      const data = normalizarDataVenda(state.form.dataVenda)
      payload.dataVenda = data
    } else {
      payload.valorVenda = null
      payload.dataVenda = null
    }

    const res = await movimentosService.criar(payload)

    toastSucesso('Movimentação registrada com sucesso!')
    emit('saved', res)
    emit('close')
  } catch (e) {
    toastErro(extrairMensagemErro(e, 'Erro ao registrar movimentação.'))
  } finally {
    state.loading = false
  }
}
</script>

<template>
  <teleport to="body">
    <div v-if="props.open" class="overlay" @click.self="fechar">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="header">
          <div>
            <h3 class="title">{{ titulo }}</h3>
            <p class="subtitle">
              Registre uma <strong>entrada</strong> ou <strong>saída</strong> no estoque.
            </p>
          </div>

          <button class="icon-btn" :disabled="state.loading" @click="fechar">✕</button>
        </div>

        <div class="body">
          <div class="grid">
            <div class="field">
              <label class="label">Código do produto</label>
              <input
                v-model="state.form.codigoProduto"
                class="input"
                type="number"
                min="1"
                step="1"
                placeholder="Ex: 10"
              />
            </div>

            <div class="field">
              <label class="label">Tipo</label>
              <select v-model="state.form.tipoMovimentacao" class="input">
                <option value="" disabled>Selecione</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>

            <div class="field">
              <label class="label">Quantidade</label>
              <input
                v-model="state.form.qtdMovimentada"
                class="input"
                type="number"
                min="1"
                step="1"
                placeholder="Ex: 5"
              />
            </div>

            <div v-if="isSaida" class="field">
              <label class="label">Valor de venda</label>
              <input
                v-model="state.form.valorVenda"
                class="input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex: 199.90"
              />
            </div>

            <div v-if="isSaida" class="field">
              <label class="label">Data da venda (opcional)</label>
              <input v-model="state.form.dataVenda" class="input" type="datetime-local" />
            </div>

            <div v-if="!isSaida" class="hint">
              Para <strong>entrada</strong>, não é necessário informar valor/data de venda.
            </div>
          </div>
        </div>

        <div class="footer">
          <button class="btn" :disabled="state.loading" @click="fechar">Cancelar</button>

          <button class="btn primary" :disabled="state.loading || !podeSalvar" @click="salvar">
            <span v-if="state.loading">Salvando...</span>
            <span v-else>Salvar</span>
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
/* igual ao ProdutoModal */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 10, 0.45);
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal {
  width: min(680px, 100%);
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.header {
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.title {
  margin: 0;
  font-size: 16px;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: #666;
}

.icon-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  padding: 6px 8px;
  border-radius: 10px;
}

.icon-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.06);
}

.body {
  padding: 14px 16px;
}

.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}

.field {
  display: grid;
  gap: 6px;
}

.label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #7a7a7a;
  text-transform: uppercase;
}

.input {
  height: 38px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0 10px;
  outline: none;
  font-size: 14px;
  background: white;
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(15, 92, 87, 0.12);
}

.hint {
  grid-column: 1 / -1;
  font-size: 12px;
  color: #666;
  padding: 8px 10px;
  border-radius: 10px;
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.footer {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.btn {
  height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: #fff;
  cursor: pointer;
  font-weight: 800;
}

.btn.primary {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.btn:disabled,
.icon-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .modal {
    width: 100%;
    border-radius: 16px;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
