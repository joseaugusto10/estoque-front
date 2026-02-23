<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import ResponsiveDataView from '@/shared/components/ResponsiveDataView.vue'
import BaseCard from '@/shared/components/BaseCard.vue'
import CardField from '@/shared/components/CardField.vue'
import AppPagination from '@/shared/components/AppPagination.vue'

import type { Column } from '@/shared/components/ResponsiveDataView.vue'
import type { Page } from '@/types/paginacao'
import type { TipoProduto } from '@/types/enums'
import type { ProdutoResumoResponse, LucroProdutoResponse } from '@/types/produto'

import { produtosService } from '@/services/produtos.service'
import { toastErro } from '@/shared/utils/alert'
import { extrairMensagemErro } from '@/shared/api/error'
import { formatarMoeda } from '@/shared/utils/formatacao'

const carregandoResumo = ref(false)
const paginaResumo = ref<Page<ProdutoResumoResponse> | null>(null)

const pageIndexResumo = ref(0)
const pageSizeResumo = ref(8)
const sortResumo = ref('codigo,desc')
const tipoResumo = ref<TipoProduto | ''>('')

const itemsResumo = computed(() => paginaResumo.value?.content ?? [])

const columnsResumo: Column<ProdutoResumoResponse>[] = [
  { key: 'codigo', header: 'Código', field: 'codigo', width: 90 },
  { key: 'descricao', header: 'Descrição', field: 'descricao', width: 150 },
  { key: 'tipoProduto', header: 'Tipo', field: 'tipoProduto', width: 120 },
  { key: 'estoqueDisponivel', header: 'Disponível', field: 'estoqueDisponivel', width: 110 },
  { key: 'quantidadeTotalSaida', header: 'Saídas', field: 'quantidadeTotalSaida', width: 100 },
  { key: 'valorNoFornecedor', header: 'Valor Fornecedor', field: 'valorNoFornecedor', width: 140 },
]

const keyExtractorResumo = (p: ProdutoResumoResponse) => p.codigo

async function carregarResumo() {
  try {
    carregandoResumo.value = true
    paginaResumo.value = await produtosService.listarResumo({
      page: pageIndexResumo.value,
      size: pageSizeResumo.value,
      sort: sortResumo.value,
      tipo: (tipoResumo.value || undefined) as any,
    })
  } catch (e) {
    toastErro(extrairMensagemErro(e, 'Erro ao carregar resumo de produtos.'))
  } finally {
    carregandoResumo.value = false
  }
}

function aplicarFiltroResumo() {
  pageIndexResumo.value = 0
  carregarResumo()
}

function onChangePageResumo(newPage: number) {
  pageIndexResumo.value = newPage
  carregarResumo()
}

const carregandoLucro = ref(false)
const codigoProdutoLucro = ref<number | ''>('')
const lucro = ref<LucroProdutoResponse | null>(null)

const podeConsultarLucro = computed(() => {
  return codigoProdutoLucro.value !== '' && Number(codigoProdutoLucro.value) > 0
})

async function consultarLucro() {
  if (!podeConsultarLucro.value) return

  try {
    carregandoLucro.value = true
    lucro.value = await produtosService.consultarLucro(Number(codigoProdutoLucro.value))
  } catch (e) {
    lucro.value = null
    toastErro(extrairMensagemErro(e, 'Erro ao consultar lucro do produto.'))
  } finally {
    carregandoLucro.value = false
  }
}

function limparLucro() {
  codigoProdutoLucro.value = ''
  lucro.value = null
}

type Tab = 'resumo' | 'lucro'
const tab = ref<Tab>('resumo')

onMounted(() => {
  carregarResumo()
})
</script>

