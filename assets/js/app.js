const DATA = {
  interviews: "data/interviews.json",
  narrators: "data/narrators.json",
  team: "data/team.json",
  activities: "data/activities.json"
};

const $ = (selector, root = document) => root.querySelector(selector);
const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
const SIKKIM = {south: 26.5, north: 28.5, west: 87.4, east: 89.7};

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
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim(), window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}

function stableRecordId(record, index) {
  return record.id || `record-${index + 1}`;
}

function recordCoordinates(record) {
  const latValue = record.latitude;
  const lonValue = record.longitude;
  if (latValue === null || lonValue === null || String(latValue ?? "").trim() === "" || String(lonValue ?? "").trim() === "") return null;
  const latitude = Number(latValue);
  const longitude = Number(lonValue);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < SIKKIM.south || latitude > SIKKIM.north || longitude < SIKKIM.west || longitude > SIKKIM.east) return null;
  return {latitude, longitude};
}

function getMediaItems(record) {
  const items = Array.isArray(record.media) ? [...record.media] : [];
  const candidates = [
    ["video", record.videoUrl, "Watch recording ↗"],
    ["audio", record.audioUrl, "Listen to audio"],
    ["photo", record.photoUrl || record.imageUrl, record.photoCaption || "Project photograph"]
  ];
  candidates.filter(([, url]) => typeof url === "string" && url.trim()).forEach(([type, url, label]) => {
    if (!items.some((item) => (item.url || item.src || item.path) === url)) items.push({type, url, label});
  });
  const seen = new Set();
  return items.map((item) => ({
    type: String(item.type || item.mediaType || "link").toLowerCase(),
    url: safeUrl(item.url || item.src || item.path),
    label: item.label || item.caption || "",
    alt: item.alt || item.caption || record.topic || "Project documentation image"
  })).filter((item) => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

function mediaLabel(item) {
  if (item.label) return item.label;
  if (item.type === "video") return "Watch recording ↗";
  if (item.type === "audio") return "Audio recording";
  if (["photo", "image", "photograph"].includes(item.type)) return "Project photograph";
  return "Open media ↗";
}

function renderMedia(record) {
  const items = getMediaItems(record);
  if (!items.length) return '<span class="pending-link">Media link or file to be added</span>';
  return `<div class="record-media">${items.map((item) => {
    if (["photo", "image", "photograph"].includes(item.type)) {
      return `<figure class="record-photo"><a href="${esc(item.url)}" target="_blank" rel="noopener"><img class="record-photo-image" src="${esc(item.url)}" alt="${esc(item.alt)}" loading="lazy"></a>${item.label ? `<figcaption>${esc(item.label)}</figcaption>` : ""}</figure>`;
    }
    if (item.type === "audio") {
      return `<div class="audio-item"><span>${esc(mediaLabel(item))}</span><audio controls preload="none"><source src="${esc(item.url)}">Your browser does not support audio playback.</audio></div>`;
    }
    return `<a class="media-link" href="${esc(item.url)}" target="_blank" rel="noopener">${esc(mediaLabel(item))}</a>`;
  }).join("")}</div>`;
}

function initMap() {
  const host = $("#sikkim-map");
  if (!window.L) {
    host.innerHTML = '<div class="map-fallback">The map library could not load. Check your internet connection and refresh this page.</div>';
    return false;
  }
  storyMap = L.map(host, {scrollWheelZoom: false, zoomControl: true, preferCanvas: true}).setView([27.45, 88.45], 8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(storyMap);
  storyMap.setMaxBounds(L.latLngBounds([[SIKKIM.south, SIKKIM.west], [SIKKIM.north, SIKKIM.east]]).pad(0.45));
  window.setTimeout(() => storyMap.invalidateSize(), 100);
  return true;
}

function updateMapStory(record) {
  $("#map-story-title").textContent = record.narrator || "Interview record";
  const media = getMediaItems(record);
  const mediaHtml = media.map((item) => {
    if (["photo", "image", "photograph"].includes(item.type)) return `<a href="${esc(item.url)}" target="_blank" rel="noopener">View photograph ↗</a>`;
    if (item.type === "audio") return `<a href="${esc(item.url)}" target="_blank" rel="noopener">Open audio recording ↗</a>`;
    return `<a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(mediaLabel(item))}</a>`;
  }).join("<br>");
  const precision = record.coordinatePrecision === "approximate" ? "Approximate area marker" : "Mapped interview location";
  $("#map-story").innerHTML = `
    <span class="story-label">Narrative topic</span><span class="story-value">${esc(record.topic || "Topic to be added")}</span>
    <span class="story-label">Interview by</span><span class="story-value">${esc(record.interviewBy || "Not supplied")}</span>
    <span class="story-label">Location · ${esc(precision)}</span><span class="story-value">${esc(record.location || "Sikkim")}</span>
    ${record.locationNote ? `<p class="map-precision-note">${esc(record.locationNote)}</p>` : ""}
    ${mediaHtml ? `<div class="story-media">${mediaHtml}</div>` : ""}`;
}

function addMapMarkers(records) {
  if (!storyMap) return {mapped: 0, locations: 0};
  markerById.clear();
  const locations = new Map();
  let mappedCount = 0;
  records.forEach((record, index) => {
    const coords = recordCoordinates(record);
    if (!coords) return;
    mappedCount += 1;
    const key = `${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`;
    if (!locations.has(key)) locations.set(key, []);
    locations.get(key).push({record, id: stableRecordId(record, index), coords});
  });

  const locationMarkers = [];
  locations.forEach((entries) => {
    const first = entries[0];
    const place = first.record.mapLabel || first.record.location || "Sikkim";
    const markerIcon = L.divIcon({
      className: "map-count-icon",
      html: `<span aria-hidden="true">${entries.length > 1 ? entries.length : "•"}</span>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    const marker = L.marker([first.coords.latitude, first.coords.longitude], {
      title: entries.length === 1 ? `${first.record.narrator || "Interview"}: ${first.record.topic || ""}` : `${entries.length} records near ${place}`,
      alt: `${entries.length} mapped project record${entries.length === 1 ? "" : "s"} near ${place}`,
      icon: markerIcon
    }).addTo(storyMap);

    const tooltip = entries.map(({record}) => `<div class="map-tooltip-record"><strong>${esc(record.narrator || "Interview record")}</strong><span>${esc(record.topic || "Topic to be added")}</span></div>`).join("");
    const popup = `<div class="map-popup-title">${entries.length} ${entries.length === 1 ? "record" : "records"} · ${esc(place)}</div><div class="map-location-records">${entries.map(({record, id}) => `<button type="button" class="map-record-select" data-record="${esc(id)}"><strong>${esc(record.narrator || "Interview record")}</strong><span>${esc(record.topic || "Topic to be added")}</span></button>`).join("")}</div>`;
    marker.bindTooltip(tooltip, {direction: "top", offset: [0, -12], opacity: 1, className: "story-tooltip"});
    marker.bindPopup(popup, {maxWidth: 360, minWidth: 240});
    marker.on("click", () => {
      if (entries.length === 1) updateMapStory(first.record);
    });
    marker.on("popupopen", (event) => {
      event.popup.getElement().querySelectorAll(".map-record-select").forEach((button) => {
        button.addEventListener("click", () => {
          const selected = entries.find((entry) => entry.id === button.dataset.record);
          if (selected) updateMapStory(selected.record);
        });
      });
    });
    entries.forEach(({id}) => markerById.set(id, marker));
    locationMarkers.push(marker);
  });

  if (locationMarkers.length > 1) storyMap.fitBounds(L.featureGroup(locationMarkers).getBounds().pad(0.3), {maxZoom: 10});
  else if (locationMarkers.length === 1) storyMap.setView(locationMarkers[0].getLatLng(), 9);
  return {mapped: mappedCount, locations: locationMarkers.length};
}

function renderInterviews(records) {
  const host = $("#archive-list");
  if (!records.length) {
    host.innerHTML = '<div class="empty-state"><h3>No interview records match this search</h3><p>Clear the search or add a published record to <code>data/interviews.json</code>.</p></div>';
    return;
  }
  host.innerHTML = records.map((record) => {
    const recordId = stableRecordId(record, interviews.indexOf(record));
    const themes = (record.themes || []).slice(0, 3).join(" · ");
    const type = record.narrativeType || record.mediaType || "Interview";
    const coords = recordCoordinates(record);
    const locationAction = coords
      ? `<button type="button" class="map-jump" data-record="${esc(recordId)}">View on map ⌖</button>`
      : `<span class="map-missing">Map coordinates not set</span>`;
    return `<article class="interview-card" id="record-${esc(recordId)}">
      <div class="card-topline"><span>${esc(record.mediaType || "Interview")}</span><span class="type-pill">${esc(type)}</span></div>
      <h3>${esc(record.narrator || "Narrator to be added")}</h3>
      <p class="topic">${esc(record.topic || "Narrative topic to be added")}</p>
      ${renderMedia(record)}
      <div class="record-meta">
        <div><small>Interview by</small><strong>${esc(record.interviewBy || "To be added")}</strong></div>
        <div><small>Location</small><strong>${esc(record.location || "Sikkim")}${record.coordinatePrecision === "approximate" ? " · approximate" : ""}</strong></div>
        <div><small>Themes</small><strong>${esc(themes || "To be catalogued")}</strong></div>
        <div><small>Context</small><strong>${esc(record.contextNote || "Project record")}</strong></div>
      </div>
      <div class="record-actions">${locationAction}</div>
    </article>`;
  }).join("");
  host.querySelectorAll(".record-photo-image").forEach((image) => image.addEventListener("error", () => {
    image.closest("figure").classList.add("media-load-error");
    image.remove();
  }, {once: true}));
  host.querySelectorAll(".map-jump").forEach((button) => button.addEventListener("click", () => {
    const record = interviews.find((item, index) => stableRecordId(item, index) === button.dataset.record);
    const marker = markerById.get(button.dataset.record);
    if (!record || !marker || !storyMap) return;
    updateMapStory(record);
    storyMap.setView(marker.getLatLng(), Math.max(storyMap.getZoom(), 10), {animate: true});
    marker.openPopup();
    $("#map").scrollIntoView({behavior: "smooth"});
  }));
}

function initials(name) {
  return String(name || "IKF").trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase();
}

function renderNarrators(narratorData) {
  const infoByName = new Map((Array.isArray(narratorData) ? narratorData : []).map((item) => [String(item.name || "").trim().toLocaleLowerCase(), item]));
  const names = [...new Set(interviews.map((record) => String(record.narrator || "").trim()).filter(Boolean))];
  const host = $("#narrator-list");
  host.innerHTML = names.map((name) => {
    const details = infoByName.get(name.toLocaleLowerCase()) || {};
    const photo = safeUrl(details.photo);
    return `<article class="narrator-card"><div class="narrator-portrait">${photo ? `<img class="narrator-image" src="${esc(photo)}" alt="${esc(details.photoAlt || `Portrait of ${name}`)}" loading="lazy">` : `<span aria-hidden="true">${esc(initials(name))}</span>`}</div><h4>${esc(name)}</h4>${details.note ? `<p>${esc(details.note)}</p>` : ""}</article>`;
  }).join("") || '<p class="muted">Narrator profiles will appear when records are added to the interview catalogue.</p>';
  host.querySelectorAll(".narrator-image").forEach((image) => image.addEventListener("error", () => {
    image.remove();
    image.parentElement.classList.add("portrait-missing");
  }, {once: true}));
}

function renderTeam(team) {
  const pi = team.principalInvestigator || {};
  const piPhoto = safeUrl(pi.photo);
  const photoEl = $("#pi-photo");
  photoEl.alt = pi.photoAlt || `${pi.name || "Principal Investigator"} portrait`;
  if (piPhoto) {
    photoEl.src = piPhoto;
    photoEl.addEventListener("error", () => photoEl.closest(".pi-photo-wrap").classList.add("portrait-missing"), {once: true});
  } else photoEl.closest(".pi-photo-wrap").classList.add("portrait-missing");
  $(".pi-copy h2").textContent = pi.name || "Principal Investigator";
  $(".pi-role").innerHTML = `${esc(pi.department || "")}<br>${esc(pi.institution || "")}`;
  $(".pi-links").innerHTML = [["Personal academic website ↗", safeUrl(pi.profileUrl)], ["GitHub profile ↗", safeUrl(pi.githubUrl)]]
    .filter(([, url]) => url).map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`).join("");
  const host = $("#team-list");
  host.innerHTML = (team.interns || []).map((person) => {
    const photo = safeUrl(person.photo);
    const fallback = `<span class="team-initials" aria-hidden="true">${esc(initials(person.name))}</span>`;
    return `<article class="team-card"><div class="team-photo">${photo ? `<img class="team-image" src="${esc(photo)}" alt="${esc(person.photoAlt || person.name)}" loading="lazy">` : fallback}</div><h4>${esc(person.name || "Project intern")}</h4><p>${esc(person.role || "Project Intern")}</p></article>`;
  }).join("");
  host.querySelectorAll(".team-image").forEach((image) => image.addEventListener("error", () => {
    const name = image.alt.replace(/^Portrait of /i, "");
    image.remove();
    image.parentElement.innerHTML = `<span class="team-initials" aria-hidden="true">${esc(initials(name))}</span>`;
  }, {once: true}));
}

function renderActivities(items) {
  const host = $("#activity-list");
  if (!items.length) {
    host.innerHTML = '<div class="activity-empty">No publications, seminars or outreach activities have been entered yet. Add confirmed items in <code>data/activities.json</code>.</div>';
    return;
  }
  host.innerHTML = items.map((item) => {
    const rawImage = typeof item.image === "string" ? item.image : item.image?.url;
    const imageUrl = safeUrl(rawImage || item.imageUrl || item.photoUrl);
    const imageAlt = item.imageAlt || item.image?.alt || item.title || "Project activity photograph";
    const imageCaption = item.imageCaption || item.image?.caption || "";
    const image = imageUrl ? `<figure class="activity-image"><a href="${esc(imageUrl)}" target="_blank" rel="noopener"><img src="${esc(imageUrl)}" alt="${esc(imageAlt)}" loading="lazy"></a>${imageCaption ? `<figcaption>${esc(imageCaption)}</figcaption>` : ""}</figure>` : "";
    return `<article class="activity-card">${image}<span class="activity-type">${esc(item.type || "Project activity")}${item.date ? ` · ${esc(item.date)}` : ""}</span><h3>${esc(item.title || "Untitled activity")}</h3><p>${esc(item.description || "")}${item.contributors ? ` · ${esc(item.contributors)}` : ""}</p>${safeUrl(item.url) ? `<p><a href="${esc(safeUrl(item.url))}" target="_blank" rel="noopener">View details ↗</a></p>` : ""}</article>`;
  }).join("");
  host.querySelectorAll(".activity-image img").forEach((image) => image.addEventListener("error", () => image.closest(".activity-image").remove(), {once: true}));
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

async function fetchJson(url) {
  const response = await fetch(url, {cache: "no-store"});
  if (!response.ok) throw new Error(`Could not load ${url} (${response.status}).`);
  return response.json();
}

async function loadSiteData() {
  try {
    const [records, narrators, team, activities] = await Promise.all([
      fetchJson(DATA.interviews), fetchJson(DATA.narrators), fetchJson(DATA.team), fetchJson(DATA.activities)
    ]);
    if (!Array.isArray(records)) throw new Error("data/interviews.json must contain a JSON array.");
    interviews = records.filter((item) => String(item.status || "published").toLowerCase() !== "draft");
    renderNarrators(narrators);
    renderTeam(team);
    renderActivities(Array.isArray(activities) ? activities : []);
    const types = [...new Set(interviews.map((record) => record.narrativeType).filter(Boolean))].sort();
    $("#type-filter").innerHTML = '<option value="all">All narrative types</option>' + types.map((type) => `<option value="${esc(type)}">${esc(type)}</option>`).join("");
    if (initMap()) {
      const summary = addMapMarkers(interviews);
      const unmapped = interviews.length - summary.mapped;
      $("#map-summary").textContent = `${summary.mapped} records mapped across ${summary.locations} locations${unmapped ? ` · ${unmapped} need valid Sikkim coordinates` : ""}.`;
      if (!summary.mapped) $("#sikkim-map").insertAdjacentHTML("beforeend", '<div class="map-empty-note">Add decimal latitude and longitude in Sikkim to show a record here.</div>');
    }
    renderInterviews(interviews);
    $("#search-input").addEventListener("input", applyFilters);
    $("#type-filter").addEventListener("change", applyFilters);
  } catch (error) {
    console.error(error);
    $("#archive-list").innerHTML = `<div class="empty-state"><h3>Project records could not be loaded</h3><p>${esc(error.message)} Check the JSON files and refresh. A web server such as GitHub Pages is required for the data files to load.</p></div>`;
    $("#map-summary").textContent = "Map records could not be loaded.";
    $("#sikkim-map").innerHTML = '<div class="map-fallback">Check that all data JSON files are present, valid and uploaded to the repository.</div>';
  }
}

loadSiteData();
