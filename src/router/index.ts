import { createRouter, createWebHashHistory } from 'vue-router'
import { useGameStore } from '../stores/game'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/shopping',
      name: 'shopping',
      component: () => import('../views/ShoppingView.vue'),
    },
    {
      path: '/cooking',
      name: 'cooking',
      component: () => import('../views/CookingView.vue'),
    },
    {
      path: '/result',
      name: 'result',
      component: () => import('../views/ResultView.vue'),
    },
    {
      path: '/collection',
      name: 'collection',
      component: () => import('../views/CollectionView.vue'),
    },
  ],
})

// Route guards: redirect to home if accessing game pages without valid state
router.beforeEach((to) => {
  // Skip guard for home and collection (always accessible)
  if (to.name === 'home' || to.name === 'collection') return true

  const game = useGameStore()

  if (to.name === 'shopping' && game.phase !== 'shopping') {
    return { name: 'home' }
  }
  if (to.name === 'cooking' && game.phase !== 'cooking') {
    return { name: 'home' }
  }
  if (to.name === 'result' && game.phase !== 'result') {
    return { name: 'home' }
  }

  return true
})

export default router
