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
  Message, sendMessage
} from 'phosphor-messaging';

import {
  AbstractPanel, ChildIndexMessage, Panel, ResizeMessage, Widget
} from '../../lib/index';


class LogWidget extends Widget {

  messages: string[] = [];

  raw: Message[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
    this.raw.push(msg);
  }
}


class SimplePanel extends AbstractPanel {

  constructor() {
    super();
    let w1 = new LogWidget();
    let w2 = new LogWidget();
    this.adoptChild(w1);
    this.adoptChild(w2);
    this._children = [w1, w2];
  }

  childCount(): number {
    return this._children.length;
  }

  childAt(index: number): Widget {
    return this._children[index];
  }

  children(): LogWidget[] {
    return this._children.slice();
  }

  protected removeChild(child: Widget): void {
    let i = this._children.indexOf(child as LogWidget);
    this._children.splice(i, 1);
  }

  protected disposeChildren(): void {
    while (this._children.length > 0) {
      this._children.pop().dispose();
    }
  }

  private _children: LogWidget[];
}


class LogPanel extends Panel {

  messages: string[] = [];

  methods: string[] = [];

  raw: Message[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
    this.raw.push(msg);
  }

  protected onChildAdded(msg: ChildIndexMessage): void {
    super.onChildAdded(msg);
    this.methods.push('onChildAdded');
  }

  protected onChildMoved(msg: ChildIndexMessage): void {
    super.onChildMoved(msg);
    this.methods.push('onChildMoved');
  }

