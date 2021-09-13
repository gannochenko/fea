#!/usr/bin/env bash

BIN="fea"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

yarn build:cjs
chmod +x ${DIR}/../build.cjs/index.js
cd $(yarn global bin)
ln -s ${DIR}/../build.cjs/index.js ./${BIN}

echo "Linked. You can now 'yarn build:watch' to keep your global installation up-to-date with the source code, while developing."
