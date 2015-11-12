/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import * as arrays
  from 'phosphor-arrays';

import {
  IDisposable
} from 'phosphor-disposable';

import {
  Message, sendMessage
} from 'phosphor-messaging';

import {
  IObservableList, ListChangeType, ObservableList
} from 'phosphor-observablelist';

import {
  Queue
} from 'phosphor-queue';

import {
  clearSignalData
} from 'phosphor-signaling';

import {
  ChildMessage, ResizeMessage
} from './messages';

import {
  Widget
} from './widget';


/**
 * The class name added to Panel instances.
 */
const PANEL_CLASS = 'p-Panel';


/**
 * An observable list which manages the child widgets for a panel.
 *
 * #### Notes
 * A child widget list must ensure that the child widgets are unique,
 * and must therefore decompose list modifications into `Add`, `Move`,
 * and `Remove` primitive operations. The list will **never** emit its
 * changed signal with a change type of `Replace` or `Set`.
 *
 * A child widget list is disposed automatically when its owner panel
 * is disposed. It should not be disposed directly by user code.
 */
export
interface IChildWidgetList extends IObservableList<Widget>, IDisposable {
  /**
   * The parent panel which owns the list.
   *
   * #### Notes
   * This is a read-only property.
   */
  parent: Panel;
}


/**
 * A widget which acts as a layout container for child widgets.
 *
 * #### Notes
 * This class typically serves as a base class for more concrete layout
 * panels, but can be used directly in combination with CSS to achieve
 * any desired layout for a collection of widgets.
 */
export
class Panel extends Widget {
  /**
   * A singleton `'layout-request'` message.
   *
   * #### Notes
   * This message can be dispatched to supporting panels in order to
   * update their layout. Not all panels will respond to messages of
   * this type.
   *
   * This message is typically used to update the size constraints of
   * a panel and to update the position and size of its children.
   *
   * Messages of this type are compressed by default.
   *
   * **See also:** [[onLayoutRequest]]
   */
  static MsgLayoutRequest = new Message('layout-request');

  /**
   * Construct a new panel.
   */
  constructor() {
    super();
    this.addClass(PANEL_CLASS);
    this._children = new ChildWidgetList(this);
  }

  /**
   * Get the observable list of child widgets for the panel.
   *
   * #### Notes
   * This is a read-only property.
   */
  get children(): IChildWidgetList {
    return this._children;
  }

  /**
   * Process a message sent to the panel.
   *
   * @param msg - The message sent to the panel.
   *
   * #### Notes
   * Subclasses may reimplement this method as needed.
   */
  processMessage(msg: Message): void {
    switch (msg.type) {
    case 'layout-request':
      this.onLayoutRequest(msg);
      break;
    case 'child-added':
      this.onChildAdded(msg as ChildMessage);
      break;
    case 'child-moved':
      this.onChildMoved(msg as ChildMessage);
      break;
    case 'child-removed':
      this.onChildRemoved(msg as ChildMessage);
      break;
    case 'child-shown':
      this.onChildShown(msg as ChildMessage);
      break;
    case 'child-hidden':
      this.onChildHidden(msg as ChildMessage);
      break;
    default:
      super.processMessage(msg);
    }
  }

  /**
   * Compress a message posted to the panel.
   *
   * @param msg - The message posted to the panel.
   *
   * @param pending - The queue of pending messages for the panel.
   *
   * @returns `true` if the message was compressed and should be
   *   dropped, or `false` if the message should be enqueued for
   *   delivery as normal.
   *
   * #### Notes
   * This compresses `'layout-request'` messages in addition to the
   * compression provided by the base `Widget` class.
   *
   * Subclasses may reimplement this method as needed.
   */
  compressMessage(msg: Message, pending: Queue<Message>): boolean {
    if (msg.type === 'layout-request') {
      return pending.some(other => other.type === 'layout-request');
    }
    return super.compressMessage(msg, pending);
  }

  /**
   * A message handler invoked on a `'child-added'` message.
   *
   * #### Notes
   * The default implementation adds the child node to the panel node
   * at the proper location and sends an `'after-attach'` message to
   * the child if the panel is attached to the DOM.
   *
   * Subclasses may reimplement this method to control how the child
   * node is added to the panel node, but a reimplementation must send
   * an `'after-attach'` message to the child if the panel is attached
   * to the DOM.
   */
  protected onChildAdded(msg: ChildMessage): void {
    let next = this.children.get(msg.currentIndex + 1);
    this.node.insertBefore(msg.child.node, next && next.node);
    if (this.isAttached) sendMessage(msg.child, Widget.MsgAfterAttach);
  }

