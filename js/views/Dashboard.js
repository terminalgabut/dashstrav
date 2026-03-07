// js/views/Dashboard.js
export default {
    name: 'Dashboard',
    template: `
        <div class="animate-in fade-in duration-500">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jarak Total (10 Sesi)</p>
                    <p class="text-3xl font-black mt-1 italic tracking-tighter">{{ stats.totalDist }} <span class="text-sm font-normal text-gray-400">KM</span></p>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Elevasi</p>
                    <p class="text-3xl font-black mt-1 text-green-600 italic tracking-tighter">▲ {{ stats.totalElev }} <span class="text-sm font-normal text-gray-400">M</span></p>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Sesi</p>
                    <p class="text-3xl font-black mt-1 italic tracking-tighter">{{ activities.length }} <span class="text-sm font-normal text-gray-400">KALI</span></p>
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 class="text-xs font-black italic text-gray-400 mb-4 uppercase">Grafik Volume Latihan</h2>
                <div class="h-[250px] relative">
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
            this.calculate();
            // Kasih delay sedikit agar elemen canvas benar-benar siap di DOM
            this.$nextTick(() => {
                this.renderChart();
            });
        } catch (err) {
            console.error("Dashboard error:", err);
        }
    },
    methods: {
        calculate() {
            if(!this.activities.length) return;
            const dist = this.activities.reduce((s, a) => s + a.distance, 0);
            const elev = this.activities.reduce((s, a) => s + a.total_elevation_gain, 0);
            this.stats.totalDist = (dist / 1000).toFixed(1);
            this.stats.totalElev = elev.toFixed(0);
        },
        renderChart() {
            const el = document.getElementById('mainChart');
            if (!el) return;

            const data = [...this.activities].reverse();
            
            this.chartInstance = new Chart(el, {
                type: 'bar',
                data: {
                    labels: data.map(a => new Date(a.start_date).toLocaleDateString('id-ID', {day:'numeric', month:'short'})),
                    datasets: [{ 
                        label: 'Jarak (KM)', 
                        data: data.map(a => (a.distance/1000).toFixed(2)), 
                        backgroundColor: '#FC4C02',
                        borderRadius: 8,
                        barThickness: 20
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { display: false } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    },
    beforeUnmount() {
        // Hancurkan chart agar tidak memory leak saat pindah halaman
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }
    }
}
