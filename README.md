# SayDAO

## Project structure

The project is organized in a monolithic repository (also called monorepo) that contains:

- `dapp` the decentralized application.
- `docs` the operation and principles documents.
- `eth` the Ethereum smart contracts (also called backend).
- `srv` extra tooling used to deploy the project in a staging environment.

## I want to develop SayDAO

You need a LTS version of Node and an operating system with `make` (GNU/Linux or a Mac work).

First, install dependencies:

```
make install-deps
```

Then, Start a local blockchain node and an [OpenGSN node](https://github.com/opengsn/gsn) for development:

```
make dev-blockchain
```

When the blockchain is running, deploy the smart contracts:

```
make backend-deploy
```

In another terminal, run the process to build, watch, and live reload the dapp:


```
make dev-dapp
```

All done, haffun!

## I want do deploy SayDAO

TBD

## Design principles

> Find what works, not what's popular.

— https://www.gov.uk/guidance/government-design-principles

https://gds.blog.gov.uk/2018/06/22/introducing-the-gov-uk-design-system/
https://designnotes.blog.gov.uk/
https://www.gov.uk/service-manual/service-standard
