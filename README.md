[![Travis](https://img.shields.io/travis/larsvanbraam/vue-transition-component.svg?maxAge=2592000)](https://travis-ci.org/larsvanbraam/vue-transition-component)
[![Code Climate](https://img.shields.io/codeclimate/github/larsvanbraam/vue-transition-component.svg?maxAge=2592000)](https://codeclimate.com/github/larsvanbraam/vue-transition-component)
[![npm](https://img.shields.io/npm/dm/vue-transition-component.svg?maxAge=2592000)](https://www.npmjs.com/package/vue-transition-component)
[![GitHub issues](https://img.shields.io/github/issues/larsvanbraam/vue-transition-component.svg?style=flat-square)](https://github.com/larsvanbraam/vue-transition-component/issues)

<p align="center">
    <img src="http://vue-transition-component.larsvanbraam.nl/vue-transition-component-1024.png?v=2" alt="vue-transition-component" width="512"/>
</p>


TODO: Remove es6-promises module, remove all lodash es6 polyfils and update the readme to inform users on what project specific polyfils are required!

Provides GreenSock transition functionality to vue.js components.

## Table of contents

1. [Installation](#installation)
2. [Demo](#demo)
3. [Required polyfills](#required-polyfills)
4. [Usage](#usage)
5. [Building](#building)
6. [Authors](#authors)
7. [Contribute](#contribute)
8. [License](#license)

## Installation

```sh
yarn add vue-transition-component
```

```sh
npm i -S vue-transition-component
```

## Demo
I've created a demo repository that contains the setup for the latest vue-skeleton (v0.8.1) with the
vue-transition-component (v1.1.17) installed. You can inspect the code there or if you just want to preview the block
system you can visit the demo online!

### [Demo repository](https://github.com/larsvanbraam/vue-transition-component-demo)
### [Online demo](http://vue-transition-component.larsvanbraam.nl)

## Required polyfills
To make sure the module works as expected, you will need to make sure your project has support for the following:
- Promises
- Array.findIndex
- Array.find
- Object.assign

## Usage
Detailed documentation and examples are located in the wiki!

### [Check the wiki!](https://github.com/larsvanbraam/vue-transition-component/wiki)

## Building

In order to build vue-transition-component, ensure that you have [Git](http://git-scm.com/downloads) and [Node.js](http://nodejs.org/) installed.

Clone a copy of the repo:
```sh
git clone https://github.com/larsvanbraam/vue-transition-component.git
```

Change to the vue-transition directory:
```sh
cd vue-transition-component
```

Install dev dependencies:
```sh
yarn
```

Use one of the following main scripts:
```sh
yarn build            # build this project
yarn dev              # run compilers in watch mode, both for babel and typescript
yarn test             # run the unit tests incl coverage
yarn test:dev         # run the unit tests in watch mode
yarn lint             # run eslint and tslint on this project
yarn doc              # generate typedoc documentation
```

When installing this module, it adds a pre-commit hook, that runs lint and prettier commands
before committing, so you can be sure that everything checks out.

## Authors
View [AUTHORS.md](./AUTHORS.md)

## Contribute
View [CONTRIBUTING.md](./CONTRIBUTING.md)

## License
[MIT](./LICENSE) © Lars van Braam
