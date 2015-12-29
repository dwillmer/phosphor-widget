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
  Message, sendMessage
} from 'phosphor-messaging';

import {
  AbstractLayout, ChildMessage, ResizeMessage, Widget
} from '../../lib/index';


class LogLayout extends AbstractLayout {

  messages: string[] = [];

  methods: string[] = [];

  constructor(widgets?: Widget[]) {
    super();
    if (widgets) this._children = widgets;
  }

  initialize(): void {
    this.methods.push('initialize');
  };

  childCount(): number {
    return this._children.length;
  }

  childAt(index: number) {
    return this._children[index];
  }

  processParentMessage(msg: Message): void {
    super.processParentMessage(msg);
    this.messages.push(msg.type);
    console.log('***', msg.type);
  }

  protected onResize(msg: ResizeMessage): void {
     super.onResize(msg);
     this.methods.push('onResize');
  }

  protected onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
    this.methods.push('onUpdateRequest');
  }

  protected onChildRemoved(msg: ChildMessage): void {
    arrays.remove(this._children, msg.child);
    this.methods.push('onChildRemoved');
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

  protected onFitRequest(msg: Message): void {
    super.onFitRequest(msg);
    this.methods.push('onFitRequest');
  }

  protected onChildShown(msg: ChildMessage): void {
    super.onChildShown(msg);
    this.methods.push('onChildShown');
  }

  protected onChildHidden(msg: ChildMessage): void {
    super.onChildHidden(msg);
    this.methods.push('onChildHidden');
  }

  private _children: Widget[] = [];
}


class LogWidget extends Widget {

  messages: string[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }

}


