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
  IListChangedArgs, ListChangeType
} from 'phosphor-observablelist';

import {
  ChildMessage, IChildWidgetList, Panel, ResizeMessage, Widget
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


class LogPanel extends Panel {

  messages: string[] = [];

  methods: string[] = [];

  raw: Message[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
    this.raw.push(msg);
  }

  protected onChildAdded(msg: ChildMessage): void {
    super.onChildAdded(msg);
    this.methods.push('onChildAdded');
  }

  protected onChildMoved(msg: ChildMessage): void {
    super.onChildMoved(msg);
    this.methods.push('onChildMoved');
  }

  protected onChildRemoved(msg: ChildMessage): void {
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

  protected onLayoutRequest(msg: Message): void {
    super.onLayoutRequest(msg);
    this.methods.push('onLayoutRequest');
  }

  protected onChildShown(msg: ChildMessage): void {
    super.onChildShown(msg);
    this.methods.push('onChildShown');
  }

  protected onChildHidden(msg: ChildMessage): void {
    super.onChildHidden(msg);
    this.methods.push('onChildHidden');
  }
}


function expectEqlItems<T>(a: T[], b: T[]): void {
  expect(a.length).to.be(b.length);
  expect(a.every((v, i) => v === b[i])).to.be(true);
}


function expectEqlNodes(panel: Panel, widgets: Widget[]): void {
  let cNodes = Array.prototype.slice.call(panel.node.childNodes);
  let wNodes = widgets.map(widget => widget.node);
  expectEqlItems(cNodes, wNodes);
}


describe('phosphor-widget', () => {

  describe('Panel', () => {

    describe('.MsgLayoutRequest', () => {

      it('should be a `Message` instance', () => {
        expect(Panel.MsgLayoutRequest instanceof Message).to.be(true);
      });

      it('should have a `type` of `layout-request`', () => {
        expect(Panel.MsgLayoutRequest.type).to.be('layout-request');
      });

    });

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

    describe('#children', () => {

      describe('#isDisposed', () =>  {

        it('should reflect the disposed state of the panel', () => {
          let panel = new Panel();
          let children = panel.children;
          expect(panel.isDisposed).to.be(false);
          expect(children.isDisposed).to.be(false);
          panel.dispose();
          expect(panel.isDisposed).to.be(true);
          expect(children.isDisposed).to.be(true);
          expect(children.parent).to.be(null);
        });

      });

      describe('#parent', () => {

        it('should be the panel which owns the list', () => {
          let panel = new Panel();
          let children = panel.children;
          expect(children.parent).to.be(panel);
        });

        it('should be a read-only property', () => {
          let panel = new Panel();
          let children = panel.children;
          expect(() => { children.parent = null; }).to.throwError();
        });

      });

      describe('#length', () => {

        it('should reflect the number of children', () => {
          let panel = new Panel();
          expect(panel.children.length).to.be(0);
          panel.children.add(new Widget());
          expect(panel.children.length).to.be(1);
          panel.children.insert(0, new Widget());
          expect(panel.children.length).to.be(2);
          panel.children.assign([]);
          expect(panel.children.length).to.be(0);
        });

      });

      describe('#get()', () => {

        it('should return the child at the given index', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.add(child3);
          expect(panel.children.get(0)).to.be(child0);
          expect(panel.children.get(1)).to.be(child1);
          expect(panel.children.get(2)).to.be(child2);
          expect(panel.children.get(3)).to.be(child3);
        });

        it('should support negative indices', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.add(child3);
          expect(panel.children.get(-1)).to.be(child3);
          expect(panel.children.get(-2)).to.be(child2);
          expect(panel.children.get(-3)).to.be(child1);
          expect(panel.children.get(-4)).to.be(child0);
        });

        it('should return `undefined` if the index is out of range', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.add(child3);
          expect(panel.children.get(100)).to.be(void 0);
          expect(panel.children.get(-100)).to.be(void 0);
        });

      });

      describe('#indexOf()', () => {

        it('should return the index of a given child', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.add(child3);
          expect(panel.children.indexOf(child0)).to.be(0);
          expect(panel.children.indexOf(child1)).to.be(1);
          expect(panel.children.indexOf(child2)).to.be(2);
          expect(panel.children.indexOf(child3)).to.be(3);
        });

        it('should return `-1` if the widget is not a child', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          expect(panel.children.indexOf(child0)).to.be(-1);
          expect(panel.children.indexOf(child1)).to.be(-1);
          expect(panel.children.indexOf(child2)).to.be(-1);
          expect(panel.children.indexOf(child3)).to.be(-1);
        });

      });

      describe('#contains()', () => {

        it('should return `true` if the widget is a child', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.add(child3);
          expect(panel.children.contains(child0)).to.be(true);
          expect(panel.children.contains(child1)).to.be(true);
          expect(panel.children.contains(child2)).to.be(true);
          expect(panel.children.contains(child3)).to.be(true);
        });

        it('should return `false` if the widget is not a child', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          expect(panel.children.contains(child0)).to.be(false);
          expect(panel.children.contains(child1)).to.be(false);
          expect(panel.children.contains(child2)).to.be(false);
          expect(panel.children.contains(child3)).to.be(false);
        });

      });

      describe('#slice()', () => {

        it('should return a shallow copy of the children', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.add(child3);
          expectEqlItems(panel.children.slice(), [child0, child1, child2, child3]);
        });

        it('should support a slice start', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.add(child3);
          expectEqlItems(panel.children.slice(2), [child2, child3]);
        });

        it('should support a slice end', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.add(child3);
          expectEqlItems(panel.children.slice(1, 3), [child1, child2]);
        });

        it('should support negative indices', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.add(child3);
          expectEqlItems(panel.children.slice(-3, -1), [child1, child2]);
        });

        it('should limit the indices to the bounds', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.add(child3);
          expectEqlItems(panel.children.slice(-30, 20), [child0, child1, child2, child3]);
        });

      });

      describe('#set()', () => {

        it('should set the item at the specified index', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          expect(panel.children.get(0)).to.be(child0);
          expect(panel.children.get(1)).to.be(child1);
          expectEqlNodes(panel, [child0, child1]);
          panel.children.set(0, child2);
          expect(panel.children.get(0)).to.be(child2);
          expect(panel.children.get(1)).to.be(child1);
          expect(panel.children.length).to.be(2);
          expectEqlNodes(panel, [child2, child1]);
        });

        it('should support negative indices', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.set(-2, child2);
          expect(panel.children.get(0)).to.be(child2);
          expect(panel.children.get(1)).to.be(child1);
          expect(panel.children.length).to.be(2);
          expectEqlNodes(panel, [child2, child1]);
        });

        it('should return the old item', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          let old0 = panel.children.set(0, child2);
          let old2 = panel.children.set(0, child0);
          expect(old0).to.be(child0);
          expect(old2).to.be(child2);
        });

        it('should return `undefined` if the index is out of range', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          let old0 = panel.children.set(10, child2);
          let old2 = panel.children.set(-10, child0);
          expect(old0).to.be(void 0);
          expect(old2).to.be(void 0);
          expectEqlItems(panel.children.slice(), [child0, child1]);
          expectEqlNodes(panel, [child0, child1]);
        });

        it('should parent the new item', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          expect(child2.parent).to.be(null);
          panel.children.set(0, child2);
          expect(child2.parent).to.be(panel);
        });

        it('should unparent the old item', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          expect(child0.parent).to.be(panel);
          panel.children.set(0, child2);
          expect(child0.parent).to.be(null);
        });

        it('should move the item if already a child', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.set(0, child1);
          expectEqlItems(panel.children.slice(), [child1]);
          expect(child0.parent).to.be(null);
        });

        it('should emit an `Add` change if the child is new', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.changed.connect(changed);
          panel.children.set(0, child2);
          expect(sender).to.be(panel.children);
          expect(args[1]).to.eql({
            type: ListChangeType.Add,
            oldIndex: -1,
            oldValue: void 0,
            newIndex: 0,
            newValue: child2,
          });
        });

        it('should emit a `Move` change if the item is already a child', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          panel.children.changed.connect(changed);
          panel.children.set(0, child2);
          expect(sender).to.be(panel.children);
          expect(args[1]).to.eql({
            type: ListChangeType.Move,
            oldIndex: 1,
            oldValue: child2,
            newIndex: 0,
            newValue: child2,
          });
        });

        it('should emit a `Remove` change for the old item', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.changed.connect(changed);
          panel.children.set(0, child2);
          expect(sender).to.be(panel.children);
          expect(args[0]).to.eql({
            type: ListChangeType.Remove,
            oldIndex: 0,
            oldValue: child0,
            newIndex: -1,
            newValue: void 0,
          });
        });

        it('should be a no-op if there is no effective change', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          panel.children.changed.connect(changed);
          panel.children.set(2, child2);
          expect(sender).to.be(null);
          expect(args).to.eql([]);
        });

        it('should throw an error if the item is the panel', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          panel.children.add(child0);
          expect(() => { panel.children.set(0, panel); }).to.throwError();
        });

      });

      describe('#assign()', () => {

        it('should replace the contents of the children', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1]);
          expectEqlItems(panel.children.slice(), [child0, child1]);
          expectEqlNodes(panel, [child0, child1]);
          panel.children.assign([child2, child3]);
          expectEqlItems(panel.children.slice(), [child2, child3]);
          expectEqlNodes(panel, [child2, child3]);
        });

        it('should parent the new children', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          expect(child0.parent).to.be(null);
          expect(child1.parent).to.be(null);
          panel.children.assign([child0, child1]);
          expect(child0.parent).to.be(panel);
          expect(child1.parent).to.be(panel);
        });

        it('should unparent the old children', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          panel.children.assign([child0, child1]);
          expect(child0.parent).to.be(panel);
          expect(child1.parent).to.be(panel);
          panel.children.assign([]);
          expect(child0.parent).to.be(null);
          expect(child1.parent).to.be(null);
        });

        it('should return the removed children', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1]);
          let old = panel.children.assign([child2, child3, child1]);
          expectEqlItems(old, [child0]);
          expectEqlItems(panel.children.slice(), [child2, child3, child1]);
          expectEqlNodes(panel, [child2, child3, child1]);
        });

        it('should emit an `Add` change for the new children', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1]);
          panel.children.changed.connect(changed);
          panel.children.assign([child2, child3]);
          expect(sender).to.be(panel.children);
          expect(args[2]).to.eql({
            type: ListChangeType.Add,
            oldIndex: -1,
            oldValue: void 0,
            newIndex: 0,
            newValue: child2,
          });
          expect(args[3]).to.eql({
            type: ListChangeType.Add,
            oldIndex: -1,
            oldValue: void 0,
            newIndex: 1,
            newValue: child3,
          });
        });

        it('should emit a `Remove` change for the removed children', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1]);
          panel.children.changed.connect(changed);
          panel.children.assign([child2, child3]);
          expect(sender).to.be(panel.children);
          expect(args[0]).to.eql({
            type: ListChangeType.Remove,
            oldIndex: 0,
            oldValue: child0,
            newIndex: -1,
            newValue: void 0,
          });
          expect(args[1]).to.eql({
            type: ListChangeType.Remove,
            oldIndex: 0,
            oldValue: child1,
            newIndex: -1,
            newValue: void 0,
          });
        });

        it('should throw an error if one of the items is the panel', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          expect(() => { panel.children.assign([child0, panel, child1]); }).to.throwError();
        });

      });

      describe('#add()', () => {

        it('should add a new child to the end of the list', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          expect(panel.children.length).to.be(0);
          panel.children.add(child0);
          expect(panel.children.length).to.be(1);
          expect(panel.children.get(0)).to.be(child0);
          panel.children.add(child1);
          expect(panel.children.length).to.be(2);
          expect(panel.children.get(1)).to.be(child1);
          panel.children.add(child2);
          expect(panel.children.length).to.be(3);
          expect(panel.children.get(2)).to.be(child2);
          expectEqlItems(panel.children.slice(), [child0, child1, child2]);
          expectEqlNodes(panel, [child0, child1, child2]);
        });

        it('should return the new index of the child', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          expect(panel.children.add(child0)).to.be(0);
          expect(panel.children.add(child1)).to.be(1);
          expect(panel.children.add(child2)).to.be(2);
          expect(panel.children.add(child0)).to.be(2);
          expect(panel.children.add(child1)).to.be(2);
          expect(panel.children.add(child2)).to.be(2);
        });

        it('should set the parent of the child', () => {
          let panel = new Panel();
          let child = new Widget();
          expect(child.parent).to.be(null);
          panel.children.add(child);
          expect(child.parent).to.be(panel);
        });

        it('should reparent a foreign child', () => {
          let panel0 = new Panel();
          let panel1 = new Panel();
          let child = new Widget();
          expect(child.parent).to.be(null);
          panel0.children.add(child);
          expect(child.parent).to.be(panel0);
          panel1.children.add(child);
          expect(child.parent).to.be(panel1);
          expectEqlItems(panel0.children.slice(), []);
          expectEqlItems(panel1.children.slice(), [child]);
          expectEqlNodes(panel0, []);
          expectEqlNodes(panel1, [child]);
        });

        it('should detach a foreign child', () => {
          let panel = new Panel();
          let child = new Widget();
          Widget.attach(child, document.body);
          expect(child.parent).to.be(null);
          panel.children.add(child);
          expect(child.parent).to.be(panel);
          expect(child.node.parentNode).to.be(panel.node);
        });

        it('should move an exisiting child', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          panel.children.add(child0);
          expectEqlItems(panel.children.slice(), [child1, child2, child0]);
          expectEqlNodes(panel, [child1, child2, child0]);
        });

        it('should emit an `Add` change for the new child', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child = new Widget();
          panel.children.changed.connect(changed);
          panel.children.add(child);
          expect(args[0]).to.eql({
            type: ListChangeType.Add,
            oldIndex: -1,
            oldValue: void 0,
            newIndex: 0,
            newValue: child,
          });
        });

        it('should emit a `Move` change for the moved child', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.changed.connect(changed);
          panel.children.add(child0);
          expect(args[0]).to.eql({
            type: ListChangeType.Move,
            oldIndex: 0,
            oldValue: child0,
            newIndex: 1,
            newValue: child0,
          });
        });

        it('should be a no-op if there is no effective change', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          panel.children.add(child0);
          panel.children.changed.connect(changed);
          panel.children.add(child0);
          expect(sender).to.be(null);
          expect(args).to.eql([]);
        });

        it('should throw an error if the item is the panel', () => {
          let panel = new Panel();
          expect(() => { panel.children.add(panel); }).to.throwError();
        });

      });

      describe('#insert()', () => {

        it('should insert a new child at the given index', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          expect(panel.children.length).to.be(0);
          panel.children.insert(0, child0);
          expect(panel.children.length).to.be(1);
          expect(panel.children.get(0)).to.be(child0);
          panel.children.insert(0, child1);
          expect(panel.children.length).to.be(2);
          expect(panel.children.get(0)).to.be(child1);
          panel.children.insert(-1, child2);
          expect(panel.children.length).to.be(3);
          expect(panel.children.get(1)).to.be(child2);
          expectEqlItems(panel.children.slice(), [child1, child2, child0]);
          expectEqlNodes(panel, [child1, child2, child0]);
        });

        it('should return the new index of the child', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          expect(panel.children.insert(0, child0)).to.be(0);
          expect(panel.children.insert(0, child1)).to.be(0);
          expect(panel.children.insert(0, child2)).to.be(0);
          expect(panel.children.insert(10, child0)).to.be(2);
          expect(panel.children.insert(10, child1)).to.be(2);
          expect(panel.children.insert(10, child2)).to.be(2);
        });

        it('should set the parent of the child', () => {
          let panel = new Panel();
          let child = new Widget();
          expect(child.parent).to.be(null);
          panel.children.insert(0, child);
          expect(child.parent).to.be(panel);
        });

        it('should reparent a foreign child', () => {
          let panel0 = new Panel();
          let panel1 = new Panel();
          let child = new Widget();
          expect(child.parent).to.be(null);
          panel0.children.insert(0, child);
          expect(child.parent).to.be(panel0);
          panel1.children.insert(0, child);
          expect(child.parent).to.be(panel1);
          expectEqlItems(panel0.children.slice(), []);
          expectEqlItems(panel1.children.slice(), [child]);
          expectEqlNodes(panel0, []);
          expectEqlNodes(panel1, [child]);
        });

        it('should detach a foreign child', () => {
          let panel = new Panel();
          let child = new Widget();
          Widget.attach(child, document.body);
          expect(child.parent).to.be(null);
          panel.children.insert(0, child);
          expect(child.parent).to.be(panel);
          expect(child.node.parentNode).to.be(panel.node);
        });

        it('should move an exisiting child', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.insert(0, child0);
          panel.children.insert(0, child1);
          panel.children.insert(0, child2);
          panel.children.insert(0, child0);
          expectEqlItems(panel.children.slice(), [child0, child2, child1]);
          expectEqlNodes(panel, [child0, child2, child1]);
        });

        it('should emit an `Add` change for the new child', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child = new Widget();
          panel.children.changed.connect(changed);
          panel.children.insert(0, child);
          expect(args[0]).to.eql({
            type: ListChangeType.Add,
            oldIndex: -1,
            oldValue: void 0,
            newIndex: 0,
            newValue: child,
          });
        });

        it('should emit a `Move` change for the moved child', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          panel.children.insert(0, child0);
          panel.children.insert(1, child1);
          panel.children.changed.connect(changed);
          panel.children.insert(2, child0);
          expect(args[0]).to.eql({
            type: ListChangeType.Move,
            oldIndex: 0,
            oldValue: child0,
            newIndex: 1,
            newValue: child0,
          });
        });

        it('should be a no-op if there is no effective change', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          panel.children.insert(0, child0);
          panel.children.changed.connect(changed);
          panel.children.insert(0, child0);
          expect(sender).to.be(null);
          expect(args).to.eql([]);
        });

        it('should throw an error if the item is the panel', () => {
          let panel = new Panel();
          expect(() => { panel.children.insert(0, panel); }).to.throwError();
        });

      });

      describe('#move()', () => {

        it('should move the child to the new location', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          panel.children.move(0, 2);
          expectEqlItems(panel.children.slice(), [child1, child2, child0]);
          expectEqlNodes(panel, [child1, child2, child0]);
        });

        it('should return `true` on success', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          expect(panel.children.move(0, 2)).to.be(true);
        });

        it('should return `false` on failure', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          expect(panel.children.move(0, 12)).to.be(false);
          expect(panel.children.move(-10, 1)).to.be(false);
        });

        it('should emit a `Move` change for the moved child', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          panel.children.changed.connect(changed);
          panel.children.move(0, 2);
          expect(sender).to.be(panel.children);
          expect(args[0]).to.eql({
            type: ListChangeType.Move,
            oldIndex: 0,
            oldValue: child0,
            newIndex: 2,
            newValue: child0,
          });
        });

        it('should be a no-op if there is no effective change', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          panel.children.changed.connect(changed);
          panel.children.move(1, 1);
          expect(sender).to.be(null);
          expect(args).to.eql([]);
        });

      });

      describe('#remove()', () => {

        it('should remove the specified child', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          panel.children.remove(child1);
          expectEqlItems(panel.children.slice(), [child0, child2]);
          expectEqlNodes(panel, [child0, child2]);
        });

        it('should return the index of the removed child', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          expect(panel.children.remove(child1)).to.be(1);
        });

        it('should return `-1` on failure', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child2);
          expect(panel.children.remove(child1)).to.be(-1);
        });

        it('should emit a `Remove` change for the removed child', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          panel.children.changed.connect(changed);
          panel.children.remove(child1);
          expect(sender).to.be(panel.children);
          expect(args[0]).to.eql({
            type: ListChangeType.Remove,
            oldIndex: 1,
            oldValue: child1,
            newIndex: -1,
            newValue: void 0,
          });
        });

        it('should be a no-op if there is no effective change', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child2);
          panel.children.changed.connect(changed);
          panel.children.remove(child1);
          expect(sender).to.be(null);
          expect(args).to.eql([]);
        });

      });

      describe('#removeAt()', () => {

        it('should remove the child at the specified index', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          panel.children.removeAt(1);
          expectEqlItems(panel.children.slice(), [child0, child2]);
          expectEqlNodes(panel, [child0, child2]);
        });

        it('should return the removed child', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          expect(panel.children.removeAt(1)).to.be(child1);
        });

        it('should return `undefined` on failure', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          expect(panel.children.removeAt(3)).to.be(void 0);
        });

        it('should emit a `Remove` change for the removed child', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          panel.children.changed.connect(changed);
          panel.children.removeAt(1);
          expect(sender).to.be(panel.children);
          expect(args[0]).to.eql({
            type: ListChangeType.Remove,
            oldIndex: 1,
            oldValue: child1,
            newIndex: -1,
            newValue: void 0,
          });
        });

        it('should be a no-op if there is no effective change', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          panel.children.add(child0);
          panel.children.add(child1);
          panel.children.add(child2);
          panel.children.changed.connect(changed);
          panel.children.removeAt(3);
          expect(sender).to.be(null);
          expect(args).to.eql([]);
        });

      });

      describe('#replace()', () => {

        it('should replace the specified children', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.replace(1, 2, [child3, child0]);
          expectEqlItems(panel.children.slice(), [child3, child0]);
          expectEqlNodes(panel, [child3, child0]);
        });

        it('should parent the new children', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.replace(1, 2, [child3, child0]);
          expect(child0.parent).to.be(panel);
          expect(child3.parent).to.be(panel);
        });

        it('should unparent the old children', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.replace(1, 2, [child3, child0]);
          expect(child1.parent).to.be(null);
          expect(child2.parent).to.be(null);
        });

        it('should return the removed children', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          let old = panel.children.replace(1, 2, [child3, child0]);
          expectEqlItems(old, [child1, child2]);
        });

        it('should emit an `Add` change for the new children', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.changed.connect(changed);
          panel.children.replace(1, 2, [child3, child0]);
          expect(sender).to.be(panel.children);
          expect(args[2]).to.eql({
            type: ListChangeType.Add,
            oldIndex: -1,
            oldValue: void 0,
            newIndex: 1,
            newValue: child3,
          });
        });

        it('should emit a `Move` change for the moved children', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.changed.connect(changed);
          panel.children.replace(1, 2, [child3, child0]);
          expect(sender).to.be(panel.children);
          expect(args[3]).to.eql({
            type: ListChangeType.Move,
            oldIndex: 0,
            oldValue: child0,
            newIndex: 1,
            newValue: child0,
          });
        });

        it('should emit a `Remove` change for the removed children', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2]);
          panel.children.changed.connect(changed);
          panel.children.replace(1, 2, [child3, child0]);
          expect(sender).to.be(panel.children);
          expect(args[0]).to.eql({
            type: ListChangeType.Remove,
            oldIndex: 1,
            oldValue: child1,
            newIndex: -1,
            newValue: void 0,
          });
          expect(args[1]).to.eql({
            type: ListChangeType.Remove,
            oldIndex: 1,
            oldValue: child2,
            newIndex: -1,
            newValue: void 0,
          });
        });

        it('should throw an error if one of the items is the panel', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          expect(() => { panel.children.replace(0, 0, [child0, panel, child1]); }).to.throwError();
        });

      });

      describe('#clear()', () => {

        it('should remove all children', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          let child2 = new Widget();
          let child3 = new Widget();
          panel.children.assign([child0, child1, child2, child3]);
          panel.children.clear();
          expectEqlItems(panel.children.slice(), []);
          expectEqlNodes(panel, []);
        });

        it('should return the removed children', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          panel.children.assign([child0, child1]);
          expectEqlItems(panel.children.clear(), [child0, child1]);
        });

        it('should unparent then children', () => {
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          panel.children.assign([child0, child1]);
          panel.children.clear();
          expect(child0.parent).to.be(null);
          expect(child1.parent).to.be(null);
        });

        it('should emit a `Remove` change for the removed children', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          let child0 = new Widget();
          let child1 = new Widget();
          panel.children.assign([child0, child1]);
          panel.children.changed.connect(changed);
          panel.children.clear();
          expect(sender).to.be(panel.children);
          expect(args[0]).to.eql({
            type: ListChangeType.Remove,
            oldIndex: 0,
            oldValue: child0,
            newIndex: -1,
            newValue: void 0,
          });
          expect(args[1]).to.eql({
            type: ListChangeType.Remove,
            oldIndex: 0,
            oldValue: child1,
            newIndex: -1,
            newValue: void 0,
          });
        });

        it('should be a no-op if there is no effective change', () => {
          let sender: IChildWidgetList = null;
          let args: IListChangedArgs<Widget>[] = [];
          let changed = (s: any, a: any) => { sender = s; args.push(a); };
          let panel = new Panel();
          panel.children.changed.connect(changed);
          panel.children.clear();
          expect(sender).to.be(null);
          expect(args).to.eql([]);
        });

      });

    });

    describe('#compressMessage()', () => {

      it('should compress `update-request` messages', (done) => {
        let panel = new LogPanel();
        postMessage(panel, Widget.MsgUpdateRequest);
        postMessage(panel, Widget.MsgUpdateRequest);
        postMessage(panel, Widget.MsgUpdateRequest);
        requestAnimationFrame(() => {
          expect(panel.messages).to.eql(['update-request']);
          done();
        });
      });

      it('should compress `layout-request` messages', (done) => {
        let panel = new LogPanel();
        postMessage(panel, Panel.MsgLayoutRequest);
        postMessage(panel, Panel.MsgLayoutRequest);
        postMessage(panel, Panel.MsgLayoutRequest);
        requestAnimationFrame(() => {
          expect(panel.messages).to.eql(['layout-request']);
          done();
        });
      });

      it('should not compress other messages', (done) => {
        let panel = new LogPanel();
        let msg = new Message('foo');
        postMessage(panel, msg);
        postMessage(panel, msg);
        postMessage(panel, msg);
        requestAnimationFrame(() => {
          expect(panel.messages).to.eql(['foo', 'foo', 'foo']);
          done();
        });
      });

    });

    describe('#onChildAdded()', () => {

      it('should be invoked when a child is added', () => {
        let child = new Widget();
        let panel = new LogPanel();
        panel.children.add(child);
        expect(panel.methods[0]).to.be('onChildAdded');
      });

      it('should insert the child node at the proper location', () => {
        let child0 = new Widget();
        let child1 = new Widget();
        let panel = new Panel();
        panel.children.add(child0);
        panel.children.insert(0, child1);
        expect(panel.node.firstChild).to.be(child1.node);
        expect(panel.node.lastChild).to.be(child0.node);
      });

      context('`msg` parameter', () => {

        it('should have a `type` of `child-added`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          expect(panel.messages[0]).to.be('child-added');
        });

        it('should have the correct `child`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          let panel = new LogPanel();
          panel.children.add(child0);
          panel.raw = [];
          panel.children.add(child1);
          expect((panel.raw[0] as ChildMessage).child).to.be(child1);
        });

        it('should have the correct `currentIndex`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          let panel = new LogPanel();
          panel.children.add(child0);
          expect((panel.raw[0] as ChildMessage).currentIndex).to.be(0);
          panel.raw = [];
          panel.children.add(child1);
          expect((panel.raw[0] as ChildMessage).currentIndex).to.be(1);
        });

        it('should have a `previousIndex` of `-1`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          let panel = new LogPanel();
          panel.children.add(child0);
          expect((panel.raw[0] as ChildMessage).previousIndex).to.be(-1);
          panel.raw = [];
          panel.children.add(child1);
          expect((panel.raw[0] as ChildMessage).previousIndex).to.be(-1);
        });

      });

      context('if the widget is attached', () => {

        it('should send an `after-attach` message to the child', () => {
          let child = new LogWidget();
          let panel = new LogPanel();
          Widget.attach(panel, document.body);
          panel.children.add(child);
          expect(child.messages[0]).to.be('after-attach');
        });

      });

    });

    describe('#onChildMoved()', () => {

      it('should be invoked when a child is moved', () => {
        let child0 = new Widget();
        let child1 = new Widget();
        let panel = new LogPanel();
        panel.children.assign([child0, child1]);
        panel.methods = [];
        panel.children.move(1, 0);
        expect(panel.methods[0]).to.be('onChildMoved');
      });

      it('should move the child node to the proper location', () => {
        let child0 = new Widget();
        let child1 = new Widget();
        let panel = new LogPanel();
        panel.children.assign([child0, child1]);
        expect(panel.node.firstChild).to.be(child0.node);
        expect(panel.node.lastChild).to.be(child1.node);
        panel.children.move(1, 0);
        expect(panel.node.firstChild).to.be(child1.node);
        expect(panel.node.lastChild).to.be(child0.node);
      });

      context('`msg` parameter', () => {

        it('should have a `type` of `child-moved`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          let panel = new LogPanel();
          panel.children.assign([child0, child1]);
          panel.messages = [];
          panel.children.move(1, 0);
          expect(panel.messages[0]).to.be('child-moved');
        });

        it('should have the correct `child`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          child0.id = 'foo';
          child1.id = 'bar';
          let panel = new LogPanel();
          panel.children.assign([child0, child1]);
          panel.raw = [];
          panel.children.move(1, 0);
          expect((panel.raw[0] as ChildMessage).child).to.be(child1);
        });

        it('should have the correct `currentIndex`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          let panel = new LogPanel();
          panel.children.assign([child0, child1]);
          panel.raw = [];
          panel.children.move(1, 0);
          expect((panel.raw[0] as ChildMessage).currentIndex).to.be(0);
        });

        it('should have the correct `previousIndex`', () => {
          let child0 = new Widget();
          let child1 = new Widget();
          let panel = new LogPanel();
          panel.children.assign([child0, child1]);
          panel.raw = [];
          panel.children.move(1, 0);
          expect((panel.raw[0] as ChildMessage).previousIndex).to.be(1);
        });

      });

      context('if the widget is attached', () => {

        it('should send a `before-detach` message to the child', () => {
          let child0 = new LogWidget();
          let child1 = new LogWidget();
          let panel = new LogPanel();
          panel.children.assign([child0, child1]);
          Widget.attach(panel, document.body);
          child0.messages = [];
          child1.messages = [];
          panel.children.move(1, 0);
          expect(child0.messages.indexOf('before-detach')).to.be(-1);
          expect(child1.messages.indexOf('before-detach')).to.not.be(-1);
        });

        it('should send an `after-attach` message to the child', () => {
          let child0 = new LogWidget();
          let child1 = new LogWidget();
          let panel = new LogPanel();
          panel.children.assign([child0, child1]);
          Widget.attach(panel, document.body);
          child0.messages = [];
          child1.messages = [];
          panel.children.move(1, 0);
          expect(child0.messages.indexOf('before-detach')).to.be(-1);
          expect(child1.messages.indexOf('after-attach')).to.not.be(-1);
        });

      });

    });

    describe('#onChildRemoved()', () => {

      it('should be invoked when a child is removed', () => {
        let child = new Widget();
        let panel = new LogPanel();
        panel.children.add(child);
        panel.children.remove(child);
        expect(panel.methods[1]).to.be('onChildRemoved');
      });

      it('should remove the node from the parent node', () => {
        let child0 = new Widget();
        let child1 = new Widget();
        let panel = new Panel();
        panel.children.add(child0);
        panel.children.insert(0, child1);
        panel.children.remove(child0);
        expect(panel.node.firstChild).to.be(child1.node);
        expect(panel.node.lastChild).to.be(child1.node);
      });

      context('`msg` parameter', () => {

        it('should be a `ChildMessage`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          panel.children.remove(child);
          expect(panel.raw[1] instanceof ChildMessage).to.be(true);
        });

        it('should have a `type` of `child-removed`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          panel.children.remove(child);
          expect((panel.raw[1] as ChildMessage).type).to.be('child-removed');
        });

        it('should have the correct `child`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          panel.children.remove(child);
          expect((panel.raw[1] as ChildMessage).child).to.be(child);
        });

        it('should have a `currentIndex` of -1', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          panel.children.remove(child);
          expect((panel.raw[1] as ChildMessage).currentIndex).to.be(-1);
        });

        it('should have the correct `previousIndex`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          panel.children.remove(child);
          expect((panel.raw[1] as ChildMessage).previousIndex).to.be(0);
        });

      });

      context('if the widget is attached', () => {

        it('should send a `before-detach` message to the child', () => {
          let child = new LogWidget();
          let panel = new LogPanel();
          panel.children.add(child);
          Widget.attach(panel, document.body);
          panel.children.remove(child);
          expect(child.messages.indexOf('before-detach')).to.not.be(-1);
        });

      });

    });

    describe('#onResize()', () => {

      it('should dispatch `ResizeMessage.UnknownSize` to the children', () => {
        let child0 = new LogWidget();
        let child1 = new LogWidget();
        let panel = new LogPanel();
        panel.children.assign([child0, child1]);
        child0.raw = [];
        child1.raw = [];
        sendMessage(panel, ResizeMessage.UnknownSize);
        expect(child0.raw[0]).to.eql(ResizeMessage.UnknownSize);
        expect(child1.raw[0]).to.eql(ResizeMessage.UnknownSize);
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should dispatch `ResizeMessage.UnknownSize` to the children', () => {
        let child0 = new LogWidget();
        let child1 = new LogWidget();
        let panel = new LogPanel();
        panel.children.assign([child0, child1]);
        child0.raw = [];
        child1.raw = [];
        sendMessage(panel, Widget.MsgUpdateRequest);
        expect(child0.raw[0]).to.eql(ResizeMessage.UnknownSize);
        expect(child1.raw[0]).to.eql(ResizeMessage.UnknownSize);
      });

    });

    describe('#onAfterShow()', () => {

      it('should propagate `after-show` to all non-hidden children', () => {
        let bottom0 = new LogWidget();
        let bottom1 = new LogWidget();
        let middle = new LogPanel();
        let top = new LogPanel();
        middle.children.assign([bottom0, bottom1]);
        top.children.add(middle);
        bottom0.hidden = true;
        top.hidden = true;
        Widget.attach(top, document.body);
        top.hidden = false;
        expect(bottom0.messages.indexOf('after-show')).to.be(-1);
        expect(bottom1.messages.indexOf('after-show')).to.not.be(-1);
        expect(middle.messages.indexOf('after-show')).to.not.be(-1);
        expect(top.messages.indexOf('after-show')).to.not.be(-1);
        bottom0.hidden = false;
        expect(bottom0.messages.indexOf('after-show')).to.not.be(-1);
      });

    });

    describe('#onBeforeHide()', () => {

      it('should propagate `before-hide` to all non-hidden children', () => {
        let bottom0 = new LogWidget();
        let bottom1 = new LogWidget();
        let middle = new LogPanel();
        let top = new LogPanel();
        middle.children.assign([bottom0, bottom1]);
        top.children.add(middle);
        Widget.attach(top, document.body);
        bottom0.hidden = true;
        bottom0.messages = [];
        middle.hidden = true;
        expect(bottom0.messages.indexOf('before-hide')).to.be(-1);
        expect(bottom1.messages.indexOf('before-hide')).to.not.be(-1);
        expect(middle.messages.indexOf('before-hide')).to.not.be(-1);
        expect(top.messages.indexOf('before-hide')).to.be(-1);
        middle.messages = [];
        top.hidden = true;
        expect(top.messages.indexOf('before-hide')).to.not.be(-1);
        expect(middle.messages.indexOf('before-hide')).to.be(-1);
      });

    });

    describe('#onAfterAttach()', () => {

      it('should propagate `after-attach` to all children', () => {
        let bottom0 = new LogWidget();
        let bottom1 = new LogWidget();
        let middle = new LogPanel();
        let top = new LogPanel();
        middle.children.assign([bottom0, bottom1]);
        top.children.add(middle);
        Widget.attach(top, document.body);
        expect(bottom0.messages.indexOf('after-attach')).to.not.be(-1);
        expect(bottom1.messages.indexOf('after-attach')).to.not.be(-1);
        expect(middle.messages.indexOf('after-attach')).to.not.be(-1);
        expect(top.messages.indexOf('after-attach')).to.not.be(-1);
      });

    });

    describe('#onBeforeDetach()', () => {

      it('should propagate `before-detach` to all children', () => {
        let bottom0 = new LogWidget();
        let bottom1 = new LogWidget();
        let middle = new LogPanel();
        let top = new LogPanel();
        middle.children.assign([bottom0, bottom1]);
        top.children.add(middle);
        Widget.attach(top, document.body);
        Widget.detach(top);
        expect(bottom0.messages.indexOf('before-detach')).to.not.be(-1);
        expect(bottom1.messages.indexOf('before-detach')).to.not.be(-1);
        expect(middle.messages.indexOf('before-detach')).to.not.be(-1);
        expect(top.messages.indexOf('before-detach')).to.not.be(-1);
      });

    });

    describe('#onLayoutRequest()', () => {

      it('should be invoked when a layout is requested', () => {
        let panel = new LogPanel();
        sendMessage(panel, Panel.MsgLayoutRequest);
        expect(panel.methods[0]).to.be('onLayoutRequest');
      });

      context('`msg` parameter', () => {

        it('should have a `type` of `layout-request`', () => {
          let panel = new LogPanel();
          sendMessage(panel, Panel.MsgLayoutRequest);
          expect(panel.messages[0]).to.be('layout-request');
        });

      });

    });

    describe('#onChildShown()', () => {

      it('should be invoked when a child is unhidden', () => {
        let child = new Widget();
        let panel = new LogPanel();
        panel.children.add(child);
        Widget.attach(panel, document.body);
        panel.hidden = true;
        child.hidden = true;
        panel.hidden = false;
        panel.methods = [];
        child.hidden = false;
        expect(panel.methods[0]).to.be('onChildShown');
      });

      context('`msg` parameter', () => {

        it('should be a `ChildMessage`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          Widget.attach(panel, document.body);
          panel.hidden = true;
          child.hidden = true;
          panel.hidden = false;
          panel.raw = [];
          child.hidden = false;
          expect(panel.raw[0] instanceof ChildMessage).to.be(true);
        });

        it('should have a `type` of `child-shown`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          Widget.attach(panel, document.body);
          panel.hidden = true;
          child.hidden = true;
          panel.hidden = false;
          panel.raw = [];
          child.hidden = false;
          expect(panel.raw[0].type).to.be('child-shown');
        });

        it('should have the correct `child`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          Widget.attach(panel, document.body);
          panel.hidden = true;
          child.hidden = true;
          panel.hidden = false;
          panel.raw = [];
          child.hidden = false;
          expect((panel.raw[0] as ChildMessage).child).to.be(child);
        });

        it('should have a `currentIndex` of -1', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          Widget.attach(panel, document.body);
          panel.hidden = true;
          child.hidden = true;
          panel.hidden = false;
          panel.raw = [];
          child.hidden = false;
          expect((panel.raw[0] as ChildMessage).currentIndex).to.be(-1);
        });

        it('should have a `previousIndex` of -1', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          Widget.attach(panel, document.body);
          panel.hidden = true;
          child.hidden = true;
          panel.hidden = false;
          panel.raw = [];
          child.hidden = false;
          expect((panel.raw[0] as ChildMessage).previousIndex).to.be(-1);
        });

      });

    });

    describe('#onChildHidden()', () => {

      it('should be invoked when a child is hidden', () => {
        let child = new Widget();
        let panel = new LogPanel();
        panel.children.add(child);
        panel.methods = [];
        child.hidden = true;
        expect(panel.methods[0]).to.be('onChildHidden');
      });

      context('`msg` parameter', () => {

        it('should be a `ChildMessage`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          panel.raw = [];
          child.hidden = true;
          expect(panel.raw[0] instanceof ChildMessage).to.be(true);
        });

        it('should have a `type` of `child-hidden`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          panel.raw = [];
          child.hidden = true;
          expect((panel.raw[0] as ChildMessage).type).to.be('child-hidden');
        });

        it('should have the correct `child`', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          panel.raw = [];
          child.hidden = true;
          expect((panel.raw[0] as ChildMessage).child).to.be(child);
        });

        it('should have a `currentIndex` of -1', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          panel.raw = [];
          child.hidden = true;
          expect((panel.raw[0] as ChildMessage).currentIndex).to.be(-1);
        });

        it('should have a `previousIndex` of -1', () => {
          let child = new Widget();
          let panel = new LogPanel();
          panel.children.add(child);
          panel.raw = [];
          child.hidden = true;
          expect((panel.raw[0] as ChildMessage).previousIndex).to.be(-1);
        });

      });

    });

    context('state propagation', () => {

      it('should propagate `isAttached` state to all descendants', () => {
        let bottom0 = new LogWidget();
        let bottom1 = new LogWidget();
        let middle = new LogPanel();
        let top = new LogPanel();
        middle.children.assign([bottom0, bottom1]);
        top.children.add(middle);
        expect(bottom0.isAttached).to.be(false);
        expect(bottom1.isAttached).to.be(false);
        expect(middle.isAttached).to.be(false);
        Widget.attach(top, document.body);
        expect(top.isAttached).to.be(true);
        expect(bottom0.isAttached).to.be(true);
        expect(bottom1.isAttached).to.be(true);
        expect(middle.isAttached).to.be(true);
      });

      it('should propagate `isVisible` state to all non-hidden descendants', () => {
        let bottom0 = new LogWidget();
        let bottom1 = new LogWidget();
        let middle = new LogPanel();
        let top = new LogPanel();
        bottom0.hidden = true;
        middle.children.assign([bottom0, bottom1]);
        top.children.add(middle);
        Widget.attach(top, document.body);
        expect(top.isVisible).to.be(true);
        expect(bottom0.isVisible).to.be(false);
        expect(bottom1.isVisible).to.be(true);
        expect(middle.isVisible).to.be(true);
        top.hidden = true;
        expect(top.isVisible).to.be(false);
        expect(bottom0.isVisible).to.be(false);
        expect(bottom1.isVisible).to.be(false);
        expect(middle.isVisible).to.be(false);
        top.hidden = false;
        expect(top.isVisible).to.be(true);
        expect(bottom0.isVisible).to.be(false);
        expect(bottom1.isVisible).to.be(true);
        expect(middle.isVisible).to.be(true);
      });

    });

  });

});
