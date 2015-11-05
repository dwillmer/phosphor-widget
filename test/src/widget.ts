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
  Message, postMessage, sendMessage
} from 'phosphor-messaging';

import {
  Property
} from 'phosphor-properties';

import {
  Signal
} from 'phosphor-signaling';

import {
  Panel, ResizeMessage, Title, Widget
} from '../../lib/index';


class LogWidget extends Widget {

  messages: string[] = [];

  methods: string[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }

  protected onCloseRequest(msg: Message): void {
    super.onCloseRequest(msg);
    this.methods.push('onCloseRequest');
  }

  protected onResize(msg: ResizeMessage): void {
    super.onResize(msg);
    this.methods.push('onResize');
  }

  protected onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
    this.methods.push('onUpdateRequest');
  }

  protected onAfterShow(msg: Message): void {
    super.onAfterShow(msg);
    this.methods.push('onAfterShow');
  }

  protected onBeforeHide(msg: Message): void {
    super.onBeforeHide(msg);
    this.methods.push('onBeforeHide');
  }

  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.methods.push('onAfterAttach');
  }

  protected onBeforeDetach(msg: Message): void {
    super.onBeforeDetach(msg);
    this.methods.push('onBeforeDetach');
  }
}


class LogPanel extends Panel {

  messages: string[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }
}