  protected onChildRemoved(msg: ChildIndexMessage): void {
    super.onChildRemoved(msg);
    this.methods.push('onChildRemoved');
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


describe('phosphor-widget', () => {

  describe('AbstractPanel', () => {

    describe('#onResize()', () => {

      it('should dispatch `ResizeMessage.UnknownSize` to the children', () => {
        let panel = new SimplePanel();
        let children = panel.children();
        children[0].raw = [];
        children[1].raw = [];
        sendMessage(panel, ResizeMessage.UnknownSize);
        expect(children[0].raw[0]).to.eql(ResizeMessage.UnknownSize);
        expect(children[1].raw[0]).to.eql(ResizeMessage.UnknownSize);
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should dispatch `ResizeMessage.UnknownSize` to the children', () => {
        let panel = new SimplePanel();
        let children = panel.children();
        children[0].raw = [];
        children[1].raw = [];
        sendMessage(panel, Widget.MsgUpdateRequest);
        expect(children[0].raw[0]).to.eql(ResizeMessage.UnknownSize);
        expect(children[1].raw[0]).to.eql(ResizeMessage.UnknownSize);
      });

    });

    describe('#onAfterShow()', () => {

      it('should propagate `after-show` to all non-hidden children', () => {
        let panel = new SimplePanel();
        let children = panel.children();
        panel.hidden = true;
        children[0].hidden = true;
        panel.attach(document.body);
        panel.hidden = false;
        expect(children[0].messages).to.not.contain('after-show');
        expect(children[1].messages).to.contain('after-show');
        children[0].hidden = false;
        expect(children[0].messages).to.contain('after-show');
        panel.dispose();
      });

    });

    describe('#onBeforeHide()', () => {

      it('should propagate `before-hide` to all non-hidden children', () => {
        let panel = new SimplePanel();
        let children = panel.children();
        children[0].hidden = true;
        panel.attach(document.body);
        panel.hidden = true;
        expect(children[0].messages).to.not.contain('before-hide');
        expect(children[1].messages).to.contain('before-hide');
        panel.dispose();
      });

    });

    describe('#onAfterAttach()', () => {

      it('should propagate `after-attach` to all children', () => {
        let panel = new SimplePanel();
        let children = panel.children();
        panel.attach(document.body);
        expect(children[0].messages).to.contain('after-attach');
        expect(children[1].messages).to.contain('after-attach');
        panel.dispose();
      });

    });

    describe('#onBeforeDetach()', () => {

      it('should propagate `before-detach` to all children', () => {
        let panel = new SimplePanel();
        let children = panel.children();
        panel.attach(document.body);
        panel.detach();
        expect(children[0].messages).to.contain('before-detach');
        expect(children[1].messages).to.contain('before-detach');
        panel.dispose();
      });

    });

    context('state propagation', () => {

      it('should propagate `isAttached` state to all descendants', () => {
        let panel = new SimplePanel();
        let children = panel.children();
        expect(children[0].isAttached).to.be(false);
        expect(children[1].isAttached).to.be(false);
        panel.attach(document.body);
        expect(children[0].isAttached).to.be(true);
        expect(children[1].isAttached).to.be(true);
        panel.dispose();
      });

      it('should propagate `isVisible` state to all non-hidden descendants', () => {
        let panel = new SimplePanel();
        let children = panel.children();
        children[0].hidden = true;
        expect(children[0].isVisible).to.be(false);
        expect(children[1].isVisible).to.be(false);
        panel.attach(document.body);
        expect(children[0].isVisible).to.be(false);
        expect(children[1].isVisible).to.be(true);
        panel.hidden = true;
        expect(children[0].isVisible).to.be(false);
        expect(children[1].isVisible).to.be(false);
        children[0].hidden = false;
        panel.hidden = false;
        expect(children[0].isVisible).to.be(true);
        expect(children[1].isVisible).to.be(true);
        panel.dispose();
      });

    });

  });

  describe('Panel', () => {

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        let panel = new Panel();
        expect(panel instanceof Panel).to.be(true);
      });

      it('should add the `p-Panel` class', () => {
        let panel = new Panel();
        expect(panel.hasClass('p-Panel')).to.be(true);
      });

    });

    describe('#childCount()', () => {

      it('should reflect the number of children', () => {
        let panel = new Panel();
        expect(panel.childCount()).to.be(0);
        panel.addChild(new Widget());
        expect(panel.childCount()).to.be(1);
        panel.insertChild(0, new Widget());
        expect(panel.childCount()).to.be(2);
        panel.childAt(0).remove();
        panel.childAt(0).remove();
        expect(panel.childCount()).to.be(0);
      });

    });

    describe('#childAt()', () => {

      it('should return the child at the given index', () => {
        let panel = new Panel();
        let child0 = new Widget();
        let child1 = new Widget();
        let child2 = new Widget();
        let child3 = new Widget();
        panel.addChild(child0);
        panel.addChild(child1);
        panel.addChild(child2);
        panel.addChild(child3);
        expect(panel.childAt(0)).to.be(child0);
        expect(panel.childAt(1)).to.be(child1);
        expect(panel.childAt(2)).to.be(child2);
        expect(panel.childAt(3)).to.be(child3);
      });

      it('should return `undefined` if the index is out of range', () => {
        let panel = new Panel();
        let child0 = new Widget();
        let child1 = new Widget();
        let child2 = new Widget();
        let child3 = new Widget();
        panel.addChild(child0);
        panel.addChild(child1);
        panel.addChild(child2);
        panel.addChild(child3);
        expect(panel.childAt(100)).to.be(void 0);
      });

    });

    describe('#addChild()', () => {

      it('should add a new child to the end of the list', () => {
        let panel = new Panel();
        let child0 = new Widget();
        let child1 = new Widget();
        let child2 = new Widget();
        expect(panel.childCount()).to.be(0);
        panel.addChild(child0);
        expect(panel.childCount()).to.be(1);
        expect(panel.childAt(0)).to.be(child0);
        panel.addChild(child1);
        expect(panel.childCount()).to.be(2);
        expect(panel.childAt(1)).to.be(child1);
        panel.addChild(child2);
        expect(panel.childCount()).to.be(3);
        expect(panel.childAt(2)).to.be(child2);
      });

      it('should set the parent of the child', () => {
        let panel = new Panel();
        let child = new Widget();
        expect(child.parent).to.be(null);
        panel.addChild(child);
        expect(child.parent).to.be(panel);
      });

      it('should reparent a foreign child', () => {
        let panel0 = new Panel();
        let panel1 = new Panel();
        let child = new Widget();
        expect(child.parent).to.be(null);
        panel0.addChild(child);
        expect(child.parent).to.be(panel0);
        panel1.addChild(child);
        expect(child.parent).to.be(panel1);
      });

      it('should detach a foreign child', () => {
        let panel = new Panel();
        let child = new Widget();
        child.attach(document.body);
        expect(child.parent).to.be(null);
        panel.addChild(child);
        expect(child.parent).to.be(panel);
      });

      it('should move an exisiting child', () => {
        let panel = new Panel();
        let child0 = new Widget();
        let child1 = new Widget();
        let child2 = new Widget();
        panel.insertChild(0, child0);
        panel.insertChild(0, child1);
        panel.insertChild(0, child2);
        panel.insertChild(1, child0);
        expect(panel.childAt(0)).to.be(child2);
        expect(panel.childAt(1)).to.be(child0);
        expect(panel.childAt(2)).to.be(child1);
      });

      it('should throw an error if the child is an ancestor', () => {
        let p1 = new Panel();
        let p2 = new Panel();
        let p3 = new Panel();
        p1.addChild(p2);
        p2.addChild(p3);
        expect(() => { p3.addChild(p1); }).to.throwError();
      });

    });

    describe('#insertChild()', () => {

      it('should insert a new child at the given index', () => {
        let panel = new Panel();
        let child0 = new Widget();
        let child1 = new Widget();
        let child2 = new Widget();
        expect(panel.childCount()).to.be(0);
        panel.insertChild(0, child0);
        expect(panel.childCount()).to.be(1);
        expect(panel.childAt(0)).to.be(child0);
        panel.insertChild(0, child1);
        expect(panel.childCount()).to.be(2);
        expect(panel.childAt(0)).to.be(child1);
        panel.insertChild(1, child2);
        expect(panel.childCount()).to.be(3);
        expect(panel.childAt(1)).to.be(child2);
      });

      it('should set the parent of the child', () => {
        let panel = new Panel();
        let child = new Widget();
        expect(child.parent).to.be(null);
        panel.insertChild(0, child);
        expect(child.parent).to.be(panel);
      });

      it('should reparent a foreign child', () => {
        let panel0 = new Panel();
        let panel1 = new Panel();
        let child = new Widget();
        expect(child.parent).to.be(null);
        panel0.insertChild(0, child);
        expect(child.parent).to.be(panel0);
        panel1.insertChild(0, child);
        expect(child.parent).to.be(panel1);
      });

      it('should detach a foreign child', () => {
        let panel = new Panel();
        let child = new Widget();
        child.attach(document.body);
        expect(child.parent).to.be(null);
        panel.insertChild(0, child);
        expect(child.parent).to.be(panel);
      });

      it('should move an exisiting child', () => {
        let panel = new Panel();
        let child0 = new Widget();
        let child1 = new Widget();
        let child2 = new Widget();
        panel.insertChild(0, child0);
        panel.insertChild(0, child1);
        panel.insertChild(0, child2);
        panel.insertChild(0, child0);
        expect(panel.childAt(0)).to.be(child0);
        expect(panel.childAt(1)).to.be(child2);
        expect(panel.childAt(2)).to.be(child1);
      });

      it('should be a no-op if there is no effective change', () => {
        let panel = new LogPanel();
        let child0 = new Widget();
        let child1 = new Widget();
        let child2 = new Widget();
        panel.insertChild(0, child0);
        panel.insertChild(1, child1);
        panel.insertChild(2, child2);
        panel.methods = [];
        panel.insertChild(1, child1);
        expect(panel.methods.length).to.be(0);
      });

      it('should throw an error if the item is the panel', () => {
        let p1 = new Panel();
        let p2 = new Panel();
        let p3 = new Panel();
        p1.addChild(p2);
        p2.addChild(p3);
        expect(() => { p3.insertChild(0, p1); }).to.throwError();
      });

    });

    describe('#onChildAdded()', () => {

      it('should be invoked when a child is added', () => {
        let child = new Widget();
        let panel = new LogPanel();
        panel.addChild(child);
        expect(panel.methods[0]).to.be('onChildAdded');
      });

      it('should insert the child node at the proper location', () => {
        let child0 = new Widget();
        let child1 = new Widget();
        let panel = new Panel();
        panel.addChild(child0);
        panel.insertChild(0, child1);
        expect(panel.node.firstChild).to.be(child1.node);
        expect(panel.node.lastChild).to.be(child0.node);
      });

      context('`msg` parameter', () => {

        it('should have a `type` of `child-added`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.addChild(child);
          expect(panel.messages[0]).to.be('child-added');
        });

        it('should have the correct `child`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          let panel = new LogPanel();
          panel.addChild(child0);
          panel.raw = [];
          panel.addChild(child1);
          expect((panel.raw[0] as ChildIndexMessage).child).to.be(child1);
        });

        it('should have the correct `currentIndex`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          let panel = new LogPanel();
          panel.addChild(child0);
          expect((panel.raw[0] as ChildIndexMessage).currentIndex).to.be(0);
          panel.raw = [];
          panel.addChild(child1);
          expect((panel.raw[0] as ChildIndexMessage).currentIndex).to.be(1);
        });

        it('should have a `previousIndex` of `-1`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          let panel = new LogPanel();
          panel.addChild(child0);
          expect((panel.raw[0] as ChildIndexMessage).previousIndex).to.be(-1);
          panel.raw = [];
          panel.addChild(child1);
          expect((panel.raw[0] as ChildIndexMessage).previousIndex).to.be(-1);
        });

      });

      context('if the widget is attached', () => {

        it('should send an `after-attach` message to the child', () => {
          let child = new LogWidget();
          let panel = new LogPanel();
          panel.attach(document.body);
          panel.addChild(child);
          expect(child.messages[0]).to.be('after-attach');
          panel.dispose();
        });

      });

    });

    describe('#onChildMoved()', () => {

      it('should be invoked when a child is moved', () => {
        let child0 = new Widget();
        let child1 = new Widget();
        let panel = new LogPanel();
        panel.addChild(child0);
        panel.addChild(child1);
        panel.methods = [];
        panel.addChild(child0);
        expect(panel.methods[0]).to.be('onChildMoved');
      });

      it('should move the child node to the proper location', () => {
        let child0 = new Widget();
        let child1 = new Widget();
        let panel = new LogPanel();
        panel.addChild(child0);
        panel.addChild(child1);
        expect(panel.node.firstChild).to.be(child0.node);
        expect(panel.node.lastChild).to.be(child1.node);
        panel.addChild(child0);
        expect(panel.node.firstChild).to.be(child1.node);
        expect(panel.node.lastChild).to.be(child0.node);
      });

      context('`msg` parameter', () => {

        it('should have a `type` of `child-moved`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          let panel = new LogPanel();
          panel.addChild(child0);
          panel.addChild(child1);
          panel.messages = [];
          panel.addChild(child0);
          expect(panel.messages[0]).to.be('child-moved');
        });

        it('should have the correct `child`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          let panel = new LogPanel();
          panel.addChild(child0);
          panel.addChild(child1);
          panel.raw = [];
          panel.addChild(child0);
          expect((panel.raw[0] as ChildIndexMessage).child).to.be(child0);
        });

        it('should have the correct `currentIndex`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          let panel = new LogPanel();
          panel.addChild(child0);
          panel.addChild(child1);
          panel.raw = [];
          panel.addChild(child0);
          expect((panel.raw[0] as ChildIndexMessage).currentIndex).to.be(1);
        });

        it('should have the correct `previousIndex`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          let panel = new LogPanel();
          panel.addChild(child0);
          panel.addChild(child1);
          panel.raw = [];
          panel.addChild(child0);
          expect((panel.raw[0] as ChildIndexMessage).previousIndex).to.be(0);
        });

      });

      context('if the widget is attached', () => {

        it('should send a `before-detach` message to the child', () => {
          let child0 = new LogWidget();
          let child1 = new LogWidget();
          let panel = new LogPanel();
          panel.addChild(child0);
          panel.addChild(child1);
          panel.attach(document.body);
          child0.messages = [];
          child1.messages = [];
          panel.addChild(child0);
          expect(child0.messages).to.contain('before-detach');
          expect(child1.messages).to.not.contain('before-detach');
          panel.dispose();
        });

        it('should send an `after-attach` message to the child', () => {
          let child0 = new LogWidget();
          let child1 = new LogWidget();
          let panel = new LogPanel();
          panel.addChild(child0);
          panel.addChild(child1);
          panel.attach(document.body);
          child0.messages = [];
          child1.messages = [];
          panel.addChild(child0);
          expect(child0.messages).to.contain('after-attach');
          expect(child1.messages).to.not.contain('after-attach');
          panel.dispose();
        });

      });

    });

    describe('#onChildRemoved()', () => {

      it('should be invoked when a child is removed', () => {
        let child = new Widget();
        let panel = new LogPanel();
        panel.addChild(child);
        child.remove();
        expect(panel.methods[1]).to.be('onChildRemoved');
      });

      it('should remove the node from the parent node', () => {
        let child0 = new Widget();
        let child1 = new Widget();
        let panel = new Panel();
        panel.addChild(child0);
        panel.insertChild(0, child1);
        child0.remove();
        expect(panel.node.firstChild).to.be(child1.node);
        expect(panel.node.lastChild).to.be(child1.node);
      });

      context('`msg` parameter', () => {

        it('should have a `type` of `child-removed`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.addChild(child);
          child.remove();
          expect((panel.raw[1] as ChildIndexMessage).type).to.be('child-removed');
        });

        it('should have the correct `child`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.addChild(child);
          child.remove();
          expect((panel.raw[1] as ChildIndexMessage).child).to.be(child);
        });

        it('should have a `currentIndex` of -1', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.addChild(child);
          child.remove();
          expect((panel.raw[1] as ChildIndexMessage).currentIndex).to.be(-1);
        });

        it('should have the correct `previousIndex`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.addChild(child);
          child.remove();
          expect((panel.raw[1] as ChildIndexMessage).previousIndex).to.be(0);
        });

      });

      context('if the widget is attached', () => {

        it('should send a `before-detach` message to the child', () => {
          let child = new LogWidget();
          let panel = new LogPanel();
          panel.addChild(child);
          panel.attach(document.body);
          child.remove();
          expect(child.messages.indexOf('before-detach')).to.not.be(-1);
          panel.dispose();
        });

      });

    });

  });

  describe('ChildIndexMessage', () => {

    describe('#constructor()', () => {

      it('should accept the message type, child, and indices', () => {
        let widget = new Widget();
        let msg = new ChildIndexMessage('test', widget, -1, -1);
        expect(msg instanceof ChildIndexMessage).to.be(true);
      });

    });

    describe('#currentIndex', () => {

      it('should be the index provided to the constructor', () => {
        let widget = new Widget();
        let msg = new ChildIndexMessage('test', widget, 1, 2);
        expect(msg.currentIndex).to.be(2);
      });

      it('should be a read-only property', () => {
        let widget = new Widget();
        let msg = new ChildIndexMessage('test', widget, 1, 2);
        expect(() => { msg.currentIndex = 1; }).to.throwError();
      });

    });

    describe('#previousIndex', () => {

      it('should be the index provided to the constructor', () => {
        let widget = new Widget();
        let msg = new ChildIndexMessage('test', widget, 2, -1);
        expect(msg.previousIndex).to.be(2);
      });

      it('should be a read-only property', () => {
        let widget = new Widget();
        let msg = new ChildIndexMessage('test', widget, 1, 2);
        expect(() => { msg.previousIndex = 0; }).to.throwError();
      });

    });

  });

});
