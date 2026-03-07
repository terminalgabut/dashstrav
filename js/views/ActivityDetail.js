/**
 * js/views/ActivityDetail.js
 * Refactored: Integrasi Leaflet Map untuk render Polyline Strava
 */
export default {
    props: ['id'],
    template: `
        <div v-if="activity" class="animate-in fade-in duration-500">
            <button @click="$router.back()" class="mb-4 text-xs font-bold text-gray-400 hover:text-[#FC4C02] flex items-center gap-1 transition-colors">
                ← KEMBALI
            </button>

            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                
                <div id="map" class="h-72 w-full bg-gray-100 z-0 relative">
                    <div v-if="!mapReady" class="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                        <span class="text-[10px] font-bold text-gray-400 animate-pulse">MEMUAT PETA RUTE...</span>
                    </div>
                </div>

                <div class="p-8 -mt-10 relative bg-white rounded-t-3xl z-20">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <span class="bg-[#FC4C02] text-white text-[10px] px-2 py-1 rounded-md font-black uppercase italic tracking-widest">
                                {{ activity.type }}
                            </span>
                            <h1 class="text-3xl font-black italic mt-2 tracking-tighter">{{ activity.name }}</h1>
                            <p class="text-gray-400 text-sm font-medium uppercase tracking-tight">{{ formatDate(activity.start_date) }}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/50 text-center md:text-left">
                            <p class="text-[10px] font-bold text-gray-400 uppercase">Jarak</p>
                            <p class="text-xl font-black italic text-gray-800">{{ (activity.distance / 1000).toFixed(2) }} <span class="text-[10px] font-normal not-italic">KM</span></p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/50 text-center md:text-left">
                            <p class="text-[10px] font-bold text-gray-400 uppercase">Waktu</p>
                            <p class="text-xl font-black italic text-gray-800">{{ formatTime(activity.moving_time) }}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/50 text-center md:text-left">
                            <p class="text-[10px] font-bold text-gray-400 uppercase">Elevasi</p>
                            <p class="text-xl font-black italic text-green-600">{{ activity.total_elevation_gain }} <span class="text-[10px] font-normal not-italic text-gray-400">M</span></p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/50 text-center md:text-left">
                            <p class="text-[10px] font-bold text-gray-400 uppercase">Avg Speed</p>
                            <p class="text-xl font-black italic text-gray-800">{{ (activity.average_speed * 3.6).toFixed(1) }} <span class="text-[10px] font-normal not-italic">km/h</span></p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-dashed pt-8">
                        <div class="space-y-4">
                            <h3 class="font-black italic text-sm text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span class="w-2 h-2 bg-[#FC4C02] rounded-full"></span> Analisis Performa
                            </h3>
                            <div class="space-y-2">
                                <div class="flex justify-between text-sm"><span class="text-gray-500">Max Speed</span><span class="font-bold">{{ (activity.max_speed * 3.6).toFixed(1) }} km/h</span></div>
                                <div class="flex justify-between text-sm"><span class="text-gray-500">Power Rata-rata</span><span class="font-bold">{{ activity.average_watts || 0 }} W</span></div>
                                <div class="flex justify-between text-sm"><span class="text-gray-500">Total Energi</span><span class="font-bold">{{ activity.kilojoules || 0 }} kJ</span></div>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <h3 class="font-black italic text-sm text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span class="w-2 h-2 bg-gray-300 rounded-full"></span> Metadata Device
                            </h3>
                            <div class="space-y-2">
                                <div class="flex justify-between text-sm"><span class="text-gray-500">Perangkat</span><span class="font-bold text-gray-700">{{ activity.device_name || 'Strava Mobile' }}</span></div>
                                <div class="flex justify-between text-sm"><span class="text-gray-500">Upload ID</span><span class="font-mono text-[10px]">{{ activity.upload_id_str }}</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-10">
                        <a :href="'https://www.strava.com/activities/' + activity.id" target="_blank" 
                           class="group block w-full text-center bg-gray-900 text-white py-4 rounded-2xl font-black italic hover:bg-[#FC4C02] transition-all transform active:scale-95 shadow-xl shadow-gray-200">
                            VIEW FULL ON STRAVA <span class="group-hover:translate-x-1 inline-block transition-transform">↗</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-24 space-y-4">
            <div class="w-8 h-8 border-4 border-[#FC4C02] border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Sinkronisasi Data Aktivitas...</p>
        </div>
    `,
    data() {
        return { 
            activity: null, 
            mapReady: false,
            leafletMap: null 
        };
    },
    async mounted() {
        try {
            const res = await fetch('data/activities.json');
            const list = await res.json();
            this.activity = list.find(a => a.id.toString() === this.id);

            if (this.activity) {
                // Beri jeda kecil agar DOM canvas/div map ter-render oleh Vue
                setTimeout(() => {
                    this.renderMap();
                }, 300);
            }
        } catch (e) {
            console.error("Detail load error:", e);
        }
    },
    methods: {
        renderMap() {
            if (!this.activity.map || !this.activity.map.summary_polyline) return;

            // Pastikan global library L (Leaflet) & polyline decoder tersedia
            if (typeof L === 'undefined' || typeof polyline === 'undefined') {
                console.warn("Leaflet atau Polyline decoder belum termuat di index.html");
                return;
            }

            // 1. Decode polyline Strava
            const coords = polyline.decode(this.activity.map.summary_polyline);

            // 2. Init Map
            this.leafletMap = L.map('map', {
                dragging: !L.Browser.mobile,
                scrollWheelZoom: false,
                zoomControl: false
            }).setView(coords[0], 13);

            // 3. Tile Layer (Sederhana & Ringan)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(this.leafletMap);

            // 4. Draw Path
            const track = L.polyline(coords, {
                color: '#FC4C02',
                weight: 4,
                opacity: 0.9,
                lineJoin: 'round'
            }).addTo(this.leafletMap);

            // 5. Fit View
            this.leafletMap.fitBounds(track.getBounds(), { padding: [30, 30] });
            this.mapReady = true;
        },
        formatDate(d) {
            return new Date(d).toLocaleDateString('id-ID', { 
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
            });
        },
        formatTime(seconds) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            return h > 0 ? `${h}j ${m}m` : `${m}m ${s}s`;
        }
    },
    beforeUnmount() {
        // Cleanup map instance agar tidak memory leak
        if (this.leafletMap) {
            this.leafletMap.remove();
        }
    }
}
