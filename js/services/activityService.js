/**
 * js/services/activityService.js
 * Centralized Service for Strava Data, Formatting, and Chart Logic
 */
export const ActivityService = {
    // 1. Data Fetching
    async fetchActivities() {
        try {
            const res = await fetch('data/activities.json?t=' + Date.now());
            return await res.json();
        } catch (e) {
            console.error("Fetch Error:", e);
            return [];
        }
    },

    async getActivityById(id) {
        const list = await this.fetchActivities();
        return list.find(a => a.id.toString() === id.toString());
    },

    // Tambahkan ke dalam ActivityService di js/services/activityService.js
async getLocationName(lat, lng) {
    try {
        // Menggunakan API Reverse Geocode gratis & tanpa key
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`;
        const res = await fetch(url);
        const data = await res.json();
        
        // Mengambil nama kota atau area lokal
        return data.city || data.locality || data.principalSubdivision || 'Lokasi Tersembunyi';
    } catch (e) {
        console.error("Geocoding Error:", e);
        return 'Jakarta'; // Fallback
    }
},

    // 2. Formatting Helpers
    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('id-ID', { 
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
        });
    },

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return h > 0 ? `${h}j ${m}m` : `${m}m ${s}s`;
    },

    // 3. Calculation Logic (untuk Dashboard)
    getDashboardStats(activities) {
        const dist = activities.reduce((s, a) => s + a.distance, 0);
        const elev = activities.reduce((s, a) => s + a.total_elevation_gain, 0);
        
        return {
            totalDist: (dist / 1000).toFixed(1),
            totalElev: elev.toFixed(0),
            count: activities.length
        };
    },

    // 4. Map & Route Logic
    decodeRoute(polylineStr) {
    // Memastikan kita mengambil instance dari global scope
    const decoder = window.polyline; 
    
    if (!decoder) {
        throw new Error("Library polyline.js tidak ditemukan di global window");
    }
    
    return decoder.decode(polylineStr);
    },

    // 5. Chart.js Configuration Generator
    getChartConfig(ctx, activities) {
        const data = [...activities].reverse();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, '#FC4C02'); // Strava Orange
        gradient.addColorStop(1, '#ff8a5c');

        return {
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
                        ticks: { font: { family: 'Inter', size: 10, weight: '600' }, color: '#94A3B8' }
                    },
                    x: { 
                        grid: { display: false },
                        ticks: { font: { family: 'Inter', size: 10, weight: '600' }, color: '#94A3B8' }
                    }
                }
            }
        };
    }
};
