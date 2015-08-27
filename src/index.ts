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
  IMessageHandler, Message, clearMessageData, sendMessage
} from 'phosphor-messaging';

import {
  NodeWrapper
} from 'phosphor-nodewrapper';

import {
  IPropertyChangedArgs, IPropertyOwner, Property, clearPropertyData
} from 'phosphor-properties';

import {
  Queue
} from 'phosphor-queue';

import {
  ISignal, clearSignalData, defineSignal
} from 'phosphor-signaling';


/**
 * `p-Widget`: the class name added to Widget instances.
 */
export
const WIDGET_CLASS = 'p-Widget';

/**
 * `p-mod-hidden`: the class name added to hidden widgets.
 */
export
const HIDDEN_CLASS = 'p-mod-hidden';

/**
 * A singleton `'update-request'` message.
 *
 * #### Notes
 * This message can be dispatched to supporting widgets in order to
 * update their content. Not all widgets will respond to messages of
 * this type.
 *
 * This message is typically used to update the position and size of
 * a widget's children, or to update a widget's content to reflect the
 * current state of the widget.
 *
 * Messages of this type are compressed by default.
 *
 * **See also:** [[onUpdateRequest]]
 */
export
const MSG_UPDATE_REQUEST = new Message('update-request');

/**
 * A singleton `'layout-request'` message.
 *
 * #### Notes
 * This message can be dispatched to supporting widgets in order to
 * update their layout. Not all widgets will respond to messages of
 * this type.
 *
 * This message is typically used to update the size contraints of
 * a widget and to update the position and size of its children.
 *
 * Messages of this type are compressed by default.
 *
 * **See also:** [[onLayoutRequest]]
 */
export
const MSG_LAYOUT_REQUEST = new Message('layout-request');

/**
 * A singleton `'after-show'` message.
 *
 * #### Notes
 * This message is sent to a widget when it becomes visible.
 *
 * This message is **not** sent when the widget is attached.
 *
 * **See also:** [[isVisible]], [[onAfterShow]]
 */
export
const MSG_AFTER_SHOW = new Message('after-show');

/**
 * A singleton `'before-hide'` message.
 *
 * #### Notes
 * This message is sent to a widget when it becomes not-visible.
 *
 * This message is **not** sent when the widget is detached.
 *
 * **See also:** [[isVisible]], [[onBeforeHide]]
 */
export
const MSG_BEFORE_HIDE = new Message('before-hide');

/**
 * A singleton `'after-attach'` message.
 *
 * #### Notes
 * This message is sent to a widget after it is attached to the DOM.
 *
 * **See also:** [[isAttached]], [[onAfterAttach]]
 */
export
const MSG_AFTER_ATTACH = new Message('after-attach');

/**
 * A singleton `'before-detach'` message.
 *
 * #### Notes
 * This message is sent to a widget before it is detached from the DOM.
 *
 * **See also:** [[isAttached]], [[onBeforeDetach]]
 */
export
const MSG_BEFORE_DETACH = new Message('before-detach');

/**
 * A singleton `'close'` message.
 *
 * #### Notes
 * This message should be dispatched to a widget when it should close
 * and remove itself from the widget hierarchy.
 *
 * Widgets do not respond to this message by default. A subclass must
 * reimplement the message handler and take appropriate action.
 *
 * **See also:** [[onClose]]
 */
export
const MSG_CLOSE = new Message('close');


/**
 * The base class of the Phosphor widget hierarchy.
 *
 * #### Notes
 * This class will typically be subclassed in order to create a useful
 * widget. However, it can be used by itself to host foreign content
 * such as a React or Bootstrap component. Simply instantiate an empty
 * widget and add the content directly to its [[node]]. The widget and
 * its content can then be embedded within a Phosphor widget hierarchy.
 */
