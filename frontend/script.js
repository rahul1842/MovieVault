const TMDB_KEY = "bfa57bdf90da74029e10dc756caa7cfe";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
let allMovies = [];
let currentUser = null;
let store = {}; // for favorites, watch later, ratings (frontend cache)

// ----------- UTILITY -----------
function showMessage(text, d = 1600) {
  const el = document.getElementById("message");
  el.textContent = text;
  el.style.opacity = "1";
  setTimeout(() => (el.style.opacity = "0"), d);
}
function el(tag, cls, inner) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (inner !== undefined) e.innerHTML = inner;
  return e;
}

// ----------- FETCH POPULAR MOVIES -----------
async function fetchPopular() {
  try {
    const page = Math.floor(Math.random() * 50) + 1;
    const r = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=${page}`
    );
    const j = await r.json();
    allMovies = j.results || [];
  } catch (e) {
    showMessage("Failed to fetch movies");
    allMovies = [];
  }
  renderHome();
}

// ----------- POSTER CARD -----------
function createPosterCard(m) {
  const card = el("div", "poster-card");
  const img = el("img", "poster-img");
  img.src = m.poster_path
    ? TMDB_IMG + m.poster_path
    : "https://via.placeholder.com/500x750?text=No+Image";
  const info = el("div", "poster-info");
  info.appendChild(el("div", "poster-title", m.title));
  info.appendChild(el("div", "poster-sub", (m.release_date || "").slice(0, 4)));

  const overlay = el("div", "overlay-actions");
  overlay.style.display = "flex";
  overlay.style.justifyContent = "space-between";
  overlay.style.alignItems = "flex-start"; // move items nicely
  overlay.style.padding = "8px";

  const starRow = el("div", "star-row");
  for (let i = 1; i <= 5; i++) {
    const s = el("div", "star", "★");
    s.dataset.value = i;
    s.onclick = () => rateMovie(m.id, i);
    starRow.appendChild(s);
  }

  const right = el("div", "");
  right.style.display = "flex";
  right.style.flexDirection = "column";
  right.style.gap = "6px";

  const favBtn = el("div", "action-btn-small", "❤");
  favBtn.onclick = () => toggleSave(m, "favorites", favBtn);

  const wlBtn = el("div", "action-btn-small", "⏱");
  wlBtn.onclick = () => toggleSave(m, "watchlater", wlBtn);

  right.appendChild(favBtn);
  right.appendChild(wlBtn);
  overlay.appendChild(starRow);
  overlay.appendChild(right);

  card.appendChild(img);
  card.appendChild(info);
  card.appendChild(overlay);

  return { card, favBtn, wlBtn, starRow };
}

// ----------- RENDER HOME -----------
function renderHome(list) {
  const grid = document.getElementById("homeGrid");
  grid.innerHTML = "";
  const arr = list && list.length ? list : allMovies;
  if (!arr || arr.length === 0) {
    grid.appendChild(el("div", "empty-state", "No results"));
    document.getElementById("resultsCount").textContent = "0 results";
    return;
  }
  arr.forEach((m) => {
    const { card } = createPosterCard(m);
    grid.appendChild(card);
    updateCardState(m.id, card);
  });
  document.getElementById("resultsCount").textContent = `${arr.length} results`;
}

// ----------- UPDATE CARD STATE -----------
function updateCardState(id, cardEl) {
  const fav = store[currentUser]?.favorites?.some((x) => x.id === id);
  const wl = store[currentUser]?.watchlater?.some((x) => x.id === id);
  const rating =
    store[currentUser]?.ratings?.find((r) => r.id === id)?.score || 0;
  const favBtn = cardEl.querySelectorAll(".action-btn-small")[0];
  const wlBtn = cardEl.querySelectorAll(".action-btn-small")[1];
  const stars = cardEl.querySelectorAll(".star");
  if (favBtn)
    favBtn.style.background = fav
      ? "rgba(255,75,75,0.95)"
      : "rgba(0,0,0,0.45)";
  if (wlBtn)
    wlBtn.style.background = wl
      ? "rgba(249,115,22,0.95)"
      : "rgba(0,0,0,0.45)";
  stars.forEach(
    (s) =>
      (s.style.background =
        s.dataset.value <= rating
          ? "rgba(255,209,102,0.95)"
          : "rgba(255,255,255,0.04)")
  );
}

// ----------- TOGGLE SAVE / RATE -----------
function toggleSave(movie, key, btn) {
  if (!currentUser || currentUser === "Guest") {
    openAuth("signup");
    return;
  }
  const arr = store[currentUser][key] || [];
  if (arr.some((x) => x.id === movie.id))
    store[currentUser][key] = arr.filter((x) => x.id !== movie.id);
  else arr.push(movie), (store[currentUser][key] = arr);
  updateLibrary();
  renderHome();
}
function rateMovie(id, score) {
  if (!currentUser || currentUser === "Guest") {
    openAuth("login");
    return;
  }
  const arr = store[currentUser].ratings || [];
  const exists = arr.find((r) => r.id === id);
  if (exists) exists.score = score;
  else arr.push({ id, score });
  store[currentUser].ratings = arr;
  updateLibrary();
  renderHome();
}

// ----------- LIBRARY RENDER -----------
function updateLibrary() {
  if (!currentUser) return;
  if (!store[currentUser])
    store[currentUser] = { favorites: [], watchlater: [], ratings: [] };
  ["favGrid", "wlGrid", "ratedGrid"].forEach(
    (id) => (document.getElementById(id).innerHTML = "")
  );
  (store[currentUser].favorites || []).forEach((m) => {
    const { card } = createPosterCard(m);
    document.getElementById("favGrid").appendChild(card);
    updateCardState(m.id, card);
  });
  (store[currentUser].watchlater || []).forEach((m) => {
    const { card } = createPosterCard(m);
    document.getElementById("wlGrid").appendChild(card);
    updateCardState(m.id, card);
  });
  (store[currentUser].ratings || []).forEach((r) => {
    const m = allMovies.find((x) => x.id === r.id) || {
      id: r.id,
      title: "Unknown",
    };
    const { card } = createPosterCard(m);
    document.getElementById("ratedGrid").appendChild(card);
    updateCardState(m.id, card);
  });
}

// ----------- SHOW SECTION -----------
function showSection(s) {
  ["homeView", "sectionFavorites", "sectionWatchlater", "sectionRated"].forEach(
    (id) => document.getElementById(id).classList.add("hidden")
  );
  ["navHome", "navFavorites", "navWatch", "navRated"].forEach((n) =>
    document.getElementById(n).classList.remove("active")
  );
  if (s === "home")
    document.getElementById("homeView").classList.remove("hidden"),
      document.getElementById("navHome").classList.add("active");
  else if (s === "favorites")
    document.getElementById("sectionFavorites").classList.remove("hidden"),
      document.getElementById("navFavorites").classList.add("active");
  else if (s === "watchlater")
    document.getElementById("sectionWatchlater").classList.remove("hidden"),
      document.getElementById("navWatch").classList.add("active");
  else if (s === "rated")
    document.getElementById("sectionRated").classList.remove("hidden"),
      document.getElementById("navRated").classList.add("active");
}

// ----------- AUTH MODAL -----------
function openAuth(mode) {
  document.getElementById("authModal").classList.remove("hidden");
  document.getElementById("authTitle").textContent =
    mode === "login" ? "Login" : "Sign up";
  document.getElementById("loginForm").classList.toggle("hidden", mode !== "login");
  document.getElementById("signupForm").classList.toggle("hidden", mode !== "signup");
}
function closeAuth() {
  document.getElementById("authModal").classList.add("hidden");
}

// ----------- LOGIN / SIGNUP USING SERVER -----------
async function performSignup() {
  const username = document.getElementById("signupUserField").value.trim();
  const email = document.getElementById("signupEmailField").value.trim();
  const password = document.getElementById("signupPassField").value;
  if (!username || !email || !password) {
    showMessage("All fields required");
    return;
  }
  try {
    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      showMessage(data.message);
      return;
    }
    currentUser = username;
    store[currentUser] = { favorites: [], watchlater: [], ratings: [] };
    updateUserUI();
    showMessage(`Account created: ${username}`);
    closeAuth();
  } catch (e) {
    showMessage("Server error");
  }
}

async function performLogin() {
  const email = document.getElementById("loginUserField").value.trim();
  const password = document.getElementById("loginPassField").value;
  if (!email || !password) {
    showMessage("Enter email & password");
    return;
  }
  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      showMessage(data.message);
      return;
    }
    currentUser = data.username;
    if (!store[currentUser])
      store[currentUser] = { favorites: [], watchlater: [], ratings: [] };
    updateUserUI();
    showMessage(`Welcome back, ${currentUser}`);
    closeAuth();
  } catch (e) {
    showMessage("Server error");
  }
}

function performLogout() {
  currentUser = "Guest";
  updateUserUI();
  showMessage("Logged out");
}

// ----------- UPDATE UI -----------
function updateUserUI() {
  document.getElementById("userName").textContent = currentUser;
  document.getElementById("userBadge").textContent = currentUser;
  document.getElementById("avatarInitial").textContent =
    currentUser[0].toUpperCase();
  document.getElementById("openLogin").classList.toggle("hidden", currentUser !== "Guest");
  document.getElementById("openSignup").classList.toggle("hidden", currentUser !== "Guest");
  document.getElementById("logoutBtn").classList.toggle("hidden", currentUser === "Guest");
  updateLibrary();
}

// ----------- INIT -----------
document.addEventListener("DOMContentLoaded", () => {
  currentUser = "Guest";
  store[currentUser] = { favorites: [], watchlater: [], ratings: [] };
  updateUserUI();
  fetchPopular();
  showSection("home");
});

// ----------- SEARCH (TMDb API) -----------
async function sideSearchKey(e) {
  if (e.key === "Enter") {
    const q = e.target.value.trim();
    if (!q) {
      renderHome(allMovies);
      return;
    }
    try {
      const r = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&language=en-US&query=${encodeURIComponent(
          q
        )}&page=1&include_adult=false`
      );
      const j = await r.json();
      const results = j.results || [];
      renderHome(results);
    } catch (err) {
      showMessage("Search failed");
    }
  }
}
