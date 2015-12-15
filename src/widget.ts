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
  clearPropertyData
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
 * widget. However, it can be used directly to host externally created
 * content. Simply instantiate an empty widget and add the DOM content
 * directly to the widget's `.node`.
 */
export
class Widget extends NodeWrapper implements IDisposable, IMessageHandler {
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
   * All calls made to this method after the first are a no-op.
   */
  dispose(): void {
    // Do nothing if the widget is already disposed.
    if (this.isDisposed) {
      return;
    }

    // Set the disposed flag and emit the disposed signal.
    this.setFlag(WidgetFlag.IsDisposed);
    this.disposed.emit(void 0);

    // Remove or detach the widget if necessary.
    if (this.parent) {
      this.parent = null;
    } else if (this.isAttached) {
      this.detach();
    }

    // Dispose of the widget layout.
    if (this._layout) {
      this._layout.dispose();
      this._layout = null;
    }

    // Clear the attached data associated with the widget.
    clearSignalData(this);
    clearMessageData(this);
    clearPropertyData(this);
  }

  /**
   * A signal emitted when the widget is disposed.
   *
   * **See also:** [[dispose]], [[disposed]]
   */
  get disposed(): ISignal<Widget, void> {
    return Widget.disposedSignal.bind(this);
  }

  /**
   * Test whether the widget has been disposed.
   *
   * #### Notes
   * This is a read-only property.
   *
   * **See also:** [[dispose]], [[disposed]]
   */
  get isDisposed(): boolean {
    return this.testFlag(WidgetFlag.IsDisposed);
  }

  /**
   * Test whether the widget's node is attached to the DOM.
   *
   * #### Notes
   * This is a read-only property.
   *
   * **See also:** [[attach]], [[detach]]
   */
  get isAttached(): boolean {
    return this.testFlag(WidgetFlag.IsAttached);
  }

  /**
   * Test whether the widget is explicitly hidden.
   *
   * #### Notes
   * This is a read-only property.
   *
   * **See also:** [[isVisible]], [[hide]], [[show]]
   */
  get isHidden(): boolean {
    return this.testFlag(WidgetFlag.IsHidden);
  }

