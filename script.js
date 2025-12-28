// 1. Select all the elements we need to change
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const cityName = document.getElementById('city-name');
const dateElement = document.getElementById('date');
const tempElement = document.getElementById('temp');
const weatherDesc = document.getElementById('weather-desc');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind-speed');
const errorMsg = document.getElementById('error-message');
const weatherResult = document.getElementById('weather-result');

// 2. Define your API Key and URL
const apiKey = '432fce959afd458bbc600111c6834184'; 
const apiBase = 'https://api.openweathermap.org/data/2.5/weather';

// 3. Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeather(city);
    }
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value;
        if (city) {
            getWeather(city);
        }
    }
});

// 4. Main Function to fetch weather data
async function getWeather(city) {
    try {
        const url = `${apiBase}?q=${city}&units=metric&appid=${apiKey}`;
        const response = await fetch(url);

        console.log("Connection status:", response.status);
        
        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        console.log("API Data Received:", data);
        
        // Success: Update UI and show the results
        updateUI(data);
        errorMsg.style.display = 'none'; 
        weatherResult.style.display = 'block'; 

    } catch (error) {
        console.error(error);
        errorMsg.style.display = 'block';
        weatherResult.style.display = 'none'; 
    }
}

// 5. Function to update the Text in the HTML
function updateUI(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    tempElement.textContent = `${Math.round(data.main.temp)}°c`;
    weatherDesc.textContent = data.weather[0].description;
    humidityElement.textContent = `${data.main.humidity}%`;
    windElement.textContent = `${data.wind.speed} km/h`;
    
    const now = new Date();
    dateElement.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Call the background change function here
    changeBackground(data.weather[0].main);
}

// 6. Function to handle Background Logic
function changeBackground(weatherCondition) {
    const body = document.body;
    body.className = ''; // Reset classes

    switch (weatherCondition) {
        case 'Clear':
            body.classList.add('sunny');
            break;
        case 'Clouds':
            body.classList.add('cloudy');
            break;
        case 'Rain':
        case 'Drizzle':
        case 'Thunderstorm':
            body.classList.add('rainy');
            break;
        default:
            body.classList.add('default');
            break;
    }
}