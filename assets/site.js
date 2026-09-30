(function(){
  "use strict";
  function storageGet(key,fallback){try{return localStorage.getItem(key)||fallback}catch(e){return fallback}}
  function storageSet(key,value){try{localStorage.setItem(key,value)}catch(e){}}
  var root=document.documentElement;
  var saved=storageGet("awe-theme","auto");
  var mode=(saved==="auto"||saved==="light"||saved==="dark")?saved:"auto";
  var labels={auto:"AUTO",light:"☀ DAY",dark:"☾ NIGHT"};
  var langs=[["en","English"],["hy","Հայերեն"],["ru","Русский"],["fr","Français"],["de","Deutsch"],["es","Español"],["it","Italiano"],["pt","Português"],["nl","Nederlands"],["pl","Polski"],["uk","Українська"],["tr","Türkçe"],["ka","ქართული"],["ar","العربية"],["fa","فارسی"],["he","עברית"],["hi","हिन्दी"],["zh-CN","简体中文"],["zh-TW","繁體中文"],["ja","日本語"],["ko","한국어"],["vi","Tiếng Việt"],["th","ไทย"],["id","Bahasa Indonesia"],["az","Azərbaycan dili"],["el","Ελληνικά"],["ro","Română"],["bg","Български"],["hu","Magyar"],["sv","Svenska"],["no","Norsk"],["da","Dansk"],["fi","Suomi"],["cs","Čeština"],["sk","Slovenčina"],["sr","Српски"],["hr","Hrvatski"],["sl","Slovenščina"],["lt","Lietuvių"],["lv","Latviešu"],["et","Eesti"],["ca","Català"],["eu","Euskara"],["gl","Galego"],["kk","Қазақша"],["uz","O‘zbekcha"],["mn","Монгол"],["ne","नेपाली"],["ta","தமிழ்"],["te","తెలుగు"],["ml","മലയാളം"],["mr","मराठी"],["bn","বাংলা"],["ur","اردو"],["pa","ਪੰਜਾਬੀ"],["my","မြန်မာ"],["km","ខ្មែរ"],["lo","ລາວ"],["am","አማርኛ"],["sw","Kiswahili"],["af","Afrikaans"],["sq","Shqip"],["zu","isiZulu"],["yo","Yorùbá"],["ig","Igbo"],["la","Latina"]];
  window.aweLangs=langs;
  function applyTheme(){
    try{
      var hour=new Date().getHours();
      var dark=mode==="dark"||(mode==="auto"&&(hour>=19||hour<7));
      root.setAttribute("data-theme",dark?"dark":"light");
      root.style.colorScheme=dark?"dark":"light";
      var buttons=document.querySelectorAll("[data-theme]");
      for(var i=0;i<buttons.length;i++){buttons[i].textContent=labels[mode];buttons[i].title="Theme: "+mode+" — click to change";buttons[i].setAttribute("aria-label","Theme: "+mode);}
    }catch(e){}
  }
  window.aweTheme=function(){
    mode=mode==="auto"?"light":mode==="light"?"dark":"auto";
    storageSet("awe-theme",mode);
    applyTheme();
  };
  function setLanguage(value){
    storageSet("awe-language",value);
    if(value==="en")return;
    var target=window.location.href;
    window.location.href="https://translate.google.com/translate?sl=auto&tl="+encodeURIComponent(value)+"&u="+encodeURIComponent(target);
  }
  function init(){
    try{
      var selects=document.querySelectorAll("[data-language]");
      var current=storageGet("awe-language","en");
      for(var i=0;i<selects.length;i++){
        var select=selects[i];
        for(var j=0;j<langs.length;j++){
          var option=document.createElement("option");
          option.value=langs[j][0];option.textContent=langs[j][1];select.appendChild(option);
        }
        select.value=current;
        select.addEventListener("change",function(){setLanguage(this.value)});
      }
      var themeButtons=document.querySelectorAll("[data-theme]");
      for(var k=0;k<themeButtons.length;k++)themeButtons[k].addEventListener("click",window.aweTheme);
      var years=document.querySelectorAll("[data-year]");
      for(var y=0;y<years.length;y++)years[y].textContent=new Date().getFullYear();
      root.classList.add("js-ready");
      applyTheme();
    }catch(e){
      root.classList.add("js-ready");
      applyTheme();
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();