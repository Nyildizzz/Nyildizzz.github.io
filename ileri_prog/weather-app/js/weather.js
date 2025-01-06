const API_KEY = '22232748b83460a02b03bde266c75492';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Şehir arama input'unu dinle
document.getElementById('city').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const city = this.value;
        getWeatherData(city);
        // Şehri localStorage'a kaydet
        localStorage.setItem('lastCity', city);
    }
});


// Hava durumu verilerini çek
async function getWeatherData(city) {
    try {
        // Anlık hava durumu için istek
        const currentWeatherResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&units=metric&lang=tr&appid=${API_KEY}`
        );
        const currentWeatherData = await currentWeatherResponse.json();

        // 5 günlük tahmin için istek
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&units=metric&lang=tr&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();

        if (currentWeatherResponse.ok && forecastResponse.ok) {
            displayWeather(currentWeatherData);
            displayHourlyForecast(forecastData);
            displayDailyForecast(forecastData);
            
            // Grafik için event gönder
            window.dispatchEvent(new CustomEvent('weatherDataUpdated', {
                detail: forecastData
            }));

            // Hava kalitesi verilerini al
            const { lat, lon } = currentWeatherData.coord;
            await getAirQuality(lat, lon);
        } else {
            alert('Şehir bulunamadı veya bir hata oluştu!');
        }

    } catch (error) {
        console.error('Hava durumu verileri alınırken hata oluştu:', error);
        alert('Hava durumu verileri alınamadı!');
    }
}

// Sayfa yüklendiğinde son aranan şehri veya varsayılan şehri göster
document.addEventListener('DOMContentLoaded', () => {
    // Eğer haritadan seçim yapıldıysa
    if (localStorage.getItem('citySelectedFromMap') === 'true') {
        const selectedCity = localStorage.getItem('selectedCity');
        if (selectedCity) {
            getWeatherData(selectedCity);
        }
        // Flag'i temizle
        localStorage.removeItem('citySelectedFromMap');
    } else {
        // Varsayılan şehir veya son seçilen şehir
        const defaultCity = localStorage.getItem('selectedCity') || 'Istanbul';
        getWeatherData(defaultCity);
    }
});

function displayWeather(data) {
    const cityName = document.getElementById("city-name");
    const temperature = document.getElementById("temperature");
    const rainChance = document.getElementById("rain-chance");
    const realFeel = document.getElementById("real-feel");
    const wind = document.getElementById("wind");
    const windDirection = document.getElementById("wind-direction");
    const humidity = document.getElementById("humidity");
    if(data.weather[0].icon === "01n"){
        data.weather[0].icon = "01d";
    }
    const foggyStyle = data.weather[0].icon === "50d" || data.weather[0].icon === "50n" ? "fog-icon" : "";
    if(foggyStyle){
        document.body.classList.add("foggy");
    }else{
        document.body.classList.remove("foggy");
    }
    const mainIcon = document.getElementById("main-weather-icon");

    const getWindDirection = (degrees) => {
        const directions = ['↑ K', '↗ KD', '→ D', '↘ GD', '↓ G', '↙ GB', '← B', '↖ KB'];
        return directions[Math.round(degrees / 45) % 8];
    };

  

    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°`;
    rainChance.textContent = `${data.weather[0].description}`;
    realFeel.textContent = `${Math.round(data.main.feels_like)}°`;
    wind.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    windDirection.textContent = getWindDirection(data.wind.deg);
    humidity.textContent = `${data.main.humidity}%`;
    mainIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Hava durumu efektini ayarla
    setWeatherEffect(data.weather[0].icon);
}

function displayHourlyForecast(data) {
    const hourlyContainer = document.getElementById("hourly-forecast");
    hourlyContainer.innerHTML = "";
    
    for (let i = 0; i < 6; i++) {
        const forecast = data.list[i];
        const time = new Date(forecast.dt * 1000).getHours();
        const temp = Math.round(forecast.main.temp);
        
        const hourDiv = document.createElement("div");
        if(forecast.weather[0].icon === "01n"){
            forecast.weather[0].icon = "01d";
        }
         // Kar tanesi iconu için özel stil
         const iconClass = forecast.weather[0].icon === "13n" || forecast.weather[0].icon === "13d" 
         ? 'snow-icon' 
         : '';
     
        
        hourDiv.className = "hour-item";
        hourDiv.innerHTML = `
            <span>${time}:00</span>
            <img class="${iconClass}" src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="weather">
            <h3 class="weather-description">${forecast.weather[0].description}</h3>
            <span>${temp}°</span>
        `;
        hourlyContainer.appendChild(hourDiv);
    }
}

function displayDailyForecast(data) {
    const dailyContainer = document.getElementById("daily-forecast");
    dailyContainer.innerHTML = "";
    
    const dailyData = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyData[date]) {
            dailyData[date] = item;
        }
    });
    
    Object.values(dailyData).slice(0, 7).forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('tr-TR', { weekday: 'short' });
        const temp = Math.round(forecast.main.temp);
        
        const dayDiv = document.createElement("div");
        dayDiv.className = "day-card";
        
        if(forecast.weather[0].icon === "01n"){
            forecast.weather[0].icon = "01d";
        }

        // Kar tanesi iconu için özel stil
        const iconClass = forecast.weather[0].icon === "13n" || forecast.weather[0].icon === "13d" 
            ? 'snow-icon' 
            : '';
        
        dayDiv.innerHTML = `
            <span>${day}</span>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" 
                 alt="weather" 
                 class="${iconClass}">
            <h3 class="weather-description">${forecast.weather[0].description}</h3>
            <span>${temp}°</span>
        `;
        dailyContainer.appendChild(dayDiv);
    });
}

