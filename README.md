phosphor-widget
===============

[![Build Status](https://travis-ci.org/phosphorjs/phosphor-widget.svg)](https://travis-ci.org/phosphorjs/phosphor-widget?branch=master)
[![Coverage Status](https://coveralls.io/repos/phosphorjs/phosphor-widget/badge.svg?branch=master&service=github)](https://coveralls.io/github/phosphorjs/phosphor-widget?branch=master)

The core Phosphor widget class.

[API Docs](http://phosphorjs.github.io/phosphor-widget/api/)

Phosphor widgets provide several useful behaviours:

  - **Hierarchical widgets**. This allows the addition/removal/resize of widgets without causing unnecessary reflows.

  - **Unopinionated design**. *Any* content can be attached to a Phosphor Widget's `node`; [examples exist](https://phosphorjs.github.io/examples.html) for React and Flexbox, however the `node` attribute is a standard DOM node, so the Phosphor library does *not* limit functionality to certain frameworks or architectures.

  - **Events:** show/hide, attach/detach, re-size, close, to name just a few. Desktop GUI toolkits have had these for years, but they are missing from the DOM.


Package Install
---------------

**Prerequisites**
- [node](http://nodejs.org/)

```bash
npm install --save phosphor-widget
```


Source Build
------------

**Prerequisites**
- [git](http://git-scm.com/)
- [node](http://nodejs.org/)

```bash
git clone https://github.com/phosphorjs/phosphor-widget.git
cd phosphor-widget
npm install
```

**Rebuild**
```bash
npm run clean
npm run build
```


Run Tests
---------

Follow the source build instructions first.

```bash
# run tests in Firefox
npm test

# run tests in Chrome
npm run test:chrome

# run tests in IE
npm run test:ie
```


Build Docs
----------

Follow the source build instructions first.

```bash
npm run docs
```

Navigate to `docs/index.html`.


Supported Runtimes
------------------

The runtime versions which are currently *known to work* are listed below.
Earlier versions may also work, but come with no guarantees.

- IE 11+
- Firefox 32+
- Chrome 38+


Bundle for the Browser
----------------------

Follow the package install instructions first.

```bash
npm install --save-dev browserify browserify-css
browserify myapp.js -o mybundle.js
```


Usage Examples
--------------

**Note:** This module is fully compatible with Node/Babel/ES6/ES5. Simply
omit the type declarations when using a language other than TypeScript.
