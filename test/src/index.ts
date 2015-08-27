/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import expect = require('expect.js');

import {
  Message
} from 'phosphor-messaging';

import {
  Property
} from 'phosphor-properties';

import {
  HIDDEN_CLASS, MSG_AFTER_ATTACH, MSG_AFTER_SHOW, MSG_BEFORE_DETACH,
  MSG_BEFORE_HIDE, MSG_CLOSE, MSG_LAYOUT_REQUEST, MSG_UPDATE_REQUEST,
  WIDGET_CLASS, Widget, attachWidget, detachWidget
} from '../../lib/index';


class LogWidget extends Widget {

  messages: string[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }
}


describe('phosphor-widget', () => {

  describe('WIDGET_CLASS', () => {

    it('should equal `p-Widget`', () => {
      expect(WIDGET_CLASS).to.be('p-Widget');
    });

  });

  describe('HIDDEN_CLASS', () => {

    it('should equal `p-mod-hidden`', () => {
      expect(HIDDEN_CLASS).to.be('p-mod-hidden');
    });

  });

  describe('MSG_UPDATE_REQUEST', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_UPDATE_REQUEST instanceof Message).to.be(true);
    });

    it('should have a `type` of `update-request`', () => {
      expect(MSG_UPDATE_REQUEST.type).to.be('update-request');
    });

  });

  describe('MSG_LAYOUT_REQUEST', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_LAYOUT_REQUEST instanceof Message).to.be(true);
    });

    it('should have a `type` of `layout-request`', () => {
      expect(MSG_LAYOUT_REQUEST.type).to.be('layout-request');
    });

  });

  describe('MSG_AFTER_SHOW', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_AFTER_SHOW instanceof Message).to.be(true);
    });

    it('should have a `type` of `after-show`', () => {
      expect(MSG_AFTER_SHOW.type).to.be('after-show');
    });

  });

  describe('MSG_BEFORE_HIDE', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_BEFORE_HIDE instanceof Message).to.be(true);
    });

    it('should have a `type` of `before-hide`', () => {
      expect(MSG_BEFORE_HIDE.type).to.be('before-hide');
    });

  });

  describe('MSG_AFTER_ATTACH', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_AFTER_ATTACH instanceof Message).to.be(true);
    });

    it('should have a `type` of `after-attach`', () => {
      expect(MSG_AFTER_ATTACH.type).to.be('after-attach');
    });

  });

  describe('MSG_BEFORE_DETACH', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_BEFORE_DETACH instanceof Message).to.be(true);
    });

    it('should have a `type` of `before-detach`', () => {
      expect(MSG_BEFORE_DETACH.type).to.be('before-detach');
    });

  });

  describe('MSG_CLOSE', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_CLOSE instanceof Message).to.be(true);
    });

    it('should have a `type` of `close`', () => {
      expect(MSG_CLOSE.type).to.be('close');
    });

  });

  describe('Widget', () => {

    describe('.hiddenProperty', () => {

      it('should be a property descriptor', () => {
        expect(Widget.hiddenProperty instanceof Property).to.be(true);
      });

      it('should default to `false`', () => {
        var widget = new Widget();
        expect(Widget.hiddenProperty.get(widget)).to.be(false);
      });

      it('should toggle the presence of `HIDDEN_CLASS`', () => {
        var widget = new Widget();
        expect(widget.hasClass(HIDDEN_CLASS)).to.be(false);
        Widget.hiddenProperty.set(widget, true);
        expect(widget.hasClass(HIDDEN_CLASS)).to.be(true);
      });

      it('should dispatch an `after-show` message', () => {
        var widget = new LogWidget();
        Widget.hiddenProperty.set(widget, true);
        attachWidget(widget, document.body);
        expect(widget.messages.indexOf('after-show')).to.be(-1);
        Widget.hiddenProperty.set(widget, false);
        expect(widget.messages.indexOf('after-show')).to.not.be(-1);
        detachWidget(widget);
      });

      it('should dispatch a `before-hide` message', () => {
        var widget = new LogWidget();
        expect(widget.messages.indexOf('before-hide')).to.be(-1);
        attachWidget(widget, document.body);
        Widget.hiddenProperty.set(widget, true);
        expect(widget.messages.indexOf('before-hide')).to.not.be(-1);
        detachWidget(widget);
      });

    });

    describe('#propertyChanged', () => {

      it('should be emitted when a widget property changes', () => {

      });

    });

    describe('#disposed', () => {

      it('should be emitted when the widget is disposed', () => {

      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {

      });

      it('should accept an array of initial children', () => {

      });

    });

    describe('#dispose()', () => {

      it('should dispose of the widget', () => {

      });

      it('should dispose of the widget descendants', () => {

      });

      it('should automatically detach the widget', () => {

      });

    });

    describe('#isAttached', () => {

      it('should be `true` if the widget is attached', () => {

      });

      it('should be `false` if the widget is not attached', () => {

      });

    });

    describe('#isDisposed', () => {

      it('should be `true` if the widget is disposed', () => {

      });

      it('should be `false` if the widget is not disposed', () => {

      });

    });

    describe('#isVisible', () => {

      it('should be `true` if the widget is visible', () => {

      });

      it('should be `false` if the widget is not visible', () => {

      });

      it('should be `false` if the widget is not attached', () => {

      });

    });

    describe('#hidden', () => {

      it('should be `true` if the widget is hidden', () => {

      });

      it('should be `false` if the widget is not hidden', () => {

      });

      it('should be a pure delegate to the `hiddenProperty`', () => {

      });

    });

    describe('#parent', () => {

      it('should be the parent of the widget', () => {

      });

      it('should be `null` if the widget has no parent', () => {

      });

      it('should unparent the widget when set to `null`', () => {

      });

      it('should reparent the widget when set to not `null`', () => {

      });

      it('should be a no-op if the parent does not change', () => {

      });

      it('should throw an error if the widget is used as its parent', () => {

      });

    });

    describe('#children', () => {

      it('should be an empty array if there are no children', () => {

      });

      it('should return a shallow copy of the children', () => {

      });

      it('should clear the existing children and add the new children when set', () => {

      });

    });

    describe('#childCount', () => {

      it('should return the current number of children', () => {

      });

      it('should be a read-only property', () => {

      });

    });

    describe('#childAt()', () => {

      it('should return the child at the given index', () => {

      });

      it('should return `undefined` if the index is out of range', () => {

      });

    });

    describe('#childIndex()', () => {

      it('should return the index of the given child', () => {

      });

      it('should return `-1` if the widget does not contain the child', () => {

      });

    });

    describe('#addChild()', () => {

      it('should add a child widget to the end of the children', () => {

      });

      it('should return the new index of the child', () => {

      });

      it('should throw an error if the widget is added to itself', () => {

      });

    });

    describe('#insertChild()', () => {

      it('should insert a child widget at a given index', () => {

      });

      it('should return the new index of the child', () => {

      });

      it('should clamp the index to the bounds of the children', () => {

      });

      it('should throw an error if the widget is added to itself', () => {

      });

    });

    describe('#moveChild()', () => {

      it('should move a child from one index to another', () => {

      });

      it('should return `true` if the move was successful', () => {

      });

      it('should return `false` if either index is out of range', () => {

      });

    });

    describe('#removeChildAt()', () => {

      it('should remove the child at the given index', () => {

      });

      it('should return the removed child', () => {

      });

      it('should return `undefined` if the index is out of range', () => {

      });

    });

    describe('#removeChild()', () => {

      it('should remove the given child widget', () => {

      });

      it('should return the index occupied by the child', () => {

      });

      it('should return `-1` if the widget does not contain the child', () => {

      });

    });

    describe('#clearChildren()', () => {

      it('should remove all children', () => {

      });

    });

    describe('#compressMessage()', () => {

      it('should compress `update-request` messages', () => {

      });

      it('should compress `layout-request` messages', () => {

      });

    });

    describe('#onChildAdded()', () => {

      it('should be invoked when a child is added', () => {

      });

      it('should insert the child node at the corrent location', () => {

      });

      context('`msg` parameter', () => {

        it('should be a `ChildMessage`', () => {

        });

        it('should have a `type` of `child-added`', () => {

        });

        it('should have the correct `child`', () => {

        });

        it('should have the correct `currentIndex`', () => {

        });

        it('should have a `previousIndex` of `-1`', () => {

        });

      });

      context('if the widget is attached', () => {

        it('should send an `after-attach` message to the child', () => {

        });

      });

    });

    describe('#onChildRemoved()', () => {

      it('should be invoked when a child is removed', () => {

      });

      context('`msg` parameter', () => {

        it('should be a `ChildMessage`', () => {

        });

        it('should have a `type` of `child-removed`', () => {

        });

        it('should have the correct `child`', () => {

        });

        it('should have a `currentIndex` of -1', () => {

        });

        it('should have the correct `previousIndex`', () => {

        });

      });

      context('if the widget is attached', () => {

        it('should send a `before-detach` message to the child', () => {

        });

      });

    });

    describe('#onChildMoved()', () => {

      it('should be invoked when a child is moved', () => {

      });

      context('`msg` parameter', () => {

        it('should be a `ChildMessage`', () => {

        });

        it('should have a `type` of `child-moved`', () => {

        });

        it('should have the correct `child`', () => {

        });

        it('should have the correct `currentIndex`', () => {

        });

        it('should have the correct `previousIndex`', () => {

        });

      });

      context('if the widget is attached', () => {

        it('should send a `before-detach` message to the child', () => {

        });

        it('should send an `after-attach` message to the child', () => {

        });

      });

    });

    describe('#onResize()', () => {

      it('should be invoked when the widget is resized', () => {

      });

      context('`msg` parameter', () => {

        it('should be a `ResizeMessage`', () => {

        });

        it('should have a `type` of `resize`', () => {

        });

        it('should have a `width` of `-1` if the size is unknown', () => {

        });

        it('should have a `height` of `-1` if the size is unknown', () => {

        });

        it('should have a valid `width` if the size is known', () => {

        });

        it('should have a valid `height` if the size is known', () => {

        });

      });

      it('should dispatch `ResizeMessage.UnknownSize` to the children', () => {

      });

    });

    describe('#onUpdateRequest()', () => {

      it('should be invoked when an update is requested', () => {

      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {

        });

        it('should have a `type` of `update-request`', () => {

        });

      });

    });

    describe('#onLayoutRequest()', () => {

      it('should be invoked when a layout is requested', () => {

      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {

        });

        it('should have a `type` of `layout-request`', () => {

        });

      });

    });

    describe('#onAfterShow()', () => {

      it('should be invoked just after the widget is made visible', () => {

      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {

        });

        it('should have a `type` of `after-show`', () => {

        });

      });

    });

    describe('#onBeforeHide()', () => {

      it('should be invoked just before the widget is made not-visible', () => {

      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {

        });

        it('should have a `type` of `before-hide`', () => {

        });

      });

    });

    describe('#onAfterAttach()', () => {

      it('should be invoked just after the widget is attached', () => {

      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {

        });

        it('should have a `type` of `after-attach`', () => {

        });

      });

    });

    describe('#onBeforeDetach()', () => {

      it('should be invoked just before the widget is detached', () => {

      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {

        });

        it('should have a `type` of `before-detach`', () => {

        });

      });

    });

    describe('#onChildShown()', () => {

      it('should be invoked when a child is unhidden', () => {

      });

      context('`msg` parameter', () => {

        it('should be a `ChildMessage`', () => {

        });

        it('should have a `type` of `child-shown`', () => {

        });

        it('should have the correct `child`', () => {

        });

        it('should have a `currentIndex` of -1', () => {

        });

        it('should have a `previousIndex` of -1', () => {

        });

      });

    });

    describe('#onChildHidden()', () => {

      it('should be invoked on a `child-hidden`', () => {

      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {

        });

        it('should have a `type` of `child-hidden`', () => {

        });

        it('should have the correct `child`', () => {

        });

        it('should have a `currentIndex` of -1', () => {

        });

        it('should have a `previousIndex` of -1', () => {

        });

      });

    });

    describe('#onClose()', () => {

      it('should be invoked on a `close`', () => {

      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {

        });

        it('should have a `type` of `close`', () => {

        });

      });

    });

    context('message propagation', () => {

      it('should propagate `after-attach` to all descendants', () => {

      });

      it('should propagate `before-detach` to all descendants', () => {

      });

      it('should propagate `after-show` to all non-hidden descendants', () => {

      });

      it('should propagate `before-hide` to all non-hidden descendants', () => {

      });

    });

    context('state propagation', () => {

      it('should propagate `isAttached` state to all descendants', () => {

      });

      it('should propagate `isVisible` state to all non-hidden descendants', () => {

      });

    });

  });

  describe('attachWidget()', () => {

    it('should attach a root widget to a host', () => {
      var widget = new Widget();
      expect(widget.isAttached).to.be(false);
      attachWidget(widget, document.body);
      expect(widget.isAttached).to.be(true);
    });

    it('should throw if the widget is not a root', () => {
      var widget = new Widget();
      var child = new Widget();
      child.parent = widget;
      expect(() => attachWidget(child, document.body)).to.throwException();
    });

    it('should throw if the widget is already attached', () => {
      var widget = new Widget();
      attachWidget(widget, document.body);
      expect(() => attachWidget(widget, document.body)).to.throwException();
    });

    it('should throw if the host is not attached to the DOM', () => {
      var widget = new Widget();
      var host = document.createElement('div');
      expect(() => attachWidget(widget, host)).to.throwException();
    });

    it('should dispatch an `after-attach` message', () => {
      var widget = new LogWidget();
      expect(widget.isAttached).to.be(false);
      expect(widget.messages.indexOf('after-attach')).to.be(-1);
      attachWidget(widget, document.body);
      expect(widget.isAttached).to.be(true);
      expect(widget.messages.indexOf('after-attach')).to.not.be(-1);
    });

  });

  describe('detachWidget()', () => {

    it('should detach a root widget from its host', () => {

    });

    it('should throw if the widget is not a root', () => {

    });

    it('should throw if the widget is not attached', () => {

    });

    it('should dispatch a `before-detach` message', () => {

    });

  });

  describe('fitWidget()', () => {

    it('should resize a widget to fit its host', () => {

    });

    it('should throw if widget is not a root', () => {

    });

    it('should throw if the widget does not have a host', () => {

    });

    it('should dispatch a `resize` message to the widget', () => {

    });

  });

  describe('ChildMessage', () => {

    describe('#constructor()', () => {

      it('should accept the message type and child widget', () => {

      });

      it('should accept an optional `previousIndex`', () => {

      });

      it('should accept an optional `currentIndex`', () => {

      });

      it('should default the `previousIndex` to `-1`', () => {

      });

      it('should default the `currentIndex` to `-1`', () => {

      });

    });

    describe('#child', () => {

      it('should be the child passed to the constructor', () => {

      });

      it('should be a read-only property', () => {

      });

    });

    describe('#currentIndex', () => {

      it('should be the index provided to the constructor', () => {

      });

      it('should be a read-only property', () => {

      });

    });

    describe('#previousIndex', () => {

      it('should be the index provided to the constructor', () => {

      });

      it('should be a read-only property', () => {

      });

    });

  });

  describe('ResizeMessage', () => {

    describe('.UnknownSize', () => {

      it('should be a `ResizeMessage`', () => {

      });

      it('should have a `width` of `-1`', () => {

      });

      it('should have a `height` of `-1`', () => {

      });

    });

    describe('#constructor()', () => {

      it('should accept a width and height', () => {

      });

    });

    describe('#width', () => {

      it('should be the width passed to the constructor', () => {

      });

      it('should be a read-only property', () => {

      });

    });

    describe('#height', () => {

      it('should be the height passed to the constructor', () => {

      });

      it('should be a read-only property', () => {

      });

    });

  });

});
