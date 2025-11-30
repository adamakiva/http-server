#!/bin/sh

UID=$(id -u);
GID=$(id -g);

ROOT_DIR=$(realpath "$(dirname "$0")/..");

UV_THREADPOOL_SIZE=$(($(nproc --all) - 1));

########################################################################################################

check_prerequisites() {
    if ! command -v docker >/dev/null 2>&1; then
        printf "\nDocker engine not installed, you may follow this: https://docs.docker.com/engine/install \n\n";
        exit 1;
    fi
    if ! command -v docker compose >/dev/null 2>&1; then
        printf "\nDocker compose not installed, you may follow this: https://docs.docker.com/compose/install/linux/#install-the-plugin-manually \n\n";
        exit 1;
    fi

    if ! command -v node >/dev/null 2>&1; then
        printf "\nNode not installed, you may follow this: https://github.com/nvm-sh/nvm \n\n";
        exit 1;
    fi
}

main() {
    cd "$ROOT_DIR" || exit 1;
    check_prerequisites &&
    UID="$UID" GID="$GID" UV_THREADPOOL_SIZE="$UV_THREADPOOL_SIZE" docker compose rm -fsv http-server-development || exit 1;
}

########################################################################################################

main;