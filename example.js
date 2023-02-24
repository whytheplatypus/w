function hello(){
  console.log("hello");
  close();
}
// w(hello);

function world() {
  console.log("world");
}

w(function world_hello(){
  world();
  hello();
})(world, hello);

const something = "hello world";
function log() {
  console.log(something);
  close();
}

w(log)(`const something = "${something}";`);

w(log)(injectValue({ something }));

const c = new Channel(w(async function test(){
  for (var i = 1; i < 10; i++) {
    self.postMessage({done: false, value: i});
  }
  self.postMessage({done: true});
})());

async function test() {
  for await (const i of c) {
    console.log(i);
  }
  console.log("done");
}


test();

