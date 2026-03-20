/**
 * js/app.js
 * Perbaikan stabilitas untuk Leaflet + Lazy Loading + Lucide Auto-Refresh
 */

const routes = [
    { 
        path: '/', 
        name: 'Dashboard',
        component: () => import('./views/Dashboard.js')
    },
    { 
        path: '/statistics', 
        name: 'Statistics',
        component: () => import('./views/Statistics.js')
    },
    { 
        path: '/activities', 
        name: 'Activities',
        component: () => import('./views/Activities.js')
    },
    { 
        path: '/activity/:id', 
        name: 'ActivityDetail',
        component: () => import('./views/ActivityDetail.js'),
        props: true 
    }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(savedPosition || { top: 0 });
            }, 100);
        });
    }
});

// --- TAMBAHKAN KODE INI ---
// Memaksa Lucide merender ulang ikon setiap kali halaman berganti
router.afterEach(() => {
    setTimeout(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, 150); // Delay 150ms agar komponen Lazy Load selesai merender DOM
});
// --------------------------

const app = Vue.createApp({});
app.use(router);
app.mount('#app');