  /**
   * Test whether the widget is visible.
   *
   * #### Notes
   * A widget is visible when it is attached to the DOM, is not
   * explicitly hidden, and has no explicitly hidden ancestors.
   *
   * This is a read-only property.
   *
   * **See also:** [[isHidden]], [[hide]], [[show]]
   */
  get isVisible(): boolean {
    return this.testFlag(WidgetFlag.IsVisible);
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
   * #### Notes
   * The widget will be automatically removed from its current parent.
   *
   * This is a no-op if there is no effective parent change.
   */
  set parent(value: Widget) {
    value = value || null;
    let old = this._parent;
    if (old === value) {
      return;
    }
    if (value && this.contains(value)) {
      throw new Error('Invalid parent widget.');
    }
    if (old) {
      this._parent = null;
      sendMessage(old, new ChildMessage('child-removed', this));
    }
    if (value) {
      this._parent = value;
      sendMessage(value, new ChildMessage('child-added', this));
    }
  }

  /**
   * Get the layout for the widget.
   *
   * #### Notes
   * This will be `null` if the widget does not have a layout.
   */
  get layout(): Layout {
    return this._layout;
  }

  /**
   * Set the layout for the widget.
   *
   * #### Notes
   * The layout is single-use only. It cannot be set to `null` and it
   * cannot be changed after the first assignment.
   *
   * The layout is disposed automatically when the widget is disposed.
   */
  set layout(value: Layout) {
    if (!value) {
      throw new Error('Cannot set widget layout to null.');
    }
    if (this._layout === value) {
      return;
    }
    if (this._layout) {
      throw new Error('Cannot change widget layout.');
    }
    if (value.parent) {
      throw new Error('Cannot change layout parent.');
    }
    this._layout = value;
    value.parent = this;
  }

  /**
   * Test whether a widget is a descendant of this widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns `true` if the widget is a descendant, `false` otherwise.
   */
  contains(widget: Widget): boolean {
    while (widget) {
      if (widget === this) {
        return true;
      }
      widget = widget._parent;
    }
    return false;
  }

  /**
   * Post an `'update-request'` message to the widget.
   *
   * **See also:** [[MsgUpdateRequest]], [[onUpdateRequest]]
   */
  update(): void {
    postMessage(this, Widget.MsgUpdateRequest);
  }

  /**
   * Send a `'close-request'` message to the widget.
   *
   * **See also:** [[MsgCloseRequest]], [[onCloseRequest]]
   */
  close(): void {
    sendMessage(this, Widget.MsgCloseRequest);
  }

  /**
   * Show the widget and make it visible to its parent widget.
   *
   * #### Notes
   * This causes the [[isHidden]] property to be `false`.
   */
  show(): void {
    if (!this.testFlag(WidgetFlag.IsHidden)) {
      return;
    }
    this.clearFlag(WidgetFlag.IsHidden);
    this.removeClass(HIDDEN_CLASS);
    if (this.isAttached && (!this.parent || this.parent.isVisible)) {
      sendMessage(this, Widget.MsgAfterShow);
    }
    if (this.parent) {
      sendMessage(this.parent, new ChildMessage('child-shown', this));
    }
  }

  /**
   * Hide the widget and make it hidden to its parent widget.
   *
   * #### Notes
   * This causes the [[isHidden]] property to be `true`.
   */
  hide(): void {
    if (this.testFlag(WidgetFlag.IsHidden)) {
      return;
    }
    this.setFlag(WidgetFlag.IsHidden);
    if (this.isAttached && (!this.parent || this.parent.isVisible)) {
      sendMessage(this, Widget.MsgBeforeHide);
    }
    this.addClass(HIDDEN_CLASS);
    if (this.parent) {
      sendMessage(this.parent, new ChildMessage('child-hidden', this));
    }
  }

  /**
   * Attach the widget to a host DOM node.
   *
   * @param host - The DOM node to use as the widget's host.
   *
   * @throws An error if the widget is not a root widget, if the widget
   *   is already attached, or if the host is not attached to the DOM.
   */
  attach(host: HTMLElement): void {
    if (this.parent) {
      throw new Error('Cannot attach child widget.');
    }
    if (this.isAttached || document.body.contains(this.node)) {
      throw new Error('Widget already attached.');
    }
    if (!document.body.contains(host)) {
      throw new Error('Host not attached.');
    }
    host.appendChild(this.node);
    sendMessage(this, Widget.MsgAfterAttach);
  }

  /**
   * Detach the widget from its host DOM node.
   *
   * @throws An error if the widget is not a root widget, or if the
   *   widget is not attached.
   */
  detach(): void {
    if (this.parent) {
      throw new Error('Cannot detach child widget.');
    }
    if (!this.isAttached || !document.body.contains(this.node)) {
      throw new Error('Widget not attached.');
    }
    sendMessage(this, Widget.MsgBeforeDetach);
    this.node.parentNode.removeChild(this.node);
  }

  /**
   * Test whether the given widget flag is set.
   */
  testFlag(flag: WidgetFlag): boolean {
    return (this._flags & flag) !== 0;
  }

  /**
   * Set the given widget flag.
   */
  setFlag(flag: WidgetFlag): void {
    this._flags |= flag;
  }

  /**
   * Clear the given widget flag.
   */
  clearFlag(flag: WidgetFlag): void {
    this._flags &= ~flag;
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
   * The default implementation compresses `'update-request'` and
   * `'layout-request'` messages.
   *
   * Subclasses may reimplement this method as needed.
   */
  compressMessage(msg: Message, pending: Queue<Message>): boolean {
    if (msg.type === 'update-request' || msg.type === 'layout-request') {
      return pending.some(other => other.type === msg.type);
    }
    return false;
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
      this.notifyLayout(msg);
      this.onResize(msg as ResizeMessage);
      break;
    case 'update-request':
      this.notifyLayout(msg);
      this.onUpdateRequest(msg);
      break;
    case 'after-show':
      this.setFlag(WidgetFlag.IsVisible);
      this.notifyLayout(msg);
      this.onAfterShow(msg);
      break;
    case 'before-hide':
      this.notifyLayout(msg);
      this.onBeforeHide(msg);
      this.clearFlag(WidgetFlag.IsVisible);
      break;
    case 'after-attach':
      let visible = !this.isHidden && (!this.parent || this.parent.isVisible);
      if (visible) this.setFlag(WidgetFlag.IsVisible);
      this.setFlag(WidgetFlag.IsAttached);
      this.notifyLayout(msg);
      this.onAfterAttach(msg);
      break;
    case 'before-detach':
      this.notifyLayout(msg);
      this.onBeforeDetach(msg);
      this.clearFlag(WidgetFlag.IsVisible);
      this.clearFlag(WidgetFlag.IsAttached);
      break;
    case 'close-request':
      this.notifyLayout(msg);
      this.onCloseRequest(msg);
      break;
    default:
      this.notifyLayout(msg);
      break;
    }
  }

  /**
   * Invoke the message processing routine of the widget's layout.
   *
   * @param msg - The message to dispatch to the layout.
   *
   * #### Notes
   * This is a no-op if the widget does not have a layout.
   *
   * Subclasses may reimplement this method as needed.
   */
  protected notifyLayout(msg: Message): void {
    if (this._layout) this._layout.processParentMessage(msg);
  }

  /**
   * A message handler invoked on a `'close-request'` message.
   *
   * #### Notes
   * The default implementation of this handler detaches the widget.
   *
   * **See also:** [[close]], [[MsgCloseRequest]]
   */
  protected onCloseRequest(msg: Message): void {
    if (this.parent) {
      this.parent = null;
    } else if (this.isAttached) {
      this.detach();
    }
  }

  /**
   * A message handler invoked on a `'resize'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[ResizeMessage]]
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

  private _flags = 0;
  private _layout: Layout = null;
  private _parent: Widget = null;
}


/**
 * The namespace for the `Widget` class statics.
 */
export
namespace Widget {
  /**
   * A singleton `'update-request'` message.
   *
   * #### Notes
   * This message can be dispatched to supporting widgets in order to
   * update their content. Not all widgets will respond to messages of
   * this type.
   *
   * This message is typically used to update the widget's content to
   * reflect the current widget state.
   *
   * Messages of this type are compressed by default.
   *
   * **See also:** [[update]], [[onUpdateRequest]]
   */
  export
  const MsgUpdateRequest = new Message('update-request');

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
  export
  const MsgLayoutRequest = new Message('layout-request');

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
  export
  const MsgCloseRequest = new Message('close-request');

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
  export
  const MsgAfterShow = new Message('after-show');

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
  export
  const MsgBeforeHide = new Message('before-hide');

  /**
   * A singleton `'after-attach'` message.
   *
   * #### Notes
   * This message is sent to a widget after it is attached.
   *
   * **See also:** [[isAttached]], [[onAfterAttach]]
   */
  export
  const MsgAfterAttach = new Message('after-attach');

  /**
   * A singleton `'before-detach'` message.
   *
   * #### Notes
   * This message is sent to a widget before it is detached.
   *
   * **See also:** [[isAttached]], [[onBeforeDetach]]
   */
  export
  const MsgBeforeDetach = new Message('before-detach');

  /**
   * A signal emitted when the widget is disposed.
   *
   * **See also:** [[disposed]], [[isDisposed]]
   */
  export
  const disposedSignal = new Signal<Widget, void>();
}


/**
 * The abstract base class of Phosphor layouts.
 *
 * #### Notes
 * A layout is used to add child widgets to a parent and to arrange
 * those children within the parent's node.
 *
 * This class must be subclassed to make a fully functioning layout.
 */
export
abstract class Layout implements IDisposable {
  /**
   * Initialize the children of the layout.
   *
   * #### Notes
   * This method is called automatically when the layout is installed
   * on its parent widget. It should reparent all child widgets to the
   * layout parent and add the child nodes to the DOM as appropriate.
   *
   * This abstract method must be implemented by a subclass.
   */
  protected abstract initialize(): void;

  /**
   * A message handler invoked on a `'resize'` message.
   *
   * #### Notes
   * The subclass should either handle the resize message, or dispatch
   * a `ResizeMessage.UnknownSize` message to the relevant children.
   *
   * This abstract method must be implemented by a subclass.
   */
  protected abstract onResize(msg: ResizeMessage): void;

  /**
   * A message handler invoked on an `'update-request'` message.
   *
   * #### Notes
   * The subclass should either handle the update message, or dispatch
   * a `ResizeMessage.UnknownSize` message to the relevant children.
   *
   * This abstract method must be implemented by a subclass.
   */
  protected abstract onUpdateRequest(msg: Message): void;

  /**
   * A message handler invoked on a `'layout-request'` message.
   *
   * #### Notes
   * The subclass should update its size constraints and the layout
   * geometry of the relevant children.
   *
   * If the size constraints change, the subclass should forward the
   * message to the ancestor so that the change propagates upward.
   *
   * This abstract method must be implemented by a subclass.
   */
  protected abstract onLayoutRequest(msg: Message): void;

  /**
   * A message handler invoked on a `'child-removed'` message.
   *
   * #### Notes
   * The subclass should remove the child widget from the layout.
   *
   * This abstract method must be implemented by a subclass.
   */
  protected abstract onChildRemoved(msg: ChildMessage): void;

  /**
   * A message handler invoked on an `'after-attach'` message.
   *
   * #### Notes
   * The subclass should forward the message to the relevant children.
   *
   * This abstract method must be implemented by a subclass.
   */
  protected abstract onAfterAttach(msg: Message): void;

  /**
   * A message handler invoked on a `'before-detach'` message.
   *
   * #### Notes
   * The subclass should forward the message to the relevant children.
   *
   * This abstract method must be implemented by a subclass.
   */
  protected abstract onBeforeDetach(msg: Message): void;

  /**
   * A message handler invoked on an `'after-show'` message.
   *
   * #### Notes
   * The subclass should forward the message to the relevant children.
   *
   * This abstract method must be implemented by a subclass.
   */
  protected abstract onAfterShow(msg: Message): void;

  /**
   * A message handler invoked on a `'before-hide'` message.
   *
   * #### Notes
   * The subclass should forward the message to the relevant children.
   *
   * This abstract method must be implemented by a subclass.
   */
  protected abstract onBeforeHide(msg: Message): void;

  /**
   * Dispose of the resources held by the layout.
   */
  dispose(): void {
    this._disposed = true;
    this._parent = null;
    clearSignalData(this);
    clearPropertyData(this);
  }

  /**
   * Test whether the layout is disposed.
   *
   * #### Notes
   * This is a read-only property.
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Get the parent widget of the layout.
   */
  get parent(): Widget {
    return this._parent;
  }

  /**
   * Set the parent widget of the layout.
   *
   * #### Notes
   * This is set automatically when installing the layout on the parent
   * widget. The layout parent should not be set directly by user code.
   */
  set parent(value: Widget) {
    if (!value) {
      throw new Error('Cannot set layout parent to null.');
    }
    if (this._parent === value) {
      return;
    }
    if (this._parent) {
      throw new Error('Cannot change layout parent.');
    }
    if (value.layout !== this) {
      throw new Error('Invalid layout parent.');
    }
    this._parent = value;
    this.initialize();
  }

  /**
   * Process a message sent to the parent widget.
   *
   * @param msg - The message sent to the parent widget.
   *
   * #### Notes
   * This is method is called by the parent to process a message.
   *
   * Subclasses may reimplement this method as needed.
   */
  processParentMessage(msg: Message): void {
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
    case 'child-removed':
      this.onChildRemoved(msg as ChildMessage);
      break;
    case 'after-attach':
      this.onAfterAttach(msg);
      break;
    case 'before-detach':
      this.onBeforeDetach(msg);
      break;
    case 'after-show':
      this.onAfterShow(msg);
      break;
    case 'before-hide':
      this.onBeforeHide(msg);
      break;
    }
  }

  private _disposed = false;
  private _parent: Widget = null;
}


/**
 * An enum of widget bit flags.
 */
export
enum WidgetFlag {
  /**
   * The widget has been disposed.
   */
  IsDisposed = 0x1,

  /**
   * The widget is attached to the DOM.
   */
  IsAttached = 0x2,

  /**
   * The widget is hidden.
   */
  IsHidden = 0x4,

  /**
   * The widget is visible.
   */
  IsVisible = 0x8
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
 * The namespace for the `ResizeMessage` class statics.
 */
export
namespace ResizeMessage {
  /**
   * A singleton `'resize'` message with an unknown size.
   */
  export
  const UnknownSize = new ResizeMessage(-1, -1);
}
