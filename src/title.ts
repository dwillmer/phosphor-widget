/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Property
} from 'phosphor-properties';


/**
 * An object which holds data related to a widget title.
 */
export
class Title {
  /**
   * The property descriptor for the title text.
   *
   * This will be used as the display text in title contexts.
   *
   * The default value is an empty string.
   *
   * **See also:** [[text]]
   */
  static textProperty = new Property<Title, string>({
    value: '',
  });

  /**
   * The property descriptor for the title icon class.
   *
   * This will be added to the class name of the title icon node.
   *
   * Multiple class names can be separated with whitespace.
   *
   * The default value is an empty string.
   *
   * **See also:** [[icon]]
   */
  static iconProperty = new Property<Title, string>({
    value: '',
  });

  /**
   * The property descriptor for the title editable state.
   *
   * This controls whether the title is editable by the user.
   *
   * The default value is `false`.
   *
   * **See also:** [[editable]]
   */
  static editableProperty = new Property<Title, boolean>({
    value: false,
  });

  /**
   * The property descriptor for the title closable state.
   *
   * This controls whether the title area shows a close icon.
   *
   * The default value is `false`.
   *
   * **See also:** [[closable]]
   */
  static closableProperty = new Property<Title, boolean>({
    value: false,
  });

  /**
   * The property descriptor for the title extra class name.
   *
   * This will be added to the class name of the title area node.
   *
   * Multiple class names can be separated with whitespace.
   *
   * The default value is an empty string.
   *
   * **See also:** [[className]]
   */
  static classNameProperty = new Property<Title, string>({
    value: '',
  });

  /**
   * Get the text for the title.
   *
   * #### Notes
   * This is a pure delegate to the [[textProperty]].
   */
  get text(): string {
    return Title.textProperty.get(this);
  }

  /**
   * Set the text for the title.
   *
   * #### Notes
   * This is a pure delegate to the [[textProperty]].
   */
  set text(value: string) {
    Title.textProperty.set(this, value);
  }

  /**
   * Get the icon class for the title.
   *
   * #### Notes
   * This is a pure delegate to the [[iconProperty]].
   */
  get icon(): string {
    return Title.iconProperty.get(this);
  }

  /**
   * Set the icon class for the title.
   *
   * #### Notes
   * This is a pure delegate to the [[iconProperty]].
   */
  set icon(value: string) {
    Title.iconProperty.set(this, value);
  }

  /**
   * Get the editable state for the title.
   *
   * #### Notes
   * This is a pure delegate to the [[editableProperty]].
   */
  get editable(): boolean {
    return Title.editableProperty.get(this);
  }

  /**
   * Set the editable state for the title.
   *
   * #### Notes
   * This is a pure delegate to the [[editableProperty]].
   */
  set editable(value: boolean) {
    Title.editableProperty.set(this, value);
  }

  /**
   * Get the closable state for the title.
   *
   * #### Notes
   * This is a pure delegate to the [[closableProperty]].
   */
  get closable(): boolean {
    return Title.closableProperty.get(this);
  }

  /**
   * Set the closable state for the title.
   *
   * #### Notes
   * This is a pure delegate to the [[closableProperty]].
   */
  set closable(value: boolean) {
    Title.closableProperty.set(this, value);
  }

  /**
   * Get the extra class name for the title.
   *
   * #### Notes
   * This is a pure delegate to the [[classNameProperty]].
   */
  get className(): string {
    return Title.classNameProperty.get(this);
  }

  /**
   * Set the extra class name for the title.
   *
   * #### Notes
   * This is a pure delegate to the [[classNameProperty]].
   */
  set className(value: string) {
    Title.classNameProperty.set(this, value);
  }
}
