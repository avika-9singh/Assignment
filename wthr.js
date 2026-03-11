/**
 * ═══════════════════════════════════════════════════════
 *  WeatherSync  ·  app.js
 *
 *  ✦ Search ANY city, state, country worldwide
 *  ✦ Geocoding via Open-Meteo Geocoding API (free, no key)
 *  ✦ Weather via Open-Meteo Forecast API
 *  ✦ Refresh All uses Promise.allSettled() in parallel
 *  ✦ Autocomplete dropdown with keyboard navigation
 *  ✦ Add / remove cards dynamically
 *  ✦ Loading skeleton + per-card error states
 * ═══════════════════════════════════════════════════════
 */

'use strict';

// ─────────────────────────────────────────
//  WMO WEATHER CODE → LABEL + EMOJI
// ─────────────────────────────────────────
const WMO_CODES = {
    0: { label: 'Clear sky',                  emoji: '☀️'  },
    1: { label: 'Mainly clear',               emoji: '🌤️' },
    2: { label: 'Partly cloudy',              emoji: '⛅'  },
    3: { label: 'Overcast',                   emoji: '☁️'  },
   45: { label: 'Foggy',                      emoji: '🌫️' },
   48: { label: 'Icy fog',                    emoji: '🌫️' },
   51: { label: 'Light drizzle',              emoji: '🌦️' },
   53: { label: 'Moderate drizzle',           emoji: '🌦️' },
   55: { label: 'Dense drizzle',              emoji: '🌧️' },
   61: { label: 'Slight rain',                emoji: '🌧️' },
   63: { label: 'Moderate rain',              emoji: '🌧️' },
   65: { label: 'Heavy rain',                 emoji: '🌧️' },
   71: { label: 'Slight snow',                emoji: '🌨️' },
   73: { label: 'Moderate snow',              emoji: '❄️'  },
   75: { label: 'Heavy snow',                 emoji: '❄️'  },
   77: { label: 'Snow grains',                emoji: '🌨️' },
   80: { label: 'Slight showers',             emoji: '🌦️' },
   81: { label: 'Moderate showers',           emoji: '🌧️' },
   82: { label: 'Violent showers',            emoji: '⛈️' },
   85: { label: 'Slight snow showers',        emoji: '🌨️' },
   86: { label: 'Heavy snow showers',         emoji: '🌨️' },
   95: { label: 'Thunderstorm',               emoji: '⛈️' },
   96: { label: 'Thunderstorm + hail',        emoji: '⛈️' },
   99: { label: 'Thunderstorm + heavy hail',  emoji: '🌩️' },
};

function getWeatherInfo(code) {
  return WMO_CODES[code] ?? { label: 'Unknown', emoji: '🌡️' };
}

// ─────────────────────────────────────────
//  CARD ACCENT COLOURS (cycles through)
// ─────────────────────────────────────────
const ACCENT_PALETTE = [
  { accent: '#f5a623', glow: 'rgba(245,166,35,0.12)'  },
  { accent: '#67c8ff', glow: 'rgba(103,200,255,0.12)' },
  { accent: '#38d9c0', glow: 'rgba(56,217,192,0.12)'  },
  { accent: '#a78bfa', glow: 'rgba(167,139,250,0.12)' },
  { accent: '#fb923c', glow: 'rgba(251,146,60,0.12)'  },
  { accent: '#f472b6', glow: 'rgba(244,114,182,0.12)' },
  { accent: '#86efac', glow: 'rgba(134,239,172,0.12)' },
];

let accentIndex = 0;
function nextAccent() {
  const c = ACCENT_PALETTE[accentIndex % ACCENT_PALETTE.length];
  accentIndex++;
  return c;
}

// ─────────────────────────────────────────
//  APP STATE
// ─────────────────────────────────────────
let activeLocations  = [];
let locationIdCounter = 0;

function makeLocationId() {
  return `loc_${++locationIdCounter}`;
}

