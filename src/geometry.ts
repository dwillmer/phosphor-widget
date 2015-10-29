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


/**
 * An object which manages offset geometry data for a DOM node.
 */
export
class Geometry {
  /**
   * Construct a new geometry object.
   *
   * @param node - The node to use as the geometry target.
   */
  constructor(node: HTMLElement) {
    this._node = node;
  }

  /**
   * Get the offset top position of the node.
   *
   * #### Notes
   * If the offset rect has been set manually, this returns the cached
   * value. Otherwise, the offset top position is read from the DOM.
   *
   * **See also:** [[setRect]], [[resetRect]]
   */
  get offsetTop(): number {
    return this._rect ? this._rect.top : this._node.offsetTop;
  }

  /**
   * Get the offset left position of the node.
   *
   * #### Notes
   * If the offset rect has been set manually, this returns the cached
   * value. Otherwise, the offset left position is read from the DOM.
   *
   * **See also:** [[setRect]], [[resetRect]]
   */
  get offsetLeft(): number {
    return this._rect ? this._rect.left : this._node.offsetLeft;
  }

  /**
   * Get the offset width of the node.
   *
   * #### Notes
   * If the offset rect has been set manually, this returns the cached
   * value. Otherwise, the offset width is read from the DOM.
   *
   * **See also:** [[setRect]], [[resetRect]]
   */
  get offsetWidth(): number {
    return this._rect ? this._rect.width : this._node.offsetWidth;
  }

  /**
   * Get the offset height of the node.
   *
   * #### Notes
   * If the offset rect has been set manually, this returns the cached
   * value. Otherwise, the offset height is read from the DOM.
   *
   * **See also:** [[setRect]], [[resetRect]]
   */
  get offsetHeight(): number {
    return this._rect ? this._rect.height : this._node.offsetHeight;
  }

  /**
   * Get the width of the top border of the node.
   *
   * #### Notes
   * This will read the box data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetBox]]
   */
  get borderTop(): number {
    return this._ensureBox().borderTop;
  }

  /**
   * Get the width of the left border of the node.
   *
   * #### Notes
   * This will read the box data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetBox]]
   */
  get borderLeft(): number {
    return this._ensureBox().borderLeft;
  }

  /**
   * Get the width of the right border of the node.
   *
   * #### Notes
   * This will read the box data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetBox]]
   */
  get borderRight(): number {
    return this._ensureBox().borderRight;
  }

  /**
   * Get the width of the bottom border of the node.
   *
   * #### Notes
   * This will read the box data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetBox]]
   */
  get borderBottom(): number {
    return this._ensureBox().borderBottom;
  }

  /**
   * Get the width of the top padding of the node.
   *
   * #### Notes
   * This will read the box data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetBox]]
   */
  get paddingTop(): number {
    return this._ensureBox().paddingTop;
  }

  /**
   * Get the width of the left padding of the node.
   *
   * #### Notes
   * This will read the box data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetBox]]
   */
  get paddingLeft(): number {
    return this._ensureBox().paddingLeft;
  }

  /**
   * Get the width of the right padding of the node.
   *
   * #### Notes
   * This will read the box data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetBox]]
   */
  get paddingRight(): number {
    return this._ensureBox().paddingRight;
  }

  /**
   * Get the width of the bottom padding of the node.
   *
   * #### Notes
   * This will read the box data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetBox]]
   */
  get paddingBottom(): number {
    return this._ensureBox().paddingBottom;
  }

  /**
   * Get the sum of horizontal border and padding of the node.
   *
   * #### Notes
   * This will read the box data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetBox]]
   */
  get horizontalSum(): number {
    return this._ensureBox().horizontalSum;
  }

  /**
   * Get the sum of vertical border and padding of the node.
   *
   * #### Notes
   * This will read the box data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetBox]]
   */
  get verticalSum(): number {
    return this._ensureBox().verticalSum;
  }

  /**
   * Get the minimum width of the node.
   *
   * #### Notes
   * This will read the limit data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetLimits]]
   */
  get minWidth(): number {
    return this._ensureLimits().minWidth;
  }

  /**
   * Get the minimum height of the node.
   *
   * #### Notes
   * This will read the limit data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetLimits]]
   */
  get minHeight(): number {
    return this._ensureLimits().minHeight;
  }

  /**
   * Get the maximum width of the node.
   *
   * #### Notes
   * This will read the limit data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetLimits]]
   */
  get maxWidth(): number {
    return this._ensureLimits().maxWidth;
  }

  /**
   * Get the maximum height of the node.
   *
   * #### Notes
   * This will read the limit data once and cache it. The cache
   * must be reset in order for updated values to be reflected.
   *
   * **See also:** [[resetLimits]]
   */
  get maxHeight(): number {
    return this._ensureLimits().maxHeight;
  }

