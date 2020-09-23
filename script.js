var saveText = localStorage.getItem("lastCity");
var cities = [saveText];
var weatherApi = "e8006442d5d6af0c50efac93b2cfda16";

function runOnLoad() {
    // Generates Last search local button and data, if data exists
    if (!(cities.length === -1)) {
        renderButtons(cities);
        pullRequest(cities[0]);
    }



    //Search Button Click functionality
    $(".search").on("click", function (event) {
        event.preventDefault();
        // call function to do ajax stuff later when buttons added
        var searchCity = $("#city-search").val().trim();
        // console.log(searchCity);
        // Call funciton to build the data
        var junkcity = pullRequest(searchCity);
        // Trying to work on fix to boot out errors, must be an asynch thing, since button still renders and still gets saved as local
        if (junkcity === -1) {
            return;
        } else {
            // save search to last item local storage
            var searchSave = searchCity;
            localStorage.setItem("lastCity", searchSave);
            // Add city to buttons if it is unique
            if (cities.indexOf(searchCity) === -1) {
                cities.unshift(searchCity);
                renderButtons(cities);
            }
        }
    })
    $(".pastCity").on("click", function (event) {
        event.preventDefault();
        var buttonCity = $(this).attr('id');
        // console.log(buttonCity);
        pullRequest(buttonCity);
        // save search to last item local storage
        var buttonSave = buttonCity;
        localStorage.setItem("lastCity", buttonSave);
    })


}

function pullRequest(ajaxCity) {
    // console.log(ajaxCity);
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?q=${ajaxCity}&appid=${weatherApi}&units=imperial`,
        method: "GET",
        error: function () {
            console.error("error");
            alert("City not found, please check spelling")
            return(-1);
        }
    }).then(function (response) {
        // console.log(response);

        var cityLat = response.coord.lat;
        var cityLon = response.coord.lon;
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly&appid=${weatherApi}`,
            method: "GET"
        }).then(function (onePull) {

            // console.log(onePull);
            // TODO: add error code functionality

            // if (response.Error === "Movie not found!") {
            // ADD Error Code here in case of a non value
            // movies.splice(movies.indexOf(clickedMovie), 1);
            // renderButtons();
            //Add some text inside the movie data to through back, movie not found removed button
            // $("#movie-view").text("Movie Not Found, Removing Button from list")
            // } else {
            // applyMovieData(response);
            // $("#movie-view").text(JSON.stringify(response));
            // }
            // Using localStorage.setItem Save to Local Storage
            generateWeatherData(response, onePull);
        })
    })
}

function generateWeatherData(weatherData, oneData) {
    // console.log(weatherData);
    // Clear out the div
    $(".weather-today").empty();
    // Row 1 City and Date h1 
    var titleRow = $("<div>", { "class": "row" })
    var dateTime = moment().format("ddd, YYYY MMM DD, h:mm a");
    var dataTitle = $("<h4>", { "class": "cityAndDate" }).text(`${weatherData.name} ${dateTime}`);
    var imgData = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`
    var titleImage = $("<img>", { "src": imgData });
    $(titleRow).append(dataTitle, titleImage);
    $(".weather-today").append(titleRow);
    // Row 2 Temperature h5
    var tempRow = $("<div>", { "class": "row" })
    var dataTemp = $("<h6>", { "class": "cityTemp" }).text("Temperature: " + weatherData.main.temp + String.fromCharCode(176) + `F`);
    $(tempRow).append(dataTemp);
    $(".weather-today").append(tempRow);
    // Row 3 Humidity h5
    var humidRow = $("<div>", { "class": "row" })
    var dataHumid = $("<h6>", { "class": "cityHumid" }).text("Humidity: " + weatherData.main.humidity + String.fromCharCode(37));
    $(humidRow).append(dataHumid);
    $(".weather-today").append(humidRow);
    // Row 4 Wind Speed
    var windRow = $("<div>", { "class": "row" })
    var dataWind = $("<h6>", { "class": "cityWind" }).text(`Wind Speed: ${weatherData.wind.speed} MPH`);
    $(windRow).append(dataWind);
    $(".weather-today").append(windRow);
    // Row 5 UV Index
    var cityuvi = oneData.daily[0].uvi;
    var uviRow = $("<div>", { "class": "row" })
    var dataUvi = $("<h6>", { "class": "cityUvi" }).text(`UV Index: ${cityuvi}`);
    // change text color and background based on uv index value
    if (cityuvi < 3) {
        console.log("less than 3");
        dataUvi.css("background-color", "limegreen");
    } else if (cityuvi >= 8) {
        console.log("greater than 8");
        dataUvi.css("background-color", "red");
        dataUvi.css("color", "white");
    } else if (cityuvi < 6) {
        dataUvi.css("background-color", "yellow")
    } else {
        dataUvi.css("background-color", "orange");
        dataUvi.css("color", "white");
    }
    $(uviRow).append(dataUvi);
    $(".weather-today").append(uviRow);
    // Row 6 5 Day Forcast Text
    $(".five-day").empty();
    var fiveTitleRow = $("<div>", { "class": "row" });
    var fiveTitle = $("<h4>", { "class": "fiveTitle" }).text(`5-Day Forcast:`);
    fiveTitleRow.append(fiveTitle)
    $(".five-day").append(fiveTitleRow);
    // Row 7 5 day cards (for loop)
    var fiveCardRow = $("<div>", { "class": "row" });
    for (let i = 1; i < 6; i++) {
        // Generate New Card for each of the 5 days, Populate with date, image of weather (ie: sunny), tempurature, and humidity
        var newCard = $("<div>", { "class": "card decker col-md-2", "id": `FiveDay${i}` });
        var dateTime = moment().add(i, 'days').format("YYYY MMM DD");
        var fiveDate = $("<h6>", { "class": "row" }).text(dateTime);
        var imgFive = `http://openweathermap.org/img/wn/${oneData.daily[i].weather[0].icon}@2x.png`
        var fiveImage = $("<img>", { "src": imgFive, "class": "row" });
        // The data has temp in kelvin, convert to farenheit
        var tempFive = (oneData.daily[i].temp.day - 273.15) * 1.80 + 32;
        var fiveTemp = $("<p>", { "class": "row" }).text("Temperature: " + tempFive.toFixed(2) + String.fromCharCode(176) + `F`);
        var fiveHumid = $("<h6>", { "class": "row" }).text("Humidity: " + oneData.daily[i].humidity + String.fromCharCode(37));
        newCard.append(fiveDate, fiveImage, fiveTemp, fiveHumid);
        fiveCardRow.append(newCard);
    }
    $(".five-day").append(fiveCardRow);
};


// Function to Add Buttons
function renderButtons(ourCities) {
    $(".sideBar").empty();
    for (let k = 0; k < ourCities.length; k++) {
        var pastCity = $("<button>", { "class": "row pastCity", "id": `${ourCities[k]}` }).text(ourCities[k]);
        $(".sideBar").append(pastCity);
    }
}

runOnLoad();