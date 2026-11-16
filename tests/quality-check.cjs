/* node tests/quality-check.cjs | sin dependencias */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=require("node:path").resolve(__dirname,"..");
const js=n=>fs.readFileSync(require("node:path").join(root,n),"utf8");
new (require("node:vm").Script)(js("app.js"),{filename:"app.js"});
const ctx={window:{}};vm.runInNewContext(js("questions.js"),ctx,{filename:"questions.js"});
const B=ctx.window.AULA_QUESTIONS,A=ctx.window.AULA_AREAS;
assert.equal(B.length,152,"152 ítems esperados");
const expected={lectura:24,cuantitativo:24,matematicas:48,pedagogia:24,psicotecnica:12,blandas:20};
const seen=new Set();
for(const q of B){
 assert.ok(q.id&&!seen.has(q.id),"identificador único");seen.add(q.id);
 assert.ok(Object.hasOwn(expected,q.area),"área conocida");
 assert.equal(q.options.length,4,"cuatro opciones");
 assert.equal(new Set(q.options).size,4,"opciones distintas: "+q.id);
 assert.ok(q.prompt.length>=15,"enunciado comprensible: "+q.id);
 assert.ok(q.explain.length>=15,"justificación suficiente: "+q.id);
 if(q.area==="psicotecnica")assert.equal(q.answer,null,"no hay clave para psicotécnica");
 else assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,"clave válida: "+q.id);
}
for(const [area,count]of Object.entries(expected))assert.equal(B.filter(q=>q.area===area).length,count,"cantidad "+area);
const stems=B.map(q=>q.prompt);
assert.equal(new Set(stems).size,stems.length,"enunciados no repetidos");
assert.deepEqual(Object.fromEntries(["lectura","cuantitativo","matematicas","pedagogia"].map(k=>[k,A[k].weight])),{lectura:20,cuantitativo:20,matematicas:40,pedagogia:20});
const nodes={};const listeners={};const local=new Map();
function node(){return{innerHTML:"",textContent:"",classList:{add(){},remove(){},toggle(){}},dataset:{}}}
const document={getElementById(k){return nodes[k]??=(node())},querySelectorAll(){return[]},addEventListener(e,f){listeners[e]=f},createElement(){return{click(){}}}};
const win={AULA_QUESTIONS:B,AULA_AREAS:A,setInterval(){},scrollTo(){}};
const store={getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)};
new Function("window","document","localStorage","setTimeout","clearTimeout","Blob","URL",js("app.js"))(win,document,store,()=>0,()=>{},()=>{},{});
assert.ok(nodes["app-content"].innerHTML.includes("Tu camino a la docencia"),"home visible");
function click(action,index=0,area){listeners.click({preventDefault(){},target:{id:"",closest(s){return s==="[data-action]"?{dataset:{action,idx:String(index),area}}:null}}})}
click("start-full");const current=JSON.parse(local.get("aulamerito_active_v1"));
assert.equal(current.ids.length,80);
const counts={};for(const id of current.ids){const q=B.find(q=>q.id===id);counts[q.area]=(counts[q.area]||0)+1}
for(const [a,n]of Object.entries({lectura:16,cuantitativo:16,matematicas:32,pedagogia:16}))assert.equal(counts[a],n);
click("option",0);click("finish-dialog");click("confirm-modal");
const H=JSON.parse(local.get("aulamerito_history_v1"));
assert.equal(H.length,1);assert.equal(H[0].answered,1);
assert.ok(nodes["app-content"].innerHTML.includes("RESULTADOS DE LA SESIÓN"));
console.log("OK: 152 preguntas válidas, 5 áreas, simulación 80 ítems 20/20/40/20 y flujo de resultados.");