// ─────────────────────────────────────────
//  GEOCODING API  (Open-Meteo, free, no key)
// ─────────────────────────────────────────
async function geocode(query) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name',     query.trim());
  url.searchParams.set('count',    '8');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format',   'json');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Geocoding failed: HTTP ${res.status}`);

  const data = await res.json();
  return data.results ?? [];
}

// ─────────────────────────────────────────
//  WEATHER FETCH
// ─────────────────────────────────────────
async function fetchWeather(loc) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude',        loc.lat);
  url.searchParams.set('longitude',       loc.lon);
  url.searchParams.set('current_weather', 'true');
  url.searchParams.set('hourly',          'relativehumidity_2m,apparent_temperature');
  url.searchParams.set('timezone',        loc.tz || 'auto');
  url.searchParams.set('forecast_days',   '1');
  url.searchParams.set('wind_speed_unit', 'kmh');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);

  const data = await res.json();
  const cur  = data.current_weather;

  const humidity  = data.hourly?.relativehumidity_2m?.[0]  ?? '--';
  const feelsLike = data.hourly?.apparent_temperature?.[0] ?? '--';

  return {
    loc,
    temperature: Math.round(cur.temperature),
    feelsLike:   typeof feelsLike === 'number' ? Math.round(feelsLike) : feelsLike,
    windspeed:   Math.round(cur.windspeed),
    humidity,
    weathercode: cur.weathercode,
    isDay:       cur.is_day === 1,
  };
}

// ─────────────────────────────────────────
//  DOM REFERENCES
// ─────────────────────────────────────────
const grid             = document.getElementById('cardsGrid');
const emptyState       = document.getElementById('emptyState');
const searchForm       = document.getElementById('searchForm');
const searchInput      = document.getElementById('searchInput');
const searchBtn        = document.getElementById('searchBtn');
const searchBtnIcon    = document.getElementById('searchBtnIcon');
const autocompleteList = document.getElementById('autocompleteList');
const searchHint       = document.getElementById('searchHint');
const refreshBtn       = document.getElementById('refreshBtn');
const refreshIcon      = document.getElementById('refreshIcon');
const clearBtn         = document.getElementById('clearBtn');
const lastUpdated      = document.getElementById('lastUpdated');

// ─────────────────────────────────────────
//  SKELETON
// ─────────────────────────────────────────
function makeSkeleton(id) {
  const el = document.createElement('div');
  el.className = 'skeleton-card';
  el.dataset.skeletonFor = id;
  el.innerHTML = `
    <div class="skeleton-line skeleton-icon"></div>
    <div class="skeleton-line skeleton-title"></div>
    <div class="skeleton-line skeleton-temp"></div>
    <div class="skeleton-line skeleton-sub"></div>
    <div class="skeleton-line skeleton-sub-2"></div>
  `;
  return el;
}

function removeSkeleton(id) {
  const el = grid.querySelector(`[data-skeleton-for="${id}"]`);
  if (el) el.remove();
}

