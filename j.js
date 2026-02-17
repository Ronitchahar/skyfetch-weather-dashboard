// TODO: Create WeatherApp Constructor Function
function WeatherApp(apiKey) {
    // TODO: Store the API key
    this.apiKey = apiKey;
    
    // TODO: Store the API URLs
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
    
    // TODO: Get references to DOM elements and store them
    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');
    
    // TODO: Call init method to set up event listeners
    this.init();
}

// TODO: Create init method to set up event listeners
WeatherApp.prototype.init = function() {
    // TODO: Add click event listener to search button
    // Use .bind(this) to maintain context
    if (this.searchBtn) {
        this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
    }
    
    // TODO: Add keypress event listener to input
    // Listen for Enter key
    if (this.cityInput) {
        this.cityInput.addEventListener('keypress', this.handleSearch.bind(this));
    }
    
    // TODO: Display welcome message
    // Call a method like this.showWelcome()
    this.showWelcome();
};

// TODO: Create handleSearch method
WeatherApp.prototype.handleSearch = function(e) {
    // Allow Enter key or click to trigger search
    if (e.type === 'keypress' && e.key !== 'Enter') {
        return;
    }
    
    // TODO: Get city from input
    const city = this.cityInput.value.trim();
    
    // TODO: Validate input
    if (!city) {
        this.showError('Please enter a city name.');
        return;
    } 
    
    if (city.length < 2) {
        this.showError('City name must be at least 2 characters long.');
        return;
    }
    
    // TODO: Call getWeather method
    this.getWeather(city);
    
    // TODO: Clear input (optional)
    this.cityInput.value = '';
};

// TODO: Create showWelcome method
WeatherApp.prototype.showWelcome = function() {
    // TODO: Create welcome HTML
    const welcomeHTML = `
        <div class="welcome-message">
            <!-- TODO: Add icon or emoji -->
            <div class="welcome-icon">☁️</div>
            
            <!-- TODO: Add welcome heading -->
            <h2 class="welcome-heading">Welcome to SkyFetch</h2>
            
            <!-- TODO: Add instruction text -->
            <p class="welcome-text">Enter a city name above and press Search to get the current weather information.</p>
        </div>
    `;
    
    // TODO: Display in weather display area
    if (this.weatherDisplay) {
        this.weatherDisplay.innerHTML = welcomeHTML;
    }
    
    // Focus the input for quick searching
    if (this.cityInput) {
        this.cityInput.focus();
    }
};

