#! /bin/sh

echo "\nInstalling node packages"
npm install

echo "\ncopying git hooks"
cp .git-hooks/* .git/hooks

npm run test