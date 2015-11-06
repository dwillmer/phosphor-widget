/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IChangedArgs, Property
} from 'phosphor-properties';

import {
  ISignal, Signal
} from 'phosphor-signaling';


/**
 * A type alias for a title edit handler function.
 *
 * **See also:** [[editHandlerProperty]]
 */
export
type EditHandler = (text: string) => void;


/**
 * An object which holds data related to a widget title.
 */
export
class Title {
  /**
   * A signal emitted when the title state changes.
   *
   * **See also:** [[changed]]
   */
  static changedSignal = new Signal<Title, IChangedArgs<any>>();

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
    name: 'text',
    value: '',
    notify: Title.changedSignal,
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
    name: 'icon',
    value: '',
    notify: Title.changedSignal,
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
    name: 'editable',
    value: false,
    notify: Title.changedSignal,
  });

  /**
   * The property descriptor for the title edit handler.
   *
   * If the title is user editable, this handler will be invoked when
   * the text is edited by the user. The handler should update its own
   * internal state and then update the title text as appropriate. If
   * this is not provided, the title text will be updated directly.
   *
   * The default value is `null`.
   *
   * **See also:** [[editHandler]]
   */
  static editHandlerProperty = new Property<Title, EditHandler>({
    name: 'editHandler',
    value: null,
    notify: Title.changedSignal,
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
    name: 'closable',
    value: false,
    notify: Title.changedSignal,
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
    name: 'className',
    value: '',
    notify: Title.changedSignal,
  });

  /**
   * A signal emitted when the title state changes.
   *
   * #### Notes
   * This is a pure delegate to the [[changedSignal]].
   */
  get changed(): ISignal<Title, IChangedArgs<any>> {
    return Title.changedSignal.bind(this);
  }

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
   * Get the edit handler for the title.
   *
   * #### Notes
   * This is a pure delegate to the [[editHandlerProperty]].
   */
  get editHandler(): EditHandler {
    return Title.editHandlerProperty.get(this);
  }

  /**
   * Set the edit handler for the title.
   *
   * #### Notes
   * This is a pure delegate to the [[editHandlerProperty]].
   */
  set editHandler(value: EditHandler) {
    Title.editHandlerProperty.set(this, value);
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
