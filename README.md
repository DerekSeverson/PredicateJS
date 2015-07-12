# PredicateJS

[![Build Status](https://travis-ci.org/DerekSeverson/PredicateJS.svg?branch=master)](https://travis-ci.org/DerekSeverson/PredicateJS)

A Javascript Module for Robust Predicate Creation

## Documentation

Let's just say the ```Predicate``` function takes in an argument called a "Predicate-Definition" (PD).

##### Predicate-Definitions can be one of three things:

> (Note: the 'test-object' terminology used below refers to the object passed into the methods: 'passes', fails', 'ensure', and 'determine').

<dl>
  <dt><strong>1. Function</strong></dt>
  <dd>The function just gets called with the test-object passed in as its argument.</dd>
  <dd><strong>Usage</strong> - when wanting to test the object at hand (getting a true/false answer).</dd>

  <dt><strong>2. Object</strong></dt>
  <dd>The object's keys are used to traverse the test-object's properties to do deeper testing.  The values of the Predicate-Definition object passed in should also be Predicate-Definitions which are used to test against the corresponding keys of the test-object.</dd>
  <dd><strong>Usage</strong> - when wanting to test the properties of the object at hand.</dd>

  <dt><strong>3. Array</strong></dt>
  <dd>Passing in an Array is a combinition of options 1 & 2 in order to run a predicate on the test-object itself AND its properties.  The array gets two items. 1st item must be the predicate function called with the test-object (see #1 Function). 2nd item must be an Object Predicate Definition (see #2 Object) which traverse's the test-object's properties.</dd>
  <dd><strong>Usage</strong> - when wanting to test the object at hand AND its properties.</dd>
</dl>

##### Observations from the Definitions above:

1. Observe that PD type ```#3 Array``` is made up of both PD types ```#1 Function``` & ```#2 Object```.

2. Observe that PD type ```#2 Object``` is made up of one or more PD types of ```#1 Function```.

3. Observe that PD type ```#1 Function``` is the building block of creating a larger, more complex predicate function.

Apologies for the terrible explanation above of how to use PredicateJS. Hopefully the examples will be of more use. Please offer suggestions on how to improve the wordage to make the documentation more comprehendable. Thanks!

## Examples

Examples are the bee's knees ...

##### Quick Example of Methods
```javascript

var pred = Predicate(_.isString);

// 'passes'
pred.passes('Hello, World!');    // => true
pred.passes({});                 // => false

// 'fails'
pred.fails('Hello, World!');     // => false
pred.fails({});                  // => true

// 'ensure'
pred.ensure('Hello, World!');    // => 'Hello, World!'
pred.ensure({});                 // ** Error Thrown **

// 'determine'
pred.determine('Hello, World!'); // => 'Hello, World!'
pred.determine({});              // => Error

```

##### Creating Complex Predicates (... made easy!)
```javascript

// EX 1
var myBookCollection = [
  'Design Patterns',
  'Programming Pearls',
  'Team Geek',
  'The C Programming Language',
  'The Pragmatic Programmer'
];

Predicate([_.isArray, {
  '[]': _.isString,
  '1': _.partial(_.isEqual, 'Programming Pearls'),
  '2': function (thirdBook) { // basically, same as line above
    return 'Team Geek' === thirdBook;
  }
}]).passing(myBookCollection);   // => true

// NOTE: '[]' is the syntax used to apply the callback to EACH value in the area

// EX 2

var wackyRandomObj = {
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

Predicate([_.isObject, {
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
  'list[]': function (str) {
    return _.isString(str) && 'ball' === str.slice(-4);
  }
}]).exists(wackyRandomObj);    // => just returns the wackyRandomObj (No Error Thrown)

// high-order function used in example #2
function isEqualTo(a) {
  return function (b) {
    return _.isEqual(a, b);
  };
}

```


