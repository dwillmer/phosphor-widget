/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IBoxSizing, ISizeLimits, boxSizing, sizeLimits
} from 'phosphor-domutil';

import {
  Message, sendMessage
} from 'phosphor-messaging';

import {
  Property
} from 'phosphor-properties';

import {
  ResizeMessage, Widget
} from './index';


/**
 * A property descriptor for the widget title.
 *
 * #### Notes
 * This property has no direct effect on the behavior of the widget.
 * It is intended to be consumed by container widgets when displaying
 * the widget in a context where a title is appropriate.
 *
 * The value is the display text to use for the widget title.
 *
 * Code should not modify this property directly in response to user
 * input events. Instead, a [[ChangeTitleMessage]] should be sent to
 * the widget, which allows the widget an opportunity to update its
 * internal state before updating its public property.
 *
 * The default value is an empty string.
 *
 * **See also:** [[getTitle]], [[setTitle]], [[changeTitle]]
 */
export
const titleProperty = new Property<Widget, string>({
  value: '',
});


/**
 * Get the title for the widget.
 *
 * #### Notes
 * This is a pure delegate to the [[titleProperty]].
 */
export
function getTitle(widget: Widget): string {
  return titleProperty.get(widget);
}


/**
 * Set the title for the widget.
 *
 * #### Notes
 * This is a pure delegate to the [[titleProperty]].
 */
export
function setTitle(widget: Widget, value: string): void {
  titleProperty.set(widget, value);
}


/**
 * Change the title for the widget.
 *
 * #### Notes
 * This will send a [[ChangeTitleMessage]] message to the widget. The
 * the widget should handle this message and update its internal state
 * as appropriate and should call [[setTitle]] when finished.
 */
export
function changeTitle(widget: Widget, title: string): void {
  sendMessage(widget, new ChangeTitleMessage(title));
}


/**
 * A message class for `'change-title'` messages.
 *
 * Messages of this type are used to change the `title` property of a
 * widget in response to a user input event.
 *
 * **See also:** [[changeTitle]]
 */
export
class ChangeTitleMessage extends Message {
  /**
   * Construct a new change title message.
   *
   * @param title - The title to use for the widget.
   */
  constructor(title: string) {
    super('change-title');
    this._title = title;
  }

  /**
   * The title for the widget.
   *
   * #### Notes
   * This is a read-only property.
   */
  get title(): string {
    return this._title;
  }

  private _title: string;
}


/**
 * A property descriptor for the widget title icon class.
 *
 * #### Notes
 * This property has no direct effect on the behavior of the widget.
 * It is intended to be consumed by container widgets when displaying
 * the widget in a context where an icon is appropriate.
 *
 * The value is the *class name* to be added to the DOM node which
 * displays the actual icon. Multiple class names can be separated
 * with whitespace.
 *
 * The default value is an empty string.
 *
 * **See also:** [[getTitleIcon]], [[setTitleIcon]]
 */
export
const titleIconProperty = new Property<Widget, string>({
  value: '',
});


/**
 * Get the title icon class name for the widget.
 *
 * #### Notes
 * This is a pure delegate to the [[titleIconProperty]].
 */
export
function getTitleIcon(widget: Widget): string {
  return titleIconProperty.get(widget);
}


/**
 * Set the title icon class name for the widget.
 *
 * #### Notes
 * This is a pure delegate to the [[titleIconProperty]].
 */
export
function setTitleIcon(widget: Widget, value: string): void {
  titleIconProperty.set(widget, value);
}


/**
 * A property descriptor for the widget title editable hint.
 *
 * #### Notes
 * This property has no direct effect on the behavior of the widget.
 * It is intended to be consumed by container widgets when deciding
 * whether to allow the user to edit the widget title.
 *
 * The default value is `false`.
 *
 * **See also:** [[titleEditableHint]], [[titleProperty]]
 */
export
const titleEditableHintProperty = new Property<Widget, boolean>({
  value: false,
});


/**
 * Get the title editable hint for the widget.
 *
 * #### Notes
 * This is a pure delegate to the [[titleEditableHintProperty]].
 */
export
function getTitleEditableHint(widget: Widget): boolean {
  return titleEditableHintProperty.get(widget);
}


