/**
 * js/services/weatherService.js
 */
export const WeatherService = {
    // Mapping WMO Code ke Emoji/Icon Modern
    getWeatherIcon(code, isDay = true) {
        const icons = {
            0: '☀️', // Clear sky
            1: '🌤️', // Mainly clear
            2: '⛅', // Partly cloudy
            3: '☁️', // Overcast
            45: '🌫️', // Fog
            51: '🌦️', // Drizzle
            61: '🌧️', // Rain
            71: '❄️', // Snow
            95: '⛈️', // Thunderstorm
        };
        return icons[code] || (isDay ? '☀️' : '🌙');
    },

    async fetchWeather(lat, lng, dateStr) {
        try {
            const date = dateStr.split('T')[0];
            const hour = new Date(dateStr).getHours();
            
            // API untuk data historis (Archive)
            const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${date}&end_date=${date}&hourly=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;
            
            const res = await fetch(url);
            const data = await res.json();
            
            if (!data.hourly) return null;

            return {
                temp: data.hourly.temperature_2m[hour],
                icon: this.getWeatherIcon(data.hourly.weather_code[hour]),
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
