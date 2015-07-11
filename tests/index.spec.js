
// Testing Helpers
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

// Require the Module we're testing & lodash for usefulness
var _ = require('lodash');
var Predicate = require('../index.js');

describe('Predicate Module', function () {
  
  it ('can be required via CommonJS', function () {
    expect(Predicate).to.exist;
  });
  
  it ('is a function', function () {
    assert(_.isFunction(Predicate), 'Predicate is a function');
  });
  
});