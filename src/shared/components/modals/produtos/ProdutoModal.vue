<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { ProdutoResponse, ProdutoCreateRequest, ProdutoUpdateRequest } from '@/types/produto'
import type { TipoProduto } from '@/types/enums'
import { produtosService } from '@/services/produtos.service'
import { toastErro, toastSucesso } from '@/shared/utils/alert'
import { extrairMensagemErro } from '@/shared/api/error'

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  codigo?: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', produto: ProdutoResponse): void
}>()

const state = reactive({
  loading: false,
  loadingProduto: false,

  form: {
    descricao: '',
    tipoProduto: '' as TipoProduto | '',
    valorNoFornecedor: '' as unknown as number | '',
    estoque: '' as unknown as number | '',
  },
})

const titulo = computed(() => (props.mode === 'create' ? 'Novo produto' : 'Editar produto'))

const podeSalvar = computed(() => {
  return (
    state.form.descricao.trim().length >= 2 &&
    state.form.tipoProduto !== '' &&
    state.form.valorNoFornecedor !== '' &&
    Number(state.form.valorNoFornecedor) >= 0 &&
    state.form.estoque !== '' &&
    Number.isFinite(Number(state.form.estoque)) &&
    Number(state.form.estoque) >= 0
  )
})

function resetForm() {
  state.form.descricao = ''
  state.form.tipoProduto = ''
  state.form.valorNoFornecedor = '' as any
  state.form.estoque = '' as any
}

async function carregarProduto(codigo: number) {
  try {
    state.loadingProduto = true
    const p = await produtosService.buscarPorId(codigo)

    state.form.descricao = p.descricao
    state.form.tipoProduto = p.tipoProduto
    state.form.valorNoFornecedor = p.valorNoFornecedor as any
    state.form.estoque = p.estoque as any
  } catch (e) {
    toastErro(extrairMensagemErro(e, 'Erro ao carregar produto para edição.'))
    emit('close')
  } finally {
    state.loadingProduto = false
  }
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return

    if (props.mode === 'create') {
      resetForm()
      return
    }

    resetForm()

    if (props.codigo == null) {
      toastErro('Código do produto não informado.')
      emit('close')
      return
    }

    await carregarProduto(props.codigo)
  },
)

function fechar() {
  if (state.loading) return
  emit('close')
}

async function salvar() {
  if (!podeSalvar.value) return

  try {
    state.loading = true

    const payloadBase = {
      descricao: state.form.descricao.trim(),
      tipoProduto: state.form.tipoProduto as TipoProduto,
      valorNoFornecedor: Number(state.form.valorNoFornecedor),
      estoque: Number(state.form.estoque),
    }

    let res: ProdutoResponse

    if (props.mode === 'create') {
      res = await produtosService.criar(payloadBase as ProdutoCreateRequest)
      toastSucesso('Produto criado com sucesso!')
    } else {
      if (props.codigo == null) {
        toastErro('Código do produto não informado.')
        return
      }

      res = await produtosService.atualizar(props.codigo, payloadBase as ProdutoUpdateRequest)
      toastSucesso('Produto atualizado com sucesso!')
    }

    emit('saved', res)
    emit('close')
  } catch (e) {
    toastErro(extrairMensagemErro(e, 'Erro ao salvar produto.'))
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
            <p v-if="props.mode === 'edit' && props.codigo != null" class="subtitle">
              Código: <strong>#{{ props.codigo }}</strong>
            </p>
          </div>

          <button class="icon-btn" :disabled="state.loading" @click="fechar">✕</button>
        </div>

        <div class="body">
          <div v-if="state.loadingProduto" class="loading">Carregando produto...</div>

          <div v-else>
            <div class="grid">
              <div class="field">
                <label class="label">Descrição</label>
                <input
                  v-model="state.form.descricao"
                  class="input"
                  type="text"
                  placeholder="Ex: Mouse Gamer"
                />
              </div>

              <div class="field">
                <label class="label">Tipo</label>
                <select v-model="state.form.tipoProduto" class="input">
                  <option value="" disabled>Selecione</option>
                  <option value="ELETRONICO">Eletrônico</option>
                  <option value="ELETRODOMESTICO">Eletrodoméstico</option>
                  <option value="MOVEL">Móvel</option>
                </select>
              </div>

              <div class="field">
                <label class="label">Valor no fornecedor</label>
                <input
                  v-model="state.form.valorNoFornecedor"
                  class="input"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>

              <div class="field">
                <label class="label">Estoque</label>
                <input v-model="state.form.estoque" class="input" type="number" step="1" min="0" />
              </div>
            </div>

            <div v-if="props.mode === 'edit'" class="warn">
              <div class="warn-title">Atenção ao editar 🟡</div>
              <div class="warn-text">
                Se este produto já tiver movimentações registradas, alterar o
                <strong>estoque</strong> pode causar inconsistências
              </div>
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

.loading {
  text-align: center;
  padding: 18px 0;
  color: #555;
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

.warn {
  margin-top: 12px;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.12);
}

.warn-title {
  font-weight: 900;
  font-size: 12px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #92400e;
  margin-bottom: 6px;
}

.warn-text {
  font-size: 13px;
  color: #78350f;
  line-height: 1.4;
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