describe('phosphor-widget', () => {

  describe('Layout', () => {

    describe('#initialize()', () => {

      it('should be called when the layout is installed on a widget', () => {
        let layout = new LogLayout();
        let widget = new Widget();
        widget.layout = layout;
        expect(layout.methods.indexOf('initialize')).to.not.be(-1);
      });

    });

    describe('#onResize()', () => {

      it('should be invoked when the parent widget is resized', () => {
        let widget = new Widget();
        let layout = new LogLayout();
        widget.layout = layout;
        widget.attach(document.body);
        sendMessage(widget, ResizeMessage.UnknownSize);
        expect(layout.methods.indexOf('onResize')).to.not.be(-1);
        widget.dispose();
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should be invoked when an update is requested on the parent widget', () => {
        let widget = new Widget();
        let layout = new LogLayout();
        widget.layout = layout;
        sendMessage(widget, Widget.MsgUpdateRequest);
        expect(layout.methods.indexOf('onUpdateRequest')).to.not.be(-1);
      });

    });

    describe('#onChildRemoved()', () => {

      it('should be invoked when a child of the parent widget is removed', () => {
        let child = new Widget();
        let parent = new Widget();
        let layout = new LogLayout();
        parent.layout = layout;
        child.parent = parent;
        child.parent = null;
        expect(layout.methods.indexOf('onChildRemoved')).to.not.be(-1);
      });

    });

    describe('#onAfterAttach()', () => {

      it('should be invoked just after the parent widget is attached', () => {
        let widget = new Widget();
        let layout = new LogLayout();
        widget.layout = layout;
        widget.attach(document.body);
        expect(layout.methods.indexOf('onAfterAttach')).to.not.be(-1);
        widget.dispose();
      });

    });

    describe('#onBeforeDetach()', () => {

      it('should be invoked just before the parent widget is detached', () => {
        let widget = new Widget();
        let layout = new LogLayout();
        widget.layout = layout;
        widget.attach(document.body);
        widget.detach();
        expect(layout.methods.indexOf('onBeforeDetach')).to.not.be(-1);
      });

    });

    describe('#onAfterShow()', () => {

      it('should be invoked just after the parent widget is made visible', () => {
        let widget = new Widget();
        let layout = new LogLayout();
        widget.layout = layout;
        widget.attach(document.body);
        widget.hide();
        widget.show();
        expect(layout.methods.indexOf('onAfterShow')).to.not.be(-1);
        widget.dispose();
      });

    });

    describe('#onBeforeHide()', () => {

      it('should be invoked just before the parent widget is made not-visible', () => {
        let widget = new Widget();
        let layout = new LogLayout();
        widget.layout = layout;
        widget.attach(document.body);
        widget.hide();
        expect(layout.methods.indexOf('onBeforeHide')).to.not.be(-1);
        widget.dispose();
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the layout', () => {
        let widget = new Widget();
        let layout = new LogLayout();
        widget.layout = layout;
        layout.dispose();
        expect(layout.parent).to.be(null);
      });

    });

    describe('#isDisposed', () => {

      it('should be `true` if the layout is disposed', () => {
        let layout = new LogLayout();
        layout.dispose();
        expect(layout.isDisposed).to.be(true);
      });

      it('should be `false` if the layout is not disposed', () => {
        let layout = new LogLayout();
        expect(layout.isDisposed).to.be(false);
      });

    });

    describe('#parent', () => {

      it('should get the parent widget of the layout', () => {
        let widget = new Widget();
        let layout = new LogLayout();
        expect(layout.parent).to.be(null);
        widget.layout = layout;
        expect(layout.parent).to.be(widget);
      });

      it("should throw an error if not the widget's layout", () => {
        let widget = new Widget();
        let layout = new LogLayout();
        expect(() => { layout.parent = widget; }).to.throwError();
      });

      it('should throw an error if set to `null`', () => {
        let layout = new LogLayout();
        expect(() => { layout.parent = null; }).to.throwError();
      });

      it('should throw an error if trying to change the parent', () => {
        let widget0 = new Widget();
        let widget1 = new Widget();
        let layout = new LogLayout();
        widget0.layout = layout;
        expect(() => { layout.parent = widget1; }).to.throwError();
      });

      it('should be a no-op if the widget is already the parent', () => {
        let widget = new Widget();
        let layout = new LogLayout();
        widget.layout = layout;
        layout.parent = widget;
        expect(layout.parent).to.be(widget);
      });

    });

    describe('#onFitRequest()', () => {

      it('should be called when `fit()` is called on the parent widget', (done) => {
        let widget = new Widget();
        let layout = new LogLayout();
        widget.layout = layout;
        widget.fit();
        expect(layout.messages).to.eql([]);
        requestAnimationFrame(() => {
          expect(layout.messages.indexOf('fit-request')).to.not.be(-1);
          expect(layout.methods.indexOf('onFitRequest')).to.not.be(-1);
          done();
        });
      });

    });

    describe('#onChildShown()', () => {

      it("should be called when one of the parent's children is shown", () => {
        let parent = new Widget();
        let child = new Widget();
        let layout = new LogLayout();
        parent.layout = layout;
        child.parent = parent;
        child.hide();
        child.show();
        expect(layout.messages.indexOf('child-shown')).to.not.be(-1);
        expect(layout.methods.indexOf('onChildShown')).to.not.be(-1);
      });

    });

    describe('#onChildHidden()', () => {

      it("should be called when one of the parent's children is hidden", () => {
        let parent = new Widget();
        let child = new Widget();
        let layout = new LogLayout();
        parent.layout = layout;
        child.parent = parent;
        child.hide();
        expect(layout.messages.indexOf('child-hidden')).to.not.be(-1);
        expect(layout.methods.indexOf('onChildHidden')).to.not.be(-1);
      });
    });

  });

  describe('AbstractLayout', () => {

    describe('#childCount()', () => {

      it('should get the number of child widgets in the layout', () => {
        let layout = new LogLayout();
        expect(layout.childCount()).to.be(0);
      });

    });

    describe('#childAt()', () => {

      it('should get the child widget at the specified index', () => {
        let widgets = [new Widget(), new Widget()];
        let layout = new LogLayout(widgets);
        expect(layout.childAt(0)).to.be(widgets[0]);
      });

      it('should return `undefined` if no widget was found', () => {
        let widgets = [new Widget(), new Widget()];
        let layout = new LogLayout(widgets);
        expect(layout.childAt(2)).to.be(void 0);
      });

    });

    describe('#childIndex()', () => {

      it('should get the index of the specified child widget', () => {
        let widgets = [new Widget(), new Widget()];
        let layout = new LogLayout(widgets);
        expect(layout.childIndex(widgets[1])).to.be(1);
      });

      it('should return `-1` if the widget was not found', () => {
        let widgets = [new Widget(), new Widget()];
        let layout = new LogLayout(widgets);
        expect(layout.childIndex(new Widget())).to.be(-1);
      });

    });

    describe('#onResize()', () => {

      it('should send a resize message to all children', () => {
        let parent = new Widget();
        let widgets = [new LogWidget(), new LogWidget()];
        let layout = new LogLayout(widgets);
        parent.layout = layout;
        parent.attach(document.body);
        sendMessage(parent, ResizeMessage.UnknownSize);
        expect(widgets[0].messages.indexOf('resize')).to.not.be(-1);
        expect(widgets[1].messages.indexOf('resize')).to.not.be(-1);
        parent.dispose();
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should send a resize message to all children', () => {
        let parent = new Widget();
        let widgets = [new LogWidget(), new LogWidget()];
        let layout = new LogLayout(widgets);
        parent.layout = layout;
        sendMessage(parent, Widget.MsgUpdateRequest);
        expect(widgets[0].messages.indexOf('resize')).to.not.be(-1);
        expect(widgets[1].messages.indexOf('resize')).to.not.be(-1);
        parent.dispose();
      });

    });

     describe('#onAfterAttach()', () => {

      it('should send the message to all children', () => {
        let parent = new Widget();
        let widgets = [new LogWidget(), new LogWidget()];
        let layout = new LogLayout(widgets);
        parent.layout = layout;
        parent.attach(document.body);
        expect(widgets[0].messages.indexOf('after-attach')).to.not.be(-1);
        expect(widgets[1].messages.indexOf('after-attach')).to.not.be(-1);
        parent.dispose();
      });

    });

    describe('#onBeforeDetach()', () => {

      it('should send the message to all children', () => {
        let parent = new Widget();
        let widgets = [new LogWidget(), new LogWidget()];
        let layout = new LogLayout(widgets);
        parent.layout = layout;
        parent.attach(document.body);
        parent.detach();
        expect(widgets[0].messages.indexOf('before-detach')).to.not.be(-1);
        expect(widgets[1].messages.indexOf('before-detach')).to.not.be(-1);
        parent.dispose();
      });

    });

    describe('#onAfterShow()', () => {

      it('should send the message to all children', () => {
        let parent = new Widget();
        let widgets = [new LogWidget(), new LogWidget()];
        let layout = new LogLayout(widgets);
        parent.layout = layout;
        parent.attach(document.body);
        parent.hide();
        parent.show();
        expect(widgets[0].messages.indexOf('after-show')).to.not.be(-1);
        expect(widgets[1].messages.indexOf('after-show')).to.not.be(-1);
        parent.dispose();
      });

    });

    describe('#onBeforeHide()', () => {

      it('should send the message to all children', () => {
        let parent = new Widget();
        let widgets = [new LogWidget(), new LogWidget()];
        let layout = new LogLayout(widgets);
        parent.layout = layout;
        parent.attach(document.body);
        parent.hide();
        expect(widgets[0].messages.indexOf('before-hide')).to.not.be(-1);
        expect(widgets[1].messages.indexOf('before-hide')).to.not.be(-1);
        parent.dispose();
      });

    });

  });

});
