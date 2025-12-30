// 1. Select all the elements
const weatherIcon = document.getElementById('weather-icon');
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const cityName = document.getElementById('city-name');
const dateElement = document.getElementById('date');
const localTimeElement = document.getElementById('local-time');
const tempElement = document.getElementById('temp');
const weatherDesc = document.getElementById('weather-desc');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind-speed');
const errorMsg = document.getElementById('error-message');
const weatherResult = document.getElementById('weather-result');

// 2. Define API Key and Global variable for the timer
const apiKey = '432fce959afd458bbc600111c6834184'; 
const apiBase = 'https://api.openweathermap.org/data/2.5/weather';
let timerInterval; // This will hold our clock interval

// 3. Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) getWeather(city);
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value;
        if (city) getWeather(city);
    }
});

// 4. Fetch weather data
async function getWeather(city) {
    try {
        const url = `${apiBase}?q=${city}&units=metric&appid=${apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('City not found');

        const data = await response.json();
        updateUI(data);
        
        errorMsg.style.display = 'none'; 
        weatherResult.style.display = 'block'; 

    } catch (error) {
        console.error(error);
        errorMsg.style.display = 'block';
        weatherResult.style.display = 'none'; 
    }
}

// 5. Update UI
function updateUI(data) {
    // Basic Info
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    tempElement.textContent = `${Math.round(data.main.temp)}°c`;
    weatherDesc.textContent = data.weather[0].description;
    humidityElement.textContent = `${data.main.humidity}%`;
    windElement.textContent = `${data.wind.speed} km/h`;

    // Weather Icon
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.style.display = 'block';

    // --- REAL-TIME CLOCK LOGIC ---
    
    // Clear any existing timer before starting a new one
    if (timerInterval) clearInterval(timerInterval);

    // Function to calculate and display time
    const displayTime = () => {
        const utcTime = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);
        const cityTime = new Date(utcTime + (data.timezone * 1000));

        // Format Time
        localTimeElement.textContent = cityTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit', // Added seconds so you can see it ticking
            hour12: true 
        });

        // Format Date
        dateElement.textContent = cityTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Run once immediately, then every 1 second
    displayTime();
    timerInterval = setInterval(displayTime, 1000);

    changeBackground(data.weather[0].main);
}

// 6. Background Logic
function changeBackground(weatherCondition) {
    const body = document.body;
    body.className = ''; 

    switch (weatherCondition) {
        case 'Clear': body.classList.add('sunny'); break;
        case 'Clouds': body.classList.add('cloudy'); break;
        case 'Rain':
        case 'Drizzle':
        case 'Thunderstorm': body.classList.add('rainy'); break;
        default: body.classList.add('default'); break;
    }
}

// Automatically set the current year in the footer
document.querySelector('.footer-content p').innerHTML = 
    `&copy; ${new Date().getFullYear()} <span class="brand-name">WeatherWise</span>. All Rights Reserved.`;