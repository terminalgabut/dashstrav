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

    async getLocationName(lat, lng) {
        try {
            const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`;
            const res = await fetch(url);
            const data = await res.json();
            return data.city || data.locality || data.principalSubdivision || 'Lokasi Tersembunyi';
        } catch (e) {
            console.error("Geocoding Error:", e);
            return 'Jakarta'; 
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

    calculatePace(avgSpeedMs) {
        if (!avgSpeedMs || avgSpeedMs === 0) return "0:00";
        const totalSecondsPerKm = 1000 / avgSpeedMs; 
        const minutes = Math.floor(totalSecondsPerKm / 60);
        const seconds = Math.round(totalSecondsPerKm % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    // 3. Calculation Logic
    getDashboardStats(activities) {
        const dist = activities.reduce((s, a) => s + a.distance, 0);
        const elev = activities.reduce((s, a) => s + a.total_elevation_gain, 0);
        
        return {
            totalDist: (dist / 1000).toFixed(1),
            totalElev: elev.toFixed(0),
            count: activities.length
        };
    },

    // Memisahkan statistik berdasarkan jenis olahraga (Run/Ride)
    calculateSportStats(activities, sportType) {
        const filtered = activities.filter(a => a.type === sportType);
        const dist = filtered.reduce((s, a) => s + a.distance, 0);
        const elev = filtered.reduce((s, a) => s + a.total_elevation_gain, 0);
        
        return {
            totalDist: (dist / 1000).toFixed(1),
            totalElev: elev.toFixed(0),
            count: filtered.length
        };
    },

    // 4. Map & Route Logic
    decodeRoute(polylineStr) {
        const decoder = window.polyline; 
        if (!decoder) {
            throw new Error("Library polyline.js tidak ditemukan di global window");
        }
        return decoder.decode(polylineStr);
    },

    exportToGPX(activity) {
        if (!activity.map || !activity.map.summary_polyline) return null;
        
        const coords = this.decodeRoute(activity.map.summary_polyline);
        const name = activity.name || "Aktivitas Dashstrav";
        const date = activity.start_date || new Date().toISOString();
        
        let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Dashstrav" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><time>${date}</time></metadata>
  <trk>
    <name>${name}</name>
    <trkseg>`;

        coords.forEach(coord => {
            // coord[0] adalah lat, coord[1] adalah lng
            gpx += `\n      <trkpt lat="${coord[0]}" lon="${coord[1]}"></trkpt>`;
        });

        gpx += `\n    </trkseg>\n  </trk>\n</gpx>`;
        return gpx;
    },

    // 5. Chart.js Configuration Generator
    getChartConfig(ctx, activities) {
        const data = [...activities].reverse();
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, '#FC4C02'); 
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
    },

    // Grafik Tahunan (Jan-Des) membandingkan Run & Ride
    getYearlyComparisonChartConfig(ctx, activities) {
        const runData = Array(12).fill(0);
        const rideData = Array(12).fill(0);
        
        activities.forEach(activity => {
            const date = new Date(activity.start_date);
            const monthIndex = date.getMonth(); 
            const distanceKm = activity.distance / 1000;
            
            if (activity.type === 'Run') {
                runData[monthIndex] += distanceKm;
            } else if (activity.type === 'Ride') {
                rideData[monthIndex] += distanceKm;
            }
        });

        return {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                datasets: [
                    {
                        label: 'Lari (KM)',
                        data: runData.map(d => d.toFixed(1)),
                        backgroundColor: '#FC4C02',
                        borderRadius: 6,
                        maxBarThickness: 16
                    },
                    {
                        label: 'Sepeda (KM)',
                        data: rideData.map(d => d.toFixed(1)),
                        backgroundColor: '#1E293B',
                        borderRadius: 6,
                        maxBarThickness: 16
                    }
                ]
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
                        bodyFont: { family: 'Inter', weight: 'bold' }
                    }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#F1F5F9' } },
                    x: { grid: { display: false } }
                }
            }
        };
    }
};
