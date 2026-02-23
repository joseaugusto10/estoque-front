<script setup lang="ts">
type Props = {
  disabled?: boolean
  bottom?: string
  right?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  bottom: '24px',
  right: '24px',
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

function onClick() {
  if (props.disabled) return
  emit('click')
}
</script>

<template>
  <button
    class="fab"
    :disabled="props.disabled"
    @click="onClick"
    :style="{ bottom: props.bottom, right: props.right }"
    title="Novo"
  >
    +
  </button>
</template>

<style scoped>
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;

  width: 60px;
  height: 60px;

  border-radius: 50%;
  border: none;

  background: var(--color-primary);
  color: white;

  font-size: 28px;
  font-weight: 800;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);

  transition:
    transform 0.15s ease,
    filter 0.15s ease;
}

.fab:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(0.95);
}

.fab:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
