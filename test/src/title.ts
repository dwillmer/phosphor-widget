/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import expect = require('expect.js');

import {
  IChangedArgs, Property
} from 'phosphor-properties';

import {
  Signal
} from 'phosphor-signaling';

import {
  Title
} from '../../lib/index';


describe('phosphor-widget', () => {

  describe('Title', () => {

    describe('.changedSignal', () => {

      it('should be a signal', () => {
        expect(Title.changedSignal instanceof Signal).to.be(true);
      });

    });

    describe('.textProperty', () => {

      it('should be a property descriptor', () => {
        expect(Title.textProperty instanceof Property).to.be(true);
      });

      it('should be have the name `text`', () => {
        expect(Title.textProperty.name).to.be('text');
      });

      it('should use the changed signal for notify', () => {
        expect(Title.textProperty.notify).to.be(Title.changedSignal);
      });

      it('should default to an empty string', () => {
        let title = new Title();
        expect(Title.textProperty.get(title)).to.be('');
      });

    });

    describe('.iconProperty', () => {

      it('should be a property descriptor', () => {
        expect(Title.iconProperty instanceof Property).to.be(true);
      });

      it('should be have the name `icon`', () => {
        expect(Title.iconProperty.name).to.be('icon');
      });

      it('should use the changed signal for notify', () => {
        expect(Title.iconProperty.notify).to.be(Title.changedSignal);
      });

      it('should default to an empty string', () => {
        let title = new Title();
        expect(Title.iconProperty.get(title)).to.be('');
      });

    });

    describe('.editableProperty', () => {

      it('should be a property descriptor', () => {
        expect(Title.editableProperty instanceof Property).to.be(true);
      });

      it('should be have the name `editable`', () => {
        expect(Title.editableProperty.name).to.be('editable');
      });

      it('should use the changed signal for notify', () => {
        expect(Title.editableProperty.notify).to.be(Title.changedSignal);
      });

      it('should default to `false`', () => {
        let title = new Title();
        expect(Title.editableProperty.get(title)).to.be(false);
      });

    });

    describe('.editHandlerProperty', () => {

      it('should be a property descriptor', () => {
        expect(Title.editHandlerProperty instanceof Property).to.be(true);
      });

      it('should be have the name `editHandler`', () => {
        expect(Title.editHandlerProperty.name).to.be('editHandler');
      });

      it('should use the changed signal for notify', () => {
        expect(Title.editHandlerProperty.notify).to.be(Title.changedSignal);
      });

      it('should default to `null`', () => {
        let title = new Title();
        expect(Title.editHandlerProperty.get(title)).to.be(null);
      });

    });

    describe('.closableProperty', () => {

      it('should be a property descriptor', () => {
        expect(Title.closableProperty instanceof Property).to.be(true);
      });

      it('should be have the name `closable`', () => {
        expect(Title.closableProperty.name).to.be('closable');
      });

      it('should use the changed signal for notify', () => {
        expect(Title.closableProperty.notify).to.be(Title.changedSignal);
      });

      it('should default to `false`', () => {
        let title = new Title();
        expect(Title.closableProperty.get(title)).to.be(false);
      });

    });

    describe('.classNameProperty', () => {

      it('should be a property descriptor', () => {
        expect(Title.classNameProperty instanceof Property).to.be(true);
      });

      it('should be have the name `className`', () => {
        expect(Title.classNameProperty.name).to.be('className');
      });

      it('should use the changed signal for notify', () => {
        expect(Title.classNameProperty.notify).to.be(Title.changedSignal);
      });

      it('should default to an empty string', () => {
        let title = new Title();
        expect(Title.classNameProperty.get(title)).to.be('');
      });

    });

    describe('#changed', () => {

      it('should be a pure delegate to the `changedSignal`', () => {
        let title = new Title();
        expect(title.changed).to.eql(Title.changedSignal.bind(title));
      });

    });

    describe('#text', () => {

      it('should be a pure delegate to the `textProperty`', () => {
        let title = new Title();
        title.text = 'Foo';
        expect(Title.textProperty.get(title)).to.be('Foo');
        Title.textProperty.set(title, 'Bar');
        expect(title.text).to.be('Bar');
      });

      it('should emit the changed signal when changed', () => {
        let sender: Title = null;
        let args: IChangedArgs<any> = null;
        let title = new Title();
        title.changed.connect((s, a) => { sender = s; args = a; });
        title.text = 'foo';
        expect(sender).to.be(title);
        expect(args).to.eql({ name: 'text', oldValue: '', newValue: 'foo' });
      });

    });

    describe('#icon', () => {

      it('should be a pure delegate to the `iconProperty`', () => {
        let title = new Title();
        title.icon = 'fa fa-close';
        expect(Title.iconProperty.get(title)).to.be('fa fa-close');
        Title.iconProperty.set(title, 'fa fa-open');
        expect(title.icon).to.be('fa fa-open');
      });

      it('should emit the changed signal when changed', () => {
        let sender: Title = null;
        let args: IChangedArgs<any> = null;
        let title = new Title();
        title.changed.connect((s, a) => { sender = s; args = a; });
        title.icon = 'fa close';
        expect(sender).to.be(title);
        expect(args).to.eql({ name: 'icon', oldValue: '', newValue: 'fa close' });
      });

    });

    describe('#editable', () => {

      it('should be a pure delegate to the `editableProperty`', () => {
        let title = new Title();
        title.editable = true;
        expect(Title.editableProperty.get(title)).to.be(true);
        Title.editableProperty.set(title, false);
        expect(title.editable).to.be(false);
      });

      it('should emit the changed signal when changed', () => {
        let sender: Title = null;
        let args: IChangedArgs<any> = null;
        let title = new Title();
        title.changed.connect((s, a) => { sender = s; args = a; });
        title.editable = true;
        expect(sender).to.be(title);
        expect(args).to.eql({ name: 'editable', oldValue: false, newValue: true });
      });

    });

    describe('#editHandler', () => {

      it('should be a pure delegate to the `editHandlerProperty`', () => {
        let title = new Title();
        let handler = (text: string) => { };
        title.editHandler = handler;
        expect(Title.editHandlerProperty.get(title)).to.be(handler);
        Title.editHandlerProperty.set(title, null);
        expect(title.editHandler).to.be(null);
      });

      it('should emit the changed signal when changed', () => {
        let sender: Title = null;
        let args: IChangedArgs<any> = null;
        let title = new Title();
        let handler = (text: string) => { };
        title.changed.connect((s, a) => { sender = s; args = a; });
        title.editHandler = handler;
        expect(sender).to.be(title);
        expect(args).to.eql({ name: 'editHandler', oldValue: null, newValue: handler });
      });

    });

    describe('#closable', () => {

      it('should be a pure delegate to the `closableProperty`', () => {
        let title = new Title();
        title.closable = true;
        expect(Title.closableProperty.get(title)).to.be(true);
        Title.closableProperty.set(title, false);
        expect(title.closable).to.be(false);
      });

      it('should emit the changed signal when changed', () => {
        let sender: Title = null;
        let args: IChangedArgs<any> = null;
        let title = new Title();
        title.changed.connect((s, a) => { sender = s; args = a; });
        title.closable = true;
        expect(sender).to.be(title);
        expect(args).to.eql({ name: 'closable', oldValue: false, newValue: true });
      });

    });

    describe('#className', () => {

      it('should be a pure delegate to the `classNameProperty`', () => {
        let title = new Title();
        title.className = 'flash-alert';
        expect(Title.classNameProperty.get(title)).to.be('flash-alert');
        Title.classNameProperty.set(title, '');
        expect(title.className).to.be('');
      });

      it('should emit the changed signal when changed', () => {
        let sender: Title = null;
        let args: IChangedArgs<any> = null;
        let title = new Title();
        title.changed.connect((s, a) => { sender = s; args = a; });
        title.className = 'bar';
        expect(sender).to.be(title);
        expect(args).to.eql({ name: 'className', oldValue: '', newValue: 'bar' });
      });

    });

  });

});
