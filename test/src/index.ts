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
  Message, postMessage
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

    it('should be "p-Widget"', () => {
      expect(WIDGET_CLASS).to.be('p-Widget');
    });

  });

  describe('HIDDEN_CLASS', () => {

    it('should be "p-mod-hidden"', () => {
      expect(HIDDEN_CLASS).to.be('p-mod-hidden');
    });

  });

  describe('MSG_UPDATE_REQUEST', () => {

    it('should be a Message instance', () => {
      expect(MSG_UPDATE_REQUEST instanceof Message).to.be(true);
    });

    it('should have type "update-request"', () => {
      expect(MSG_UPDATE_REQUEST.type).to.be('update-request');
    });

    it('should be collapsed by default', (done) => {
      var widget = new LogWidget();
      postMessage(widget, MSG_UPDATE_REQUEST);
      postMessage(widget, MSG_UPDATE_REQUEST);
      requestAnimationFrame(() => {
        expect(widget.messages).to.eql(['update-request']);
        done();
      });
    });

  });

  describe('MSG_LAYOUT_REQUEST', () => {

    it('should be a Message instance', () => {
      expect(MSG_LAYOUT_REQUEST instanceof Message).to.be(true);
    });

    it('should have type "layout-request"', () => {
      expect(MSG_LAYOUT_REQUEST.type).to.be('layout-request');
    });

    it('should be collapsed by default', (done) => {
      var widget = new LogWidget();
      postMessage(widget, MSG_LAYOUT_REQUEST);
      postMessage(widget, MSG_LAYOUT_REQUEST);
      requestAnimationFrame(() => {
        expect(widget.messages).to.eql(['layout-request']);
        done();
      });
    });

  });

  describe('MSG_AFTER_SHOW', () => {

    it('should be a Message instance', () => {
      expect(MSG_AFTER_SHOW instanceof Message).to.be(true);
    });

    it('should have type "after-show"', () => {
      expect(MSG_AFTER_SHOW.type).to.be('after-show');
    });

    it('should not be collapsed by default', (done) => {
      var widget = new LogWidget();
      postMessage(widget, MSG_AFTER_SHOW);
      postMessage(widget, MSG_AFTER_SHOW);
      requestAnimationFrame(() => {
        expect(widget.messages).to.eql(['after-show', 'after-show']);
        done();
      });
    });

  });

  describe('MSG_BEFORE_HIDE', () => {

    it('should be a Message instance', () => {
      expect(MSG_BEFORE_HIDE instanceof Message).to.be(true);
    });

    it('should have type "before-hide"', () => {
      expect(MSG_BEFORE_HIDE.type).to.be('before-hide');
    });

    it('should not be collapsed by default', (done) => {
      var widget = new LogWidget();
      postMessage(widget, MSG_BEFORE_HIDE);
      postMessage(widget, MSG_BEFORE_HIDE);
      requestAnimationFrame(() => {
        expect(widget.messages).to.eql(['before-hide', 'before-hide']);
        done();
      });
    });

  });

  describe('MSG_AFTER_ATTACH', () => {

    it('should be a Message instance', () => {
      expect(MSG_AFTER_ATTACH instanceof Message).to.be(true);
    });

    it('should have type "after-attach"', () => {
      expect(MSG_AFTER_ATTACH.type).to.be('after-attach');
    });

    it('should not be collapsed by default', (done) => {
      var widget = new LogWidget();
      postMessage(widget, MSG_AFTER_ATTACH);
      postMessage(widget, MSG_AFTER_ATTACH);
      requestAnimationFrame(() => {
        expect(widget.messages).to.eql(['after-attach', 'after-attach']);
        done();
      });
    });

  });

  describe('MSG_BEFORE_DETACH', () => {

    it('should be a Message instance', () => {
      expect(MSG_BEFORE_DETACH instanceof Message).to.be(true);
    });

    it('should have type "before-detach"', () => {
      expect(MSG_BEFORE_DETACH.type).to.be('before-detach');
    });

    it('should no be collapsed by default', (done) => {
      var widget = new LogWidget();
      postMessage(widget, MSG_BEFORE_DETACH);
      postMessage(widget, MSG_BEFORE_DETACH);
      requestAnimationFrame(() => {
        expect(widget.messages).to.eql(['before-detach', 'before-detach']);
        done();
      });
    });

  });

  describe('MSG_CLOSE', () => {

    it('should be a Message instance', () => {
      expect(MSG_CLOSE instanceof Message).to.be(true);
    });

    it('should have type "close"', () => {
      expect(MSG_CLOSE.type).to.be('close');
    });

    it('should be collapsed by default', (done) => {
      var widget = new LogWidget();
      postMessage(widget, MSG_CLOSE);
      postMessage(widget, MSG_CLOSE);
      requestAnimationFrame(() => {
        expect(widget.messages).to.eql(['close', 'close']);
        done();
      });
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

      it('should control the presence of the `HIDDEN_CLASS`', () => {
        var widget = new Widget();
        expect(widget.hasClass(HIDDEN_CLASS)).to.be(false);
        Widget.hiddenProperty.set(widget, true);
        expect(widget.hasClass(HIDDEN_CLASS)).to.be(true);
      });

      it('should dispatch the `MSG_AFTER_SHOW` message', () => {
        var widget = new LogWidget();
        Widget.hiddenProperty.set(widget, true);
        attachWidget(widget, document.body);
        expect(widget.messages.indexOf('after-show')).to.be(-1);
        Widget.hiddenProperty.set(widget, false);
        expect(widget.messages.indexOf('after-show')).to.not.be(-1);
        detachWidget(widget);
      });

      it('should dispatch the `MSG_BEFORE_HIDE` message', () => {
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

    it('should dispatch `MSG_AFTER_ATTACH` to the hierarchy', () => {
      var widget = new LogWidget();
      var child1 = new LogWidget();
      var child2 = new LogWidget();
      var child3 = new LogWidget();
      var child4 = new LogWidget();
      child1.parent = widget;
      child2.parent = widget;
      child3.parent = child1;
      child4.parent = child2;
      expect(widget.isAttached).to.be(false);
      expect(child1.isAttached).to.be(false);
      expect(child2.isAttached).to.be(false);
      expect(child3.isAttached).to.be(false);
      expect(child4.isAttached).to.be(false);
      expect(widget.messages.indexOf('after-attach')).to.be(-1);
      expect(child1.messages.indexOf('after-attach')).to.be(-1);
      expect(child2.messages.indexOf('after-attach')).to.be(-1);
      expect(child3.messages.indexOf('after-attach')).to.be(-1);
      expect(child4.messages.indexOf('after-attach')).to.be(-1);
      attachWidget(widget, document.body);
      expect(widget.isAttached).to.be(true);
      expect(child1.isAttached).to.be(true);
      expect(child2.isAttached).to.be(true);
      expect(child3.isAttached).to.be(true);
      expect(child4.isAttached).to.be(true);
      expect(widget.messages.indexOf('after-attach')).to.not.be(-1);
      expect(child1.messages.indexOf('after-attach')).to.not.be(-1);
      expect(child2.messages.indexOf('after-attach')).to.not.be(-1);
      expect(child3.messages.indexOf('after-attach')).to.not.be(-1);
      expect(child4.messages.indexOf('after-attach')).to.not.be(-1);
    });

  });

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
