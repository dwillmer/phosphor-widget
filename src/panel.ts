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
  Message, sendMessage
} from 'phosphor-messaging';

import {
  ChildMessage, ResizeMessage, Widget
} from './widget';


/**
 * The class name added to Panel instances.
 */
const PANEL_CLASS = 'p-Panel';


/**
 * An abstract base class for creating widgets which support children.
 *
 * #### Notes
 * This class implements core functionality which is required by nearly
 * all widgets which support children. It is a good starting point for
 * creating custom panel widgets.
 *
 * For custom panels which cannot express child access with an index
 * based API, the `Widget` class may still be used as the base class,
 * but such a panel is responsible for **all** child messaging.
 */
export
abstract class AbstractPanel extends Widget {
  /**
   * Get the number of children in the panel.
   *
   * @returns The number of child widgets in the panel.
   *
   * #### Notes
   * This abstract method must be implemented by a subclass.
   */
  abstract childCount(): number;

  /**
   * Get the child widget at the specified index.
   *
   * @returns The child at the specified index, or `undefined`.
   *
   * #### Notes
   * This abstract method must be implemented by a subclass.
   */
  abstract childAt(index: number): Widget;

  /**
   * Remove the specified child from the panel.
   *
   * @param child - The child widget to remove.
   *
   * #### Notes
   * This abstract method must be implemented by a subclass.
   *
   * This method is called automatically as needed. It should not be
   * invoked directly by user code.
   */
  protected abstract removeChild(child: Widget): void;

  /**
   * Dispose and clear all children of the panel.
   *
   * #### Notes
   * This abstract method must be implemented by a subclass.
   *
   * This method is called automatically as needed. It should not be
   * invoked directly by user code.
   */
  protected abstract disposeChildren(): void;

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
    sendToChildren(this, ResizeMessage.UnknownSize);
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
    sendToChildren(this, ResizeMessage.UnknownSize);
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
    sendToNonHiddenChildren(this, msg);
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
    sendToNonHiddenChildren(this, msg);
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
    sendToChildren(this, msg);
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
    sendToChildren(this, msg);
  }
}


/**
 * A simple and convenient concrete panel widget class.
 *
 * #### Notes
 * This class is suitable as a base class for implementing a variety of
 * layout panels, but can also be used directly in combination with CSS
 * in order to layout a collection of widgets.
 */
export
class Panel extends AbstractPanel {
  /**
   * Construct a new panel.
   */
  constructor() {
    super();
    this.addClass(PANEL_CLASS);
  }

  /**
   * Get the number of children in the panel.
   *
   * @returns The number of child widgets in the panel.
   */
  childCount(): number {
    return this._children.length;
  }

  /**
   * Get the child widget at the specified index.
   *
   * @returns The child at the specified index, or `undefined`.
   */
  childAt(index: number): Widget {
    return this._children[index];
  }

  /**
   * Add a child widget to the end of the panel.
   *
   * @param child - The child widget to add to the panel.
   */
  addChild(child: Widget): void {
    this.insertChild(this._children.length, child);
  }

  /**
   * Insert a child widget at the specified index.
   *
   * @param index - The index at which to insert the child.
   *
   * @param child - The child widget to add to the panel.
   */
  insertChild(index: number, child: Widget): void {
    index = Math.max(0, Math.min(index | 0, this._children.length));
    if (child.parent === this) {
      let i = this._children.indexOf(child);
      let j = i < index ? index - 1 : index;
      if (i === j) return;
      arrays.move(this._children, i, j);
      sendMessage(this, new ChildIndexMessage('child-moved', child, i, j));
    } else {
      this.adoptChild(child);
      arrays.insert(this._children, index, child);
      sendMessage(this, new ChildIndexMessage('child-added', child, -1, index));
    }
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
    case 'child-added':
      this.onChildAdded(msg as ChildIndexMessage);
      break;
    case 'child-moved':
      this.onChildMoved(msg as ChildIndexMessage);
      break;
    case 'child-removed':
      this.onChildRemoved(msg as ChildIndexMessage);
      break;
    default:
      super.processMessage(msg);
    }
  }

  /**
   * Remove the specified child from the panel.
   *
   * @param child - The child widget to remove.
   *
   * #### Notes
   * This method is called automatically as needed. It should not be
   * invoked directly by user code.
   */
  protected removeChild(child: Widget): void {
    let i = arrays.remove(this._children, child);
    sendMessage(this, new ChildIndexMessage('child-removed', child, i, -1));
  }

  /**
   * Dispose and clear all children of the panel.
   *
   * #### Notes
   * This method is called automatically as needed. It should not be
   * invoked directly by user code.
   */
  protected disposeChildren(): void {
    while (this._children.length > 0) {
      this._children.pop().dispose();
    }
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
  protected onChildAdded(msg: ChildIndexMessage): void {
    let ref = this._children[msg.currentIndex + 1];
    this.node.insertBefore(msg.child.node, ref && ref.node);
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
  protected onChildMoved(msg: ChildIndexMessage): void {
    if (this.isAttached) sendMessage(msg.child, Widget.MsgBeforeDetach);
    let ref = this._children[msg.currentIndex + 1];
    this.node.insertBefore(msg.child.node, ref && ref.node);
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
  protected onChildRemoved(msg: ChildIndexMessage): void {
    if (this.isAttached) sendMessage(msg.child, Widget.MsgBeforeDetach);
    this.node.removeChild(msg.child.node);
  }

  private _children: Widget[] = [];
}


/**
 * A message class for child messages with index information.
 */
export
class ChildIndexMessage extends ChildMessage {
  /**
   * Construct a new child message.
   *
   * @param type - The message type.
   *
   * @param child - The child widget for the message.
   *
   * @param previousIndex - The previous index of the child, or `-1`.
   *
   * @param currentIndex - The current index of the child, or `-1`.
   */
  constructor(type: string, child: Widget, previousIndex: number, currentIndex: number) {
    super(type, child);
    this._currentIndex = currentIndex;
    this._previousIndex = previousIndex;
  }

  /**
   * The current index of the child.
   *
   * #### Notes
   * This will be `-1` if the current index is unknown.
   *
   * This is a read-only property.
   */
  get currentIndex(): number {
    return this._currentIndex;
  }

  /**
   * The previous index of the child.
   *
   * #### Notes
   * This will be `-1` if the previous index is unknown.
   *
   * This is a read-only property.
   */
  get previousIndex(): number {
    return this._previousIndex;
  }

  private _currentIndex: number;
  private _previousIndex: number;
}


/**
 * Send a message to all children of a panel.
 */
function sendToChildren(panel: AbstractPanel, msg: Message): void {
  for (let i = 0; i < panel.childCount(); ++i) {
    sendMessage(panel.childAt(i), msg);
  }
}


/**
 * Send a message to all non-hidden children of a panel.
 */
function sendToNonHiddenChildren(panel: AbstractPanel, msg: Message): void {
  for (let i = 0; i < panel.childCount(); ++i) {
    let child = panel.childAt(i);
    if (!child.hidden) sendMessage(child, msg);
  }
}
