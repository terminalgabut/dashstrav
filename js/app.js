/**
 * js/app.js
 * Refactored: Native Vue Router Lazy Loading
 */

// 1. Definisi Routes dengan Native Lazy Loading
// Kita tidak perlu defineAsyncComponent untuk routes.
// Vue Router akan menangani Promise dari import() secara otomatis.
const routes = [
    { 
        path: '/', 
        name: 'dashboard',
        component: () => import('./views/Dashboard.js')
    },
    { 
        path: '/activities', 
        name: 'activities',
        component: () => import('./views/Activities.js')
    },
    { 
        path: '/activity/:id', 
        name: 'detail',
        component: () => import('./views/ActivityDetail.js'),
        props: true // Mengirim :id langsung sebagai props ke komponen
    }
];

// 2. Inisialisasi Router
const router = VueRouter.createRouter({
    // Hash mode sangat disarankan untuk GitHub Pages
    history: VueRouter.createWebHashHistory(),
    routes,
    // Estetika: Selalu kembali ke atas saat pindah halaman
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    }
});

// 3. Global Loading State (Opsional)
// Kita bisa memantau kapan rute sedang loading untuk menampilkan spinner
router.beforeEach((to, from, next) => {
    // Kamu bisa mengaktifkan loading state di sini jika perlu
    next();
});

// 4. Inisialisasi Root App
const app = Vue.createApp({
    data() {
        return {
            // State global jika dibutuhkan
            isAppReady: true
        }
    }
});

app.use(router);
app.mount('#app');
