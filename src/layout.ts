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
  Message
} from 'phosphor-messaging';

import {
  clearPropertyData
} from 'phosphor-properties';

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
 * The abstract base class of all Phosphor layouts.
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
   * The subclass should ensure that its children are resized to fit
   * the specified layout space, and that they are sent a `'resize'`
   * message if appropriate.
   *
   * This abstract method must be implemented by a subclass.
   */
  protected abstract onResize(msg: ResizeMessage): void;

  /**
   * A message handler invoked on a `'fit-request'` message.
   *
   * #### Notes
   * The subclass should ensure that its children are resized to fit
   * the available layout space, and that they are sent a `'resize'`
   * message if appropriate.
   *
   * This abstract method must be implemented by a subclass.
   */
  protected abstract onFitRequest(msg: Message): void;

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
   *
   * #### Notes
   * This method should be reimplemented by subclasses to dispose their
   * children. All reimplementations should call the superclass method.
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
   * Compress a message posted to the parent widget.
   *
   * @param msg - The message posted to the widget.
   *
   * @param pending - The queue of pending messages for the widget.
   *
   * @returns `true` if the message should be ignored, or `false` if
   *   the message should be enqueued for delivery as normal.
   *
   * #### Notes
   * This method is called by the parent to compress a message.
   *
   * Subclasses may reimplement this method as needed.
   */
  compressParentMessage(msg: Message, pending: Queue<Message>): boolean {
    return false;
  }

  /**
   * Process a message sent to the parent widget.
   *
   * @param msg - The message sent to the parent widget.
   *
   * #### Notes
   * This method is called by the parent to process a message.
   *
   * Subclasses may reimplement this method as needed.
   */
  processParentMessage(msg: Message): void {
    switch (msg.type) {
    case 'resize':
      this.onResize(msg as ResizeMessage);
      break;
    case 'fit-request':
      this.onFitRequest(msg);
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
