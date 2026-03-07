//js/views/Dashboard.js

export default {
    name: 'Dashboard',
    template: `
        <div class="animate-in fade-in duration-500">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jarak Total (10 Sesi)</p>
                    <p class="text-3xl font-black mt-1 italic tracking-tighter text-gray-800">
                        {{ stats.totalDist }} <span class="text-sm font-normal text-gray-400 not-italic">KM</span>
                    </p>
                </div>
                
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Elevasi</p>
                    <p class="text-3xl font-black mt-1 text-green-600 italic tracking-tighter">
                        ▲ {{ stats.totalElev }} <span class="text-sm font-normal text-gray-400 not-italic">M</span>
                    </p>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Sesi</p>
                    <p class="text-3xl font-black mt-1 italic tracking-tighter text-gray-800">
                        {{ activities.length }} <span class="text-sm font-normal text-gray-400 not-italic">KALI</span>
                    </p>
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xs font-black italic text-gray-400 uppercase tracking-widest">Grafik Volume Jarak</h2>
                    <span class="text-[10px] bg-orange-50 text-[#FC4C02] px-2 py-1 rounded font-bold">10 AKTIVITAS TERAKHIR</span>
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
                
                // Beri waktu bagi Vue untuk merender elemen canvas sebelum Chart.js mengaksesnya
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.renderChart();
                    }, 200);
                });
            }
        } catch (error) {
            console.error("Gagal memuat data dashboard:", error);
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

            this.chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(a => new Date(a.start_date).toLocaleDateString('id-ID', {day:'numeric', month:'short'})),
                    datasets: [{ 
                        label: 'Jarak (KM)', 
                        data: data.map(a => (a.distance/1000).toFixed(2)), 
                        backgroundColor: '#FC4C02',
                        hoverBackgroundColor: '#e54502',
                        borderRadius: 6,
                        barThickness: 'flex',
                        maxBarThickness: 30
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#1f2937',
                            titleFont: { size: 10 },
                            bodyFont: { size: 12, weight: 'bold' },
                            padding: 10,
                            displayColors: false
                        }
                    },
                    scales: { 
                        y: { 
                            beginAtZero: true,
                            grid: { color: '#f3f4f6', drawBorder: false },
                            ticks: { font: { size: 10, weight: 'bold' }, color: '#9ca3af' }
                        },
                        x: { 
                            grid: { display: false },
                            ticks: { font: { size: 10, weight: 'bold' }, color: '#9ca3af' }
                        }
                    }
                }
            });
        }
    },
    beforeUnmount() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }
    }
}