export
class Widget extends NodeWrapper implements IDisposable, IMessageHandler, IPropertyOwner {
  /**
   * A property descriptor which controls the hidden state of a widget.
   *
   * #### Notes
   * This property controls whether a widget is explicitly hidden.
   *
   * Hiding a widget will cause the widget and all of its descendants
   * to become not-visible.
   *
   * This property will toggle the presence of [[HIDDEN_CLASS]] on a
   * widget according to the property value. It will also dispatch
   * `'after-show'` and `'before-hide'` messages as appropriate.
   *
   * The default property value is `false`.
   *
   * **See also:** [[hidden]], [[isVisible]]
   */
  static hiddenProperty = new Property<Widget, boolean>({
    value: false,
    changed: onHiddenChanged,
  });

  /**
   * A signal emitted when a widget property is changed.
   */
  @defineSignal
  propertyChanged: ISignal<IPropertyChangedArgs>;

  /**
   * A signal emitted when the widget is disposed.
   *
   * **See also:** [[isDisposed]]
   */
  @defineSignal
  disposed: ISignal<void>;

  /**
   * Construct a new widget.
   *
   * @param children - The initial children for the widget.
   *
   * #### Notes
   * The [[WIDGET_CLASS]] is added to the widget during construction.
   */
  constructor(children?: Widget[]) {
    super();
    this.addClass(WIDGET_CLASS);
    if (children) children.forEach(child => this.addChild(child));
  }

  /**
   * Dispose of the widget and its descendant widgets.
   *
   * #### Notes
   * It is generally unsafe to use the widget after it has been
   * disposed.
   *
   * If this method is called more than once, all calls made after
   * the first will be a no-op.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.setFlag(WidgetFlag.IsDisposed);
    this.disposed.emit(void 0);

    if (this._parent) {
      this._parent.removeChild(this);
    } else if (this.isAttached) {
      detachWidget(this);
    }

    while (this._children.length > 0) {
      var child = this._children.pop();
      child._parent = null;
      child.dispose();
    }

    clearSignalData(this);
    clearMessageData(this);
    clearPropertyData(this);
  }

  /**
   * Test whether the widget's node is attached to the DOM.
   *
   * #### Notes
   * This is a read-only property which is always safe to access.
   *
   * **See also:** [[attachWidget]], [[detachWidget]]
   */
  get isAttached(): boolean {
    return this.testFlag(WidgetFlag.IsAttached);
  }

  /**
   * Test whether the widget has been disposed.
   *
   * #### Notes
   * This is a read-only property which is always safe to access.
   *
   * **See also:** [[disposed]]
   */
  get isDisposed(): boolean {
    return this.testFlag(WidgetFlag.IsDisposed);
  }

  /**
   * Test whether the widget is visible.
   *
   * #### Notes
   * A widget is visible when it is attached to the DOM, is not
   * explicitly hidden, and has no explicitly hidden ancestors.
   *
   * This is a read-only property which is always safe to access.
   *
   * **See also:** [[hidden]]
   */
  get isVisible(): boolean {
    return this.testFlag(WidgetFlag.IsVisible);
  }

  /**
   * Get whether the widget is explicitly hidden.
   *
   * #### Notes
   * This is a pure delegate to the [[hiddenProperty]].
   *
   * **See also:** [[isVisible]]
   */
  get hidden(): boolean {
    return Widget.hiddenProperty.get(this);
  }

  /**
   * Set whether the widget is explicitly hidden.
   *
   * #### Notes
   * This is a pure delegate to the [[hiddenProperty]].
   *
   * **See also:** [[isVisible]]
   */
  set hidden(value: boolean) {
    Widget.hiddenProperty.set(this, value);
  }

  /**
   * Get the parent of the widget.
   *
   * #### Notes
   * This will be `null` if the widget does not have a parent.
   */
  get parent(): Widget {
    return this._parent;
  }

