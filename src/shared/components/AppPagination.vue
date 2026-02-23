<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  page: number
  totalPages: number
  disabled?: boolean
  maxButtons?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  maxButtons: 5,
})

const emit = defineEmits<{
  (e: 'change', newPage: number): void
}>()

const pageHuman = computed(() => props.page + 1)

const middlePages = computed(() => {
  const total = props.totalPages
  const current = props.page
  const max = Math.max(1, props.maxButtons)

  if (total <= 2) return []

  const firstMiddle = 1
  const lastMiddle = total - 2

  const available = lastMiddle - firstMiddle + 1
  const windowSize = Math.min(max, available)

  const clampedCurrent = Math.min(Math.max(current, firstMiddle), lastMiddle)
  const half = Math.floor(windowSize / 2)

  let start = clampedCurrent - half
  let end = start + windowSize - 1

  if (start < firstMiddle) {
    start = firstMiddle
    end = start + windowSize - 1
  }
  if (end > lastMiddle) {
    end = lastMiddle
    start = end - windowSize + 1
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const showLeftDots = computed(() => {
  const arr = middlePages.value
  const first = arr[0]
  return first != null && first > 1
})

const showRightDots = computed(() => {
  const arr = middlePages.value
  const lastMiddle = props.totalPages - 2
  const last = arr.length > 0 ? arr[arr.length - 1] : undefined
  return last != null && last < lastMiddle
})

function go(newPage: number) {
  if (props.disabled) return
  if (newPage < 0 || newPage >= props.totalPages) return
  if (newPage === props.page) return
  emit('change', newPage)
}

function prev() {
  go(props.page - 1)
}

function next() {
  go(props.page + 1)
}
</script>

<template>
  <div v-if="props.totalPages > 1" class="pagination">
    <button class="nav" :disabled="props.disabled || props.page === 0" @click="prev">
      Anterior
    </button>

    <div class="numbers">
      <button
        class="num"
        :class="{ active: props.page === 0 }"
        :disabled="props.disabled"
        @click="go(0)"
      >
        1
      </button>

      <span v-if="showLeftDots" class="dots">…</span>

      <button
        v-for="p in middlePages"
        :key="p"
        class="num"
        :class="{ active: p === props.page }"
        :disabled="props.disabled"
        @click="go(p)"
      >
        {{ p + 1 }}
      </button>

      <span v-if="showRightDots" class="dots">…</span>

      <button
        class="num"
        :class="{ active: props.page === props.totalPages - 1 }"
        :disabled="props.disabled"
        @click="go(props.totalPages - 1)"
      >
        {{ props.totalPages }}
      </button>
    </div>

    <button
      class="nav"
      :disabled="props.disabled || props.page === props.totalPages - 1"
      @click="next"
    >
      Próxima
    </button>
  </div>

  <div v-if="props.totalPages > 0" class="hint">
    Página <strong>{{ pageHuman }}</strong> de <strong>{{ props.totalPages }}</strong>
  </div>
</template>

<style scoped>
.pagination {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.numbers {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav {
  border: 1px solid var(--color-border);
  background: white;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 700;
}

.nav:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(15, 92, 87, 0.06);
}

.num {
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 800;
}

.num:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(15, 92, 87, 0.06);
}

.num.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.dots {
  color: #888;
  font-weight: 900;
  padding: 0 2px;
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.hint {
  margin-top: 10px;
  text-align: center;
  font-size: 13px;
  color: #444;
}
</style>
