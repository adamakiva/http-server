# Http server

[![CI](https://github.com/adamakiva/http-server/actions/workflows/ci.yml/badge.svg)](https://github.com/adamakiva/http-server/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/adamakiva/http-server/branch/master/graph/badge.svg)](https://codecov.io/gh/adamakiva/http-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A simple http server stream implementation in order to learn the fundamentals hidden by modern
frameworks

## Development

The development environment runs inside a docker container.
That comes with all of the relevant caveats, e.g:

- Node is not required on the machine but suggested.
- Debugger should be connected to the container (port 8227 is exposed for that purpose)
- etc...

### Prerequisites

1. Unix-based system with POSIX compliant shell (required for the scripts to work)
2. [Docker engine & docker-compose plugin](https://github.com/AdamAkiva/tutorials/blob/main/tools/docker/docker.md)
   preferably the latest version, otherwise you **may** encounter errors
3. Make sure the scripts have execute permissions, e.g: (Assuming project root dir)

```bash
chmod +x ./scripts/*.sh
```

---

## Run locally instructions

1. Use this to start the local environment:

```bash
./scripts/start.sh
```

2. Use this to stop the local environment:

```bash
./scripts/remove.sh
```

## Production

NYI