  /**
   * A message handler invoked on a `'child-moved'` message.
   *
   * #### Notes
   * The default implementation moves the child node to the proper
   * location in the panel node and sends both `'before-detach'` and
   * `'after-attach'` message to the child if the panel is attached
   * to the DOM.
   *
   * Subclasses may reimplement this method to control how the child
   * node is moved in the panel node, but a reimplementation must send
   * both `'before-detach'` and `'after-attach'` message to the child
   * if the panel is attached to the DOM.
   */
  protected onChildMoved(msg: ChildMessage): void {
    if (this.isAttached) sendMessage(msg.child, Widget.MsgBeforeDetach);
    let next = this.children.get(msg.currentIndex + 1);
    this.node.insertBefore(msg.child.node, next && next.node);
    if (this.isAttached) sendMessage(msg.child, Widget.MsgAfterAttach);
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   *
   * #### Notes
   * The default implementation removes the child node from the panel
   * node and sends a `'before-detach'` message to the child if the
   * panel is attached to the DOM.
   *
   * Subclasses may reimplement this method to control how the child
   * node is removed from the panel node, but a reimplementation must
   * send a `'before-detach'` message to the child if the panel is
   * attached to the DOM.
   */
  protected onChildRemoved(msg: ChildMessage): void {
    if (this.isAttached) sendMessage(msg.child, Widget.MsgBeforeDetach);
    this.node.removeChild(msg.child.node);
  }

  /**
   * A message handler invoked on a `'resize'` message.
   *
   * #### Notes
   * The default implementation of this handler sends an [[UnknownSize]]
   * resize message to each child. This ensures that the resize messages
   * propagate through all widgets in the hierarchy.
   *
   * Subclasses may reimplement this method as needed, but they must
   * dispatch `'resize'` messages to their children as appropriate.
   */
  protected onResize(msg: ResizeMessage): void {
    let children = this.children;
    for (let i = 0; i < children.length; ++i) {
      sendMessage(children.get(i), ResizeMessage.UnknownSize);
    }
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   *
   * #### Notes
   * The default implementation of this handler sends an [[UnknownSize]]
   * resize message to each child. This ensures that the all widgets in
   * the hierarchy remain correctly sized on updates.
   *
   * Subclasses may reimplement this method as needed, but they should
   * dispatch `'resize'` messages to their children if appropriate.
   */
  protected onUpdateRequest(msg: Message): void {
    let children = this.children;
    for (let i = 0; i < children.length; ++i) {
      sendMessage(children.get(i), ResizeMessage.UnknownSize);
    }
  }

  /**
   * A message handler invoked on an `'after-show'` message.
   *
   * #### Notes
   * The default implementation of this handler forwards the message
   * to all of its non-hidden children.
   *
   * Subclasses may reimplement this method as needed, but they should
   * either call the superclass implementation or forward the message
   * to their non-hidden children as appropriate.
   */
  protected onAfterShow(msg: Message): void {
    let children = this.children;
    for (let i = 0; i < children.length; ++i) {
      let child = children.get(i);
      if (!child.hidden) sendMessage(child, msg);
    }
  }

  /**
   * A message handler invoked on a `'before-hide'` message.
   *
   * #### Notes
   * The default implementation of this handler forwards the message
   * to all of its non-hidden children.
   *
   * Subclasses may reimplement this method as needed, but they should
   * either call the superclass implementation or forward the message
   * to their children as appropriate.
   */
  protected onBeforeHide(msg: Message): void {
    let children = this.children;
    for (let i = 0; i < children.length; ++i) {
      let child = children.get(i);
      if (!child.hidden) sendMessage(child, msg);
    }
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   *
   * #### Notes
   * The default implementation of this handler forwards the message
   * to all of its children.
   *
   * Subclasses may reimplement this method as needed, but they should
   * either call the superclass implementation or forward the message
   * to their children as appropriate.
   */
  protected onAfterAttach(msg: Message): void {
    let children = this.children;
    for (let i = 0; i < children.length; ++i) {
      sendMessage(children.get(i), msg);
    }
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   *
   * #### Notes
   * The default implementation of this handler forwards the message
   * to all of its children.
   *
   * Subclasses may reimplement this method as needed, but they should
   * either call the superclass implementation or forward the message
   * to their children as appropriate.
   */
  protected onBeforeDetach(msg: Message): void {
    let children = this.children;
    for (let i = 0; i < children.length; ++i) {
      sendMessage(children.get(i), msg);
    }
  }

  /**
   * A message handler invoked on a `'layout-request'` message.
   *
   * The default implementation of this handler is a no-op.
   */
  protected onLayoutRequest(msg: Message): void { }

  /**
   * A message handler invoked on a `'child-shown'` message.
   *
   * The default implementation of this handler is a no-op.
   */
  protected onChildShown(msg: ChildMessage): void { }

  /**
   * A message handler invoked on a `'child-hidden'` message.
   *
   * The default implementation of this handler is a no-op.
   */
  protected onChildHidden(msg: ChildMessage): void { }

  private _children: ChildWidgetList;
}


/**
 * A concrete implementation of IChildWidgetList.
 */
class ChildWidgetList extends ObservableList<Widget> implements IChildWidgetList {
  /**
   * Construct a new child widget list.
   *
   * @param parent - The panel to use as the parent of the children.
   */
  constructor(parent: Panel) {
    super();
    this._parent = parent;
  }

  /**
   * Dispose of the child widgets in the list.
   *
   * #### Notes
   * This will unparent, remove, and dispose of all child widgets.
   *
   * This will not emit change notifications or send messages to
   * the parent panel.
   */
  dispose(): void {
    // Clear the signal data so prevent any further notifications.
    clearSignalData(this);

    // Set the parent to `null` to indicate the list is destroyed.
    this._parent = null;

    // Remove all children, set their internal parent references to
    // `null`, and dispose them. The `any` cast is required to work
    // around the lack of `friend class` modifiers.
    while (this.internal.length > 0) {
      let child = this.internal.pop();
      (child as any as IFriendWidget)._parent = null;
      child.dispose();
    }
  }

  /**
   * Test whether the widget list is disposed.
   *
   * #### Notes
   * This is a read-only property.
   */
  get isDisposed(): boolean {
    return this._parent === null;
  }

  /**
   * The parent panel which owns the list.
   *
   * #### Notes
   * This is a read-only property.
   */
  get parent(): Panel {
    return this._parent;
  }

  /**
   * Add an item to the list at the specified index.
   *
   * @param index - The index at which to add the item. This must be
   *   an integer in the range `[0, internal.length]`.
   *
   * @param item - The item to add at the specified index.
   *
   * @returns The index at which the item was added.
   *
   * #### Notes
   * If the item is the parent panel, an error will be thrown.
   *
   * If the item is already a child widget, it will be moved.
   *
   * If the item has a foreign parent, it will first be removed.
   *
   * This will dispatch an appropriate child message to the parent.
   */
  protected addItem(index: number, item: Widget): number {
    // Throw an error if the item is the parent panel.
    if (item === this._parent) {
      throw new Error('invalid child widget');
    }

    // Move the item if it is already a child.
    if (item.parent === this._parent) {
      let i = this.internal.indexOf(item);
      let j = i < index ? index - 1 : index;
      this.moveItem(i, j);
      return j;
    }

    // Remove or detach the item if necessary.
    if (item.parent) {
      item.parent.children.remove(item);
    } else if (item.isAttached) {
      Widget.detach(item);
    }

    // Update the internal parent reference of the item. The `any` cast
    // is required to work around the lack of `friend class` modifiers.
    (item as any as IFriendWidget)._parent = this._parent;

    // Insert the item into the internal array.
    let i = arrays.insert(this.internal, index, item);

    // Dispatch a `'child-added'` message to the parent.
    let msg = new ChildMessage('child-added', item, -1, i);
    sendMessage(this._parent, msg);

    // Emit the list changed signal.
    this.changed.emit({
      type: ListChangeType.Add,
      newIndex: i,
      newValue: item,
      oldIndex: -1,
      oldValue: void 0,
    });

    // Return the new index of the item.
    return i;
  }

  /**
   * Move an item in the list from one index to another.
   *
   * @param fromIndex - The initial index of the item. This must be
   *   an integer in the range `[0, internal.length)`.
   *
   * @param toIndex - The desired index for the item. This must be
   *   an integer in the range `[0, internal.length)`.
   *
   * @returns `true` if the item was moved, `false` otherwise.
   *
   * #### Notes
   * If the `from` and `to` indices are the same, this is a no-op.
   *
   * This will dispatch an appropriate child message to the parent.
   */
  protected moveItem(fromIndex: number, toIndex: number): boolean {
    // Do nothing if the `from` and `to` indices are the same.
    if (fromIndex === toIndex) {
      return true;
    }

    // Move the item in the internal array.
    if (!arrays.move(this.internal, fromIndex, toIndex)) {
      return false;
    }

    // Dispatch a `'child-moved'` message to the parent.
    let item = this.internal[toIndex];
    let msg = new ChildMessage('child-moved', item, fromIndex, toIndex);
    sendMessage(this._parent, msg);

    // Emit the list changed signal.
    this.changed.emit({
      type: ListChangeType.Move,
      newIndex: toIndex,
      newValue: item,
      oldIndex: fromIndex,
      oldValue: item,
    });

    // Return `true` for success.
    return true;
  }

  /**
   * Remove the item from the list at the specified index.
   *
   * @param index - The index of the item to remove. This must be
   *   an integer in the range `[0, internal.length)`.
   *
   * @returns The item removed from the list.
   *
   * #### Notes
   * This will dispatch an appropriate child message to the parent.
   */
  protected removeItem(index: number): Widget {
    // Remove the item from the internal array.
    let item = arrays.removeAt(this.internal, index);

    // Update the internal parent reference of the item. The `any` cast
    // is required to work around the lack of `friend class` modifiers.
    (item as any as IFriendWidget)._parent = null;

    // Dispatch a `'child-removed'` message to the parent.
    let msg = new ChildMessage('child-removed', item, index, -1);
    sendMessage(this._parent, msg);

    // Emit the list changed signal.
    this.changed.emit({
      type: ListChangeType.Remove,
      newIndex: -1,
      newValue: void 0,
      oldIndex: index,
      oldValue: item,
    });

    // Return the removed item.
    return item;
  }

  /**
   * Replace items at a specific location in the list.
   *
   * @param index - The index at which to modify the list. This must
   *   be an integer in the range `[0, internal.length]`.
   *
   * @param count - The number of items to remove from the list. This
   *   must be an integer in the range `[0, internal.length]`.
   *
   * @param items - The items to insert at the specified index.
   *
   * @returns An array of the items removed from the list.
   *
   * #### Notes
   * If any new item is the parent panel, an error will be thrown.
   *
   * This decomposes the operation into a sequence of remove + add.
   *
   * This will dispatch appropriate child messages to the parent.
   */
  protected replaceItems(index: number, count: number, items: Widget[]): Widget[] {
    // Throw an error if any item is the parent panel.
    if (items.some(item => item === this._parent)) {
      throw new Error('invalid child widget');
    }

    // Remove the old items from the list.
    let old: Widget[] = [];
    while (count-- > 0 && index < this.internal.length) {
      old.push(this.removeItem(index));
    }

    // Add the new items to the list and remove them from the old.
    for (let i = 0, n = items.length; i < n; ++i) {
      index = this.addItem(index, items[i]) + 1;
      arrays.remove(old, items[i]);
    }

    // Return the items which were removed.
    return old;
  }

  /**
   * Set the item at a specific index in the list.
   *
   * @param index - The index of interest. This must be an integer in
   *   the range `[0, internal.length)`.
   *
   * @param item - The item to set at the index.
   *
   * @returns The item which previously occupied the specified index.
   *
   * #### Notes
   * If the item is the parent panel, an error will be thrown.
   *
   * If old item is the same as the new item, this is a no-op.
   *
   * This decomposes the operation into an equivalent remove + add.
   *
   * This will dispatch appropriate child messages to the parent.
   */
  protected setItem(index: number, item: Widget): Widget {
    // Throw an error if the item is the parent panel.
    if (item === this._parent) {
      throw new Error('invalid child widget');
    }

    // Do nothing if the old item is the same as the new item.
    if (this.internal[index] === item) {
      return item;
    }

    // Remove the old item from the list.
    let old = this.removeItem(index);

    // Add the new item to the list.
    this.addItem(index, item);

    // Return the old item.
    return old;
  }

  private _parent: Panel;
}


/**
 * A dummy interface to help safely cast widget private state.
 */
interface IFriendWidget {
  _parent: Panel;
}
