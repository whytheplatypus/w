function toBlob(funcs) {
  console.debug(funcs);
  const func = funcs[funcs.length - 1];
  return new Blob([
    ...funcs.map(f => f.toString()),
    `${func.name}();`
  ], {type:'text/javascript'});
}

function run(blob) {
  return new Worker(URL.createObjectURL(blob));
}

function w(func) {
  return function(...context) {
    context.push(func)
    return run(toBlob(context));
  };
}

function injectValue(obj) {
  return `Object.assign(self, ${JSON.stringify(obj)});`
}

// v1 no buffer
// v2 buffer
class Channel {
  constructor(worker) {
    this.worker = worker
  }
  push(obj) {
    this.worker.postMessage(obj);
  }
  async next() {
    const self = this;
    return new Promise(resolve => {
      self.worker.addEventListener("message", function (e) {
        resolve(e.data);
      });
    });
  }
  [Symbol.asyncIterator]() { return this; }
}
