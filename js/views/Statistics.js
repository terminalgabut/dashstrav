/**
 * js/views/Statistics.js
 * View untuk Statistik Tahunan (Run vs Ride vs Walk)
 * Custom: Menampilkan Total Langkah untuk kategori Walk
 */
import { ActivityService } from '../services/activityService.js';

export default {
    name: 'Statistics',
    template: `
        <div class="animate-in fade-in duration-500 pb-12">
            
            <div class="flex justify-between items-center mb-8 gap-4">
                <h1 class="text-3xl font-black italic tracking-tighter text-slate-950 uppercase">
                    Statistik Tahunan
                </h1>
                
                <div class="relative">
                    <select v-model="selectedYear" @change="updateYearlyData" 
                            class="bg-white pl-5 pr-10 py-3 rounded-2xl border border-slate-100 shadow-sm font-bold text-sm appearance-none text-slate-800 focus:ring-2 focus:ring-orange-200 outline-none transition-all cursor-pointer">
                        <option v-for="year in availableYears" :key="year" :value="year">
                            Tahun {{ year }}
                        </option>
                    </select>
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group transition-all hover:border-orange-100">
                    <div class="absolute -right-6 -top-6 text-9xl text-orange-100/50 group-hover:text-orange-100 group-hover:scale-110 transition-all">🏃</div>
                    <div class="flex items-center gap-3 mb-6 relative z-10">
                        <span class="bg-orange-100 text-strava px-3 py-1.5 rounded-xl font-black uppercase text-xs italic tracking-widest">RUNNING</span>
                    </div>
                    <div class="grid grid-cols-2 gap-5 relative z-10">
                        <div>
                            <p class="label-muted text-[11px]">Total Jarak</p>
                            <p class="stats-value text-3xl mt-1 text-strava">{{ yearlyStats.run.totalDist }} <span class="text-sm font-normal text-slate-400 uppercase">km</span></p>
                        </div>
                        <div>
                            <p class="label-muted text-[11px]">Total Sesi</p>
                            <p class="stats-value text-3xl mt-1 text-slate-800">{{ yearlyStats.run.count }} <span class="text-sm font-normal text-slate-400 uppercase">Sesi</span></p>
                        </div>
                        <div class="col-span-2 border-t border-slate-100 pt-4 grid grid-cols-3 gap-2">
                            <div><p class="label-muted text-[10px]">Total Elevasi</p><p class="stats-value text-base mt-1 text-emerald-600">▲ {{ yearlyStats.run.totalElev }}m</p></div>
                            <div><p class="label-muted text-[10px]">Avg Pace</p><p class="stats-value text-base mt-1 text-slate-700">{{ calculatePace(yearlyStats.run.avgSpeed) }}</p></div>
                            <div><p class="label-muted text-[10px]">Total Waktu</p><p class="stats-value text-base mt-1 text-slate-700">{{ formatTime(yearlyStats.run.totalTime) }}</p></div>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-950 p-7 rounded-[2rem] shadow-lg border border-slate-800 relative overflow-hidden group transition-all hover:border-slate-700">
                    <div class="absolute -right-6 -top-6 text-9xl text-slate-800/60 group-hover:text-slate-700 group-hover:scale-110 transition-all">🚴</div>
                    <div class="flex items-center gap-3 mb-6 relative z-10">
                        <span class="bg-slate-800 text-white px-3 py-1.5 rounded-xl font-black uppercase text-xs italic tracking-widest">CYCLING</span>
                    </div>
                    <div class="grid grid-cols-2 gap-5 relative z-10">
                        <div>
                            <p class="label-muted text-slate-400 text-[11px]">Total Jarak</p>
                            <p class="stats-value text-3xl mt-1 text-white">{{ yearlyStats.ride.totalDist }} <span class="text-sm font-normal text-slate-500 uppercase">km</span></p>
                        </div>
                        <div>
                            <p class="label-muted text-slate-400 text-[11px]">Total Sesi</p>
                            <p class="stats-value text-3xl mt-1 text-white">{{ yearlyStats.ride.count }} <span class="text-sm font-normal text-slate-500 uppercase">Sesi</span></p>
                        </div>
                        <div class="col-span-2 border-t border-slate-800 pt-4 grid grid-cols-3 gap-2">
                            <div><p class="label-muted text-slate-400 text-[10px]">Total Elevasi</p><p class="stats-value text-base mt-1 text-emerald-400">▲ {{ yearlyStats.ride.totalElev }}m</p></div>
                            <div><p class="label-muted text-slate-400 text-[10px]">Avg Speed</p><p class="stats-value text-base mt-1 text-white">{{ (yearlyStats.ride.avgSpeed * 3.6).toFixed(1) }} <span class="text-[9px]">km/h</span></p></div>
                            <div><p class="label-muted text-slate-400 text-[10px]">Total Waktu</p><p class="stats-value text-base mt-1 text-white">{{ formatTime(yearlyStats.ride.totalTime) }}</p></div>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group transition-all hover:border-green-100">
                    <div class="absolute -right-6 -top-6 text-9xl text-green-100/50 group-hover:text-green-100 group-hover:scale-110 transition-all">🚶</div>
                    <div class="flex items-center gap-3 mb-6 relative z-10">
                        <span class="bg-green-100 text-green-600 px-3 py-1.5 rounded-xl font-black uppercase text-xs italic tracking-widest">WALKING</span>
                    </div>
                    <div class="grid grid-cols-2 gap-5 relative z-10">
                        <div>
                            <p class="label-muted text-[11px]">Total Jarak</p>
                            <p class="stats-value text-3xl mt-1 text-green-600">{{ yearlyStats.walk.totalDist }} <span class="text-sm font-normal text-slate-400 uppercase">km</span></p>
                        </div>
                        <div>
                            <p class="label-muted text-[11px]">Total Sesi</p>
                            <p class="stats-value text-3xl mt-1 text-slate-800">{{ yearlyStats.walk.count }} <span class="text-sm font-normal text-slate-400 uppercase">Sesi</span></p>
                        </div>
                        <div class="col-span-2 border-t border-slate-100 pt-4 grid grid-cols-3 gap-2">
                            <div>
                                <p class="label-muted text-[10px]">Total Elevasi</p>
                                <p class="stats-value text-base mt-1 text-emerald-600">▲ {{ yearlyStats.walk.totalElev }}m</p>
                            </div>
                            <div>
                                <p class="label-muted text-[10px]">Total Langkah</p>
                                <p class="stats-value text-base mt-1 text-green-600">👣 {{ yearlyStats.walk.steps?.toLocaleString('id-ID') || 0 }}</p>
                            </div>
                            <div>
                                <p class="label-muted text-[10px]">Total Waktu</p>
                                <p class="stats-value text-base mt-1 text-slate-700">{{ formatTime(yearlyStats.walk.totalTime) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div class="card-modern">
                <div class="flex justify-between items-center mb-6 gap-4">
                    <h2 class="label-muted !text-slate-500 uppercase tracking-widest">Volume Jarak Bulanan ({{ selectedYear }})</h2>
                    <div class="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                        <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-strava rounded-sm"></span> Lari</span>
                        <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-slate-800 rounded-sm"></span> Sepeda</span>
                        <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-green-500 rounded-sm"></span> Jalan</span>
                    </div>
                </div>
                <div class="h-[350px] w-full relative">
                    <canvas id="yearlyComparisonChart"></canvas>
                </div>
            </div>

        </div>
    `,
    data() {
        return {
            allActivities: [],
            availableYears: [],
            selectedYear: new Date().getFullYear(),
            yearlyStats: {
                run: { totalDist: 0, totalElev: 0, count: 0, totalTime: 0, avgSpeed: 0 },
                ride: { totalDist: 0, totalElev: 0, count: 0, totalTime: 0, avgSpeed: 0 },
                walk: { totalDist: 0, totalElev: 0, count: 0, totalTime: 0, avgSpeed: 0, steps: 0 } 
            },
            chartInstance: null
        }
    },
    async mounted() {
        this.allActivities = await ActivityService.fetchActivities();
        if (this.allActivities && this.allActivities.length > 0) {
            this.availableYears = [...new Set(this.allActivities.map(a => new Date(a.start_date).getFullYear()))].sort((a,b) => b-a);
            if (!this.availableYears.includes(this.selectedYear)) {
                this.selectedYear = this.availableYears[0];
            }
            this.updateYearlyData();
        }
    },
    methods: { 
        formatTime: ActivityService.formatTime,
        calculatePace: ActivityService.calculatePace,
        updateYearlyData() {
            const yearActivities = this.allActivities.filter(a => new Date(a.start_date).getFullYear() === this.selectedYear);
            
            // Kalkulasi Running & Cycling
            this.yearlyStats.run = ActivityService.calculateSportStats(yearActivities, 'Run');
            this.yearlyStats.ride = ActivityService.calculateSportStats(yearActivities, 'Ride');
            
            // Kalkulasi Walking + Otomatisasi Langkah (Google Fit: 0.7m)
            const walkData = ActivityService.calculateSportStats(yearActivities, 'Walk');
            walkData.steps = Math.round((walkData.totalDist * 1000) / 0.7);
            this.yearlyStats.walk = walkData;
            
            this.$nextTick(() => {
                setTimeout(() => this.initYearlyChart(yearActivities), 300);
            });
        },
        initYearlyChart(activities) {
            const canvas = document.getElementById('yearlyComparisonChart');
            if (!canvas || typeof Chart === 'undefined') return;
            const ctx = canvas.getContext('2d');
            if (this.chartInstance) this.chartInstance.destroy();
            const config = ActivityService.getYearlyComparisonChartConfig(ctx, activities);
            this.chartInstance = new Chart(ctx, config);
        }
    },
    beforeUnmount() {
        if (this.chartInstance) this.chartInstance.destroy();
    }
}
