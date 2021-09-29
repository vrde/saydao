.PHONY: config-dir install-deps backend-install backend-deploy frontend-install frontend-build frontend-deploy dev-blockchain dev-dapp

NETWORK ?= 'localhost'
ONE_HOUR = $$(( 60 * 60 ))
SIX_HOURS = $$(( 6 * 60 * 60 ))
TWELVE_HOURS = $$(( 12 * 60 * 60 ))
ONE_DAY = $$(( 24 * 60 * 60 ))
ONE_WEEK = $$(( 7 * 24 * 60 * 60 ))

install-deps: frontend-install backend-install

backend-install:
	cd eth && npm install

backend-deploy:
	cd eth && MIN_POLL_DURATION=${ONE_HOUR} MIN_POLL_MEETING_DURATION=${ONE_HOUR} TIME_UNIT=${ONE_WEEK} NETWORK=${NETWORK} npm run deploy

backend-test-deploy:
	cd eth && MIN_POLL_DURATION=0 MIN_POLL_MEETING_DURATION=0 TIME_UNIT=1 NETWORK=${NETWORK} npm run deploy

frontend-install:
	cd dapp && npm install

frontend-build:
	cd dapp && NETWORK=${NETWORK} npm run build

frontend-deploy:
	ipfs name publish --key=saydao $(shell ipfs add -Q -r dapp/build)

dev-blockchain:
	cd eth && npm run blockchain

dev-ipfs:
	ipfs daemon

dev-dapp:
	cd dapp && npm start
