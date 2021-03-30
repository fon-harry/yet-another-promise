// Meet YAP - Yet Another Promise
class Yap {
  constructor(fn) {
    this.state = "pending"; // pending, fulfilled, rejected
    this.result;
    this.handlers = [];

    this.__doResolve(fn, this.__resolve.bind(this), this.__reject.bind(this));
  }

  // then(/* TODO */) {}
  // catch(/* TODO */) {}
  finally(/* TODO */) {}
  static all(/* TODO */) {}
  static race(/* TODO */) {}
  static reject(/* TODO */) {}
  static resolve(/* TODO */) {}

  then(onFulfilled, onRejected) {
    return new Yap((resolve, reject) => {
      return this.__done(
        (result) => {
          if (typeof onFulfilled === "function") {
            try {
              return resolve(onFulfilled(result));
            } catch (error) {
              return reject(error);
            }
          } else {
            return resolve(result);
          }
        },
        (error) => {
          if (typeof onRejected === "function") {
            try {
              return resolve(onRejected(error));
            } catch (error) {
              return reject(error);
            }
          } else {
            return reject(error);
          }
        }
      );
    });
  }

  catch(onReject) {
    return typeof onReject === "function"
      ? this.then(undefined, onReject)
      : this;
  }

  // Private
  __fulfill(result) {
    this.state = "fulfilled";
    this.result = result;
    this.handlers.forEach(this.__handle.bind(this));
    this.handlers = null;
  }

  __reject(error) {
    this.state = "rejected";
    this.result = error;
    this.handlers.forEach(this.__handle.bind(this));
    this.handlers = null;
  }

  __resolve(result) {
    try {
      const then = this.__getThen(result);
      if (then) {
        this.__doResolve(
          then.bind(result),
          this.__resolve.bind(this),
          this.__reject.bind(this)
        );
        return;
      }
      this.__fulfill(result);
    } catch (error) {
      this.__reject(error);
    }
  }

  __handle(handler) {
    if (this.state === "pending") {
      this.handlers.push(handler);
    } else if (
      this.state === "fulfilled" &&
      typeof handler.onFulfilled === "function"
    ) {
      handler.onFulfilled(this.result);
    } else if (
      this.state === "rejected" &&
      typeof handler.onRejected === "function"
    ) {
      handler.onRejected(this.result);
    }
  }

  __done(onFulfilled, onRejected) {
    // setTimeout(() => {
    //   this.__handle({
    //     onFulfilled,
    //     onRejected,
    //   });
    // }, 0);
    process.nextTick(() => {
      this.__handle({ onFulfilled, onRejected });
    });
  }

  __getThen(value) {
    const valueType = typeof value;
    if (value && (valueType === "object" || valueType === "function")) {
      const then = value.then;
      if (typeof then === "function") {
        return then;
      }
    }
    return null;
  }

  __doResolve(fn, onFulfilled, onRejected) {
    let done = false;
    try {
      fn(
        (value) => {
          if (done) {
            return;
          }
          done = true;
          onFulfilled(value);
        },
        (reason) => {
          if (done) {
            return;
          }
          done = true;
          onRejected(reason);
        }
      );
    } catch (error) {
      if (done) {
        return;
      }
      done = true;
      onRejected(error);
    }
  }
}

const promiseYap = new Yap((resolve, reject) => {
  console.log("enter function");
  setTimeout(() => {
    resolve("foo");
    // reject("foo");
  }, 300);
});

promiseYap
  .then((value) => {
    console.log(value);
  })
  .catch((error) => console.log("error:", error));
