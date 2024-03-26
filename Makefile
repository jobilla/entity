build:
	rm -rf dist
	tsc
	mv -f dist/src/* dist/
	rm -rf dist/src
	cp package.dist.json dist/package.json

test:
	npx jest

publish:
	cd dist/
	npm publish
