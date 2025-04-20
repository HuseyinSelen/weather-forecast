import React, { useState, useEffect, useCallback } from "react";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const apiKey = process.env.REACT_APP_API_KEY;
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const getLocationWeather = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=tr`
          );
          const data = await response.json();
          if (response.ok) {
            setWeather(data);
            fetchForecast(data.name);
          }
        } catch (error) {
          console.error("Konumdan veri alınamadı:", error);
        }
      },
      (error) => {
        console.error("Konum izni reddedildi:", error);
        alert("Konum izni verilmedi. Lütfen manuel olarak şehir girin.");
      }
    );
  }, [apiKey]);

  useEffect(() => {
    getLocationWeather();
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, [getLocationWeather]);

  const fetchWeather = async () => {
    if (city === "") return;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=tr`
      );
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
        fetchForecast(city);
        setCity("");
      } else {
        alert(`Hata: ${data.message}`);
        setWeather(null);
      }
    } catch (error) {
      alert("Veri alınırken bir hata oluştu.");
    }
  };

  const fetchForecast = async (cityName) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric&lang=tr`
      );
      const data = await response.json();
      if (response.ok) {
        const dailyForecast = data.list.filter((item) =>
          item.dt_txt.includes("12:00:00")
        );
        setForecast(dailyForecast);
      }
    } catch (error) {
      console.error("Tahmin verisi alınamadı:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") fetchWeather();
  };

  const fetchWeatherByCity = async (cityName) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric&lang=tr`
      );
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
        fetchForecast(cityName);
      }
    } catch (error) {
      console.error("Favori şehir getirme hatası:", error);
    }
  };

  const addFavorite = () => {
    if (!weather || !weather.name) return;
    const updated = [...new Set([...favorites, weather.name])];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const removeFavorite = (cityToRemove) => {
    const updatedFavorites = favorites.filter((fav) => fav !== cityToRemove);
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const saveToDatabase = async () => {
    if (!weather) return;

    const cityData = {
      name: weather.name,
      temp: weather.main.temp,
      description: weather.weather[0].description,
      icon: weather.weather[0].icon,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/cities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cityData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Şehir başarıyla kaydedildi!");
      } else {
        alert("❌ Kayıt başarısız: " + result.message);
      }
    } catch (error) {
      console.error("Hata:", error);
      alert("Sunucuya bağlanırken bir hata oluştu.");
    }
  };

  const getBackgroundClass = (weatherMain) => {
    switch (weatherMain) {
      case "Clear":
        return "from-yellow-300 to-orange-500";
      case "Clouds":
        return "from-gray-400 to-gray-700";
      case "Rain":
      case "Drizzle":
        return "from-blue-400 to-blue-700";
      case "Snow":
        return "from-white to-blue-100";
      case "Thunderstorm":
        return "from-purple-800 to-black";
      default:
        return "from-sky-400 to-blue-600";
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-r ${
        weather ? getBackgroundClass(weather.weather[0].main) : "from-sky-400 to-blue-600"
      } flex items-center justify-center px-4 py-6`}
    >
      <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 shadow-lg text-white max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Hava Durumu 🌤️</h1>

        {/* Şehir Girişi */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Şehir girin..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 rounded-lg text-black focus:outline-none"
          />
          <button
            onClick={fetchWeather}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
          >
            Sorgula
          </button>
        </div>

        {/* Konuma göre güncelle */}
        <button
          onClick={getLocationWeather}
          className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white mb-6"
        >
          📍 Konuma Göre Güncelle
        </button>

        {/* Hava Durumu Kartı */}
        {weather && (
          <div className="bg-white/30 backdrop-blur-sm rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold">
              {weather.name}, {weather.sys.country}
            </h2>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt="icon"
              className="mx-auto w-20 h-20"
            />
            <p className="capitalize text-lg mt-2">{weather.weather[0].description}</p>
            <p className="text-4xl font-semibold mt-2">
              {weather.main.temp.toFixed(1)}°C
            </p>
            <div className="mt-4 flex justify-around text-sm">
              <p>🌬️ Rüzgar: {weather.wind.speed} m/s</p>
              <p>💧 Nem: {weather.main.humidity}%</p>
            </div>

            <button
              onClick={addFavorite}
              className="bg-pink-600 hover:bg-pink-700 text-white mt-4 px-4 py-2 rounded w-full"
            >
              ❤️ Favorilere Ekle
            </button>

            <button
              onClick={saveToDatabase}
              className="bg-indigo-600 hover:bg-indigo-700 text-white mt-3 px-4 py-2 rounded w-full"
            >
              💾 Veritabanına Kaydet
            </button>
          </div>
        )}

        {/* 5 Günlük Tahmin */}
        {forecast.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-white">5 Günlük Tahmin</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {forecast.map((item, i) => (
                <div key={i} className="bg-white/30 p-3 rounded-lg text-center text-white">
                  <p className="font-medium">
                    {new Date(item.dt_txt).toLocaleDateString("tr-TR", {
                      weekday: "short",
                    })}
                  </p>
                  <img
                    src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                    alt="icon"
                    className="mx-auto w-12 h-12"
                  />
                  <p className="text-sm">{item.weather[0].description}</p>
                  <p className="font-semibold">
                    {item.main.temp.toFixed(1)}°C
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favori Şehirler */}
        {favorites.length > 0 && (
          <div className="bg-white/10 p-4 rounded-lg mt-6">
            <h3 className="text-lg font-semibold mb-2">Favori Şehirler</h3>
            <div className="flex flex-wrap gap-2">
              {favorites.map((favCity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 bg-white/30 rounded px-2 py-1"
                >
                  <button
                    onClick={() => fetchWeatherByCity(favCity)}
                    className="text-sm hover:underline"
                  >
                    {favCity}
                  </button>
                  <button
                    onClick={() => removeFavorite(favCity)}
                    className="text-xs text-red-500 hover:text-red-700"
                    title="Favoriden kaldır"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
