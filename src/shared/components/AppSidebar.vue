<script setup lang="ts">
import { useRoute } from 'vue-router'

type Props = {
  aberta: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'fechar'): void
}>()

const route = useRoute()

function fechar() {
  emit('fechar')
}
</script>

<template>
  <div>
    <!-- overlay no mobile -->
    <div v-if="aberta" class="overlay" @click="fechar"></div>

    <aside class="sidebar" :class="{ open: aberta }">
      <div class="brand">
        <div class="logo"></div>
        <div class="brand-text">
          <strong>Estoque</strong>
          <span>Sistema</span>
        </div>
      </div>

      <nav class="nav">
        <router-link
          to="/produtos"
          class="link"
          :class="{ active: route.path.startsWith('/produtos') }"
          @click="fechar"
        >
          Produtos
        </router-link>

        <router-link
          to="/movimentacoes"
          class="link"
          :class="{ active: route.path.startsWith('/movimentacoes') }"
          @click="fechar"
        >
          Movimentações
        </router-link>

        <router-link
          to="/relatorios"
          class="link"
          :class="{ active: route.path.startsWith('/relatorios') }"
          @click="fechar"
        >
          Relatórios
        </router-link>
      </nav>
    </aside>
  </div>
</template>

<style scoped>
/* overlay aparece só no mobile */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 20;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--sidebar-width);
  background: var(--color-white);
  border-right: 1px solid var(--color-border);
  transform: translateX(-100%);
  transition: transform 0.2s ease;
  z-index: 30;
  padding: 12px;
}

.sidebar.open {
  transform: translateX(0);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px 14px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 12px;
}

.logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-primary);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-text span {
  font-size: 12px;
  color: #666;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
}

.link {
  text-decoration: none;
  padding: 10px 10px;
  border-radius: 8px;
  color: #2b2b2b;
  font-weight: 500;
}

.link:hover {
  background: #f2f4f5;
}

.link.active {
  background: rgba(15, 92, 87, 0.12);
  color: var(--color-primary);
}

@media (min-width: 900px) {
  .overlay {
    display: none;
  }

  .sidebar {
    transform: translateX(0);
    z-index: 1;
  }
}
</style>
