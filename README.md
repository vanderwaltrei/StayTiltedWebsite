# StayTilted website

Static landing page. Open `index.html` in a browser; no build step.

## Add your photographs

The photographer uploads images to a category folder in the private [`StayTiltedPhotoLibrary`](https://github.com/vanderwaltrei/StayTiltedPhotoLibrary) repository. A scheduled GitHub Action copies them to this site and publishes them to GitHub Pages, usually within 15 minutes. Photos displayed on this public website are public.

Use browser-friendly image files: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`, or `.bmp`. HEIC and TIFF photos need to be converted to one of these formats before upload.

- Replace existing featured photos by keeping the same names: `photo-hero` (portrait), `photo-01` to `photo-05` (work gallery), and `photo-level` (square slider).
- Add gallery photos inside a category folder, such as `photos/cosplay/zero-two.jpg`. The filename becomes the caption; the folder selects the category. Filters for Cosplay, Anime & Manga, Comic Con Africa, Halloween, Music Events, Portraits, and Other are available in the gallery. Empty categories show a short message until photos are uploaded.
- To create a new category, add a lowercase, hyphenated folder under `photos/` (for example `convention-meetups/`). The folder name becomes a new gallery filter when it has a photo.

The photo library mirrors `assets/photos/`, so its contents replace the published photo folder on each sync. To let the photographer upload, invite their GitHub account to the private photo repository; they do not need access to this website repository.

### One-time publishing setup

In this repository's **Settings → Secrets and variables → Actions**, add:

- `PHOTO_REPO_READ_TOKEN`: a fine-grained token with **Contents: read-only** access to `StayTiltedPhotoLibrary`.
- `SITE_PUBLISH_TOKEN`: a fine-grained token with **Contents: read and write** access to `StayTiltedWebsite`.

The photo repository contains no publishing credentials. Once these two secrets are set, uploads sync automatically; the workflow can also be run manually from the website repository's **Actions** tab.

## Logo

The footer uses `../Footage/Stay Tilted Logo white.png`. Before deploying, copy the logo PNGs into `assets/` and update the path in `index.html`, so the site folder is self-contained.

## Before launch

- Email: `hello@staytilted.com` is a placeholder. Search `index.html` for it (3 places).
- Copy: headlines, service descriptions and FAQ answers are sample text. Edit to match how you really work.
- Add `<link rel="canonical">` and `og:url` / `og:image` once the domain is known.
- Fonts (Jost, Nunito) load from Google Fonts. Self-host them if you prefer.

## Palette

| Colour | Hex | Use |
| --- | --- | --- |
| Deep forest | `#00251e` | Main dark ground |
| Forest | `#00463e` | Secondary surfaces |
| Teal | `#015a60` | Contact section, nav button |
| Off-white | `#f9f9f9` | Light section, text on dark |
| Heart red | `#c03d35` | Accent: main button, heart |
| Near-black | `#070605` | Work gallery, footer |
