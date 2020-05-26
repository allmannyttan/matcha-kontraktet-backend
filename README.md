# backend

## Development

```
nvm use
npm i
docker-compose up -d
npm run migrate:up
npm run seed:dev
npm run dev
```

Go to http://localhost:9000/

## Migrations and seeds

- Create new migration: `npx knex migrate:make <migration_name>`
- Create new seed for dev: `npx knex seed:make $(date +%s)_<name> --env dev`
