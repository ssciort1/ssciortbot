const axios = require('axios');

module.exports = {
    name: 'meteo',
    description: 'Mostra il meteo di qualsiasi città',
    async execute(msg) {
        const args = msg.body.split(' ').slice(1);
        const city = args.length > 0 ? args.join(' ') : 'Catania';
        
        const API_KEY = '0052e9419fc34521bf52a0cd4aa2cc40';
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=it`;
        
        try {
            const response = await axios.get(url);
            const data = response.data;
            
            const windSpeed = data.wind && data.wind.speed ? Math.round(data.wind.speed * 3.6) : 0;
            
            const weatherResponse = `🌤️ METEO ${data.name.toUpperCase()}
🌡️ Temperatura: ${Math.round(data.main.temp)}°C (percepita ${Math.round(data.main.feels_like)}°C)
☁️ Condizioni: ${data.weather[0].description}
💨 Vento: ${windSpeed} km/h
💧 Umidità: ${data.main.humidity}%
🌅 Alba: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'})}
🌇 Tramonto: ${new Date(data.sys.sunset * 1000).toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'})}

📍 Scrivi: .meteo [nome città]`;
            
            msg.reply(weatherResponse);
            
        } catch (error) {
            if (error.response && error.response.status === 404) {
                msg.reply(`❌ Città "${city}" non trovata. Prova con il nome completo o in inglese.`);
            } else {
                msg.reply('❌ Errore temporaneo del servizio meteo. Riprova più tardi.');
            }
        }
    }
};