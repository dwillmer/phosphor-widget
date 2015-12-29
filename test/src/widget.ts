/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import expect = require('expect.js');

import * as arrays from 'phosphor-arrays';

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
  AbstractLayout, ChildMessage, ResizeMessage, Title, Widget
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

  protected removeChild(child: Widget): void {
    this.methods.push('removeChild');
  }

  protected disposeChildren(): void {
    this.methods.push('disposeChildren');
  }
}


class SimpleLayout extends AbstractLayout {

  initialize(): void { };

  childCount(): number {
    return this._children.length;
  }

  childAt(index: number) {
    return this._children[index];
  }
  protected onChildRemoved(msg: ChildMessage): void {
    arrays.remove(this._children, msg.child);
  }

  private _children: Widget[];
}


describe('phosphor-widget', () => {

  describe('Widget', () => {

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

      it('should remove the widget from its parent', () => {
        let parent = new Widget();
        let child = new Widget();
        child.parent = parent;
        child.dispose();
        expect(parent.isDisposed).to.be(false);
        expect(child.isDisposed).to.be(true);
        expect(child.parent).to.be(null);
      });

      it('should automatically detach the widget', () => {
        let widget = new Widget();
        widget.attach(document.body);
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

    describe('#isAttached', () => {

      it('should be `true` if the widget is attached', () => {
        let widget = new Widget();
        widget.attach(document.body);
        expect(widget.isAttached).to.be(true);
        widget.dispose();
      });

      it('should be `false` if the widget is not attached', () => {
        let widget = new Widget();
        expect(widget.isAttached).to.be(false);
      });

    });

    describe('#isHidden', () => {

      it('should be `true` if the widget is hidden', () => {
        let widget = new Widget();
        widget.attach(document.body);
        widget.hide();
        expect(widget.isHidden).to.be(true);
        widget.dispose();
      });

      it('should be `false` if the widget is not hidden', () => {
        let widget = new Widget();
        widget.attach(document.body);
        expect(widget.isHidden).to.be(false);
        widget.dispose();
      });

    });

    describe('#isVisible', () => {

      it('should be `true` if the widget is visible', () => {
        let widget = new Widget();
        widget.attach(document.body);
        expect(widget.isVisible).to.be(true);
        widget.dispose();
      });

      it('should be `false` if the widget is not visible', () => {
        let widget = new Widget();
        widget.attach(document.body);
        widget.hide();
        expect(widget.isVisible).to.be(false);
        widget.dispose();
      });

      it('should be `false` if the widget is not attached', () => {
        let widget = new Widget();
        expect(widget.isVisible).to.be(false);
      });

    });

    describe('#title', () => {

      it('should get the title data object for the widget', () => {
        let widget = new Widget();
        expect(widget.title instanceof Title).to.be(true);
      });

      it('should be read-only', () => {
        let widget = new Widget();
        let title = new Title();
        expect(() => widget.title = title).to.throwError();
      });

    });

    describe('#parent', () => {

      it('should default to `null`', () => {
        let widget = new Widget();
        expect(widget.parent).to.be(null);
      });

      it('should set the parent and send a `child-added` messagee', () => {
        let child = new Widget();
        let parent = new LogWidget();
        child.parent = parent;
        expect(child.parent).to.be(parent);
        expect(parent.messages.indexOf('child-added')).to.not.be(-1);
      });

      it('should remove itself from the current parent', () => {
        let parent0 = new LogWidget();
        let parent1 = new LogWidget();
        let child = new Widget();
        child.parent = parent0;
        child.parent = parent1;
        expect(parent0.messages.indexOf('child-removed')).to.not.be(-1);
        expect(parent1.messages.indexOf('child-added')).to.not.be(-1);
      });

      it('should be a no-op if there is no parent change', () => {
        let parent = new LogWidget();
        let child = new Widget();
        child.parent = parent;
        child.parent = parent;
        expect(parent.messages.indexOf('child-removed')).to.be(-1);
      });

    });

    describe('#layout', () => {

      it('should default to `null`', () => {
        let widget = new Widget();
        expect(widget.layout).to.be(null);
      });

      it('should set the layout for the widget', () => {
        let widget = new Widget();
        let layout = new SimpleLayout();
        widget.layout = layout;
        expect(widget.layout).to.be(layout);
      });

      it('should throw error if set to `null`', () => {
        let widget = new Widget();
        expect(() => { widget.layout = null; }).to.throwError();
      });

      it('should be single-use only', () => {
        let widget = new Widget();
        widget.layout = new SimpleLayout();
        expect(() => { widget.layout = new SimpleLayout(); }).to.throwError();
      });

      it('should be disposed when the widget is disposed', () => {
        let widget = new Widget();
        let layout = new SimpleLayout();
        widget.layout = layout;
        widget.dispose();
        expect(layout.isDisposed).to.be(true);
      });

    });

    describe('#contains()', () => {

      it('should return `true` if the widget is a descendant', () => {
        let p1 = new Widget();
        let p2 = new Widget();
        let p3 = new Widget();
        let w1 = new Widget();
        let w2 = new Widget();
        p2.parent = p1;
        p3.parent = p2;
        w1.parent = p2;
        w2.parent = p3;
        expect(p1.contains(p1)).to.be(true);
        expect(p1.contains(p2)).to.be(true);
        expect(p1.contains(p3)).to.be(true);
        expect(p1.contains(w1)).to.be(true);
        expect(p1.contains(w2)).to.be(true);
        expect(p2.contains(p2)).to.be(true);
        expect(p2.contains(p3)).to.be(true);
        expect(p2.contains(w1)).to.be(true);
        expect(p2.contains(w2)).to.be(true);
        expect(p3.contains(p3)).to.be(true);
        expect(p3.contains(w2)).to.be(true);
      });

      it('should return `false` if the widget is not a descendant', () => {
        let p1 = new Widget();
        let p2 = new Widget();
        let p3 = new Widget();
        let w1 = new Widget();
        let w2 = new Widget();
        p2.parent = p1;
        p3.parent = p2;
        w1.parent = p2;
        w2.parent = p3;
        expect(p2.contains(p1)).to.be(false);
        expect(p3.contains(p1)).to.be(false);
        expect(p3.contains(p2)).to.be(false);
        expect(p3.contains(w1)).to.be(false);
        expect(w1.contains(p1)).to.be(false);
        expect(w1.contains(p2)).to.be(false);
        expect(w1.contains(p3)).to.be(false);
        expect(w1.contains(w2)).to.be(false);
        expect(w2.contains(p1)).to.be(false);
        expect(w2.contains(p2)).to.be(false);
        expect(w2.contains(p3)).to.be(false);
        expect(w2.contains(w1)).to.be(false);
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

    describe('#fit()', () => {

      it('should post a `fit-request` message to the widget', (done) => {
        let widget = new LogWidget();
        widget.fit();
        expect(widget.messages).to.eql([]);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['fit-request']);
          done();
        });
      });

    });

    describe('#close()', () => {

      it('should send a `close-request` message', () => {
        let widget = new LogWidget();
        expect(widget.messages).to.eql([]);
        widget.close();
        expect(widget.messages).to.eql(['close-request']);
      });

    });

    describe('#show()', () => {

      it('should set `isHidden` to `false`', () => {
        let widget = new Widget();
        widget.hide();
        expect(widget.isHidden).to.be(true);
        widget.show();
        expect(widget.isHidden).to.be(false);
      });

      it('should send an `after-show` message if applicable', () => {
        let widget = new LogWidget();
        widget.hide();
        widget.attach(document.body);
        widget.show();
        expect(widget.messages.indexOf('after-show')).to.not.be(-1);
        widget.dispose();
      });

      it('should send a `child-shown` message to the parent', () => {
        let parent = new LogWidget();
        let child = new Widget();
        child.parent = parent;
        child.hide();
        child.show();
        expect(parent.messages.indexOf('child-shown')).to.not.be(-1);
      });

      it('should be a no-op if not hidden', () => {
        let widget = new LogWidget();
        widget.attach(document.body);
        widget.show();
        expect(widget.messages.indexOf('after-show')).to.be(-1);
        widget.dispose();
      });

    });

    describe('#hide()', () => {

      it('should hide the widget', () => {
        let widget = new Widget();
        widget.hide();
        expect(widget.isHidden).to.be(true);
      });

      it('should send a `before-hide` message if applicable', () => {
        let widget = new LogWidget();
        widget.attach(document.body);
        widget.hide();
        expect(widget.messages.indexOf('before-hide')).to.not.be(-1);
        widget.dispose();
      });

      it('should send a `child-hidden` message to the parent', () => {
        let parent = new LogWidget();
        let child = new Widget();
        child.parent = parent;
        child.hide();
        expect(parent.messages.indexOf('child-hidden')).to.not.be(-1);
      });

      it('should be a no-op if already hidden', () => {
        let widget = new LogWidget();
        widget.hide();
        widget.attach(document.body);
        widget.hide();
        expect(widget.messages.indexOf('before-hide')).to.be(-1);
        widget.dispose();
      });

    });

    describe('#setHidden()', () => {

      it('should call hide if `hidden = True`', () => {
        let widget = new LogWidget();
        widget.attach(document.body);
        widget.setHidden(true);
        expect(widget.isHidden).to.be(true);
        expect(widget.messages.indexOf('before-hide')).to.not.be(-1);
        widget.dispose();
      });

      it('should call show if `hidden = False`', () => {
        let widget = new LogWidget();
        widget.hide();
        widget.attach(document.body);
        widget.setHidden(false);
        expect(widget.isHidden).to.be(false);
        expect(widget.messages.indexOf('after-show')).to.not.be(-1);
        widget.dispose();
      });

    });

    describe('#attach()', () => {

      it('should attach a root widget to a host', () => {
        let widget = new Widget();
        expect(widget.isAttached).to.be(false);
        widget.attach(document.body);
        expect(widget.isAttached).to.be(true);
        widget.dispose();
      });

      it('should throw if the widget is not a root', () => {
        let parent = new Widget();
        let child = new Widget();
        child.parent = parent;
        expect(() => { child.attach(document.body); }).to.throwError();
      });

      it('should throw if the widget is already attached', () => {
        let widget = new Widget();
        widget.attach(document.body);
        expect(() => { widget.attach(document.body); }).to.throwError();
        widget.dispose();
      });

      it('should throw if the host is not attached to the DOM', () => {
        let widget = new Widget();
        let host = document.createElement('div');
        expect(() => { widget.attach(host); }).to.throwError();
      });

      it('should dispatch an `after-attach` message', () => {
        let widget = new LogWidget();
        expect(widget.isAttached).to.be(false);
        expect(widget.messages.indexOf('after-attach')).to.be(-1);
        widget.attach(document.body);
        expect(widget.isAttached).to.be(true);
        expect(widget.messages.indexOf('after-attach')).to.not.be(-1);
        widget.dispose();
      });

    });

    describe('#detach()', () => {

      it('should detach a root widget from its host', () => {
        let widget = new Widget();
        widget.attach(document.body);
        expect(widget.isAttached).to.be(true);
        widget.detach();
        expect(widget.isAttached).to.be(false);
        widget.dispose();
      });

      it('should throw if the widget is not a root', () => {
        let parent = new Widget();
        let child = new Widget();
        child.parent = parent;
        parent.attach(document.body);
        expect(() => { child.detach(); }).to.throwError();
        parent.dispose();
      });

      it('should throw if the widget is not attached', () => {
        let widget = new Widget();
        expect(() => { widget.detach(); }).to.throwError();
      });

      it('should dispatch a `before-detach` message', () => {
        let widget = new LogWidget();
        widget.attach(document.body);
        widget.messages = []
        widget.detach();
        expect(widget.messages[0]).to.be('before-detach');
        widget.dispose();
      });

    });

  });

  // describe('Widget', () => {

  //   describe('.MsgUpdateRequest', () => {

  //     it('should be a `Message` instance', () => {
  //       expect(Widget.MsgUpdateRequest instanceof Message).to.be(true);
  //     });

  //     it('should have a `type` of `update-request`', () => {
  //       expect(Widget.MsgUpdateRequest.type).to.be('update-request');
  //     });

  //   });

  //   describe('.MsgLayoutRequest', () => {

  //     it('should be a `Message` instance', () => {
  //       expect(Widget.MsgLayoutRequest instanceof Message).to.be(true);
  //     });

  //     it('should have a `type` of `layout-request`', () => {
  //       expect(Widget.MsgLayoutRequest.type).to.be('layout-request');
  //     });

  //   });

  //   describe('.MsgCloseRequest', () => {

  //     it('should be a `Message` instance', () => {
  //       expect(Widget.MsgCloseRequest instanceof Message).to.be(true);
  //     });

  //     it('should have a `type` of `close-request`', () => {
  //       expect(Widget.MsgCloseRequest.type).to.be('close-request');
  //     });

  //   });

  //   describe('.MsgAfterShow', () => {

  //     it('should be a `Message` instance', () => {
  //       expect(Widget.MsgAfterShow instanceof Message).to.be(true);
  //     });

  //     it('should have a `type` of `after-show`', () => {
  //       expect(Widget.MsgAfterShow.type).to.be('after-show');
  //     });

  //   });

  //   describe('.MsgBeforeHide', () => {

  //     it('should be a `Message` instance', () => {
  //       expect(Widget.MsgBeforeHide instanceof Message).to.be(true);
  //     });

  //     it('should have a `type` of `before-hide`', () => {
  //       expect(Widget.MsgBeforeHide.type).to.be('before-hide');
  //     });

  //   });

  //   describe('.MsgAfterAttach', () => {

  //     it('should be a `Message` instance', () => {
  //       expect(Widget.MsgAfterAttach instanceof Message).to.be(true);
  //     });

  //     it('should have a `type` of `after-attach`', () => {
  //       expect(Widget.MsgAfterAttach.type).to.be('after-attach');
  //     });

  //   });

  //   describe('.MsgBeforeDetach', () => {

  //     it('should be a `Message` instance', () => {
  //       expect(Widget.MsgBeforeDetach instanceof Message).to.be(true);
  //     });

  //     it('should have a `type` of `before-detach`', () => {
  //       expect(Widget.MsgBeforeDetach.type).to.be('before-detach');
  //     });

  //   });

  //   describe('.disposedSignal', () => {

  //     it('should be a signal', () => {
  //       expect(Widget.disposedSignal instanceof Signal).to.be(true);
  //     });

  //   });

  //   describe('.hiddenProperty', () => {

  //     it('should be a property descriptor', () => {
  //       expect(Widget.hiddenProperty instanceof Property).to.be(true);
  //     });

  //     it('should have the name `hidden`', () => {
  //       expect(Widget.hiddenProperty.name).to.be('hidden');
  //     });

  //     it('should default to `false`', () => {
  //       let widget = new Widget();
  //       expect(Widget.hiddenProperty.get(widget)).to.be(false);
  //     });

  //     it('should toggle the presence of `p-mod-hidden`', () => {
  //       let widget = new Widget();
  //       expect(widget.hasClass('p-mod-hidden')).to.be(false);
  //       Widget.hiddenProperty.set(widget, true);
  //       expect(widget.hasClass('p-mod-hidden')).to.be(true);
  //     });

  //     it('should dispatch an `after-show` message', () => {
  //       let widget = new LogWidget();
  //       Widget.hiddenProperty.set(widget, true);
  //       widget.attach(document.body);
  //       expect(widget.messages.indexOf('after-show')).to.be(-1);
  //       Widget.hiddenProperty.set(widget, false);
  //       expect(widget.messages.indexOf('after-show')).to.not.be(-1);
  //       widget.dispose();
  //     });

  //     it('should dispatch a `before-hide` message', () => {
  //       let widget = new LogWidget();
  //       expect(widget.messages.indexOf('before-hide')).to.be(-1);
  //       widget.attach(document.body);
  //       Widget.hiddenProperty.set(widget, true);
  //       expect(widget.messages.indexOf('before-hide')).to.not.be(-1);
  //       widget.dispose();
  //     });

  //     it('should dispatch an `child-shown` message to the parent', () => {
  //       let panel = new LogPanel();
  //       let child = new Widget();
  //       panel.addChild(child);
  //       Widget.hiddenProperty.set(child, true);
  //       panel.messages = [];
  //       Widget.hiddenProperty.set(child, false);
  //       expect(panel.messages[0]).to.be('child-shown');
  //     });

  //     it('should dispatch a `child-hidden` message to the parent', () => {
  //       let panel = new LogPanel();
  //       let child = new Widget();
  //       panel.addChild(child);
  //       panel.messages = [];
  //       Widget.hiddenProperty.set(child, true);
  //       expect(panel.messages[0]).to.be('child-hidden');
  //     });

  //   });

  //   describe('#constructor()', () => {

  //     it('should accept no arguments', () => {
  //       let widget = new Widget();
  //       expect(widget instanceof Widget).to.be(true);
  //     });

  //     it('should add the `p-Widget` class', () => {
  //       let widget = new Widget();
  //       expect(widget.hasClass('p-Widget')).to.be(true);
  //     });

  //   });

  //   describe('#dispose()', () => {

  //     it('should dispose of the widget', () => {
  //       let widget = new Widget();
  //       widget.dispose();
  //       expect(widget.isDisposed).to.be(true);
  //     });

  //     it('should be a no-op if the widget already disposed', () => {
  //       let called = false;
  //       let widget = new Widget();
  //       widget.dispose();
  //       widget.disposed.connect(() => called = true);
  //       widget.dispose();
  //       expect(called).to.be(false);
  //       expect(widget.isDisposed).to.be(true);
  //     });

  //     it('should dispose of the widget descendants', () => {
  //       let panel = new Panel();
  //       let child = new Widget();
  //       panel.addChild(child);
  //       panel.dispose();
  //       expect(child.isDisposed).to.be(true);
  //       expect(panel.childCount()).to.be(0);
  //     });

  //     it('should remove the widget from its parent', () => {
  //       let panel = new Panel();
  //       let child = new Widget();
  //       panel.addChild(child);
  //       child.dispose();
  //       expect(panel.isDisposed).to.be(false);
  //       expect(child.isDisposed).to.be(true);
  //       expect(child.parent).to.be(null);
  //       expect(panel.childCount()).to.be(0);
  //     });

  //     it('should automatically detach the widget', () => {
  //       let widget = new Widget();
  //       widget.attach(document.body);
  //       expect(widget.isAttached).to.be(true);
  //       widget.dispose();
  //       expect(widget.isAttached).to.be(false);
  //     });

  //   });

  //   describe('#disposed', () => {

  //     it('should be emitted when the widget is disposed', () => {
  //       let called = false;
  //       let widget = new Widget();
  //       widget.disposed.connect(() => { called = true; });
  //       widget.dispose();
  //       expect(called).to.be(true);
  //     });

  //   });

  //   describe('#isAttached', () => {

  //     it('should be `true` if the widget is attached', () => {
  //       let widget = new Widget();
  //       widget.attach(document.body);
  //       expect(widget.isAttached).to.be(true);
  //       widget.dispose();
  //     });

  //     it('should be `false` if the widget is not attached', () => {
  //       let widget = new Widget();
  //       expect(widget.isAttached).to.be(false);
  //     });

  //   });

  //   describe('#isDisposed', () => {

  //     it('should be `true` if the widget is disposed', () => {
  //       let widget = new Widget();
  //       widget.dispose();
  //       expect(widget.isDisposed).to.be(true);
  //     });

  //     it('should be `false` if the widget is not disposed', () => {
  //       let widget = new Widget();
  //       expect(widget.isDisposed).to.be(false);
  //     });

  //   });

  //   describe('#isVisible', () => {

  //     it('should be `true` if the widget is visible', () => {
  //       let widget = new Widget();
  //       widget.attach(document.body);
  //       expect(widget.isVisible).to.be(true);
  //       widget.dispose();
  //     });

  //     it('should be `false` if the widget is not visible', () => {
  //       let widget = new Widget();
  //       widget.attach(document.body);
  //       widget.hidden = true;
  //       expect(widget.isVisible).to.be(false);
  //       widget.dispose();
  //     });

  //     it('should be `false` if the widget is not attached', () => {
  //       let widget = new Widget();
  //       expect(widget.isVisible).to.be(false);
  //     });

  //   });

  //   describe('#hidden', () => {

  //     it('should be `true` if the widget is hidden', () => {
  //       let widget = new Widget();
  //       widget.attach(document.body);
  //       widget.hidden = true;
  //       expect(widget.hidden).to.be(true);
  //       widget.dispose();
  //     });

  //     it('should be `false` if the widget is not hidden', () => {
  //       let widget = new Widget();
  //       widget.attach(document.body);
  //       expect(widget.hidden).to.be(false);
  //       widget.dispose();
  //     });

  //     it('should be a pure delegate to the `hiddenProperty`', () => {
  //       let widget = new Widget();
  //       widget.hidden = true;
  //       expect(Widget.hiddenProperty.get(widget)).to.be(true);
  //       Widget.hiddenProperty.set(widget, false);
  //       expect(widget.hidden).to.be(false);
  //     });

  //   });

  //   describe('#parent', () => {

  //     it('should be the parent of the widget', () => {
  //       let panel = new Panel();
  //       let child = new Widget();
  //       panel.addChild(child);
  //       expect(child.parent).to.be(panel);
  //       expect(panel.childAt(0)).to.be(child);
  //     });

  //     it('should be `null` if the widget has no parent', () => {
  //       let widget = new Widget();
  //       expect(widget.parent).to.be(null);
  //     });

  //     it('should be read-only', () => {
  //       let widget = new Widget();
  //       expect(() => { widget.parent = new Widget(); }).to.throwError();
  //     });

  //   });

  //   describe('#remove()', () => {

  //     it('should remove the widget from its parent', () => {
  //       let panel = new Panel();
  //       let child = new Widget();
  //       panel.addChild(child);
  //       expect(child.parent).to.be(panel);
  //       child.remove();
  //       expect(child.parent).to.be(null);
  //       expect(panel.childCount()).to.be(0);
  //     });

  //     it('should be a no-op if the widget does not have a parent', () => {
  //       let child = new Widget();
  //       child.remove();
  //       expect(child.parent).to.be(null);
  //     });

  //   });

  //   describe('#contains()', () => {

  //     it('should return `true` if the widget is a descendant', () => {
  //       let p1 = new Panel();
  //       let p2 = new Panel();
  //       let p3 = new Panel();
  //       let w1 = new Widget();
  //       let w2 = new Widget();
  //       p1.addChild(p2);
  //       p2.addChild(p3);
  //       p2.addChild(w1);
  //       p3.addChild(w2);
  //       expect(p1.contains(p1)).to.be(true);
  //       expect(p1.contains(p2)).to.be(true);
  //       expect(p1.contains(p3)).to.be(true);
  //       expect(p1.contains(w1)).to.be(true);
  //       expect(p1.contains(w2)).to.be(true);
  //       expect(p2.contains(p2)).to.be(true);
  //       expect(p2.contains(p3)).to.be(true);
  //       expect(p2.contains(w1)).to.be(true);
  //       expect(p2.contains(w2)).to.be(true);
  //       expect(p3.contains(p3)).to.be(true);
  //       expect(p3.contains(w2)).to.be(true);
  //     });

  //     it('should return `false` if the widget is not a descendant', () => {
  //       let p1 = new Panel();
  //       let p2 = new Panel();
  //       let p3 = new Panel();
  //       let w1 = new Widget();
  //       let w2 = new Widget();
  //       p1.addChild(p2);
  //       p2.addChild(p3);
  //       p2.addChild(w1);
  //       p3.addChild(w2);
  //       expect(p2.contains(p1)).to.be(false);
  //       expect(p3.contains(p1)).to.be(false);
  //       expect(p3.contains(p2)).to.be(false);
  //       expect(p3.contains(w1)).to.be(false);
  //       expect(w1.contains(p1)).to.be(false);
  //       expect(w1.contains(p2)).to.be(false);
  //       expect(w1.contains(p3)).to.be(false);
  //       expect(w1.contains(w2)).to.be(false);
  //       expect(w2.contains(p1)).to.be(false);
  //       expect(w2.contains(p2)).to.be(false);
  //       expect(w2.contains(p3)).to.be(false);
  //       expect(w2.contains(w1)).to.be(false);
  //     });

  //   });

  //   describe('#update()', () => {

  //     it('should post an `update-request` message', (done) => {
  //       let widget = new LogWidget();
  //       widget.update();
  //       expect(widget.messages).to.eql([]);
  //       requestAnimationFrame(() => {
  //         expect(widget.messages).to.eql(['update-request']);
  //         done();
  //       });
  //     });

  //   });

  //   describe('#close()', () => {

  //     it('should send a `close-request` message', () => {
  //       let widget = new LogWidget();
  //       expect(widget.messages).to.eql([]);
  //       widget.close();
  //       expect(widget.messages).to.eql(['close-request']);
  //     });

  //   });

  //   describe('#attach()', () => {

  //     it('should attach a root widget to a host', () => {
  //       let widget = new Widget();
  //       expect(widget.isAttached).to.be(false);
  //       widget.attach(document.body);
  //       expect(widget.isAttached).to.be(true);
  //       widget.dispose();
  //     });

  //     it('should throw if the widget is not a root', () => {
  //       let panel = new Panel();
  //       let child = new Widget();
  //       panel.addChild(child);
  //       expect(() => { child.attach(document.body); }).to.throwError();
  //     });

  //     it('should throw if the widget is already attached', () => {
  //       let widget = new Widget();
  //       widget.attach(document.body);
  //       expect(() => { widget.attach(document.body); }).to.throwError();
  //       widget.dispose();
  //     });

  //     it('should throw if the host is not attached to the DOM', () => {
  //       let widget = new Widget();
  //       let host = document.createElement('div');
  //       expect(() => { widget.attach(host); }).to.throwError();
  //     });

  //     it('should dispatch an `after-attach` message', () => {
  //       let widget = new LogWidget();
  //       expect(widget.isAttached).to.be(false);
  //       expect(widget.messages.indexOf('after-attach')).to.be(-1);
  //       widget.attach(document.body);
  //       expect(widget.isAttached).to.be(true);
  //       expect(widget.messages.indexOf('after-attach')).to.not.be(-1);
  //       widget.dispose();
  //     });

  //   });

  //   describe('#detach()', () => {

  //     it('should detach a root widget from its host', () => {
  //       let widget = new Widget();
  //       widget.attach(document.body);
  //       expect(widget.isAttached).to.be(true);
  //       widget.detach();
  //       expect(widget.isAttached).to.be(false);
  //       widget.dispose();
  //     });

  //     it('should throw if the widget is not a root', () => {
  //       let panel = new Panel();
  //       let child = new Widget();
  //       panel.addChild(child);
  //       panel.attach(document.body);
  //       expect(() => { child.detach(); }).to.throwError();
  //       panel.dispose();
  //     });

  //     it('should throw if the widget is not attached', () => {
  //       let widget = new Widget();
  //       expect(() => { widget.detach(); }).to.throwError();
  //     });

  //     it('should dispatch a `before-detach` message', () => {
  //       let widget = new LogWidget();
  //       widget.attach(document.body);
  //       widget.messages = []
  //       widget.detach();
  //       expect(widget.messages[0]).to.be('before-detach');
  //       widget.dispose();
  //     });

  //   });

  //   describe('#compressMessage()', () => {

  //     it('should compress `update-request` messages', (done) => {
  //       let widget = new LogWidget();
  //       postMessage(widget, Widget.MsgUpdateRequest);
  //       postMessage(widget, Widget.MsgUpdateRequest);
  //       postMessage(widget, Widget.MsgUpdateRequest);
  //       requestAnimationFrame(() => {
  //         expect(widget.messages).to.eql(['update-request']);
  //         done();
  //       });
  //     });

  //     it('should compress `layout-request` messages', (done) => {
  //       let widget = new LogWidget();
  //       postMessage(widget, Widget.MsgLayoutRequest);
  //       postMessage(widget, Widget.MsgLayoutRequest);
  //       postMessage(widget, Widget.MsgLayoutRequest);
  //       requestAnimationFrame(() => {
  //         expect(widget.messages).to.eql(['layout-request']);
  //         done();
  //       });
  //     });

  //     it('should not compress other messages', (done) => {
  //       let widget = new LogWidget();
  //       let msg = new Message('foo');
  //       postMessage(widget, msg);
  //       postMessage(widget, msg);
  //       postMessage(widget, msg);
  //       requestAnimationFrame(() => {
  //         expect(widget.messages).to.eql(['foo', 'foo', 'foo']);
  //         done();
  //       });
  //     });

  //   });

  //   describe('#adoptChild()', () => {

  //     it('should set the parent of the child', () => {
  //       let log = new LogWidget();
  //       let child = new Widget();
  //       log.adopt(child);
  //       expect(child.parent).to.be(log);
  //     });

  //     it('should remove the child from its old parent', () => {
  //       let panel = new Panel();
  //       let log = new LogWidget();
  //       let child = new Widget();
  //       panel.addChild(child);
  //       expect(child.parent).to.be(panel);
  //       expect(panel.childCount()).to.be(1);
  //       log.adopt(child);
  //       expect(child.parent).to.be(log);
  //       expect(panel.childCount()).to.be(0);
  //     });

  //     it('should throw an error if the child is an ancestor', () => {
  //       let p1 = new Panel();
  //       let p2 = new Panel();
  //       let log = new LogWidget();
  //       p1.addChild(p2);
  //       p2.addChild(log);
  //       expect(() => { log.adopt(p1); }).to.throwError();
  //     });

  //   });

  //   describe('#removeChild()', () => {

  //     it('should be invoked when a child is removed', () => {
  //       let parent = new LogWidget();
  //       let child = new Widget();
  //       parent.adopt(child);
  //       parent.methods = [];
  //       child.remove();
  //       expect(parent.methods).to.contain('removeChild');
  //     });

  //   });

  //   describe('#disposeChildren()', () => {

  //     it('should be invoked during dispose', () => {
  //       let widget = new LogWidget();
  //       widget.dispose();
  //       expect(widget.methods).to.contain('disposeChildren');
  //     });

  //   });

  //   describe('#onCloseRequest()', () => {

  //     it('should be invoked on a `close-request`', () => {
  //       let widget = new LogWidget();
  //       sendMessage(widget, Widget.MsgCloseRequest);
  //       expect(widget.methods[0]).to.be('onCloseRequest');
  //     });

  //     context('`msg` parameter', () => {

  //       it('should have a `type` of `close-request`', () => {
  //         let widget = new LogWidget();
  //         sendMessage(widget, Widget.MsgCloseRequest);
  //         expect(widget.messages[0]).to.be('close-request');
  //       });

  //     });

  //     it('should unparent a child widget by default', () => {
  //       let panel = new Panel();
  //       let child = new Widget();
  //       panel.addChild(child);
  //       sendMessage(child, Widget.MsgCloseRequest);
  //       expect(child.parent).to.be(null);
  //       expect(panel.childCount()).to.be(0);
  //     });

  //     it('should detach a root widget by default', () => {
  //       let widget = new Widget();
  //       widget.attach(document.body);
  //       sendMessage(widget, Widget.MsgCloseRequest);
  //       expect(widget.isAttached).to.be(false);
  //     });

  //   });

  //   describe('#onResize()', () => {

  //     it('should be invoked when the widget is resized', () => {
  //       let widget = new LogWidget();
  //       widget.attach(document.body);
  //       widget.methods = [];
  //       sendMessage(widget, ResizeMessage.UnknownSize);
  //       expect(widget.methods[0]).to.be('onResize');
  //       widget.dispose();
  //     });

  //     context('`msg` parameter', () => {

  //       it('should have a `type` of `resize`', () => {
  //         let widget = new LogWidget();
  //         widget.attach(document.body);
  //         widget.messages = [];
  //         sendMessage(widget, ResizeMessage.UnknownSize);
  //         expect(widget.messages[0]).to.be('resize');
  //         widget.dispose();
  //       });

  //     });

  //   });

  //   describe('#onUpdateRequest()', () => {

  //     it('should be invoked when an update is requested', () => {
  //       let widget = new LogWidget();
  //       sendMessage(widget, Widget.MsgUpdateRequest);
  //       expect(widget.methods[0]).to.be('onUpdateRequest');
  //     });

  //     context('`msg` parameter', () => {

  //       it('should have a `type` of `update-request`', () => {
  //         let widget = new LogWidget();
  //         sendMessage(widget, Widget.MsgUpdateRequest);
  //         expect(widget.messages[0]).to.be('update-request');
  //       });

  //     });

  //   });

  //   describe('#onLayoutRequest()', () => {

  //     it('should be invoked when a layout is requested', () => {
  //       let widget = new LogWidget();
  //       sendMessage(widget, Widget.MsgLayoutRequest);
  //       expect(widget.methods[0]).to.be('onLayoutRequest');
  //     });

  //     context('`msg` parameter', () => {

  //       it('should have a `type` of `layout-request`', () => {
  //         let widget = new LogWidget();
  //         sendMessage(widget, Widget.MsgLayoutRequest);
  //         expect(widget.messages[0]).to.be('layout-request');
  //       });

  //     });

  //   });

  //   describe('#onAfterShow()', () => {

  //     it('should be invoked just after the widget is made visible', () => {
  //       let widget = new LogWidget();
  //       widget.attach(document.body);
  //       widget.hidden = true;
  //       widget.hidden = false;
  //       expect(widget.methods.indexOf('onAfterShow')).to.not.be(-1);
  //       widget.dispose();
  //     });

  //     context('`msg` parameter', () => {

  //       it('should have a `type` of `after-show`', () => {
  //         let widget = new LogWidget();
  //         widget.attach(document.body);
  //         widget.hidden = true;
  //         widget.messages = [];
  //         widget.hidden = false;
  //         expect(widget.messages[0]).to.be('after-show');
  //         widget.dispose();
  //       });

  //     });

  //   });

  //   describe('#onBeforeHide()', () => {

  //     it('should be invoked just before the widget is made not-visible', () => {
  //       let widget = new LogWidget();
  //       widget.attach(document.body);
  //       widget.hidden = true;
  //       expect(widget.methods.indexOf('onBeforeHide')).to.not.be(-1);
  //       widget.dispose();
  //     });

  //     context('`msg` parameter', () => {

  //       it('should have a `type` of `before-hide`', () => {
  //         let widget = new LogWidget();
  //         widget.attach(document.body);
  //         widget.messages = [];
  //         widget.hidden = true;
  //         expect(widget.messages[0]).to.be('before-hide');
  //         widget.dispose();
  //       });

  //     });

  //   });

  //   describe('#onAfterAttach()', () => {

  //     it('should be invoked just after the widget is attached', () => {
  //       let widget = new LogWidget();
  //       widget.attach(document.body);
  //       expect(widget.methods.indexOf('onAfterAttach')).to.not.be(-1);
  //       widget.dispose();
  //     });

  //     context('`msg` parameter', () => {

  //       it('should have a `type` of `after-attach`', () => {
  //         let widget = new LogWidget();
  //         widget.attach(document.body);
  //         expect(widget.messages[0]).to.be('after-attach');
  //         widget.dispose();
  //       });

  //     });

  //   });

  //   describe('#onBeforeDetach()', () => {

  //     it('should be invoked just before the widget is detached', () => {
  //       let widget = new LogWidget();
  //       widget.attach(document.body);
  //       widget.detach();
  //       expect(widget.methods.indexOf('onBeforeDetach')).to.not.be(-1);
  //     });

  //     context('`msg` parameter', () => {

  //       it('should have a `type` of `before-detach`', () => {
  //         let widget = new LogWidget();
  //         widget.attach(document.body);
  //         widget.messages = [];
  //         widget.detach();
  //         expect(widget.messages[0]).to.be('before-detach');
  //       });

  //     });

  //   });

  //   describe('#onChildShown()', () => {

  //     it('should be invoked when a child is unhidden', () => {
  //       let child = new Widget();
  //       let panel = new LogPanel();
  //       panel.addChild(child);
  //       panel.attach(document.body);
  //       panel.hidden = true;
  //       child.hidden = true;
  //       panel.hidden = false;
  //       panel.methods = [];
  //       child.hidden = false;
  //       expect(panel.methods[0]).to.be('onChildShown');
  //       panel.dispose();
  //     });

  //     context('`msg` parameter', () => {

  //       it('should be a `ChildMessage`', () => {
  //         let child = new Widget();
  //         let panel = new LogPanel();
  //         panel.addChild(child);
  //         panel.attach(document.body);
  //         panel.hidden = true;
  //         child.hidden = true;
  //         panel.hidden = false;
  //         panel.raw = [];
  //         child.hidden = false;
  //         expect(panel.raw[0] instanceof ChildMessage).to.be(true);
  //         panel.dispose();
  //       });

  //       it('should have a `type` of `child-shown`', () => {
  //         let child = new Widget();
  //         let panel = new LogPanel();
  //         panel.addChild(child);
  //         panel.attach(document.body);
  //         panel.hidden = true;
  //         child.hidden = true;
  //         panel.hidden = false;
  //         panel.raw = [];
  //         child.hidden = false;
  //         expect(panel.raw[0].type).to.be('child-shown');
  //         panel.dispose();
  //       });

  //       it('should have the correct `child`', () => {
  //         let child = new Widget();
  //         let panel = new LogPanel();
  //         panel.addChild(child);
  //         panel.attach(document.body);
  //         panel.hidden = true;
  //         child.hidden = true;
  //         panel.hidden = false;
  //         panel.raw = [];
  //         child.hidden = false;
  //         expect((panel.raw[0] as ChildMessage).child).to.be(child);
  //         panel.dispose();
  //       });

  //     });

  //   });

  //   describe('#onChildHidden()', () => {

  //     it('should be invoked when a child is hidden', () => {
  //       let child = new Widget();
  //       let panel = new LogPanel();
  //       panel.addChild(child);
  //       panel.methods = [];
  //       child.hidden = true;
  //       expect(panel.methods[0]).to.be('onChildHidden');
  //     });

  //     context('`msg` parameter', () => {

  //       it('should be a `ChildMessage`', () => {
  //         let child = new Widget();
  //         let panel = new LogPanel();
  //         panel.addChild(child);
  //         panel.raw = [];
  //         child.hidden = true;
  //         expect(panel.raw[0] instanceof ChildMessage).to.be(true);
  //       });

  //       it('should have a `type` of `child-hidden`', () => {
  //         let child = new Widget();
  //         let panel = new LogPanel();
  //         panel.addChild(child);
  //         panel.raw = [];
  //         child.hidden = true;
  //         expect((panel.raw[0] as ChildMessage).type).to.be('child-hidden');
  //       });

  //       it('should have the correct `child`', () => {
  //         let child = new Widget();
  //         let panel = new LogPanel();
  //         panel.addChild(child);
  //         panel.raw = [];
  //         child.hidden = true;
  //         expect((panel.raw[0] as ChildMessage).child).to.be(child);
  //       });

  //     });

  //   });

  // });

  // describe('ChildMessage', () => {

  //   describe('#constructor()', () => {

  //     it('should accept the message type and child widget', () => {
  //       let msg = new ChildMessage('test', new Widget());
  //       expect(msg instanceof ChildMessage).to.be(true);
  //     });

  //   });

  //   describe('#child', () => {

  //     it('should be the child passed to the constructor', () => {
  //       let widget = new Widget();
  //       let msg = new ChildMessage('test', widget);
  //       expect(msg.child).to.be(widget);
  //     });

  //     it('should be a read-only property', () => {
  //       let widget0 = new Widget();
  //       let widget1 = new Widget();
  //       let msg = new ChildMessage('test', widget0);
  //       expect(() => { msg.child = widget1; }).to.throwError();
  //     });

  //   });

  // });

  // describe('ResizeMessage', () => {

  //   describe('.UnknownSize', () => {

  //     it('should be a `ResizeMessage`', () => {
  //       let msg = ResizeMessage.UnknownSize;
  //       expect(msg instanceof ResizeMessage).to.be(true);
  //     });

  //     it('should have a `width` of `-1`', () => {
  //       let msg = ResizeMessage.UnknownSize;
  //       expect(msg.width).to.be(-1);
  //     });

  //     it('should have a `height` of `-1`', () => {
  //       let msg = ResizeMessage.UnknownSize;
  //       expect(msg.height).to.be(-1);
  //     });

  //   });

  //   describe('#constructor()', () => {

  //     it('should accept a width and height', () => {
  //       let msg = new ResizeMessage(100, 100);
  //       expect(msg instanceof ResizeMessage).to.be(true);
  //     });

  //   });

  //   describe('#width', () => {

  //     it('should be the width passed to the constructor', () => {
  //       let msg = new ResizeMessage(100, 200);
  //       expect(msg.width).to.be(100);
  //     });

  //     it('should be a read-only property', () => {
  //       let msg = new ResizeMessage(100, 200);
  //       expect(() => { msg.width = 200; }).to.throwError();
  //     });

  //   });

  //   describe('#height', () => {

  //     it('should be the height passed to the constructor', () => {
  //       let msg = new ResizeMessage(100, 200);
  //       expect(msg.height).to.be(200);
  //     });

  //     it('should be a read-only property', () => {
  //       let msg = new ResizeMessage(100, 200);
  //       expect(() => { msg.height = 200; }).to.throwError();
  //     });

  //   });

  // });

});
