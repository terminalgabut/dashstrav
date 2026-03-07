/**
 * js/views/ActivityDetail.js
 * Clean View: UI Rendering with Logic delegated to ActivityService
 */
import { ActivityService } from '../services/activityService.js';

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
                        <p class="label-muted animate-pulse">Memetakan Rute...</p>
                    </div>
                </div>

                <div class="p-8 -mt-12 relative bg-white rounded-t-[2.5rem] z-20 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
                    
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                        <div>
                            <span class="inline-block bg-orange-50 text-strava text-[9px] px-2.5 py-1 rounded-lg font-black uppercase italic tracking-widest mb-3">
                                Strava {{ activity.type }}
                            </span>
                            <h1 class="text-4xl font-black italic tracking-tighter text-slate-900 leading-tight">
                                {{ activity.name }}
                            </h1>
                            <p class="label-muted !text-slate-400 mt-2">
                                {{ formatDate(activity.start_date) }} • {{ activity.timezone?.split('/')[1] || 'Activity' }}
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
                            <p class="label-muted text-[10px]">Avg Speed</p>
                            <p class="stats-value text-2xl mt-1">
                                {{ (activity.average_speed * 3.6).toFixed(1) }} <span class="text-xs font-normal not-italic text-slate-400 uppercase">km/h</span>
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
                                    <span class="font-black italic text-slate-700">{{ activity.device_name || 'Mobile App' }}</span>
                                </div>
                                <div class="flex justify-between items-end border-b border-slate-50 pb-2">
                                    <span class="text-[10px] font-bold text-slate-400 uppercase">Upload ID</span>
                                    <span class="font-mono text-[10px] text-slate-400">{{ activity.upload_id_str || 'N/A' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-12">
                        <a :href="'https://www.strava.com/activities/' + activity.id" target="_blank" 
                           class="btn-strava group">
                            VIEW FULL ON STRAVA 
                            <span class="inline-block group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform ml-2">↗</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-32 space-y-6">
            <div class="w-10 h-10 border-4 border-strava border-t-transparent rounded-full animate-spin"></div>
            <p class="label-muted animate-pulse">Menghubungkan ke Strava...</p>
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
            this.$nextTick(() => {
                setTimeout(() => this.initMap(), 400);
            });
        }
    },
    methods: {
        // Mapping Helper Methods from Service
        formatDate: ActivityService.formatDate,
        formatTime: ActivityService.formatTime,

        initMap() {
            if (!this.activity.map?.summary_polyline) return;
            const container = document.getElementById('map');
            if (!container) return;

            try {
                const coords = ActivityService.decodeRoute(this.activity.map.summary_polyline);
                
                if (this.leafletMap) this.leafletMap.remove();

                this.leafletMap = L.map('map', { 
                    zoomControl: false, 
                    attributionControl: false 
                }).setView(coords[0], 13);

                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(this.leafletMap);

                const route = L.polyline(coords, { 
                    color: '#FC4C02', 
                    weight: 5,
                    lineJoin: 'round'
                }).addTo(this.leafletMap);

                this.leafletMap.fitBounds(route.getBounds(), { padding: [40, 40] });

                // Ensure map renders correctly after tab/route transitions
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
