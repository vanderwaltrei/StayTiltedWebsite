# StayTilted website

Static landing page. Open `index.html` in a browser; no build step.

## Add your photographs

Drop files into `assets/photos/` using these names (`.jpg` or `.webp`). They replace the drawn placeholders automatically:

- `photo-hero` (portrait, 4:5), the polaroid in the first screen
- `photo-01` (5:4), `photo-02` to `photo-05` (4:5), the work gallery
- `photo-level` (square), the "Level it" slider

Captions and alt text live in `index.html` (`data-alt` and `<figcaption>`).

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
