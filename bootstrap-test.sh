#!/bin/bash
set -x

CWD=$(pwd)
TESTPATH="$(mktemp -d)"

mkdir -p ${TESTPATH}
cd "${TESTPATH}"
echo '{ "name":"test","version":"1.0.0", "devDependencies": { "cross-env": "^3.1.4"}, "scripts":{"prod":"cross-env NODE_ENV=production edge build"} }' > package.json

npm -q install ${CWD}

node_modules/.bin/edge bootstrap --title="Test" --description="Test" --language="de-DE"
npm -q install

npm run prod

node build/server/main.js &
TEST_PID=$!

sleep 2

IS_RUNNING=$(ps -p $TEST_PID -o pid=)

curl -f http://localhost:1339
CURL_EXITCODE=$?

kill -9 $TEST_PID
rm -fr "${TESTPATH}"

if [ $CURL_EXITCODE -ne 0 ]; then
  exit 2
fi

if [ -n "$IS_RUNNING" ]; then
  exit 0
else
  exit 1
fi