  /**
   * Set the parent of the widget.
   *
   * @throws Will throw an error if the widget is the parent.
   *
   * #### Notes
   * If the specified parent is the current parent, this is a no-op.
   *
   * If the specified parent is `null`, this is equivalent to the
   * expression `widget.parent.removeChild(widget)`, otherwise it
   * is equivalent to the expression `parent.addChild(widget)`.
   *
   * **See also:** [[addChild]], [[insertChild]], [[removeChild]]
   */
  set parent(parent: Widget) {
    if (parent && parent !== this._parent) {
      parent.addChild(this);
    } else if (!parent && this._parent) {
      this._parent.removeChild(this);
    }
  }

  /**
   * Get a shallow copy of the array of child widgets.
   *
   * #### Notes
   * When only iterating over the children, it can be faster to use
   * the child query methods, which do not perform a copy.
   *
   * **See also:** [[childCount]], [[childAt]]
   */
  get children(): Widget[] {
    return this._children.slice();
  }

  /**
   * Set the children of the widget.
   *
   * #### Notes
   * This will clear the current child widgets and add the specified
   * child widgets. Depending on the desired outcome, it can be more
   * efficient to use one of the child manipulation methods.
   *
   * **See also:** [[addChild]], [[insertChild]], [[removeChild]]
   */
  set children(children: Widget[]) {
    this.clearChildren();
    children.forEach(child => this.addChild(child));
  }

  /**
   * Get the number of children of the widget.
   *
   * #### Notes
   * This is a read-only property.
   *
   * **See also:** [[children]], [[childAt]]
   */
  get childCount(): number {
    return this._children.length;
  }

  /**
   * Get the child widget at a specific index.
   *
   * @param index - The index of the child of interest.
   *
   * @returns The child widget at the specified index, or `undefined`
   *  if the index is out of range.
   *
   * **See also:** [[childCount]], [[childIndex]]
   */
  childAt(index: number): Widget {
    return this._children[index | 0];
  }

  /**
   * Get the index of a specific child widget.
   *
   * @param child - The child widget of interest.
   *
   * @returns The index of the specified child widget, or `-1` if
   *   the widget is not a child of this widget.
   *
   * **See also:** [[childCount]], [[childAt]]
   */
  childIndex(child: Widget): number {
    return this._children.indexOf(child);
  }

  /**
   * Add a child widget to the end of the widget's children.
   *
   * @param child - The child widget to add to this widget.
   *
   * @returns The new index of the child.
   *
   * @throws Will throw an error if a widget is added to itself.
   *
   * #### Notes
   * The child will be automatically removed from its current parent
   * before being added to this widget.
   *
   * **See also:** [[insertChild]], [[moveChild]]
   */
  addChild(child: Widget): number {
    return this.insertChild(this._children.length, child);
  }

  /**
   * Insert a child widget at a specific index.
   *
   * @param index - The target index for the widget. This will be
   *   clamped to the bounds of the children.
   *
   * @param child - The child widget to insert into the widget.
   *
   * @returns The new index of the child.
   *
   * @throws Will throw an error if a widget is inserted into itself.
   *
   * #### Notes
   * The child will be automatically removed from its current parent
   * before being added to this widget.
   *
   * **See also:** [[addChild]], [[moveChild]]
   */
  insertChild(index: number, child: Widget): number {
    if (child === this) {
      throw new Error('invalid child widget');
    }
    if (child._parent) {
      child._parent.removeChild(child);
    }
    child._parent = this;
    var i = arrays.insert(this._children, index, child);
    sendMessage(this, new ChildMessage('child-added', child, -1, i));
    return i;
  }

