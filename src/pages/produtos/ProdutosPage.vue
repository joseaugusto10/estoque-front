<script setup lang="ts">
import { onMounted, ref, computed, watch, nextTick } from 'vue'

import ResponsiveDataView from '@/shared/components/ResponsiveDataView.vue'
import BaseCard from '@/shared/components/BaseCard.vue'
import CardField from '@/shared/components/CardField.vue'
import AppPagination from '@/shared/components/AppPagination.vue'
import FabButton from '@/shared/components/FabButton.vue'

import type { Column } from '@/shared/components/ResponsiveDataView.vue'
import type { ProdutoResponse } from '@/types/produto'
import type { Page } from '@/types/paginacao'
import type { TipoProduto } from '@/types/enums'

import { produtosService } from '@/services/produtos.service'
import ProdutoModal from '@/shared/components/modals/produtos/ProdutoModal.vue'
import { confirmarAcao, toastErro, toastSucesso } from '@/shared/utils/alert'

import { Pencil, Trash2 } from 'lucide-vue-next'
import { formatarMoeda } from '@/shared/utils/formatacao'
import { extrairMensagemErro } from '@/shared/api/error'

const carregando = ref(false)
const pagina = ref<Page<ProdutoResponse> | null>(null)

const pageIndex = ref(0)
const pageSize = ref(8)
const sort = ref('codigo,desc')
const tipo = ref<TipoProduto | ''>('')

const descricao = ref('')

const descricaoInput = ref<HTMLInputElement | null>(null)

const descricaoNormalizada = computed(() => descricao.value.trim().replace(/\s+/g, ' '))

let descricaoTimer: number | null = null

const items = computed(() => pagina.value?.content ?? [])

const temFiltrosAtivos = computed(() => {
  const descricaoAtiva = !!descricaoNormalizada.value
  const tipoAtivo = !!tipo.value
  const sortPadrao = sort.value !== 'codigo,desc'
  return descricaoAtiva || tipoAtivo || sortPadrao
})

const columns: Column<ProdutoResponse>[] = [
  { key: 'codigo', header: 'Código', field: 'codigo', width: 90 },
  { key: 'descricao', header: 'Descrição', field: 'descricao', width: 170 },
  { key: 'tipoProduto', header: 'Tipo', field: 'tipoProduto', width: 150 },
  { key: 'valorNoFornecedor', header: 'Valor Fornecedor', field: 'valorNoFornecedor', width: 150 },
  { key: 'estoque', header: 'Estoque', field: 'estoque', width: 110 },
  { key: 'actions', header: 'Ações', width: 120 },
]

const keyExtractor = (p: ProdutoResponse) => p.codigo

async function carregar() {
  const inputEl = descricaoInput.value
  const estavaNoInput = !!inputEl && document.activeElement === inputEl
  const selStart = inputEl?.selectionStart ?? null
  const selEnd = inputEl?.selectionEnd ?? null

  try {
    carregando.value = true

    const desc = descricaoNormalizada.value
    pagina.value = await produtosService.listar({
      page: pageIndex.value,
      size: pageSize.value,
      sort: sort.value,
      tipo: tipo.value || undefined,
      descricao: desc.length >= 3 ? desc : undefined,
    })
  } catch {
    toastErro('Erro ao carregar produtos.')
  } finally {
    carregando.value = false

    if (estavaNoInput && inputEl) {
      await nextTick()
      inputEl.focus()
      if (selStart !== null && selEnd !== null) {
        try {
          inputEl.setSelectionRange(selStart, selEnd)
        } catch {}
      }
    }
  }
}

const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const codigoEdit = ref<number | null>(null)

function abrirNovo() {
  modalMode.value = 'create'
  codigoEdit.value = null
  modalOpen.value = true
}

function abrirEditar(codigo: number) {
  modalMode.value = 'edit'
  codigoEdit.value = codigo
  modalOpen.value = true
}

