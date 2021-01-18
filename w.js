function toBlob(funcs) {
  const func = funcs[funcs.length - 1];
  return new Blob([
    ...funcs.map(f => f.toString()),
    `${func.name}();`
  ], {type:'text/javascript'});
}

function run(blob) {
  return new Worker(URL.createObjectURL(blob));
}

function w(...funcs) {
  return run(toBlob(funcs));
}

function withContext(obj) {
  return `Object.assign(self, ${JSON.stringify(obj)});`
}

class Channel {
  constructor() {
    this.buffer = [];
    this.pending = [];
    this.done = false;
  }
  push(obj) {
    this.buffer.push(obj);
    console.debug("pending processes", this.pending)
    if (this.pending.length > 0) {
      const m = this.buffer.shift();
      while(this.pending.length > 0) {
        const p = this.pending.shift();
        p(m);
      }
    }
  }
  register(messagePasser) {
    // has to have onmessage, and postMessage
    this.messagePasser = messagePasser;
    this.messagePasser.onmessage = function(e) {
      this.push(e.data);
    }.bind(this);
  }
  flush() {
    if (this.messagePasser === null) {
      throw new Error("a channel must be registered first");
    }
    while(this.buffer.length > 0 ) {
      const m = this.buffer.shift();
      console.debug("flushing", m);
      this.messagePasser.postMessage({done: this.done, value: m});
    }
  }
  next() {
    return new Promise((resolve, reject) => {
      if (this.buffer.length > 0) {
        resolve(this.buffer.shift());
        return;
      }
      console.debug("adding to pending")
      this.pending.push(resolve);
    });
  }
  close() {
    this.done = true;
    this.messagePasser.postMessage({done: this.done});
  }
  [Symbol.asyncIterator]() { return this; }
}
