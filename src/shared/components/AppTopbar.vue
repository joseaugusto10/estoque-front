<script setup lang="ts">
defineProps<{
  mostrarMenu: boolean
}>()
</script>

<template>
  <header class="topbar">
    <button v-if="mostrarMenu" class="menu-btn" @click="$emit('abrirMenu')">☰</button>
  </header>
</template>

<style scoped>
.topbar {
  height: var(--header-height);
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.menu-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 22px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.title {
  font-size: 16px;
  font-weight: 600;
}
</style>
