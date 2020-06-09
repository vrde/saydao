install-deps: frontend-install backend-install

backend-install:
	cd eth && npm install

backend-build:
	cd eth && npm run build

frontend-install:
	cd dapp && npm install

frontend-build:
	cd dapp && npm run build

frontend-deploy: frontend-install frontend-build
	ipfs name publish --key=saydao $(shell ipfs add -Q -r dapp/build)
