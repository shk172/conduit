# Conduit
- A lightweight desktop stock price tracker built on top of Electron-React boilerplate. Add stocks by their symbols and keep track of their prices, and updates once per minute, using information pulled from [Alpha Vantage API](https://www.alphavantage.co/).

## Install

* **Note: requires a node version >= 7 and an npm version >= 4.**

First, clone the repo via git:

```bash
git clone https://github.com/shk172/conduit.git
```

And then install dependencies with yarn.

```bash
$ cd conduit
$ yarn
```
**Note**: If you can't use [yarn](https://github.com/yarnpkg/yarn) for some reason, try `npm install`.

## Run

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a server that sends hot updates to the renderer process:

```bash
$ npm run dev
```
