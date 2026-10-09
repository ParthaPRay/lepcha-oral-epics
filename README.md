# Lepcha Oral Epics Sikkim — project website

A responsive, no-build GitHub Pages website for **“Documenting Lepcha Oral Epics and Environmental Narratives of Sikkim through Digital Recording and Knowledge Mapping.”** It includes the project overview, objectives, a growing media catalogue, a coordinate-based Sikkim map, narrator portraits, the intern team, and a section for future books, papers, seminars and outreach.

## Publish on GitHub Pages

1. Download and unzip this package.
2. Upload the **contents** of `Lepcha_Oral_Epics_Sikkim` to the root of your GitHub repository. Keep the `assets`, `data` and `docs` folders in place.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose the branch (usually `main`) and folder `/ (root)`, then save.
5. Wait for the deployment to finish. For a repository named `lepcha-oral-epics-sikkim`, the site URL is [Lepcha Oral Epics Sikkim](https://parthapray.github.io/lepcha-oral-epics-sikkim/).

The site has no build step. When you later change a JSON file or add an image/audio file, commit the change; GitHub Pages republishes the site. After deployment, refresh the page. If an older version remains visible, use a hard refresh (Ctrl+F5 on Windows/Linux, Cmd+Shift+R on Mac).

## Add an interview or recording

Edit `data/interviews.json`. Add one object inside the outer `[` and `]`, with a comma between adjacent objects. Give each entry a new unique `id`. Keep names and Lepcha titles in the spelling approved for publication.

The record appears in the catalogue automatically. It appears on the map when:

- Its `status` is omitted or set to `published` (records marked `draft` stay hidden).
- `latitude` and `longitude` are numeric decimal-degree coordinates within Sikkim. Blank, missing, text, or out-of-area coordinates are not plotted.

Records at the same generalized coordinates share one numbered map marker. Hover to preview narrator and topic; click the marker and select a record to show the full details. The map summary reports how many records were mapped and how many still need valid coordinates. Use only appropriate, narrator-approved public locations; do not publish a home or sensitive site.

### Record fields

| Field | Use |
| --- | --- |
| `id` | Unique ID, e.g. `lepcha-013` |
| `narrator` | Narrator's preferred public name |
| `topic` | Narrative title/topic |
| `narrativeType` | e.g. `Oral epic`, `Environmental narrative`, `Oral folklore` |
| `themes` | Array of short themes/keywords |
| `interviewBy` | Intern/interviewer name |
| `location` | Public place name |
| `mapLabel` | Short marker label; say if generalized |
| `latitude`, `longitude` | Numeric WGS 84 decimal degrees, e.g. `27.307778`, `88.291111` |
| `coordinatePrecision` | `approximate` for a generalized point, `exact` only when suitable and approved |
| `locationNote` | Public location context/caution |
| `mediaType` | Human-readable description, such as `Video interview` or `Audio interview` |
| `media` | Optional array of video links, local audio, and photographs; see examples below |
| `videoUrl` | Optional direct YouTube video or playlist URL (legacy field supported) |
| `audioUrl` | Optional local audio path (legacy field supported) |
| `photoUrl` / `imageUrl` | Optional local image path (legacy field supported) |
| `contextNote` | Brief approved context for the record |
| `status` | `published` or `draft`; defaults to published if omitted |

### YouTube video

Use the direct video link when one exists. Keep the playlist link for the site-wide playlist button, not as a substitute for an individual video link.

```json
{
  "id": "lepcha-013",
  "narrator": "Narrator name",
  "topic": "Narrative title",
  "narrativeType": "Oral epic",
  "themes": ["oral narrative"],
  "interviewBy": "Intern name",
  "location": "Public place name, Sikkim",
  "mapLabel": "Generalized village-area point",
  "latitude": 27.307778,
  "longitude": 88.291111,
  "coordinatePrecision": "approximate",
  "locationNote": "Generalized public map point; not an exact interview site.",
  "mediaType": "Video interview",
  "media": [
    {"type": "video", "url": "https://www.youtube.com/watch?v=VIDEO_ID", "label": "Watch interview ↗"}
  ],
  "contextNote": "Short narrator-approved note.",
  "status": "published"
}
```

### Add audio or photographs to a catalogue record

Upload files using **Add file → Upload files**. Keep audio in `assets/media/` and record photographs in `assets/media/` (or create another folder under `assets/`). Use paths relative to the repository root, without a leading slash. Add media entries to the same record; the page will show a player for audio and an image for photographs.

```json
"media": [
  {"type": "video", "url": "https://www.youtube.com/watch?v=VIDEO_ID", "label": "Watch interview ↗"},
  {"type": "audio", "url": "assets/media/lepcha-story.mp3", "label": "Audio interview"},
  {"type": "photo", "url": "assets/media/field-session.jpg", "alt": "Narrator sharing a story", "caption": "Field documentation photograph"}
]
```

Audio and images are served from GitHub Pages. Keep file sizes reasonable and confirm you have permission to publish recordings and photographs.

## Add narrator portraits

The **People behind the documentation → Narrators** section automatically lists each distinct narrator named in `data/interviews.json`. To show a portrait:

1. Confirm the narrator approves public display of the portrait.
2. Upload the image to `assets/narrators/`, for example `assets/narrators/sonam-tshering-lepcha.jpg`.
3. Add or update that narrator in `data/narrators.json`:

```json
{
  "name": "Sonam Tshering Lepcha (Sungdyangmu)",
  "photo": "assets/narrators/sonam-tshering-lepcha.jpg",
  "photoAlt": "Portrait of Sonam Tshering Lepcha (Sungdyangmu)",
  "note": "Optional short approved description."
}
```

Without a portrait, the narrator still appears with an initials placeholder. A new narrator's gallery card is created from `interviews.json`; add their photo details to `narrators.json` when ready.

## Add intern portraits

Upload approved JPG, PNG or WebP photos to `assets/team/` and update the matching intern's `photo` value in `data/team.json`, e.g. `assets/team/pundimit-lepcha.jpg`. The site uses initials until a photo path is supplied. The PI profile is also configured in `data/team.json`.

## Add books, papers, seminars or outreach

Add confirmed items to `data/activities.json`. Activity images are optional and appear in the activity card when an image path or image URL is supplied. Upload local images to `assets/activities/`.

```json
{
  "type": "Seminar",
  "title": "Seminar title",
  "date": "2026-11-15",
  "description": "Short description.",
  "contributors": "Names or project team",
  "url": "https://example.org/event",
  "image": "assets/activities/seminar.jpg",
  "imageAlt": "Participants at the seminar",
  "imageCaption": "Project seminar, Gangtok"
}
```

## Check JSON before committing

A missing comma or unmatched quote can stop the catalogue from loading. From a local copy of the site, run:

```bash
python -m json.tool data/interviews.json
python -m json.tool data/narrators.json
python -m json.tool data/team.json
python -m json.tool data/activities.json
python -m http.server 8000
```

Then open `http://localhost:8000`. A local web server is required because the page loads JSON with `fetch()`; opening `index.html` directly as a file will not work correctly.

## Project information

- **Funding agency:** Indian Knowledge Systems Division, Ministry of Education, Government of India
- **Principal Investigator:** Partha Pratim Ray, Department of Computer Applications, Sikkim University
- **Playlist:** [Lepcha Oral Epics of Sikkim](https://www.youtube.com/playlist?list=PLOD4VwvSJlnM)

## Attribution

Map tiles © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), displayed with [Leaflet](https://leafletjs.com/) (BSD 2-Clause License).
