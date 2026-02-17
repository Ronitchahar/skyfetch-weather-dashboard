// WeatherApp Constructor
function WeatherApp(apiKey) {

    // Store API key
    this.apiKey = apiKey;

    // API URLs
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // DOM references
    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');

    this.recentSearchesSection = document.getElementById('recent-searches-section');
    this.recentSearchesContainer = document.getElementById('recent-searches-container');

    // Recent searches data
    this.recentSearches = [];
    this.maxRecentSearches = 5;

    // Initialize app
    this.init();
}


// INIT METHOD
WeatherApp.prototype.init = function () {

    // Search button click
    if (this.searchBtn) {
        this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
    }

    // Enter key press
    if (this.cityInput) {
        this.cityInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        }.bind(this));
    }

    // Clear history button
    const clearBtn = document.getElementById('clear-history-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', this.clearHistory.bind(this));
    }

    // Load stored data
    this.loadRecentSearches();
    this.loadLastCity();
};


// HANDLE SEARCH
WeatherApp.prototype.handleSearch = function () {

    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError('Please enter a city name.');
        return;
    }

    this.getWeather(city);
    this.cityInput.value = '';
};


// SHOW WELCOME
WeatherApp.prototype.showWelcome = function () {

    const welcomeHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">🌤️</div>
            <h2 class="welcome-heading">Welcome to SkyFetch</h2>
            <p class="welcome-text">Search for a city to get started</p>
            <p class="welcome-examples">Try: London, Paris, Tokyo, Delhi</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = welcomeHTML;
};


// GET WEATHER
WeatherApp.prototype.getWeather = async function (city) {

    this.showLoading();

    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';

    const currentUrl =
        `${this.apiUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;

    try {

        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

        // Save searches
        this.saveRecentSearch(city);
        localStorage.setItem('lastCity', city);

    }
    catch (error) {

        console.error(error);

        if (error.response && error.response.status === 404) {
            this.showError('City not found. Please try again.');
        }
        else {
            this.showError('Something went wrong.');
        }

    }
    finally {

        this.searchBtn.disabled = false;
        this.searchBtn.textContent = '🔍 Search';

    }
};


// DISPLAY WEATHER
WeatherApp.prototype.displayWeather = function (data) {

    const cityName = data.name;
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;

    const iconUrl =
        `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const html = `
        <div class="weather-info">

            <h2 class="city-name">${cityName}</h2>

            <img src="${iconUrl}" class="weather-icon">

            <div class="temperature">${temp}°C</div>

            <p class="description">${desc}</p>

        </div>
    `;

    this.weatherDisplay.innerHTML = html;
};


// GET FORECAST
WeatherApp.prototype.getForecast = async function (city) {

    const url =
        `${this.forecastUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;

    const response = await axios.get(url);

    return response.data;
};


// PROCESS FORECAST
WeatherApp.prototype.processForecastData = function (data) {

    const filtered =
        data.list.filter(item =>
            item.dt_txt.includes('12:00:00')
        );

    return filtered.slice(0, 5);
};


// DISPLAY FORECAST
WeatherApp.prototype.displayForecast = function (data) {

    const daily = this.processForecastData(data);

    const cards =
        daily.map(day => {

            const date =
                new Date(day.dt * 1000);

            const dayName =
                date.toLocaleDateString('en-US',
                    { weekday: 'short' });

            const temp =
                Math.round(day.main.temp);

            const desc =
                day.weather[0].description;

            const icon =
                day.weather[0].icon;

            const iconUrl =
                `https://openweathermap.org/img/wn/${icon}@2x.png`;

            return `
                <div class="forecast-card">

                    <p class="forecast-day-name">
                        ${dayName}
                    </p>

                    <img src="${iconUrl}"
                    class="forecast-weather-icon">

                    <p class="forecast-temperature">
                        ${temp}°C
                    </p>

                    <p class="forecast-description">
                        ${desc}
                    </p>

                </div>
            `;

        }).join('');

    const section =
        `
        <div class="forecast-section">

            <h3 class="forecast-title">
                5-Day Forecast
            </h3>

            <div class="forecast-container">

                ${cards}

            </div>

        </div>
        `;

    this.weatherDisplay.innerHTML += section;
};


// LOADING
WeatherApp.prototype.showLoading = function () {

    this.weatherDisplay.innerHTML =
        `
        <div class="loading-container">
            <div class="spinner"></div>
            <p class="loading-text">
                Loading weather...
            </p>
        </div>
        `;
};


// ERROR
WeatherApp.prototype.showError = function (message) {

    this.weatherDisplay.innerHTML =
        `
        <div class="error-message">

            <div class="error-emoji">❌</div>

            <h3 class="error-heading">
                Error
            </h3>

            <p class="error-text">
                ${message}
            </p>

        </div>
        `;
};


// LOAD RECENT SEARCHES
WeatherApp.prototype.loadRecentSearches = function () {

    const saved =
        localStorage.getItem('recentSearches');

    if (saved) {
        this.recentSearches =
            JSON.parse(saved);
    }

    this.displayRecentSearches();
};


// SAVE RECENT SEARCH
WeatherApp.prototype.saveRecentSearch = function (city) {

    const cityName =
        city.charAt(0).toUpperCase()
        + city.slice(1).toLowerCase();

    const index =
        this.recentSearches.indexOf(cityName);

    if (index > -1) {
        this.recentSearches.splice(index, 1);
    }

    this.recentSearches.unshift(cityName);

    if (this.recentSearches.length > this.maxRecentSearches) {
        this.recentSearches.pop();
    }

    localStorage.setItem(
        'recentSearches',
        JSON.stringify(this.recentSearches)
    );

    this.displayRecentSearches();
};


// DISPLAY RECENT SEARCHES
WeatherApp.prototype.displayRecentSearches = function () {

    this.recentSearchesContainer.innerHTML = '';

    if (this.recentSearches.length === 0) {

        this.recentSearchesSection.style.display = 'none';
        return;

    }

    this.recentSearchesSection.style.display = 'block';

    this.recentSearches.forEach(city => {

        const btn =
            document.createElement('button');

        btn.className = 'recent-search-btn';

        btn.textContent = city;

        btn.addEventListener('click', () => {

            this.cityInput.value = city;

            this.getWeather(city);

        });

        this.recentSearchesContainer.appendChild(btn);

    });

};


// LOAD LAST CITY
WeatherApp.prototype.loadLastCity = function () {

    const lastCity =
        localStorage.getItem('lastCity');

    if (lastCity) {

        this.getWeather(lastCity);

    }
    else {

        this.showWelcome();

    }

};


// CLEAR HISTORY
WeatherApp.prototype.clearHistory = function () {

    if (confirm('Clear all recent searches?')) {

        this.recentSearches = [];

        localStorage.removeItem('recentSearches');

        this.displayRecentSearches();

    }

};


// START APP
const app =
    new WeatherApp(
        'ffa51e9063ccdb8d6eaa26fe6847ed64'
    );
