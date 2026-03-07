/**
 * js/views/Dashboard.js
 * View untuk menampilkan ringkasan performa
 * Delegated logic to ActivityService
 */
import { ActivityService } from '../services/activityService.js';

export default {
    name: 'Dashboard',
    template: `
        <div class="animate-in fade-in duration-500">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                
                <div class="card-modern">
                    <p class="label-muted">Jarak Total (10 Sesi)</p>
                    <p class="stats-value text-3xl mt-1">
                        {{ stats.totalDist }} <span class="text-sm font-normal text-slate-400 not-italic uppercase">km</span>
                    </p>
                </div>
                
                <div class="card-modern">
                    <p class="label-muted">Total Elevasi</p>
                    <p class="stats-value text-3xl mt-1 text-emerald-600">
                        ▲ {{ stats.totalElev }} <span class="text-sm font-normal text-slate-400 not-italic uppercase">m</span>
                    </p>
                </div>

                <div class="card-modern">
                    <p class="label-muted">Total Sesi</p>
                    <p class="stats-value text-3xl mt-1">
                        {{ stats.count }} <span class="text-sm font-normal text-slate-400 not-italic uppercase">Sesi</span>
                    </p>
                </div>

            </div>
            
            <div class="card-modern">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="label-muted !text-slate-500 uppercase tracking-widest">Grafik Volume Jarak</h2>
                    <span class="text-[9px] bg-orange-50 text-strava px-2 py-1 rounded-lg font-black italic tracking-widest uppercase">
                        Last 10 Activities
                    </span>
                </div>
                
                <div class="h-[280px] w-full relative">
                    <canvas id="mainChart"></canvas>
                </div>
            </div>
        </div>
    `,
    data() {
        return { 
            stats: { totalDist: 0, totalElev: 0, count: 0 }, 
            chartInstance: null 
        }
    },
    async mounted() {
        // Fetch data via Service
        const activities = await ActivityService.fetchActivities();
        
        if (activities && activities.length > 0) {
            // Kalkulasi via Service
            this.stats = ActivityService.getDashboardStats(activities);
            
            // Render Chart
            this.$nextTick(() => {
                setTimeout(() => this.initDashboardChart(activities), 300);
            });
        }
    },
    methods: {
        initDashboardChart(activities) {
            const canvas = document.getElementById('mainChart');
            if (!canvas || typeof Chart === 'undefined') return;

            const ctx = canvas.getContext('2d');
            if (this.chartInstance) this.chartInstance.destroy();

            // Dapatkan konfigurasi dari Service
            const config = ActivityService.getChartConfig(ctx, activities);
            this.chartInstance = new Chart(ctx, config);
        }
    },
    beforeUnmount() {
        // Bersihkan memori chart
        if (this.chartInstance) this.chartInstance.destroy();
    }
}
