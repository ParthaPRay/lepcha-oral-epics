const DATA = {
  interviews: "data/interviews.json",
  team: "data/team.json",
  activities: "data/activities.json"
};

const $ = (selector) => document.querySelector(selector);
const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));

document.querySelector("#year").textContent = new Date().getFullYear();

const menuToggle = $(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const nav = $(".nav");
  const opened = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(opened));
  menuToggle.setAttribute("aria-label", opened ? "Close menu" : "Open menu");
});
document.querySelectorAll(".nav a").forEach((link) => link.addEventListener("click", () => {
  $(".nav").classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

let interviews = [];
let storyMap;
const markerById = new Map();

function safeUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}

function initMap() {
  if (!window.L) {
    $("#sikkim-map").innerHTML = '<div class="map-fallback">The interactive map could not load. Check the internet connection and refresh the page.</div>';
    return;
  }
  storyMap = L.map("sikkim-map", {scrollWheelZoom: false, zoomControl: true}).setView([27.45, 88.45], 8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(storyMap);
  const bounds = L.latLngBounds([[26.8, 87.7], [28.2, 89.3]]);
  storyMap.setMaxBounds(bounds.pad(0.45));
}

function updateMapStory(record) {
  $("#map-story-title").textContent = record.narrator || "Interview record";
  const link = safeUrl(record.videoUrl);
  const precision = record.coordinatePrecision === "approximate" ? "Approximate area marker" : "Mapped interview location";
  $("#map-story").innerHTML = `
    <span class="story-label">Narrative topic</span><span class="story-value">${esc(record.topic || "Topic to be added")}</span>
    <span class="story-label">Interview by</span><span class="story-value">${esc(record.interviewBy || "Not supplied")}</span>
    <span class="story-label">Location · ${esc(precision)}</span><span class="story-value">${esc(record.location || "Sikkim")}</span>
    ${record.locationNote ? `<p class="map-precision-note">${esc(record.locationNote)}</p>` : ""}
    ${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">${esc(record.videoLinkNote ? "Open project playlist ↗" : "Watch recording ↗")}</a>` : ""}`;
}

function addMapMarkers(records) {
  if (!storyMap) return;
  const points = records.filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)));
  points.forEach((record) => {
    const marker = L.marker([Number(record.latitude), Number(record.longitude)], {
      title: `${record.narrator}: ${record.topic}`,
      alt: `${record.narrator}, ${record.topic}`
    }).addTo(storyMap);
    const popup = `<div class="map-popup-title">${esc(record.narrator)}</div><div class="map-popup-topic">${esc(record.topic)}</div><div class="map-popup-place">${esc(record.mapLabel || record.location || "Sikkim")}</div>`;
    marker.bindTooltip(popup, {direction: "top", offset: [0, -9], opacity: 1, className: "story-tooltip"});
    marker.bindPopup(popup);
    marker.on("click", () => {
      updateMapStory(record);
      storyMap.setView(marker.getLatLng(), Math.max(storyMap.getZoom(), 10), {animate: true});
    });
    markerById.set(record.id, marker);
  });
  if (points.length > 1) storyMap.fitBounds(L.featureGroup([...markerById.values()]).getBounds().pad(0.35));
}

function renderInterviews(records) {
  const host = $("#archive-list");
  if (!records.length) {
    host.innerHTML = '<div class="empty-state"><h3>No interview records match this search</h3><p>Clear the search or add a record to <code>data/interviews.json</code>.</p></div>';
    return;
  }
  host.innerHTML = records.map((record) => {
    const link = safeUrl(record.videoUrl);
    const themes = (record.themes || []).slice(0, 2).join(" · ");
    const type = record.narrativeType || record.mediaType || "Interview";
    return `<article class="interview-card" id="record-${esc(record.id)}">
      <div class="card-topline"><span>${esc(record.mediaType || "Interview")}</span><span class="type-pill">${esc(type)}</span></div>
      <h3>${esc(record.narrator || "Narrator to be added")}</h3>
      <p class="topic">${esc(record.topic || "Narrative topic to be added")}</p>
      <div class="record-meta">
        <div><small>Interview by</small><strong>${esc(record.interviewBy || "To be added")}</strong></div>
        <div><small>Location</small><strong>${esc(record.location || "Sikkim")}${record.coordinatePrecision === "approximate" ? " · approximate" : ""}</strong></div>
        <div><small>Themes</small><strong>${esc(themes || "To be catalogued")}</strong></div>
        <div><small>Context</small><strong>${esc(record.contextNote || "Project interview")}</strong></div>
      </div>
      <div class="record-actions">${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">${esc(record.videoLinkNote ? "Open project playlist ↗" : "Watch recording ↗")}</a>` : '<span class="pending-link">Video link to be added</span>'}
      ${Number.isFinite(Number(record.latitude)) && Number.isFinite(Number(record.longitude)) ? `<button type="button" class="map-jump" data-record="${esc(record.id)}">View on map ⌖</button>` : ""}</div>
    </article>`;
  }).join("");
  host.querySelectorAll(".map-jump").forEach((button) => button.addEventListener("click", () => {
    const record = interviews.find((item) => item.id === button.dataset.record);
    const marker = markerById.get(button.dataset.record);
    if (!record || !marker || !storyMap) return;
    updateMapStory(record);
    storyMap.setView(marker.getLatLng(), Math.max(storyMap.getZoom(), 10), {animate: true});
    marker.openPopup();
    $("#map").scrollIntoView({behavior: "smooth"});
  }));
}

function renderTeam(team) {
  const pi = team.principalInvestigator || {};
  const piPhoto = safeUrl(pi.photo);
  $("#pi-photo").src = piPhoto;
  $("#pi-photo").alt = pi.photoAlt || `${pi.name || "Principal Investigator"} portrait`;
  if (!piPhoto) $("#pi-photo").classList.add("photo-missing");
  $(".pi-copy h2").textContent = pi.name || "Principal Investigator";
  $(".pi-role").innerHTML = `${esc(pi.department || "")}<br>${esc(pi.institution || "")}`;
  $(".pi-links").innerHTML = [
    ["Personal academic website ↗", safeUrl(pi.profileUrl)],
    ["GitHub profile ↗", safeUrl(pi.githubUrl)]
  ].filter(([, url]) => url).map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`).join("");
  const host = $("#team-list");
  host.innerHTML = (team.interns || []).map((person) => {
    const photo = safeUrl(person.photo);
    const initials = (person.name || "IKF").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    return `<article class="team-card"><div class="team-photo">${photo ? `<img src="${esc(photo)}" alt="${esc(person.photoAlt || person.name)}" loading="lazy" onerror="this.remove();this.parentElement.insertAdjacentHTML('beforeend','<span class=&quot;team-initials&quot;>${esc(initials)}</span>')">` : `<span class="team-initials" aria-hidden="true">${esc(initials)}</span>`}</div><h3>${esc(person.name)}</h3><p>${esc(person.role || "Project Intern")}</p>${photo ? "" : '<span class="photo-status">Portrait slot</span>'}</article>`;
  }).join("");
}

function renderActivities(items) {
  const host = $("#activity-list");
  if (!items.length) {
    host.innerHTML = '<div class="activity-empty">No publications, seminars or outreach activities have been entered yet. Add confirmed items in <code>data/activities.json</code>.</div>';
    return;
  }
  host.innerHTML = items.map((item) => `<article class="activity-card"><span class="activity-type">${esc(item.type || "Project activity")}${item.date ? ` · ${esc(item.date)}` : ""}</span><h3>${esc(item.title || "Untitled activity")}</h3><p>${esc(item.description || "")}${item.contributors ? ` · ${esc(item.contributors)}` : ""}</p>${safeUrl(item.url) ? `<p><a href="${esc(safeUrl(item.url))}" target="_blank" rel="noopener">View details ↗</a></p>` : ""}</article>`).join("");
}

function applyFilters() {
  const query = $("#search-input").value.trim().toLocaleLowerCase();
  const selectedType = $("#type-filter").value;
  const filtered = interviews.filter((record) => {
    const haystack = [record.narrator, record.topic, record.interviewBy, record.location, record.narrativeType, ...(record.themes || [])].join(" ").toLocaleLowerCase();
    return (!query || haystack.includes(query)) && (selectedType === "all" || record.narrativeType === selectedType);
  });
  renderInterviews(filtered);
}

async function loadSiteData() {
  try {
    const [recordsResponse, teamResponse, activityResponse] = await Promise.all([
      fetch(DATA.interviews), fetch(DATA.team), fetch(DATA.activities)
    ]);
    if (![recordsResponse, teamResponse, activityResponse].every((response) => response.ok)) throw new Error("Could not load one or more site data files.");
    const [records, team, activities] = await Promise.all([recordsResponse.json(), teamResponse.json(), activityResponse.json()]);
    interviews = Array.isArray(records) ? records.filter((item) => item.status !== "draft") : [];
    renderTeam(team);
    renderActivities(Array.isArray(activities) ? activities : []);
    const types = [...new Set(interviews.map((record) => record.narrativeType).filter(Boolean))].sort();
    $("#type-filter").innerHTML = '<option value="all">All narrative types</option>' + types.map((type) => `<option value="${esc(type)}">${esc(type)}</option>`).join("");
    initMap();
    addMapMarkers(interviews);
    renderInterviews(interviews);
    $("#search-input").addEventListener("input", applyFilters);
    $("#type-filter").addEventListener("change", applyFilters);
  } catch (error) {
    console.error(error);
    $("#archive-list").innerHTML = '<div class="empty-state"><h3>Project records could not be loaded</h3><p>Open this site through GitHub Pages or a local web server, then refresh. See the README for local preview steps.</p></div>';
    $("#sikkim-map").innerHTML = '<div class="map-fallback">Map records could not be loaded. Check the data files and refresh.</div>';
  }
}

loadSiteData();
