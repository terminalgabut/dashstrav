/**
 * js/views/Activities.js
 * Refactored using Custom Design System
 */
export default {
    name: 'Activities',
    template: `
        <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 class="text-3xl font-black italic uppercase tracking-tighter text-slate-800">Riwayat Sesi</h2>
                    <p class="label-muted mt-1">Total {{ filteredList.length }} aktivitas ditemukan</p>
                </div>
                
                <div class="flex bg-slate-200/50 p-1 rounded-xl w-fit">
                    <button v-for="type in ['all', 'Run', 'Ride']" 
                        :key="type"
                        @click="filterType = type" 
                        :class="getFilterClass(type)"
                    >
                        {{ type === 'all' ? 'SEMUA' : (type === 'Run' ? 'LARI' : 'SEPEDA') }}
                    </button>
                </div>
            </div>

            <div v-if="loading" class="flex flex-col items-center justify-center py-20">
                <div class="w-8 h-8 border-4 border-strava border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="label-muted animate-pulse">Sinkronisasi aktivitas...</p>
            </div>

            <div v-else class="grid grid-cols-1 gap-4">
                <router-link 
                    v-for="act in filteredList" 
                    :key="act.id" 
                    :to="'/activity/' + act.id"
                    class="card-modern group flex justify-between items-center !p-5"
                >
                    <div class="flex items-center gap-5">
                        <div class="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 group-hover:bg-orange-50 transition-colors duration-300">
                            <span class="text-2xl transform group-hover:scale-110 transition-transform">
                                {{ act.type === 'Run' ? '🏃' : '🚴' }}
                            </span>
                        </div>
                        
                        <div>
                            <h3 class="font-black italic text-lg text-slate-800 group-hover:text-strava transition-colors leading-tight">
                                {{ act.name }}
                            </h3>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="label-muted !text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                    {{ act.type }}
                                </span>
                                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                                    {{ formatDate(act.start_date) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="text-right">
                        <p class="stats-value text-2xl text-slate-800 leading-none">
                            {{ (act.distance / 1000).toFixed(2) }}
                        </p>
                        <p class="label-muted !text-[9px] mt-1">KILOMETER</p>
                    </div>
                </router-link>
            </div>
            
            <div v-if="!loading && filteredList.length === 0" class="card-modern text-center py-16">
                <p class="text-slate-400 font-bold italic">Tidak ada rekaman {{ filterType !== 'all' ? filterType : '' }} ditemukan.</p>
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
            // Anti-cache fetch
            const res = await fetch('data/activities.json?t=' + Date.now());
            this.list = await res.json();
        } catch (e) {
            console.error("List Error:", e);
        } finally {
            this.loading = false;
        }
    },
    methods: {
        formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        },
        getFilterClass(type) {
            const isSelected = this.filterType === type;
            return `px-4 py-2 text-[10px] font-black italic rounded-lg transition-all duration-300 ${
                isSelected 
                ? 'bg-white text-strava shadow-sm scale-105' 
                : 'text-slate-500 hover:text-slate-800'
            }`;
        }
    }
}
