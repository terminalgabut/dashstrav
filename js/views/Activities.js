/**
 * js/views/Activities.js
 * View untuk menampilkan daftar semua aktivitas Strava
 */
export default {
    name: 'Activities',
    template: `
        <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="flex justify-between items-end mb-6">
                <div>
                    <h2 class="text-2xl font-black italic uppercase tracking-tighter">Riwayat Aktivitas</h2>
                    <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">Total: {{ filteredList.length }} Sesi Terakhir</p>
                </div>
                <div class="flex gap-2">
                    <button @click="filterType = 'all'" :class="filterClass('all')">SEMUA</button>
                    <button @click="filterType = 'Run'" :class="filterClass('Run')">LARI</button>
                    <button @click="filterType = 'Ride'" :class="filterClass('Ride')">SEPEDA</button>
                </div>
            </div>

            <div v-if="loading" class="py-20 text-center font-bold text-gray-400 animate-pulse">
                Sinkronisasi data...
            </div>

            <div v-else class="grid grid-cols-1 gap-3">
                <router-link 
                    v-for="act in filteredList" 
                    :key="act.id" 
                    :to="'/activity/' + act.id"
                    class="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-[#FC4C02] transition-all flex justify-between items-center"
                >
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 group-hover:bg-orange-50 transition-colors">
                            <span class="text-xl">{{ act.type === 'Run' ? '🏃' : '🚴' }}</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-800 group-hover:text-[#FC4C02] transition-colors leading-tight">{{ act.name }}</h3>
                            <p class="text-[10px] font-bold text-gray-400 uppercase mt-1">
                                {{ formatDate(act.start_date) }} • {{ act.type }}
                            </p>
                        </div>
                    </div>

                    <div class="text-right">
                        <p class="text-lg font-black italic text-gray-700 leading-none">
                            {{ (act.distance / 1000).toFixed(2) }}
                        </p>
                        <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">KILOMETER</p>
                    </div>
                </router-link>
            </div>
            
            <div v-if="!loading && filteredList.length === 0" class="text-center py-10 text-gray-400">
                Tidak ada aktivitas ditemukan.
            </div>
        </div>
    `,
    data() {
        return {
            list: [],
            loading: true,
            filterType: 'all'
        }
    },
    computed: {
        filteredList() {
            if (this.filterType === 'all') return this.list;
            return this.list.filter(a => a.type === this.filterType);
        }
    },
    async mounted() {
        try {
            const res = await fetch('data/activities.json?t=' + new Date().getTime());
            this.list = await res.json();
        } catch (e) {
            console.error("Gagal memuat list aktivitas", e);
        } finally {
            this.loading = false;
        }
    },
    methods: {
        formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        },
        filterClass(type) {
            const base = "text-[10px] font-black px-3 py-1.5 rounded-lg transition-all ";
            return this.filterType === type 
                ? base + "bg-[#FC4C02] text-white" 
                : base + "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50";
        }
    }
}
