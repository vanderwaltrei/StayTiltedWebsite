# StayTilted Studio

A responsive single-page photography portfolio. Serve the static files locally or publish them with GitHub Pages; there is no build step. The gallery manifest is fetched at runtime, so use a local web server rather than opening `index.html` as a `file://` URL.

## Photography

All portfolio photographs come from the private photo library and are copied into `assets/photos/` for the public site to serve. The gallery, hero collage, and comparison images all load from the generated `assets/photos/gallery.json` manifest; the page contains no hard-coded photo filenames.

The photographer can also upload images to a category folder in the private [`StayTiltedPhotoLibrary`](https://github.com/vanderwaltrei/StayTiltedPhotoLibrary) repository. A scheduled GitHub Action copies them to this site and publishes them to GitHub Pages. Photos displayed on this public website are public.

Use browser-friendly image files: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`, or `.bmp`. HEIC and TIFF photos need to be converted before upload.

- Add gallery photos inside a category folder, such as `photos/cosplay/zero-two.jpg`. Use a descriptive filename for new-photo captions; the folder selects the category. Existing photos have polished captions configured in the publishing workflow.
- Existing filters are Cosplay, Portraits, Events, and Brands. A category in `gallery.json` that does not already have a filter is added automatically.
- The photo library mirrors `assets/photos/`, so its contents replace the published photo folder on each sync. To let the photographer upload, invite their GitHub account to the private photo repository; they do not need access to this website repository.

### One-time publishing setup

In this repository's **Settings → Secrets and variables → Actions**, add:

- `PHOTO_REPO_READ_TOKEN`: a fine-grained token with **Contents: read-only** access to `StayTiltedPhotoLibrary`.
- `SITE_PUBLISH_TOKEN`: a fine-grained token with **Contents: read and write** access to `StayTiltedWebsite`.

The photo repository contains no publishing credentials. Once these two secrets are set, uploads sync automatically; the workflow can also be run manually from the website repository's **Actions** tab.

## Before launch

- `hello@staytilted.com` is a placeholder; replace it in `index.html`.
- Review the sample service descriptions and FAQ answers.
- Add `<link rel="canonical">` and `og:url` / `og:image` once the domain is known.
- Fonts (Fraunces, DM Sans) load from Google Fonts. Self-host them if preferred.
- The enquiry form validates details and opens a prefilled email draft; it does not send data to a server. Configure a form service if direct submission is needed.
