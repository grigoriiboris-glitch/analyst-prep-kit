/* Render approved Google Drive _edited copy in the learner-facing modules.
 * Interactive exercises and their answer-checking code are intentionally preserved.
 */
(function () {
  "use strict";
  var current = document.currentScript;
  var moduleKey = current && current.getAttribute("data-module");
  if (!moduleKey) return;
  function parseSource(raw) {
    var text=String(raw||"").replace(/\r\n?/g,"\n"), found=[], match;
    var pattern=/^\s*(?:#{1,6}\s*)?(?:\d{1,2}\.\s*)?Урок\s+(\d+)\s*\.\s*(.+?)\s*$/gim;
    while((match=pattern.exec(text))) found.push({number:Number(match[1]),title:match[2].trim(),start:match.index,end:pattern.lastIndex});
    if(found.length) return found.map(function(item,index){
      return {number:item.number,title:item.title,body:text.slice(item.end,index+1<found.length?found[index+1].start:text.length).trim()};
    }).filter(function(item){return item.body.length>15;});
    if(moduleKey==="portfolio-projects"){
      var projectPattern=/Проект\s+([1-3])\.\s*([^\n]+)/gi,projects=[];
      while((match=projectPattern.exec(text))) projects.push({number:Number(match[1]),title:match[2].trim(),start:match.index,end:projectPattern.lastIndex});
      if(projects.length) return projects.map(function(item,index){
        return {number:item.number,title:item.title,body:text.slice(item.end,index+1<projects.length?projects[index+1].start:text.length).trim()};
      });
    }
    return [{number:1,title:moduleKey==="data-quality"?"Регламент проверки качества данных":"Материалы модуля",body:text}];
  }
  function addStyles(){
    if(document.getElementById("edited-source-style")) return;
    var style=document.createElement("style");
    style.id="edited-source-style";
    style.textContent=".edited-source-block{margin:14px 0;padding:14px 16px;border:1px solid var(--border,#d8dce3);border-left:4px solid var(--accent,#527a68);border-radius:10px;background:var(--surface,#fff)}"+
      ".edited-source-block>summary{cursor:pointer;font-weight:700;line-height:1.45}"+
      ".edited-source-block pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:65vh;overflow:auto;margin:12px 0 0;padding:14px;border-radius:8px;background:var(--code-bg,rgba(120,130,145,.08));font:inherit;font-size:14px;line-height:1.65}"+
      ".edited-source-library{margin:18px 0;padding:14px;border:1px solid var(--border,#d8dce3);border-radius:12px;background:var(--surface,#fff)}"+
      ".edited-source-library>h2{margin:0 0 8px;font-size:1.1rem}.edited-source-library>p{margin:0 0 12px;opacity:.8;font-size:.92rem}";
    document.head.appendChild(style);
  }
  function makeBlock(item,isOpen){
    var details=document.createElement("details");details.className="edited-source-block";if(isOpen)details.open=true;
    var summary=document.createElement("summary");
    summary.textContent=(item.number?"Урок "+item.number+". ":"")+item.title;
    var pre=document.createElement("pre");pre.textContent=item.body;
    details.appendChild(summary);details.appendChild(pre);return details;
  }
  function mount(raw){
    var lessons=parseSource(raw);if(!lessons.length)return;addStyles();
    if(moduleKey==="business-analysis"||moduleKey==="decision-making"){
      var nodes=document.querySelectorAll("article.lesson, section.lesson");
      if(nodes.length>=lessons.length){
        lessons.forEach(function(item,index){
          var node=nodes[index];if(!node||node.querySelector(".edited-source-block"))return;
          var block=makeBlock(item,index===0),heading=node.querySelector("h2");
          if(heading)heading.insertAdjacentElement("afterend",block);else node.insertBefore(block,node.firstChild);
        });return;
      }
    }
    var main=document.querySelector("main")||document.body;
    if(document.getElementById("edited-source-library"))return;
    var library=document.createElement("section");
    library.className="edited-source-library";library.id="edited-source-library";
    var title=document.createElement("h2");title.textContent="Обновлённые учебные материалы";
    var note=document.createElement("p");note.textContent="Тексты сверены с редакцией исходных документов _edited. Интерактивные задания и технический синтаксис курса сохранены.";
    library.appendChild(title);library.appendChild(note);
    lessons.forEach(function(item,index){library.appendChild(makeBlock(item,index===0));});
    var hero=main.querySelector(".hero");
    if(hero&&hero.parentNode)hero.insertAdjacentElement("afterend",library);else main.insertBefore(library,main.firstChild);
  }
  fetch("../learns/edited-lesson-source.json",{cache:"no-store"})
    .then(function(response){if(!response.ok)throw new Error("HTTP "+response.status);return response.json();})
    .then(function(payload){
      if(!payload||!payload.modules||!payload.modules[moduleKey])throw new Error("Источник не найден: "+moduleKey);
      mount(payload.modules[moduleKey]);
    })
    .catch(function(error){console.error("[edited-source] Не удалось показать обновлённые материалы:",error);});
})();