/**
 * Set the title editable hint for the widget.
 *
 * #### Notes
 * This is a pure delegate to the [[titleEditableHintProperty]].
 */
export
function setTitleEditableHint(widget: Widget, value: boolean): void {
  titleEditableHintProperty.set(widget, value);
}


/**
 * A property descriptor which controls the widget closable hint.
 *
 * #### Notes
 * This property has no direct effect on the behavior of the widget.
 * It is intended to be consumed by container widgets when deciding
 * whether to display a close indicator to the user.
 *
 * The default value is `false`.
 *
 * **See also:** [[closableHint]], [[close]]
 */
export
const closableHintProperty = new Property<Widget, boolean>({
  value: false,
});


/**
 * Get the closable hint for the widget.
 *
 * #### Notes
 * This is a pure delegate to the [[closableHintProperty]].
 */
export
function getClosableHint(widget: Widget): boolean {
  return closableHintProperty.get(widget);
}


/**
 * Set the closable hint for the widget.
 *
 * #### Notes
 * This is a pure delegate to the [[closableHintProperty]].
 */
export
function setClosableHint(widget: Widget, value: boolean): void {
  closableHintProperty.set(widget, value);
}


/**
 * Get the box sizing for the widget's DOM node.
 *
 * #### Notes
 * This value is computed once and then cached in order to avoid
 * excessive style recomputations. The cache can be cleared via
 * [[clearBoxSizing]].
 *
 * Layout widgets rely on this property when computing their layout.
 * If a layout widget's box sizing changes at runtime, the box sizing
 * cache should be cleared and the layout widget should be posted a
 *`'layout-request'` message.
 *
 * This is a read-only property.
 *
 * **See also:** [[clearBoxSizing]]
 */
export
function getBoxSizing(): IBoxSizing {
  if (this._box) return this._box;
  return this._box = Object.freeze(boxSizing(this.node));
}


/**
 * Clear the cached box sizing for the widget.
 *
 * #### Notes
 * This method does **not** read from the DOM.
 *
 * This method does **not** write to the DOM.
 *
 * **See also:** [[boxSizing]]
 */
export
function clearBoxSizing(): void {
  this._box = null;
}


/**
 * Get the size limits for the widget's DOM node.
 *
 * #### Notes
 * This value is computed once and then cached in order to avoid
 * excessive style recomputations. The cache can be cleared by
 * calling [[clearSizeLimits]].
 *
 * Layout widgets rely on this property of their child widgets when
 * computing the layout. If a child widget's size limits change at
 * runtime, the size limits should be cleared and the layout widget
 * should be posted a `'layout-request'` message.
 *
 * This is a read-only property.
 *
 * **See also:** [[setSizeLimits]], [[clearSizeLimits]]
 */
export
function getSizeLimits(): ISizeLimits {
  if (this._limits) return this._limits;
  return this._limits = Object.freeze(sizeLimits(this.node));
}


/**
 * Set the size limits for the widget's DOM node.
 *
 * @param minWidth - The min width for the widget, in pixels.
 *
 * @param minHeight - The min height for the widget, in pixels.
 *
 * @param maxWidth - The max width for the widget, in pixels.
 *
 * @param maxHeight - The max height for the widget, in pixels.
 *
 * #### Notes
 * This method does **not** read from the DOM.
 *
 * **See also:** [[sizeLimits]], [[clearSizeLimits]]
 */

export
function setSizeLimits(minWidth: number, minHeight: number, maxWidth: number, maxHeight: number): void {
  var minW = Math.max(0, minWidth);
  var minH = Math.max(0, minHeight);
  var maxW = Math.max(0, maxWidth);
  var maxH = Math.max(0, maxHeight);
  this._limits = Object.freeze({
    minWidth: minW,
    minHeight: minH,
    maxWidth: maxW,
    maxHeight: maxH,
  });
  var style = this.node.style;
  style.minWidth = minW + 'px';
  style.minHeight = minH + 'px';
  style.maxWidth = (maxW === Infinity) ? '' : maxW + 'px';
  style.maxHeight = (maxH === Infinity) ? '' : maxH + 'px';
}


/**
 * Clear the cached size limits for the widget.
 *
 * #### Notes
 * This method does **not** read from the DOM.
 *
 * **See also:** [[sizeLimits]], [[setSizeLimits]]
 */
