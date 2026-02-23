<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppSidebar from '@/shared/components/AppSidebar.vue'
import AppTopbar from '@/shared/components/AppTopbar.vue'
import { useMediaQuery } from '@/shared/utils/useMediaQuery'

const isDesktop = useMediaQuery('(min-width: 900px)')
const mostrarMenu = computed(() => !isDesktop.value)

const sidebarAberta = ref(false)

// quando virar desktop, não precisa manter overlay aberto
watch(isDesktop, (desktop) => {
  if (desktop) sidebarAberta.value = false
})

function abrirMenu() {
  if (!mostrarMenu.value) return
  sidebarAberta.value = true
}

function fecharMenu() {
  if (!mostrarMenu.value) return
  sidebarAberta.value = false
}

// Para o desktop, sidebar fica "sempre visível" via CSS.
// Para o mobile, usamos a classe open (aberta).
const sidebarOpen = computed(() => (isDesktop.value ? true : sidebarAberta.value))
</script>

<template>
  <div class="app">
    <AppSidebar :aberta="sidebarOpen" @fechar="fecharMenu" />

    <div class="main">
      <AppTopbar :mostrar-menu="mostrarMenu" @abrirMenu="abrirMenu" />

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
}

.main {
  width: 100%;
}

/* desktop: empurra o conteúdo pra direita por causa da sidebar fixa */
@media (min-width: 900px) {
  .main {
    margin-left: var(--sidebar-width);
  }
}

.content {
  padding: 16px;
}
</style>
