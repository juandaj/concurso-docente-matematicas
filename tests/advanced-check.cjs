/* Valida las preguntas avanzadas y la compatibilidad con sesiones históricas. */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const modules=["questions.js","solutions.js","advanced-math-a.js","advanced-math-b.js","advanced-quant.js","advanced-reading.js","advanced-pedagogy.js","advanced-load.js"];
const win={setInterval(){},scrollTo(){}};
for(const mod of modules){new vm.Script(read(mod),{filename:mod});new Function("window",read(mod))(win)}
const bank=win.AULA_QUESTIONS,worked=win.AULA_SOLUTIONS;
assert.equal(bank.length,232,"152 base + 80 avanzada");
const old=bank.filter(q=>!q.difficulty),advanced=bank.filter(q=>q.difficulty==="avanzado");
assert.equal(old.length,152);assert.equal(advanced.length,80);
const want={matematicas:32,cuantitativo:16,lectura:16,pedagogia:16};
for(const [area,n]of Object.entries(want))assert.equal(advanced.filter(q=>q.area===area).length,n,area);
const used=new Set(),prompts=new Set();
for(const q of bank){
 assert.ok(!used.has(q.id),"ID duplicado "+q.id);used.add(q.id);
 if(!q.difficulty)continue;
 assert.ok(!prompts.has(q.prompt),"Enunciado avanzado repetido: "+q.id);prompts.add(q.prompt);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options).size,4,"Distractor duplicado "+q.id);
 assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
 assert.ok(q.passage.length>100,"Caso contextual insuficiente "+q.id);
 assert.ok(q.explain.length>65,"Justificación breve "+q.id);
 assert.ok(worked[q.id]?.steps?.length>=2,"Sin procedimiento "+q.id);
}
const html=read("index.html");
const expectedOrder=modules.concat(["app.js"]);
let prev=-1;
for(const name of expectedOrder){
 const idx=html.indexOf('src="'+name+'?v=1.2.0"');
 assert.ok(idx>prev,name+" no figura después de sus dependencias");
 prev=idx;
}
function fixture(seeds={}){
 const nodes={},listeners={},storage=new Map(Object.entries(seeds).map(([k,v])=>[k,JSON.stringify(v)]));
 const node=()=>({innerHTML:"",textContent:"",classList:{add(){},remove(){},toggle(){}},dataset:{}});
 const doc={getElementById:k=>nodes[k]??=node(),querySelectorAll:()=>[],addEventListener:(e,fn)=>listeners[e]=fn,createElement:()=>({click(){}})};
 const local={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 new Function("window","document","localStorage","setTimeout","clearTimeout","Blob","URL",read("app.js"))(win,doc,local,()=>0,()=>{},()=>{},{});
 return {nodes,click(action,extra={}){listeners.click({target:{id:"",closest:s=>s==="[data-action]"?{dataset:{action,...extra}}:null},preventDefault(){}})},
 active(){return JSON.parse(storage.get("aulamerito_active_v1")||"null")},
 results(){return JSON.parse(storage.get("aulamerito_history_v1")||"[]")},
 html(){return nodes["app-content"].innerHTML}};
}
const a=fixture();a.click("go-simulacros");assert.ok(a.html().includes("Selecciona la dificultad"));
a.click("start-full");const full=a.active();
assert.equal(full.ids.length,80);assert.equal(full.level,"avanzado");
assert.ok(full.ids.every(id=>bank.find(q=>q.id===id).difficulty==="avanzado"));
for(const [area,n]of Object.entries(want))assert.equal(full.ids.filter(id=>bank.find(q=>q.id===id).area===area).length,n);
a.click("option",{idx:"0"});assert.ok(!a.html().includes("solution-panel"),"Modo examen filtra respuestas");
a.click("finish-dialog");a.click("confirm-modal");
assert.equal(a.results()[0].level,"avanzado");assert.ok(a.html().includes("solution-panel"));
const b=fixture();b.click("go-simulacros");b.click("set-feedback",{section:"mixed",mode:"instant"});
b.click("start-quick");assert.equal(b.active().deadline,null);
b.click("option",{idx:"0"});assert.ok(b.html().includes("solution-panel"),"Retroalimentación instantánea no visible");
const c=fixture();c.click("go-simulacros");c.click("set-level",{level:"fundamentos"});c.click("start-quick");
assert.ok(c.active().ids.every(id=>!bank.find(q=>q.id===id).difficulty),"El nivel básico debe conservar las preguntas originales");
const d=fixture();d.click("go-simulacros");d.click("set-level",{level:"mixto"});d.click("start-medium");
const selected=d.active().ids.map(id=>bank.find(q=>q.id===id));
assert.ok(selected.some(q=>q.difficulty==="avanzado")&&selected.some(q=>!q.difficulty),"Mixto debe contener ambos bancos");
const legacy={id:3,mode:"quick",area:null,label:"Sesión anterior",date:new Date().toISOString(),ids:["AM049"],order:{AM049:[0,1,2,3]},answers:{"AM049":1},flags:{},answered:1,total:1,correct:1,score:100,byArea:{lectura:{total:0,correct:0},cuantitativo:{total:0,correct:0},matematicas:{total:1,correct:1},pedagogia:{total:0,correct:0}},psych:false,seconds:30};
const e=fixture({aulamerito_history_v1:[legacy]});e.click("go-progreso");assert.ok(e.html().includes("Sesión anterior"));
console.log("OK: 232 preguntas, 80 avanzadas contextuales, niveles, explicaciones, historial previo y opciones de retroalimentación.");
