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
 *
 * #### Notes
 * A title object is intended to hold the data necessary to display a
 * header for a particular widget. A common example is the `TabPanel`,
 * which uses the widget title to populate the tab for a child widget.
 */
export
class Title {
  /**
   * A signal emitted when the title state changes.
   */
  get changed(): ISignal<Title, IChangedArgs<any>> {
    return TitlePrivate.changedSignal.bind(this);
  }

  /**
   * Get the text for the title.
   *
   * #### Notes
   * The default value is an empty string.
   */
  get text(): string {
    return TitlePrivate.textProperty.get(this);
  }

  /**
   * Set the text for the title.
   */
  set text(value: string) {
    TitlePrivate.textProperty.set(this, value);
  }

  /**
   * Get the icon class name for the title.
   */
  get icon(): string {
    return TitlePrivate.iconProperty.get(this);
  }

  /**
   * Set the icon class name for the title.
   *
   * #### Notes
   * Multiple class names can be separated with whitespace.
   */
  set icon(value: string) {
    TitlePrivate.iconProperty.set(this, value);
  }

  /**
   * Get the closable state for the title.
   */
  get closable(): boolean {
    return TitlePrivate.closableProperty.get(this);
  }

  /**
   * Set the closable state for the title.
   *
   * #### Notes
   * This controls the presence of a close icon when applicable.
   */
  set closable(value: boolean) {
    TitlePrivate.closableProperty.set(this, value);
  }

  /**
   * Get the extra class name for the title.
   */
  get className(): string {
    return TitlePrivate.classNameProperty.get(this);
  }

  /**
   * Set the extra class name for the title.
   *
   * #### Notes
   * Multiple class names can be separated with whitespace.
   */
  set className(value: string) {
    TitlePrivate.classNameProperty.set(this, value);
  }
}


/**
 * The namespace for the title private data.
 */
namespace TitlePrivate {
  /**
   * A signal emitted when the title state changes.
   */
  export
  const changedSignal = new Signal<Title, IChangedArgs<any>>();

  /**
   * The property descriptor for the title text.
   */
  export
  const textProperty = new Property<Title, string>({
    name: 'text',
    value: '',
    notify: changedSignal,
  });

  /**
   * The property descriptor for the title icon class.
   */
  export
  const iconProperty = new Property<Title, string>({
    name: 'icon',
    value: '',
    notify: changedSignal,
  });

  /**
   * The property descriptor for the title closable state.
   */
  export
  const closableProperty = new Property<Title, boolean>({
    name: 'closable',
    value: false,
    notify: changedSignal,
  });

  /**
   * The property descriptor for the title extra class name.
   */
  export
  const classNameProperty = new Property<Title, string>({
    name: 'className',
    value: '',
    notify: changedSignal,
  });
}
