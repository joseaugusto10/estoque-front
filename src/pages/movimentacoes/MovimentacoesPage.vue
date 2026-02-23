<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

import ResponsiveDataView from '@/shared/components/ResponsiveDataView.vue'
import BaseCard from '@/shared/components/BaseCard.vue'
import CardField from '@/shared/components/CardField.vue'
import AppPagination from '@/shared/components/AppPagination.vue'
import FabButton from '@/shared/components/FabButton.vue'

import type { Column } from '@/shared/components/ResponsiveDataView.vue'
import type { Page } from '@/types/paginacao'
import type { MovimentoEstoqueResponse } from '@/types/movimentacao-estoque'
import type { TipoMovimentacao } from '@/types/enums'

import { movimentosService } from '@/services/movimentos.service'
import { toastErro } from '@/shared/utils/alert'
import { extrairMensagemErro } from '@/shared/api/error'
import { formatarData, formatarMoeda } from '@/shared/utils/formatacao'
import MovimentoModal from '@/shared/components/modals/movimentos/MovimentoModal.vue'

const carregando = ref(false)
const pagina = ref<Page<MovimentoEstoqueResponse> | null>(null)

const pageIndex = ref(0)
const pageSize = ref(8)
const sort = ref('codigoMovimentacao,desc')

const tipoMovimentacao = ref<TipoMovimentacao | ''>('')
const codigoProduto = ref<number | ''>('')

const items = computed(() => pagina.value?.content ?? [])

const columns: Column<MovimentoEstoqueResponse>[] = [
  { key: 'codigoMovimentacao', header: 'Código Mov', field: 'codigoMovimentacao', width: 100 },
  { key: 'codigoProduto', header: 'Codigo Produto', field: 'codigoProduto', width: 130 },
  { key: 'descricaoProduto', header: 'Descrição', field: 'descricaoProduto', width: 90 },
  { key: 'tipoMovimentacao', header: 'Tipo', field: 'tipoMovimentacao', width: 120 },
  { key: 'qtdMovimentada', header: 'Qtd', field: 'qtdMovimentada', width: 70 },
  { key: 'dataMovimento', header: 'Movimento', field: 'dataMovimento', width: 120 },
  { key: 'dataVenda', header: 'Venda', field: 'dataVenda', width: 120 },
  { key: 'valorVenda', header: 'Valor', field: 'valorVenda', width: 120 },
]

const keyExtractor = (m: MovimentoEstoqueResponse) => m.codigoMovimentacao

async function carregar() {
  try {
    carregando.value = true

    pagina.value = await movimentosService.listar({
      page: pageIndex.value,
      size: pageSize.value,
      sort: sort.value,
      codigoProduto: codigoProduto.value === '' ? undefined : Number(codigoProduto.value),
      tipoMovimentacao: tipoMovimentacao.value === '' ? undefined : tipoMovimentacao.value,
    })
  } catch (e) {
    toastErro(extrairMensagemErro(e, 'Erro ao carregar movimentações.'))
  } finally {
    carregando.value = false
  }
}

function aplicarFiltro() {
  pageIndex.value = 0
  carregar()
}

function onChangePage(newPage: number) {
  pageIndex.value = newPage
  carregar()
}

const modalOpen = ref(false)

function abrirNovo() {
  modalOpen.value = true
}

function onSaved() {
  carregar()
}

onMounted(() => {
  carregar()
})
</script>

<template>
  <div class="page">
    <div class="topbar card">
      <div class="topbar-left">
        <h2 class="title">Movimentações</h2>
        <span v-if="pagina" class="subtitle">{{ pagina.totalElements }} itens</span>
      </div>

      <div class="topbar-right">
        <div class="control">
          <label class="label">Tipo</label>
          <select class="select" v-model="tipoMovimentacao" @change="aplicarFiltro">
            <option value="">Todos</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>
        </div>

        <div class="control">
          <label class="label">Produto</label>
          <input
            class="select"
            v-model="codigoProduto"
            @change="aplicarFiltro"
            type="number"
            min="1"
            placeholder="Cód."
          />
        </div>

        <div class="control">
          <label class="label">Ordenação</label>
          <select class="select" v-model="sort" @change="aplicarFiltro">
            <option value="codigoMovimentacao,desc">Código (desc)</option>
            <option value="codigoMovimentacao,asc">Código (asc)</option>
            <option value="dataMovimento,desc">Data (mais recente)</option>
            <option value="dataMovimento,asc">Data (mais antiga)</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="carregando" class="card" style="text-align: center">Carregando...</div>

    <ResponsiveDataView
      v-else
      :items="items"
      :columns="columns"
      :key-extractor="keyExtractor"
      empty-title="Sem movimentações"
      empty-subtitle="Registre uma entrada/saída para começar."
    >
      <!-- MOBILE: cards -->
      <template #card="{ row }">
        <BaseCard :title="row.tipoMovimentacao" accent="primary">
          <CardField label="Movimento" :value="`#${row.codigoMovimentacao}`" />
          <CardField label="Produto" :value="`#${row.codigoProduto}`" />
          <CardField label="Descrição" :value="row.descricaoProduto ?? '—'" />
          <CardField label="Qtd movimentada" :value="row.qtdMovimentada" variant="pill" />
          <CardField label="Data movimento" :value="formatarData(row.dataMovimento)" />
          <CardField label="Data venda" :value="formatarData(row.dataVenda)" />
          <CardField label="Valor venda" :value="formatarMoeda(row.valorVenda)" variant="money" />
        </BaseCard>
      </template>

      <!-- WEB: tabela -->
      <template #cell="{ row, col }">
        <template v-if="col.key === 'dataMovimento'">
          {{ formatarData(row.dataMovimento) }}
        </template>

        <template v-else-if="col.key === 'dataVenda'">
          {{ formatarData(row.dataVenda) }}
        </template>

        <template v-else-if="col.key === 'valorVenda'">
          {{ formatarMoeda(row.valorVenda) }}
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

    <MovimentoModal :open="modalOpen" @close="modalOpen = false" @saved="onSaved" />
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
  align-items: center;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #7a7a7a;
  text-transform: uppercase;
}

.select {
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: white;
  min-width: 150px;
  outline: none;
}

.select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(15, 92, 87, 0.12);
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
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .select {
    width: 100%;
    min-width: 0;
  }
}
</style>
