# AutoGrid

Real listings. Every dealer. A full-stack car search powered by the
[MarketCheck API](https://www.marketcheck.com/apis/).

- **Backend:** Node + Express proxy on port `4000` (keeps your API key off the
  client).
- **Frontend:** React 18 + Vite + Tailwind on port `5173`.

## Setup

1. Get a free MarketCheck key at https://www.marketcheck.com/apis/
2. Copy `.env.example` → `.env` and paste in your key:
   ```
   MARKETCHECK_API_KEY=your_api_key_here
   ```
3. Install dependencies:
   ```
   npm run install:all
   ```
4. Run server + client together:
   ```
   npm run dev
   ```
   - API: http://localhost:4000
   - App: http://localhost:5173

## Endpoints (proxied)

| Route                       | Upstream                                         |
| --------------------------- | ------------------------------------------------ |
| `GET /api/listings`         | `/v2/search/car/active`                          |
| `GET /api/listings/:id`     | `/v2/listing/:id`                                |
| `GET /api/filters/options`  | `/v2/search/car/active?facets=...&rows=0`        |
| `GET /api/models?make=X`    | facets endpoint, filtered by make                |
