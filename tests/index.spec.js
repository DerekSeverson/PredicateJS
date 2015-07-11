
// Testing Helpers
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

// Require the Module we're testing & lodash for usefulness
var _ = require('lodash');
var Predicate = require('../index.js');

describe('Predicate Tests', function () {

  describe('Module', function () {
    it('can be required via CommonJS', function () {
      expect(Predicate).to.exist;
    });

    it('is a function', function () {
      assert(_.isFunction(Predicate), 'Predicate is a function');
    });
  });

  describe('Basic Predicates', function () {

    describe('Method: passes', function () {

      it('returns false', function () {

        var predicate = Predicate(isEqualTo('Hello!'));
        var passes = predicate.passes('Goodbye!');

        expect(passes).to.be.a('boolean');
        expect(passes).to.be.false;
      });

      it('returns true', function () {

        var predicate = Predicate(isEqualTo('Hello!'));
        var passes = predicate.passes('Hello!');

        expect(passes).to.be.a('boolean');
        expect(passes).to.be.true;
      });
    });

    describe('Method: fails', function () {

      it('returns true', function () {

        var predicate = Predicate(isEqualTo('Hello!'));
        var fails = predicate.fails('Goodbye!');

        expect(fails).to.be.a('boolean');
        expect(fails).to.be.true;
      });

      it('returns false', function () {

        var predicate = Predicate(isEqualTo('Hello!'));
        var fails = predicate.fails('Hello!');

        expect(fails).to.be.a('boolean');
        expect(fails).to.be.false;
      });
    });

    describe('Method: ensure', function () {

      it ('throws an error', function () {
        expect(function () {
          var predicate = Predicate(isEqualTo('Hello!'));
          predicate.ensure('Goodbye!');
        }).to.throw(/Predicate Failed/);
      });

      it ('nothing thrown, returns object passed in', function () {
				var predicate = Predicate(isEqualTo('Hello!'));
				var result = predicate.ensure('Hello!');
				expect(result).to.equal('Hello!');
      });

    });

    describe('Method: determine', function () {

      it ('returns an error', function () {
        var predicate = Predicate(isEqualTo('Hello!'));
        var result = predicate.determine('Goodbye!');
        expect(result).to.be.a('error');
      });

      it ('returns object passed in', function () {
				var predicate = Predicate(isEqualTo('Hello!'));
				var result = predicate.determine('Hello!');
				expect(result).to.equal('Hello!');
      });

    });
  });

  describe('Medium Complexity', function () {
    describe('Method: passes', function () {

      it('returns false', function () {

        var predicate = Predicate(isEqualTo('Hello!'));
        var passes = predicate.passes('Goodbye!');

        expect(passes).to.be.a('boolean');
        expect(passes).to.be.false;
      });

      it('returns true', function () {

        var predicate = Predicate(isEqualTo('Hello!'));
        var passes = predicate.passes('Hello!');

        expect(passes).to.be.a('boolean');
        expect(passes).to.be.true;
      });
    });

    describe('Method: fails', function () {

      it('returns true', function () {

        var predicate = Predicate(isEqualTo('Hello!'));
        var fails = predicate.fails('Goodbye!');

        expect(fails).to.be.a('boolean');
        expect(fails).to.be.true;
      });

      it('returns false', function () {

        var predicate = Predicate(isEqualTo('Hello!'));
        var fails = predicate.fails('Hello!');

        expect(fails).to.be.a('boolean');
        expect(fails).to.be.false;
      });
    });

    describe('Method: ensure', function () {

      it ('throws an exception', function () {
        expect(function () {
          var predicate = Predicate(isEqualTo('Hello!'));
          predicate.ensure('Goodbye!');
        }).to.throw(/Predicate Failed/);
      });

      it ('nothing thrown, returns object passed in', function () {
        expect(function () {
          var predicate = Predicate(isEqualTo('Hello!'));
          var result = predicate.ensure('Goodbye!');
          expect(result).to.equal('Goodbye!');
        });
      });

    });
  });

  describe('Deep Predicates', function () {

    it('method "passes" returns true', function () {

      var predicate = Predicate([_.isObject, {
        'date': _.isDate,
        'number': _.isFinite,
        'empty': _.isEmpty,
        'dog': isEqualTo('yorky'),
        'regex': _.isRegExp,
        'more': [_.isObject, {
          '[]': _.isBoolean,
          'isTrue': isEqualTo(true),
          'isFalse': isEqualTo(false)
        }],
        'list': [_.isArray, {
          '[]': _.isString,
          '0': isEqualTo('football'),
        }]
      }]);

      expect(predicate.passes).to.be.a('function');

      var passes = predicate.passes({
        'data': {
          'date': new Date(),
          'number': 3.2,
          'empty': [],
          'dog': 'yorky',
          'regex': /abc/,
          'more': {
            'isTrue': true,
            'isFalse': false
          },
          'list': [
            'football',
            'baseball',
            'beachball'
          ]
        }
      });

      expect(passes).to.be.a('boolean');
      expect(passes).to.be.true;

    });

  });

  
});

function isEqualTo(a) {
  return function testEquality(b) {
    return _.isEqual(a, b);
  }
}