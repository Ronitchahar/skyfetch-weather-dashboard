// Your OpenWeatherMap API Key
const API_KEY = 'ffa51e9063ccdb8d6eaa26fe6847ed64';  // Inserted user-provided API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Function to fetch weather data
// Async function to fetch weather data
async function getWeather(city) {
    // Build URL
    const url = `${API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    // Disable search UI while request is in-flight
    if (searchBtn) {
        searchBtn.disabled = true;
        searchBtn.textContent = 'Searching...';
    }

    try {
        showLoading();
        const response = await axios.get(url);
        console.log('Weather response:', response);
        displayWeather(response.data);
    } catch (error) {
        console.error('Error fetching weather:', error);

        // Differentiate error types for better UX
        if (error.response) {
            // Server responded with a status code outside 2xx
            const status = error.response.status;
            const msg = error.response.data && error.response.data.message ? error.response.data.message : '';
            if (status === 404) {
                showError('City not found. Please check the name and try again.');
            } else if (status === 401) {
                showError('Invalid API key. Please check your API_KEY.');
            } else {
                showError(`Server error (${status}). ${msg || 'Please try again later.'}`);
            }
        } else if (error.request) {
            // Request made but no response received
            showError('Network error. Please check your internet connection.');
        } else {
            // Something else happened
            showError('An unexpected error occurred. Please try again.');
        }
    } finally {
        // Re-enable search UI
        if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.textContent = '🔍 Search';
        }
    }
}

// Function to display weather data
function displayWeather(data) {
    // Extract the data we need
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    // Create HTML to display
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;
    
    // Put it on the page
    document.getElementById('weather-display').innerHTML = weatherHTML;

    // Focus the input so the user can quickly search another city
    if (cityInput) cityInput.focus();
}

// Show a user-friendly error message
function showError(message) {
    const container = document.getElementById('weather-display');
    if (!container) return;
    const html = `
        <div class="error-message">
            <div class="error-emoji">❌</div>
            <div class="error-content">
                <p class="error-text">${message}</p>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

// Show a loading spinner and optional message
function showLoading(message = 'Loading weather data...') {
    const container = document.getElementById('weather-display');
    if (!container) return;
    container.innerHTML = `
        <div class="loading-container">
            <div class="spinner" aria-hidden="true"></div>
            <p class="loading-text">${message}</p>
        </div>
    `;
}

// Call the function when page loads
// Wire search UI
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');

if (searchBtn && cityInput) {
    searchBtn.addEventListener('click', function() {
        const city = cityInput.value.trim();
        if (city) getWeather(city);
    });

    cityInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) getWeather(city);
        }
    });
}

// Initial state: show a welcome prompt instead of auto-loading a city
const container = document.getElementById('weather-display');
if (container) {
    container.innerHTML = `
        <div class="welcome">
            <p class="loading">Welcome to SkyFetch — enter a city above and press Search.</p>
        </div>
    `;
}

// Focus the input for quick searching (if present)
if (cityInput) cityInput.focus();