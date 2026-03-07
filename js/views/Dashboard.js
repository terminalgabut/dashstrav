/**
 * js/views/Dashboard.js
 * Refactored using Custom Design System & CSS Variables
 */
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
                        {{ activities.length }} <span class="text-sm font-normal text-slate-400 not-italic uppercase">Sesi</span>
                    </p>
                </div>

            </div>
            
            <div class="card-modern">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="label-muted !text-slate-500">Grafik Volume Jarak</h2>
                    <span class="text-[9px] bg-orange-50 text-strava px-2 py-1 rounded-lg font-black italic tracking-widest">
                        LAST 10 ACTIVITIES
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
            activities: [], 
            stats: { totalDist: 0, totalElev: 0 }, 
            chartInstance: null 
        }
    },
    async mounted() {
        try {
            const res = await fetch('data/activities.json?t=' + new Date().getTime());
            this.activities = await res.json();
            
            if (this.activities && this.activities.length > 0) {
                this.calculate();
                
                // Memastikan DOM siap sebelum render Chart
                this.$nextTick(() => {
                    setTimeout(() => this.renderChart(), 300);
                });
            }
        } catch (error) {
            console.error("Dashboard Error:", error);
        }
    },
    methods: {
        calculate() {
            const dist = this.activities.reduce((s, a) => s + a.distance, 0);
            const elev = this.activities.reduce((s, a) => s + a.total_elevation_gain, 0);
            
            this.stats.totalDist = (dist / 1000).toFixed(1);
            this.stats.totalElev = elev.toFixed(0);
        },
        renderChart() {
            const canvas = document.getElementById('mainChart');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const data = [...this.activities].reverse();
            
            if (this.chartInstance) this.chartInstance.destroy();

            // Setup gradient untuk bar agar lebih mewah
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, '#FC4C02');
            gradient.addColorStop(1, '#ff8a5c');

            this.chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(a => new Date(a.start_date).toLocaleDateString('id-ID', {day:'numeric', month:'short'})),
                    datasets: [{ 
                        label: 'Jarak (KM)', 
                        data: data.map(a => (a.distance/1000).toFixed(2)), 
                        backgroundColor: gradient,
                        hoverBackgroundColor: '#FC4C02',
                        borderRadius: 8,
                        barThickness: 'flex',
                        maxBarThickness: 32
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#0F172A',
                            padding: 12,
                            cornerRadius: 12,
                            titleFont: { family: 'Inter', size: 10, weight: 'bold' },
                            bodyFont: { family: 'Inter', size: 13, weight: '900' },
                            displayColors: false
                        }
                    },
                    scales: { 
                        y: { 
                            beginAtZero: true,
                            grid: { color: '#F1F5F9', drawBorder: false },
                            ticks: { 
                                font: { family: 'Inter', size: 10, weight: '600' }, 
                                color: '#94A3B8' 
                            }
                        },
                        x: { 
                            grid: { display: false },
                            ticks: { 
                                font: { family: 'Inter', size: 10, weight: '600' }, 
                                color: '#94A3B8' 
                            }
                        }
                    }
                }
            });
        }
    },
    beforeUnmount() {
        if (this.chartInstance) this.chartInstance.destroy();
    }
}
