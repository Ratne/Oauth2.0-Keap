## Keap oauth 2.0 with expressjs + prisma & mongodb

- rename env.txt to .env
- create a button or an url that point to /keap/auth/infusionsoft
- login to keap
- store the access and refresh token in a db or local cache
- put localhost:3010/keap/auth/infusionsoft/refresh in a cron eery 6 hours
