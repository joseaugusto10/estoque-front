<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@/shared/utils/useMediaQuery'

export type Align = 'left' | 'center' | 'right'

export type Column<T> = {
  key: string
  header: string
  width?: string | number
  align?: Align
  render?: (row: T) => unknown
  field?: keyof T
}

type Props<T> = {
  items: T[]
  columns: Column<T>[]
  keyExtractor: (row: T) => string | number

  emptyTitle?: string
  emptySubtitle?: string
}

const props = defineProps<Props<any>>()

const isDesktop = useMediaQuery('(min-width: 900px)')
const showTable = computed(() => isDesktop.value)
</script>

<template>
  <div>
    <!-- vazio -->
    <div v-if="!props.items?.length" class="empty card">
      <h3 class="empty-title">{{ props.emptyTitle ?? 'Nada por aqui' }}</h3>
      <p class="empty-subtitle">{{ props.emptySubtitle ?? 'Nenhum registro encontrado.' }}</p>
    </div>

    <!-- MOBILE: cards -->
    <div v-else-if="!showTable" class="cards">
      <div v-for="row in props.items" :key="props.keyExtractor(row)">
        <slot name="card" :row="row" />
      </div>
    </div>

    <!-- WEB: tabela -->
    <div v-else class="table-wrap card">
      <table class="table">
        <thead>
          <tr>
            <th
              v-for="col in props.columns"
              :key="col.key"
              :style="{ width: typeof col.width === 'number' ? col.width + 'px' : col.width }"
              class="th"
            >
              {{ col.header }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in props.items" :key="props.keyExtractor(row)" class="tr">
            <td v-for="col in props.columns" :key="col.key" class="td">
              <slot v-if="$slots.cell" name="cell" :row="row" :col="col" />
              <template v-else-if="col.render">
                {{ col.render(row) as any }}
              </template>
              <template v-else-if="col.field">
                {{ row[col.field] }}
              </template>
              <template v-else>—</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* mobile first */
.cards {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* web tabela */
.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

.th {
  padding: 14px 12px;
  background-color: var(--color-primary);
  color: white;
  font-weight: 800;
  font-size: 14px;
  text-align: center;
  letter-spacing: 0.5px;
}

.td {
  padding: 14px 12px;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
  text-align: center;
}

.tr:hover .td {
  background: rgba(15, 92, 87, 0.06);
}

.empty {
  text-align: center;
}

.empty-title {
  margin-bottom: 6px;
  font-weight: 700;
}

.empty-subtitle {
  color: #666;
  font-size: 13px;
}
</style>
