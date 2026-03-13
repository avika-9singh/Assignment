# ⛅ WeatherSync

A vanilla JavaScript weather dashboard that lets you search **any city, state, country, or region worldwide** and fetch live weather data in parallel using `Promise.all()` — powered entirely by the [Open-Meteo API](https://open-meteo.com/). No API key. No account. No build step.

---

## ✨ Features

- 🔍 **Search any location** — city, state, country, district, island, anything
- 💬 **Autocomplete dropdown** — up to 8 live suggestions as you type, with keyboard navigation (↑ ↓ Enter Escape)
- ⚡ **Promise.allSettled()** — all cards refresh in parallel simultaneously
- 💀 **Skeleton loading cards** — animated shimmer placeholders while data loads
- ⚠️ **Per-card error states** — one failure doesn't affect other cards; retry button per card
- ✕ **Remove cards** — hover any card to remove it
- 🔄 **Refresh All** — re-fetches every active location at once
- 🗑️ **Clear All** — wipe the board and start fresh
- 🚫 **Duplicate detection** — warns if a location is already on the board
- 🌡️ **Temperature colour coding** — hot to cold mapped to warm to cool colours
- ⏱️ **Local time per location** — shows current local time in the city's timezone
- 💨 Wind speed, 💧 humidity, 🌡️ feels-like temperature on every card
- 30+ WMO weather codes mapped to conditions + emojis
- Dark brutalist design with animated ambient background blobs
- Fully responsive — mobile to widescreen

---

## 🗂️ File Structure

```
weather-app/
├── index.html   # Markup, search bar, code block, layout
├── style.css    # All styles, animations, skeleton, cards, autocomplete
└── app.js       # Geocoding, weather fetch, Promise.all, DOM rendering
```

---

## 🚀 How to Run

No build step, no server, no npm — just open the file.

```bash
git clone https://github.com/avika-9singh/weather-app.git
cd weather-app
open index.html       # macOS
start index.html      # Windows
xdg-open index.html   # Linux
```

Or just double-click `index.html` in your file explorer.

---

## 🔌 APIs Used

Both are **completely free** with no account or API key required.

### 1. Open-Meteo Geocoding API
Converts a search query (city name, state, country) into latitude/longitude + timezone.

```
GET https://geocoding-api.open-meteo.com/v1/search?name=Ghaziabad&count=8
```

Returns: name, admin region, country, latitude, longitude, timezone.

### 2. Open-Meteo Forecast API
Returns current weather given coordinates.

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=28.67&longitude=77.44
  &current_weather=true
  &hourly=relativehumidity_2m,apparent_temperature
  &timezone=Asia/Kolkata
```

Returns: temperature, wind speed, weather code, humidity, feels-like, day/night flag.

---

## ⚡ How Promise.all Works Here

```js
// On "Refresh All" — all locations fetched simultaneously
const results = await Promise.allSettled(
  activeLocations.map(loc => fetchWeather(loc))
);

// Promise.allSettled — one failure won't cancel the rest
results.forEach((result, i) => {
  if (result.status === 'fulfilled') renderCard(result.value);
  else renderErrorCard(activeLocations[i], result.reason);
});
```

`Promise.allSettled` is used instead of `Promise.all` so that if one city's network request fails, all other cards still render successfully.

---

## 🔍 Search Examples

| Query | What you get |
|---|---|
| `Ghaziabad` | Ghaziabad, Uttar Pradesh, India |
| `Kerala` | Kerala state, India |
| `Alaska` | Alaska, United States |
| `Bavaria` | Bavaria, Germany |
| `New York` | New York City, USA |
| `Sydney` | Sydney, New South Wales, Australia |
| `Reykjavik` | Reykjavik, Iceland |
| `Sahara` | Sahara region |

---

## 🌡️ Temperature Colour Scale

| Range | Colour | Meaning |
|---|---|---|
| >= 40°C | Deep Red | Extreme heat |
| >= 35°C | Orange-Red | Very hot |
| >= 28°C | Amber | Warm |
| >= 18°C | Yellow | Mild |
| >= 10°C | Sky Blue | Cool |
| >= 0°C | Violet | Cold |
| < 0°C | Light Violet | Freezing |

---

## 🛠️ Built With

- Vanilla HTML5, CSS3, JavaScript (ES6+)
- [Open-Meteo Forecast API](https://open-meteo.com/)
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
- [Google Fonts](https://fonts.google.com/) — Unbounded + DM Mono
- Zero external libraries, zero dependencies, zero API keys

---

## 👩‍💻 Author

**Avika Singh**
[github.com/avika-9singh](https://github.com/avika-9singh)