async function excluirProduto(codigo: number) {
  const confirmar = await confirmarAcao(`Deseja realmente excluir o produto #${codigo}?`)

  if (!confirmar) return

  try {
    await produtosService.excluir(codigo)

    toastSucesso('Produto excluído com sucesso!')

    if (pagina.value && pagina.value.content.length === 1 && pageIndex.value > 0) {
      pageIndex.value -= 1
    }

    carregar()
  } catch (e: any) {
    const status = e?.response?.status

    if (status === 409) {
      const confirmarForcado = await confirmarAcao(
        'Este produto possui movimentações vinculadas.\n\nSe continuar, todas as movimentações serão apagadas.\n\nDeseja continuar?',
      )

      if (!confirmarForcado) return

      try {
        await produtosService.excluirForcado(codigo)

        toastSucesso('Produto e movimentações excluídos com sucesso!')

        if (pagina.value && pagina.value.content.length === 1 && pageIndex.value > 0) {
          pageIndex.value -= 1
        }

        carregar()
      } catch (erroForcado) {
        toastErro(extrairMensagemErro(erroForcado, 'Erro ao excluir produto.'))
      }

      return
    }

    toastErro(extrairMensagemErro(e, 'Erro ao excluir produto.'))
  }
}

function onSaved() {
  carregar()
}

function aplicarFiltro() {
  if (descricaoTimer) {
    window.clearTimeout(descricaoTimer)
    descricaoTimer = null
  }

  const desc = descricaoNormalizada.value
  if (desc.length > 0 && desc.length < 3) return

  pageIndex.value = 0
  carregar()
}

function limparFiltros() {
  if (descricaoTimer) {
    window.clearTimeout(descricaoTimer)
    descricaoTimer = null
  }

  descricao.value = ''
  tipo.value = ''
  sort.value = 'codigo,desc'
  pageIndex.value = 0
  carregar()
}

function onChangePage(newPage: number) {
  pageIndex.value = newPage
  carregar()
}

watch(descricaoNormalizada, (novo) => {
  pageIndex.value = 0

  if (descricaoTimer) window.clearTimeout(descricaoTimer)

  if (!novo) {
    descricaoTimer = window.setTimeout(() => carregar(), 250)
    return
  }

  if (novo.length < 3) {
    descricaoTimer = null
    return
  }

  descricaoTimer = window.setTimeout(() => {
    carregar()
  }, 350)
})

onMounted(() => {
  carregar()
})
</script>