  /**
   * Move a child widget from one index to another.
   *
   * @param fromIndex - The index of the child of interest.
   *
   * @param toIndex - The target index for the child.
   *
   * @returns 'true' if the child was moved, or `false` if either
   *   of the given indices are out of range.
   *
   * #### Notes
   * This method can be more efficient than re-inserting an existing
   * child, as some widgets may be able to optimize child moves and
   * avoid making unnecessary changes to the DOM.
   *
   * **See also:** [[addChild]], [[insertChild]]
   */
  moveChild(fromIndex: number, toIndex: number): boolean {
    var i = fromIndex | 0;
    var j = toIndex | 0;
    if (!arrays.move(this._children, i, j)) {
      return false;
    }
    if (i !== j) {
      var child = this._children[j];
      sendMessage(this, new ChildMessage('child-moved', child, i, j));
    }
    return true;
  }

  /**
   * Remove the child widget at a specific index.
   *
   * @param index - The index of the child of interest.
   *
   * @returns The removed child widget, or `undefined` if the index
   *   is out of range.
   *
   * **See also:** [[removeChild]], [[clearChildren]]
   */
  removeChildAt(index: number): Widget {
    var i = index | 0;
    var child = arrays.removeAt(this._children, i);
    if (child) {
      child._parent = null;
      sendMessage(this, new ChildMessage('child-removed', child, i, -1));
    }
    return child;
  }

  /**
   * Remove a specific child widget from this widget.
   *
   * @param child - The child widget of interest.
   *
   * @returns The index which the child occupied, or `-1` if the
   *   child is not a child of this widget.
   *
   * **See also:** [[removeChildAt]], [[clearChildren]]
   */
  removeChild(child: Widget): number {
    var i = this.childIndex(child);
    if (i !== -1) this.removeChildAt(i);
    return i;
  }

  /**
   * Remove all child widgets from the widget.
   *
   * #### Notes
   * This will continue to remove children until the `childCount`
   * reaches zero. It is therefore possible to enter an infinite
   * loop if a message handler causes a child widget to be added
   * in response to one being removed.
   *
   * **See also:** [[removeChild]], [[removeChildAt]]
   */
  clearChildren(): void {
    while (this.childCount > 0) {
      this.removeChildAt(this.childCount - 1);
    }
  }

  /**
   * Test whether the given flag is set for the widget.
   *
   * @param flag - The widget flag of interest.
   *
   * @returns `true` if the flag is set, `false` otherwise.
   *
   * **See also:** [[setFlag]], [[clearFlag]]
   */
  testFlag(flag: WidgetFlag): boolean {
    return (this._flags & flag) !== 0;
  }

  /**
   * Set the given flag for the widget.
   *
   * @param flag - The widget flag of interest.
   *
   * **See also:** [[testFlag]], [[clearFlag]]
   */
  setFlag(flag: WidgetFlag): void {
    this._flags |= flag;
  }

  /**
   * Clear the given flag for the widget.
   *
   * @param flag - The widget flag of interest.
   *
   * **See also:** [[testFlag]], [[setFlag]]
   */
  clearFlag(flag: WidgetFlag): void {
    this._flags &= ~flag;
  }

  /**
   * Process a message sent to the widget.
   *
   * @param msg - The message sent to the widget.
   *
   * #### Notes
   * Subclasses may reimplement this method as needed.
   */
  processMessage(msg: Message): void {
    switch (msg.type) {
    case 'resize':
      this.onResize(<ResizeMessage>msg);
      break;
    case 'update-request':
      this.onUpdateRequest(msg);
      break;
    case 'layout-request':
      this.onLayoutRequest(msg);
      break;
    case 'child-added':
      this.onChildAdded(<ChildMessage>msg);
      break;
    case 'child-removed':
      this.onChildRemoved(<ChildMessage>msg);
      break;
    case 'child-moved':
      this.onChildMoved(<ChildMessage>msg);
      break;
    case 'after-show':
      this.setFlag(WidgetFlag.IsVisible);
      this.onAfterShow(msg);
      sendToShown(this._children, msg);
      break;
    case 'before-hide':
      this.onBeforeHide(msg);
      sendToShown(this._children, msg);
      this.clearFlag(WidgetFlag.IsVisible);
    case 'after-attach':
      var visible = !this.hidden && (!this._parent || this._parent.isVisible);
      if (visible) this.setFlag(WidgetFlag.IsVisible);
      this.setFlag(WidgetFlag.IsAttached);
      this.onAfterAttach(msg);
      sendToAll(this._children, msg);
      break;
    case 'before-detach':
      this.onBeforeDetach(msg);
      sendToAll(this._children, msg);
      this.clearFlag(WidgetFlag.IsVisible);
      this.clearFlag(WidgetFlag.IsAttached);
      break;
    case 'child-shown':
      this.onChildShown(<ChildMessage>msg);
      break;
    case 'child-hidden':
      this.onChildHidden(<ChildMessage>msg);
      break;
    case 'close':
      this.onClose(msg);
      break;
    }
  }

