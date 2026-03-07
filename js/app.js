/**
 * js/app.js
 * Perbaikan stabilitas untuk Leaflet + Lazy Loading
 */

const routes = [
    { 
        path: '/', 
        name: 'Dashboard',
        component: () => import('./views/Dashboard.js')
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
        // PENTING: Leaflet butuh waktu untuk kalkulasi ukuran.
        // Jika pindah rute, kita beri sedikit delay sebelum scroll ke atas
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(savedPosition || { top: 0 });
            }, 100);
        });
    }
});

const app = Vue.createApp({});
app.use(router);
app.mount('#app');
