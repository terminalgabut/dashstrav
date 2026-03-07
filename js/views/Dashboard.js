// js/views/Dashboard.js
export default {
    template: `
        <div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">...</div>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="h-[250px] w-full relative">
                    <canvas id="mainChart"></canvas>
                </div>
            </div>
        </div>
    `,
    data() {
        return { activities: [], stats: { totalDist: 0, totalElev: 0 }, chartInstance: null }
    },
    async mounted() {
        const res = await fetch('data/activities.json');
        this.activities = await res.json();
        this.calculate();

        // Gunakan setTimeout 100ms untuk memastikan transisi router selesai
        // dan elemen canvas sudah memiliki 'width' dan 'height' yang nyata
        setTimeout(() => {
            this.renderChart();
        }, 100);
    },
    methods: {
        calculate() {
            const dist = this.activities.reduce((s, a) => s + a.distance, 0);
            this.stats.totalDist = (dist / 1000).toFixed(1);
            this.stats.totalElev = this.activities.reduce((s, a) => s + a.total_elevation_gain, 0).toFixed(0);
        },
        renderChart() {
            const canvas = document.getElementById('mainChart');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const data = [...this.activities].reverse();
            
            // Hancurkan chart lama jika ada (mencegah bug tumpang tindih)
            if (this.chartInstance) this.chartInstance.destroy();

            this.chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(a => new Date(a.start_date).toLocaleDateString('id-ID', {day:'numeric', month:'short'})),
                    datasets: [{ 
                        label: 'KM', 
                        data: data.map(a => (a.distance/1000).toFixed(2)), 
                        backgroundColor: '#FC4C02',
                        borderRadius: 5
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    },
    // Pastikan chart dibersihkan saat pindah halaman
    beforeUnmount() {
        if (this.chartInstance) this.chartInstance.destroy();
    }
}
