<script setup lang="ts">
type Props = {
  title?: string
  accent?: 'primary' | 'success' | 'danger' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  accent: 'primary',
})
</script>

<template>
  <div class="base-card" :class="`accent-${props.accent}`">
    <div v-if="props.title" class="card-title">{{ props.title }}</div>

    <div class="card-body">
      <slot />
    </div>

    <div class="accent-bar"></div>
  </div>
</template>

<style scoped>
.base-card {
  position: relative;
  background: var(--color-white);
  border-radius: 14px;
  padding: 18px 18px 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-title {
  text-align: center;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  color: var(--color-primary);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
}

.accent-bar {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  border-radius: 0 14px 14px 0;
  background: var(--color-primary);
}

.accent-primary .accent-bar {
  background: var(--color-primary);
}
.accent-success .accent-bar {
  background: var(--color-success);
}
.accent-danger .accent-bar {
  background: var(--color-error);
}
.accent-info .accent-bar {
  background: var(--color-primary-light);
}
</style>
