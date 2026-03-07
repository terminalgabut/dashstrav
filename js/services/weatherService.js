/**
 * js/services/weatherService.js
 * Modern Weather Engine with Lucide Icons Integration
 */
export const WeatherService = {
    // Memetakan WMO Code ke nama icon Lucide
    getWeatherIconName(code) {
        const icons = {
            0: 'sun',               // Cerah
            1: 'cloud-sun',         // Sebagian Cerah
            2: 'cloud-sun',         // Berawan sebagian
            3: 'cloud',             // Mendung
            45: 'cloud-fog',        // Kabut
            51: 'cloud-drizzle',    // Gerimis
            61: 'cloud-rain',       // Hujan
            95: 'cloud-lightning'   // Badai
        };
        return icons[code] || 'sun';
    },

    async fetchWeather(lat, lng, dateStr) {
        try {
            const date = dateStr.split('T')[0];
            const hour = new Date(dateStr).getHours();
            const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${date}&end_date=${date}&hourly=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;
            
            const res = await fetch(url);
            const data = await res.json();
            
            if (!data || !data.hourly) return null;

            return {
                temp: data.hourly.temperature_2m[hour],
                iconName: this.getWeatherIconName(data.hourly.weather_code[hour]),
                windSpeed: (data.hourly.wind_speed_10m[hour] / 3.6).toFixed(1),
                windDir: this.getWindDirection(data.hourly.wind_direction_10m[hour])
            };
        } catch (e) {
            console.error("Weather Service Error:", e);
            return null;
        }
    },

    getWindDirection(deg) {
        const sectors = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return sectors[Math.round(deg / 45) % 8];
    }
};
