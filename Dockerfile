
FROM node:14.15.1-alpine

# Fixes for Python missing for node-gyp
# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# --virtual: bundle packages, remove whole bundle at once, when done
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++

COPY package.json /app/
COPY package-lock.json /app/
COPY @types /app/@types
COPY tsconfig.json /app/
COPY knexfile.js /app/
COPY src /app/src
COPY migrations /app/migrations

WORKDIR /app
VOLUME /app/data

RUN npm install
RUN npm run test:ci
RUN apk del build-dependencies

COPY seeds /app/seeds

CMD /bin/sh -c "npm run ci"
