// Kita gunakan defineAsyncComponent dari Vue untuk lazy loading
const { defineAsyncComponent } = Vue;

// 1. Lazy Load Components
// Browser hanya akan mengambil file .js ini saat route diakses
const Dashboard = defineAsyncComponent(() => import('./views/Dashboard.js'));
const Activities = defineAsyncComponent(() => import('./views/Activities.js'));
const ActivityDetail = defineAsyncComponent(() => import('./views/ActivityDetail.js'));

// 2. Definisi Routes
const routes = [
    { 
        path: '/', 
        component: Dashboard,
        name: 'dashboard'
    },
    { 
        path: '/activities', 
        component: Activities,
        name: 'activities'
    },
    { 
        path: '/activity/:id', 
        component: ActivityDetail, 
        props: true,
        name: 'detail'
    }
];

// 3. Inisialisasi Router
const router = VueRouter.createRouter({
    // Mode Hash cocok untuk GitHub Pages agar tidak 404 saat refresh
    history: VueRouter.createWebHashHistory(),
    routes,
    // Scroll ke atas otomatis saat pindah halaman
    scrollBehavior() {
        return { top: 0 };
    }
});

// 4. Inisialisasi App
const app = Vue.createApp({
    data() {
        return {
            loading: false
        }
    }
});

app.use(router);
app.mount('#app');
