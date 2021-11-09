#!/bin/zsh
if [ -z "$1" ]
  then
    echo "Jako parametr podaj nazwę pliku, znajdującego się w folderze timelogs. Na przykład timelog-1.csv"
    exit 1
fi
npm install
npx tsc
node dist/index.js $1
