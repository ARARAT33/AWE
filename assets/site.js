(function(){
"use strict";
function get(key,fallback){try{return localStorage.getItem(key)||fallback}catch(e){return fallback}}
function set(key,value){try{localStorage.setItem(key,value)}catch(e){}}
var root=document.documentElement;
var mode=get("awe-theme","light");
if(mode!=="light"&&mode!=="dark")mode="light";
var labels={light:"☀ LIGHT",dark:"☾ DARK"};
var langs=[["en","English"],["hy","Հայերեն"],["ru","Русский"],["fr","Français"],["de","Deutsch"],["es","Español"],["it","Italiano"],["pt","Português"],["nl","Nederlands"],["pl","Polski"],["uk","Українська"],["tr","Türkçe"],["ka","ქართული"],["ar","العربية"],["fa","فارسی"],["he","עברית"],["hi","हिन्दी"],["zh-CN","简体中文"],["zh-TW","繁體中文"],["ja","日本語"],["ko","한국어"],["vi","Tiếng Việt"],["th","ไทย"],["id","Bahasa Indonesia"],["az","Azərbaycan dili"],["el","Ελληνικά"],["ro","Română"],["bg","Български"],["hu","Magyar"],["sv","Svenska"],["no","Norsk"],["da","Dansk"],["fi","Suomi"],["cs","Čeština"],["sk","Slovenčina"],["sr","Српски"],["hr","Hrvatski"],["sl","Slovenščina"],["lt","Lietuvių"],["lv","Latviešu"],["et","Eesti"],["ca","Català"],["eu","Euskara"],["gl","Galego"],["kk","Қазақша"],["uz","O‘zbekcha"],["mn","Монгол"],["ne","नेपाली"],["ta","தமிழ்"],["te","తెలుగు"],["ml","മലയാളം"],["mr","मराठी"],["bn","বাংলা"],["ur","اردو"],["pa","ਪੰਜਾਬੀ"],["my","မြန်မာ"],["km","ខ្មែរ"],["lo","ລາວ"],["am","አማርኛ"],["sw","Kiswahili"],["af","Afrikaans"],["sq","Shqip"],["zu","isiZulu"],["yo","Yorùbá"],["ig","Igbo"],["la","Latina"]];
window.aweLangs=langs;
function applyTheme(){
 root.setAttribute("data-theme",mode);
 root.style.colorScheme=mode;
 document.querySelectorAll("[data-theme]").forEach(function(button){
   button.textContent=labels[mode];
   button.title="Theme: "+mode;
   button.setAttribute("aria-label","Theme: "+mode);
 });
}
window.aweTheme=function(){
 mode=mode==="light"?"dark":"light";
 set("awe-theme",mode);
 applyTheme();
};
function setLanguage(value){
 set("awe-language",value);
 if(value==="en")return;
 var target=window.location.href;
 window.location.href="https://translate.google.com/translate?sl=auto&tl="+encodeURIComponent(value)+"&u="+encodeURIComponent(target);
}
function init(){
 var selects=document.querySelectorAll("[data-language]");
 var current=get("awe-language","en");
 selects.forEach(function(select){
   if(select.options.length===0)langs.forEach(function(item){
     var option=document.createElement("option");option.value=item[0];option.textContent=item[1];select.appendChild(option);
   });
   select.value=current;
   select.addEventListener("change",function(){setLanguage(this.value)});
 });
 document.querySelectorAll("[data-theme]").forEach(function(button){button.addEventListener("click",window.aweTheme)});
 document.querySelectorAll("[data-year]").forEach(function(el){el.textContent=new Date().getFullYear()});
 applyTheme();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();