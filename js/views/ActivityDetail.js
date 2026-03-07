/**
 * js/views/ActivityDetail.js
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
        // Logika pengambilan data dipindah ke Service
        this.activity = await ActivityService.getActivityById(this.id);

        if (this.activity) {
            this.$nextTick(() => {
                setTimeout(() => this.initMap(), 400);
            });
        }
    },
    methods: {
        // Delegasi pemformatan ke Service
        formatDate: ActivityService.formatDate,
        formatTime: ActivityService.formatTime,

        initMap() {
            if (!this.activity.map?.summary_polyline) return;
            const container = document.getElementById('map');
            if (!container) return;

            try {
                // Logika decode rute dipindah ke Service
                const coords = ActivityService.decodeRoute(this.activity.map.summary_polyline);
                
                if (this.leafletMap) this.leafletMap.remove();

                this.leafletMap = L.map('map', { 
                    zoomControl: false, 
                    attributionControl: false 
                }).setView(coords[0], 13);

                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(this.leafletMap);

                const route = L.polyline(coords, { color: '#FC4C02', weight: 5 }).addTo(this.leafletMap);
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
