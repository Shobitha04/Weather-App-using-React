import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './styles.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const API_KEY = '50afb67440630b290c4536995fd3efab';

const MapComponent = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(position, 10);
  }, [position, map]);
  
  return <Marker position={position} />;
};

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [mapPosition, setMapPosition] = useState([0, 0]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('url(cloudd.jpg)'); // Default bg image

  // fetch weather data from OpenWeather API
  const fetchWeatherData = async (cityName) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      setWeatherData(data);
      setMapPosition([data.coord.lat, data.coord.lon]);
      getHourlyForecast(data.coord.lat, data.coord.lon);
      updateBackgroundImage(data.weather[0].main);  // set bg image
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // fetch hourly forecast
  const getHourlyForecast = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      setHourlyForecast(data.list.slice(0, 8));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCitySearch = async (query) => {
    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
        );
        const data = await response.json();
        setSuggestions(data.map(city => `${city.name}, ${city.country}`));
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // get curr location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
          const data = await response.json();
          setWeatherData(data);
          setMapPosition([lat, lon]);
          getHourlyForecast(lat, lon);
          updateBackgroundImage(data.weather[0].main);  // Update bg based on weather
        } catch (error) {
          console.error('Error:', error);
        }
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

 
  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity);
    setShowSuggestions(false);
    fetchWeatherData(selectedCity.split(',')[0]);
  };

  // Update the bg image based oN weather condition
  const updateBackgroundImage = (weather) => {
    switch (weather) {
      case 'Clear':
        setBackgroundImage('url(cccc.gif)');
        break;
      case 'Clouds':
        setBackgroundImage('url(ccloudy.avif)');
        break;
      case 'Rain':
      case 'Thunderstorm':
      case 'Drizzle':
        setBackgroundImage('url(rrrrrr.webp)');
        break;
      case 'Snow':
        setBackgroundImage('url(snoww.gif)');
        break;
      case 'Mist':
        setBackgroundImage('url(WeatherAppReact\mist.jpg)');
        case 'Haze':
        setBackgroundImage('url(WeatherAppReact\hazee.webp)');
        break;
      default:
        setBackgroundImage('url(WeatherAppReact\cloudd.jpg)');  // Default 
    }
  };

  return (
    <div className="weather-app" style={{ backgroundImage, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
      <h1>Weather App</h1>
      
      <div className="search-container">
        <input
          type="text"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            handleCitySearch(e.target.value);
          }}
          placeholder="Enter city name"
          className="city-input"
        />
        <button onClick={() => fetchWeatherData(city)}>Search</button>
        <button onClick={getCurrentLocation}>Use Current Location</button>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleCitySelect(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="popular-cities">
        <h3>Popular Cities:</h3>
        {['New York', 'London', 'Tokyo', 'Paris'].map((city) => (
          <button
            key={city}
            onClick={() => handleCitySelect(city)}
            className="popular-city-btn"
          >
            {city}
          </button>
        ))}
      </div>

      {weatherData && (
        <div className="weather-info">
          <div className="weather-header">
            <h2>{weatherData.name}, {weatherData.sys.country}</h2>
            <img
              className="weather-icon"
              src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
              alt={weatherData.weather[0].description}
            />
          </div>
          <p>Temperature: {weatherData.main.temp.toFixed(1)}°C</p>
          <p>Weather: {weatherData.weather[0].description}</p>
          <p>Humidity: {weatherData.main.humidity}%</p>
          <p>Wind Speed: {weatherData.wind.speed} m/s</p>
        </div>
      )}

      <div className="map-container">
        <MapContainer
          center={mapPosition}
          zoom={2}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap contributors'
          />
          <MapComponent position={mapPosition} />
        </MapContainer>
      </div>

      {hourlyForecast.length > 0 && (
        <div className="hourly-slider">
          {hourlyForecast.map((item, index) => (
            <div key={index} className="hourly-item">
              <p>
                {new Date(item.dt * 1000).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  hour12: true,
                })}
              </p>
              <img
                src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                alt={item.weather[0].description}
              />
              <p>{item.main.temp.toFixed(1)}°C</p>
              <p>{item.weather[0].description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
