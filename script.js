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
const saveBtn = document.getElementById('save-btn');
const favoritesList = document.getElementById('favorites-list');
let savedCities = JSON.parse(localStorage.getItem('weatherAppFavorites')) || [];

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

// --- FAVORITES LOGIC ---

// 1. Load favorites when the app starts
renderFavorites();

// 2. Event Listener for Save Button
saveBtn.addEventListener('click', () => {
    const cityName = document.getElementById('city-name').textContent.split(',')[0]; // Get just the city name
    
    // Avoid saving empty or duplicate cities
    if(cityName && !savedCities.includes(cityName)) {
        savedCities.push(cityName);
        updateLocalStorage();
        renderFavorites();
    } else {
        alert("City already in favorites or invalid!");
    }
});

// 3. Function to save to browser storage
function updateLocalStorage() {
    localStorage.setItem('weatherAppFavorites', JSON.stringify(savedCities));
}

// 4. Function to draw the buttons
function renderFavorites() {
    favoritesList.innerHTML = ''; // Clear current list
    
    savedCities.forEach(city => {
        // Create the button container
        const btn = document.createElement('button');
        btn.classList.add('fav-city-btn');
        btn.innerHTML = `${city} <span class="delete-fav" onclick="removeFavorite('${city}', event)">✖</span>`;
        
        // Add click event to fetch weather
        btn.addEventListener('click', (e) => {
            // Don't trigger search if clicking the X button
            if (e.target.classList.contains('delete-fav')) return;
            getWeather(city);
        });

        favoritesList.appendChild(btn);
    });
}

// 5. Function to remove a favorite
// We attach this to the global window object so the HTML onclick works
window.removeFavorite = function(city, event) {
    event.stopPropagation(); // Stop the click from triggering the weather search
    savedCities = savedCities.filter(c => c !== city); // Filter out the deleted city
    updateLocalStorage();
    renderFavorites();
};

// Automatically set the current year in the footer
document.querySelector('.footer-content p').innerHTML = 
    `&copy; ${new Date().getFullYear()} <span class="brand-name">WeatherWise</span>. All Rights Reserved.`;