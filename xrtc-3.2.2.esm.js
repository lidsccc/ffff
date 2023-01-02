/*!
 * xrtc.js v3.2.2
 * (c) 2020-2022 
 * Released under the MIT License in iflytek.
 */

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _arrayLikeToArray$7(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _unsupportedIterableToArray$7(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray$7(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$7(o, minLen);
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray$7(arr, i) || _nonIterableRest();
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime_1 = createCommonjsModule(function (module) {
var runtime = (function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  module.exports 
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
});

var regenerator = runtime_1;

var EventEmitter = /*#__PURE__*/function () {
  function EventEmitter(logger) {
    _classCallCheck(this, EventEmitter);

    this.events = {};
    this.logger = logger;
  }
  /**
   * 监听 event 事件,触发时调用 callback 函数
   * @param event 
   * @param callback 
   * @returns 
   */


  _createClass(EventEmitter, [{
    key: "on",
    value: function on(event, callback) {
      var callbacks = this.events[event] || [];
      callbacks.push(callback);
      this.events[event] = callbacks;
      return this;
    }
    /**
     * 监听 event 事件
     * @param event string
     * @param callback Function
     */

  }, {
    key: "once",
    value: function once(event, callback) {
      var _this = this;

      var cb = function cb() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        callback.apply(null, args);

        _this.off(event, cb);
      };

      this.on(event, cb);
    }
    /**
     * 停止监听 event 事件
     * @param event 
     * @param callback 
     * @returns 
     */

  }, {
    key: "off",
    value: function off(event, callback) {
      if (event === "*") {
        this.events = {};
        return this;
      }

      var callbacks = this.events[event];
      this.events[event] = callbacks && callbacks.filter(function (fn) {
        return fn !== callback;
      });
      return this;
    }
    /**
     * 触发事件,并把参数传给事件的处理函数
     * @param event 
     * @param args 
     * @returns 
     */

  }, {
    key: "emit",
    value: function emit(event) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      if (event !== "network-quality" && event !== 'audio-volume') {
        this.logger && this.logger.info('Emit event name:', event);
      }

      var callbacks = this.events[event];
      callbacks && callbacks.forEach(function (fn) {
        return fn.apply(null, args);
      });
      return this;
    }
  }]);

  return EventEmitter;
}();

/**
 * 角色权限
 */
var permissionMap = new Map(); // 主播

permissionMap.set('anchor', {
  publish: {
    audio: true,
    video: true
  },
  subscribe: {
    audio: true,
    video: true
  },
  control: true
}); // 观众

permissionMap.set('audience', {
  publish: {
    audio: false,
    video: false
  },
  subscribe: {
    audio: true,
    video: true
  },
  control: false
});

var Mode = {
  rtc: 'rtc',
  live: 'live'
};
/**
 * 主讲角色
 */

var anchor = "anchor";
/**
 * 观众角色
 */

var audience = "audience";
/**
 * 客户端状态枚举
 */

var ClientState;
/**
 * 发布流状态枚举
 */

(function (ClientState) {
  ClientState[ClientState["New"] = 0] = "New";
  ClientState[ClientState["Joining"] = 1] = "Joining";
  ClientState[ClientState["Joined"] = 2] = "Joined";
  ClientState[ClientState["Leaving"] = 3] = "Leaving";
  ClientState[ClientState["Leaved"] = 4] = "Leaved";
})(ClientState || (ClientState = {}));

var PublishState$1;
/**
 * 订阅流状态枚举
 */

(function (PublishState) {
  PublishState[PublishState["Create"] = 0] = "Create";
  PublishState[PublishState["Publishing"] = 1] = "Publishing";
  PublishState[PublishState["Published"] = 2] = "Published";
  PublishState[PublishState["Unpublished"] = 3] = "Unpublished";
})(PublishState$1 || (PublishState$1 = {}));

var SubscribeState$1;
/**
 * remote stream type
 */

(function (SubscribeState) {
  SubscribeState[SubscribeState["Create"] = 0] = "Create";
  SubscribeState[SubscribeState["Subscribing"] = 1] = "Subscribing";
  SubscribeState[SubscribeState["Subscribed"] = 2] = "Subscribed";
  SubscribeState[SubscribeState["Unsubscribed"] = 3] = "Unsubscribed";
})(SubscribeState$1 || (SubscribeState$1 = {}));

var StreamKind$1;
/**
 * 自定义接口返回Code码
 */

(function (StreamKind) {
  StreamKind[StreamKind["Invalid"] = 0] = "Invalid";
  StreamKind[StreamKind["AudioOnly"] = 1] = "AudioOnly";
  StreamKind[StreamKind["VideoOnly"] = 2] = "VideoOnly";
  StreamKind[StreamKind["AudioVideo"] = 3] = "AudioVideo";
})(StreamKind$1 || (StreamKind$1 = {}));

var RESPONSE_CODE = {
  /**
   * 错误码
   */
  ERROR: 0,

  /**
   * 成功码
   */
  SUCCESS: 1,

  /**
  * 超时
  */
  TIMEOUT: 2
};
/**
 * 主流
 */

var MAIN = 'main';
/**
 * 辅流
 */

var AUXILIARY = 'auxiliary';

/**
 * 客户端事件名常量
 * @author kmchen
 */

/**
 *  用户自己加入房间会，收到该事件
 */
var MEMBERS = 'members';
/**
 * 远端流添加事件，当远端用户发布流后会收到该通知
 */

var STREAM_ADDED = 'stream-added';
/**
 * 远端流移除事件，当远端用户取消发布流后会收到该通知
 */

var STREAM_REMOVED = 'stream-removed';
/**
 * 远端流更新事件，当远端用户添加、移除或更换音视频轨道后会收到该通知
 */

var STREAM_UPDATED = 'stream-updated';
/**
 * 远端流订阅成功事件，调用 subscribe() 成功后会触发该事件
 */

var STREAM_SUBSCRIBED = 'stream-subscribed';
/**
 * WebSocket 信令通道连接状态变化事件
 */

var CONNECTION_STATE_CHANGED = 'connection-state-changed';
/**
 * 远端用户进房通知，只有主动推流的远端用户进房才会收到该通知
 */

var PEER_JOIN = 'peer-join';
/**
 * 远端用户退房通知，只有主动推流的远端用户退房才会收到该通知
 */

var PEER_LEAVE = 'peer-leave';
/**
 * 远端用户禁用音频通知
 */

var MUTE_AUDIO = 'mute-audio';
/**
 * 远端用户禁用视频通知
 */

var MUTE_VIDEO = 'mute-video';
/**
 * 远端用户启用音频通
 */

var UNMUTE_AUDIO = 'unmute-audio';
/**
 * 远端用户启用视频通知
 */

var UNMUTE_VIDEO = 'unmute-video';
/**
 * 用户被踢出房间通知，被踢原因有：同名用户登录，被账户管理员主动踢出房间
 */

var CLIENT_BANNED = 'client-banned';
/**
 * 客户端错误事件，当出现不可恢复错误后 Client 会通过该事件上报
 */

var ERROR = 'error';
/**
 * Audio/Video Player 状态变化事件 App 可根据状态变化来更新 UI 提供 音视频轨道状态变化
 */

var PLAYER_STATE_CHANGED = 'player-state-changed';
/**
 * 本地屏幕分享停止事件通知，仅对本地屏幕分享流有效屏幕分享关闭
 */

var SCREEN_SHARING_STOPPED = 'screen-sharing-stopped';
/**
 * // 网络质量
 * 网络质量统计数据事件，进房后开始统计，包括上行（uplinkNetworkQuality）和下行（downlinkNetworkQuality）的质量统计数据。
 */

var NETWORK_QUALITY = 'network-quality';
/**
 * 摄像头设备变化
 */

var CAMERA_CHANGED = 'camera-changed';
/**
 * 录音设备变化
 */

var RECORDING_DEVICE_CHANGED = 'recording-device-changed';
/**
 * 扬声器设备变化
 */

var PLAYBACK_DEVICE_CHANGED = 'playback-device-changed';
/**
* 监听音量大小
*/

var AUDIO_VOLUME = 'audio-volume';
/**
* 监听页面可见性
*/

var PAGE_VISIBILITY_STATE = 'page-visibility-state';
/**
* 用户插拔设备，SDK自动切换设备通知
*/

var AUTO_SWITCH_DEVICE = 'auto-switch-device';
/**
 * 监听 localStream 添加轨道事件
 */

var STREAM_ADD_TRACK = 'stream-add-track';
/**
 * 监听 localStream 移除轨道事件
 */

var STREAM_REMOVE_TRACK = 'stream-remove-track';
/**
 * 监听 localStream 音视频轨道更新的结果
 */

var STREAM_TRACK_UPDATE_RESULT = 'stream-track-update-result';
/**
 * 监听 localStream 切换设备
 */

var STREAM_SWITCH_DEVICE = 'stream-switch-device';
/**
 * 监听 localStream 更换音频或视频轨道
 */

var STREAM_REPLACE_TRACK = 'stream-replace-track';
/**
 * 监听 publish  peerConnection ice 断开
 */

var PUBLISH_ICE_STATE = 'publish-ice-state';
/**
 * 监听 subscribe peerConnection ice 断开
 */

var SUBSCRIBE_ICE_STATE = 'subscribe-ice-state';

var common = {
  /**
   * 无效的参数
   */
  INVALID_PARAMETER: 0x1000,

  /**
   * 无效的操作
   */
  INVALID_OPERATION: 0x1001,

  /**
   * 不支持
   */
  NOT_SUPPORTED: 0x1002
};

/**
 * client 错误码
 */
var client = {
  /**
   * 加入房间失败
   */
  JOIN_ROOM_FAILED: 0x4004,

  /**
   * 创建 offer failed
   */
  CREATE_OFFER_FAILED: 0x4005,

  /**
   * 退出房间失败
   */
  LEAVE_ROOM_FAILED: 0x4006,

  /**
   * 发布本地流失败
   */
  PUBLISH_STREAM_FAILED: 0x4007,

  /**
   * 取消发布本地流失败
   */
  UNPUBLISH_STREAM_FAILED: 0x4008,

  /**
   * 订阅远端流失败
   */
  SUBSCRIBE_FAILED: 0x4009,

  /**
   * 取消订阅远端流失败
   */
  UNSUBSCRIBE_FAILED: 0x4010,

  /**
   * 切换用户角色异常
   */
  SWITCH_ROLE_ERROR: 0x4011,

  /**
   * 获取和网关链接状态统计异常
   */
  INVALID_TRANSPORT_STATA: 0x4012,

  /**
   * 获取本地音频统计数据异常
   */
  LOCAL_AUDIO_STATA_ERROR: 0x4013,

  /**
   * 获取本地视频统计数据异常
   */
  LOCAL_VIDEO_STATA_ERROR: 0x4014,

  /**
   * 获取远端音频统计数据异常
   */
  REMOTE_AUDIO_STATA_ERROR: 0x4015,

  /**
   * 获取远端视频统计数据异常
   */
  REMOTE_VIDEO_STATA_ERROR: 0x4016,

  /**
   * 本地流更新大小流失败
   */
  LOCAL_SWITCH_SIMULCAST: 0x4017,

  /**
   * 远端流切换大小流失败
   */
  REMOTE_SWITCH_SIMULCAST: 0x4018,

  /**
   * 远端流订阅超时
   */
  SUBSCRIPTION_TIMEOUT: 0x4042,

  /**
   * 未知错误，如 SDK 未定义的错误、浏览器抛出的错误
   */
  UNKNOWN: '0xFFFF'
};

/**
 * 流操作异常码，范围：3000-3999
 * @author yuersen
 */
var stream = {
  /**
   * 初始化本地流失败
   */
  INIT_STREAM_FAILED: 0x3001,

  /**
   * 播放流失败
   */
  PLAY_STREAM_ERROR: 0x3002,

  /**
   * 设置订阅流音视频输出设备异常
   */
  SET_AUDIO_OUTPUT_FAILED: 0x3003,

  /**
   * 设置视频 profile 异常
   */
  SET_VIDEO_PROFILE_ERROR: 0x3004,

  /**
   * 设置屏幕共享 Profile 异常
   */
  SET_SCREEN_SHARE_FAILED: 0x3005,

  /**
   * 切换媒体输入设备
   */
  SWITCH_DEVICE_FAILED: 0x3006,

  /**
   * 添加音频或视频轨道失败
   */
  ADD_TRACK_FAILED: 0x3007,

  /**
   * 移除音视频轨道失败
   */
  REMOVE_TRACK_FAILED: 0x3008,

  /**
   * 更换更换音频或视频轨道失败
   */
  REPLACE_TRACK_FAILED: 0x3009,

  /**
   * 禁止自动播放音视频
   */
  PLAY_NOT_ALLOWED: 0x4043,

  /**
   * 自动恢复摄像头、麦克风采集失败
   */
  DEVICE_AUTO_RECOVER_FAILED: 0x4044,

  /**
  * PeerConnection连接失败
  */
  RTCPEERCONNECTION_SATE_FAILED: 0x4060
};

var device = {
  /**
   * 未发现设备
   */
  DEVICE_NOT_FOUND: 0x100,

  /**
   * 不支持H264
   */
  H264_NOT_SUPPORTED: 0x101,

  /**
   * 未发现摄像头设备
   */
  CAMERAS_NOT_FOUND: 0x102,

  /**
   * 未发现麦克风设备
   */
  MICROPHONES_NOT_FOUND: 0x103,

  /**
   * 未发现扬声器设备
   */
  SPEAKERS_NOT_FOUND: 0x104
};

var ws = {
  /**
   * 信令建立失败
   */
  SIGNAL_CHANNEL_SETUP_FAILED: 0x5001,

  /**
   * 信令重连失败
   */
  SIGNAL_CHANNEL_RECONNECTION_FAILED: 0x5002,

  /**
   * 信令超时
   */
  SERVER_TIMEOUT: 0x5003
};

var http = {
  /**
   * 服务端未知错误，请重试
   */
  SERVER_UNKNOWN_ERROR: -10011,

  /**
   * userSig 鉴权失败
   */
  AUTHORIZATION_FAILED: -10013,

  /**
   * 服务端获取服务器节点失败，请重试
   */
  GET_SERVER_NODE_FAILED: -10015,

  /**
   * 服务端超时，请重试
   */
  REQUEST_TIMEOUT: -10020
};

function ownKeys$8(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$8(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$8(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$8(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var ERCode = _objectSpread$8(_objectSpread$8(_objectSpread$8(_objectSpread$8(_objectSpread$8(_objectSpread$8({}, common), client), stream), device), ws), http);

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _isNativeReflectConstruct$3() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct$3()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var ER = /*#__PURE__*/function (_Error) {
  _inherits(ER, _Error);

  var _super = _createSuper$2(ER);

  function ER(opt) {
    var _this;

    _classCallCheck(this, ER);

    _this = _super.call(this);
    _this.code = opt.code;
    opt.name && (_this.name = opt.name);
    var message = opt.message instanceof Error ? opt.message.message : opt.message;
    _this.message = message;
    return _this;
  }
  /**
   * 返回错误码
   * @returns number
   */


  _createClass(ER, [{
    key: "getCode",
    value: function getCode() {
      return this.code;
    }
  }]);

  return ER;
}( /*#__PURE__*/_wrapNativeSuper(Error));

var SoundMeter = /*#__PURE__*/function () {
  function SoundMeter() {
    var _this = this;

    _classCallCheck(this, SoundMeter);

    // @ts-ignore
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.instant = 0;
    this.slow = 0;
    this.clip = 0; // ScriptProcessorNode手动处理数据流

    this.script = this.context.createScriptProcessor(2048, 1, 1);

    this.script.onaudioprocess = function (e) {
      var n,
          r = e.inputBuffer.getChannelData(0),
          i = 0,
          o = 0;

      for (n = 0; n < r.length; ++n) {
        i += r[n] * r[n];
        Math.abs(r[n]) > 0.99 && (o += 1);
      }

      _this.instant = Math.sqrt(i / r.length);
      _this.slow = 0.95 * _this.slow + 0.05 * _this.instant;
      _this.clip = o / r.length;
    };
  }

  _createClass(SoundMeter, [{
    key: "connectToSource",
    value: function connectToSource(track) {
      try {
        var n = new MediaStream();
        n.addTrack(track);
        this.mic = this.context.createMediaStreamSource(n);
        this.mic.connect(this.script);
        this.script.connect(this.context.destination);
      } catch (r) {
        console.error("soundMeter connectoToSource error: " + r);
      }
    }
  }, {
    key: "stop",
    value: function stop() {
      this.mic.disconnect();
      this.script.disconnect();
    }
  }, {
    key: "resume",
    value: function resume() {
      this.context && this.context.resume();
    }
  }, {
    key: "getVolume",
    value: function getVolume() {
      return this.instant.toFixed(2);
    }
  }]);

  return SoundMeter;
}();

var AudioPlayer = /*#__PURE__*/function () {
  function AudioPlayer(options) {
    _classCallCheck(this, AudioPlayer);

    this.stream = options.stream;
    this.userId = options.stream.userId;
    this.log = options.stream.logger;
    this.track = options.track;
    this.div = options.div;
    this.muted = options.muted;
    this.outputDeviceId = options.deviceId;
    this.volume = options.volume;
    this.element = null;
    this.state = "NONE";
    this._emitter = new EventEmitter();
    this.handleEleEventPlaying = this.eleEventPlaying.bind(this);
    this.handleEleEventEnded = this.eleEventEnded.bind(this);
    this.handleEleEventPause = this.eleEventPause.bind(this);
    this.handleTrackEventEnded = this.trackEventEnded.bind(this);
    this.handleTrackEventMute = this.trackEventMute.bind(this);
    this.handleTrackEventUnmute = this.trackEventUnmute.bind(this);
  }

  _createClass(AudioPlayer, [{
    key: "play",
    value: function () {
      var _play = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
        var _this = this;

        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  var track = new MediaStream();
                  track.addTrack(_this.track);
                  var dom = document.createElement("audio");
                  dom.srcObject = track;
                  dom.muted = _this.muted;
                  dom.setAttribute("id", "audio_".concat(_this.stream.getId(), "_").concat(Date.now()));
                  dom.setAttribute("autoplay", "autoplay");
                  dom.setAttribute("playsinline", "playsinline");

                  _this.div.appendChild(dom);

                  if (_this.outputDeviceId) {
                    dom.setSinkId(_this.outputDeviceId);
                  }

                  _this.element = dom;

                  _this.setVolume(_this.volume);

                  _this.handleEvents();

                  var canplay = function canplay() {
                    _this.element.play().then(function () {
                      resolve();
                    })["catch"](function (err) {
                      reject(err);
                    });
                  };

                  dom.addEventListener('canplay', canplay);
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function play() {
        return _play.apply(this, arguments);
      }

      return play;
    }()
  }, {
    key: "handleEvents",
    value: function handleEvents() {
      var _this$element, _this$element2, _this$element3;

      (_this$element = this.element) === null || _this$element === void 0 ? void 0 : _this$element.addEventListener("playing", this.handleEleEventPlaying);
      (_this$element2 = this.element) === null || _this$element2 === void 0 ? void 0 : _this$element2.addEventListener("ended", this.handleEleEventEnded);
      (_this$element3 = this.element) === null || _this$element3 === void 0 ? void 0 : _this$element3.addEventListener("pause", this.handleEleEventPause);
      this.trackHandleEvents();
    }
  }, {
    key: "trackHandleEvents",
    value: function trackHandleEvents() {
      var _this$track, _this$track2, _this$track3;

      (_this$track = this.track) === null || _this$track === void 0 ? void 0 : _this$track.addEventListener("ended", this.handleTrackEventEnded);
      (_this$track2 = this.track) === null || _this$track2 === void 0 ? void 0 : _this$track2.addEventListener("mute", this.handleTrackEventMute);
      (_this$track3 = this.track) === null || _this$track3 === void 0 ? void 0 : _this$track3.addEventListener("unmute", this.handleTrackEventUnmute);
    }
  }, {
    key: "trackRemoveEvents",
    value: function trackRemoveEvents() {
      var _this$track4, _this$track5, _this$track6;

      (_this$track4 = this.track) === null || _this$track4 === void 0 ? void 0 : _this$track4.removeEventListener("ended", this.handleTrackEventEnded);
      (_this$track5 = this.track) === null || _this$track5 === void 0 ? void 0 : _this$track5.removeEventListener("mute", this.handleTrackEventMute);
      (_this$track6 = this.track) === null || _this$track6 === void 0 ? void 0 : _this$track6.removeEventListener("unmute", this.handleTrackEventUnmute);
    }
  }, {
    key: "removeEvents",
    value: function removeEvents() {
      var _this$element4, _this$element5, _this$element6;

      (_this$element4 = this.element) === null || _this$element4 === void 0 ? void 0 : _this$element4.removeEventListener("playing", this.handleEleEventPlaying);
      (_this$element5 = this.element) === null || _this$element5 === void 0 ? void 0 : _this$element5.removeEventListener("ended", this.handleEleEventEnded);
      (_this$element6 = this.element) === null || _this$element6 === void 0 ? void 0 : _this$element6.removeEventListener("pause", this.handleEleEventPause);
      this.trackRemoveEvents();
    }
  }, {
    key: "setSinkId",
    value: function setSinkId(deviceId) {
      var _this$element7;

      if (this.outputDeviceId === deviceId) {
        return;
      }

      this.outputDeviceId = deviceId;
      (_this$element7 = this.element) === null || _this$element7 === void 0 ? void 0 : _this$element7.setSinkId(deviceId);
    }
  }, {
    key: "setVolume",
    value: function setVolume(volume) {
      this.log.info("stream - audioElement setVolume to : ".concat(volume.toString()));
      this.element.volume = volume;
    }
  }, {
    key: "getAudioLevel",
    value: function getAudioLevel() {
      if (!this.soundMeter) {
        this.soundMeter = new SoundMeter();
        this.soundMeter.connectToSource(this.track);
      }

      return this.soundMeter.getVolume();
    }
  }, {
    key: "stop",
    value: function stop() {
      this.removeEvents();
      this.div.removeChild(this.element);
      this.element.srcObject = null;
      this.soundMeter && (this.soundMeter.stop(), this.soundMeter = null);
    }
  }, {
    key: "resume",
    value: function resume() {
      var _this$element8;

      return (_this$element8 = this.element) === null || _this$element8 === void 0 ? void 0 : _this$element8.play();
    }
  }, {
    key: "getAudioElement",
    value: function getAudioElement() {
      return this.element;
    }
    /**
    * 设置audio的track并播放
    * @param 
    */

  }, {
    key: "setAudioTrack",
    value: function setAudioTrack(t) {
      this.trackRemoveEvents();
      var track = new MediaStream();
      track.addTrack(t);
      this.track = t;
      this.trackHandleEvents();
      this.soundMeter = null;
      this.log.info('setAudioTrack', t);

      if (this.element) {
        this.element.srcObject = track;
        this.element.play();
      }
    } // 监听audio playing 事件

  }, {
    key: "eleEventPlaying",
    value: function eleEventPlaying() {
      this.log.info("stream ".concat(this.userId, " - audio player is starting playing"));
      this.state = "PLAYING";

      this._emitter.emit(PLAYER_STATE_CHANGED, {
        state: this.state,
        reason: "playing"
      });
    } // 监听audio ended 事件

  }, {
    key: "eleEventEnded",
    value: function eleEventEnded() {
      this.log.info("stream ".concat(this.userId, " - audio player is ended"));
      "STOPPED" !== this.state && (this.state = "STOPPED", this._emitter.emit(PLAYER_STATE_CHANGED, {
        state: this.state,
        reason: "ended"
      }));
    } // 监听audio ended 事件

  }, {
    key: "eleEventPause",
    value: function eleEventPause() {
      this.log.info("stream ".concat(this.userId, " - audio player is paused"));
      this.state = "PAUSED";

      this._emitter.emit(PLAYER_STATE_CHANGED, {
        state: this.state,
        reason: "pause"
      });
    } // 监听track ended 事件

  }, {
    key: "trackEventEnded",
    value: function trackEventEnded() {
      this.log.info("stream ".concat(this.userId, " - audio player track is ended"));
      "STOPPED" !== this.state && (this.state = "STOPPED", this._emitter.emit(PLAYER_STATE_CHANGED, {
        state: this.state,
        reason: "ended"
      }));
    } // 监听track mute 事件

  }, {
    key: "trackEventMute",
    value: function trackEventMute() {
      this.log.info("stream ".concat(this.userId, " - audio track is muted"));
      "PAUSED" !== this.state && (this.state = "PAUSED", this._emitter.emit(PLAYER_STATE_CHANGED, {
        state: this.state,
        reason: "mute"
      }));
    } // 监听track unmute 事件

  }, {
    key: "trackEventUnmute",
    value: function trackEventUnmute() {
      this.log.info("stream ".concat(this.userId, " - audio track is unmuted"));
      "PAUSED" === this.state && (this.state = "PLAYING", this._emitter.emit(PLAYER_STATE_CHANGED, {
        state: this.state,
        reason: "unmute"
      }));
    }
  }]);

  return AudioPlayer;
}();

var VideoPlayer = /*#__PURE__*/function () {
  function VideoPlayer(options) {
    _classCallCheck(this, VideoPlayer);

    this.stream = options.stream;
    this.userId = options.stream.userId;
    this.log = options.stream.logger;
    this.track = options.track;
    this.div = options.div;
    this.muted = options.muted;
    this.objectFit = options.objectFit;
    this.mirror = options.mirror;
    this.element = null;
    this.state = "NONE";
    this._emitter = new EventEmitter();
    this.handleEleEventPlaying = this.eleEventPlaying.bind(this);
    this.handleEleEventEnded = this.eleEventEnded.bind(this);
    this.handleEleEventPause = this.eleEventPause.bind(this);
    this.handleTrackEventEnded = this.trackEventEnded.bind(this);
    this.handleTrackEventMute = this.trackEventMute.bind(this);
    this.handleTrackEventUnmute = this.trackEventUnmute.bind(this);
  }

  _createClass(VideoPlayer, [{
    key: "play",
    value: function () {
      var _play = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
        var _this = this;

        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  var track = new MediaStream();
                  track.addTrack(_this.track);
                  var dom = document.createElement("video");
                  dom.srcObject = track;
                  dom.muted = !0;
                  var style = "width: 100%; height: 100%; object-fit: ".concat(_this.objectFit, ";");
                  _this.mirror && (style += "transform: rotateY(180deg);");
                  dom.setAttribute("id", "video_".concat(_this.stream.getId(), "_").concat(Date.now()));
                  dom.setAttribute("style", style);
                  dom.setAttribute("autoplay", "autoplay");
                  dom.setAttribute("playsinline", "playsinline");

                  _this.div.appendChild(dom);

                  _this.element = dom;

                  _this.handleEvents();

                  var canplay = function canplay() {
                    _this.element.play().then(function () {
                      resolve();
                    })["catch"](function (err) {
                      reject(err);
                    });
                  };

                  dom.addEventListener('canplay', canplay);
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function play() {
        return _play.apply(this, arguments);
      }

      return play;
    }()
  }, {
    key: "handleEvents",
    value: function handleEvents() {
      var _this$element, _this$element2, _this$element3;

      (_this$element = this.element) === null || _this$element === void 0 ? void 0 : _this$element.addEventListener("playing", this.handleEleEventPlaying);
      (_this$element2 = this.element) === null || _this$element2 === void 0 ? void 0 : _this$element2.addEventListener("ended", this.handleEleEventEnded);
      (_this$element3 = this.element) === null || _this$element3 === void 0 ? void 0 : _this$element3.addEventListener("pause", this.handleEleEventPause);
      this.trackHandleEvents();
    }
  }, {
    key: "trackHandleEvents",
    value: function trackHandleEvents() {
      var _this$track, _this$track2, _this$track3;

      (_this$track = this.track) === null || _this$track === void 0 ? void 0 : _this$track.addEventListener("ended", this.handleTrackEventEnded);
      (_this$track2 = this.track) === null || _this$track2 === void 0 ? void 0 : _this$track2.addEventListener("mute", this.handleTrackEventMute);
      (_this$track3 = this.track) === null || _this$track3 === void 0 ? void 0 : _this$track3.addEventListener("unmute", this.handleTrackEventUnmute);
    }
  }, {
    key: "trackRemoveEvents",
    value: function trackRemoveEvents() {
      var _this$track4, _this$track5, _this$track6;

      (_this$track4 = this.track) === null || _this$track4 === void 0 ? void 0 : _this$track4.removeEventListener("ended", this.handleTrackEventEnded);
      (_this$track5 = this.track) === null || _this$track5 === void 0 ? void 0 : _this$track5.removeEventListener("mute", this.handleTrackEventMute);
      (_this$track6 = this.track) === null || _this$track6 === void 0 ? void 0 : _this$track6.removeEventListener("unmute", this.handleTrackEventUnmute);
    }
  }, {
    key: "removeEvents",
    value: function removeEvents() {
      var _this$element4, _this$element5, _this$element6;

      (_this$element4 = this.element) === null || _this$element4 === void 0 ? void 0 : _this$element4.removeEventListener("playing", this.handleEleEventPlaying);
      (_this$element5 = this.element) === null || _this$element5 === void 0 ? void 0 : _this$element5.removeEventListener("ended", this.handleEleEventEnded);
      (_this$element6 = this.element) === null || _this$element6 === void 0 ? void 0 : _this$element6.removeEventListener("pause", this.handleEleEventPause);
      this.trackRemoveEvents();
    }
  }, {
    key: "stop",
    value: function stop() {
      this.removeEvents();
      this.div.removeChild(this.element);
      this.element.srcObject = null;
    }
  }, {
    key: "resume",
    value: function resume() {
      var _this$element7;

      return (_this$element7 = this.element) === null || _this$element7 === void 0 ? void 0 : _this$element7.play();
    }
    /**
     * 获取视频当前帧
     * @returns
     */

  }, {
    key: "getVideoFrame",
    value: function getVideoFrame() {
      var _this$element8, _this$element9;

      var canvas = document.createElement("canvas");
      canvas.width = (_this$element8 = this.element) === null || _this$element8 === void 0 ? void 0 : _this$element8.videoWidth;
      canvas.height = (_this$element9 = this.element) === null || _this$element9 === void 0 ? void 0 : _this$element9.videoHeight;
      canvas.getContext("2d").drawImage(this.element, 0, 0);
      return canvas.toDataURL("image/png");
    }
  }, {
    key: "getVideoElement",
    value: function getVideoElement() {
      return this.element;
    }
    /**
     * 设置video的track并播放
     * @param 
     */

  }, {
    key: "setVideoTrack",
    value: function setVideoTrack(t) {
      this.trackRemoveEvents();
      var track = new MediaStream();
      track.addTrack(t);
      this.track = t;
      this.trackHandleEvents();
      this.log.info('setVideoTrack', t);

      if (this.element) {
        this.element.srcObject = track;
        this.element.play();
      }
    } // 监听video playing 事件

  }, {
    key: "eleEventPlaying",
    value: function eleEventPlaying() {
      this.log.info("stream ".concat(this.userId, " - video player is starting playing"));
      this.state = "PLAYING";

      this._emitter.emit(PLAYER_STATE_CHANGED, {
        state: this.state,
        reason: "playing"
      });
    } // 监听video ended 事件

  }, {
    key: "eleEventEnded",
    value: function eleEventEnded() {
      this.log.info("stream ".concat(this.userId, " - video player is ended"));
      "STOPPED" !== this.state && (this.state = "STOPPED", this._emitter.emit(PLAYER_STATE_CHANGED, {
        state: this.state,
        reason: "ended"
      }));
    } // 监听video ended 事件

  }, {
    key: "eleEventPause",
    value: function eleEventPause() {
      this.log.info("stream ".concat(this.userId, " - video player is paused"));
      this.state = "PAUSED";

      this._emitter.emit(PLAYER_STATE_CHANGED, {
        state: this.state,
        reason: "pause"
      });
    } // 监听track ended 事件

  }, {
    key: "trackEventEnded",
    value: function trackEventEnded() {
      this.log.info("stream ".concat(this.userId, " - video player track is ended"));
      "STOPPED" !== this.state && (this.state = "STOPPED", this._emitter.emit(PLAYER_STATE_CHANGED, {
        state: this.state,
        reason: "ended"
      }));
    } // 监听track mute 事件

  }, {
    key: "trackEventMute",
    value: function trackEventMute() {
      this.log.info("stream ".concat(this.userId, " - video track is muted"));
      "PAUSED" !== this.state && (this.state = "PAUSED", this._emitter.emit(PLAYER_STATE_CHANGED, {
        state: this.state,
        reason: "mute"
      }));
    } // 监听track unmute 事件

  }, {
    key: "trackEventUnmute",
    value: function trackEventUnmute() {
      this.log.info("stream ".concat(this.userId, " - video track is unmuted"));
      "PAUSED" === this.state && (this.state = "PLAYING", this._emitter.emit(PLAYER_STATE_CHANGED, {
        state: this.state,
        reason: "unmute"
      }));
    }
  }]);

  return VideoPlayer;
}();

/**
 * 获取用户网络状态
 * @return networkType
 * networkType string 如 WIFI 4G
 * userAgent和connection的兼容性其实都不好，特别是pc，所以很多情况还是返回unkown
 */
function getNetworkType() {
  var e = navigator.userAgent,
      t = navigator.connection,
      n = e.match(/NetType\/\w+/) ? e.match(/NetType\/\w+/)[0] : "";
  "3gnet" === (n = n.toLowerCase().replace("nettype/", "")) && (n = "3g");
  var r = t && t.type && t.type.toLowerCase(),
      i = t && t.effectiveType && t.effectiveType.toLowerCase();
  "slow-2" === i && (i = "2g");
  var a = n || "unknown";
  if (r) switch (r) {
    case "cellular":
    case "wimax":
      a = i || "unknown";
      break;

    case "wifi":
      a = "wifi";
      break;

    case "ethernet":
      a = "wired";
      break;

    case "none":
    case "other":
    case "unknown":
      a = "unknown";
  }
  return a;
}
var isMobile = {
  Android: function Android() {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function BlackBerry() {
    return navigator.userAgent.match(/BlackBerry|BB10/i);
  },
  iOS: function iOS() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function Opera() {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function Windows() {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function any() {
    return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
  },
  getOsName: function getOsName() {
    var osName = "Unknown OS";

    if (isMobile.Android()) {
      osName = "Android";
    }

    if (isMobile.BlackBerry()) {
      osName = "BlackBerry";
    }

    if (isMobile.iOS()) {
      osName = "iOS";
    }

    if (isMobile.Opera()) {
      osName = "Opera Mini";
    }

    if (isMobile.Windows()) {
      osName = "Windows";
    }

    return {
      osName: osName,
      type: "mobile"
    };
  }
};

function detectDesktopOS() {
  var unknown = "-";
  var nVer = navigator.appVersion;
  var nAgt = navigator.userAgent;
  var os = unknown;
  var clientStrings = [{
    s: "Chrome OS",
    r: /CrOS/
  }, {
    s: "Windows 10",
    r: /(Windows 10.0|Windows NT 10.0)/
  }, {
    s: "Windows 8.1",
    r: /(Windows 8.1|Windows NT 6.3)/
  }, {
    s: "Windows 8",
    r: /(Windows 8|Windows NT 6.2)/
  }, {
    s: "Windows 7",
    r: /(Windows 7|Windows NT 6.1)/
  }, {
    s: "Windows Vista",
    r: /Windows NT 6.0/
  }, {
    s: "Windows Server 2003",
    r: /Windows NT 5.2/
  }, {
    s: "Windows XP",
    r: /(Windows NT 5.1|Windows XP)/
  }, {
    s: "Windows 2000",
    r: /(Windows NT 5.0|Windows 2000)/
  }, {
    s: "Windows ME",
    r: /(Win 9x 4.90|Windows ME)/
  }, {
    s: "Windows 98",
    r: /(Windows 98|Win98)/
  }, {
    s: "Windows 95",
    r: /(Windows 95|Win95|Windows_95)/
  }, {
    s: "Windows NT 4.0",
    r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/
  }, {
    s: "Windows CE",
    r: /Windows CE/
  }, {
    s: "Windows 3.11",
    r: /Win16/
  }, {
    s: "Android",
    r: /Android/
  }, {
    s: "Open BSD",
    r: /OpenBSD/
  }, {
    s: "Sun OS",
    r: /SunOS/
  }, {
    s: "Linux",
    r: /(Linux|X11)/
  }, {
    s: "iOS",
    r: /(iPhone|iPad|iPod)/
  }, {
    s: "Mac OS X",
    r: /Mac OS X/
  }, {
    s: "Mac OS",
    r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/
  }, {
    s: "QNX",
    r: /QNX/
  }, {
    s: "UNIX",
    r: /UNIX/
  }, {
    s: "BeOS",
    r: /BeOS/
  }, {
    s: "OS/2",
    r: /OS\/2/
  }, {
    s: "Search Bot",
    r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
  }];

  for (var i = 0, cs; cs = clientStrings[i]; i++) {
    if (cs.r.test(nAgt)) {
      os = cs.s;
      break;
    }
  }

  var osVersion = unknown;

  if (/Windows/.test(os)) {
    if (/Windows (.*)/.test(os)) {
      osVersion = /Windows (.*)/.exec(os)[1];
    }

    os = "Windows";
  }

  switch (os) {
    case "Mac OS X":
      if (/Mac OS X (10[/._\d]+)/.test(nAgt)) {
        // eslint-disable-next-line no-useless-escape
        osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
      }

      break;

    case "Android":
      // eslint-disable-next-line no-useless-escape
      if (/Android ([\.\_\d]+)/.test(nAgt)) {
        // eslint-disable-next-line no-useless-escape
        osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
      }

      break;

    case "iOS":
      if (/OS (\d+)_(\d+)_?(\d+)?/.test(nAgt)) {
        osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
        osVersion = osVersion[1] + "." + osVersion[2] + "." + (osVersion[3] | 0);
      }

      break;
  }

  return {
    osName: os + osVersion,
    type: "desktop"
  };
}
/**
 * 获取系统版本
 * @returns osName: 系统版本名称 type：mobile|desktop
 */


function getOS() {
  if (isMobile.any()) {
    return isMobile.getOsName();
  } else {
    return detectDesktopOS();
  }
}
/**
 * 获取当前的浏览器和版本号
 * @return result
 * result.browser String 浏览器（例如：'Chrome' 或者 'Firefox'）
 * result.version Number 版本（例如：72）
 */

function getBrowserAndVersion$1() {
  var ua = navigator.userAgent.toLocaleLowerCase();
  var browser, version; //获取浏览器的名称

  if (ua.indexOf("firefox") != -1) {
    browser = "Firefox";
  } else if (ua.indexOf("trident") != -1) {
    browser = "IE";

    if (ua.indexOf("ie") == -1) {
      version = 11;
    }
  } else if (ua.indexOf("opr") != -1) {
    browser = "OPR";
  } else if (ua.indexOf("edge") != -1) {
    browser = "Edge";
  } else if (ua.indexOf("chrome") != -1) {
    browser = "Chrome";
  } else if (ua.indexOf("safari") != -1) {
    browser = "Safari";
    var v = ua.match(/(version).*?([\d.]+)/);
    version = v ? v[2] : "";
  } else {
    browser = "未知浏览器";
  }

  if (version === undefined) {
    var re = /(firefox|trident|opr|chrome|safari).*?([\d.]+)/;
    var m = ua.match(re);
    version = m ? m[2] : "";
  }

  return {
    browser: browser,
    version: version
  };
}

/*
 * commonDefinitions
 *
 *  Created on: Jun 17, 2021
 *      Author: sxtang
 */

/**
 * userAgent
 */
var _getBrowserAndVersion = getBrowserAndVersion$1(),
    browser = _getBrowserAndVersion.browser,
    version$1 = _getBrowserAndVersion.version;

var userAgent = {
  sdk: {
    type: "WebRTC",
    version: "3.2.2"
  },
  device: {
    osName: getOS().osName,
    osVersion: "".concat(browser, "/").concat(version$1),
    netType: getNetworkType()
  },
  capabilities: {
    isp: "unknown",
    //因特网服务提供商
    location: "hefei",
    //地理位置		可以合并到会管系统，实现就近接入
    trikleIce: false,
    secure: true //媒体传输是否加密,暂不支持，默认加密(SRTP)

  }
};
var ResultCode;

(function (ResultCode) {
  ResultCode[ResultCode["Failed"] = 0] = "Failed";
  ResultCode[ResultCode["Success"] = 1] = "Success";
  ResultCode[ResultCode["Timeout"] = 2] = "Timeout";
})(ResultCode || (ResultCode = {}));

var ExitRoomReason;

(function (ExitRoomReason) {
  ExitRoomReason[ExitRoomReason["Unknown"] = 0] = "Unknown";
  ExitRoomReason[ExitRoomReason["ActivelyLeave"] = 1] = "ActivelyLeave";
  ExitRoomReason[ExitRoomReason["RoomDissolved"] = 2] = "RoomDissolved";
  ExitRoomReason[ExitRoomReason["RepeatLogin"] = 3] = "RepeatLogin";
})(ExitRoomReason || (ExitRoomReason = {}));
var PaticipantLeaveReason;

(function (PaticipantLeaveReason) {
  PaticipantLeaveReason[PaticipantLeaveReason["Normal"] = 0] = "Normal";
  PaticipantLeaveReason[PaticipantLeaveReason["Timeout"] = 1] = "Timeout";
  PaticipantLeaveReason[PaticipantLeaveReason["Kick"] = 2] = "Kick";
  PaticipantLeaveReason[PaticipantLeaveReason["RepeatLogin"] = 3] = "RepeatLogin";
  PaticipantLeaveReason[PaticipantLeaveReason["RoomDissolved"] = 4] = "RoomDissolved";
})(PaticipantLeaveReason || (PaticipantLeaveReason = {}));
var DropCause;

(function (DropCause) {
  DropCause[DropCause["Unknown"] = 0] = "Unknown";
  DropCause[DropCause["Kicked"] = 1] = "Kicked";
  DropCause[DropCause["RepeatLogin"] = 2] = "RepeatLogin";
  DropCause[DropCause["RoomDissolved"] = 3] = "RoomDissolved";
})(DropCause || (DropCause = {}));
function getDropCauseFromCauseStr(cause) {
  if (cause == "kicked") {
    return DropCause.Kicked;
  } else if (cause == "repeatlogin") {
    return DropCause.RepeatLogin;
  } else if (cause == "disbanded") {
    return DropCause.RoomDissolved;
  }

  return DropCause.Unknown;
}
var ConnectionStatus;

(function (ConnectionStatus) {
  ConnectionStatus[ConnectionStatus["New"] = 0] = "New";
  ConnectionStatus[ConnectionStatus["ConnectionConnected"] = 1] = "ConnectionConnected";
  ConnectionStatus[ConnectionStatus["ConnectionLost"] = 2] = "ConnectionLost";
  ConnectionStatus[ConnectionStatus["ConnectionRetring"] = 3] = "ConnectionRetring";
  ConnectionStatus[ConnectionStatus["ConnectionRecovery"] = 4] = "ConnectionRecovery";
})(ConnectionStatus || (ConnectionStatus = {}));
var NotificationType;

(function (NotificationType) {
  NotificationType[NotificationType["ParticipantJoin"] = 0] = "ParticipantJoin";
  NotificationType[NotificationType["ParticipantLeave"] = 1] = "ParticipantLeave";
  NotificationType[NotificationType["StreamAdd"] = 2] = "StreamAdd";
  NotificationType[NotificationType["StreamUpdate"] = 3] = "StreamUpdate";
  NotificationType[NotificationType["StreamRemove"] = 4] = "StreamRemove";
  NotificationType[NotificationType["Drop"] = 5] = "Drop";
  NotificationType[NotificationType["PermissionChange"] = 6] = "PermissionChange";
})(NotificationType || (NotificationType = {}));
var ICommand;

(function (ICommand) {
  ICommand[ICommand["AudioMute"] = 0] = "AudioMute";
  ICommand[ICommand["VideoMute"] = 1] = "VideoMute";
  ICommand[ICommand["AudioUnmute"] = 2] = "AudioUnmute";
  ICommand[ICommand["VideoUnmute"] = 3] = "VideoUnmute";
  ICommand[ICommand["Kick"] = 4] = "Kick";
})(ICommand || (ICommand = {}));
var StreamType;

(function (StreamType) {
  StreamType[StreamType["Invalid"] = 0] = "Invalid";
  StreamType[StreamType["ForwardStream"] = 1] = "ForwardStream";
  StreamType[StreamType["MixedStream"] = 2] = "MixedStream";
})(StreamType || (StreamType = {}));
function getStreamTypeStrFromStreamType(type) {
  switch (type) {
    case StreamType.ForwardStream:
      return "forward";

    case StreamType.MixedStream:
      return "mixed";
  }

  return "";
}
function getStreamTypeFromStreamTypeStr(type) {
  if (type == "forward") {
    return StreamType.ForwardStream;
  }

  if (type == "mixed") {
    return StreamType.MixedStream;
  }

  return StreamType.Invalid;
}
var StreamKind;

(function (StreamKind) {
  StreamKind[StreamKind["Invalid"] = 0] = "Invalid";
  StreamKind[StreamKind["AudioOnly"] = 1] = "AudioOnly";
  StreamKind[StreamKind["VideoOnly"] = 2] = "VideoOnly";
  StreamKind[StreamKind["AudioVideo"] = 3] = "AudioVideo";
})(StreamKind || (StreamKind = {}));
var UserType;

(function (UserType) {
  UserType[UserType["Normal"] = 0] = "Normal";
  UserType[UserType["Shadow"] = 1] = "Shadow";
})(UserType || (UserType = {}));
var AudioSourceType;

(function (AudioSourceType) {
  AudioSourceType[AudioSourceType["Unknown"] = 0] = "Unknown";
  AudioSourceType[AudioSourceType["Microphone"] = 1] = "Microphone";
  AudioSourceType[AudioSourceType["ScreenShare"] = 2] = "ScreenShare";
  AudioSourceType[AudioSourceType["File"] = 3] = "File";
})(AudioSourceType || (AudioSourceType = {}));
function getAudioSourceStrFromType(type) {
  switch (type) {
    case AudioSourceType.Microphone:
      return "mic";

    case AudioSourceType.ScreenShare:
      return "screen";

    case AudioSourceType.File:
      return "file";
  }

  return "";
}
function getAudioSourceTypeFromStr(type) {
  if (type == "mic") {
    return AudioSourceType.Microphone;
  }

  if (type == "screen") {
    return AudioSourceType.ScreenShare;
  }

  if (type == "file") {
    return AudioSourceType.File;
  }

  return AudioSourceType.Unknown;
}
var VideoSourceType;

(function (VideoSourceType) {
  VideoSourceType[VideoSourceType["Unknown"] = 0] = "Unknown";
  VideoSourceType[VideoSourceType["Camera"] = 1] = "Camera";
  VideoSourceType[VideoSourceType["ScreenShare"] = 2] = "ScreenShare";
  VideoSourceType[VideoSourceType["File"] = 3] = "File";
})(VideoSourceType || (VideoSourceType = {}));
function getVideoSourceStrFromType(type) {
  switch (type) {
    case VideoSourceType.Camera:
      return "camera";

    case VideoSourceType.ScreenShare:
      return "screen";

    case VideoSourceType.File:
      return "file";
  }

  return "";
}
function getVideoSourceTypeFromStr(type) {
  if (type == "camera") {
    return VideoSourceType.Camera;
  }

  if (type == "screen") {
    return VideoSourceType.ScreenShare;
  }

  if (type == "file") {
    return VideoSourceType.File;
  }

  return VideoSourceType.Unknown;
}
var SimulcastType;

(function (SimulcastType) {
  SimulcastType[SimulcastType["Invalid"] = 0] = "Invalid";
  SimulcastType[SimulcastType["BigStream"] = 1] = "BigStream";
  SimulcastType[SimulcastType["MiddleStream"] = 2] = "MiddleStream";
  SimulcastType[SimulcastType["SmallStream"] = 3] = "SmallStream";
})(SimulcastType || (SimulcastType = {}));
function getRidStrFromSimulcastType(type) {
  switch (type) {
    case SimulcastType.BigStream:
      return "h";

    case SimulcastType.MiddleStream:
      return "m";

    case SimulcastType.SmallStream:
      return "l";
  }

  return "";
}
function getSimulcastTypeFromRidStr(rid) {
  if (rid == "h") {
    return SimulcastType.BigStream;
  }

  if (rid == "m") {
    return SimulcastType.MiddleStream;
  }

  if (rid == "l") {
    return SimulcastType.SmallStream;
  }

  return SimulcastType.Invalid;
}

/**
 * 埋点日志操作码常量
 * @author yuhu
 */
var event = {
  /**
   *  设置日志输出等级
   */
  SET_LOG_LEVEL: 3001,

  /**
  *  打开日志上传
  */
  ENABLE_UPLOAD_LOG: 3002,

  /**
   *  关闭日志上传
   */
  DISABLE_UPLOAD_LOG: 3003,

  /**
  *  进入房间
  */
  JOIN: 3004,

  /**
   *  进入房间成功
   */
  JOIN_SUCCESS: 3005,

  /**
  *  进入房间失败
  */
  JOIN_FAILED: 3006,

  /**
  *  离开房间
  */
  LEAVE: 3007,

  /**
   *  退房成功
   */
  LEAVE_SUCCESS: 3008,

  /**
   *  退房失败
   */
  LEAVE_FAILED: 3009,

  /**
  *  切换为主播
  */
  SWITCH_ROLE_ANCHOR: 3010,

  /**
   *  切换为观众
   */
  SWITCH_ROLE_AUDIENCE: 3011,

  /**
   *  切换为主播成功
   */
  SWITCH_ROLE_ANCHOR_SUCCESS: 3012,

  /**
   *  切换为主播失败
   */
  SWITCH_ROLE_ANCHOR_FAILED: 3013,

  /**
   *  切换为观众成功
   */
  SWITCH_ROLE_AUDIENCE_SUCCESS: 3014,

  /**
   *  切换为观众失败
   */
  SWITCH_ROLE_AUDIENCE_FAILED: 3015,

  /**
  *  发布本地音视频流 
  */
  PUBLISH_STREAM: 3016,

  /**
   *  发布屏幕分享流
   */
  PUBLISH_STREAM_SCREEN: 3017,

  /**
   *  发布本地音视频流成功
   */
  PUBLISH_STREAM_SUCCESS: 3018,

  /**
   *  发布本地音视频流失败
   */
  PUBLISH_STREAM_FAILED: 3019,

  /**
   *  发布屏幕分享流成功
   */
  PUBLISH_STREAM_SCREEN_SUCCESS: 3020,

  /**
   *  发布屏幕分享流失败
   */
  PUBLISH_STREAM_SCREEN_FAILED: 3021,

  /**
  *  取消发布本地音视频流
  */
  UNPUBLISH_STREAM: 3022,

  /**
   *  取消发布屏幕分享流
   */
  UNPUBLISH_STREAM_SCREEN: 3023,

  /**
   *  取消发布本地音视频流成功
   */
  UNPUBLISH_STREAM_SUCCESS: 3024,

  /**
   *  取消发布本地音视频流失败
   */
  UNPUBLISH_STREAM_FAILED: 3025,

  /**
   *  取消发布屏幕分享流成功
   */
  UNPUBLISH_STREAM_SCREEN_SUCCESS: 3026,

  /**
   *  取消发布屏幕分享流失败
   */
  UNPUBLISH_STREAM_SCREEN_FAILED: 3027,

  /**
  * 订阅远端音视频流
  */
  SUBSCRIBE_STREAM: 3028,

  /**
   * 订阅远端屏幕分享流
   */
  SUBSCRIBE_STREAM_SCREEN: 3029,

  /**
   * 订阅远端音视频流成功
   */
  SUBSCRIBE_STREAM_SUCCESS: 3030,

  /**
   * 订阅远端音视频流失败
   */
  SUBSCRIBE_STREAM_FAILED: 3031,

  /**
   * 订阅远端屏幕分享流成功
   */
  SUBSCRIBE_STREAM_SCREEN_SUCCESS: 3032,

  /**
   * 订阅远端屏幕分享流失败
   */
  SUBSCRIBE_STREAM_SCREEN_FAILED: 3033,

  /**
  * 取消订阅远端音视频流
  */
  UNSUBSCRIBE_STREAM: 3034,

  /**
   * 取消订阅远端屏幕分享流
   */
  UNSUBSCRIBE_STREAM_SCREEN: 3035,

  /**
   * 取消订阅远端音视频流成功
   */
  UNSUBSCRIBE_STREAM_SUCCESS: 3036,

  /**
   * 取消订阅远端音视频流失败
   */
  UNSUBSCRIBE_STREAM_FAILED: 3037,

  /**
   * 取消订阅远端屏幕分享流成功
   */
  UNSUBSCRIBE_STREAM_SCREEN_SUCCESS: 3038,

  /**
   * 取消订阅远端屏幕分享流失败
   */
  UNSUBSCRIBE_STREAM_SCREEN_FAILED: 3039,

  /**
   * 获取是否存在已发布流
   */
  HAS_PUBLISHED_STREAM: 3040,

  /**
   * 获取Client 状态
   */
  GET_CLIENT_STATE: 3041,

  /**
   * 获取当前房间内远端用户音视频 mute 状态列表
   */
  GET_REMOTE_MUTED_STATE: 3042,

  /**
   * 开启或关闭音量大小回调
   */
  ENABLE_AUDIO_VOLUME_EVALUATION: 3043,

  /**
  * 推流端开启大小流模式
  */
  ENABLE_SMALL_STREAM: 3044,

  /**
  * 推流端关闭大小流模式
  */
  DISABLE_SMALL_STREAM: 3045,

  /**
  *设置小流的参数
  */
  SET_SMALL_STREAM_PROFILE: 3046,

  /**
  *切换成小流
  */
  SET_REMOTE_VIDEO_STREAM_TYPE_SAMLL: 3047,

  /**
  *切换成大流
  */
  SET_REMOTE_VIDEO_STREAM_TYPE_BIG: 3048,

  /**
  *切换成小流成功
  */
  SET_REMOTE_VIDEO_STREAM_TYPE_SAMLL_SUCCESS: 3049,

  /**
  *切换成小流失败
  */
  SET_REMOTE_VIDEO_STREAM_TYPE_SAMLL_FAILED: 3050,

  /**
  *切换成大流成功
  */
  SET_REMOTE_VIDEO_STREAM_TYPE_BIG_SUCCESSE: 3051,

  /**
  *切换成大流失败
  */
  SET_REMOTE_VIDEO_STREAM_TYPE_BIG_FAILED: 3052,

  /**
  *更新推流端音视频大小流
  */
  UPDATE_SIMULCAST: 3053,

  /**
  *更新推流端音视频大小流c成功
  */
  UPDATE_SIMULCAST_SUCCESSE: 3054,

  /**
  *更新推流端音视频大小流失败
  */
  UPDATE_SIMULCAST_FAILED: 3055,

  /**
  *播放本地视频
  */
  PLAY_LOCAL_VIDEO: 3056,

  /**
  *播放本地音频
  */
  PLAY_LOCAL_AUDIO: 3057,

  /**
  *播放本地屏幕分享视频
  */
  PLAY_LOCAL_VIDEO_SCREEN: 3058,

  /**
  *播放本地屏幕分享音频
  */
  PLAY_LOCAL_AUDIO_SCREEN: 3059,

  /**
  *播放远端视频
  */
  PLAY_REMOTE_VIDEO: 3060,

  /**
  *播放远端音频
  */
  PLAY_REMOTE_AUDIO: 3061,

  /**
  *播放远端屏幕分享视频
  */
  PLAY_REMOTE_VIDEO_SCREEN: 3062,

  /**
  *播放远端屏幕分享音频
  */
  PLAY_REMOTE_AUDIO_SCREEN: 3063,

  /**
  *停止本地视频
  */
  STOP_LOCAL_VIDEO: 3064,

  /**
  *停止播放本地音频
  */
  STOP_LOCAL_AUDIO: 3065,

  /**
  *停止本地屏幕分享视频
  */
  STOP_LOCAL_VIDEO_SCREEN: 3066,

  /**
  *停止播放本地屏幕分享音频
  */
  STOP_LOCAL_AUDIO_SCREEN: 3067,

  /**
  *停止播放远端视频
  */
  STOP_REMOTE_VIDEO: 3068,

  /**
  *停止播放远端音频
  */
  STOP_REMOTE_AUDIO: 3069,

  /**
  *停止播放远端屏幕分享视频
  */
  STOP_REMOTE_VIDEO_SCREEN: 3070,

  /**
  *停止播放远端屏幕分享音频
  */
  STOP_REMOTE_AUDIO_SCREEN: 3071,

  /**
  *恢复播放本地视频
  */
  RESUME_LOCAL_VIDEO: 3072,

  /**
  *恢复播放本地音频
  */
  RESUME_LOCAL_AUDIO: 3073,

  /**
  *恢复播放本屏幕分享地视频
  */
  RESUME_LOCAL_VIDEO_SCREEN: 3074,

  /**
  *恢复播放本地屏幕分享音频
  */
  RESUME_LOCAL_AUDIO_SCREEN: 3075,

  /**
  *恢复播放远端视频
  */
  RESUME_REMOTE_VIDEO: 3076,

  /**
  *恢复播放远端音频
  */
  RESUME_REMOTE_AUDIO: 3077,

  /**
  *恢复播放远端屏幕分享视频
  */
  RESUME_REMOTE_VIDEO_SCREEN: 3078,

  /**
  *恢复播放远端屏幕分享音频
  */
  RESUME_REMOTE_AUDIO_SCREEN: 3079,

  /**
  *关闭播放本地视频
  */
  CLOSE_LOCAL_VIDEO: 3080,

  /**
  *关闭播放本地音频
  */
  CLOSE_LOCAL_AUDIO: 3081,

  /**
  *关闭播放本地屏幕分享视频
  */
  CLOSE_LOCAL_VIDEO_SCREEN: 3082,

  /**
  *关闭播放本地屏幕分享音频
  */
  CLOSE_LOCAL_AUDIO_SCREEN: 3083,

  /**
  *关闭播放远端视频
  */
  CLOSE_REMOTE_VIDEO: 3084,

  /**
  *关闭播放远端音频
  */
  CLOSE_REMOTE_AUDIO: 3085,

  /**
  *关闭播放远端屏幕分享视频
  */
  CLOSE_REMOTE_VIDEO_SCREEN: 3086,

  /**
  *关闭播放远端屏幕分享音频
  */
  CLOSE_REMOTE_AUDIO_SCREEN: 3087,

  /**
  *禁用本地音频轨道
  */
  MUTE_LOCAL_AUDIO: 3088,

  /**
  *禁用本地屏幕分享音频轨道
  */
  MUTE_LOCAL_AUDIO_SCREEN: 3089,

  /**
  *禁用远端音频轨道
  */
  MUTE_REMOTE_AUDIO: 3090,

  /**
  *禁用远端屏幕分享音频轨道
  */
  MUTE_REMOTE_AUDIO_SCREEN: 3091,

  /**
  *禁用本地视频轨道
  */
  MUTE_LOCAL_VIDEO: 3092,

  /**
  *禁用本地屏幕分享视频轨道
  */
  MUTE_LOCAL_VIDEO_SCREEN: 3093,

  /**
  *禁用远端视频轨道
  */
  MUTE_REMOTE_VIDEO: 3094,

  /**
  *禁用远端屏幕分享视频轨道
  */
  MUTE_REMOTE_VIDEO_SCREEN: 3095,

  /**
  *启用本地音频轨道
  */
  UNMUTE_LOCAL_AUDIO: 3096,

  /**
  *启用本地屏幕分享音频轨道
  */
  UNMUTE_LOCAL_AUDIO_SCREEN: 3097,

  /**
  *启用远端音频轨道
  */
  UNMUTE_REMOTE_AUDIO: 3098,

  /**
  *启用远端屏幕分享音频轨道
  */
  UNMUTE_REMOTE_AUDIO_SCREEN: 3099,

  /**
  *启用本地视频轨道
  */
  UNMUTE_LOCAL_VIDEO: 3100,

  /**
  *启用本地屏幕分享视频轨道
  */
  UNMUTE_LOCAL_VIDEO_SCREEN: 3101,

  /**
  *启用远端视频轨道
  */
  UNMUTE_REMOTE_VIDEO: 3102,

  /**
  *启用远端屏幕分享视频轨道
  */
  UNMUTE_REMOTE_VIDEO_SCREEN: 3103,

  /**
  *获取本地流唯一标识ID
  */
  GET_LOCAL_ID: 3104,

  /**
  *获取远端流唯一标识ID
  */
  GET_REMOTE_ID: 3105,

  /**
  *获取本地流所属的用户ID
  */
  GET_LOCAL_USER_ID: 3106,

  /**
  *获取远端流所属的用户ID
  */
  GET_REMOTE_USER_ID: 3107,

  /**
  *设置声音输出设备
  */
  SET_AUDIO_OUTPUT: 3108,

  /**
  *设置本地流播放音量大小
  */
  SET_LOCAL_AUDIO_VOLUME: 3109,

  /**
  *设置本地屏幕分享流播放音量大小
  */
  SET_LOCAL_AUDIO_VOLUME_SCREEN: 3110,

  /**
  *设置远端流播放音量大小
  */
  SET_REMOTE_AUDIO_VOLUME: 3111,

  /**
  *设置远端屏幕分享流播放音量大小
  */
  SET_REMOTE_AUDIO_VOLUME_SCREEN: 3112,

  /**
  *获取本地流当前音量大小
  */
  GET_LOCAL_AUDIO_LEVEL: 3113,

  /**
  *获取本地屏幕分享流当前音量大小
  */
  GET_LOCAL_AUDIO_LEVEL_SCREEN: 3114,

  /**
  *获取远端流当前音量大小
  */
  GET_REMOTE_AUDIO_LEVEL: 3115,

  /**
  *获取远端流当前音量大小
  */
  GET_REMOTE_AUDIO_LEVEL_SCREEN: 3116,

  /**
  *本地流是否包含音频轨道
  */
  HAS_LOCAL_AUDIO: 3117,

  /**
  *本地屏幕分享流是否包含音频轨道
  */
  HAS_LOCAL_AUDIO_SCREEN: 3118,

  /**
  *远端流是否包含音频轨道
  */
  HAS_REMOTE_AUDIO: 3119,

  /**
  *远端屏幕分享流是否包含音频轨道
  */
  HAS_REMOTE_AUDIO_SCREEN: 3120,

  /**
  *本地流是否包含视频轨道
  */
  HAS_LOCAL_VIDEO: 3121,

  /**
  *本地屏幕分享流是否包含视频轨道
  */
  HAS_LOCAL_VIDEO_SCREEN: 3122,

  /**
  *远端流是否包含视频轨道
  */
  HAS_REMOTE_VIDEO: 3123,

  /**
  *远端流是否包含视频轨道
  */
  HAS_REMOTE_VIDEO_SCREEN: 3124,

  /**
  *获取本地流音频轨道
  */
  GET_LCOAL_AUDIO_TRACK: 3125,

  /**
  *获取本地屏幕分享流音频轨道
  */
  GET_LCOAL_AUDIO_TRACK_SCREEN: 3126,

  /**
  *获取远端流流音频轨道
  */
  GET_REMOTE_AUDIO_TRACK: 3127,

  /**
  *获取远端流流音频轨道
  */
  GET_REMOTE_AUDIO_TRACK_SCREEN: 3128,

  /**
  *获取本地流视频轨道
  */
  GET_LCOAL_VIDEO_TRACK: 3129,

  /**
  *获取本屏幕分享地流视频轨道
  */
  GET_LCOAL_VIDEO_TRACK_SCREEN: 3130,

  /**
  *获取远端流视频轨道
  */
  GET_REMOTE_VIDEO_TRACK: 3131,

  /**
  *获取远端屏幕分享流视频轨道
  */
  GET_REMOTE_VIDEO_TRACK_SCREEN: 3132,

  /**
  *获取本地流视频帧
  */
  GET_LCOAL_VIDEO_FRAME: 3133,

  /**
  *获取本地屏幕分享流视频帧
  */
  GET_LCOAL_VIDEO_FRAME_SCREEN: 3134,

  /**
  *获取远端流视频帧
  */
  GET_REMOTE_VIDEO_FRAME: 3135,

  /**
  *获取远端屏幕分享流视频帧
  */
  GET_REMOTE_VIDEO_FRAME_SCREEN: 3136,

  /**
  *获取本地流的类型
  */
  GET_LCOAL_TYPE: 3137,

  /**
  *获取远端流的类型
  */
  GET_REMOTE_TYPE: 3138,

  /**
  *获取播放本地流的音频元素 
  */
  GET_LOCAL_AUDIO_ELEMENT: 3139,

  /**
  *获取播放本地屏幕分享流的音频元素 
  */
  GET_LOCAL_AUDIO_ELEMENT_SCREEN: 3140,

  /**
  *获取播放远端流的音频元素 
  */
  GET_REMOTE_AUDIO_ELEMENT: 3141,

  /**
  *获取播放远端屏幕分享流的音频元素 
  */
  GET_REMOTE_AUDIO_ELEMENT_SCREEN: 3142,

  /**
  *获取播放本地流的视频元素 
  */
  GET_LOCAL_VIDEO_ELEMENT: 3143,

  /**
  *获取播放本地屏幕分享流的视频元素 
  */
  GET_LOCAL_VIDEO_ELEMENT_SCREEN: 3144,

  /**
  *获取播放远端流的视频元素 
  */
  GET_REMOTE_VIDEO_ELEMENT: 3145,

  /**
  *获取播放远端屏幕分享流的视频元素 
  */
  GET_REMOTE_VIDEO_ELEMENT_SCREEN: 3146,

  /**
  *设置音频 Profile
  */
  SET_AUDIO_PROFILE: 3147,

  /**
  *设置视频 Profile
  */
  SET_VIDEO_PROFILE: 3148,

  /**
  *设置屏幕分享视频 Profile
  */
  SET_SCREEN_PROFILE: 3149,

  /**
  *设置视频内容提示
  */
  SET_VIDEO_CONTENT_HINT: 3150,

  /**
  *切换麦克风
  */
  SWITCH_DEVICE_AUDIO: 3151,

  /**
  *切换摄像头
  */
  SWITCH_DEVICE_VIDEO: 3152,

  /**
  *添加音频轨道
  */
  ADD_AUDIO_TRACK: 3153,

  /**
  *添加屏幕分享音频轨道
  */
  ADD_AUDIO_TRACK_SCREEN: 3154,

  /**
  *添加视频轨道
  */
  ADD_VIDEO_TRACK: 3155,

  /**
  *添加屏幕分享视频轨道
  */
  ADD_VIDEO_TRACK_SCREEN: 3156,

  /**
  *移除视频轨道
  */
  REMOVE_TRACK: 3157,

  /**
  *移除屏幕分享视频轨道
  */
  REMOVE_TRACK_SCREEN: 3158,

  /**
  *更换音频轨道
  */
  REPLACE_AUDIO_TRACK: 3159,

  /**
  *更换屏幕分享音频轨道
  */
  REPLACE_AUDIO_TRACK_SCREEN: 3160,

  /**
  *更换视频轨道
  */
  REPLACE_VIDEO_TRACK: 3161,

  /**
  *更换屏幕分享视频轨道
  */
  REPLACE_VIDEO_TRACK_SCREEN: 3162,

  /**
  *获取正在使用的设备信息
  */
  GET_DEVICES_INFO_IN_USE: 3163,

  /**
  *远端品视频流添加通知
  */
  ON_STREAM_ADDED: 3164,

  /**
  *远端屏幕分享流添加通知
  */
  ON_STREAM_ADDED_SCREEN: 3165,

  /**
  *远端音视频流移除通知
  */
  ON_STREAM_REMOVED: 3166,

  /**
  *远端屏幕分享流移除通知
  */
  ON_STREAM_REMOVED_SCREEN: 3167,

  /**
  *远端音视频流更新通知
  */
  ON_STREAM_UPDATED: 3168,

  /**
  *远端屏幕分享流更新通知
  */
  ON_STREAM_UPDATED_SCREEN: 3169,

  /**
  *远端音视频流订阅成功通知
  */
  ON_STREAM_SUBSCRIBED: 3170,

  /**
  *远端屏幕分享流订阅成功通知
  */
  ON_STREAM_SUBSCRIBED_SCREEN: 3171,

  /**
  *远端用户进房通知
  */
  ON_PEER_JOIN: 3172,

  /**
  *远端用户退房通知
  */
  ON_PEER_LEVAE: 3173,

  /**
  *远端用户禁用音频通知
  */
  ON_MUTE_AUDIO: 3174,

  /**
  *远端用户禁用屏幕分享音频通知
  */
  ON_MUTE_AUDIO_SCREEN: 3175,

  /**
  *远端用户禁用视频通知
  */
  ON_MUTE_VIDEO: 3176,

  /**
  *远端用户禁用屏幕分享视频通知
  */
  ON_MUTE_VIDEO_SCREEN: 3177,

  /**
  *远端用户启用音频通知
  */
  ON_UNMUTE_AUDIO: 3178,

  /**
  *远端用户启用屏幕分享音频通知
  */
  ON_UNMUTE_AUDIO_SCREEN: 3179,

  /**
  *远端用户启用视频通知
  */
  ON_UNMUTE_VIDEO: 3180,

  /**
  *远端用户启用屏幕分享视频通知
  */
  ON_UNMUTE_VIDEO_SCREEN: 3181,

  /**
  *用户被踢出房间通知
  */
  ON_CLIENT_BANNED: 3182,

  /**
  *摄像头设备变化通知
  */
  ON_CAMERA_CHANGED: 3183,

  /**
  *麦克风设备变化通知
  */
  ON_RECORDING_DEVICE_CHANGED: 3184,

  /**
  *扬声器设备变化通知
  */
  ON_PLAYBACK_DEVICE_CHANGED: 3185,

  /**
  *错误事件通知
  */
  ON_ERROR: 3186,

  /**
  *停止监听远端流添加事件
  */
  OFF_STREAM_ADDED: 3187,

  /**
  *停止监听远端流移除事件
  */
  OFF_STREAM_REMOVED: 3188,

  /**
  *停止监听远端流更新事件
  */
  OFF_STREAM_UPDATED: 3189,

  /**
  *停止监听远端流订阅成功事件
  */
  OFF_STREAM_SUBSCRIBED: 3190,

  /**
  *停止监听WebSocket 信令通道连接状态变化事件
  */
  OFF_CONNECTION_STATE_CHANGED: 3191,

  /**
  *停止监听远端用户进房通知
  */
  OFF_PEER_JOIN: 3192,

  /**
  *停止监听远端用户退房通知
  */
  OFF_PEER_LEVAE: 3193,

  /**
  *停止监听远端用户禁用音频通知
  */
  OFF_MUTE_AUDIO: 3194,

  /**
  *停止监听远端用户禁用视频通知
  */
  OFF_MUTE_VIDEO: 3195,

  /**
  *停止监听远端用户启用视频通知
  */
  OFF_UNMUTE_VIDEO: 3196,

  /**
  *停止监听用户被踢出房间通知
  */
  OFF_CLIENT_BANNED: 3197,

  /**
  *停止监听摄像头设备变化通知
  */
  OFF_CAMERA_CHANGED: 3198,

  /**
  *停止监听麦克风设备变化通知
  */
  OFF_RECORDING_DEVICE_CHANGED: 3199,

  /**
  *停止监听扬声器设备变化通知
  */
  OFF_PLAYBACK_DEVICE_CHANGED: 3200,

  /**
  *停止监控网络质量通知
  */
  OFF_NETWORK_QUALITY: 3201,

  /**
  *停止监控音量变化通知
  */
  OFF_AUDIO_VOLUME: 3202,

  /**
  *停止监听监听错误事件
  */
  OFF_ERROR: 3203,

  /**
  *Audio/Video Player 状态变化通知
  */
  ON_PLAYER_STATE_CHANGED: 3204,

  /**
  *本地屏幕分享停止事件通知
  */
  ON_SCREEN_SHARING_STOPPED: 3205,

  /**
  *流的错误事件通知
  */
  ON_STREAM_ERROR: 3206,

  /**
  *SDK 与云端的连接已经断开
  */
  CONNECTIONLOST_CB: 3207,

  /**
  *SDK 正在尝试重新连接到云端
  */
  TRY_TO_RECONNECT_CB: 3208,

  /**
  *SDK 与云端的连接已经恢复
  */
  CONNECTION_RECOVERY_CB: 3209
};

/**
 * 指标常量名称
 * @author ythu
 */
var metrics = {
  /**
   *  视频上行码率
   */
  VUBIT: 2001,

  /**
   *  视频下行码率
   */
  VDBIT: 2002,

  /**
   *  音频上行码率
   */
  AUBIT: 2003,

  /**
   *  音频下行码率
   */
  ADBIT: 2004,

  /**
   *  视频上行丢包率
   */
  VULOSS: 2005,

  /**
   *  视频下行丢包率
   */
  VDLOSS: 2006,

  /**
   *  音频上行丢包率
   */
  AULOSS: 2007,

  /**
   *  音频下行丢包率
   */
  ADLOSS: 2008,

  /**
   *  视频上行RTT
   */
  VURTT: 2009,

  /**
   *  视频下行RTT
   */
  VDRTT: 2010,

  /**
   *  音频上行RTT
   */
  AURTT: 2011,

  /**
   *  音频下行RTT
   */
  ADRTT: 2012,

  /**
   *  视频上行帧率
   */
  VUFPS: 2013,

  /**
   *  视频下行帧率
   */
  VDFPS: 2014,

  /**
   *  音频上行帧率
   */
  AUFPS: 2015,

  /**
   *  音频下行帧率
   */
  ADFPS: 2016,

  /**
   *  视频上行卡顿率
   */
  VUBLOCK: 2017,

  /**
   *  视频下行卡顿率
   */
  VDBLOCK: 2018,

  /**
   *  音频上行卡顿率
   */
  AUBLOCK: 2019,

  /**
   *  音频上行卡顿率
   */
  ADBLOCK: 2020,

  /**
   *  视频上行发送分辨率
   */
  VUWIDTHHEIGHT: 2021,

  /**
   *  视频下行发送分辨率
   */
  VDWIDTHHEIGHT: 2022,

  /**
   *  基础指标APP的CPU占用率
   */
  APPCPU: 2023,

  /**
   *  系统的CPU占用率
   */
  SYSCPU: 2024
};

function ownKeys$7(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$7(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$7(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$7(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var LogType = {
  EVENT: 1,
  METRIC: 2
};
var LogCode = _objectSpread$7(_objectSpread$7({}, event), metrics);
var LogStreamType = {
  BigStream: 0,
  SmallStream: 1,
  AuxiliaryStream: 2
};

var Stream = /*#__PURE__*/function () {
  function Stream(streamConfig, logger, roomId, xsigoClient) {
    _classCallCheck(this, Stream);

    // super();
    this.logger = logger;
    this.streamConfig = streamConfig;
    this.streamId = streamConfig.streamId || null;
    this.mediaStream = streamConfig.mediaStream || null;
    this.type = streamConfig.type ? streamConfig.type : streamConfig.screen ? AUXILIARY : null;
    this.info = streamConfig.info || null;
    this.mixedInfo = streamConfig.mixedInfo || null;
    var audio = streamConfig.audio,
        video = streamConfig.video;
    this.constraints = {
      audio: audio,
      video: video
    };
    this.roomId = roomId || null;
    this.xsigoClient = xsigoClient || null;
    this.isPlaying = false;
    this.objectFit = "cover";
    this.muted = false;
    this.mirror = streamConfig.mirror || false;
    this.audioPlayer = null;
    this.videoPlayer = null;
    this.audioOutputDeviceId = 0;
    this.audioVolume = 1;
    this.isRemote = false;
    this._emitter = new EventEmitter();
    this.hasAudioTrack = false;
    this.hasVideoTrack = false;
    this.setUserId(streamConfig.userId);
    this.audioStreamId = '';
    this.videoStreamId = '';
    this.peerConnections = [];
    this.audioTrackEnabled = true;
    this.videoTrackEnabled = true;
    this.pcFailedCount = 0;
    this.audioMuted = true;
    this.videoMuted = true;
  }
  /**
   * 播放该音视频流
   * @param elementId 
   * @param options 
   */


  _createClass(Stream, [{
    key: "play",
    value: function () {
      var _play = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(elementId, options) {
        var dom, container, _container;

        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.isPlaying) {
                  _context.next = 3;
                  break;
                }

                this.logger.warn('duplicated play() call observed, please stop() firstly');
                return _context.abrupt("return");

              case 3:
                this.isPlaying = true;
                this.logger.info("stream start to play with options: ".concat(JSON.stringify(options)));

                if (typeof elementId === "string") {
                  container = document.getElementById(elementId);
                } else {
                  container = elementId;
                }

                if (!document.getElementById("player_".concat(this.userId))) {
                  dom = document.createElement("div");
                  dom.setAttribute("id", "player_".concat(this.userId));
                  dom.setAttribute("style", "width: 100%; height: 100%; position: relative; background-color: black; overflow: hidden;");
                  (_container = container) === null || _container === void 0 ? void 0 : _container.appendChild(dom);
                } else {
                  dom = document.getElementById("player_".concat(this.userId));
                }

                this.div = dom;
                this.isRemote || (this.muted = !0);
                options && void 0 !== options.muted && (this.muted = options.muted);

                if (this.isRemote && this.info.video && "screen" === this.info.video.source) {
                  this.objectFit = "contain";
                }

                if (options && void 0 !== options.objectFit) {
                  this.objectFit = options.objectFit;
                }

                if (!(this.hasVideo() && this.hasAudio())) {
                  _context.next = 16;
                  break;
                }

                this.logger.buriedLog({
                  t: LogType.EVENT,
                  c: this.isRemote ? this.type === AUXILIARY ? LogCode.PLAY_REMOTE_VIDEO_SCREEN : LogCode.PLAY_REMOTE_VIDEO : this.type === AUXILIARY ? LogCode.PLAY_LOCAL_VIDEO_SCREEN : LogCode.PLAY_LOCAL_VIDEO,
                  v: this.addUid()
                });
                this.logger.buriedLog({
                  t: LogType.EVENT,
                  c: this.isRemote ? this.type === AUXILIARY ? LogCode.PLAY_REMOTE_AUDIO_SCREEN : LogCode.PLAY_REMOTE_AUDIO : this.type === AUXILIARY ? LogCode.PLAY_LOCAL_AUDIO_SCREEN : LogCode.PLAY_LOCAL_AUDIO,
                  v: this.addUid()
                });
                return _context.abrupt("return", (this.playVideo(), this.playAudio()));

              case 16:
                if (!this.hasVideo()) {
                  _context.next = 19;
                  break;
                }

                this.logger.buriedLog({
                  t: LogType.EVENT,
                  c: this.isRemote ? this.type === AUXILIARY ? LogCode.PLAY_REMOTE_VIDEO_SCREEN : LogCode.PLAY_REMOTE_VIDEO : this.type === AUXILIARY ? LogCode.PLAY_LOCAL_VIDEO_SCREEN : LogCode.PLAY_LOCAL_VIDEO,
                  v: this.addUid()
                });
                return _context.abrupt("return", this.playVideo());

              case 19:
                if (!this.hasAudio()) {
                  _context.next = 22;
                  break;
                }

                this.logger.buriedLog({
                  t: LogType.EVENT,
                  c: this.isRemote ? this.type === AUXILIARY ? LogCode.PLAY_REMOTE_AUDIO_SCREEN : LogCode.PLAY_REMOTE_AUDIO : this.type === AUXILIARY ? LogCode.PLAY_LOCAL_AUDIO_SCREEN : LogCode.PLAY_LOCAL_AUDIO,
                  v: this.addUid()
                });
                return _context.abrupt("return", this.playAudio());

              case 22:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function play(_x, _x2) {
        return _play.apply(this, arguments);
      }

      return play;
    }()
    /**
     * 停止播放音视频流
     */

  }, {
    key: "stop",
    value: function stop() {
      this.logger.info('is playing:' + this.isPlaying);

      if (this.isPlaying) {
        this.logger.info('Stop playing audio and video');

        if (this.audioPlayer) {
          this.logger.buriedLog({
            t: LogType.EVENT,
            c: this.isRemote ? this.type === AUXILIARY ? LogCode.STOP_REMOTE_AUDIO_SCREEN : LogCode.STOP_REMOTE_AUDIO : this.type === AUXILIARY ? LogCode.STOP_LOCAL_AUDIO_SCREEN : LogCode.STOP_LOCAL_AUDIO,
            v: this.addUid()
          });
        }

        if (this.videoPlayer) {
          this.logger.buriedLog({
            t: LogType.EVENT,
            c: this.isRemote ? this.type === AUXILIARY ? LogCode.STOP_REMOTE_VIDEO_SCREEN : LogCode.STOP_REMOTE_VIDEO : this.type === AUXILIARY ? LogCode.STOP_LOCAL_VIDEO_SCREEN : LogCode.STOP_LOCAL_VIDEO,
            v: this.addUid()
          });
        }

        this.isPlaying = !1;
        this.stopAudio();
        this.stopVideo();

        if (this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
        }
      }
    }
    /**
     * 恢复播放音视频
     */

  }, {
    key: "resume",
    value: function () {
      var _resume = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.logger.info('is playing:' + this.isPlaying);

                if (this.isPlaying) {
                  this.logger.info("stream - resume");

                  if (this.audioPlayer) {
                    this.logger.buriedLog({
                      t: LogType.EVENT,
                      c: this.isRemote ? this.type === AUXILIARY ? LogCode.RESUME_REMOTE_AUDIO_SCREEN : LogCode.RESUME_REMOTE_AUDIO : this.type === AUXILIARY ? LogCode.RESUME_LOCAL_AUDIO_SCREEN : LogCode.RESUME_LOCAL_AUDIO,
                      v: this.addUid()
                    });
                    this.audioPlayer.resume();
                  }

                  if (this.videoPlayer) {
                    this.logger.buriedLog({
                      t: LogType.EVENT,
                      c: this.isRemote ? this.type === AUXILIARY ? LogCode.RESUME_REMOTE_VIDEO_SCREEN : LogCode.RESUME_REMOTE_VIDEO : this.type === AUXILIARY ? LogCode.RESUME_LOCAL_VIDEO_SCREEN : LogCode.RESUME_LOCAL_VIDEO,
                      v: this.addUid()
                    });
                    this.videoPlayer.resume();
                  }
                }

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function resume() {
        return _resume.apply(this, arguments);
      }

      return resume;
    }()
    /**
     * 关闭音视频流
     */

  }, {
    key: "close",
    value: function close() {
      this.logger.info('is playing:' + this.isPlaying);

      if (this.isPlaying) {
        this.stop();
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(function (e) {
          e.stop();
        });
        this.mediaStream = null;
      }
    }
    /**
     * 禁用音频轨道
     * @returns boolean
     */

  }, {
    key: "muteAudio",
    value: function muteAudio() {
      if (!this.mediaStream || !this.audioTrackEnabled) return !1;
      this.logger.info('mute audio');
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: this.isRemote ? this.type === AUXILIARY ? LogCode.MUTE_REMOTE_AUDIO_SCREEN : LogCode.MUTE_REMOTE_AUDIO : this.type === AUXILIARY ? LogCode.MUTE_LOCAL_AUDIO_SCREEN : LogCode.MUTE_LOCAL_AUDIO,
        v: this.addUid()
      });
      return this.addRemoteEvent(ICommand.AudioMute), this.doEnableTrack("audio", !1);
    }
    /**
     * 禁用视频轨道
     * @returns boolean
     */

  }, {
    key: "muteVideo",
    value: function muteVideo() {
      if (!this.mediaStream || !this.videoTrackEnabled) return !1;
      this.logger.info('mute video');
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: this.isRemote ? this.type === AUXILIARY ? LogCode.MUTE_REMOTE_VIDEO_SCREEN : LogCode.MUTE_REMOTE_VIDEO : this.type === AUXILIARY ? LogCode.MUTE_LOCAL_VIDEO_SCREEN : LogCode.MUTE_LOCAL_VIDEO,
        v: this.addUid()
      });
      return this.addRemoteEvent(ICommand.VideoMute), this.doEnableTrack("video", !1);
    }
    /**
     * 启用音频轨道
     * @returns boolean
     */

  }, {
    key: "unmuteAudio",
    value: function unmuteAudio() {
      if (!this.mediaStream || this.audioTrackEnabled) return !1;
      this.logger.info('unmute audio');
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: this.isRemote ? this.type === AUXILIARY ? LogCode.UNMUTE_REMOTE_AUDIO_SCREEN : LogCode.UNMUTE_REMOTE_AUDIO : this.type === AUXILIARY ? LogCode.UNMUTE_LOCAL_AUDIO_SCREEN : LogCode.UNMUTE_LOCAL_AUDIO,
        v: this.addUid()
      });
      return this.addRemoteEvent(ICommand.AudioUnmute), this.doEnableTrack("audio", !0);
    }
    /**
     * 启用视频轨道
     * @returns boolean
     */

  }, {
    key: "unmuteVideo",
    value: function unmuteVideo() {
      if (!this.mediaStream || this.videoTrackEnabled) return !1;
      this.logger.info('unmute video');
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: this.isRemote ? this.type === AUXILIARY ? LogCode.UNMUTE_REMOTE_VIDEO_SCREEN : LogCode.UNMUTE_REMOTE_VIDEO : this.type === AUXILIARY ? LogCode.UNMUTE_LOCAL_VIDEO_SCREEN : LogCode.UNMUTE_LOCAL_VIDEO,
        v: this.addUid()
      });
      return this.addRemoteEvent(ICommand.VideoUnmute), this.doEnableTrack("video", !0);
    }
    /**
     * 更新MediaStreamTrack
     * @param type 
     * @param track 
     */

  }, {
    key: "updateTrack",
    value: function updateTrack(type, track) {
      var oldTrack = null;

      if (type === 'audio') {
        oldTrack = this.getAudioTrack();
      } else {
        oldTrack = this.getVideoTrack();
      }

      if (oldTrack) {
        this.mediaStream.removeTrack(oldTrack);
      }

      this.mediaStream.addTrack(track);
    }
    /**
     * 是否静音
     * @param type
     * @param enabled
     */

  }, {
    key: "doEnableTrack",
    value: function doEnableTrack(type, enabled) {
      var s = !1;

      if (type === "audio") {
        this.mediaStream.getAudioTracks().forEach(function (track) {
          s = !0;
          track.enabled = enabled;
        });
      } else {
        this.mediaStream.getVideoTracks().forEach(function (track) {
          s = !0;
          track.enabled = enabled;
        });
      }

      this.setEnableTrackFlag(type, enabled);
      return s;
    }
    /**
     * 记录是否静音
     * @param type
     * @param enabled
     */

  }, {
    key: "setEnableTrackFlag",
    value: function setEnableTrackFlag(type, enabled) {
      if (type === "audio") {
        this.audioTrackEnabled = enabled;
      } else {
        this.videoTrackEnabled = enabled;
      }
    }
    /**
     * 本地流的音轨控制事件
     * @param command
     * @param type
     */

  }, {
    key: "addRemoteEvent",
    value: function addRemoteEvent(command, userData) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (!_this.isRemote) {
          var cb = function cb(code, message, data) {
            if (code === RESPONSE_CODE.SUCCESS) {
              resolve(true);
            }

            if (code === RESPONSE_CODE.ERROR) {
              reject(false);
            }
          };

          if (_this.xsigoClient) {
            switch (command) {
              case ICommand.AudioMute:
                _this.xsigoClient.muteAudio(_this.roomId, _this.audioStreamId, cb, userData);

                break;

              case ICommand.VideoMute:
                _this.xsigoClient.muteVideo(_this.roomId, _this.videoStreamId, cb, userData);

                break;

              case ICommand.AudioUnmute:
                _this.xsigoClient.unmuteAudio(_this.roomId, _this.audioStreamId, cb, userData);

                break;

              case ICommand.VideoUnmute:
                _this.xsigoClient.unmuteVideo(_this.roomId, _this.videoStreamId, cb, userData);

                break;
            }
          } else {
            _this.logger.info("not xsigoClient");
          }
        }
      });
    }
    /**
     * 获取 Stream 唯一标识ID
     * @returns string
     */

  }, {
    key: "getId",
    value: function getId() {
      return this.streamId || "";
    }
    /**
     * 获取该流所属的用户ID
     * @returns string
     */

  }, {
    key: "getUserId",
    value: function getUserId() {
      if (this.type === 'main') {
        return this.userId;
      }

      return this.userId.replace('share_', '');
    }
    /**
     * 设置用户Id
     */

  }, {
    key: "setUserId",
    value: function setUserId(userId) {
      if (this.streamConfig.screen) {
        return this.userId = "share_".concat(userId);
      }

      this.userId = userId;
    }
    /**
     * 设置声音输出设备
     * @param deviceId
     * @returns
     */

  }, {
    key: "setAudioOutput",
    value: function () {
      var _setAudioOutput = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3(deviceId) {
        return regenerator.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.audioOutputDeviceId = deviceId;
                this.logger.info('setAudioOutput deviceId', deviceId);
                this.logger.buriedLog({
                  t: LogType.EVENT,
                  c: LogCode.SET_AUDIO_OUTPUT,
                  v: "deviceId:".concat(deviceId)
                });
                this.audioPlayer && this.audioPlayer.setSinkId(deviceId);

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function setAudioOutput(_x3) {
        return _setAudioOutput.apply(this, arguments);
      }

      return setAudioOutput;
    }()
    /**
     * 设置播放音量大小
     * @param volume
     */

  }, {
    key: "setAudioVolume",
    value: function setAudioVolume(volume) {
      this.audioVolume = volume;
      this.logger.info("setAudioVolume to ".concat(volume.toString()));
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: this.isRemote ? this.type === AUXILIARY ? LogCode.SET_REMOTE_AUDIO_VOLUME_SCREEN : LogCode.SET_REMOTE_AUDIO_VOLUME : this.type === AUXILIARY ? LogCode.SET_LOCAL_AUDIO_VOLUME_SCREEN : LogCode.SET_LOCAL_AUDIO_VOLUME,
        v: "volume:".concat(volume)
      });
      this.audioPlayer && this.audioPlayer.setVolume(volume);
    }
    /**
     * 获取当前音量大小
     * @returns number
     */

  }, {
    key: "getAudioLevel",
    value: function getAudioLevel() {
      if (this.audioPlayer) {
        return this.audioPlayer.getAudioLevel();
      }

      return 0;
    }
    /**
     * ---------------------------------------------
     * 设置是否包含音频
     * @param hasAudio 
     */

  }, {
    key: "setHasAudio",
    value: function setHasAudio(hasAudio) {
      this.hasAudioTrack = hasAudio;
    }
    /**
    * 是否包含音频轨道
    * @returns
    */

  }, {
    key: "hasAudio",
    value: function hasAudio() {
      if (this.checkMediaStream()) {
        return this.hasAudioTrack;
      }

      return !1;
    }
    /**
     * 设置是否包含视频
     * @param hasVideo 
     */

  }, {
    key: "setHasVideo",
    value: function setHasVideo(hasVideo) {
      this.hasVideoTrack = hasVideo;
    }
    /**
     * 是否包含视频轨道
     * @returns boolean
     */

  }, {
    key: "hasVideo",
    value: function hasVideo() {
      if (this.checkMediaStream()) {
        return this.hasVideoTrack;
      }

      return !1;
    }
    /**
     * 获取音频轨道
     * @returns MediaStreamTrack
     */

  }, {
    key: "getAudioTrack",
    value: function getAudioTrack() {
      var track = null;

      if (this.checkMediaStream()) {
        var AT = this.mediaStream.getAudioTracks();
        AT.length > 0 && (track = AT[0]);
      }

      return track;
    }
    /**
     * 获取视频轨道
     * @returns
     */

  }, {
    key: "getVideoTrack",
    value: function getVideoTrack() {
      var track = null;

      if (this.checkMediaStream()) {
        var VT = this.mediaStream.getVideoTracks();
        VT.length > 0 && (track = VT[0]);
      }

      return track;
    }
    /**
     * 获取当前视频帧
     * @returns
     */

  }, {
    key: "getVideoFrame",
    value: function getVideoFrame() {
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: this.isRemote ? this.type === AUXILIARY ? LogCode.GET_REMOTE_VIDEO_FRAME_SCREEN : LogCode.GET_REMOTE_VIDEO_FRAME : this.type === AUXILIARY ? LogCode.GET_LCOAL_VIDEO_FRAME_SCREEN : LogCode.GET_LCOAL_VIDEO_FRAME
      });
      return this.videoPlayer ? this.videoPlayer.getVideoFrame() : null;
    }
    /**
     * 监听客户端对象事件
     * @param event 
     * @param callback 
     */

  }, {
    key: "on",
    value: function on(event, handler) {
      this._emitter.on(event, handler);
    }
    /**
     * 播放音频
     * @returns
     */

  }, {
    key: "playAudio",
    value: function () {
      var _playAudio = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4() {
        var _this2 = this;

        var track;
        return regenerator.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                track = this.getAudioTrack();

                if (!(this.audioPlayer || !track)) {
                  _context4.next = 3;
                  break;
                }

                return _context4.abrupt("return");

              case 3:
                this.logger.info("stream - create AudioPlayer and play");
                this.audioPlayer = new AudioPlayer({
                  stream: this,
                  track: track,
                  div: this.div,
                  muted: this.muted,
                  volume: this.audioVolume,
                  deviceId: this.audioOutputDeviceId
                });

                this.audioPlayer._emitter.on(PLAYER_STATE_CHANGED, function (e) {
                  _this2._emitter.emit(PLAYER_STATE_CHANGED, {
                    type: "audio",
                    state: e.state,
                    reason: e.reason
                  });
                });

                return _context4.abrupt("return", new Promise(function (resolve, reject) {
                  _this2.audioPlayer.play().then(function () {
                    resolve();
                  })["catch"](function (error) {
                    _this2.logger.error('audio play audio error', error.message);

                    var e = new ER({
                      code: ERCode.PLAY_NOT_ALLOWED,
                      message: error.message
                    });

                    _this2.logger.buriedLog({
                      t: LogType.EVENT,
                      c: LogCode.ON_STREAM_ERROR,
                      v: "code:".concat(ERCode.PLAY_NOT_ALLOWED)
                    });

                    _this2._emitter.emit(ERROR, e);

                    reject(e);
                  });
                }));

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function playAudio() {
        return _playAudio.apply(this, arguments);
      }

      return playAudio;
    }()
    /**
     * 视频播放
     * @returns
     */

  }, {
    key: "playVideo",
    value: function () {
      var _playVideo = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee5() {
        var _this3 = this;

        var track;
        return regenerator.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                track = this.getVideoTrack();

                if (!(this.videoPlayer || !track)) {
                  _context5.next = 3;
                  break;
                }

                return _context5.abrupt("return");

              case 3:
                this.logger.info("stream - create VideoPlayer and play");
                this.videoPlayer = new VideoPlayer({
                  stream: this,
                  track: track,
                  div: this.div,
                  muted: this.muted,
                  objectFit: this.objectFit,
                  mirror: this.mirror
                });

                this.videoPlayer._emitter.on(PLAYER_STATE_CHANGED, function (e) {
                  _this3._emitter.emit(PLAYER_STATE_CHANGED, {
                    type: "video",
                    state: e.state,
                    reason: e.reason
                  });
                });

                return _context5.abrupt("return", new Promise(function (resolve, reject) {
                  _this3.videoPlayer.play().then(function () {
                    resolve();
                  })["catch"](function (error) {
                    _this3.logger.error('video play video error', error.message);

                    var e = new ER({
                      code: ERCode.PLAY_NOT_ALLOWED,
                      message: error.message
                    });

                    _this3.logger.buriedLog({
                      t: LogType.EVENT,
                      c: LogCode.ON_STREAM_ERROR,
                      v: "code:".concat(ERCode.PLAY_NOT_ALLOWED)
                    });

                    _this3._emitter.emit(ERROR, e);

                    reject(e);
                  });
                }));

              case 7:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function playVideo() {
        return _playVideo.apply(this, arguments);
      }

      return playVideo;
    }()
    /**
     * 停止播放音频
     */

  }, {
    key: "stopAudio",
    value: function stopAudio() {
      if (this.audioPlayer) {
        this.logger.info("stream - stop AudioPlayer");
        this.audioPlayer.stop();
        this.audioPlayer = null;
      }
    }
    /**
     * 停止播放视频
     */

  }, {
    key: "stopVideo",
    value: function stopVideo() {
      if (this.videoPlayer) {
        this.logger.info("stream - stop VideoPlayer");
        this.videoPlayer.stop();
        this.videoPlayer = null;
      }
    }
    /**
     * 媒体流检测
     * @returns 
     */

  }, {
    key: "checkMediaStream",
    value: function checkMediaStream() {
      return !!this.mediaStream;
    }
    /**
     * 重新播放音频
     */

  }, {
    key: "restartAudio",
    value: function restartAudio() {
      if (this.isPlaying) {
        this.stopAudio();
        this.playAudio();
      }
    }
    /**
     * 重新播放视频
     */

  }, {
    key: "restartVideo",
    value: function restartVideo() {
      if (this.isPlaying) {
        this.stopVideo();
        this.playVideo();
      }
    }
    /**
     * 设置媒体流
     * @param mediaStream 
     */

  }, {
    key: "setMediaStream",
    value: function setMediaStream(mediaStream) {
      this.mediaStream = mediaStream;
    }
    /**
     * 设置大小流
     */

  }, {
    key: "setSimulcasts",
    value: function setSimulcasts(simulcast) {
      this.info.video.simulcast = simulcast;
    }
    /**
     * 获取大小流
     */

  }, {
    key: "getSimulcasts",
    value: function getSimulcasts() {
      try {
        return this.info.video.simulcast || [];
      } catch (err) {
        return [];
      }
    }
    /**
     * 设置 Info
     * @param info 
     */

  }, {
    key: "setInfo",
    value: function setInfo(info) {
      this.info = info;
    }
    /**
     * 获取流类型
     * 主要用于判断一个远端流是主音视频流还是辅路视频流，辅路视频流通常是一个屏幕分享流。
     * @returns string
     * 'main' 主音视频流
     * ‘auxiliary’ 辅助视频流，通常是一个屏幕分享流
     */

  }, {
    key: "getType",
    value: function getType() {
      return this.type || 'main';
    }
    /**
       * 获取audio元素
       * @returns 
       */

  }, {
    key: "getAudioElement",
    value: function getAudioElement() {
      return this.audioPlayer && this.audioPlayer.getAudioElement();
    }
    /**
     *  获取video元素 
     * @returns 
     */

  }, {
    key: "getVideoElement",
    value: function getVideoElement() {
      return this.videoPlayer && this.videoPlayer.getVideoElement();
    }
  }, {
    key: "setAudioTrack",
    value: function setAudioTrack(t) {
      t.enabled = this.audioTrackEnabled;

      if (this.audioPlayer) {
        this.audioPlayer.setAudioTrack(t);
      } else {
        this.playAudio();
      }
    }
  }, {
    key: "setVideoTrack",
    value: function setVideoTrack(t) {
      t.enabled = this.videoTrackEnabled;

      if (this.videoPlayer) {
        this.videoPlayer.setVideoTrack(t);
      } else {
        this.playVideo();
      }
    }
    /**
     * 设置 audio streamId
     * @param streamId 
     */

  }, {
    key: "setAudioStreamId",
    value: function setAudioStreamId(streamId) {
      this.audioStreamId = streamId;
    }
    /**
     * 设置 video streamId
     * @param streamId 
     */

  }, {
    key: "setVideoStreamId",
    value: function setVideoStreamId(streamId) {
      this.videoStreamId = streamId;
    }
    /**
     * 获取埋点日志参数
     */

  }, {
    key: "addUid",
    value: function addUid() {
      if (this.isRemote) {
        return "uid:".concat(this.getUserId());
      }
    }
    /**
    * 获取audio的muted状态
    */

  }, {
    key: "getAudioMuted",
    value: function getAudioMuted() {
      if (!this.getAudioTrack()) {
        return this.audioMuted;
      }

      return !this.audioTrackEnabled || this.audioMuted;
    }
    /**
    * 获取video的muted状态
    */

  }, {
    key: "getVideoMuted",
    value: function getVideoMuted() {
      if (!this.getVideoTrack()) {
        return this.videoMuted;
      }

      return !this.videoTrackEnabled || this.videoMuted;
    }
    /**
    * 更新peerConnection连接失败重连的次数
    */

  }, {
    key: "updatePeerConnectionFailed",
    value: function updatePeerConnectionFailed(state) {
      if (state === 'failed') {
        this.pcFailedCount++;
        var e = new ER({
          code: ERCode.RTCPEERCONNECTION_SATE_FAILED,
          message: "{count:".concat(this.pcFailedCount, "}")
        });

        this._emitter.emit(ERROR, e);

        this.logger.warn("updatePeerConnectionFailed,count:".concat(this.pcFailedCount));
      } else if (state === 'connected' && this.pcFailedCount !== 0) {
        this.pcFailedCount = 0;
        this.logger.warn("updatePeerConnectionFailed,count:".concat(this.pcFailedCount));
      }
    }
    /**
     * 根据信令更新stream的mute状态
     */

  }, {
    key: "setMutedState",
    value: function setMutedState(type, state) {
      if (type === 'audio') {
        this.audioMuted = state;
      } else if (type === 'video') {
        this.videoMuted = state;
      }
    }
  }]);

  return Stream;
}();

/**
 * Audio Profile
 */
var audioProfiles = new Map();
audioProfiles.set("standard", {
  sampleRate: 48e3,
  channelCount: 1,
  bitrate: 40
});
audioProfiles.set("high", {
  sampleRate: 48e3,
  channelCount: 1,
  bitrate: 128
});
/**
 * Video Profile
 */

var videoProfiles = new Map();
videoProfiles.set("120p", {
  width: 160,
  height: 120,
  frameRate: 15,
  bitrate: 200
}), videoProfiles.set("180p", {
  width: 320,
  height: 180,
  frameRate: 15,
  bitrate: 350
}), videoProfiles.set("240p", {
  width: 320,
  height: 240,
  frameRate: 15,
  bitrate: 400
}), videoProfiles.set("360p", {
  width: 640,
  height: 360,
  frameRate: 15,
  bitrate: 800
}), videoProfiles.set("480p", {
  width: 640,
  height: 480,
  frameRate: 15,
  bitrate: 900
}), videoProfiles.set("720p", {
  width: 1280,
  height: 720,
  frameRate: 15,
  bitrate: 1500
}), videoProfiles.set("1080p", {
  width: 1920,
  height: 1080,
  frameRate: 15,
  bitrate: 2e3
}), videoProfiles.set("1440p", {
  width: 2560,
  height: 1440,
  frameRate: 30,
  bitrate: 4860
}), videoProfiles.set("4K", {
  width: 3840,
  height: 2160,
  frameRate: 30,
  bitrate: 9e3
});
/**
 * Screen Profiles
 */

var screenProfiles = new Map();
screenProfiles.set("480p", {
  width: 640,
  height: 480,
  frameRate: 5,
  bitrate: 900
}), screenProfiles.set("480p_2", {
  width: 640,
  height: 480,
  frameRate: 30,
  bitrate: 1e3
}), screenProfiles.set("720p", {
  width: 1280,
  height: 720,
  frameRate: 5,
  bitrate: 1200
}), screenProfiles.set("720p_2", {
  width: 1280,
  height: 720,
  frameRate: 30,
  bitrate: 3e3
}), screenProfiles.set("1080p", {
  width: 1920,
  height: 1080,
  frameRate: 5,
  bitrate: 1600
}), screenProfiles.set("1080p_2", {
  width: 1920,
  height: 1080,
  frameRate: 30,
  bitrate: 4e3
});

/**
 * 获取当前的浏览器和版本号
 * @return result
 * result.browser String 浏览器（例如：'Chrome' 或者 'Firefox'）
 * result.version Number 版本（例如：72）
 */

function getBrowserAndVersion() {
  var ua = navigator.userAgent.toLocaleLowerCase();
  var browser, version; //获取浏览器的名称

  if (ua.indexOf("firefox") != -1) {
    browser = "Firefox";
  } else if (ua.indexOf("trident") != -1) {
    browser = "IE";

    if (ua.indexOf("ie") == -1) {
      version = 11;
    }
  } else if (ua.indexOf("opr") != -1) {
    browser = "OPR";
  } else if (ua.indexOf("edge") != -1) {
    browser = "Edge";
  } else if (ua.indexOf("chrome") != -1) {
    browser = "Chrome";
  } else if (ua.indexOf("safari") != -1) {
    browser = "Safari";
    var i = ua.indexOf('version');
    i = i + 'version'.length + 1;
    version = parseInt(ua.slice(i, i + 3));
  } else {
    browser = "未知浏览器";
  }

  if (version === undefined) {
    var i = ua.indexOf(browser.toLocaleLowerCase());
    i = i + browser.length + 1;
    version = parseInt(ua.slice(i, i + 3));
  }

  return {
    browser: browser,
    version: version
  };
}

function checkBrowserSupported() {
  var _getBrowserAndVersion = getBrowserAndVersion(),
      browser = _getBrowserAndVersion.browser,
      version = _getBrowserAndVersion.version;

  if (browser === "Chrome") {
    return version >= 74;
  } else if (browser === "Edge") {
    return version >= 80;
  }

  if (browser === "Firefox") {
    return version >= 66;
  } else if (browser === "OPR") {
    return version >= 60;
  } else ;

  return false;
}

function checkWebRTCSupported() {
  return ["RTCPeerConnection", "webkitRTCPeerConnection", "RTCIceGatherer"].filter(function (e) {
    return e in window;
  }).length > 0;
}

function checkMediaDevicesSupported() {
  if (!navigator.mediaDevices) return !1;
  var e = ["getUserMedia", "enumerateDevices"];
  return e.filter(function (e) {
    return e in navigator.mediaDevices;
  }).length === e.length;
}

function checkH264Supported() {
  var myPeerConnection = new RTCPeerConnection();
  var params = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
  };
  return new Promise(function (resolve, reject) {
    myPeerConnection.createOffer(params).then(function (offer) {
      var result = offer.sdp ? offer.sdp.toLowerCase().indexOf("h264") > -1 : false;
      myPeerConnection.close();
      myPeerConnection = null;
      resolve(result);
    }, function () {
      reject(new ER({
        code: ERCode.H264_NOT_SUPPORTED,
        message: 'h264 not supported'
      }));
    })["catch"](function (error) {
      var err = new ER({
        code: ERCode.H264_NOT_SUPPORTED,
        message: error.message
      });
      reject(err);
    });
  });
}
/**
 * 检测CoolVideo SDK 是否支持当前浏览器
 * @return Promise
 * checkResult.result	                        Boolean	检测结果
 * checkResult.detail.isBrowserSupported	      Boolean	当前浏览器是否是 SDK 支持的浏览器
 * checkResult.detail.isWebRTCSupported	      Boolean	当前浏览器是否支持 webRTC
 * checkResult.detail.isMediaDevicesSupported	Boolean	当前浏览器是否支持获取媒体设备及媒体流
 * checkResult.detail.isH264Supported	        Boolean	当前浏览器是否支持 H264 编码
 */


function checkSystemRequirements() {
  var isBrowserSupported = checkBrowserSupported();
  var isWebRTCSupported = checkWebRTCSupported();
  var isMediaDevicesSupported = checkMediaDevicesSupported();
  return new Promise(function (resolve, reject) {
    checkH264Supported().then(function (isH264Supported) {
      resolve({
        result: isBrowserSupported && isWebRTCSupported && isMediaDevicesSupported && isH264Supported,
        detail: {
          isBrowserSupported: isBrowserSupported,
          isWebRTCSupported: isWebRTCSupported,
          isMediaDevicesSupported: isMediaDevicesSupported,
          isH264Supported: isH264Supported
        }
      });
    }, function (error) {
      return reject(error);
    });
  });
}
/**
 * 检测浏览器是否支持屏幕分享
 * 在创建屏幕分享流之前请调用该方法检查当前浏览器是否支持屏幕分享。
 * @return Boolean
 */

var isScreenShareSupported = function isScreenShareSupported() {
  // @ts-ignore
  return !(!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia);
};
/**
 * 获取媒体输入输出设备列表
 * 出于安全的考虑，在用户未授权摄像头或麦克风访问权限前，label 及 deviceId 字段可能都是空的。
 * 因此建议在用户授权访问后 再调用该接口获取设备详情，比如在 initialize() 后再调用此接口获取设备详情
 * Chrome 使用 deviceId 为 default 或 communications (Windows 设备下会有该 deviceId) 时，若插入新的麦克风，再拔出，可能会导致麦克风采集中断。
 * 避免使用 deviceId 为 default 或 communications 的麦克风设备即可
 * Windows Chrome 中会有一个 deviceId 为 'communications' 的麦克风设备，这个麦克风是 Chrome 基于真实麦克风做的一次封装，该麦克风会受 Windows 的声音通信配置受限。若用户将 Windows 的声音通信配置设置为 “将其他所有应用设置为静音”，同时使用了 communications 麦克风采集，则可能出现 Chrome 被静音的问题。
 * Chrome 会有一个 deviceId 为 'default' 的麦克风设备，该麦克风指向 Chrome 认为的默认麦克风。当使用 deviceId 为 'default' 的麦克风进行通话时，若插入一个新的麦克风后，再将其拔出，可能会出现采集中断，导致采集无声问题。
 * @return Promise
 */

function getDevices() {
  if (!navigator.mediaDevices) {
    throw new ER({
      code: ERCode.DEVICE_NOT_FOUND,
      message: 'navigator.mediaDevices is undefined'
    });
  }

  return new Promise(function (resolve, reject) {
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      var d = devices.filter(function (e) {
        return "audioinput" !== e.kind || "default" !== e.deviceId && "communications" != e.deviceId;
      }).map(function (device, index) {
        var n = device.label;
        device.label || (n = device.kind + "_" + index);
        var r = {
          label: n,
          deviceId: device.deviceId,
          kind: device.kind
        };
        return device.groupId && (r.groupId = device.groupId), r;
      });
      resolve(d);
    }, function (reason) {
      reject(reason);
    })["catch"](function (er) {
      var err = new ER({
        code: ERCode.DEVICE_NOT_FOUND,
        message: er.message
      });
      reject(err);
    });
  });
}
/**
 * 获取摄像头设备列表
 * @return Promise
 */

function getCameras() {
  if (!navigator.mediaDevices) {
    throw new ER({
      code: ERCode.CAMERAS_NOT_FOUND,
      message: 'navigator.mediaDevices is undefined'
    });
  }

  return new Promise(function (resolve, reject) {
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      var devicesInfo = devices.filter(function (e) {
        return "videoinput" === e.kind;
      }).map(function (d, i) {
        var n = d.label;
        d.label || (n = "camera_" + i);
        var r = {
          label: n,
          deviceId: d.deviceId,
          kind: d.kind
        };
        return d.groupId && (r.groupId = d.groupId), r;
      });
      resolve(devicesInfo);
    }, function (reason) {
      reject(reason);
    })["catch"](function (er) {
      var err = new ER({
        code: ERCode.CAMERAS_NOT_FOUND,
        message: er.message
      });
      reject(err);
    });
  });
}
/**
 * 获取麦克风设备列表
 * Chrome 使用 deviceId 为 default 或 communications (Windows 设备下会有该 deviceId) 时，若插入新的麦克风，再拔出，可能会导致麦克风采集中断。
 * @return Promise
 */

function getMicrophones() {
  if (!navigator.mediaDevices) {
    throw new ER({
      code: ERCode.MICROPHONES_NOT_FOUND,
      message: 'navigator.mediaDevices is undefined'
    });
  }

  return new Promise(function (resolve, reject) {
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      var devicesInfo = devices.filter(function (e) {
        return "audioinput" === e.kind && "default" !== e.deviceId && "communications" !== e.deviceId;
      }).map(function (d, i) {
        var n = d.label;
        d.label || (n = "microphone_" + i);
        var r = {
          label: n,
          deviceId: d.deviceId,
          kind: d.kind
        };
        return d.groupId && (r.groupId = d.groupId), r;
      });
      resolve(devicesInfo);
    }, function (reason) {
      reject(reason);
    })["catch"](function (er) {
      var err = new ER({
        code: ERCode.MICROPHONES_NOT_FOUND,
        message: er.message
      });
      reject(err);
    });
  });
}
/**
 * 获取扬声器设备列表
 * @return Promise
 */

function getSpeakers() {
  if (!navigator.mediaDevices) {
    throw new ER({
      code: ERCode.SPEAKERS_NOT_FOUND,
      message: 'navigator.mediaDevices is undefined'
    });
  }

  return new Promise(function (resolve, reject) {
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      var devicesInfo = devices.filter(function (e) {
        return "audiooutput" === e.kind;
      }).map(function (d, i) {
        var n = d.label;
        d.label || (n = "speaker_" + i);
        var r = {
          label: n,
          deviceId: d.deviceId,
          kind: d.kind
        };
        return d.groupId && (r.groupId = d.groupId), r;
      });
      resolve(devicesInfo);
    }, function (reason) {
      reject(reason);
    })["catch"](function (er) {
      var err = new ER({
        code: ERCode.SPEAKERS_NOT_FOUND,
        message: er.message
      });
      reject(err);
    });
  });
}
/**
 * 检测浏览器是否支持开启大小流模式
 */

function isSmallStreamSupported() {
  return !!('captureStream' in HTMLCanvasElement.prototype);
}
/**
 * 检测浏览器是否美颜 （目前只知道safari 13下不支持）
 */

function isBeautyStreamSupported() {
  var _getBrowserAndVersion2 = getBrowserAndVersion(),
      browser = _getBrowserAndVersion2.browser,
      version = _getBrowserAndVersion2.version;

  if (browser === "Safari" && version <= 13) {
    return false;
  } else {
    return true;
  }
}

/**
 * 获取类型
 * @param e
 * @returns
 */

function getType(e) {
  return ("function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
    return _typeof(e);
  } : function (e) {
    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : _typeof(e);
  })(e);
} // 浏览器内核


var ap = window.navigator && window.navigator.userAgent || ""; // 判断是否ag

var isEdge = /Edge\//i.test(ap); // 获取chrome 版本

var version = function () {
  var e = ap.match(/Chrome\/(\d+)/);
  return e && e[1] ? parseFloat(e[1]) : null;
}();

function ownKeys$6(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$6(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$6(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$6(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var LocalStream$1 = /*#__PURE__*/function (_Stream) {
  _inherits(LocalStream, _Stream);

  var _super = _createSuper$1(LocalStream);

  function LocalStream(streamConfig, logger) {
    var _this2;

    _classCallCheck(this, LocalStream);

    _this2 = _super.call(this, streamConfig, logger);
    _this2.screen = streamConfig.screen;
    _this2.audioProfile = audioProfiles.get("standard");
    _this2.videoProfile = videoProfiles.get("480p");
    _this2.screenProfile = screenProfiles.get("1080p");
    _this2.bitrate = {
      audio: _this2.audioProfile.bitrate,
      video: _this2.screen ? _this2.screenProfile.bitrate : _this2.videoProfile.bitrate
    };
    _this2.cameraId_ = streamConfig.cameraId || '';
    _this2.cameraGroupId_ = "";
    _this2.microphoneId_ = streamConfig.microphoneId || '';
    _this2.microphoneGroupId_ = "";
    _this2.published = false;
    _this2.audioPubState = PublishState$1.Create;
    _this2.videoPubState = PublishState$1.Create;
    return _this2;
  }
  /**
   * 本地流初始化
   * @returns
   */


  _createClass(LocalStream, [{
    key: "initialize",
    value: function () {
      var _initialize = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
        var _this3 = this;

        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.logger.info("initialize stream audio: ".concat(this.constraints.audio, " video: ").concat(this.constraints.video));
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  if (_this3.screen) {
                    return _this3.initShareStream({
                      audio: _this3.streamConfig.audio,
                      screenAudio: _this3.streamConfig.screenAudio,
                      microphoneId: _this3.streamConfig.microphoneId,
                      width: _this3.screenProfile.width,
                      height: _this3.screenProfile.height,
                      frameRate: _this3.screenProfile.frameRate,
                      sampleRate: _this3.audioProfile.sampleRate,
                      channelCount: _this3.audioProfile.channelCount
                    }).then(function (mediaStream) {
                      _this3.mediaStream = mediaStream;
                      var hasAudioTrack = mediaStream.getAudioTracks().length > 0;
                      var hasVideoTrack = mediaStream.getVideoTracks().length > 0;

                      _this3.setHasAudio(hasAudioTrack);

                      _this3.setHasVideo(hasVideoTrack);

                      _this3.setMutedState('audio', !hasAudioTrack);

                      _this3.setMutedState('video', !hasVideoTrack);

                      _this3.listenForScreenSharingStopped(mediaStream.getVideoTracks()[0]);

                      _this3.setVideoContentHint('detail');

                      _this3.updateDeviceIdInUse();

                      resolve(mediaStream);

                      _this3.logger.info('init share stream success');
                    })["catch"](function (error) {
                      _this3.logger.error("init share stream failed,".concat(error.name, ":").concat(error.message));

                      var err = new ER({
                        code: ERCode.INIT_STREAM_FAILED,
                        message: error.message,
                        name: error.name
                      });
                      reject(err);
                    });
                  } else {
                    return _this3.initAvStream({
                      audio: _this3.streamConfig.audio,
                      video: _this3.streamConfig.video,
                      facingMode: _this3.streamConfig.facingMode,
                      cameraId: _this3.streamConfig.cameraId,
                      microphoneId: _this3.streamConfig.microphoneId,
                      width: _this3.videoProfile.width,
                      height: _this3.videoProfile.height,
                      frameRate: _this3.videoProfile.frameRate,
                      sampleRate: _this3.audioProfile.sampleRate,
                      channelCount: _this3.audioProfile.channelCount
                    }).then(function (mediaStream) {
                      _this3.mediaStream = mediaStream;
                      var hasAudioTrack = mediaStream.getAudioTracks().length > 0;
                      var hasVideoTrack = mediaStream.getVideoTracks().length > 0;

                      _this3.setHasAudio(hasAudioTrack);

                      _this3.setHasVideo(hasVideoTrack);

                      _this3.setMutedState('audio', !hasAudioTrack);

                      _this3.setMutedState('video', !hasVideoTrack);

                      _this3.updateDeviceIdInUse();

                      _this3.videoSetting = hasVideoTrack && mediaStream.getVideoTracks()[0].getSettings();
                      resolve(mediaStream);

                      _this3.logger.info('init local stream success');
                    })["catch"](function (error) {
                      _this3.logger.error("init local stream failed,".concat(error.name, ":").concat(error.message));

                      var err = new ER({
                        code: ERCode.INIT_STREAM_FAILED,
                        message: error.message,
                        name: error.name
                      });
                      reject(err);
                    });
                  }
                }));

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function initialize() {
        return _initialize.apply(this, arguments);
      }

      return initialize;
    }()
    /**
     * 初始化本地音视频流
     * @returns
     */

  }, {
    key: "initAvStream",
    value: function () {
      var _initAvStream = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(options) {
        var microphones, cameras, constraint, micIds, mId;
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (navigator.mediaDevices) {
                  _context2.next = 3;
                  break;
                }

                this.logger.error('navigator.mediaDevices is undefined');
                return _context2.abrupt("return", Promise.reject());

              case 3:
                constraint = {
                  audio: options.audio,
                  video: options.video
                };

                if (!options.audio) {
                  _context2.next = 15;
                  break;
                }

                _context2.next = 7;
                return getMicrophones();

              case 7:
                microphones = _context2.sent;

                if (!(microphones.length === 0)) {
                  _context2.next = 12;
                  break;
                }

                throw new ER({
                  code: ERCode.DEVICE_NOT_FOUND,
                  message: 'no microphone detected, but you are trying to get audio stream, please check your microphone and the configeration on XRTC.createStream.'
                });

              case 12:
                micIds = microphones.filter(function (m) {
                  return m.deviceId.length > 0;
                });
                micIds.length > 0 && (mId = micIds[0].deviceId);
                constraint.audio = {
                  deviceId: {
                    exact: options.microphoneId || mId
                  },
                  echoCancellation: !0,
                  autoGainControl: !0,
                  noiseSuppression: !0,
                  sampleRate: options.sampleRate,
                  channelCount: options.channelCount
                };

              case 15:
                if (!options.video) {
                  _context2.next = 26;
                  break;
                }

                _context2.next = 18;
                return getCameras();

              case 18:
                cameras = _context2.sent;

                if (!(cameras.length === 0)) {
                  _context2.next = 23;
                  break;
                }

                throw new ER({
                  code: ERCode.DEVICE_NOT_FOUND,
                  message: 'no camera detected, but you are trying to get video stream, please check your camera and the configeration on TRTC.createStream.'
                });

              case 23:
                constraint.video = {
                  width: options.width,
                  height: options.height,
                  frameRate: options.frameRate
                };
                options.cameraId && (constraint.video = _objectSpread$6(_objectSpread$6({}, constraint.video), {}, {
                  deviceId: {
                    exact: options.cameraId
                  }
                }));
                options.facingMode && (constraint.video = _objectSpread$6(_objectSpread$6({}, constraint.video), {}, {
                  facingMode: options.facingMode
                }));

              case 26:
                return _context2.abrupt("return", navigator.mediaDevices.getUserMedia(constraint));

              case 27:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function initAvStream(_x) {
        return _initAvStream.apply(this, arguments);
      }

      return initAvStream;
    }()
    /**
     * 初始化屏幕分享流
     */

  }, {
    key: "initShareStream",
    value: function initShareStream(t) {
      if (!navigator.mediaDevices) {
        this.logger.error('navigator.mediaDevices is undefined');
        return Promise.reject();
      }

      if (t.screenAudio) {
        // Edage浏览器或者chrome版本小于74不支持采集系统声音
        if (isEdge || version < 74) {
          this.logger.error('Your browser not support capture system audio');
        } else {
          t.audioConstraints = {
            echoCancellation: !0,
            noiseSuppression: !0,
            sampleRate: 44100
          };
        }
      } else {
        if (t.audio) {
          var a = {
            audio: void 0 !== t.microphoneId ? {
              deviceId: {
                exact: t.microphoneId
              },
              sampleRate: t.sampleRate,
              channelCount: t.channelCount
            } : {
              sampleRate: t.sampleRate,
              channelCount: t.channelCount
            },
            video: !1
          };

          var _p = this.setConstraints(t);

          this.logger.info("getDisplayMedia with contraints: " + JSON.stringify(_p));
          return new Promise( /*#__PURE__*/function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3(resolve, reject) {
              var stream;
              return regenerator.wrap(function _callee3$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      _context3.next = 2;
                      return navigator.mediaDevices.getDisplayMedia(_p);

                    case 2:
                      stream = _context3.sent;
                      navigator.mediaDevices.getUserMedia(a).then(function (n) {
                        stream.addTrack(n.getAudioTracks()[0]);
                        resolve(stream);
                      })["catch"](function (err) {
                        return reject(err);
                      });

                    case 4:
                    case "end":
                      return _context3.stop();
                  }
                }
              }, _callee3);
            }));

            return function (_x2, _x3) {
              return _ref.apply(this, arguments);
            };
          }());
        }
      }

      var p = this.setConstraints(t);
      this.logger.info("getDisplayMedia with contraints: " + JSON.stringify(p)); // @ts-ignore

      return navigator.mediaDevices.getDisplayMedia(p);
    }
    /**
     * 设置音频 Profile
     * @param profile
     */

  }, {
    key: "setAudioProfile",
    value: function setAudioProfile(profile) {
      if (this.mediaStream) {
        this.logger.warn("Please set audio profile before initialize!");
        return;
      }

      var p;

      if ("object" === getType(profile)) {
        p = profile;
      } else {
        void 0 === (p = audioProfiles.get(profile)) && (p = audioProfiles.get("standard"));
      }

      this.logger.info("setAudioProfile: " + JSON.stringify(p));
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: LogCode.SET_AUDIO_PROFILE,
        v: JSON.stringify(p)
      });
      this.audioProfile = p;
      this.bitrate.audio = p.bitrate;
    }
    /**
     * 设置视频 Profile
     * @param profile
     */

  }, {
    key: "setVideoProfile",
    value: function () {
      var _setVideoProfile = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4(profile) {
        var p;
        return regenerator.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!this.mediaStream) {
                  _context4.next = 3;
                  break;
                }

                this.logger.warn("Please set video profile before initialize!");
                return _context4.abrupt("return");

              case 3:
                if ("object" === getType(profile)) {
                  p = profile;
                } else {
                  void 0 === (p = videoProfiles.get(profile)) && (p = videoProfiles.get("480p"));
                }

                this.logger.info("setVideoProfile " + JSON.stringify(p));
                this.logger.buriedLog({
                  t: LogType.EVENT,
                  c: LogCode.SET_VIDEO_PROFILE,
                  v: JSON.stringify(p)
                });
                this.videoProfile = p;
                this.bitrate.video = p.bitrate;

              case 8:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function setVideoProfile(_x4) {
        return _setVideoProfile.apply(this, arguments);
      }

      return setVideoProfile;
    }()
    /**
     * 设置屏幕分享 Profile
     * @param profile
     */

  }, {
    key: "setScreenProfile",
    value: function setScreenProfile(profile) {
      if (this.mediaStream) {
        this.logger.warn("Please set screen profile before initialize!");
        return;
      }

      var p;

      if ("object" === getType(profile)) {
        p = profile;
      } else {
        void 0 === (p = screenProfiles.get(profile)) && (p = screenProfiles.get("1080p"));
      }

      this.logger.info("setScreenProfile " + JSON.stringify(p));
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: LogCode.SET_SCREEN_PROFILE,
        v: JSON.stringify(p)
      });
      this.screenProfile = p;
      this.bitrate.video = p.bitrate;
    }
    /**
     * 设置constraints
     */

  }, {
    key: "setConstraints",
    value: function setConstraints(p) {
      var t = {},
          n = {
        width: p.width,
        height: p.height,
        frameRate: p.frameRate
      };
      return t.video = n, void 0 !== p.audioConstraints && (t.audio = p.audioConstraints), this.constraints = t, t;
    }
    /**
     * 获取视频码率设置
     * @returns
     */

  }, {
    key: "getBitrate",
    value: function getBitrate() {
      return this.bitrate;
    }
    /**
     * 添加轨道
     * @param track
     * @returns Promise<boolean>
     */

  }, {
    key: "addTrack",
    value: function addTrack(t) {
      var _this4 = this;

      if (!this.mediaStream) {
        throw new ER({
          code: ERCode.ADD_TRACK_FAILED,
          message: "the local stream is not initialized yet"
        });
      }

      if ("audio" === t.kind && this.getAudioTracks().length > 0 || "video" === t.kind && this.getVideoTracks().length > 0) {
        throw new ER({
          code: ERCode.ADD_TRACK_FAILED,
          message: "A Stream has at most one audio track and one video track"
        });
      }

      var s = t.getSettings();

      if (t.kind === 'video' && s && this.videoSetting && (s.width !== this.videoSetting.width || s.height !== this.videoSetting.height)) {
        this.logger.warn("video resolution of the track ".concat(s.width, " x ").concat(s.height, " shall be kept the same as the previous: ").concat(this.videoSetting.width, " x ").concat(this.videoSetting.height));
      }

      return new Promise(function (resolve, reject) {
        _this4._emitter.once(STREAM_TRACK_UPDATE_RESULT, function (_ref2) {
          var code = _ref2.code,
              message = _ref2.message;

          _this4.logger.info("add track response", code);

          if (code === RESPONSE_CODE.SUCCESS) {
            resolve(true);
          } else {
            var er = new ER({
              code: ERCode.ADD_TRACK_FAILED,
              message: message || "add track failed"
            });
            reject(er);
          }
        });

        _this4.logger.buriedLog({
          t: LogType.EVENT,
          c: t.kind === 'audio' ? _this4.type === AUXILIARY ? LogCode.ADD_AUDIO_TRACK_SCREEN : LogCode.ADD_AUDIO_TRACK : _this4.type === AUXILIARY ? LogCode.ADD_VIDEO_TRACK_SCREEN : LogCode.ADD_VIDEO_TRACK
        });

        _this4._emitter.emit(STREAM_ADD_TRACK, {
          track: t,
          streamId: _this4.streamId
        });
      });
    }
    /**
     * 移除轨道
     * @param t 
     * @returns Promise<boolean>
     */

  }, {
    key: "removeTrack",
    value: function removeTrack(t) {
      var _this5 = this;

      if (t && t.kind === 'audio') {
        throw new ER({
          code: ERCode.INVALID_PARAMETER,
          message: "remove audio track is not supported"
        });
      }

      if (!this.mediaStream) {
        throw new ER({
          code: ERCode.INVALID_OPERATION,
          message: "the local stream is not initialized yet"
        });
      }

      if (-1 === this.mediaStream.getTracks().indexOf(t)) {
        throw new ER({
          code: ERCode.INVALID_PARAMETER,
          message: "the track to be removed is not being publishing"
        });
      }

      if (!this.supportPC()) {
        throw new ER({
          code: ERCode.INVALID_OPERATION,
          message: "removeTrack is not supported in this browser"
        });
      }

      this.logger.info('remove video track from current published stream');
      return new Promise(function (resolve, reject) {
        _this5._emitter.once(STREAM_TRACK_UPDATE_RESULT, function (_ref3) {
          var code = _ref3.code,
              message = _ref3.message;

          _this5.logger.info("remove track response", code);

          if (code === RESPONSE_CODE.SUCCESS) {
            resolve(true);
          } else {
            var er = new ER({
              code: ERCode.REMOVE_TRACK_FAILED,
              message: message || "remove track failed"
            });
            reject(er);
          }
        });

        _this5.logger.buriedLog({
          t: LogType.EVENT,
          c: _this5.type === AUXILIARY ? LogCode.REMOVE_TRACK_SCREEN : LogCode.REMOVE_TRACK
        });

        _this5._emitter.emit(STREAM_REMOVE_TRACK, {
          track: t,
          streamId: _this5.streamId
        });
      });
    }
    /**
     * 更换音频或视频轨道
     * @param track 
     */

  }, {
    key: "replaceTrack",
    value: function replaceTrack(t) {
      if (!this.mediaStream) {
        throw new ER({
          code: ERCode.INVALID_OPERATION,
          message: 'the local stream is not initialized yet'
        });
      }

      var s = t.getSettings();

      if (t.kind === 'video' && s && this.videoSetting && (s.width !== this.videoSetting.width || s.height !== this.videoSetting.height)) {
        this.logger.warn("video resolution of the track ".concat(s.width, " x ").concat(s.height, " shall be kept the same as the previous: ").concat(this.videoSetting.width, " x ").concat(this.videoSetting.height));
      }

      if ('audio' === t.kind) {
        this.mediaStream.removeTrack(this.getAudioTrack());
        this.mediaStream.addTrack(t);
        t.enabled = !this.getAudioMuted();
        this.restartAudio();
      } else {
        this.mediaStream.removeTrack(this.getVideoTrack());
        this.mediaStream.addTrack(t);
        t.enabled = !this.getVideoMuted();
        this.restartVideo();
      }

      if (!this.isReplaceTrackAvailable() || !this.supportPC()) {
        throw new ER({
          code: ERCode.INVALID_OPERATION,
          message: "replaceTrack is not supported in this browser, please use switchDevice or addTrack instead"
        });
      }

      this.logger.buriedLog({
        t: LogType.EVENT,
        c: 'audio' === t.kind ? this.type === AUXILIARY ? LogCode.REPLACE_AUDIO_TRACK_SCREEN : LogCode.REPLACE_AUDIO_TRACK : this.type === AUXILIARY ? LogCode.REPLACE_VIDEO_TRACK_SCREEN : LogCode.REPLACE_VIDEO_TRACK
      });

      this._emitter.emit(STREAM_REPLACE_TRACK, {
        streamId: this.streamId,
        type: t.kind,
        track: t
      });
    }
    /**
     * 设置视频内容提示，主要用于提升在不同场景下的视频编码质量。
     */

  }, {
    key: "setVideoContentHint",
    value: function setVideoContentHint(hint) {
      var track = this.getVideoTrack();

      if (track && "contentHint" in track) {
        this.logger.info("set video track contentHint to: " + hint);
        track.contentHint = hint;
        track.contentHint !== hint && this.logger.info("Invalid video track contentHint: " + hint);
        this.logger.buriedLog({
          t: LogType.EVENT,
          c: LogCode.SET_VIDEO_CONTENT_HINT,
          v: "hint".concat(hint)
        });
      }
    }
    /**
     * 调用该方法可更换本地流的媒体输入设备
     * @param type 
     * @param deviceId 
     */

  }, {
    key: "switchDevice",
    value: function switchDevice(type, deviceId) {
      var _this6 = this;

      if (this.screen) {
        throw new ER({
          code: ERCode.INVALID_OPERATION,
          message: 'switch device is not supported in screen sharing'
        });
      }

      if (!deviceId || this.streamConfig.audioSource || this.streamConfig.videoSource) {
        return Promise.reject();
      }

      if (type === 'audio' && this.microphoneId_ === deviceId || type === 'video' && this.cameraId_ === deviceId) {
        return this.logger.warn('switch device is not supported same device'), Promise.reject('switch device is not supported same device');
      }

      this.logger.info("switchDevice " + type + " to: " + deviceId);
      var a;
      var b;

      if (type === 'audio' && this.microphoneId_ !== deviceId) {
        this.microphoneId_ = deviceId;
        a = this.getAudioTrack();
        a && a.stop();
        this.logger.buriedLog({
          t: LogType.EVENT,
          c: LogCode.SWITCH_DEVICE_AUDIO,
          v: "deviceId:".concat(deviceId)
        });
      }

      if (type === 'video' && this.cameraId_ !== deviceId) {
        this.cameraId_ = deviceId;
        b = this.getVideoTrack();
        b && b.stop();
        this.logger.buriedLog({
          t: LogType.EVENT,
          c: LogCode.SWITCH_DEVICE_VIDEO,
          v: "deviceId:".concat(deviceId)
        });
      }

      return new Promise(function (resolve, reject) {
        _this6.initAvStream({
          audio: type === 'audio',
          video: type === 'video',
          facingMode: _this6.streamConfig.facingMode,
          cameraId: _this6.cameraId_,
          microphoneId: _this6.microphoneId_,
          width: _this6.videoProfile.width,
          height: _this6.videoProfile.height,
          frameRate: _this6.videoProfile.frameRate,
          sampleRate: _this6.audioProfile.sampleRate,
          channelCount: _this6.audioProfile.channelCount
        }).then(function (mediaStream) {
          if (type === 'audio') {
            _this6.mediaStream.removeTrack(a);

            a = mediaStream.getAudioTracks()[0];
            a && _this6.mediaStream.addTrack(a);
            a && _this6.setHasAudio(true);
            a && _this6._emitter.emit(STREAM_SWITCH_DEVICE, {
              streamId: _this6.streamId,
              type: type,
              track: a
            });

            _this6.updateDeviceIdInUse('audio');

            a.enabled = !_this6.getAudioMuted();

            _this6.restartAudio();
          }

          if (type == 'video') {
            _this6.mediaStream.removeTrack(b);

            b = mediaStream.getVideoTracks()[0];
            b && _this6.mediaStream.addTrack(b);
            b && _this6.setHasVideo(true);
            b && _this6._emitter.emit(STREAM_SWITCH_DEVICE, {
              streamId: _this6.streamId,
              type: type,
              track: b
            });

            _this6.updateDeviceIdInUse('video');

            b.enabled = !_this6.getVideoMuted();

            _this6.restartVideo();
          }

          resolve();
        }, function (error) {
          reject(new ER({
            code: ERCode.SWITCH_DEVICE_FAILED,
            message: error.message || 'init audio or video stream failed'
          }));
        })["catch"](function (error) {
          var err = new ER({
            code: ERCode.SWITCH_DEVICE_FAILED,
            message: error.message
          });
          reject(err);
        });
      });
    }
    /**
     * 设备添加移除更新本地流
     * 不包含屏幕分享
     * @returns 
     */

  }, {
    key: "updateStream",
    value: function updateStream(options) {
      var _this7 = this;

      if (this.screen || this.streamConfig.audioSource || this.streamConfig.videoSource) {
        return Promise.reject();
      }

      var audio = options.audio,
          video = options.video,
          cameraId = options.cameraId,
          microphoneId = options.microphoneId;
      var a;
      var b;
      audio && (a = this.getAudioTrack());
      video && (b = this.getVideoTrack());
      return new Promise(function (resolve, reject) {
        _this7.initAvStream({
          audio: audio,
          video: video,
          facingMode: _this7.streamConfig.facingMode,
          cameraId: cameraId || '',
          microphoneId: microphoneId || '',
          width: _this7.videoProfile.width,
          height: _this7.videoProfile.height,
          frameRate: _this7.videoProfile.frameRate,
          sampleRate: _this7.audioProfile.sampleRate,
          channelCount: _this7.audioProfile.channelCount
        }).then(function (mediaStream) {
          if (audio) {
            _this7.logger.info('updateStream audio');

            a && a.stop();

            _this7.mediaStream.removeTrack(a);

            a = mediaStream.getAudioTracks()[0];
            a && _this7.mediaStream.addTrack(a);
            a && _this7.setHasAudio(true);
            a && _this7._emitter.emit(STREAM_SWITCH_DEVICE, {
              streamId: _this7.streamId,
              type: 'audio',
              track: a
            });

            _this7.updateDeviceIdInUse('audio');

            _this7.setAudioTrack(a);
          }

          if (video) {
            _this7.logger.info('updateStream video');

            b && b.stop();

            _this7.mediaStream.removeTrack(b);

            b = mediaStream.getVideoTracks()[0];
            b && _this7.mediaStream.addTrack(b);
            b && _this7.setHasVideo(true);
            b && _this7._emitter.emit(STREAM_SWITCH_DEVICE, {
              streamId: _this7.streamId,
              type: 'video',
              track: b
            });

            _this7.updateDeviceIdInUse('video');

            _this7.setVideoTrack(b);
          }

          resolve();
        })["catch"](function (error) {
          if (error.name === 'NotReadableError') {
            _this7.logger.warn('getUserMedia NotReadableError observed', error.message);
          } else {
            _this7.logger.warn(error.name, error.message);
          }

          var err = new ER({
            code: ERCode.DEVICE_AUTO_RECOVER_FAILED,
            message: error
          });
          reject(err);

          _this7._emitter.emit(ERROR, err);
        });
      });
    }
    /**
     * 获取该流的所有音频轨道
     * @returns MediaStreamTrack[]
     */

  }, {
    key: "getAudioTracks",
    value: function getAudioTracks() {
      return this.mediaStream.getAudioTracks();
    }
    /**
     * 获取该流的所有视频频轨道
     * @returns MediaStreamTrack[]
     */

  }, {
    key: "getVideoTracks",
    value: function getVideoTracks() {
      return this.mediaStream.getVideoTracks();
    }
    /**
     * 是否支持替换轨道
     */

  }, {
    key: "isReplaceTrackAvailable",
    value: function isReplaceTrackAvailable() {
      return "RTCRtpSender" in window && "replaceTrack" in window.RTCRtpSender.prototype;
    }
    /**
     * 是否支持RTCPeerConnection
     * @returns boolean
     */

  }, {
    key: "supportPC",
    value: function supportPC() {
      return "RTCPeerConnection" in window && "getSenders" in window.RTCPeerConnection.prototype;
    }
    /**
     * 屏幕共享流添加结束共享事件
     * @param track 
     */

  }, {
    key: "listenForScreenSharingStopped",
    value: function listenForScreenSharingStopped(track) {
      var _this = this;

      track.addEventListener("ended", function (e) {
        _this.logger.info("screen sharing was stopped because the video track is ended");

        _this.logger.buriedLog({
          t: LogType.EVENT,
          c: LogCode.ON_SCREEN_SHARING_STOPPED
        });

        _this._emitter.emit(SCREEN_SHARING_STOPPED);
      });
    }
    /**
     * 更新正在使用中的设备Id
     * 使用美颜流后会更改videoTrcak的deviceId 
     * 传入type，解决美颜时单独切换麦克风，引起美颜消失问题
     */

  }, {
    key: "updateDeviceIdInUse",
    value: function updateDeviceIdInUse(type) {
      if (!this.mediaStream) {
        this.microphoneId_ = "";
        this.microphoneGroupId_ = "";
        this.cameraId_ = "";
        this.cameraGroupId_ = "";
        return;
      }

      var tracks = this.mediaStream.getTracks();
      var len = tracks.length;

      for (var i = 0; i < len; i++) {
        var _tracks$i$getSettings = tracks[i].getSettings(),
            deviceId = _tracks$i$getSettings.deviceId,
            groupId = _tracks$i$getSettings.groupId;

        if (type && deviceId) {
          if (type === tracks[i].kind && tracks[i].kind === 'audio') {
            this.microphoneId_ = deviceId;
            this.microphoneGroupId_ = groupId;
            break;
          }

          if (type === tracks[i].kind && tracks[i].kind === 'video' && !this.screen) {
            this.cameraId_ = deviceId;
            this.cameraGroupId_ = groupId;
            break;
          }
        } else if (deviceId) {
          if (tracks[i].kind === 'audio') {
            this.microphoneId_ = deviceId;
            this.microphoneGroupId_ = groupId;
          } else if (tracks[i].kind === 'video' && !this.screen) {
            this.cameraId_ = deviceId;
            this.cameraGroupId_ = groupId;
          }
        }
      }

      var a = this.mediaStream.getAudioTracks();
      var b = this.mediaStream.getVideoTracks();

      if (a && a.length === 0) {
        this.microphoneId_ = "";
        this.microphoneGroupId_ = "";
      }

      if (b && b.length === 0) {
        this.cameraId_ = "";
        this.cameraGroupId_ = "";
      }

      this.logger.info("update device id microphoneId: ".concat(this.microphoneId_, " cameraId_: ").concat(this.cameraId_));
    }
    /**
     * 获取正在使用的设备Id、groupId
     */

  }, {
    key: "getDevicesInfoInUse",
    value: function getDevicesInfoInUse() {
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: LogCode.GET_DEVICES_INFO_IN_USE,
        v: "camera:".concat(this.cameraId_, ",microphone:").concat(this.microphoneId_)
      });
      return {
        camera: {
          deviceId: this.cameraId_,
          groupId: this.cameraGroupId_
        },
        microphone: {
          deviceId: this.microphoneId_,
          groupId: this.microphoneGroupId_
        }
      };
    }
    /**
    * 设置本地流的发布状态
    * @param callback 
    */

  }, {
    key: "setPubState",
    value: function setPubState(type, state) {
      if (type === 'audio') {
        this.audioPubState = state;
      } else {
        this.videoPubState = state;
      }
    }
    /**
     * 获取本地流的发布状态
     * @param callback 
     */

  }, {
    key: "getPubState",
    value: function getPubState(type) {
      return type === 'audio' ? this.audioPubState : this.videoPubState;
    }
    /**
     * 注册 轨道 添加事件
     * @param callback 
     */

  }, {
    key: "onTrackAdd",
    value: function onTrackAdd(callback) {
      this._emitter.on(STREAM_ADD_TRACK, callback);
    }
    /**
     * 
     * @param callback 
     */

  }, {
    key: "onTrackRemove",
    value: function onTrackRemove(callback) {
      this._emitter.on(STREAM_REMOVE_TRACK, callback);
    }
    /**
    * 注册 切换设备事件
    * @param callback 
    */

  }, {
    key: "onSwitchDevice",
    value: function onSwitchDevice(callback) {
      this._emitter.on(STREAM_SWITCH_DEVICE, callback);
    }
    /**
    * 注册 更换音频或视频轨道事件
    * @param callback 
    */

  }, {
    key: "onReplaceTrack",
    value: function onReplaceTrack(callback) {
      this._emitter.on(STREAM_REPLACE_TRACK, callback);
    }
  }]);

  return LocalStream;
}(Stream);

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var RemoteStream$1 = /*#__PURE__*/function (_Stream) {
  _inherits(RemoteStream, _Stream);

  var _super = _createSuper(RemoteStream);

  // 包含音频
  function RemoteStream(streamConfig, logger) {
    var _this;

    _classCallCheck(this, RemoteStream);

    _this = _super.call(this, streamConfig, logger);
    _this.isRemote = true;
    _this.subscribed = false;
    _this.audio = false;
    _this.video = false;
    _this.subscriptionId = null;
    _this.audioSubscriptionId = null;
    _this.videoSubscriptionId = null;
    _this.peerConnections = [];
    _this.audioSubState = SubscribeState$1.Create;
    _this.videoSubState = SubscribeState$1.Create;
    _this.simulcastType = null;
    return _this;
  }
  /**
   * 获取用户序列
   */


  _createClass(RemoteStream, [{
    key: "getUserSeq",
    value: function getUserSeq() {
      return this.userId;
    }
  }, {
    key: "setAudio",
    value: function setAudio(audio) {
      this.audio = audio;
    }
  }, {
    key: "setVideo",
    value: function setVideo(video) {
      this.video = video;
    }
  }, {
    key: "setAudioSubscriptionId",
    value: function setAudioSubscriptionId(subscriptionId) {
      this.audioSubscriptionId = subscriptionId;
    }
  }, {
    key: "setVideoSubscriptionId",
    value: function setVideoSubscriptionId(subscriptionId) {
      this.videoSubscriptionId = subscriptionId;
    }
    /**
     * 获取stream 类型
     * @returns number
     */

  }, {
    key: "getStreamKind",
    value: function getStreamKind(streamId) {
      if (this.audioStreamId === this.videoStreamId) {
        return StreamKind$1.AudioVideo;
      } else if (this.audioStreamId === streamId) {
        return StreamKind$1.AudioOnly;
      } else if (this.videoStreamId === streamId) {
        return StreamKind$1.VideoOnly;
      }
    }
    /**
    * 设置订阅流的类型
    * @returns number
    */

  }, {
    key: "setSimulcastType",
    value: function setSimulcastType(type) {
      this.simulcastType = type;
    }
    /**
    * 获取订阅流的类型
    * @returns number
    */

  }, {
    key: "getSimulcastType",
    value: function getSimulcastType() {
      return this.simulcastType;
    }
    /**
      * 设置远端流的订阅状态
      * @param callback 
      */

  }, {
    key: "setSubState",
    value: function setSubState(type, state) {
      if (type === 'audio') {
        this.audioSubState = state;
      } else {
        this.videoSubState = state;
      }
    }
    /**
     * 获取远端流的订阅状态
     * @param callback 
     */

  }, {
    key: "getSubState",
    value: function getSubState(type) {
      return type === 'audio' ? this.audioSubState : this.videoSubState;
    }
  }]);

  return RemoteStream;
}(Stream);

function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$5(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$5(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$5(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var PublishState;

(function (PublishState) {
  PublishState[PublishState["Create"] = 0] = "Create";
  PublishState[PublishState["Publishing"] = 1] = "Publishing";
  PublishState[PublishState["Published"] = 2] = "Published";
  PublishState[PublishState["Unpublished"] = 3] = "Unpublished";
})(PublishState || (PublishState = {}));

var PublishStream = /*#__PURE__*/function () {
  function PublishStream(options) {
    _classCallCheck(this, PublishStream);

    this.options = options;
    this.userId = options.userId;
    this.streamId = null;
    this.localStream = options.mediaStream;
    this.peerConnection = new RTCPeerConnection({
      bundlePolicy: "max-bundle",
      sdpSemantics: 'unified-plan'
    });
    this.logger = options.logger;
    this.xsigoClient = options.xsigoClient;
    this.roomId = options.roomId;
    this.state = PublishState.Create;
    this.transceiver = null;
    this._emitter = new EventEmitter();
    this._interval = -1;
  }
  /**
   * 推流
   * @returns Promise<RTCSessionDescription>
   */


  _createClass(PublishStream, [{
    key: "publish",
    value: function publish() {
      var _this = this;

      return new Promise( /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(resolve, reject) {
          var str;
          return regenerator.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;

                  if (_this.state !== PublishState.Create) {
                    _this.logger.warn('Stream already publishing or published');

                    reject({
                      message: 'stream already publishing or published'
                    });
                  }

                  _this.logger.info('stream publishing');

                  _this.state = PublishState.Publishing;
                  _context.next = 6;
                  return _this.createOffer(_this.localStream);

                case 6:
                  _this.logger.info('publishStream track', _this.localStream.getTracks());

                  _this.peerConnection.onconnectionstatechange = _this.onConnectionstatechange.bind(_this, 'publish');
                  str = '';

                  _this.peerConnection.onicecandidate = function (e) {
                    var candidate = e.candidate;

                    _this.logger.info("peercConnection publish IceCandidate data:\n ".concat((candidate === null || candidate === void 0 ? void 0 : candidate.candidate) || ''));

                    if (candidate !== null && candidate !== void 0 && candidate.candidate) {
                      str = str + 'a=' + candidate.candidate + '\r\n';
                    } // 检测到协议结束时


                    if (!candidate) {
                      var offer = _this.peerConnection.pendingLocalDescription;
                      var sdp = offer.sdp; // 兼容浏览器sdp 不包含 candidate 信息

                      if (!sdp.includes('a=candidate')) {
                        sdp = sdp + str;
                      }

                      var publishParams = _this.buildPublishParams();

                      publishParams.params.offerSdp = sdp;

                      _this.logger.info('=======publish offer========\n', sdp); // 去推流


                      _this.streamId = _this.xsigoClient.publishStream(_this.roomId, publishParams);
                      resolve(_this.streamId);
                    }
                  };

                  _context.next = 15;
                  break;

                case 12:
                  _context.prev = 12;
                  _context.t0 = _context["catch"](0);
                  reject(_context.t0);

                case 15:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, null, [[0, 12]]);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }
    /**
     *  重新发布
     * @param
     */

  }, {
    key: "republish",
    value: function () {
      var _republish = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
        var _this2 = this;

        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  _this2.close();

                  _this2.peerConnection = new RTCPeerConnection({
                    bundlePolicy: "max-bundle",
                    sdpSemantics: 'unified-plan'
                  });
                  _this2.state = PublishState.Publishing;

                  _this2.createOffer(_this2.localStream);

                  _this2.peerConnection.onicecandidate = function (e) {
                    _this2.logger.info("peercConnection publish IceCandidate data:\n ".concat(e.candidate ? e.candidate.candidate : "")); // 检测到协议结束时


                    if (!e.candidate) {
                      var offer = _this2.peerConnection.pendingLocalDescription;

                      _this2.logger.info('republish create offer', offer);

                      resolve(offer);
                    }
                  };

                  _this2.peerConnection.onconnectionstatechange = _this2.onConnectionstatechange.bind(_this2, 'republish');
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function republish() {
        return _republish.apply(this, arguments);
      }

      return republish;
    }()
    /**
     * 取消发布
     * @param stream 
     */

  }, {
    key: "unpublish",
    value: function unpublish(cb) {
      var _this3 = this;

      var callback = function callback(code, message, data) {
        if (code === RESPONSE_CODE.SUCCESS) {
          _this3.state = PublishState.Unpublished;

          _this3.close();
        }

        cb(code, message, data);
      };

      this.xsigoClient.unpublishStream(this.roomId, this.streamId, callback);
    }
    /**
      * 更新本地的大小流
      * @param simulcast 
      * @returns 
      */

  }, {
    key: "updateSimulcast",
    value: function updateSimulcast(simulcast, cb) {
      this.xsigoClient.updateSimulcast(this.roomId, this.streamId, {
        simulcast: simulcast
      }, cb);
    }
    /**
     * createOffer
     * @param stream 
     */

  }, {
    key: "createOffer",
    value: function () {
      var _createOffer = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3(stream) {
        var _this4 = this;

        var desc;
        return regenerator.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                this.localStream.getTracks().forEach(function (track) {
                  var encodings = [];

                  if (track.kind === 'video') {
                    var _this4$options = _this4.options,
                        isEnableSmallStream = _this4$options.isEnableSmallStream,
                        _smallStreamConfig = _this4$options.smallStreamConfig,
                        screen = _this4$options.screen;
                    var settings = track.getSettings();
                    _this4.captureVideoWidth = settings.width;
                    _this4.captureVideoHeight = settings.height;

                    if (isEnableSmallStream && !screen) {
                      encodings.push({
                        rid: "h",
                        active: true,
                        scaleResolutionDownBy: 1 // maxBitrate: 2 * 1024 * 1024

                      });
                      encodings.push({
                        rid: "l",
                        active: true,
                        scaleResolutionDownBy: _this4.captureVideoHeight / _smallStreamConfig.height,
                        maxBitrate: _smallStreamConfig.bitrate * 1000
                      });
                    }
                  }

                  _this4.transceiver = _this4.peerConnection.addTransceiver(track.kind, {
                    direction: "sendonly",
                    sendEncodings: encodings
                  });

                  _this4.peerConnection.addTrack(track, stream);

                  _this4.filterCodecs(track);
                });
                _context3.next = 4;
                return this.peerConnection.createOffer();

              case 4:
                desc = _context3.sent;
                this.peerConnection.setLocalDescription(desc);
                _context3.next = 13;
                break;

              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3["catch"](0);
                this.logger.error("code:".concat(ERCode.CREATE_OFFER_FAILED, ",create offer error!"), _context3.t0);
                this.state = PublishState.Create;
                throw new ER({
                  code: ERCode.CREATE_OFFER_FAILED,
                  message: "create offer error!,".concat(_context3.t0)
                });

              case 13:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 8]]);
      }));

      function createOffer(_x3) {
        return _createOffer.apply(this, arguments);
      }

      return createOffer;
    }()
    /**
     * 监听状态
     * @param track 
     */

  }, {
    key: "onConnectionstatechange",
    value: function onConnectionstatechange(type) {
      var _this5 = this;

      // 这边通知上层
      if (['failed', 'connected'].includes(this.peerConnection.connectionState)) {
        // 通知上层状态值改变了
        this._emitter.emit(PUBLISH_ICE_STATE, {
          state: this.peerConnection.connectionState,
          streamId: this.streamId
        });
      }

      this.logger.info("peerConnection ".concat(type, " ICE State: ").concat(this.peerConnection.connectionState));

      if (this.peerConnection.connectionState === 'connecting') {
        if (this._interval === -1) {
          this._interval = window.setInterval(function () {
            _this5.getRTCIceCandidatePairStats();
          }, 2 * 1000);
        }
      } else {
        clearInterval(this._interval);
        this._interval === -1;
      }
    }
    /**
     * 过滤编码方式
     * @param track MediaStreamTrack
     */

  }, {
    key: "filterCodecs",
    value: function filterCodecs(track) {
      if (RTCRtpSender.getCapabilities) {
        var customCodecs = RTCRtpSender.getCapabilities(track.kind).codecs.filter(function (codec) {
          if (track.kind === 'audio') {
            return codec.mimeType.indexOf('opus') != -1;
          } else {
            return codec.mimeType.indexOf('H264') != -1;
          }
        });

        if (this.transceiver.setCodecPreferences && typeof this.transceiver.setCodecPreferences === 'function') {
          this.transceiver.setCodecPreferences(customCodecs);
        }
      }
    }
    /**
     * 设置远程描述
     * @param remoteAnswer string
     * @param streamId string
     */

  }, {
    key: "setRemoteDesc",
    value: function setRemoteDesc(remoteAnswer, streamId) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        _this6.logger.info('=======publish answer========\n', remoteAnswer);

        _this6.state = PublishState.Published;
        _this6.streamId = streamId;
        var answer = {
          sdp: remoteAnswer,
          type: "answer"
        };

        _this6.peerConnection.setRemoteDescription(answer).then(function () {
          // 设置比特率 kbps
          _this6.setBandwidth(_this6.options.bitrate);

          resolve(true);
        })["catch"](function (err) {
          _this6.logger.error('publish setRemoteDescription error', err);

          reject(err);
        });
      });
    }
    /**
     * 获取 peerConnection
     */

  }, {
    key: "getPeerConnection",
    value: function getPeerConnection() {
      return this.peerConnection;
    }
    /**
     * 关闭 peerconnection 连接
     */

  }, {
    key: "close",
    value: function close() {
      this.peerConnection.onicecandidate = null;
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.close();
      this.peerConnection = null;
      this.transceiver = null;
      this._interval && clearInterval(this._interval);
      this._interval === -1;
      this.logger.info('close publish stream peerConnection,streamId', this.streamId);
    }
    /**
     * 设置 peerConnection 带宽
     */

  }, {
    key: "setBandwidth",
    value: function setBandwidth(t) {
      var _this7 = this;

      var senders = this.peerConnection.getSenders();
      var audio = t.audio,
          video = t.video;
      senders.forEach(function (sender) {
        var bitrate;

        if (sender.track.kind === "video") {
          bitrate = video;
        }

        if (sender.track.kind === "audio") {
          bitrate = audio;
        }

        var p = sender.getParameters();

        if (!p.encodings.length) {
          p.encodings = [{}];
        }

        p.encodings[0].maxBitrate = bitrate * 1000; // if (p.encodings[1] && p.encodings[1].maxBitrate) {
        //   p.encodings[1].maxBitrate = p.encodings[1].maxBitrate * 1000;
        // }

        _this7.logger.info('encodings', p.encodings);

        sender.setParameters(p).then(function () {
          _this7.logger.info("".concat(sender.track.kind, " set bitrate to ").concat(bitrate * 1000, " success"));
        }, function (error) {
          _this7.logger.warn("".concat(sender.track.kind, " set bitrate error"), error);
        });
      });
    }
    /**
    * 设置 替换本地流的Track
    */

  }, {
    key: "replaceMediaStreamTrack",
    value: function replaceMediaStreamTrack(t) {
      var _this8 = this;

      this.logger.info('replace mediaStream Track', t);

      if (this.peerConnection && t) {
        (this.peerConnection.getSenders() || []).forEach(function (e) {
          if (t.kind === 'audio' && e.track && e.track.kind === 'audio') {
            e.replaceTrack(t);

            var _track = _this8.localStream.getAudioTracks()[0];

            _track && _this8.localStream.removeTrack(_track);
            _track && _this8.localStream.addTrack(t);
          }

          if (t.kind === 'video' && e.track && e.track.kind === 'video') {
            e.replaceTrack(t);

            var _track2 = _this8.localStream.getVideoTracks()[0];

            _track2 && _this8.localStream.removeTrack(_track2);
            _track2 && _this8.localStream.addTrack(t);
          }
        });
      }

      var track = t.kind === 'audio' ? this.localStream.getAudioTracks()[0] : this.localStream.getVideoTracks()[0];
      track && this.localStream.removeTrack(track);
      track && this.localStream.addTrack(t);
    }
    /**
     * 构建发布流的参数
     */

  }, {
    key: "buildPublishParams",
    value: function buildPublishParams() {
      var _this9 = this;

      var _ref2 = this.options || {},
          hasAudio = _ref2.hasAudio,
          hasVideo = _ref2.hasVideo,
          screen = _ref2.screen;

      var publishParams = {
        streamType: StreamType.ForwardStream,
        streamKind: hasAudio && hasVideo ? StreamKind.AudioVideo : hasAudio ? StreamKind.AudioOnly : hasVideo ? StreamKind.VideoOnly : StreamKind.Invalid,
        params: {
          offerSdp: '',
          audioInfo: {
            source: screen ? AudioSourceType.ScreenShare : AudioSourceType.Microphone,
            muted: !hasAudio,
            floor: true
          },
          videoInfo: {
            source: screen ? VideoSourceType.ScreenShare : VideoSourceType.Camera,
            muted: !hasVideo,
            floor: true
          }
        },
        cb: function cb(code, message, data) {
          if (code === RESPONSE_CODE.SUCCESS) {
            _this9.setRemoteDesc(data.answer_sdp, data.streamId).then(function () {
              _this9.options.onPublish && _this9.options.onPublish(code, message, data);
            })["catch"](function (err) {
              _this9.options.onPublish && _this9.options.onPublish(RESPONSE_CODE.ERROR, err, data);
            });
          } else {
            _this9.options.onPublish && _this9.options.onPublish(code, message, data);
          }
        },
        updateCb: function updateCb() {}
      };
      var _this$options = this.options,
          isEnableSmallStream = _this$options.isEnableSmallStream,
          smallStreamConfig = _this$options.smallStreamConfig; // 允许大小流

      var simulcastStream = [];

      if (isEnableSmallStream && !screen) {
        this.logger.info('publish width height', this.captureVideoWidth, this.captureVideoHeight);

        if (this.captureVideoWidth > 0 && this.captureVideoHeight > 0) {
          var h = {
            type: SimulcastType.BigStream,
            maxWidth: this.captureVideoWidth,
            maxHeight: this.captureVideoHeight
          };
          var l = {
            type: SimulcastType.SmallStream,
            maxWidth: smallStreamConfig.width,
            maxHeight: smallStreamConfig.height
          };
          simulcastStream.push(h);
          simulcastStream.push(l);
        }

        publishParams.params.videoInfo['simulcast'] = simulcastStream;
      }

      return publishParams;
    }
    /**
     * 获取当前网络传输状况统计数据
     */

  }, {
    key: "getTransportStats",
    value: function () {
      var _getTransportStats = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4() {
        var _this10 = this;

        return regenerator.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt("return", new Promise(function (resolve, reject) {
                  if (_this10.peerConnection) {
                    var transport;
                    var senders = _this10.peerConnection.getSenders() || [];
                    var sender = senders[0];

                    if (sender) {
                      sender.getStats().then(function (st) {
                        transport = _this10.getSenderStats({
                          send: st,
                          mediaType: sender.track.kind
                        });
                        resolve(transport);
                      }, function (e) {
                        _this10.logger.error('Get transport stats error', e);

                        reject(e.message);
                      });
                    }
                  }
                }));

              case 1:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function getTransportStats() {
        return _getTransportStats.apply(this, arguments);
      }

      return getTransportStats;
    }()
    /**
     * 
     * @param 获取当前已发布本地流的音频|视频统计数据
     * @returns 
     */

  }, {
    key: "getLocalStats",
    value: function () {
      var _getLocalStats = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee5(type) {
        var _this11 = this;

        return regenerator.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt("return", new Promise(function (resolve, reject) {
                  if (_this11.peerConnection) {
                    var stats;
                    var senders = _this11.peerConnection.getSenders() || [];
                    var sender = senders.find(function (_) {
                      return _.track.kind === type;
                    });

                    if (sender) {
                      sender.getStats().then(function (st) {
                        stats = _this11.getSenderStats({
                          send: st,
                          mediaType: type
                        });
                        resolve(stats);
                      })["catch"](function (err) {
                        reject(err.message);
                      });
                    }
                  }
                }));

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function getLocalStats(_x4) {
        return _getLocalStats.apply(this, arguments);
      }

      return getLocalStats;
    }()
    /**
     * 获取数据统计
     * @param mediaType
     */

  }, {
    key: "getSenderStats",
    value: function getSenderStats(e) {
      var stats = {
        audio: {
          bytesSent: 0,
          packetsSent: 0,
          retransmittedPacketsSent: 0
        },
        video: {
          bytesSent: 0,
          packetsSent: 0,
          framesEncoded: 0,
          frameWidth: 0,
          frameHeight: 0,
          framesSent: 0,
          retransmittedPacketsSent: 0,
          framesPerSecond: 0,
          rid: null
        },
        smallVideo: {
          bytesSent: 0,
          packetsSent: 0,
          framesEncoded: 0,
          frameWidth: 0,
          frameHeight: 0,
          framesSent: 0,
          retransmittedPacketsSent: 0,
          framesPerSecond: 0,
          rid: null
        },
        rtt: 0,
        timestamp: 0
      };
      e.send.forEach(function (s) {
        if (s.type === "outbound-rtp") {
          stats.timestamp = s.timestamp;

          if (e.mediaType === "video" && s.rid === 'l') {
            if (s.bytesSent === 0) return;
            stats.smallVideo = _objectSpread$5(_objectSpread$5({}, stats.smallVideo), {}, {
              bytesSent: s.bytesSent,
              packetsSent: s.packetsSent,
              framesEncoded: s.framesEncoded,
              retransmittedPacketsSent: s.retransmittedPacketsSent,
              framesPerSecond: s.framesPerSecond,
              frameWidth: s.frameWidth,
              frameHeight: s.frameHeight,
              framesSent: s.framesSent,
              rid: s.rid
            });
          } else if (e.mediaType === "video") {
            if (s.bytesSent === 0) return;
            stats.video = _objectSpread$5(_objectSpread$5({}, stats.video), {}, {
              bytesSent: s.bytesSent,
              packetsSent: s.packetsSent,
              framesEncoded: s.framesEncoded,
              retransmittedPacketsSent: s.retransmittedPacketsSent,
              framesPerSecond: s.framesPerSecond,
              frameWidth: s.frameWidth,
              frameHeight: s.frameHeight,
              framesSent: s.framesSent,
              rid: s.rid
            });
          } else if (e.mediaType === "audio") {
            stats.audio = {
              bytesSent: s.bytesSent,
              packetsSent: s.packetsSent,
              retransmittedPacketsSent: s.retransmittedPacketsSent
            };
          }
        } else if (s.type === "candidate-pair") {
          "number" == typeof s.currentRoundTripTime && (stats.rtt = 1e3 * s.currentRoundTripTime);
        }
      });
      return stats;
    }
    /**
     * 注册 peerConnection 断开事件
     * 
     */

  }, {
    key: "onPublishPeerConnectionFailed",
    value: function onPublishPeerConnectionFailed(callback) {
      this._emitter.on(PUBLISH_ICE_STATE, callback);
    }
    /**
     * 上传RTCPeerConnection 质量和性能的统计信息
     */

  }, {
    key: "getRTCIceCandidatePairStats",
    value: function getRTCIceCandidatePairStats() {
      var _this12 = this;

      if (this.peerConnection) {
        this.peerConnection.getStats().then(function (res) {
          res.forEach(function (e) {
            if (e.type === 'candidate-pair') {
              _this12.logger.warn('publish RTCIceCandidatePairStats', JSON.stringify(e, null, 4));
            }
          });
        });
      }
    }
  }]);

  return PublishStream;
}();

function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$4(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var SubscribeManager = /*#__PURE__*/function () {
  function SubscribeManager(logger) {
    _classCallCheck(this, SubscribeManager);

    this.subscribedStreams = new Map();
    this.subscriptedOptions = new Map();
    this.subscriptedState = new Map();
    this.logger = logger;
  }
  /**
   * 添加订阅记录
   * @param userId string
   * @param stream Stream.RemoteStream
   * @param opts ClientIfe.SubscribeOptions
   */


  _createClass(SubscribeManager, [{
    key: "addSubscriptionRecord",
    value: function addSubscriptionRecord(userId, stream) {
      this.subscribedStreams.set(userId, stream);
    }
    /**
     * 设置订阅参数
     * @param userId string
     * @param opts ClientIfe.SubscribeOptions
     */

  }, {
    key: "setSubscriptionOpts",
    value: function setSubscriptionOpts(userId, opts) {
      this.logger.debug('set subscribe options:', opts);
      this.subscriptedOptions.set(userId, opts);
    }
    /**
     * 获取订阅参数
     * @param userId 
     * @param return  
     */

  }, {
    key: "getSubscriptionOpts",
    value: function getSubscriptionOpts(userId) {
      return this.subscriptedOptions.get(userId) || {
        audio: true,
        video: true,
        small: false
      };
    }
    /**
     * 更新订阅状态
     * @param userId string
     * @param state ClientIfe.SubscribeOptions
     */

  }, {
    key: "updateSubscriptedState",
    value: function updateSubscriptedState(userId, state) {
      var subState = _objectSpread$4(_objectSpread$4({}, this.getSubscriptedState(userId)), state);

      this.subscriptedState.set(userId, subState);
      this.logger.info('-----> update subscribe state <----------', userId, subState);
    }
    /**
     * 获取订阅状态
     * @param userId 
     * @return opts ClientIfe.SubscribeOptions
     */

  }, {
    key: "getSubscriptedState",
    value: function getSubscriptedState(userId) {
      return this.subscriptedState.get(userId) || {
        audio: false,
        video: false,
        small: false
      };
    }
    /**
     * 需要订阅类型
     * @param userId string
     * @returns number
     */

  }, {
    key: "needSubscribeKind",
    value: function needSubscribeKind(userId) {
      var state = this.subscriptedState.get(userId) || {
        audio: false,
        video: false
      };
      var options = this.subscriptedOptions.get(userId) || {
        audio: false,
        video: false
      };
      this.logger.debug('subscribe state', state);
      this.logger.debug('subscribe options:', options);

      if (options.audio && !state.audio && options.video && !state.video) {
        return StreamKind$1.AudioVideo;
      }

      if (options.audio && !state.audio) {
        return StreamKind$1.AudioOnly;
      }

      if (options.video && !state.video) {
        return StreamKind$1.VideoOnly;
      }
    }
    /**
     * 重置
     */

  }, {
    key: "reset",
    value: function reset(userId) {
      if (userId) {
        this.subscriptedState["delete"](userId);
        this.subscribedStreams["delete"](userId);
        this.subscriptedOptions["delete"](userId);
        return;
      }

      this.subscriptedState.clear();
      this.subscribedStreams.clear();
      this.subscriptedOptions.clear();
    }
  }]);

  return SubscribeManager;
}();

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray$7(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray$7(arr) || _nonIterableSpread();
}

var grammar_1 = createCommonjsModule(function (module) {
var grammar = module.exports = {
  v: [{
    name: 'version',
    reg: /^(\d*)$/
  }],
  o: [{
    // o=- 20518 0 IN IP4 203.0.113.1
    // NB: sessionId will be a String in most cases because it is huge
    name: 'origin',
    reg: /^(\S*) (\d*) (\d*) (\S*) IP(\d) (\S*)/,
    names: ['username', 'sessionId', 'sessionVersion', 'netType', 'ipVer', 'address'],
    format: '%s %s %d %s IP%d %s'
  }],
  // default parsing of these only (though some of these feel outdated)
  s: [{ name: 'name' }],
  i: [{ name: 'description' }],
  u: [{ name: 'uri' }],
  e: [{ name: 'email' }],
  p: [{ name: 'phone' }],
  z: [{ name: 'timezones' }], // TODO: this one can actually be parsed properly...
  r: [{ name: 'repeats' }],   // TODO: this one can also be parsed properly
  // k: [{}], // outdated thing ignored
  t: [{
    // t=0 0
    name: 'timing',
    reg: /^(\d*) (\d*)/,
    names: ['start', 'stop'],
    format: '%d %d'
  }],
  c: [{
    // c=IN IP4 10.47.197.26
    name: 'connection',
    reg: /^IN IP(\d) (\S*)/,
    names: ['version', 'ip'],
    format: 'IN IP%d %s'
  }],
  b: [{
    // b=AS:4000
    push: 'bandwidth',
    reg: /^(TIAS|AS|CT|RR|RS):(\d*)/,
    names: ['type', 'limit'],
    format: '%s:%s'
  }],
  m: [{
    // m=video 51744 RTP/AVP 126 97 98 34 31
    // NB: special - pushes to session
    // TODO: rtp/fmtp should be filtered by the payloads found here?
    reg: /^(\w*) (\d*) ([\w/]*)(?: (.*))?/,
    names: ['type', 'port', 'protocol', 'payloads'],
    format: '%s %d %s %s'
  }],
  a: [
    {
      // a=rtpmap:110 opus/48000/2
      push: 'rtp',
      reg: /^rtpmap:(\d*) ([\w\-.]*)(?:\s*\/(\d*)(?:\s*\/(\S*))?)?/,
      names: ['payload', 'codec', 'rate', 'encoding'],
      format: function (o) {
        return (o.encoding)
          ? 'rtpmap:%d %s/%s/%s'
          : o.rate
            ? 'rtpmap:%d %s/%s'
            : 'rtpmap:%d %s';
      }
    },
    {
      // a=fmtp:108 profile-level-id=24;object=23;bitrate=64000
      // a=fmtp:111 minptime=10; useinbandfec=1
      push: 'fmtp',
      reg: /^fmtp:(\d*) ([\S| ]*)/,
      names: ['payload', 'config'],
      format: 'fmtp:%d %s'
    },
    {
      // a=control:streamid=0
      name: 'control',
      reg: /^control:(.*)/,
      format: 'control:%s'
    },
    {
      // a=rtcp:65179 IN IP4 193.84.77.194
      name: 'rtcp',
      reg: /^rtcp:(\d*)(?: (\S*) IP(\d) (\S*))?/,
      names: ['port', 'netType', 'ipVer', 'address'],
      format: function (o) {
        return (o.address != null)
          ? 'rtcp:%d %s IP%d %s'
          : 'rtcp:%d';
      }
    },
    {
      // a=rtcp-fb:98 trr-int 100
      push: 'rtcpFbTrrInt',
      reg: /^rtcp-fb:(\*|\d*) trr-int (\d*)/,
      names: ['payload', 'value'],
      format: 'rtcp-fb:%s trr-int %d'
    },
    {
      // a=rtcp-fb:98 nack rpsi
      push: 'rtcpFb',
      reg: /^rtcp-fb:(\*|\d*) ([\w-_]*)(?: ([\w-_]*))?/,
      names: ['payload', 'type', 'subtype'],
      format: function (o) {
        return (o.subtype != null)
          ? 'rtcp-fb:%s %s %s'
          : 'rtcp-fb:%s %s';
      }
    },
    {
      // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
      // a=extmap:1/recvonly URI-gps-string
      // a=extmap:3 urn:ietf:params:rtp-hdrext:encrypt urn:ietf:params:rtp-hdrext:smpte-tc 25@600/24
      push: 'ext',
      reg: /^extmap:(\d+)(?:\/(\w+))?(?: (urn:ietf:params:rtp-hdrext:encrypt))? (\S*)(?: (\S*))?/,
      names: ['value', 'direction', 'encrypt-uri', 'uri', 'config'],
      format: function (o) {
        return (
          'extmap:%d' +
          (o.direction ? '/%s' : '%v') +
          (o['encrypt-uri'] ? ' %s' : '%v') +
          ' %s' +
          (o.config ? ' %s' : '')
        );
      }
    },
    {
      // a=extmap-allow-mixed
      name: 'extmapAllowMixed',
      reg: /^(extmap-allow-mixed)/
    },
    {
      // a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:PS1uQCVeeCFCanVmcjkpPywjNWhcYD0mXXtxaVBR|2^20|1:32
      push: 'crypto',
      reg: /^crypto:(\d*) ([\w_]*) (\S*)(?: (\S*))?/,
      names: ['id', 'suite', 'config', 'sessionConfig'],
      format: function (o) {
        return (o.sessionConfig != null)
          ? 'crypto:%d %s %s %s'
          : 'crypto:%d %s %s';
      }
    },
    {
      // a=setup:actpass
      name: 'setup',
      reg: /^setup:(\w*)/,
      format: 'setup:%s'
    },
    {
      // a=connection:new
      name: 'connectionType',
      reg: /^connection:(new|existing)/,
      format: 'connection:%s'
    },
    {
      // a=mid:1
      name: 'mid',
      reg: /^mid:([^\s]*)/,
      format: 'mid:%s'
    },
    {
      // a=msid:0c8b064d-d807-43b4-b434-f92a889d8587 98178685-d409-46e0-8e16-7ef0db0db64a
      name: 'msid',
      reg: /^msid:(.*)/,
      format: 'msid:%s'
    },
    {
      // a=ptime:20
      name: 'ptime',
      reg: /^ptime:(\d*(?:\.\d*)*)/,
      format: 'ptime:%d'
    },
    {
      // a=maxptime:60
      name: 'maxptime',
      reg: /^maxptime:(\d*(?:\.\d*)*)/,
      format: 'maxptime:%d'
    },
    {
      // a=sendrecv
      name: 'direction',
      reg: /^(sendrecv|recvonly|sendonly|inactive)/
    },
    {
      // a=ice-lite
      name: 'icelite',
      reg: /^(ice-lite)/
    },
    {
      // a=ice-ufrag:F7gI
      name: 'iceUfrag',
      reg: /^ice-ufrag:(\S*)/,
      format: 'ice-ufrag:%s'
    },
    {
      // a=ice-pwd:x9cml/YzichV2+XlhiMu8g
      name: 'icePwd',
      reg: /^ice-pwd:(\S*)/,
      format: 'ice-pwd:%s'
    },
    {
      // a=fingerprint:SHA-1 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33
      name: 'fingerprint',
      reg: /^fingerprint:(\S*) (\S*)/,
      names: ['type', 'hash'],
      format: 'fingerprint:%s %s'
    },
    {
      // a=candidate:0 1 UDP 2113667327 203.0.113.1 54400 typ host
      // a=candidate:1162875081 1 udp 2113937151 192.168.34.75 60017 typ host generation 0 network-id 3 network-cost 10
      // a=candidate:3289912957 2 udp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 generation 0 network-id 3 network-cost 10
      // a=candidate:229815620 1 tcp 1518280447 192.168.150.19 60017 typ host tcptype active generation 0 network-id 3 network-cost 10
      // a=candidate:3289912957 2 tcp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 tcptype passive generation 0 network-id 3 network-cost 10
      push:'candidates',
      reg: /^candidate:(\S*) (\d*) (\S*) (\d*) (\S*) (\d*) typ (\S*)(?: raddr (\S*) rport (\d*))?(?: tcptype (\S*))?(?: generation (\d*))?(?: network-id (\d*))?(?: network-cost (\d*))?/,
      names: ['foundation', 'component', 'transport', 'priority', 'ip', 'port', 'type', 'raddr', 'rport', 'tcptype', 'generation', 'network-id', 'network-cost'],
      format: function (o) {
        var str = 'candidate:%s %d %s %d %s %d typ %s';

        str += (o.raddr != null) ? ' raddr %s rport %d' : '%v%v';

        // NB: candidate has three optional chunks, so %void middles one if it's missing
        str += (o.tcptype != null) ? ' tcptype %s' : '%v';

        if (o.generation != null) {
          str += ' generation %d';
        }

        str += (o['network-id'] != null) ? ' network-id %d' : '%v';
        str += (o['network-cost'] != null) ? ' network-cost %d' : '%v';
        return str;
      }
    },
    {
      // a=end-of-candidates (keep after the candidates line for readability)
      name: 'endOfCandidates',
      reg: /^(end-of-candidates)/
    },
    {
      // a=remote-candidates:1 203.0.113.1 54400 2 203.0.113.1 54401 ...
      name: 'remoteCandidates',
      reg: /^remote-candidates:(.*)/,
      format: 'remote-candidates:%s'
    },
    {
      // a=ice-options:google-ice
      name: 'iceOptions',
      reg: /^ice-options:(\S*)/,
      format: 'ice-options:%s'
    },
    {
      // a=ssrc:2566107569 cname:t9YU8M1UxTF8Y1A1
      push: 'ssrcs',
      reg: /^ssrc:(\d*) ([\w_-]*)(?::(.*))?/,
      names: ['id', 'attribute', 'value'],
      format: function (o) {
        var str = 'ssrc:%d';
        if (o.attribute != null) {
          str += ' %s';
          if (o.value != null) {
            str += ':%s';
          }
        }
        return str;
      }
    },
    {
      // a=ssrc-group:FEC 1 2
      // a=ssrc-group:FEC-FR 3004364195 1080772241
      push: 'ssrcGroups',
      // token-char = %x21 / %x23-27 / %x2A-2B / %x2D-2E / %x30-39 / %x41-5A / %x5E-7E
      reg: /^ssrc-group:([\x21\x23\x24\x25\x26\x27\x2A\x2B\x2D\x2E\w]*) (.*)/,
      names: ['semantics', 'ssrcs'],
      format: 'ssrc-group:%s %s'
    },
    {
      // a=msid-semantic: WMS Jvlam5X3SX1OP6pn20zWogvaKJz5Hjf9OnlV
      name: 'msidSemantic',
      reg: /^msid-semantic:\s?(\w*) (\S*)/,
      names: ['semantic', 'token'],
      format: 'msid-semantic: %s %s' // space after ':' is not accidental
    },
    {
      // a=group:BUNDLE audio video
      push: 'groups',
      reg: /^group:(\w*) (.*)/,
      names: ['type', 'mids'],
      format: 'group:%s %s'
    },
    {
      // a=rtcp-mux
      name: 'rtcpMux',
      reg: /^(rtcp-mux)/
    },
    {
      // a=rtcp-rsize
      name: 'rtcpRsize',
      reg: /^(rtcp-rsize)/
    },
    {
      // a=sctpmap:5000 webrtc-datachannel 1024
      name: 'sctpmap',
      reg: /^sctpmap:([\w_/]*) (\S*)(?: (\S*))?/,
      names: ['sctpmapNumber', 'app', 'maxMessageSize'],
      format: function (o) {
        return (o.maxMessageSize != null)
          ? 'sctpmap:%s %s %s'
          : 'sctpmap:%s %s';
      }
    },
    {
      // a=x-google-flag:conference
      name: 'xGoogleFlag',
      reg: /^x-google-flag:([^\s]*)/,
      format: 'x-google-flag:%s'
    },
    {
      // a=rid:1 send max-width=1280;max-height=720;max-fps=30;depend=0
      push: 'rids',
      reg: /^rid:([\d\w]+) (\w+)(?: ([\S| ]*))?/,
      names: ['id', 'direction', 'params'],
      format: function (o) {
        return (o.params) ? 'rid:%s %s %s' : 'rid:%s %s';
      }
    },
    {
      // a=imageattr:97 send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320] recv [x=330,y=250]
      // a=imageattr:* send [x=800,y=640] recv *
      // a=imageattr:100 recv [x=320,y=240]
      push: 'imageattrs',
      reg: new RegExp(
        // a=imageattr:97
        '^imageattr:(\\d+|\\*)' +
        // send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320]
        '[\\s\\t]+(send|recv)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*)' +
        // recv [x=330,y=250]
        '(?:[\\s\\t]+(recv|send)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*))?'
      ),
      names: ['pt', 'dir1', 'attrs1', 'dir2', 'attrs2'],
      format: function (o) {
        return 'imageattr:%s %s %s' + (o.dir2 ? ' %s %s' : '');
      }
    },
    {
      // a=simulcast:send 1,2,3;~4,~5 recv 6;~7,~8
      // a=simulcast:recv 1;4,5 send 6;7
      name: 'simulcast',
      reg: new RegExp(
        // a=simulcast:
        '^simulcast:' +
        // send 1,2,3;~4,~5
        '(send|recv) ([a-zA-Z0-9\\-_~;,]+)' +
        // space + recv 6;~7,~8
        '(?:\\s?(send|recv) ([a-zA-Z0-9\\-_~;,]+))?' +
        // end
        '$'
      ),
      names: ['dir1', 'list1', 'dir2', 'list2'],
      format: function (o) {
        return 'simulcast:%s %s' + (o.dir2 ? ' %s %s' : '');
      }
    },
    {
      // old simulcast draft 03 (implemented by Firefox)
      //   https://tools.ietf.org/html/draft-ietf-mmusic-sdp-simulcast-03
      // a=simulcast: recv pt=97;98 send pt=97
      // a=simulcast: send rid=5;6;7 paused=6,7
      name: 'simulcast_03',
      reg: /^simulcast:[\s\t]+([\S+\s\t]+)$/,
      names: ['value'],
      format: 'simulcast: %s'
    },
    {
      // a=framerate:25
      // a=framerate:29.97
      name: 'framerate',
      reg: /^framerate:(\d+(?:$|\.\d+))/,
      format: 'framerate:%s'
    },
    {
      // RFC4570
      // a=source-filter: incl IN IP4 239.5.2.31 10.1.15.5
      name: 'sourceFilter',
      reg: /^source-filter: *(excl|incl) (\S*) (IP4|IP6|\*) (\S*) (.*)/,
      names: ['filterMode', 'netType', 'addressTypes', 'destAddress', 'srcList'],
      format: 'source-filter: %s %s %s %s %s'
    },
    {
      // a=bundle-only
      name: 'bundleOnly',
      reg: /^(bundle-only)/
    },
    {
      // a=label:1
      name: 'label',
      reg: /^label:(.+)/,
      format: 'label:%s'
    },
    {
      // RFC version 26 for SCTP over DTLS
      // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-5
      name: 'sctpPort',
      reg: /^sctp-port:(\d+)$/,
      format: 'sctp-port:%s'
    },
    {
      // RFC version 26 for SCTP over DTLS
      // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-6
      name: 'maxMessageSize',
      reg: /^max-message-size:(\d+)$/,
      format: 'max-message-size:%s'
    },
    {
      // RFC7273
      // a=ts-refclk:ptp=IEEE1588-2008:39-A7-94-FF-FE-07-CB-D0:37
      push:'tsRefClocks',
      reg: /^ts-refclk:([^\s=]*)(?:=(\S*))?/,
      names: ['clksrc', 'clksrcExt'],
      format: function (o) {
        return 'ts-refclk:%s' + (o.clksrcExt != null ? '=%s' : '');
      }
    },
    {
      // RFC7273
      // a=mediaclk:direct=963214424
      name:'mediaClk',
      reg: /^mediaclk:(?:id=(\S*))? *([^\s=]*)(?:=(\S*))?(?: *rate=(\d+)\/(\d+))?/,
      names: ['id', 'mediaClockName', 'mediaClockValue', 'rateNumerator', 'rateDenominator'],
      format: function (o) {
        var str = 'mediaclk:';
        str += (o.id != null ? 'id=%s %s' : '%v%s');
        str += (o.mediaClockValue != null ? '=%s' : '');
        str += (o.rateNumerator != null ? ' rate=%s' : '');
        str += (o.rateDenominator != null ? '/%s' : '');
        return str;
      }
    },
    {
      // a=keywds:keywords
      name: 'keywords',
      reg: /^keywds:(.+)$/,
      format: 'keywds:%s'
    },
    {
      // a=content:main
      name: 'content',
      reg: /^content:(.+)/,
      format: 'content:%s'
    },
    // BFCP https://tools.ietf.org/html/rfc4583
    {
      // a=floorctrl:c-s
      name: 'bfcpFloorCtrl',
      reg: /^floorctrl:(c-only|s-only|c-s)/,
      format: 'floorctrl:%s'
    },
    {
      // a=confid:1
      name: 'bfcpConfId',
      reg: /^confid:(\d+)/,
      format: 'confid:%s'
    },
    {
      // a=userid:1
      name: 'bfcpUserId',
      reg: /^userid:(\d+)/,
      format: 'userid:%s'
    },
    {
      // a=floorid:1
      name: 'bfcpFloorId',
      reg: /^floorid:(.+) (?:m-stream|mstrm):(.+)/,
      names: ['id', 'mStream'],
      format: 'floorid:%s mstrm:%s'
    },
    {
      // any a= that we don't understand is kept verbatim on media.invalid
      push: 'invalid',
      names: ['value']
    }
  ]
};

// set sensible defaults to avoid polluting the grammar with boring details
Object.keys(grammar).forEach(function (key) {
  var objs = grammar[key];
  objs.forEach(function (obj) {
    if (!obj.reg) {
      obj.reg = /(.*)/;
    }
    if (!obj.format) {
      obj.format = '%s';
    }
  });
});
});

var parser = createCommonjsModule(function (module, exports) {
var toIntIfInt = function (v) {
  return String(Number(v)) === v ? Number(v) : v;
};

var attachProperties = function (match, location, names, rawName) {
  if (rawName && !names) {
    location[rawName] = toIntIfInt(match[1]);
  }
  else {
    for (var i = 0; i < names.length; i += 1) {
      if (match[i+1] != null) {
        location[names[i]] = toIntIfInt(match[i+1]);
      }
    }
  }
};

var parseReg = function (obj, location, content) {
  var needsBlank = obj.name && obj.names;
  if (obj.push && !location[obj.push]) {
    location[obj.push] = [];
  }
  else if (needsBlank && !location[obj.name]) {
    location[obj.name] = {};
  }
  var keyLocation = obj.push ?
    {} :  // blank object that will be pushed
    needsBlank ? location[obj.name] : location; // otherwise, named location or root

  attachProperties(content.match(obj.reg), keyLocation, obj.names, obj.name);

  if (obj.push) {
    location[obj.push].push(keyLocation);
  }
};


var validLine = RegExp.prototype.test.bind(/^([a-z])=(.*)/);

exports.parse = function (sdp) {
  var session = {}
    , media = []
    , location = session; // points at where properties go under (one of the above)

  // parse lines we understand
  sdp.split(/(\r\n|\r|\n)/).filter(validLine).forEach(function (l) {
    var type = l[0];
    var content = l.slice(2);
    if (type === 'm') {
      media.push({rtp: [], fmtp: []});
      location = media[media.length-1]; // point at latest media line
    }

    for (var j = 0; j < (grammar_1[type] || []).length; j += 1) {
      var obj = grammar_1[type][j];
      if (obj.reg.test(content)) {
        return parseReg(obj, location, content);
      }
    }
  });

  session.media = media; // link it up
  return session;
};

var paramReducer = function (acc, expr) {
  var s = expr.split(/=(.+)/, 2);
  if (s.length === 2) {
    acc[s[0]] = toIntIfInt(s[1]);
  } else if (s.length === 1 && expr.length > 1) {
    acc[s[0]] = undefined;
  }
  return acc;
};

exports.parseParams = function (str) {
  return str.split(/;\s?/).reduce(paramReducer, {});
};

// For backward compatibility - alias will be removed in 3.0.0
exports.parseFmtpConfig = exports.parseParams;

exports.parsePayloads = function (str) {
  return str.toString().split(' ').map(Number);
};

exports.parseRemoteCandidates = function (str) {
  var candidates = [];
  var parts = str.split(' ').map(toIntIfInt);
  for (var i = 0; i < parts.length; i += 3) {
    candidates.push({
      component: parts[i],
      ip: parts[i + 1],
      port: parts[i + 2]
    });
  }
  return candidates;
};

exports.parseImageAttributes = function (str) {
  return str.split(' ').map(function (item) {
    return item.substring(1, item.length-1).split(',').reduce(paramReducer, {});
  });
};

exports.parseSimulcastStreamList = function (str) {
  return str.split(';').map(function (stream) {
    return stream.split(',').map(function (format) {
      var scid, paused = false;

      if (format[0] !== '~') {
        scid = toIntIfInt(format);
      } else {
        scid = toIntIfInt(format.substring(1, format.length));
        paused = true;
      }

      return {
        scid: scid,
        paused: paused
      };
    });
  });
};
});

// customized util.format - discards excess arguments and can void middle ones
var formatRegExp = /%[sdv%]/g;
var format = function (formatStr) {
  var i = 1;
  var args = arguments;
  var len = args.length;
  return formatStr.replace(formatRegExp, function (x) {
    if (i >= len) {
      return x; // missing argument
    }
    var arg = args[i];
    i += 1;
    switch (x) {
    case '%%':
      return '%';
    case '%s':
      return String(arg);
    case '%d':
      return Number(arg);
    case '%v':
      return '';
    }
  });
  // NB: we discard excess arguments - they are typically undefined from makeLine
};

var makeLine = function (type, obj, location) {
  var str = obj.format instanceof Function ?
    (obj.format(obj.push ? location : location[obj.name])) :
    obj.format;

  var args = [type + '=' + str];
  if (obj.names) {
    for (var i = 0; i < obj.names.length; i += 1) {
      var n = obj.names[i];
      if (obj.name) {
        args.push(location[obj.name][n]);
      }
      else { // for mLine and push attributes
        args.push(location[obj.names[i]]);
      }
    }
  }
  else {
    args.push(location[obj.name]);
  }
  return format.apply(null, args);
};

// RFC specified order
// TODO: extend this with all the rest
var defaultOuterOrder = [
  'v', 'o', 's', 'i',
  'u', 'e', 'p', 'c',
  'b', 't', 'r', 'z', 'a'
];
var defaultInnerOrder = ['i', 'c', 'b', 'a'];


var writer = function (session, opts) {
  opts = opts || {};
  // ensure certain properties exist
  if (session.version == null) {
    session.version = 0; // 'v=0' must be there (only defined version atm)
  }
  if (session.name == null) {
    session.name = ' '; // 's= ' must be there if no meaningful name set
  }
  session.media.forEach(function (mLine) {
    if (mLine.payloads == null) {
      mLine.payloads = '';
    }
  });

  var outerOrder = opts.outerOrder || defaultOuterOrder;
  var innerOrder = opts.innerOrder || defaultInnerOrder;
  var sdp = [];

  // loop through outerOrder for matching properties on session
  outerOrder.forEach(function (type) {
    grammar_1[type].forEach(function (obj) {
      if (obj.name in session && session[obj.name] != null) {
        sdp.push(makeLine(type, obj, session));
      }
      else if (obj.push in session && session[obj.push] != null) {
        session[obj.push].forEach(function (el) {
          sdp.push(makeLine(type, obj, el));
        });
      }
    });
  });

  // then for each media line, follow the innerOrder
  session.media.forEach(function (mLine) {
    sdp.push(makeLine('m', grammar_1.m[0], mLine));

    innerOrder.forEach(function (type) {
      grammar_1[type].forEach(function (obj) {
        if (obj.name in mLine && mLine[obj.name] != null) {
          sdp.push(makeLine(type, obj, mLine));
        }
        else if (obj.push in mLine && mLine[obj.push] != null) {
          mLine[obj.push].forEach(function (el) {
            sdp.push(makeLine(type, obj, el));
          });
        }
      });
    });
  });

  return sdp.join('\r\n') + '\r\n';
};

var write = writer;
var parse = parser.parse;
parser.parseParams;
parser.parseFmtpConfig; // Alias of parseParams().
var parsePayloads = parser.parsePayloads;
parser.parseRemoteCandidates;
parser.parseImageAttributes;
parser.parseSimulcastStreamList;

function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$3(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper$6(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$6(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$6(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$6(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$6(o, minLen); }

function _arrayLikeToArray$6(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var SubscribeState;

(function (SubscribeState) {
  SubscribeState[SubscribeState["Create"] = 0] = "Create";
  SubscribeState[SubscribeState["Subscribing"] = 1] = "Subscribing";
  SubscribeState[SubscribeState["Subscribed"] = 2] = "Subscribed";
  SubscribeState[SubscribeState["Unsubscribed"] = 3] = "Unsubscribed";
})(SubscribeState || (SubscribeState = {}));

var SubscribeStream = /*#__PURE__*/function () {
  function SubscribeStream(options) {
    _classCallCheck(this, SubscribeStream);

    this.options = options;
    this.userId = options.userId;
    this.logger = options.logger;
    this.xsigoClient = options.xsigoClient || null;
    this.roomId = options.roomId;
    this.peerConnection = new RTCPeerConnection({
      sdpSemantics: 'unified-plan'
    });
    this.peerConnection.onnegotiationneeded = this.onNegotiationNeeded.bind(this);
    this.peerConnection.ontrack = this.onTrack.bind(this);
    this.state = SubscribeState.Create;
    this.subscriptionId = null;
    this._emitter = new EventEmitter();
    this._interval = -1;
  }
  /**
   * 获取订阅状态
   * @returns 
   */


  _createClass(SubscribeStream, [{
    key: "getState",
    value: function getState() {
      return this.state;
    }
    /**
     * 订阅流
     * @returns boolen
     */

  }, {
    key: "subscribe",
    value: function subscribe() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.logger.info('start subscribing to the stream');

        _this.state = SubscribeState.Subscribing;

        _this.addTransceiver();

        _this.createOffer();

        _this.peerConnection.onconnectionstatechange = _this.onConnectionstatechange.bind(_this, 'subscribe');
        var str = '';

        _this.peerConnection.onicecandidate = function (e) {
          var candidate = e.candidate;

          _this.logger.info("peercConnection subscribe IceCandidate data:\n ".concat((candidate === null || candidate === void 0 ? void 0 : candidate.candidate) || ''));

          if (candidate !== null && candidate !== void 0 && candidate.candidate) {
            str = str + 'a=' + candidate.candidate + '\r\n';
          }

          if (!candidate) {
            // 断网这边一直在等待
            var offer = _this.peerConnection.pendingLocalDescription;
            var sdp = offer.sdp; // 兼容safari 浏览器sdp 不包含 candidate 信息

            if (!sdp.includes('a=candidate')) {
              sdp = sdp + str;
            }

            var subscribeParams = _this.buildSubscribeParams();

            subscribeParams.params.offerSdp = sdp;

            _this.logger.info('=======subscribe offer========', sdp);

            _this.subscriptionId = _this.xsigoClient.subscribeStream(_this.roomId, subscribeParams);
            resolve(_this.subscriptionId);
          }
        };
      });
    }
    /**
    * `重新订阅流
    * @returns boolen
    */

  }, {
    key: "resubscribe",
    value: function resubscribe() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.logger.info('resubscribe stream', _this2.subscriptionId);

        _this2.close();

        _this2.peerConnection = new RTCPeerConnection({
          sdpSemantics: 'unified-plan'
        });
        _this2.state = SubscribeState.Subscribing;

        _this2.addTransceiver();

        _this2.createOffer();

        _this2.peerConnection.onconnectionstatechange = _this2.onConnectionstatechange.bind(_this2, 'resubscribe');
        _this2.peerConnection.ontrack = _this2.onTrack.bind(_this2);

        _this2.peerConnection.onicecandidate = function (e) {
          _this2.logger.info("peercConnection subscribe IceCandidate data:\n ".concat(e.candidate ? e.candidate.candidate : ""));

          if (!e.candidate) {
            var offer = _this2.peerConnection.pendingLocalDescription;
            resolve(offer);
          }
        };
      });
    }
    /**
     * 取消订阅
     * @param remoteAnswer 
     */

  }, {
    key: "unsubscribe",
    value: function unsubscribe(cb) {
      var _this3 = this;

      this.logger.info('unsubscribe subscriptionId', this.subscriptionId);

      var callback = function callback(code, message, data) {
        if (code === RESPONSE_CODE.SUCCESS) {
          _this3.state = SubscribeState.Unsubscribed;

          _this3.close();
        }

        cb(code, message, data);
      };

      this.xsigoClient.unsubscribeStream(this.roomId, this.subscriptionId, callback);
    }
    /**
     *更新订阅的大小流
     * @returns string
     */

  }, {
    key: "switchSimulcast",
    value: function switchSimulcast(type, cb) {
      this.xsigoClient.switchSimulcast(this.roomId, this.subscriptionId, {
        type: type
      }, cb);
    }
    /**
     * 设置远程描述
     * @param remoteAnswer 远程描述
     */

  }, {
    key: "setRemoteDescription",
    value: function setRemoteDescription(remoteAnswer) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        _this4.logger.info("=======subscribe answer========\n" + remoteAnswer);

        var answer = {
          sdp: remoteAnswer,
          type: "answer"
        };

        _this4.peerConnection.setRemoteDescription(answer).then(function () {
          _this4.state = SubscribeState.Subscribed;
          resolve(true);
        })["catch"](function (err) {
          _this4.logger.error('subscribe setRemoteDescription error', err);

          reject(err);
        });
      });
    }
    /**
    * 监听状态
    * @param track 
    */

  }, {
    key: "onConnectionstatechange",
    value: function onConnectionstatechange(type) {
      var _this5 = this;

      if (['failed', 'connected'].includes(this.peerConnection.connectionState)) {
        this._emitter.emit(SUBSCRIBE_ICE_STATE, {
          state: this.peerConnection.connectionState,
          subscriptionId: this.subscriptionId
        });
      }

      this.logger.info("peerConnection ".concat(type, " ICE State: ").concat(this.peerConnection.connectionState));

      if (this.peerConnection.connectionState === 'connecting') {
        if (this._interval === -1) {
          this._interval = window.setInterval(function () {
            _this5.getRTCIceCandidatePairStats();
          }, 2 * 1000);
        }
      } else {
        clearInterval(this._interval);
        this._interval === -1;
      }
    }
    /**
    * 过滤编码方式
    * @param track MediaStreamTrack
    */

  }, {
    key: "addTransceiver",
    value: function addTransceiver() {
      if (this.options.hasAudio) {
        var transceiver = this.peerConnection.addTransceiver("audio", {
          direction: "recvonly"
        });

        if (RTCRtpSender.getCapabilities) {
          var customCodecs = [];
          var codecCaps = RTCRtpSender.getCapabilities("audio");
          codecCaps.codecs.forEach(function (codec) {
            if (codec.mimeType.indexOf('opus') != -1) {
              customCodecs.push(codec);
            }
          });

          if (transceiver.setCodecPreferences && typeof transceiver.setCodecPreferences === 'function') {
            transceiver.setCodecPreferences(customCodecs);
          }
        }
      }

      if (this.options.hasVideo) {
        var _transceiver = this.peerConnection.addTransceiver("video", {
          direction: "recvonly"
        });

        if (RTCRtpSender.getCapabilities) {
          var _customCodecs = [];

          var _codecCaps = RTCRtpSender.getCapabilities("video");

          _codecCaps.codecs.forEach(function (codec) {
            if (codec.mimeType.indexOf('H264') != -1) {
              _customCodecs.push(codec);
            }
          });

          if (_transceiver.setCodecPreferences && typeof _transceiver.setCodecPreferences === 'function') {
            _transceiver.setCodecPreferences(_customCodecs);
          }
        }
      }
    }
    /**
     * createOffer
     */

  }, {
    key: "createOffer",
    value: function createOffer() {
      var _this6 = this;

      this.peerConnection.createOffer().then(this.onGotOffer.bind(this))["catch"](function (error) {
        _this6.logger.error('create offer error', error);

        _this6.state = SubscribeState.Create;
      });
    }
  }, {
    key: "onGotOffer",
    value: function onGotOffer(desc) {
      var _this7 = this;

      // this.logger.info("=======old ========\n" + desc.sdp);
      var sd = parse(desc.sdp);

      var _iterator = _createForOfIteratorHelper$6(sd.media),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var m = _step.value;
          var payloadTypes = parsePayloads(m.payloads);

          var _iterator2 = _createForOfIteratorHelper$6(payloadTypes),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var pt = _step2.value;
              m.rtcpFb = m.rtcpFb ? [].concat(_toConsumableArray(m.rtcpFb), [{
                payload: pt,
                type: "rrtr"
              }]) : [{
                payload: pt,
                type: "rrtr"
              }];
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var new_desc = {
        sdp: write(sd),
        type: "offer"
      }; // this.logger.info("=======new ========\n" + new_desc.sdp);

      this.peerConnection.setLocalDescription(new_desc).then(function () {
        _this7.logger.info('Set local description success', _this7.subscriptionId);
      })["catch"](function (error) {
        _this7.logger.error('Set local description failure', error);
      });
    }
  }, {
    key: "onNegotiationNeeded",
    value: function onNegotiationNeeded() {
      this.logger.info("onNegotiationneeded--");
    }
  }, {
    key: "onTrack",
    value: function onTrack(event) {
      this.logger.debug('on track return');

      var _ref = this.options || {},
          audioStreamId = _ref.audioStreamId,
          videoStreamId = _ref.videoStreamId;
          _ref.publisherUserId;
          var hasAudio = _ref.hasAudio,
          hasVideo = _ref.hasVideo;
      var type = hasAudio && hasVideo ? StreamKind.AudioVideo : hasAudio ? StreamKind.AudioOnly : StreamKind.VideoOnly;
      var mediaStream = event.streams[0];
      var track = event.track;

      if (audioStreamId) {
        this.options.onRemoteStream(mediaStream, track, type);
      } else if (videoStreamId) {
        this.options.onRemoteStream(mediaStream, track, type);
      } else {
        this.logger.info("not audio or video");
      }
    }
    /**
     *  获取 peerConnection
     * @returns peerConnection
     */

  }, {
    key: "getPeerConnection",
    value: function getPeerConnection() {
      return this.peerConnection;
    }
  }, {
    key: "close",
    value: function close() {
      this.peerConnection.onicecandidate = null;
      this.peerConnection.onnegotiationneeded = null;
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.ontrack = null;
      this.peerConnection.close();
      this.peerConnection = null;
      this._interval && clearInterval(this._interval);
      this._interval === -1;
      this.logger.info('close subscribe stream peerConnection subscriptionId', this.subscriptionId);
    }
    /**
    * 构建发布流的参数
    */

  }, {
    key: "buildSubscribeParams",
    value: function buildSubscribeParams() {
      var _this8 = this;

      var _ref2 = this.options || {},
          hasAudio = _ref2.hasAudio,
          hasVideo = _ref2.hasVideo,
          publisherUserId = _ref2.publisherUserId,
          simulcast = _ref2.simulcast,
          audioStreamId = _ref2.audioStreamId,
          videoStreamId = _ref2.videoStreamId,
          small = _ref2.small;

      var params = {
        publisherUserId: publisherUserId,
        streamId: hasAudio ? audioStreamId : videoStreamId,
        streamKind: hasAudio && hasVideo ? StreamKind.AudioVideo : hasAudio ? StreamKind.AudioOnly : StreamKind.VideoOnly,
        params: {
          offerSdp: '',
          hasAudio: hasAudio,
          hasVideo: hasVideo,
          type: (simulcast === null || simulcast === void 0 ? void 0 : simulcast.length) > 0 && simulcast[0].type
        },
        cb: function cb(code, message, data) {
          if (code === RESPONSE_CODE.SUCCESS) {
            _this8.setRemoteDescription(data.answer_sdp).then(function () {
              _this8.options.onSubscribe && _this8.options.onSubscribe(code, message, data);
            })["catch"](function (err) {
              _this8.options.onSubscribe && _this8.options.onSubscribe(RESPONSE_CODE.ERROR, err, data);
            });
          } else {
            _this8.options.onSubscribe && _this8.options.onSubscribe(code, message, data);
          }
        },
        updateCb: function updateCb() {}
      };

      if (small && hasVideo) {
        var hasSmall = (simulcast || []).find(function (e) {
          return e.type === SimulcastType.SmallStream;
        });

        if (hasSmall) {
          params.params.type = SimulcastType.SmallStream;
        } else {
          this.logger.warn('does not publish small stream');
        }
      }

      return params;
    }
    /**
     * 获取当前网络传输状况统计数据
     */

  }, {
    key: "getTransportStats",
    value: function () {
      var _getTransportStats = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
        var _this9 = this;

        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  if (_this9.peerConnection) {
                    var receivers = _this9.peerConnection.getReceivers() || [];
                    var receiver = receivers[0];

                    if (receiver) {
                      receiver.getStats().then(function (st) {
                        var transport = _this9.getReceiverStats({
                          send: st,
                          mediaType: receiver.track.kind
                        });

                        resolve(transport.rtt);
                      })["catch"](function (err) {
                        reject(err);
                      });
                    }
                  }
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function getTransportStats() {
        return _getTransportStats.apply(this, arguments);
      }

      return getTransportStats;
    }()
    /**
    * 获取当前音频或视频统计数据
    */

  }, {
    key: "getRemoteAudioOrVideoStats",
    value: function getRemoteAudioOrVideoStats(type) {
      var _this10 = this;

      return new Promise(function (resolve, reject) {
        if (_this10.peerConnection) {
          var receiver = _this10.peerConnection.getReceivers().find(function (_) {
            return _.track.kind === type;
          });

          if (receiver) {
            receiver.getStats().then(function (st) {
              var stats = _this10.getReceiverStats({
                send: st,
                mediaType: type
              });

              resolve(stats);
            })["catch"](function (err) {
              reject(err);
            });
          }
        }
      });
    }
    /**
    * 获取远程数据统计
    * @param e
    */

  }, {
    key: "getReceiverStats",
    value: function getReceiverStats(e) {
      var stats = {
        audio: {
          bytesReceived: 0,
          packetsReceived: 0,
          packetsLost: 0,
          nackCount: 0
        },
        video: {
          bytesReceived: 0,
          packetsReceived: 0,
          packetsLost: 0,
          framesDecoded: 0,
          frameWidth: 0,
          frameHeight: 0,
          framesPerSecond: 0,
          nackCount: 0
        },
        rtt: 0,
        timestamp: 0
      };
      e.send.forEach(function (s) {
        if (s.type === "inbound-rtp") {
          stats.timestamp = s.timestamp;

          if (e.mediaType === "audio") {
            stats.audio = {
              bytesReceived: s.bytesReceived,
              packetsReceived: s.packetsReceived,
              packetsLost: s.packetsLost,
              nackCount: s.nackCount
            };
          } else {
            if (s.bytesReceived === 0) return;
            stats.video = _objectSpread$3(_objectSpread$3({}, stats.video), {}, {
              bytesReceived: s.bytesReceived,
              packetsReceived: s.packetsReceived,
              packetsLost: s.packetsLost,
              framesDecoded: s.framesDecoded,
              framesPerSecond: s.framesPerSecond,
              nackCount: s.nackCount
            });
          }
        } else if (s.type === "track" && s.frameWidth !== void 0) {
          stats.video = _objectSpread$3(_objectSpread$3({}, stats.video), {}, {
            frameWidth: s.frameWidth,
            frameHeight: s.frameHeight
          });
        } else if (s.type === "candidate-pair") {
          "number" == typeof s.currentRoundTripTime && (stats.rtt = 1e3 * s.currentRoundTripTime);
        }
      });
      return stats;
    }
    /**
    * 注册 peerConnection 断开事件
    * 
    */

  }, {
    key: "onSubscribePeerConnectionFailed",
    value: function onSubscribePeerConnectionFailed(callback) {
      this._emitter.on(SUBSCRIBE_ICE_STATE, callback);
    }
    /**
     * 上传RTCPeerConnection 质量和性能的统计信息
     */

  }, {
    key: "getRTCIceCandidatePairStats",
    value: function getRTCIceCandidatePairStats() {
      var _this11 = this;

      if (this.peerConnection) {
        this.peerConnection.getStats().then(function (res) {
          res.forEach(function (e) {
            if (e.type === 'candidate-pair') {
              _this11.logger.warn('subscribe RTCIceCandidatePairStats', JSON.stringify(e, null, 4));
            }
          });
        });
      }
    }
  }]);

  return SubscribeStream;
}();

function _createForOfIteratorHelper$5(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$5(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$5(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$5(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$5(o, minLen); }

function _arrayLikeToArray$5(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

//================================================================================================
function getSimulcastFromMessage(infos) {
  var simulcast = new Array();

  var _iterator = _createForOfIteratorHelper$5(infos),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var info = _step.value;
      var ridInfo = {
        type: getSimulcastTypeFromRidStr(info.rid),
        maxWidth: info.maxWidth,
        maxHeight: info.maxHeight
      };
      simulcast.push(ridInfo);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return simulcast;
} //=============================================================================================

function getStreamFromLoginMessage(s) {
  var stream = {
    userId: s.userId,
    streamId: s.streamId,
    type: getStreamTypeFromStreamTypeStr(s.type)
  };

  if (s.info) {
    stream.info = {};

    if (s.info.audio) {
      stream.info.audio = {
        source: getAudioSourceTypeFromStr(s.info.audio.source),
        muted: s.info.audio.muted,
        floor: s.info.audio.floor
      };
    }

    if (s.info.video) {
      stream.info.video = {
        source: getVideoSourceTypeFromStr(s.info.video.source),
        muted: s.info.video.muted,
        floor: s.info.video.floor
      };

      if (s.info.video.simulcast) {
        stream.info.video.simulcast = getSimulcastFromMessage(s.info.video.simulcast);
      }
    }
  }

  return stream;
}
function getStreamFromStreamAddMessage(s) {
  var stream = {
    userId: s.userId,
    streamId: s.streamId,
    type: getStreamTypeFromStreamTypeStr(s.data.type)
  };

  if (s.data.media.info) {
    stream.info = {};

    if (s.data.media.info.audio) {
      stream.info.audio = {
        source: getAudioSourceTypeFromStr(s.data.media.info.audio.source),
        muted: s.data.media.info.audio.muted,
        floor: s.data.media.info.audio.floor
      };
    }

    if (s.data.media.info.video) {
      stream.info.video = {
        source: getVideoSourceTypeFromStr(s.data.media.info.video.source),
        muted: s.data.media.info.video.muted,
        floor: s.data.media.info.video.floor
      };

      if (s.data.media.info.video.simulcast) {
        stream.info.video.simulcast = getSimulcastFromMessage(s.data.media.info.video.simulcast);
      }
    }
  }

  return stream;
}

/*
 * roomState
 *
 *  Created on: Jun 18, 2021
 *      Author: sxtang
 */
var State$3;

(function (State) {
  State[State["Created"] = 0] = "Created";
  State[State["Entering"] = 1] = "Entering";
  State[State["EnterFailed"] = 2] = "EnterFailed";
  State[State["EnterTimeout"] = 3] = "EnterTimeout";
  State[State["Entered"] = 4] = "Entered";
  State[State["Exiting"] = 5] = "Exiting";
  State[State["ExitFailed"] = 6] = "ExitFailed";
  State[State["ExitTimeout"] = 7] = "ExitTimeout";
  State[State["Exited"] = 8] = "Exited";
  State[State["Destroyed"] = 9] = "Destroyed";
  State[State["StateMax"] = 10] = "StateMax";
})(State$3 || (State$3 = {}));

var roomStateNames = ["Created", "Entering", "EnterFailed", "EnterTimeout", "Entered", "Exiting", "ExitTimeout", "Exited"];
var RoomState = /*#__PURE__*/function () {
  function RoomState(logger) {
    _classCallCheck(this, RoomState);

    this.currentState = State$3.Created;
    this.stateTransformTable = new Array();
    this.logger = logger;
    this.initStateTransformTable();
  }

  _createClass(RoomState, [{
    key: "setState",
    value: function setState(newState) {
      if (!this.checkStateChange(this.currentState, newState)) {
        this.logger.error("RoomState : INVALID state change from " + roomStateNames[this.currentState] + " to " + roomStateNames[newState]);
        return false;
      }

      this.logger.info("RoomState : state change from " + roomStateNames[this.currentState] + " to " + roomStateNames[newState]);
      this.currentState = newState;
      return true;
    }
  }, {
    key: "state",
    value: function state() {
      return this.currentState;
    }
  }, {
    key: "checkStateChange",
    value: function checkStateChange(oldState, newState) {
      return this.stateTransformTable[oldState][newState];
    }
  }, {
    key: "initStateTransformTable",
    value: function initStateTransformTable() {
      for (var i = State$3.Created; i < State$3.StateMax; i++) {
        this.stateTransformTable[i] = new Array();

        for (var j = State$3.Created; j < State$3.StateMax; j++) {
          this.stateTransformTable[i][j] = false;
        }
      }

      this.stateTransformTable[State$3.Created][State$3.Entering] = true;
      this.stateTransformTable[State$3.Created][State$3.Destroyed] = true;
      this.stateTransformTable[State$3.Entering][State$3.Entered] = true;
      this.stateTransformTable[State$3.Entering][State$3.EnterFailed] = true;
      this.stateTransformTable[State$3.Entering][State$3.EnterTimeout] = true;
      this.stateTransformTable[State$3.Entering][State$3.Destroyed] = true;
      this.stateTransformTable[State$3.EnterFailed][State$3.Destroyed] = true;
      this.stateTransformTable[State$3.EnterTimeout][State$3.Destroyed] = true;
      this.stateTransformTable[State$3.Entered][State$3.Exiting] = true;
      this.stateTransformTable[State$3.Entered][State$3.Exiting] = true; // when we receive drop notification

      this.stateTransformTable[State$3.Entered][State$3.Destroyed] = true;
      this.stateTransformTable[State$3.Exiting][State$3.Exited] = true;
      this.stateTransformTable[State$3.Exiting][State$3.Destroyed] = true;
      this.stateTransformTable[State$3.Exited][State$3.Destroyed] = true;
    }
  }]);

  return RoomState;
}();

/*
 * loginState
 *
 *  Created on: Jun 18, 2021
 *      Author: sxtang
 */
var State$2;

(function (State) {
  State[State["New"] = 0] = "New";
  State[State["Logining"] = 1] = "Logining";
  State[State["LoginFailed"] = 2] = "LoginFailed";
  State[State["LoginTimeout"] = 3] = "LoginTimeout";
  State[State["Logined"] = 4] = "Logined";
  State[State["Relogining"] = 5] = "Relogining";
  State[State["Relogined"] = 6] = "Relogined";
  State[State["Logouting"] = 7] = "Logouting";
  State[State["LogoutTimeout"] = 8] = "LogoutTimeout";
  State[State["Logouted"] = 9] = "Logouted";
  State[State["Destroyed"] = 10] = "Destroyed";
  State[State["StateMax"] = 11] = "StateMax";
})(State$2 || (State$2 = {}));

var loginStateNames = ["New", "Logining", "LoginFailed", "LoginTimeout", "Logined", "Relogining", "Relogined", "Logouting", "LogoutTimeout", "Logouted", "Destroy"];
var LoginState = /*#__PURE__*/function () {
  function LoginState(logger) {
    _classCallCheck(this, LoginState);

    this.currentState = State$2.New;
    this.stateTransformTable = new Array();
    this.logger = logger;
    this.initStateTransformTable();
  }

  _createClass(LoginState, [{
    key: "setState",
    value: function setState(newState) {
      if (!this.checkStateChange(this.currentState, newState)) {
        this.logger.error("Login : INVALID state change from " + loginStateNames[this.currentState] + " to " + loginStateNames[newState]);
        return false;
      }

      this.logger.info("Login : state change from " + loginStateNames[this.currentState] + " to " + loginStateNames[newState]);
      this.currentState = newState;
      return true;
    }
  }, {
    key: "state",
    value: function state() {
      return this.currentState;
    }
  }, {
    key: "checkStateChange",
    value: function checkStateChange(oldState, newState) {
      return this.stateTransformTable[oldState][newState];
    }
  }, {
    key: "initStateTransformTable",
    value: function initStateTransformTable() {
      for (var i = State$2.New; i < State$2.StateMax; i++) {
        this.stateTransformTable[i] = new Array();

        for (var j = State$2.New; j < State$2.StateMax; j++) {
          this.stateTransformTable[i][j] = false;
        }
      }

      this.stateTransformTable[State$2.New][State$2.Logining] = true;
      this.stateTransformTable[State$2.New][State$2.Destroyed] = true;
      this.stateTransformTable[State$2.Logining][State$2.Logined] = true;
      this.stateTransformTable[State$2.Logining][State$2.LoginFailed] = true;
      this.stateTransformTable[State$2.Logining][State$2.LoginTimeout] = true;
      this.stateTransformTable[State$2.Logining][State$2.Destroyed] = true;
      this.stateTransformTable[State$2.LoginFailed][State$2.Destroyed] = true;
      this.stateTransformTable[State$2.LoginTimeout][State$2.Destroyed] = true;
      this.stateTransformTable[State$2.Logined][State$2.Logouting] = true;
      this.stateTransformTable[State$2.Logined][State$2.Relogining] = true;
      this.stateTransformTable[State$2.Logined][State$2.Destroyed] = true;
      this.stateTransformTable[State$2.Relogining][State$2.Relogining] = true; // last relogin not receive response, coontecionagin lost, then we again relogin

      this.stateTransformTable[State$2.Relogining][State$2.Relogined] = true;
      this.stateTransformTable[State$2.Relogining][State$2.Logined] = true; // relogin error response received, recover to last logined state

      this.stateTransformTable[State$2.Relogining][State$2.Destroyed] = true;
      this.stateTransformTable[State$2.Relogined][State$2.Relogining] = true;
      this.stateTransformTable[State$2.Relogined][State$2.Logouting] = true;
      this.stateTransformTable[State$2.Relogined][State$2.Destroyed] = true;
      this.stateTransformTable[State$2.Logouting][State$2.Logouted] = true;
      this.stateTransformTable[State$2.Logouting][State$2.LogoutTimeout] = true;
      this.stateTransformTable[State$2.Logouting][State$2.Destroyed] = true;
      this.stateTransformTable[State$2.Logouted][State$2.Destroyed] = true;
    }
  }]);

  return LoginState;
}();

function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$2(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var LoginResult;

(function (LoginResult) {
  LoginResult[LoginResult["LoginSuccess"] = 0] = "LoginSuccess";
  LoginResult[LoginResult["LoginTimeout"] = 1] = "LoginTimeout";
  LoginResult[LoginResult["LoginFailed"] = 2] = "LoginFailed";
})(LoginResult || (LoginResult = {}));
var LogoutResult;

(function (LogoutResult) {
  LogoutResult[LogoutResult["LogoutSuccess"] = 0] = "LogoutSuccess";
  LogoutResult[LogoutResult["LogoutTimeout"] = 1] = "LogoutTimeout";
  LogoutResult[LogoutResult["LogoutFailed"] = 2] = "LogoutFailed";
})(LogoutResult || (LogoutResult = {}));
var Login = /*#__PURE__*/function () {
  // caching request params, used when relogin
  function Login(options) {
    _classCallCheck(this, Login);

    this.options = options;
    this.state = new LoginState(options.logger);
    this.connectionStatus = ConnectionStatus.New;
    this.timeout = 5 * 1000;
  }

  _createClass(Login, [{
    key: "login",
    value: function login() {
      var _this = this;

      if (!this.state.setState(State$2.Logining)) {
        return;
      }

      this.options.logger.info("Login room: ".concat(this.options.roomId));
      var timer = null;
      this.buildLoginReuqest(); // send login request message

      var loginRequest = {
        method: "login",
        params: this.loginRequestParams
      };

      var onSuccess = function onSuccess(response) {
        if (!_this.state.setState(State$2.Logined)) {
          return;
        }

        clearTimeout(timer);

        if (_this.options.loginCb) {
          var _ref = response.result,
              room = _ref.room;
          var _result = {
            room: _objectSpread$2(_objectSpread$2({}, room), {}, {
              roomUniqueId: room.roomUniqueId || room.roomId,
              participants: room.participants || [],
              streams: room.streams || []
            })
          };

          _this.options.loginCb(LoginResult.LoginSuccess, _result);
        }
      };

      var onError = function onError(response) {
        if (!_this.state.setState(State$2.LoginFailed)) {
          return;
        }

        clearTimeout(timer);

        if (_this.options.loginCb) {
          _this.options.loginCb(LoginResult.LoginFailed, null, response.error.message);
        }
      }; // start a timer to check login timeout


      if (!timer) {
        timer = setTimeout(function () {
          _this.options.logger.info("login timeout: ".concat(_this.options.roomId));

          if (!_this.state.setState(State$2.LoginTimeout)) {
            return;
          }

          if (_this.options.loginCb) {
            _this.options.loginCb(LoginResult.LoginTimeout, null, 'login timeout');
          }
        }, this.timeout);
      }

      if (!this.options.rpcClient.sendRequest(loginRequest, onSuccess, onError)) {
        this.options.logger.error("Json Rpc Client send login request error");
      }
    }
  }, {
    key: "logout",
    value: function logout() {
      var _this2 = this;

      if (!this.state.setState(State$2.Logouting)) {
        return;
      }

      this.options.logger.info("Logout room: ".concat(this.options.roomId));
      var timer = null;
      var logoutRequest = {
        method: "logout"
      };

      var onSuccess = function onSuccess(response) {
        if (!_this2.state.setState(State$2.Logouted)) {
          return;
        }

        clearTimeout(timer);

        if (_this2.options.logoutCb) {
          _this2.options.logoutCb(LogoutResult.LogoutSuccess);
        }
      };

      var onError = function onError(response) {
        if (!_this2.state.setState(State$2.LoginFailed)) {
          return;
        }

        clearTimeout(timer);

        if (_this2.options.logoutCb) {
          _this2.options.logoutCb(LogoutResult.LogoutFailed, response.error.message);
        }
      };

      if (!this.options.rpcClient.sendRequest(logoutRequest, onSuccess, onError)) {
        this.options.logger.error("Json Rpc Client send loginout request error");
      } // start a timer to check logout timeout


      if (!timer) {
        timer = setTimeout(function () {
          _this2.options.logger.info("logout timeout: ".concat(_this2.options.roomId));

          if (!_this2.state.setState(State$2.LogoutTimeout)) {
            return;
          }

          clearTimeout(timer);

          if (_this2.options.logoutCb) {
            _this2.options.logoutCb(LogoutResult.LogoutTimeout, 'logout timeout');
          }
        }, this.timeout);
      }
    }
  }, {
    key: "relogin",
    value: function relogin() {
      var _this3 = this;

      if (!this.state.setState(State$2.Relogining)) {
        return;
      }

      this.buildLoginReuqest();
      this.options.logger.info("Relogin room: ".concat(this.options.roomId));
      var reloginRequest = {
        method: "login",
        params: this.loginRequestParams
      };

      var onSuccess = function onSuccess(response) {
        if (!_this3.state.setState(State$2.Relogined)) {
          return;
        }

        if (_this3.options.reloginCb) {
          var _ref2 = response.result,
              room = _ref2.room;
          var _result2 = {
            room: _objectSpread$2(_objectSpread$2({}, room), {}, {
              roomUniqueId: room.roomUniqueId || room.roomId,
              participants: room.participants || [],
              streams: room.streams || []
            })
          };

          _this3.options.reloginCb(true, room.sessionTimeout, _result2);
        }
      };

      var onError = function onError(response) {
        _this3.options.logger.info('relogining failed');
      };

      if (!this.options.rpcClient.sendRequest(reloginRequest, onSuccess, onError)) {
        this.options.logger.error("Json Rpc Client send relogin request error");
      }
    } // 更新角色权限

  }, {
    key: "updatePermission",
    value: function updatePermission(permission) {
      this.options.permission = permission;
    } // called by room

  }, {
    key: "onConnectionLost",
    value: function onConnectionLost() {
      this.connectionStatus = ConnectionStatus.ConnectionLost;
    } // called by room

  }, {
    key: "onConnectionRecovery",
    value: function onConnectionRecovery() {
      this.connectionStatus = ConnectionStatus.ConnectionRecovery;
      this.relogin();
    }
  }, {
    key: "buildLoginReuqest",
    value: function buildLoginReuqest() {
      this.loginRequestParams = {
        appId: this.options.appId,
        userId: this.options.userId,
        type: this.options.userType,
        roomId: this.options.roomId,
        previousRoomId: this.options.previousRoomId,
        permission: this.options.permission,
        userAgent: this.options.userAgent,
        userData: this.options.userData,
        protocol: "1.0"
      };
    }
  }]);

  return Login;
}();

/*
 * publicationState
 *
 *  Created on: Jun 18, 2021
 *      Author: sxtang
 */
var State$1;

(function (State) {
  State[State["Create"] = 0] = "Create";
  State[State["Publishing"] = 1] = "Publishing";
  State[State["Published"] = 2] = "Published";
  State[State["Republishing"] = 3] = "Republishing";
  State[State["Republished"] = 4] = "Republished";
  State[State["Unpublishing"] = 5] = "Unpublishing";
  State[State["Unpublished"] = 6] = "Unpublished";
  State[State["Destroyed"] = 7] = "Destroyed";
  State[State["StateMax"] = 8] = "StateMax";
})(State$1 || (State$1 = {}));

var publicationStateNames = ["Create", "Publishing", "Published", "Republishing", "Republished", "Unpublishing", "Unpublished", "Destroy"];
var PublicationState = /*#__PURE__*/function () {
  function PublicationState(logger) {
    _classCallCheck(this, PublicationState);

    this.currentState = State$1.Create;
    this.stateTransformTable = new Array();
    this.logger = logger;
    this.initStateTransformTable();
  }

  _createClass(PublicationState, [{
    key: "setState",
    value: function setState(newState) {
      if (!this.checkStateChange(this.currentState, newState)) {
        this.logger.error("PublicationState : INVALID state change from" + publicationStateNames[this.currentState] + " to " + publicationStateNames[newState]);
        return false;
      }

      this.logger.info("PublicationState : state change from " + publicationStateNames[this.currentState] + " to " + publicationStateNames[newState]);
      this.currentState = newState;
      return true;
    }
  }, {
    key: "state",
    value: function state() {
      return this.currentState;
    }
  }, {
    key: "checkStateChange",
    value: function checkStateChange(oldState, newState) {
      return this.stateTransformTable[oldState][newState];
    }
  }, {
    key: "initStateTransformTable",
    value: function initStateTransformTable() {
      for (var i = State$1.Create; i < State$1.StateMax; i++) {
        this.stateTransformTable[i] = new Array();

        for (var j = State$1.Create; j < State$1.StateMax; j++) {
          this.stateTransformTable[i][j] = false;
        }
      }

      this.stateTransformTable[State$1.Create][State$1.Publishing] = true;
      this.stateTransformTable[State$1.Create][State$1.Destroyed] = true;
      this.stateTransformTable[State$1.Publishing][State$1.Published] = true;
      this.stateTransformTable[State$1.Publishing][State$1.Unpublishing] = true;
      this.stateTransformTable[State$1.Publishing][State$1.Destroyed] = true;
      this.stateTransformTable[State$1.Publishing][State$1.Republishing] = true;
      this.stateTransformTable[State$1.Published][State$1.Unpublishing] = true;
      this.stateTransformTable[State$1.Published][State$1.Republishing] = true;
      this.stateTransformTable[State$1.Published][State$1.Destroyed] = true;
      this.stateTransformTable[State$1.Republishing][State$1.Republishing] = true; // last republish not receive response, coontecionagin lost, then we again republish when recovery

      this.stateTransformTable[State$1.Republishing][State$1.Republished] = true;
      this.stateTransformTable[State$1.Republishing][State$1.Unpublishing] = true;
      this.stateTransformTable[State$1.Republishing][State$1.Published] = true; // republish error response received, recover to last logined state

      this.stateTransformTable[State$1.Republishing][State$1.Destroyed] = true;
      this.stateTransformTable[State$1.Republished][State$1.Republishing] = true;
      this.stateTransformTable[State$1.Republished][State$1.Unpublishing] = true;
      this.stateTransformTable[State$1.Republished][State$1.Destroyed] = true;
      this.stateTransformTable[State$1.Unpublishing][State$1.Unpublished] = true;
      this.stateTransformTable[State$1.Unpublishing][State$1.Destroyed] = true;
      this.stateTransformTable[State$1.Unpublished][State$1.Destroyed] = true;
    }
  }]);

  return PublicationState;
}();

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var Publication = /*#__PURE__*/function () {
  // operation when connection lost and have not recovery
  function Publication(options) {
    _classCallCheck(this, Publication);

    this.options = options;
    this.state = new PublicationState(options.logger);
    this.connectionStatus = ConnectionStatus.ConnectionConnected;

    if (options.stream.info) {
      if (options.stream.info.audio && options.stream.info.video) {
        this.streamKind = StreamKind.AudioVideo;
        this.audioMuteWanted = this.options.stream.info.audio.muted;
        this.simulcastWanted = this.options.stream.info.video.simulcast;
        this.videoMuteWanted = this.options.stream.info.video.muted;
      } else if (options.stream.info.audio) {
        this.streamKind = StreamKind.AudioOnly;
        this.audioMuteWanted = this.options.stream.info.audio.muted;
      } else if (options.stream.info.video) {
        this.streamKind = StreamKind.VideoOnly;
        this.simulcastWanted = this.options.stream.info.video.simulcast;
        this.videoMuteWanted = this.options.stream.info.video.muted;
      } else {
        this.options.logger.warn("now not support mix");
      }
    }
  }

  _createClass(Publication, [{
    key: "publish",
    value: function publish() {
      this.options.logger.info("Publish stream: ".concat(this.options.stream.streamId));

      if (!this.state.setState(State$1.Publishing)) {
        return;
      }

      var rpcClientSate = this.options.rpcClient.getWsState().state;

      if (['CONNECTED', 'RECOVERY'].includes(rpcClientSate)) {
        this.doPublish();
      }
    }
  }, {
    key: "unpublish",
    value: function unpublish(cb) {
      this.options.logger.info("Unpublish stream: " + this.options.stream.streamId);

      if (!this.state.setState(State$1.Unpublishing)) {
        return;
      }

      this.unpublishCb = cb;
      var rpcClientSate = this.options.rpcClient.getWsState().state;

      if (['CONNECTED', 'RECOVERY'].includes(rpcClientSate)) {
        this.doUnpublish(cb);
      } else {
        this.options.logger.info("websocketState: ".concat(rpcClientSate, ", unpublish has been cached"));
      }
    }
    /**
     * 更新大小流
     * @param simulcast 
     */

  }, {
    key: "updateSimulcast",
    value: function updateSimulcast(simulcast, cb) {
      this.simulcastWanted = simulcast;
      this.updateSimulcastCb = cb;
      var rpcClientSate = this.options.rpcClient.getWsState().state;
      var pubState = this.state.state();

      if (['CONNECTED', 'RECOVERY'].includes(rpcClientSate)) {
        if (pubState === State$1.Republished || pubState === State$1.Published) {
          this.doUpdateSimulcast(cb);
        } else {
          this.options.logger.info("publicationState: ".concat(rpcClientSate, ",updateSimulcast has been cached"));
        }
      } else {
        this.options.logger.info("websocketState: ".concat(rpcClientSate, ",updateSimulcast has been cached"));
      }
    }
    /**
     * 静音
     * @param streamId 流的唯一标识
     * @param userId  用户的唯一标识
     * @param cb  回调函数
     */

  }, {
    key: "muteAudio",
    value: function muteAudio(userId, cb, userData) {
      // 1、首先判断发布的状态，容错
      // 2、改变 audioMuteWanted 的值 
      // 3、在成功的回调中修改 this.options.stream.info.audio.muted = this.audioMuteWanted;
      // 4、网络不好的或者没发布的情况不可以操作
      // 5、在网络恢复后或者发布成功后进行操作
      this.audioMuteWanted = true;
      this.muteAudioOption = {
        userId: userId,
        cb: cb,
        userData: userData
      };
      var rpcClientSate = this.options.rpcClient.getWsState().state;
      var pubState = this.state.state();

      if (['CONNECTED', 'RECOVERY'].includes(rpcClientSate)) {
        if (pubState === State$1.Republished || pubState === State$1.Published) {
          this.control(userId, 'mute', cb, userData);
        } else {
          this.options.logger.info("publicationState: ".concat(rpcClientSate, ",muteAudio has been cached"));
        }
      } else {
        this.options.logger.info("websocketState: ".concat(rpcClientSate, ",muteAudio has been cached"));
      }
    }
  }, {
    key: "muteVideo",
    value: function muteVideo(userId, cb, userData) {
      this.videoMuteWanted = true;
      this.muteVideoOption = {
        userId: userId,
        cb: cb,
        userData: userData
      };
      var rpcClientSate = this.options.rpcClient.getWsState().state;
      var pubState = this.state.state();

      if (['CONNECTED', 'RECOVERY'].includes(rpcClientSate)) {
        if (pubState === State$1.Republished || pubState === State$1.Published) {
          this.control(userId, 'vmute', cb, userData);
        } else {
          this.options.logger.info("publicationState: ".concat(rpcClientSate, ",muteVideo has been cached"));
        }
      } else {
        this.options.logger.info("websocketState: ".concat(rpcClientSate, ",muteVideo has been cached"));
      }
    }
  }, {
    key: "unmuteAudio",
    value: function unmuteAudio(userId, cb, userData) {
      this.audioMuteWanted = false;
      this.unmuteAudioOption = {
        userId: userId,
        cb: cb,
        userData: userData
      };
      var rpcClientSate = this.options.rpcClient.getWsState().state;
      var pubState = this.state.state();

      if (['CONNECTED', 'RECOVERY'].includes(rpcClientSate)) {
        if (pubState === State$1.Republished || pubState === State$1.Published) {
          this.control(userId, 'unmute', cb, userData);
        } else {
          this.options.logger.info("publicationState: ".concat(rpcClientSate, ",unmuteAudio has been cached"));
        }
      } else {
        this.options.logger.info("websocketState: ".concat(rpcClientSate, ",unmuteAudio has been cached"));
      }
    }
  }, {
    key: "unmuteVideo",
    value: function unmuteVideo(userId, cb, userData) {
      this.videoMuteWanted = false;
      this.unmuteVideoOPtion = {
        userId: userId,
        cb: cb,
        userData: userData
      };
      var rpcClientSate = this.options.rpcClient.getWsState().state;
      var pubState = this.state.state();

      if (['CONNECTED', 'RECOVERY'].includes(rpcClientSate)) {
        if (pubState === State$1.Republished || pubState === State$1.Published) {
          this.control(userId, 'unvmute', cb, userData);
        } else {
          this.options.logger.info("publicationState: ".concat(rpcClientSate, ",unmuteVideo has been cached"));
        }
      } else {
        this.options.logger.info("websocketState: ".concat(rpcClientSate, ",unmuteVideo has been cached"));
      }
    }
  }, {
    key: "onConnectionLost",
    value: function onConnectionLost() {}
  }, {
    key: "onConnectionRecovery",
    value: function onConnectionRecovery(sessionTimeout, sdp) {
      // 取消发布的操作
      if (this.state.state() === State$1.Unpublishing) {
        return this.doUnpublish(this.unpublishCb);
      }

      if (sessionTimeout) {
        if (sdp) {
          this.options.offerSdp = sdp;
          this.republish();
        }
      } else {
        this.recoveryOperations();
      }
    }
    /**
     * 重新发布流
     * @returns 
     */

  }, {
    key: "republish",
    value: function republish() {
      this.options.logger.info("Republish stream: " + this.options.stream.streamId);

      if (!this.state.setState(State$1.Republishing)) {
        return;
      }

      this.doPublish();
    }
    /**
     * 重新发送没有成功的操作
     */

  }, {
    key: "recoveryOperations",
    value: function recoveryOperations() {
      var _this$options$stream$, _this$options$stream$2, _this$options$stream$3, _this$options$stream$4;

      if (this.audioMuteWanted !== ((_this$options$stream$ = this.options.stream.info) === null || _this$options$stream$ === void 0 ? void 0 : (_this$options$stream$2 = _this$options$stream$.audio) === null || _this$options$stream$2 === void 0 ? void 0 : _this$options$stream$2.muted)) {
        if (this.audioMuteWanted) {
          var _this$muteAudioOption = this.muteAudioOption,
              userId = _this$muteAudioOption.userId,
              cb = _this$muteAudioOption.cb,
              userData = _this$muteAudioOption.userData;
          this.control(userId, 'mute', cb, userData);
        } else {
          var _this$unmuteAudioOpti = this.unmuteAudioOption,
              _userId = _this$unmuteAudioOpti.userId,
              _cb = _this$unmuteAudioOpti.cb,
              _userData = _this$unmuteAudioOpti.userData;
          this.control(_userId, 'unmute', _cb, _userData);
        }
      }

      if (this.videoMuteWanted !== ((_this$options$stream$3 = this.options.stream.info) === null || _this$options$stream$3 === void 0 ? void 0 : (_this$options$stream$4 = _this$options$stream$3.video) === null || _this$options$stream$4 === void 0 ? void 0 : _this$options$stream$4.muted)) {
        if (this.videoMuteWanted) {
          var _this$muteVideoOption = this.muteVideoOption,
              _userId2 = _this$muteVideoOption.userId,
              _cb2 = _this$muteVideoOption.cb,
              _userData2 = _this$muteVideoOption.userData;
          this.control(_userId2, 'vmute', _cb2, _userData2);
        } else {
          var _this$unmuteVideoOPti = this.unmuteVideoOPtion,
              _userId3 = _this$unmuteVideoOPti.userId,
              _cb3 = _this$unmuteVideoOPti.cb,
              _userData3 = _this$unmuteVideoOPti.userData;
          this.control(_userId3, 'unvmute', _cb3, _userData3);
        }
      }

      if (this.simulcastWanted) {
        var _this$options$stream$5, _this$options$stream$6;

        if ((_this$options$stream$5 = this.options.stream.info) !== null && _this$options$stream$5 !== void 0 && (_this$options$stream$6 = _this$options$stream$5.video) !== null && _this$options$stream$6 !== void 0 && _this$options$stream$6.simulcast) {
          if (JSON.stringify(this.simulcastWanted) !== JSON.stringify(this.options.stream.info.video.simulcast)) {
            this.doUpdateSimulcast(this.updateSimulcastCb);
          }
        }
      }
    }
    /**
     *  构建发布流的Params
     * @returns 
     */

  }, {
    key: "buildPublishParams",
    value: function buildPublishParams() {
      if (this.streamKind === StreamKind.AudioVideo) {
        var publishParams = {
          streamId: this.options.stream.streamId,
          type: getStreamTypeStrFromStreamType(this.options.stream.type),
          media: {
            audio: {
              source: getAudioSourceStrFromType(this.options.stream.info.audio.source),
              muted: this.audioMuteWanted,
              floor: this.options.stream.info.audio.floor
            },
            video: {
              source: getVideoSourceStrFromType(this.options.stream.info.video.source),
              muted: this.videoMuteWanted,
              floor: this.options.stream.info.video.floor
            }
          },
          sdp: this.options.offerSdp
        };

        if (this.simulcastWanted && this.simulcastWanted.length) {
          publishParams.media.video.simulcast = this.simulcastWanted.map(function (e) {
            return _objectSpread$1(_objectSpread$1({}, e), {}, {
              rid: getRidStrFromSimulcastType(e.type)
            });
          });
        }

        return publishParams;
      } else if (this.streamKind === StreamKind.AudioOnly) {
        var _publishParams = {
          streamId: this.options.stream.streamId,
          type: getStreamTypeStrFromStreamType(this.options.stream.type),
          media: {
            audio: {
              source: getAudioSourceStrFromType(this.options.stream.info.audio.source),
              muted: this.audioMuteWanted,
              floor: this.options.stream.info.audio.floor
            }
          },
          sdp: this.options.offerSdp
        };
        return _publishParams;
      } else if (this.streamKind === StreamKind.VideoOnly) {
        var _publishParams2 = {
          streamId: this.options.stream.streamId,
          type: getStreamTypeStrFromStreamType(this.options.stream.type),
          media: {
            video: {
              source: getVideoSourceStrFromType(this.options.stream.info.video.source),
              muted: this.videoMuteWanted,
              floor: this.options.stream.info.video.floor
            }
          },
          sdp: this.options.offerSdp
        };

        if (this.simulcastWanted && this.simulcastWanted.length) {
          _publishParams2.media.video.simulcast = this.simulcastWanted.map(function (e) {
            return _objectSpread$1(_objectSpread$1({}, e), {}, {
              rid: getRidStrFromSimulcastType(e.type)
            });
          });
        }

        return _publishParams2;
      }
    }
    /**
     * 真实发布流
     */

  }, {
    key: "doPublish",
    value: function doPublish() {
      var _this = this;

      try {
        var publishParams = this.buildPublishParams();

        if (publishParams !== null) {
          var publishRequest = {
            method: "publish",
            params: publishParams
          };

          var onSuccess = function onSuccess(response) {
            if (_this.state.state() === State$1.Publishing) {
              if (!_this.state.setState(State$1.Published)) {
                return;
              }
            }

            if (_this.state.state() === State$1.Republishing) {
              if (!_this.state.setState(State$1.Republished)) {
                return;
              }
            }

            if (_this.options.publishCb) {
              var publishResult = response.result;
              var streamId = publishResult.streamId,
                  sdp = publishResult.sdp;

              _this.options.publishCb(ResultCode.Success, null, {
                roomId: _this.options.roomId,
                streamId: streamId,
                answer_sdp: sdp
              });
            }

            _this.recoveryOperations();
          };

          var onError = function onError(response) {
            _this.options.logger.info('publish stream failed');

            if (_this.options.publishCb) {
              _this.options.publishCb(ResultCode.Failed, response.error.message, {
                roomId: _this.options.roomId,
                streamId: _this.options.stream.streamId
              });
            }
          };

          if (!this.options.rpcClient.sendRequest(publishRequest, onSuccess, onError)) {
            this.options.logger.error("Json Rpc Client send publish request error");
          }
        }
      } catch (err) {
        if (this.options.publishCb) {
          this.options.publishCb(ResultCode.Failed, err, {
            roomId: this.options.roomId
          });
        }

        this.options.logger.error(err);
      }
    }
  }, {
    key: "doUnpublish",
    value: function doUnpublish(cb) {
      var _this2 = this;

      var unpublishRequest = {
        method: "unpublish",
        params: {
          id: this.options.stream.streamId
        }
      };

      var onSuccess = function onSuccess() {
        if (!_this2.state.setState(State$1.Unpublished)) {
          return;
        }

        if (cb) {
          cb(ResultCode.Success, null, {
            roomId: _this2.options.roomId
          });
          _this2.unpublishCb = null;
        }
      };

      var onError = function onError(response) {
        if (cb) {
          _this2.options.logger.info("unpublish stream failed");

          cb(ResultCode.Failed, response.error.message, {
            roomId: _this2.options.roomId
          });
          _this2.unpublishCb = null;
        }
      };

      if (!this.options.rpcClient.sendRequest(unpublishRequest, onSuccess, onError)) {
        this.options.logger.error("Json Rpc Client send unpublish request error");
      }
    }
    /**
     * 真实更新大小流
     * @param cb 
     */

  }, {
    key: "doUpdateSimulcast",
    value: function doUpdateSimulcast(cb) {
      var _this3 = this;

      var updateSimulcastRequest = {
        method: "publishControl",
        params: {
          type: 'simulcast',
          streamId: this.options.stream.streamId,
          simulcast: this.simulcastWanted.map(function (e) {
            return {
              rid: getRidStrFromSimulcastType(e.type),
              maxWidth: e.maxWidth,
              maxHeight: e.maxHeight
            };
          })
        }
      };

      var onSuccess = function onSuccess(response) {
        _this3.options.logger.info("updateSimulcast ".concat(_this3.options.stream.streamId, " success"));

        _this3.options.stream.info.video.simulcast = _this3.simulcastWanted;

        if (cb) {
          cb(ResultCode.Success, null, _this3.options.roomId);
        }
      };

      var onError = function onError(response) {
        _this3.options.logger.info("updateSimulcast ".concat(_this3.options.stream.streamId, " failed"));

        if (cb) {
          cb(ResultCode.Failed, response.error.message, null);
        }
      };

      if (!this.options.rpcClient.sendRequest(updateSimulcastRequest, onSuccess, onError)) {
        this.options.logger.error("Json Rpc Client send unsubscribe request error");
      }
    }
    /**
    * 控制音视频的muted 和 unmuted
    * @param streamId 流的唯一标识
    * @param userId 用户的唯一标识
    * @param type  "mute" | "vmute" | "unmute" | "unvmute" 
    * @param cb 回调函数
    */

  }, {
    key: "control",
    value: function control(userId, type, cb, userData) {
      var _this4 = this;

      var controlRequest = {
        method: "controlCommand",
        params: {
          type: type,
          streamId: this.options.stream.streamId,
          member: userId,
          userData: userData
        }
      };
      this.options.logger.info('control command with', type);

      var onSuccess = function onSuccess(response) {
        _this4.options.logger.info("control command with ".concat(type, " success"));

        switch (type) {
          case 'mute':
          case 'unmute':
            _this4.options.stream.info.audio.muted = _this4.audioMuteWanted;
            break;

          case 'vmute':
          case 'unvmute':
            _this4.options.stream.info.video.muted = _this4.videoMuteWanted;
        }

        if (cb) {
          cb(ResultCode.Success, null, {
            roomId: _this4.options.roomId
          });
        }
      };

      var onError = function onError(response) {
        _this4.options.logger.info("control command with ".concat(type, " failed"));

        if (cb) {
          cb(ResultCode.Failed, response.error.message, {
            roomId: _this4.options.roomId
          });
        }
      };

      if (!this.options.rpcClient.sendRequest(controlRequest, onSuccess, onError)) {
        this.options.logger.error('Json Rpc Client send ControlCommand request error');
      }
    }
  }]);

  return Publication;
}();

var LocalStream = /*#__PURE__*/function () {
  function LocalStream(options) {
    _classCallCheck(this, LocalStream);

    this.options = options; // init publication

    var pubOptions = {
      roomId: this.options.roomId,
      stream: this.options.stream,
      offerSdp: this.options.offerSdp,
      rpcClient: this.options.rpcClient,
      logger: this.options.logger,
      publishCb: this.options.publishCb,
      publishUpdateCb: this.options.publishUpdateCb
    };
    this.publiccation = new Publication(pubOptions);
  }

  _createClass(LocalStream, [{
    key: "publish",
    value: function publish() {
      this.publiccation.publish();
    }
  }, {
    key: "unpublish",
    value: function unpublish(cb) {
      this.publiccation.unpublish(cb);
    }
  }, {
    key: "updateSimulcast",
    value: function updateSimulcast(simulcast, cb) {
      this.publiccation.updateSimulcast(simulcast, cb);
    }
  }, {
    key: "muteAudio",
    value: function muteAudio(userId, cb, userData) {
      this.publiccation.muteAudio(userId, cb, userData);
    }
  }, {
    key: "muteVideo",
    value: function muteVideo(userId, cb, userData) {
      this.publiccation.muteVideo(userId, cb, userData);
    }
  }, {
    key: "unmuteAudio",
    value: function unmuteAudio(userId, cb, userData) {
      this.publiccation.unmuteAudio(userId, cb, userData);
    }
  }, {
    key: "unmuteVideo",
    value: function unmuteVideo(userId, cb, userData) {
      this.publiccation.unmuteVideo(userId, cb, userData);
    }
  }, {
    key: "onConnectionLost",
    value: function onConnectionLost() {
      this.publiccation.onConnectionLost();
    }
  }, {
    key: "onConnectionRecovery",
    value: function onConnectionRecovery(sessionTimeout, sdp) {
      this.publiccation.onConnectionRecovery(sessionTimeout, sdp);
    }
  }]);

  return LocalStream;
}();

function _createForOfIteratorHelper$4(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$4(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$4(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$4(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$4(o, minLen); }

function _arrayLikeToArray$4(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var LocalUser = /*#__PURE__*/function () {
  function LocalUser(options) {
    _classCallCheck(this, LocalUser);

    this.options = options;
    this.permissionWanted = options.permission;
    this.permissionCb = null;
    this.localStreams = new Map();
  }
  /**
   * 
   * @returns 获取用户Id
   */


  _createClass(LocalUser, [{
    key: "getUserId",
    value: function getUserId() {
      return this.options.userId;
    }
    /**
     * 切换权限
     * @param permission MsgStruct.Permission
     * @param cb 回调函数
     */

  }, {
    key: "switchPermission",
    value: function switchPermission(permission, cb) {
      this.permissionWanted = permission;
      this.permissionCb = cb;
      var rpcClientSate = this.options.rpcClient.getWsState().state;

      if (['CONNECTED', 'RECOVERY'].includes(rpcClientSate)) {
        this.doSwitchPermission(cb);
      } else {
        this.options.logger.info("websocketState: ".concat(rpcClientSate, ",the operation has been cached"));
      }
    }
  }, {
    key: "publishStream",
    value: function publishStream(streamId, streamType, streamKind, params, cb, updateCb) {
      var localStreamOption = {
        roomId: this.options.roomId,
        stream: {
          userId: this.options.userId,
          streamId: streamId,
          type: streamType,
          info: {}
        },
        offerSdp: params.offerSdp,
        rpcClient: this.options.rpcClient,
        // please use correct type, not use any
        logger: this.options.logger,
        publishCb: cb,
        publishUpdateCb: updateCb
      };

      if (streamKind === StreamKind.AudioVideo) {
        localStreamOption.stream.info = {
          audio: params.audioInfo,
          video: params.videoInfo
        };
      }

      if (streamKind === StreamKind.AudioOnly) {
        localStreamOption.stream.info.audio = params.audioInfo;
      }

      if (streamKind === StreamKind.VideoOnly) {
        localStreamOption.stream.info.video = params.videoInfo;
      }

      var localStream = new LocalStream(localStreamOption);
      localStream.publish();
      this.localStreams.set(streamId, localStream);
    }
  }, {
    key: "unpublishStream",
    value: function unpublishStream(streamId, cb) {
      var _this = this;

      if (this.localStreams.has(streamId)) {
        this.localStreams.get(streamId).unpublish(function (code, message, data) {
          if (code === ResultCode.Success) {
            _this.localStreams["delete"](streamId);
          }

          if (cb) {
            cb(code, message, data);
          }
        });
      }
    }
  }, {
    key: "updateSimulcast",
    value: function updateSimulcast(streamId, params, cb) {
      if (this.localStreams.has(streamId)) {
        this.localStreams.get(streamId).updateSimulcast(params.simulcast, cb);
      }
    }
  }, {
    key: "muteAudio",
    value: function muteAudio(streamId, cb, userData) {
      if (this.localStreams.has(streamId)) {
        this.localStreams.get(streamId).muteAudio(this.options.userId, cb, userData);
      }
    }
  }, {
    key: "muteVideo",
    value: function muteVideo(streamId, cb, userData) {
      if (this.localStreams.has(streamId)) {
        this.localStreams.get(streamId).muteVideo(this.options.userId, cb, userData);
      }
    }
  }, {
    key: "unmuteAudio",
    value: function unmuteAudio(streamId, cb, userData) {
      if (this.localStreams.has(streamId)) {
        this.localStreams.get(streamId).unmuteAudio(this.options.userId, cb, userData);
      }
    }
  }, {
    key: "unmuteVideo",
    value: function unmuteVideo(streamId, cb, userData) {
      if (this.localStreams.has(streamId)) {
        this.localStreams.get(streamId).unmuteVideo(this.options.userId, cb, userData);
      }
    }
  }, {
    key: "onConnectionLost",
    value: function onConnectionLost() {}
  }, {
    key: "onConnectionRecovery",
    value: function onConnectionRecovery(sessionTimeout, sdps) {
      if (sessionTimeout) {
        var _iterator = _createForOfIteratorHelper$4(this.localStreams),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = _slicedToArray(_step.value, 2),
                streamId = _step$value[0],
                localStream = _step$value[1];

            this.options.logger.info('localStreams onConnectionRecovery', streamId, this.localStreams, sdps);
            localStream.onConnectionRecovery(sessionTimeout, sdps === null || sdps === void 0 ? void 0 : sdps.get(streamId));
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        if (JSON.stringify(this.permissionWanted) !== JSON.stringify(this.options.permission)) {
          this.doSwitchPermission(this.permissionCb);
        }
      }
    }
  }, {
    key: "doSwitchPermission",
    value: function doSwitchPermission(cb) {
      var _this2 = this;

      var controlRequest = {
        method: "switchPermission",
        params: {
          permission: this.permissionWanted
        }
      };

      var onSuccess = function onSuccess(response) {
        _this2.options.logger.info('switch permission success');

        _this2.options.permission = _this2.permissionWanted;

        if (cb) {
          cb(ResultCode.Success, null, _this2.options.roomId);
        }
      };

      var onError = function onError(response) {
        _this2.options.logger.info('switch permission failed'); // 如果错误了要不要重传？目前是重传的


        if (cb) {
          cb(ResultCode.Failed, response.error.message, _this2.options.roomId);
        }
      };

      if (!this.options.rpcClient.sendRequest(controlRequest, onSuccess, onError)) {
        this.options.logger.error("Json Rpc Client send switch permission request error");
      }
    }
  }]);

  return LocalUser;
}();

/*
 * subscriptionState
 *
 *  Created on: Jun 18, 2021
 *      Author: sxtang
 */
var State;

(function (State) {
  State[State["Create"] = 0] = "Create";
  State[State["Subscribing"] = 1] = "Subscribing";
  State[State["Subscribed"] = 2] = "Subscribed";
  State[State["Resubscribing"] = 3] = "Resubscribing";
  State[State["Resubscribed"] = 4] = "Resubscribed";
  State[State["Unsubscribing"] = 5] = "Unsubscribing";
  State[State["Unsubscribed"] = 6] = "Unsubscribed";
  State[State["Destroyed"] = 7] = "Destroyed";
  State[State["StateMax"] = 8] = "StateMax";
})(State || (State = {}));

var subscriptionStateNames = ["Create", "Subscribing", "Subscribed", "Resubscribing", "Resubscribed", "Unsubscribing", "Unsubscribed", "Destroy"];
var SubscriptionState = /*#__PURE__*/function () {
  function SubscriptionState(logger) {
    _classCallCheck(this, SubscriptionState);

    this.currentState = State.Create;
    this.stateTransformTable = new Array();
    this.logger = logger;
    this.initStateTransformTable();
  }

  _createClass(SubscriptionState, [{
    key: "setState",
    value: function setState(newState) {
      if (!this.checkStateChange(this.currentState, newState)) {
        this.logger.error("SubscriptionState : INVALID state change from" + subscriptionStateNames[this.currentState] + " to " + subscriptionStateNames[newState]);
        return false;
      }

      this.logger.info("SubscriptionState : state change from " + subscriptionStateNames[this.currentState] + " to " + subscriptionStateNames[newState]);
      this.currentState = newState;
      return true;
    }
  }, {
    key: "state",
    value: function state() {
      return this.currentState;
    }
  }, {
    key: "checkStateChange",
    value: function checkStateChange(oldState, newState) {
      return this.stateTransformTable[oldState][newState];
    }
  }, {
    key: "initStateTransformTable",
    value: function initStateTransformTable() {
      for (var i = State.Create; i < State.StateMax; i++) {
        this.stateTransformTable[i] = new Array();

        for (var j = State.Create; j < State.StateMax; j++) {
          this.stateTransformTable[i][j] = false;
        }
      }

      this.stateTransformTable[State.Create][State.Subscribing] = true;
      this.stateTransformTable[State.Create][State.Destroyed] = true;
      this.stateTransformTable[State.Subscribing][State.Subscribed] = true;
      this.stateTransformTable[State.Subscribing][State.Unsubscribing] = true;
      this.stateTransformTable[State.Subscribing][State.Destroyed] = true;
      this.stateTransformTable[State.Subscribing][State.Resubscribing] = true;
      this.stateTransformTable[State.Subscribed][State.Unsubscribing] = true;
      this.stateTransformTable[State.Subscribed][State.Resubscribing] = true;
      this.stateTransformTable[State.Subscribed][State.Destroyed] = true;
      this.stateTransformTable[State.Resubscribing][State.Resubscribing] = true; // last resubscribe not receive response, coontecionagin lost, then we again resubscribe

      this.stateTransformTable[State.Resubscribing][State.Resubscribed] = true;
      this.stateTransformTable[State.Resubscribing][State.Unsubscribing] = true;
      this.stateTransformTable[State.Resubscribing][State.Subscribed] = true; // resubscribe error response received, recover to last logined state

      this.stateTransformTable[State.Resubscribing][State.Destroyed] = true;
      this.stateTransformTable[State.Resubscribed][State.Resubscribing] = true;
      this.stateTransformTable[State.Resubscribed][State.Unsubscribing] = true;
      this.stateTransformTable[State.Resubscribed][State.Destroyed] = true;
      this.stateTransformTable[State.Unsubscribing][State.Unsubscribed] = true;
      this.stateTransformTable[State.Unsubscribing][State.Destroyed] = true;
      this.stateTransformTable[State.Unsubscribed][State.Destroyed] = true;
    }
  }]);

  return SubscriptionState;
}();

var subscription = /*#__PURE__*/function () {
  // operation when connection lost and have not recovery
  function subscription(options) {
    _classCallCheck(this, subscription);

    this.options = options;
    this.state = new SubscriptionState(options.logger);
    this.connectionStatus = ConnectionStatus.ConnectionConnected;

    if (this.options.rid) {
      this.ridWanted = this.options.rid;
    }

    this.switchSimulcastCb = null;
    this.unsubscribeCb = null;
  }
  /**
   * 发布流
   * @returns 
   */


  _createClass(subscription, [{
    key: "subscribe",
    value: function subscribe() {
      this.options.logger.info("start subscribe: ".concat(this.options.subscriptionId));

      if (!this.state.setState(State.Subscribing)) {
        return;
      }

      var rpcClientSate = this.options.rpcClient.getWsState().state;

      if (['CONNECTED', 'RECOVERY'].includes(rpcClientSate)) {
        this.doSubscribe();
      }
    }
    /**
     * 取消订阅
     * @param cb 取消订阅的回调 
     * @returns 
     */

  }, {
    key: "unsubscribe",
    value: function unsubscribe(cb) {
      this.options.logger.info("unsubscribe: ".concat(this.options.subscriptionId));

      if (!this.state.setState(State.Unsubscribing)) {
        return;
      }

      this.unsubscribeCb = cb;
      var rpcClientSate = this.options.rpcClient.getWsState().state;

      if (['CONNECTED', 'RECOVERY'].includes(rpcClientSate)) {
        this.doUnsubscribe(this.unsubscribeCb);
      } else {
        this.options.logger.info("websocketState: ".concat(rpcClientSate, ",unsubscribe has been cached"));
      }
    }
    /**
     * 切换大小流
     * @param rid 
     */

  }, {
    key: "switchSimulcast",
    value: function switchSimulcast(rid, cb) {
      if (this.ridWanted === rid) {
        this.options.logger.info('can not switch the same simulcast');
        return;
      }

      this.ridWanted = rid;
      this.switchSimulcastCb = cb;
      var rpcClientSate = this.options.rpcClient.getWsState().state;
      var subState = this.state.state();

      if (['CONNECTED', 'RECOVERY'].includes(rpcClientSate)) {
        if (subState === State.Resubscribed || subState === State.Subscribed) {
          this.doSwitchSimulcast(cb);
        } else {
          this.options.logger.info("publicationState: ".concat(rpcClientSate, ",switchSimulcast has been cached"));
        }
      } else {
        this.options.logger.info("websocketState: ".concat(rpcClientSate, ",switchSimulcast has been cached"));
      }
    }
  }, {
    key: "onConnectionLost",
    value: function onConnectionLost() {}
  }, {
    key: "onConnectionRecovery",
    value: function onConnectionRecovery(sessionTimeout, sdp) {
      // 取消订阅 需要缓存
      this.options.logger.info('onConnectionRecovery subscriptionId', this.options.subscriptionId, 'sessionTimeout', sessionTimeout, 'sdp', sdp);

      if (this.state.state() === State.Unsubscribing) {
        return this.doUnsubscribe(this.unsubscribeCb);
      }

      if (sessionTimeout) {
        if (sdp) {
          this.options.offerSdp = sdp;
          this.resubscribe();
        }
      } else {
        this.recoveryOperations();
      }
    }
    /**
     * 重新订阅流
     * @returns 
     */

  }, {
    key: "resubscribe",
    value: function resubscribe() {
      this.options.logger.info("start resubscribe: " + this.options.subscriptionId);

      if (!this.state.setState(State.Resubscribing)) {
        return;
      }

      this.doSubscribe();
    }
    /**
     * 重新发送没有成功的操作
     */

  }, {
    key: "recoveryOperations",
    value: function recoveryOperations() {
      if (this.ridWanted && this.ridWanted !== this.options.rid) {
        this.doSwitchSimulcast(this.switchSimulcastCb);
      }
    }
  }, {
    key: "doSubscribe",
    value: function doSubscribe() {
      var _this = this;

      try {
        var params = {
          userId: this.options.userId,
          subscriptionId: this.options.subscriptionId,
          media: {
            audio: {
              has: this.options.subAudio
            },
            video: {
              has: this.options.subVideo
            }
          },
          sdp: this.options.offerSdp
        };

        if (this.options.subAudio) {
          params.media.audio.streamId = this.options.audioStreamId;
        }

        if (this.options.subVideo) {
          params.media.video.streamId = this.options.videoStreamId;
          params.media.video.rid = this.ridWanted;
        }

        var subscribeRequest = {
          method: "subscribe",
          params: params
        };

        var onSuccess = function onSuccess(response) {
          if (_this.state.state() === State.Subscribing) {
            if (!_this.state.setState(State.Subscribed)) {
              return;
            }
          }

          if (_this.state.state() === State.Resubscribing) {
            if (!_this.state.setState(State.Resubscribed)) {
              return;
            }
          }

          _this.options.logger.info("subscribe ".concat(_this.options.subscriptionId, " success"));

          var _ref = response.result,
              subscriptionId = _ref.subscriptionId,
              sdp = _ref.sdp;

          if (_this.options.subscribeCb) {
            _this.options.subscribeCb(ResultCode.Success, null, {
              roomId: _this.options.roomId,
              subscriptionId: subscriptionId,
              answer_sdp: sdp
            });
          }

          _this.recoveryOperations();
        };

        var onError = function onError(response) {
          _this.options.logger.info("subscribe ".concat(_this.options.subscriptionId, " failed"));

          if (_this.options.subscribeCb) {
            _this.options.subscribeCb(ResultCode.Failed, response.error.message, {
              roomId: _this.options.roomId,
              subscriptionId: _this.options.subscriptionId
            });
          }
        };

        if (!this.options.rpcClient.sendRequest(subscribeRequest, onSuccess, onError)) {
          this.options.logger.error("Json Rpc Client send subscribe request error");
        }
      } catch (err) {
        if (this.options.subscribeCb) {
          this.options.subscribeCb(ResultCode.Failed, err, null);
        }

        this.options.logger.error(err);
      }
    }
  }, {
    key: "doSwitchSimulcast",
    value: function doSwitchSimulcast(cb) {
      var _this2 = this;

      var switchSimulcastRequest = {
        method: "subscribeControl",
        params: {
          subscriptionId: this.options.subscriptionId,
          type: 'simulcast',
          rid: this.ridWanted
        }
      };

      var onSuccess = function onSuccess(response) {
        _this2.options.logger.info("switchSimulcast ".concat(_this2.options.subscriptionId, " success"));

        _this2.options.rid = _this2.ridWanted;

        if (cb) {
          cb(ResultCode.Success, null, _this2.options.roomId);
        }
      };

      var onError = function onError(response) {
        _this2.options.logger.info("switchSimulcast ".concat(_this2.options.subscriptionId, " failed"));

        if (cb) {
          cb(ResultCode.Failed, response.error.message, null);
        }
      };

      if (!this.options.rpcClient.sendRequest(switchSimulcastRequest, onSuccess, onError)) {
        this.options.logger.error("Json Rpc Client send unsubscribe request error");
      }
    }
  }, {
    key: "doUnsubscribe",
    value: function doUnsubscribe(cb) {
      var _this3 = this;

      var unsubscribeRequest = {
        method: "unsubscribe",
        params: {
          id: this.options.subscriptionId
        }
      };

      var onSuccess = function onSuccess(response) {
        if (!_this3.state.setState(State.Unsubscribed)) {
          return;
        }

        _this3.options.logger.info("unsubscribe ".concat(_this3.options.subscriptionId, " success"));

        if (cb) {
          cb(ResultCode.Success, null, {
            roomId: _this3.options.roomId
          });
          _this3.unsubscribeCb = null;
        }
      };

      var onError = function onError(response) {
        _this3.options.logger.info("unsubscribe ".concat(_this3.options.subscriptionId, " failed"));

        if (cb) {
          cb(ResultCode.Failed, response.error.message, null);
          _this3.unsubscribeCb = null;
        }
      };

      if (!this.options.rpcClient.sendRequest(unsubscribeRequest, onSuccess, onError)) {
        this.options.logger.error("Json Rpc Client send unsubscribe request error");
      }
    }
  }]);

  return subscription;
}();

function _createForOfIteratorHelper$3(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$3(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$3(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$3(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$3(o, minLen); }

function _arrayLikeToArray$3(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var RemoteStream = /*#__PURE__*/function () {
  function RemoteStream(options) {
    _classCallCheck(this, RemoteStream);

    this.options = options;
    this.subscriptions = new Map();
  }

  _createClass(RemoteStream, [{
    key: "subscribe",
    value: function subscribe(subscriptionId, subAudio, subVideo, rid, offerSdp, Cb, updateCb) {
      var subOptions = {
        roomId: this.options.roomId,
        userId: this.options.stream.userId,
        subscriptionId: subscriptionId,
        offerSdp: offerSdp,
        subAudio: subAudio,
        audioStreamId: this.options.stream.streamId,
        subVideo: subVideo,
        videoStreamId: this.options.stream.streamId,
        rid: rid,
        rpcClient: this.options.rpcClient,
        logger: this.options.logger,
        subscribeCb: Cb,
        subscribeUpdateCb: updateCb
      };
      var subscription$1 = new subscription(subOptions);
      subscription$1.subscribe();
      this.options.logger.info('remoteStream subscribe subscriptionId', subscriptionId);
      this.subscriptions.set(subscriptionId, subscription$1);
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(subscriptionId, cb) {
      var _this = this;

      if (this.subscriptions.has(subscriptionId)) {
        this.subscriptions.get(subscriptionId).unsubscribe(function (code, message, data) {
          if (code === ResultCode.Success) {
            _this.options.logger.info('remoteStream unsubscribe subscriptionId', subscriptionId);

            _this.subscriptions["delete"](subscriptionId);
          }

          if (cb) {
            cb(code, message, data);
          }
        });
      }
    }
  }, {
    key: "updateSimulcast",
    value: function updateSimulcast(simulcast) {
      this.options.stream.info.video.simulcast = simulcast;
    }
  }, {
    key: "updateLiveStatus",
    value: function updateLiveStatus(status) {
      if (status.audio) {
        this.options.stream.info.audio.muted = status.audio.muted;
      }

      if (status.video) {
        this.options.stream.info.video.muted = status.video.muted;
      }
    }
  }, {
    key: "switchSimulcast",
    value: function switchSimulcast(subscriptionId, rid, cb) {
      if (this.subscriptions.has(subscriptionId)) {
        this.subscriptions.get(subscriptionId).switchSimulcast(rid, cb);
      }
    }
  }, {
    key: "onConnectionLost",
    value: function onConnectionLost() {
      var _iterator = _createForOfIteratorHelper$3(this.subscriptions.values()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _subscription = _step.value;

          _subscription.onConnectionLost();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "onConnectionRecovery",
    value: function onConnectionRecovery(sessionTimeout, subscriptionId, sdp) {
      this.options.logger.info('remoteStream onConnectionRecovery subscriptionId', subscriptionId);

      if (this.subscriptions.has(subscriptionId)) {
        this.subscriptions.get(subscriptionId).onConnectionRecovery(sessionTimeout, sdp);
      }
    }
  }]);

  return RemoteStream;
}();

function _createForOfIteratorHelper$2(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$2(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$2(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$2(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen); }

function _arrayLikeToArray$2(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var RemoteUser = /*#__PURE__*/function () {
  function RemoteUser(options) {
    _classCallCheck(this, RemoteUser);

    this.options = options;
    this.remoteStreams = new Map();
    this.streamIdArray = new Array();
    this.subPubIdMap = new Map();
  }

  _createClass(RemoteUser, [{
    key: "addStream",
    value: function addStream(stream) {
      var streamId = stream.streamId;
      var options = {
        roomId: this.options.roomId,
        stream: stream,
        rpcClient: this.options.rpcClient,
        logger: this.options.logger
      };
      this.remoteStreams.set(streamId, new RemoteStream(options));
      this.streamIdArray.push(streamId);
    }
  }, {
    key: "deleteStream",
    value: function deleteStream(streamId) {
      if (this.remoteStreams.has(streamId)) {
        this.remoteStreams["delete"](streamId);
        var index = this.streamIdArray.indexOf(streamId);

        if (index != -1) {
          this.streamIdArray.splice(index, 1);
        } // 订阅的流包含的也要删除


        var subscriptionId = null;

        var _iterator = _createForOfIteratorHelper$2(this.subPubIdMap),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = _slicedToArray(_step.value, 2),
                subId = _step$value[0],
                sId = _step$value[1];

            if (sId === streamId) {
              subscriptionId = subId;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        subscriptionId && this.subPubIdMap["delete"](subscriptionId);
      }
    }
  }, {
    key: "updateStreamSimulcast",
    value: function updateStreamSimulcast(streamId, simulcast) {
      if (this.remoteStreams.has(streamId)) {
        this.remoteStreams.get(streamId).updateSimulcast(simulcast);
      }
    }
  }, {
    key: "updateStreamStatus",
    value: function updateStreamStatus(streamId, status) {
      if (this.remoteStreams.has(streamId)) {
        this.remoteStreams.get(streamId).updateLiveStatus(status);
      }
    }
  }, {
    key: "subscribeStream",
    value: function subscribeStream(subscriptionId, streamId, streamKind, params, cb, updateCb) {
      this.options.logger.info('remote user subscribe stream', this.remoteStreams.has(streamId));

      if (this.remoteStreams.has(streamId)) {
        this.remoteStreams.get(streamId).subscribe(subscriptionId, params.hasAudio, params.hasVideo, getRidStrFromSimulcastType(params === null || params === void 0 ? void 0 : params.type), params.offerSdp, cb, updateCb);
        this.options.logger.info('remoteUser subscribeStream subscriptionId', subscriptionId);
        this.subPubIdMap.set(subscriptionId, streamId);
      }
    }
  }, {
    key: "unsubscribeStream",
    value: function unsubscribeStream(subscriptionId, cb) {
      var _this = this;

      var streamId = this.subPubIdMap.get(subscriptionId);

      if (streamId && this.remoteStreams.has(streamId)) {
        this.remoteStreams.get(streamId).unsubscribe(subscriptionId, function (code, message, data) {
          if (code === ResultCode.Success) {
            _this.subPubIdMap["delete"](subscriptionId);
          }

          if (cb) {
            cb(code, message, data);
          }
        });
      }
    }
  }, {
    key: "switchSimulcast",
    value: function switchSimulcast(subscriptionId, params, cb) {
      var streamId = this.subPubIdMap.get(subscriptionId);

      if (streamId && this.remoteStreams.has(streamId)) {
        this.remoteStreams.get(streamId).switchSimulcast(subscriptionId, getRidStrFromSimulcastType(params.type), cb);
      }
    }
  }, {
    key: "getAllStreamId",
    value: function getAllStreamId() {
      return this.streamIdArray;
    }
  }, {
    key: "onConnectionLost",
    value: function onConnectionLost() {}
  }, {
    key: "onConnectionRecovery",
    value: function onConnectionRecovery(sessionTimeout, sdps) {
      var _iterator2 = _createForOfIteratorHelper$2(this.subPubIdMap),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
              subscriptionId = _step2$value[0],
              streamId = _step2$value[1];

          this.options.logger.info('remoteUser onConnectionRecovery subscriptionId', subscriptionId, 'streamId', streamId);

          if (this.remoteStreams.has(streamId)) {
            this.remoteStreams.get(streamId).onConnectionRecovery(sessionTimeout, subscriptionId, sdps.get(subscriptionId));
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }]);

  return RemoteUser;
}();

// Json rpc version
var JSONRPC_VERSION = '2.0';
var JsonRpcClient = /*#__PURE__*/function () {
  //config option
  // websocket 
  // Queue to save messages delivered when websocket is not ready
  // reconnection timer,
  // Add 1 to every 10 sleeps, up to a maximum of 3 seconds
  // 超时时间 默认 60s
  // 延迟器
  // The next JSON-RPC request id.
  // used for request and response matching
  // websocket connect state
  // CONNECTING CONNECTED DISCONNECTED RECONNECTING RECOVERY
  // CONNECTING CONNECTED DISCONNECTED RECONNECTING
  // 自动重连
  //避免重复连接
  function JsonRpcClient(options, logger) {
    _classCallCheck(this, JsonRpcClient);

    this.options = options;
    this.userId = options.userId;
    this.logger = logger;
    this.wsSocket = null;
    this.pendingRequests = new Array();
    this.successCallbacks = new Map();
    this.errorCallbacks = new Map();
    this.requestTypes = new Map();
    this.retryTimerId = 0;
    this.retryCount = 0;
    this.maxRetryCount = 30;
    this.currentId = 1;
    this.times = 60 * 1000;
    this.timer = null;
    this.state = "DISCONNECTED";
    this.prevState = "DISCONNECTED";
    this.autoReconnected = true;
    this.lockReconnect = false;
    this.heartCheck = this.initHeartCheck();
  }
  /**
   * send a request to server
   * @param successCb A callback for successful response.
   * @param errorCb   A callback for error response.
   */


  _createClass(JsonRpcClient, [{
    key: "sendRequest",
    value: function sendRequest(request, successCb, errorCb) {
      if (!request) {
        return false;
      }

      request.jsonrpc = JSONRPC_VERSION;
      request.id = "".concat(this.userId, "_").concat(Date.now(), "_").concat(this.currentId++);
      var self = this;

      if (!successCb) {
        successCb = function successCb(response) {
          // 根据ID判断这是登录的返回
          self.logger.debug('success: ' + JSON.stringify(response));
        };
      }

      if (!errorCb) {
        errorCb = function errorCb(response) {
          // 根据ID判断这是登录的返回
          self.logger.debug('error: ' + JSON.stringify(response));
        };
      }

      var requestJosnStr = JSON.stringify(request);

      if (this.wsSocket) {
        if (this.wsSocket.readyState < 1) {
          this.pendingRequests.push(requestJosnStr);
        } else {
          self.logger.info('send message: \n' + JSON.stringify(JSON.parse(requestJosnStr), null, 4));
          this.sendMessage(requestJosnStr);
        }

        this.successCallbacks.set(request.id, successCb);
        this.errorCallbacks.set(request.id, errorCb);
        this.requestTypes.set(request.id, request.method);
        return true;
      }

      return false;
    }
    /**
     * ws 是否ready
     * @returns 
     */

  }, {
    key: "socketReady",
    value: function socketReady() {
      this.logger.info('wsSocket readyState', this.wsSocket && this.wsSocket.readyState);

      if (this.wsSocket == null || this.wsSocket.readyState > 1) {
        return false;
      }

      return true;
    }
    /**
     * 建立websocket连接
     * @returns 
     */

  }, {
    key: "connect",
    value: function connect() {
      if (!this.options.wsUrl && this.options.wsUrl.length === 0) {
        this.logger.error('Websocket url is empty!');
        return false;
      }

      if (this.retryTimerId) {
        window.clearTimeout(this.retryTimerId);
      }

      if (!this.socketReady()) {
        this.prevState = this.state;
        this.state = 'CONNECTING';
        this.options.onWsStateChange(this.prevState, this.state, this.retryCount);
        this.wsSocket = new WebSocket(this.options.wsUrl);

        if (this.wsSocket) {
          this.wsSocket.onmessage = this.onWsMessage.bind(this);
          this.wsSocket.onclose = this.onWsClose.bind(this);
          this.wsSocket.onerror = this.onWsError.bind(this);
          this.wsSocket.onopen = this.onConnect.bind(this);
        }
      }

      return !!this.wsSocket;
    }
    /**
     * 关闭socket连接
     */

  }, {
    key: "close",
    value: function close() {
      if (this.socketReady()) {
        this.autoReconnected = false;
        this.wsSocket.close();
        this.resetWs();
        this.timer && clearTimeout(this.timer);
        this.retryTimerId && clearTimeout(this.retryTimerId);
        this.heartCheck.reset();
        this.heartCheck = null;
        this.logger.info('close websocket');
      }
    }
    /**
     * 连接建立时触发
     */

  }, {
    key: "onConnect",
    value: function onConnect() {
      this.heartCheck.start();
      this.prevState = this.state;

      if (this.retryTimerId) {
        window.clearTimeout(this.retryTimerId);
        this.retryTimerId = null;
        this.state = "RECOVERY";
      } else {
        this.state = 'CONNECTED';
      }

      this.retryCount = 0;
      this.options.onWsStateChange(this.prevState, this.state, this.retryCount);
      var req;

      while (req = this.pendingRequests.pop()) {
        this.logger.info('send message: \n' + req);
        this.sendMessage(req);
      }
    }
    /**
     * Internal handler for the websocket messages.  It determines if the message is a JSON-RPC
     * response, and if so, tries to couple it with a given callback.  Otherwise, it falls back to
     * given external onmessage-handler, if any.
     *
     * @param event The websocket onmessage-event.
    */

  }, {
    key: "onWsMessage",
    value: function onWsMessage(event) {
      if (this.heartCheck && this.heartCheck.serverTimeoutObj) {
        clearTimeout(this.heartCheck.serverTimeoutObj);
        this.heartCheck.serverTimeoutObj = null;
      }

      this.timer && clearTimeout(this.timer);
      this.timer = null;
      var message;
      message = JSON.parse(event.data);

      if (_typeof(message) === 'object' && message.method === "pong") {
        return;
      }

      this.logger.info('格式化消息: \n' + JSON.stringify(message, null, 4));

      if (_typeof(message) === 'object' && 'jsonrpc' in message && message.jsonrpc === JSONRPC_VERSION) {
        var id = message.id; // If this is an object with result, it is a success response.

        var successCb = this.successCallbacks.get(id);
        var errorCb = this.errorCallbacks.get(id);

        if ('result' in message && successCb) {
          var successResponse = {
            jsonrpc: JSONRPC_VERSION,
            id: message.id,
            result: message.result
          };
          successCb(successResponse);
          this.successCallbacks["delete"](id);
          this.errorCallbacks["delete"](id);
          return;
        } else if ('error' in message && errorCb) {
          var errorResponse = {
            jsonrpc: JSONRPC_VERSION,
            id: message.id,
            error: message.error
          };
          errorCb(errorResponse);
          this.successCallbacks["delete"](id);
          this.errorCallbacks["delete"](id);
          return;
        }
      } // This is not a JSON-RPC response. May be a request or nitofication sent by server.
      // Call onRequest or onNotification, if given.


      if ('id' in message) {
        // request
        var request = {
          jsonrpc: JSONRPC_VERSION,
          id: message.id,
          method: message.method,
          params: message.params
        };

        if (typeof this.options.onRequest === 'function') {
          var res = this.options.onRequest(request);
          res.jsonrpc = JSONRPC_VERSION;
          res.id = message.id;

          if (this.wsSocket) {
            this.wsSocket.send(JSON.stringify(res));
          }
        }
      } else {
        // notification
        var _notification = {
          jsonrpc: JSONRPC_VERSION,
          method: message.method,
          params: message.params
        };
        this.options.onNotification(_notification);
      }
    }
    /**
     * 连接关闭时触发
     * @returns 
     */

  }, {
    key: "onWsClose",
    value: function onWsClose(event) {
      this.logger.info('onWsClose', event);
      this.heartCheck && this.heartCheck.reset();
      this.prevState = this.state;
      this.state = 'DISCONNECTED';

      if (this.prevState !== this.state) {
        this.options.onWsStateChange(this.prevState, this.state, this.retryCount);
      }

      return;
    }
    /**
     * 连接报错时触发
     * @param event 
     * @returns 
     */

  }, {
    key: "onWsError",
    value: function onWsError(event) {
      this.logger.info('onWsError', event);
      this.heartCheck && this.heartCheck.reset();
      this.prevState = this.state;
      this.state = 'DISCONNECTED';

      if (this.prevState !== this.state) {
        this.options.onWsStateChange(this.prevState, this.state, this.retryCount);
      }

      if (this.retryCount === 0) {
        var err = new ER({
          code: ERCode.SIGNAL_CHANNEL_SETUP_FAILED,
          message: 'WebSocket connect failed'
        });

        if (typeof this.options.onError === 'function') {
          this.options.onError(err);
        }
      }

      return;
    }
    /**
     * ws 建立重新连接
     * @returns 
     */

  }, {
    key: "reconnect",
    value: function reconnect() {
      var _this = this;

      if (!this.autoReconnected && this.lockReconnect) return;
      this.lockReconnect = true;
      this.prevState = this.state;
      this.retryTimerId && clearTimeout(this.retryTimerId);

      if (this.retryCount < this.maxRetryCount) {
        this.retryTimerId = window.setTimeout(function () {
          _this.retryCount++;

          _this.logger.info("".concat(new Date().toLocaleString(), " Try to reconnect, count: ").concat(_this.retryCount));

          _this.state = 'RECONNECTING';

          _this.options.onWsStateChange(_this.prevState, _this.state, _this.retryCount);

          _this.resetWs();

          _this.connect();

          _this.lockReconnect = false;
        }, this.getReconnectDelay(this.retryCount));
      } else {
        this.logger.warn("SDK has tried reconnect signal channel for ".concat(this.maxRetryCount, " times, but all failed. please check your network"));

        if (this.options.onWsReconnectFailed) {
          this.options.onWsReconnectFailed();
        }
      }
    }
    /**
     * 发送消息 + 超时机制
     */

  }, {
    key: "sendMessage",
    value: function sendMessage(msg) {
      var _this2 = this;

      this.wsSocket.send(msg);

      if (!this.timer) {
        this.timer = setTimeout(function () {
          _this2.logger.error('websocket connection timeout!');

          var err = new ER({
            code: ERCode.SERVER_TIMEOUT,
            message: 'server timeout'
          });

          if (typeof _this2.options.onError === 'function') {
            _this2.options.onError(err);
          }
        }, this.times);
      }
    }
    /**
     * 获取WS的连接状态
     * @returns 
     */

  }, {
    key: "getWsState",
    value: function getWsState() {
      return {
        state: this.state,
        prevState: this.prevState
      };
    }
  }, {
    key: "resetWs",
    value: function resetWs() {
      if (this.wsSocket) {
        this.wsSocket.onmessage = null;
        this.wsSocket.onclose = null;
        this.wsSocket.onerror = null;
        this.wsSocket.onopen = null;
        this.wsSocket = null;
      }
    }
    /**
     * 心跳检测机制
     */

  }, {
    key: "initHeartCheck",
    value: function initHeartCheck() {
      var that = this;
      return {
        timeout: 2 * 1000,
        serverTimeout: 10 * 1000,
        timeoutObj: null,
        serverTimeoutObj: null,
        reset: function reset() {
          clearInterval(this.timeoutObj);
          clearTimeout(this.serverTimeoutObj);
          this.timeoutObj = null;
          this.serverTimeoutObj = null;
          return this;
        },
        start: function start() {
          var _this3 = this;

          this.reset(); // @ts-ignore

          this.timeoutObj = setInterval(function () {
            var request = {
              jsonrpc: "2.0",
              id: 0,
              method: "ping",
              params: {}
            };
            that.sendMessage(JSON.stringify(request));

            if (!_this3.serverTimeoutObj) {
              _this3.serverTimeoutObj = setTimeout(function () {
                // 关闭连接触发重连
                that.logger.info(new Date().toLocaleString(), "not received pong, close the websocket");
                that.onWsError();
              }, _this3.serverTimeout);
            }
          }, this.timeout);
        }
      };
    }
    /**
     * 获取重连的定时时间
     * @param count 重连次数
     * @returns 
     */

  }, {
    key: "getReconnectDelay",
    value: function getReconnectDelay(count) {
      var t = Math.round(count / 2) + 1;
      return t > 6 ? 13 * 1000 : 3 * 1000;
    }
  }]);

  return JsonRpcClient;
}();

function _createForOfIteratorHelper$1(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var Room = /*#__PURE__*/function () {
  // used to check stream change(add/delete/update)
  // used to find remote user for subscription
  function Room(options) {
    _classCallCheck(this, Room);

    this.options = options;
    var _options$roomCbs = options.roomCbs,
        connectionLostCb = _options$roomCbs.connectionLostCb,
        connectionRecoveryCb = _options$roomCbs.connectionRecoveryCb,
        tryToReconnectCb = _options$roomCbs.tryToReconnectCb,
        notificationCb = _options$roomCbs.notificationCb,
        onWsError = _options$roomCbs.onWsError,
        onWsStateChange = _options$roomCbs.onWsStateChange,
        onWsReconnectFailed = _options$roomCbs.onWsReconnectFailed;
    this.roomCbs = {
      connectionLostCb: connectionLostCb,
      connectionRecoveryCb: connectionRecoveryCb,
      tryToReconnectCb: tryToReconnectCb,
      notificationCb: notificationCb,
      onWsStateChange: onWsStateChange,
      onWsError: onWsError,
      onWsReconnectFailed: onWsReconnectFailed
    };
    this.remoteUsers = new Map();
    this.remoteUserIdArray = new Array();
    this.remoteStreams = new Map();
    this.remoteStreamIdArray = new Array();
    this.subUserIdMap = new Map();
    this.state = new RoomState(this.options.logger);
    this.connectionStatus = ConnectionStatus.New;
  }
  /**
   * 入会
   * @param userId  用户的唯一标识
   * @param userType 用户类型
   * @param previousRoomId 之前的房间号
   * @param permission 用户权限
   * @param userData 用户信息
   * @param enterRoomCb 进入房间的回调
   * @returns 
   */


  _createClass(Room, [{
    key: "enter",
    value: function enter(appId, userId, userType, previousRoomId, permission, userData, enterRoomCb) {
      if (!this.state.setState(State$3.Entering)) {
        return;
      }

      this.options.logger.info("Enter Room " + this.options.roomId);
      this.roomCbs.enterRoomCb = enterRoomCb;
      this.initJsonRpcClient(userId);
      this.initLoginAndLocalUser(appId, userId, userType, previousRoomId, permission, userData);
      this.login.login();
    }
    /**
     * 退会
     * @param exitRoomCb 退出房间的回调
     * @returns 
     */

  }, {
    key: "exit",
    value: function exit(exitRoomCb) {
      if (!this.state.setState(State$3.Exiting)) {
        return;
      }

      this.options.logger.info("Exit Room " + this.options.roomId);
      this.roomCbs.exitRoomCb = exitRoomCb;
      this.login.logout();
    }
    /**
     * 推流
     * @param streamId 流的唯一标识
     * @param streamType  流的类型
     * @param streamKind 流的种类
     * @param params MsgStruct.PublishParams
     * @param cb 推流的回调函数
     * @param updateCb  更新流的回调函数
     * @returns 
     */

  }, {
    key: "publishStream",
    value: function publishStream(streamId, streamType, streamKind, params, cb, updateCb) {
      if (this.state.state() != State$3.Entered) {
        this.options.logger.info("We are not enter room, can not publish stream");
        return;
      }

      return this.localUser.publishStream(streamId, streamType, streamKind, params, cb, updateCb);
    }
    /**
     * 取消推流
     * @param streamId 流的唯一标识
     * @param cb 取消推流的回调
     * @returns 
     */

  }, {
    key: "unpublishStream",
    value: function unpublishStream(streamId, cb) {
      if (this.state.state() != State$3.Entered) {
        this.options.logger.info("We are not enter room, can not unpublish stream");
        return;
      }

      return this.localUser.unpublishStream(streamId, cb);
    }
    /**
     * 更新大小流
     * @param streamId 流的唯一标识
     * @param params  MsgStruct.PublishControlParams
     * @returns 
     */

  }, {
    key: "updateSimulcast",
    value: function updateSimulcast(streamId, params, cb) {
      if (this.state.state() != State$3.Entered) {
        this.options.logger.info("We arn not enter room, can not publish updateSimulcast");
        return;
      }

      return this.localUser.updateSimulcast(streamId, params, cb);
    }
    /**
     * 音频静音
     * @param streamId 流的唯一标识
     * @param userId 用户的唯一标识
     * @param cb 音频静音的回调函数
     * @returns 
     */

  }, {
    key: "muteLocalAudio",
    value: function muteLocalAudio(streamId, cb, userData) {
      if (this.state.state() != State$3.Entered) {
        this.options.logger.info("We are not enter room, can not muteLocalAudio");
        return;
      }

      this.localUser.muteAudio(streamId, cb, userData);
    }
    /**
     * muteVideo
     * @param streamId 流的唯一标识
     * @param userId  用户的唯一标识
     * @param cb 回调函数
     * @returns 
     */

  }, {
    key: "muteLocalVideo",
    value: function muteLocalVideo(streamId, cb, userData) {
      if (this.state.state() != State$3.Entered) {
        this.options.logger.info("We are not enter room, can not muteLocalVideo");
        return;
      }

      this.localUser.muteVideo(streamId, cb, userData);
    }
    /**
     * 取消音频静音
     * @param streamId 流的唯一标识
     * @param userId  用户的唯一标识
     * @param cb 回调函数
     * @returns 
     */

  }, {
    key: "unmuteLocalAudio",
    value: function unmuteLocalAudio(streamId, cb, userData) {
      if (this.state.state() != State$3.Entered) {
        this.options.logger.info("We are not enter room, can not unmuteLocalAudio");
        return;
      }

      this.localUser.unmuteAudio(streamId, cb, userData);
    }
    /**
    * unmuteVideo
    * @param streamId 流的唯一标识
    * @param userId  用户的唯一标识
    * @param cb 回调函数
    * @returns 
    */

  }, {
    key: "unmuteLocalVideo",
    value: function unmuteLocalVideo(streamId, cb, userData) {
      if (this.state.state() != State$3.Entered) {
        this.options.logger.info("We are not enter room, can not unmuteLocalVideo");
        return;
      }

      this.localUser.unmuteVideo(streamId, cb, userData);
    }
    /**
     * 订阅流 
     * @param subscriptionId 订阅的流唯一标识
     * @param publisherUserId 远端用户的唯一标识
     * @param streamId 流的唯一标识
     * @param streamKind  CommDef.StreamKind
     * @param params MsgStruct.SubscribeParams
     * @param cb 订阅流的回调函数
     * @param updateCb  更新订阅流的回调函数
     * @returns 
     */

  }, {
    key: "subscribeStream",
    value: function subscribeStream(subscriptionId, publisherUserId, streamId, streamKind, params, cb, updateCb) {
      if (this.state.state() != State$3.Entered) {
        this.options.logger.info("We are not enter room, can not subscribe stream");
        return;
      }

      this.options.logger.info('room subscribe stream', this.remoteUsers.has(publisherUserId));

      if (this.remoteUsers.has(publisherUserId)) {
        this.remoteUsers.get(publisherUserId).subscribeStream(subscriptionId, streamId, streamKind, params, cb, updateCb);
        this.subUserIdMap.set(subscriptionId, publisherUserId);
      }
    }
  }, {
    key: "unsubscribeStream",
    value: function unsubscribeStream(subscriptionId, cb) {
      if (this.state.state() != State$3.Entered) {
        this.options.logger.info("We are not enter room, can not unsubscribe stream");
        return;
      }

      this.options.logger.debug('subUserIdMap', this.subUserIdMap, subscriptionId);

      if (this.subUserIdMap.has(subscriptionId)) {
        var userId = this.subUserIdMap.get(subscriptionId);

        if (this.remoteUsers.has(userId)) {
          this.remoteUsers.get(userId).unsubscribeStream(subscriptionId, cb);
          this.subUserIdMap["delete"](subscriptionId);
        } else {
          this.options.logger.info("unsubscription: " + subscriptionId + "  no related user");
        }
      } else {
        this.options.logger.info("unsubscription: " + subscriptionId + "  no related user");
      }
    }
  }, {
    key: "switchSimulcast",
    value: function switchSimulcast(subscriptionId, params, cb) {
      if (this.state.state() != State$3.Entered) {
        this.options.logger.info("We are not enter room, can not switchSimulcast");
        return;
      }

      if (this.subUserIdMap.has(subscriptionId)) {
        var userId = this.subUserIdMap.get(subscriptionId);

        if (this.remoteUsers.has(userId)) {
          this.remoteUsers.get(userId).switchSimulcast(subscriptionId, params, cb);
        }
      } else {
        this.options.logger.info("Subscription: " + subscriptionId + " not exist");
      }
    }
    /**
     * 切换角色权限
     * @param permission MsgStruct.Permission
     * @param cb 回调函数
     * @returns 
     */

  }, {
    key: "switchPermission",
    value: function switchPermission(permission, cb) {
      var _this = this;

      if (this.state.state() != State$3.Entered) {
        this.options.logger.info("We are not enter room, can not switchPermission");
        return;
      }

      this.localUser.switchPermission(permission, function (code, message, roomId) {
        if (code === RESPONSE_CODE.SUCCESS) {
          _this.login.updatePermission(permission);
        }

        if (cb) {
          cb(code, message, roomId);
        }
      });
    }
    /**
     * 获取当前ws的连接状态
     * @returns 
     */

  }, {
    key: "getWsState",
    value: function getWsState() {
      return this.rpcClient.getWsState();
    } //========================================================================

  }, {
    key: "onLogin",
    value: function onLogin(result, responseResult, errMessage) {
      if (result === LoginResult.LoginSuccess) {
        this.connectionStatus = ConnectionStatus.ConnectionConnected;

        if (!this.state.setState(State$3.Entered)) {
          return;
        }

        this.options.logger.info("Enter Room ".concat(this.options.roomId, " success"));

        if (this.roomCbs.enterRoomCb) {
          var participants = responseResult.room.participants;
          var roomUniqueId = responseResult.room.roomUniqueId;
          this.roomCbs.enterRoomCb(ResultCode.Success, null, {
            roomId: this.options.roomId,
            roomUniqueId: roomUniqueId,
            participants: participants
          });
        }

        var participantNotiFuncs = this.buildRemoteUserAndCollectNotification(responseResult, false);
        var streamNotiFuncs = this.buildRemoteStreamsAndCollectNotification(responseResult, false); // report notification 
        // 解决业务再进房后再添加监听事件，导致流通知收不到

        setTimeout(function () {
          var _iterator = _createForOfIteratorHelper$1(participantNotiFuncs),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var f = _step.value;
              f();
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }

          var _iterator2 = _createForOfIteratorHelper$1(streamNotiFuncs),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var _f = _step2.value;

              _f();
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }, 300);
      } else if (result === LoginResult.LoginTimeout) {
        if (!this.state.setState(State$3.EnterTimeout)) {
          return;
        }

        this.options.logger.info("Enter Room ".concat(this.options.roomId, " timeout"));

        if (this.roomCbs.enterRoomCb) {
          this.roomCbs.enterRoomCb(ResultCode.Timeout, errMessage, {
            roomId: this.options.roomId
          });
        }
      } else if (result === LoginResult.LoginFailed) {
        if (!this.state.setState(State$3.EnterFailed)) {
          return;
        }

        this.options.logger.info("Enter Room ".concat(this.options.roomId, " failed"));

        if (this.roomCbs.enterRoomCb) {
          this.roomCbs.enterRoomCb(ResultCode.Failed, errMessage, {
            roomId: this.options.roomId
          });
        }
      } else {
        this.options.logger.error("Enter room result type is invalid!");
      }
    }
  }, {
    key: "onRelogin",
    value: function () {
      var _onRelogin = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(success, sessionTimeout, responseResult) {
        var _offerSdp, participantNotiFuncs, streamNotiFuncs, offerSdp, roomUniqueId, _iterator3, _step3, _offerSdp2, user, _iterator4, _step4, f, _iterator5, _step5, _f2;

        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!success) {
                  _context.next = 18;
                  break;
                }

                this.connectionStatus = ConnectionStatus.ConnectionRecovery;
                this.options.logger.info('onRelogin:', success, sessionTimeout, responseResult); // firstly, send caching message that no response received in rpc client 
                // update local state

                participantNotiFuncs = this.buildRemoteUserAndCollectNotification(responseResult, true);
                streamNotiFuncs = this.buildRemoteStreamsAndCollectNotification(responseResult, true);
                offerSdp = false;

                if (!this.roomCbs.connectionRecoveryCb) {
                  _context.next = 11;
                  break;
                }

                roomUniqueId = responseResult.room.roomUniqueId;
                _context.next = 10;
                return this.roomCbs.connectionRecoveryCb(this.options.roomId, roomUniqueId, sessionTimeout);

              case 10:
                offerSdp = _context.sent;

              case 11:
                //when we relogin success, notify others connection recovery
                this.localUser.onConnectionRecovery(sessionTimeout, (_offerSdp = offerSdp) === null || _offerSdp === void 0 ? void 0 : _offerSdp.publishOfferSdp);
                _iterator3 = _createForOfIteratorHelper$1(this.remoteUsers.values());

                try {
                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                    user = _step3.value;
                    user.onConnectionRecovery(sessionTimeout, (_offerSdp2 = offerSdp) === null || _offerSdp2 === void 0 ? void 0 : _offerSdp2.subscribeOfferSdp);
                  } // report notification

                } catch (err) {
                  _iterator3.e(err);
                } finally {
                  _iterator3.f();
                }

                _iterator4 = _createForOfIteratorHelper$1(participantNotiFuncs);

                try {
                  for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                    f = _step4.value;
                    f();
                  }
                } catch (err) {
                  _iterator4.e(err);
                } finally {
                  _iterator4.f();
                }

                _iterator5 = _createForOfIteratorHelper$1(streamNotiFuncs);

                try {
                  for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                    _f2 = _step5.value;

                    _f2();
                  }
                } catch (err) {
                  _iterator5.e(err);
                } finally {
                  _iterator5.f();
                }

              case 18:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function onRelogin(_x, _x2, _x3) {
        return _onRelogin.apply(this, arguments);
      }

      return onRelogin;
    }()
  }, {
    key: "onLogout",
    value: function onLogout(result, errMessage) {
      if (result === LogoutResult.LogoutSuccess) {
        if (!this.state.setState(State$3.Exited)) {
          return;
        }

        this.options.logger.info("Exit Room " + this.options.roomId + " success");

        if (this.roomCbs.exitRoomCb) {
          this.roomCbs.exitRoomCb(ResultCode.Success, null, {
            roomId: this.options.roomId,
            reason: ExitRoomReason.ActivelyLeave
          });
        }

        if (this.rpcClient) {
          this.rpcClient.close();
          this.rpcClient = null;
        }
      } else if (result === LogoutResult.LogoutFailed) {
        if (!this.state.setState(State$3.ExitFailed)) {
          return;
        }

        if (this.roomCbs.exitRoomCb) {
          this.options.logger.info("exit room failed");
          this.roomCbs.exitRoomCb(ResultCode.Failed, errMessage, {
            roomId: this.options.roomId,
            reason: ExitRoomReason.ActivelyLeave
          });
        }
      } else if (result === LogoutResult.LogoutTimeout) {
        if (!this.state.setState(State$3.ExitTimeout)) {
          return;
        }

        this.options.logger.info("Exit Room " + this.options.roomId + " timeout");

        if (this.roomCbs.exitRoomCb) {
          this.options.logger.info("exit room timeout");
          this.roomCbs.exitRoomCb(ResultCode.Failed, errMessage, {
            roomId: this.options.roomId,
            reason: ExitRoomReason.ActivelyLeave
          });
        }
      } else {
        this.options.logger.error("Exit room result type is invalid!");
      }
    }
  }, {
    key: "onNotification",
    value: function onNotification(notification) {
      this.options.logger.info("room: " + this.options.roomId + " receive notification message");
      var method = notification.method;

      if (method) {
        if (method === "participant") {
          var action = notification.params.type;

          if (action === "join") {
            var joinParams = notification.params;
            var join = {
              participant: {
                userId: joinParams.userId,
                previousRoomId: joinParams.previousRoomId,
                userData: joinParams.userData
              }
            };
            this.buildRemoteUser(join.participant);

            if (this.roomCbs.notificationCb) {
              this.options.logger.info("user: " + join.participant.userId + "join notification");
              this.roomCbs.notificationCb(this.options.roomId, NotificationType.ParticipantJoin, join);
            }
          } else if (action === "leave") {
            var leaveParams = notification.params;
            var leave = {
              userId: leaveParams.userId,
              reason: leaveParams.reason
            };

            if (this.remoteUsers.has(leave.userId)) {
              this.deleteRemoteUser(leave.userId);
            }

            if (this.roomCbs.notificationCb) {
              this.options.logger.info("user: " + leave.userId + "leave notification");
              this.roomCbs.notificationCb(this.options.roomId, NotificationType.ParticipantLeave, leave);
            }
          } else {
            this.options.logger.error("participant notification type error!!!");
          }
        } else if (method === "stream") {
          var _action = notification.params.type;

          if (_action === "add") {
            var addParams = notification.params;
            var add = {
              stream: getStreamFromStreamAddMessage(addParams)
            };

            if (this.remoteUsers.has(add.stream.userId)) {
              this.buildRemoteStream(add.stream);

              if (this.roomCbs.notificationCb) {
                this.options.logger.info("user: " + add.stream.userId + ", stream " + add.stream.streamId + " add notification");
                this.roomCbs.notificationCb(this.options.roomId, NotificationType.StreamAdd, add);
              }
            }
          } else if (_action === "remove") {
            var removeParams = notification.params;
            var remove = {
              userId: removeParams.userId,
              streamId: removeParams.streamId
            };

            if (this.remoteStreams.has(remove.streamId)) {
              this.deleteRemoteStream(remove.streamId);

              if (this.roomCbs.notificationCb) {
                this.options.logger.info("user: " + remove.userId + ", stream " + remove.streamId + " remove notification");
                this.roomCbs.notificationCb(this.options.roomId, NotificationType.StreamRemove, remove);
              }
            }
          } else if (_action === "update") {
            var updateParams = notification.params;
            var update = {
              userId: updateParams.userId,
              streamId: updateParams.streamId,
              liveStatus: updateParams.data.liveStatus,
              userData: updateParams.userData
            }; //  更新更新大小流

            if (updateParams.data.simulcast && this.remoteStreams.has(update.streamId)) {
              update.simulcast = getSimulcastFromMessage(updateParams.data.simulcast);
              this.remoteStreams.get(update.streamId).info.video.simulcast = update.simulcast;
              this.remoteUsers.get(update.userId).updateStreamSimulcast(update.streamId, update.simulcast);
            } // muted 和 unmuted 通知


            if (updateParams.data.liveStatus) {
              update.liveStatus = updateParams.data.liveStatus;

              if (this.remoteStreams.has(update.streamId)) {
                if (update.liveStatus.audio) {
                  this.remoteStreams.get(update.streamId).info.audio.muted = update.liveStatus.audio.muted;
                }

                if (update.liveStatus.video) {
                  this.remoteStreams.get(update.streamId).info.video.muted = update.liveStatus.video.muted;
                }

                this.remoteUsers.get(update.userId).updateStreamStatus(update.streamId, update.liveStatus);
              }
            }

            if (this.roomCbs.notificationCb) {
              this.options.logger.info("user: " + update.userId + ", stream " + update.streamId + " update notification");
              this.roomCbs.notificationCb(this.options.roomId, NotificationType.StreamUpdate, update);
            }
          } else {
            this.options.logger.error("Stream notification type error!!!");
          }
        } else if (method === "drop") {
          var _this$rpcClient;

          var dropParams = notification.params;
          var drop = {
            cause: getDropCauseFromCauseStr(dropParams.cause)
          };

          if (!this.state.setState(State$3.Destroyed)) {
            return;
          }

          if (this.roomCbs.notificationCb) {
            this.options.logger.info("drop notification");
            this.roomCbs.notificationCb(this.options.roomId, NotificationType.Drop, drop);
          }

          (_this$rpcClient = this.rpcClient) === null || _this$rpcClient === void 0 ? void 0 : _this$rpcClient.close();
        } else if (method === "permission") {
          var permissionChangeParams = notification.params;
          var permissionChange = {
            userId: permissionChangeParams.userId,
            publish: permissionChangeParams.publish,
            subscribe: permissionChangeParams.subscribe,
            control: permissionChangeParams.control
          };

          if (this.roomCbs.notificationCb) {
            this.options.logger.info("permission change notification");
            this.roomCbs.notificationCb(this.options.roomId, NotificationType.PermissionChange, permissionChange);
          }

          var havePubPermission = permissionChange.publish && (permissionChange.publish.audio || permissionChange.publish.video);
          var userExist = this.remoteUsers.has(permissionChange.userId);

          if (!userExist) {
            if (havePubPermission) {
              var participant = {
                userId: permissionChange.userId,
                previousRoomId: '',
                userData: {
                  userId: permissionChange.userId,
                  userName: ''
                }
              };
              this.buildRemoteUser(participant);

              if (this.roomCbs.notificationCb) {
                this.options.logger.info("user: " + participant.userId + "join notification");
                this.roomCbs.notificationCb(this.options.roomId, NotificationType.ParticipantJoin, {
                  participant: participant
                });
              }
            }
          } else {
            if (!havePubPermission) {
              this.deleteRemoteUser(permissionChange.userId);
              var _leave = {
                userId: permissionChange.userId,
                reason: PaticipantLeaveReason.Normal
              };

              if (this.roomCbs.notificationCb) {
                this.options.logger.info("user: " + _leave.userId + "leave notification");
                this.roomCbs.notificationCb(this.options.roomId, NotificationType.ParticipantLeave, _leave);
              }
            }
          }
        }
      }
    }
  }, {
    key: "onRpcStateChange",
    value: function onRpcStateChange(prevState, state, retryCount) {
      this.options.logger.info("prevState: ".concat(prevState, ",state: ").concat(state));

      if (state === "DISCONNECTED") {
        this.onConnectionLost();
      } else if (state === "RECONNECTING") {
        this.onTryToReconenct();
      } else if (state === "RECOVERY") {
        this.onConnectionRecovery();
      } else ;

      if (this.roomCbs.onWsStateChange) {
        this.roomCbs.onWsStateChange(this.options.roomId, prevState, state);
      }
    }
  }, {
    key: "onConnectionLost",
    value: function onConnectionLost() {
      this.options.logger.info("room: " + this.options.roomId + " connection lost!!!");
      this.connectionStatus = ConnectionStatus.ConnectionLost;
      this.login.onConnectionLost();
      this.localUser.onConnectionLost();

      var _iterator6 = _createForOfIteratorHelper$1(this.remoteUsers.values()),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var user = _step6.value;
          user.onConnectionLost();
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      if (this.roomCbs.connectionLostCb) {
        this.roomCbs.connectionLostCb(this.options.roomId);
      }

      if (this.state.state() == State$3.Entered) {
        // TODO : call json rpc client try to reconnect
        this.rpcClient.reconnect();
      }
    }
  }, {
    key: "onTryToReconenct",
    value: function onTryToReconenct() {
      this.options.logger.info("room: " + this.options.roomId + " connection retring ......");
      this.connectionStatus = ConnectionStatus.ConnectionRetring;

      if (this.roomCbs.tryToReconnectCb) {
        this.roomCbs.tryToReconnectCb(this.options.roomId);
      }
    }
  }, {
    key: "onConnectionRecovery",
    value: function onConnectionRecovery() {
      this.options.logger.info("room: ".concat(this.options.roomId, " connection recovery!!!"));

      if (this.state.state() != State$3.Entering) {
        // may we receive drop notification after we sent relogin request but before response received
        this.login.onConnectionRecovery();
      } // ohter recover will sent in relogin success callback

    }
  }, {
    key: "onRpcReconnectFailed",
    value: function onRpcReconnectFailed() {
      this.options.logger.info("room: " + this.options.roomId + " reconnection failed!!!");

      if (this.roomCbs.onWsReconnectFailed) {
        this.roomCbs.onWsReconnectFailed(this.options.roomId);
      }
    }
  }, {
    key: "initJsonRpcClient",
    value: function initJsonRpcClient(userId) {
      var rpcOptions = {
        userId: userId,
        wsUrl: this.options.serverUrl,
        onRequest: null,
        onNotification: this.onNotification.bind(this),
        onError: this.roomCbs.onWsError,
        onConnect: null,
        onWsStateChange: this.onRpcStateChange.bind(this),
        onWsReconnectFailed: this.onRpcReconnectFailed.bind(this)
      };
      this.rpcClient = new JsonRpcClient(rpcOptions, this.options.logger);
      this.rpcClient.connect();
    }
  }, {
    key: "initLoginAndLocalUser",
    value: function initLoginAndLocalUser(appId, userId, type, previousRoomId, permission, userData) {
      var loginoptions = {
        appId: appId,
        userId: userId,
        userType: type,
        roomId: this.options.roomId,
        previousRoomId: previousRoomId,
        userAgent: userAgent,
        permission: permission,
        userData: userData,
        rpcClient: this.rpcClient,
        logger: this.options.logger,
        loginCb: this.onLogin.bind(this),
        reloginCb: this.onRelogin.bind(this),
        logoutCb: this.onLogout.bind(this)
      };
      this.login = new Login(loginoptions);
      var userOptions = {
        userId: userId,
        roomId: this.options.roomId,
        previousRoomId: previousRoomId,
        userAgent: loginoptions.userAgent,
        permission: permission,
        userData: userData,
        rpcClient: this.rpcClient,
        logger: this.options.logger
      };
      this.localUser = new LocalUser(userOptions);
    }
  }, {
    key: "buildRemoteUser",
    value: function buildRemoteUser(participant) {
      var userId = participant.userId;
      var userOptions = {
        roomId: this.options.roomId,
        participant: participant,
        rpcClient: this.rpcClient,
        logger: this.options.logger
      };
      var remoteUser = new RemoteUser(userOptions);
      this.remoteUsers.set(userId, remoteUser);
      this.remoteUserIdArray.push(userId);
      this.options.logger.info('this.remoteUsers', this.remoteUsers);
    }
  }, {
    key: "deleteRemoteStream",
    value: function deleteRemoteStream(streamId) {
      if (this.remoteStreams.has(streamId)) {
        var userId = this.remoteStreams.get(streamId).userId;

        if (this.remoteUsers.has(userId)) {
          this.remoteUsers.get(userId).deleteStream(streamId);
        }

        if (this.remoteStreams.has(streamId)) {
          this.remoteStreams["delete"](streamId);
        }

        var index = this.remoteStreamIdArray.indexOf(streamId);

        if (index != -1) {
          this.remoteStreamIdArray.splice(index, 1);
        }
      }
    }
  }, {
    key: "deleteRemoteUser",
    value: function deleteRemoteUser(userId) {
      if (this.remoteUsers.has(userId)) {
        var streamIds = this.remoteUsers.get(userId).getAllStreamId();

        var _iterator7 = _createForOfIteratorHelper$1(streamIds),
            _step7;

        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var id = _step7.value;
            this.deleteRemoteStream(id);
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
        }

        this.remoteUsers["delete"](userId);
        var index = this.remoteUserIdArray.indexOf(userId);

        if (index != -1) {
          this.remoteUserIdArray.splice(index, 1);
        }
      }
    }
  }, {
    key: "buildRemoteStream",
    value: function buildRemoteStream(stream) {
      var streamId = stream.streamId;
      var userId = stream.userId;
      this.remoteUsers.get(userId).addStream(stream);
      this.remoteStreams.set(streamId, stream);
      this.remoteStreamIdArray.push(streamId);
    }
  }, {
    key: "buildRemoteUserAndCollectNotification",
    value: function buildRemoteUserAndCollectNotification(result, relogin) {
      var _this2 = this;

      var notificationFuncs = new Array();

      if (!relogin) {
        // first login response
        var _iterator8 = _createForOfIteratorHelper$1(result.room.participants),
            _step8;

        try {
          var _loop = function _loop() {
            var member = _step8.value;
            // report currrent members in room
            var join = {
              participant: member
            };

            if (member.userId === _this2.localUser.getUserId()) {
              // myself, skip it
              return "continue";
            }

            _this2.buildRemoteUser(member);

            notificationFuncs.push(function () {
              if (_this2.roomCbs.notificationCb) {
                _this2.options.logger.info("user: ".concat(join.participant.userId, " join notification"));

                _this2.roomCbs.notificationCb(_this2.options.roomId, NotificationType.ParticipantJoin, join);
              }
            });
          };

          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var _ret = _loop();

            if (_ret === "continue") continue;
          }
        } catch (err) {
          _iterator8.e(err);
        } finally {
          _iterator8.f();
        }
      } else {
        // relogin response
        var _iterator9 = _createForOfIteratorHelper$1(result.room.participants),
            _step9;

        try {
          var _loop2 = function _loop2() {
            var member = _step9.value;
            // report currrent members in room
            var join = {
              participant: member
            };
            var userId = member.userId;

            if (userId === _this2.localUser.getUserId()) {
              // myself, skip it
              return "continue";
            }

            if (!_this2.remoteUsers.has(userId)) {
              // new member join room when we connection lost
              _this2.buildRemoteUser(member);

              notificationFuncs.push(function () {
                if (_this2.roomCbs.notificationCb) {
                  _this2.options.logger.info("user: " + join.participant.userId + "join notification");

                  _this2.roomCbs.notificationCb(_this2.options.roomId, NotificationType.ParticipantJoin, join);
                }
              });
            } else {// old user still in room
              // nothing to do
            }
          };

          for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
            var _ret2 = _loop2();

            if (_ret2 === "continue") continue;
          }
        } catch (err) {
          _iterator9.e(err);
        } finally {
          _iterator9.f();
        }

        var old_user_ids = JSON.parse(JSON.stringify(this.remoteUserIdArray)); // deeping copy

        var _iterator10 = _createForOfIteratorHelper$1(old_user_ids),
            _step10;

        try {
          for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
            var id = _step10.value;
            var notFound = true;

            var _iterator11 = _createForOfIteratorHelper$1(result.room.participants),
                _step11;

            try {
              for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                var participant = _step11.value;

                if (participant.userId === id) {
                  notFound = false;
                }
              }
            } catch (err) {
              _iterator11.e(err);
            } finally {
              _iterator11.f();
            }

            if (notFound) {
              // old user leave room when we connection lost
              this.deleteRemoteUser(id);
              var leave = {
                userId: id,
                reason: PaticipantLeaveReason.Normal
              };

              if (this.roomCbs.notificationCb) {
                this.options.logger.info("user: " + leave.userId + "leave notification");
                this.roomCbs.notificationCb(this.options.roomId, NotificationType.ParticipantLeave, leave);
              }
            }
          }
        } catch (err) {
          _iterator10.e(err);
        } finally {
          _iterator10.f();
        }
      }

      return notificationFuncs;
    }
  }, {
    key: "buildRemoteStreamsAndCollectNotification",
    value: function buildRemoteStreamsAndCollectNotification(result, relogin) {
      var _this3 = this;

      var notificationFuncs = new Array();

      if (!relogin) {
        var _iterator12 = _createForOfIteratorHelper$1(result.room.streams),
            _step12;

        try {
          var _loop3 = function _loop3() {
            var stream = _step12.value;
            // report currrent publiushed streams in room
            var streamAdd = {
              stream: getStreamFromLoginMessage(stream)
            };
            var userId = stream.userId;
            var streamId = stream.streamId;

            if (userId === _this3.localUser.getUserId()) {
              // myself, skip it
              return "continue";
            }

            if (_this3.remoteUsers.has(userId)) {
              _this3.buildRemoteStream(streamAdd.stream);

              notificationFuncs.push(function () {
                if (_this3.roomCbs.notificationCb) {
                  _this3.options.logger.info("user: " + userId + ", stream " + streamId + " add notification");

                  _this3.roomCbs.notificationCb(_this3.options.roomId, NotificationType.StreamAdd, streamAdd);
                }
              });
            } else {
              _this3.options.logger.error("Stream " + streamId + " no related user!");

              return {
                v: notificationFuncs
              };
            }
          };

          for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
            var _ret3 = _loop3();

            if (_ret3 === "continue") continue;
            if (_typeof(_ret3) === "object") return _ret3.v;
          }
        } catch (err) {
          _iterator12.e(err);
        } finally {
          _iterator12.f();
        }
      } else {
        // relogin response
        var oldStreamIds = JSON.parse(JSON.stringify(this.remoteStreamIdArray)); // deeping copy

        var _iterator13 = _createForOfIteratorHelper$1(oldStreamIds),
            _step13;

        try {
          for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
            var streamId = _step13.value;
            var notFound = true;

            var _iterator15 = _createForOfIteratorHelper$1(result.room.streams),
                _step15;

            try {
              for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
                var s = _step15.value;

                if (s.streamId === streamId) {
                  notFound = false;
                }
              }
            } catch (err) {
              _iterator15.e(err);
            } finally {
              _iterator15.f();
            }

            if (notFound) {
              // old stream unpublish when we connection lost 
              if (this.remoteStreams.has(streamId)) {
                var userId = this.remoteStreams.get(streamId).userId;
                this.deleteRemoteStream(streamId);
                var streamRemove = {
                  userId: userId,
                  streamId: streamId
                };

                if (this.roomCbs.notificationCb) {
                  this.options.logger.info("user: " + streamRemove.userId + ", stream " + streamRemove.streamId + " remove notification");
                  this.roomCbs.notificationCb(this.options.roomId, NotificationType.StreamRemove, streamRemove);
                }
              }
            }
          }
        } catch (err) {
          _iterator13.e(err);
        } finally {
          _iterator13.f();
        }

        var _iterator14 = _createForOfIteratorHelper$1(result.room.streams),
            _step14;

        try {
          var _loop4 = function _loop4() {
            var s = _step14.value;
            var streamAdd = {
              stream: getStreamFromLoginMessage(s)
            };
            var userId = s.userId;
            var streamId = s.streamId;

            if (userId === _this3.localUser.getUserId()) {
              // myself, skip it
              return "continue";
            }

            if (!_this3.remoteStreams.has(streamId)) {
              // new stream publish when we connection lost
              if (_this3.remoteUsers.has(userId)) {
                // stream owner must exist
                _this3.buildRemoteStream(streamAdd.stream);

                notificationFuncs.push(function () {
                  if (_this3.roomCbs.notificationCb) {
                    _this3.options.logger.info("user: " + userId + ", stream " + streamId + " add notification");

                    _this3.roomCbs.notificationCb(_this3.options.roomId, NotificationType.StreamAdd, streamAdd);
                  }
                });
              } else {
                _this3.options.logger.error("Stream " + streamId + " no related user!");

                return {
                  v: notificationFuncs
                };
              }
            } else {
              // stream find, check stream state change
              var audioStatusChange = s.info.audio && s.info.audio.muted != _this3.remoteStreams.get(streamId).info.audio.muted;

              if (audioStatusChange) {
                var status = {
                  audio: {
                    muted: s.info.audio.muted,
                    floor: s.info.audio.floor
                  }
                };
                _this3.remoteStreams.get(streamId).info.audio.muted = s.info.audio.muted;
                _this3.remoteStreams.get(streamId).info.audio.floor = s.info.audio.floor;

                _this3.remoteUsers.get(userId).updateStreamStatus(streamId, status);

                var streamUpdate = {
                  userId: userId,
                  streamId: streamId,
                  liveStatus: status
                };
                notificationFuncs.push(function () {
                  if (_this3.roomCbs.notificationCb) {
                    _this3.options.logger.info("user: " + userId + ", stream " + streamId + " update notification");

                    _this3.roomCbs.notificationCb(_this3.options.roomId, NotificationType.StreamUpdate, streamUpdate);
                  }
                });
              }

              var videoStatusChange = s.info.video && s.info.video.muted != _this3.remoteStreams.get(streamId).info.video.muted;

              if (videoStatusChange) {
                var _status = {
                  video: {
                    muted: s.info.video.muted,
                    floor: s.info.video.floor
                  }
                };
                _this3.remoteStreams.get(streamId).info.video.muted = s.info.video.muted;
                _this3.remoteStreams.get(streamId).info.video.floor = s.info.video.floor;

                _this3.remoteUsers.get(userId).updateStreamStatus(streamId, _status);

                var _streamUpdate = {
                  userId: userId,
                  streamId: streamId,
                  liveStatus: _status
                };
                notificationFuncs.push(function () {
                  if (_this3.roomCbs.notificationCb) {
                    _this3.options.logger.info("user: " + userId + ", stream " + streamId + " update notification");

                    _this3.roomCbs.notificationCb(_this3.options.roomId, NotificationType.StreamUpdate, _streamUpdate);
                  }
                });
              }

              var videoSimulcastChange = s.info.video && s.info.video.simulcast && s.info.video.simulcast.length != _this3.remoteStreams.get(streamId).info.video.simulcast.length;

              if (videoSimulcastChange) {
                var simulcast = getSimulcastFromMessage(s.info.video.simulcast);
                _this3.remoteStreams.get(streamId).info.video.simulcast = simulcast;

                _this3.remoteUsers.get(userId).updateStreamSimulcast(streamId, simulcast);

                var _streamUpdate2 = {
                  userId: userId,
                  streamId: streamId,
                  simulcast: simulcast
                };
                notificationFuncs.push(function () {
                  if (_this3.roomCbs.notificationCb) {
                    _this3.options.logger.info("user: " + userId + ", stream " + streamId + " update notification");

                    _this3.roomCbs.notificationCb(_this3.options.roomId, NotificationType.StreamUpdate, _streamUpdate2);
                  }
                });
              }
            }
          };

          for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
            var _ret4 = _loop4();

            if (_ret4 === "continue") continue;
            if (_typeof(_ret4) === "object") return _ret4.v;
          }
        } catch (err) {
          _iterator14.e(err);
        } finally {
          _iterator14.f();
        }
      }

      return notificationFuncs;
    }
  }]);

  return Room;
}();

/**
 * 获取G-uid
 * @returns string
 */
function getGuid() {
  function S4() {
    return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
  }

  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

var XsigoStackClient = /*#__PURE__*/function () {
  function XsigoStackClient(logger, roomCbs) {
    _classCallCheck(this, XsigoStackClient);

    this.rooms = new Map();
    this.logger = logger;
    this.roomCbs = roomCbs;
  }
  /**
   * 加入房间
   * @param roomId 房间唯一标识
   * @param options FParams.enterRoomOptions
   */


  _createClass(XsigoStackClient, [{
    key: "enterRoom",
    value: function enterRoom(roomId, options) {
      var appId = options.appId,
          userId = options.userId,
          userType = options.userType,
          previousRoomId = options.previousRoomId,
          permission = options.permission,
          userData = options.userData,
          serverUrl = options.serverUrl,
          enterRoomCb = options.enterRoomCb;
      this.logger.info("XsigoStackClient enterRoom: " + roomId);

      if (!this.rooms.has(roomId)) {
        var roomOptions = {
          roomId: roomId,
          serverUrl: serverUrl,
          logger: this.logger,
          roomCbs: this.roomCbs
        };
        var room = new Room(roomOptions);
        this.rooms.set(roomId, room);
      }

      this.rooms.get(roomId).enter(appId, userId, userType, previousRoomId, permission, userData, enterRoomCb);
    }
    /**
     * 离开房间
     * @param roomId 房间唯一标识
     * @param exitRoomCb 离开房间的回调
     * @returns 空
     */

  }, {
    key: "exitRoom",
    value: function exitRoom(roomId, exitRoomCb) {
      this.logger.info("XsigoStackClient exitRoom: " + roomId);

      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).exit(exitRoomCb);
        this.rooms["delete"](roomId);
        return;
      }

      this.logger.error("XsigoStackClient exitRoom: " + roomId + "error, room not exist");
    }
    /**
     *  推流
     * @param roomId 房间唯一标识
     * @param options FParams.publishStreamOptions
     * @returns 
     */

  }, {
    key: "publishStream",
    value: function publishStream(roomId, options) {
      var streamType = options.streamType,
          streamKind = options.streamKind,
          params = options.params,
          cb = options.cb,
          updateCb = options.updateCb;
      var streamId = getGuid();
      this.logger.info("XsigoStackClient publishStream :  " + streamId + " in room" + roomId, this.rooms.has(roomId));

      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).publishStream(streamId, streamType, streamKind, params, cb, updateCb);
        return streamId;
      }
    }
    /**
     *  取消推流
     * @param roomId 房间唯一标识
     * @param streamId 流的唯一标识
     * @param cb 推流的回调函数 Cbs.UnpublishCallback
     */

  }, {
    key: "unpublishStream",
    value: function unpublishStream(roomId, streamId, cb) {
      this.logger.info("XsigoStackClient unpublishTream :  " + streamId + " in room" + roomId);

      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).unpublishStream(streamId, cb);
      }
    }
    /**
     * 更新大小流
     * @param roomId 房间唯一标识
     * @param streamId 流的唯一标识
     * @param params MsgStruct.PublishControlParams
     */

  }, {
    key: "updateSimulcast",
    value: function updateSimulcast(roomId, streamId, params, cb) {
      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).updateSimulcast(streamId, params, cb);
      }
    }
    /**
     * 音频静音
     * @param roomId 房间的唯一标识
     * @param options FParams.muteUnmuteAudioVideoOptions
     */

  }, {
    key: "muteAudio",
    value: function muteAudio(roomId, streamId, cb, userData) {
      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).muteLocalAudio(streamId, cb, userData);
      }
    }
    /**
     * muteVideo 
     * @param roomId 房间的唯一标识
     * @param options FParams.muteUnmuteAudioVideoOptions
     */

  }, {
    key: "muteVideo",
    value: function muteVideo(roomId, streamId, cb, userData) {
      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).muteLocalVideo(streamId, cb, userData);
      }
    }
    /**
     * 取消音频静音
     * @param roomId 房间的唯一标识
     * @param options FParams.muteUnmuteAudioVideoOptions
     */

  }, {
    key: "unmuteAudio",
    value: function unmuteAudio(roomId, streamId, cb, userData) {
      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).unmuteLocalAudio(streamId, cb, userData);
      }
    }
    /**
     * unmuteVideo
     * @param roomId 房间的唯一标识
     * @param streamId FParams.muteUnmuteAudioVideoOptions
     */

  }, {
    key: "unmuteVideo",
    value: function unmuteVideo(roomId, streamId, cb, userData) {
      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).unmuteLocalVideo(streamId, cb, userData);
      }
    }
    /**
     * 订阅流
     * @param roomId 房间的唯一标识
     * @param options FParams.subscribeStreamOptions
     * @returns 订阅流的唯一标识 subscriptionId 
     */

  }, {
    key: "subscribeStream",
    value: function subscribeStream(roomId, options) {
      var publisherUserId = options.publisherUserId,
          streamId = options.streamId,
          streamKind = options.streamKind,
          params = options.params,
          cb = options.cb,
          updateCb = options.updateCb;
      this.logger.info("XsigoStackClient subscribeStream :  " + streamId + " in room" + roomId);
      var subscriptionId = getGuid();

      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).subscribeStream(subscriptionId, publisherUserId, streamId, streamKind, params, cb, updateCb);
        return subscriptionId;
      }

      return "";
    }
    /**
     * 取消订阅
     * @param roomId 房间的唯一标识
     * @param subscriptionId 订阅流的唯一标识
     *  @param cb 取消订阅的回调
     */

  }, {
    key: "unsubscribeStream",
    value: function unsubscribeStream(roomId, subscriptionId, cb) {
      this.logger.info("XsigoStackClient unsubscribe :  " + subscriptionId + " in room" + roomId);

      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).unsubscribeStream(subscriptionId, cb);
      }
    }
    /**
     * 切换订阅流的大小流
     * @param roomId 房间的唯一标识
     * @param subscriptionId 订阅流的唯一标识
     * @param params MsgStruct.SubscribeControlParams
     */

  }, {
    key: "switchSimulcast",
    value: function switchSimulcast(roomId, subscriptionId, params, cb) {
      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).switchSimulcast(subscriptionId, params, cb);
      }
    }
    /**
     * 切换权限
     * @param roomId 房间的唯一标识
     * @param permission 权限
     * @param cb 切换权限的回调函数
     */

  }, {
    key: "switchPermission",
    value: function switchPermission(roomId, permission, cb) {
      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).switchPermission(permission, cb);
      }
    }
    /**
     * 获取当前ws的连接状态
     * @param roomId 房间的唯一标识
     */

  }, {
    key: "getWsState",
    value: function getWsState(roomId) {
      if (this.rooms.has(roomId)) {
        return this.rooms.get(roomId).getWsState();
      }
    }
    /**
    * 判断网络连接是否断开
    * @param roomId 房间的唯一标识
    */

  }, {
    key: "isDisconnected",
    value: function isDisconnected(roomId) {
      var _this$getWsState = this.getWsState(roomId),
          state = _this$getWsState.state;

      if (!['CONNECTED', 'RECOVERY'].includes(state)) {
        this.logger.warn('cannot operate during network disconnection');
      }

      return !['CONNECTED', 'RECOVERY'].includes(state);
    }
  }]);

  return XsigoStackClient;
}();

/**
 * 请求超时
 * @param timeout 
 * @param controller 
 * @returns 
 */

var timeoutPromise = function timeoutPromise(timeout, controller) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(new Response("timeout", {
        status: 504,
        statusText: "request timeout"
      }));
      controller.abort();
    }, timeout);
  });
};
/**
 * Api 模块
 */


var Api = {
  appKey: null,
  authorization: '',
  timeout: 5 * 1000,
  ssl: true,

  /**
   * 获取baseUrl
   * @param url 
   * @returns string
   */
  baseUrl: function baseUrl(url) {
    if (url.includes("//")) {
      return url;
    }

    return "".concat(this.ssl ? 'https://' : 'http://').concat(url);
  },

  /**
  * 获取应用配置
  * @
  */
  getAppConfig: function getAppConfig(ssl, path, sdkAppId, userSig) {
    var _this = this;

    this.ssl = ssl;
    this.appKey = sdkAppId;
    this.authorization = userSig;
    var controller = new AbortController();

    var requestPromise = function requestPromise() {
      return fetch("".concat(_this.baseUrl(path), "/api/v1/app/config/get?appId=").concat(sdkAppId), {
        method: 'GET',
        // or 'PUT'
        headers: new Headers({
          'Content-Type': 'application/json',
          'appKey': _this.appKey,
          'Authorization': _this.authorization
        }),
        signal: controller.signal
      });
    };

    return Promise.race([timeoutPromise(this.timeout, controller), requestPromise()]).then(function (response) {
      if (response.ok) {
        return response.json();
      } else if (response.status === 401) {
        throw new ER({
          code: ERCode.AUTHORIZATION_FAILED,
          message: 'Authorization failed: /api/v1/app/config/get?appId'
        });
      } else if (response.status === 404) {
        throw new ER({
          code: ERCode.GET_SERVER_NODE_FAILED,
          message: '404: /api/v1/app/config/get?appId'
        });
      } else if (response.status === 504) {
        throw new ER({
          code: ERCode.REQUEST_TIMEOUT,
          message: "".concat(response.statusText, ": /api/v1/app/config/get?appId")
        });
      } else {
        throw new ER({
          code: ERCode.SERVER_UNKNOWN_ERROR,
          message: 'Server unknown error: /api/v1/app/config/get?appId'
        });
      }
    })["catch"](function (e) {
      return Promise.reject(e);
    });
  },

  /**
   * 获取 ws 连接地址
   * @param ip 
   * @param roomId 
   */
  getWsUrl: function getWsUrl(ip, roomId) {
    var _this2 = this;

    var url = "".concat(this.baseUrl(ip), "/api/v1/dispatch/get-can-use?mucNum=").concat(roomId);
    var controller = new AbortController();

    var requestPromise = function requestPromise() {
      return fetch(url, {
        method: 'GET',
        // or 'PUT'
        headers: new Headers({
          'Content-Type': 'application/json',
          'appKey': _this2.appKey,
          'Authorization': _this2.authorization
        }),
        signal: controller.signal
      });
    };

    return Promise.race([timeoutPromise(this.timeout, controller), requestPromise()]).then(function (response) {
      if (response.ok) {
        return response.json();
      } else if (response.status === 401) {
        throw new ER({
          code: ERCode.AUTHORIZATION_FAILED,
          message: 'Authorization failed: /api/v1/dispatch/get-can-use?mucNum'
        });
      } else if (response.status === 404) {
        throw new ER({
          code: ERCode.GET_SERVER_NODE_FAILED,
          message: '404: /api/v1/dispatch/get-can-use?mucNum'
        });
      } else if (response.status === 504) {
        throw new ER({
          code: ERCode.REQUEST_TIMEOUT,
          message: "".concat(response.statusText, ": /api/v1/dispatch/get-can-use?mucNum")
        });
      } else {
        throw new ER({
          code: ERCode.SERVER_UNKNOWN_ERROR,
          message: 'Server unknown error: /api/v1/dispatch/get-can-use?mucNum'
        });
      }
    })["catch"](function (e) {
      return Promise.reject(e);
    });
  },

  /**
  * 日志上传接口
  * @param path 路径
  * @param list 日志集合
  * @returns Promise
  */
  upload: function upload(type, path, list) {
    var url = {
      general: "".concat(this.baseUrl(path), "/api/v1/logging/collect/list"),
      buried: "".concat(this.baseUrl(path), "/api/v1/logging/collect/list/event")
    }[type];
    return fetch(url, {
      method: "POST",
      // or 'PUT'
      body: JSON.stringify(list),
      // data can be `string` or {object}!
      headers: new Headers({
        "Content-Type": "application/json",
        'appKey': this.appKey,
        'Authorization': this.authorization
      }) // keepalive: true // 用于页面卸载时，告诉浏览器在后台保持连接，继续发送数据

    }).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new ER({
          code: response.status,
          message: response.statusText
        });
      }
    })["catch"](function (e) {
      return Promise.reject(e);
    });
  }
};

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Client = /*#__PURE__*/function () {
  function Client(clientConfig, logger) {
    _classCallCheck(this, Client);

    this.logger = logger;

    if (clientConfig.wsUrl.includes('https')) {
      this.ssl = true;
    } else if (clientConfig.wsUrl.includes('http')) {
      this.ssl = false;
    } else {
      this.ssl = clientConfig.ssl !== false;
    }

    this.wsUrl = clientConfig.wsUrl;
    this.userId = clientConfig.userId;
    this.userName = clientConfig.userName;
    this.mode = clientConfig.mode;
    this.sdkAppId = clientConfig.sdkAppId;
    this.userSig = clientConfig.userSig;
    this.appConfig = null;
    this.init();
  }
  /**
   * 初始化
   */


  _createClass(Client, [{
    key: "init",
    value: function init() {
      var _this = this;

      this.publications = new Map();
      this.subscriptions = new Map();
      this.roomId = null;
      this.role = anchor;
      this.remoteStreams = new Map();
      this.state = ClientState.New;
      this.localStreams = [];
      this.isEnableSmallStream = false;
      this._emitter = new EventEmitter(this.logger);
      this.subscribeManager = new SubscribeManager(this.logger);
      this._interval = -1;
      this._remoteMutedStateMap = new Map();
      this.audioVolumeInterval = null;
      this.smallStreamConfig = {
        width: 160,
        height: 120,
        bitrate: 100,
        framerate: 15
      };
      this.logger.setUserId(this.userId);
      this.logger.setRoomId(this.roomId); // 实例化xsigo client

      this.xsigoClient = new XsigoStackClient(this.logger, {
        notificationCb: this.notificationCb.bind(this),
        connectionLostCb: this.connectionLostCb.bind(this),
        tryToReconnectCb: this.tryToReconnectCb.bind(this),
        connectionRecoveryCb: this.connectionRecoveryCb.bind(this),
        onWsStateChange: this.onWsStateChange.bind(this),
        onWsError: this.onError.bind(this),
        onWsReconnectFailed: this.onWsReconnectFailed.bind(this)
      });

      if (this.ssl && navigator.mediaDevices) {
        getDevices().then(function (devices) {
          _this._preDiviceList = devices;

          _this.logger.info('mediaDevices', JSON.stringify(_this._preDiviceList, null, 4));
        })["catch"](function () {
          _this._preDiviceList = [];
        });
      }

      this.senderStats = new Map();
      this.receiverStats = new Map();
      this.deviceChange = this.onDeviceChange.bind(this);
      this.visibilitychange = this.onVisibilitychange.bind(this);
    }
    /**
    * 获取服务器app配置
    */

  }, {
    key: "setAppConfig",
    value: function setAppConfig(appConfig) {
      var serverTs = appConfig.serverTs,
          logPeriod = appConfig.logPeriod,
          enableLog = appConfig.enableLog,
          eventPeriod = appConfig.eventPeriod,
          enableEvent = appConfig.enableEvent,
          metricCollectPeriod = appConfig.metricCollectPeriod;
      this.appConfig = {
        serverTs: serverTs,
        timeDiff: serverTs ? Date.now() - serverTs : 0,
        logPeriod: logPeriod,
        enableLog: enableLog !== false,
        eventPeriod: eventPeriod,
        enableEvent: enableEvent !== false,
        metricCollectPeriod: metricCollectPeriod
      };
      this.logger.setServerUrl(this.wsUrl);
      this.logger.setApppConfig(this.appConfig);
      this.logger.info('get app config', this.appConfig);
    }
    /**
     * 重置状态
     */

  }, {
    key: "reset",
    value: function reset() {
      this.publications = new Map();
      this.subscriptions = new Map();
      this.localStreams = [];
      this.remoteStreams.clear();
      this.subscribeManager.reset();

      this._remoteMutedStateMap.clear();

      this.appConfig = null;
      this._interval && window.clearInterval(this._interval);
      this._interval = -1;
      this.audioVolumeInterval && window.clearInterval(this.audioVolumeInterval);
      this.audioVolumeInterval = null;
      this.removeEventListenser('devicechange');
      this.removeEventListenser('visibilitychange');
      this.logger.setServerUrl(null);
      this.logger.setApppConfig(null);
      this.state = ClientState.New;
    }
    /**
     * 通知
     * @param roomId 
     * @param type 
     * @param notification 
     */

  }, {
    key: "notificationCb",
    value: function notificationCb(roomId, type, notification) {
      if (type === NotificationType.ParticipantJoin) {
        var _ref = notification,
            participant = _ref.participant;
        var userId = participant.userId,
            previousRoomId = participant.previousRoomId,
            userData = participant.userData;
        this.logger.info("======notification: participant join======"); // 触发 peer-join 事件

        this.updateRemoteMutedState(userId);
        this.logger.buriedLog({
          t: LogType.EVENT,
          c: LogCode.ON_PEER_JOIN,
          v: "uid:".concat(userId)
        });

        this._emitter.emit(PEER_JOIN, {
          userId: userId,
          previousRoomId: previousRoomId,
          userData: userData
        });
      }

      if (type === NotificationType.ParticipantLeave) {
        var _ref2 = notification,
            _userId = _ref2.userId;
        this.logger.info("======notification: participant leave======");
        this.onParticipantLeave(_userId);
      }

      if (type === NotificationType.StreamAdd) {
        this.logger.info("======notification: stream add======");
        var _ref3 = notification,
            stream = _ref3.stream;
        this.onStreamAdd(stream);
      }

      if (type === NotificationType.StreamRemove) {
        this.logger.info("======notification: stream remove======");
        var _ref4 = notification,
            _userId2 = _ref4.userId,
            streamId = _ref4.streamId;
        this.onStreamChange(_userId2, streamId);
      }

      if (type === NotificationType.Drop) {
        var _ref5 = notification,
            cause = _ref5.cause;
        this.logger.info("======notification: participant drop======");
        this.onClientBanned(cause);
      }

      if (type === NotificationType.StreamUpdate) {
        this.logger.info("======notification: stream update======");
        var _ref6 = notification,
            _userId3 = _ref6.userId,
            _streamId = _ref6.streamId,
            liveStatus = _ref6.liveStatus,
            simulcast = _ref6.simulcast;
        this.onStreamUpdate(_userId3, _streamId, liveStatus, simulcast);
      }

      if (type === NotificationType.PermissionChange) {
        var _ref7 = notification,
            _userId4 = _ref7.userId,
            publish = _ref7.publish;
            _ref7.subscribe;
            _ref7.control;
        this.logger.info("======notification: role change======", _userId4, publish); // TODO:
      }
    }
  }, {
    key: "connectionLostCb",
    value: function connectionLostCb(roomId) {
      if (this.logger) {
        this.logger.info("room: ".concat(roomId, " connection lost"));
        this.logger.buriedLog({
          t: LogType.EVENT,
          c: LogCode.CONNECTIONLOST_CB
        });
      }
    }
  }, {
    key: "tryToReconnectCb",
    value: function tryToReconnectCb(roomId) {
      this.logger.info("room: ".concat(roomId, " connection retring ......"));
    }
  }, {
    key: "connectionRecoveryCb",
    value: function connectionRecoveryCb(roomId, roomUniqueId, sessionTimeout) {
      var _this2 = this;

      return new Promise( /*#__PURE__*/function () {
        var _ref8 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(resolve, reject) {
          var publishOfferSdp, subscribeOfferSdp, newPublications, _iterator, _step, _loop, newSubscriptions, _iterator2, _step2, _step2$value, subId, subscriptions, offerSdp;

          return regenerator.wrap(function _callee$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _this2.logger.info("room: ".concat(roomId, " connection recovery"));

                  _this2.logger.buriedLog({
                    t: LogType.EVENT,
                    c: LogCode.CONNECTION_RECOVERY_CB
                  }); // 超时了或者  RTCPeerConnection 断开了连接 需要重新更新sdp


                  if (!sessionTimeout) {
                    _context2.next = 46;
                    break;
                  }

                  _this2.logger.setRoomUniqueId(roomUniqueId);

                  publishOfferSdp = new Map();
                  subscribeOfferSdp = new Map(); // 解决网络恢复后，重复发布问题

                  newPublications = new Map(_this2.publications);
                  _iterator = _createForOfIteratorHelper(newPublications.entries());
                  _context2.prev = 8;
                  _loop = /*#__PURE__*/regenerator.mark(function _loop() {
                    var _step$value, streamId, publisher, stream, userId, offerSdp;

                    return regenerator.wrap(function _loop$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _step$value = _slicedToArray(_step.value, 2), streamId = _step$value[0], publisher = _step$value[1];
                            stream = _this2.localStreams.find(function (e) {
                              return [e.audioStreamId, e.videoStreamId].includes(streamId);
                            });

                            if (stream) {
                              userId = stream.screen ? "share_".concat(stream.getUserId()) : stream.getUserId();

                              _this2.senderStats["delete"](userId);
                            }

                            _context.next = 5;
                            return publisher.republish();

                          case 5:
                            offerSdp = _context.sent;

                            if (offerSdp) {
                              publishOfferSdp.set(streamId, offerSdp.sdp);
                            }

                          case 7:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _loop);
                  });

                  _iterator.s();

                case 11:
                  if ((_step = _iterator.n()).done) {
                    _context2.next = 15;
                    break;
                  }

                  return _context2.delegateYield(_loop(), "t0", 13);

                case 13:
                  _context2.next = 11;
                  break;

                case 15:
                  _context2.next = 20;
                  break;

                case 17:
                  _context2.prev = 17;
                  _context2.t1 = _context2["catch"](8);

                  _iterator.e(_context2.t1);

                case 20:
                  _context2.prev = 20;

                  _iterator.f();

                  return _context2.finish(20);

                case 23:
                  // 解决网络恢复后，重复订阅问题
                  newSubscriptions = new Map(_this2.subscriptions);
                  _iterator2 = _createForOfIteratorHelper(newSubscriptions.entries());
                  _context2.prev = 25;

                  _iterator2.s();

                case 27:
                  if ((_step2 = _iterator2.n()).done) {
                    _context2.next = 37;
                    break;
                  }

                  _step2$value = _slicedToArray(_step2.value, 2), subId = _step2$value[0], subscriptions = _step2$value[1];

                  _this2.logger.info('resubscribe stream', subId);

                  _context2.next = 32;
                  return subscriptions.subscriber.resubscribe();

                case 32:
                  offerSdp = _context2.sent;

                  _this2.receiverStats["delete"](subscriptions.stream.getUserSeq());

                  if (offerSdp) {
                    subscribeOfferSdp.set(subId, offerSdp.sdp);
                  }

                case 35:
                  _context2.next = 27;
                  break;

                case 37:
                  _context2.next = 42;
                  break;

                case 39:
                  _context2.prev = 39;
                  _context2.t2 = _context2["catch"](25);

                  _iterator2.e(_context2.t2);

                case 42:
                  _context2.prev = 42;

                  _iterator2.f();

                  return _context2.finish(42);

                case 45:
                  resolve({
                    publishOfferSdp: publishOfferSdp,
                    subscribeOfferSdp: subscribeOfferSdp
                  });

                case 46:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee, null, [[8, 17, 20, 23], [25, 39, 42, 45]]);
        }));

        return function (_x, _x2) {
          return _ref8.apply(this, arguments);
        };
      }());
    }
    /**
     * 加入房间
     * @param options
     * @returns Promise<any>
     */

  }, {
    key: "join",
    value: function join(options) {
      var _this3 = this;

      this.logger.info('join room with options', options);
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: LogCode.JOIN
      });

      if (this.state !== ClientState.New) {
        this.logger.error("join room failed,client state is error ,state:".concat(this.state));
        return;
      }

      return new Promise( /*#__PURE__*/function () {
        var _ref9 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(resolve, reject) {
          var appConfig, response, _ref10, host, metadata, port, serverUrl, enterRoomOptions;

          return regenerator.wrap(function _callee2$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  if (!(!!_this3.wsUrl && !!_this3.sdkAppId && !!_this3.userSig && !!options.roomId && !!_this3.userId)) {
                    _context3.next = 25;
                    break;
                  }

                  _context3.prev = 1;
                  _this3.roomId = options.roomId;
                  _this3.role = _this3.mode === Mode.live ? options.role || _this3.role : _this3.role;
                  _context3.next = 6;
                  return Api.getAppConfig(_this3.ssl, _this3.wsUrl, _this3.sdkAppId, _this3.userSig);

                case 6:
                  appConfig = _context3.sent;
                  appConfig && _this3.setAppConfig(appConfig.data);
                  _context3.next = 10;
                  return Api.getWsUrl(_this3.wsUrl, _this3.roomId);

                case 10:
                  response = _context3.sent;
                  _ref10 = response.data || {}, host = _ref10.host, metadata = _ref10.metadata, port = _ref10.port;
                  serverUrl = '';

                  if (_this3.ssl) {
                    serverUrl = "wss://".concat(metadata.sslHost, ":").concat(metadata.sslPort, "/xsigo?roomNum=").concat(_this3.roomId, "&userId=").concat(_this3.userId);
                  } else {
                    serverUrl = "ws://".concat(host, ":").concat(port, "/xsigo?roomNum=").concat(_this3.roomId, "&userId=").concat(_this3.userId);
                  }

                  _this3.state = ClientState.Joining;
                  enterRoomOptions = {
                    appId: _this3.sdkAppId,
                    userId: _this3.userId,
                    userType: UserType.Normal,
                    previousRoomId: '',
                    permission: permissionMap.get(_this3.role),
                    userData: {
                      userId: _this3.userId,
                      userName: _this3.userName
                    },
                    serverUrl: serverUrl,
                    enterRoomCb: function enterRoomCb(code, message, data) {
                      if (code === RESPONSE_CODE.SUCCESS) {
                        _this3.state = ClientState.Joined;
                        var participants = data.participants,
                            roomUniqueId = data.roomUniqueId;

                        _this3.getNetworkQuality();

                        _this3.logger.setRoomId(_this3.roomId);

                        _this3.addEventListenser('devicechange');

                        _this3.addEventListenser('visibilitychange');

                        _this3.logger.setRoomUniqueId(roomUniqueId);

                        _this3.logger.buriedLog({
                          t: LogType.EVENT,
                          c: LogCode.JOIN_SUCCESS
                        });

                        _this3._emitter.emit(MEMBERS, participants);

                        _this3.logger.info("join room ".concat(_this3.roomId, " success"));

                        resolve(true);
                      } else if (code === RESPONSE_CODE.TIMEOUT) {
                        _this3.state = ClientState.New;

                        _this3.logger.error("".concat(ERCode.JOIN_ROOM_FAILED, " join room timeout"));

                        reject(new ER({
                          code: ERCode.JOIN_ROOM_FAILED,
                          message: 'join room timeout'
                        }));
                      } else {
                        _this3.state = ClientState.New;

                        _this3.logger.error('join room failed:', message);

                        reject(new ER({
                          code: ERCode.JOIN_ROOM_FAILED,
                          message: message
                        }));
                      }
                    }
                  };

                  _this3.xsigoClient.enterRoom(_this3.roomId, enterRoomOptions);

                  _context3.next = 23;
                  break;

                case 19:
                  _context3.prev = 19;
                  _context3.t0 = _context3["catch"](1);

                  _this3.logger.error('join room failed:', _context3.t0);

                  reject(new ER({
                    code: ERCode.JOIN_ROOM_FAILED,
                    message: _context3.t0
                  }));

                case 23:
                  _context3.next = 26;
                  break;

                case 25:
                  reject(new ER({
                    code: ERCode.INVALID_OPERATION,
                    message: "join room options is invalid,wsUrl:".concat(_this3.wsUrl, ",sdkAppId:").concat(_this3.sdkAppId, ",userSig:").concat(_this3.userSig, ",roomId:").concat(options.roomId, ",userId:").concat(_this3.userId)
                  }));

                case 26:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee2, null, [[1, 19]]);
        }));

        return function (_x3, _x4) {
          return _ref9.apply(this, arguments);
        };
      }());
    }
    /**
     * 离开房间
     * @returns Promise<any>
     */

  }, {
    key: "leave",
    value: function () {
      var _leave = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3() {
        var _this4 = this;

        return regenerator.wrap(function _callee3$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(this.state === ClientState.Leaved)) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt("return");

              case 2:
                this.logger.buriedLog({
                  t: LogType.EVENT,
                  c: LogCode.LEAVE
                });
                return _context4.abrupt("return", new Promise(function (resolve, reject) {
                  // 取消发布本地流
                  var _iterator3 = _createForOfIteratorHelper(_this4.publications.values()),
                      _step3;

                  try {
                    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                      var publisher = _step3.value;
                      publisher.close();
                    }
                  } catch (err) {
                    _iterator3.e(err);
                  } finally {
                    _iterator3.f();
                  }

                  var _iterator4 = _createForOfIteratorHelper(_this4.subscriptions.values()),
                      _step4;

                  try {
                    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                      var subscription = _step4.value;
                      subscription.subscriber.close();
                    }
                  } catch (err) {
                    _iterator4.e(err);
                  } finally {
                    _iterator4.f();
                  }

                  _this4.state = ClientState.Leaving;

                  var exitRoomCb = function exitRoomCb(code, message, data) {
                    if (code === RESPONSE_CODE.SUCCESS) {
                      _this4.logger.info('leave room success');

                      _this4.logger.buriedLog({
                        t: LogType.EVENT,
                        c: LogCode.LEAVE_SUCCESS
                      }, true);

                      _this4.state = ClientState.Leaved;

                      _this4.reset();

                      resolve(true);
                    } else {
                      _this4.logger.buriedLog({
                        t: LogType.EVENT,
                        c: LogCode.LEAVE_FAILED
                      }, true);

                      reject(new ER({
                        code: ERCode.LEAVE_ROOM_FAILED,
                        message: message
                      }));

                      _this4.reset();
                    }
                  };

                  _this4.xsigoClient.exitRoom(_this4.roomId, exitRoomCb);
                }));

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee3, this);
      }));

      function leave() {
        return _leave.apply(this, arguments);
      }

      return leave;
    }()
    /**
     * 推流
     * @param stream 
     * @returns Promise<any>
     */

  }, {
    key: "publish",
    value: function () {
      var _publish = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4(stream) {
        var _this5 = this;

        var states, pubList;
        return regenerator.wrap(function _callee4$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                this.logger.info('publish stream');

                if (stream) {
                  _context5.next = 4;
                  break;
                }

                this.logger.error("stream is undefined or null");
                throw new ER({
                  code: ERCode.INVALID_OPERATION,
                  message: "stream is undefined or null"
                });

              case 4:
                states = [PublishState$1.Publishing, PublishState$1.Published];

                if (!(states.includes(stream.getPubState('audio')) && states.includes(stream.getPubState('video')))) {
                  _context5.next = 7;
                  break;
                }

                throw new ER({
                  code: ERCode.INVALID_OPERATION,
                  message: 'duplicate publishing, please unpublish and then re-publish'
                });

              case 7:
                if (!(this.mode === 'live' && this.role === 'audience')) {
                  _context5.next = 9;
                  break;
                }

                throw new ER({
                  code: ERCode.INVALID_OPERATION,
                  message: 'no permission to publish() under live/audience, please call swithRole("anchor") firstly before publish()'
                });

              case 9:
                if (stream.mediaStream) {
                  _context5.next = 11;
                  break;
                }

                throw new ER({
                  code: ERCode.INVALID_OPERATION,
                  message: 'stream not initialized!'
                });

              case 11:
                this.logger.buriedLog({
                  t: LogType.EVENT,
                  c: stream.screen ? LogCode.PUBLISH_STREAM_SCREEN : LogCode.PUBLISH_STREAM
                });
                pubList = stream.mediaStream.getTracks().map(function (track) {
                  return new Promise(function (resolve, reject) {
                    var mediaStream = new MediaStream();
                    mediaStream.addTrack(track);
                    var hasAudio = track.kind === 'audio';
                    var hasVideo = track.kind === 'video';

                    if (!states.includes(stream.getPubState(track.kind))) {
                      stream.setPubState(track.kind, PublishState$1.Publishing);
                      var pubStream = {
                        mediaStream: mediaStream,
                        screen: stream.screen,
                        hasAudio: hasAudio,
                        hasVideo: hasVideo,
                        bitrate: stream.getBitrate()
                      };

                      var cb = function cb(code, message, data) {
                        _this5.logger.info('xsigo client publish stream success', data && data.streamId);

                        if (stream.getPubState(track.kind) === PublishState$1.Unpublished) return;

                        if (code === RESPONSE_CODE.SUCCESS) {
                          if (!stream.published) {
                            stream.published = true;
                            stream.roomId = data.roomId;
                            stream.streamId = data.streamId;
                            stream.xsigoClient = _this5.xsigoClient;

                            var index = _this5.localStreams.findIndex(function (e) {
                              return e.streamId === data.streamId;
                            });

                            if (index === -1) {
                              _this5.localStreams.push(stream);

                              stream.onTrackAdd(_this5.onAddTrack.bind(_this5));
                              stream.onTrackRemove(_this5.onRemoveTrack.bind(_this5));
                              stream.onSwitchDevice(_this5.onReplaceTrack.bind(_this5));
                              stream.onReplaceTrack(_this5.onReplaceTrack.bind(_this5));
                            }
                          }

                          if (hasAudio) {
                            stream.setHasAudio(!!hasAudio);
                            stream.setAudioStreamId(data.streamId);
                          }

                          if (hasVideo) {
                            stream.setHasVideo(!!hasVideo);
                            stream.setVideoStreamId(data.streamId);
                          }

                          _this5.logger.buriedLog({
                            t: LogType.EVENT,
                            c: stream.screen ? LogCode.PUBLISH_STREAM_SCREEN_SUCCESS : LogCode.PUBLISH_STREAM_SUCCESS,
                            v: hasAudio ? 'audio' : 'video'
                          });

                          stream.setPubState(track.kind, PublishState$1.Published);
                          resolve(stream);
                        } else {
                          _this5.logger.error('publish stream with response:', code, message);

                          _this5.logger.buriedLog({
                            t: LogType.EVENT,
                            c: stream.screen ? LogCode.PUBLISH_STREAM_SCREEN_FAILED : LogCode.PUBLISH_STREAM_FAILED,
                            v: hasAudio ? 'audio' : 'video'
                          });

                          data && _this5.publications["delete"](data.streamId);
                          stream.setPubState(track.kind, PublishState$1.Create);
                          reject(new ER({
                            code: ERCode.PUBLISH_STREAM_FAILED,
                            message: message
                          }));
                        }
                      };

                      _this5.doPublish(pubStream, cb);
                    } else {
                      _this5.logger.warn("".concat(hasAudio ? 'audio' : 'video', " is publishing or published"));
                    }
                  });
                });
                return _context5.abrupt("return", Promise.all(pubList));

              case 15:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee4, this);
      }));

      function publish(_x5) {
        return _publish.apply(this, arguments);
      }

      return publish;
    }()
    /**
     * 监听 addTrack 事件
     * @param data 
     */

  }, {
    key: "onAddTrack",
    value: function onAddTrack(data) {
      var _this6 = this;

      var track = data.track,
          streamId = data.streamId;
      var mediaStream = new MediaStream();
      mediaStream.addTrack(track);
      var hasAudio = track.kind === 'audio';
      var hasVideo = track.kind === 'video';
      var localStream = this.localStreams.find(function (s) {
        return s.streamId === streamId;
      });
      this.logger.info('PublishState', localStream && localStream.getPubState(track.kind));
      var states = [PublishState$1.Publishing, PublishState$1.Published];

      if (localStream && !states.includes(localStream.getPubState(track.kind))) {
        var stream = {
          screen: false,
          hasAudio: hasAudio,
          hasVideo: hasVideo,
          mediaStream: mediaStream,
          bitrate: localStream.getBitrate()
        };
        localStream.setPubState(track.kind, PublishState$1.Publishing);

        var cb = function cb(code, message, data) {
          if (localStream.getPubState(track.kind) === PublishState$1.Unpublished) return;

          if (code === RESPONSE_CODE.SUCCESS) {
            localStream.mediaStream.addTrack(track);
            localStream.published = true;

            if (hasAudio) {
              localStream.setHasAudio(hasAudio);
              localStream.setAudioStreamId(data.streamId);
              localStream.setAudioTrack(track);
            }

            if (hasVideo) {
              localStream.setHasVideo(hasVideo);
              localStream.setVideoStreamId(data.streamId);
              localStream.setVideoTrack(track);
            }

            localStream.setPubState(track.kind, PublishState$1.Published);
          } else {
            data && _this6.publications["delete"](data.streamId);
            localStream.setPubState(track.kind, PublishState$1.Create);
          }

          _this6.logger.buriedLog({
            t: LogType.EVENT,
            c: code === RESPONSE_CODE.SUCCESS ? LogCode.PUBLISH_STREAM_SUCCESS : LogCode.PUBLISH_STREAM_FAILED,
            v: hasAudio ? 'addAudioTrack' : 'addVideoTrack'
          });

          localStream._emitter.emit(STREAM_TRACK_UPDATE_RESULT, {
            code: code,
            message: message
          });
        };

        this.doPublish(stream, cb);
      } else {
        track.stop();
        this.logger.warn(localStream ? 'same track is publishing or published' : 'stream is not published');
      }
    }
    /**
     * 真的推流
     * @param stream 
     * @returns Promise<any>
     */

  }, {
    key: "doPublish",
    value: function () {
      var _doPublish = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee5(stream, cb) {
        var _ref11, hasAudio, hasVideo, bitrate, mediaStream, screen, publisher, streamId;

        return regenerator.wrap(function _callee5$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.prev = 0;
                _ref11 = stream || {}, hasAudio = _ref11.hasAudio, hasVideo = _ref11.hasVideo, bitrate = _ref11.bitrate, mediaStream = _ref11.mediaStream, screen = _ref11.screen;
                publisher = new PublishStream({
                  roomId: this.roomId,
                  userId: this.userId,
                  mediaStream: mediaStream,
                  screen: screen,
                  bitrate: bitrate,
                  isEnableSmallStream: this.isEnableSmallStream,
                  smallStreamConfig: this.smallStreamConfig,
                  hasAudio: hasAudio,
                  hasVideo: hasVideo,
                  logger: this.logger,
                  xsigoClient: this.xsigoClient,
                  onPublish: cb
                });
                _context6.next = 5;
                return publisher.publish();

              case 5:
                streamId = _context6.sent;

                if (typeof streamId === 'string' && !this.publications.has(streamId)) {
                  publisher.onPublishPeerConnectionFailed(this.onPublishPeerConnectionFailed.bind(this));
                  this.publications.set(streamId, publisher);
                }

                _context6.next = 12;
                break;

              case 9:
                _context6.prev = 9;
                _context6.t0 = _context6["catch"](0);

                if (cb) {
                  cb(RESPONSE_CODE.ERROR, _context6.t0);
                }

              case 12:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee5, this, [[0, 9]]);
      }));

      function doPublish(_x6, _x7) {
        return _doPublish.apply(this, arguments);
      }

      return doPublish;
    }()
    /**
     * 监听publishStream  PeerConnection 断开
     * @param data  state:ice state streamId 发布流Id
     */

  }, {
    key: "onPublishPeerConnectionFailed",
    value: function onPublishPeerConnectionFailed(data) {
      var _this7 = this;

      var state = data.state,
          streamId = data.streamId; //  监听之后,网络没有断开 重新unpub pub

      var wsState = this.xsigoClient.getWsState(this.roomId);

      if (this.publications.has(streamId)) {
        var stream = this.localStreams.find(function (s) {
          return [s.audioStreamId, s.videoStreamId].includes(streamId);
        });

        if (stream) {
          if (state === 'failed' && wsState && ['CONNECTED', 'RECOVERY'].includes(wsState.state)) {
            this.logger.warn("publish peerConnection failed try to republish streamId:".concat(streamId));
            stream.updatePeerConnectionFailed(state);
            this.doUnpublish(stream, streamId).then(function () {
              var mediaStream = new MediaStream();
              var hasAudio = stream.audioStreamId === streamId;
              var hasVideo = stream.videoStreamId === streamId;
              var track = hasAudio ? stream.getAudioTrack() : stream.getVideoTrack();

              _this7.logger.info("publish ".concat(hasAudio ? 'audio' : 'video', ",trackId:").concat(track && track.id));

              mediaStream.addTrack(track);
              var pubStream = {
                screen: stream.screen,
                hasAudio: hasAudio,
                hasVideo: hasVideo,
                mediaStream: mediaStream,
                bitrate: stream.getBitrate()
              };

              var cb = function cb(code, message, data) {
                if (code === RESPONSE_CODE.SUCCESS) {
                  stream.published = true;

                  if (hasAudio) {
                    stream.setHasAudio(hasAudio);
                    stream.setAudioStreamId(data.streamId);
                  }

                  if (hasVideo) {
                    stream.setHasVideo(hasVideo);
                    stream.setVideoStreamId(data.streamId);
                  }
                } else {
                  data && _this7.publications["delete"](data.streamId);
                }
              };

              _this7.doPublish(pubStream, cb);
            });
          } else if (state === 'connected') {
            stream.updatePeerConnectionFailed(state);
          }
        }
      }
    }
    /**
     * 监听 removeTrack
     * @param data 
     */

  }, {
    key: "onRemoveTrack",
    value: function onRemoveTrack(data) {
      var _this8 = this;

      var track = data.track,
          streamId = data.streamId;
      var streamKind = track.kind;
      var localStream = this.localStreams.find(function (s) {
        return s.streamId === streamId;
      });
      var states = [PublishState$1.Create, PublishState$1.Unpublished];

      if (localStream && !states.includes(localStream.getPubState(track.kind))) {
        var sId = streamKind === 'audio' ? localStream.audioStreamId : localStream.videoStreamId;
        localStream.mediaStream.removeTrack(track);
        streamKind === 'audio' && localStream.setHasAudio(false);
        streamKind === 'video' && localStream.setHasVideo(false);
        this.doUnpublish(localStream, sId, function (code, message) {
          if (code === RESPONSE_CODE.SUCCESS) {
            _this8.logger.info('remove track success');
          }

          localStream._emitter.emit(STREAM_TRACK_UPDATE_RESULT, {
            code: code,
            message: message
          });
        });
      } else {
        this.logger.warn('stream is not published');
      }
    }
    /**
    * 监听 switchDevice 和 replaceTrack 
    * 更新 发布端流track
    * @param data 
    */

  }, {
    key: "onReplaceTrack",
    value: function onReplaceTrack(data) {
      var streamId = data.streamId,
          type = data.type,
          track = data.track;
      var localStream = this.localStreams.find(function (s) {
        return s.streamId === streamId;
      });

      if (localStream) {
        var pubStreamId = type === 'audio' ? localStream.audioStreamId : localStream.videoStreamId;

        if (pubStreamId && this.publications.has(pubStreamId)) {
          this.publications.get(pubStreamId).replaceMediaStreamTrack(track);
        }
      }
    }
    /**
     * 取消推流
     * @param stream 
     * @returns Promise<boolean>
     */

  }, {
    key: "unpublish",
    value: function unpublish(stream) {
      var _this9 = this;

      this.logger.info('unpublish stream');

      if (!stream) {
        this.logger.error("stream is undefined or null");
        throw new ER({
          code: ERCode.INVALID_OPERATION,
          message: "stream is undefined or null"
        });
      }

      this.logger.buriedLog({
        t: LogType.EVENT,
        c: stream.screen ? LogCode.UNPUBLISH_STREAM_SCREEN : LogCode.UNPUBLISH_STREAM
      });
      var unpubList = [];

      var _iterator5 = _createForOfIteratorHelper(this.publications.keys()),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var streamId = _step5.value;

          if ([stream.audioStreamId, stream.videoStreamId].includes(streamId)) {
            unpubList.push(this.doUnpublish(stream, streamId));
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      return Promise.all(unpubList).then(function () {
        var index = _this9.localStreams.findIndex(function (s) {
          return s.getId() === stream.getId();
        });

        index !== -1 && _this9.localStreams.splice(index, 1);
      });
    }
    /**
     * 取消推流逻辑处理
     * @param streamId 
     * @returns Promise<boolean>
     */

  }, {
    key: "doUnpublish",
    value: function doUnpublish(stream, streamId, customCb) {
      var _this10 = this;

      return new Promise(function (resolve, reject) {
        var publisher = _this10.publications.get(streamId);

        if (publisher) {
          // 先删除以免网络恢复后重新发布流
          _this10.publications["delete"](streamId);

          stream.audioStreamId === streamId && stream.setHasAudio(false);
          stream.videoStreamId === streamId && stream.setHasVideo(false);
          var userId = stream.screen ? "share_".concat(stream.getUserId()) : stream.getUserId();

          if (!stream.hasAudio() && !stream.hasVideo()) {
            stream.published = !1;
          }

          stream.setPubState(stream.audioStreamId === streamId ? 'audio' : 'video', PublishState$1.Unpublished);

          if (_this10.senderStats.has(userId)) {
            var newStats = _objectSpread({}, _this10.senderStats.get(userId));

            if (!stream.hasAudio()) {
              newStats.audio = {
                bytesSent: 0,
                timestamp: 0,
                retransmittedPacketsSent: 0,
                packetsSent: 0,
                packetLossRate: 0
              };
            }

            if (!stream.hasVideo()) {
              newStats.video = {
                bytesSent: 0,
                timestamp: 0,
                retransmittedPacketsSent: 0,
                packetsSent: 0,
                packetLossRate: 0
              };
              newStats.smallVideo = {
                bytesSent: 0,
                timestamp: 0,
                retransmittedPacketsSent: 0,
                packetsSent: 0,
                packetLossRate: 0
              };
            }

            _this10.senderStats.set(userId, newStats);
          }

          resolve(true);

          var callback = function callback(code, message, data) {
            if (code === RESPONSE_CODE.SUCCESS) {
              _this10.logger.info('unpublish stream success', streamId);

              customCb && customCb(code, message);

              _this10.logger.buriedLog({
                t: LogType.EVENT,
                c: stream.screen ? LogCode.UNPUBLISH_STREAM_SCREEN_SUCCESS : LogCode.UNPUBLISH_STREAM_SUCCESS,
                v: stream.audioStreamId === streamId ? 'audio' : 'video'
              });
            } else {
              _this10.logger.buriedLog({
                t: LogType.EVENT,
                c: stream.screen ? LogCode.UNPUBLISH_STREAM_SCREEN_FAILED : LogCode.UNPUBLISH_STREAM_FAILED,
                v: stream.audioStreamId === streamId ? 'audio' : 'video'
              });

              customCb && customCb(code, message);

              _this10.logger.error('unpublish stream with response:', code, message);
            }
          };

          publisher.unpublish(callback);
        } else {
          _this10.logger.warn('stream is not published', streamId);

          resolve(true);
        }
      });
    }
    /**
     * 订阅流
     * @param stream 
     * @param options 
     */

  }, {
    key: "subscribe",
    value: function () {
      var _subscribe = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee6(stream, options) {
        var states, userId, subscribeList;
        return regenerator.wrap(function _callee6$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (stream) {
                  _context7.next = 3;
                  break;
                }

                this.logger.error("stream is undefined or null");
                throw new ER({
                  code: ERCode.INVALID_OPERATION,
                  message: "stream is undefined or null"
                });

              case 3:
                if (stream.isRemote) {
                  _context7.next = 6;
                  break;
                }

                this.logger.error("try to subscribe a local stream");
                throw new ER({
                  code: ERCode.INVALID_OPERATION,
                  message: "try to subscribe a local stream"
                });

              case 6:
                states = [SubscribeState$1.Subscribing, SubscribeState$1.Subscribed];

                if (!(states.includes(stream.getSubState('audio')) && states.includes(stream.getSubState('video')))) {
                  _context7.next = 10;
                  break;
                }

                this.logger.error("Stream already subscribing or subscribed");
                throw new ER({
                  code: ERCode.INVALID_OPERATION,
                  message: "Stream already subscribing or subscribed"
                });

              case 10:
                !options && (options = {
                  audio: true,
                  video: true,
                  small: false
                });
                userId = stream.getUserSeq();
                stream = this.remoteStreams.get(userId);
                this.logger.info('subscribe with options:', options, stream);
                this.subscribeManager.setSubscriptionOpts(userId, options);
                subscribeList = [];

                if (stream && stream.audioStreamId && !states.includes(stream.getSubState('audio'))) {
                  options.audio && subscribeList.push(this.doSubscribe(stream, {
                    audio: true,
                    video: false,
                    small: options.small ? options.small : false
                  }));
                } else if (states.includes(stream.getSubState('audio'))) {
                  this.logger.warn('audio is subscribing or subscribed');
                }

                if (stream && stream.videoStreamId && !states.includes(stream.getSubState('video'))) {
                  options.video && subscribeList.push(this.doSubscribe(stream, {
                    audio: false,
                    video: true,
                    small: options.small ? options.small : false
                  }));
                } else if (states.includes(stream.getSubState('video'))) {
                  this.logger.warn('video is subscribing or subscribed');
                }

                return _context7.abrupt("return", Promise.all(subscribeList));

              case 19:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee6, this);
      }));

      function subscribe(_x8, _x9) {
        return _subscribe.apply(this, arguments);
      }

      return subscribe;
    }()
    /**
     * 订阅行为
     * @param stream 
     * @param options 
     */

  }, {
    key: "doSubscribe",
    value: function () {
      var _doSubscribe = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee7(stream, options, iceRecovery) {
        var _this11 = this;

        var userId, simulcast, hasAudio, hasVideo, small, audioCount, videoCount, subscriber, subscriptionId;
        return regenerator.wrap(function _callee7$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                this.logger.info('doSubscribe options', options);
                userId = stream.getUserSeq();
                simulcast = stream.getSimulcasts();
                hasAudio = options.audio ? stream.audio : options.audio;
                hasVideo = options.video ? stream.video : options.video;
                small = options.small ? options.small : false;
                this.logger.info('---do subscribe options', hasAudio, hasVideo);
                this.logger.buriedLog({
                  t: LogType.EVENT,
                  c: stream.getType() === AUXILIARY ? LogCode.SUBSCRIBE_STREAM_SCREEN : LogCode.SUBSCRIBE_STREAM,
                  v: "uid:".concat(stream.getUserId(), ",").concat(hasAudio ? 'audio' : 'video')
                });
                stream.setSubState(hasAudio ? 'audio' : 'video', SubscribeState$1.Subscribing); // 先修改订阅状态，订阅成功或者失败重置订阅状态

                hasAudio && this.subscribeManager.updateSubscriptedState(userId, {
                  audio: hasAudio,
                  small: small
                });
                hasVideo && this.subscribeManager.updateSubscriptedState(userId, {
                  video: hasVideo,
                  small: small
                });
                audioCount = 0;
                videoCount = 0;
                subscriber = new SubscribeStream({
                  userId: stream.userId,
                  publisherUserId: stream.getUserId(),
                  hasAudio: hasAudio,
                  hasVideo: hasVideo,
                  simulcast: simulcast,
                  audioStreamId: hasAudio ? stream.audioStreamId : null,
                  videoStreamId: hasVideo ? stream.videoStreamId : null,
                  logger: this.logger,
                  xsigoClient: this.xsigoClient,
                  roomId: this.roomId,
                  small: small,
                  onRemoteStream: function onRemoteStream(mediaStream, track, type) {
                    if (hasAudio && stream.getSubState('audio') === SubscribeState$1.Unsubscribed) return;
                    if (hasVideo && stream.getSubState('video') === SubscribeState$1.Unsubscribed) return;

                    var remoteStream = _this11.remoteStreams.get(userId);

                    track.kind === 'audio' && audioCount++;
                    track.kind === 'video' && videoCount++;

                    if (remoteStream) {
                      if (!remoteStream.mediaStream) {
                        remoteStream.setMediaStream(mediaStream);
                      } // 网络恢复、ice恢复后重新播放 或 订阅一路音频或视频流后添加一路音频或视频


                      if (track.kind === 'audio' && (audioCount > 1 || !!iceRecovery || !remoteStream.getAudioTrack())) {
                        remoteStream.updateTrack('audio', track);

                        if (!!iceRecovery || audioCount > 1) {
                          remoteStream.setAudioTrack(track);
                        } else {
                          // 教育录制远端移除音频再次播放需要改变dom的id
                          remoteStream.restartAudio();
                        }
                      }

                      if (track.kind === 'video' && (videoCount > 1 || !!iceRecovery || !remoteStream.getVideoTrack())) {
                        remoteStream.updateTrack('video', track);

                        if (!!iceRecovery || videoCount > 1) {
                          remoteStream.setVideoTrack(track);
                        } else {
                          remoteStream.restartVideo();
                        }
                      }

                      _this11.subscribeManager.addSubscriptionRecord(userId, remoteStream); // PC、Android、IOS 等端分开推流，emit STREAM_UPDATED 事件


                      var id = stream.getType() === AUXILIARY ? "share_".concat(stream.getUserId()) : stream.getUserId();

                      if (!remoteStream.subscribed) {
                        remoteStream.subscribed = true;

                        _this11.logger.buriedLog({
                          t: LogType.EVENT,
                          c: stream.getType() === AUXILIARY ? LogCode.ON_STREAM_SUBSCRIBED_SCREEN : LogCode.ON_STREAM_SUBSCRIBED,
                          v: "uid:".concat(stream.getUserId())
                        });

                        _this11._emitter.emit(STREAM_SUBSCRIBED, {
                          stream: remoteStream
                        });

                        if (type === StreamKind.AudioOnly) {
                          _this11._emitter.emit(remoteStream.audioMuted ? MUTE_AUDIO : UNMUTE_AUDIO, {
                            userId: id
                          });
                        } else if (type === StreamKind.VideoOnly) {
                          _this11._emitter.emit(remoteStream.videoMuted ? MUTE_VIDEO : UNMUTE_VIDEO, {
                            userId: id
                          });
                        }
                      } else {
                        _this11._emitter.emit(STREAM_UPDATED, {
                          stream: remoteStream
                        });

                        var eventName = '';

                        if (type === StreamKind.AudioOnly) {
                          eventName = remoteStream.audioMuted ? MUTE_AUDIO : UNMUTE_AUDIO;
                        } else if (type === StreamKind.VideoOnly) {
                          eventName = remoteStream.videoMuted ? MUTE_VIDEO : UNMUTE_VIDEO;
                        }

                        _this11._emitter.emit(eventName, {
                          userId: id
                        });
                      }

                      stream.setSubState(hasAudio ? 'audio' : 'video', SubscribeState$1.Subscribed);
                    }
                  },
                  onSubscribe: function onSubscribe(code, message, data) {
                    var subState = _this11.subscribeManager.getSubscriptedState(userId);

                    if (hasAudio && stream.getSubState('audio') === SubscribeState$1.Unsubscribed) return;
                    if (hasVideo && stream.getSubState('video') === SubscribeState$1.Unsubscribed) return;

                    if (code === RESPONSE_CODE.SUCCESS) {
                      hasAudio && (subState.audio = true);
                      hasVideo && (subState.video = true);

                      _this11.subscribeManager.updateSubscriptedState(userId, subState);

                      if (simulcast.length) {
                        if (small) {
                          var hasSmall = simulcast.find(function (e) {
                            return e.type === SimulcastType.SmallStream;
                          });
                          hasSmall && stream.setSimulcastType(SimulcastType.SmallStream);
                        } else {
                          stream.setSimulcastType(simulcast[0].type);
                        }
                      }

                      _this11.logger.info('subscribe stream success');

                      _this11.logger.buriedLog({
                        t: LogType.EVENT,
                        c: stream.getType() === AUXILIARY ? LogCode.SUBSCRIBE_STREAM_SCREEN_SUCCESS : LogCode.SUBSCRIBE_STREAM_SUCCESS,
                        v: "uid:".concat(stream.getUserId(), ",").concat(hasAudio ? 'audio' : 'video')
                      });
                    } else {
                      _this11.logger.error('on subscribe stream with response:', code, message);

                      _this11.logger.buriedLog({
                        t: LogType.EVENT,
                        c: stream.getType() === AUXILIARY ? LogCode.SUBSCRIBE_STREAM_SCREEN_FAILED : LogCode.SUBSCRIBE_STREAM_FAILED,
                        v: "uid:".concat(stream.getUserId(), ",").concat(hasAudio ? 'audio' : 'video')
                      });

                      _this11.subscriptions["delete"](data.subscriptionId);

                      stream.setSubState(hasAudio ? 'audio' : 'video', SubscribeState$1.Create);
                      hasAudio && _this11.subscribeManager.updateSubscriptedState(userId, {
                        audio: false
                      });
                      hasVideo && _this11.subscribeManager.updateSubscriptedState(userId, {
                        video: false
                      });
                    }
                  }
                }); // 发布流

                _context8.next = 16;
                return subscriber.subscribe();

              case 16:
                subscriptionId = _context8.sent;
                this.logger.info('time Date.now doSubscribe', this.remoteStreams.has(userId), stream.audioStreamId, stream.videoStreamId); // 信令是异步的，没有audioStreamId 和 videoStreamId 表示订阅的流被移除了

                if (!(hasAudio && !stream.audioStreamId)) {
                  _context8.next = 20;
                  break;
                }

                return _context8.abrupt("return", subscriber.close());

              case 20:
                if (!(hasVideo && !stream.videoStreamId)) {
                  _context8.next = 22;
                  break;
                }

                return _context8.abrupt("return", subscriber.close());

              case 22:
                if (!this.subscriptions.has(subscriptionId)) {
                  subscriber.onSubscribePeerConnectionFailed(this.onSubscribePeerConnectionFailed.bind(this));
                  this.subscriptions.set(subscriptionId, {
                    subscriber: subscriber,
                    stream: stream
                  });
                }

                hasAudio && stream.setAudioSubscriptionId(subscriptionId);
                hasVideo && stream.setVideoSubscriptionId(subscriptionId);

              case 25:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee7, this);
      }));

      function doSubscribe(_x10, _x11, _x12) {
        return _doSubscribe.apply(this, arguments);
      }

      return doSubscribe;
    }()
    /**
     *  监听 SubscribeStream  PeerConnection 断开
     * @param data Objecet
     */

  }, {
    key: "onSubscribePeerConnectionFailed",
    value: function onSubscribePeerConnectionFailed(data) {
      var _this12 = this;

      var state = data.state,
          subscriptionId = data.subscriptionId; //  监听之后,网络没有断开 重新unsub sub

      var wsState = this.xsigoClient.getWsState(this.roomId);

      if (this.subscriptions.has(subscriptionId)) {
        var options = this.subscribeManager.getSubscriptionOpts(this.userId);

        var _this$subscriptions$g = this.subscriptions.get(subscriptionId),
            stream = _this$subscriptions$g.stream;

        if (stream) {
          if (state === 'failed' && wsState && ['CONNECTED', 'RECOVERY'].includes(wsState.state)) {
            this.logger.warn("subscribe peerConnection failed try to resubscribe subscriptionId:".concat(subscriptionId));
            stream.updatePeerConnectionFailed(state);
            this.doUnsubscribe(stream, subscriptionId).then(function () {
              if (stream.audioSubscriptionId === subscriptionId) {
                options.audio && _this12.doSubscribe(stream, {
                  audio: true,
                  video: false,
                  small: options.small ? options.small : false
                }, true);
              }

              if (stream.videoSubscriptionId === subscriptionId) {
                options.video && _this12.doSubscribe(stream, {
                  audio: false,
                  video: true,
                  small: options.small ? options.small : false
                }, true);
              }
            });
          } else if (state === 'connected') {
            stream.updatePeerConnectionFailed(state);
          }
        }
      }
    }
    /**
    * 取消订阅流
    * @param stream 
    * @returns 
    */

  }, {
    key: "unsubscribe",
    value: function unsubscribe(stream) {
      if (!stream) {
        this.logger.error("stream is undefined or null");
        throw new ER({
          code: ERCode.INVALID_OPERATION,
          message: "stream is undefined or null"
        });
      }

      var unsubscribeList = [];
      var subState = this.subscribeManager.getSubscriptionOpts(stream.getUserSeq());
      stream.setSubState('audio', SubscribeState$1.Unsubscribed);
      stream.setSubState('video', SubscribeState$1.Unsubscribed);

      if (subState.audio && stream.hasAudio()) {
        unsubscribeList.push(this.doUnsubscribe(stream, stream.audioSubscriptionId));
        stream.setEnableTrackFlag('audio', true);
      }

      if (subState.video && stream.hasVideo()) {
        unsubscribeList.push(this.doUnsubscribe(stream, stream.videoSubscriptionId));
        stream.setEnableTrackFlag('video', true);
      }

      return Promise.all(unsubscribeList);
    }
    /**
     * 取消订阅
     * @param stream 
     * @returns Promise<boolean>
     */

  }, {
    key: "doUnsubscribe",
    value: function doUnsubscribe(stream, subscriptionId) {
      var _this13 = this;

      var hasAudio = stream.audioSubscriptionId && stream.audioSubscriptionId === subscriptionId;
      var hasVideo = stream.videoSubscriptionId && stream.videoSubscriptionId === subscriptionId;
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: stream.getType() === AUXILIARY ? LogCode.UNSUBSCRIBE_STREAM_SCREEN : LogCode.UNSUBSCRIBE_STREAM,
        v: "uid:".concat(stream.getUserId(), ",").concat(hasAudio ? 'audio' : 'video')
      });
      var userId = stream.getUserSeq();
      var rs = this.remoteStreams.get(userId);
      var state = this.subscribeManager.getSubscriptedState(userId);

      if (rs && hasAudio) {
        rs.getAudioTrack() && rs.mediaStream.removeTrack(rs.getAudioTrack());
        rs.setSubState('audio', SubscribeState$1.Unsubscribed);
        this.subscribeManager.updateSubscriptedState(userId, _objectSpread(_objectSpread({}, state), {}, {
          audio: false,
          small: false
        }));
      }

      if (rs && hasVideo) {
        rs.getVideoTrack() && rs.mediaStream.removeTrack(rs.getVideoTrack());
        rs.setSubState('video', SubscribeState$1.Unsubscribed);
        this.subscribeManager.updateSubscriptedState(userId, _objectSpread(_objectSpread({}, state), {}, {
          video: false,
          small: false
        }));
      }

      if (rs && !stream.getAudioTrack() && !stream.getVideoTrack()) {
        rs.subscribed = false;
        rs.mediaStream = null;
      }

      this.receiverStats.has(userId) && this.receiverStats["delete"](userId);
      return new Promise(function (resolve, reject) {
        if (_this13.subscriptions.has(subscriptionId)) {
          var subscription = _this13.subscriptions.get(subscriptionId);

          _this13.subscriptions["delete"](subscriptionId);

          resolve(true);

          var callback = function callback(code, message, data) {
            if (code === RESPONSE_CODE.SUCCESS) {
              _this13.logger.info('unsubscribe stream success');

              _this13.logger.buriedLog({
                t: LogType.EVENT,
                c: stream.getType() === AUXILIARY ? LogCode.UNSUBSCRIBE_STREAM_SCREEN_SUCCESS : LogCode.UNSUBSCRIBE_STREAM_SUCCESS,
                v: "uid:".concat(stream.getUserId(), ",").concat(hasAudio ? 'audio' : 'video')
              });
            } else {
              _this13.logger.buriedLog({
                t: LogType.EVENT,
                c: stream.getType() === AUXILIARY ? LogCode.UNSUBSCRIBE_STREAM_SCREEN_FAILED : LogCode.UNSUBSCRIBE_STREAM_FAILED,
                v: "uid:".concat(stream.getUserId(), ",").concat(hasAudio ? 'audio' : 'video')
              });

              _this13.logger.error('unsubscribe stream with response:', code, message);
            }
          };

          subscription.subscriber.unsubscribe(callback);
        } else {
          _this13.logger.warn('stream is not subscribed', stream.getUserId());

          _this13.logger.buriedLog({
            t: LogType.EVENT,
            c: stream.getType() === AUXILIARY ? LogCode.UNSUBSCRIBE_STREAM_SCREEN_SUCCESS : LogCode.UNSUBSCRIBE_STREAM_SUCCESS,
            v: "uid:".concat(stream.getUserId(), ",").concat(hasAudio ? 'audio' : 'video')
          });

          resolve(true);
        }
      });
    }
    /**
     * 更新本地的大小流
     * @param stream 
     * @param simulcast 
     * @returns 
     */

  }, {
    key: "updateSimulcast",
    value: function updateSimulcast(stream, simulcast) {
      var _this14 = this;

      return new Promise(function (resolve, reject) {
        var publisher = _this14.publications.get(stream.videoStreamId);

        if (!publisher && stream.screen) {
          throw new ER({
            code: ERCode.INVALID_OPERATION,
            message: 'stream is invalid'
          });
        }

        var newSimulcast = simulcast.map(function (e) {
          return {
            type: getSimulcastTypeFromRidStr(e.rid),
            maxWidth: e.maxWidth,
            maxHeight: e.maxHeight
          };
        });
        var currentSimulcast = stream.getSimulcasts();

        if (JSON.stringify(newSimulcast) === JSON.stringify(currentSimulcast)) {
          return _this14.logger.warn("simulcast  ".concat(simulcast, " is same"));
        }

        _this14.logger.info("Update Simulcast ".concat(simulcast));

        var callback = function callback(code, message, roomId) {
          if (code === RESPONSE_CODE.SUCCESS) {
            // stream.setSimulcasts(newSimulcast);
            resolve(true);

            _this14.logger.info("Update Simulcast ".concat(simulcast, " Success"));
          } else {
            var err = new ER({
              code: ERCode.LOCAL_SWITCH_SIMULCAST,
              message: message
            });
            reject(err);
          }
        };

        publisher.updateSimulcast(newSimulcast, callback);
      });
    }
    /**
    * 更新订阅的大小流
    * @param stream  远端流
    * @param status  字符串 "big" | "small"
    * @returns 
    */

  }, {
    key: "setRemoteVideoStreamType",
    value: function setRemoteVideoStreamType(stream, status) {
      var _this15 = this;

      if (!stream || !status) {
        this.logger.error("stream or status is undefined or null");
        throw new ER({
          code: ERCode.INVALID_OPERATION,
          message: "stream or status is undefined or null"
        });
      }

      return new Promise(function (resolve, reject) {
        var rid = {
          big: 'h',
          small: 'l'
        }[status];

        if (!rid) {
          throw new ER({
            code: ERCode.INVALID_OPERATION,
            message: "status: ".concat(status, " is invalid")
          });
        }

        var n = _this15.getRemoteMutedState().filter(function (e) {
          return e.userId === stream.getUserId();
        })[0];

        if (status === 'small' && n && !n.hasSmall) {
          throw new ER({
            code: ERCode.INVALID_OPERATION,
            message: 'does not publish small stream'
          });
        }

        var subscription = _this15.subscriptions.get(stream.videoSubscriptionId);

        if (!subscription) {
          throw new ER({
            code: ERCode.INVALID_OPERATION,
            message: 'remoteStream is invalid'
          });
        }

        var type = getSimulcastTypeFromRidStr(rid);

        if (stream.getSimulcastType() === type) {
          return _this15.logger.warn("status ".concat(status, " is same"));
        }

        _this15.logger.info("Set Remote Video Stream Type ".concat(status));

        _this15.logger.buriedLog({
          t: LogType.EVENT,
          c: type === SimulcastType.SmallStream ? LogCode.SET_REMOTE_VIDEO_STREAM_TYPE_SAMLL : LogCode.SET_REMOTE_VIDEO_STREAM_TYPE_BIG
        });

        var callback = function callback(code, message, roomId) {
          if (code === RESPONSE_CODE.SUCCESS) {
            stream.setSimulcastType(type);

            _this15.logger.info("Set Remote Video Stream Type ".concat(status, " Success"));

            _this15.logger.buriedLog({
              t: LogType.EVENT,
              c: type === SimulcastType.SmallStream ? LogCode.SET_REMOTE_VIDEO_STREAM_TYPE_SAMLL_SUCCESS : LogCode.SET_REMOTE_VIDEO_STREAM_TYPE_BIG_SUCCESSE
            });

            resolve(true);
          } else {
            var err = new ER({
              code: ERCode.REMOTE_SWITCH_SIMULCAST,
              message: message
            });

            _this15.logger.buriedLog({
              t: LogType.EVENT,
              c: type === SimulcastType.SmallStream ? LogCode.SET_REMOTE_VIDEO_STREAM_TYPE_SAMLL_FAILED : LogCode.SET_REMOTE_VIDEO_STREAM_TYPE_BIG_FAILED
            });

            reject(err);
          }
        };

        subscription.subscriber.switchSimulcast(type, callback);
      });
    }
    /**
     * 切换角色
     * @param role 
     */

  }, {
    key: "switchRole",
    value: function () {
      var _switchRole = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee9(role) {
        var _this16 = this;

        var _iterator6, _step6, _loop2;

        return regenerator.wrap(function _callee9$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                if (role) {
                  _context10.next = 2;
                  break;
                }

                throw new ER({
                  code: ERCode.INVALID_OPERATION,
                  message: "role is undefined or null"
                });

              case 2:
                if (!(this.mode === Mode.rtc)) {
                  _context10.next = 4;
                  break;
                }

                throw new ER({
                  code: ERCode.INVALID_OPERATION,
                  message: "role is only valid in live mode"
                });

              case 4:
                if (!(role !== anchor && role !== audience)) {
                  _context10.next = 6;
                  break;
                }

                throw new ER({
                  code: ERCode.INVALID_PARAMETER,
                  message: "role could only be set to a value as anchor or audience"
                });

              case 6:
                if (!(role === this.role)) {
                  _context10.next = 9;
                  break;
                }

                this.logger.warn('can not switch the same role');
                return _context10.abrupt("return", Promise.resolve(true));

              case 9:
                this.logger.buriedLog({
                  t: LogType.EVENT,
                  c: role === anchor ? LogCode.SWITCH_ROLE_ANCHOR : LogCode.SWITCH_ROLE_AUDIENCE
                }); // 切换观众角色，取消发布流

                if (role === audience) {
                  // 取消发布本地流
                  _iterator6 = _createForOfIteratorHelper(this.publications.keys());

                  try {
                    _loop2 = function _loop2() {
                      var streamId = _step6.value;

                      var stream = _this16.localStreams.find(function (s) {
                        return [s.audioStreamId, s.videoStreamId].includes(streamId);
                      });

                      stream && _this16.doUnpublish(stream, streamId);
                    };

                    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                      _loop2();
                    }
                  } catch (err) {
                    _iterator6.e(err);
                  } finally {
                    _iterator6.f();
                  }
                }

                return _context10.abrupt("return", new Promise( /*#__PURE__*/function () {
                  var _ref12 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee8(resolve, reject) {
                    return regenerator.wrap(function _callee8$(_context9) {
                      while (1) {
                        switch (_context9.prev = _context9.next) {
                          case 0:
                            _this16.xsigoClient.switchPermission(_this16.roomId, permissionMap.get(role), function (code, message, roomId) {
                              if (code === RESPONSE_CODE.SUCCESS) {
                                _this16.logger.info("switch role from ".concat(_this16.role, " to ").concat(role));

                                _this16.role = role;
                                _this16.localStreams = [];

                                _this16.logger.buriedLog({
                                  t: LogType.EVENT,
                                  c: role === anchor ? LogCode.SWITCH_ROLE_ANCHOR_SUCCESS : LogCode.SWITCH_ROLE_AUDIENCE_SUCCESS
                                });

                                resolve(true);
                              } else {
                                _this16.logger.buriedLog({
                                  t: LogType.EVENT,
                                  c: role === anchor ? LogCode.SWITCH_ROLE_ANCHOR_FAILED : LogCode.SWITCH_ROLE_AUDIENCE_FAILED
                                });

                                var err = new ER({
                                  code: ERCode.SWITCH_ROLE_ERROR,
                                  message: message
                                });
                                reject(err);
                              }
                            });

                          case 1:
                          case "end":
                            return _context9.stop();
                        }
                      }
                    }, _callee8);
                  }));

                  return function (_x14, _x15) {
                    return _ref12.apply(this, arguments);
                  };
                }()));

              case 12:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee9, this);
      }));

      function switchRole(_x13) {
        return _switchRole.apply(this, arguments);
      }

      return switchRole;
    }()
    /**
     * 监听客户端对象事件
     * @param event 
     * @param callback 
     */

  }, {
    key: "on",
    value: function on(event, handler) {
      this._emitter.on(event, handler);
    }
    /**
     * 取消事件绑定
     * @param event 
     * @param handler 
     */

  }, {
    key: "off",
    value: function off(event, handler) {
      if (this.logger) {
        this.logger.buriedLog({
          t: LogType.EVENT,
          c: LogCode["OFF_".concat(event.replace('-', '_').toUpperCase())]
        });
      }

      this._emitter.off(event, handler);
    }
    /**
     * 获取当前房间内远端用户音视频 mute 状态列表。
     * @returns:
     * 远端用户音视频 mute 状态数组
     *
     */

  }, {
    key: "getRemoteMutedState",
    value: function getRemoteMutedState() {
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: LogCode.GET_REMOTE_MUTED_STATE
      });
      var mutedArr = [];

      var _iterator7 = _createForOfIteratorHelper(this._remoteMutedStateMap),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var _step7$value = _slicedToArray(_step7.value, 2),
              userId = _step7$value[0],
              mutedState = _step7$value[1];

          mutedArr.push(_objectSpread({
            userId: userId
          }, mutedState));
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }

      return mutedArr.filter(function (m) {
        return !m.userId.includes('share_');
      });
    }
    /**
    * 更新用户 muted 状态
    * @param userId string
    */

  }, {
    key: "updateRemoteMutedState",
    value: function updateRemoteMutedState(userId, params) {
      if ([userId, "share_".concat(userId)].includes(this.userId)) return;
      var defaultState = {
        hasAudio: false,
        hasVideo: false,
        audioMuted: true,
        videoMuted: true,
        hasSmall: false
      };
      params = params || defaultState;
      var mutedState = this._remoteMutedStateMap.get(userId) || defaultState;

      this._remoteMutedStateMap.set(userId, _objectSpread(_objectSpread({}, mutedState), params));
    }
    /**
     * 获取当前网络传输状况统计数据
     */

  }, {
    key: "getTransportStats",
    value: function () {
      var _getTransportStats = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee10() {
        var _this17 = this;

        var publisher, _iterator8, _step8, p;

        return regenerator.wrap(function _callee10$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                if (this.publications.size) {
                  _context11.next = 2;
                  break;
                }

                throw new ER({
                  code: ERCode.INVALID_OPERATION,
                  message: "local stream is not published"
                });

              case 2:
                publisher = null;
                _iterator8 = _createForOfIteratorHelper(this.publications.values());
                _context11.prev = 4;

                _iterator8.s();

              case 6:
                if ((_step8 = _iterator8.n()).done) {
                  _context11.next = 12;
                  break;
                }

                p = _step8.value;
                publisher = p;
                return _context11.abrupt("break", 12);

              case 10:
                _context11.next = 6;
                break;

              case 12:
                _context11.next = 17;
                break;

              case 14:
                _context11.prev = 14;
                _context11.t0 = _context11["catch"](4);

                _iterator8.e(_context11.t0);

              case 17:
                _context11.prev = 17;

                _iterator8.f();

                return _context11.finish(17);

              case 20:
                return _context11.abrupt("return", new Promise(function (resolve, reject) {
                  publisher.getTransportStats().then(function (transport) {
                    var _publisher = publisher,
                        userId = _publisher.userId;
                    var packetLossRate = 0;

                    if (_this17.senderStats.has(userId)) {
                      var stats = _this17.senderStats.get(userId);

                      if (stats.video.timestamp) {
                        packetLossRate = stats.video.packetLossRate;
                      } else if (stats.audio.timestamp) {
                        packetLossRate = stats.audio.packetLossRate;
                      } else if (stats.smallVideo.timestamp) {
                        packetLossRate = stats.smallVideo.packetLossRate;
                      }
                    }

                    transport.packetLossRate = packetLossRate;
                    resolve(transport);
                  })["catch"](function (message) {
                    var err = new ER({
                      code: ERCode.INVALID_TRANSPORT_STATA,
                      message: message
                    });
                    reject(err);
                  });
                }));

              case 21:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee10, this, [[4, 14, 17, 20]]);
      }));

      function getTransportStats() {
        return _getTransportStats.apply(this, arguments);
      }

      return getTransportStats;
    }()
    /**
     * 所有下行连接的平均网络质量
     * @returns Promise<StatsIfe.TransportStatsIfe>
     */

  }, {
    key: "getRemoteTransportStats",
    value: function () {
      var _getRemoteTransportStats = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee11() {
        var _this18 = this;

        return regenerator.wrap(function _callee11$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                return _context12.abrupt("return", new Promise(function (resolve) {
                  try {
                    var transport = [];
                    var packetLossRates = [];

                    var _iterator9 = _createForOfIteratorHelper(_this18.subscriptions.values()),
                        _step9;

                    try {
                      for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                        var subscription = _step9.value;
                        var userId = subscription.subscriber.userId;
                        var packetLossRate = 0;

                        if (_this18.receiverStats.has(userId)) {
                          var stats = _this18.receiverStats.get(userId);

                          if (stats.video.timestamp) {
                            packetLossRate = stats.video.packetLossRate;
                          } else if (stats.audio.timestamp) {
                            packetLossRate = stats.audio.packetLossRate;
                          }
                        }

                        packetLossRates.push(packetLossRate);
                        transport.push(subscription.subscriber.getTransportStats());
                      }
                    } catch (err) {
                      _iterator9.e(err);
                    } finally {
                      _iterator9.f();
                    }

                    Promise.all(transport).then(function (resps) {
                      var avgRtt = resps.length > 0 ? resps.reduce(function (a, b) {
                        return a + b;
                      }) / resps.length : -1;
                      var avgPacketLossRate = packetLossRates.length > 0 ? packetLossRates.reduce(function (a, b) {
                        return a + b;
                      }) / packetLossRates.length : 0;
                      resolve({
                        packetLossRate: avgPacketLossRate,
                        rtt: avgRtt
                      });
                    });
                  } catch (e) {
                    resolve({
                      packetLossRate: 0,
                      rtt: -1
                    });
                  }
                }));

              case 1:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee11);
      }));

      function getRemoteTransportStats() {
        return _getRemoteTransportStats.apply(this, arguments);
      }

      return getRemoteTransportStats;
    }()
    /**
     * 网络质量统计数据事件
     */

  }, {
    key: "getNetworkQuality",
    value: function getNetworkQuality() {
      var _this19 = this;

      if (this._interval === -1) {
        var data = {
          uplinkNetworkQuality: 0,
          downlinkNetworkQuality: 0
        };
        this._interval = window.setInterval(function () {
          if (_this19.xsigoClient) {
            var _this19$appConfig;

            var wsState = _this19.xsigoClient.getWsState(_this19.roomId);

            var _ref13 = wsState || {},
                state = _ref13.state,
                prevState = _ref13.prevState;

            var isDisconnected = wsState && (state === 'DISCONNECTED' || state === 'RECONNECTING' || state === "CONNECTING" && prevState === 'RECONNECTING');

            if (isDisconnected) {
              data.uplinkNetworkQuality = 6;
              data.downlinkNetworkQuality = 6;
            } else {
              _this19.getTransportStats().then(function (rep) {
                data.uplinkNetworkQuality = _this19.networkLevel(rep.packetLossRate, rep.rtt);
              })["catch"](function () {
                data.uplinkNetworkQuality = 0;
              });

              _this19.getRemoteTransportStats().then(function (rep) {
                data.downlinkNetworkQuality = _this19.networkLevel(rep.packetLossRate, rep.rtt);
              })["catch"](function () {
                data.downlinkNetworkQuality = 0;
              });
            }

            if (data.uplinkNetworkQuality >= 3 || data.downlinkNetworkQuality >= 3) {
              _this19.logger.warn('network-quality', JSON.stringify(data, null, 4));
            }

            _this19._emitter.emit(NETWORK_QUALITY, data); // 媒体数据上传


            if ((_this19$appConfig = _this19.appConfig) !== null && _this19$appConfig !== void 0 && _this19$appConfig.enableEvent) {
              _this19.getSenderStats();

              _this19.getReceiverStats(); // this.logger.buriedLog({ t: LogType.METRIC, c: LogCode.APPCPU, v: 0 });

            }
          }
        }, 2e3);
      } else {
        this.logger.warn('network quality calculating is already started');
      }
    }
    /**
     * 获取发送端媒体数据
     * @param 
     * @returns 
     */

  }, {
    key: "getSenderStats",
    value: function () {
      var _getSenderStats = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee12() {
        var _this20 = this;

        var _iterator10, _step10, _step10$value, streamId, publisher, _loop3, i;

        return regenerator.wrap(function _callee12$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                _iterator10 = _createForOfIteratorHelper(this.publications.entries());
                _context14.prev = 1;

                _iterator10.s();

              case 3:
                if ((_step10 = _iterator10.n()).done) {
                  _context14.next = 14;
                  break;
                }

                _step10$value = _slicedToArray(_step10.value, 2), streamId = _step10$value[0], publisher = _step10$value[1];
                _loop3 = /*#__PURE__*/regenerator.mark(function _loop3(i) {
                  var st, userId, oldStats, _oldStats$audio, bytesSent, timestamp, retransmittedPacketsSent, packetsSent, stats, aStats, s, cBytesSent, bitrate, cRPS, packetLossRate, _stats, keys, stat;

                  return regenerator.wrap(function _loop3$(_context13) {
                    while (1) {
                      switch (_context13.prev = _context13.next) {
                        case 0:
                          st = _this20.localStreams[i];
                          userId = st.screen ? "share_".concat(st.getUserId()) : st.getUserId();

                          if (!_this20.senderStats.has(userId)) {
                            _this20.senderStats.set(userId, {
                              audio: {
                                bytesSent: 0,
                                timestamp: 0,
                                retransmittedPacketsSent: 0,
                                packetsSent: 0,
                                packetLossRate: 0
                              },
                              video: {
                                bytesSent: 0,
                                timestamp: 0,
                                retransmittedPacketsSent: 0,
                                packetsSent: 0,
                                packetLossRate: 0
                              },
                              smallVideo: {
                                bytesSent: 0,
                                timestamp: 0,
                                retransmittedPacketsSent: 0,
                                packetsSent: 0,
                                packetLossRate: 0
                              }
                            });
                          } // TODO: 暂时不采集屏幕分享的音频媒体指标


                          if (!(st.audioStreamId && st.audioStreamId === streamId && !st.screen)) {
                            _context13.next = 10;
                            break;
                          }

                          oldStats = _this20.senderStats.get(userId);
                          _oldStats$audio = oldStats.audio, bytesSent = _oldStats$audio.bytesSent, timestamp = _oldStats$audio.timestamp, retransmittedPacketsSent = _oldStats$audio.retransmittedPacketsSent, packetsSent = _oldStats$audio.packetsSent;
                          _context13.next = 8;
                          return publisher.getLocalStats('audio');

                        case 8:
                          stats = _context13.sent;

                          if (stats) {
                            aStats = stats.audio; // 计算码率单位kbs

                            s = (stats.timestamp - timestamp) / 1000;
                            cBytesSent = aStats.bytesSent - bytesSent;
                            bitrate = cBytesSent <= 0 ? 0 : (cBytesSent * 8 / s / 1024).toFixed(2); //  计算丢包率

                            cRPS = aStats.retransmittedPacketsSent - retransmittedPacketsSent;
                            packetLossRate = cRPS <= 0 ? 0 : Math.round(cRPS / (aStats.packetsSent - packetsSent) * 100); // console.log('发布端 音频 packetLossRate', packetLossRate);

                            _this20.senderStats.set(userId, _objectSpread(_objectSpread({}, oldStats), {}, {
                              audio: {
                                bytesSent: aStats.bytesSent,
                                timestamp: stats.timestamp,
                                packetsSent: aStats.packetsSent,
                                retransmittedPacketsSent: aStats.retransmittedPacketsSent,
                                packetLossRate: packetLossRate
                              }
                            }));

                            _this20.logger.buriedLog({
                              t: LogType.METRIC,
                              c: LogCode.AURTT,
                              v: stats.rtt
                            });

                            _this20.logger.buriedLog({
                              t: LogType.METRIC,
                              c: LogCode.AUBIT,
                              v: bitrate
                            });

                            _this20.logger.buriedLog({
                              t: LogType.METRIC,
                              c: LogCode.AULOSS,
                              v: packetLossRate
                            }); // this.logger.buriedLog({ t: LogType.METRIC, c: LogCode.AUFPS, v: aStats.packetsSent });

                          }

                        case 10:
                          if (!(st.videoStreamId && st.videoStreamId === streamId)) {
                            _context13.next = 15;
                            break;
                          }

                          _context13.next = 13;
                          return publisher.getLocalStats('video');

                        case 13:
                          _stats = _context13.sent;

                          if (_stats) {
                            keys = ['video'];
                            _this20.isEnableSmallStream && keys.push('smallVideo');
                            stat = _stats;
                            keys.forEach(function (key) {
                              var oldStats = _this20.senderStats.get(userId);

                              var _oldStats$key = oldStats[key],
                                  bytesSent = _oldStats$key.bytesSent,
                                  timestamp = _oldStats$key.timestamp,
                                  retransmittedPacketsSent = _oldStats$key.retransmittedPacketsSent,
                                  packetsSent = _oldStats$key.packetsSent;
                              var vStats = _stats[key]; // 计算码率

                              var s = (stat.timestamp - timestamp) / 1000;
                              var cBytesSent = vStats.bytesSent - bytesSent;
                              var bitrate = cBytesSent <= 0 ? 0 : (cBytesSent * 8 / s / 1024).toFixed(2); // 单位 kbps

                              _this20.logger.debug("key:".concat(key, ",vStats.bytesSent:").concat(vStats.bytesSent, ",bytesSent:").concat(bytesSent, ",bitrate:").concat(bitrate)); // 计算丢包率


                              var cRPS = vStats.retransmittedPacketsSent - retransmittedPacketsSent;
                              var packetLossRate = cRPS <= 0 ? 0 : Math.round(cRPS / (vStats.packetsSent - packetsSent) * 100); // console.log('发布端 视频 packetLossRate', packetLossRate);

                              var newStats = _objectSpread({}, oldStats);

                              if (key === 'video') {
                                newStats.video = {
                                  bytesSent: vStats.bytesSent,
                                  timestamp: stat.timestamp,
                                  packetsSent: vStats.packetsSent,
                                  retransmittedPacketsSent: vStats.retransmittedPacketsSent,
                                  packetLossRate: packetLossRate
                                };
                              }

                              if (key === 'smallVideo') {
                                newStats.smallVideo = {
                                  bytesSent: vStats.bytesSent,
                                  timestamp: stat.timestamp,
                                  packetsSent: vStats.packetsSent,
                                  retransmittedPacketsSent: vStats.retransmittedPacketsSent,
                                  packetLossRate: packetLossRate
                                };
                              }

                              _this20.senderStats.set(userId, newStats);

                              var t = st.screen ? LogStreamType.AuxiliaryStream : vStats.rid === 'l' ? LogStreamType.SmallStream : LogStreamType.BigStream;

                              _this20.logger.buriedLog({
                                t: LogType.METRIC,
                                c: LogCode.VURTT,
                                v: stat.rtt,
                                st: t
                              });

                              _this20.logger.buriedLog({
                                t: LogType.METRIC,
                                c: LogCode.VUBIT,
                                v: bitrate,
                                st: t
                              });

                              _this20.logger.buriedLog({
                                t: LogType.METRIC,
                                c: LogCode.VULOSS,
                                v: packetLossRate,
                                st: t
                              });

                              _this20.logger.buriedLog({
                                t: LogType.METRIC,
                                c: LogCode.VUFPS,
                                v: vStats.framesPerSecond,
                                st: t
                              });

                              _this20.logger.buriedLog({
                                t: LogType.METRIC,
                                c: LogCode.VUWIDTHHEIGHT,
                                v: "".concat(vStats.frameWidth, "_").concat(vStats.frameHeight),
                                st: t
                              });
                            });
                          }

                        case 15:
                        case "end":
                          return _context13.stop();
                      }
                    }
                  }, _loop3);
                });
                _context14.t0 = regenerator.keys(this.localStreams);

              case 7:
                if ((_context14.t1 = _context14.t0()).done) {
                  _context14.next = 12;
                  break;
                }

                i = _context14.t1.value;
                return _context14.delegateYield(_loop3(i), "t2", 10);

              case 10:
                _context14.next = 7;
                break;

              case 12:
                _context14.next = 3;
                break;

              case 14:
                _context14.next = 19;
                break;

              case 16:
                _context14.prev = 16;
                _context14.t3 = _context14["catch"](1);

                _iterator10.e(_context14.t3);

              case 19:
                _context14.prev = 19;

                _iterator10.f();

                return _context14.finish(19);

              case 22:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee12, this, [[1, 16, 19, 22]]);
      }));

      function getSenderStats() {
        return _getSenderStats.apply(this, arguments);
      }

      return getSenderStats;
    }()
    /**
     * 
     * @param 获取接受端媒体数据 
     * @returns 
     */

  }, {
    key: "getReceiverStats",
    value: function () {
      var _getReceiverStats = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee13() {
        var _iterator11, _step11, _step11$value, subId, subscription, userId, puid, streamType, oldStats, _oldStats$audio2, bytesReceived, timestamp, packetsLost, packetsReceived, nackCount, stats, aStats, s, cBytesReceived, bitrate, cPL, cPR, cNC, packetLossRate, _oldStats, _oldStats$video, _bytesReceived, _timestamp, _packetsLost, _packetsReceived, _nackCount, _stats2, vStats, _s, _cBytesReceived, _bitrate, _cPL, _cPR, _cNC, _packetLossRate, simulcastType, t;

        return regenerator.wrap(function _callee13$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _iterator11 = _createForOfIteratorHelper(this.subscriptions.entries());
                _context15.prev = 1;

                _iterator11.s();

              case 3:
                if ((_step11 = _iterator11.n()).done) {
                  _context15.next = 25;
                  break;
                }

                _step11$value = _slicedToArray(_step11.value, 2), subId = _step11$value[0], subscription = _step11$value[1];
                userId = subscription.stream.getUserSeq();
                puid = subscription.stream.getUserId();

                if (!this.receiverStats.has(userId)) {
                  this.receiverStats.set(userId, {
                    audio: {
                      bytesReceived: 0,
                      timestamp: 0,
                      packetsReceived: 0,
                      packetsLost: 0,
                      nackCount: 0,
                      packetLossRate: 0
                    },
                    video: {
                      bytesReceived: 0,
                      timestamp: 0,
                      packetsReceived: 0,
                      packetsLost: 0,
                      nackCount: 0,
                      packetLossRate: 0
                    }
                  });
                }

                streamType = subscription.stream.getType(); // TODO: 暂时不采集屏幕分享的音频媒体指标

                if (!(subId === subscription.stream.audioSubscriptionId && streamType !== AUXILIARY)) {
                  _context15.next = 16;
                  break;
                }

                oldStats = this.receiverStats.get(userId);
                _oldStats$audio2 = oldStats.audio, bytesReceived = _oldStats$audio2.bytesReceived, timestamp = _oldStats$audio2.timestamp, packetsLost = _oldStats$audio2.packetsLost, packetsReceived = _oldStats$audio2.packetsReceived, nackCount = _oldStats$audio2.nackCount;
                _context15.next = 14;
                return subscription.subscriber.getRemoteAudioOrVideoStats('audio');

              case 14:
                stats = _context15.sent;

                if (stats) {
                  aStats = stats.audio; // 计算码率

                  s = (stats.timestamp - timestamp) / 1000;
                  cBytesReceived = aStats.bytesReceived - bytesReceived;
                  bitrate = cBytesReceived <= 0 ? 0 : (cBytesReceived * 8 / s / 1024).toFixed(2); // 计算丢包率

                  cPL = aStats.packetsLost - packetsLost;
                  cPR = aStats.packetsReceived - packetsReceived;
                  cNC = aStats.nackCount - nackCount;
                  packetLossRate = 0;

                  if (cNC <= 0 || cPR <= 0) {
                    packetLossRate = 0;
                  } else if (cNC > cPR) {
                    packetLossRate = 100;
                  } else if (cPL < 0) {
                    packetLossRate = Math.round(cNC / cPR * 100);
                  } else {
                    packetLossRate = Math.round((cPL + cNC) / (cPL + cPR) * 100);
                  } // console.log('音频 PacketLossRate', packetLossRate);


                  this.receiverStats.set(userId, _objectSpread(_objectSpread({}, oldStats), {}, {
                    audio: {
                      bytesReceived: aStats.bytesReceived,
                      timestamp: stats.timestamp,
                      packetsReceived: aStats.packetsReceived,
                      packetsLost: aStats.packetsLost,
                      nackCount: aStats.nackCount,
                      packetLossRate: packetLossRate
                    }
                  }));
                  this.logger.buriedLog({
                    t: LogType.METRIC,
                    c: LogCode.ADBIT,
                    v: bitrate,
                    puid: puid
                  });
                  this.logger.buriedLog({
                    t: LogType.METRIC,
                    c: LogCode.ADLOSS,
                    v: packetLossRate,
                    puid: puid
                  });
                  this.logger.buriedLog({
                    t: LogType.METRIC,
                    c: LogCode.ADRTT,
                    v: stats.rtt,
                    puid: puid
                  }); // this.logger.buriedLog({ t: LogType.METRIC, c: LogCode.ADFPS, v: aStats.packetsSent, puid });
                }

              case 16:
                if (!(subId === subscription.stream.videoSubscriptionId)) {
                  _context15.next = 23;
                  break;
                }

                _oldStats = this.receiverStats.get(userId);
                _oldStats$video = _oldStats.video, _bytesReceived = _oldStats$video.bytesReceived, _timestamp = _oldStats$video.timestamp, _packetsLost = _oldStats$video.packetsLost, _packetsReceived = _oldStats$video.packetsReceived, _nackCount = _oldStats$video.nackCount;
                _context15.next = 21;
                return subscription.subscriber.getRemoteAudioOrVideoStats('video');

              case 21:
                _stats2 = _context15.sent;

                if (_stats2) {
                  vStats = _stats2.video; // 计算码率 单位 kbps

                  _s = (_stats2.timestamp - _timestamp) / 1000;
                  _cBytesReceived = vStats.bytesReceived - _bytesReceived;
                  _bitrate = _cBytesReceived <= 0 ? 0 : (_cBytesReceived * 8 / _s / 1024).toFixed(2); // 计算丢包率

                  _cPL = vStats.packetsLost - _packetsLost;
                  _cPR = vStats.packetsReceived - _packetsReceived;
                  _cNC = vStats.nackCount - _nackCount;
                  _packetLossRate = 0;

                  if (_cNC <= 0 || _cPR <= 0) {
                    _packetLossRate = 0;
                  } else if (_cNC > _cPR) {
                    _packetLossRate = 100;
                  } else if (_cPL < 0) {
                    _packetLossRate = Math.round(_cNC / _cPR * 100);
                  } else {
                    _packetLossRate = Math.round((_cPL + _cNC) / (_cPL + _cPR) * 100);
                  } // console.log('视频 cPacketLossRate', packetLossRate);


                  this.receiverStats.set(userId, _objectSpread(_objectSpread({}, _oldStats), {}, {
                    video: {
                      bytesReceived: vStats.bytesReceived,
                      timestamp: _stats2.timestamp,
                      packetsReceived: vStats.packetsReceived,
                      packetsLost: vStats.packetsLost,
                      nackCount: vStats.nackCount,
                      packetLossRate: _packetLossRate
                    }
                  }));
                  simulcastType = subscription.stream.getSimulcastType();
                  t = streamType === AUXILIARY ? LogStreamType.AuxiliaryStream : simulcastType === SimulcastType.SmallStream ? LogStreamType.SmallStream : LogStreamType.BigStream;
                  this.logger.buriedLog({
                    t: LogType.METRIC,
                    c: LogCode.VDBIT,
                    v: _bitrate,
                    st: t,
                    puid: puid
                  });
                  this.logger.buriedLog({
                    t: LogType.METRIC,
                    c: LogCode.VDLOSS,
                    v: _packetLossRate,
                    st: t,
                    puid: puid
                  });
                  this.logger.buriedLog({
                    t: LogType.METRIC,
                    c: LogCode.VDRTT,
                    v: _stats2.rtt,
                    st: t,
                    puid: puid
                  });
                  this.logger.buriedLog({
                    t: LogType.METRIC,
                    c: LogCode.VDFPS,
                    v: vStats.framesPerSecond,
                    st: t,
                    puid: puid
                  });
                  this.logger.buriedLog({
                    t: LogType.METRIC,
                    c: LogCode.VDWIDTHHEIGHT,
                    v: "".concat(vStats.frameWidth, "_").concat(vStats.frameHeight),
                    st: t,
                    puid: puid
                  });
                }

              case 23:
                _context15.next = 3;
                break;

              case 25:
                _context15.next = 30;
                break;

              case 27:
                _context15.prev = 27;
                _context15.t0 = _context15["catch"](1);

                _iterator11.e(_context15.t0);

              case 30:
                _context15.prev = 30;

                _iterator11.f();

                return _context15.finish(30);

              case 33:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee13, this, [[1, 27, 30, 33]]);
      }));

      function getReceiverStats() {
        return _getReceiverStats.apply(this, arguments);
      }

      return getReceiverStats;
    }()
    /**
     * 网络质量枚举
     * @param packetLossRate, rtt
     * @returns
     */

  }, {
    key: "networkLevel",
    value: function networkLevel(packetLossRate, rtt) {
      return packetLossRate > 50 || rtt > 500 ? 5 : packetLossRate > 30 || rtt > 350 ? 4 : packetLossRate > 20 || rtt > 200 ? 3 : packetLossRate > 10 || rtt > 100 ? 2 : packetLossRate >= 0 || rtt >= 0 ? 1 : 0;
    }
    /**
      * 获取当前已发布本地流的音频统计数据
      * 该方法需要在 publish() 后调用
      */

  }, {
    key: "getLocalAudioStats",
    value: function getLocalAudioStats() {
      return this.getLocalStatsMap('audio');
    }
    /**
     * 获取当前已发布本地流的视频统计数据
     * 该方法需要在 publish() 后调用
     */

  }, {
    key: "getLocalVideoStats",
    value: function getLocalVideoStats() {
      return this.getLocalStatsMap('video');
    }
  }, {
    key: "getLocalStatsMap",
    value: function () {
      var _getLocalStatsMap = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee14(type) {
        var havePublished, statsMap, _iterator12, _step12, _step12$value, streamId, publisher, i, st, userId, stats, _stats$type, bytesSent, packetsSent, _stats$type2, _bytesSent, _packetsSent, framesEncoded, frameWidth, frameHeight, framesSent, e;

        return regenerator.wrap(function _callee14$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                havePublished = this.localStreams.some(function (l) {
                  return l.published && (type === 'audio' ? l.audioStreamId : l.videoStreamId);
                });

                if (havePublished) {
                  _context16.next = 3;
                  break;
                }

                throw new ER({
                  code: ERCode.INVALID_OPERATION,
                  message: "local stream is not published"
                });

              case 3:
                statsMap = new Map();
                _context16.prev = 4;
                _iterator12 = _createForOfIteratorHelper(this.publications.entries());
                _context16.prev = 6;

                _iterator12.s();

              case 8:
                if ((_step12 = _iterator12.n()).done) {
                  _context16.next = 25;
                  break;
                }

                _step12$value = _slicedToArray(_step12.value, 2), streamId = _step12$value[0], publisher = _step12$value[1];
                _context16.t0 = regenerator.keys(this.localStreams);

              case 11:
                if ((_context16.t1 = _context16.t0()).done) {
                  _context16.next = 23;
                  break;
                }

                i = _context16.t1.value;
                st = this.localStreams[i];

                if (!(type === 'audio' ? st.audioStreamId === streamId : st.videoStreamId === streamId)) {
                  _context16.next = 21;
                  break;
                }

                userId = st.screen ? "share_".concat(st.getUserId()) : st.getUserId();
                _context16.next = 18;
                return publisher.getLocalStats(type);

              case 18:
                stats = _context16.sent;

                if (type === 'audio' && stats) {
                  _stats$type = stats[type], bytesSent = _stats$type.bytesSent, packetsSent = _stats$type.packetsSent;
                  statsMap.set(userId, {
                    bytesSent: bytesSent,
                    packetsSent: packetsSent
                  });
                }

                if (type === 'video' && stats) {
                  _stats$type2 = stats[type], _bytesSent = _stats$type2.bytesSent, _packetsSent = _stats$type2.packetsSent, framesEncoded = _stats$type2.framesEncoded, frameWidth = _stats$type2.frameWidth, frameHeight = _stats$type2.frameHeight, framesSent = _stats$type2.framesSent;
                  statsMap.set(userId, {
                    bytesSent: _bytesSent,
                    packetsSent: _packetsSent,
                    framesEncoded: framesEncoded,
                    frameWidth: frameWidth,
                    frameHeight: frameHeight,
                    framesSent: framesSent
                  });
                }

              case 21:
                _context16.next = 11;
                break;

              case 23:
                _context16.next = 8;
                break;

              case 25:
                _context16.next = 30;
                break;

              case 27:
                _context16.prev = 27;
                _context16.t2 = _context16["catch"](6);

                _iterator12.e(_context16.t2);

              case 30:
                _context16.prev = 30;

                _iterator12.f();

                return _context16.finish(30);

              case 33:
                return _context16.abrupt("return", Promise.resolve(statsMap));

              case 36:
                _context16.prev = 36;
                _context16.t3 = _context16["catch"](4);
                this.logger.info("Get local ".concat(type, " stats failed"), _context16.t3);
                e = new ER({
                  code: type === 'audio' ? ERCode.LOCAL_AUDIO_STATA_ERROR : ERCode.LOCAL_VIDEO_STATA_ERROR,
                  message: _context16.t3.message
                });
                return _context16.abrupt("return", Promise.reject(e));

              case 41:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee14, this, [[4, 36], [6, 27, 30, 33]]);
      }));

      function getLocalStatsMap(_x16) {
        return _getLocalStatsMap.apply(this, arguments);
      }

      return getLocalStatsMap;
    }()
    /**
     * 获取当前所有远端流的音频统计数据
     */

  }, {
    key: "getRemoteAudioStats",
    value: function getRemoteAudioStats() {
      var _this21 = this;

      return new Promise( /*#__PURE__*/function () {
        var _ref14 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee15(resolve, reject) {
          var remoteStMap, _iterator13, _step13, _step13$value, subId, subscription, userId, stats, e;

          return regenerator.wrap(function _callee15$(_context17) {
            while (1) {
              switch (_context17.prev = _context17.next) {
                case 0:
                  remoteStMap = new Map();
                  _context17.prev = 1;

                  _this21.logger.info('get remote audio Stats', _this21.subscriptions);

                  _iterator13 = _createForOfIteratorHelper(_this21.subscriptions.entries());
                  _context17.prev = 4;

                  _iterator13.s();

                case 6:
                  if ((_step13 = _iterator13.n()).done) {
                    _context17.next = 16;
                    break;
                  }

                  _step13$value = _slicedToArray(_step13.value, 2), subId = _step13$value[0], subscription = _step13$value[1];
                  userId = subscription.stream.getUserSeq();

                  if (!(subId === subscription.stream.audioSubscriptionId)) {
                    _context17.next = 14;
                    break;
                  }

                  _context17.next = 12;
                  return subscription.subscriber.getRemoteAudioOrVideoStats('audio');

                case 12:
                  stats = _context17.sent;
                  stats && remoteStMap.set(userId, stats.audio);

                case 14:
                  _context17.next = 6;
                  break;

                case 16:
                  _context17.next = 21;
                  break;

                case 18:
                  _context17.prev = 18;
                  _context17.t0 = _context17["catch"](4);

                  _iterator13.e(_context17.t0);

                case 21:
                  _context17.prev = 21;

                  _iterator13.f();

                  return _context17.finish(21);

                case 24:
                  resolve(remoteStMap);
                  _context17.next = 32;
                  break;

                case 27:
                  _context17.prev = 27;
                  _context17.t1 = _context17["catch"](1);

                  _this21.logger.error('Get Remote Audio Stats Failed', _context17.t1);

                  e = new ER({
                    code: ERCode.REMOTE_AUDIO_STATA_ERROR,
                    message: _context17.t1.message
                  });
                  reject(e);

                case 32:
                case "end":
                  return _context17.stop();
              }
            }
          }, _callee15, null, [[1, 27], [4, 18, 21, 24]]);
        }));

        return function (_x17, _x18) {
          return _ref14.apply(this, arguments);
        };
      }());
    }
    /**
     * 获取当前所有远端流的视频统计数据
     */

  }, {
    key: "getRemoteVideoStats",
    value: function getRemoteVideoStats() {
      var _this22 = this;

      return new Promise( /*#__PURE__*/function () {
        var _ref15 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee16(resolve, reject) {
          var remoteStMap, _iterator14, _step14, _step14$value, subId, subscription, userId, stats, _stats$video, bytesReceived, packetsReceived, packetsLost, framesDecoded, frameWidth, frameHeight, e;

          return regenerator.wrap(function _callee16$(_context18) {
            while (1) {
              switch (_context18.prev = _context18.next) {
                case 0:
                  remoteStMap = new Map();
                  _context18.prev = 1;

                  _this22.logger.info('get remote video Stats', _this22.subscriptions);

                  _iterator14 = _createForOfIteratorHelper(_this22.subscriptions.entries());
                  _context18.prev = 4;

                  _iterator14.s();

                case 6:
                  if ((_step14 = _iterator14.n()).done) {
                    _context18.next = 16;
                    break;
                  }

                  _step14$value = _slicedToArray(_step14.value, 2), subId = _step14$value[0], subscription = _step14$value[1];
                  userId = subscription.stream.getUserSeq();

                  if (!(subId === subscription.stream.videoSubscriptionId)) {
                    _context18.next = 14;
                    break;
                  }

                  _context18.next = 12;
                  return subscription.subscriber.getRemoteAudioOrVideoStats('video');

                case 12:
                  stats = _context18.sent;

                  if (stats) {
                    _stats$video = stats.video, bytesReceived = _stats$video.bytesReceived, packetsReceived = _stats$video.packetsReceived, packetsLost = _stats$video.packetsLost, framesDecoded = _stats$video.framesDecoded, frameWidth = _stats$video.frameWidth, frameHeight = _stats$video.frameHeight;
                    remoteStMap.set(userId, {
                      bytesReceived: bytesReceived,
                      packetsReceived: packetsReceived,
                      packetsLost: packetsLost,
                      framesDecoded: framesDecoded,
                      frameWidth: frameWidth,
                      frameHeight: frameHeight
                    });
                  }

                case 14:
                  _context18.next = 6;
                  break;

                case 16:
                  _context18.next = 21;
                  break;

                case 18:
                  _context18.prev = 18;
                  _context18.t0 = _context18["catch"](4);

                  _iterator14.e(_context18.t0);

                case 21:
                  _context18.prev = 21;

                  _iterator14.f();

                  return _context18.finish(21);

                case 24:
                  resolve(remoteStMap);
                  _context18.next = 32;
                  break;

                case 27:
                  _context18.prev = 27;
                  _context18.t1 = _context18["catch"](1);

                  _this22.logger.error('Get Remote Video Stats Failed', _context18.t1);

                  e = new ER({
                    code: ERCode.REMOTE_VIDEO_STATA_ERROR,
                    message: _context18.t1.message
                  });
                  reject(e);

                case 32:
                case "end":
                  return _context18.stop();
              }
            }
          }, _callee16, null, [[1, 27], [4, 18, 21, 24]]);
        }));

        return function (_x19, _x20) {
          return _ref15.apply(this, arguments);
        };
      }());
    }
    /**
     * webSocket状态改变
     */

  }, {
    key: "onWsStateChange",
    value: function onWsStateChange(roomId, prevState, state) {
      this.logger.info("Ws state from ".concat(prevState, " to ").concat(state));

      this._emitter.emit(CONNECTION_STATE_CHANGED, {
        state: state,
        prevState: prevState
      });
    }
    /**
     * 监听Error事件
     */

  }, {
    key: "onError",
    value: function onError(error) {
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: LogCode.ON_ERROR,
        v: "".concat(error.message)
      });

      this._emitter.emit(ERROR, error);
    }
    /**
     * 重连失败
     * @param userId 
     */

  }, {
    key: "onWsReconnectFailed",
    value: function onWsReconnectFailed(roomId) {
      this.logger.warn("room: ".concat(roomId, " reconnection failed"));
      var e = new ER({
        code: ERCode.SIGNAL_CHANNEL_RECONNECTION_FAILED,
        message: "signal channel reconnection failed, please check your network"
      });

      this._emitter.emit(ERROR, e);

      this.leave();
    }
    /**
     * 成员离开房间回调
     * 1、销毁userId对应远端流(音视频流 and 屏幕共享流)
     * 2、更新订阅状态，断开PeerConnection连接
     * @param userId 
     */

  }, {
    key: "onParticipantLeave",
    value: function onParticipantLeave(userId) {
      var _this23 = this;

      this.logger.info("======notification: ".concat(userId, " leave======"));

      try {
        var shareId = "share_".concat(userId);
        var stream = this.remoteStreams.get(userId);
        var shareStream = this.remoteStreams.get(shareId);

        var deleteStream = function deleteStream(st, id) {
          _this23.logger.buriedLog({
            t: LogType.EVENT,
            c: st.type === AUXILIARY ? LogCode.ON_STREAM_REMOVED_SCREEN : LogCode.ON_STREAM_REMOVED,
            v: "uid:".concat(userId)
          });

          _this23._emitter.emit(STREAM_REMOVED, {
            stream: st
          });

          _this23.remoteStreams["delete"](id);

          _this23.subscribeManager.subscriptedState["delete"](id);

          _this23.receiverStats.has(id) && _this23.receiverStats["delete"](id);

          var _iterator15 = _createForOfIteratorHelper(_this23.subscriptions.entries()),
              _step15;

          try {
            for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
              var _step15$value = _slicedToArray(_step15.value, 2),
                  subId = _step15$value[0],
                  subscription = _step15$value[1];

              if ([st.audioSubscriptionId, st.videoSubscriptionId].includes(subId)) {
                subscription.subscriber.close();

                _this23.subscriptions["delete"](subId);
              }
            }
          } catch (err) {
            _iterator15.e(err);
          } finally {
            _iterator15.f();
          }
        };

        stream && deleteStream(stream, userId);
        shareStream && deleteStream(shareStream, shareId);

        if (this._remoteMutedStateMap.has(userId)) {
          this._remoteMutedStateMap["delete"](userId);
        }
      } catch (err) {
        this.logger.info(err);
      }

      this.logger.buriedLog({
        t: LogType.EVENT,
        c: LogCode.ON_PEER_LEVAE,
        v: "uid:".concat(userId)
      }); // 触发 peer-leave 事件

      this._emitter.emit(PEER_LEAVE, {
        userId: userId
      });
    }
    /**
     * stream-add 回调
     * @param params 
     * @returns
     */

  }, {
    key: "onStreamAdd",
    value: function onStreamAdd(params) {
      var _ref16 = params || {},
          userId = _ref16.userId,
          streamId = _ref16.streamId,
          info = _ref16.info,
          mixedInfo = _ref16.mixedInfo;

      var _ref17 = info || {},
          audio = _ref17.audio,
          video = _ref17.video;

      this.logger.info('time  Date.now stream-add', Date.now());
      if (userId === this.userId) return;

      var _ref18 = audio || video || {},
          source = _ref18.source;

      if (source === VideoSourceType.ScreenShare) {
        userId = "share_".concat(userId);
      }

      var remoteStream = this.remoteStreams.get(userId);
      this.logger.info('userId: ' + userId, 'remote stream', remoteStream);
      this.logger.info('userId: ' + userId, this.subscribeManager.getSubscriptedState(userId));

      if (remoteStream) {
        var StreamKind$1 = this.subscribeManager.needSubscribeKind(userId);
        var subState = this.subscribeManager.getSubscriptionOpts(userId);
        var options = {
          audio: false,
          video: false,
          small: subState.small
        };

        if (StreamKind$1 === StreamKind.AudioOnly) {
          options.audio = true;
        }

        if (StreamKind$1 === StreamKind.VideoOnly) {
          options.video = true;
        }

        if (StreamKind$1 === StreamKind.AudioVideo) {
          options.audio = true;
          options.video = true;
        }

        if (!!audio) {
          remoteStream.setAudio(!!audio);
          remoteStream.setHasAudio(!!audio);
          remoteStream.setAudioStreamId(streamId);
          remoteStream.setMutedState('audio', audio.muted);
          this.updateRemoteMutedState(userId, {
            hasAudio: true,
            audioMuted: audio.muted
          });
        }

        if (!!video) {
          remoteStream.setVideo(!!video);
          remoteStream.setHasVideo(!!video);
          remoteStream.setVideoStreamId(streamId);
          remoteStream.setInfo(info);
          var hasSmall = (video.simulcast || []).find(function (s) {
            return s.type === SimulcastType.SmallStream;
          });
          remoteStream.setMutedState('video', video.muted);
          this.updateRemoteMutedState(userId, {
            hasVideo: true,
            videoMuted: video.muted,
            hasSmall: !!hasSmall
          });
        }

        this.logger.info('Auto subscribe options', JSON.stringify(options));
        (options.audio || options.video) && this.doSubscribe(remoteStream, options);
      } else {
        remoteStream = new RemoteStream$1({
          userId: userId,
          type: source === VideoSourceType.ScreenShare ? AUXILIARY : MAIN,
          info: info,
          mixedInfo: mixedInfo
        }, this.logger);
        remoteStream.streamId = streamId;
        this.remoteStreams.set(userId, remoteStream);

        if (!!audio) {
          remoteStream.setAudio(!!audio);
          remoteStream.setHasAudio(!!audio);
          remoteStream.setAudioStreamId(streamId);
          remoteStream.setMutedState('audio', audio.muted);
          this.updateRemoteMutedState(userId, {
            hasAudio: true,
            audioMuted: audio.muted
          });
        }

        if (!!video) {
          remoteStream.setVideo(!!video);
          remoteStream.setHasVideo(!!video);
          remoteStream.setVideoStreamId(streamId);

          var _hasSmall = (video.simulcast || []).find(function (s) {
            return s.type === SimulcastType.SmallStream;
          });

          remoteStream.setMutedState('video', video.muted);
          this.updateRemoteMutedState(userId, {
            hasVideo: true,
            videoMuted: video.muted,
            hasSmall: !!_hasSmall
          });
        }

        this.logger.buriedLog({
          t: LogType.EVENT,
          c: remoteStream.type === AUXILIARY ? LogCode.ON_STREAM_ADDED_SCREEN : LogCode.ON_STREAM_ADDED,
          v: "uid:".concat(remoteStream.getUserId())
        }); // 触发 stream-added 事件

        this._emitter.emit(STREAM_ADDED, {
          stream: remoteStream
        });
      }
    }
    /**
     * stream 发生变化事件
     * @param userId 
     * @param streamId 
     * @returns 
     */

  }, {
    key: "onStreamChange",
    value: function onStreamChange(id, streamId) {
      var userId = id;
      var type = this.getType(streamId);

      if (type === AUXILIARY) {
        userId = "share_".concat(userId);
      }

      this.logger.info('time  Date.now stream-remove', Date.now());
      var stream = this.remoteStreams.get(userId);
      if (userId === this.userId || userId === "share_".concat(userId) || !stream) return;
      var subState = this.subscribeManager.getSubscriptedState(userId); // 两路流都移除才移除，否则触发mute事件

      if (stream && stream.getStreamKind(streamId) === StreamKind.AudioOnly) {
        if (!stream.hasVideo()) {
          this.doStreamRemove(userId);
          return;
        } else if (stream.hasAudio()) {
          var t = stream.getAudioTrack();
          t && stream.mediaStream.removeTrack(t);
          subState.audio = false;
          stream.setHasAudio(false);
          stream.setAudioStreamId(null);

          if (this.subscriptions.has(stream.audioSubscriptionId)) {
            this.subscriptions.get(stream.audioSubscriptionId).subscriber.close();
            this.subscriptions["delete"](stream.audioSubscriptionId);
            stream.setAudioSubscriptionId(null);
          }

          stream.setMutedState('audio', true);
          this.updateRemoteMutedState(userId, {
            hasAudio: false,
            audioMuted: true
          });

          if (this.receiverStats.has(userId)) {
            this.receiverStats.get(userId).audio = {
              bytesReceived: 0,
              timestamp: 0,
              packetsReceived: 0,
              packetsLost: 0,
              nackCount: 0,
              packetLossRate: 0
            };
          }

          this._emitter.emit(MUTE_AUDIO, {
            userId: userId
          });
        }
      }

      if (stream && stream.getStreamKind(streamId) === StreamKind.VideoOnly) {
        if (!stream.hasAudio()) {
          this.doStreamRemove(userId);
          return;
        } else if (stream.hasVideo()) {
          var _t = stream.getVideoTrack();

          _t && stream.mediaStream.removeTrack(_t);
          subState.video = false;
          stream.setHasVideo(false);
          stream.setVideoStreamId(null);

          if (this.subscriptions.has(stream.videoSubscriptionId)) {
            this.subscriptions.get(stream.videoSubscriptionId).subscriber.close();
            this.subscriptions["delete"](stream.videoSubscriptionId);
            stream.setVideoSubscriptionId(null);
          }

          stream.setSimulcasts([]);
          stream.setMutedState('video', true);
          this.updateRemoteMutedState(userId, {
            hasVideo: false,
            videoMuted: true,
            hasSmall: false
          });

          if (this.receiverStats.has(userId)) {
            this.receiverStats.get(userId).video = {
              bytesReceived: 0,
              timestamp: 0,
              packetsReceived: 0,
              packetsLost: 0,
              nackCount: 0,
              packetLossRate: 0
            };
          }

          this._emitter.emit(MUTE_VIDEO, {
            userId: userId
          });
        }
      }

      this.subscribeManager.updateSubscriptedState(userId, subState);

      this._emitter.emit(STREAM_UPDATED, {
        stream: stream
      });
    }
    /**
     * stream remove
     * @param userId 
     */

  }, {
    key: "doStreamRemove",
    value: function doStreamRemove(userId) {
      var _this24 = this;

      var stream = this.remoteStreams.get(userId);
      var subState = this.subscribeManager.getSubscriptedState(userId);
      subState.audio = false;
      subState.video = false;
      this.subscribeManager.updateSubscriptedState(userId, subState);

      if (stream) {
        stream.setAudioStreamId(null);
        stream.setVideoStreamId(null);
        stream.setMutedState('audio', true);
        stream.setMutedState('video', true);
        this.remoteStreams["delete"](userId);
        this.logger.info('time  Date.now delete remoteStreams', Date.now(), stream.audioSubscriptionId, stream.videoSubscriptionId);
        this.receiverStats.has(userId) && this.receiverStats["delete"](userId);
        var subIds = [];
        stream.audioSubscriptionId && subIds.push(stream.audioSubscriptionId);
        stream.videoSubscriptionId && subIds.push(stream.videoSubscriptionId);
        subIds.forEach(function (subId) {
          if (_this24.subscriptions.has(subId)) {
            _this24.subscriptions.get(subId).subscriber.close();

            _this24.subscriptions["delete"](subId);

            subId === stream.audioSubscriptionId && stream.setAudioSubscriptionId(null);
            subId === stream.videoSubscriptionId && stream.setVideoSubscriptionId(null);
          }
        });
        this.logger.info('do stream remove with ', this.subscriptions);
        this.logger.buriedLog({
          t: LogType.EVENT,
          c: stream.type === AUXILIARY ? LogCode.ON_STREAM_REMOVED_SCREEN : LogCode.ON_STREAM_REMOVED,
          v: "uid:".concat(stream.getUserId())
        });
        this.updateRemoteMutedState(userId);

        this._emitter.emit(STREAM_REMOVED, {
          stream: stream
        });
      }
    }
    /** 
     * 用户被踢出房间
    */

  }, {
    key: "onClientBanned",
    value: function onClientBanned(cause) {
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: LogCode.ON_CLIENT_BANNED,
        v: "cause:".concat(cause)
      }, true);

      var _iterator16 = _createForOfIteratorHelper(this.publications.values()),
          _step16;

      try {
        for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
          var publisher = _step16.value;
          publisher.close();
        }
      } catch (err) {
        _iterator16.e(err);
      } finally {
        _iterator16.f();
      }

      var _iterator17 = _createForOfIteratorHelper(this.subscriptions.values()),
          _step17;

      try {
        for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
          var subscription = _step17.value;
          subscription.subscriber.close();
        }
      } catch (err) {
        _iterator17.e(err);
      } finally {
        _iterator17.f();
      }

      this.reset();

      this._emitter.emit(CLIENT_BANNED, {
        cause: cause
      });
    }
    /**
     * stream update
     * @param stream 
     */

  }, {
    key: "onStreamUpdate",
    value: function onStreamUpdate(userId, streamId, liveStatus, simulcast) {
      // 监听本地/远端流的音视频是否静音
      var id = userId;

      if (this.remoteStreams.has("share_".concat(userId))) {
        var _this$remoteStreams$g = this.remoteStreams.get("share_".concat(userId)),
            audioStreamId = _this$remoteStreams$g.audioStreamId,
            videoStreamId = _this$remoteStreams$g.videoStreamId;

        if ([audioStreamId, videoStreamId].includes(streamId)) {
          id = "share_".concat(userId);
        }
      }

      var stream = this.localStreams.find(function (s) {
        return [s.audioStreamId, s.videoStreamId].includes(streamId);
      });

      if (!stream) {
        stream = this.remoteStreams.get(id);
      } // 监听本地/远端流的音视频是否静音


      if (liveStatus !== null && liveStatus !== void 0 && liveStatus.audio) {
        if (userId !== this.userId) {
          this.logger.buriedLog({
            t: LogType.EVENT,
            c: liveStatus.audio.muted ? LogCode.ON_MUTE_AUDIO : LogCode.ON_UNMUTE_AUDIO,
            v: "uid:".concat(userId)
          });
        }

        if (liveStatus.audio.muted) {
          this._emitter.emit(MUTE_AUDIO, {
            userId: id
          });
        } else {
          this._emitter.emit(UNMUTE_AUDIO, {
            userId: id
          });
        }

        stream.setMutedState('audio', liveStatus.audio.muted);
        this.updateRemoteMutedState(userId, {
          audioMuted: liveStatus.audio.muted
        });
      }

      if (liveStatus !== null && liveStatus !== void 0 && liveStatus.video) {
        if (userId !== this.userId) {
          this.logger.buriedLog({
            t: LogType.EVENT,
            c: liveStatus.video.muted ? LogCode.ON_MUTE_VIDEO : LogCode.ON_UNMUTE_VIDEO,
            v: "uid:".concat(userId)
          });
        }

        if (liveStatus.video.muted) {
          this._emitter.emit(MUTE_VIDEO, {
            userId: id
          });
        } else {
          this._emitter.emit(UNMUTE_VIDEO, {
            userId: id
          });
        }

        stream.setMutedState('video', liveStatus.video.muted);
        this.updateRemoteMutedState(userId, {
          videoMuted: liveStatus.video.muted
        });
      } // 切换大小流通知


      if (simulcast && simulcast.length) {
        if (this.remoteStreams.has(userId)) {
          var _stream = this.remoteStreams.get(userId);

          _stream.setSimulcasts(simulcast);

          this.logger.buriedLog({
            t: LogType.EVENT,
            c: _stream.getType() === AUXILIARY ? LogCode.ON_STREAM_UPDATED_SCREEN : LogCode.ON_STREAM_UPDATED,
            v: "uid:".concat(_stream.getUserId())
          });

          this._emitter.emit(STREAM_UPDATED, {
            stream: _stream
          });
        }

        var hasSmall = (simulcast || []).find(function (s) {
          return s.type === SimulcastType.SmallStream;
        });
        this.updateRemoteMutedState(userId, {
          hasVideo: true,
          hasSmall: !!hasSmall
        });
      }
    }
    /**
     * 根据userId、streamId 获取Stream类型
     * @param userId 
     * @param streamId 
     */

  }, {
    key: "getType",
    value: function getType(streamId) {
      var type;

      var _iterator18 = _createForOfIteratorHelper(this.remoteStreams),
          _step18;

      try {
        for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
          var _step18$value = _slicedToArray(_step18.value, 2),
              k = _step18$value[0],
              v = _step18$value[1];

          if (v.audioStreamId === streamId || v.videoStreamId === streamId) {
            type = v.getType();
            break;
          }
        }
      } catch (err) {
        _iterator18.e(err);
      } finally {
        _iterator18.f();
      }

      return type;
    }
    /**
     * 获取本地流
     * @returns boolean
     */

  }, {
    key: "hasPublishedStream",
    value: function hasPublishedStream() {
      return this.localStreams.some(function (l) {
        return l.published;
      });
    }
    /**
     * 获取房间状态
     * @returns number
     */

  }, {
    key: "getClientState",
    value: function getClientState() {
      return this.state;
    }
    /**
     * 监听本地设备变化事件
     * @returns 
     */

  }, {
    key: "onDeviceChange",
    value: function () {
      var _onDeviceChange = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee17() {
        var _this25 = this;

        var devices, preDiviceList, addedDevices, removedDevices, localStream, preHasAudioinput, preHasVideoinput, addAudioinputs, addVideoinputs, audio, video, _localStream$getDevic, microphone, camera, rUseMic, rUseCam, hasMic, hasCam, rAudio, rVideo, track, _track;

        return regenerator.wrap(function _callee17$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                _context19.prev = 0;
                _context19.next = 3;
                return getDevices();

              case 3:
                devices = _context19.sent;
                preDiviceList = JSON.parse(JSON.stringify(this._preDiviceList));
                this._preDiviceList = devices;
                addedDevices = devices.filter(function (d) {
                  return preDiviceList.findIndex(function (p) {
                    return p.deviceId === d.deviceId;
                  }) === -1;
                });
                this.logger.info('onDeviceChange addedDevices', JSON.stringify(addedDevices, null, 4));
                removedDevices = preDiviceList.filter(function (d) {
                  return devices.findIndex(function (p) {
                    return p.deviceId === d.deviceId;
                  }) === -1;
                });
                this.logger.info('onDeviceChange removedDevices', JSON.stringify(removedDevices, null, 4));
                localStream = this.localStreams.find(function (e) {
                  return !e.screen;
                });

                if (!localStream) {
                  _context19.next = 73;
                  break;
                }

                if (!(addedDevices && addedDevices.length)) {
                  _context19.next = 39;
                  break;
                }

                preHasAudioinput = preDiviceList.find(function (p) {
                  return p.kind === 'audioinput';
                });
                preHasVideoinput = preDiviceList.find(function (p) {
                  return p.kind === 'videoinput';
                });
                addAudioinputs = addedDevices.filter(function (e) {
                  return e.kind === 'audioinput';
                });
                addVideoinputs = addedDevices.filter(function (e) {
                  return e.kind === 'videoinput';
                });
                audio = !preHasAudioinput && addAudioinputs.length > 0 && localStream.hasAudio();
                video = !preHasVideoinput && addVideoinputs.length > 0 && localStream.hasVideo();

                if (!(audio && video)) {
                  _context19.next = 27;
                  break;
                }

                this.logger.warn("new microphone and camera detected, but there was no device before.");
                _context19.next = 23;
                return localStream.updateStream({
                  audio: !0,
                  video: !0,
                  cameraId: addVideoinputs[0].deviceId,
                  microphoneId: addAudioinputs[0].deviceId
                });

              case 23:
                this._emitter.emit(AUTO_SWITCH_DEVICE, {
                  type: 'audio'
                });

                this._emitter.emit(AUTO_SWITCH_DEVICE, {
                  type: 'video'
                });

                _context19.next = 39;
                break;

              case 27:
                if (!audio) {
                  _context19.next = 34;
                  break;
                }

                this.logger.warn("new microphone  detected, but there was no device before.");
                _context19.next = 31;
                return localStream.updateStream({
                  audio: !0,
                  video: !1,
                  microphoneId: addAudioinputs[0].deviceId
                });

              case 31:
                this._emitter.emit(AUTO_SWITCH_DEVICE, {
                  type: 'audio'
                });

                _context19.next = 39;
                break;

              case 34:
                if (!video) {
                  _context19.next = 39;
                  break;
                }

                this.logger.warn("new camera  detected, but there was no device before.");
                _context19.next = 38;
                return localStream.updateStream({
                  audio: !1,
                  video: !0,
                  cameraId: addVideoinputs[0].deviceId
                });

              case 38:
                this._emitter.emit(AUTO_SWITCH_DEVICE, {
                  type: 'video'
                });

              case 39:
                if (!(removedDevices && removedDevices.length)) {
                  _context19.next = 73;
                  break;
                }

                _localStream$getDevic = localStream.getDevicesInfoInUse(), microphone = _localStream$getDevic.microphone, camera = _localStream$getDevic.camera;
                rUseMic = removedDevices.find(function (e) {
                  return e.deviceId === microphone.deviceId && e.groupId === microphone.groupId;
                });
                rUseCam = removedDevices.find(function (e) {
                  return e.deviceId === camera.deviceId && e.groupId === camera.groupId;
                });
                hasMic = devices.find(function (e) {
                  return e.kind === 'audioinput';
                });
                hasCam = devices.find(function (e) {
                  return e.kind === 'videoinput';
                });
                rAudio = rUseMic && localStream.hasAudio();
                rVideo = rUseCam && localStream.hasVideo();

                if (!rAudio) {
                  _context19.next = 54;
                  break;
                }

                this.logger.warn("current microphone in use is lost, deviceId: ".concat(microphone.deviceId));
                _context19.t0 = hasMic;

                if (!_context19.t0) {
                  _context19.next = 53;
                  break;
                }

                _context19.next = 53;
                return localStream.updateStream({
                  audio: !0,
                  video: !1
                });

              case 53:
                this._emitter.emit(AUTO_SWITCH_DEVICE, {
                  type: 'audio'
                });

              case 54:
                if (!rVideo) {
                  _context19.next = 61;
                  break;
                }

                this.logger.warn("current camera in use is lost, deviceId: ".concat(camera.deviceId));
                _context19.t1 = hasCam;

                if (!_context19.t1) {
                  _context19.next = 60;
                  break;
                }

                _context19.next = 60;
                return localStream.updateStream({
                  audio: !1,
                  video: !0
                });

              case 60:
                this._emitter.emit(AUTO_SWITCH_DEVICE, {
                  type: 'video'
                });

              case 61:
                if (!(!rUseMic && localStream.getAudioTrack())) {
                  _context19.next = 67;
                  break;
                }

                track = localStream.getAudioTrack();

                if (!(track.readyState === 'ended')) {
                  _context19.next = 67;
                  break;
                }

                this.logger.warn('current microphone in use, audio track is ended');
                _context19.next = 67;
                return localStream.updateStream({
                  audio: !0,
                  video: !1,
                  microphoneId: microphone.deviceId
                });

              case 67:
                if (!(!rUseCam && localStream.getVideoTrack())) {
                  _context19.next = 73;
                  break;
                }

                _track = localStream.getVideoTrack();

                if (!(_track.readyState === 'ended')) {
                  _context19.next = 73;
                  break;
                }

                this.logger.warn('current camera in use, video track is ended');
                _context19.next = 73;
                return localStream.updateStream({
                  audio: !1,
                  video: !0,
                  cameraId: camera.deviceId
                });

              case 73:
                // 新增设备列表
                addedDevices.forEach(function (device) {
                  switch (device.kind) {
                    case 'audioinput':
                      _this25.logger.info('The new microphone device be detected is', device.label);

                      _this25._emitter.emit(RECORDING_DEVICE_CHANGED, {
                        deviceId: device.deviceId,
                        state: 'ADD'
                      });

                      break;

                    case 'videoinput':
                      _this25.logger.info('The new camera device be detected is', device.label);

                      _this25._emitter.emit(CAMERA_CHANGED, {
                        deviceId: device.deviceId,
                        state: 'ADD'
                      });

                      break;

                    case 'audiooutput':
                      _this25.logger.info('The new speaker device be detected is', device.label);

                      _this25._emitter.emit(PLAYBACK_DEVICE_CHANGED, {
                        deviceId: device.deviceId,
                        state: 'ADD'
                      });

                      break;
                  }
                }); // 移除设备列表

                removedDevices.forEach(function (device) {
                  switch (device.kind) {
                    case 'audioinput':
                      _this25.logger.info('The microphone device is detected to be removed: ', device.label);

                      _this25._emitter.emit(RECORDING_DEVICE_CHANGED, {
                        deviceId: device.deviceId,
                        state: 'REMOVE'
                      });

                      break;

                    case 'videoinput':
                      _this25.logger.info('The camera device is detected to be removed: ', device.label);

                      _this25._emitter.emit(CAMERA_CHANGED, {
                        deviceId: device.deviceId,
                        state: 'REMOVE'
                      });

                      break;

                    case 'audiooutput':
                      _this25.logger.info('The speaker device is detected to be removed: ', device.label);

                      _this25._emitter.emit(PLAYBACK_DEVICE_CHANGED, {
                        deviceId: device.deviceId,
                        state: 'REMOVE'
                      });

                      break;
                  }
                });
                _context19.next = 80;
                break;

              case 77:
                _context19.prev = 77;
                _context19.t2 = _context19["catch"](0);
                this.logger.error('on device change error', _context19.t2);

              case 80:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee17, this, [[0, 77]]);
      }));

      function onDeviceChange() {
        return _onDeviceChange.apply(this, arguments);
      }

      return onDeviceChange;
    }()
    /**
    * 监听音频
    * @param event 
    */

  }, {
    key: "enableAudioVolumeEvaluation",
    value: function enableAudioVolumeEvaluation() {
      var _this26 = this;

      var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2000;
      this.logger.info('enableAudioVolumeEvaluation with interval: ' + time);
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: LogCode.ENABLE_AUDIO_VOLUME_EVALUATION,
        v: "time:".concat(time)
      });

      if (typeof time !== 'number') {
        throw new ER({
          code: ERCode.INVALID_PARAMETER,
          message: 'parameter must be numeric type'
        });
      }

      if (time <= 0) {
        // 停止监控
        window.clearInterval(this.audioVolumeInterval);
        this.audioVolumeInterval = null;
      } else {
        if (this.audioVolumeInterval) {
          window.clearInterval(this.audioVolumeInterval);
          this.audioVolumeInterval = null;
        }

        this.audioVolumeInterval = window.setInterval(function () {
          var audioVolumes = [];

          _this26.localStreams.forEach(function (stream) {
            if (!stream.screen && stream.published) {
              var n = Math.floor(100 * stream.getAudioLevel());
              audioVolumes.push({
                userId: stream.getUserId(),
                audioVolume: n,
                stream: stream
              });
            }
          });

          var _iterator19 = _createForOfIteratorHelper(_this26.remoteStreams),
              _step19;

          try {
            for (_iterator19.s(); !(_step19 = _iterator19.n()).done;) {
              var _step19$value = _slicedToArray(_step19.value, 2),
                  userId = _step19$value[0],
                  stream = _step19$value[1];

              if (stream.getType() === MAIN && stream.subscribed) {
                var n = Math.floor(100 * stream.getAudioLevel());
                audioVolumes.push({
                  userId: stream.getUserId(),
                  audioVolume: n,
                  stream: stream
                });
              }
            }
          } catch (err) {
            _iterator19.e(err);
          } finally {
            _iterator19.f();
          }

          _this26._emitter.emit(AUDIO_VOLUME, {
            result: audioVolumes
          });
        }, Math.floor(Math.max(time, 16)));
      }
    }
    /**
     * 添加事件监听事件
     */

  }, {
    key: "addEventListenser",
    value: function addEventListenser(event) {
      if (this.ssl && navigator.mediaDevices && event === 'devicechange') {
        navigator.mediaDevices.addEventListener(event, this.deviceChange);
      } // 监听浏览器标签页被隐藏或显示


      if (event === 'visibilitychange') {
        document.addEventListener(event, this.visibilitychange);
      }
    }
    /**
     * 移除事件监听事件
     */

  }, {
    key: "removeEventListenser",
    value: function removeEventListenser(event) {
      if (this.ssl && navigator.mediaDevices && event === 'devicechange') {
        navigator.mediaDevices.removeEventListener(event, this.deviceChange);
      }

      if (event === 'visibilitychange') {
        document.removeEventListener(event, this.visibilitychange);
      }
    }
    /**
    * 
    * @param 开启大小流模式
    */

  }, {
    key: "enableSmallStream",
    value: function enableSmallStream() {
      // 发布中和已发布的不可以开启大小流模式 缺发布中的状态
      var stream = this.localStreams.find(function (s) {
        return s.videoStreamId && !s.screen;
      });

      if (stream && stream.published) {
        throw new ER({
          code: ERCode.INVALID_OPERATION,
          message: 'Cannot enable small stream after localStream published.'
        });
      } // 判断浏览器是否支持


      if (!isSmallStreamSupported()) {
        throw new ER({
          code: ERCode.INVALID_OPERATION,
          message: 'Your browser does not support opening small stream'
        });
      }

      this.setIsEnableSmallStream(!0);
      this.logger.info('SmallStream successfully enabled');
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: LogCode.ENABLE_SMALL_STREAM
      });
      return Promise.resolve(true);
    }
    /**
    * 
    * @param 关闭大小流模式
    */

  }, {
    key: "disableSmallStream",
    value: function disableSmallStream() {
      var stream = this.localStreams.find(function (s) {
        return s.videoStreamId && !s.screen;
      });

      if (stream && stream.published) {
        throw new ER({
          code: ERCode.INVALID_OPERATION,
          message: 'Cannot enable small stream after having published.'
        });
      }

      this.setIsEnableSmallStream(!1);
      this.logger.info('SmallStream successfully disabled');
      this.logger.buriedLog({
        t: LogType.EVENT,
        c: LogCode.DISABLE_SMALL_STREAM
      });
      return Promise.resolve(true);
    }
    /**
     * 设置小流的参数
     * @param  
     */

  }, {
    key: "setSmallStreamProfile",
    value: function setSmallStreamProfile(smallStreamConfig) {
      var width = smallStreamConfig.width,
          height = smallStreamConfig.height,
          bitrate = smallStreamConfig.bitrate,
          framerate = smallStreamConfig.framerate;
      this.logger.info("setSmallStreamProfile:width=".concat(width, ",height=").concat(height, ",bitrate=").concat(bitrate, ",framerate=").concat(framerate));

      if (width < 0 || height < 0 || bitrate < 0 || framerate < 0) {
        throw new ER({
          code: ERCode.INVALID_OPERATION,
          message: 'Small stream profile is invalid.'
        });
      }

      this.logger.buriedLog({
        t: LogType.EVENT,
        c: LogCode.SET_SMALL_STREAM_PROFILE,
        v: JSON.stringify(smallStreamConfig)
      });
      this.smallStreamConfig = {
        width: width,
        height: height,
        bitrate: bitrate,
        framerate: framerate
      };
    }
  }, {
    key: "setIsEnableSmallStream",
    value: function setIsEnableSmallStream(isEnable) {
      this.isEnableSmallStream = isEnable;
    }
    /**
     * 监听浏览器标签页被隐藏或显示
     */

  }, {
    key: "onVisibilitychange",
    value: function onVisibilitychange() {
      if (document.visibilityState === 'visible') {
        // 页面内容可以至少部分可见。实际上，这意味着页面是非最小化窗口的前台选项卡。
        this.logger.warn('User enter the page');

        this._emitter.emit(PAGE_VISIBILITY_STATE, {
          state: 'visible'
        });
      } else if (document.visibilityState === 'hidden') {
        // 页面的内容对用户不可见，原因可能是文档的选项卡在后台或窗口最小化了，或者因为设备的屏幕关闭了。
        this.logger.warn('User leave the pag');

        this._emitter.emit(PAGE_VISIBILITY_STATE, {
          state: 'hidden'
        });
      }
    }
  }]);

  return Client;
}();

var LogLevel;

(function (LogLevel) {
  LogLevel[LogLevel["TRACE"] = 0] = "TRACE";
  LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
  LogLevel[LogLevel["INFO"] = 2] = "INFO";
  LogLevel[LogLevel["WARN"] = 3] = "WARN";
  LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
  LogLevel[LogLevel["NONE"] = 5] = "NONE";
})(LogLevel || (LogLevel = {}));

var Logger = /*#__PURE__*/function () {
  function Logger() {
    _classCallCheck(this, Logger);

    this.LogLevel = {
      TRACE: LogLevel.TRACE,
      DEBUG: LogLevel.DEBUG,
      INFO: LogLevel.INFO,
      WARN: LogLevel.WARN,
      ERROR: LogLevel.ERROR,
      NONE: LogLevel.NONE
    };
    this.level = LogLevel.INFO;
    this.myConsole = window.console;
    this.uploadLog = false;
    this.logList = [];
    this.buriedLogList = [];
    this.maxNumber = 10;
    this.timeout = 10 * 1000;
    this._interval = 0;
    this._intervalBuried = 0;
    this.serverUrl = '';
    this.appConfig = null;
    this.roomUniqueId = null;
    this.reUploadMaxCount = 30;
    this.logReUploadCount = 0;
    this.buriedlogReUploadCount = 0;
    window.addEventListener('beforeunload', this.beforeUnload.bind(this));
  }
  /**
   * 设置日志等级
   */


  _createClass(Logger, [{
    key: "setLogLevel",
    value: function setLogLevel(level) {
      this.level = level;
      var levelStr = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'][level];
      this.buriedLog({
        t: LogType.EVENT,
        c: LogCode.SET_LOG_LEVEL,
        v: levelStr
      });
    }
    /**
     * 获取日志等级
     * @returns number
     */

  }, {
    key: "getLogLevel",
    value: function getLogLevel() {
      return this.level;
    }
    /**
     * 设置用户Id
     */

  }, {
    key: "setUserId",
    value: function setUserId(useId) {
      this.userId = useId;
    }
    /**
     * 设置房间Id
     */

  }, {
    key: "setRoomId",
    value: function setRoomId(roomId) {
      this.roomId = roomId;
    }
    /**
     * 设置房间唯一id(会议唯一id)
     */

  }, {
    key: "setRoomUniqueId",
    value: function setRoomUniqueId(roomUniqueId) {
      this.roomUniqueId = roomUniqueId;
    }
    /**
    * 设置服务器Url
    */

  }, {
    key: "setServerUrl",
    value: function setServerUrl(url) {
      // 立即上传普通日志
      if (!url) {
        this.uploadLogList = this.logList.splice(0, this.logList.length);
        this.upload(this.uploadLogList);
      }

      this.serverUrl = url;
    }
    /**
    * 设置服务端APP的配置
    */

  }, {
    key: "setApppConfig",
    value: function setApppConfig(config) {
      var _this$appConfig;

      this.appConfig = config;
      (_this$appConfig = this.appConfig) !== null && _this$appConfig !== void 0 && _this$appConfig.enableEvent ? this.enableUploadBuriedLogs() : this.disableUploadBuriedLogs();
    }
    /**
     * debug
     */

  }, {
    key: "debug",
    value: function debug(message) {
      var _this$myConsole;

      if (this.level === LogLevel.NONE || LogLevel.DEBUG < this.level) return;

      for (var _len = arguments.length, optionalParams = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        optionalParams[_key - 1] = arguments[_key];
      }

      (_this$myConsole = this.myConsole).debug.apply(_this$myConsole, ["XRTC <Debug> ".concat(this.userId ? "[".concat(this.userId, "]") : ""), message].concat(optionalParams));

      this.collect(LogLevel.DEBUG, message, optionalParams);
    }
    /**
     * info
     */

  }, {
    key: "info",
    value: function info(message) {
      var _this$myConsole2;

      if (this.level === LogLevel.NONE || LogLevel.INFO < this.level) return;

      for (var _len2 = arguments.length, optionalParams = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        optionalParams[_key2 - 1] = arguments[_key2];
      }

      (_this$myConsole2 = this.myConsole).info.apply(_this$myConsole2, ["XRTC <Info> ".concat(this.userId ? "[".concat(this.userId, "]") : ""), message].concat(optionalParams));

      this.collect(LogLevel.INFO, message, optionalParams);
    }
    /**
     * warn
     */

  }, {
    key: "warn",
    value: function warn(message) {
      var _this$myConsole3;

      if (this.level === LogLevel.NONE || LogLevel.WARN < this.level) return;

      for (var _len3 = arguments.length, optionalParams = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        optionalParams[_key3 - 1] = arguments[_key3];
      }

      (_this$myConsole3 = this.myConsole).warn.apply(_this$myConsole3, ["XRTC <Warn> ".concat(this.userId ? "[".concat(this.userId, "]") : ""), message].concat(optionalParams));

      this.collect(LogLevel.WARN, message, optionalParams);
    }
    /**
     * error
     */

  }, {
    key: "error",
    value: function error(message) {
      var _this$myConsole4;

      if (this.level === LogLevel.NONE || LogLevel.ERROR < this.level) return;

      for (var _len4 = arguments.length, optionalParams = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        optionalParams[_key4 - 1] = arguments[_key4];
      }

      (_this$myConsole4 = this.myConsole).error.apply(_this$myConsole4, ["XRTC <Error> ".concat(this.userId ? "[".concat(this.userId, "]") : ""), message].concat(optionalParams));

      this.collect(LogLevel.ERROR, message, optionalParams);
    }
    /**
     * 打开日志上传
     */

  }, {
    key: "enableUploadLog",
    value: function enableUploadLog() {
      var _this = this;

      this.uploadLog = true;
      if (this._interval) return;
      this._interval = window.setInterval(function () {
        if (_this.logList.length > 0) {
          _this.uploadLogList = _this.logList.splice(0, _this.logList.length);

          _this.upload(_this.uploadLogList);
        }
      }, this.timeout);
      this.buriedLog({
        t: LogType.EVENT,
        c: LogCode.ENABLE_UPLOAD_LOG
      });
    }
    /**
     * 关闭日志上传
     */

  }, {
    key: "disableUploadLog",
    value: function disableUploadLog() {
      this.uploadLog = false;
      window.clearInterval(this._interval);
      this._interval = 0;
      this.buriedLog({
        t: LogType.EVENT,
        c: LogCode.DISABLE_UPLOAD_LOG
      });
    }
    /**
     * 收集日志
     */

  }, {
    key: "collect",
    value: function collect(level, message, options) {
      if (!this.uploadLog) return;
      this.logList.push({
        app: Api.appKey,
        platform: "Web",
        sys: "Web",
        uuid: "Web",
        time: Date.now(),
        module: "SDK",
        version: "3.2.2",
        level: level,
        rid: this.roomId || "",
        uid: this.userId,
        msg: "XRTC ".concat(this.userId ? "[".concat(this.userId, "]") : "", " ").concat(message, " ").concat((options || []).join(" "), "\r\n")
      });

      if (this.logList.length >= this.maxNumber) {
        this.uploadLogList = this.logList.splice(0, this.logList.length);
        this.upload(this.uploadLogList);
      }
    }
    /**
     * upload
     */

  }, {
    key: "upload",
    value: function upload(uploadLogList) {
      var _this2 = this;

      if (!this.serverUrl || this.appConfig && !this.appConfig.enableLog) return;
      Api.upload('general', this.serverUrl, uploadLogList).then(function () {})["catch"](function () {
        _this2.logReUploadCount = _this2.logReUploadCount + 1;

        if (_this2.logReUploadCount > _this2.reUploadMaxCount) {
          _this2.logList = [];
          _this2.logReUploadCount = 0;

          _this2.info("SDK has tried reupload log ".concat(_this2.reUploadMaxCount, " times, but all failed, and old log cleared"));
        } else {
          _this2.logList = [].concat(_toConsumableArray(uploadLogList), _toConsumableArray(_this2.logList));
        }
      });
    }
    /**
    * 收集埋点日志
    */

  }, {
    key: "buriedLog",
    value: function buriedLog(params, immediate) {
      var _this$appConfig2;

      var t = params.t,
          c = params.c,
          v = params.v,
          st = params.st,
          puid = params.puid;
      this.buriedLogList.push({
        app: Api.appKey,
        rid: this.roomId || "",
        uid: this.userId,
        mid: this.roomUniqueId,
        time: Date.now(),
        t: t,
        c: c,
        v: v,
        st: st,
        puid: puid
      });

      if ((_this$appConfig2 = this.appConfig) !== null && _this$appConfig2 !== void 0 && _this$appConfig2.enableEvent && this.roomUniqueId) {
        if (immediate || this.buriedLogList.length >= this.maxNumber) {
          var list = this.buriedLogList.splice(0, this.buriedLogList.length);
          this.uploadBuriedLogs(list);
        }
      }
    }
    /**
    * 上传埋点日志
    */

  }, {
    key: "uploadBuriedLogs",
    value: function uploadBuriedLogs(uploadLogList) {
      var _this3 = this;

      if (!this.serverUrl || this.appConfig && !this.appConfig.enableEvent) return;
      uploadLogList.forEach(function (e) {
        e.app = Api.appKey;
        e.rid = _this3.roomId;
        e.mid = _this3.roomUniqueId;

        if (!e.isAdjustTime) {
          e.time = _this3.adjustServerTime(e.time);
          e.isAdjustTime = true;
        }
      });
      Api.upload('buried', this.serverUrl, uploadLogList).then(function () {})["catch"](function (err) {
        _this3.buriedlogReUploadCount = _this3.buriedlogReUploadCount + 1;

        if (_this3.buriedlogReUploadCount > _this3.reUploadMaxCount) {
          _this3.buriedLogList = [];
          _this3.buriedlogReUploadCount = 0;

          _this3.info("SDK has tried reupload buried log ".concat(_this3.reUploadMaxCount, " times, but all failed, and old log cleared"));
        } else {
          _this3.buriedLogList = [].concat(_toConsumableArray(uploadLogList), _toConsumableArray(_this3.buriedLogList));
        }
      });
    }
    /**
    * 打开埋点日志上传
    */

  }, {
    key: "enableUploadBuriedLogs",
    value: function enableUploadBuriedLogs() {
      var _this4 = this;

      if (this._intervalBuried) return;
      this._intervalBuried = window.setInterval(function () {
        if (_this4.buriedLogList.length > 0) {
          var list = _this4.buriedLogList.splice(0, _this4.buriedLogList.length);

          _this4.uploadBuriedLogs(list);
        }
      }, this.timeout);
    }
    /**
     * 关闭埋点日志上传
     */

  }, {
    key: "disableUploadBuriedLogs",
    value: function disableUploadBuriedLogs() {
      window.clearInterval(this._intervalBuried);
      this._intervalBuried = 0;
    }
    /**
     * 监听浏览器关闭事件上传日志
     */

  }, {
    key: "beforeUnload",
    value: function beforeUnload() {
      if (this.logList.length > 0) {
        var list = this.logList.splice(0, this.logList.length);
        this.upload(list);
      }

      if (this.buriedLogList.length > 0) {
        var _list = this.buriedLogList.splice(0, this.buriedLogList.length);

        this.uploadBuriedLogs(_list);
      }

      this.disableUploadBuriedLogs();
    }
  }, {
    key: "adjustServerTime",
    value: function adjustServerTime(time) {
      var _this$appConfig3;

      return (_this$appConfig3 = this.appConfig) !== null && _this$appConfig3 !== void 0 && _this$appConfig3.timeDiff ? time - this.appConfig.timeDiff : time;
    }
  }]);

  return Logger;
}();

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

let logDisabled_ = true;
let deprecationWarnings_ = true;

/**
 * Extract browser version out of the provided user agent string.
 *
 * @param {!string} uastring userAgent string.
 * @param {!string} expr Regular expression used as match criteria.
 * @param {!number} pos position in the version string to be returned.
 * @return {!number} browser version.
 */
function extractVersion(uastring, expr, pos) {
  const match = uastring.match(expr);
  return match && match.length >= pos && parseInt(match[pos], 10);
}

// Wraps the peerconnection event eventNameToWrap in a function
// which returns the modified event object (or false to prevent
// the event).
function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
  if (!window.RTCPeerConnection) {
    return;
  }
  const proto = window.RTCPeerConnection.prototype;
  const nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    const wrappedCallback = (e) => {
      const modifiedEvent = wrapper(e);
      if (modifiedEvent) {
        if (cb.handleEvent) {
          cb.handleEvent(modifiedEvent);
        } else {
          cb(modifiedEvent);
        }
      }
    };
    this._eventMap = this._eventMap || {};
    if (!this._eventMap[eventNameToWrap]) {
      this._eventMap[eventNameToWrap] = new Map();
    }
    this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
    return nativeAddEventListener.apply(this, [nativeEventName,
      wrappedCallback]);
  };

  const nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap
        || !this._eventMap[eventNameToWrap]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    if (!this._eventMap[eventNameToWrap].has(cb)) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    const unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
    this._eventMap[eventNameToWrap].delete(cb);
    if (this._eventMap[eventNameToWrap].size === 0) {
      delete this._eventMap[eventNameToWrap];
    }
    if (Object.keys(this._eventMap).length === 0) {
      delete this._eventMap;
    }
    return nativeRemoveEventListener.apply(this, [nativeEventName,
      unwrappedCb]);
  };

  Object.defineProperty(proto, 'on' + eventNameToWrap, {
    get() {
      return this['_on' + eventNameToWrap];
    },
    set(cb) {
      if (this['_on' + eventNameToWrap]) {
        this.removeEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap]);
        delete this['_on' + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap] = cb);
      }
    },
    enumerable: true,
    configurable: true
  });
}

function disableLog(bool) {
  if (typeof bool !== 'boolean') {
    return new Error('Argument type: ' + typeof bool +
        '. Please use a boolean.');
  }
  logDisabled_ = bool;
  return (bool) ? 'adapter.js logging disabled' :
      'adapter.js logging enabled';
}

/**
 * Disable or enable deprecation warnings
 * @param {!boolean} bool set to true to disable warnings.
 */
function disableWarnings(bool) {
  if (typeof bool !== 'boolean') {
    return new Error('Argument type: ' + typeof bool +
        '. Please use a boolean.');
  }
  deprecationWarnings_ = !bool;
  return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
}

function log() {
  if (typeof window === 'object') {
    if (logDisabled_) {
      return;
    }
    if (typeof console !== 'undefined' && typeof console.log === 'function') {
      console.log.apply(console, arguments);
    }
  }
}

/**
 * Shows a deprecation warning suggesting the modern and spec-compatible API.
 */
function deprecated(oldMethod, newMethod) {
  if (!deprecationWarnings_) {
    return;
  }
  console.warn(oldMethod + ' is deprecated, please use ' + newMethod +
      ' instead.');
}

/**
 * Browser detector.
 *
 * @return {object} result containing browser and version
 *     properties.
 */
function detectBrowser(window) {
  // Returned result object.
  const result = {browser: null, version: null};

  // Fail early if it's not a browser
  if (typeof window === 'undefined' || !window.navigator) {
    result.browser = 'Not a browser.';
    return result;
  }

  const {navigator} = window;

  if (navigator.mozGetUserMedia) { // Firefox.
    result.browser = 'firefox';
    result.version = extractVersion(navigator.userAgent,
        /Firefox\/(\d+)\./, 1);
  } else if (navigator.webkitGetUserMedia ||
      (window.isSecureContext === false && window.webkitRTCPeerConnection &&
       !window.RTCIceGatherer)) {
    // Chrome, Chromium, Webview, Opera.
    // Version matches Chrome/WebRTC version.
    // Chrome 74 removed webkitGetUserMedia on http as well so we need the
    // more complicated fallback to webkitRTCPeerConnection.
    result.browser = 'chrome';
    result.version = extractVersion(navigator.userAgent,
        /Chrom(e|ium)\/(\d+)\./, 2);
  } else if (window.RTCPeerConnection &&
      navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) { // Safari.
    result.browser = 'safari';
    result.version = extractVersion(navigator.userAgent,
        /AppleWebKit\/(\d+)\./, 1);
    result.supportsUnifiedPlan = window.RTCRtpTransceiver &&
        'currentDirection' in window.RTCRtpTransceiver.prototype;
  } else { // Default fallthrough: not supported.
    result.browser = 'Not a supported browser.';
    return result;
  }

  return result;
}

/**
 * Checks if something is an object.
 *
 * @param {*} val The something you want to check.
 * @return true if val is an object, false otherwise.
 */
function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

/**
 * Remove all empty objects and undefined values
 * from a nested object -- an enhanced and vanilla version
 * of Lodash's `compact`.
 */
function compactObject(data) {
  if (!isObject(data)) {
    return data;
  }

  return Object.keys(data).reduce(function(accumulator, key) {
    const isObj = isObject(data[key]);
    const value = isObj ? compactObject(data[key]) : data[key];
    const isEmptyObject = isObj && !Object.keys(value).length;
    if (value === undefined || isEmptyObject) {
      return accumulator;
    }
    return Object.assign(accumulator, {[key]: value});
  }, {});
}

/* iterates the stats graph recursively. */
function walkStats(stats, base, resultSet) {
  if (!base || resultSet.has(base.id)) {
    return;
  }
  resultSet.set(base.id, base);
  Object.keys(base).forEach(name => {
    if (name.endsWith('Id')) {
      walkStats(stats, stats.get(base[name]), resultSet);
    } else if (name.endsWith('Ids')) {
      base[name].forEach(id => {
        walkStats(stats, stats.get(id), resultSet);
      });
    }
  });
}

/* filter getStats for a sender/receiver track. */
function filterStats(result, track, outbound) {
  const streamStatsType = outbound ? 'outbound-rtp' : 'inbound-rtp';
  const filteredResult = new Map();
  if (track === null) {
    return filteredResult;
  }
  const trackStats = [];
  result.forEach(value => {
    if (value.type === 'track' &&
        value.trackIdentifier === track.id) {
      trackStats.push(value);
    }
  });
  trackStats.forEach(trackStat => {
    result.forEach(stats => {
      if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
        walkStats(result, stats, filteredResult);
      }
    });
  });
  return filteredResult;
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
const logging = log;

function shimGetUserMedia$2(window, browserDetails) {
  const navigator = window && window.navigator;

  if (!navigator.mediaDevices) {
    return;
  }

  const constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    const cc = {};
    Object.keys(c).forEach(key => {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      const r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      const oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        let oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(mix => {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  const shimConstraints_ = function(constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === 'object') {
      const remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
      remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === 'object') {
      // Shim facingMode for mobile & surface pro.
      let face = constraints.video.facingMode;
      face = face && ((typeof face === 'object') ? face : {ideal: face});
      const getSupportedFacingModeLies = browserDetails.version < 66;

      if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                    face.ideal === 'user' || face.ideal === 'environment')) &&
          !(navigator.mediaDevices.getSupportedConstraints &&
            navigator.mediaDevices.getSupportedConstraints().facingMode &&
            !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        let matches;
        if (face.exact === 'environment' || face.ideal === 'environment') {
          matches = ['back', 'rear'];
        } else if (face.exact === 'user' || face.ideal === 'user') {
          matches = ['front'];
        }
        if (matches) {
          // Look for matches in label, or use last cam for back (typical).
          return navigator.mediaDevices.enumerateDevices()
          .then(devices => {
            devices = devices.filter(d => d.kind === 'videoinput');
            let dev = devices.find(d => matches.some(match =>
              d.label.toLowerCase().includes(match)));
            if (!dev && devices.length && matches.includes('back')) {
              dev = devices[devices.length - 1]; // more likely the back cam
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? {exact: dev.deviceId} :
                                                        {ideal: dev.deviceId};
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging('chrome: ' + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return func(constraints);
  };

  const shimError_ = function(e) {
    if (browserDetails.version >= 64) {
      return e;
    }
    return {
      name: {
        PermissionDeniedError: 'NotAllowedError',
        PermissionDismissedError: 'NotAllowedError',
        InvalidStateError: 'NotAllowedError',
        DevicesNotFoundError: 'NotFoundError',
        ConstraintNotSatisfiedError: 'OverconstrainedError',
        TrackStartError: 'NotReadableError',
        MediaDeviceFailedDueToShutdown: 'NotAllowedError',
        MediaDeviceKillSwitchOn: 'NotAllowedError',
        TabCaptureError: 'AbortError',
        ScreenCaptureError: 'AbortError',
        DeviceCaptureError: 'AbortError'
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraint || e.constraintName,
      toString() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  const getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, c => {
      navigator.webkitGetUserMedia(c, onSuccess, e => {
        if (onError) {
          onError(shimError_(e));
        }
      });
    });
  };
  navigator.getUserMedia = getUserMedia_.bind(navigator);

  // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
  // function which returns a Promise, it does not accept spec-style
  // constraints.
  if (navigator.mediaDevices.getUserMedia) {
    const origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, c => origGetUserMedia(c).then(stream => {
        if (c.audio && !stream.getAudioTracks().length ||
            c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach(track => {
            track.stop();
          });
          throw new DOMException('', 'NotFoundError');
        }
        return stream;
      }, e => Promise.reject(shimError_(e))));
    };
  }
}

/*
 *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
function shimGetDisplayMedia$1(window, getSourceId) {
  if (window.navigator.mediaDevices &&
    'getDisplayMedia' in window.navigator.mediaDevices) {
    return;
  }
  if (!(window.navigator.mediaDevices)) {
    return;
  }
  // getSourceId is a function that returns a promise resolving with
  // the sourceId of the screen/window/tab to be shared.
  if (typeof getSourceId !== 'function') {
    console.error('shimGetDisplayMedia: getSourceId argument is not ' +
        'a function');
    return;
  }
  window.navigator.mediaDevices.getDisplayMedia =
    function getDisplayMedia(constraints) {
      return getSourceId(constraints)
        .then(sourceId => {
          const widthSpecified = constraints.video && constraints.video.width;
          const heightSpecified = constraints.video &&
            constraints.video.height;
          const frameRateSpecified = constraints.video &&
            constraints.video.frameRate;
          constraints.video = {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
              maxFrameRate: frameRateSpecified || 3
            }
          };
          if (widthSpecified) {
            constraints.video.mandatory.maxWidth = widthSpecified;
          }
          if (heightSpecified) {
            constraints.video.mandatory.maxHeight = heightSpecified;
          }
          return window.navigator.mediaDevices.getUserMedia(constraints);
        });
    };
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimMediaStream(window) {
  window.MediaStream = window.MediaStream || window.webkitMediaStream;
}

function shimOnTrack$1(window) {
  if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
      window.RTCPeerConnection.prototype)) {
    Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
      get() {
        return this._ontrack;
      },
      set(f) {
        if (this._ontrack) {
          this.removeEventListener('track', this._ontrack);
        }
        this.addEventListener('track', this._ontrack = f);
      },
      enumerable: true,
      configurable: true
    });
    const origSetRemoteDescription =
        window.RTCPeerConnection.prototype.setRemoteDescription;
    window.RTCPeerConnection.prototype.setRemoteDescription =
      function setRemoteDescription() {
        if (!this._ontrackpoly) {
          this._ontrackpoly = (e) => {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', te => {
              let receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = this.getReceivers()
                  .find(r => r.track && r.track.id === te.track.id);
              } else {
                receiver = {track: te.track};
              }

              const event = new Event('track');
              event.track = te.track;
              event.receiver = receiver;
              event.transceiver = {receiver};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(track => {
              let receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = this.getReceivers()
                  .find(r => r.track && r.track.id === track.id);
              } else {
                receiver = {track};
              }
              const event = new Event('track');
              event.track = track;
              event.receiver = receiver;
              event.transceiver = {receiver};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            });
          };
          this.addEventListener('addstream', this._ontrackpoly);
        }
        return origSetRemoteDescription.apply(this, arguments);
      };
  } else {
    // even if RTCRtpTransceiver is in window, it is only used and
    // emitted in unified-plan. Unfortunately this means we need
    // to unconditionally wrap the event.
    wrapPeerConnectionEvent(window, 'track', e => {
      if (!e.transceiver) {
        Object.defineProperty(e, 'transceiver',
          {value: {receiver: e.receiver}});
      }
      return e;
    });
  }
}

function shimGetSendersWithDtmf(window) {
  // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
  if (typeof window === 'object' && window.RTCPeerConnection &&
      !('getSenders' in window.RTCPeerConnection.prototype) &&
      'createDTMFSender' in window.RTCPeerConnection.prototype) {
    const shimSenderWithDtmf = function(pc, track) {
      return {
        track,
        get dtmf() {
          if (this._dtmf === undefined) {
            if (track.kind === 'audio') {
              this._dtmf = pc.createDTMFSender(track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        },
        _pc: pc
      };
    };

    // augment addTrack when getSenders is not available.
    if (!window.RTCPeerConnection.prototype.getSenders) {
      window.RTCPeerConnection.prototype.getSenders = function getSenders() {
        this._senders = this._senders || [];
        return this._senders.slice(); // return a copy of the internal state.
      };
      const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
      window.RTCPeerConnection.prototype.addTrack =
        function addTrack(track, stream) {
          let sender = origAddTrack.apply(this, arguments);
          if (!sender) {
            sender = shimSenderWithDtmf(this, track);
            this._senders.push(sender);
          }
          return sender;
        };

      const origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
      window.RTCPeerConnection.prototype.removeTrack =
        function removeTrack(sender) {
          origRemoveTrack.apply(this, arguments);
          const idx = this._senders.indexOf(sender);
          if (idx !== -1) {
            this._senders.splice(idx, 1);
          }
        };
    }
    const origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      this._senders = this._senders || [];
      origAddStream.apply(this, [stream]);
      stream.getTracks().forEach(track => {
        this._senders.push(shimSenderWithDtmf(this, track));
      });
    };

    const origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream =
      function removeStream(stream) {
        this._senders = this._senders || [];
        origRemoveStream.apply(this, [stream]);

        stream.getTracks().forEach(track => {
          const sender = this._senders.find(s => s.track === track);
          if (sender) { // remove sender
            this._senders.splice(this._senders.indexOf(sender), 1);
          }
        });
      };
  } else if (typeof window === 'object' && window.RTCPeerConnection &&
             'getSenders' in window.RTCPeerConnection.prototype &&
             'createDTMFSender' in window.RTCPeerConnection.prototype &&
             window.RTCRtpSender &&
             !('dtmf' in window.RTCRtpSender.prototype)) {
    const origGetSenders = window.RTCPeerConnection.prototype.getSenders;
    window.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach(sender => sender._pc = this);
      return senders;
    };

    Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
      get() {
        if (this._dtmf === undefined) {
          if (this.track.kind === 'audio') {
            this._dtmf = this._pc.createDTMFSender(this.track);
          } else {
            this._dtmf = null;
          }
        }
        return this._dtmf;
      }
    });
  }
}

function shimGetStats(window) {
  if (!window.RTCPeerConnection) {
    return;
  }

  const origGetStats = window.RTCPeerConnection.prototype.getStats;
  window.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;

    // If selector is a function then we are in the old style stats so just
    // pass back the original getStats format to avoid breaking old users.
    if (arguments.length > 0 && typeof selector === 'function') {
      return origGetStats.apply(this, arguments);
    }

    // When spec-style getStats is supported, return those when called with
    // either no arguments or the selector argument is null.
    if (origGetStats.length === 0 && (arguments.length === 0 ||
        typeof selector !== 'function')) {
      return origGetStats.apply(this, []);
    }

    const fixChromeStats_ = function(response) {
      const standardReport = {};
      const reports = response.result();
      reports.forEach(report => {
        const standardStats = {
          id: report.id,
          timestamp: report.timestamp,
          type: {
            localcandidate: 'local-candidate',
            remotecandidate: 'remote-candidate'
          }[report.type] || report.type
        };
        report.names().forEach(name => {
          standardStats[name] = report.stat(name);
        });
        standardReport[standardStats.id] = standardStats;
      });

      return standardReport;
    };

    // shim getStats with maplike support
    const makeMapStats = function(stats) {
      return new Map(Object.keys(stats).map(key => [key, stats[key]]));
    };

    if (arguments.length >= 2) {
      const successCallbackWrapper_ = function(response) {
        onSucc(makeMapStats(fixChromeStats_(response)));
      };

      return origGetStats.apply(this, [successCallbackWrapper_,
        selector]);
    }

    // promise-support
    return new Promise((resolve, reject) => {
      origGetStats.apply(this, [
        function(response) {
          resolve(makeMapStats(fixChromeStats_(response)));
        }, reject]);
    }).then(onSucc, onErr);
  };
}

function shimSenderReceiverGetStats(window) {
  if (!(typeof window === 'object' && window.RTCPeerConnection &&
      window.RTCRtpSender && window.RTCRtpReceiver)) {
    return;
  }

  // shim sender stats.
  if (!('getStats' in window.RTCRtpSender.prototype)) {
    const origGetSenders = window.RTCPeerConnection.prototype.getSenders;
    if (origGetSenders) {
      window.RTCPeerConnection.prototype.getSenders = function getSenders() {
        const senders = origGetSenders.apply(this, []);
        senders.forEach(sender => sender._pc = this);
        return senders;
      };
    }

    const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
    if (origAddTrack) {
      window.RTCPeerConnection.prototype.addTrack = function addTrack() {
        const sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }
    window.RTCRtpSender.prototype.getStats = function getStats() {
      const sender = this;
      return this._pc.getStats().then(result =>
        /* Note: this will include stats of all senders that
         *   send a track with the same id as sender.track as
         *   it is not possible to identify the RTCRtpSender.
         */
        filterStats(result, sender.track, true));
    };
  }

  // shim receiver stats.
  if (!('getStats' in window.RTCRtpReceiver.prototype)) {
    const origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
    if (origGetReceivers) {
      window.RTCPeerConnection.prototype.getReceivers =
        function getReceivers() {
          const receivers = origGetReceivers.apply(this, []);
          receivers.forEach(receiver => receiver._pc = this);
          return receivers;
        };
    }
    wrapPeerConnectionEvent(window, 'track', e => {
      e.receiver._pc = e.srcElement;
      return e;
    });
    window.RTCRtpReceiver.prototype.getStats = function getStats() {
      const receiver = this;
      return this._pc.getStats().then(result =>
        filterStats(result, receiver.track, false));
    };
  }

  if (!('getStats' in window.RTCRtpSender.prototype &&
      'getStats' in window.RTCRtpReceiver.prototype)) {
    return;
  }

  // shim RTCPeerConnection.getStats(track).
  const origGetStats = window.RTCPeerConnection.prototype.getStats;
  window.RTCPeerConnection.prototype.getStats = function getStats() {
    if (arguments.length > 0 &&
        arguments[0] instanceof window.MediaStreamTrack) {
      const track = arguments[0];
      let sender;
      let receiver;
      let err;
      this.getSenders().forEach(s => {
        if (s.track === track) {
          if (sender) {
            err = true;
          } else {
            sender = s;
          }
        }
      });
      this.getReceivers().forEach(r => {
        if (r.track === track) {
          if (receiver) {
            err = true;
          } else {
            receiver = r;
          }
        }
        return r.track === track;
      });
      if (err || (sender && receiver)) {
        return Promise.reject(new DOMException(
          'There are more than one sender or receiver for the track.',
          'InvalidAccessError'));
      } else if (sender) {
        return sender.getStats();
      } else if (receiver) {
        return receiver.getStats();
      }
      return Promise.reject(new DOMException(
        'There is no sender or receiver for the track.',
        'InvalidAccessError'));
    }
    return origGetStats.apply(this, arguments);
  };
}

function shimAddTrackRemoveTrackWithNative(window) {
  // shim addTrack/removeTrack with native variants in order to make
  // the interactions with legacy getLocalStreams behave as in other browsers.
  // Keeps a mapping stream.id => [stream, rtpsenders...]
  window.RTCPeerConnection.prototype.getLocalStreams =
    function getLocalStreams() {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      return Object.keys(this._shimmedLocalStreams)
        .map(streamId => this._shimmedLocalStreams[streamId][0]);
    };

  const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
  window.RTCPeerConnection.prototype.addTrack =
    function addTrack(track, stream) {
      if (!stream) {
        return origAddTrack.apply(this, arguments);
      }
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      const sender = origAddTrack.apply(this, arguments);
      if (!this._shimmedLocalStreams[stream.id]) {
        this._shimmedLocalStreams[stream.id] = [stream, sender];
      } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
        this._shimmedLocalStreams[stream.id].push(sender);
      }
      return sender;
    };

  const origAddStream = window.RTCPeerConnection.prototype.addStream;
  window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};

    stream.getTracks().forEach(track => {
      const alreadyExists = this.getSenders().find(s => s.track === track);
      if (alreadyExists) {
        throw new DOMException('Track already exists.',
            'InvalidAccessError');
      }
    });
    const existingSenders = this.getSenders();
    origAddStream.apply(this, arguments);
    const newSenders = this.getSenders()
      .filter(newSender => existingSenders.indexOf(newSender) === -1);
    this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
  };

  const origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
  window.RTCPeerConnection.prototype.removeStream =
    function removeStream(stream) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      delete this._shimmedLocalStreams[stream.id];
      return origRemoveStream.apply(this, arguments);
    };

  const origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
  window.RTCPeerConnection.prototype.removeTrack =
    function removeTrack(sender) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      if (sender) {
        Object.keys(this._shimmedLocalStreams).forEach(streamId => {
          const idx = this._shimmedLocalStreams[streamId].indexOf(sender);
          if (idx !== -1) {
            this._shimmedLocalStreams[streamId].splice(idx, 1);
          }
          if (this._shimmedLocalStreams[streamId].length === 1) {
            delete this._shimmedLocalStreams[streamId];
          }
        });
      }
      return origRemoveTrack.apply(this, arguments);
    };
}

function shimAddTrackRemoveTrack(window, browserDetails) {
  if (!window.RTCPeerConnection) {
    return;
  }
  // shim addTrack and removeTrack.
  if (window.RTCPeerConnection.prototype.addTrack &&
      browserDetails.version >= 65) {
    return shimAddTrackRemoveTrackWithNative(window);
  }

  // also shim pc.getLocalStreams when addTrack is shimmed
  // to return the original streams.
  const origGetLocalStreams = window.RTCPeerConnection.prototype
      .getLocalStreams;
  window.RTCPeerConnection.prototype.getLocalStreams =
    function getLocalStreams() {
      const nativeStreams = origGetLocalStreams.apply(this);
      this._reverseStreams = this._reverseStreams || {};
      return nativeStreams.map(stream => this._reverseStreams[stream.id]);
    };

  const origAddStream = window.RTCPeerConnection.prototype.addStream;
  window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};

    stream.getTracks().forEach(track => {
      const alreadyExists = this.getSenders().find(s => s.track === track);
      if (alreadyExists) {
        throw new DOMException('Track already exists.',
            'InvalidAccessError');
      }
    });
    // Add identity mapping for consistency with addTrack.
    // Unless this is being used with a stream from addTrack.
    if (!this._reverseStreams[stream.id]) {
      const newStream = new window.MediaStream(stream.getTracks());
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      stream = newStream;
    }
    origAddStream.apply(this, [stream]);
  };

  const origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
  window.RTCPeerConnection.prototype.removeStream =
    function removeStream(stream) {
      this._streams = this._streams || {};
      this._reverseStreams = this._reverseStreams || {};

      origRemoveStream.apply(this, [(this._streams[stream.id] || stream)]);
      delete this._reverseStreams[(this._streams[stream.id] ?
          this._streams[stream.id].id : stream.id)];
      delete this._streams[stream.id];
    };

  window.RTCPeerConnection.prototype.addTrack =
    function addTrack(track, stream) {
      if (this.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      const streams = [].slice.call(arguments, 1);
      if (streams.length !== 1 ||
          !streams[0].getTracks().find(t => t === track)) {
        // this is not fully correct but all we can manage without
        // [[associated MediaStreams]] internal slot.
        throw new DOMException(
          'The adapter.js addTrack polyfill only supports a single ' +
          ' stream which is associated with the specified track.',
          'NotSupportedError');
      }

      const alreadyExists = this.getSenders().find(s => s.track === track);
      if (alreadyExists) {
        throw new DOMException('Track already exists.',
            'InvalidAccessError');
      }

      this._streams = this._streams || {};
      this._reverseStreams = this._reverseStreams || {};
      const oldStream = this._streams[stream.id];
      if (oldStream) {
        // this is using odd Chrome behaviour, use with caution:
        // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
        // Note: we rely on the high-level addTrack/dtmf shim to
        // create the sender with a dtmf sender.
        oldStream.addTrack(track);

        // Trigger ONN async.
        Promise.resolve().then(() => {
          this.dispatchEvent(new Event('negotiationneeded'));
        });
      } else {
        const newStream = new window.MediaStream([track]);
        this._streams[stream.id] = newStream;
        this._reverseStreams[newStream.id] = stream;
        this.addStream(newStream);
      }
      return this.getSenders().find(s => s.track === track);
    };

  // replace the internal stream id with the external one and
  // vice versa.
  function replaceInternalStreamId(pc, description) {
    let sdp = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach(internalId => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp = sdp.replace(new RegExp(internalStream.id, 'g'),
          externalStream.id);
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp
    });
  }
  function replaceExternalStreamId(pc, description) {
    let sdp = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach(internalId => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp = sdp.replace(new RegExp(externalStream.id, 'g'),
          internalStream.id);
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp
    });
  }
  ['createOffer', 'createAnswer'].forEach(function(method) {
    const nativeMethod = window.RTCPeerConnection.prototype[method];
    const methodObj = {[method]() {
      const args = arguments;
      const isLegacyCall = arguments.length &&
          typeof arguments[0] === 'function';
      if (isLegacyCall) {
        return nativeMethod.apply(this, [
          (description) => {
            const desc = replaceInternalStreamId(this, description);
            args[0].apply(null, [desc]);
          },
          (err) => {
            if (args[1]) {
              args[1].apply(null, err);
            }
          }, arguments[2]
        ]);
      }
      return nativeMethod.apply(this, arguments)
      .then(description => replaceInternalStreamId(this, description));
    }};
    window.RTCPeerConnection.prototype[method] = methodObj[method];
  });

  const origSetLocalDescription =
      window.RTCPeerConnection.prototype.setLocalDescription;
  window.RTCPeerConnection.prototype.setLocalDescription =
    function setLocalDescription() {
      if (!arguments.length || !arguments[0].type) {
        return origSetLocalDescription.apply(this, arguments);
      }
      arguments[0] = replaceExternalStreamId(this, arguments[0]);
      return origSetLocalDescription.apply(this, arguments);
    };

  // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

  const origLocalDescription = Object.getOwnPropertyDescriptor(
      window.RTCPeerConnection.prototype, 'localDescription');
  Object.defineProperty(window.RTCPeerConnection.prototype,
      'localDescription', {
        get() {
          const description = origLocalDescription.get.apply(this);
          if (description.type === '') {
            return description;
          }
          return replaceInternalStreamId(this, description);
        }
      });

  window.RTCPeerConnection.prototype.removeTrack =
    function removeTrack(sender) {
      if (this.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      // We can not yet check for sender instanceof RTCRtpSender
      // since we shim RTPSender. So we check if sender._pc is set.
      if (!sender._pc) {
        throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' +
            'does not implement interface RTCRtpSender.', 'TypeError');
      }
      const isLocal = sender._pc === this;
      if (!isLocal) {
        throw new DOMException('Sender was not created by this connection.',
            'InvalidAccessError');
      }

      // Search for the native stream the senders track belongs to.
      this._streams = this._streams || {};
      let stream;
      Object.keys(this._streams).forEach(streamid => {
        const hasTrack = this._streams[streamid].getTracks()
          .find(track => sender.track === track);
        if (hasTrack) {
          stream = this._streams[streamid];
        }
      });

      if (stream) {
        if (stream.getTracks().length === 1) {
          // if this is the last track of the stream, remove the stream. This
          // takes care of any shimmed _senders.
          this.removeStream(this._reverseStreams[stream.id]);
        } else {
          // relying on the same odd chrome behaviour as above.
          stream.removeTrack(sender.track);
        }
        this.dispatchEvent(new Event('negotiationneeded'));
      }
    };
}

function shimPeerConnection$1(window, browserDetails) {
  if (!window.RTCPeerConnection && window.webkitRTCPeerConnection) {
    // very basic support for old versions.
    window.RTCPeerConnection = window.webkitRTCPeerConnection;
  }
  if (!window.RTCPeerConnection) {
    return;
  }

  // shim implicit creation of RTCSessionDescription/RTCIceCandidate
  if (browserDetails.version < 53) {
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          const nativeMethod = window.RTCPeerConnection.prototype[method];
          const methodObj = {[method]() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          }};
          window.RTCPeerConnection.prototype[method] = methodObj[method];
        });
  }
}

// Attempt to fix ONN in plan-b mode.
function fixNegotiationNeeded(window, browserDetails) {
  wrapPeerConnectionEvent(window, 'negotiationneeded', e => {
    const pc = e.target;
    if (browserDetails.version < 72 || (pc.getConfiguration &&
        pc.getConfiguration().sdpSemantics === 'plan-b')) {
      if (pc.signalingState !== 'stable') {
        return;
      }
    }
    return e;
  });
}

var chromeShim = /*#__PURE__*/Object.freeze({
  __proto__: null,
  shimMediaStream: shimMediaStream,
  shimOnTrack: shimOnTrack$1,
  shimGetSendersWithDtmf: shimGetSendersWithDtmf,
  shimGetStats: shimGetStats,
  shimSenderReceiverGetStats: shimSenderReceiverGetStats,
  shimAddTrackRemoveTrackWithNative: shimAddTrackRemoveTrackWithNative,
  shimAddTrackRemoveTrack: shimAddTrackRemoveTrack,
  shimPeerConnection: shimPeerConnection$1,
  fixNegotiationNeeded: fixNegotiationNeeded,
  shimGetUserMedia: shimGetUserMedia$2,
  shimGetDisplayMedia: shimGetDisplayMedia$1
});

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimGetUserMedia$1(window, browserDetails) {
  const navigator = window && window.navigator;
  const MediaStreamTrack = window && window.MediaStreamTrack;

  navigator.getUserMedia = function(constraints, onSuccess, onError) {
    // Replace Firefox 44+'s deprecation warning with unprefixed version.
    deprecated('navigator.getUserMedia',
        'navigator.mediaDevices.getUserMedia');
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };

  if (!(browserDetails.version > 55 &&
      'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
    const remap = function(obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };

    const nativeGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      if (typeof c === 'object' && typeof c.audio === 'object') {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
        remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
      }
      return nativeGetUserMedia(c);
    };

    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      const nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        const obj = nativeGetSettings.apply(this, arguments);
        remap(obj, 'mozAutoGainControl', 'autoGainControl');
        remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
        return obj;
      };
    }

    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      const nativeApplyConstraints =
        MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === 'audio' && typeof c === 'object') {
          c = JSON.parse(JSON.stringify(c));
          remap(c, 'autoGainControl', 'mozAutoGainControl');
          remap(c, 'noiseSuppression', 'mozNoiseSuppression');
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
}

/*
 *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimGetDisplayMedia(window, preferredMediaSource) {
  if (window.navigator.mediaDevices &&
    'getDisplayMedia' in window.navigator.mediaDevices) {
    return;
  }
  if (!(window.navigator.mediaDevices)) {
    return;
  }
  window.navigator.mediaDevices.getDisplayMedia =
    function getDisplayMedia(constraints) {
      if (!(constraints && constraints.video)) {
        const err = new DOMException('getDisplayMedia without video ' +
            'constraints is undefined');
        err.name = 'NotFoundError';
        // from https://heycam.github.io/webidl/#idl-DOMException-error-names
        err.code = 8;
        return Promise.reject(err);
      }
      if (constraints.video === true) {
        constraints.video = {mediaSource: preferredMediaSource};
      } else {
        constraints.video.mediaSource = preferredMediaSource;
      }
      return window.navigator.mediaDevices.getUserMedia(constraints);
    };
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimOnTrack(window) {
  if (typeof window === 'object' && window.RTCTrackEvent &&
      ('receiver' in window.RTCTrackEvent.prototype) &&
      !('transceiver' in window.RTCTrackEvent.prototype)) {
    Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
      get() {
        return {receiver: this.receiver};
      }
    });
  }
}

function shimPeerConnection(window, browserDetails) {
  if (typeof window !== 'object' ||
      !(window.RTCPeerConnection || window.mozRTCPeerConnection)) {
    return; // probably media.peerconnection.enabled=false in about:config
  }
  if (!window.RTCPeerConnection && window.mozRTCPeerConnection) {
    // very basic support for old versions.
    window.RTCPeerConnection = window.mozRTCPeerConnection;
  }

  if (browserDetails.version < 53) {
    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          const nativeMethod = window.RTCPeerConnection.prototype[method];
          const methodObj = {[method]() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          }};
          window.RTCPeerConnection.prototype[method] = methodObj[method];
        });
  }

  const modernStatsTypes = {
    inboundrtp: 'inbound-rtp',
    outboundrtp: 'outbound-rtp',
    candidatepair: 'candidate-pair',
    localcandidate: 'local-candidate',
    remotecandidate: 'remote-candidate'
  };

  const nativeGetStats = window.RTCPeerConnection.prototype.getStats;
  window.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;
    return nativeGetStats.apply(this, [selector || null])
      .then(stats => {
        if (browserDetails.version < 53 && !onSucc) {
          // Shim only promise getStats with spec-hyphens in type names
          // Leave callback version alone; misc old uses of forEach before Map
          try {
            stats.forEach(stat => {
              stat.type = modernStatsTypes[stat.type] || stat.type;
            });
          } catch (e) {
            if (e.name !== 'TypeError') {
              throw e;
            }
            // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
            stats.forEach((stat, i) => {
              stats.set(i, Object.assign({}, stat, {
                type: modernStatsTypes[stat.type] || stat.type
              }));
            });
          }
        }
        return stats;
      })
      .then(onSucc, onErr);
  };
}

function shimSenderGetStats(window) {
  if (!(typeof window === 'object' && window.RTCPeerConnection &&
      window.RTCRtpSender)) {
    return;
  }
  if (window.RTCRtpSender && 'getStats' in window.RTCRtpSender.prototype) {
    return;
  }
  const origGetSenders = window.RTCPeerConnection.prototype.getSenders;
  if (origGetSenders) {
    window.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach(sender => sender._pc = this);
      return senders;
    };
  }

  const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
  if (origAddTrack) {
    window.RTCPeerConnection.prototype.addTrack = function addTrack() {
      const sender = origAddTrack.apply(this, arguments);
      sender._pc = this;
      return sender;
    };
  }
  window.RTCRtpSender.prototype.getStats = function getStats() {
    return this.track ? this._pc.getStats(this.track) :
        Promise.resolve(new Map());
  };
}

function shimReceiverGetStats(window) {
  if (!(typeof window === 'object' && window.RTCPeerConnection &&
      window.RTCRtpSender)) {
    return;
  }
  if (window.RTCRtpSender && 'getStats' in window.RTCRtpReceiver.prototype) {
    return;
  }
  const origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
  if (origGetReceivers) {
    window.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
      const receivers = origGetReceivers.apply(this, []);
      receivers.forEach(receiver => receiver._pc = this);
      return receivers;
    };
  }
  wrapPeerConnectionEvent(window, 'track', e => {
    e.receiver._pc = e.srcElement;
    return e;
  });
  window.RTCRtpReceiver.prototype.getStats = function getStats() {
    return this._pc.getStats(this.track);
  };
}

function shimRemoveStream(window) {
  if (!window.RTCPeerConnection ||
      'removeStream' in window.RTCPeerConnection.prototype) {
    return;
  }
  window.RTCPeerConnection.prototype.removeStream =
    function removeStream(stream) {
      deprecated('removeStream', 'removeTrack');
      this.getSenders().forEach(sender => {
        if (sender.track && stream.getTracks().includes(sender.track)) {
          this.removeTrack(sender);
        }
      });
    };
}

function shimRTCDataChannel(window) {
  // rename DataChannel to RTCDataChannel (native fix in FF60):
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1173851
  if (window.DataChannel && !window.RTCDataChannel) {
    window.RTCDataChannel = window.DataChannel;
  }
}

function shimAddTransceiver(window) {
  // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
  // Firefox ignores the init sendEncodings options passed to addTransceiver
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
  if (!(typeof window === 'object' && window.RTCPeerConnection)) {
    return;
  }
  const origAddTransceiver = window.RTCPeerConnection.prototype.addTransceiver;
  if (origAddTransceiver) {
    window.RTCPeerConnection.prototype.addTransceiver =
      function addTransceiver() {
        this.setParametersPromises = [];
        const initParameters = arguments[1];
        const shouldPerformCheck = initParameters &&
                                  'sendEncodings' in initParameters;
        if (shouldPerformCheck) {
          // If sendEncodings params are provided, validate grammar
          initParameters.sendEncodings.forEach((encodingParam) => {
            if ('rid' in encodingParam) {
              const ridRegex = /^[a-z0-9]{0,16}$/i;
              if (!ridRegex.test(encodingParam.rid)) {
                throw new TypeError('Invalid RID value provided.');
              }
            }
            if ('scaleResolutionDownBy' in encodingParam) {
              if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1.0)) {
                throw new RangeError('scale_resolution_down_by must be >= 1.0');
              }
            }
            if ('maxFramerate' in encodingParam) {
              if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
                throw new RangeError('max_framerate must be >= 0.0');
              }
            }
          });
        }
        const transceiver = origAddTransceiver.apply(this, arguments);
        if (shouldPerformCheck) {
          // Check if the init options were applied. If not we do this in an
          // asynchronous way and save the promise reference in a global object.
          // This is an ugly hack, but at the same time is way more robust than
          // checking the sender parameters before and after the createOffer
          // Also note that after the createoffer we are not 100% sure that
          // the params were asynchronously applied so we might miss the
          // opportunity to recreate offer.
          const {sender} = transceiver;
          const params = sender.getParameters();
          if (!('encodings' in params) ||
              // Avoid being fooled by patched getParameters() below.
              (params.encodings.length === 1 &&
               Object.keys(params.encodings[0]).length === 0)) {
            params.encodings = initParameters.sendEncodings;
            sender.sendEncodings = initParameters.sendEncodings;
            this.setParametersPromises.push(sender.setParameters(params)
              .then(() => {
                delete sender.sendEncodings;
              }).catch(() => {
                delete sender.sendEncodings;
              })
            );
          }
        }
        return transceiver;
      };
  }
}

function shimGetParameters(window) {
  if (!(typeof window === 'object' && window.RTCRtpSender)) {
    return;
  }
  const origGetParameters = window.RTCRtpSender.prototype.getParameters;
  if (origGetParameters) {
    window.RTCRtpSender.prototype.getParameters =
      function getParameters() {
        const params = origGetParameters.apply(this, arguments);
        if (!('encodings' in params)) {
          params.encodings = [].concat(this.sendEncodings || [{}]);
        }
        return params;
      };
  }
}

function shimCreateOffer(window) {
  // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
  // Firefox ignores the init sendEncodings options passed to addTransceiver
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
  if (!(typeof window === 'object' && window.RTCPeerConnection)) {
    return;
  }
  const origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
  window.RTCPeerConnection.prototype.createOffer = function createOffer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises)
      .then(() => {
        return origCreateOffer.apply(this, arguments);
      })
      .finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateOffer.apply(this, arguments);
  };
}

function shimCreateAnswer(window) {
  // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
  // Firefox ignores the init sendEncodings options passed to addTransceiver
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
  if (!(typeof window === 'object' && window.RTCPeerConnection)) {
    return;
  }
  const origCreateAnswer = window.RTCPeerConnection.prototype.createAnswer;
  window.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises)
      .then(() => {
        return origCreateAnswer.apply(this, arguments);
      })
      .finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateAnswer.apply(this, arguments);
  };
}

var firefoxShim = /*#__PURE__*/Object.freeze({
  __proto__: null,
  shimOnTrack: shimOnTrack,
  shimPeerConnection: shimPeerConnection,
  shimSenderGetStats: shimSenderGetStats,
  shimReceiverGetStats: shimReceiverGetStats,
  shimRemoveStream: shimRemoveStream,
  shimRTCDataChannel: shimRTCDataChannel,
  shimAddTransceiver: shimAddTransceiver,
  shimGetParameters: shimGetParameters,
  shimCreateOffer: shimCreateOffer,
  shimCreateAnswer: shimCreateAnswer,
  shimGetUserMedia: shimGetUserMedia$1,
  shimGetDisplayMedia: shimGetDisplayMedia
});

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimLocalStreamsAPI(window) {
  if (typeof window !== 'object' || !window.RTCPeerConnection) {
    return;
  }
  if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
    window.RTCPeerConnection.prototype.getLocalStreams =
      function getLocalStreams() {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        return this._localStreams;
      };
  }
  if (!('addStream' in window.RTCPeerConnection.prototype)) {
    const _addTrack = window.RTCPeerConnection.prototype.addTrack;
    window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      if (!this._localStreams.includes(stream)) {
        this._localStreams.push(stream);
      }
      // Try to emulate Chrome's behaviour of adding in audio-video order.
      // Safari orders by track id.
      stream.getAudioTracks().forEach(track => _addTrack.call(this, track,
        stream));
      stream.getVideoTracks().forEach(track => _addTrack.call(this, track,
        stream));
    };

    window.RTCPeerConnection.prototype.addTrack =
      function addTrack(track, ...streams) {
        if (streams) {
          streams.forEach((stream) => {
            if (!this._localStreams) {
              this._localStreams = [stream];
            } else if (!this._localStreams.includes(stream)) {
              this._localStreams.push(stream);
            }
          });
        }
        return _addTrack.apply(this, arguments);
      };
  }
  if (!('removeStream' in window.RTCPeerConnection.prototype)) {
    window.RTCPeerConnection.prototype.removeStream =
      function removeStream(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        const index = this._localStreams.indexOf(stream);
        if (index === -1) {
          return;
        }
        this._localStreams.splice(index, 1);
        const tracks = stream.getTracks();
        this.getSenders().forEach(sender => {
          if (tracks.includes(sender.track)) {
            this.removeTrack(sender);
          }
        });
      };
  }
}

function shimRemoteStreamsAPI(window) {
  if (typeof window !== 'object' || !window.RTCPeerConnection) {
    return;
  }
  if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
    window.RTCPeerConnection.prototype.getRemoteStreams =
      function getRemoteStreams() {
        return this._remoteStreams ? this._remoteStreams : [];
      };
  }
  if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
    Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
      get() {
        return this._onaddstream;
      },
      set(f) {
        if (this._onaddstream) {
          this.removeEventListener('addstream', this._onaddstream);
          this.removeEventListener('track', this._onaddstreampoly);
        }
        this.addEventListener('addstream', this._onaddstream = f);
        this.addEventListener('track', this._onaddstreampoly = (e) => {
          e.streams.forEach(stream => {
            if (!this._remoteStreams) {
              this._remoteStreams = [];
            }
            if (this._remoteStreams.includes(stream)) {
              return;
            }
            this._remoteStreams.push(stream);
            const event = new Event('addstream');
            event.stream = stream;
            this.dispatchEvent(event);
          });
        });
      }
    });
    const origSetRemoteDescription =
      window.RTCPeerConnection.prototype.setRemoteDescription;
    window.RTCPeerConnection.prototype.setRemoteDescription =
      function setRemoteDescription() {
        const pc = this;
        if (!this._onaddstreampoly) {
          this.addEventListener('track', this._onaddstreampoly = function(e) {
            e.streams.forEach(stream => {
              if (!pc._remoteStreams) {
                pc._remoteStreams = [];
              }
              if (pc._remoteStreams.indexOf(stream) >= 0) {
                return;
              }
              pc._remoteStreams.push(stream);
              const event = new Event('addstream');
              event.stream = stream;
              pc.dispatchEvent(event);
            });
          });
        }
        return origSetRemoteDescription.apply(pc, arguments);
      };
  }
}

function shimCallbacksAPI(window) {
  if (typeof window !== 'object' || !window.RTCPeerConnection) {
    return;
  }
  const prototype = window.RTCPeerConnection.prototype;
  const origCreateOffer = prototype.createOffer;
  const origCreateAnswer = prototype.createAnswer;
  const setLocalDescription = prototype.setLocalDescription;
  const setRemoteDescription = prototype.setRemoteDescription;
  const addIceCandidate = prototype.addIceCandidate;

  prototype.createOffer =
    function createOffer(successCallback, failureCallback) {
      const options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      const promise = origCreateOffer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

  prototype.createAnswer =
    function createAnswer(successCallback, failureCallback) {
      const options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      const promise = origCreateAnswer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

  let withCallback = function(description, successCallback, failureCallback) {
    const promise = setLocalDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setLocalDescription = withCallback;

  withCallback = function(description, successCallback, failureCallback) {
    const promise = setRemoteDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setRemoteDescription = withCallback;

  withCallback = function(candidate, successCallback, failureCallback) {
    const promise = addIceCandidate.apply(this, [candidate]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.addIceCandidate = withCallback;
}

function shimGetUserMedia(window) {
  const navigator = window && window.navigator;

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // shim not needed in Safari 12.1
    const mediaDevices = navigator.mediaDevices;
    const _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
    navigator.mediaDevices.getUserMedia = (constraints) => {
      return _getUserMedia(shimConstraints(constraints));
    };
  }

  if (!navigator.getUserMedia && navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia) {
    navigator.getUserMedia = function getUserMedia(constraints, cb, errcb) {
      navigator.mediaDevices.getUserMedia(constraints)
      .then(cb, errcb);
    }.bind(navigator);
  }
}

function shimConstraints(constraints) {
  if (constraints && constraints.video !== undefined) {
    return Object.assign({},
      constraints,
      {video: compactObject(constraints.video)}
    );
  }

  return constraints;
}

function shimRTCIceServerUrls(window) {
  if (!window.RTCPeerConnection) {
    return;
  }
  // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
  const OrigPeerConnection = window.RTCPeerConnection;
  window.RTCPeerConnection =
    function RTCPeerConnection(pcConfig, pcConstraints) {
      if (pcConfig && pcConfig.iceServers) {
        const newIceServers = [];
        for (let i = 0; i < pcConfig.iceServers.length; i++) {
          let server = pcConfig.iceServers[i];
          if (!server.hasOwnProperty('urls') &&
              server.hasOwnProperty('url')) {
            deprecated('RTCIceServer.url', 'RTCIceServer.urls');
            server = JSON.parse(JSON.stringify(server));
            server.urls = server.url;
            delete server.url;
            newIceServers.push(server);
          } else {
            newIceServers.push(pcConfig.iceServers[i]);
          }
        }
        pcConfig.iceServers = newIceServers;
      }
      return new OrigPeerConnection(pcConfig, pcConstraints);
    };
  window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
  // wrap static methods. Currently just generateCertificate.
  if ('generateCertificate' in OrigPeerConnection) {
    Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
      get() {
        return OrigPeerConnection.generateCertificate;
      }
    });
  }
}

function shimTrackEventTransceiver(window) {
  // Add event.transceiver member over deprecated event.receiver
  if (typeof window === 'object' && window.RTCTrackEvent &&
      'receiver' in window.RTCTrackEvent.prototype &&
      !('transceiver' in window.RTCTrackEvent.prototype)) {
    Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
      get() {
        return {receiver: this.receiver};
      }
    });
  }
}

function shimCreateOfferLegacy(window) {
  const origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
  window.RTCPeerConnection.prototype.createOffer =
    function createOffer(offerOptions) {
      if (offerOptions) {
        if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveAudio =
            !!offerOptions.offerToReceiveAudio;
        }
        const audioTransceiver = this.getTransceivers().find(transceiver =>
          transceiver.receiver.track.kind === 'audio');
        if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
          if (audioTransceiver.direction === 'sendrecv') {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection('sendonly');
            } else {
              audioTransceiver.direction = 'sendonly';
            }
          } else if (audioTransceiver.direction === 'recvonly') {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection('inactive');
            } else {
              audioTransceiver.direction = 'inactive';
            }
          }
        } else if (offerOptions.offerToReceiveAudio === true &&
            !audioTransceiver) {
          this.addTransceiver('audio');
        }

        if (typeof offerOptions.offerToReceiveVideo !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveVideo =
            !!offerOptions.offerToReceiveVideo;
        }
        const videoTransceiver = this.getTransceivers().find(transceiver =>
          transceiver.receiver.track.kind === 'video');
        if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
          if (videoTransceiver.direction === 'sendrecv') {
            if (videoTransceiver.setDirection) {
              videoTransceiver.setDirection('sendonly');
            } else {
              videoTransceiver.direction = 'sendonly';
            }
          } else if (videoTransceiver.direction === 'recvonly') {
            if (videoTransceiver.setDirection) {
              videoTransceiver.setDirection('inactive');
            } else {
              videoTransceiver.direction = 'inactive';
            }
          }
        } else if (offerOptions.offerToReceiveVideo === true &&
            !videoTransceiver) {
          this.addTransceiver('video');
        }
      }
      return origCreateOffer.apply(this, arguments);
    };
}

function shimAudioContext(window) {
  if (typeof window !== 'object' || window.AudioContext) {
    return;
  }
  window.AudioContext = window.webkitAudioContext;
}

var safariShim = /*#__PURE__*/Object.freeze({
  __proto__: null,
  shimLocalStreamsAPI: shimLocalStreamsAPI,
  shimRemoteStreamsAPI: shimRemoteStreamsAPI,
  shimCallbacksAPI: shimCallbacksAPI,
  shimGetUserMedia: shimGetUserMedia,
  shimConstraints: shimConstraints,
  shimRTCIceServerUrls: shimRTCIceServerUrls,
  shimTrackEventTransceiver: shimTrackEventTransceiver,
  shimCreateOfferLegacy: shimCreateOfferLegacy,
  shimAudioContext: shimAudioContext
});

/* eslint-env node */

var sdp = createCommonjsModule(function (module) {

// SDP helpers.
const SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(line => line.trim());
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  const parts = blob.split('\nm=');
  return parts.map((part, index) => (index > 0 ?
    'm=' + part : part).trim() + '\r\n');
};

// Returns the session description.
SDPUtils.getDescription = function(blob) {
  const sections = SDPUtils.splitSections(blob);
  return sections && sections[0];
};

// Returns the individual media sections.
SDPUtils.getMediaSections = function(blob) {
  const sections = SDPUtils.splitSections(blob);
  sections.shift();
  return sections;
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(line => line.indexOf(prefix) === 0);
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
// Input can be prefixed with a=.
SDPUtils.parseCandidate = function(line) {
  let parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ');
  } else {
    parts = line.substring(10).split(' ');
  }

  const candidate = {
    foundation: parts[0],
    component: {1: 'rtp', 2: 'rtcp'}[parts[1]] || parts[1],
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    address: parts[4], // address is an alias for ip.
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7],
  };

  for (let i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        candidate.relatedAddress = parts[i + 1];
        break;
      case 'rport':
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case 'tcptype':
        candidate.tcpType = parts[i + 1];
        break;
      case 'ufrag':
        candidate.ufrag = parts[i + 1]; // for backward compatibility.
        candidate.usernameFragment = parts[i + 1];
        break;
      default: // extension handling, in particular ufrag. Don't overwrite.
        if (candidate[parts[i]] === undefined) {
          candidate[parts[i]] = parts[i + 1];
        }
        break;
    }
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
// This does not include the a= prefix!
SDPUtils.writeCandidate = function(candidate) {
  const sdp = [];
  sdp.push(candidate.foundation);

  const component = candidate.component;
  if (component === 'rtp') {
    sdp.push(1);
  } else if (component === 'rtcp') {
    sdp.push(2);
  } else {
    sdp.push(component);
  }
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.address || candidate.ip);
  sdp.push(candidate.port);

  const type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
      candidate.relatedPort) {
    sdp.push('raddr');
    sdp.push(candidate.relatedAddress);
    sdp.push('rport');
    sdp.push(candidate.relatedPort);
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
    sdp.push('tcptype');
    sdp.push(candidate.tcpType);
  }
  if (candidate.usernameFragment || candidate.ufrag) {
    sdp.push('ufrag');
    sdp.push(candidate.usernameFragment || candidate.ufrag);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an ice-options line, returns an array of option tags.
// Sample input:
// a=ice-options:foo bar
SDPUtils.parseIceOptions = function(line) {
  return line.substr(14).split(' ');
};

// Parses a rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  let parts = line.substr(9).split(' ');
  const parsed = {
    payloadType: parseInt(parts.shift(), 10), // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  // legacy alias, got renamed back to channels in ORTC.
  parsed.numChannels = parsed.channels;
  return parsed;
};

// Generates a rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  let pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  const channels = codec.channels || codec.numChannels || 1;
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
      (channels !== 1 ? '/' + channels : '') + '\r\n';
};

// Parses a extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
// a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  const parts = line.substr(9).split(' ');
  return {
    id: parseInt(parts[0], 10),
    direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
    uri: parts[1],
  };
};

// Generates an extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
      (headerExtension.direction && headerExtension.direction !== 'sendrecv'
        ? '/' + headerExtension.direction
        : '') +
      ' ' + headerExtension.uri + '\r\n';
};

// Parses a fmtp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  const parsed = {};
  let kv;
  const parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (let j = 0; j < parts.length; j++) {
    kv = parts[j].trim().split('=');
    parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates a fmtp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  let line = '';
  let pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
    const params = [];
    Object.keys(codec.parameters).forEach(param => {
      if (codec.parameters[param] !== undefined) {
        params.push(param + '=' + codec.parameters[param]);
      } else {
        params.push(param);
      }
    });
    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses a rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  const parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
    type: parts.shift(),
    parameter: parts.join(' '),
  };
};

// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  let lines = '';
  let pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
    // FIXME: special handling for trr-int?
    codec.rtcpFeedback.forEach(fb => {
      lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
      (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
          '\r\n';
    });
  }
  return lines;
};

// Parses a RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  const sp = line.indexOf(' ');
  const parts = {
    ssrc: parseInt(line.substr(7, sp - 7), 10),
  };
  const colon = line.indexOf(':', sp);
  if (colon > -1) {
    parts.attribute = line.substr(sp + 1, colon - sp - 1);
    parts.value = line.substr(colon + 1);
  } else {
    parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

// Parse a ssrc-group line (see RFC 5576). Sample input:
// a=ssrc-group:semantics 12 34
SDPUtils.parseSsrcGroup = function(line) {
  const parts = line.substr(13).split(' ');
  return {
    semantics: parts.shift(),
    ssrcs: parts.map(ssrc => parseInt(ssrc, 10)),
  };
};

// Extracts the MID (RFC 5888) from a media section.
// Returns the MID or undefined if no mid line was found.
SDPUtils.getMid = function(mediaSection) {
  const mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
  if (mid) {
    return mid.substr(6);
  }
};

// Parses a fingerprint line for DTLS-SRTP.
SDPUtils.parseFingerprint = function(line) {
  const parts = line.substr(14).split(' ');
  return {
    algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
    value: parts[1].toUpperCase(), // the definition is upper-case in RFC 4572.
  };
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  const lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
    'a=fingerprint:');
  // Note: a=setup line is ignored since we use the 'auto' role in Edge.
  return {
    role: 'auto',
    fingerprints: lines.map(SDPUtils.parseFingerprint),
  };
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  let sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(fp => {
    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};

// Parses a=crypto lines into
//   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#dictionary-rtcsrtpsdesparameters-members
SDPUtils.parseCryptoLine = function(line) {
  const parts = line.substr(9).split(' ');
  return {
    tag: parseInt(parts[0], 10),
    cryptoSuite: parts[1],
    keyParams: parts[2],
    sessionParams: parts.slice(3),
  };
};

SDPUtils.writeCryptoLine = function(parameters) {
  return 'a=crypto:' + parameters.tag + ' ' +
    parameters.cryptoSuite + ' ' +
    (typeof parameters.keyParams === 'object'
      ? SDPUtils.writeCryptoKeyParams(parameters.keyParams)
      : parameters.keyParams) +
    (parameters.sessionParams ? ' ' + parameters.sessionParams.join(' ') : '') +
    '\r\n';
};

// Parses the crypto key parameters into
//   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#rtcsrtpkeyparam*
SDPUtils.parseCryptoKeyParams = function(keyParams) {
  if (keyParams.indexOf('inline:') !== 0) {
    return null;
  }
  const parts = keyParams.substr(7).split('|');
  return {
    keyMethod: 'inline',
    keySalt: parts[0],
    lifeTime: parts[1],
    mkiValue: parts[2] ? parts[2].split(':')[0] : undefined,
    mkiLength: parts[2] ? parts[2].split(':')[1] : undefined,
  };
};

SDPUtils.writeCryptoKeyParams = function(keyParams) {
  return keyParams.keyMethod + ':'
    + keyParams.keySalt +
    (keyParams.lifeTime ? '|' + keyParams.lifeTime : '') +
    (keyParams.mkiValue && keyParams.mkiLength
      ? '|' + keyParams.mkiValue + ':' + keyParams.mkiLength
      : '');
};

// Extracts all SDES parameters.
SDPUtils.getCryptoParameters = function(mediaSection, sessionpart) {
  const lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
    'a=crypto:');
  return lines.map(SDPUtils.parseCryptoLine);
};

// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  const ufrag = SDPUtils.matchPrefix(mediaSection + sessionpart,
    'a=ice-ufrag:')[0];
  const pwd = SDPUtils.matchPrefix(mediaSection + sessionpart,
    'a=ice-pwd:')[0];
  if (!(ufrag && pwd)) {
    return null;
  }
  return {
    usernameFragment: ufrag.substr(12),
    password: pwd.substr(10),
  };
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  let sdp = 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
      'a=ice-pwd:' + params.password + '\r\n';
  if (params.iceLite) {
    sdp += 'a=ice-lite\r\n';
  }
  return sdp;
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  const description = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
    rtcp: [],
  };
  const lines = SDPUtils.splitLines(mediaSection);
  const mline = lines[0].split(' ');
  for (let i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
    const pt = mline[i];
    const rtpmapline = SDPUtils.matchPrefix(
      mediaSection, 'a=rtpmap:' + pt + ' ')[0];
    if (rtpmapline) {
      const codec = SDPUtils.parseRtpMap(rtpmapline);
      const fmtps = SDPUtils.matchPrefix(
        mediaSection, 'a=fmtp:' + pt + ' ');
      // Only the first a=fmtp:<pt> is considered.
      codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
      codec.rtcpFeedback = SDPUtils.matchPrefix(
        mediaSection, 'a=rtcp-fb:' + pt + ' ')
        .map(SDPUtils.parseRtcpFb);
      description.codecs.push(codec);
      // parse FEC mechanisms from rtpmap lines.
      switch (codec.name.toUpperCase()) {
        case 'RED':
        case 'ULPFEC':
          description.fecMechanisms.push(codec.name.toUpperCase());
          break;
      }
    }
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(line => {
    description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  let sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(codec => {
    if (codec.preferredPayloadType !== undefined) {
      return codec.preferredPayloadType;
    }
    return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(codec => {
    sdp += SDPUtils.writeRtpMap(codec);
    sdp += SDPUtils.writeFmtp(codec);
    sdp += SDPUtils.writeRtcpFb(codec);
  });
  let maxptime = 0;
  caps.codecs.forEach(codec => {
    if (codec.maxptime > maxptime) {
      maxptime = codec.maxptime;
    }
  });
  if (maxptime > 0) {
    sdp += 'a=maxptime:' + maxptime + '\r\n';
  }

  if (caps.headerExtensions) {
    caps.headerExtensions.forEach(extension => {
      sdp += SDPUtils.writeExtmap(extension);
    });
  }
  // FIXME: write fecMechanisms.
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  const encodingParameters = [];
  const description = SDPUtils.parseRtpParameters(mediaSection);
  const hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  const hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  const ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
    .map(line => SDPUtils.parseSsrcMedia(line))
    .filter(parts => parts.attribute === 'cname');
  const primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  let secondarySsrc;

  const flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
    .map(line => {
      const parts = line.substr(17).split(' ');
      return parts.map(part => parseInt(part, 10));
    });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
    secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(codec => {
    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
      let encParam = {
        ssrc: primarySsrc,
        codecPayloadType: parseInt(codec.parameters.apt, 10),
      };
      if (primarySsrc && secondarySsrc) {
        encParam.rtx = {ssrc: secondarySsrc};
      }
      encodingParameters.push(encParam);
      if (hasRed) {
        encParam = JSON.parse(JSON.stringify(encParam));
        encParam.fec = {
          ssrc: primarySsrc,
          mechanism: hasUlpfec ? 'red+ulpfec' : 'red',
        };
        encodingParameters.push(encParam);
      }
    }
  });
  if (encodingParameters.length === 0 && primarySsrc) {
    encodingParameters.push({
      ssrc: primarySsrc,
    });
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  let bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(7), 10);
    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
      // use formula from JSEP to convert b=AS to TIAS value.
      bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95
          - (50 * 40 * 8);
    } else {
      bandwidth = undefined;
    }
    encodingParameters.forEach(params => {
      params.maxBitrate = bandwidth;
    });
  }
  return encodingParameters;
};

// parses http://draft.ortc.org/#rtcrtcpparameters*
SDPUtils.parseRtcpParameters = function(mediaSection) {
  const rtcpParameters = {};

  // Gets the first SSRC. Note that with RTX there might be multiple
  // SSRCs.
  const remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
    .map(line => SDPUtils.parseSsrcMedia(line))
    .filter(obj => obj.attribute === 'cname')[0];
  if (remoteSsrc) {
    rtcpParameters.cname = remoteSsrc.value;
    rtcpParameters.ssrc = remoteSsrc.ssrc;
  }

  // Edge uses the compound attribute instead of reducedSize
  // compound is !reducedSize
  const rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
  rtcpParameters.reducedSize = rsize.length > 0;
  rtcpParameters.compound = rsize.length === 0;

  // parses the rtcp-mux attrіbute.
  // Note that Edge does not support unmuxed RTCP.
  const mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
  rtcpParameters.mux = mux.length > 0;

  return rtcpParameters;
};

SDPUtils.writeRtcpParameters = function(rtcpParameters) {
  let sdp = '';
  if (rtcpParameters.reducedSize) {
    sdp += 'a=rtcp-rsize\r\n';
  }
  if (rtcpParameters.mux) {
    sdp += 'a=rtcp-mux\r\n';
  }
  if (rtcpParameters.ssrc !== undefined && rtcpParameters.cname) {
    sdp += 'a=ssrc:' + rtcpParameters.ssrc +
      ' cname:' + rtcpParameters.cname + '\r\n';
  }
  return sdp;
};


// parses either a=msid: or a=ssrc:... msid lines and returns
// the id of the MediaStream and MediaStreamTrack.
SDPUtils.parseMsid = function(mediaSection) {
  let parts;
  const spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
  if (spec.length === 1) {
    parts = spec[0].substr(7).split(' ');
    return {stream: parts[0], track: parts[1]};
  }
  const planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
    .map(line => SDPUtils.parseSsrcMedia(line))
    .filter(msidParts => msidParts.attribute === 'msid');
  if (planB.length > 0) {
    parts = planB[0].value.split(' ');
    return {stream: parts[0], track: parts[1]};
  }
};

// SCTP
// parses draft-ietf-mmusic-sctp-sdp-26 first and falls back
// to draft-ietf-mmusic-sctp-sdp-05
SDPUtils.parseSctpDescription = function(mediaSection) {
  const mline = SDPUtils.parseMLine(mediaSection);
  const maxSizeLine = SDPUtils.matchPrefix(mediaSection, 'a=max-message-size:');
  let maxMessageSize;
  if (maxSizeLine.length > 0) {
    maxMessageSize = parseInt(maxSizeLine[0].substr(19), 10);
  }
  if (isNaN(maxMessageSize)) {
    maxMessageSize = 65536;
  }
  const sctpPort = SDPUtils.matchPrefix(mediaSection, 'a=sctp-port:');
  if (sctpPort.length > 0) {
    return {
      port: parseInt(sctpPort[0].substr(12), 10),
      protocol: mline.fmt,
      maxMessageSize,
    };
  }
  const sctpMapLines = SDPUtils.matchPrefix(mediaSection, 'a=sctpmap:');
  if (sctpMapLines.length > 0) {
    const parts = sctpMapLines[0]
      .substr(10)
      .split(' ');
    return {
      port: parseInt(parts[0], 10),
      protocol: parts[1],
      maxMessageSize,
    };
  }
};

// SCTP
// outputs the draft-ietf-mmusic-sctp-sdp-26 version that all browsers
// support by now receiving in this format, unless we originally parsed
// as the draft-ietf-mmusic-sctp-sdp-05 format (indicated by the m-line
// protocol of DTLS/SCTP -- without UDP/ or TCP/)
SDPUtils.writeSctpDescription = function(media, sctp) {
  let output = [];
  if (media.protocol !== 'DTLS/SCTP') {
    output = [
      'm=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.protocol + '\r\n',
      'c=IN IP4 0.0.0.0\r\n',
      'a=sctp-port:' + sctp.port + '\r\n',
    ];
  } else {
    output = [
      'm=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.port + '\r\n',
      'c=IN IP4 0.0.0.0\r\n',
      'a=sctpmap:' + sctp.port + ' ' + sctp.protocol + ' 65535\r\n',
    ];
  }
  if (sctp.maxMessageSize !== undefined) {
    output.push('a=max-message-size:' + sctp.maxMessageSize + '\r\n');
  }
  return output.join('');
};

// Generate a session ID for SDP.
// https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
// recommends using a cryptographically random +ve 64-bit value
// but right now this should be acceptable and within the right range
SDPUtils.generateSessionId = function() {
  return Math.random().toString().substr(2, 21);
};

// Write boiler plate for start of SDP
// sessId argument is optional - if not supplied it will
// be generated randomly
// sessVersion is optional and defaults to 2
// sessUser is optional and defaults to 'thisisadapterortc'
SDPUtils.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
  let sessionId;
  const version = sessVer !== undefined ? sessVer : 2;
  if (sessId) {
    sessionId = sessId;
  } else {
    sessionId = SDPUtils.generateSessionId();
  }
  const user = sessUser || 'thisisadapterortc';
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
      'o=' + user + ' ' + sessionId + ' ' + version +
        ' IN IP4 127.0.0.1\r\n' +
      's=-\r\n' +
      't=0 0\r\n';
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  const lines = SDPUtils.splitLines(mediaSection);
  for (let i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case 'a=sendrecv':
      case 'a=sendonly':
      case 'a=recvonly':
      case 'a=inactive':
        return lines[i].substr(2);
        // FIXME: What should happen here?
    }
  }
  if (sessionpart) {
    return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

SDPUtils.getKind = function(mediaSection) {
  const lines = SDPUtils.splitLines(mediaSection);
  const mline = lines[0].split(' ');
  return mline[0].substr(2);
};

SDPUtils.isRejected = function(mediaSection) {
  return mediaSection.split(' ', 2)[1] === '0';
};

SDPUtils.parseMLine = function(mediaSection) {
  const lines = SDPUtils.splitLines(mediaSection);
  const parts = lines[0].substr(2).split(' ');
  return {
    kind: parts[0],
    port: parseInt(parts[1], 10),
    protocol: parts[2],
    fmt: parts.slice(3).join(' '),
  };
};

SDPUtils.parseOLine = function(mediaSection) {
  const line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
  const parts = line.substr(2).split(' ');
  return {
    username: parts[0],
    sessionId: parts[1],
    sessionVersion: parseInt(parts[2], 10),
    netType: parts[3],
    addressType: parts[4],
    address: parts[5],
  };
};

// a very naive interpretation of a valid SDP.
SDPUtils.isValidSDP = function(blob) {
  if (typeof blob !== 'string' || blob.length === 0) {
    return false;
  }
  const lines = SDPUtils.splitLines(blob);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length < 2 || lines[i].charAt(1) !== '=') {
      return false;
    }
    // TODO: check the modifier a bit more.
  }
  return true;
};

// Expose public methods.
{
  module.exports = SDPUtils;
}
});

var sdp$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), sdp, {
  'default': sdp
}));

/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimRTCIceCandidate(window) {
  // foundation is arbitrarily chosen as an indicator for full support for
  // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
  if (!window.RTCIceCandidate || (window.RTCIceCandidate && 'foundation' in
      window.RTCIceCandidate.prototype)) {
    return;
  }

  const NativeRTCIceCandidate = window.RTCIceCandidate;
  window.RTCIceCandidate = function RTCIceCandidate(args) {
    // Remove the a= which shouldn't be part of the candidate string.
    if (typeof args === 'object' && args.candidate &&
        args.candidate.indexOf('a=') === 0) {
      args = JSON.parse(JSON.stringify(args));
      args.candidate = args.candidate.substr(2);
    }

    if (args.candidate && args.candidate.length) {
      // Augment the native candidate with the parsed fields.
      const nativeCandidate = new NativeRTCIceCandidate(args);
      const parsedCandidate = sdp.parseCandidate(args.candidate);
      const augmentedCandidate = Object.assign(nativeCandidate,
          parsedCandidate);

      // Add a serializer that does not serialize the extra attributes.
      augmentedCandidate.toJSON = function toJSON() {
        return {
          candidate: augmentedCandidate.candidate,
          sdpMid: augmentedCandidate.sdpMid,
          sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
          usernameFragment: augmentedCandidate.usernameFragment,
        };
      };
      return augmentedCandidate;
    }
    return new NativeRTCIceCandidate(args);
  };
  window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;

  // Hook up the augmented candidate in onicecandidate and
  // addEventListener('icecandidate', ...)
  wrapPeerConnectionEvent(window, 'icecandidate', e => {
    if (e.candidate) {
      Object.defineProperty(e, 'candidate', {
        value: new window.RTCIceCandidate(e.candidate),
        writable: 'false'
      });
    }
    return e;
  });
}

function shimMaxMessageSize(window, browserDetails) {
  if (!window.RTCPeerConnection) {
    return;
  }

  if (!('sctp' in window.RTCPeerConnection.prototype)) {
    Object.defineProperty(window.RTCPeerConnection.prototype, 'sctp', {
      get() {
        return typeof this._sctp === 'undefined' ? null : this._sctp;
      }
    });
  }

  const sctpInDescription = function(description) {
    if (!description || !description.sdp) {
      return false;
    }
    const sections = sdp.splitSections(description.sdp);
    sections.shift();
    return sections.some(mediaSection => {
      const mLine = sdp.parseMLine(mediaSection);
      return mLine && mLine.kind === 'application'
          && mLine.protocol.indexOf('SCTP') !== -1;
    });
  };

  const getRemoteFirefoxVersion = function(description) {
    // TODO: Is there a better solution for detecting Firefox?
    const match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
    if (match === null || match.length < 2) {
      return -1;
    }
    const version = parseInt(match[1], 10);
    // Test for NaN (yes, this is ugly)
    return version !== version ? -1 : version;
  };

  const getCanSendMaxMessageSize = function(remoteIsFirefox) {
    // Every implementation we know can send at least 64 KiB.
    // Note: Although Chrome is technically able to send up to 256 KiB, the
    //       data does not reach the other peer reliably.
    //       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
    let canSendMaxMessageSize = 65536;
    if (browserDetails.browser === 'firefox') {
      if (browserDetails.version < 57) {
        if (remoteIsFirefox === -1) {
          // FF < 57 will send in 16 KiB chunks using the deprecated PPID
          // fragmentation.
          canSendMaxMessageSize = 16384;
        } else {
          // However, other FF (and RAWRTC) can reassemble PPID-fragmented
          // messages. Thus, supporting ~2 GiB when sending.
          canSendMaxMessageSize = 2147483637;
        }
      } else if (browserDetails.version < 60) {
        // Currently, all FF >= 57 will reset the remote maximum message size
        // to the default value when a data channel is created at a later
        // stage. :(
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
        canSendMaxMessageSize =
          browserDetails.version === 57 ? 65535 : 65536;
      } else {
        // FF >= 60 supports sending ~2 GiB
        canSendMaxMessageSize = 2147483637;
      }
    }
    return canSendMaxMessageSize;
  };

  const getMaxMessageSize = function(description, remoteIsFirefox) {
    // Note: 65536 bytes is the default value from the SDP spec. Also,
    //       every implementation we know supports receiving 65536 bytes.
    let maxMessageSize = 65536;

    // FF 57 has a slightly incorrect default remote max message size, so
    // we need to adjust it here to avoid a failure when sending.
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697
    if (browserDetails.browser === 'firefox'
         && browserDetails.version === 57) {
      maxMessageSize = 65535;
    }

    const match = sdp.matchPrefix(description.sdp,
      'a=max-message-size:');
    if (match.length > 0) {
      maxMessageSize = parseInt(match[0].substr(19), 10);
    } else if (browserDetails.browser === 'firefox' &&
                remoteIsFirefox !== -1) {
      // If the maximum message size is not present in the remote SDP and
      // both local and remote are Firefox, the remote peer can receive
      // ~2 GiB.
      maxMessageSize = 2147483637;
    }
    return maxMessageSize;
  };

  const origSetRemoteDescription =
      window.RTCPeerConnection.prototype.setRemoteDescription;
  window.RTCPeerConnection.prototype.setRemoteDescription =
    function setRemoteDescription() {
      this._sctp = null;
      // Chrome decided to not expose .sctp in plan-b mode.
      // As usual, adapter.js has to do an 'ugly worakaround'
      // to cover up the mess.
      if (browserDetails.browser === 'chrome' && browserDetails.version >= 76) {
        const {sdpSemantics} = this.getConfiguration();
        if (sdpSemantics === 'plan-b') {
          Object.defineProperty(this, 'sctp', {
            get() {
              return typeof this._sctp === 'undefined' ? null : this._sctp;
            },
            enumerable: true,
            configurable: true,
          });
        }
      }

      if (sctpInDescription(arguments[0])) {
        // Check if the remote is FF.
        const isFirefox = getRemoteFirefoxVersion(arguments[0]);

        // Get the maximum message size the local peer is capable of sending
        const canSendMMS = getCanSendMaxMessageSize(isFirefox);

        // Get the maximum message size of the remote peer.
        const remoteMMS = getMaxMessageSize(arguments[0], isFirefox);

        // Determine final maximum message size
        let maxMessageSize;
        if (canSendMMS === 0 && remoteMMS === 0) {
          maxMessageSize = Number.POSITIVE_INFINITY;
        } else if (canSendMMS === 0 || remoteMMS === 0) {
          maxMessageSize = Math.max(canSendMMS, remoteMMS);
        } else {
          maxMessageSize = Math.min(canSendMMS, remoteMMS);
        }

        // Create a dummy RTCSctpTransport object and the 'maxMessageSize'
        // attribute.
        const sctp = {};
        Object.defineProperty(sctp, 'maxMessageSize', {
          get() {
            return maxMessageSize;
          }
        });
        this._sctp = sctp;
      }

      return origSetRemoteDescription.apply(this, arguments);
    };
}

function shimSendThrowTypeError(window) {
  if (!(window.RTCPeerConnection &&
      'createDataChannel' in window.RTCPeerConnection.prototype)) {
    return;
  }

  // Note: Although Firefox >= 57 has a native implementation, the maximum
  //       message size can be reset for all data channels at a later stage.
  //       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831

  function wrapDcSend(dc, pc) {
    const origDataChannelSend = dc.send;
    dc.send = function send() {
      const data = arguments[0];
      const length = data.length || data.size || data.byteLength;
      if (dc.readyState === 'open' &&
          pc.sctp && length > pc.sctp.maxMessageSize) {
        throw new TypeError('Message too large (can send a maximum of ' +
          pc.sctp.maxMessageSize + ' bytes)');
      }
      return origDataChannelSend.apply(dc, arguments);
    };
  }
  const origCreateDataChannel =
    window.RTCPeerConnection.prototype.createDataChannel;
  window.RTCPeerConnection.prototype.createDataChannel =
    function createDataChannel() {
      const dataChannel = origCreateDataChannel.apply(this, arguments);
      wrapDcSend(dataChannel, this);
      return dataChannel;
    };
  wrapPeerConnectionEvent(window, 'datachannel', e => {
    wrapDcSend(e.channel, e.target);
    return e;
  });
}


/* shims RTCConnectionState by pretending it is the same as iceConnectionState.
 * See https://bugs.chromium.org/p/webrtc/issues/detail?id=6145#c12
 * for why this is a valid hack in Chrome. In Firefox it is slightly incorrect
 * since DTLS failures would be hidden. See
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1265827
 * for the Firefox tracking bug.
 */
function shimConnectionState(window) {
  if (!window.RTCPeerConnection ||
      'connectionState' in window.RTCPeerConnection.prototype) {
    return;
  }
  const proto = window.RTCPeerConnection.prototype;
  Object.defineProperty(proto, 'connectionState', {
    get() {
      return {
        completed: 'connected',
        checking: 'connecting'
      }[this.iceConnectionState] || this.iceConnectionState;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(proto, 'onconnectionstatechange', {
    get() {
      return this._onconnectionstatechange || null;
    },
    set(cb) {
      if (this._onconnectionstatechange) {
        this.removeEventListener('connectionstatechange',
            this._onconnectionstatechange);
        delete this._onconnectionstatechange;
      }
      if (cb) {
        this.addEventListener('connectionstatechange',
            this._onconnectionstatechange = cb);
      }
    },
    enumerable: true,
    configurable: true
  });

  ['setLocalDescription', 'setRemoteDescription'].forEach((method) => {
    const origMethod = proto[method];
    proto[method] = function() {
      if (!this._connectionstatechangepoly) {
        this._connectionstatechangepoly = e => {
          const pc = e.target;
          if (pc._lastConnectionState !== pc.connectionState) {
            pc._lastConnectionState = pc.connectionState;
            const newEvent = new Event('connectionstatechange', e);
            pc.dispatchEvent(newEvent);
          }
          return e;
        };
        this.addEventListener('iceconnectionstatechange',
          this._connectionstatechangepoly);
      }
      return origMethod.apply(this, arguments);
    };
  });
}

function removeExtmapAllowMixed(window, browserDetails) {
  /* remove a=extmap-allow-mixed for webrtc.org < M71 */
  if (!window.RTCPeerConnection) {
    return;
  }
  if (browserDetails.browser === 'chrome' && browserDetails.version >= 71) {
    return;
  }
  if (browserDetails.browser === 'safari' && browserDetails.version >= 605) {
    return;
  }
  const nativeSRD = window.RTCPeerConnection.prototype.setRemoteDescription;
  window.RTCPeerConnection.prototype.setRemoteDescription =
  function setRemoteDescription(desc) {
    if (desc && desc.sdp && desc.sdp.indexOf('\na=extmap-allow-mixed') !== -1) {
      const sdp = desc.sdp.split('\n').filter((line) => {
        return line.trim() !== 'a=extmap-allow-mixed';
      }).join('\n');
      // Safari enforces read-only-ness of RTCSessionDescription fields.
      if (window.RTCSessionDescription &&
          desc instanceof window.RTCSessionDescription) {
        arguments[0] = new window.RTCSessionDescription({
          type: desc.type,
          sdp,
        });
      } else {
        desc.sdp = sdp;
      }
    }
    return nativeSRD.apply(this, arguments);
  };
}

function shimAddIceCandidateNullOrEmpty(window, browserDetails) {
  // Support for addIceCandidate(null or undefined)
  // as well as addIceCandidate({candidate: "", ...})
  // https://bugs.chromium.org/p/chromium/issues/detail?id=978582
  // Note: must be called before other polyfills which change the signature.
  if (!(window.RTCPeerConnection && window.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeAddIceCandidate =
      window.RTCPeerConnection.prototype.addIceCandidate;
  if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
    return;
  }
  window.RTCPeerConnection.prototype.addIceCandidate =
    function addIceCandidate() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      // Firefox 68+ emits and processes {candidate: "", ...}, ignore
      // in older versions.
      // Native support for ignoring exists for Chrome M77+.
      // Safari ignores as well, exact version unknown but works in the same
      // version that also ignores addIceCandidate(null).
      if (((browserDetails.browser === 'chrome' && browserDetails.version < 78)
           || (browserDetails.browser === 'firefox'
               && browserDetails.version < 68)
           || (browserDetails.browser === 'safari'))
          && arguments[0] && arguments[0].candidate === '') {
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
}

// Note: Make sure to call this ahead of APIs that modify
// setLocalDescription.length
function shimParameterlessSetLocalDescription(window, browserDetails) {
  if (!(window.RTCPeerConnection && window.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeSetLocalDescription =
      window.RTCPeerConnection.prototype.setLocalDescription;
  if (!nativeSetLocalDescription || nativeSetLocalDescription.length === 0) {
    return;
  }
  window.RTCPeerConnection.prototype.setLocalDescription =
    function setLocalDescription() {
      let desc = arguments[0] || {};
      if (typeof desc !== 'object' || (desc.type && desc.sdp)) {
        return nativeSetLocalDescription.apply(this, arguments);
      }
      // The remaining steps should technically happen when SLD comes off the
      // RTCPeerConnection's operations chain (not ahead of going on it), but
      // this is too difficult to shim. Instead, this shim only covers the
      // common case where the operations chain is empty. This is imperfect, but
      // should cover many cases. Rationale: Even if we can't reduce the glare
      // window to zero on imperfect implementations, there's value in tapping
      // into the perfect negotiation pattern that several browsers support.
      desc = {type: desc.type, sdp: desc.sdp};
      if (!desc.type) {
        switch (this.signalingState) {
          case 'stable':
          case 'have-local-offer':
          case 'have-remote-pranswer':
            desc.type = 'offer';
            break;
          default:
            desc.type = 'answer';
            break;
        }
      }
      if (desc.sdp || (desc.type !== 'offer' && desc.type !== 'answer')) {
        return nativeSetLocalDescription.apply(this, [desc]);
      }
      const func = desc.type === 'offer' ? this.createOffer : this.createAnswer;
      return func.apply(this)
        .then(d => nativeSetLocalDescription.apply(this, [d]));
    };
}

var commonShim = /*#__PURE__*/Object.freeze({
  __proto__: null,
  shimRTCIceCandidate: shimRTCIceCandidate,
  shimMaxMessageSize: shimMaxMessageSize,
  shimSendThrowTypeError: shimSendThrowTypeError,
  shimConnectionState: shimConnectionState,
  removeExtmapAllowMixed: removeExtmapAllowMixed,
  shimAddIceCandidateNullOrEmpty: shimAddIceCandidateNullOrEmpty,
  shimParameterlessSetLocalDescription: shimParameterlessSetLocalDescription
});

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

// Shimming starts here.
function adapterFactory({window} = {}, options = {
  shimChrome: true,
  shimFirefox: true,
  shimSafari: true,
}) {
  // Utils.
  const logging = log;
  const browserDetails = detectBrowser(window);

  const adapter = {
    browserDetails,
    commonShim,
    extractVersion: extractVersion,
    disableLog: disableLog,
    disableWarnings: disableWarnings,
    // Expose sdp as a convenience. For production apps include directly.
    sdp: sdp$1,
  };

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'chrome':
      if (!chromeShim || !shimPeerConnection$1 ||
          !options.shimChrome) {
        logging('Chrome shim is not included in this adapter release.');
        return adapter;
      }
      if (browserDetails.version === null) {
        logging('Chrome shim can not determine version, not shimming.');
        return adapter;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = chromeShim;

      // Must be called before shimPeerConnection.
      shimAddIceCandidateNullOrEmpty(window, browserDetails);
      shimParameterlessSetLocalDescription(window);

      shimGetUserMedia$2(window, browserDetails);
      shimMediaStream(window);
      shimPeerConnection$1(window, browserDetails);
      shimOnTrack$1(window);
      shimAddTrackRemoveTrack(window, browserDetails);
      shimGetSendersWithDtmf(window);
      shimGetStats(window);
      shimSenderReceiverGetStats(window);
      fixNegotiationNeeded(window, browserDetails);

      shimRTCIceCandidate(window);
      shimConnectionState(window);
      shimMaxMessageSize(window, browserDetails);
      shimSendThrowTypeError(window);
      removeExtmapAllowMixed(window, browserDetails);
      break;
    case 'firefox':
      if (!firefoxShim || !shimPeerConnection ||
          !options.shimFirefox) {
        logging('Firefox shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = firefoxShim;

      // Must be called before shimPeerConnection.
      shimAddIceCandidateNullOrEmpty(window, browserDetails);
      shimParameterlessSetLocalDescription(window);

      shimGetUserMedia$1(window, browserDetails);
      shimPeerConnection(window, browserDetails);
      shimOnTrack(window);
      shimRemoveStream(window);
      shimSenderGetStats(window);
      shimReceiverGetStats(window);
      shimRTCDataChannel(window);
      shimAddTransceiver(window);
      shimGetParameters(window);
      shimCreateOffer(window);
      shimCreateAnswer(window);

      shimRTCIceCandidate(window);
      shimConnectionState(window);
      shimMaxMessageSize(window, browserDetails);
      shimSendThrowTypeError(window);
      break;
    case 'safari':
      if (!safariShim || !options.shimSafari) {
        logging('Safari shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = safariShim;

      // Must be called before shimCallbackAPI.
      shimAddIceCandidateNullOrEmpty(window, browserDetails);
      shimParameterlessSetLocalDescription(window);

      shimRTCIceServerUrls(window);
      shimCreateOfferLegacy(window);
      shimCallbacksAPI(window);
      shimLocalStreamsAPI(window);
      shimRemoteStreamsAPI(window);
      shimTrackEventTransceiver(window);
      shimGetUserMedia(window);
      shimAudioContext(window);

      shimRTCIceCandidate(window);
      shimMaxMessageSize(window, browserDetails);
      shimSendThrowTypeError(window);
      removeExtmapAllowMixed(window, browserDetails);
      break;
    default:
      logging('Unsupported browser!');
      break;
  }

  return adapter;
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

const adapter =
  adapterFactory({window: typeof window === 'undefined' ? undefined : window});

!function (t, e) {
  (t = t || self).RTCBeautyPlugin = e(t.XRTC);
}(window, function (t) {
  function e(t, e) {
    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
  }

  function r(t, e) {
    for (var r = 0; r < e.length; r++) {
      var n = e[r];
      n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
    }
  }

  function n(t, e, n) {
    return e && r(t.prototype, e), n && r(t, n), t;
  }

  t = t && Object.prototype.hasOwnProperty.call(t, "default") ? t["default"] : t;
  var i = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};

  function o(t, e) {
    return t(e = {
      exports: {}
    }, e.exports), e.exports;
  }

  var a,
      u,
      s = function s(t) {
    return t && t.Math == Math && t;
  },
      c = s("object" == (typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) && globalThis) || s("object" == (typeof window === "undefined" ? "undefined" : _typeof(window)) && window) || s("object" == (typeof self === "undefined" ? "undefined" : _typeof(self)) && self) || s("object" == _typeof(i) && i) || function () {
    return this;
  }() || Function("return this")(),
      l = function l(t) {
    try {
      return !!t();
    } catch (e) {
      return !0;
    }
  },
      f = !l(function () {
    return 7 != Object.defineProperty({}, 1, {
      get: function get() {
        return 7;
      }
    })[1];
  }),
      h = {}.propertyIsEnumerable,
      v = Object.getOwnPropertyDescriptor,
      p = {
    f: v && !h.call({
      1: 2
    }, 1) ? function (t) {
      var e = v(this, t);
      return !!e && e.enumerable;
    } : h
  },
      d = function d(t, e) {
    return {
      enumerable: !(1 & t),
      configurable: !(2 & t),
      writable: !(4 & t),
      value: e
    };
  },
      g = {}.toString,
      y = function y(t) {
    return g.call(t).slice(8, -1);
  },
      b = "".split,
      m = l(function () {
    return !Object("z").propertyIsEnumerable(0);
  }) ? function (t) {
    return "String" == y(t) ? b.call(t, "") : Object(t);
  } : Object,
      T = function T(t) {
    if (null == t) throw TypeError("Can't call method on " + t);
    return t;
  },
      x = function x(t) {
    return m(T(t));
  },
      A = function A(t) {
    return "object" == _typeof(t) ? null !== t : "function" == typeof t;
  },
      w = function w(t) {
    return "function" == typeof t ? t : void 0;
  },
      E = function E(t, e) {
    return arguments.length < 2 ? w(c[t]) : c[t] && c[t][e];
  },
      S = E("navigator", "userAgent") || "",
      C = c.process,
      O = c.Deno,
      R = C && C.versions || O && O.version,
      I = R && R.v8;

  I ? u = (a = I.split("."))[0] < 4 ? 1 : a[0] + a[1] : S && (!(a = S.match(/Edge\/(\d+)/)) || a[1] >= 74) && (a = S.match(/Chrome\/(\d+)/)) && (u = a[1]);

  var _ = u && +u,
      P = !!Object.getOwnPropertySymbols && !l(function () {
    var t = Symbol();
    return !String(t) || !(Object(t) instanceof Symbol) || !Symbol.sham && _ && _ < 41;
  }),
      k = P && !Symbol.sham && "symbol" == _typeof(Symbol.iterator),
      D = k ? function (t) {
    return "symbol" == _typeof(t);
  } : function (t) {
    var e = E("Symbol");
    return "function" == typeof e && Object(t) instanceof e;
  },
      U = function U(t, e) {
    try {
      Object.defineProperty(c, t, {
        value: e,
        configurable: !0,
        writable: !0
      });
    } catch (r) {
      c[t] = e;
    }

    return e;
  },
      j = c["__core-js_shared__"] || U("__core-js_shared__", {}),
      L = o(function (t) {
    (t.exports = function (t, e) {
      return j[t] || (j[t] = void 0 !== e ? e : {});
    })("versions", []).push({
      version: "3.16.0",
      mode: "global",
      copyright: "© 2021 Denis Pushkarev (zloirock.ru)"
    });
  }),
      M = function M(t) {
    return Object(T(t));
  },
      F = {}.hasOwnProperty,
      B = Object.hasOwn || function (t, e) {
    return F.call(M(t), e);
  },
      N = 0,
      Y = Math.random(),
      V = function V(t) {
    return "Symbol(" + String(void 0 === t ? "" : t) + ")_" + (++N + Y).toString(36);
  },
      W = L("wks"),
      G = c.Symbol,
      z = k ? G : G && G.withoutSetter || V,
      $ = function $(t) {
    return B(W, t) && (P || "string" == typeof W[t]) || (P && B(G, t) ? W[t] = G[t] : W[t] = z("Symbol." + t)), W[t];
  },
      X = $("toPrimitive"),
      H = function H(t, e) {
    if (!A(t) || D(t)) return t;
    var r,
        n = t[X];

    if (void 0 !== n) {
      if (void 0 === e && (e = "default"), r = n.call(t, e), !A(r) || D(r)) return r;
      throw TypeError("Can't convert object to primitive value");
    }

    return void 0 === e && (e = "number"), function (t, e) {
      var r, n;
      if ("string" === e && "function" == typeof (r = t.toString) && !A(n = r.call(t))) return n;
      if ("function" == typeof (r = t.valueOf) && !A(n = r.call(t))) return n;
      if ("string" !== e && "function" == typeof (r = t.toString) && !A(n = r.call(t))) return n;
      throw TypeError("Can't convert object to primitive value");
    }(t, e);
  },
      K = function K(t) {
    var e = H(t, "string");
    return D(e) ? e : String(e);
  },
      q = c.document,
      J = A(q) && A(q.createElement),
      Q = function Q(t) {
    return J ? q.createElement(t) : {};
  },
      Z = !f && !l(function () {
    return 7 != Object.defineProperty(Q("div"), "a", {
      get: function get() {
        return 7;
      }
    }).a;
  }),
      tt = Object.getOwnPropertyDescriptor,
      et = {
    f: f ? tt : function (t, e) {
      if (t = x(t), e = K(e), Z) try {
        return tt(t, e);
      } catch (r) {}
      if (B(t, e)) return d(!p.f.call(t, e), t[e]);
    }
  },
      rt = function rt(t) {
    if (!A(t)) throw TypeError(String(t) + " is not an object");
    return t;
  },
      nt = Object.defineProperty,
      it = {
    f: f ? nt : function (t, e, r) {
      if (rt(t), e = K(e), rt(r), Z) try {
        return nt(t, e, r);
      } catch (n) {}
      if ("get" in r || "set" in r) throw TypeError("Accessors not supported");
      return "value" in r && (t[e] = r.value), t;
    }
  },
      ot = f ? function (t, e, r) {
    return it.f(t, e, d(1, r));
  } : function (t, e, r) {
    return t[e] = r, t;
  },
      at = Function.toString;

  "function" != typeof j.inspectSource && (j.inspectSource = function (t) {
    return at.call(t);
  });

  var ut,
      st,
      ct,
      lt = j.inspectSource,
      ft = c.WeakMap,
      ht = "function" == typeof ft && /native code/.test(lt(ft)),
      vt = L("keys"),
      pt = function pt(t) {
    return vt[t] || (vt[t] = V(t));
  },
      dt = {},
      gt = c.WeakMap;

  if (ht || j.state) {
    var yt = j.state || (j.state = new gt()),
        bt = yt.get,
        mt = yt.has,
        Tt = yt.set;
    ut = function ut(t, e) {
      if (mt.call(yt, t)) throw new TypeError("Object already initialized");
      return e.facade = t, Tt.call(yt, t, e), e;
    }, st = function st(t) {
      return bt.call(yt, t) || {};
    }, ct = function ct(t) {
      return mt.call(yt, t);
    };
  } else {
    var xt = pt("state");
    dt[xt] = !0, ut = function ut(t, e) {
      if (B(t, xt)) throw new TypeError("Object already initialized");
      return e.facade = t, ot(t, xt, e), e;
    }, st = function st(t) {
      return B(t, xt) ? t[xt] : {};
    }, ct = function ct(t) {
      return B(t, xt);
    };
  }

  var At = {
    set: ut,
    get: st,
    has: ct,
    enforce: function enforce(t) {
      return ct(t) ? st(t) : ut(t, {});
    },
    getterFor: function getterFor(t) {
      return function (e) {
        var r;
        if (!A(e) || (r = st(e)).type !== t) throw TypeError("Incompatible receiver, " + t + " required");
        return r;
      };
    }
  },
      wt = o(function (t) {
    var e = At.get,
        r = At.enforce,
        n = String(String).split("String");
    (t.exports = function (t, e, i, o) {
      var a,
          u = !!o && !!o.unsafe,
          s = !!o && !!o.enumerable,
          l = !!o && !!o.noTargetGet;
      "function" == typeof i && ("string" != typeof e || B(i, "name") || ot(i, "name", e), (a = r(i)).source || (a.source = n.join("string" == typeof e ? e : ""))), t !== c ? (u ? !l && t[e] && (s = !0) : delete t[e], s ? t[e] = i : ot(t, e, i)) : s ? t[e] = i : U(e, i);
    })(Function.prototype, "toString", function () {
      return "function" == typeof this && e(this).source || lt(this);
    });
  }),
      Et = Math.ceil,
      St = Math.floor,
      Ct = function Ct(t) {
    return isNaN(t = +t) ? 0 : (t > 0 ? St : Et)(t);
  },
      Ot = Math.min,
      Rt = function Rt(t) {
    return t > 0 ? Ot(Ct(t), 9007199254740991) : 0;
  },
      It = Math.max,
      _t = Math.min,
      Pt = function Pt(t, e) {
    var r = Ct(t);
    return r < 0 ? It(r + e, 0) : _t(r, e);
  },
      kt = function kt(t) {
    return function (e, r, n) {
      var i,
          o = x(e),
          a = Rt(o.length),
          u = Pt(n, a);

      if (t && r != r) {
        for (; a > u;) {
          if ((i = o[u++]) != i) return !0;
        }
      } else for (; a > u; u++) {
        if ((t || u in o) && o[u] === r) return t || u || 0;
      }

      return !t && -1;
    };
  },
      Dt = {
    includes: kt(!0),
    indexOf: kt(!1)
  },
      Ut = Dt.indexOf,
      jt = function jt(t, e) {
    var r,
        n = x(t),
        i = 0,
        o = [];

    for (r in n) {
      !B(dt, r) && B(n, r) && o.push(r);
    }

    for (; e.length > i;) {
      B(n, r = e[i++]) && (~Ut(o, r) || o.push(r));
    }

    return o;
  },
      Lt = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"],
      Mt = Lt.concat("length", "prototype"),
      Ft = {
    f: Object.getOwnPropertyNames || function (t) {
      return jt(t, Mt);
    }
  },
      Bt = {
    f: Object.getOwnPropertySymbols
  },
      Nt = E("Reflect", "ownKeys") || function (t) {
    var e = Ft.f(rt(t)),
        r = Bt.f;
    return r ? e.concat(r(t)) : e;
  },
      Yt = function Yt(t, e) {
    for (var r = Nt(e), n = it.f, i = et.f, o = 0; o < r.length; o++) {
      var a = r[o];
      B(t, a) || n(t, a, i(e, a));
    }
  },
      Vt = /#|\.prototype\./,
      Wt = function Wt(t, e) {
    var r = zt[Gt(t)];
    return r == Xt || r != $t && ("function" == typeof e ? l(e) : !!e);
  },
      Gt = Wt.normalize = function (t) {
    return String(t).replace(Vt, ".").toLowerCase();
  },
      zt = Wt.data = {},
      $t = Wt.NATIVE = "N",
      Xt = Wt.POLYFILL = "P",
      Ht = Wt,
      Kt = et.f,
      qt = function qt(t, e) {
    var r,
        n,
        i,
        o,
        a,
        u = t.target,
        s = t.global,
        l = t.stat;
    if (r = s ? c : l ? c[u] || U(u, {}) : (c[u] || {}).prototype) for (n in e) {
      if (o = e[n], i = t.noTargetGet ? (a = Kt(r, n)) && a.value : r[n], !Ht(s ? n : u + (l ? "." : "#") + n, t.forced) && void 0 !== i) {
        if (_typeof(o) == _typeof(i)) continue;
        Yt(o, i);
      }
      (t.sham || i && i.sham) && ot(o, "sham", !0), wt(r, n, o, t);
    }
  },
      Jt = function Jt(t) {
    if ("function" != typeof t) throw TypeError(String(t) + " is not a function");
    return t;
  },
      Qt = function Qt(t, e, r) {
    if (Jt(t), void 0 === e) return t;

    switch (r) {
      case 0:
        return function () {
          return t.call(e);
        };

      case 1:
        return function (r) {
          return t.call(e, r);
        };

      case 2:
        return function (r, n) {
          return t.call(e, r, n);
        };

      case 3:
        return function (r, n, i) {
          return t.call(e, r, n, i);
        };
    }

    return function () {
      return t.apply(e, arguments);
    };
  },
      Zt = Array.isArray || function (t) {
    return "Array" == y(t);
  },
      te = $("species"),
      ee = function ee(t, e) {
    return new (function (t) {
      var e;
      return Zt(t) && ("function" != typeof (e = t.constructor) || e !== Array && !Zt(e.prototype) ? A(e) && null === (e = e[te]) && (e = void 0) : e = void 0), void 0 === e ? Array : e;
    }(t))(0 === e ? 0 : e);
  },
      re = [].push,
      ne = function ne(t) {
    var e = 1 == t,
        r = 2 == t,
        n = 3 == t,
        i = 4 == t,
        o = 6 == t,
        a = 7 == t,
        u = 5 == t || o;
    return function (s, c, l, f) {
      for (var h, v, p = M(s), d = m(p), g = Qt(c, l, 3), y = Rt(d.length), b = 0, T = f || ee, x = e ? T(s, y) : r || a ? T(s, 0) : void 0; y > b; b++) {
        if ((u || b in d) && (v = g(h = d[b], b, p), t)) if (e) x[b] = v;else if (v) switch (t) {
          case 3:
            return !0;

          case 5:
            return h;

          case 6:
            return b;

          case 2:
            re.call(x, h);
        } else switch (t) {
          case 4:
            return !1;

          case 7:
            re.call(x, h);
        }
      }

      return o ? -1 : n || i ? i : x;
    };
  },
      ie = {
    forEach: ne(0),
    map: ne(1),
    filter: ne(2),
    some: ne(3),
    every: ne(4),
    find: ne(5),
    findIndex: ne(6),
    filterReject: ne(7)
  },
      oe = $("species"),
      ae = ie.filter,
      ue = function (t) {
    return _ >= 51 || !l(function () {
      var e = [];
      return (e.constructor = {})[oe] = function () {
        return {
          foo: 1
        };
      }, 1 !== e[t](Boolean).foo;
    });
  }("filter");

  qt({
    target: "Array",
    proto: !0,
    forced: !ue
  }, {
    filter: function filter(t) {
      return ae(this, t, arguments.length > 1 ? arguments[1] : void 0);
    }
  });
  var se = Date.prototype,
      ce = se.toString,
      le = se.getTime;
  "Invalid Date" != String(new Date(NaN)) && wt(se, "toString", function () {
    var t = le.call(this);
    return t == t ? ce.call(this) : "Invalid Date";
  });

  var fe = [].slice,
      he = {},
      ve = function ve(t, e, r) {
    if (!(e in he)) {
      for (var n = [], i = 0; i < e; i++) {
        n[i] = "a[" + i + "]";
      }

      he[e] = Function("C,a", "return new C(" + n.join(",") + ")");
    }

    return he[e](t, r);
  },
      pe = Function.bind || function (t) {
    var e = Jt(this),
        r = fe.call(arguments, 1),
        n = function n() {
      var i = r.concat(fe.call(arguments));
      return this instanceof n ? ve(e, i.length, i) : e.apply(t, i);
    };

    return A(e.prototype) && (n.prototype = e.prototype), n;
  };

  qt({
    target: "Function",
    proto: !0
  }, {
    bind: pe
  });

  var de = [].slice,
      ge = /MSIE .\./.test(S),
      ye = function ye(t) {
    return function (e, r) {
      var n = arguments.length > 2,
          i = n ? de.call(arguments, 2) : void 0;
      return t(n ? function () {
        ("function" == typeof e ? e : Function(e)).apply(this, i);
      } : e, r);
    };
  };

  qt({
    global: !0,
    bind: !0,
    forced: ge
  }, {
    setTimeout: ye(c.setTimeout),
    setInterval: ye(c.setInterval)
  });

  var be,
      me = Object.keys || function (t) {
    return jt(t, Lt);
  },
      Te = f ? Object.defineProperties : function (t, e) {
    rt(t);

    for (var r, n = me(e), i = n.length, o = 0; i > o;) {
      it.f(t, r = n[o++], e[r]);
    }

    return t;
  },
      xe = E("document", "documentElement"),
      Ae = pt("IE_PROTO"),
      we = function we() {},
      Ee = function Ee(t) {
    return "<script>" + t + "</script>";
  },
      Se = function Se(t) {
    t.write(Ee("")), t.close();
    var e = t.parentWindow.Object;
    return t = null, e;
  },
      _Ce = function Ce() {
    try {
      be = new ActiveXObject("htmlfile");
    } catch (e) {}

    _Ce = document.domain && be ? Se(be) : function () {
      var t,
          e = Q("iframe");
      if (e.style) return e.style.display = "none", xe.appendChild(e), e.src = String("javascript:"), (t = e.contentWindow.document).open(), t.write(Ee("document.F=Object")), t.close(), t.F;
    }() || Se(be);

    for (var t = Lt.length; t--;) {
      delete _Ce.prototype[Lt[t]];
    }

    return _Ce();
  };

  dt[Ae] = !0;

  var Oe = Object.create || function (t, e) {
    var r;
    return null !== t ? (we.prototype = rt(t), r = new we(), we.prototype = null, r[Ae] = t) : r = _Ce(), void 0 === e ? r : Te(r, e);
  },
      Re = $("unscopables"),
      Ie = Array.prototype;

  null == Ie[Re] && it.f(Ie, Re, {
    configurable: !0,
    value: Oe(null)
  });

  var _e,
      Pe,
      ke,
      De = function De(t) {
    Ie[Re][t] = !0;
  },
      Ue = {},
      je = !l(function () {
    function t() {}

    return t.prototype.constructor = null, Object.getPrototypeOf(new t()) !== t.prototype;
  }),
      Le = pt("IE_PROTO"),
      Me = Object.prototype,
      Fe = je ? Object.getPrototypeOf : function (t) {
    return t = M(t), B(t, Le) ? t[Le] : "function" == typeof t.constructor && t instanceof t.constructor ? t.constructor.prototype : t instanceof Object ? Me : null;
  },
      Be = $("iterator"),
      Ne = !1;

  [].keys && ("next" in (ke = [].keys()) ? (Pe = Fe(Fe(ke))) !== Object.prototype && (_e = Pe) : Ne = !0), (null == _e || l(function () {
    var t = {};
    return _e[Be].call(t) !== t;
  })) && (_e = {}), B(_e, Be) || ot(_e, Be, function () {
    return this;
  });

  var Ye = {
    IteratorPrototype: _e,
    BUGGY_SAFARI_ITERATORS: Ne
  },
      Ve = it.f,
      We = $("toStringTag"),
      Ge = function Ge(t, e, r) {
    t && !B(t = r ? t : t.prototype, We) && Ve(t, We, {
      configurable: !0,
      value: e
    });
  },
      ze = Ye.IteratorPrototype,
      $e = function $e() {
    return this;
  },
      Xe = Object.setPrototypeOf || ("__proto__" in {} ? function () {
    var t,
        e = !1,
        r = {};

    try {
      ;
      (t = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set).call(r, []), e = r instanceof Array;
    } catch (n) {}

    return function (r, n) {
      return rt(r), function (t) {
        if (!A(t) && null !== t) throw TypeError("Can't set " + String(t) + " as a prototype");
      }(n), e ? t.call(r, n) : r.__proto__ = n, r;
    };
  }() : void 0),
      He = Ye.IteratorPrototype,
      Ke = Ye.BUGGY_SAFARI_ITERATORS,
      qe = $("iterator"),
      Je = function Je() {
    return this;
  },
      Qe = function Qe(t, e, r, n, i, o, a) {
    !function (t, e, r) {
      var n = e + " Iterator";
      t.prototype = Oe(ze, {
        next: d(1, r)
      }), Ge(t, n, !1), Ue[n] = $e;
    }(r, e, n);

    var u,
        s,
        c,
        l = function l(t) {
      if (t === i && g) return g;
      if (!Ke && t in v) return v[t];

      switch (t) {
        case "keys":
        case "values":
        case "entries":
          return function () {
            return new r(this, t);
          };
      }

      return function () {
        return new r(this);
      };
    },
        f = e + " Iterator",
        h = !1,
        v = t.prototype,
        p = v[qe] || v["@@iterator"] || i && v[i],
        g = !Ke && p || l(i),
        y = "Array" == e && v.entries || p;

    if (y && (u = Fe(y.call(new t())), He !== Object.prototype && u.next && (Fe(u) !== He && (Xe ? Xe(u, He) : "function" != typeof u[qe] && ot(u, qe, Je)), Ge(u, f, !0))), "values" == i && p && "values" !== p.name && (h = !0, g = function g() {
      return p.call(this);
    }), v[qe] !== g && ot(v, qe, g), Ue[e] = g, i) if (s = {
      values: l("values"),
      keys: o ? g : l("keys"),
      entries: l("entries")
    }, a) for (c in s) {
      (Ke || h || !(c in v)) && wt(v, c, s[c]);
    } else qt({
      target: e,
      proto: !0,
      forced: Ke || h
    }, s);
    return s;
  },
      Ze = At.set,
      tr = At.getterFor("Array Iterator"),
      er = Qe(Array, "Array", function (t, e) {
    Ze(this, {
      type: "Array Iterator",
      target: x(t),
      index: 0,
      kind: e
    });
  }, function () {
    var t = tr(this),
        e = t.target,
        r = t.kind,
        n = t.index++;
    return !e || n >= e.length ? (t.target = void 0, {
      value: void 0,
      done: !0
    }) : "keys" == r ? {
      value: n,
      done: !1
    } : "values" == r ? {
      value: e[n],
      done: !1
    } : {
      value: [n, e[n]],
      done: !1
    };
  }, "values");

  Ue.Arguments = Ue.Array, De("keys"), De("values"), De("entries");

  var rr = Ft.f,
      nr = {}.toString,
      ir = "object" == (typeof window === "undefined" ? "undefined" : _typeof(window)) && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [],
      or = {
    f: function f(t) {
      return ir && "[object Window]" == nr.call(t) ? function (t) {
        try {
          return rr(t);
        } catch (e) {
          return ir.slice();
        }
      }(t) : rr(x(t));
    }
  },
      ar = !l(function () {
    return Object.isExtensible(Object.preventExtensions({}));
  }),
      ur = o(function (t) {
    var e = it.f,
        r = !1,
        n = V("meta"),
        i = 0,
        o = Object.isExtensible || function () {
      return !0;
    },
        a = function a(t) {
      e(t, n, {
        value: {
          objectID: "O" + i++,
          weakData: {}
        }
      });
    },
        u = t.exports = {
      enable: function enable() {
        u.enable = function () {}, r = !0;
        var t = Ft.f,
            e = [].splice,
            i = {};
        i[n] = 1, t(i).length && (Ft.f = function (r) {
          for (var i = t(r), o = 0, a = i.length; o < a; o++) {
            if (i[o] === n) {
              e.call(i, o, 1);
              break;
            }
          }

          return i;
        }, qt({
          target: "Object",
          stat: !0,
          forced: !0
        }, {
          getOwnPropertyNames: or.f
        }));
      },
      fastKey: function fastKey(t, e) {
        if (!A(t)) return "symbol" == _typeof(t) ? t : ("string" == typeof t ? "S" : "P") + t;

        if (!B(t, n)) {
          if (!o(t)) return "F";
          if (!e) return "E";
          a(t);
        }

        return t[n].objectID;
      },
      getWeakData: function getWeakData(t, e) {
        if (!B(t, n)) {
          if (!o(t)) return !0;
          if (!e) return !1;
          a(t);
        }

        return t[n].weakData;
      },
      onFreeze: function onFreeze(t) {
        return ar && r && o(t) && !B(t, n) && a(t), t;
      }
    };

    dt[n] = !0;
  }),
      sr = (ur.enable, ur.fastKey, ur.getWeakData, ur.onFreeze, $("iterator")),
      cr = Array.prototype,
      lr = function lr(t) {
    return void 0 !== t && (Ue.Array === t || cr[sr] === t);
  },
      fr = {};

  fr[$("toStringTag")] = "z";

  var hr = "[object z]" === String(fr),
      vr = $("toStringTag"),
      pr = "Arguments" == y(function () {
    return arguments;
  }()),
      dr = hr ? y : function (t) {
    var e, r, n;
    return void 0 === t ? "Undefined" : null === t ? "Null" : "string" == typeof (r = function (t, e) {
      try {
        return t[e];
      } catch (r) {}
    }(e = Object(t), vr)) ? r : pr ? y(e) : "Object" == (n = y(e)) && "function" == typeof e.callee ? "Arguments" : n;
  },
      gr = $("iterator"),
      yr = function yr(t) {
    if (null != t) return t[gr] || t["@@iterator"] || Ue[dr(t)];
  },
      br = function br(t) {
    var e = t["return"];
    if (void 0 !== e) return rt(e.call(t)).value;
  },
      mr = function mr(t, e) {
    this.stopped = t, this.result = e;
  },
      Tr = function Tr(t, e, r) {
    var n,
        i,
        o,
        a,
        u,
        s,
        c,
        l = r && r.that,
        f = !(!r || !r.AS_ENTRIES),
        h = !(!r || !r.IS_ITERATOR),
        v = !(!r || !r.INTERRUPTED),
        p = Qt(e, l, 1 + f + v),
        d = function d(t) {
      return n && br(n), new mr(!0, t);
    },
        g = function g(t) {
      return f ? (rt(t), v ? p(t[0], t[1], d) : p(t[0], t[1])) : v ? p(t, d) : p(t);
    };

    if (h) n = t;else {
      if ("function" != typeof (i = yr(t))) throw TypeError("Target is not iterable");

      if (lr(i)) {
        for (o = 0, a = Rt(t.length); a > o; o++) {
          if ((u = g(t[o])) && u instanceof mr) return u;
        }

        return new mr(!1);
      }

      n = i.call(t);
    }

    for (s = n.next; !(c = s.call(n)).done;) {
      try {
        u = g(c.value);
      } catch (y) {
        throw br(n), y;
      }

      if ("object" == _typeof(u) && u && u instanceof mr) return u;
    }

    return new mr(!1);
  },
      xr = function xr(t, e, r) {
    if (!(t instanceof e)) throw TypeError("Incorrect " + (r ? r + " " : "") + "invocation");
    return t;
  },
      Ar = $("iterator"),
      wr = !1;

  try {
    var Er = 0,
        Sr = {
      next: function next() {
        return {
          done: !!Er++
        };
      },
      "return": function _return() {
        wr = !0;
      }
    };
    Sr[Ar] = function () {
      return this;
    }, Array.from(Sr, function () {
      throw 2;
    });
  } catch (Ja) {}

  var Cr = function Cr(t, e) {
    if (!e && !wr) return !1;
    var r = !1;

    try {
      var n = {};
      n[Ar] = function () {
        return {
          next: function next() {
            return {
              done: r = !0
            };
          }
        };
      }, t(n);
    } catch (Ja) {}

    return r;
  },
      Or = function Or(t, e, r) {
    var n, i;
    return Xe && "function" == typeof (n = e.constructor) && n !== r && A(i = n.prototype) && i !== r.prototype && Xe(t, i), t;
  },
      Rr = function Rr(t, e, r) {
    for (var n in e) {
      wt(t, n, e[n], r);
    }

    return t;
  },
      Ir = $("species"),
      _r = function _r(t) {
    var e = E(t),
        r = it.f;
    f && e && !e[Ir] && r(e, Ir, {
      configurable: !0,
      get: function get() {
        return this;
      }
    });
  },
      Pr = it.f,
      kr = ur.fastKey,
      Dr = At.set,
      Ur = At.getterFor,
      jr = (function (t, e, r) {
    var n = -1 !== t.indexOf("Map"),
        i = -1 !== t.indexOf("Weak"),
        o = n ? "set" : "add",
        a = c[t],
        u = a && a.prototype,
        s = a,
        f = {},
        h = function h(t) {
      var e = u[t];
      wt(u, t, "add" == t ? function (t) {
        return e.call(this, 0 === t ? 0 : t), this;
      } : "delete" == t ? function (t) {
        return !(i && !A(t)) && e.call(this, 0 === t ? 0 : t);
      } : "get" == t ? function (t) {
        return i && !A(t) ? void 0 : e.call(this, 0 === t ? 0 : t);
      } : "has" == t ? function (t) {
        return !(i && !A(t)) && e.call(this, 0 === t ? 0 : t);
      } : function (t, r) {
        return e.call(this, 0 === t ? 0 : t, r), this;
      });
    };

    if (Ht(t, "function" != typeof a || !(i || u.forEach && !l(function () {
      new a().entries().next();
    })))) s = r.getConstructor(e, t, n, o), ur.enable();else if (Ht(t, !0)) {
      var v = new s(),
          p = v[o](i ? {} : -0, 1) != v,
          d = l(function () {
        v.has(1);
      }),
          g = Cr(function (t) {
        new a(t);
      }),
          y = !i && l(function () {
        for (var t = new a(), e = 5; e--;) {
          t[o](e, e);
        }

        return !t.has(-0);
      });
      g || ((s = e(function (e, r) {
        xr(e, s, t);
        var i = Or(new a(), e, s);
        return null != r && Tr(r, i[o], {
          that: i,
          AS_ENTRIES: n
        }), i;
      })).prototype = u, u.constructor = s), (d || y) && (h("delete"), h("has"), n && h("get")), (y || p) && h(o), i && u.clear && delete u.clear;
    }
    f[t] = s, qt({
      global: !0,
      forced: s != a
    }, f), Ge(s, t), i || r.setStrong(s, t, n);
  }("Map", function (t) {
    return function () {
      return t(this, arguments.length ? arguments[0] : void 0);
    };
  }, {
    getConstructor: function getConstructor(t, e, r, n) {
      var i = t(function (t, o) {
        xr(t, i, e), Dr(t, {
          type: e,
          index: Oe(null),
          first: void 0,
          last: void 0,
          size: 0
        }), f || (t.size = 0), null != o && Tr(o, t[n], {
          that: t,
          AS_ENTRIES: r
        });
      }),
          o = Ur(e),
          a = function a(t, e, r) {
        var n,
            i,
            a = o(t),
            s = u(t, e);
        return s ? s.value = r : (a.last = s = {
          index: i = kr(e, !0),
          key: e,
          value: r,
          previous: n = a.last,
          next: void 0,
          removed: !1
        }, a.first || (a.first = s), n && (n.next = s), f ? a.size++ : t.size++, "F" !== i && (a.index[i] = s)), t;
      },
          u = function u(t, e) {
        var r,
            n = o(t),
            i = kr(e);
        if ("F" !== i) return n.index[i];

        for (r = n.first; r; r = r.next) {
          if (r.key == e) return r;
        }
      };

      return Rr(i.prototype, {
        clear: function clear() {
          for (var t = o(this), e = t.index, r = t.first; r;) {
            r.removed = !0, r.previous && (r.previous = r.previous.next = void 0), delete e[r.index], r = r.next;
          }

          t.first = t.last = void 0, f ? t.size = 0 : this.size = 0;
        },
        "delete": function _delete(t) {
          var e = o(this),
              r = u(this, t);

          if (r) {
            var n = r.next,
                i = r.previous;
            delete e.index[r.index], r.removed = !0, i && (i.next = n), n && (n.previous = i), e.first == r && (e.first = n), e.last == r && (e.last = i), f ? e.size-- : this.size--;
          }

          return !!r;
        },
        forEach: function forEach(t) {
          for (var e, r = o(this), n = Qt(t, arguments.length > 1 ? arguments[1] : void 0, 3); e = e ? e.next : r.first;) {
            for (n(e.value, e.key, this); e && e.removed;) {
              e = e.previous;
            }
          }
        },
        has: function has(t) {
          return !!u(this, t);
        }
      }), Rr(i.prototype, r ? {
        get: function get(t) {
          var e = u(this, t);
          return e && e.value;
        },
        set: function set(t, e) {
          return a(this, 0 === t ? 0 : t, e);
        }
      } : {
        add: function add(t) {
          return a(this, t = 0 === t ? 0 : t, t);
        }
      }), f && Pr(i.prototype, "size", {
        get: function get() {
          return o(this).size;
        }
      }), i;
    },
    setStrong: function setStrong(t, e, r) {
      var n = e + " Iterator",
          i = Ur(e),
          o = Ur(n);
      Qe(t, e, function (t, e) {
        Dr(this, {
          type: n,
          target: t,
          state: i(t),
          kind: e,
          last: void 0
        });
      }, function () {
        for (var t = o(this), e = t.kind, r = t.last; r && r.removed;) {
          r = r.previous;
        }

        return t.target && (t.last = r = r ? r.next : t.state.first) ? "keys" == e ? {
          value: r.key,
          done: !1
        } : "values" == e ? {
          value: r.value,
          done: !1
        } : {
          value: [r.key, r.value],
          done: !1
        } : (t.target = void 0, {
          value: void 0,
          done: !0
        });
      }, r ? "entries" : "values", !r, !0), _r(e);
    }
  }), hr ? {}.toString : function () {
    return "[object " + dr(this) + "]";
  });

  hr || wt(Object.prototype, "toString", jr, {
    unsafe: !0
  });

  var Lr = function Lr(t) {
    if (D(t)) throw TypeError("Cannot convert a Symbol value to a string");
    return String(t);
  },
      Mr = function Mr(t) {
    return function (e, r) {
      var n,
          i,
          o = Lr(T(e)),
          a = Ct(r),
          u = o.length;
      return a < 0 || a >= u ? t ? "" : void 0 : (n = o.charCodeAt(a)) < 55296 || n > 56319 || a + 1 === u || (i = o.charCodeAt(a + 1)) < 56320 || i > 57343 ? t ? o.charAt(a) : n : t ? o.slice(a, a + 2) : i - 56320 + (n - 55296 << 10) + 65536;
    };
  },
      Fr = {
    codeAt: Mr(!1),
    charAt: Mr(!0)
  },
      Br = Fr.charAt,
      Nr = At.set,
      Yr = At.getterFor("String Iterator");

  Qe(String, "String", function (t) {
    Nr(this, {
      type: "String Iterator",
      string: Lr(t),
      index: 0
    });
  }, function () {
    var t,
        e = Yr(this),
        r = e.string,
        n = e.index;
    return n >= r.length ? {
      value: void 0,
      done: !0
    } : (t = Br(r, n), e.index += t.length, {
      value: t,
      done: !1
    });
  });
  var Vr = {
    CSSRuleList: 0,
    CSSStyleDeclaration: 0,
    CSSValueList: 0,
    ClientRectList: 0,
    DOMRectList: 0,
    DOMStringList: 0,
    DOMTokenList: 1,
    DataTransferItemList: 0,
    FileList: 0,
    HTMLAllCollection: 0,
    HTMLCollection: 0,
    HTMLFormElement: 0,
    HTMLSelectElement: 0,
    MediaList: 0,
    MimeTypeArray: 0,
    NamedNodeMap: 0,
    NodeList: 1,
    PaintRequestList: 0,
    Plugin: 0,
    PluginArray: 0,
    SVGLengthList: 0,
    SVGNumberList: 0,
    SVGPathSegList: 0,
    SVGPointList: 0,
    SVGStringList: 0,
    SVGTransformList: 0,
    SourceBufferList: 0,
    StyleSheetList: 0,
    TextTrackCueList: 0,
    TextTrackList: 0,
    TouchList: 0
  },
      Wr = $("iterator"),
      Gr = $("toStringTag"),
      zr = er.values;

  for (var $r in Vr) {
    var Xr = c[$r],
        Hr = Xr && Xr.prototype;

    if (Hr) {
      if (Hr[Wr] !== zr) try {
        ot(Hr, Wr, zr);
      } catch (Ja) {
        Hr[Wr] = zr;
      }
      if (Hr[Gr] || ot(Hr, Gr, $r), Vr[$r]) for (var Kr in er) {
        if (Hr[Kr] !== er[Kr]) try {
          ot(Hr, Kr, er[Kr]);
        } catch (Ja) {
          Hr[Kr] = er[Kr];
        }
      }
    }
  }

  var qr = "undefined" != typeof ArrayBuffer && "undefined" != typeof DataView,
      Jr = function Jr(t) {
    if (void 0 === t) return 0;
    var e = Ct(t),
        r = Rt(e);
    if (e !== r) throw RangeError("Wrong length or index");
    return r;
  },
      Qr = Math.abs,
      Zr = Math.pow,
      tn = Math.floor,
      en = Math.log,
      rn = Math.LN2,
      nn = function nn(t, e, r) {
    var n,
        i,
        o,
        a = new Array(r),
        u = 8 * r - e - 1,
        s = (1 << u) - 1,
        c = s >> 1,
        l = 23 === e ? Zr(2, -24) - Zr(2, -77) : 0,
        f = t < 0 || 0 === t && 1 / t < 0 ? 1 : 0,
        h = 0;

    for ((t = Qr(t)) != t || Infinity === t ? (i = t != t ? 1 : 0, n = s) : (n = tn(en(t) / rn), t * (o = Zr(2, -n)) < 1 && (n--, o *= 2), (t += n + c >= 1 ? l / o : l * Zr(2, 1 - c)) * o >= 2 && (n++, o /= 2), n + c >= s ? (i = 0, n = s) : n + c >= 1 ? (i = (t * o - 1) * Zr(2, e), n += c) : (i = t * Zr(2, c - 1) * Zr(2, e), n = 0)); e >= 8; a[h++] = 255 & i, i /= 256, e -= 8) {
    }

    for (n = n << e | i, u += e; u > 0; a[h++] = 255 & n, n /= 256, u -= 8) {
    }

    return a[--h] |= 128 * f, a;
  },
      on = function on(t, e) {
    var r,
        n = t.length,
        i = 8 * n - e - 1,
        o = (1 << i) - 1,
        a = o >> 1,
        u = i - 7,
        s = n - 1,
        c = t[s--],
        l = 127 & c;

    for (c >>= 7; u > 0; l = 256 * l + t[s], s--, u -= 8) {
    }

    for (r = l & (1 << -u) - 1, l >>= -u, u += e; u > 0; r = 256 * r + t[s], s--, u -= 8) {
    }

    if (0 === l) l = 1 - a;else {
      if (l === o) return r ? NaN : c ? -Infinity : Infinity;
      r += Zr(2, e), l -= a;
    }
    return (c ? -1 : 1) * r * Zr(2, l - e);
  },
      an = function an(t) {
    for (var e = M(this), r = Rt(e.length), n = arguments.length, i = Pt(n > 1 ? arguments[1] : void 0, r), o = n > 2 ? arguments[2] : void 0, a = void 0 === o ? r : Pt(o, r); a > i;) {
      e[i++] = t;
    }

    return e;
  },
      un = Ft.f,
      sn = it.f,
      cn = At.get,
      ln = At.set,
      fn = c.ArrayBuffer,
      _hn2 = fn,
      _vn = c.DataView,
      pn = _vn && _vn.prototype,
      dn = Object.prototype,
      gn = c.RangeError,
      yn = nn,
      bn = on,
      mn = function mn(t) {
    return [255 & t];
  },
      Tn = function Tn(t) {
    return [255 & t, t >> 8 & 255];
  },
      xn = function xn(t) {
    return [255 & t, t >> 8 & 255, t >> 16 & 255, t >> 24 & 255];
  },
      An = function An(t) {
    return t[3] << 24 | t[2] << 16 | t[1] << 8 | t[0];
  },
      wn = function wn(t) {
    return yn(t, 23, 4);
  },
      En = function En(t) {
    return yn(t, 52, 8);
  },
      Sn = function Sn(t, e) {
    sn(t.prototype, e, {
      get: function get() {
        return cn(this)[e];
      }
    });
  },
      Cn = function Cn(t, e, r, n) {
    var i = Jr(r),
        o = cn(t);
    if (i + e > o.byteLength) throw gn("Wrong index");
    var a = cn(o.buffer).bytes,
        u = i + o.byteOffset,
        s = a.slice(u, u + e);
    return n ? s : s.reverse();
  },
      On = function On(t, e, r, n, i, o) {
    var a = Jr(r),
        u = cn(t);
    if (a + e > u.byteLength) throw gn("Wrong index");

    for (var s = cn(u.buffer).bytes, c = a + u.byteOffset, l = n(+i), f = 0; f < e; f++) {
      s[c + f] = l[o ? f : e - f - 1];
    }
  };

  if (qr) {
    if (!l(function () {
      fn(1);
    }) || !l(function () {
      new fn(-1);
    }) || l(function () {
      return new fn(), new fn(1.5), new fn(NaN), "ArrayBuffer" != fn.name;
    })) {
      for (var Rn, In = (_hn2 = function hn(t) {
        return xr(this, _hn2), new fn(Jr(t));
      }).prototype = fn.prototype, _n = un(fn), Pn = 0; _n.length > Pn;) {
        (Rn = _n[Pn++]) in _hn2 || ot(_hn2, Rn, fn[Rn]);
      }

      In.constructor = _hn2;
    }

    Xe && Fe(pn) !== dn && Xe(pn, dn);
    var kn = new _vn(new _hn2(2)),
        Dn = pn.setInt8;
    kn.setInt8(0, 2147483648), kn.setInt8(1, 2147483649), !kn.getInt8(0) && kn.getInt8(1) || Rr(pn, {
      setInt8: function setInt8(t, e) {
        Dn.call(this, t, e << 24 >> 24);
      },
      setUint8: function setUint8(t, e) {
        Dn.call(this, t, e << 24 >> 24);
      }
    }, {
      unsafe: !0
    });
  } else _hn2 = function _hn(t) {
    xr(this, _hn2, "ArrayBuffer");
    var e = Jr(t);
    ln(this, {
      bytes: an.call(new Array(e), 0),
      byteLength: e
    }), f || (this.byteLength = e);
  }, _vn = function vn(t, e, r) {
    xr(this, _vn, "DataView"), xr(t, _hn2, "DataView");
    var n = cn(t).byteLength,
        i = Ct(e);
    if (i < 0 || i > n) throw gn("Wrong offset");
    if (i + (r = void 0 === r ? n - i : Rt(r)) > n) throw gn("Wrong length");
    ln(this, {
      buffer: t,
      byteLength: r,
      byteOffset: i
    }), f || (this.buffer = t, this.byteLength = r, this.byteOffset = i);
  }, f && (Sn(_hn2, "byteLength"), Sn(_vn, "buffer"), Sn(_vn, "byteLength"), Sn(_vn, "byteOffset")), Rr(_vn.prototype, {
    getInt8: function getInt8(t) {
      return Cn(this, 1, t)[0] << 24 >> 24;
    },
    getUint8: function getUint8(t) {
      return Cn(this, 1, t)[0];
    },
    getInt16: function getInt16(t) {
      var e = Cn(this, 2, t, arguments.length > 1 ? arguments[1] : void 0);
      return (e[1] << 8 | e[0]) << 16 >> 16;
    },
    getUint16: function getUint16(t) {
      var e = Cn(this, 2, t, arguments.length > 1 ? arguments[1] : void 0);
      return e[1] << 8 | e[0];
    },
    getInt32: function getInt32(t) {
      return An(Cn(this, 4, t, arguments.length > 1 ? arguments[1] : void 0));
    },
    getUint32: function getUint32(t) {
      return An(Cn(this, 4, t, arguments.length > 1 ? arguments[1] : void 0)) >>> 0;
    },
    getFloat32: function getFloat32(t) {
      return bn(Cn(this, 4, t, arguments.length > 1 ? arguments[1] : void 0), 23);
    },
    getFloat64: function getFloat64(t) {
      return bn(Cn(this, 8, t, arguments.length > 1 ? arguments[1] : void 0), 52);
    },
    setInt8: function setInt8(t, e) {
      On(this, 1, t, mn, e);
    },
    setUint8: function setUint8(t, e) {
      On(this, 1, t, mn, e);
    },
    setInt16: function setInt16(t, e) {
      On(this, 2, t, Tn, e, arguments.length > 2 ? arguments[2] : void 0);
    },
    setUint16: function setUint16(t, e) {
      On(this, 2, t, Tn, e, arguments.length > 2 ? arguments[2] : void 0);
    },
    setInt32: function setInt32(t, e) {
      On(this, 4, t, xn, e, arguments.length > 2 ? arguments[2] : void 0);
    },
    setUint32: function setUint32(t, e) {
      On(this, 4, t, xn, e, arguments.length > 2 ? arguments[2] : void 0);
    },
    setFloat32: function setFloat32(t, e) {
      On(this, 4, t, wn, e, arguments.length > 2 ? arguments[2] : void 0);
    },
    setFloat64: function setFloat64(t, e) {
      On(this, 8, t, En, e, arguments.length > 2 ? arguments[2] : void 0);
    }
  });

  Ge(_hn2, "ArrayBuffer"), Ge(_vn, "DataView");

  var Un = {
    ArrayBuffer: _hn2,
    DataView: _vn
  },
      jn = $("species"),
      Ln = function Ln(t, e) {
    var r,
        n = rt(t).constructor;
    return void 0 === n || null == (r = rt(n)[jn]) ? e : Jt(r);
  },
      Mn = Un.ArrayBuffer,
      Fn = Un.DataView,
      Bn = Mn.prototype.slice,
      Nn = l(function () {
    return !new Mn(2).slice(1, void 0).byteLength;
  });

  qt({
    target: "ArrayBuffer",
    proto: !0,
    unsafe: !0,
    forced: Nn
  }, {
    slice: function slice(t, e) {
      if (void 0 !== Bn && void 0 === e) return Bn.call(rt(this), t);

      for (var r = rt(this).byteLength, n = Pt(t, r), i = Pt(void 0 === e ? r : e, r), o = new (Ln(this, Mn))(Rt(i - n)), a = new Fn(this), u = new Fn(o), s = 0; n < i;) {
        u.setUint8(s++, a.getUint8(n++));
      }

      return o;
    }
  });

  var Yn,
      Vn,
      Wn,
      Gn = it.f,
      zn = c.Int8Array,
      $n = zn && zn.prototype,
      Xn = c.Uint8ClampedArray,
      Hn = Xn && Xn.prototype,
      Kn = zn && Fe(zn),
      qn = $n && Fe($n),
      Jn = Object.prototype,
      Qn = Jn.isPrototypeOf,
      Zn = $("toStringTag"),
      ti = V("TYPED_ARRAY_TAG"),
      ei = V("TYPED_ARRAY_CONSTRUCTOR"),
      ri = qr && !!Xe && "Opera" !== dr(c.opera),
      ni = !1,
      ii = {
    Int8Array: 1,
    Uint8Array: 1,
    Uint8ClampedArray: 1,
    Int16Array: 2,
    Uint16Array: 2,
    Int32Array: 4,
    Uint32Array: 4,
    Float32Array: 4,
    Float64Array: 8
  },
      oi = {
    BigInt64Array: 8,
    BigUint64Array: 8
  },
      ai = function ai(t) {
    if (!A(t)) return !1;
    var e = dr(t);
    return B(ii, e) || B(oi, e);
  };

  for (Yn in ii) {
    (Wn = (Vn = c[Yn]) && Vn.prototype) ? ot(Wn, ei, Vn) : ri = !1;
  }

  for (Yn in oi) {
    (Wn = (Vn = c[Yn]) && Vn.prototype) && ot(Wn, ei, Vn);
  }

  if ((!ri || "function" != typeof Kn || Kn === Function.prototype) && (Kn = function Kn() {
    throw TypeError("Incorrect invocation");
  }, ri)) for (Yn in ii) {
    c[Yn] && Xe(c[Yn], Kn);
  }
  if ((!ri || !qn || qn === Jn) && (qn = Kn.prototype, ri)) for (Yn in ii) {
    c[Yn] && Xe(c[Yn].prototype, qn);
  }
  if (ri && Fe(Hn) !== qn && Xe(Hn, qn), f && !B(qn, Zn)) for (Yn in ni = !0, Gn(qn, Zn, {
    get: function get() {
      return A(this) ? this[ti] : void 0;
    }
  }), ii) {
    c[Yn] && ot(c[Yn], ti, Yn);
  }

  var ui = {
    NATIVE_ARRAY_BUFFER_VIEWS: ri,
    TYPED_ARRAY_CONSTRUCTOR: ei,
    TYPED_ARRAY_TAG: ni && ti,
    aTypedArray: function aTypedArray(t) {
      if (ai(t)) return t;
      throw TypeError("Target is not a typed array");
    },
    aTypedArrayConstructor: function aTypedArrayConstructor(t) {
      if (Xe && !Qn.call(Kn, t)) throw TypeError("Target is not a typed array constructor");
      return t;
    },
    exportTypedArrayMethod: function exportTypedArrayMethod(t, e, r) {
      if (f) {
        if (r) for (var n in ii) {
          var i = c[n];
          if (i && B(i.prototype, t)) try {
            delete i.prototype[t];
          } catch (Ja) {}
        }
        qn[t] && !r || wt(qn, t, r ? e : ri && $n[t] || e);
      }
    },
    exportTypedArrayStaticMethod: function exportTypedArrayStaticMethod(t, e, r) {
      var n, i;

      if (f) {
        if (Xe) {
          if (r) for (n in ii) {
            if ((i = c[n]) && B(i, t)) try {
              delete i[t];
            } catch (Ja) {}
          }
          if (Kn[t] && !r) return;

          try {
            return wt(Kn, t, r ? e : ri && Kn[t] || e);
          } catch (Ja) {}
        }

        for (n in ii) {
          !(i = c[n]) || i[t] && !r || wt(i, t, e);
        }
      }
    },
    isView: function isView(t) {
      if (!A(t)) return !1;
      var e = dr(t);
      return "DataView" === e || B(ii, e) || B(oi, e);
    },
    isTypedArray: ai,
    TypedArray: Kn,
    TypedArrayPrototype: qn
  },
      si = ui.NATIVE_ARRAY_BUFFER_VIEWS,
      ci = c.ArrayBuffer,
      li = c.Int8Array,
      fi = !si || !l(function () {
    li(1);
  }) || !l(function () {
    new li(-1);
  }) || !Cr(function (t) {
    new li(), new li(null), new li(1.5), new li(t);
  }, !0) || l(function () {
    return 1 !== new li(new ci(2), 1, void 0).length;
  }),
      hi = Math.floor,
      vi = function vi(t, e) {
    var r = function (t) {
      var e = Ct(t);
      if (e < 0) throw RangeError("The argument can't be less than 0");
      return e;
    }(t);

    if (r % e) throw RangeError("Wrong offset");
    return r;
  },
      pi = ui.aTypedArrayConstructor,
      di = function di(t) {
    var e,
        r,
        n,
        i,
        o,
        a,
        u = M(t),
        s = arguments.length,
        c = s > 1 ? arguments[1] : void 0,
        l = void 0 !== c,
        f = yr(u);
    if (null != f && !lr(f)) for (a = (o = f.call(u)).next, u = []; !(i = a.call(o)).done;) {
      u.push(i.value);
    }

    for (l && s > 2 && (c = Qt(c, arguments[2], 2)), r = Rt(u.length), n = new (pi(this))(r), e = 0; r > e; e++) {
      n[e] = l ? c(u[e], e) : u[e];
    }

    return n;
  };

  o(function (t) {
    var e = Ft.f,
        r = ie.forEach,
        n = At.get,
        i = At.set,
        o = it.f,
        a = et.f,
        u = Math.round,
        s = c.RangeError,
        l = Un.ArrayBuffer,
        h = Un.DataView,
        v = ui.NATIVE_ARRAY_BUFFER_VIEWS,
        p = ui.TYPED_ARRAY_CONSTRUCTOR,
        g = ui.TYPED_ARRAY_TAG,
        y = ui.TypedArray,
        b = ui.TypedArrayPrototype,
        m = ui.aTypedArrayConstructor,
        T = ui.isTypedArray,
        x = function x(t, e) {
      for (var r = 0, n = e.length, i = new (m(t))(n); n > r;) {
        i[r] = e[r++];
      }

      return i;
    },
        w = function w(t, e) {
      o(t, e, {
        get: function get() {
          return n(this)[e];
        }
      });
    },
        E = function E(t) {
      var e;
      return t instanceof l || "ArrayBuffer" == (e = dr(t)) || "SharedArrayBuffer" == e;
    },
        S = function S(t, e) {
      return T(t) && !D(e) && e in t && !A(r = +e) && isFinite(r) && hi(r) === r && e >= 0;
      var r;
    },
        C = function C(t, e) {
      return e = K(e), S(t, e) ? d(2, t[e]) : a(t, e);
    },
        O = function O(t, e, r) {
      return e = K(e), !(S(t, e) && A(r) && B(r, "value")) || B(r, "get") || B(r, "set") || r.configurable || B(r, "writable") && !r.writable || B(r, "enumerable") && !r.enumerable ? o(t, e, r) : (t[e] = r.value, t);
    };

    f ? (v || (et.f = C, it.f = O, w(b, "buffer"), w(b, "byteOffset"), w(b, "byteLength"), w(b, "length")), qt({
      target: "Object",
      stat: !0,
      forced: !v
    }, {
      getOwnPropertyDescriptor: C,
      defineProperty: O
    }), t.exports = function (t, a, f) {
      var d = t.match(/\d+$/)[0] / 8,
          m = t + (f ? "Clamped" : "") + "Array",
          w = "get" + t,
          S = "set" + t,
          C = c[m],
          O = C,
          R = O && O.prototype,
          I = {},
          _ = function _(t, e) {
        o(t, e, {
          get: function get() {
            return function (t, e) {
              var r = n(t);
              return r.view[w](e * d + r.byteOffset, !0);
            }(this, e);
          },
          set: function set(t) {
            return function (t, e, r) {
              var i = n(t);
              f && (r = (r = u(r)) < 0 ? 0 : r > 255 ? 255 : 255 & r), i.view[S](e * d + i.byteOffset, r, !0);
            }(this, e, t);
          },
          enumerable: !0
        });
      };

      v ? fi && (O = a(function (t, e, r, n) {
        return xr(t, O, m), Or(A(e) ? E(e) ? void 0 !== n ? new C(e, vi(r, d), n) : void 0 !== r ? new C(e, vi(r, d)) : new C(e) : T(e) ? x(O, e) : di.call(O, e) : new C(Jr(e)), t, O);
      }), Xe && Xe(O, y), r(e(C), function (t) {
        t in O || ot(O, t, C[t]);
      }), O.prototype = R) : (O = a(function (t, e, r, n) {
        xr(t, O, m);
        var o,
            a,
            u,
            c = 0,
            f = 0;

        if (A(e)) {
          if (!E(e)) return T(e) ? x(O, e) : di.call(O, e);
          o = e, f = vi(r, d);
          var v = e.byteLength;

          if (void 0 === n) {
            if (v % d) throw s("Wrong length");
            if ((a = v - f) < 0) throw s("Wrong length");
          } else if ((a = Rt(n) * d) + f > v) throw s("Wrong length");

          u = a / d;
        } else u = Jr(e), o = new l(a = u * d);

        for (i(t, {
          buffer: o,
          byteOffset: f,
          byteLength: a,
          length: u,
          view: new h(o)
        }); c < u;) {
          _(t, c++);
        }
      }), Xe && Xe(O, y), R = O.prototype = Oe(b)), R.constructor !== O && ot(R, "constructor", O), ot(R, p, O), g && ot(R, g, m), I[m] = O, qt({
        global: !0,
        forced: O != C,
        sham: !v
      }, I), "BYTES_PER_ELEMENT" in O || ot(O, "BYTES_PER_ELEMENT", d), "BYTES_PER_ELEMENT" in R || ot(R, "BYTES_PER_ELEMENT", d), _r(m);
    }) : t.exports = function () {};
  })("Float32", function (t) {
    return function (e, r, n) {
      return t(this, e, r, n);
    };
  });

  var gi = Math.min,
      yi = [].copyWithin || function (t, e) {
    var r = M(this),
        n = Rt(r.length),
        i = Pt(t, n),
        o = Pt(e, n),
        a = arguments.length > 2 ? arguments[2] : void 0,
        u = gi((void 0 === a ? n : Pt(a, n)) - o, n - i),
        s = 1;

    for (o < i && i < o + u && (s = -1, o += u - 1, i += u - 1); u-- > 0;) {
      o in r ? r[i] = r[o] : delete r[i], i += s, o += s;
    }

    return r;
  },
      bi = ui.aTypedArray;

  (0, ui.exportTypedArrayMethod)("copyWithin", function (t, e) {
    return yi.call(bi(this), t, e, arguments.length > 2 ? arguments[2] : void 0);
  });
  var mi = ie.every,
      Ti = ui.aTypedArray;
  (0, ui.exportTypedArrayMethod)("every", function (t) {
    return mi(Ti(this), t, arguments.length > 1 ? arguments[1] : void 0);
  });
  var xi = ui.aTypedArray;
  (0, ui.exportTypedArrayMethod)("fill", function (t) {
    return an.apply(xi(this), arguments);
  });

  var Ai = ui.TYPED_ARRAY_CONSTRUCTOR,
      wi = ui.aTypedArrayConstructor,
      Ei = function Ei(t) {
    return wi(Ln(t, t[Ai]));
  },
      Si = function Si(t, e) {
    return function (t, e) {
      for (var r = 0, n = e.length, i = new t(n); n > r;) {
        i[r] = e[r++];
      }

      return i;
    }(Ei(t), e);
  },
      Ci = ie.filter,
      Oi = ui.aTypedArray;

  (0, ui.exportTypedArrayMethod)("filter", function (t) {
    var e = Ci(Oi(this), t, arguments.length > 1 ? arguments[1] : void 0);
    return Si(this, e);
  });
  var Ri = ie.find,
      Ii = ui.aTypedArray;
  (0, ui.exportTypedArrayMethod)("find", function (t) {
    return Ri(Ii(this), t, arguments.length > 1 ? arguments[1] : void 0);
  });
  var _i = ie.findIndex,
      Pi = ui.aTypedArray;
  (0, ui.exportTypedArrayMethod)("findIndex", function (t) {
    return _i(Pi(this), t, arguments.length > 1 ? arguments[1] : void 0);
  });
  var ki = ie.forEach,
      Di = ui.aTypedArray;
  (0, ui.exportTypedArrayMethod)("forEach", function (t) {
    ki(Di(this), t, arguments.length > 1 ? arguments[1] : void 0);
  });
  var Ui = Dt.includes,
      ji = ui.aTypedArray;
  (0, ui.exportTypedArrayMethod)("includes", function (t) {
    return Ui(ji(this), t, arguments.length > 1 ? arguments[1] : void 0);
  });
  var Li = Dt.indexOf,
      Mi = ui.aTypedArray;
  (0, ui.exportTypedArrayMethod)("indexOf", function (t) {
    return Li(Mi(this), t, arguments.length > 1 ? arguments[1] : void 0);
  });

  var Fi = $("iterator"),
      Bi = c.Uint8Array,
      Ni = er.values,
      Yi = er.keys,
      Vi = er.entries,
      Wi = ui.aTypedArray,
      Gi = ui.exportTypedArrayMethod,
      zi = Bi && Bi.prototype[Fi],
      $i = !!zi && ("values" == zi.name || null == zi.name),
      Xi = function Xi() {
    return Ni.call(Wi(this));
  };

  Gi("entries", function () {
    return Vi.call(Wi(this));
  }), Gi("keys", function () {
    return Yi.call(Wi(this));
  }), Gi("values", Xi, !$i), Gi(Fi, Xi, !$i);
  var Hi = ui.aTypedArray,
      Ki = [].join;
  (0, ui.exportTypedArrayMethod)("join", function (t) {
    return Ki.apply(Hi(this), arguments);
  });

  var qi = function qi(t, e) {
    var r = [][t];
    return !!r && l(function () {
      r.call(null, e || function () {
        throw 1;
      }, 1);
    });
  },
      Ji = Math.min,
      Qi = [].lastIndexOf,
      Zi = !!Qi && 1 / [1].lastIndexOf(1, -0) < 0,
      to = qi("lastIndexOf"),
      eo = Zi || !to ? function (t) {
    if (Zi) return Qi.apply(this, arguments) || 0;
    var e = x(this),
        r = Rt(e.length),
        n = r - 1;

    for (arguments.length > 1 && (n = Ji(n, Ct(arguments[1]))), n < 0 && (n = r + n); n >= 0; n--) {
      if (n in e && e[n] === t) return n || 0;
    }

    return -1;
  } : Qi,
      ro = ui.aTypedArray;

  (0, ui.exportTypedArrayMethod)("lastIndexOf", function (t) {
    return eo.apply(ro(this), arguments);
  });
  var no = ie.map,
      io = ui.aTypedArray;
  (0, ui.exportTypedArrayMethod)("map", function (t) {
    return no(io(this), t, arguments.length > 1 ? arguments[1] : void 0, function (t, e) {
      return new (Ei(t))(e);
    });
  });

  var oo = function oo(t) {
    return function (e, r, n, i) {
      Jt(r);
      var o = M(e),
          a = m(o),
          u = Rt(o.length),
          s = t ? u - 1 : 0,
          c = t ? -1 : 1;
      if (n < 2) for (;;) {
        if (s in a) {
          i = a[s], s += c;
          break;
        }

        if (s += c, t ? s < 0 : u <= s) throw TypeError("Reduce of empty array with no initial value");
      }

      for (; t ? s >= 0 : u > s; s += c) {
        s in a && (i = r(i, a[s], s, o));
      }

      return i;
    };
  },
      ao = {
    left: oo(!1),
    right: oo(!0)
  },
      uo = ao.left,
      so = ui.aTypedArray;

  (0, ui.exportTypedArrayMethod)("reduce", function (t) {
    return uo(so(this), t, arguments.length, arguments.length > 1 ? arguments[1] : void 0);
  });
  var co = ao.right,
      lo = ui.aTypedArray;
  (0, ui.exportTypedArrayMethod)("reduceRight", function (t) {
    return co(lo(this), t, arguments.length, arguments.length > 1 ? arguments[1] : void 0);
  });
  var fo = ui.aTypedArray,
      ho = ui.exportTypedArrayMethod,
      vo = Math.floor;
  ho("reverse", function () {
    for (var t, e = fo(this).length, r = vo(e / 2), n = 0; n < r;) {
      t = this[n], this[n++] = this[--e], this[e] = t;
    }

    return this;
  });
  var po = ui.aTypedArray;
  (0, ui.exportTypedArrayMethod)("set", function (t) {
    po(this);
    var e = vi(arguments.length > 1 ? arguments[1] : void 0, 1),
        r = this.length,
        n = M(t),
        i = Rt(n.length),
        o = 0;
    if (i + e > r) throw RangeError("Wrong length");

    for (; o < i;) {
      this[e + o] = n[o++];
    }
  }, l(function () {
    new Int8Array(1).set({});
  }));
  var go = ui.aTypedArray,
      yo = [].slice;
  (0, ui.exportTypedArrayMethod)("slice", function (t, e) {
    for (var r = yo.call(go(this), t, e), n = Ei(this), i = 0, o = r.length, a = new n(o); o > i;) {
      a[i] = r[i++];
    }

    return a;
  }, l(function () {
    new Int8Array(1).slice();
  }));
  var bo = ie.some,
      mo = ui.aTypedArray;
  (0, ui.exportTypedArrayMethod)("some", function (t) {
    return bo(mo(this), t, arguments.length > 1 ? arguments[1] : void 0);
  });

  var To = Math.floor,
      xo = function xo(t, e) {
    var r = t.length,
        n = To(r / 2);
    return r < 8 ? Ao(t, e) : wo(xo(t.slice(0, n), e), xo(t.slice(n), e), e);
  },
      Ao = function Ao(t, e) {
    for (var r, n, i = t.length, o = 1; o < i;) {
      for (n = o, r = t[o]; n && e(t[n - 1], r) > 0;) {
        t[n] = t[--n];
      }

      n !== o++ && (t[n] = r);
    }

    return t;
  },
      wo = function wo(t, e, r) {
    for (var n = t.length, i = e.length, o = 0, a = 0, u = []; o < n || a < i;) {
      o < n && a < i ? u.push(r(t[o], e[a]) <= 0 ? t[o++] : e[a++]) : u.push(o < n ? t[o++] : e[a++]);
    }

    return u;
  },
      Eo = xo,
      So = S.match(/firefox\/(\d+)/i),
      Co = !!So && +So[1],
      Oo = /MSIE|Trident/.test(S),
      Ro = S.match(/AppleWebKit\/(\d+)\./),
      Io = !!Ro && +Ro[1],
      _o = ui.aTypedArray,
      Po = ui.exportTypedArrayMethod,
      ko = c.Uint16Array,
      Do = ko && ko.prototype.sort,
      Uo = !!Do && !l(function () {
    var t = new ko(2);
    t.sort(null), t.sort({});
  }),
      jo = !!Do && !l(function () {
    if (_) return _ < 74;
    if (Co) return Co < 67;
    if (Oo) return !0;
    if (Io) return Io < 602;
    var t,
        e,
        r = new ko(516),
        n = Array(516);

    for (t = 0; t < 516; t++) {
      e = t % 4, r[t] = 515 - t, n[t] = t - 2 * e + 3;
    }

    for (r.sort(function (t, e) {
      return (t / 4 | 0) - (e / 4 | 0);
    }), t = 0; t < 516; t++) {
      if (r[t] !== n[t]) return !0;
    }
  });

  Po("sort", function (t) {
    if (void 0 !== t && Jt(t), jo) return Do.call(this, t);

    _o(this);

    var e,
        r = Rt(this.length),
        n = Array(r);

    for (e = 0; e < r; e++) {
      n[e] = this[e];
    }

    for (n = Eo(this, function (t) {
      return function (e, r) {
        return void 0 !== t ? +t(e, r) || 0 : r != r ? -1 : e != e ? 1 : 0 === e && 0 === r ? 1 / e > 0 && 1 / r < 0 ? 1 : -1 : e > r;
      };
    }(t)), e = 0; e < r; e++) {
      this[e] = n[e];
    }

    return this;
  }, !jo || Uo);
  var Lo = ui.aTypedArray;
  (0, ui.exportTypedArrayMethod)("subarray", function (t, e) {
    var r = Lo(this),
        n = r.length,
        i = Pt(t, n);
    return new (Ei(r))(r.buffer, r.byteOffset + i * r.BYTES_PER_ELEMENT, Rt((void 0 === e ? n : Pt(e, n)) - i));
  });
  var Mo = c.Int8Array,
      Fo = ui.aTypedArray,
      Bo = ui.exportTypedArrayMethod,
      No = [].toLocaleString,
      Yo = [].slice,
      Vo = !!Mo && l(function () {
    No.call(new Mo(1));
  });
  Bo("toLocaleString", function () {
    return No.apply(Vo ? Yo.call(Fo(this)) : Fo(this), arguments);
  }, l(function () {
    return [1, 2].toLocaleString() != new Mo([1, 2]).toLocaleString();
  }) || !l(function () {
    Mo.prototype.toLocaleString.call([1, 2]);
  }));
  var Wo = ui.exportTypedArrayMethod,
      Go = c.Uint8Array,
      zo = Go && Go.prototype || {},
      $o = [].toString,
      Xo = [].join;
  l(function () {
    $o.call({});
  }) && ($o = function $o() {
    return Xo.call(this);
  });
  var Ho = zo.toString != $o;
  Wo("toString", $o, Ho);

  var Ko = function Ko() {
    var t = rt(this),
        e = "";
    return t.global && (e += "g"), t.ignoreCase && (e += "i"), t.multiline && (e += "m"), t.dotAll && (e += "s"), t.unicode && (e += "u"), t.sticky && (e += "y"), e;
  },
      qo = function qo(t, e) {
    return RegExp(t, e);
  },
      Jo = {
    UNSUPPORTED_Y: l(function () {
      var t = qo("a", "y");
      return t.lastIndex = 2, null != t.exec("abcd");
    }),
    BROKEN_CARET: l(function () {
      var t = qo("^r", "gy");
      return t.lastIndex = 2, null != t.exec("str");
    })
  },
      Qo = l(function () {
    var t = RegExp(".", "string".charAt(0));
    return !(t.dotAll && t.exec("\n") && "s" === t.flags);
  }),
      Zo = l(function () {
    var t = RegExp("(?<a>b)", "string".charAt(5));
    return "b" !== t.exec("b").groups.a || "bc" !== "b".replace(t, "$<a>c");
  }),
      ta = At.get,
      ea = RegExp.prototype.exec,
      ra = L("native-string-replace", String.prototype.replace),
      _na = ea,
      ia = function () {
    var t = /a/,
        e = /b*/g;
    return ea.call(t, "a"), ea.call(e, "a"), 0 !== t.lastIndex || 0 !== e.lastIndex;
  }(),
      oa = Jo.UNSUPPORTED_Y || Jo.BROKEN_CARET,
      aa = void 0 !== /()??/.exec("")[1];

  (ia || aa || oa || Qo || Zo) && (_na = function na(t) {
    var e,
        r,
        n,
        i,
        o,
        a,
        u,
        s = this,
        c = ta(s),
        l = Lr(t),
        f = c.raw;
    if (f) return f.lastIndex = s.lastIndex, e = _na.call(f, l), s.lastIndex = f.lastIndex, e;
    var h = c.groups,
        v = oa && s.sticky,
        p = Ko.call(s),
        d = s.source,
        g = 0,
        y = l;
    if (v && (-1 === (p = p.replace("y", "")).indexOf("g") && (p += "g"), y = l.slice(s.lastIndex), s.lastIndex > 0 && (!s.multiline || s.multiline && "\n" !== l.charAt(s.lastIndex - 1)) && (d = "(?: " + d + ")", y = " " + y, g++), r = new RegExp("^(?:" + d + ")", p)), aa && (r = new RegExp("^" + d + "$(?!\\s)", p)), ia && (n = s.lastIndex), i = ea.call(v ? r : s, y), v ? i ? (i.input = i.input.slice(g), i[0] = i[0].slice(g), i.index = s.lastIndex, s.lastIndex += i[0].length) : s.lastIndex = 0 : ia && i && (s.lastIndex = s.global ? i.index + i[0].length : n), aa && i && i.length > 1 && ra.call(i[0], r, function () {
      for (o = 1; o < arguments.length - 2; o++) {
        void 0 === arguments[o] && (i[o] = void 0);
      }
    }), i && h) for (i.groups = a = Oe(null), o = 0; o < h.length; o++) {
      a[(u = h[o])[0]] = i[u[1]];
    }
    return i;
  });
  var ua = _na;
  qt({
    target: "RegExp",
    proto: !0,
    forced: /./.exec !== ua
  }, {
    exec: ua
  });

  var sa = $("species"),
      ca = RegExp.prototype,
      la = Fr.charAt,
      fa = function fa(t, e, r) {
    return e + (r ? la(t, e).length : 1);
  },
      ha = Math.floor,
      va = "".replace,
      pa = /\$([$&'`]|\d{1,2}|<[^>]*>)/g,
      da = /\$([$&'`]|\d{1,2})/g,
      ga = function ga(t, e, r, n, i, o) {
    var a = r + t.length,
        u = n.length,
        s = da;
    return void 0 !== i && (i = M(i), s = pa), va.call(o, s, function (o, s) {
      var c;

      switch (s.charAt(0)) {
        case "$":
          return "$";

        case "&":
          return t;

        case "`":
          return e.slice(0, r);

        case "'":
          return e.slice(a);

        case "<":
          c = i[s.slice(1, -1)];
          break;

        default:
          var l = +s;
          if (0 === l) return o;

          if (l > u) {
            var f = ha(l / 10);
            return 0 === f ? o : f <= u ? void 0 === n[f - 1] ? s.charAt(1) : n[f - 1] + s.charAt(1) : o;
          }

          c = n[l - 1];
      }

      return void 0 === c ? "" : c;
    });
  },
      ya = function ya(t, e) {
    var r = t.exec;

    if ("function" == typeof r) {
      var n = r.call(t, e);
      if ("object" != _typeof(n)) throw TypeError("RegExp exec method returned something other than an Object or null");
      return n;
    }

    if ("RegExp" !== y(t)) throw TypeError("RegExp#exec called on incompatible receiver");
    return ua.call(t, e);
  },
      ba = $("replace"),
      ma = Math.max,
      Ta = Math.min,
      xa = "$0" === "a".replace(/./, "$0"),
      Aa = !!/./[ba] && "" === /./[ba]("a", "$0");

  !function (t, e, r, n) {
    var i = $(t),
        o = !l(function () {
      var e = {};
      return e[i] = function () {
        return 7;
      }, 7 != ""[t](e);
    }),
        a = o && !l(function () {
      var e = !1,
          r = /a/;
      return "split" === t && ((r = {}).constructor = {}, r.constructor[sa] = function () {
        return r;
      }, r.flags = "", r[i] = /./[i]), r.exec = function () {
        return e = !0, null;
      }, r[i](""), !e;
    });

    if (!o || !a || r) {
      var u = /./[i],
          s = e(i, ""[t], function (t, e, r, n, i) {
        var a = e.exec;
        return a === ua || a === ca.exec ? o && !i ? {
          done: !0,
          value: u.call(e, r, n)
        } : {
          done: !0,
          value: t.call(r, e, n)
        } : {
          done: !1
        };
      });
      wt(String.prototype, t, s[0]), wt(ca, i, s[1]);
    }

    n && ot(ca[i], "sham", !0);
  }("replace", function (t, e, r) {
    var n = Aa ? "$" : "$0";
    return [function (t, r) {
      var n = T(this),
          i = null == t ? void 0 : t[ba];
      return void 0 !== i ? i.call(t, n, r) : e.call(Lr(n), t, r);
    }, function (t, i) {
      var o = rt(this),
          a = Lr(t);

      if ("string" == typeof i && -1 === i.indexOf(n) && -1 === i.indexOf("$<")) {
        var u = r(e, o, a, i);
        if (u.done) return u.value;
      }

      var s = "function" == typeof i;
      s || (i = Lr(i));
      var c = o.global;

      if (c) {
        var l = o.unicode;
        o.lastIndex = 0;
      }

      for (var f = [];;) {
        var h = ya(o, a);
        if (null === h) break;
        if (f.push(h), !c) break;
        "" === Lr(h[0]) && (o.lastIndex = fa(a, Rt(o.lastIndex), l));
      }

      for (var v, p = "", d = 0, g = 0; g < f.length; g++) {
        h = f[g];

        for (var y = Lr(h[0]), b = ma(Ta(Ct(h.index), a.length), 0), m = [], T = 1; T < h.length; T++) {
          m.push(void 0 === (v = h[T]) ? v : String(v));
        }

        var x = h.groups;

        if (s) {
          var A = [y].concat(m, b, a);
          void 0 !== x && A.push(x);
          var w = Lr(i.apply(void 0, A));
        } else w = ga(y, a, b, m, x, i);

        b >= d && (p += a.slice(d, b) + w, d = b + y.length);
      }

      return p + a.slice(d);
    }];
  }, !!l(function () {
    var t = /./;
    return t.exec = function () {
      var t = [];
      return t.groups = {
        a: "7"
      }, t;
    }, "7" !== "".replace(t, "$<a>");
  }) || !xa || Aa);
  var wa = RegExp.prototype,
      Ea = wa.toString,
      Sa = l(function () {
    return "/a/b" != Ea.call({
      source: "a",
      flags: "b"
    });
  }),
      Ca = "toString" != Ea.name;
  (Sa || Ca) && wt(RegExp.prototype, "toString", function () {
    var t = rt(this),
        e = Lr(t.source),
        r = t.flags;
    return "/" + e + "/" + Lr(void 0 === r && t instanceof RegExp && !("flags" in wa) ? Ko.call(t) : r);
  }, {
    unsafe: !0
  });
  var Oa = $("match"),
      Ra = it.f,
      Ia = Ft.f,
      _a = At.enforce,
      Pa = $("match"),
      ka = c.RegExp,
      Da = ka.prototype,
      Ua = /^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/,
      ja = /a/g,
      La = /a/g,
      Ma = new ka(ja) !== ja,
      Fa = Jo.UNSUPPORTED_Y,
      Ba = f && (!Ma || Fa || Qo || Zo || l(function () {
    return La[Pa] = !1, ka(ja) != ja || ka(La) == La || "/a/i" != ka(ja, "i");
  }));

  if (Ht("RegExp", Ba)) {
    for (var Na = function Na(t, e) {
      var r,
          n,
          i,
          o,
          a,
          u,
          s,
          c,
          l = this instanceof Na,
          f = A(r = t) && (void 0 !== (n = r[Oa]) ? !!n : "RegExp" == y(r)),
          h = void 0 === e,
          v = [],
          p = t;
      if (!l && f && h && t.constructor === Na) return t;
      if ((f || t instanceof Na) && (t = t.source, h && (e = ("flags" in p) ? p.flags : Ko.call(p))), t = void 0 === t ? "" : Lr(t), e = void 0 === e ? "" : Lr(e), p = t, Qo && ("dotAll" in ja) && (o = !!e && e.indexOf("s") > -1) && (e = e.replace(/s/g, "")), i = e, Fa && ("sticky" in ja) && (a = !!e && e.indexOf("y") > -1) && (e = e.replace(/y/g, "")), Zo && (t = (u = function (t) {
        for (var e, r = t.length, n = 0, i = "", o = [], a = {}, u = !1, s = !1, c = 0, l = ""; n <= r; n++) {
          if ("\\" === (e = t.charAt(n))) e += t.charAt(++n);else if ("]" === e) u = !1;else if (!u) switch (!0) {
            case "[" === e:
              u = !0;
              break;

            case "(" === e:
              Ua.test(t.slice(n + 1)) && (n += 2, s = !0), i += e, c++;
              continue;

            case ">" === e && s:
              if ("" === l || B(a, l)) throw new SyntaxError("Invalid capture group name");
              a[l] = !0, o.push([l, c]), s = !1, l = "";
              continue;
          }
          s ? l += e : i += e;
        }

        return [i, o];
      }(t))[0], v = u[1]), s = Or(ka(t, e), l ? this : Da, Na), (o || a || v.length) && (c = _a(s), o && (c.dotAll = !0, c.raw = Na(function (t) {
        for (var e, r = t.length, n = 0, i = "", o = !1; n <= r; n++) {
          "\\" !== (e = t.charAt(n)) ? o || "." !== e ? ("[" === e ? o = !0 : "]" === e && (o = !1), i += e) : i += "[\\s\\S]" : i += e + t.charAt(++n);
        }

        return i;
      }(t), i)), a && (c.sticky = !0), v.length && (c.groups = v)), t !== p) try {
        ot(s, "source", "" === p ? "(?:)" : p);
      } catch (Ja) {}
      return s;
    }, Ya = function Ya(t) {
      (t in Na) || Ra(Na, t, {
        configurable: !0,
        get: function get() {
          return ka[t];
        },
        set: function set(e) {
          ka[t] = e;
        }
      });
    }, Va = Ia(ka), Wa = 0; Va.length > Wa;) {
      Ya(Va[Wa++]);
    }

    Da.constructor = Na, Na.prototype = Da, wt(c, "RegExp", Na);
  }

  _r("RegExp");

  var Ga = [].join,
      za = m != Object,
      $a = qi("join", ",");

  function Xa(t, e, r) {
    var n = function n(t, e, r) {
      var n = new RegExp("\\b".concat(e, " \\w+ (\\w+)"), "ig");
      t.replace(n, function (t, e) {
        return r[e] = 0, t;
      });
    },
        i = function i(t, e, r) {
      var n = t.createShader(r);
      return t.shaderSource(n, e), t.compileShader(n), t.getShaderParameter(n, t.COMPILE_STATUS) ? n : (console.log(t.getShaderInfoLog(n)), null);
    };

    this.uniform = {}, this.attribute = {};
    var o = i(t, e, t.VERTEX_SHADER),
        a = i(t, r, t.FRAGMENT_SHADER);

    for (var u in this.id = t.createProgram(), t.attachShader(this.id, o), t.attachShader(this.id, a), t.linkProgram(this.id), t.getProgramParameter(this.id, t.LINK_STATUS) || console.log(t.getProgramInfoLog(this.id)), t.useProgram(this.id), n(e, "attribute", this.attribute), this.attribute) {
      this.attribute[u] = t.getAttribLocation(this.id, u);
    }

    for (var s in n(e, "uniform", this.uniform), n(r, "uniform", this.uniform), this.uniform) {
      this.uniform[s] = t.getUniformLocation(this.id, s);
    }
  }

  qt({
    target: "Array",
    proto: !0,
    forced: za || !$a
  }, {
    join: function join(t) {
      return Ga.call(x(this), void 0 === t ? "," : t);
    }
  });

  var Ha = function () {
    function t(r) {
      e(this, t), this.canvas = r.canvas, this.width = r.width || 640, this.height = r.height || 480, this.gl = this.createGL(r.canvas), this.sourceTexture = this.gl.createTexture(), this.vertexBuffer = null, this.currentProgram = null, this.applied = !1, this.beautyParams = {
        beauty: 0.5,
        brightness: 0.5,
        ruddy: 0.5
      };
    }

    return n(t, [{
      key: "setRect",
      value: function value(t, e) {
        this.width = t, this.height = e;
      }
    }, {
      key: "apply",
      value: function value(t) {
        if (!this.vertexBuffer) {
          var e = new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, -1, 1, 0, 0, 1, -1, 1, 1, 1, 1, 1, 0]);
          this.vertexBuffer = this.gl.createBuffer(), this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer), this.gl.bufferData(this.gl.ARRAY_BUFFER, e, this.gl.STATIC_DRAW), this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0);
        }

        this.gl.viewport(0, 0, this.width, this.height), this.gl.bindTexture(this.gl.TEXTURE_2D, this.sourceTexture), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST), this.applied ? this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, t) : (this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, t), this.applied = !0), this.beauty();
      }
    }, {
      key: "beauty",
      value: function value() {
        var t = this.beautyParams,
            e = t.beauty,
            r = t.brightness,
            n = t.ruddy,
            i = 2 / this.width,
            o = 2 / this.height,
            a = this.compileBeautyShader();
        this.gl.uniform2f(a.uniform.singleStepOffset, i, o);
        var u = new Float32Array([1 - 0.8 * e, 1 - 0.6 * e, 0.1 + 0.45 * n, 0.1 + 0.45 * n]);
        this.gl.uniform4fv(a.uniform.params, u), this.gl.uniform1f(a.uniform.brightness, 0.12 * r), this.draw();
      }
    }, {
      key: "draw",
      value: function value() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.sourceTexture), this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null), this.gl.uniform1f(this.currentProgram.uniform.flipY, 1), this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
      }
    }, {
      key: "compileBeautyShader",
      value: function value() {
        if (this.currentProgram) return this.currentProgram;
        this.currentProgram = new Xa(this.gl, ["precision highp float;", "attribute vec2 pos;", "attribute vec2 uv;", "varying vec2 vUv;", "uniform float flipY;", "void main(void) {", "vUv = uv;", "gl_Position = vec4(pos.x, pos.y*flipY, 0.0, 1.);", "}"].join("\n"), ["precision highp float;", "uniform vec2 singleStepOffset;", "uniform sampler2D texture;", "uniform vec4 params;", "uniform float brightness;", "varying vec2 vUv;", "const highp vec3 W = vec3(0.299,0.587,0.114);", "const mat3 saturateMatrix = mat3(1.1102,-0.0598,-0.061,-0.0774,1.0826,-0.1186,-0.0228,-0.0228,1.1772);", "vec2 blurCoordinates[24];", "float hardLight(float color){", "if(color <= 0.5){", "color = color * color * 2.0;", "} else {", "color = 1.0 - ((1.0 - color)*(1.0 - color) * 2.0);", "}", "return color;", "}", "void main(){", "vec3 centralColor = texture2D(texture, vUv).rgb;", "blurCoordinates[0] = vUv.xy + singleStepOffset * vec2(0.0, -10.0);", "blurCoordinates[1] = vUv.xy + singleStepOffset * vec2(0.0, 10.0);", "blurCoordinates[2] = vUv.xy + singleStepOffset * vec2(-10.0, 0.0);", "blurCoordinates[3] = vUv.xy + singleStepOffset * vec2(10.0, 0.0);", "blurCoordinates[4] = vUv.xy + singleStepOffset * vec2(5.0, -8.0);", "blurCoordinates[5] = vUv.xy + singleStepOffset * vec2(5.0, 8.0);", "blurCoordinates[6] = vUv.xy + singleStepOffset * vec2(-5.0, 8.0);", "blurCoordinates[7] = vUv.xy + singleStepOffset * vec2(-5.0, -8.0);", "blurCoordinates[8] = vUv.xy + singleStepOffset * vec2(8.0, -5.0);", "blurCoordinates[9] = vUv.xy + singleStepOffset * vec2(8.0, 5.0);", "blurCoordinates[10] = vUv.xy + singleStepOffset * vec2(-8.0, 5.0);", "blurCoordinates[11] = vUv.xy + singleStepOffset * vec2(-8.0, -5.0);", "blurCoordinates[12] = vUv.xy + singleStepOffset * vec2(0.0, -6.0);", "blurCoordinates[13] = vUv.xy + singleStepOffset * vec2(0.0, 6.0);", "blurCoordinates[14] = vUv.xy + singleStepOffset * vec2(6.0, 0.0);", "blurCoordinates[15] = vUv.xy + singleStepOffset * vec2(-6.0, 0.0);", "blurCoordinates[16] = vUv.xy + singleStepOffset * vec2(-4.0, -4.0);", "blurCoordinates[17] = vUv.xy + singleStepOffset * vec2(-4.0, 4.0);", "blurCoordinates[18] = vUv.xy + singleStepOffset * vec2(4.0, -4.0);", "blurCoordinates[19] = vUv.xy + singleStepOffset * vec2(4.0, 4.0);", "blurCoordinates[20] = vUv.xy + singleStepOffset * vec2(-2.0, -2.0);", "blurCoordinates[21] = vUv.xy + singleStepOffset * vec2(-2.0, 2.0);", "blurCoordinates[22] = vUv.xy + singleStepOffset * vec2(2.0, -2.0);", "blurCoordinates[23] = vUv.xy + singleStepOffset * vec2(2.0, 2.0);", "float sampleColor = centralColor.g * 22.0;", "sampleColor += texture2D(texture, blurCoordinates[0]).g;", "sampleColor += texture2D(texture, blurCoordinates[1]).g;", "sampleColor += texture2D(texture, blurCoordinates[2]).g;", "sampleColor += texture2D(texture, blurCoordinates[3]).g;", "sampleColor += texture2D(texture, blurCoordinates[4]).g;", "sampleColor += texture2D(texture, blurCoordinates[5]).g;", "sampleColor += texture2D(texture, blurCoordinates[6]).g;", "sampleColor += texture2D(texture, blurCoordinates[7]).g;", "sampleColor += texture2D(texture, blurCoordinates[8]).g;", "sampleColor += texture2D(texture, blurCoordinates[9]).g;", "sampleColor += texture2D(texture, blurCoordinates[10]).g;", "sampleColor += texture2D(texture, blurCoordinates[11]).g;", "sampleColor += texture2D(texture, blurCoordinates[12]).g * 2.0;", "sampleColor += texture2D(texture, blurCoordinates[13]).g * 2.0;", "sampleColor += texture2D(texture, blurCoordinates[14]).g * 2.0;", "sampleColor += texture2D(texture, blurCoordinates[15]).g * 2.0;", "sampleColor += texture2D(texture, blurCoordinates[16]).g * 2.0;", "sampleColor += texture2D(texture, blurCoordinates[17]).g * 2.0;", "sampleColor += texture2D(texture, blurCoordinates[18]).g * 2.0;", "sampleColor += texture2D(texture, blurCoordinates[19]).g * 2.0;", "sampleColor += texture2D(texture, blurCoordinates[20]).g * 3.0;", "sampleColor += texture2D(texture, blurCoordinates[21]).g * 3.0;", "sampleColor += texture2D(texture, blurCoordinates[22]).g * 3.0;", "sampleColor += texture2D(texture, blurCoordinates[23]).g * 3.0;", "sampleColor = sampleColor / 62.0;", "float highPass = centralColor.g - sampleColor + 0.5;", "for(int i = 0; i < 5;i++){", "highPass = hardLight(highPass);", "}", "float luminance = dot(centralColor, W);", "float alpha = pow(luminance, params.r);", "vec3 smoothColor = centralColor + (centralColor-vec3(highPass))*alpha*0.1;", "smoothColor.r = clamp(pow(smoothColor.r, params.g),0.0,1.0);", "smoothColor.g = clamp(pow(smoothColor.g, params.g),0.0,1.0);", "smoothColor.b = clamp(pow(smoothColor.b, params.g),0.0,1.0);", "vec3 screen = vec3(1.0) - (vec3(1.0)-smoothColor) * (vec3(1.0)-centralColor);", "vec3 lighten = max(smoothColor, centralColor);", "vec3 softLight = 2.0 * centralColor*smoothColor + centralColor*centralColor - 2.0 * centralColor*centralColor * smoothColor;", "gl_FragColor = vec4(mix(centralColor, screen, alpha), 1.0);", "gl_FragColor.rgb = mix(gl_FragColor.rgb, lighten, alpha);", "gl_FragColor.rgb = mix(gl_FragColor.rgb, softLight, params.b);", "vec3 satColor = gl_FragColor.rgb * saturateMatrix;", "gl_FragColor.rgb = mix(gl_FragColor.rgb, satColor, params.a);", "gl_FragColor.rgb = vec3(gl_FragColor.rgb + vec3(brightness));", "}"].join("\n"));
        var t = Float32Array.BYTES_PER_ELEMENT,
            e = 4 * t;
        return this.gl.enableVertexAttribArray(this.currentProgram.attribute.pos), this.gl.vertexAttribPointer(this.currentProgram.attribute.pos, 2, this.gl.FLOAT, !1, e, 0), this.gl.enableVertexAttribArray(this.currentProgram.attribute.uv), this.gl.vertexAttribPointer(this.currentProgram.attribute.uv, 2, this.gl.FLOAT, !1, e, 2 * t), this.currentProgram;
      }
    }, {
      key: "createGL",
      value: function value(t) {
        var e = t.getContext("webgl");
        if (e || t.getContext("experimental-webgl", {
          preserveDrawingBuffer: !0
        }), !e) throw "Couldn't get WebGL context";
        return e;
      }
    }, {
      key: "setBeautyParams",
      value: function value(t) {
        this.beautyParams = t;
      }
    }, {
      key: "reset",
      value: function value() {
        this.applied = !1;
      }
    }]), t;
  }(),
      Ka = function Ka(t) {
    return "number" == typeof t;
  },
      qa = function () {
    function r() {
      e(this, r), this.video = document.createElement("video"), this.video.loop = !0, this.video.autoplay = !0, this.canvas = document.createElement("canvas"), this.filter = new Ha({
        canvas: this.canvas
      }), this.beautyParams = {
        beauty: 0.5,
        brightness: 0.5,
        ruddy: 0.5
      }, this.timeoutId = null, this.rafId = null, this.startTime = null, this.originTrack = null, this.beautyTrack = null, this.localStream = null, this.frameRate = null, this.disableStatus = !1;
    }

    return n(r, [{
      key: "generateBeautyStream",
      value: function value(t) {
        var e = t.getVideoTrack();
        if (!e) throw new Error("Your localStream does not contain video track.");
        var r = this.generateBeautyTrack(e);
        return t.replaceTrack(r), this.localStream = t, t.setBeautyStatus && t.setBeautyStatus(!0), t;
      }
    }, {
      key: "generateBeautyTrack",
      value: function value(t) {
        var e = this;
        this.reset();
        var r = t.getSettings();
        this.frameRate = r.frameRate, this.filter.setRect(r.width, r.height), this.setRect(r.width, r.height);
        var n = new MediaStream();
        n.addTrack(t), this.video.srcObject = n, this.video.play();
        var i = this.generateVideoTrackFromCanvasCapture(r.frameRate || 15);
        return this.rafId && cancelAnimationFrame(this.rafId), this.rafId = requestAnimationFrame(function () {
          e.startTime = new Date().getTime(), e.render();
        }), this.installEvents(), this.setBeautyTrack({
          originTrack: t,
          beautyTrack: i
        }), this.originTrack = t, this.beautyTrack = i, i;
      }
    }, {
      key: "draw",
      value: function value() {
        this.video && this.video.readyState === this.video.HAVE_ENOUGH_DATA && this.filter.apply(this.video);
      }
    }, {
      key: "render",
      value: function value() {
        var t = this,
            e = new Date().getTime();
        e - this.startTime > 1e3 / this.frameRate && (this.draw(), this.startTime = e), document.hidden ? (clearTimeout(this.timeoutId), this.timeoutId = setTimeout(function () {
          t.render();
        }, 1e3 / this.frameRate)) : (this.timeoutId && clearTimeout(this.timeoutId), this.rafId && cancelAnimationFrame(this.rafId), requestAnimationFrame(this.render.bind(this)));
      }
    }, {
      key: "setBeautyParam",
      value: function value(t) {
        var e = t.beauty,
            r = t.brightness,
            n = t.ruddy;
        Ka(e) && (this.beautyParams.beauty = e), Ka(r) && (this.beautyParams.brightness = r), Ka(n) && (this.beautyParams.ruddy = n), this.filter.setBeautyParams(this.beautyParams), this.getClose() && !this.disableStatus && this.disable(), !this.getClose() && this.disableStatus && this.enable();
      }
    }, {
      key: "setRect",
      value: function value(t, e) {
        var r = t || 640,
            n = e || 480;
        this.video.height = n, this.video.width = r, this.canvas.height = n, this.canvas.width = r;
      }
    }, {
      key: "reset",
      value: function value() {
        cancelAnimationFrame(this.rafId), clearTimeout(this.timeoutId), this.video.pause(), this.filter.reset(), this.beautyTrack && this.beautyTrack.stop(), this.originTrack && this.originTrack.stop();
      }
    }, {
      key: "destroy",
      value: function value() {
        cancelAnimationFrame(this.rafId), clearTimeout(this.timeoutId), this.canvas && (this.canvas.width = 0, this.canvas.height = 0, this.canvas.remove(), delete this.canvas), this.video && (this.video.pause(), this.video.removeAttribute("srcObject"), this.video.removeAttribute("src"), this.video.load(), this.video.width = 0, this.video.height = 0, this.video.remove(), delete this.video), this.beautyTrack && this.beautyTrack.stop(), this.originTrack && this.originTrack.stop(), this.uninstallEvents();
      }
    }, {
      key: "generateVideoTrackFromCanvasCapture",
      value: function value(t) {
        return this.canvas.captureStream(t).getVideoTracks()[0];
      }
    }, {
      key: "setBeautyTrack",
      value: function value(e) {
        var r = e.originTrack,
            n = e.beautyTrack;
        t && (t.beautyTrackMap || (t.beautyTrackMap = new Map()), t.beautyTrackMap.set(n.id, {
          originTrack: r,
          beautyTrack: n,
          param: this.beautyParams,
          pluginInstance: this
        }));
      }
    }, {
      key: "disable",
      value: function value() {
        this.localStream && this.originTrack && (this.localStream.replaceTrack(this.originTrack), cancelAnimationFrame(this.rafId), clearTimeout(this.timeoutId), this.disableStatus = !0);
      }
    }, {
      key: "enable",
      value: function value() {
        this.localStream && this.beautyTrack && (this.localStream.replaceTrack(this.beautyTrack), this.render(), this.disableStatus = !1);
      }
    }, {
      key: "installEvents",
      value: function value() {
        document.addEventListener("visibilitychange", this.render.bind(this));
      }
    }, {
      key: "uninstallEvents",
      value: function value() {
        document.removeEventListener("visibilitychange", this.render.bind(this));
      }
    }, {
      key: "getClose",
      value: function value() {
        return 0 === this.beautyParams.beauty && 0 === this.beautyParams.brightness && 0 === this.beautyParams.ruddy;
      }
    }]), r;
  }();

  return t && (t.getRTCBeautyPlugin = function () {
    return new qa();
  }), qa;
});
var RTCBeautyPlugin$1 = RTCBeautyPlugin;

/**
 * 使用了TRTC的美颜插件
 */
var Beauty = /*#__PURE__*/function () {
  function Beauty(logger) {
    _classCallCheck(this, Beauty);

    this.logger = logger;
    this.beautyParams = {
      beauty: 0.5,
      brightness: 0.5,
      ruddy: 0.5
    };
    this.isBeautyStreamSupported = isBeautyStreamSupported();
    this.isBeautyStreamSupported && (this.rtcBeautyPlugin = new RTCBeautyPlugin$1());
  }
  /**
   * 如果支持美颜 ，返回美颜流，否则返回本地流
   * @param LocalStream 本地流
   * @returns 
   */


  _createClass(Beauty, [{
    key: "generateBeautyStream",
    value: function generateBeautyStream(LocalStream) {
      this.logger.info("generate beauty stream ,streamId ".concat(LocalStream.streamId));
      return this.isBeautyStreamSupported ? this.rtcBeautyPlugin.generateBeautyStream(LocalStream) : LocalStream;
    }
    /**
    * 设置美颜参数
    * @param options 美颜参数
    * @returns 
    */

  }, {
    key: "setBeautyParam",
    value: function setBeautyParam(options) {
      if (!this.isBeautyStreamSupported) return this.logger.warn('The current browser does not support beauty');
      var beauty = options.beauty,
          brightness = options.brightness,
          ruddy = options.ruddy;

      if (beauty >= 0 && beauty <= 1 && brightness >= 0 && brightness <= 1 && ruddy >= 0 && ruddy <= 1) {
        this.beautyParams = options;
        this.logger.info("set beauty param beauty:".concat(beauty, ",brightness:").concat(brightness, ",ruddy:").concat(ruddy)); // 解决美颜参数设置过高出现花屏问题 最高限制在0.8

        if (beauty > 0.5) {
          this.beautyParams.beauty = Number(((beauty - 0.5) * 0.6 + 0.5).toFixed(2));
        }

        return this.rtcBeautyPlugin.setBeautyParam(this.beautyParams);
      }
    }
    /**
    * 销毁美颜插件
    * @returns 
    */

  }, {
    key: "destroy",
    value: function destroy() {
      var _this = this;

      var timer = setTimeout(function () {
        clearTimeout(timer);
        _this.rtcBeautyPlugin = null;
        _this.logger = null;
        _this.beautyParams = null;
      }, 100);
      this.logger.info('destroy beauty');
      return this.rtcBeautyPlugin && this.rtcBeautyPlugin.destroy();
    }
    /**
     * 更新美颜流
     */

  }, {
    key: "updateBeautyStream",
    value: function updateBeautyStream(LocalStream) {
      if (!this.isBeautyStreamSupported) return this.logger.warn('The current browser does not support beauty');
      this.logger.info('update beauty stream');
      this.rtcBeautyPlugin.reset();
      var track = LocalStream.getVideoTrack(); // 修复mute视频后，切换设备，调用updateBeautyStream，报错问题

      track.enabled = true;

      if (track) {
        this.rtcBeautyPlugin.generateBeautyTrack(track);
        this.rtcBeautyPlugin.enable();
      }
    }
  }]);

  return Beauty;
}();

var logger = new Logger();
logger.info('adapter.browserDetails.browser', adapter.browserDetails);
/**
 * 全局绑定日志模块
 */

window.Logger = logger;
var XRTC = {
  /**
   * 版本号
   */
  VERSION: "3.2.2",

  /**
   * 日志模块
   */
  Logger: logger,

  /**
   * 检查浏览器是否支持
   */
  checkSystemRequirements: checkSystemRequirements,

  /**
   * 判断是否支持屏幕共享
   */
  isScreenShareSupported: isScreenShareSupported,

  /**
   * 判断是否支持开启大小流模式
   */
  isSmallStreamSupported: isSmallStreamSupported,

  /**
   * 检测浏览器是否美颜
   */
  isBeautyStreamSupported: isBeautyStreamSupported,

  /**
   * 获取设备列表
   */
  getDevices: getDevices,

  /**
   * 获取设备头列表
   */
  getCameras: getCameras,

  /**
   * 获取麦克风列表
   */
  getMicrophones: getMicrophones,

  /**
   * 获取扬声器列表
   */
  getSpeakers: getSpeakers,

  /**
   * 创建客户端对象
   * @param clientConfig 
   * @returns Client
   */
  createClient: function createClient(clientConfig) {
    logger.info('create client with config', JSON.stringify(clientConfig));
    return new Client(clientConfig, logger);
  },

  /**
   * 创建 Stream 对象
   * @param streamConfig 
   * @returns Stream.LocalStream
   */
  createStream: function createStream(streamConfig) {
    logger.info('create stream with config', JSON.stringify(streamConfig));
    return new LocalStream$1(streamConfig, logger);
  },

  /**
   * 创建美颜对象
   */
  createBeauty: function createBeauty() {
    logger.info('create beauty');
    return new Beauty(logger);
  }
};

export default XRTC;
