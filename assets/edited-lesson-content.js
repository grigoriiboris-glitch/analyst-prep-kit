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
  function escapeHtml(value){
    return String(value).replace(/[&<>"]/g,function(ch){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch];
    });
  }
  function inlineMarkdown(value){
    var s=escapeHtml(value);
    s=s.replace(/`([^`]+)`/g,"<code>$1</code>");
    s=s.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
    s=s.replace(/(^|[^*])\*([^*]+)\*/g,"$1<em>$2</em>");
    s=s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return s;
  }
  function markdownToHtml(markdown){
    var text=String(markdown||"").replace(/\\([*_#])/g,"$1").replace(/\r\n?/g,"\n").trim();
    if(!text)return "";
    var lines=text.split("\n"),html=[],paragraph=[],listType="",inCode=false,code=[],tableRows=[];
    function flushParagraph(){
      if(paragraph.length){html.push("<p>"+inlineMarkdown(paragraph.join(" "))+"</p>");paragraph=[];}
    }
    function closeList(){if(listType){html.push("</"+listType+">");listType="";}}
    function flushTable(){
      if(!tableRows.length)return;
      var rows=tableRows.filter(function(row){return !/^\s*\|?\s*:?-{2,}/.test(row);});
      if(rows.length){
        html.push('<div class="edited-table-wrap"><table class="edited-table"><tbody>');
        rows.forEach(function(row,index){
          var cells=row.trim().replace(/^\||\|$/g,"").split("|");
          html.push("<tr>"+cells.map(function(cell){
            var name=index===0?"th":"td";
            return "<"+name+">"+inlineMarkdown(cell.trim())+"</"+name+">";
          }).join("")+"</tr>");
        });
        html.push("</tbody></table></div>");
      }
      tableRows=[];
    }
    lines.forEach(function(line){
      var value=line.trim();
      if(/^\x60\x60\x60/.test(value)){
        flushParagraph();closeList();flushTable();
        if(inCode){html.push("<pre><code>"+escapeHtml(code.join("\n"))+"</code></pre>");code=[];inCode=false;}
        else inCode=true;
        return;
      }
      if(inCode){code.push(line);return;}
      if(!value){flushParagraph();closeList();flushTable();return;}
      if(/^\|.*\|$/.test(value)){flushParagraph();closeList();tableRows.push(value);return;}
      flushTable();
      var heading=value.match(/^(#{1,4})\s+(.+)$/);
      if(heading){
        flushParagraph();closeList();
        var level=Math.min(4,heading[1].length+1);
        html.push("<h"+level+">"+inlineMarkdown(heading[2])+"</h"+level+">");
        return;
      }
      if(/^>\s?/.test(value)){
        flushParagraph();closeList();
        html.push("<blockquote>"+inlineMarkdown(value.replace(/^>\s?/,""))+"</blockquote>");
        return;
      }
      var bullet=value.match(/^(?:[-*+] )(.+)$/);
      var numbered=value.match(/^\d+[.)]\s+(.+)$/);
      if(bullet||numbered){
        flushParagraph();
        var needed=numbered?"ol":"ul";
        if(listType!==needed){closeList();html.push("<"+needed+">");listType=needed;}
        html.push("<li>"+inlineMarkdown((bullet||numbered)[1])+"</li>");
        return;
      }
      closeList();paragraph.push(value);
    });
    flushParagraph();closeList();flushTable();
    if(inCode)html.push("<pre><code>"+escapeHtml(code.join("\n"))+"</code></pre>");
    return html.join("\n");
  }

  function addStyles(){
    if(document.getElementById("edited-source-style")) return;
    var style=document.createElement("style");
    style.id="edited-source-style";
    style.textContent=".edited-source-block{margin:14px 0;padding:14px 16px;border:1px solid var(--border,#d8dce3);border-left:4px solid var(--accent,#527a68);border-radius:10px;background:var(--surface,#fff)}"+
      ".edited-source-block>summary{cursor:pointer;font-weight:700;line-height:1.45}"+
      ".edited-source-rendered{margin-top:12px;line-height:1.65}.edited-source-rendered p{margin:8px 0}.edited-source-rendered ul,.edited-source-rendered ol{padding-left:22px}.edited-source-rendered li{margin:4px 0}.edited-source-rendered pre{white-space:pre;overflow:auto;max-height:65vh;padding:14px;border-radius:8px;background:var(--code-bg,rgba(120,130,145,.08));font-size:13px;line-height:1.6}.edited-source-rendered code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.edited-source-rendered blockquote{margin:10px 0;padding:8px 12px;border-left:3px solid var(--accent,#527a68);background:rgba(120,130,145,.08)}.edited-table-wrap{overflow:auto}.edited-table{border-collapse:collapse;width:100%}.edited-table td,.edited-table th{padding:7px 9px;border:1px solid var(--border,#d8dce3);text-align:left}"+
      ".edited-source-library{margin:18px 0;padding:14px;border:1px solid var(--border,#d8dce3);border-radius:12px;background:var(--surface,#fff)}"+
      ".edited-source-library>h2{margin:0 0 8px;font-size:1.1rem}.edited-source-library>p{margin:0 0 12px;opacity:.8;font-size:.92rem}";
    document.head.appendChild(style);
  }
  function makeBlock(item,isOpen){
    var details=document.createElement("details");details.className="edited-source-block";
    details.setAttribute("data-edited-source-key","lesson-"+item.number);
    if(isOpen)details.open=true;
    var summary=document.createElement("summary");
    summary.textContent=(item.number?"Урок "+item.number+". ":"")+item.title;
    var content=document.createElement("div");content.className="edited-source-rendered";
    content.innerHTML=markdownToHtml(item.body);
    details.appendChild(summary);details.appendChild(content);return details;
  }
  function attachLiveMaterials(lessons){
    var stop={ "урок":1,"модуль":1,"часть":1,"глава":1,"что":1,"как":1,"это":1,"для":1,"в":1,"на":1,"по":1,"из":1,"с":1,"и":1,"your":1,"first":1,"the":1,"and":1,"for":1,"with":1 };
    function words(value){
      return String(value||"").toLocaleLowerCase("ru").replace(/ё/g,"е")
        .replace(/[^a-zа-я0-9]+/gi," ").trim().split(/\s+/)
        .filter(function(word){return word.length>2&&!stop[word];});
    }
    function score(a,b){
      var A=new Set(words(a)),B=new Set(words(b)),common=0;
      A.forEach(function(word){if(B.has(word))common++;});
      if(!A.size||!B.size)return 0;
      return (2*common)/(A.size+B.size);
    }
    function target(){
      var selectors=["#lessonPane","#lessonContent .lesson.active",".lesson.active","#main","main"];
      for(var i=0;i<selectors.length;i++){
        var node=document.querySelector(selectors[i]);
        if(node&&node.offsetParent!==null&&node.querySelector("h1,h2"))return node;
      }
      return null;
    }
    function render(){
      var host=target();if(!host)return;
      var headings=host.querySelectorAll("h1,h2"),title="";
      for(var i=0;i<headings.length;i++){
        var value=headings[i].textContent.trim();
        if(value.length>3&&!/^(урок|программа курса|обновлённые учебные материалы)$/i.test(value)){title=value;break;}
      }
      if(!title)return;
      var best=null,bestScore=0;
      lessons.forEach(function(item){var value=score(title,item.title);if(value>bestScore){best=item;bestScore=value;}});
      if(!best||bestScore<0.24)return;
      var old=host.querySelector('[data-edited-live="1"]');
      if(old&&old.getAttribute("data-edited-source-key")==="lesson-"+best.number)return;
      if(old)old.remove();
      var block=makeBlock(best,true);
      block.setAttribute("data-edited-live","1");
      block.setAttribute("data-edited-source-key","lesson-"+best.number);
      var heading=host.querySelector("h1,h2");
      if(heading)heading.insertAdjacentElement("afterend",block);else host.insertBefore(block,host.firstChild);
    }
    var timer=null;
    function schedule(){if(timer)clearTimeout(timer);timer=setTimeout(render,100);}
    schedule();
    var observer=new MutationObserver(schedule);
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
    document.addEventListener("click",function(){setTimeout(schedule,140);},true);
    window.addEventListener("hashchange",schedule);
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
    attachLiveMaterials(lessons);
  }
  fetch("../learns/edited-lesson-source.json",{cache:"no-store"})
    .then(function(response){if(!response.ok)throw new Error("HTTP "+response.status);return response.json();})
    .then(function(payload){
      if(!payload||!payload.modules||!payload.modules[moduleKey])throw new Error("Источник не найден: "+moduleKey);
      mount(payload.modules[moduleKey]);
    })
    .catch(function(error){console.error("[edited-source] Не удалось показать обновлённые материалы:",error);});
})();