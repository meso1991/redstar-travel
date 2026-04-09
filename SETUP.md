# RedStar Travel Flight Search Setup

## Run locally

1. Open the project folder in a terminal.
2. Start the local server:

```powershell
npm start
```

3. Open:

```text
http://localhost:3000
```

## Current flight search behavior

- The homepage flight form now opens `results.html` inside the site.
- Results are fetched from `GET /api/flights/search`.
- If Wego credentials are not configured, the server returns demo fallback results so the full UI flow still works.

## Configure Wego live search

1. Copy `.env.example` to `.env`.
2. Add your real Wego values:

```env
WEGO_API_TOKEN=your_real_token
WEGO_SITE_CODE=EG
WEGO_LOCALE=en
WEGO_CURRENCY_CODE=USD
PORT=3000
```

## Important notes

- The current live adapter is prepared for Wego's affiliate flight search flow.
- For best accuracy, search with supported city names already mapped in the server or use 3-letter IATA airport codes such as `CAI`, `DXB`, `IST`, `RUH`.
- If you want production-grade search like Wego, the next improvement should be:
  - airport autocomplete
  - richer provider deep links
  - pagination
  - caching
  - result sorting and filters
