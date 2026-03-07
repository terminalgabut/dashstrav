// js/views/ActivityDetail.js

export default {
    props: ['id'],
    template: `
        <div v-if="activity" class="animate-fadeIn">
            <button @click="$router.back()" class="mb-4 text-xs font-bold text-gray-400 hover:text-[#FC4C02] flex items-center gap-1">
                ← KEMBALI
            </button>

            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="h-48 bg-gray-200 relative flex items-center justify-center overflow-hidden">
                    <img :src="getMapUrl(activity.map.summary_polyline)" class="w-full h-full object-cover opacity-80" alt="Route Map">
                    <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                </div>

                <div class="p-8 -mt-10 relative">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <span class="bg-[#FC4C02] text-white text-[10px] px-2 py-1 rounded-md font-black uppercase italic tracking-widest">
                                {{ activity.type }}
                            </span>
                            <h1 class="text-3xl font-black italic mt-2">{{ activity.name }}</h1>
                            <p class="text-gray-400 font-medium">{{ formatDate(activity.start_date) }} • {{ activity.timezone }}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div class="bg-gray-50 p-4 rounded-2xl">
                            <p class="text-[10px] font-bold text-gray-400 uppercase">Jarak</p>
                            <p class="text-xl font-black">{{ (activity.distance / 1000).toFixed(2) }} <span class="text-xs font-normal">KM</span></p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-2xl">
                            <p class="text-[10px] font-bold text-gray-400 uppercase">Waktu Bergerak</p>
                            <p class="text-xl font-black">{{ formatTime(activity.moving_time) }}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-2xl">
                            <p class="text-[10px] font-bold text-gray-400 uppercase">Total Elevasi</p>
                            <p class="text-xl font-black">{{ activity.total_elevation_gain }} <span class="text-xs font-normal">M</span></p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-2xl">
                            <p class="text-[10px] font-bold text-gray-400 uppercase">Kecepatan Maks</p>
                            <p class="text-xl font-black">{{ (activity.max_speed * 3.6).toFixed(1) }} <span class="text-xs font-normal">km/h</span></p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                        <div>
                            <h3 class="font-bold text-sm text-gray-400 mb-4 uppercase italic">Analisis Power & Energi</h3>
                            <ul class="space-y-3">
                                <li class="flex justify-between border-b pb-2">
                                    <span class="text-gray-500 text-sm">Rata-rata Watt</span>
                                    <span class="font-bold">{{ activity.average_watts || '0' }} W</span>
                                </li>
                                <li class="flex justify-between border-b pb-2">
                                    <span class="text-gray-500 text-sm">Kalori (Kilojoules)</span>
                                    <span class="font-bold">{{ activity.kilojoules || '0' }} kcal</span>
                                </li>
                                <li class="flex justify-between border-b pb-2">
                                    <span class="text-gray-500 text-sm">Elevasi Tertinggi</span>
                                    <span class="font-bold">{{ activity.elev_high }} m</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm text-gray-400 mb-4 uppercase italic">Informasi Perangkat</h3>
                            <ul class="space-y-3">
                                <li class="flex justify-between border-b pb-2">
                                    <span class="text-gray-500 text-sm">Device</span>
                                    <span class="font-bold">{{ activity.device_name || 'Strava App' }}</span>
                                </li>
                                <li class="flex justify-between border-b pb-2">
                                    <span class="text-gray-500 text-sm">ID Upload</span>
                                    <span class="font-bold text-xs">{{ activity.upload_id_str }}</span>
                                </li>
                                <li class="flex justify-between border-b pb-2">
                                    <span class="text-gray-500 text-sm">Visibilitas</span>
                                    <span class="font-bold capitalize">{{ activity.visibility }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="mt-10">
                        <a :href="'https://www.strava.com/activities/' + activity.id" target="_blank" 
                           class="block w-full text-center bg-[#FC4C02] text-white py-4 rounded-2xl font-black italic hover:bg-orange-600 transition-all">
                            BUKA DI APLIKASI STRAVA ↗
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="text-center py-20 text-gray-400 font-bold">Mencari data aktivitas...</div>
    `,
    data() {
        return { activity: null };
    },
    async mounted() {
        const res = await fetch('data/activities.json');
        const list = await res.json();
        // Cari aktivitas berdasarkan ID dari URL
        this.activity = list.find(a => a.id.toString() === this.id);
    },
    methods: {
        formatDate(d) {
            return new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        },
        formatTime(seconds) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            return h > 0 ? `${h}j ${m}m` : `${m}m ${s}s`;
        },
        getMapUrl(polyline) {
            // Kita gunakan Google Static Maps (butuh API Key) 
            // ATAU Mapbox (butuh API Key). 
            // Untuk gratisan tanpa API Key, kita gunakan placeholder rute saja.
            return `https://images.placeholders.dev/?width=800&height=400&text=Route Polyline: ${this.id}&bg=f3f4f6&clr=9ca3af`;
        }
    }
}
