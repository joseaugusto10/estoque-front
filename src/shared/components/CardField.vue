<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  variant?: 'text' | 'pill' | 'money' | 'badge'
}>()
</script>

<template>
  <div class="field">
    <div class="label">{{ label }}</div>

    <div v-if="variant === 'pill'" class="pill">{{ value }}</div>
    <div v-else-if="variant === 'badge'" class="badge">{{ value }}</div>
    <div v-else-if="variant === 'money'" class="money">{{ value }}</div>
    <div v-else class="value">{{ value }}</div>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: #7a7a7a;
  text-transform: uppercase;
}

.value {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.money {
  font-size: 18px;
  font-weight: 800;
  color: #222;
}

.pill {
  display: inline-flex;
  align-self: center;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  font-weight: 700;
  font-size: 13px;
  background: #fafafa;
}

.badge {
  display: inline-flex;
  align-self: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
  color: white;
  background: var(--color-success);
}
</style>
