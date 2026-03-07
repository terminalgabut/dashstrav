import Dashboard from './views/Dashboard.js';

// Simulasi view Activities (kamu bisa buat file terpisah nanti)
const Activities = {
    template: `
        <div class="space-y-4">
            <h2 class="font-bold text-xl uppercase italic">Riwayat Aktivitas</h2>
            <div v-for="act in list" :key="act.id" class="bg-white p-4 rounded-xl border flex justify-between">
                <div>
                    <p class="font-bold">{{ act.name }}</p>
                    <p class="text-xs text-gray-400">{{ act.type }} • {{ (act.distance/1000).toFixed(2) }} km</p>
                </div>
                <div class="text-right">
                    <p class="text-sm font-bold">{{ (act.moving_time/60).toFixed(0) }}m</p>
                    <p class="text-[10px] text-gray-400 italic">{{ act.total_elevation_gain }}m elev</p>
                </div>
            </div>
        </div>
    `,
    data() { return { list: [] } },
    async mounted() {
        const res = await fetch('data/activities.json');
        this.list = await res.json();
    }
};

const routes = [
    { path: '/', component: Dashboard },
    { path: '/activities', component: Activities }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

const app = Vue.createApp({});
app.use(router);
app.mount('#app');
