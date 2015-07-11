
// Testing Helpers
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

// Require the Module we're testing & lodash for usefulness
var _ = require('lodash');
var Predicate = require('../index.js');

describe('Predicate Tests', function () {

  describe('Predicate Module', function () {

    it('can be required via CommonJS', function () {
      expect(Predicate).to.exist;
    });

    it('is a function', function () {
      expect(Predicate).to.be.a('function');
    });

  });

  describe('Instance Interface', function () {

    var predicate;
    beforeEach('create Predicate instance', function () {
      predicate = Predicate();
    });

    it ('does not use prototypes', function () {
      expect(Predicate.prototype)
        .not.to.have.any.keys('passes', 'fails', 'ensure', 'determine');
    });

    describe('Methods:', function () {
      _.each([
        'passes',
        'fails',
        'ensure',
        'determine'
      ], function (methodName) {
        it (methodName, function () {
          expect(predicate[methodName]).to.be.a('function');
        });
      });
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


  describe('Deep Predicates', function () {

    var objToTest;
    var predicateThatPasses;
    var predicateThatFails;

    beforeEach('init object to test', function () {
      objToTest = {
        'data': {
          'number': 3.2,
          'empty': [],
          'dog': 'yorky',
          'more': {
            'isTrue': true,
            'isFalse': false
          },
          'deep': {
            'deeper': {
              'deepest': 'gold'
            }
          }
        },
				'list': [
					'football',
					'baseball',
					'beachball'
				]
      };

      predicateThatPasses = Predicate([_.isObject, {
        'data': {
          'number': _.isNumber,
          'empty': _.isEmpty,
          'dog': isEqualTo('yorky'),
          'more': [_.isObject, {
            '[]': _.isBoolean,
            'isTrue': isEqualTo(true),
            'isFalse': isEqualTo(false)
          }],
          'deep.deeper.deepest': isEqualTo('gold')
        },
        'list': [_.isArray, {
          '[]': _.isString,
          '0': isEqualTo('football')
        }]
      }]);

      predicateThatFails = Predicate([_.isObject, {
        'data': {
          'number': _.isNumber,
          'empty': _.isEmpty,
          'dog': isEqualTo('yorky'),
          'more': [_.isObject, {
            '[]': _.isBoolean,
            'isTrue': isEqualTo(false),
            'isFalse': isEqualTo(false)
          }],
          'deep.deeper.deepest': isEqualTo('silver')
        },
        'list': [_.isArray, {
          '[]': _.isString,
          '0': isEqualTo('football')
        }]
      }]);
    });

    describe('Method: passes', function () {

      it('returns true', function () {
        expect(
          predicateThatPasses.passes(objToTest)
        ).to.be.a('boolean').and.to.be.true;
      });

      it('returns false', function () {
        expect(
          predicateThatFails.passes(objToTest)
        ).to.be.a('boolean').and.to.be.false;
      });

    });

    describe('Method: fails', function () {

      it('returns true', function () {
        expect(
          predicateThatFails.fails(objToTest)
        ).to.be.a('boolean').and.to.be.true;
      });

      it('returns false', function () {
        expect(
          predicateThatPasses.fails(objToTest)
        ).to.be.a('boolean').and.to.be.false;
      });

    });

    describe('Method: ensure', function () {

      it ('throws an error', function () {
        expect(function () {
          predicateThatFails.ensure(objToTest);
        }).to.throw(/Predicate Failed/);
      });

      it ('nothing thrown, returns object passed in', function () {
        expect(
          predicateThatPasses.ensure(objToTest)
        ).to.equal(objToTest);
      });

    });

    describe('Method: determine', function () {

      it ('returns an error', function () {
        expect(
          predicateThatFails.determine(objToTest)
        ).to.be.a('error');
      });

      it ('returns object passed in', function () {
        expect(
          predicateThatPasses.determine(objToTest)
        ).to.equal(objToTest);
      });

    });

  });

  
});

function isEqualTo(a) {
  return function testEquality(b) {
    return _.isEqual(a, b);
  }
}