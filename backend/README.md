# Neighbourly Backend

Serverless backend on AWS.

## Run locally

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000/dev/` - note the `/dev` prefix.

## Deploy

```bash
npm run deploy:dev
```

Need to set env vars first:
- `COGNITO_USER_POOL_ID`
- `COGNITO_USER_POOL_CLIENT_ID`
- `REGION` (defaults to us-east-1)

See `docs/` for API docs and stuff.