function setWeatherEffect(weatherCode) {
    const effectsContainer = document.getElementById('weather-effects');
    effectsContainer.innerHTML = '';
    switch(weatherCode) {
        // Açık hava
        case '01d':
            createSunEffect(effectsContainer);
            break;
        
        // Parçalı bulutlu ve bulutlu
        case '02d':
        case '03d':
        case '04d':
        case '02n':
        case '03n':
        case '04n':
            createCloudEffect(effectsContainer);
            break;
        
        // Yağmur
        case '09d':
        case '09n':
        case '10d':
        case '10n':
            createRainEffect(effectsContainer);
            break;
        
        // Kar
        case '13d':
        case '13n':
            createSnowEffect(effectsContainer);
            break;

        // Sisli hava
        case '50d':
        case '50n':
            createFogEffect(effectsContainer);
            break;
    }
}

function createRainEffect(container) {
    const drops = 100;
    for(let i = 0; i < drops; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        drop.style.opacity = Math.random();
        container.appendChild(drop);
    }
}

function createSnowEffect(container) {
    const flakes = 50;
    for(let i = 0; i < flakes; i++) {
        const flake = document.createElement('div');
        flake.className = 'snow';
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.animationDelay = `${Math.random() * 5}s`;
        flake.style.opacity = Math.random() * 0.8 + 0.2;
        container.appendChild(flake);
    }
}

// Yeni efekt fonksiyonları
function createSunEffect(container) {
    const sun = document.createElement('div');
    sun.className = 'sun';
    
    // Işınları oluştur
    const raysContainer = document.createElement('div');
    raysContainer.className = 'sun-rays';
    
    // 12 ışın oluştur
    for(let i = 0; i < 12; i++) {
        const ray = document.createElement('div');
        ray.className = 'sun-ray';
        ray.style.transform = `rotate(${i * 30}deg)`;
        raysContainer.appendChild(ray);
    }
    
    sun.appendChild(raysContainer);
    container.appendChild(sun);
    
    // Rastgele pozisyon ver (üst kısımda)
    sun.style.top = '50px';
    sun.style.right = `${Math.random() * 30 + 10}%`;
}

function createCloudEffect(container) {
    // Birden fazla bulut oluştur
    const cloudCount = 5;
    for(let i = 0; i < cloudCount; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        // Her buluta farklı boyut ve pozisyon ver
        const size = 80 + Math.random() * 100;
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size/2}px`;
        cloud.style.top = `${Math.random() * 50}%`;
        
        // Animasyon gecikmesi ve hızı
        cloud.style.animationDelay = `${Math.random() * 5}s`;
        cloud.style.animationDuration = `${15 + Math.random() * 10}s`;
        
        // Opaklık
        cloud.style.opacity = 0.5 + Math.random() * 0.3;
        
        container.appendChild(cloud);
    }
}

function createFogEffect(container) {
    // Birkaç sis katmanı oluştur
    for(let i = 0; i < 5; i++) {
        const fogLayer = document.createElement('div');
        fogLayer.className = 'fog-layer';
        
        // Her katman için farklı pozisyon ve animasyon
        fogLayer.style.top = `${i * 20}%`;
        fogLayer.style.animationDelay = `${i * 1.5}s`;
        fogLayer.style.opacity = 0.5 + (Math.random() * 0.3);
        
        container.appendChild(fogLayer);
    }
}

async function getAirQuality(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const data = await response.json();
        console.log(data.list[0].main.aqi);
        updateAirQualityMeter(data.list[0].main.aqi);
    } catch (error) {
        console.error('Hava kalitesi verileri alınırken hata:', error);
    }
}

function updateAirQualityMeter(aqi) {
    const levels = {
        1: { text: 'İyi', color: '#00e400' },
        2: { text: 'Orta', color: '#ffff00' },
        3: { text: 'Hassas', color: '#ff7e00' },
        4: { text: 'Kötü', color: '#ff0000' },
        5: { text: 'Tehlikeli', color: '#7e0023' }
    };

    // Önceki aktif sınıfı kaldır
    document.querySelectorAll('.aqi-level').forEach(level => {
        level.classList.remove('active');
    });

    // Yeni seviyeyi aktif yap
    const currentLevel = document.querySelector(`[data-level="${aqi}"]`);
    if (currentLevel) {
        currentLevel.classList.add('active');
    }

    // Değerleri güncelle
    document.getElementById('aqi-value').textContent = aqi;
    document.getElementById('aqi-text').textContent = levels[aqi].text;
    document.getElementById('aqi-value').style.color = levels[aqi].color;
}
