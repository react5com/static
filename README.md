# express-static-build

Build Express.js app as static html files.

## Install

```bash
npm install express-static-build --save-dev
```

## Usage

```bash
express-static-build <source> <destination> [--config esb.config.json] [--verbose|-v]
```

## Example

```bash
npx express-static-build src dist --config esb.config.json --verbose
```
or
```json
"scripts": {
  "build:static": "express-static-build src dist --config esb.config.json --verbose",
}
```

## Config file (esb.config.json)
```json
{
  "languages": ["en", "fr"],
  "routes": [
    "",
    "home",
    "contact",
    "about"
  ],
  "assetFolders": [
    "images",
    "scripts",
    "css"
  ]
}
```