import { createRouter, createWebHistory } from 'vue-router'

const ProdutosPage = () => import('@/pages/produtos/ProdutosPage.vue')
const MovimentacoesPage = () => import('@/pages/movimentacoes/MovimentacoesPage.vue')
const RelatoriosPage = () => import('@/pages/relatorios/RelatoriosPage.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/produtos' },
    { path: '/produtos', component: ProdutosPage },
    { path: '/movimentacoes', component: MovimentacoesPage },
    { path: '/relatorios', component: RelatoriosPage },
  ],
})

export default router
