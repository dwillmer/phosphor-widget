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

    it('should have type `update-request`', () => {
      expect(MSG_UPDATE_REQUEST.type).to.be('update-request');
    });

  });

  describe('MSG_LAYOUT_REQUEST', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_LAYOUT_REQUEST instanceof Message).to.be(true);
    });

    it('should have type `layout-request`', () => {
      expect(MSG_LAYOUT_REQUEST.type).to.be('layout-request');
    });

  });

  describe('MSG_AFTER_SHOW', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_AFTER_SHOW instanceof Message).to.be(true);
    });

    it('should have type `after-show`', () => {
      expect(MSG_AFTER_SHOW.type).to.be('after-show');
    });

  });

  describe('MSG_BEFORE_HIDE', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_BEFORE_HIDE instanceof Message).to.be(true);
    });

    it('should have type `before-hide`', () => {
      expect(MSG_BEFORE_HIDE.type).to.be('before-hide');
    });

  });

  describe('MSG_AFTER_ATTACH', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_AFTER_ATTACH instanceof Message).to.be(true);
    });

    it('should have type `after-attach`', () => {
      expect(MSG_AFTER_ATTACH.type).to.be('after-attach');
    });

  });

  describe('MSG_BEFORE_DETACH', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_BEFORE_DETACH instanceof Message).to.be(true);
    });

    it('should have type `before-detach`', () => {
      expect(MSG_BEFORE_DETACH.type).to.be('before-detach');
    });

  });

  describe('MSG_CLOSE', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_CLOSE instanceof Message).to.be(true);
    });

    it('should have type `close`', () => {
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

    });

    describe('#disposed', () => {

    });

    describe('#constructor()', () => {

    });

    describe('#dispose()', () => {

    });

    describe('#isAttached', () => {

    });

    describe('#isDisposed', () => {

    });

    describe('#isVisible', () => {

    });

    describe('#hidden', () => {

    });

    describe('#parent', () => {

    });

    describe('#children', () => {

    });

    describe('#childCount', () => {

    });

    describe('#childAt()', () => {

    });

    describe('#childIndex()', () => {

    });

    describe('#addChild()', () => {

    });

    describe('#insertChild()', () => {

    });

    describe('#moveChild()', () => {

    });

    describe('#removeChildAt()', () => {

    });

    describe('#removeChild()', () => {

    });

    describe('#clearChildren()', () => {

    });

    describe('#testFlag()', () => {

    });

    describe('#setFlag()', () => {

    });

    describe('#clearFlag()', () => {

    });

    describe('#compressMessage()', () => {

    });

    describe('#onChildAdded()', () => {

    });

    describe('#onChildRemoved()', () => {

    });

    describe('#onChildMoved()', () => {

    });

    describe('#onResize()', () => {

    });

    describe('#onUpdateRequest()', () => {

    });

    describe('#onLayoutRequest()', () => {

    });

    describe('#onAfterShow()', () => {

    });

    describe('#onBeforeHide()', () => {

    });

    describe('#onAfterAttach()', () => {

    });

    describe('#onBeforeDetach()', () => {

    });

    describe('#onChildShown()', () => {

    });

    describe('#onChildHidden()', () => {

    });

    describe('#onClose()', () => {

    });

  });

  describe('attachWidget', () => {

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

  // TODO test hiearchy messages attach/detach/show/hide

  describe('detachWidget', () => {

  });

  describe('fitWidget', () => {

  });

  describe('ChildMessage', () => {

    describe('#constructor()', () => {

    });

    describe('#child', () => {

    });

    describe('#currentIndex', () => {

    });

    describe('#previousIndex', () => {

    });

  });

  describe('ResizeMessage', () => {

    describe('#constructor()', () => {

    });

    describe('#width', () => {

    });

    describe('#height', () => {

    });

  });

});
