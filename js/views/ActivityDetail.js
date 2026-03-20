/**
 * js/views/ActivityDetail.js
 * Pulih & Terintegrasi dengan WeatherService + Custom Walk Steps
 */
import { ActivityService } from '../services/activityService.js';
import { WeatherService } from '../services/weatherService.js';

export default {
    props: ['id'],
    name: 'ActivityDetail',
    template: `
        <div v-if="activity" class="animate-in fade-in duration-500 pb-12">
            <button @click="$router.back()" class="mb-5 text-[10px] font-black text-slate-400 hover:text-strava flex items-center gap-2 transition-all uppercase tracking-widest">
                <span class="text-lg leading-none">←</span> KEMBALI
            </button>

            <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                
                <div id="map" class="h-80 w-full bg-slate-50 z-0 relative">
                    <div v-if="!mapReady" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10">
                        <div class="w-6 h-6 border-2 border-strava border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p class="label-muted animate-pulse">Memetakan rute...</p>
                    </div>
                </div>

                <div class="p-8 -mt-12 relative bg-white rounded-t-[2.5rem] z-20 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
                    
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                        <div class="flex-1">
                            <span class="inline-block bg-orange-50 text-strava text-[9px] px-2.5 py-1 rounded-lg font-black uppercase italic tracking-widest mb-3">
                                Strava {{ activity.type }}
                            </span>
                            <div class="flex flex-wrap items-center gap-3 md:gap-4">
                                <h1 class="text-4xl font-black italic tracking-tighter text-slate-900 leading-tight">
                                    {{ activity.name }}
                                </h1>
                                
                                <div v-if="activity.weather" class="flex items-center gap-2 animate-in slide-in-from-left-4 duration-700">
                                    <div class="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-2xl border border-slate-100 shadow-sm">
                                        <i :data-lucide="activity.weather.iconName" class="w-4 h-4 text-blue-500"></i>
                                        <span class="text-sm font-black text-slate-700">{{ activity.weather.temp }}°C</span>
                                    </div>
                                    
                                    <div class="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-2xl shadow-lg border border-slate-800">
                                        <i data-lucide="wind" class="w-3.5 h-3.5 text-slate-400"></i>
                                        <span class="text-[10px] font-black text-white uppercase tracking-tighter">
                                            {{ activity.weather.windDir }} {{ activity.weather.windSpeed }} m/s
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p class="label-muted !text-slate-400 mt-2">
                                {{ formatDate(activity.start_date) }} • {{ activity.display_location || 'Memuat Lokasi...' }}
                            </p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <div class="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                            <p class="label-muted text-[10px]">Jarak</p>
                            <p class="stats-value text-2xl mt-1">
                                {{ (activity.distance / 1000).toFixed(2) }} <span class="text-xs font-normal not-italic text-slate-400 uppercase">km</span>
                            </p>
                        </div>
                        <div class="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                            <p class="label-muted text-[10px]">Waktu</p>
                            <p class="stats-value text-2xl mt-1">{{ formatTime(activity.moving_time) }}</p>
                        </div>
                        <div class="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                            <p class="label-muted text-[10px]">Elevasi</p>
                            <p class="stats-value text-2xl mt-1 text-emerald-600">
                                {{ activity.total_elevation_gain }} <span class="text-xs font-normal not-italic text-slate-400 uppercase">m</span>
                            </p>
                        </div>

                        <div class="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                            <p class="label-muted text-[10px]">
                                {{ activity.type === 'Run' ? 'Pace' : (activity.type === 'Walk' ? 'Est. Langkah' : 'Avg Speed') }}
                            </p>
                            
                            <p class="stats-value text-2xl mt-1">
                                <template v-if="activity.type === 'Run'">
                                    {{ calculatePace(activity.average_speed) }}
                                    <span class="text-xs font-normal not-italic text-slate-400 uppercase">min/km</span>
                                </template>
                                
                                <template v-else-if="activity.type === 'Walk'">
                                    👣 {{ Math.round(activity.distance / 0.7).toLocaleString('id-ID') }}
                                </template>
                                
                                <template v-else>
                                    {{ (activity.average_speed * 3.6).toFixed(1) }}
                                    <span class="text-xs font-normal not-italic text-slate-400 uppercase">km/h</span>
                                </template>
                            </p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-100 pt-10">
                        <div class="space-y-6">
                            <h3 class="label-muted !text-slate-800 flex items-center gap-2 font-black italic uppercase text-[11px]">
                                <span class="w-1.5 h-1.5 bg-strava rounded-full"></span> Analisis Performa
                            </h3>
                            <div class="space-y-4">
                                <div class="flex justify-between items-end border-b border-slate-50 pb-2">
                                    <span class="text-[10px] font-bold text-slate-400 uppercase">Max Speed</span>
                                    <span class="font-black italic text-slate-700">{{ (activity.max_speed * 3.6).toFixed(1) }} km/h</span>
                                </div>
                                <div class="flex justify-between items-end border-b border-slate-50 pb-2">
                                    <span class="text-[10px] font-bold text-slate-400 uppercase">Avg Watts</span>
                                    <span class="font-black italic text-slate-700">{{ activity.average_watts || 0 }} W</span>
                                </div>
                                <div class="flex justify-between items-end border-b border-slate-50 pb-2">
                                    <span class="text-[10px] font-bold text-slate-400 uppercase">Calories</span>
                                    <span class="font-black italic text-orange-600">{{ activity.calories || Math.round(activity.kilojoules * 1.1) || 0 }} kcal</span>
                                </div>
                                <div class="flex justify-between items-end border-b border-slate-50 pb-2">
                                    <span class="text-[10px] font-bold text-slate-400 uppercase">Energy</span>
                                    <span class="font-black italic text-slate-700">{{ activity.kilojoules || 0 }} kJ</span>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-6">
                            <h3 class="label-muted !text-slate-800 flex items-center gap-2 font-black italic uppercase text-[11px]">
                                <span class="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> Hardware & Sync
                            </h3>
                            <div class="space-y-4">
                                <div class="flex justify-between items-end border-b border-slate-50 pb-2">
                                    <span class="text-[10px] font-bold text-slate-400 uppercase">Device</span>
                                    <span class="font-black italic text-slate-700">{{ activity.device_name || 'Strava App' }}</span>
                                </div>
                                <div class="flex justify-between items-end border-b border-slate-50 pb-2">
                                    <span class="text-[10px] font-bold text-slate-400 uppercase">Upload ID</span>
                                    <span class="font-black italic text-slate-400">{{ activity.upload_id_str || 'N/A' }}</span>
                                </div>
                                <button @click="downloadGPX" class="mt-6 w-full bg-slate-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex justify-center items-center gap-2 shadow-lg shadow-slate-200">
                                    <span>🎬</span> Buat Drone View (GPX)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="mt-12">
                        <a :href="'https://www.strava.com/activities/' + activity.id" target="_blank" 
                           class="bg-[#FC4C02] text-white w-full py-4 rounded-2xl font-black italic text-center block hover:opacity-90 transition-all uppercase tracking-tighter">
                            View Full on Strava ↗
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-32 space-y-6">
            <div class="w-10 h-10 border-4 border-strava border-t-transparent rounded-full animate-spin"></div>
            <p class="label-muted animate-pulse uppercase tracking-widest text-[10px]">Menghubungkan ke Strava...</p>
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
        this.activity = await ActivityService.getActivityById(this.id);

        if (this.activity) {
            if (this.activity.start_latlng) {
                const [location, weather] = await Promise.all([
                    ActivityService.getLocationName(
                        this.activity.start_latlng[0],
                        this.activity.start_latlng[1]
                    ),
                    WeatherService.fetchWeather(
                        this.activity.start_latlng[0],
                        this.activity.start_latlng[1],
                        this.activity.start_date
                    )
                ]);

                this.activity.display_location = location;

                if (weather) {
                    this.activity.weather = weather;
                    this.$nextTick(() => {
                        if (window.lucide) {
                            window.lucide.createIcons();
                        }
                    });
                }
            }

            this.$nextTick(() => {
                setTimeout(() => {
                    if (typeof polyline !== 'undefined') {
                        this.initMap();
                    } else {
                        setTimeout(() => this.initMap(), 500);
                    }
                }, 500);
            });
        }
    },
    
    methods: {
        formatDate: ActivityService.formatDate,
        formatTime: ActivityService.formatTime,
        calculatePace: ActivityService.calculatePace,

        downloadGPX() {
            const gpxData = ActivityService.exportToGPX(this.activity);
            if (!gpxData) return alert("Maaf, data rute tidak tersedia untuk aktivitas ini.");

            const blob = new Blob([gpxData], { type: 'application/gpx+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.download = `Dashstrav_${this.activity.type}_${this.activity.id}.gpx`;
            link.click();
            URL.revokeObjectURL(url);
        },

        initMap() {
            if (!this.activity.map?.summary_polyline) return;
            const container = document.getElementById('map');
            if (!container) return;

            try {
                const coords = ActivityService.decodeRoute(this.activity.map.summary_polyline);
                if (this.leafletMap) this.leafletMap.remove();

                this.leafletMap = L.map('map', { zoomControl: false, attributionControl: false }).setView(coords[0], 13);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(this.leafletMap);
                const route = L.polyline(coords, { color: '#FC4C02', weight: 5, lineJoin: 'round' }).addTo(this.leafletMap);
                this.leafletMap.fitBounds(route.getBounds(), { padding: [40, 40] });

                setTimeout(() => {
                    this.leafletMap.invalidateSize();
                    this.mapReady = true;
                }, 300);
            } catch (err) {
                console.error("Leaflet Error:", err.message);
            }
        }
    },
    beforeUnmount() {
        if (this.leafletMap) this.leafletMap.remove();
    }
};
