/* AulaMérito · Frontend estático gratuito. Datos solo en localStorage del navegador. */
(function(){
"use strict";
const BANK=window.AULA_QUESTIONS||[];
const AREAS=window.AULA_AREAS||{};
const CONTENT=document.getElementById("app-content");
const MODAL=document.getElementById("modal-root");
const STORAGE_ACTIVE="aulamerito_active_v1";
const STORAGE_HISTORY="aulamerito_history_v1";
const VERSION="1.0.0";
const CORE=["lectura","cuantitativo","matematicas","pedagogia"];
let currentView="inicio",reviewId=null,reviewFilter="all",toastTimer=null;
let active=read(STORAGE_ACTIVE,null);
let history=read(STORAGE_HISTORY,[]);
if(!Array.isArray(history))history=[];
const lookup=Object.fromEntries(BANK.map(q=>[q.id,q]));
if(active&&(!Array.isArray(active.ids)||active.ids.some(id=>!lookup[id])))active=null;
const number=x=>new Intl.NumberFormat("es-CO").format(x);
function read(k,fallback){try{const raw=localStorage.getItem(k);return raw?JSON.parse(raw):fallback}catch(_){return fallback}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}
function save(){write(STORAGE_ACTIVE,active);write(STORAGE_HISTORY,history)}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function shuffle(items){let a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function date(s){return new Date(s).toLocaleDateString("es-CO",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
function fmtSec(sec){const x=Math.max(0,Math.floor(sec));return String(Math.floor(x/60)).padStart(2,"0")+":"+String(x%60).padStart(2,"0")}
function fmtClock(s){const x=Math.max(0,Math.floor(s));return String(Math.floor(x/3600)).padStart(2,"0")+":"+String(Math.floor((x%3600)/60)).padStart(2,"0")+":"+String(x%60).padStart(2,"0")}
function areaName(a){return AREAS[a]?.label||a}
function areaCount(a){return BANK.filter(q=>q.area===a).length}
function button(text,action,style,extra){return '<button class="btn '+(style||"btn-primary")+'" data-action="'+esc(action)+'" '+(extra||"")+">"+text+"</button>"}
function tag(text,type){return '<span class="pill '+(type||"")+'">'+text+"</span>"}
function header(k,title,desc){return '<div class="page-heading"><div><span class="kicker">'+k+'</span><h1>'+title+'</h1>'+(desc?'<p>'+desc+"</p>":"")+"</div></div>"}
function section(title,extra){return '<div class="section-heading"><h2>'+title+"</h2>"+(extra||"")+"</div>"}
function infoBox(){return '<div class="note-box"><strong>Simulador independiente.</strong> Los ítems son originales y no han sido publicados por la CNSC. El modo mixto usa como referencia histórica 20 / 20 / 40 / 20 (Decreto 574 de 2022). El anexo 2026 también contempla competencias blandas, disponibles en un módulo aparte: sus pesos internos aún no están confirmados en una guía oficial. Cantidades y tiempos de esta web son solo de práctica.</div>'}
function topicCard(key){const a=AREAS[key];return '<button class="topic-card" data-action="area" data-area="'+key+'"><span class="topic-icon tone-'+a.tone+'">'+a.icon+'</span><h3>'+esc(a.label)+'</h3><p>'+esc(a.desc)+'</p><span class="topic-cta">'+areaCount(key)+' preguntas disponibles · Practicar →</span></button>'}
function metric(title,val,note,icon){return '<div class="stat-card"><div class="stat-top"><span class="stat-title">'+title+'</span><span class="stat-icon">'+icon+'</span></div><strong>'+val+'</strong><span class="stat-note">'+note+"</span></div>"}
function validResults(){return history.filter(h=>!h.psych&&h.total>0)}
function avgScore(){const arr=validResults();return arr.length?Math.round(arr.reduce((s,h)=>s+h.score,0)/arr.length)+"%":"—"}
function bestScore(){const arr=validResults();return arr.length?Math.max(...arr.map(h=>h.score))+"%":"—"}
function answered(){return active?active.ids.filter(id=>active.answers[id]!==undefined).length:0}
function heroResume(){return active?'<div class="card" style="margin-top:20px;display:flex;justify-content:space-between;align-items:center;gap:15px;flex-wrap:wrap"><div><strong>✦ Tienes un examen pendiente</strong><p style="margin:4px 0 0;font-size:12px">'+esc(modeName(active.mode,active.area))+' · '+answered()+' de '+active.ids.length+' respondidas</p></div>'+button("Continuar →","resume","btn-primary")+"</div>":""}
function home(){
const completed=validResults().length;const total=history.length;
CONTENT.innerHTML='<section class="hero"><div><span class="hero-tag">PREPARACIÓN CON PROPÓSITO</span><h1>Tu camino a la docencia comienza aquí.</h1><p>Practica con criterio, entiende cada respuesta y fortalece tus competencias para el concurso docente de Matemáticas en Quindío.</p><div class="hero-actions">'+button("Comenzar simulacro →","start-quick","btn-white")+button("Explorar temas","go-temas","btn-outline")+'</div></div></section>'+
heroResume()+
'<div class="stats-grid">'+metric("Simulacros realizados",String(total),"Sesiones finalizadas","▣")+metric("Promedio",avgScore(),"Pruebas de conocimientos","◷")+metric("Mejor resultado",bestScore(),"Tu marca personal","★")+metric("Banco de preguntas",number(BANK.filter(q=>q.answer!==null).length),"Más situaciones de reflexión","∑")+"</div>"+
section("Prepara cada componente",'<button class="link-button" data-action="go-temas">Ver todas las áreas →</button>')+
'<div class="topic-grid">'+CORE.concat(["blandas"]).map(topicCard).join("")+'</div>'+
section("Estructura de referencia del concurso")+
'<div class="grid-2"><div class="card"><h3>Conocimientos específicos y pedagógicos</h3><p style="font-size:12px">Distribución para docentes según Decreto 574 de 2022. La prueba de conocimientos tiene carácter eliminatorio.</p>'+CORE.map(a=>'<div class="score-bar"><div class="score-row"><span>'+esc(areaName(a))+'</span><strong>'+AREAS[a].weight+' %</strong></div><div class="weight-track"><div class="weight-fill" style="width:'+AREAS[a].weight+'%"></div></div></div>').join("")+'</div><div class="card"><h3>Una rutina que sí se sostiene</h3><div class="steps"><div class="step"><p><strong>Practica 20 preguntas.</strong> Empieza con una sesión breve sin distracciones.</p></div><div class="step"><p><strong>Revisa tus errores.</strong> Comprende por qué una opción es mejor que las demás.</p></div><div class="step"><p><strong>Refuerza un componente.</strong> Dedica más tiempo a las áreas de menor puntuación.</p></div><div class="step"><p><strong>Realiza un simulacro amplio.</strong> Comprueba el progreso en condiciones cronometradas.</p></div></div></div></div>'+
'<div style="margin-top:21px">'+infoBox()+'</div>';
}
function modeName(mode,area){
return mode==="full"?"Simulacro completo (80)":mode==="medium"?"Simulacro intermedio (40)":mode==="quick"?"Simulacro rápido (20)":mode==="area"?"Práctica · "+areaName(area):"Reflexión situacional";
}
function modeCard(icon,title,desc,count,mins,action){
return '<div class="mode-card"><span class="mode-emoji">'+icon+'</span><h3>'+title+'</h3><p>'+desc+'</p><div class="mode-meta">'+tag(count+" preguntas","pill-purple")+tag(mins,"")+'</div>'+button("Iniciar →",action,"btn-primary")+"</div>";
}
function sims(){
CONTENT.innerHTML=header("ENTRENA CON INTENCIÓN","Simulacros de práctica","Elige la duración. El simulacro mixto usa la distribución histórica 20 / 20 / 40 / 20, no confirmada para 2026. Practica competencias blandas por separado.")+
(active?'<div style="margin-bottom:20px">'+heroResume()+'</div>':"")+
'<div class="grid-3">'+
modeCard("⚡","Rápido","Una sesión de repaso cuando dispones de poco tiempo. Preguntas aleatorias.",20,"30 min · sugeridos","start-quick")+
modeCard("◎","Intermedio","Equilibrio entre cobertura, análisis y resistencia.",40,"60 min · sugeridos","start-medium")+
modeCard("◈","Completo","Entrena la concentración en los cuatro componentes sin revelación de respuestas.",80,"120 min · sugeridos","start-full")+
'</div><div style="margin-top:22px">'+infoBox()+'</div>'+
section("Distribución de preguntas")+
'<div class="card"><div class="grid-2">'+CORE.map(a=>'<div><span class="small strong">'+esc(areaName(a))+'</span><div class="weight-track"><div class="weight-fill" style="width:'+AREAS[a].weight+'%"></div></div><span class="subtle">'+AREAS[a].weight+' % · '+(AREAS[a].weight*80/100)+' ítems en el simulacro completo</span></div>').join("")+'</div><p style="font-size:12px;margin:16px 0 0">El cronómetro y el número de preguntas de estos modos son diseños de práctica y no deben confundirse con la duración real anunciada en la futura guía de orientación al aspirante.</p></div>';
}
function temas(){
CONTENT.innerHTML=header("APRENDIZAJE ENFOCADO","Práctica por componente","Aprende con retroalimentación inmediata después de cada respuesta.")+
'<div class="topic-grid">'+CORE.concat(["blandas"]).map(topicCard).join("")+'</div>'+
section("Práctica situacional y psicotécnica")+
'<div class="card" style="display:flex;align-items:center;justify-content:space-between;gap:15px;flex-wrap:wrap"><div><h3>◇ Situaciones de criterio profesional</h3><p style="margin:4px 0 0;font-size:12px;max-width:600px">12 situaciones de reflexión sobre ética, convivencia y trabajo docente. Sin puntuación ni supuestas respuestas oficiales; no sustituye la evaluación psicotécnica.</p></div>'+button("Comenzar →","start-psych","btn-soft")+"</div>"+
section("Cómo practicar mejor")+
'<div class="grid-2"><div class="card"><h3>Si vienes de Ingeniería Electrónica...</h3><p style="font-size:13px">Tu formación puede facilitar álgebra y funciones, pero no descuides lectura crítica, razonamiento cuantitativo ni didáctica. Resolver un problema y explicar cómo enseñarlo son competencias diferentes.</p></div><div class="card"><h3>Evita memorizar letras</h3><p style="font-size:13px">Las opciones de respuesta se mezclan en cada nueva sesión. En las prácticas por área recibirás una justificación; en los simulacros se revela al terminar.</p></div></div>';
}
function progreso(){
const valid=validResults();const total=history.length;const recent=history.slice().reverse();
const counters={};CORE.concat(["blandas"]).forEach(a=>counters[a]={correct:0,total:0});
valid.forEach(h=>{Object.keys(h.byArea||{}).forEach(a=>{if(counters[a]){counters[a].correct+=h.byArea[a].correct;counters[a].total+=h.byArea[a].total}})});
CONTENT.innerHTML=header("EVOLUCIÓN PERSONAL","Mi progreso","Tu historial se almacena únicamente en este navegador, sin cuentas ni servidor.")+
'<div class="stats-grid">'+metric("Sesiones completadas",total,"Incluye práctica situacional","▣")+metric("Promedio general",avgScore(),"Solo conocimientos","◷")+metric("Mejor puntaje",bestScore(),"Tu mejor sesión","★")+metric("Preguntas resueltas",number(history.reduce((s,h)=>s+h.answered,0)),"En sesiones terminadas","✎")+"</div>"+
section("Dominio por componente")+
'<div class="card">'+CORE.concat(["blandas"]).map(a=>{let z=counters[a],p=z.total?Math.round(100*z.correct/z.total):0;return '<div class="score-bar"><div class="score-row"><span>'+areaName(a)+'</span><strong>'+(z.total?p+" %":"Sin datos")+'</strong></div><div class="weight-track"><div class="weight-fill" style="width:'+p+'%;background:'+(p<60?"#e4a53d":"#6256e8")+'"></div></div><span class="subtle">'+z.correct+' aciertos de '+z.total+' respuestas</span></div>'}).join("")+"</div>"+
section("Historial de sesiones")+
'<div class="card">'+(recent.length?recent.map(h=>'<div class="history-row"><div class="history-main"><strong>'+esc(h.label)+'</strong><small>'+date(h.date)+' · '+h.answered+' de '+h.total+' respondidas</small></div><div style="display:flex;align-items:center;gap:13px"><div class="history-value">'+(h.psych?"—":h.score+"%")+'</div>'+button("Revisar","review-"+h.id,"btn-outline")+"</div></div>").join(""):'<div class="empty-state"><span class="empty-icon">◷</span><h3>Aún no hay resultados</h3><p>Realiza una sesión para ver tu evolución por componente.</p>'+button("Empezar ahora","go-simulacros","btn-primary")+"</div>")+"</div>"+
'<div style="margin-top:18px;display:flex;justify-content:flex-end">'+(total?button("Exportar progreso (JSON)","export","btn-outline"):"")+'</div>';
}
const sources=[
["CNSC · Convocatoria Docentes 2026","Acuerdos, avisos, etapas y documentos oficiales.","https://www.cnsc.gov.co/convocatorias/docentes-y-directivos-docentes-2026"],
["CNSC · Anexo técnico 2026","Condiciones específicas de etapas del proceso de selección.","https://www.cnsc.gov.co/node/69894"],
["CNSC · Acuerdos Quindío y Armenia","Acuerdo 284 (Quindío) y acuerdo 279 (Armenia).","https://www.cnsc.gov.co/node/69870"],
["Función Pública · Decreto 574 de 2022","Componentes, ponderaciones y carácter eliminatorio de conocimientos.","https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=185446"],
["MEN · Estándares de Competencias","Referentes curriculares para educación básica y media.","https://www.mineducacion.gov.co/1780/w3-article-340021.html"],
["Colombia Aprende · DBA Matemáticas","Aprendizajes estructurantes, evidencias y secuencias por grado.","https://colombiaaprende.edu.co/recurso-coleccion/derechos-basicos-de-aprendizaje-matematicas"],
["MEN · Estándares Matemáticas (PDF)","Cinco pensamientos matemáticos y desarrollo de competencias.","https://www.mineducacion.gov.co/1621/articles-116042_archivo_pdf2.pdf"],
["MEN · Guía 31: competencias comportamentales","Referentes de liderazgo, trabajo colaborativo, compromiso y comunicación docente.","https://www.mineducacion.gov.co/portal/men/Publicaciones/Guias/169241:Guia-No-31-Guia-Metodologica-Evaluacion-Anual-de-Desempeno-Laboral"],
["MEN · Resolución 3842 de 2022","Manual de funciones, requisitos y competencias docentes.","https://www.mineducacion.gov.co/1780/articles-373226_recurso_2.pdf"],
["SIMO · Inscripciones y OPEC","Consulta de empleos, requisitos específicos y etapas.","https://simo.cnsc.gov.co"]
];
function recursos(){
CONTENT.innerHTML=header("CONOCE LA CONVOCATORIA","Guía y fuentes oficiales","Recursos verificables para estudiar sin depender de bancos de preguntas dudosos.")+
'<div class="warning-box"><strong>Lo que este simulador sí y no representa.</strong> La estructura 20/20/40/20 proviene del Decreto 574 de 2022. El anexo técnico de 2026 contempla también competencias blandas; su peso interno definitivo está pendiente de publicación. Los ejercicios, opciones, cronómetros, distribución interna por temas y puntuaciones de práctica son elaboraciones independientes. La guía oficial que publique la CNSC para las pruebas 2026–2027 prevalecerá sobre cualquier ejemplo de esta web. La práctica situacional NO genera una puntuación psicotécnica.</div>'+
section("Material de estudio prioritario")+
'<div class="source-list">'+sources.map(s=>'<div class="source-row"><div><h3>'+esc(s[0])+'</h3><p>'+esc(s[1])+'</p></div><a href="'+esc(s[2])+'" target="_blank" rel="noopener noreferrer">Consultar ↗</a></div>').join("")+"</div>"+
section("Ruta sugerida para una ingeniera electrónica")+
'<div class="card"><div class="steps"><div class="step"><p><strong>Confirmar requisitos.</strong> Verificar en SIMO la OPEC de docente de Matemáticas, título habilitante y entidad territorial.</p></div><div class="step"><p><strong>Diagnóstico.</strong> Realizar un simulacro completo y registrar las áreas débiles.</p></div><div class="step"><p><strong>Estudio disciplinar.</strong> Priorizar álgebra, funciones, geometría, estadística, probabilidad, cálculo y didáctica matemática.</p></div><div class="step"><p><strong>Pedagogía.</strong> Revisar evaluación formativa, DUA, inclusión, convivencia, PEI, SIEE y los DBA.</p></div><div class="step"><p><strong>Lectura y razonamiento.</strong> Practicar inferencias, evaluación de argumentos, tablas, porcentajes y modelación.</p></div><div class="step"><p><strong>Simular y corregir.</strong> Repetir pruebas con preguntas mezcladas y revisar cada explicación.</p></div></div></div>'+
'<div style="margin-top:20px">'+infoBox()+"</div>";
}
function take(area,n){return shuffle(BANK.filter(q=>q.area===area)).slice(0,n)}
function start(mode,area){
if(active){showConfirm("Ya tienes una sesión en curso","Iniciar otra sesión reemplazará la sesión sin terminar. Los resultados anteriores no se borrarán.",()=>createSession(mode,area));return}
createSession(mode,area);
}
function createSession(mode,area){
MODAL.innerHTML="";
let picked=[],duration=0;
if(mode==="psych"){picked=take("psicotecnica",12);duration=0}
else if(mode==="area"){picked=take(area,Math.min(20,areaCount(area)));duration=0}
else{let amount=mode==="full"?80:mode==="medium"?40:20;let weights={lectura:.2,cuantitativo:.2,matematicas:.4,pedagogia:.2};
CORE.forEach(k=>picked.push(...take(k,Math.round(amount*weights[k]))));duration=amount===80?120*60:amount===40?60*60:30*60}
picked=shuffle(picked);
const order={};picked.forEach(q=>order[q.id]=shuffle([0,1,2,3]));
const ts=Date.now();active={id:ts,mode,area:area||null,ids:picked.map(q=>q.id),order,answers:{},flags:{},idx:0,started:ts,deadline:duration?ts+duration*1000:null,duration};save();currentView="exam";render();window.scrollTo(0,0)
}
function finish(auto){
if(!active)return;
const s=active;const rows=s.ids.map(id=>lookup[id]);const per={};CORE.concat(["blandas"]).forEach(k=>per[k]={correct:0,total:0});
let correct=0,responded=0;
rows.forEach(q=>{const answer=s.answers[q.id];if(answer!==undefined)responded++;if(q.answer!==null){per[q.area].total++;if(answer===q.answer){correct++;per[q.area].correct++}}});
const psych=s.mode==="psych";const score=psych?null:Math.round(correct/rows.length*100);
const result={id:s.id,mode:s.mode,area:s.area,label:modeName(s.mode,s.area),date:new Date().toISOString(),ids:s.ids,order:s.order,answers:s.answers,flags:s.flags,answered:responded,total:rows.length,correct,score,byArea:per,psych,seconds:Math.floor((Date.now()-s.started)/1000),auto:!!auto};
history.push(result);if(history.length>75)history=history.slice(-75);active=null;save();reviewId=result.id;currentView="results";MODAL.innerHTML="";render();window.scrollTo(0,0);
if(auto)toast("El tiempo de práctica terminó y se guardó tu resultado.");
}
function answer(index){
if(!active)return;const q=lookup[active.ids[active.idx]];if(!q)return;
if(active.mode==="area"&&active.answers[q.id]!==undefined)return;
const original=active.order[q.id][index];active.answers[q.id]=original;save();renderExam(false)
}
function move(step){if(!active)return;active.idx=Math.min(active.ids.length-1,Math.max(0,active.idx+step));save();renderExam(true)}
function gotoQuestion(n){if(!active||n<0||n>=active.ids.length)return;active.idx=n;save();renderExam(true)}
function toggleFlag(){if(!active)return;const id=active.ids[active.idx];active.flags[id]=!active.flags[id];save();renderExam(false)}
function renderExam(doScroll){
if(!active){navigate("inicio");return}
const s=active,q=lookup[s.ids[s.idx]],resp=s.answers[q.id],n=answered(),percent=Math.round(n/s.ids.length*100);
const practice=s.mode==="area",showWhy=practice&&resp!==undefined;
const psych=s.mode==="psych";
CONTENT.innerHTML='<div class="exam-top"><div><span class="kicker">'+(psych?"PRÁCTICA REFLEXIVA":practice?"ENTRENAMIENTO GUIADO":"SIMULACRO CRONOMETRADO")+'</span><h2>'+esc(modeName(s.mode,s.area))+'</h2><p>Pregunta '+(s.idx+1)+' de '+s.ids.length+' · '+n+' respondidas</p></div><div style="display:flex;gap:10px;align-items:center">'+(s.deadline?'<div class="clock" id="clock" aria-label="Tiempo restante">--:--:--</div>':tag("Sin cronómetro","pill-purple"))+'</div></div>'+
'<div class="exam-progress" aria-label="Progreso de respuestas"><span style="width:'+percent+'%"></span></div>'+
'<div class="exam-layout"><section><div class="question-card"><div class="question-category">'+tag(esc(areaName(q.area)),"pill-purple")+tag(esc(q.topic),"")+'</div>'+
(q.passage?'<div class="question-context">'+esc(q.passage)+'</div>':"")+
'<div class="question-prompt">'+esc(q.prompt)+'</div>'+
'<div class="option-list">'+s.order[q.id].map((ix,j)=>{const chosen=resp===ix;const correct=showWhy&&ix===q.answer;const wrong=showWhy&&chosen&&ix!==q.answer;const cls=correct?" correct":wrong?" incorrect":chosen?" selected":"";return '<button class="option'+cls+'" data-action="option" data-idx="'+j+'" '+(showWhy?"disabled ":"")+'aria-pressed="'+chosen+'"><span class="option-letter">'+String.fromCharCode(65+j)+'</span><span>'+esc(q.options[ix])+'</span></button>'}).join("")+"</div>"+
(showWhy?'<div class="explanation"><strong>✓ Explicación</strong><p>'+esc(q.explain)+'</p></div>':psych&&resp!==undefined?'<div class="explanation" style="background:#f5f3ff;border-color:#e5dfff;color:#5a4dac"><strong>Reflexión</strong><p>'+esc(q.explain)+'</p></div>':"")+
'<div class="question-controls">'+button(s.flags[q.id]?"⚑ Quitar marca":"⚑ Marcar para revisar","flag","btn-outline")+'<div class="control-right">'+button("← Anterior","prev","btn-outline",s.idx===0?"disabled":"")+button(s.idx===s.ids.length-1?"Ir al resumen →":"Siguiente →",s.idx===s.ids.length-1?"finish-dialog":"next","btn-primary")+'</div></div></div></section>'+
'<aside class="exam-side"><div class="card"><h3>Navegación</h3><span class="subtle">Selecciona una pregunta para volver</span><div class="question-map">'+s.ids.map((id,i)=>'<button class="map-index'+(s.answers[id]!==undefined?" answered":"")+(s.idx===i?" current":"")+(s.flags[id]?" flagged":"")+'" data-action="goto" data-idx="'+i+'" aria-label="Pregunta '+(i+1)+(s.answers[id]!==undefined?", respondida":"")+'">'+(i+1)+'</button>').join("")+'</div><div class="legend"><span><i class="g-current"></i>Actual</span><span><i></i>Contestada</span><span><i class="g-flag"></i>Marcada</span></div><div style="margin-top:17px">'+button("Finalizar sesión","finish-dialog","btn-outline","style='width:100%'")+'</div></div><p class="subtle" style="padding:12px 6px">Las respuestas se guardan automáticamente en este dispositivo. '+(psych?"Este módulo no tiene respuestas oficiales ni nota.":practice?"Revisa la explicación de cada respuesta.":"Las respuestas y explicaciones se muestran al finalizar.")+'</p></aside></div>';
updateClock();if(doScroll)window.scrollTo({top:0,behavior:"smooth"});
}
function updateClock(){if(!active||!active.deadline)return;const remaining=Math.ceil((active.deadline-Date.now())/1000);const el=document.getElementById("clock");if(remaining<=0){finish(true);return}if(el){el.textContent=fmtClock(remaining);el.classList.toggle("warn",remaining<300)}}
function getResult(id){return history.find(h=>String(h.id)===String(id))}
function results(){
const h=getResult(reviewId)||history[history.length-1];if(!h){navigate("progreso");return}
reviewId=h.id;const psych=h.psych,missed=h.total-h.answered;
CONTENT.innerHTML=header("RESULTADOS DE LA SESIÓN",psych?"Tu reflexión ha quedado guardada":"Una oportunidad para avanzar","Revisa tus respuestas y descubre qué estudiar a continuación.")+
'<div class="score-hero"><div><span class="eyebrow" style="color:#cac7ff">'+esc(h.label)+'</span><h2 style="font-size:22px;margin-top:9px">'+(psych?"Práctica situacional completada":h.score>=80?"¡Muy buen trabajo!":h.score>=60?"¡Buen punto de partida!":"Cada error es una pista para mejorar")+'</h2><p>'+date(h.date)+' · '+fmtSec(h.seconds)+' de estudio · '+h.answered+' respuestas registradas</p></div><div><span class="score-number">'+(psych?"—":h.score+"%")+'</span><p>'+(psych?"Sin calificación (orientativo)":h.correct+" de "+h.total+" correctas")+"</p></div></div>"+
'<div class="stats-grid" style="margin:0 0 22px">'+metric("Respondidas",h.answered+"/"+h.total,"Cobertura de la sesión","◈")+metric("Sin responder",missed,"Preguntas pendientes","◷")+metric("Duración",fmtSec(h.seconds),"Tiempo empleado","⌛")+metric(psych?"Reflexión":"Aciertos",psych?"—":h.correct,"Revisión disponible","✓")+"</div>"+
(!psych?'<div class="card"><h3>Resultado por componente</h3>'+CORE.concat(["blandas"]).filter(a=>h.byArea[a]?.total).map(a=>{let z=h.byArea[a],p=Math.round(z.correct/z.total*100);return '<div class="score-bar"><div class="score-row"><span>'+areaName(a)+'</span><strong>'+z.correct+'/'+z.total+' · '+p+' %</strong></div><div class="weight-track"><div class="weight-fill" style="width:'+p+'%;background:'+(p<60?"#e8a644":"#6256e8")+'"></div></div></div>'}).join("")+'<p class="subtle">La nota mostrada es el porcentaje de aciertos de este ejercicio. No es la puntuación oficial de la CNSC.</p></div>':'<div class="note-box">Estas preguntas no tienen una respuesta correcta oficial; ayudan a reflexionar sobre escenarios habituales de la profesión. No permiten predecir un resultado psicotécnico.</div>')+
'<div class="section-heading"><h2>Revisión detallada</h2><div style="display:flex;gap:6px;flex-wrap:wrap">'+button("Todas","filter-all",reviewFilter==="all"?"btn-primary":"btn-outline")+(!psych?button("Errores y omisiones","filter-wrong",reviewFilter==="wrong"?"btn-primary":"btn-outline"):"")+'</div></div><div class="review-list" id="review-content">'+renderReviewContent(h)+'</div>'+
'<div style="margin-top:25px;display:flex;gap:10px;flex-wrap:wrap">'+button("Nuevo simulacro →","go-simulacros","btn-primary")+button("Mi progreso","go-progreso","btn-outline")+"</div>";
}
function renderReviewContent(h){
let items=h.ids.map((id,i)=>({q:lookup[id],i})).filter(x=>reviewFilter==="all"||h.answers[x.q.id]!==x.q.answer);
if(!items.length)return '<div class="empty-state"><h3>¡Sin errores en este filtro!</h3><p>Has respondido correctamente todas estas preguntas.</p></div>';
return items.map(x=>{const q=x.q,ans=h.answers[q.id],c=q.answer;const sel=ans===undefined?"Sin responder":q.options[ans];const ok=ans===c;return '<article class="review-item">'+tag("Pregunta "+(x.i+1)+" · "+esc(areaName(q.area)),"pill-purple")+(q.answer===null?tag("Sin calificación",""):tag(ok?"Correcta":"Para revisar",ok?"pill-green":"pill-red"))+(q.passage?'<p style="background:#f5f7fb;padding:10px 12px;border-radius:8px;white-space:pre-wrap">'+esc(q.passage)+'</p>':"")+'<h4>'+esc(q.prompt)+'</h4><p>Tu respuesta: <span class="choice">'+esc(sel)+'</span></p>'+(q.answer!==null?'<p>Respuesta esperada: <span class="choice">'+esc(q.options[c])+'</span></p>':"")+'<div class="why">'+esc(q.explain)+'</div></article>'}).join("");
}
function navigate(view){
const allowed=["inicio","simulacros","temas","progreso","recursos","exam","results"];currentView=allowed.includes(view)?view:"inicio";if(currentView==="exam"&&!active)currentView="inicio";document.querySelectorAll(".nav-link").forEach(el=>el.classList.toggle("active",el.dataset.view===currentView));document.getElementById("sidebar").classList.remove("open");render();window.scrollTo(0,0);
}
function render(){
document.querySelectorAll(".nav-link").forEach(el=>el.classList.toggle("active",el.dataset.view===currentView));
if(currentView==="inicio")home();else if(currentView==="simulacros")sims();else if(currentView==="temas")temas();else if(currentView==="progreso")progreso();else if(currentView==="recursos")recursos();else if(currentView==="exam")renderExam(false);else if(currentView==="results")results();
}
function showConfirm(title,textContent,onYes){
MODAL.innerHTML='<div class="modal-overlay" id="modal-overlay"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><h2 id="modal-title">'+esc(title)+'</h2><p>'+esc(textContent)+'</p><div class="modal-actions">'+button("Cancelar","cancel-modal","btn-outline")+button("Confirmar","confirm-modal","btn-primary")+"</div></div></div>";
MODAL._onYes=onYes;
}
function toast(message){const el=document.getElementById("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),3500)}
function exportData(){
const str=JSON.stringify({app:"AulaMérito",version:VERSION,exportedAt:new Date().toISOString(),history},null,2);
const blob=new Blob([str],{type:"application/json;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="aulamerito-progreso.json";a.click();URL.revokeObjectURL(url);toast("Progreso exportado. Conserva el archivo en lugar seguro.")
}
function dispatch(action,buttonEl){
if(action==="go-temas")return navigate("temas");
if(action==="go-simulacros")return navigate("simulacros");
if(action==="go-progreso")return navigate("progreso");
if(action==="start-full")return start("full");
if(action==="start-medium")return start("medium");
if(action==="start-quick")return start("quick");
if(action==="start-psych")return start("psych");
if(action==="area")return start("area",buttonEl.dataset.area);
if(action==="resume")return navigate("exam");
if(action==="option")return answer(Number(buttonEl.dataset.idx));
if(action==="prev")return move(-1);
if(action==="next")return move(1);
if(action==="goto")return gotoQuestion(Number(buttonEl.dataset.idx));
if(action==="flag")return toggleFlag();
if(action==="finish-dialog"){const blank=active?active.ids.length-answered():0;return showConfirm("¿Finalizar esta sesión?","Las respuestas se calificarán y podrás revisar las explicaciones."+(blank?" Quedan "+blank+" preguntas sin responder.":""),()=>finish(false))}
if(action==="cancel-modal"){MODAL.innerHTML="";return}
if(action==="confirm-modal"){const fn=MODAL._onYes;MODAL.innerHTML="";if(typeof fn==="function")fn();return}
if(action.startsWith("review-")){reviewId=Number(action.replace("review-",""));reviewFilter="all";return navigate("results")}
if(action==="filter-all"||action==="filter-wrong"){reviewFilter=action==="filter-all"?"all":"wrong";return results()}
if(action==="export")return exportData();
}
document.addEventListener("click",e=>{
const button=e.target.closest("[data-action]");if(button){e.preventDefault();dispatch(button.dataset.action,button);return}
const nav=e.target.closest("[data-view]");if(nav){e.preventDefault();navigate(nav.dataset.view);return}
if(e.target.id==="modal-overlay")MODAL.innerHTML="";
if(e.target.id==="mobile-menu")document.getElementById("sidebar").classList.toggle("open");
if(e.target.closest(".brand")){e.preventDefault();navigate("inicio")}
});
document.addEventListener("keydown",e=>{
if(!active||currentView!=="exam"||MODAL.innerHTML||e.altKey||e.ctrlKey||e.metaKey)return;
if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;
const key=e.key.toLowerCase();const i=["1","2","3","4"].indexOf(key),j=["a","b","c","d"].indexOf(key);
if(i>=0||j>=0){e.preventDefault();answer(i>=0?i:j)}
if(key==="arrowright"){e.preventDefault();move(1)}
if(key==="arrowleft"){e.preventDefault();move(-1)}
if(key==="f"){e.preventDefault();toggleFlag()}
});
if(!BANK.length){CONTENT.innerHTML='<div class="warning-box">No se pudo cargar el banco de preguntas. Recarga la página.</div>';return}
window.setInterval(updateClock,1000);
if(active&&active.deadline&&Date.now()>=active.deadline)finish(true);else render();
})();
