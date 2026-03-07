// js/views/Dashboard.js

export default {
    template: `
        <div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p class="text-xs font-bold text-gray-400 uppercase">Jarak Total</p>
                    <p class="text-3xl font-black mt-1">{{ stats.totalDist }} KM</p>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p class="text-xs font-bold text-gray-400 uppercase">Elevasi</p>
                    <p class="text-3xl font-black mt-1 text-green-600">{{ stats.totalElev }} M</p>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p class="text-xs font-bold text-gray-400 uppercase">Sesi</p>
                    <p class="text-3xl font-black mt-1">{{ activities.length }}</p>
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <canvas id="mainChart" height="250"></canvas>
            </div>
        </div>
    `,
    data() {
        return { activities: [], stats: { totalDist: 0, totalElev: 0 } }
    },
    async mounted() {
        const res = await fetch('data/activities.json');
        this.activities = await res.json();
        this.calculate();
        this.renderChart();
    },
    methods: {
        calculate() {
            this.stats.totalDist = (this.activities.reduce((s, a) => s + a.distance, 0) / 1000).toFixed(1);
            this.stats.totalElev = this.activities.reduce((s, a) => s + a.total_elevation_gain, 0).toFixed(0);
        },
        renderChart() {
            const ctx = document.getElementById('mainChart').getContext('2d');
            const data = [...this.activities].reverse();
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(a => new Date(a.start_date).toLocaleDateString('id-ID', {day:'numeric', month:'short'})),
                    datasets: [{ label: 'KM', data: data.map(a => (a.distance/1000).toFixed(2)), backgroundColor: '#FC4C02' }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }
}
