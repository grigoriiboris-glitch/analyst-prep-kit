/* DataCraft shared wallet. Coins are awarded once per newly completed lesson/task. */
(function () {
  'use strict';
  var KEY = 'datacraft-wallet-v1';
  var CATALOG = {
    foundations: {key:'apk-foundations-progress-v1',prop:'map',rate:2,total:8,bonus:5},
    quality: {key:'apk-quality-score',prop:'quality',rate:1,total:5,bonus:5},
    sql: {key:'sqlkit-v1',prop:'doneLessons',rate:1,total:48,bonus:8},
    excel: {key:'epk',prop:'lessonsDone',rate:1,total:51,bonus:8},
    python: {key:'ppk',prop:'lessonsDone',rate:1,total:42,bonus:7},
    powerbi: {key:'pbikt-v1',prop:'doneLessons',rate:1,total:39,bonus:7},
    stats: {key:'spk',prop:'done',rate:2,total:16,bonus:6},
    tableau: {key:'tpk',prop:'done',rate:1,total:32,bonus:6},
    charts: {key:'clk-v1',prop:'done',rate:2,total:13,bonus:4},
    forecasting: {key:'fmk-v1',prop:'done',rate:2,total:13,bonus:4},
    decision: {key:'apk-decision-thinking-progress-v1',prop:'array',rate:2,total:6,bonus:5},
    interview: {key:'ipk',prop:'lessonsComplete',rate:1,total:16,bonus:5}
  };
  var OPTIONAL = {
    'alteryx-cert':'apk-alteryxcert','azure-data-cert':'apk-dp900cert','databricks-cert':'apk-dbxcert',
    'docusign-cert':'apk-dscert','docusign-clm-cert':'apk-dsclmcert',
    'docusign-clm-implementation-cert':'apk-dsclmimplcert','docusign-clm-workflow-cert':'apk-dsclmwfcert',
    'docusign-org-cert':'apk-dsorgcert','excel-cert':'apk-excelcert',
    'excel-expert-cert':'apk-excelexpertcert','ga4-cert':'apk-ga4cert',
    'powerbi-cert':'apk-pbicert','tableau-cert':'apk-tabcert'
  };
  var COURSE_NAMES = {
    foundations:'Основы аналитики',quality:'Качество данных',sql:'SQL',excel:'Excel',
    python:'Python',powerbi:'Power BI',stats:'Статистика',tableau:'Tableau',
    charts:'Грамотность графиков',forecasting:'Прогнозирование',decision:'Логика и решения',
    portfolio:'Портфолио',simulator:'Рабочий симулятор',interview:'Подготовка к интервью',
    final:'Итоговый экзамен',projectStudio:'Проектная мастерская'
  };
  var BONUS = {portfolio:10,simulator:5,final:15,projectStudio:10};
  var DEFAULT = {version:1,balance:10,totalEarned:0,totalSpent:0,claimed:{},courseBonuses:{},buildings:{},purchases:{},transactions:[]};
  var wallet = load();

  function clone(v){return JSON.parse(JSON.stringify(v));}
  function read(key){try{var v=localStorage.getItem(key);return v?JSON.parse(v):null;}catch(e){return null;}}
  function load(){
    var saved=read(KEY);
    if(!saved||typeof saved!=='object'){
      var fresh=clone(DEFAULT);
      fresh.transactions.push({id:'welcome',delta:10,balance:10,reason:'Стартовый запас монет',time:Date.now()});
      try{localStorage.setItem(KEY,JSON.stringify(fresh));}catch(e){}
      return fresh;
    }
    var w=Object.assign(clone(DEFAULT),saved);
    ['claimed','courseBonuses','buildings','purchases'].forEach(function(k){if(!w[k]||typeof w[k]!=='object')w[k]={};});
    if(!Array.isArray(w.transactions))w.transactions=[];
    ['balance','totalEarned','totalSpent'].forEach(function(k){if(!Number.isFinite(w[k])||w[k]<0)w[k]=0;});
    return w;
  }
  function persist(){
    try{localStorage.setItem(KEY,JSON.stringify(wallet));}catch(e){}
    try{window.dispatchEvent(new CustomEvent('datacraft:wallet-updated',{detail:clone(wallet)}));}catch(e){}
  }
  function record(id,delta,reason){
    wallet.transactions.push({id:id,delta:delta,balance:wallet.balance,reason:String(reason||'Изменение баланса'),time:Date.now()});
    if(wallet.transactions.length>120)wallet.transactions=wallet.transactions.slice(-120);
  }
  function earn(id,amount,reason){
    amount=Math.max(0,Math.floor(Number(amount)||0));
    if(!id||amount<=0||wallet.claimed[id])return false;
    wallet.claimed[id]=true;
    wallet.balance+=amount;wallet.totalEarned+=amount;
    record(id,amount,reason);
    persist();return true;
  }
  function spend(amount,reason,id){
    amount=Math.max(0,Math.floor(Number(amount)||0));
    if(amount<=0)return true;
    if(id&&wallet.purchases[id])return true;
    if(wallet.balance<amount)return false;
    wallet.balance-=amount;wallet.totalSpent+=amount;
    if(id)wallet.purchases[id]=true;
    record(id||('spend:'+Date.now()),-amount,reason||'Покупка');
    persist();return true;
  }
  function markBuilding(id,cost){
    if(wallet.buildings[id])return {ok:true,already:true};
    if(!spend(cost,'Постройка: '+(COURSE_NAMES[id]||id),'building:'+id))return {ok:false,already:false};
    wallet.buildings[id]=true;
    record('built:'+id,0,'Здание построено: '+(COURSE_NAMES[id]||id));
    persist();
    return {ok:true,already:false};
  }
  function completedItems(){
    var items=[];
    function add(id,title,amount,course){items.push({id:id,title:title||id,amount:amount||1,course:course});}
    Object.keys(CATALOG).forEach(function(course){
      var def=CATALOG[course],state=read(def.key);
      if(!state)return;
      if(def.prop==='map'){
        Object.keys(state).forEach(function(id){if(state[id]===true&&/^\d+$/.test(id))add(course+':lesson:'+id,'Урок '+(Number(id)+1),def.rate,course);});
      }else if(def.prop==='array'){
        if(Array.isArray(state))state.forEach(function(id){add(course+':lesson:'+id,'Урок '+id,def.rate,course);});
      }else if(def.prop==='doneLessons'||def.prop==='lessonsDone'){
        var arr=state[def.prop];if(Array.isArray(arr))arr.forEach(function(id){add(course+':lesson:'+id,'Урок '+id,def.rate,course);});
      }else if(def.prop==='done'||def.prop==='lessonsComplete'){
        var map=state[def.prop]||{};
        Object.keys(map).forEach(function(id){
          if(map[id]===true&&/^lesson\d+$/.test(id))add(course+':'+id,'Завершённый урок '+id.replace('lesson',''),def.rate,course);
          else if(course==='interview'&&map[id]===true&&/^\d+$/.test(id))add(course+':lesson:'+id,'Урок '+(Number(id)+1),def.rate,course);
        });
      }
    });

    var qualityPassed=read('apk-quality-passed-v1');
    if(Array.isArray(qualityPassed)){
      qualityPassed.forEach(function(id){add('quality:category:'+id,'Категория качества: '+id,1,'quality');});
    }else{
      var oldScore='';
      try{oldScore=localStorage.getItem('apk-quality-score')||'';}catch(e){}
      var sm=/^(\d+)\s*\/\s*5$/.exec(oldScore);
      if(sm&&Number(sm[1])===5)['duplicate','missing','format','numeric','date'].forEach(function(id){add('quality:legacy-perfect:'+id,'Задача качества данных',1,'quality');});
    }

    ['sales','support','marketing'].forEach(function(project){
      var arr=read('apk-portfolio-'+project+'-checks');
      if(!Array.isArray(arr))arr=[];
      arr.filter(function(n){return Number.isInteger(n)&&n>=0&&n<6;}).forEach(function(n){
        add('portfolio:'+project+':criterion:'+n,'Критерий: '+project,1,'portfolio');
      });
      if(new Set(arr.filter(function(n){return Number.isInteger(n)&&n>=0&&n<6;})).size===6){
        add('portfolio:'+project+':complete','Готовый кейс: '+project,4,'portfolio');
      }
    });

    var sim=read('sim2')||{};
    if(sim.reviews&&typeof sim.reviews==='object')Object.keys(sim.reviews).forEach(function(id){
      if(sim.reviews[id])add('simulator:review:'+id,'Проверенная задача: '+id,2,'simulator');
    });

    var finalState=read('apk-final')||{};
    if(finalState.submittedSections&&typeof finalState.submittedSections==='object')
      Object.keys(finalState.submittedSections).forEach(function(id){
        if(finalState.submittedSections[id])add('final:section:'+id,'Раздел экзамена: '+id,2,'final');
      });
    if(finalState.submitted)add('final:submitted','Итоговый экзамен завершён',15,'final');

    var projectDB=read('apk-projects-v1')||{};
    if(Array.isArray(projectDB.projects)){
      projectDB.projects.forEach(function(p){
        if(p&&p.phase==='present')add('projectStudio:complete:'+p.id,'Проект завершён: '+(p.scope&&p.scope.question||'проект'),10,'projectStudio');
      });
    }
    Object.keys(OPTIONAL).forEach(function(id){
      var st=read(OPTIONAL[id])||{};
      if(st.submitted)add('cert:'+id+':submitted','Экзамен завершён: '+id,10,id);
    });
    return items;
  }
  function courseIsComplete(course, items){
    var count=items.filter(function(x){return x.course===course;}).length;
    var def=CATALOG[course];
    if(course==='quality'){
      var score='';try{score=localStorage.getItem('apk-quality-score')||'';}catch(e){}
      return score==='5/5';
    }
    if(course==='portfolio')return ['sales','support','marketing'].every(function(p){return !!wallet.claimed['portfolio:'+p+':complete']||items.some(function(x){return x.id==='portfolio:'+p+':complete';});});
    if(course==='simulator')return count>=10;
    if(course==='final'){var fs=read('apk-final')||{};return !!fs.submitted;}
    if(course==='projectStudio'){var db=read('apk-projects-v1')||{};return Array.isArray(db.projects)&&db.projects.some(function(p){return p&&p.phase==='present';});}
    if(def)return count>=def.total;
    return false;
  }
  function sync(){
    var before=wallet.balance,items=completedItems();
    items.forEach(function(item){earn(item.id,item.amount,item.title);});
    Object.keys(CATALOG).forEach(function(course){
      if(courseIsComplete(course,items)&&!wallet.courseBonuses[course]){
        wallet.courseBonuses[course]=true;
        var amount=CATALOG[course].bonus||0;
        if(amount>0){wallet.balance+=amount;wallet.totalEarned+=amount;record('course-bonus:'+course,amount,'Бонус за завершение: '+(COURSE_NAMES[course]||course));}
      }
    });
    if(courseIsComplete('portfolio',items)&&!wallet.courseBonuses.portfolio){
      wallet.courseBonuses.portfolio=true;wallet.balance+=10;wallet.totalEarned+=10;record('course-bonus:portfolio',10,'Бонус за портфолио');
    }
    if(courseIsComplete('simulator',items)&&!wallet.courseBonuses.simulator){
      wallet.courseBonuses.simulator=true;wallet.balance+=5;wallet.totalEarned+=5;record('course-bonus:simulator',5,'Бонус за симулятор');
    }
    if(courseIsComplete('final',items)&&!wallet.courseBonuses.final){
      wallet.courseBonuses.final=true;wallet.balance+=15;wallet.totalEarned+=15;record('course-bonus:final',15,'Бонус за итоговый экзамен');
    }
    var db=read('apk-projects-v1')||{};
    if(courseIsComplete('projectStudio',items)&&!wallet.courseBonuses.projectStudio){
      wallet.courseBonuses.projectStudio=true;wallet.balance+=10;wallet.totalEarned+=10;record('course-bonus:projectStudio',10,'Бонус за готовый самостоятельный проект');
    }
    if(wallet.balance!==before)persist();
    return clone(wallet);
  }
  window.DataCraftEconomy = {
    key:KEY,
    getWallet:function(){return clone(wallet);},
    sync:sync,
    earn:earn,
    spend:spend,
    build:markBuilding,
    isBuilt:function(id){return !!wallet.buildings[id];},
    getBalance:function(){return wallet.balance;},
    getTotalEarned:function(){return wallet.totalEarned;},
    getTransactions:function(){return wallet.transactions.slice().reverse();},
    refresh:function(){wallet=load();return sync();}
  };
  sync();
  window.addEventListener('storage',function(e){if(!e.key||e.key===KEY){wallet=load();sync();}});
  window.setInterval(function(){sync();},2500);
})();