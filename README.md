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

A `Widget` is the base class of the phosphor widget hierarchy. A `Panel` is a Widget which acts as a layout container for child widgets.

A simple example of putting `Widget`s on a `Panel` is:

```typescript
let panel = new Panel();
let child_one = new Widget();
let child_two = new Widget();
panel.children.assign([child_one, child_two]);
```

a more realistic scenario would involve different custom `Widget`s:

```typescript
class LogWidget extends Widget {
  ...
}

class ControlsWidget extends Widget {
  ...
}

let logPanel = new Panel();
let log = new LogWidget();
let controls = new ControlsWidget();
logPanel.children.assign([log, controls]);
```

The `children` attribute is an [ObservableList](https://github.com/phosphorjs/phosphor-observablelist), which allows callables to be hooked up to the `changed` signal:

```typescript
let panel = new Panel();
panel.children.changed.connect(() => {
  console.log('Child added');
});
```

`Widget`s have a `node` property, which is a DOM node. For simple UI's without other toolkits, append children directly to this `node`:

```typescript
let widget = new Widget();
let div = document.createElement('div');
widget.node.appendChild(div);
```

To insert a custom widget at a certain location in the DOM, use the static `attach` method:

```typescript
let widget = new Widget();
Widget.attach(widget, document.body);
```