  /**
   * Set the inline offset geometry of the node.
   *
   * @param left - The offset left position, in pixels.
   *
   * @param top - The offset top position, in pixels.
   *
   * @param width - The offset width, in pixels.
   *
   * @param height - The offset height, in pixels.
   *
   * @returns `true` if the size was changed from the previous cached
   *   offset geometry values, `false` otherwise.'
   *
   * #### Notes
   * The geometry cache is updated to reflect the provided values. The
   * offset geometry getters will return these cached values instead of
   * reading from the DOM.
   *
   * This assumes the provided values are bounded safely within the
   * size limits of the node. If they are not, the cached values will
   * not accurately reflect the on-screen values.
   *
   * **See also:** [[resetRect]]
   */
  setRect(left: number, top: number, width: number, height: number): boolean {
    let resized = false;
    let style = this._node.style;
    let rect = this._ensureRect();
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
    return resized;
  }

  /**
   * Set the inline size limits of the node.
   *
   * @param minW - The minimum node width, in pixels.
   *
   * @param minH - The minimum node height, in pixels.
   *
   * @param maxW - The maximum node width, in pixels.
   *
   * @param maxH - The maximum node height, in pixels.
   *
   * @returns `true` if the limits were changed from the previously
   *   computed values, `false` otherwise.
   *
   * #### Notes
   * The limit cache is updated to reflect the provided values. The
   * limit getters will return these cached values instead of reading
   * from the DOM.
   *
   * **See also:** [[resetLimits]]
   */
  setLimits(minW: number, minH: number, maxW: number, maxH: number): boolean {
    let changed = false;
    let style = this._node.style;
    let limits = this._ensureLimits();
    minW = Math.max(0, minW);
    minH = Math.max(0, minH);
    maxW = Math.max(0, maxW);
    maxH = Math.max(0, maxH);
    if (minW !== limits.minWidth) {
      changed = true;
      limits.minWidth = minW;
      style.minWidth = minW + 'px';
    }
    if (minH !== limits.minHeight) {
      changed = true;
      limits.minHeight = minH;
      style.minHeight = minH + 'px';
    }
    if (maxW !== limits.maxWidth) {
      changed = true;
      limits.maxWidth = maxW;
      style.maxWidth = maxW === Infinity ? 'none' : maxW + 'px';
    }
    if (maxH !== limits.maxHeight) {
      changed = true;
      limits.maxHeight = maxH;
      style.maxHeight = maxH === Infinity ? 'none' : maxH + 'px';
    }
    return changed;
  }

  /**
   * Reset the box data cache.
   *
   * #### Notes
   * The box data getters will read new values on the next access.
   */
  resetBox(): void {
    this._box = null;
  }

  /**
   * Reset the offset geometry cache and clear the inline node data.
   *
   * #### Notes
   * The offset data getters will read new values on the next access.
   */
  resetRect(): void {
    this._rect = null;
    let style = this._node.style;
    style.top = '';
    style.left = '';
    style.width = '';
    style.height = '';
  }

  /**
   * Reset the size limit cache and clear the inline node data.
   *
   * #### Notes
   * The limit data getters will read new values on the next access.
   */
  resetLimits(): void {
    this._limits = null;
    let style = this._node.style;
    style.minWidth = '';
    style.minHeight = '';
    style.maxWidth = '';
    style.maxHeight = '';
  }

  /**
   * Reset all cached and clear all inline node data.
   *
   * #### Notes
   * This is equivalent to calling all cache reset methods in turn.
   */
  resetAll(): void {
    this.resetBox();
    this.resetRect();
    this.resetLimits();
  }

  /**
   * Get or create the cached box sizing data.
   */
  private _ensureBox(): IBoxSizing {
    return this._box || (this._box = boxSizing(this._node));
  }

  /**
   * Get or create the cached offset rect data.
   */
  private _ensureRect(): IOffsetRect {
    return this._rect || (this._rect = createOffsetRect());
  }

  /**
   * Get or create the cached size limit data.
   */
  private _ensureLimits(): ISizeLimits {
    return this._limits || (this._limits = sizeLimits(this._node));
  }

  private _node: HTMLElement;
  private _box: IBoxSizing = null;
  private _rect: IOffsetRect = null;
  private _limits: ISizeLimits = null;
}


/**
 * An object which stores offset geometry information.
 */
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
 * Create an offset rect initialized with NaNs.
 */
function createOffsetRect(): IOffsetRect {
  return { top: NaN, left: NaN, width: NaN, height: NaN };
}
