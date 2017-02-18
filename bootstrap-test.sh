#!/bin/bash

CWD=$(pwd)
TESTPATH="${CWD}/test_boilerplate"

mkdir -p ${TESTPATH}
cd "${TESTPATH}"
echo '{ "name":"test","version":"1.0.0", "devDependencies": { "cross-env": "^3.1.4"}, scripts":{"prod":"cross-env NODE_ENV=production advanced-script build"} }' > package.json

npm install
npm link ..
npm install ..

node_modules/.bin/advanced-script bootstrap --title="Test" --description="Test" --language="de-DE"
npm run prod
