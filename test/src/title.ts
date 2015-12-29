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
  Title
} from '../../lib/index';


const defaultOptions = {
  text: 'foo',
  icon: 'bar',
  closable: true,
  className: 'baz'
}


describe('phosphor-widget', () => {

  describe('Title', () => {

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        let title = new Title();
        expect(title instanceof Title).to.be(true);
      });

      it('should accept title options', () => {
        let title = new Title(defaultOptions);
        expect(title instanceof Title).to.be(true);
      });

    });

    describe('#changed', () => {

      it('should be emitted when the title state changes', () => {
        let called = false;
        let title = new Title(defaultOptions);
        title.changed.connect((sender, args) => {
          expect(sender).to.be(title);
          expect(args.name).to.be('text');
          expect(args.oldValue).to.be('foo');
          expect(args.newValue).to.be('baz');
          called = true;
        })
        title.text = 'baz';
        expect(called).to.be(true);
      });

    });

    describe('#text', () => {

      it('should default to an empty string', () => {
        let title = new Title();
        expect(title.text).to.be('');
      });

      it('should be writable', () => {
        let title = new Title();
        title.text = 'foo';
        expect(title.text).to.be('foo');
      });

      it('should emit the changed signal', () => {
        let called = false;
        let title = new Title(defaultOptions);
        title.changed.connect((sender, args) => {
          expect(sender).to.be(title);
          expect(args.name).to.be('text');
          expect(args.oldValue).to.be('foo');
          expect(args.newValue).to.be('baz');
          called = true;
        })
        title.text = 'baz';
        expect(called).to.be(true);
      });

    });

    describe('#icon', () => {

      it('should default to an empty string', () => {
        let title = new Title();
        expect(title.icon).to.be('');
      });

      it('should be writable', () => {
        let title = new Title();
        title.icon = 'foo';
        expect(title.icon).to.be('foo');
      });

      it('should allow multiple class names separated with whitespace', () => {
        let title = new Title();
        title.icon = 'foo bar';
        expect(title.icon).to.be('foo bar');
      });

      it('should emit the changed signal', () => {
        let called = false;
        let title = new Title(defaultOptions);
        title.changed.connect((sender, args) => {
          expect(sender).to.be(title);
          expect(args.name).to.be('icon');
          expect(args.oldValue).to.be('bar');
          expect(args.newValue).to.be('baz');
          called = true;
        })
        title.icon = 'baz';
        expect(called).to.be(true);
      });

    });

    describe('#closable', () => {

      it('should default to false', () => {
        let title = new Title();
        expect(title.closable).to.be(false);
      });

      it('should be writable', () => {
        let title = new Title();
        title.closable = true;
        expect(title.closable).to.be(true);
      });

      it('should emit the changed signal', () => {
        let called = false;
        let title = new Title(defaultOptions);
        title.changed.connect((sender, args) => {
          expect(sender).to.be(title);
          expect(args.name).to.be('closable');
          expect(args.oldValue).to.be(true);
          expect(args.newValue).to.be(false);
          called = true;
        })
        title.closable = false;
        expect(called).to.be(true);
      });

    });

    describe('#className', () => {

      it('should default to an empty string', () => {
        let title = new Title();
        expect(title.className).to.be('');
      });

      it('should be writable', () => {
        let title = new Title();
        title.className = 'foo';
        expect(title.className).to.be('foo');
      });

      it('should allow multiple class names separated with whitespace', () => {
        let title = new Title();
        title.className = 'foo bar';
        expect(title.className).to.be('foo bar');
      });

      it('should emit the changed signal', () => {
        let called = false;
        let title = new Title(defaultOptions);
        title.changed.connect((sender, args) => {
          expect(sender).to.be(title);
          expect(args.name).to.be('className');
          expect(args.oldValue).to.be('baz');
          expect(args.newValue).to.be('ham');
          called = true;
        })
        title.className = 'ham';
        expect(called).to.be(true);
      });

    });

  });

});
