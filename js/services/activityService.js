/**
 * js/services/activityService.js
 */
export const ActivityService = {
    async getActivityById(id) {
        try {
            const res = await fetch('data/activities.json?t=' + Date.now());
            const list = await res.json();
            return list.find(a => a.id.toString() === id.toString());
        } catch (e) {
            console.error("Fetch Error:", e);
            return null;
        }
    },

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

    decodeRoute(polylineStr) {
        if (typeof polyline === 'undefined') {
            throw new Error("Library polyline.js tidak ditemukan");
        }
        return polyline.decode(polylineStr);
    }
};
