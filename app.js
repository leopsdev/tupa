// Tupã Weather Dashboard - Shared JavaScript
let weatherData = null;

// Defines the Bootstrap icons for each rain range
const rainIcons = {
    low: 'bi-cloud-drizzle-fill', 
    moderate: 'bi-cloud-rain', 
    high: 'bi-cloud-lightning-rain-fill'
};

// Defines the rain color classes
const rainColors = {
    low: 'icon-rain-low',
    moderate: 'icon-rain-moderate',
    high: 'icon-rain-high'
};

// Geocoding Function (Nominatim API)
async function geocodeNominatim(place) {
    const q = encodeURIComponent(place);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&addressdetails=1`;
    
    const resp = await fetch(url, {
        headers: {
            'Accept-Language': 'en-US',
            'User-Agent': 'tupã/1.0 (phbs.va@gmail)'
        }
    });
    if (!resp.ok) throw new Error(`Error: ${resp.status}`);
    const results = await resp.json();
    if (results.length === 0) return null;
    return {
        display_name: results[0].display_name,
        lat: parseFloat(results[0].lat),
        lon: parseFloat(results[0].lon),
        raw: results
    };
}

// Function to update Thermometer icon color
function updateThermometerColor(iconElement, temperature) {
    if (!iconElement) return;
    iconElement.classList.remove('icon-red', 'icon-yellow', 'icon-blue');

    // Color Logic: Red (>30), Yellow (18-30), Blue (<18)
    if (temperature > 30) {
        iconElement.classList.add('icon-red');
    } else if (temperature >= 18 && temperature <= 30) {
        iconElement.classList.add('icon-yellow');
    } else if (temperature < 18) {
        iconElement.classList.add('icon-blue');
    }
}

// Function to update Rain icon and color
function updateRainIcon(iconElement, rainProbability) {
    if (!iconElement) return;
    // Remove all possible icons and colors
    Object.values(rainIcons).forEach(cls => iconElement.classList.remove(cls));
    Object.values(rainColors).forEach(cls => iconElement.classList.remove(cls));

    let iconClass = rainIcons.moderate;
    let colorClass = rainColors.moderate;

    if (rainProbability <= 30) {
        iconClass = rainIcons.low;
        colorClass = rainColors.low;
    } else if (rainProbability > 60) {
        iconClass = rainIcons.high;
        colorClass = rainColors.high;
    }
    
    // Apply the correct icon and color
    iconElement.classList.add(iconClass);
    iconElement.classList.add(colorClass);
}

// CSV Download Function
function generateAndDownloadCsv(data, location, date) {
    const temp = data.T2M.toFixed(1);
    const humidity = data.RH2M.toFixed(1);
    const wind = data.WS10M.toFixed(2);
    const solar = data.ALLSKY_SFC_SW_DWN.toFixed(2);
    const pressure = data.PS.toFixed(2);
    const rainProb = data.rainProb;
    const pw = data.PW.toFixed(2);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric,Value,Unit\n";
    csvContent += `Location,${location},N/A\n`;
    csvContent += `Date,${date},N/A\n`;
    csvContent += `Temperature,${temp},°C\n`;
    csvContent += `Relative_Humidity,${humidity},%\n`;
    csvContent += `Wind_Speed,${wind},m/s\n`;
    csvContent += `Solar_Irradiation,${solar},kWh/m²\n`;
    csvContent += `Atmospheric_Pressure,${pressure},hPa\n`;
    csvContent += `Rain_Probability,${rainProb},%\n`;
    csvContent += `Precipitable_Water,${pw},kg/m²\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tupa_Weather_Data_${location.replace(/[^a-zA-Z0-9]/g, '_')}_${date.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Rain Probability Calculation Function
function calculateRainProbability(data) {
    let p = 0.1;
    
    if (data.RH2M > 80) p += 0.3;
    else if (data.RH2M > 60) p += 0.2;
    else if (data.RH2M > 40) p += 0.1;
    
    if (data.PW > 20) p += 0.3;
    else if (data.PW > 10) p += 0.15;
    
    if (data.ALLSKY_SFC_SW_DWN < 100) p += 0.3;
    else if (data.ALLSKY_SFC_SW_DWN < 200) p += 0.15;
    
    if (data.T2M > 35) p -= 0.2;
    else if (data.T2M > 30) p -= 0.1;
    
    return Math.round(Math.max(0, Math.min(1, p)) * 100);
}

// UI Update Function
function updateUI(data) {
    const temp = data.T2M;

    const currentTemp = document.getElementById('current-temp');
    const maxTemp = document.getElementById('max-temp');
    const minTemp = document.getElementById('min-temp');
    const currentHumidity = document.getElementById('current-humidity');
    const currentWind = document.getElementById('current-wind');
    const solarRadiation = document.getElementById('solar-radiation');
    const pressure = document.getElementById('pressure');
    const rainProb = document.getElementById('rain-prob');

    if (currentTemp) currentTemp.textContent = `${temp.toFixed(1)}°C`;
    if (maxTemp) maxTemp.textContent = `N/A`; 
    if (minTemp) minTemp.textContent = `N/A`; 
    if (currentHumidity) currentHumidity.textContent = `${data.RH2M.toFixed(1)}%`;
    if (currentWind) currentWind.textContent = `${data.WS10M.toFixed(1)} m/s`;
    if (solarRadiation) solarRadiation.textContent = `${data.ALLSKY_SFC_SW_DWN.toFixed(2)} kWh/m²`; 
    if (pressure) pressure.textContent = `${data.PS.toFixed(1)} hPa`;
    if (rainProb) rainProb.textContent = `${data.rainProb}%`;

    updateThermometerColor(document.getElementById('temp-icon'), temp);
    updateRainIcon(document.getElementById('rain-icon'), data.rainProb);
}

// NASA POWER Data Fetch Function
async function getAndUpdateWeather(lat, lon, date) {
    let queryDate = new Date(date);
    const mouthDate = new Date('2025-10-01');

    if (queryDate > mouthDate) {
        queryDate.setDate(queryDate.getDate() - 365);
    }

    const startDate = queryDate.toISOString().split('T')[0].replace(/-/g, "");
    
    const params = new URLSearchParams({
        start: startDate,
        end: startDate,
        latitude: lat,
        longitude: lon,
        parameters: "T2M,RH2M,PW,ALLSKY_SFC_SW_DWN,WS10M,PS",
        community: "AG",
        format: "JSON",
        temporal: "daily"
    });
    
    const baseUrl = "https://power.larc.nasa.gov/api/temporal/daily/point";
    const url = `${baseUrl}?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const parameters = data.properties.parameter;
    
    const dailyData = {
        T2M: parameters.T2M[startDate],
        RH2M: parameters.RH2M[startDate],
        PW: parameters.PW[startDate],
        ALLSKY_SFC_SW_DWN: parameters.ALLSKY_SFC_SW_DWN[startDate],
        WS10M: parameters.WS10M[startDate],
        PS: parameters.PS[startDate]
    };
    
    // Calculate rain probability
    const prob = calculateRainProbability(dailyData); 
    
    weatherData = { ...dailyData, rainProb: prob };
    updateUI(weatherData);
}

// DOM Setup
document.addEventListener('DOMContentLoaded', () => {
    // Splash screen elements
    const splashScreen = document.getElementById('splash-screen');
    const enterButton = document.getElementById('enter-btn');
    const mainNavbar = document.getElementById('main-navbar');
    const mainContentContainer = document.getElementById('main-content-container');

    // Splash screen dismissal logic (sessionStorage based)
    if (splashScreen && enterButton && mainNavbar && mainContentContainer) {
        const isDismissed = sessionStorage.getItem('splashDismissed');
        if (isDismissed === 'true') {
            splashScreen.classList.add('hidden');
            mainNavbar.classList.remove('hidden-initial');
            mainContentContainer.classList.remove('hidden-initial');
            mainNavbar.style.display = 'flex';
        } else {
            enterButton.addEventListener('click', () => {
                splashScreen.classList.add('hidden');
                mainNavbar.classList.remove('hidden-initial');
                mainContentContainer.classList.remove('hidden-initial');
                mainNavbar.style.display = 'flex';
                sessionStorage.setItem('splashDismissed', 'true');
            });
        }
    }

    // Weather form elements
    const form = document.getElementById('weather-form');
    const locationInput = document.getElementById('location_input');
    const dateInput = document.getElementById('date_input');
    const coordsDisplay = document.getElementById('coords-display');
    const coordsWrapper = document.getElementById('coords-display-wrapper'); 
    const locationDisplay = document.getElementById('location-display');
    const dateDisplay = document.getElementById('date-display');
    const downloadBtn = document.getElementById('download-csv-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const weatherContainer = document.getElementById('weather-data-container');

    // Weather form submission handler
    if (form && locationInput && dateInput) {
        // Set default date to today if empty
        if (!dateInput.value) {
            dateInput.valueAsDate = new Date();
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const place = locationInput.value;
            const date = dateInput.value;
            
            if (!place || !date) {
                alert('Please fill in the location name and date.'); 
                return;
            }
            
            if (weatherContainer) weatherContainer.classList.add('d-none');
            if (coordsWrapper) coordsWrapper.style.display = 'none'; 
            if (loadingSpinner) loadingSpinner.classList.remove('d-none');
            if (downloadBtn) downloadBtn.disabled = true;
            
            try {
                const coords = await geocodeNominatim(place);
                
                if (!coords) {
                    alert('Location not found. Try a more specific name.'); 
                    return;
                }
                
                const { lat, lon, display_name } = coords;
                if (locationDisplay) locationDisplay.textContent = display_name.split(',')[0]; 
                if (coordsDisplay) coordsDisplay.textContent = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                if (coordsWrapper) coordsWrapper.style.display = 'block'; 
                if (dateDisplay) {
                    dateDisplay.textContent = new Date(date).toLocaleDateString('en-US', { dateStyle: 'long' }); 
                }
                await getAndUpdateWeather(lat, lon, date);
                if (downloadBtn) downloadBtn.disabled = false;
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Could not load data. Please try again or check the console."); 
            } finally {
                if (loadingSpinner) loadingSpinner.classList.add('d-none');
                if (weatherContainer) weatherContainer.classList.remove('d-none');
            }
        });
    }

    // CSV Download handler
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (weatherData && locationDisplay && dateDisplay) {
                generateAndDownloadCsv(weatherData, locationDisplay.textContent, dateDisplay.textContent);
            } else {
                alert('No data to download. Update the weather first.'); 
            }
        });
    }
});