// TODO: Create getWeather method (async)
WeatherApp.prototype.getWeather = async function(city) {
    // TODO: Show loading state
    this.showLoading();
    
    // TODO: Disable search button
    if (this.searchBtn) {
        this.searchBtn.disabled = true;
        this.searchBtn.textContent = 'Searching...';
    }
    
    try {
        // TODO: Build API URLs
        const currentWeatherUrl = `${this.apiUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;
        
        // TODO: Use Promise.all to fetch both current and forecast
        const [currentWeatherResponse, forecastData] = await Promise.all([
            axios.get(currentWeatherUrl),
            this.getForecast(city).catch(() => null) // Allow forecast to fail gracefully
        ]);
        
        // TODO: Display current weather
        this.displayWeather(currentWeatherResponse.data);
        
        // TODO: Display forecast
        if (forecastData) {
            this.displayForecast(forecastData);
        }
        
    } catch (error) {
        // TODO: Handle errors
        console.error('Error fetching weather:', error);
        
        // TODO: Show appropriate error message
        if (error.response) {
            // Server responded with a status code outside 2xx
            const status = error.response.status;
            const msg = error.response.data && error.response.data.message ? error.response.data.message : '';
            if (status === 404) {
                this.showError('City not found. Please check the name and try again.');
            } else if (status === 401) {
                this.showError('Invalid API key. Please check your API_KEY.');
            } else {
                this.showError(`Server error (${status}). ${msg || 'Please try again later.'}`);
            }
        } else if (error.request) {
            // Request made but no response received
            this.showError('Network error. Please check your internet connection.');
        } else {
            // Something else happened
            this.showError('An unexpected error occurred. Please try again.');
        }
        
    } finally {
        // TODO: Re-enable search button
        if (this.searchBtn) {
            this.searchBtn.disabled = false;
            this.searchBtn.textContent = '🔍 Search';
        }
    }
};

// TODO: Create displayWeather method
WeatherApp.prototype.displayWeather = function(data) {
    // TODO: Extract data from response
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    // TODO: Create weather HTML
    const weatherHTML = `
        <div class="weather-info">
            <!-- TODO: City name -->
            <h2 class="city-name">${cityName}</h2>
            
            <!-- TODO: Weather icon -->
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            
            <!-- TODO: Temperature -->
            <div class="temperature">${temperature}°C</div>
            
            <!-- TODO: Description -->
            <p class="description">${description}</p>
        </div>
    `;
    
    // TODO: Display in weather display area
    if (this.weatherDisplay) {
        this.weatherDisplay.innerHTML = weatherHTML;
    }
    
    // TODO: Focus back on input for next search
    if (this.cityInput) {
        this.cityInput.focus();
    }
};

// TODO: Create getForecast method (async)
WeatherApp.prototype.getForecast = async function(city) {
    // TODO: Build forecast API URL
    const url = `${this.forecastUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;
    
    try {
        // TODO: Fetch forecast data
        const response = await axios.get(url);
        
        // TODO: Return the data
        return response.data;
        
    } catch (error) {
        console.error('Error fetching forecast:', error);
        // TODO: Throw error to be caught by caller
        throw error;
    }
};

// TODO: Create processForecastData method
WeatherApp.prototype.processForecastData = function(data) {
    // TODO: Filter forecast list to get one entry per day (at 12:00:00)
    const dailyForecasts = data.list.filter(function(item) {
        // Each item has dt_txt like "2024-01-20 12:00:00"
        return item.dt_txt.includes('12:00:00');
    });
    
    // TODO: Take only first 5 days
    return dailyForecasts.slice(0, 5);
};

// TODO: Create displayForecast method
WeatherApp.prototype.displayForecast = function(data) {
    // TODO: Process the forecast data
    const dailyForecasts = this.processForecastData(data);
    
    // TODO: Map through forecasts and create HTML for each
    const forecastHTML = dailyForecasts.map(function(day) {
        // Extract data
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        
        return `
            <div class="forecast-card">
                <!-- TODO: Day name -->
                <p class="forecast-day-name">${dayName}</p>
                
                <!-- TODO: Weather icon -->
                <img src="${iconUrl}" alt="${description}" class="forecast-weather-icon">
                
                <!-- TODO: Temperature -->
                <p class="forecast-temperature">${temp}°C</p>
                
                <!-- TODO: Description -->
                <p class="forecast-description">${description}</p>
            </div>
        `;
    }).join('');
    
    // TODO: Create forecast section HTML
    const forecastSection = `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;
    
    // TODO: Append to weather display (don't replace current weather!)
    if (this.weatherDisplay) {
        this.weatherDisplay.innerHTML += forecastSection;
    }
};

// TODO: Create showError method
WeatherApp.prototype.showError = function(message) {
    const errorHTML = `
        <div class="error-message">
            <!-- TODO: Error icon/emoji -->
            <div class="error-emoji">❌</div>
            
            <!-- TODO: Error heading -->
            <h2 class="error-heading">Oops! Something went wrong</h2>
            
            <!-- TODO: Error message (use the message parameter) -->
            <p class="error-text">${message}</p>
        </div>
    `;
    
    // TODO: Display error
    if (this.weatherDisplay) {
        this.weatherDisplay.innerHTML = errorHTML;
    }
};

// TODO: Create showLoading method
WeatherApp.prototype.showLoading = function(message = 'Loading weather data...') {
    const loadingHTML = `
        <div class="loading-container">
            <!-- TODO: Spinner div -->
            <div class="spinner" aria-hidden="true"></div>
            
            <!-- TODO: Loading text -->
            <p class="loading-text">${message}</p>
        </div>
    `;
    
    // TODO: Display loading state
    if (this.weatherDisplay) {
        this.weatherDisplay.innerHTML = loadingHTML;
    }
};

// Initialize the WeatherApp with the API key
const app = new WeatherApp('ffa51e9063ccdb8d6eaa26fe6847ed64');