describe('phosphor-widget', () => {

  describe('Widget', () => {

    describe('.MsgUpdateRequest', () => {

      it('should be a `Message` instance', () => {
        expect(Widget.MsgUpdateRequest instanceof Message).to.be(true);
      });

      it('should have a `type` of `update-request`', () => {
        expect(Widget.MsgUpdateRequest.type).to.be('update-request');
      });

    });

    describe('.MsgCloseRequest', () => {

      it('should be a `Message` instance', () => {
        expect(Widget.MsgCloseRequest instanceof Message).to.be(true);
      });

      it('should have a `type` of `close-request`', () => {
        expect(Widget.MsgCloseRequest.type).to.be('close-request');
      });

    });

    describe('.MsgAfterShow', () => {

      it('should be a `Message` instance', () => {
        expect(Widget.MsgAfterShow instanceof Message).to.be(true);
      });

      it('should have a `type` of `after-show`', () => {
        expect(Widget.MsgAfterShow.type).to.be('after-show');
      });

    });

    describe('.MsgBeforeHide', () => {

      it('should be a `Message` instance', () => {
        expect(Widget.MsgBeforeHide instanceof Message).to.be(true);
      });

      it('should have a `type` of `before-hide`', () => {
        expect(Widget.MsgBeforeHide.type).to.be('before-hide');
      });

    });

    describe('.MsgAfterAttach', () => {

      it('should be a `Message` instance', () => {
        expect(Widget.MsgAfterAttach instanceof Message).to.be(true);
      });

      it('should have a `type` of `after-attach`', () => {
        expect(Widget.MsgAfterAttach.type).to.be('after-attach');
      });

    });

    describe('.MsgBeforeDetach', () => {

      it('should be a `Message` instance', () => {
        expect(Widget.MsgBeforeDetach instanceof Message).to.be(true);
      });

      it('should have a `type` of `before-detach`', () => {
        expect(Widget.MsgBeforeDetach.type).to.be('before-detach');
      });

    });

    describe('.attach()', () => {

      it('should attach a root widget to a host', () => {
        let widget = new Widget();
        expect(widget.isAttached).to.be(false);
        Widget.attach(widget, document.body);
        expect(widget.isAttached).to.be(true);
      });

      it('should throw if the widget is not a root', () => {
        let panel = new Panel();
        let child = new Widget();
        child.parent = panel;
        expect(() => Widget.attach(child, document.body)).to.throwError();
      });

      it('should throw if the widget is already attached', () => {
        let widget = new Widget();
        Widget.attach(widget, document.body);
        expect(() => Widget.attach(widget, document.body)).to.throwError();
      });

      it('should throw if the host is not attached to the DOM', () => {
        let widget = new Widget();
        let host = document.createElement('div');
        expect(() => Widget.attach(widget, host)).to.throwError();
      });

      it('should dispatch an `after-attach` message', () => {
        let widget = new LogWidget();
        expect(widget.isAttached).to.be(false);
        expect(widget.messages.indexOf('after-attach')).to.be(-1);
        Widget.attach(widget, document.body);
        expect(widget.isAttached).to.be(true);
        expect(widget.messages.indexOf('after-attach')).to.not.be(-1);
      });

    });

    describe('.detach()', () => {

      it('should detach a root widget from its host', () => {
        let widget = new Widget();
        Widget.attach(widget, document.body);
        expect(widget.isAttached).to.be(true);
        Widget.detach(widget);
        expect(widget.isAttached).to.be(false);
      });

      it('should throw if the widget is not a root', () => {
        let panel = new Panel();
        let child = new Widget();
        child.parent = panel;
        Widget.attach(panel, document.body);
        expect(() => { Widget.detach(child); }).to.throwError();
      });

      it('should throw if the widget is not attached', () => {
        let widget = new Widget();
        expect(() => { Widget.detach(widget); }).to.throwError();
      });

      it('should dispatch a `before-detach` message', () => {
        let widget = new LogWidget();
        Widget.attach(widget, document.body);
        widget.messages = []
        Widget.detach(widget);
        expect(widget.messages[0]).to.be('before-detach');
      });

    });

    describe('.disposedSignal', () => {

      it('should be a signal', () => {
        expect(Widget.disposedSignal instanceof Signal).to.be(true);
      });

    });

    describe('.hiddenProperty', () => {

      it('should be a property descriptor', () => {
        expect(Widget.hiddenProperty instanceof Property).to.be(true);
      });

      it('should default to `false`', () => {
        let widget = new Widget();
        expect(Widget.hiddenProperty.get(widget)).to.be(false);
      });

      it('should toggle the presence of `p-mod-hidden`', () => {
        let widget = new Widget();
        expect(widget.hasClass('p-mod-hidden')).to.be(false);
        Widget.hiddenProperty.set(widget, true);
        expect(widget.hasClass('p-mod-hidden')).to.be(true);
      });

      it('should dispatch an `after-show` message', () => {
        let widget = new LogWidget();
        Widget.hiddenProperty.set(widget, true);
        Widget.attach(widget, document.body);
        expect(widget.messages.indexOf('after-show')).to.be(-1);
        Widget.hiddenProperty.set(widget, false);
        expect(widget.messages.indexOf('after-show')).to.not.be(-1);
        Widget.detach(widget);
      });

      it('should dispatch a `before-hide` message', () => {
        let widget = new LogWidget();
        expect(widget.messages.indexOf('before-hide')).to.be(-1);
        Widget.attach(widget, document.body);
        Widget.hiddenProperty.set(widget, true);
        expect(widget.messages.indexOf('before-hide')).to.not.be(-1);
        Widget.detach(widget);
      });

      it('should dispatch an `child-shown` message to the parent', () => {
        let panel = new LogPanel();
        let child = new Widget();
        child.parent = panel;
        Widget.hiddenProperty.set(child, true);
        panel.messages = [];
        Widget.hiddenProperty.set(child, false);
        expect(panel.messages[0]).to.be('child-shown');
      });

      it('should dispatch a `child-hidden` message to the parent', () => {
        let panel = new LogPanel();
        let child = new Widget();
        child.parent = panel;
        panel.messages = [];
        Widget.hiddenProperty.set(child, true);
        expect(panel.messages[0]).to.be('child-hidden');
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        let widget = new Widget();
        expect(widget instanceof Widget).to.be(true);
      });

      it('should add the `p-Widget` class', () => {
        let widget = new Widget();
        expect(widget.hasClass('p-Widget')).to.be(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the widget', () => {
        let widget = new Widget();
        widget.dispose();
        expect(widget.isDisposed).to.be(true);
      });

      it('should be a no-op if the widget already disposed', () => {
        let called = false;
        let widget = new Widget();
        widget.dispose();
        widget.disposed.connect(() => called = true);
        widget.dispose();
        expect(called).to.be(false);
        expect(widget.isDisposed).to.be(true);
      });

      it('should dispose of the widget descendants', () => {
        let panel = new Panel();
        let child = new Widget();
        child.parent = panel;
        panel.dispose();
        expect(child.isDisposed).to.be(true);
        expect(panel.children.length).to.be(0);
      });

      it('should remove the widget from its parent', () => {
        let panel = new Panel();
        let child = new Widget();
        child.parent = panel;
        child.dispose();
        expect(panel.isDisposed).to.be(false);
        expect(child.isDisposed).to.be(true);
        expect(child.parent).to.be(null);
        expect(panel.children.length).to.be(0);
      });

      it('should automatically detach the widget', () => {
        let widget = new Widget();
        Widget.attach(widget, document.body);
        expect(widget.isAttached).to.be(true);
        widget.dispose();
        expect(widget.isAttached).to.be(false);
      });

    });

    describe('#disposed', () => {

      it('should be emitted when the widget is disposed', () => {
        let called = false;
        let widget = new Widget();
        widget.disposed.connect(() => { called = true; });
        widget.dispose();
        expect(called).to.be(true);
      });

    });

    describe('#isAttached', () => {

      it('should be `true` if the widget is attached', () => {
        let widget = new Widget();
        Widget.attach(widget, document.body);
        expect(widget.isAttached).to.be(true);
      });

      it('should be `false` if the widget is not attached', () => {
        let widget = new Widget();
        expect(widget.isAttached).to.be(false);
      });

    });

    describe('#isDisposed', () => {

      it('should be `true` if the widget is disposed', () => {
        let widget = new Widget();
        widget.dispose();
        expect(widget.isDisposed).to.be(true);
      });

      it('should be `false` if the widget is not disposed', () => {
        let widget = new Widget();
        expect(widget.isDisposed).to.be(false);
      });

    });

    describe('#isVisible', () => {

      it('should be `true` if the widget is visible', () => {
        let widget = new Widget();
        Widget.attach(widget, document.body);
        expect(widget.isVisible).to.be(true);
      });

      it('should be `false` if the widget is not visible', () => {
        let widget = new Widget();
        Widget.attach(widget, document.body);
        widget.hidden = true;
        expect(widget.isVisible).to.be(false);
      });

      it('should be `false` if the widget is not attached', () => {
        let widget = new Widget();
        expect(widget.isVisible).to.be(false);
      });

    });

    describe('#hidden', () => {

      it('should be `true` if the widget is hidden', () => {
        let widget = new Widget();
        Widget.attach(widget, document.body);
        widget.hidden = true;
        expect(widget.hidden).to.be(true);
      });

      it('should be `false` if the widget is not hidden', () => {
        let widget = new Widget();
        Widget.attach(widget, document.body);
        expect(widget.hidden).to.be(false);
      });

      it('should be a pure delegate to the `hiddenProperty`', () => {
        let widget = new Widget();
        widget.hidden = true;
        expect(Widget.hiddenProperty.get(widget)).to.be(true);
        Widget.hiddenProperty.set(widget, false);
        expect(widget.hidden).to.be(false);
      });

    });

    describe('#title', () => {

      it('should be a `Title` instance', () => {
        let widget = new Widget();
        expect(widget.title instanceof Title).to.be(true);
      });

      it('should be a read-only property', () => {
        let widget = new Widget();
        expect(() => { widget.title = null; }).to.throwError();
      });

    });

    describe('#parent', () => {

      it('should be the parent of the widget', () => {
        let panel = new Panel();
        let child = new Widget();
        child.parent = panel;
        expect(child.parent).to.be(panel);
        expect(panel.children.get(0)).to.be(child);
      });

      it('should be `null` if the widget has no parent', () => {
        let widget = new Widget();
        expect(widget.parent).to.be(null);
      });

      it('should unparent the widget when set to `null`', () => {
        let panel = new Panel();
        let child = new Widget();
        child.parent = panel;
        child.parent = null;
        expect(child.parent).to.be(null);
        expect(panel.children.length).to.be(0);
      });

      it('should unparent the widget when set to `undefined`', () => {
        let panel = new Panel();
        let child = new Widget();
        child.parent = panel;
        child.parent = void 0;
        expect(child.parent).to.be(null);
        expect(panel.children.length).to.be(0);
      });

      it('should reparent the widget when set to not `null`', () => {
        let panel1 = new Panel();
        let panel2 = new Panel();
        let child = new Widget();
        child.parent = panel1;
        child.parent = panel2;
        expect(child.parent).to.be(panel2);
        expect(panel1.children.length).to.be(0);
        expect(panel2.children.get(0)).to.be(child);
      });

      it('should be a no-op if the parent does not change', () => {
        let panel = new Panel();
        let child = new Widget();
        child.parent = panel;
        child.parent = panel;
        expect(child.parent).to.be(panel);
        expect(panel.children.get(0)).to.be(child);
      });

      it('should throw an error if the widget is used as its parent', () => {
        let panel = new Panel();
        expect(() => { panel.parent = panel; }).to.throwError();
      });

    });

    describe('#update()', () => {

      it('should post an `update-request` message', (done) => {
        let widget = new LogWidget();
        widget.update();
        expect(widget.messages).to.eql([]);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['update-request']);
          done();
        });
      });

    });

    describe('#close()', () => {

      it('should post a `close-request` message', (done) => {
        let widget = new LogWidget();
        widget.close();
        expect(widget.messages).to.eql([]);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['close-request']);
          done();
        });
      });

    });

    describe('#compressMessage()', () => {

      it('should compress `update-request` messages', (done) => {
        let widget = new LogWidget();
        postMessage(widget, Widget.MsgUpdateRequest);
        postMessage(widget, Widget.MsgUpdateRequest);
        postMessage(widget, Widget.MsgUpdateRequest);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['update-request']);
          done();
        });
      });

      it('should compress `close-request` messages', (done) => {
        let widget = new LogWidget();
        postMessage(widget, Widget.MsgCloseRequest);
        postMessage(widget, Widget.MsgCloseRequest);
        postMessage(widget, Widget.MsgCloseRequest);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['close-request']);
          done();
        });
      });

      it('should not compress other messages', (done) => {
        let widget = new LogWidget();
        let msg = new Message('foo');
        postMessage(widget, msg);
        postMessage(widget, msg);
        postMessage(widget, msg);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['foo', 'foo', 'foo']);
          done();
        });
      });

    });

    describe('#onCloseRequest()', () => {

      it('should be invoked on a `close-request`', () => {
        let widget = new LogWidget();
        sendMessage(widget, Widget.MsgCloseRequest);
        expect(widget.methods[0]).to.be('onCloseRequest');
      });

      context('`msg` parameter', () => {

        it('should have a `type` of `close-request`', () => {
          let widget = new LogWidget();
          sendMessage(widget, Widget.MsgCloseRequest);
          expect(widget.messages[0]).to.be('close-request');
        });

      });

      it('should unparent a child widget by default', () => {
        let panel = new Panel();
        let child = new Widget();
        child.parent = panel;
        sendMessage(child, Widget.MsgCloseRequest);
        expect(child.parent).to.be(null);
        expect(panel.children.length).to.be(0);
      });

      it('should detach a root widget by default', () => {
        let widget = new Widget();
        Widget.attach(widget, document.body);
        sendMessage(widget, Widget.MsgCloseRequest);
        expect(widget.isAttached).to.be(false);
      });

    });

    describe('#onResize()', () => {

      it('should be invoked when the widget is resized', () => {
        let widget = new LogWidget();
        Widget.attach(widget, document.body);
        widget.methods = [];
        sendMessage(widget, ResizeMessage.UnknownSize);
        expect(widget.methods[0]).to.be('onResize');
      });

      context('`msg` parameter', () => {

        it('should have a `type` of `resize`', () => {
          let widget = new LogWidget();
          Widget.attach(widget, document.body);
          widget.messages = [];
          sendMessage(widget, ResizeMessage.UnknownSize);
          expect(widget.messages[0]).to.be('resize');
        });

      });

    });

    describe('#onUpdateRequest()', () => {

      it('should be invoked when an update is requested', () => {
        let widget = new LogWidget();
        sendMessage(widget, Widget.MsgUpdateRequest);
        expect(widget.methods[0]).to.be('onUpdateRequest');
      });

      context('`msg` parameter', () => {

        it('should have a `type` of `update-request`', () => {
          let widget = new LogWidget();
          sendMessage(widget, Widget.MsgUpdateRequest);
          expect(widget.messages[0]).to.be('update-request');
        });

      });

    });

    describe('#onAfterShow()', () => {

      it('should be invoked just after the widget is made visible', () => {
        let widget = new LogWidget();
        Widget.attach(widget, document.body);
        widget.hidden = true;
        widget.hidden = false;
        expect(widget.methods.indexOf('onAfterShow')).to.not.be(-1);
      });

      context('`msg` parameter', () => {

        it('should have a `type` of `after-show`', () => {
          let widget = new LogWidget();
          Widget.attach(widget, document.body);
          widget.hidden = true;
          widget.messages = [];
          widget.hidden = false;
          expect(widget.messages[0]).to.be('after-show');
        });

      });

    });

    describe('#onBeforeHide()', () => {

      it('should be invoked just before the widget is made not-visible', () => {
        let widget = new LogWidget();
        Widget.attach(widget, document.body);
        widget.hidden = true;
        expect(widget.methods.indexOf('onBeforeHide')).to.not.be(-1);
      });

      context('`msg` parameter', () => {

        it('should have a `type` of `before-hide`', () => {
          let widget = new LogWidget();
          Widget.attach(widget, document.body);
          widget.messages = [];
          widget.hidden = true;
          expect(widget.messages[0]).to.be('before-hide');
        });

      });

    });

    describe('#onAfterAttach()', () => {

      it('should be invoked just after the widget is attached', () => {
        let widget = new LogWidget();
        Widget.attach(widget, document.body);
        expect(widget.methods.indexOf('onAfterAttach')).to.not.be(-1);
      });

      context('`msg` parameter', () => {

        it('should have a `type` of `after-attach`', () => {
          let widget = new LogWidget();
          Widget.attach(widget, document.body);
          expect(widget.messages[0]).to.be('after-attach');
        });

      });

    });

    describe('#onBeforeDetach()', () => {

      it('should be invoked just before the widget is detached', () => {
        let widget = new LogWidget();
        Widget.attach(widget, document.body);
        Widget.detach(widget);
        expect(widget.methods.indexOf('onBeforeDetach')).to.not.be(-1);
      });

      context('`msg` parameter', () => {

        it('should have a `type` of `before-detach`', () => {
          let widget = new LogWidget();
          Widget.attach(widget, document.body);
          widget.messages = [];
          Widget.detach(widget);
          expect(widget.messages[0]).to.be('before-detach');
        });

      });

    });

  });

});
