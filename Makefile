.PHONY: config-dir install-deps backend-install backend-deploy frontend-install frontend-build frontend-deploy dev-blockchain dev-dapp

NETWORK ?= 'localhost'

install-deps: frontend-install backend-install

backend-install:
	cd eth && npm install

backend-deploy:
	cd eth && NETWORK=${NETWORK} npm run deploy

frontend-install:
	cd dapp && npm install

frontend-build:
	cd dapp && NETWORK=${NETWORK} npm run build

frontend-deploy:
	ipfs name publish --key=saydao $(shell ipfs add -Q -r dapp/build)

dev-blockchain:
	cd eth && npm run blockchain

dev-dapp:
	cd dapp && npm start
