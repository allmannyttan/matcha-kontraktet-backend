## What is matcha-kontraktet-backend?

matcha-kontraktet-backend is an API that uses Slussen to get data about leases to detect if any lease is an illegal sublet by matching the contract data with Swedish folkbokföring through Syna or Creditsafe.

# Development

## Dependencies

- Node.js installed preferably using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- [Docker installed](https://docs.docker.com/get-docker/)
- [Docker Compose installed](https://docs.docker.com/compose/install/)
- [access to GitHub Packages](https://docs.github.com/en/packages/learn-github-packages/about-github-packages#authenticating-to-github-packages)

## Developing

- Matcha kontraktet uses PostgresQL that we run in docker
- Matcha kontraktet uses Slussen that we run in Docker.
- You need some configuration files as described in the [Config section](#-Config)
- Create a personal token for GitHub Packages as described above and run `docker login https://docker.pkg.github.com`

## Getting started

```bash
nvm use
npm i
docker-compose up -d
npm run migrate:up
npm run seed:dev
npm run dev
```

Go to http://localhost:9000/

## Config

Local config.json is needed for Syna credentials. Credentials are found in LastPass.

```
{
  "syna": {
    "username": "",
    "customerNumber": ""
  }
}
```

## Migrations and seeds

- Create new migration: `npx knex migrate:make <migration_name>`
- Create new seed for dev: `npx knex seed:make $(date +%s)_<name> --env dev`
- Reset (recreate and seed) dev db: `npm run reset:dev`
