install-deps:
	cd dapp && npm i
	cd eth && npm i

build-frontend:
	cd dapp && npm run build

build-backend:
	cd eth && npm run build

deploy-frontend: build-frontend
	ipfs name publish --key=saydao $(shell ipfs add -Q -r dapp/build)
