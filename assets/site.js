(function(){
"use strict";
var root=document.documentElement;
var saved=localStorage.getItem("awe-theme")||"auto";
var mode=(saved==="light"||saved==="dark"||saved==="auto")?saved:"auto";
var labels={auto:"AUTO",light:"☀ DAY",dark:"☾ NIGHT"};
function applyTheme(){
 var h=new Date().getHours();
 var dark=mode==="dark"||(mode==="auto"&&(h>=19||h<7));
 root.setAttribute("data-theme",dark?"dark":"light");
 root.style.colorScheme=dark?"dark":"light";
 document.querySelectorAll("[data-theme]").forEach(function(b){
  b.textContent=labels[mode];
  b.title="Theme: "+mode+" — click to change";
  b.setAttribute("aria-label","Theme: "+mode);
 });
}
window.aweTheme=function(){
 mode=mode==="auto"?"light":mode==="light"?"dark":"auto";
 localStorage.setItem("awe-theme",mode);
 applyTheme();
};
var langs=[["en","English"],["hy","Հայերեն"],["ru","Русский"],["fr","Français"],["de","Deutsch"],["es","Español"],["it","Italiano"],["pt","Português"],["nl","Nederlands"],["pl","Polski"],["uk","Українська"],["cs","Čeština"],["sk","Slovenčina"],["ro","Română"],["bg","Български"],["el","Ελληνικά"],["tr","Türkçe"],["ka","ქართული"],["ar","العربية"],["fa","فارسی"],["he","עברית"],["hi","हिन्दी"],["bn","বাংলা"],["ur","اردو"],["zh-CN","简体中文"],["zh-TW","繁體中文"],["ja","日本語"],["ko","한국어"],["vi","Tiếng Việt"],["th","ไทย"],["id","Bahasa Indonesia"],["ms","Bahasa Melayu"],["tl","Filipino"],["sw","Kiswahili"],["af","Afrikaans"],["sq","Shqip"],["sr","Српски"],["hr","Hrvatski"],["sl","Slovenščina"],["hu","Magyar"],["fi","Suomi"],["sv","Svenska"],["no","Norsk"],["da","Dansk"],["is","Íslenska"],["et","Eesti"],["lv","Latviešu"],["lt","Lietuvių"],["ca","Català"],["eu","Euskara"],["gl","Galego"],["az","Azərbaycan dili"],["kk","Қазақша"],["uz","O‘zbekcha"],["mn","Монгол"],["ne","नेपाली"],["ta","தமிழ்"],["te","తెలుగు"],["ml","മലയാളം"],["mr","मराठी"],["gu","ગુજરાતી"],["pa","ਪੰਜਾਬੀ"],["my","မြန်မာ"],["km","ខ្មែរ"],["lo","ລາວ"],["am","አማርኛ"],["zu","isiZulu"],["yo","Yorùbá"],["ig","Igbo"],["fil","Filipino"],["la","Latina"]];
window.aweLangs=langs;
function setLang(v){
 localStorage.setItem("awe-language",v);
 if(v==="en")return;
 var u="https://translate.google.com/translate?sl=auto&tl="+encodeURIComponent(v)+"&u="+encodeURIComponent(window.location.href);
 window.location.href=u;
}
document.querySelectorAll("[data-language]").forEach(function(sel){
 langs.forEach(function(item){var o=document.createElement("option");o.value=item[0];o.textContent=item[1];sel.appendChild(o);});
 var current=localStorage.getItem("awe-language")||"en";sel.value=current;
 sel.addEventListener("change",function(){setLang(sel.value);});
});
document.querySelectorAll("[data-theme]").forEach(function(b){b.addEventListener("click",window.aweTheme);});
document.querySelectorAll("[data-year]").forEach(function(x){x.textContent=new Date().getFullYear();});
document.querySelectorAll(".reveal").forEach(function(x,i){x.style.animationDelay=(i*.035)+"s";});
applyTheme();
})();