# Gnar bot

A bot that monitors for changes in Gnars auction state and notifies everyone via Twitter and Discord.

## ENV file

Make .env file in root folder.
Edit .env file like .env.example file.

## Install dependencies

```sh
yarn add
yarn install
```

## Start bot and logging

```sh
yarn start 1> bot.log
```

## Monitoring bot

```sh
ps aux | grep index.ts
```