<template>
  <div class="page">
    <div class="topbar card">
      <div class="topbar-left">
        <h2 class="title">Produtos</h2>
        <span v-if="pagina" class="subtitle">{{ pagina.totalElements }} itens</span>
      </div>

      <div class="topbar-right">
        <div class="control grow">
          <label class="label">Descrição</label>

          <input
            ref="descricaoInput"
            class="input"
            v-model.trim="descricao"
            type="text"
            placeholder="Buscar por descrição…"
            autocomplete="off"
            :readonly="carregando"
            @keydown.enter.prevent="aplicarFiltro"
          />
        </div>

        <div class="control">
          <label class="label">Tipo</label>
          <select class="select" v-model="tipo" :disabled="carregando" @change="aplicarFiltro">
            <option value="">Todos</option>
            <option value="ELETRONICO">Eletrônico</option>
            <option value="ELETRODOMESTICO">Eletrodoméstico</option>
            <option value="MOVEL">Móvel</option>
          </select>
        </div>

        <div class="control">
          <label class="label">Ordenação</label>
          <select class="select" v-model="sort" :disabled="carregando" @change="aplicarFiltro">
            <option value="codigo,desc">Código (desc)</option>
            <option value="codigo,asc">Código (asc)</option>
            <option value="descricao,asc">Descrição (A-Z)</option>
            <option value="descricao,desc">Descrição (Z-A)</option>
          </select>
        </div>

        <div class="control clear-holder">
          <label class="label">&nbsp;</label>
          <button
            class="clear-filters"
            type="button"
            :disabled="carregando || !temFiltrosAtivos"
            title="Limpar filtros"
            @click="limparFiltros"
          >
            Limpar filtros
          </button>
        </div>
      </div>
    </div>

    <div v-if="carregando" class="card" style="text-align: center">Carregando...</div>

    <ResponsiveDataView
      v-else
      :items="items"
      :columns="columns"
      :key-extractor="keyExtractor"
      empty-title="Sem produtos"
      empty-subtitle="Cadastre um produto para começar."
    >
      <template #card="{ row }">
        <BaseCard :title="row.tipoProduto" accent="primary">
          <CardField label="Código" :value="row.codigo" />
          <CardField label="Descrição" :value="row.descricao" />
          <CardField
            label="Valor no fornecedor"
            :value="formatarMoeda(row.valorNoFornecedor)"
            variant="money"
          />
          <CardField label="Estoque" :value="row.estoque" variant="pill" />

          <div class="actions">
            <button class="icon-btn edit" @click="abrirEditar(row.codigo)" title="Editar">
              <Pencil class="lucide" :size="18" />
            </button>

            <button class="icon-btn delete" @click="excluirProduto(row.codigo)" title="Excluir">
              <Trash2 class="lucide" :size="18" />
            </button>
          </div>
        </BaseCard>
      </template>

      <template #cell="{ row, col }">
        <template v-if="col.key === 'actions'">
          <div class="actions-table">
            <button class="icon-btn edit" @click="abrirEditar(row.codigo)" title="Editar">
              <Pencil class="lucide" :size="18" />
            </button>

            <button class="icon-btn delete" @click="excluirProduto(row.codigo)" title="Excluir">
              <Trash2 class="lucide" :size="18" />
            </button>
          </div>
        </template>

        <template v-else-if="col.key === 'valorNoFornecedor'">
          {{ formatarMoeda(row.valorNoFornecedor) }}
        </template>

        <template v-else>
          {{ col.field ? row[col.field] : '—' }}
        </template>
      </template>
    </ResponsiveDataView>

    <AppPagination
      v-if="pagina"
      :page="pagina.number"
      :total-pages="pagina.totalPages"
      :disabled="carregando"
      :max-buttons="5"
      @change="onChangePage"
    />

    <FabButton :disabled="carregando" @click="abrirNovo" />

    <ProdutoModal
      :open="modalOpen"
      :mode="modalMode"
      :codigo="codigoEdit"
      @close="modalOpen = false"
      @saved="onSaved"
    />
  </div>
</template>

<style scoped>
.page {
  padding: 16px 18px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 14px;
  margin-bottom: 8px;
}

.topbar-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.subtitle {
  font-size: 13px;
  color: #666;
}

.topbar-right {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control.grow {
  flex: 1;
  min-width: 240px;
}

.label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #7a7a7a;
  text-transform: uppercase;
}

.select,
.input {
  height: 32px;
  padding: 0 10px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: white;
  width: 100%;
}

.select {
  min-width: 170px;
}

.select:focus,
.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(15, 92, 87, 0.12);
}

.input[readonly] {
  opacity: 0.9;
}

.hint {
  margin-top: 4px;
  font-size: 11px;
  color: #777;
}

.clear-holder {
  min-width: 150px;
}

.clear-filters {
  height: 32px;
  padding: 0 12px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: #fff;
  cursor: pointer;
  white-space: nowrap;
}

.clear-filters:hover {
  background: rgba(15, 92, 87, 0.06);
}

.clear-filters:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

:deep(table) {
  font-size: 14px;
}

:deep(th) {
  padding: 12px 10px;
}

:deep(td) {
  padding: 10px 10px;
}

.card {
  padding: 14px 16px;
}

.actions,
.actions-table {
  margin-top: 10px;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: nowrap;
}

.actions-table {
  margin-top: 0;
  justify-content: center;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 0;
}

.icon-btn:hover {
  background: rgba(15, 92, 87, 0.06);
}

.icon-btn.edit:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.icon-btn.delete:hover {
  border-color: #dc2626;
  color: #dc2626;
}

.lucide {
  color: currentColor;
}

:deep(.pagination) {
  margin-top: 12px;
}

@media (max-width: 700px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .topbar-right {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .control.grow,
  .select,
  .clear-holder {
    min-width: 0;
  }

  .clear-filters {
    width: 100%;
  }
}
</style>
