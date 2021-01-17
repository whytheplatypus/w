function hello(){
  console.log("hello");
  close();
}
w(hello);



c = new Channel();
c.push("hello world")
c.push("etc, etc")
const work = w(async function test(){
  self.importScripts('http://localhost:8080/w.js')
  c = new Channel()
  c.register(self);
  for await (const m of c) {
    console.log(m);
  }
  close();
})
c.register(work);
c.flush();
c.push("and more");
c.flush();
c.close();
