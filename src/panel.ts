/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';


class Panel extends Widget {
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
  static MsgLayoutRequest = new Message('layout-request');

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

    // while (this._children.length > 0) {
    //   let child = this._children.pop();
    //   child._parent = null;
    //   child.dispose();
    // }

    super.dispose();
  }

  /**
   * Get the list of child widgets for the widget.
   *
   * #### Notes
   * This is a read-only property.
   */
  get children(): IObservableList<Widget> {
    return this._children;
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
      sendToShown(this._children, msg);
      break;
    case 'before-hide':
      this.onBeforeHide(msg);
      sendToShown(this._children, msg);
      this._flags &= ~WidgetFlag.IsVisible;
      break;
    case 'after-attach':
      let visible = !this.hidden && (!this._parent || this._parent.isVisible);
      if (visible) this._flags |= WidgetFlag.IsVisible;
      this._flags |= WidgetFlag.IsAttached;
      this.onAfterAttach(msg);
      sendToAll(this._children, msg);
      break;
    case 'before-detach':
      this.onBeforeDetach(msg);
      sendToAll(this._children, msg);
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
    sendToAll(this._children, ResizeMessage.UnknownSize);
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   *
   * #### Notes
   * The default implementation of this handler sends an [[UnknownSize]]
   * resize message to each child. This ensures that the resize messages
   * propagate through all widgets in the hierarchy.
   *
   * Subclass may reimplement this method as needed, but they should
   * dispatch `'resize'` messages to their children as appropriate.
   *
   * **See also:** [[update]], [[MsgUpdateRequest]]
   */
  protected onUpdateRequest(msg: Message): void {
    sendToAll(this._children, ResizeMessage.UnknownSize);
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
   * The default implementation compresses the following messages:
   * `'update-request'`, `'layout-request'`, and `'close-request'`.
   *
   * Subclasses may reimplement this method as needed.
   */
  compressMessage(msg: Message, pending: Queue<Message>): boolean {
    switch (msg.type) {
    case 'update-request':
    case 'layout-request':
    case 'close-request':
      return pending.some(other => other.type === msg.type);
    }
    return false;
  }

  /**
   * A message handler invoked on a `'layout-request'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MsgLayoutRequest]]
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

  private _childrent: ChildWidgetList = null;
}


/**
 *
 */
class ChildWidgetList extends ObservableList<Widget> {
  /**
   *
   */
  constructor(parent: Widget) {
    this._parent = parent;
  }

  /**
   *
   */
  protected addItem(index: number, item: Widget): number {

  }

  /**
   *
   */
  protected moveItem(fromIndex: number, toIndex: number): boolean {

  }

  /**
   *
   */
  protected removeItem(index: number): Widget {

  }

  /**
   *
   */
  protected replaceItems(index: number, count: number, items: Widget[]): Widget[] {

  }

  /**
   *
   */
  protected setItem(index: number, item: Widget): Widget {

  }

  private _parent: Widget;
}