  /**
   * Compress a message posted to the widget.
   *
   * @param msg - The message posted to the widget.
   *
   * @param pending - The queue of pending messages for the widget.
   *
   * @returns `true` if the message was compressed and should be
   *   dropped, or `false` if the message should be enqueued for
   *   delivery as normal.
   *
   * #### Notes
   * The default implementation compresses 'update-request' and
   * 'layout-request' messages.
   *
   * Subclasses may reimplement this method as needed.
   */
  compressMessage(msg: Message, pending: Queue<Message>): boolean {
    if (msg.type === 'update-request' || msg.type === 'layout-request') {
      return pending.some(p => p.type === msg.type);
    }
    return false;
  }

  /**
   * A message handler invoked on a `'child-added'` message.
   *
   * #### Notes
   * The default implementation adds the child node to the widget
   * node at the proper location and dispatches an `'after-attach'`
   * message if appropriate.
   *
   * Subclasses may reimplement this method to control how the child
   * node is added, but they must dispatch an `'after-attach'` message
   * if appropriate.
   */
  protected onChildAdded(msg: ChildMessage): void {
    var next = this.childAt(msg.currentIndex + 1);
    this.node.insertBefore(msg.child.node, next && next.node);
    if (this.isAttached) sendMessage(msg.child, MSG_AFTER_ATTACH);
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   *
   * #### Notes
   * The default implementation removes the child node from the widget
   * node and dispatches a `'before-detach'` message if appropriate.
   *
   * Subclasses may reimplement this method to control how the child
   * node is removed, but they must  dispatch a `'before-detach'`
   * message if appropriate.
   */
  protected onChildRemoved(msg: ChildMessage): void {
    if (this.isAttached) sendMessage(msg.child, MSG_BEFORE_DETACH);
    this.node.removeChild(msg.child.node);
  }

  /**
   * A message handler invoked on a `'child-moved'` message.
   *
   * #### Notes
   * The default implementation moves the child node to the proper
   * location in the widget node and dispatches a `'before-detach'`
   * and `'after-attach'` message if appropriate.
   *
   * Subclasses may reimplement this method to control how the child
   * node is moved, but they must dispatch a `'before-detach'` and
   * `'after-attach'` message if appropriate.
   */
  protected onChildMoved(msg: ChildMessage): void {
    if (this.isAttached) sendMessage(msg.child, MSG_BEFORE_DETACH);
    var next = this.childAt(msg.currentIndex + 1);
    this.node.insertBefore(msg.child.node, next && next.node);
    if (this.isAttached) sendMessage(msg.child, MSG_AFTER_ATTACH);
  }

  /**
   * A message handler invoked on a `'resize'` message.
   *
   * #### Notes
   * Since it is not possible to efficiently know (in general) whether
   * a child widget has been resized due to a resize of its parent, the
   * default implementation of this method dispatches an [[UnknownSize]]
   * resize message to each child.
   *
   * Subclasses may reimplement this method as needed, but they must
   * dispatch `'resize'` messages to their children as appropriate.
   */
  protected onResize(msg: ResizeMessage): void {
    sendToAll(this._children, ResizeMessage.UnknownSize);
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MSG_UPDATE_REQUEST]]
   */
  protected onUpdateRequest(msg: Message): void { }

