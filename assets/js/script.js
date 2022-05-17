var searchButton = document.getElementById("search-btn");
var cityName = document.getElementById("cityName");
var currentTemp = document.getElementById("currentTemp");
var currentWeatherIcon = document.getElementById("currentWeatherIcon");
var currentWind = document.getElementById("currentWind");
var currentHumidity = document.getElementById("currentHumidity");
var currentUVI = document.getElementById("currentUVI");
var forecastRow = document.getElementById("forecast")
var cityInput = document.getElementById("cityInput");
var searchHistory = document.getElementById("search-history");

var apiKey = "c2714403f6df43a525a25ab5790ea1a4";

var searchedCities = [];

var validateCityInput = function () {
    getWeatherDataByCity(cityInput.value);
    addToHistory(cityInput.value);

    //Blank out last search
    cityInput.value = "";
    updateSearchButtonState();
}

var updateSearchButtonState = function () {
    if (cityInput.value.length > 0) {
        searchButton.classList.remove("disabled");
    }
    if (cityInput.value.length == 0) {
        searchButton.classList.add("disabled");
    }
}

var getWeatherDataByCity = function (city) {

    var geocodingApiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&appid=" + apiKey;
    // we have to get coordinates first, then get weather data
    // we will use fetch promise chaining to do this
    fetch(geocodingApiUrl) // request coordinates

        // Check if response is OK and if it is, load response as json
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                return Promise.reject("Geocoding API did not return a response 200.");
            }
        })

        // Check if we recieved geo coding data back and if we did, make a request to OneCall API
        .then(geo => {
            if (geo != "" && geo != null) {
                return fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + geo[0].lat + "&lon=" + geo[0].lon + "&units=imperial&appid=" + apiKey)
            } else {
                return Promise.reject("Geocoding API returned an empty or null array.");
            }
        })

        // Check if response is OK and if it is, load response as json
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                return Promise.reject("OneCall API did not return a response 200.");
            }
        })

        // check if we recieved weather data back and if we did, display it to user
        .then(weather => {
            if (weather != "" && weather != null) {
                return displayWeatherData(city, weather);
            }
        })

        // if we encounter errors above, this catch block will run
        .catch(function (error) {
            console.log(error);
        });
}

var displayWeatherData = function (city, weather) {

    //Display the current day's weather information
    cityName.textContent = city;
    currentTemp.textContent = "Temp " + weather.current.temp + " \xB0F";
    currentWeatherIcon.setAttribute("src", "https://openweathermap.org/img/wn/" + weather.current.weather[0].icon + ".png");
    currentWeatherIcon.setAttribute("alt", weather.current.weather[0].description);
    currentWeatherIcon.setAttribute("width", "40");
    currentWeatherIcon.setAttribute("height", "40");
    currentWind.textContent = "Wind: " + weather.current.wind_speed + " MPH";
    currentHumidity.textContent = "Humidity: " + weather.current.humidity + "%";

    var uviBadgeColor = "";
    //color code the UVI badge based on: https://www.cancer.org.au/blog/health-check-what-does-the-uv-index-mean
    if (weather.current.uvi < 2) {
        uviBadgeColor = "ForestGreen";
    } else if (weather.current.uvi < 5) {
        uviBadgeColor = "Gold"
    } else if (weather.current.uvi < 7) {
        uviBadgeColor = "Orange"
    } else if (weather.current.uvi < 10) {
        uviBadgeColor = "Orangered"
    } else if (weather.current.uvi > 11) {
        uviBadgeColor = "Purple"
    }
    currentUVI.innerHTML = "UV Index: <span class='badge badge-secondary px-3 py-1.5' style='background-color:" + uviBadgeColor + "'> " + weather.current.uvi + " </span>";


    //Display the 5 day forecast
    // First get rid of any previous forecasts
    while (forecastRow.firstChild) {
        forecastRow.removeChild(forecastRow.firstChild);
    }

    // API data returns today's weather in the zeroth position, so we set i = 1 to get the forcast starting tomorrow
    for (var i = 1; i < 6; i++) {

        //Using Bootstrap cards, so dynamically creating the card element
        var card = document.createElement("div");
        card.classList.add("card");
        forecastRow.append(card);

        var cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        cardBody.classList.add("text-white");
        card.append(cardBody);

        // API data returns the date in Unix seconds, but JavaScript date requires milliseconds, so need to * 1000
        var day = new Date(weather.daily[i].dt * 1000)
        var cardDate = document.createElement("h5");
        cardDate.classList.add("card-title");
        cardDate.textContent = (day.getMonth() + 1) + "/" + day.getDate() + "/" + day.getFullYear();
        cardBody.append(cardDate);

        var cardIcon = document.createElement("img");
        cardIcon.setAttribute("src", "https://openweathermap.org/img/wn/" + weather.daily[i].weather[0].icon + ".png");
        cardIcon.setAttribute("alt", weather.daily[i].weather[0].description);
        cardIcon.setAttribute("width", "40");
        cardIcon.setAttribute("height", "40");
        cardBody.append(cardIcon);

        var cardTemp = document.createElement("p");
        cardTemp.classList.add("card-text");
        cardTemp.textContent = "Temp: " + weather.daily[i].temp.day + " \xB0F";
        cardBody.append(cardTemp);

        var cardWind = document.createElement("p");
        cardWind.classList.add("card-text");
        cardWind.textContent = "Wind: " + weather.daily[i].wind_speed + " MPH";
        cardBody.append(cardWind);

        var cardHumidity = document.createElement("p");
        cardHumidity.classList.add("card-text");
        cardHumidity.textContent = "Humidity: " + weather.daily[i].humidity + " %";
        cardBody.append(cardHumidity);
    }
}

var loadFromLocalStorage = function () {
    // if there's some data in local storage, then get it and generate the history button elements
    if (localStorage.getItem("searchedCities")) {
        searchedCities = JSON.parse(localStorage.getItem("searchedCities"));
        if (searchedCities) {
            for (var i = 0; i < searchedCities.length; i++) {
                var historyButton = document.createElement("button");
                historyButton.textContent = searchedCities[i];
                historyButton.classList.add("btn");
                historyButton.classList.add("btn-secondary");
                historyButton.classList.add("w-100");
                historyButton.classList.add("my-2");
                searchHistory.append(historyButton);
            }
        }
    }
}

var addToHistory = function (city) {
    var historyButton = document.createElement("button");
    historyButton.textContent = city;
    historyButton.classList.add("btn");
    historyButton.classList.add("btn-secondary");
    historyButton.classList.add("w-100");
    historyButton.classList.add("my-2");
    searchHistory.append(historyButton);

    // add new city to array and put the array back into local storage
    searchedCities.push(city)
    localStorage.setItem("searchedCities", JSON.stringify(searchedCities));
}

var searchHistoricalCity = function (event) {
    if (event.target.tagName = "button") {
        getWeatherDataByCity(event.target.textContent);
    }
}

document.addEventListener("DOMContentLoaded", loadFromLocalStorage);
cityInput.addEventListener("input", updateSearchButtonState);
searchButton.addEventListener("click", validateCityInput);
searchHistory.addEventListener("click", searchHistoricalCity);