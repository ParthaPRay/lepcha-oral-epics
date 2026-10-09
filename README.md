# Lepcha Oral Epics of Sikkim — Project Website

Repository-ready, no-build static website for the project **“Documenting Lepcha Oral Epics and Environmental Narratives of Sikkim through Digital Recording and Knowledge Mapping.”**

The site presents the project, its objectives, the PI and intern team, an interview catalogue, an interactive Sikkim map, and a section for later publications, seminars and outreach. Site content is stored in JSON files so new material can be added without changing the layout or JavaScript.

## Publish with GitHub Pages

The project URL will be:

   [Lepcha Oral Epics](https://parthapray.github.io/lepcha-oral-epics/)


Open the URL and test the navigation, interview cards, video links and map. GitHub Pages may take a few minutes to publish the first version.

If you choose a different repository name, replace the last part of the URL with that exact name. This project does not require a build command, Node installation or GitHub Actions workflow.

## Add an interview / video

Edit `data/interviews.json`. Add one JSON object inside the outer square brackets for each recording. Keep commas between records and use double quotes around text. The fields used by the site are:

| Field | What to enter |
| --- | --- |
| `id` | Unique short ID, for example `lepcha-002` |
| `narrator` | Narrator's preferred name and spelling |
| `topic` | Narrative or interview topic, retaining Lepcha spelling/transliteration supplied by the project |
| `narrativeType` | For example `Oral epic`, `Environmental narrative`, or `Interview` |
| `themes` | Short list of themes or keywords |
| `interviewBy` | Intern/interviewer name |
| `location` | Narrator-approved public place name |
| `mapLabel` | Short map label; clarify if marker is approximate |
| `latitude`, `longitude` | Decimal degrees, WGS 84 (`27.3074`, `88.2825`) |
| `coordinatePrecision` | Use `approximate` for a generalised place marker, or `exact` only for a consented, appropriate public point |
| `locationNote` | Context, generalisation or any caution about the point |
| `mediaType` | `Video interview` or `Audio interview` |
| `videoUrl` | Direct YouTube URL for the individual recording, when available |
| `videoLinkNote` | Optional note, such as `Individual video link to be added` |
| `contextNote` | Brief contextual information approved for public display |
| `status` | Set to `published` to display; set to `draft` to keep a record off the page |

The initial catalogue entry is a starter based on information supplied for the project. It points to the project playlist because an individual video URL was not available when this repository was prepared. Replace the playlist link with the direct video link when you have it. Its marker is an approximate Tashiding-area reference, not a precise interview site. Confirm or replace the marker before presenting it as an exact location.

Example of the shape for a new record (replace the sample values):

```json
{
  "id": "lepcha-002",
  "narrator": "Narrator's preferred name",
  "topic": "Narrative or episode title",
  "narrativeType": "Oral epic",
  "themes": ["theme one", "theme two"],
  "interviewBy": "Intern name",
  "location": "Public place name, Sikkim",
  "mapLabel": "Generalised location",
  "latitude": 27.0000,
  "longitude": 88.0000,
  "coordinatePrecision": "approximate",
  "locationNote": "Generalised area point; exact site not shown.",
  "mediaType": "Video interview",
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "videoLinkNote": "",
  "contextNote": "Short narrator-approved note.",
  "status": "published"
}
```

### Map behaviour

- Hover over a location marker to see the narrator and topic.
- Click a marker to open its map popup and load the full record in the “Selected story” panel.
- Use **View on map** on an interview card to jump to its marker.
- To omit a location from the map, remove `latitude` and `longitude` from that record. The catalogue entry will still display.
- Coordinates must be latitude/longitude in decimal degrees. The Leaflet map uses OpenStreetMap tiles and shows a Sikkim-centred view.

## Add intern or PI photos

The PI portrait currently links to the image already published on Partha Pratim Ray's personal website. Intern portrait files were not included with the website brief, so their cards use initials until the correct images are supplied.

1. Obtain each person's approval to publish their portrait on the project website.
2. Add a reasonably sized JPG or WebP file to `assets/team/`, for example `pundimit-lepcha.jpg`.
3. In `data/team.json`, set that person's `photo` value to `assets/team/pundimit-lepcha.jpg`.
4. Check `photoAlt` contains their name, then commit the change. The initials will be replaced by the photo automatically.

Do not use generated look-alike portraits or another narrator's photograph as an intern's image.

## Add a book, paper, seminar or outreach activity

Edit `data/activities.json` and add one object for each confirmed output or activity:

```json
{
  "type": "Seminar",
  "title": "Seminar title",
  "date": "2026-11-15",
  "description": "One or two sentences describing the activity.",
  "contributors": "Names or project team",
  "url": "https://example.org/event"
}
```

`type` can be `Book`, `Paper`, `Seminar`, `Outreach`, `Exhibition`, `Workshop`, or another clear label. Omit `url` if there is no public page. Add only confirmed items.

## Update the site after publishing

For a simple update in GitHub's website:

1. Open the relevant file in the repository, such as `data/interviews.json`.
2. Choose the pencil icon, make the change, and select **Commit changes**.
3. GitHub Pages rebuilds the site automatically. Refresh the site after the deployment completes.

For a photo, use **Add file → Upload files** to add the image first, then update `data/team.json` with its path.

If you prefer a local preview before committing, run a small web server from this folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. A local server is needed because the page loads its JSON records with `fetch()`.

## Project details

- **Funding agency:** Indian Knowledge Systems Division, Ministry of Education, Government of India
- **Principal Investigator:** Partha Pratim Ray, Department of Computer Applications, Sikkim University
- **YouTube channel:** [Indian Knowledge Forum](https://www.youtube.com/@IndianKnowledgeForum)
- **Playlist:** [Lepcha Oral Epics of Sikkim](https://www.youtube.com/playlist?list=PLOD4VwvSJlnM)

## Map and web attributions

- Map tiles © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), used through the OpenStreetMap standard tile service and Leaflet.
- Leaflet is distributed under the BSD 2-Clause License: [leafletjs.com](https://leafletjs.com/).
- The first generalised Tashiding-area coordinate is a display anchor only, not a verified recording coordinate. Review it with the project team and use narrator-approved locations before treating it as precise.

## Repository contents

```text
index.html                 Main site
assets/css/site.css        Layout and design
assets/js/app.js           Catalogue, map and filtering behaviour
assets/team/               Add approved team portraits here
data/interviews.json       Narrators, interview metadata, links and coordinates
data/team.json             PI and intern details and image paths
data/activities.json       Books, papers, seminars and outreach
docs/project-record.md    Funder-facing project record and objectives
```
