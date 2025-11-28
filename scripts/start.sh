#!/bin/sh

UID=$(id -u);
GID=$(id -g);

ROOT_DIR=$(realpath "$(dirname "$0")/..");

NPM_CACHE_DIR="$ROOT_DIR"/npm-cache;
COVERAGE_FOLDER="$ROOT_DIR/coverage";
ERR_LOG_FILE="$ROOT_DIR"/error_logs.txt;

UV_THREADPOOL_SIZE=$(($(nproc --all) - 1));

####################################################################################

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

install_dependencies() {
    cd "$ROOT_DIR" || exit 1;
    if ! npm install --include=dev -d; then
        printf "\nFailed to install npm dependencies. Please check for issues and try again.\n\n";
        exit 1;
    fi
}

check_services_health() {
    error_occurred=false;

    for service in $(docker compose ps --all --services 2>/dev/null); do
        health_status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$service" 2>/dev/null) || continue;
        if [ "$health_status" = "unhealthy" ]; then
            docker logs "$service" >> "$ERR_LOG_FILE" 2>&1;
            error_occurred=true;
        elif [ "$health_status" = "exited" ]; then
            exit_code=$(docker inspect --format '{{.State.ExitCode}}' "$service");
            if [ "$exit_code" -ne 0 ]; then
                docker logs "$service" >> "$ERR_LOG_FILE" 2>&1 || exit 1;
                error_occurred=true;
            fi
        fi
    done

    if [ "$error_occurred" = true ]; then
        [ -f "$ERR_LOG_FILE" ] && cat "$ERR_LOG_FILE"
        printf "\nPlease address the issues above and try again.\n\n";
        exit 1;
    fi
}

main() {
    check_prerequisites &&
    mkdir -p "$NPM_CACHE_DIR" "$COVERAGE_FOLDER" &&
    install_dependencies &&
    rm -f "$ERR_LOG_FILE" &&
    cd "$ROOT_DIR" &&
    UID="$UID" GID="$GID" UV_THREADPOOL_SIZE="$UV_THREADPOOL_SIZE" docker compose up --always-recreate-deps --build --force-recreate -d --wait &&
    check_services_health;
}

####################################################################################

main;