  /**
   * A message handler invoked on a `'layout-request'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MSG_LAYOUT_REQUEST]]
   */
  protected onLayoutRequest(msg: Message): void { }

  /**
   * A message handler invoked on an `'after-show'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MSG_AFTER_SHOW]]
   */
  protected onAfterShow(msg: Message): void { }

  /**
   * A message handler invoked on a `'before-hide'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MSG_BEFORE_HIDE]]
   */
  protected onBeforeHide(msg: Message): void { }

  /**
   * A message handler invoked on an `'after-attach'` message.
   *
   * **See also:** [[MSG_AFTER_ATTACH]]
   */
  protected onAfterAttach(msg: Message): void { }

  /**
   * A message handler invoked on a `'before-detach'` message.
   *
   * **See also:** [[MSG_BEFORE_DETACH]]
   */
  protected onBeforeDetach(msg: Message): void { }

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

  /**
   * A message handler invoked on a `'close'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MSG_CLOSE]]
   */
  protected onClose(msg: Message): void { }

  private _flags = 0;
  private _parent: Widget = null;
  private _children: Widget[] = [];
}


/**
 * An enum of widget bit flags.
 */
export
enum WidgetFlag {
  /**
   * The widget is attached to the DOM.
   */
  IsAttached = 0x1,

  /**
   * The widget is visible.
   */
  IsVisible = 0x2,

  /**
   * The widget has been disposed.
   */
  IsDisposed = 0x4,
}


/**
 * Attach a widget to a host DOM node.
 *
 * @param widget - The widget to attach to the DOM.
 *
 * @param host - The node to use as the widget's host.
 *
 * @throws Will throw an error if the widget is not a root widget,
 *   if the widget is already attached to the DOM, or if the host
 *   is not attached to the DOM.
 *
 * #### Notes
 * Only a root widget can be attached to a host node.
 *
 * This function ensures that an `'after-attach'` message is dispatched
 * to the hierarchy. It should be used in lieu of manual DOM attachment.
 */
export
function attachWidget(widget: Widget, host: HTMLElement): void {
  if (widget.parent) {
    throw new Error('only a root widget can be attached to the DOM');
  }
  if (widget.isAttached || document.body.contains(widget.node)) {
    throw new Error('widget is already attached to the DOM');
  }
  if (!document.body.contains(host)) {
    throw new Error('host is not attached to the DOM');
  }
  host.appendChild(widget.node);
  sendMessage(widget, MSG_AFTER_ATTACH);
}


/**
 * Detach a widget from its host DOM node.
 *
 * @param widget - The widget to detach from the DOM.
 *
 * @throws Will throw an error if the widget is not a root widget,
 *   or if the widget is not attached to the DOM.
 *
 * #### Notes
 * Only a root widget can be detached from its host node.
 *
 * This function ensures that a `'before-detach'` message is dispatched
 * to the hierarchy. It should be used in lieu of manual DOM detachment.
 */
export
function detachWidget(widget: Widget): void {
  if (widget.parent) {
    throw new Error('only a root widget can be detached from the DOM');
  }
  if (!widget.isAttached || !document.body.contains(widget.node)) {
    throw new Error('widget is not attached to the DOM');
  }
  sendMessage(widget, MSG_BEFORE_DETACH);
  widget.node.parentNode.removeChild(widget.node);
}


/**
 * Resize a widget to fit it's host node.
 *
 * @param widget - The widget to fit to its host.
 *
 * @throws Will throw an error if the widget is not a root widget,
 *   or if the widget has no host node.
 *
 * #### Notes
 * This will resize the widget to fit its host and will dispatch an
 * appropriate `'resize'` message.
 *
 * For this function to work properly, the host node should be an
 * offset parent; i.e. it should have `position: absolute|relative`.
 */
