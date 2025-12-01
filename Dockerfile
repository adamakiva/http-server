ARG NODE_IMAGE_REPO="node"
ARG NODE_IMAGE_TAG="24.10.0-slim"
ARG NODE_BASE_DIRECTORY="/home/node/server"

ARG NGINX_IMAGE_REPO="nginxinc/nginx-unprivileged"
ARG NGINX_IMAGE_TAG="1.29.2-alpine-slim"

########################################################################################################

FROM "$NODE_IMAGE_REPO":"$NODE_IMAGE_TAG" AS development

ARG NODE_BASE_DIRECTORY

WORKDIR ${NODE_BASE_DIRECTORY}

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY ./scripts/init-server.sh /home/node/init.sh

ENTRYPOINT ["/home/node/init.sh"]

########################################################################################################

FROM "$NODE_IMAGE_REPO":"$NODE_IMAGE_TAG" AS build

ARG NODE_BASE_DIRECTORY

WORKDIR ${NODE_BASE_DIRECTORY}

COPY eslint.config.js package*.json tsconfig*.json .
COPY src src/

RUN npm clean-install \
    && npm run lint \
    && npm run build \
    && rm -rf dist/tsconfig.prod.tsbuildinfo \
    && npm clean-install --omit=dev

FROM "$NODE_IMAGE_REPO":"$NODE_IMAGE_TAG" AS production

ARG NODE_BASE_DIRECTORY

WORKDIR ${NODE_BASE_DIRECTORY}

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=build ${NODE_BASE_DIRECTORY}/package*.json .
COPY --from=build ${NODE_BASE_DIRECTORY}/dist dist/
COPY --from=build ${NODE_BASE_DIRECTORY}/node_modules node_modules/

CMD ["node", "dist/main.js"]

########################################################################################################

FROM "${NGINX_IMAGE_REPO}":"${NGINX_IMAGE_TAG}" AS nginx
USER nginx

COPY --chown=nginx nginx /etc/nginx/

CMD ["nginx", "-g", "daemon off;"]
