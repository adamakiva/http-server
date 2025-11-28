FROM node:24.10.0-slim AS server

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

WORKDIR /home/node/server

COPY ./scripts/init-server.sh /home/node/init.sh

ENTRYPOINT ["/home/node/init.sh"]