<template>
  <div class="page">
    <div class="hero card">
      <div class="hero-left">
        <h2 class="title">Relatórios</h2>
        <p class="subtitle">Visão gerencial: resumo por tipo e lucro por produto.</p>
      </div>

      <div class="tabs">
        <button
          class="tab"
          :class="{ active: tab === 'resumo' }"
          type="button"
          @click="tab = 'resumo'"
        >
          Resumo por Tipo
        </button>

        <button
          class="tab"
          :class="{ active: tab === 'lucro' }"
          type="button"
          @click="tab = 'lucro'"
        >
          Lucro por Produto
        </button>
      </div>
    </div>
    <div v-if="tab === 'resumo'" class="card section">
      <div class="topbar">
        <div class="topbar-left">
          <h3 class="section-title">Produtos por tipo</h3>
          <span v-if="paginaResumo" class="section-meta"
            >{{ paginaResumo.totalElements }} itens</span
          >
        </div>

        <div class="topbar-right">
          <div class="control">
            <label class="label">Tipo</label>
            <select class="select" v-model="tipoResumo" @change="aplicarFiltroResumo">
              <option value="">Todos</option>
              <option value="ELETRONICO">Eletrônico</option>
              <option value="ELETRODOMESTICO">Eletrodoméstico</option>
              <option value="MOVEL">Móvel</option>
            </select>
          </div>

          <div class="control">
            <label class="label">Ordenação</label>
            <select class="select" v-model="sortResumo" @change="aplicarFiltroResumo">
              <option value="codigo,desc">Código (desc)</option>
              <option value="codigo,asc">Código (asc)</option>
              <option value="descricao,asc">Descrição (A-Z)</option>
              <option value="descricao,desc">Descrição (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="carregandoResumo" class="loading">Carregando resumo...</div>

      <ResponsiveDataView
        v-else
        :items="itemsResumo"
        :columns="columnsResumo"
        :key-extractor="keyExtractorResumo"
        empty-title="Sem dados de resumo"
        empty-subtitle="Cadastre produtos e registre movimentações para visualizar o relatório."
      >
        <!-- MOBILE: cards -->
        <template #card="{ row }">
          <BaseCard :title="row.tipoProduto" accent="primary">
            <CardField label="Produto" :value="`${row.descricao} (#${row.codigo})`" />
            <CardField label="Disponível" :value="row.estoqueDisponivel" variant="pill" />
            <CardField label="Total de saídas" :value="row.quantidadeTotalSaida" variant="pill" />
            <CardField
              label="Valor no fornecedor"
              :value="formatarMoeda(row.valorNoFornecedor)"
              variant="money"
            />
          </BaseCard>
        </template>

        <!-- WEB: tabela -->
        <template #cell="{ row, col }">
          <template v-if="col.key === 'valorNoFornecedor'">
            {{ formatarMoeda(row.valorNoFornecedor) }}
          </template>

          <template v-else>
            {{ col.field ? row[col.field] : '—' }}
          </template>
        </template>
      </ResponsiveDataView>

      <AppPagination
        v-if="paginaResumo"
        :page="paginaResumo.number"
        :total-pages="paginaResumo.totalPages"
        :disabled="carregandoResumo"
        :max-buttons="5"
        @change="onChangePageResumo"
      />
    </div>

    <div v-else class="card section">
      <div class="topbar">
        <div class="topbar-left">
          <h3 class="section-title">Lucro por produto</h3>
          <span class="section-meta">Consulte pelo código do produto</span>
        </div>
      </div>

      <div class="lucro-grid">
        <div class="lucro-form card-inner">
          <div class="field">
            <label class="label">Código do produto</label>
            <input
              v-model="codigoProdutoLucro"
              class="input"
              type="number"
              min="1"
              placeholder="Ex: 10"
              @keyup.enter="consultarLucro"
            />
          </div>

          <div class="buttons">
            <button
              class="btn primary"
              :disabled="carregandoLucro || !podeConsultarLucro"
              @click="consultarLucro"
            >
              <span v-if="carregandoLucro">Consultando...</span>
              <span v-else>Consultar</span>
            </button>

            <button class="btn" :disabled="carregandoLucro" @click="limparLucro">Limpar</button>
          </div>

          <div class="hint">
            Dica: se você ainda não registrou <strong>saídas</strong> com
            <strong>valor de venda</strong>, o lucro pode vir zerado.
          </div>
        </div>

        <div class="lucro-result card-inner">
          <div v-if="!lucro" class="empty-state">
            <div class="empty-title">Sem consulta ainda</div>
            <div class="empty-subtitle">
              Informe o código e clique em <strong>Consultar</strong> para ver o lucro total.
            </div>
          </div>

          <div v-else class="result">
            <div class="result-head">
              <div class="badge">Produto #{{ lucro.codigoProduto }}</div>
              <div class="name">{{ lucro.descricao }}</div>
              <div class="type">{{ lucro.tipoProduto }}</div>
            </div>

            <div class="result-body">
              <div class="kpi">
                <div class="kpi-label">Total de saídas</div>
                <div class="kpi-value">{{ lucro.quantidadeTotalSaida }}</div>
              </div>

              <div class="kpi highlight">
                <div class="kpi-label">Lucro total</div>
                <div class="kpi-value">{{ formatarMoeda(lucro.lucroTotal) }}</div>
              </div>
            </div>

            <div class="note">
              * Cálculo: <strong>(valor de venda − valor do fornecedor)</strong> somando para todas
              as saídas.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 16px 18px;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  margin-bottom: 10px;
}

.hero-left {
  display: grid;
  gap: 4px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
}

.subtitle {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.tabs {
  display: inline-flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.04);
  padding: 6px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
}

.tab {
  height: 34px;
  padding: 0 12px;
  border-radius: 12px;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-weight: 900;
  font-size: 12px;
  color: #444;
}

.tab.active {
  background: var(--color-primary);
  color: #fff;
}

.section {
  padding: 14px 16px;
}

.topbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 10px;
}

.topbar-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 900;
}

.section-meta {
  font-size: 12px;
  color: #666;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.6px;
  color: #7a7a7a;
  text-transform: uppercase;
}

.select {
  height: 32px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: white;
  outline: none;
  min-width: 170px;
}

.select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(15, 92, 87, 0.12);
}

.loading {
  text-align: center;
  padding: 16px 0;
  color: #555;
}

.lucro-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 12px;
}

.card-inner {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 14px;
  background: #fff;
}

.field {
  display: grid;
  gap: 6px;
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

.buttons {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.btn {
  height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: #fff;
  cursor: pointer;
  font-weight: 900;
}

.btn.primary {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
  line-height: 1.35;
}

.empty-state {
  text-align: center;
  padding: 18px 10px;
}

.empty-title {
  font-weight: 900;
  margin-bottom: 6px;
}

.empty-subtitle {
  font-size: 13px;
  color: #666;
}

.result-head {
  display: grid;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: #fafafa;
  font-weight: 900;
  font-size: 12px;
}

.name {
  font-weight: 900;
  font-size: 16px;
}

.type {
  font-size: 12px;
  color: #666;
  font-weight: 800;
}

.result-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding-top: 12px;
}

.kpi {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 12px;
  background: #fff;
}

.kpi-label {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #7a7a7a;
  margin-bottom: 6px;
}

.kpi-value {
  font-size: 18px;
  font-weight: 1000;
  color: #222;
}

.kpi.highlight {
  border-color: rgba(15, 92, 87, 0.35);
  background: rgba(15, 92, 87, 0.06);
}

.note {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
}

@media (max-width: 900px) {
  .hero {
    flex-direction: column;
    align-items: stretch;
  }

  .tabs {
    width: 100%;
    justify-content: space-between;
  }

  .lucro-grid {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .topbar-right {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .select {
    width: 100%;
    min-width: 0;
  }
}
</style>
