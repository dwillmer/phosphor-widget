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
  ChildMessage, ResizeMessage, Widget
} from '../../lib/index';


describe('phosphor-widget', () => {

  describe('ChildMessage', () => {

    describe('#constructor()', () => {

      it('should accept the message type and child widget', () => {
        let widget = new Widget();
        let msg = new ChildMessage('test', widget);
        expect(msg instanceof ChildMessage).to.be(true);
      });

      it('should accept an optional `previousIndex`', () => {
        let widget = new Widget();
        let msg = new ChildMessage('test', widget, 1);
        expect(msg instanceof ChildMessage).to.be(true);
      });

      it('should accept an optional `currentIndex`', () => {
        let widget = new Widget();
        let msg = new ChildMessage('test', widget, 1, 0);
        expect(msg instanceof ChildMessage).to.be(true);
      });

      it('should default the `previousIndex` to `-1`', () => {
        let widget = new Widget();
        let msg = new ChildMessage('test', widget);
        expect(msg.previousIndex).to.be(-1);
      });

      it('should default the `currentIndex` to `-1`', () => {
        let widget = new Widget();
        let msg = new ChildMessage('test', widget, 1);
        expect(msg.currentIndex).to.be(-1);
      });

    });

    describe('#child', () => {

      it('should be the child passed to the constructor', () => {
        let widget = new Widget();
        let msg = new ChildMessage('test', widget);
        expect(msg.child).to.be(widget);
      });

      it('should be a read-only property', () => {
        let widget0 = new Widget();
        let widget1 = new Widget();
        let msg = new ChildMessage('test', widget0);
        expect(() => { msg.child = widget1; }).to.throwError();
      });

    });

    describe('#currentIndex', () => {

      it('should be the index provided to the constructor', () => {
        let widget = new Widget();
        let msg = new ChildMessage('test', widget, 1, 2);
        expect(msg.currentIndex).to.be(2);
      });

      it('should be a read-only property', () => {
        let widget = new Widget();
        let msg = new ChildMessage('test', widget, 1, 2);
        expect(() => { msg.currentIndex = 1; }).to.throwError();
      });

    });

    describe('#previousIndex', () => {

      it('should be the index provided to the constructor', () => {
        let widget = new Widget();
        let msg = new ChildMessage('test', widget, 2);
        expect(msg.previousIndex).to.be(2);
      });

      it('should be a read-only property', () => {
        let widget = new Widget();
        let msg = new ChildMessage('test', widget, 1, 2);
        expect(() => { msg.previousIndex = 0; }).to.throwError();
      });

    });

  });

  describe('ResizeMessage', () => {

    describe('.UnknownSize', () => {

      it('should be a `ResizeMessage`', () => {
        let msg = ResizeMessage.UnknownSize;
        expect(msg instanceof ResizeMessage).to.be(true);
      });

      it('should have a `width` of `-1`', () => {
        let msg = ResizeMessage.UnknownSize;
        expect(msg.width).to.be(-1);
      });

      it('should have a `height` of `-1`', () => {
        let msg = ResizeMessage.UnknownSize;
        expect(msg.height).to.be(-1);
      });

    });

    describe('#constructor()', () => {

      it('should accept a width and height', () => {
        let msg = new ResizeMessage(100, 100);
        expect(msg instanceof ResizeMessage).to.be(true);
      });

    });

    describe('#width', () => {

      it('should be the width passed to the constructor', () => {
        let msg = new ResizeMessage(100, 200);
        expect(msg.width).to.be(100);
      });

      it('should be a read-only property', () => {
        let msg = new ResizeMessage(100, 200);
        expect(() => { msg.width = 200; }).to.throwError();
      });

    });

    describe('#height', () => {

      it('should be the height passed to the constructor', () => {
        let msg = new ResizeMessage(100, 200);
        expect(msg.height).to.be(200);
      });

      it('should be a read-only property', () => {
        let msg = new ResizeMessage(100, 200);
        expect(() => { msg.height = 200; }).to.throwError();
      });

    });

  });

});