export
function fitWidget(widget: Widget): void {
  if (widget.parent) {
    throw new Error('only a root widget can be fit');
  }
  var host = <HTMLElement>widget.node.parentNode;
  if (!host) {
    throw new Error('widget does not have host node');
  }
  var width = host.clientWidth;
  var height = host.clientHeight;
  var style = widget.node.style;
  style.position = 'absolute';
  style.top = '0px';
  style.left = '0px';
  style.width = width + 'px';
  style.height = height + 'px';
  sendMessage(widget, new ResizeMessage(width, height));
}


/**
 * A message class for child-related messages.
 */
export
class ChildMessage extends Message {
  /**
   * Construct a new child message.
   *
   * @param type - The message type.
   *
   * @param child - The child widget for the message.
   *
   * @param previousIndex - The previous index of the child, if known.
   *   The default index is `-1` and indicates an unknown index.
   *
   * @param currentIndex - The current index of the child, if known.
   *   The default index is `-1` and indicates an unknown index.
   */
  constructor(type: string, child: Widget, previousIndex = -1, currentIndex = -1) {
    super(type);
    this._child = child;
    this._currentIndex = currentIndex;
    this._previousIndex = previousIndex;
  }

  /**
   * The child widget for the message.
   *
   * #### Notes
   * This is a read-only property.
   */
  get child(): Widget {
    return this._child;
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

  private _child: Widget;
  private _currentIndex: number;
  private _previousIndex: number;
}


/**
 * A message class for 'resize' messages.
 */
export
class ResizeMessage extends Message {
  /**
   * A singleton 'resize' message with an unknown size.
   */
  static UnknownSize = new ResizeMessage(-1, -1);

  /**
   * Construct a new resize message.
   *
   * @param width - The **offset width** of the widget, or `-1` if
   *   the width is not known.
   *
   * @param height - The **offset height** of the widget, or `-1` if
   *   the height is not known.
   */
  constructor(width: number, height: number) {
    super('resize');
    this._width = width;
    this._height = height;
  }

  /**
   * The offset width of the widget.
   *
   * #### Notes
   * This will be `-1` if the width is unknown.
   *
   * This is a read-only property.
   */
  get width(): number {
    return this._width;
  }

  /**
   * The offset height of the widget.
   *
   * #### Notes
   * This will be `-1` if the height is unknown.
   *
   * This is a read-only property.
   */
  get height(): number {
    return this._height;
  }

  private _width: number;
  private _height: number;
}


/**
 * The change handler for the [[hiddenProperty]].
 */
function onHiddenChanged(owner: Widget, old: boolean, hidden: boolean): void {
  if (hidden) {
    if (owner.isAttached && (!owner.parent || owner.parent.isVisible)) {
      sendMessage(owner, MSG_BEFORE_HIDE);
    }
    owner.addClass(HIDDEN_CLASS);
    if (owner.parent) {
      sendMessage(owner.parent, new ChildMessage('child-hidden', owner));
    }
  } else {
    owner.removeClass(HIDDEN_CLASS);
    if (owner.isAttached && (!owner.parent || owner.parent.isVisible)) {
      sendMessage(owner, MSG_AFTER_SHOW);
    }
    if (owner.parent) {
      sendMessage(owner.parent, new ChildMessage('child-shown', owner));
    }
  }
}


/**
 * Send a message to all widgets in an array.
 */
function sendToAll(array: Widget[], msg: Message): void {
  for (var i = 0; i < array.length; ++i) {
    sendMessage(array[i], msg);
  }
}


/**
 * Send a message to all non-hidden widgets in an array.
 */
function sendToShown(array: Widget[], msg: Message): void {
  for (var i = 0; i < array.length; ++i) {
    if (!array[i].hidden) sendMessage(array[i], msg);
  }
}
