/**
 * OpenWeatherMap Current Weather Fetcher with explicit live/estimated telemetry.
 */
export async function fetchCurrentWeather(lat, lng, locationName = 'Current Location') {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_openweather_api_key_here') {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const mainCond = data.weather && data.weather[0] ? data.weather[0].main : 'Clear';
        const willRain = ['Rain', 'Drizzle', 'Thunderstorm'].includes(mainCond) || Boolean(data.rain);

        return {
          temp_c: Math.round(data.main.temp),
          condition: data.weather && data.weather[0] ? data.weather[0].description : 'clear sky',
          feels_like_c: Math.round(data.main.feels_like),
          will_rain_soon: willRain,
          location_name: locationName || data.name,
          is_live: true,
        };
      } else {
        console.warn(`[WeatherService] OpenWeatherMap returned status ${res.status}`);
      }
    } catch (err) {
      console.warn('[WeatherService] OpenWeatherMap fetch error:', err?.message || err);
    }
  }

  // Transparent fallback: when API key is missing or throttled
  // Calculate realistic regional Indian temperature with explicit is_live: false
  const now = new Date();
  const month = now.getMonth(); // 0-11
  let baseTemp = 28;

  // Seasonal estimation for Indian subcontinent
  if (month >= 3 && month <= 5) {
    baseTemp = 36; // Peak Summer (April to June)
  } else if (month >= 6 && month <= 8) {
    baseTemp = 30; // Monsoon (July to September)
  } else if (month >= 10 || month <= 1) {
    baseTemp = 22; // Winter (November to February)
  }

  // Cooler for Northern high latitudes
  if (lat > 30) {
    baseTemp -= 8;
  }

  return {
    temp_c: baseTemp,
    condition: 'partly cloudy',
    feels_like_c: baseTemp + 2,
    will_rain_soon: false,
    location_name: locationName,
    is_live: false, // Explicitly declared: estimated telemetry
  };
}
