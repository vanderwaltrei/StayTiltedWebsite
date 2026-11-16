# Stay Tilted

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

## Themed set and studio

The "Now on set" card in the Studio section is filled from `assets/theme.json`. Update `name`, `blurb`, optional `until` (e.g. "On set until 31 December") and `image` (a path from the site root) whenever the set changes. Leave `name` empty to hide the card. Keep studio photos outside `assets/photos/` unless they also exist in the photo library, because the sync replaces that folder.

## Enquiry database (Supabase)

Enquiries from the contact form can be stored in a Supabase Postgres table. Until this is set up, the form keeps its original email/WhatsApp behaviour.

1. Create a free project at supabase.com.
2. In **SQL Editor**, run `supabase/schema.sql`. The public site can only insert rows; only you can read them.
3. In **Project Settings → API**, copy the Project URL and the `anon` public key into `data-supabase-url` and `data-supabase-key` on the `<form id="enquiry">` in `index.html`. The anon key is safe to publish because row-level security limits it to inserts. Never put the `service_role` key in the site.
4. View enquiries under **Table Editor → enquiries**; change `status` as you work through them.

If the database can't be reached, the form falls back to the email draft. WhatsApp enquiries are also logged (`via = whatsapp`) once the form is valid.

## SEO and AI search

- `robots.txt`, `sitemap.xml` and `llms.txt` are in the site root. Update `lastmod` in `sitemap.xml` when pages change materially, and keep prices in `llms.txt` and the JSON-LD in `index.html` in sync with the packages section.
- `index.html` carries structured data (business, price catalogue, FAQ); `gallery.html` carries a breadcrumb and collection page.
- Social previews currently use the logo. Add a 1200x630 image (a favourite photo with the logo) and point `og:image` / `twitter:image` at it.
- Once the social accounts exist, replace `YOUR_HANDLE` in the links and add them as `sameAs` in the business JSON-LD. Add Google Business Profile and submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Before launch

- `hello@staytilted.com` is a placeholder; replace it in `index.html` (the footer link, the contact section, and the form's `data-email`). The WhatsApp number (+27 83 265 1670) is set in several links in `index.html` and as `data-whatsapp` on the form.
- Review the sample service descriptions and FAQ answers.
- Fonts (Bricolage Grotesque, DM Sans) load from Google Fonts. Self-host them if preferred.
- The enquiry form validates details and opens a prefilled email draft or WhatsApp message. If Supabase is configured, it also stores validated enquiries; otherwise, it uses the original email/WhatsApp-only flow.
