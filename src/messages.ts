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
