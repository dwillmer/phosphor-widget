/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IDisposable
} from 'phosphor-disposable';

import {
  IMessageHandler, Message, clearMessageData, postMessage, sendMessage
} from 'phosphor-messaging';

import {
  NodeWrapper
} from 'phosphor-nodewrapper';

import {
  Property, clearPropertyData
} from 'phosphor-properties';

import {
  Queue
} from 'phosphor-queue';

import {
  ISignal, Signal, clearSignalData
} from 'phosphor-signaling';


/**
 * The class name added to Widget instances.
 */
const WIDGET_CLASS = 'p-Widget';

/**
 * The class name added to hidden widgets.
 */
const HIDDEN_CLASS = 'p-mod-hidden';


/**
 * The base class of the Phosphor widget hierarchy.
 *
 * #### Notes
 * This class will typically be subclassed in order to create a useful
 * widget. However, it can be used by itself to host externally created
 * content. Simply instantiate an empty widget and add the DOM content
 * directly to the widget's `.node`.
 */
export
class Widget extends NodeWrapper implements IDisposable, IMessageHandler {
  /**
   * A singleton `'update-request'` message.
   *
   * #### Notes
   * This message can be dispatched to supporting widgets in order to
   * update their content. Not all widgets will respond to messages of
   * this type.
   *
   * This message is typically used to update the position and size of
   * a widget's children, or to update a widget's content to reflect
   * the current widget state.
   *
   * Messages of this type are compressed by default.
   *
   * **See also:** [[update]], [[onUpdateRequest]]
   */
  static MsgUpdateRequest = new Message('update-request');

  /**
   * A singleton `'layout-request'` message.
   *
   * #### Notes
   * This message can be dispatched to supporting widgets in order to
   * update their layout. Not all widgets will respond to messages of
   * this type.
   *
   * This message is typically used to update the size constraints of
   * a widget and to update the position and size of its children.
   *
   * Messages of this type are compressed by default.
   *
   * **See also:** [[onLayoutRequest]]
   */
  static MsgLayoutRequest = new Message('layout-request');

  /**
   * A singleton `'close-request'` message.
   *
   * #### Notes
   * This message should be dispatched to a widget when it should close
   * and remove itself from the widget hierarchy.
   *
   * Messages of this type are compressed by default.
   *
   * **See also:** [[close]], [[onCloseRequest]]
   */
  static MsgCloseRequest = new Message('close-request');

  /**
   * A singleton `'after-show'` message.
   *
   * #### Notes
   * This message is sent to a widget after it becomes visible.
   *
   * This message is **not** sent when the widget is being attached.
   *
   * **See also:** [[isVisible]], [[onAfterShow]]
   */
  static MsgAfterShow = new Message('after-show');

  /**
   * A singleton `'before-hide'` message.
   *
   * #### Notes
   * This message is sent to a widget before it becomes not-visible.
   *
   * This message is **not** sent when the widget is being detached.
   *
   * **See also:** [[isVisible]], [[onBeforeHide]]
   */
  static MsgBeforeHide = new Message('before-hide');

  /**
   * A singleton `'after-attach'` message.
   *
   * #### Notes
   * This message is sent to a widget after it is attached to the DOM.
   *
   * **See also:** [[isAttached]], [[onAfterAttach]]
   */
  static MsgAfterAttach = new Message('after-attach');

  /**
   * A singleton `'before-detach'` message.
   *
   * #### Notes
   * This message is sent to a widget before it is detached from the DOM.
   *
   * **See also:** [[isAttached]], [[onBeforeDetach]]
   */
  static MsgBeforeDetach = new Message('before-detach');

  /**
   * A signal emitted when the widget is disposed.
   *
   * **See also:** [[disposed]], [[isDisposed]]
   */
  static disposedSignal = new Signal<Widget, void>();

  /**
   * A property descriptor which controls the hidden state of a widget.
   *
   * #### Notes
   * This controls whether a widget is explicitly hidden.
   *
   * Hiding a widget will cause the widget and all of its descendants
   * to become not-visible.
   *
   * This will toggle the presence of `'p-mod-hidden'` on a widget. It
   * will also dispatch `'after-show'` and `'before-hide'` messages as
   * appropriate.
   *
   * The default value is `false`.
   *
   * **See also:** [[hidden]], [[isVisible]]
   */
  static hiddenProperty = new Property<Widget, boolean>({
    name: 'hidden',
    value: false,
    changed: onHiddenChanged,
  });

  /**
   * Construct a new widget.
   */
  constructor() {
    super();
    this.addClass(WIDGET_CLASS);
  }