export
function clearSizeLimits(): void {
  this._limits = null;
  var style = this.node.style;
  style.minWidth = '';
  style.maxWidth = '';
  style.minHeight = '';
  style.maxHeight = '';
}


/**
 * Get the current offset geometry rect for the widget.
 *
 * #### Notes
 * If the widget geometry has been set using [[setOffsetGeometry]],
 * those values will be used to populate the rect, and no data will
 * be read from the DOM. Otherwise, the offset geometry of the node
 * **will** be read from the DOM, which may cause a reflow.
 *
 * This is a read-only property.
 *
 * **See also:** [[setOffsetGeometry]], [[clearOffsetGeometry]]
 */
export
function getOffsetRect(): IOffsetRect {
  if (this._rect) return cloneOffsetRect(this._rect);
  return getOffsetRectImpl(this.node);
}


/**
 * Set the offset geometry for the widget.
 *
 * @param left - The offset left edge of the widget, in pixels.
 *
 * @param top - The offset top edge of the widget, in pixels.
 *
 * @param width - The offset width of the widget, in pixels.
 *
 * @param height - The offset height of the widget, in pixels.
 *
 * #### Notes
 * This method is only useful when using absolute positioning to set
 * the layout geometry of the widget. It will update the inline style
 * of the widget with the specified values. If the width or height is
 * different from the previous value, a [[ResizeMessage]] will be sent
 * to the widget.
 *
 * This method does **not** take into account the size limits of the
 * widget. It is assumed that the specified width and height do not
 * violate the size constraints of the widget.
 *
 * This method does **not** read any data from the DOM.
 *
 * Code which uses this method to layout a widget is responsible for
 * calling [[clearOffsetGeometry]] when it is finished managing the
 * widget.
 *
 * **See also:** [[offsetRect]], [[clearOffsetGeometry]]
 */
export
function setOffsetGeometry(left: number, top: number, width: number, height: number): void {
  var rect = this._rect || (this._rect = makeOffsetRect());
  var style = this.node.style;
  var resized = false;
  if (top !== rect.top) {
    rect.top = top;
    style.top = top + 'px';
  }
  if (left !== rect.left) {
    rect.left = left;
    style.left = left + 'px';
  }
  if (width !== rect.width) {
    resized = true;
    rect.width = width;
    style.width = width + 'px';
  }
  if (height !== rect.height) {
    resized = true;
    rect.height = height;
    style.height = height + 'px';
  }
  if (resized) sendMessage(this, new ResizeMessage(width, height));
}


/**
 * Clear the offset geometry for the widget.
 *
 * #### Notes
 * This method is only useful when using absolute positioning to set
 * the layout geometry of the widget. It will reset the inline style
 * of the widget and clear the stored offset geometry values.
 *
 * This method will **not** dispatch a [[ResizeMessage]].
 *
 * This method does **not** read any data from the DOM.
 *
 * This method should be called by the widget's layout manager when
 * it no longer manages the widget. It allows the widget to be added
 * to another layout panel without conflict.
 *
 * **See also:** [[offsetRect]], [[setOffsetGeometry]]
 */
export
function clearOffsetGeometry(): void {
  if (!this._rect) {
    return;
  }
  this._rect = null;
  var style = this.node.style;
  style.top = '';
  style.left = '';
  style.width = '';
  style.height = '';
}


/**
 * An object which stores offset geometry information.
 */
export
interface IOffsetRect {
  /**
   * The offset top edge, in pixels.
   */
  top: number;

  /**
   * The offset left edge, in pixels.
   */
  left: number;

  /**
   * The offset width, in pixels.
   */
  width: number;

  /**
   * The offset height, in pixels.
   */
  height: number;
}


/**
 * Create a new offset rect full of NaN's.
 */
function makeOffsetRect(): IOffsetRect {
  return { top: NaN, left: NaN, width: NaN, height: NaN };
}


/**
 * Clone an offset rect object.
 */
function cloneOffsetRect(rect: IOffsetRect): IOffsetRect {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  };
}


/**
 * Get the offset rect for a DOM node.
 */
function getOffsetRectImpl(node: HTMLElement): IOffsetRect {
  return {
    top: node.offsetTop,
    left: node.offsetLeft,
    width: node.offsetWidth,
    height: node.offsetHeight,
  };
}
