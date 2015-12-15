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
 * An object which holds data related to a widget title.
 */
export
class Title {
  /**
   * A signal emitted when the title state changes.
   */
  get changed(): ISignal<Title, IChangedArgs<any>> {
    return Title.changedSignal.bind(this);
  }

  /**
   * Get the text for the title.
   */
  get text(): string {
    return Title.textProperty.get(this);
  }

  /**
   * Set the text for the title.
   */
  set text(value: string) {
    Title.textProperty.set(this, value);
  }

  /**
   * Get the icon class for the title.
   */
  get icon(): string {
    return Title.iconProperty.get(this);
  }

  /**
   * Set the icon class for the title.
   */
  set icon(value: string) {
    Title.iconProperty.set(this, value);
  }

  /**
   * Get the closable state for the title.
   */
  get closable(): boolean {
    return Title.closableProperty.get(this);
  }

  /**
   * Set the closable state for the title.
   */
  set closable(value: boolean) {
    Title.closableProperty.set(this, value);
  }

  /**
   * Get the extra class name for the title.
   */
  get className(): string {
    return Title.classNameProperty.get(this);
  }

  /**
   * Set the extra class name for the title.
   */
  set className(value: string) {
    Title.classNameProperty.set(this, value);
  }
}


/**
 * The namespace for the `Title` class statics.
 */
export
namespace Title {
  /**
   * A signal emitted when the title state changes.
   *
   * **See also:** [[changed]]
   */
  export
  const changedSignal = new Signal<Title, IChangedArgs<any>>();

  /**
   * The property descriptor for the title text.
   *
   * This will be used as the display text in title contexts.
   *
   * The default value is an empty string.
   *
   * **See also:** [[text]]
   */
  export
  const textProperty = new Property<Title, string>({
    name: 'text',
    value: '',
    notify: changedSignal,
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
  export
  const iconProperty = new Property<Title, string>({
    name: 'icon',
    value: '',
    notify: changedSignal,
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
  export
  const closableProperty = new Property<Title, boolean>({
    name: 'closable',
    value: false,
    notify: changedSignal,
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
  export
  const classNameProperty = new Property<Title, string>({
    name: 'className',
    value: '',
    notify: changedSignal,
  });
}