  /**
   * Dispose of the widget and its descendants.
   *
   * #### Notes
   * It is generally unsafe to use the widget after it is disposed.
   *
   * If this method is called more than once, all calls made after
   * the first will be a no-op.
   */
  dispose(): void {
    // Do nothing if the widget is already disposed.
    if (this.isDisposed) {
      return;
    }

    // Set the disposed flag and emit the disposed signal.
    this._flags |= WidgetFlag.IsDisposed;
    this.disposed.emit(void 0);

    // Remove or detach the widget if necessary.
    if (this.parent) {
      this.remove();
    } else if (this.isAttached) {
      this.detach();
    }

    // Let a subclass dispose of its children.
    this.disposeChildren();

    // Clear the extra data associated with the widget.
    clearSignalData(this);
    clearMessageData(this);
    clearPropertyData(this);
  }

  /**
   * A signal emitted when the widget is disposed.
   *
   * #### Notes
   * This is a pure delegate to the [[disposedSignal]].
   */
  get disposed(): ISignal<Widget, void> {
    return Widget.disposedSignal.bind(this);
  }

  /**
   * Test whether the widget's node is attached to the DOM.
   *
   * #### Notes
   * This is a read-only property which is always safe to access.
   *
   * **See also:** [[attach]], [[detach]]
   */
  get isAttached(): boolean {
    return (this._flags & WidgetFlag.IsAttached) !== 0;
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
    return (this._flags & WidgetFlag.IsDisposed) !== 0;
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
    return (this._flags & WidgetFlag.IsVisible) !== 0;
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
   *
   * This is a read-only property.
   */
  get parent(): Widget {
    return this._parent;
  }

  /**
   * Remove the widget from its current parent.
   *
   * #### Notes
   * This is a no-op if the widget does not have a parent.
   */
  remove(): void {
    let old = this._parent; this._parent = null;
    if (old && !old.isDisposed) old.removeChild(this);
  }

  /**
   * Post an `'update-request'` message to the widget.
   *
   * #### Notes
   * This is a convenience method for posting the message to `this`.
   *
   * **See also:** [[MsgUpdateRequest]], [[onUpdateRequest]]
   */
  update(): void {
    postMessage(this, Widget.MsgUpdateRequest);
  }

  /**
   * Send a `'close-request'` message to the widget.
   *
   * #### Notes
   * This is a convenience method for sending the message to `this`.
   *
   * **See also:** [[MsgCloseRequest]], [[onCloseRequest]]
   */
  close(): void {
    sendMessage(this, Widget.MsgCloseRequest);
  }

  /**
   * Attach the widget to a host DOM node.
   *
   * @param host - The DOM node to use as the widget's host.
   *
   * @throws Will throw an error if the widget is not a root widget,
   *   if the widget is already attached to the DOM, or if the host
   *   is not attached to the DOM.
   *
   * #### Notes
   * The function should be used in lieu of manual DOM attachment. It
   * ensures that an `'after-attach'` message is properly dispatched
   * to the widget hierarchy.
   */
  attach(host: HTMLElement): void {
    if (this.parent) {
      throw new Error('only a root widget can be attached to the DOM');
    }
    if (this.isAttached || document.body.contains(this.node)) {
      throw new Error('widget is already attached to the DOM');
    }
    if (!document.body.contains(host)) {
      throw new Error('host is not attached to the DOM');
    }
    host.appendChild(this.node);
    sendMessage(this, Widget.MsgAfterAttach);
  }

  /**
   * Detach the widget from its host DOM node.
   *
   * @throws Will throw an error if the widget is not a root widget,
   *   or if the widget is not attached to the DOM.
   *
   * #### Notes
   * The function should be used in lieu of manual DOM detachment. It
   * ensures that a `'before-detach'` message is properly dispatched
   * to the widget hierarchy.
   */
  detach(): void {
    if (this.parent) {
      throw new Error('only a root widget can be detached from the DOM');
    }
    if (!this.isAttached || !document.body.contains(this.node)) {
      throw new Error('widget is not attached to the DOM');
    }
    sendMessage(this, Widget.MsgBeforeDetach);
    this.node.parentNode.removeChild(this.node);
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
      this.onResize(msg as ResizeMessage);
      break;
    case 'update-request':
      this.onUpdateRequest(msg);
      break;
    case 'layout-request':
      this.onLayoutRequest(msg);
      break;
    case 'after-show':
      this._flags |= WidgetFlag.IsVisible;
      this.onAfterShow(msg);
      break;
    case 'before-hide':
      this.onBeforeHide(msg);
      this._flags &= ~WidgetFlag.IsVisible;
      break;
    case 'after-attach':
      let visible = !this.hidden && (!this.parent || this.parent.isVisible);
      if (visible) this._flags |= WidgetFlag.IsVisible;
      this._flags |= WidgetFlag.IsAttached;
      this.onAfterAttach(msg);
      break;
    case 'before-detach':
      this.onBeforeDetach(msg);
      this._flags &= ~WidgetFlag.IsVisible;
      this._flags &= ~WidgetFlag.IsAttached;
      break;
    case 'child-shown':
      this.onChildShown(msg as ChildMessage);
      break;
    case 'child-hidden':
      this.onChildHidden(msg as ChildMessage);
      break;
    case 'close-request':
      this.onCloseRequest(msg);
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
   * The default implementation compresses `'update-request'`.
   *
   * Subclasses may reimplement this method as needed.
   */
  compressMessage(msg: Message, pending: Queue<Message>): boolean {
    if (msg.type === 'update-request') {
      return pending.some(other => other.type === 'update-request');
    }
    if (msg.type === 'layout-request') {
      return pending.some(other => other.type === 'layout-request');
    }
    return false;
  }

  /**
   * Adopt the specified child and set its parent to this widget.
   *
   * @param child - The child widget to adopt.
   *
   * #### Notes
   * This should be called by subclasses which support children in
   * order to update the parent reference when a child is added.
   *
   * This will set the parent reference to the specified child after
   * removing the child from its current parent.
   */
  protected adoptChild(child: Widget): void {
    if (child._parent && child._parent !== this) child.remove();
    child._parent = this;
  }

  /**
   * Remove the specified child from the widget.
   *
   * #### Notes
   * This method **must** be reimplemented by subclasses which support
   * children, or undefined behavior will result.
   *
   * This method is called automatically as needed. It should not be
   * invoked directly by user code.
   *
   * The default implementation of this method is a no-op.
   */
  protected removeChild(child: Widget): void { }

  /**
   * Dispose the children of the widget.
   *
   * #### Notes
   * This method **must** be reimplemented by subclasses which support
   * children, or undefined behavior will result.
   *
   * This is called by the `dispose` method at the point where child
   * widgets should be disposed. A subclass should call the `dispose`
   * method of each child and then clear the reference to the child.
   *
   * This method is called automatically as needed. It should not be
   * invoked directly by user code.
   *
   * The default implementation of this method is a no-op.
   */
  protected disposeChildren(): void { }

  /**
   * A message handler invoked on a `'close-request'` message.
   *
   * #### Notes
   * The default implementation of this handler will remove or detach
   * the widget as appropriate.
   *
   * Subclasses may reimplement this handler for custom close behavior.
   *
   * **See also:** [[close]], [[MsgCloseRequest]]
   */
  protected onCloseRequest(msg: Message): void {
    if (this.parent) {
      this.remove();
    } else if (this.isAttached) {
      this.detach();
    }
  }

  /**
   * A message handler invoked on a `'resize'` message.
   *
   * The default implementation of this handler is a no-op.
   */
  protected onResize(msg: ResizeMessage): void { }

  /**
   * A message handler invoked on an `'update-request'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[update]], [[MsgUpdateRequest]]
   */
  protected onUpdateRequest(msg: Message): void { }

  /**
   * A message handler invoked on a `'layout-request'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MsgLayoutRequest]]
   */
  protected onLayoutRequest(msg: Message): void { }

  /**
   * A message handler invoked on an `'after-show'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MsgAfterShow]]
   */
  protected onAfterShow(msg: Message): void { }

  /**
   * A message handler invoked on a `'before-hide'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MsgBeforeHide]]
   */
  protected onBeforeHide(msg: Message): void { }

  /**
   * A message handler invoked on an `'after-attach'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MsgAfterAttach]]
   */
  protected onAfterAttach(msg: Message): void { }

  /**
   * A message handler invoked on a `'before-detach'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MsgBeforeDetach]]
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

  private _flags = 0;
  private _parent: Widget = null;
}


/**
 * A message class for child related messages.
 */
export
class ChildMessage extends Message {
  /**
   * Construct a new child message.
   *
   * @param type - The message type.
   *
   * @param child - The child widget for the message.
   */
  constructor(type: string, child: Widget) {
    super(type);
    this._child = child;
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

  private _child: Widget;
}


/**
 * A message class for `'resize'` messages.
 */
export
class ResizeMessage extends Message {
  /**
   * A singleton `'resize'` message with an unknown size.
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
 * An enum of widget bit flags.
 */
const enum WidgetFlag {
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
 * The change handler for the [[hiddenProperty]].
 */
function onHiddenChanged(owner: Widget, old: boolean, hidden: boolean): void {
  if (hidden) {
    if (owner.isAttached && (!owner.parent || owner.parent.isVisible)) {
      sendMessage(owner, Widget.MsgBeforeHide);
    }
    owner.addClass(HIDDEN_CLASS);
    if (owner.parent) {
      sendMessage(owner.parent, new ChildMessage('child-hidden', owner));
    }
  } else {
    owner.removeClass(HIDDEN_CLASS);
    if (owner.isAttached && (!owner.parent || owner.parent.isVisible)) {
      sendMessage(owner, Widget.MsgAfterShow);
    }
    if (owner.parent) {
      sendMessage(owner.parent, new ChildMessage('child-shown', owner));
    }
  }
}
