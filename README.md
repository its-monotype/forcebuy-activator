## Requirements

Install Windows SDK by installing [Visual Studio](https://visualstudio.microsoft.com/ru/downloads/) (requirement of node-gyp, select MS SDK and Classic Console CPP apps in Visual Studio Installer)
Install [Python](https://www.python.org/)
Install pyinstaller pip module globally:

```bash
pip install pyinstaller
```

Install virtualenv pip package globally:

```bash
pip install virtualenv
```

Create a Virtual Environment using “virtualenv” pip module wich was installed at previous step:

```bash
# write it in root dir
cd src/python
virtualenv venv
```

Activate Virtual Environment and install requirements:

```bash
# write it in src/python dir
source venv/Scripts/activate
pip install -r requirements.txt
```

Install node-gyp npm package globally:

```bash
npm i -g node-gyp
```

Install rimraf npm package globally:

```bash
npm i -g rimraf
```

Install concurrently npm package globally:

```bash
npm i -g concurrently
```

Install electron-rebuild npm package globally:

```bash
npm i -g electron-rebuild
```

Install yarn npm package globally:

```bash
npm i -g yarn
```

## Deploy requirements

Copy github personal token with repo scope from package.json and add it to Windows environment variables as GH_TOKEN.

Before "yarn deploy" dont forget to bump app version in src/package.json

## Package manager: yarn

## Main scripts

```bash
# start
yarn start
# package all app without publish
yarn package
# package all app and publish it to github
yarn deploy
```