// ─────────────────────────────────────────
//  RENDER WEATHER CARD
// ─────────────────────────────────────────
function renderCard(weatherData) {
  const { loc, temperature, feelsLike, windspeed, humidity, weathercode, isDay } = weatherData;
  const { label, emoji } = getWeatherInfo(weathercode);

  const localTime = new Date().toLocaleTimeString('en-US', {
    timeZone: loc.tz || 'UTC',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const tempColor =
    temperature >= 40 ? '#ff4500' :
    temperature >= 35 ? '#ff6b35' :
    temperature >= 28 ? '#f5a623' :
    temperature >= 18 ? '#ffd166' :
    temperature >= 10 ? '#67c8ff' :
    temperature >=  0 ? '#a78bfa' :
                        '#c4b5fd';

  const subLabel = [loc.admin1, loc.country].filter(Boolean).join(', ');

  const card = document.createElement('div');
  card.className = 'weather-card';
  card.dataset.locationId = loc.id;
  card.style.setProperty('--card-accent', loc.accent);
  card.style.setProperty('--card-glow',   loc.glow);

  card.innerHTML = `
    <button class="card-remove-btn" data-remove="${loc.id}" title="Remove" aria-label="Remove ${escapeHtml(loc.name)}">✕</button>

    <div class="card-header">
      <div class="city-info">
        <div class="city-name">${escapeHtml(subLabel)}</div>
        <div class="country-name">${escapeHtml(loc.name)}</div>
      </div>
      <div class="weather-emoji" role="img" aria-label="${label}">${emoji}</div>
    </div>

    <div class="temp-row">
      <span class="temp-value" style="color:${tempColor}">${temperature}</span>
      <span class="temp-unit">°C</span>
    </div>

    <div class="condition-label">${label} · ${isDay ? 'Daytime' : 'Nighttime'}</div>

    <div class="stats-row">
      <div class="stat-pill"><span class="stat-pill-icon">🌡️</span>Feels ${feelsLike}°C</div>
      <div class="stat-pill"><span class="stat-pill-icon">💨</span>${windspeed} km/h</div>
      <div class="stat-pill"><span class="stat-pill-icon">💧</span>${humidity}% humidity</div>
    </div>

    <div class="card-time">🕐 Local time: ${localTime}</div>
  `;

  return card;
}

// ─────────────────────────────────────────
//  RENDER ERROR CARD
// ─────────────────────────────────────────
function renderErrorCard(loc, err) {
  const card = document.createElement('div');
  card.className = 'error-card';
  card.dataset.locationId = loc.id;
  card.innerHTML = `
    <button class="card-remove-btn" data-remove="${loc.id}" title="Remove"
      style="opacity:1;position:absolute;top:14px;right:14px;">✕</button>
    <div class="error-icon">⚠️</div>
    <div class="error-title">Failed: ${escapeHtml(loc.name)}</div>
    <div class="error-detail">${escapeHtml(err.message || 'Network error.')}</div>
    <button class="retry-btn" data-retry="${loc.id}">↻ Retry</button>
  `;
  return card;
}

// ─────────────────────────────────────────
//  ADD A LOCATION
// ─────────────────────────────────────────
async function addLocation(geoResult) {
  // Deduplicate by proximity
  const isDupe = activeLocations.some(l =>
    Math.abs(l.lat - geoResult.latitude)  < 0.05 &&
    Math.abs(l.lon - geoResult.longitude) < 0.05
  );
  if (isDupe) {
    setHint('⚠️ That location is already on your board.', 'error');
    return;
  }

  const colors = nextAccent();
  const loc = {
    id:      makeLocationId(),
    name:    geoResult.name,
    admin1:  geoResult.admin1   || '',
    country: geoResult.country  || '',
    lat:     geoResult.latitude,
    lon:     geoResult.longitude,
    tz:      geoResult.timezone || 'auto',
    ...colors,
  };

  activeLocations.push(loc);
  updateEmptyState();

  const skeleton = makeSkeleton(loc.id);
  grid.appendChild(skeleton);

  try {
    const weatherData = await fetchWeather(loc);
    removeSkeleton(loc.id);
    grid.appendChild(renderCard(weatherData));
  } catch (err) {
    removeSkeleton(loc.id);
    grid.appendChild(renderErrorCard(loc, err));
  }

  updateTimestamp();
}

// ─────────────────────────────────────────
//  REMOVE A LOCATION
// ─────────────────────────────────────────
function removeLocation(id) {
  activeLocations = activeLocations.filter(l => l.id !== id);
  const card = grid.querySelector(`[data-location-id="${id}"]`);
  if (card) {
    card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';
    setTimeout(() => { card.remove(); updateEmptyState(); }, 260);
  } else {
    updateEmptyState();
  }
}

// ─────────────────────────────────────────
//  RETRY A FAILED CARD
// ─────────────────────────────────────────
async function retryLocation(id) {
  const loc = activeLocations.find(l => l.id === id);
  if (!loc) return;

  const errCard = grid.querySelector(`[data-location-id="${id}"]`);
  if (errCard) {
    const skeleton = makeSkeleton(id);
    grid.insertBefore(skeleton, errCard);
    errCard.remove();
  }

  try {
    const weatherData = await fetchWeather(loc);
    removeSkeleton(id);
    grid.appendChild(renderCard(weatherData));
  } catch (err) {
    removeSkeleton(id);
    grid.appendChild(renderErrorCard(loc, err));
  }
}

// ─────────────────────────────────────────
//  REFRESH ALL  (Promise.allSettled — parallel)
// ─────────────────────────────────────────
async function refreshAll() {
  if (activeLocations.length === 0) return;

  refreshBtn.disabled = true;
  refreshIcon.classList.add('spinning');
  setHint('Refreshing all locations…', '');

  grid.innerHTML = '';
  activeLocations.forEach(loc => grid.appendChild(makeSkeleton(loc.id)));

  // ── All fetches fire simultaneously ──
  const results = await Promise.allSettled(
    activeLocations.map(loc => fetchWeather(loc))
  );

  grid.innerHTML = '';
  results.forEach((result, i) => {
    const loc = activeLocations[i];
    if (result.status === 'fulfilled') {
      grid.appendChild(renderCard(result.value));
    } else {
      console.error(`[WeatherSync] ${loc.name}:`, result.reason);
      grid.appendChild(renderErrorCard(loc, result.reason));
    }
  });

  refreshBtn.disabled = false;
  refreshIcon.classList.remove('spinning');
  updateTimestamp();
  setHint(`${activeLocations.length} location${activeLocations.length > 1 ? 's' : ''} updated.`, 'success');
  setTimeout(() => setHint('Type to search any location worldwide', ''), 2500);
}

// ─────────────────────────────────────────
//  CLEAR ALL
// ─────────────────────────────────────────
function clearAll() {
  activeLocations = [];
  accentIndex = 0;
  grid.innerHTML = '';
  updateEmptyState();
  setHint('Board cleared. Search a location to add it.', '');
  lastUpdated.textContent = '';
}

// ─────────────────────────────────────────
//  UI HELPERS
// ─────────────────────────────────────────
function updateEmptyState() {
  emptyState.hidden = activeLocations.length > 0;
}

function setHint(msg, type) {
  searchHint.textContent = msg;
  searchHint.className   = 'search-hint' + (type ? ` ${type}` : '');
}

function updateTimestamp() {
  lastUpdated.textContent = `Updated ${new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─────────────────────────────────────────
//  AUTOCOMPLETE
// ─────────────────────────────────────────
let debounceTimer    = null;
let acResults        = [];
let focusedIndex     = -1;

function showAutocomplete(items) {
  acResults    = items;
  focusedIndex = -1;
  autocompleteList.innerHTML = '';

  if (items.length === 0) {
    autocompleteList.innerHTML = '<li class="autocomplete-empty">No results found.</li>';
  } else {
    items.forEach((item, i) => {
      const li = document.createElement('li');
      li.className = 'autocomplete-item';
      li.role = 'option';
      li.dataset.index = i;

      const sub    = [item.admin1, item.country_code].filter(Boolean).join(' · ');
      const coords = `${item.latitude.toFixed(2)}°, ${item.longitude.toFixed(2)}°`;

      li.innerHTML = `
        <span class="autocomplete-item-icon">📍</span>
        <div class="autocomplete-item-info">
          <div class="autocomplete-item-name">${escapeHtml(item.name)}</div>
          <div class="autocomplete-item-sub">${escapeHtml(sub)}${item.country ? ` · ${escapeHtml(item.country)}` : ''}</div>
        </div>
        <span class="autocomplete-item-lat">${coords}</span>
      `;

      li.addEventListener('mousedown', e => { e.preventDefault(); selectItem(i); });
      autocompleteList.appendChild(li);
    });
  }

  autocompleteList.hidden = false;
}

function hideAutocomplete() {
  autocompleteList.hidden = true;
  acResults    = [];
  focusedIndex = -1;
}

function moveFocus(delta) {
  const items = autocompleteList.querySelectorAll('.autocomplete-item');
  if (!items.length) return;
  items.forEach(el => el.classList.remove('focused'));
  focusedIndex = Math.max(0, Math.min(focusedIndex + delta, items.length - 1));
  items[focusedIndex].classList.add('focused');
  items[focusedIndex].scrollIntoView({ block: 'nearest' });
}

async function selectItem(i) {
  const item = acResults[i];
  if (!item) return;
  hideAutocomplete();
  searchInput.value = '';
  setHint(`Adding ${item.name}…`, '');
  await addLocation(item);
  setHint('Type to search another location', '');
}

// Input → debounced geocode
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const q = searchInput.value.trim();

  if (q.length < 2) { hideAutocomplete(); return; }

  autocompleteList.innerHTML = '<li class="autocomplete-loading">🔍 Searching…</li>';
  autocompleteList.hidden = false;

  debounceTimer = setTimeout(async () => {
    try {
      const results = await geocode(q);
      showAutocomplete(results);
    } catch {
      hideAutocomplete();
      setHint('⚠️ Search failed. Check your connection.', 'error');
    }
  }, 300);
});

// Keyboard nav
searchInput.addEventListener('keydown', e => {
  if (autocompleteList.hidden) return;
  if (e.key === 'ArrowDown')  { e.preventDefault(); moveFocus(+1); }
  else if (e.key === 'ArrowUp')   { e.preventDefault(); moveFocus(-1); }
  else if (e.key === 'Escape')    { hideAutocomplete(); }
  else if (e.key === 'Enter' && focusedIndex >= 0) { e.preventDefault(); selectItem(focusedIndex); }
});

searchInput.addEventListener('blur', () => setTimeout(hideAutocomplete, 180));

// ─────────────────────────────────────────
//  FORM SUBMIT (Enter or Add button)
// ─────────────────────────────────────────
searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  hideAutocomplete();

  const q = searchInput.value.trim();
  if (!q) return;

  searchBtn.disabled = true;
  searchBtnIcon.classList.add('spinning');
  setHint(`Searching "${q}"…`, '');

  try {
    const results = await geocode(q);
    if (!results.length) {
      setHint(`⚠️ No location found for "${q}". Try a different name.`, 'error');
    } else {
      searchInput.value = '';
      await addLocation(results[0]);
      setHint('Location added! Search another one.', 'success');
      setTimeout(() => setHint('Type to search any location worldwide', ''), 2000);
    }
  } catch {
    setHint('⚠️ Search failed. Check your connection.', 'error');
  } finally {
    searchBtn.disabled = false;
    searchBtnIcon.classList.remove('spinning');
  }
});

// ─────────────────────────────────────────
//  DELEGATED CLICKS ON GRID
// ─────────────────────────────────────────
grid.addEventListener('click', e => {
  const removeBtn = e.target.closest('[data-remove]');
  if (removeBtn) { removeLocation(removeBtn.dataset.remove); return; }

  const retryBtn = e.target.closest('[data-retry]');
  if (retryBtn)  { retryLocation(retryBtn.dataset.retry);   return; }
});

refreshBtn.addEventListener('click', refreshAll);
clearBtn.addEventListener('click',   clearAll);

// ─────────────────────────────────────────
//  INIT — 3 default cities on load
// ─────────────────────────────────────────
const DEFAULTS = [
  { name: 'New Delhi', admin1: 'Delhi',   country: 'India',          country_code: 'IN', latitude: 28.6139, longitude:  77.2090, timezone: 'Asia/Kolkata'  },
  { name: 'London',    admin1: 'England', country: 'United Kingdom', country_code: 'GB', latitude: 51.5072, longitude:  -0.1276, timezone: 'Europe/London' },
  { name: 'Tokyo',     admin1: 'Tokyo',   country: 'Japan',          country_code: 'JP', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo'   },
];

document.addEventListener('DOMContentLoaded', async () => {
  updateEmptyState();
  setHint('Loading default cities…', '');
  await Promise.all(DEFAULTS.map(loc => addLocation(loc)));
  setHint('Type to search any city, state, or country worldwide', '');
});