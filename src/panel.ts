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
    return (this.layout as PanelLayout).count();
  }

  /**
   * Get the child widget at the specified index.
   *
   * @returns The child at the specified index, or `undefined`.
   */
  childAt(index: number): Widget {
    return (this.layout as PanelLayout).at(index);
  }

  /**
   * Get the index of the specified child widget.
   *
   * @param child - The child widget of interest.
   *
   * @returns The index of the specified child, or `-1`.
   */
  childIndex(child: Widget): number {
    return (this.layout as PanelLayout).indexOf(child);
  }

  /**
   * Add a child widget to the end of the panel.
   *
   * @param child - The child widget to add to the panel.
   */
  addChild(child: Widget): void {
    (this.layout as PanelLayout).add(child);
  }

  /**
   * Insert a child widget at the specified index.
   *
   * @param index - The index at which to insert the child.
   *
   * @param child - The child widget to insert into to the panel.
   */
  insertChild(index: number, child: Widget): void {
    (this.layout as PanelLayout).insert(index, child);
  }
}


/**
 * An abstract base class for creating index-based layouts.
 *
 * #### Notes
 * This class implements core functionality which is required by nearly
 * all layouts which can be expressed using index-based storage. It is
 * a good starting point for creating extremely custom layouts.
 *
 * This class must be subclassed to make a fully functioning layout.
 *
 * **See also:** [[PanelLayout]], [[Panel]]
 */
export
abstract class AbstractPanelLayout extends Layout {
  /**
   * Get the number of widgets in the layout.
   *
   * @returns The number of widgets in the layout.
   *
   * #### Notes
   * This abstract method must be implemented by a subclass.
   */
  abstract count(): number;

  /**
   * Get the widget at the specified index.
   *
   * @param index - The index of widget of interest.
   *
   * @returns The widget at the specified index, or `undefined`.
   *
   * #### Notes
   * This abstract method must be implemented by a subclass.
   */
  abstract at(index: number): Widget;

  /**
   * Get the index of the specified widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The index of the specified widget, or `-1`.
   */
  indexOf(widget: Widget): number {
    for (let i = 0, n = this.count(); i < n; ++i) {
      if (this.at(i) === widget) return i;
    }
    return -1;
  }

  /**
   * Send a message to all widgets in the layout.
   *
   * @param msg - The message to send to the widgets.
   */
  protected sendToAll(msg: Message): void {
    for (let i = 0; i < this.count(); ++i) {
      sendMessage(this.at(i), msg);
    }
  }

  /**
   * Send a message to some widgets in the layout.
   *
   * @param msg - The message to send to the widgets.
   *
   * @param pred - A predicate filter function. Only the widgets which
   *   pass the filter will be sent the message.
   */
  protected sendToSome(msg: Message, pred: (widget: Widget) => boolean): void {
    for (let i = 0; i < this.count(); ++i) {
      let widget = this.at(i);
      if (pred(widget)) sendMessage(widget, msg);
    }
  }

  /**
   * A message handler invoked on a `'resize'` message.
   *
   * #### Notes
   * The default implementation of this method sends an `UnknownSize`
   * resize message to all widgets.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onResize(msg: ResizeMessage): void {
    this.sendToAll(ResizeMessage.UnknownSize);
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   *
   * #### Notes
   * The default implementation of this method sends an `UnknownSize`
   * resize message to all widgets.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onUpdateRequest(msg: Message): void {
    this.sendToAll(ResizeMessage.UnknownSize);
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message
   * to all widgets.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onAfterAttach(msg: Message): void {
    this.sendToAll(msg);
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message
   * to all widgets.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onBeforeDetach(msg: Message): void {
    this.sendToAll(msg);
  }

  /**
   * A message handler invoked on an `'after-show'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message
   * to all non-hidden widgets.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onAfterShow(msg: Message): void {
    this.sendToSome(msg, widget => !widget.isHidden);
  }

  /**
   * A message handler invoked on a `'before-hide'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message
   * to all non-hidden widgets.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onBeforeHide(msg: Message): void {
    this.sendToSome(msg, widget => !widget.isHidden);
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
   * Dispose of the resources held by the panel.
   */
  dispose(): void {
    while (this._widgets.length > 0) {
      this._widgets.pop().dispose();
    }
    super.dispose();
  }

  /**
   * Get the number of widgets in the layout.
   *
   * @returns The number of widgets in the layout.
   */
  count(): number {
    return this._widgets.length;
  }

  /**
   * Get the widget at the specified index.
   *
   * @param index - The index of widget of interest.
   *
   * @returns The widget at the specified index, or `undefined`.
   */
  at(index: number): Widget {
    return this._widgets[index];
  }

  /**
   * Add a widget to the end of the layout.
   *
   * @param widget - The widget to add to the layout.
   */
  add(widget: Widget): void {
    this.insert(this._widgets.length, widget);
  }

  /**
   * Insert a widget into the layout at the specified index.
   *
   * @param index - The index at which to insert the widget.
   *
   * @param widget - The widget to insert into the layout.
   */
  insert(index: number, widget: Widget): void {
    widget.parent = this.parent;
    let i = this.indexOf(widget);
    let j = Math.max(0, Math.min(index | 0, this.count()));
    if (i !== -1) {
      if (i < j) j--;
      if (i === j) return;
      arrays.move(this._widgets, i, j);
      if (this.parent) this.widgetMoved(i, j, widget);
    } else {
      arrays.insert(this._widgets, j, widget);
      if (this.parent) this.widgetAdded(j, widget);
    }
  }

  /**
   * Initialize the layout widgets.
   *
   * #### Notes
   * This method is called automatically when the layout is installed
   * on its parent widget. It will reparent all child widgets to the
   * layout parent and add invoke the [[widgetAdded]] method.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected initialize(): void {
    let parent = this.parent;
    let widgets = this._widgets;
    for (let i = 0; i < widgets.length; ++i) {
      widgets[i].parent = parent;
      this.widgetAdded(i, widgets[i]);
    }
  }

  /**
   *
   */
  protected widgetAdded(index: number, widget: Widget): void {
    let parent = this.parent;
    let ref = this.at(index + 1);
    parent.node.insertBefore(widget.node, ref && ref.node);
    if (parent.isAttached) sendMessage(widget, Widget.MsgAfterAttach);
  }

  /**
   *
   */
  protected widgetMoved(fromIndex: number, toIndex: number, widget: Widget): void {
    let parent = this.parent;
    let ref = this.at(toIndex + 1);
    if (parent.isAttached) sendMessage(widget, Widget.MsgBeforeDetach);
    parent.node.insertBefore(widget.node, ref && ref.node);
    if (parent.isAttached) sendMessage(widget, Widget.MsgAfterAttach);
  }

  /**
   *
   */
  protected widgetRemoved(index: number, widget: Widget): void {
    let parent = this.parent;
    if (parent.isAttached) sendMessage(widget, Widget.MsgBeforeDetach);
    parent.node.removeChild(widget.node);
  }

  /**
   *
   */
  protected onChildRemoved(msg: ChildMessage): void {
    let i = arrays.remove(this._widgets, msg.child);
    if (i !== -1) this.widgetRemoved(i, msg.child);
  }

  /**
   *
   */
  protected onLayoutRequest(): void { }

  private _widgets: Widget[] = [];
}
