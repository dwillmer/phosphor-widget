/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Message
} from 'phosphor-messaging';

import {
  Widget
} from './widget';


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
