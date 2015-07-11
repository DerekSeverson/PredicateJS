;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['lodash'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('lodash'));
  } else {
    // Browser globals (root is window)
    root.Predicate = factory(root._);
  }
}(this, function (_) {

  /**
   * PredicateFailure Class/Constructor
   *
   * Collects failures when running Predicate
   * Inherits from Error
   */
  function PredicateFailure(msg, failure) {
    this.name = 'PredicateFailure';
    this.message = (msg || 'Predicate Failed');
    this.failure = (failure || 'Unknown');
  }
  PredicateFailure.prototype = Object.create(Error.prototype);
  PredicateFailure.prototype.constructor = PredicateFailure;

  // Static Methods on our Predicate Module
  Predicate.PredicateFailure = PredicateFailure;
  Predicate.isPredicateFailure = isPredicateFailure;

  return Predicate;


  ////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Predicate Constructor/Class/Factory
   *
   * Does not use prototypes for these reasons:
   *  1. Don't need to call new on the constructor function to get the functionality we need
   *  2. Nobody will be doing a 'obj instanceof Predicate' for any reason (instead: use duck typing like... '_.has(obj, "passes")')
   *  3. We don't have to worry about binding the 'passes function to its owner (works great with Promises)
   *
   *  ex:
   *    $q.when(data)
   *      .then(Predicate(predConfig).passes)...
   *
   * @param config
   * @constructor
   */
  function Predicate(config) {
    var that = {};

    config = (config || {});

    that.passes = function isTrueFor(obj) {
      return predicatePasses(obj, config);
    };

    that.fails = _.negate(that.passes);

    that.ensure = function ensureTrueFor(obj) {
      return ensurePredicate(obj, config);
    };
  }

  function isPredicateFailure(err) {
    return err instanceof PredicateFailure;
  }

  function predicatePasses(obj, config) {
    var result = _.attempt(ensurePredicate, obj, config);
    return (isPredicateFailure(result) || _.isError(result));
  }

  // --------------------------------------------------
  // Private Functions

  /**
   * This is the Meat and Potatoes of the Predicate Class
   *
   * Returns obj if passes predicate
   * Throws PredicateFailure if fails predicate
   */
  function ensurePredicate(obj, config, path) {
    if (!_.isString(path)) path = '';

    if (isArrayPathType(path)) {
      ensurePredicateForEachArrayItem(obj, config, sanitizePath(path));
    } else {
      ensurePredicateForObject(obj, config, path);
    }
    return obj;
  }

	function ensurePredicateForObject(rootObj, configOrPredicate, path, withKey) {

    var predicateResult;
		var objToTest = getObjAtPath(rootObj, path);
		var predicateFunction = getPredicateFunction(configOrPredicate);
		var predicateConfig = getPredicateConfig(configOrPredicate);

		// Validation for the Current Object
		if (_.exists(predicateFunction)) {
			predicateResult = tryPredicate(predicateFunction, objToTest, withKey);
			processPredicateResult(predicateResult, path);
		}

		// Validation for the Current Object's Sub-Objects
		if (_.exists(predicateConfig) && _.exists(objToTest)) {
			_.each(predicateConfig, function (subObjConfigOrPredicate, subpathKey) {
				ensurePredicate(rootObj, subObjConfigOrPredicate, concatPaths(path, subpathKey));
			});
		}
	}

	/**
	 * Iterates through the array/object to grab its keys,
	 */
	function ensurePredicateForEachArrayItem(rootObj, configOrPredicate, path) {
		var objToValidate = getObjAtPath(rootObj, path);
		var keys = _.keys(objToValidate);

		_.each(keys, function (index) {
			ensurePredicateForObject(rootObj, configOrPredicate, concatPaths(path, index), index);
		});
	}

  /**
   * The argument itself is the config object or
   * the 2nd element in the array that's passed in.
   * if neither, just return undefined - completely valid.
   */
  function getPredicateConfig(configOrPredicate) {
    var configToReturn;

    if (_.isPlainObject(configOrPredicate)) {
      configToReturn = configOrPredicate;
    } else if (_.isArray(configOrPredicate) && _.isPlainObject(configOrPredicate[1])) {
      configToReturn = configOrPredicate[1];
    }

    return configToReturn;
  }

  /**
   * The argument itself is the predicate function or
   * the 1st element in the array that's passed in.
   * if neither, just return undefined - completely valid.
   */
  function getPredicateFunction(configOrPredicate) {
    var predFunc;

    if (_.isFunction(configOrPredicate)) {
      predFunc = configOrPredicate;
    } else if (_.isArray(configOrPredicate) && _.isFunction(configOrPredicate[0])) {
      predFunc = configOrPredicate[0];
    }
    // else return undefined;

    return predFunc;
  }

  /**
   * Attempts Predicate Function with the object and key as arguments
   * If key not given, then it will not be included as a 2nd argument to the Predicate Function
   *
   */
  function tryPredicate(predicationFunction, objToTest, withOptionalKey) {
    var isValid;

    if (_.exists(withOptionalKey)) {
      isValid = _.attempt(predicationFunction, objToTest, withOptionalKey);
    } else {
      isValid = _.attempt(predicationFunction, objToTest);
    }

    return isValid;
  }

  function processPredicateResult(result, path) {
    if (_.isError(result) || result === false) {
      // false to give default message (could add custom messaging for each predicate tested)
      // failure for now will just be the object path that failed.
      throw new PredicateFailure(false, path);
    }
  }




  // --------------------------------------------------
  // Helper Functions

  function sanitizePath(str) {
    if (isArrayPathType(str)) { // 'data.references[]' => 'data.references'
      return str.slice(0, -2);  // chop off last two chars
    }
    return str;
  }

  function isArrayPathType(str) {
    if (!_.isNonEmptyString(str)) return false;
    return ('[]' === str.slice(-2)); // last two chars
  }

  function concatPaths(/* paths... */) {
    return _.filter(_.toArray(arguments), _.isNonEmptyString).join('.');
  }

  function getObjAtPath(rootObj, path) {
    if (isNonEmptyString(path)) {
      return _.get(rootObj, path);
    }
    return rootObj;
  }

  function isNonEmptyString(str) {
    return _.isString(str) && !_.isEmpty(str);
  }

  function exists(obj) {
    // double equals (instead of triple) is on purpose.
    return obj != null;
  }
  
}));