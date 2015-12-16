/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  PanelLayout
} from './panellayout';

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
 * convenience panels, but can also be used directly along with CSS to
 * arrange a collection of widgets.
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
    return (this.layout as PanelLayout).childCount();
  }

  /**
   * Get the child widget at the specified index.
   *
   * @param index - The index of the child widget of interest.
   *
   * @returns The child at the specified index, or `undefined`.
   */
  childAt(index: number): Widget {
    return (this.layout as PanelLayout).childAt(index);
  }

  /**
   * Get the index of the specified child widget.
   *
   * @param child - The child widget of interest.
   *
   * @returns The index of the specified child, or `-1`.
   */
  childIndex(child: Widget): number {
    return (this.layout as PanelLayout).childIndex(child);
  }

  /**
   * Add a child widget to the end of the panel.
   *
   * @param child - The child widget to add to the panel.
   *
   * #### Notes
   * If the child is already contained in the panel, it will be moved.
   */
  addChild(child: Widget): void {
    (this.layout as PanelLayout).addChild(child);
  }

  /**
   * Insert a child widget at the specified index.
   *
   * @param index - The index at which to insert the child.
   *
   * @param child - The child widget to insert into to the panel.
   *
   * #### Notes
   * If the child is already contained in the panel, it will be moved.
   */
  insertChild(index: number, child: Widget): void {
    (this.layout as PanelLayout).insertChild(index, child);
  }
}
