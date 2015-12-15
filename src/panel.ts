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
  Layout
} from './layout';

import {
  ChildMessage, ResizeMessage
} from './messages';

import {
  Widget
} from './widget';


// TODO - need better solution for storing these class names

/**
 * The class name added to Panel instances.
 */
const PANEL_CLASS = 'p-Panel';


/**
 * A simple and convenient panel widget class.
 *
 * #### Notes
 * This class is suitable as a base class for implementing a variety of
 * convenience panels, but can also be used directly in combination with
 * CSS to arrange a collection of widgets.
 *
 * This class provides a convenience wrapper around a [[PanelLayout]].
 */
export
class Panel extends Widget {
  /**
   * Create a panel layout to use with a panel.
   *
   * @returns A new panel layout to use with a panel.
   *
   * #### Notes
   * This may be reimplemented by a subclass to create custom layouts.
   */
  static createLayout(): PanelLayout {
    return new PanelLayout();
  }

  /**
   * Construct a new panel.
   */
  constructor() {
    super();
    this.addClass(PANEL_CLASS);
    this.layout = (this.constructor as typeof Panel).createLayout();
  }

  /**
   * Get the number of child widgets in the panel.
   *
   * @returns The number of child widgets in the panel.
   */
  childCount(): number {
    return (this.layout as PanelLayout).childCount();
  }

  /**
   * Get the child widget at the specified index.
   *
   * @param index - The index of the child widget of interest.
   *
   * @returns The child at the specified index, or `undefined`.
   */
  childAt(index: number): Widget {
    return (this.layout as PanelLayout).childAt(index);
  }

  /**
   * Get the index of the specified child widget.
   *
   * @param child - The child widget of interest.
   *
   * @returns The index of the specified child, or `-1`.
   */
  childIndex(child: Widget): number {
    return (this.layout as PanelLayout).childIndex(child);
  }

  /**
   * Add a child widget to the end of the panel.
   *
   * @param child - The child widget to add to the panel.
   */
  addChild(child: Widget): void {
    (this.layout as PanelLayout).addChild(child);
  }

  /**
   * Insert a child widget at the specified index.
   *
   * @param index - The index at which to insert the child.
   *
   * @param child - The child widget to insert into to the panel.
   */
  insertChild(index: number, child: Widget): void {
    (this.layout as PanelLayout).insertChild(index, child);
  }
}


/**
 * An abstract base class for creating index-based layouts.
 *
 * #### Notes
 * This class implements core functionality which is required by nearly
 * all layouts which can be expressed using index-based storage. It is
 * a good starting point for creating advanced custom layouts.
 *
 * This class must be subclassed to make a fully functioning layout.
 *
 * **See also:** [[PanelLayout]], [[Panel]]
 */
export
abstract class AbstractPanelLayout extends Layout {
  /**
   * Get the number of child widgets in the layout.
   *
   * @returns The number of child widgets in the layout.
   *
   * #### Notes
   * This abstract method must be implemented by a subclass.
   */
  abstract childCount(): number;

  /**
   * Get the child widget at the specified index.
   *
   * @param index - The index of the child widget of interest.
   *
   * @returns The child at the specified index, or `undefined`.
   *
   * #### Notes
   * This abstract method must be implemented by a subclass.
   */
  abstract childAt(index: number): Widget;

  /**
   * Get the index of the specified child widget.
   *
   * @param child - The child widget of interest.
   *
   * @returns The index of the specified child, or `-1`.
   */
  childIndex(child: Widget): number {
    for (let i = 0, n = this.childCount(); i < n; ++i) {
      if (this.childAt(i) === child) return i;
    }
    return -1;
  }

  /**
   * Send a message to all children in the layout.
   *
   * @param msg - The message to send to the children.
   */
  protected sendToAllChildren(msg: Message): void {
    for (let i = 0; i < this.childCount(); ++i) {
      sendMessage(this.childAt(i), msg);
    }
  }

  /**
   * Send a message to some children in the layout.
   *
   * @param msg - The message to send to the children.
   *
   * @param pred - A predicate filter function. The message will only
   *   be send to the children which pass the filter.
   */
  protected sendToSomeChildren(msg: Message, pred: (child: Widget) => boolean): void {
    for (let i = 0; i < this.childCount(); ++i) {
      let child = this.childAt(i);
      if (pred(child)) sendMessage(child, msg);
    }
  }

  /**
   * A message handler invoked on a `'resize'` message.
   *
   * #### Notes
   * The default implementation of this method sends an `UnknownSize`
   * resize message to all children.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onResize(msg: ResizeMessage): void {
    this.sendToAllChildren(ResizeMessage.UnknownSize);
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   *
   * #### Notes
   * The default implementation of this method sends an `UnknownSize`
   * resize message to all children.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onUpdateRequest(msg: Message): void {
    this.sendToAllChildren(ResizeMessage.UnknownSize);
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message
   * to all children.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onAfterAttach(msg: Message): void {
    this.sendToAllChildren(msg);
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message
   * to all children.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onBeforeDetach(msg: Message): void {
    this.sendToAllChildren(msg);
  }

  /**
   * A message handler invoked on an `'after-show'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message
   * to all non-hidden children.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onAfterShow(msg: Message): void {
    this.sendToSomeChildren(msg, child => !child.isHidden);
  }

  /**
   * A message handler invoked on a `'before-hide'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message
   * to all non-hidden children.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onBeforeHide(msg: Message): void {
    this.sendToSomeChildren(msg, child => !child.isHidden);
  }
}


/**
 * A concrete layout implementation suitable for many use cases.
 *
 * #### Notes
 * This class is suitable as a base class for implementing a variety of
 * layouts, but can also be used directly in combination with CSS in to
 * layout a collection of widgets.
 */
export
class PanelLayout extends AbstractPanelLayout {
  /**
   * Dispose of the resources held by the layout.
   */
  dispose(): void {
    while (this._children.length > 0) {
      this._children.pop().dispose();
    }
    super.dispose();
  }

