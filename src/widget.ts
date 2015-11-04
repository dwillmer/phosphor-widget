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

import {
  ChildMessage, ResizeMessage
} from './messages';

import {
  Panel
} from './panel';

import {
  Title
} from './title';


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
 * directly to the widget's `node`. The widget and its content can be
 * inserted into any Phosphor widget hierarchy.
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
   * a panel's children, or to update a widget's content to reflect the
   * current widget state.
   *
   * Messages of this type are compressed by default.
   *
   * **See also:** [[update]], [[onUpdateRequest]]
   */
  static MsgUpdateRequest = new Message('update-request');

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
   * This message is **not** sent when the widget is attached.
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
   * This message is **not** sent when the widget is detached.
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
   * The function should be used in lieu of manual DOM attachment. It
   * ensures that an `'after-attach'` message is properly dispatched
   * to the widget hierarchy.
   */
  static attach(widget: Widget, host: HTMLElement): void {
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
    sendMessage(widget, Widget.MsgAfterAttach);
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
   * The function should be used in lieu of manual DOM detachment. It
   * ensures that a `'before-detach'` message is properly dispatched
   * to the widget hierarchy.
   */
  static detach(widget: Widget): void {
    if (widget.parent) {
      throw new Error('only a root widget can be detached from the DOM');
    }
    if (!widget.isAttached || !document.body.contains(widget.node)) {
      throw new Error('widget is not attached to the DOM');
    }
    sendMessage(widget, Widget.MsgBeforeDetach);
    widget.node.parentNode.removeChild(widget.node);
  }

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

    // Unparent or detach the widget if necessary.
    if (this.parent) {
      this.parent.children.remove(this);
    } else if (this.isAttached) {
      Widget.detach(this);
    }

    // Dispose of the children if the widget is a panel. The `any` cast
    // is required to work around the lack of `friend class` modifiers.
    //
    // Note that children are diposed here, instead of in a Panel class
    // dispose method so that children are disposed *after* the signal
    // is emitted, and *after* their ancestor is detached from the DOM.
    if (this instanceof Panel) {
      (this as any).children.dispose();
    }

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
   * Get the title data object for the widget.
   *
   * #### Notes
   * The title data is used by some container widgets when displaying
   * the widget along with a title, such as a tab panel or dock panel.
   *
   * Not all widgets will make use of the title data, so it is created
   * on-demand the first time it is accessed.
   */
  get title(): Title {
    return getTitle(this);
  }

  /**
   * Get the parent panel of the widget.
   *
   * #### Notes
   * This will be `null` if the widget does not have a parent.
   *
   * This is a read-only property.
   */
  get parent(): Panel {
    return this._parent;
  }

  /**
   * Post an `'update-request'` message to the widget.
   *
   * #### Notes
   * This is a simple convenience method for posting the message.
   *
   * **See also:** [[MsgUpdateRequest]], [[onUpdateRequest]]
   */
  update(): void {
    postMessage(this, Widget.MsgUpdateRequest);
  }

  /**
   * Post a `'close-request'` message to the widget.
   *
   * #### Notes
   * This is a simple convenience method for posting the message.
   *
   * **See also:** [[MsgCloseRequest]], [[onCloseRequest]]
   */
  close(): void {
    postMessage(this, Widget.MsgCloseRequest);
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
   * The default implementation compresses `'update-request'` and
   * `'close-request'` messages.
   *
   * Subclasses may reimplement this method as needed.
   */
  compressMessage(msg: Message, pending: Queue<Message>): boolean {
    if (msg.type === 'update-request' || msg.type === 'close-request') {
      return pending.some(other => other.type === msg.type);
    }
    return false;
  }

  /**
   * A message handler invoked on a `'close-request'` message.
   *
   * #### Notes
   * The default implementation of this handler will unparent or detach
   * the widget as appropriate.
   *
   * Subclasses may reimplement this handler for custom close behavior.
   *
   * **See also:** [[close]], [[MsgCloseRequest]]
   */
  protected onCloseRequest(msg: Message): void {
    if (this.parent) {
      this.parent.children.remove(this);
    } else if (this.isAttached) {
      Widget.detach(this);
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

  // friend class Panel
  // friend class ChildWidgetList
  private _flags = 0;
  private _parent: Panel = null;
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
 * A private attached property for the title data for a widget.
 */
const titleProperty = new Property<Widget, Title>({
  create: () => new Title(),
});


/**
 * Lookup the title data for the given widget.
 */
function getTitle(widget: Widget): Title {
  return titleProperty.get(widget);
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
