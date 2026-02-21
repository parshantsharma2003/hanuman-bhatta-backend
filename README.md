# Hanuman Bhatta - Backend API

Backend API server for Hanuman Bhatta brick manufacturing website built with **Node.js**, **Express**, and **TypeScript**.

## 🚀 Features

- ✅ **Express.js** - Fast, unopinionated web framework
- ✅ **TypeScript** - Type-safe development
- ✅ **CORS** - Cross-Origin Resource Sharing enabled
- ✅ **Helmet** - Security headers
- ✅ **Compression** - Response compression
- ✅ **Morgan** - HTTP request logger
- ✅ **Environment Config** - Dotenv for environment variables
- ✅ **Error Handling** - Centralized error handling
- ✅ **Health Check** - API health monitoring endpoints

## 📁 Project Structure

```
the-backend/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment configuration
│   ├── middleware/
│   │   ├── cors.ts             # CORS configuration
│   │   ├── errorHandler.ts    # Error handling middleware
│   │   └── logger.ts           # Morgan logger setup
│   ├── routes/
│   │   ├── health.routes.ts   # Health check routes
│   │   └── index.ts            # Route aggregation
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server startup
├── .env                        # Environment variables (not in git)
├── .env.example                # Example environment file
├── package.json
├── tsconfig.json
└── nodemon.json
```

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Setup

1. **Install dependencies:**

```powershell
cd the-backend
npm install
```

2. **Configure environment variables:**

Copy `.env.example` to `.env` and update values:

```powershell
cp .env.example .env
```

3. **Update `.env` file:**

```env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

## 🏃 Running the Server

### Development Mode (with hot reload)

```powershell
npm run dev
```

### Production Build

```powershell
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Production (Build + Start)

```powershell
npm run prod
```

## 📡 API Endpoints

### Root Endpoint

```
GET /
```

Returns API welcome message and version info.

### API Base

```
GET /api/v1
```

Returns API information and available endpoints.

### Health Check

```
GET /api/v1/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-18T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "api_version": "v1"
}
```

### Ping

```
GET /api/v1/health/ping
```

**Response:**
```json
{
  "success": true,
  "message": "pong"
}
```

## 🔧 Configuration

### Environment Variables

| Variable            | Description                        | Default              |
|--------------------|------------------------------------|----------------------|
| `NODE_ENV`         | Environment mode                   | `development`        |
| `PORT`             | Server port                        | `5000`               |
| `CORS_ORIGIN`      | Allowed CORS origin                | `http://localhost:3000` |
| `API_VERSION`      | API version                        | `v1`                 |
| `WHATSAPP_NUMBER`  | WhatsApp contact number            | -                    |
| `CONTACT_EMAIL`    | Contact email                      | -                    |
| `CONTACT_PHONE`    | Contact phone number               | -                    |
| `BRICKS_PER_TROLLEY` | Bricks per trolley              | `3000`               |
| `WASTAGE_PERCENTAGE` | Wastage percentage              | `5`                  |

### TypeScript Configuration

The project uses strict TypeScript settings with path aliases:

```typescript
import { env } from '@/config/env';
import routes from '@/routes';
```

Available aliases:
- `@/config/*` → `src/config/*`
- `@/controllers/*` → `src/controllers/*`
- `@/routes/*` → `src/routes/*`
- `@/middleware/*` → `src/middleware/*`
- `@/utils/*` → `src/utils/*`
- `@/types/*` → `src/types/*`

## 🛡️ Security Features

- **Helmet** - Sets various HTTP headers for security
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - Ready for implementation
- **Input Validation** - Ready for implementation with express-validator
- **Error Handling** - Prevents sensitive info leakage

## 🧪 Testing

Test the API using:

### cURL

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Ping
curl http://localhost:5000/api/v1/health/ping
```

## 🚢 Deployment (Render)

### Render Web Service Settings

- **Root Directory:** `the-backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`
- **Health Check Path:** `/api/v1/health`

### Required Environment Variables

Set these in Render dashboard:

```
NODE_ENV=production
PORT=10000
API_VERSION=v1
MONGODB_URI=<your-mongodb-connection-string>
CORS_ORIGIN=https://<your-vercel-domain>
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=12h
AUTH_COOKIE_NAME=hb_admin_token
ADMIN_EMAIL=admin@hanumanbhatta.com
ADMIN_PASSWORD=<secure-password>
ADMIN_NAME=Hanuman Bhatta Admin
WHATSAPP_NUMBER=919876543210
CONTACT_EMAIL=info@hanumanbhatta.com
CONTACT_PHONE=+919876543210
BRICKS_PER_TROLLEY=3000
WASTAGE_PERCENTAGE=5
```

> Tip: If you use multiple frontend domains, set `CORS_ORIGIN` as a comma-separated list.

### Postman

Import the following endpoints:
- `GET http://localhost:5000/api/v1/health`
- `GET http://localhost:5000/api/v1/health/ping`

## 📝 Scripts

| Script          | Description                              |
|----------------|------------------------------------------|
| `npm run dev`  | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript          |
| `npm start`    | Start production server                  |
| `npm run prod` | Build and start production server        |
| `npm run lint` | Run ESLint                               |
| `npm run format` | Format code with Prettier              |

## 🔮 Future Enhancements

- [ ] Add database integration (MongoDB/PostgreSQL)
- [ ] Implement authentication (JWT)
- [ ] Add rate limiting
- [ ] Implement contact form endpoint
- [ ] Add brick calculator API endpoint
- [ ] Implement product catalog endpoints
- [ ] Add email service integration
- [ ] Implement request validation
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add API documentation (Swagger)

## 📄 License

ISC

## 👤 Author

Hanuman Bhatta

---

**Built with ❤️ using Node.js, Express, and TypeScript**