  /**
   * Get the number of child widgets in the layout.
   *
   * @returns The number of child widgets in the layout.
   */
  childCount(): number {
    return this._children.length;
  }

  /**
   * Get the child widget at the specified index.
   *
   * @param index - The index of the child widget of interest.
   *
   * @returns The child at the specified index, or `undefined`.
   */
  childAt(index: number): Widget {
    return this._children[index];
  }

  /**
   * Add a child widget to the end of the layout.
   *
   * @param child - The child widget to add to the layout.
   */
  addChild(child: Widget): void {
    this.insertChild(this.childCount(), child);
  }

  /**
   * Insert a child widget into the layout at the specified index.
   *
   * @param index - The index at which to insert the child widget.
   *
   * @param child - The child widget to insert into the layout.
   */
  insertChild(index: number, child: Widget): void {
    child.parent = this.parent;
    let i = this.childIndex(child);
    let j = Math.max(0, Math.min(index | 0, this.childCount()));
    if (i !== -1) {
      if (i < j) j--;
      if (i === j) return;
      arrays.move(this._children, i, j);
      if (this.parent) this.moveChild(i, j, child);
    } else {
      arrays.insert(this._children, j, child);
      if (this.parent) this.attachChild(j, child);
    }
  }

  /**
   * Initialize the children of the layout.
   *
   * #### Notes
   * This method is called automatically when the layout is installed
   * on its parent widget. It will reparent all child widgets to the
   * layout parent and add invoke the [[attachChild]] method.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected initialize(): void {
    for (let i = 0; i < this.childCount(); ++i) {
      let child = this.childAt(i);
      child.parent = this.parent;
      this.attachChild(i, child);
    }
  }

  /**
   * Attach a child widget to the parent's DOM node.
   *
   * @param index - The index of the child in the layout.
   *
   * @param child - The child widget to attach to the parent.
   *
   * #### Notes
   * This method is called automatically by the panel layout at the
   * appropriate time. It should not be called directly by user code.
   *
   * The default implementation adds the child's node to the parent's
   * node at the proper location, and sends an `'after-attach'` message
   * to the child if the parent is attached to the DOM.
   *
   * Subclasses may reimplement this method to control how the child's
   * node is added to the parent's node, but the reimplementation must
   * send an `'after-attach'` message to the child if the parent is
   * attached to the DOM.
   */
  protected attachChild(index: number, child: Widget): void {
    let parent = this.parent;
    let ref = this.childAt(index + 1);
    parent.node.insertBefore(child.node, ref && ref.node);
    if (parent.isAttached) sendMessage(child, Widget.MsgAfterAttach);
  }

  /**
   * Move a child widget in the parent's DOM node.
   *
   * @param index - The index of the child in the layout.
   *
   * @param child - The child widget to detach from the parent.
   *
   * #### Notes
   * This method is called automatically by the panel layout at the
   * appropriate time. It should not be called directly by user code.
   *
   * The default implementation moves the child's node to the proper
   * location in the parent's node and sends both a `'before-detach'`
   * and an `'after-attach'` message to the child if the parent is
   * attached to the DOM.
   *
   * Subclasses may reimplement this method to control how the child's
   * node is moved in the parent's node, but the reimplementation must
   * send both a `'before-detach'` and an `'after-attach'` message to
   * the child if the parent is attached to the DOM.
   */
  protected moveChild(fromIndex: number, toIndex: number, child: Widget): void {
    let parent = this.parent;
    let ref = this.childAt(toIndex + 1);
    if (parent.isAttached) sendMessage(child, Widget.MsgBeforeDetach);
    parent.node.insertBefore(child.node, ref && ref.node);
    if (parent.isAttached) sendMessage(child, Widget.MsgAfterAttach);
  }

  /**
   * Detach a child widget from the parent's DOM node.
   *
   * @param index - The index of the child in the layout.
   *
   * @param child - The child widget to detach from the parent.
   *
   * #### Notes
   * This method is called automatically by the panel layout at the
   * appropriate time. It should not be called directly by user code.
   *
   * The default implementation removes the child's node from the
   * parent's node, and sends a `'before-detach'` message to the child
   * if the parent is attached to the DOM.
   *
   * Subclasses may reimplement this method to control how the child's
   * node is removed from the parent's node, but the reimplementation
   * must send a `'before-detach'` message to the child if the parent
   * is attached to the DOM.
   */
  protected detachChild(index: number, child: Widget): void {
    let parent = this.parent;
    if (parent.isAttached) sendMessage(child, Widget.MsgBeforeDetach);
    parent.node.removeChild(child.node);
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   *
   * #### Notes
   * This will remove the child from the layout.
   *
   * Subclasses should **not** typically reimplement this method.
   */
  protected onChildRemoved(msg: ChildMessage): void {
    let i = arrays.remove(this._children, msg.child);
    if (i !== -1) this.detachChild(i, msg.child);
  }

  /**
   * A message handler invoked on a `'layout-request'` message.
   *
   * #### Notes
   * The default implementation of this method is a no-op.
   *
   * Subclasses may reimplement this method as needed.
   */
  protected onLayoutRequest(msg: Message): void { }

  private _children: Widget[] = [];
}
