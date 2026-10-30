(function () {
  'use strict';
  var PROGRESS_KEY='apk-postgresql-progress-v1', DRAFTS_KEY='apk-postgresql-drafts-v1', HISTORY_KEY='apk-postgresql-history-v1';
  var PGLITE_URL='https://cdn.jsdelivr.net/npm/@electric-sql/pglite@0.5.12/dist/index.js';
  var MERMAID_URL='https://cdn.jsdelivr.net/npm/mermaid@11.17.2/dist/mermaid.min.js';
  var lessons=Array.isArray(window.PostgreSQLLessons)?window.PostgreSQLLessons:[];
  var db=null, enginePromise=null, mermaidPromise=null, activeId=1, lastResultSets=[], queryRunning=false;
  var pgBlocksLessonId=null, pgAvailableBlocks=[], pgAssembledBlocks=[], pgBlockDragState=null, pgPointerDragState=null, suppressPgBlockClick=false;
  var defaultState={version:1,doneLessons:[],completedAt:{},resetAt:0,currentLessonId:'1',quizPassed:{},runPassed:{},updatedAt:0};
  var state=readJSON(PROGRESS_KEY,defaultState), drafts=readJSON(DRAFTS_KEY,{}), history=readJSON(HISTORY_KEY,[]);
  if(!drafts||typeof drafts!=='object'||Array.isArray(drafts))drafts={};
  if(!Array.isArray(history))history=[];
  state=normalizeProgress(state);
  activeId=numberOr(state.currentLessonId,firstIncompleteId());
  var nav=document.getElementById('lessonNav'), view=document.getElementById('lessonView'), search=document.getElementById('lessonSearch');
  var progressTitle=document.getElementById('progressTitle'),progressFill=document.getElementById('progressFill'),progressBar=document.getElementById('progressBar'),progressHint=document.getElementById('progressHint'),courseBadge=document.getElementById('courseBadge'),schemaPanel=document.getElementById('schemaPanel');

  function readJSON(key,fallback){try{var raw=localStorage.getItem(key);return raw?JSON.parse(raw):JSON.parse(JSON.stringify(fallback));}catch(_){return JSON.parse(JSON.stringify(fallback));}}
  function writeLocalJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(_){showGlobalMessage('Браузер не смог сохранить часть данных. Освободи место в хранилище или скачай важные результаты.','warn');return false;}}
  function normalizeProgress(raw){
    var p=Object.assign({},defaultState,raw&&typeof raw==='object'?raw:{});
    if(!Array.isArray(p.doneLessons))p.doneLessons=[];
    if(!p.completedAt||typeof p.completedAt!=='object'||Array.isArray(p.completedAt))p.completedAt={};
    if(!p.quizPassed||typeof p.quizPassed!=='object'||Array.isArray(p.quizPassed))p.quizPassed={};
    if(!p.runPassed||typeof p.runPassed!=='object'||Array.isArray(p.runPassed))p.runPassed={};
    p.resetAt=Number(p.resetAt)||0;
    var valid=new Set(lessons.map(function(l){return Number(l.id);}));
    p.doneLessons.forEach(function(id){id=Number(id);if(valid.has(id)&&!Number(p.completedAt[id]))p.completedAt[id]=Math.max(Date.now(),p.resetAt+1);});
    p.doneLessons=Object.keys(p.completedAt).map(Number).filter(function(id){return valid.has(id)&&Number(p.completedAt[id])>p.resetAt;}).sort(function(a,b){return a-b;});
    if(!valid.has(Number(p.currentLessonId)))p.currentLessonId=String(p.doneLessons.length<lessons.length?firstIncompleteFrom(p.doneLessons):(lessons[0]&&lessons[0].id||1));
    return p;
  }
  function currentLesson(){return lessons.find(function(l){return Number(l.id)===Number(activeId);})||lessons[0];}
  function activeTimestamp(map,id){return map&&Number(map[id])>Number(state.resetAt||0);}
  function isDone(id){return activeTimestamp(state.completedAt,id);}
  function hasPassedRun(id){return activeTimestamp(state.runPassed,id);}
  function hasPassedQuiz(id){return activeTimestamp(state.quizPassed,id);}
  function firstIncompleteFrom(done){var completed=new Set((done||[]).map(Number));var next=lessons.find(function(l){return !completed.has(Number(l.id));});return next?Number(next.id):Number(lessons[0]&&lessons[0].id||1);}
  function firstIncompleteId(){return firstIncompleteFrom(state&&state.doneLessons||[]);}
  function numberOr(value,fallback){var n=Number(value);return Number.isFinite(n)&&n>0?n:fallback;}
  function escapeHTML(value){return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function inlineText(value){var tick=String.fromCharCode(96);return escapeHTML(value).replace(new RegExp(tick+'([^'+tick+']+)'+tick,'g'),'<code>$1</code>');}
  function saveProgress(){
    state.doneLessons=lessons.map(function(l){return Number(l.id);}).filter(isDone);
    state.currentLessonId=String(activeId);state.updatedAt=Date.now();
    writeLocalJSON(PROGRESS_KEY,state);updateProgressHeader();renderNav();
    if(window.DataCraftEconomy){try{window.DataCraftEconomy.refresh();}catch(_){}}
  }
  function saveDraft(id,value){drafts[String(id)]=String(value||'').slice(0,20000);writeLocalJSON(DRAFTS_KEY,drafts);}
  function saveHistory(sql,results){history.unshift({at:new Date().toISOString(),lessonId:Number(activeId),sql:String(sql).slice(0,20000),resultCount:Array.isArray(results)?results.length:0});history=history.slice(0,12);writeLocalJSON(HISTORY_KEY,history);}
  function showGlobalMessage(message,kind){
    var el=document.getElementById('pgGlobalMessage');
    if(!el){el=document.createElement('div');el.id='pgGlobalMessage';el.className='pg-output-msg '+(kind||'warn');el.setAttribute('role','status');var main=document.querySelector('.pg-main-card');if(main)main.insertBefore(el,main.firstChild);else return;}
    el.className='pg-output-msg '+(kind||'warn');el.textContent=message;
  }
  function updateProgressHeader(){
    var completed=lessons.filter(function(l){return isDone(l.id);}).length,percent=lessons.length?completed/lessons.length*100:0;
    progressTitle.textContent='Пройдено '+completed+' из '+lessons.length+' уроков';progressFill.style.width=percent+'%';
    progressBar.setAttribute('aria-valuemax',String(lessons.length));progressBar.setAttribute('aria-valuenow',String(completed));
    if(completed===lessons.length&&lessons.length){courseBadge.textContent='Курс завершён ✓';progressHint.textContent='Отлично! Теперь проверь итоговый запрос на собственном наборе данных.';}
    else{courseBadge.textContent=completed?'Продолжай обучение':'Курс в процессе';progressHint.textContent='Чтобы завершить урок, выполни практику и ответь на контрольный вопрос.';}
  }
  function renderNav(){
    var term=String(search&&search.value||'').trim().toLocaleLowerCase('ru'),markup='',unit='';
    lessons.forEach(function(l){
      if(term&&(l.title+' '+l.unit+' '+l.goal).toLocaleLowerCase('ru').indexOf(term)===-1)return;
      if(unit!==l.unit){unit=l.unit;markup+='<div class="pg-unit-label">'+escapeHTML(unit)+'</div>';}
      var done=isDone(l.id);
      markup+='<button type="button" class="pg-lesson-link'+(Number(l.id)===Number(activeId)?' active':'')+(done?' done':'')+'" data-lesson="'+Number(l.id)+'"'+(Number(l.id)===Number(activeId)?' aria-current="step"':'')+'><span class="pg-num">'+(done?'✓':Number(l.id))+'</span><span><span class="pg-link-title">'+escapeHTML(l.title)+'</span><span class="pg-link-sub">'+(done?'Пройдено':'Урок '+Number(l.id))+'</span></span></button>';
    });
    nav.innerHTML=markup||'<p class="pg-muted" style="padding:12px">Ничего не найдено. Попробуй другой запрос.</p>';
    Array.prototype.forEach.call(nav.querySelectorAll('[data-lesson]'),function(btn){btn.addEventListener('click',function(){openLesson(Number(btn.dataset.lesson),true);});});
  }
  function shufflePgBlocks(blocks){
    var items=(blocks||[]).slice();
    for(var i=items.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var temp=items[i];items[i]=items[j];items[j]=temp;}
    return items;
  }
  function preparePgBlocks(lesson){
    var id=Number(lesson.id);
    if(pgBlocksLessonId===id)return;
    pgBlocksLessonId=id;
    pgAvailableBlocks=shufflePgBlocks(lesson.blocks||[]);
    pgAssembledBlocks=[];
    lastResultSets=[];
    pgBlockDragState=null;
    pgPointerDragState=null;
    suppressPgBlockClick=false;
  }
  function pgBlockArray(zone){return zone==='assembled'?pgAssembledBlocks:pgAvailableBlocks;}
  function clearTaskFeedback(){
    var feedback=document.getElementById('taskFeedback');
    if(!feedback)return;
    feedback.hidden=true;
    feedback.className='pg-task-feedback';
    feedback.textContent='';
  }
  function showTaskFeedback(message,kind){
    var feedback=document.getElementById('taskFeedback');
    if(!feedback)return;
    feedback.hidden=false;
    feedback.className='pg-task-feedback '+(kind||'warn');
    feedback.textContent=String(message||'');
    feedback.setAttribute('role',kind==='error'?'alert':'status');
  }
  function renderPgBlocksUI(){
    var available=document.getElementById('pgAvailableBlocks');
    var assembled=document.getElementById('pgAssembledBlocks');
    var editor=document.getElementById('sqlEditor');
    if(!available||!assembled||!editor)return;
    available.innerHTML=pgAvailableBlocks.map(function(block,index){
      return '<button type="button" class="pg-sql-block" draggable="true" data-block-zone="available" data-block-index="'+index+'" title="Перетащи в верхнюю область или нажми, чтобы добавить">'+escapeHTML(block)+'</button>';
    }).join('')||'<p class="pg-block-empty">Все доступные фрагменты выбраны.</p>';
    assembled.innerHTML=pgAssembledBlocks.map(function(block,index){
      return '<button type="button" class="pg-sql-block assembled" draggable="true" data-block-zone="assembled" data-block-index="'+index+'" title="Перетащи для изменения порядка или нажми, чтобы вернуть">'+escapeHTML(block)+'</button>';
    }).join('')||'<p class="pg-block-empty">Перетащи SQL-фрагменты сюда. Или нажми на блок внизу.</p>';
    editor.value=pgAssembledBlocks.join('\n');
    editor.dispatchEvent(new Event('input',{bubbles:true}));
    clearTaskFeedback();
  }
  function clearPgQueryResultOutput(){
    lastResultSets=[];
    var output=document.getElementById('queryOutput');if(output)output.innerHTML='<div class="pg-output-placeholder">Сборка изменилась. Запусти запрос, чтобы проверить результат.</div>';
    var csvButton=document.getElementById('downloadCsvBtn');if(csvButton)csvButton.disabled=true;
  }
  function movePgBlockItem(sourceZone,sourceIndex,targetZone,targetIndex){
    var source=pgBlockArray(sourceZone),target=pgBlockArray(targetZone);
    if(!Number.isInteger(sourceIndex)||sourceIndex<0||sourceIndex>=source.length)return;
    var item=source.splice(sourceIndex,1)[0];
    var insertAt=Number.isInteger(targetIndex)?targetIndex:target.length;
    if(source===target&&sourceIndex<insertAt)insertAt-=1;
    insertAt=Math.max(0,Math.min(insertAt,target.length));
    target.splice(insertAt,0,item);
    renderPgBlocksUI();
    clearPgQueryResultOutput();
  }
  function pgClearDropTargets(){
    Array.prototype.forEach.call(document.querySelectorAll('.pg-blocks-area.is-drop-target'),function(area){area.classList.remove('is-drop-target');});
  }
  function pgBlockDropIndex(area,event,dropTarget){
    var blocks=Array.prototype.slice.call(area.querySelectorAll('.pg-sql-block'));
    var hit=dropTarget||event.target,target=hit&&hit.closest?hit.closest('.pg-sql-block'):null;
    if(target&&target.parentElement===area){
      var rect=target.getBoundingClientRect();
      var after=event.clientY>rect.top+rect.height/2||(event.clientY>=rect.top&&event.clientY<=rect.bottom&&event.clientX>rect.left+rect.width/2);
      return blocks.indexOf(target)+(after?1:0);
    }
    return blocks.length;
  }
  function pgEndBlockDrag(){
    pgBlockDragState=null;
    pgClearDropTargets();
    Array.prototype.forEach.call(document.querySelectorAll('.pg-sql-block.is-dragging'),function(block){block.classList.remove('is-dragging');});
    suppressPgBlockClick=true;
    setTimeout(function(){suppressPgBlockClick=false;},500);
  }
  function pgBindBlockEvents(){
    ['pgAvailableBlocks','pgAssembledBlocks'].forEach(function(id){
      var area=document.getElementById(id);
      if(!area)return;
      area.addEventListener('click',function(event){
        if(suppressPgBlockClick){suppressPgBlockClick=false;return;}
        var block=event.target&&event.target.closest?event.target.closest('.pg-sql-block'):null;
        if(!block||block.parentElement!==area)return;
        var zone=block.dataset.blockZone,index=Number(block.dataset.blockIndex);
        if(zone==='available')movePgBlockItem('available',index,'assembled',pgAssembledBlocks.length);
        else movePgBlockItem('assembled',index,'available',pgAvailableBlocks.length);
      });
      area.addEventListener('dragstart',function(event){
        var block=event.target&&event.target.closest?event.target.closest('.pg-sql-block'):null;
        if(!block)return;
        pgBlockDragState={zone:block.dataset.blockZone,index:Number(block.dataset.blockIndex)};
        if(event.dataTransfer){event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',pgBlockDragState.zone+':'+pgBlockDragState.index);}
        block.classList.add('is-dragging');
      });
      area.addEventListener('dragend',pgEndBlockDrag);
      area.addEventListener('dragover',function(event){
        event.preventDefault();
        if(event.dataTransfer)event.dataTransfer.dropEffect='move';
        area.classList.add('is-drop-target');
      });
      area.addEventListener('dragleave',function(event){
        if(!area.contains(event.relatedTarget))area.classList.remove('is-drop-target');
      });
      area.addEventListener('drop',function(event){
        event.preventDefault();
        var drag=pgBlockDragState;
        if(drag){
          var targetZone=id==='pgAssembledBlocks'?'assembled':'available';
          movePgBlockItem(drag.zone,drag.index,targetZone,pgBlockDropIndex(area,event));
        }
        pgEndBlockDrag();
      });
      area.addEventListener('pointerdown',function(event){
        if(event.pointerType!=='touch'&&event.pointerType!=='pen')return;
        var block=event.target&&event.target.closest?event.target.closest('.pg-sql-block'):null;
        if(!block)return;
        pgPointerDragState={zone:block.dataset.blockZone,index:Number(block.dataset.blockIndex),pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,element:block,started:false};
        if(block.setPointerCapture){try{block.setPointerCapture(event.pointerId);}catch(_){}}
        window.addEventListener('pointermove',pgMovePointerBlock);
        window.addEventListener('pointerup',pgFinishPointerBlock);
        window.addEventListener('pointercancel',pgCancelPointerBlock);
      });
    });
    var reset=document.getElementById('resetPgBlocksBtn');
    if(reset)reset.addEventListener('click',resetPgBlockAssembly);
  }
  function pgMovePointerBlock(event){
    var drag=pgPointerDragState;
    if(!drag||event.pointerId!==drag.pointerId)return;
    if(!drag.started&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<8)return;
    drag.started=true;event.preventDefault();drag.element.classList.add('is-dragging');pgClearDropTargets();
    var under=document.elementFromPoint(event.clientX,event.clientY),area=under&&under.closest?under.closest('#pgAssembledBlocks,#pgAvailableBlocks'):null;
    if(area)area.classList.add('is-drop-target');
  }
  function pgFinishPointerBlock(event){
    var drag=pgPointerDragState;
    if(!drag||event.pointerId!==drag.pointerId)return;
    if(drag.started){
      var under=document.elementFromPoint(event.clientX,event.clientY),area=under&&under.closest?under.closest('#pgAssembledBlocks,#pgAvailableBlocks'):null;
      if(area){
        var targetZone=area.id==='pgAssembledBlocks'?'assembled':'available';
        movePgBlockItem(drag.zone,drag.index,targetZone,pgBlockDropIndex(area,event,under));
      }
      suppressPgBlockClick=true;setTimeout(function(){suppressPgBlockClick=false;},500);
    }
    pgCleanupPointerBlock();
  }
  function pgCancelPointerBlock(event){if(pgPointerDragState&&event.pointerId===pgPointerDragState.pointerId)pgCleanupPointerBlock();}
  function pgCleanupPointerBlock(){
    if(pgPointerDragState&&pgPointerDragState.element)pgPointerDragState.element.classList.remove('is-dragging');
    pgPointerDragState=null;pgClearDropTargets();
    window.removeEventListener('pointermove',pgMovePointerBlock);
    window.removeEventListener('pointerup',pgFinishPointerBlock);
    window.removeEventListener('pointercancel',pgCancelPointerBlock);
  }
  function resetPgBlockAssembly(){
    var lesson=currentLesson();
    pgAvailableBlocks=shufflePgBlocks(lesson&&lesson.blocks||[]);
    pgAssembledBlocks=[];
    renderPgBlocksUI();
    clearTaskFeedback();
    lastResultSets=[];
    renderResultSets([]);
    var csv=document.getElementById('downloadCsvBtn');if(csv)csv.disabled=true;
  }
  function usePgSolution(){
    var lesson=currentLesson();
    var solutionLines=String(lesson.solutionSql||'').split(/\r?\n/).map(function(line){return line.trim();}).filter(Boolean);
    var remaining=(lesson.blocks||[]).slice();
    solutionLines.forEach(function(line){var index=remaining.indexOf(line);if(index>=0)remaining.splice(index,1);});
    pgAssembledBlocks=solutionLines;
    pgAvailableBlocks=shufflePgBlocks(remaining);
    renderPgBlocksUI();
    clearPgQueryResultOutput();
    showTaskFeedback('Готовая последовательность блоков перенесена в редактор. Теперь выполни запрос и изучи результат.','warn');
  }
  function renderPgBlocksSection(lesson){
    return '<section class="pg-interactive-blocks" aria-label="Интерактивная сборка SQL">'+
      '<div class="pg-blocks-heading"><div><h3>Собери SQL-запрос из блоков</h3><p>Перетащи правильные фрагменты в верхнюю область и расставь их по порядку. Лишние блоки оставь внизу. Также можно нажимать на блоки, чтобы переносить их между областями.</p></div><button type="button" class="pg-button" id="resetPgBlocksBtn">↻ Сбросить сборку</button></div>'+
      '<div class="pg-block-help"><span>1. Собери запрос сверху</span><span>2. Нажми «Выполнить запрос»</span></div>'+
      '<div class="pg-block-zone-label">Собранный SQL-запрос</div><div class="pg-blocks-area assembled" id="pgAssembledBlocks" aria-label="Собранные SQL-блоки" data-drop-zone="assembled"></div>'+
      '<div class="pg-block-zone-label">Доступные блоки · выбери нужные, лишние пропусти</div><div class="pg-blocks-area available" id="pgAvailableBlocks" aria-label="Доступные SQL-блоки" data-drop-zone="available"></div>'+
    '</section>';
  }
  function renderVisual(steps){return '<section class="pg-visual"><h3>Схема: как связаны шаги</h3><div class="pg-flow">'+(steps||[]).map(function(s){return '<div class="pg-flow-step">'+inlineText(s)+'</div>';}).join('')+'</div></section>';}
  function renderLesson(){
    var l=currentLesson();
    if(!l){view.innerHTML='<h2>Не удалось загрузить программу</h2><p>Обнови страницу и попробуй снова.</p>';return;}
    preparePgBlocks(l);
    var done=isDone(l.id),runPassed=hasPassedRun(l.id),quizPassed=hasPassedQuiz(l.id);
    var draft=pgAssembledBlocks.join('\n');
    var quiz=l.quiz||{q:'Что важно помнить?',options:['Проверить результат'],correct:0,why:''};
    var html='<div class="pg-lesson-top"><span class="pg-badge">'+escapeHTML(l.unit)+'</span><span class="pg-muted">Урок '+l.id+' из '+lessons.length+'</span>'+(done?'<span class="pg-badge">✓ Пройдено</span>':'')+'</div>'+
      '<h2 class="pg-lesson-title">Практикум SQL '+Number(l.id)+'. '+escapeHTML(l.title)+'</h2><p class="pg-goal">'+inlineText(l.goal)+'</p>'+
      '<section class="pg-block"><h3>Что нового</h3><p>'+inlineText(l.explain)+'</p></section>'+renderVisual(l.visual)+
      '<section class="pg-task"><h3>Задание</h3><p>'+inlineText(l.task)+'</p></section>'+renderPgBlocksSection(l)+
      '<section class="pg-block pg-hint"><h3>Подсказка</h3><p>'+inlineText(l.hint||'Подумай, какой оператор PostgreSQL решает эту задачу.')+'</p></section>'+
      '<section class="pg-block pg-expected"><h3>Ожидаемый результат</h3><p>'+inlineText(l.expected||'Сверь названия и порядок столбцов с условием задачи.')+'</p></section>'+
      '<details class="pg-code-card pg-solution"><summary class="pg-code-head">Разбор решения · открой после собственной попытки</summary><div class="pg-solution-body"><div class="pg-code-head"><span>Готовый запрос PostgreSQL</span><button class="pg-button" type="button" id="useExampleBtn">Перенести решение в сборку</button></div><pre class="pg-code"><code>'+escapeHTML(l.solutionSql||l.exampleSql||'')+'</code></pre><div class="pg-solution-note">'+inlineText(l.solutionExplain||'')+'</div></div></details>'+
      '<section class="pg-block gotcha"><h3>Типичная ошибка</h3><p>'+inlineText(l.gotcha)+'</p></section>'+
      '<section class="pg-workbench" aria-label="Редактор SQL"><div class="pg-workbench-head"><h3>Собранный запрос · PostgreSQL</h3><span class="pg-engine-state" id="engineState">'+(db?'PostgreSQL готов · данные изолированы':'Движок загрузится при первом запуске')+'</span></div>'+
      '<textarea id="sqlEditor" class="pg-editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" readonly placeholder="Перетащи правильные SQL-блоки в верхнюю область…" aria-label="Собранный SQL-запрос"></textarea>'+
      '<div class="pg-run-actions"><button class="pg-button primary" type="button" id="runQueryBtn">▶ Выполнить запрос</button><button class="pg-button" type="button" id="copyQueryBtn">Копировать SQL</button><button class="pg-button" type="button" id="downloadCsvBtn" disabled>Скачать результат CSV</button><span class="pg-muted">Ctrl + Enter — выполнить · редактор заполняется блоками</span></div>'+
      '<div id="taskFeedback" class="pg-task-feedback" role="status" aria-live="polite" hidden></div>'+
      '<div class="pg-output" id="queryOutput" aria-live="polite"><div class="pg-output-placeholder">Собери запрос из блоков выше и нажми «Выполнить запрос».</div></div></section>'+
      '<section class="pg-quiz"><h3>Проверь себя</h3><p class="pg-quiz-q">'+inlineText(quiz.q)+'</p><div class="pg-answers" id="quizAnswers">'+quiz.options.map(function(op,i){return '<button class="pg-answer'+(quizPassed&&i===quiz.correct?' correct':'')+'" type="button" data-answer="'+i+'"'+(quizPassed?' disabled':'')+'>'+inlineText(op)+'</button>';}).join('')+'</div><p class="pg-quiz-feedback" id="quizFeedback" aria-live="polite">'+(quizPassed?'Верно. '+escapeHTML(quiz.why):'Ответь правильно, чтобы отметить урок завершённым.')+'</p></section>'+
      '<div class="pg-lesson-actions"><button class="pg-button" type="button" id="prevLessonBtn"'+(Number(l.id)===Number(lessons[0].id)?' disabled':'')+'>← Предыдущий урок</button><button class="pg-button primary" type="button" id="completeLessonBtn"'+(!(runPassed&&quizPassed)||done?' disabled':'')+'>'+(done?'✓ Урок пройден':'Завершить урок')+'</button><button class="pg-button" type="button" id="nextLessonBtn">'+(Number(l.id)===Number(lessons[lessons.length-1].id)?'К началу курса ↻':'Следующий урок →')+'</button><span class="spacer"></span><span class="pg-muted">'+(runPassed?'Практика выполнена ✓':'Практика ещё не пройдена')+' · '+(quizPassed?'Ответ верный ✓':'Контрольный вопрос не пройден')+'</span></div>';
    view.innerHTML=html;
    var editor=document.getElementById('sqlEditor');editor.value=String(draft||'').slice(0,20000);
    editor.addEventListener('input',function(){saveDraft(l.id,editor.value);});
    editor.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();runQuery();}});
    pgBindBlockEvents();
    renderPgBlocksUI();
    document.getElementById('useExampleBtn').addEventListener('click',usePgSolution);
    document.getElementById('runQueryBtn').addEventListener('click',runQuery);
    document.getElementById('copyQueryBtn').addEventListener('click',function(){copyQuery(editor.value);});
    document.getElementById('downloadCsvBtn').addEventListener('click',downloadCSV);
    document.getElementById('prevLessonBtn').addEventListener('click',function(){goRelative(-1);});
    document.getElementById('nextLessonBtn').addEventListener('click',function(){goRelative(1);});
    document.getElementById('completeLessonBtn').addEventListener('click',completeLesson);
    Array.prototype.forEach.call(document.querySelectorAll('[data-answer]'),function(btn){btn.addEventListener('click',function(){answerQuiz(Number(btn.dataset.answer));});});
    updateProgressHeader();renderNav();
  }
  function openLesson(id,shouldScroll){
    id=Number(id);if(!lessons.some(function(l){return Number(l.id)===id;}))return;
    activeId=id;state.currentLessonId=String(id);saveProgress();renderLesson();
    if(shouldScroll&&window.matchMedia('(max-width: 760px)').matches)view.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function goRelative(delta){var idx=lessons.findIndex(function(l){return Number(l.id)===Number(activeId);});if(idx<0)idx=0;var next=idx+delta;if(next<0)next=0;if(next>=lessons.length)next=0;openLesson(lessons[next].id,true);}
  function answerQuiz(chosen){
    var l=currentLesson(),quiz=l.quiz,buttons=Array.prototype.slice.call(document.querySelectorAll('[data-answer]')),correct=Number(chosen)===Number(quiz.correct);
    buttons.forEach(function(btn){var answer=Number(btn.dataset.answer);btn.disabled=true;if(answer===Number(quiz.correct))btn.classList.add('correct');else if(answer===Number(chosen))btn.classList.add('wrong');});
    var feedback=document.getElementById('quizFeedback');
    if(correct){state.quizPassed[String(l.id)]=Math.max(Date.now(),Number(state.resetAt)+1);feedback.textContent='Верно. '+quiz.why;}
    else{feedback.textContent='Пока неверно. '+quiz.why+' Вернись к вопросу и попробуй ещё раз.';}
    saveProgress();renderLesson();
  }
  function completeLesson(){
    var l=currentLesson();if(!hasPassedRun(l.id)||!hasPassedQuiz(l.id)||isDone(l.id))return;
    state.completedAt[String(l.id)]=Math.max(Date.now(),Number(state.resetAt)+1);saveProgress();
    if(Number(l.id)===Number(lessons[lessons.length-1].id)){renderLesson();showGlobalMessage('Поздравляю! Все 30 уроков пройдены. Сохрани итоговый SQL как часть портфолио и проверь его на рабочей СУБД.','success');}
    else{var idx=lessons.findIndex(function(x){return Number(x.id)===Number(l.id);});openLesson(lessons[idx+1].id,true);}
  }

  function statusEngine(message){var el=document.getElementById('engineState');if(el)el.textContent=message;}
  async function ensureDatabase(){
    if(db)return db;if(enginePromise)return enginePromise;
    enginePromise=(async function(){
      statusEngine('Загружаем PostgreSQL для браузера…');
      showOutputMessage('Первый запуск загружает движок PostgreSQL и создаёт изолированную учебную базу. Это может занять немного времени.','warn');
      var module=await import(PGLITE_URL);
      if(!module||typeof module.PGlite!=='function')throw new Error('Не удалось найти PGlite в загруженном модуле.');
      var response=await fetch('seed.sql',{cache:'no-store'});
      if(!response.ok)throw new Error('Не удалось загрузить seed.sql ('+response.status+'). Открой курс через веб-сервер, а не как file://.');
      var instance=new module.PGlite();await instance.exec(await response.text());
      try{await instance.exec("SET statement_timeout = '4000ms'; SET lock_timeout = '1000ms';");}catch(_){}
      db=instance;statusEngine('PostgreSQL готов · 7 таблиц с учебными данными');return db;
    })().catch(function(error){enginePromise=null;statusEngine('Движок пока недоступен');showOutputMessage('Не удалось подготовить PostgreSQL. Проверь интернет и открой курс через веб-сервер. '+translateEngineError(error),'error');throw error;});
    return enginePromise;
  }
  function translateEngineError(error){var m=String(error&&error.message||error||'Неизвестная ошибка');if(/Failed to fetch|NetworkError|fetch/i.test(m))return 'Не удалось скачать движок или учебную схему.';return m;}
  function explainSQLError(message){
    var t=String(message||'');
    if(/syntax error/i.test(t))return 'Похоже, есть синтаксическая ошибка. Проверь скобки, запятые, кавычки и порядок ключевых слов.';
    if(/relation .* does not exist/i.test(t))return 'Таблица или представление не найдено. Проверь имя и схему. В учебной базе доступны customers, products, orders, order_items, payments, support_tickets и page_events.';
    if(/column .* does not exist/i.test(t))return 'Столбец не найден. Проверь имя поля и псевдоним таблицы.';
    if(/violates foreign key constraint/i.test(t))return 'Нарушена внешняя связь: ссылающаяся запись должна ссылаться на существующую строку.';
    if(/duplicate key value violates unique constraint/i.test(t))return 'Нарушен первичный или уникальный ключ. Используй новый ключ или ON CONFLICT.';
    if(/violates check constraint/i.test(t))return 'Значение не соответствует ограничению CHECK таблицы.';
    if(/statement timeout/i.test(t))return 'Запрос остановлен по тайм-ауту. Уточни фильтр или ограничь количество обрабатываемых строк.';
    if(/permission denied/i.test(t))return 'Для операции нужны другие права. В браузерной песочнице администрирование ролей ограничено.';
    return 'PostgreSQL вернул ошибку. Ниже оставлено техническое сообщение — используй его, чтобы найти причину.';
  }
  function stripCommentsAndStrings(sql){return String(sql||'').replace(/\/\*[\s\S]*?\*\//g,' ').replace(/--[^\n]*/g,' ').replace(/'(?:''|[^'])*'/g,"''").replace(/"(?:\"\"|[^"])*"/g,'""');}
  function guardedSQL(sql){
    if(!sql.trim())return 'Введи SQL-запрос.';
    if(sql.length>20000)return 'Слишком длинный запрос: максимум 20 000 символов.';
    var clean=stripCommentsAndStrings(sql);
    if(/\b(?:CREATE|DROP)\s+(?:DATABASE|ROLE|USER|TABLESPACE|SUBSCRIPTION|PUBLICATION)\b/i.test(clean)||/\bALTER\s+(?:SYSTEM|ROLE|USER)\b/i.test(clean)||/\bCREATE\s+EXTENSION\b|\bDROP\s+EXTENSION\b/i.test(clean)||/\bCOPY\b[\s\S]*\bPROGRAM\b|\bLOAD\s+/i.test(clean)||/\bpg_sleep\s*\(/i.test(clean))
      return 'Эта серверная или потенциально блокирующая команда отключена в браузерной песочнице. Посмотри объяснение в уроке и выполни безопасный запрос к учебным данным.';
    return '';
  }
  function toPlainValue(value){if(value===null||typeof value==='undefined')return 'NULL';if(typeof value==='string'||typeof value==='number'||typeof value==='boolean'||typeof value==='bigint')return String(value);if(value instanceof Date)return value.toISOString();try{return JSON.stringify(value);}catch(_){return String(value);}}
  function fieldsOf(result){if(Array.isArray(result&&result.fields)&&result.fields.length)return result.fields.map(function(field){return String(field.name||field);});if(Array.isArray(result&&result.rows)&&result.rows.length)return Object.keys(result.rows[0]);return [];}
  function resultsOf(result){return Array.isArray(result)?result:(result?[result]:[]);}
  function normalizeSqlForCheck(sql){
    return String(sql||'').replace(/--[^\n]*/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
  }
  function comparableValue(value){
    var text=toPlainValue(value);
    if(/^-?\d+(?:\.\d+)?$/.test(text)){
      return text.replace(/(\.\d*?[1-9])0+$/,'$1').replace(/\.0+$/,'');
    }
    return text;
  }
  function checkOutput(resultSets,check,sql){
    check=check||{};var candidate=null,candidateColumns=[],normalizedSql=normalizeSqlForCheck(sql);
    if(Array.isArray(check.sqlIncludes)){
      var missing=check.sqlIncludes.filter(function(part){return normalizedSql.indexOf(String(part).replace(/\s+/g,' ').trim().toLowerCase())===-1;});
      if(missing.length)return{ok:false,message:'В запросе пока не использована нужная конструкция PostgreSQL: '+missing.join(', ')+'. Проверь тему урока и подсказку.'};
    }
    for(var i=0;i<resultSets.length;i++){var result=resultSets[i],cols=fieldsOf(result);var all=(check.columns||[]).every(function(required){return cols.some(function(c){return c.toLowerCase()===String(required).toLowerCase();});});if(all&&Array.isArray(result.rows)){candidate=result;candidateColumns=cols;break;}}
    if(!candidate){if(check.columns&&check.columns.length)return{ok:false,message:'Нужны выходные столбцы: '+check.columns.join(', ')+'. Проверь SELECT и псевдонимы.'};return{ok:false,message:'Запрос выполнен, но результат для этой практики не распознан. Посмотри задание и верни табличный результат.'};}
    if(check.columnOrder&&Array.isArray(check.columns)){
      var orderMatches=candidateColumns.length===check.columns.length&&check.columns.every(function(name,index){return candidateColumns[index].toLowerCase()===String(name).toLowerCase();});
      if(!orderMatches)return{ok:false,message:'Проверь порядок столбцов. Ожидается: '+check.columns.join(', ')+'.'};
    }
    if(Number.isFinite(check.exactRows)&&candidate.rows.length!==check.exactRows)return{ok:false,message:'В результате ожидается '+check.exactRows+' строк, сейчас: '+candidate.rows.length+'.'};
    if(Number.isFinite(check.minRows)&&candidate.rows.length<check.minRows)return{ok:false,message:'Получено '+candidate.rows.length+' строк, а для проверки нужно не меньше '+check.minRows+'. Проверь фильтр и соединения.'};
    if(check.firstRow&&candidate.rows.length){
      var firstMismatch=Object.keys(check.firstRow).find(function(name){
        var key=Object.keys(candidate.rows[0]||{}).find(function(k){return k.toLowerCase()===name.toLowerCase();});
        return key===undefined||comparableValue(candidate.rows[0][key])!==comparableValue(check.firstRow[name]);
      });
      if(firstMismatch)return{ok:false,message:'Проверь первую строку результата: в столбце '+firstMismatch+' ожидается «'+check.firstRow[firstMismatch]+'».'};
    }
    if(check.contains){var index=candidateColumns.findIndex(function(c){return c.toLowerCase()===String(check.contains.column).toLowerCase();});var found=index>=0&&candidate.rows.some(function(row){var key=Object.keys(row||{}).find(function(k){return k.toLowerCase()===String(check.contains.column).toLowerCase();});return key!==undefined&&toPlainValue(row[key]).indexOf(String(check.contains.value))!==-1;});if(!found)return{ok:false,message:'В столбце '+check.contains.column+' не найден ожидаемый признак. Проверь фильтр или выражение.'};}
    return{ok:true,message:'Условия практики выполнены: структура, порядок столбцов и содержание результата соответствуют задаче.'};
  }
  async function runQuery(){
    if(queryRunning)return;
    var editor=document.getElementById('sqlEditor'),button=document.getElementById('runQueryBtn'),sql=editor?editor.value:'',guard=guardedSQL(sql);
    clearTaskFeedback();
    if(guard){showTaskFeedback(guard,'error');return;}
    queryRunning=true;if(button){button.disabled=true;button.textContent='Выполняем…';}
    try{
      var database=await ensureDatabase(),result=await database.exec(sql);
      lastResultSets=resultsOf(result);
      saveHistory(sql,lastResultSets);
      var l=currentLesson(),validation=checkOutput(lastResultSets,l.checks,sql);
      if(validation.ok)state.runPassed[String(l.id)]=Math.max(Date.now(),Number(state.resetAt)+1);
      else if(!hasPassedRun(l.id))state.runPassed[String(l.id)]=Number(state.resetAt)||0;
      saveProgress();
      renderLesson();
      renderResultSets(lastResultSets);
      if(validation.ok){
        showTaskFeedback('Верно! '+validation.message,'success');
        showOutputMessage('Практика выполнена ✓','success');
      }else{
        showTaskFeedback('Запрос выполнился, но задание пока не принято. '+validation.message,'warn');
        showOutputMessage('Сравни результат с ожидаемыми столбцами и значениями.','warn');
      }
      var csvBtn=document.getElementById('downloadCsvBtn');if(csvBtn)csvBtn.disabled=!hasAnyRows(lastResultSets);
    }catch(error){
      lastResultSets=[];
      var l2=currentLesson();if(!hasPassedRun(l2.id))state.runPassed[String(l2.id)]=Number(state.resetAt)||0;
      saveProgress();
      renderLesson();
      var technical=String(error&&error.message||error);
      showTaskFeedback(explainSQLError(technical)+'\n\nТехническая ошибка PostgreSQL:\n'+technical,'error');
      showOutputMessage('Исправь запрос и запусти его ещё раз. Подробная ошибка показана под собранным SQL.','error');
    }finally{queryRunning=false;var b=document.getElementById('runQueryBtn');if(b){b.disabled=false;b.textContent='▶ Выполнить запрос';}statusEngine(db?'PostgreSQL готов · данные изолированы в браузере':'Движок не запущен');}
  }
  function renderResultSets(resultSets){
    var out=document.getElementById('queryOutput');if(!out)return;var markup='';
    resultSets.forEach(function(result,index){var columns=fieldsOf(result),rows=Array.isArray(result&&result.rows)?result.rows:[];
      if(columns.length&&rows.length){markup+='<div class="pg-muted">Набор результата '+(index+1)+' · '+rows.length+' строк</div><div class="pg-result-wrap"><table class="pg-result"><thead><tr>'+columns.map(function(c){return '<th>'+escapeHTML(c)+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(row){return '<tr>'+columns.map(function(column){var key=Object.keys(row||{}).find(function(k){return k.toLowerCase()===column.toLowerCase();});var value=key===undefined?'':toPlainValue(row[key]);return '<td'+(value==='NULL'?' class="null"':'')+' title="'+escapeHTML(value)+'">'+escapeHTML(value)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';}
      else if(result&&Number.isFinite(result.affectedRows)&&result.affectedRows>0)markup+='<p class="pg-muted">Операция '+(index+1)+': изменено строк — '+result.affectedRows+'.</p>';
    });
    out.innerHTML=markup||'<div class="pg-output-placeholder">Запрос выполнен. Он не вернул табличных строк — например, это мог быть DDL-запрос.</div>';
  }
  function hasAnyRows(sets){return(sets||[]).some(function(r){return Array.isArray(r&&r.rows)&&r.rows.length>0&&fieldsOf(r).length>0;});}
  function showOutputMessage(message,kind,append){
    var out=document.getElementById('queryOutput');if(!out)return;var div=document.createElement('div');div.className='pg-output-msg '+(kind||'');div.textContent=message;div.setAttribute('role',kind==='error'?'alert':'status');if(!append)out.innerHTML='';out.insertBefore(div,out.firstChild);
  }
  async function copyQuery(sql){try{await navigator.clipboard.writeText(String(sql||''));showOutputMessage('SQL скопирован в буфер обмена.','success');}catch(_){showOutputMessage('Не удалось скопировать автоматически. Выдели текст в редакторе и скопируй вручную.','warn');}}
  function csvCell(value){return '"'+toPlainValue(value).replace(/"/g,'""')+'"';}
  function downloadCSV(){
    var r=(lastResultSets||[]).find(function(set){return Array.isArray(set.rows)&&set.rows.length&&fieldsOf(set).length;});if(!r)return;
    var columns=fieldsOf(r),csv='\uFEFF'+[columns.map(csvCell).join(';')].concat(r.rows.map(function(row){return columns.map(function(c){var key=Object.keys(row||{}).find(function(k){return k.toLowerCase()===c.toLowerCase();});return csvCell(key===undefined?'':row[key]);}).join(';');})).join('\r\n');
    var url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})),a=document.createElement('a');a.href=url;a.download='postgresql-result-'+activeId+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  async function resetDatabase(){
    if(!window.confirm('Восстановить исходные учебные данные? Все изменения в текущей браузерной базе будут потеряны. Прогресс и SQL-черновики сохранятся.'))return;
    var button=document.getElementById('resetDatabaseBtn');if(button){button.disabled=true;button.textContent='Восстанавливаем…';}
    try{if(db&&typeof db.close==='function')await db.close();db=null;enginePromise=null;await ensureDatabase();lastResultSets=[];showOutputMessage('Учебная база восстановлена. Прогресс курса и черновики SQL не изменены.','success');}
    catch(_){showOutputMessage('Не удалось восстановить базу. Перезагрузи страницу и попробуй снова.','error');}
    finally{if(button){button.disabled=false;button.textContent='Восстановить учебную базу';}}
  }
  function resetProgress(){
    if(!window.confirm('Сбросить прогресс PostgreSQL-курса? Черновики SQL и учебная база останутся на месте.'))return;
    state.resetAt=Math.max(Date.now(),Number(state.resetAt)+1);state.doneLessons=[];state.currentLessonId='1';activeId=1;saveProgress();renderLesson();showGlobalMessage('Прогресс курса сброшен. История запросов и черновики сохранены локально.','success');
  }
  function loadMermaid(){
    if(window.mermaid&&typeof window.mermaid.run==='function')return Promise.resolve(window.mermaid);
    if(mermaidPromise)return mermaidPromise;
    mermaidPromise=new Promise(function(resolve,reject){var existing=document.querySelector('script[data-pg-mermaid]'),script=existing||document.createElement('script');script.src=MERMAID_URL;script.async=true;script.dataset.pgMermaid='true';script.onload=function(){if(window.mermaid&&typeof window.mermaid.run==='function')resolve(window.mermaid);else reject(new Error('Mermaid API not found'));};script.onerror=function(){reject(new Error('Mermaid CDN unavailable'));};if(!existing)document.head.appendChild(script);}).catch(function(error){mermaidPromise=null;throw error;});
    return mermaidPromise;
  }
  async function renderSchemaDiagram(){
    var node=document.getElementById('schemaDiagram');if(!node||node.dataset.processed==='true')return;var wrap=node.closest('.pg-mermaid-wrap');
    try{var mermaid=await loadMermaid();mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'base',themeVariables:{primaryColor:'#18181B',primaryTextColor:'#F5F7FA',primaryBorderColor:'#38BDF8',lineColor:'#A1A1AA',secondaryColor:'#27272A',tertiaryColor:'#0E7490',fontFamily:'system-ui, sans-serif',fontSize:'14px'},er:{useMaxWidth:true,diagramPadding:12}});await mermaid.run({nodes:[node]});}
    catch(_){if(wrap)wrap.innerHTML='<p class="pg-schema-note">Не удалось загрузить Mermaid. Состав связей: customers → orders → order_items → products; orders → payments; customers → support_tickets и page_events.</p>';}
  }
  search.addEventListener('input',renderNav);
  document.getElementById('resetProgressBtn').addEventListener('click',resetProgress);
  document.getElementById('resetDatabaseBtn').addEventListener('click',resetDatabase);
  schemaPanel.addEventListener('toggle',function(){if(schemaPanel.open)renderSchemaDiagram();});
  window.addEventListener('storage',function(e){if(e.key===PROGRESS_KEY){state=normalizeProgress(readJSON(PROGRESS_KEY,defaultState));activeId=numberOr(state.currentLessonId,firstIncompleteId());renderLesson();}});
  window.addEventListener('apk:progress-restored',function(){state=normalizeProgress(readJSON(PROGRESS_KEY,defaultState));activeId=numberOr(state.currentLessonId,firstIncompleteId());renderLesson();});
  if(!lessons.length){view.innerHTML='<h2>Не удалось загрузить программу</h2><p>Обнови страницу. Файл course-data.js не содержит уроков.</p>';return;}
  updateProgressHeader();renderNav();renderLesson();
})();