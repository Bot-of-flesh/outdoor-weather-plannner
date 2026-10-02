const button = document.querySelector("button");
const cityInput = document.querySelector("#city");
const form = document.querySelector("#weather-form");
// Open-Meteoは数値コードを天気として返しますが、それを日本語に変換します。
const weatherDescriptions = {
    0: "快晴",
    1: "晴れ",
    2: "一部くもり",
    3: "くもり",
    45: "霧",
    48: "着氷性の霧",
    51: "弱い霧雨",
    53: "霧雨",
    55: "強い霧雨",
    56: "弱い着氷性の霧雨",
    57: "強い着氷性の霧雨",
    61: "弱い雨",
    63: "雨",
    65: "強い雨",
    66: "弱い着氷性の雨",
    67: "強い着氷性の雨",
    71: "弱い雪",
    73: "雪",
    75: "強い雪",
    77: "雪あられ",
    80: "弱いにわか雨",
    81: "にわか雨",
    82: "激しいにわか雨",
    85: "弱いにわか雪",
    86: "強いにわか雪",
    95: "雷雨",
    96: "雷雨（弱いひょう）",
    97: "強い雷雨",
    99: "雷雨（強いひょう）"
};
form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (button.disabled) return;
    const message = document.querySelector("#message");
    const advice = document.querySelector("#advice");
    advice.textContent = "";
    if (cityInput.value.trim() === "") {
        message.textContent = "地域を入力してください";
    }
    else {
        message.textContent = "天気を取得しています…";
        button.disabled = true;
        try {
            const city = cityInput.value.trim();
            const url = "https://msearch.gsi.go.jp/address-search/AddressSearch?q="
                + encodeURIComponent(city)
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("地域の検索に失敗しました");
            }
            const data = await response.json();
            if (data.length === 0) {
                message.textContent = "地域が見つかりませんでした。"
                return;
            }
            const result = data[0]
            const place = {
                name: result.properties.title,
                latitude: result.geometry.coordinates[1],
                longitude: result.geometry.coordinates[0]
            };
            const weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude="
                + place.latitude
                + "&longitude="
                + place.longitude
                + "&current=temperature_2m,wind_speed_10m,weather_code";
            const weatherResponse = await fetch(weatherUrl);
            if(!weatherResponse.ok){
                throw new Error("天気の取得に失敗しました")
            }
            const weatherData = await weatherResponse.json();
            //weatherData.current.temperature_2m = 30;
            const temperature = weatherData.current.temperature_2m;
            const windSpeed = weatherData.current.wind_speed_10m;
            const weatherCode = weatherData.current.weather_code;
            const weatherDescription = weatherDescriptions[weatherCode] ?? "天気不明";
            message.textContent = place.name
                + ": "
                + weatherDescription
                + " / "
                + temperature
                + "°C"
                + " / 風速: "
                + windSpeed
                + " "
                + weatherData.current_units.wind_speed_10m;
            if (temperature >= 30) {
                advice.textContent = "暑いので休憩と水分補給を忘れずに"
            } else if (temperature < 10) {
                advice.textContent = "暖かい服装で出かけましょう"
            }
        } catch (error) {
            message.textContent = error.message
            console.error(error);
        } finally {
            setTimeout(function(){
                button.disabled = false;
            }, 1100)
        }

    }
});




