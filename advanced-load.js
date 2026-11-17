/* Keep original AM IDs unchanged for saved history; extend with advanced AV IDs. */
(function(){"use strict";
const old=window.AULA_QUESTIONS||[];
const keys=["AULA_ADV_MATH_A","AULA_ADV_MATH_B","AULA_ADV_QUANT","AULA_ADV_READING","AULA_ADV_PED"];
const skeys=["AULA_ADV_MATH_SOL_A","AULA_ADV_MATH_SOL_B","AULA_ADV_QUANT_SOL","AULA_ADV_READING_SOL","AULA_ADV_PED_SOL"];
const advanced=keys.flatMap(k=>window[k]||[]);
const solutions=Object.assign({},window.AULA_SOLUTIONS||{},...skeys.map(k=>window[k]||{}));
if(advanced.length!==80)throw Error("Se esperaban 80 ítems avanzados, se recibieron "+advanced.length);
const ids=new Set(old.map(q=>q.id));
for(const q of advanced){
 if(ids.has(q.id)||q.options.length!==4||new Set(q.options).size!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.passage||!solutions[q.id]||solutions[q.id].steps.length<2)throw Error("Ítem avanzado inválido: "+q.id);
 ids.add(q.id);
}
window.AULA_QUESTIONS=Object.freeze([...old,...advanced].map(q=>Object.freeze(q)));
window.AULA_SOLUTIONS=Object.freeze(solutions);
window.AULA_ADVANCED_META=Object.freeze({count:advanced.length,old:old.length,sourceUrl:"https://www.mineducacion.gov.co/1621/articles-190397_archivo_pdf_guia.pdf"});
})();