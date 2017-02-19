#!/bin/bash
set -x

CWD=$(pwd)
TESTPATH="${CWD}/test_bootstrap"

mkdir -p ${TESTPATH}
cd "${TESTPATH}"
echo '{ "name":"test","version":"1.0.0", "devDependencies": { "cross-env": "^3.1.4"}, "scripts":{"prod":"cross-env NODE_ENV=production advanced-script build"} }' > package.json

npm -q install ..

node_modules/.bin/advanced-script bootstrap --title="Test" --description="Test" --language="de-DE"
npm -q install

npm run prod

node build/server/main.js &
TEST_PID=$!

sleep 2

IS_RUNNING=$(ps -p $TEST_PID -o pid=)

curl -f http://localhost:1339
CURL_EXITCODE=$?

kill -9 $TEST_PID

if [ $CURL_EXITCODE -ne 0 ]; then
  exit 2
fi

if [ -n "$IS_RUNNING" ]; then
  exit 0
else
  exit 1
fi

