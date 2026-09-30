/* AWE Static Data Engine — 100% client-side */
const DEFAULT_DB_URL="https://raw.githubusercontent.com/ARARAT33/AWEArchiveDB/refs/heads/main/awedb.json";
const app=document.getElementById("app");
const footer=document.getElementById("footer-status");
let db={items:[],sources:[]};
let activeDbUrl="";

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);
const isHttp=u=>{try{const x=new URL(u,location.href);return /^https?:$/.test(x.protocol)}catch{return false}};
const abs=u=>{try{return new URL(u,location.href).href}catch{return String(u||"")}};
const slug=v=>String(v??"").toLowerCase().trim().replace(/[^a-z0-9\u0530-\u058f\u0561-\u0587]+/g,"-").replace(/^-|-$/g,"");
const first=(o,keys,fallback="")=>{for(const k of keys)if(o&&o[k]!=null&&o[k]!=="")return o[k];return fallback};
const sourceUrl=()=>{const q=new URLSearchParams(location.search).get("db");if(q&&isHttp(q))return abs(q);try{const s=localStorage.getItem("awe-db-url");if(s&&isHttp(s))return s}catch{}return DEFAULT_DB_URL};

function githubRepo(u){
  try{
    const x=new URL(u);
    if(x.hostname!=="github.com")return null;
    const p=x.pathname.split("/").filter(Boolean);
    if(p.length<2)return null;
    return {owner:p[0],repo:p[1].replace(/\.git$/,""),branch:p[3]||""};
  }catch{return null}
}
function rawToGitHub(u){
  try{
    const x=new URL(u);
    if(x.hostname!=="raw.githubusercontent.com")return "";
    const p=x.pathname.split("/").filter(Boolean);
    if(p.length<3)return "";
    return "https://github.com/"+p[0]+"/"+p[1]+"/blob/"+p[2]+"/"+p.slice(3).join("/");
  }catch{return ""}
}
function guessType(name,url=""){
  const s=(name||url).toLowerCase().split("?")[0];
  if(/\.(json|jsonl)$/.test(s))return "json";
  if(/\.(md|markdown|txt|rst)$/.test(s))return "text";
  if(/\.(html?|css|js|mjs|ts|tsx|jsx)$/.test(s))return "code";
  if(/\.(png|jpe?g|gif|webp|svg|avif)$/.test(s))return "image";
  if(/\.(mp4|webm|mov|mkv|mp3|wav|ogg)$/.test(s))return "media";
  if(/\.(pdf)$/.test(s))return "pdf";
  return "file";
}
function normalizeManifest(raw){
  if(Array.isArray(raw))return raw;
  if(raw&&typeof raw==="object"){
    for(const k of ["items","sources","files","entries","resources","projects","repositories","repos"])if(Array.isArray(raw[k]))return raw[k];
    const vals=Object.entries(raw);
    if(vals.length)return vals.map(([name,value])=>typeof value==="object"?{name,...value}:{name,value});
  }
  return [];
}

async function fetchJson(url){
  const r=await fetch(url,{cache:"no-store"});
  if(!r.ok)throw Error("HTTP "+r.status+" — "+url);
  const text=await r.text();
  try{return JSON.parse(text)}catch{throw Error("Աղբյուրը JSON չէ — "+url)}
}

async function expandRepo(repoUrl,meta={},seen=new Set()){
  const g=githubRepo(repoUrl);
  if(!g)return [{...meta,name:first(meta,["name","title"],repoUrl),url:repoUrl,type:"repo",source:repoUrl}];
  const key=g.owner+"/"+g.repo+"/"+(g.branch||"default");
  if(seen.has("repo:"+key))return [];
  seen.add("repo:"+key);
  const ref=g.branch?encodeURIComponent(g.branch):"HEAD";
  const api="https://api.github.com/repos/"+encodeURIComponent(g.owner)+"/"+encodeURIComponent(g.repo)+"/git/trees/"+ref+"?recursive=1";
  const r=await fetch(api,{headers:{Accept:"application/vnd.github+json"},cache:"no-store"});
  if(!r.ok)throw Error("GitHub repository tree HTTP "+r.status+" — "+repoUrl);
  const tree=await r.json();
  const branch=tree.default_branch||g.branch||"main";
  return (tree.tree||[]).filter(x=>x.type==="blob").map(x=>{
    const raw="https://raw.githubusercontent.com/"+g.owner+"/"+g.repo+"/"+branch+"/"+x.path;
    return {
      name:x.path.split("/").pop(),
      title:x.path,
      path:x.path,
      type:guessType(x.path,raw),
      url:raw,
      raw_url:raw,
      github_url:"https://github.com/"+g.owner+"/"+g.repo+"/blob/"+branch+"/"+x.path,
      repository:g.owner+"/"+g.repo,
      source:repoUrl,
      size:x.size||0
    };
  });
}

async function collect(value,meta={},seen=new Set()){
  const out=[];
  if(value==null)return out;
  if(typeof value==="string"){
    if(isHttp(value)){
      const repo=githubRepo(value);
      if(repo)return expandRepo(value,meta,seen);
      const u=abs(value);
      if(/\.json(?:$|[?#])/i.test(u)){
        const key="json:"+u;if(seen.has(key))return [];seen.add(key);
        try{return collect(await fetchJson(u),{...meta,source:u},seen)}
        catch{return [{...meta,name:first(meta,["name","title"],u),url:u,type:"json",source:u}]}
      }
      return [{...meta,name:first(meta,["name","title"],u.split("/").pop()||u),url:u,type:first(meta,["type","kind"],guessType(u,u)),source:first(meta,["source"],u)}];
    }
    return [{...meta,name:value,type:"file"}];
  }
  if(Array.isArray(value)){
    for(const v of value)out.push(...await collect(v,meta,seen));
    return out;
  }
  if(typeof value==="object"){
    const repo=first(value,["repo","repository","github_repo"]);
    const explicit=first(value,["url","raw_url","href","link","github"]);
    const children=first(value,["items","files","entries","sources","resources"]);
    if(repo&&isHttp(repo))out.push(...await expandRepo(repo,value,seen));
    else if(explicit&&isHttp(explicit)){
      const u=abs(explicit),g=githubRepo(u);
      if(g&&(!value.path||value.type==="repo"))out.push(...await expandRepo(u,value,seen));
      else if(/\.json(?:$|[?#])/i.test(u)&&value.load!==false){
        const key="json:"+u;
        if(!seen.has(key)){seen.add(key);try{out.push(...await collect(await fetchJson(u),{...value,source:u},seen))}catch{out.push({...value,name:first(value,["name","title"],u),url:u,type:"json",source:u})}}
      }else out.push({...value,name:first(value,["name","title"],u),url:u,type:first(value,["type","kind"],guessType(u,u)),source:first(value,["source"],u)});
    }else if(children)out.push(...await collect(children,value,seen));
    else {
      const name=first(value,["name","title","id"],"item-"+(out.length+1));
      out.push({...value,name,type:first(value,["type","kind"],"item")});
    }
  }
  return out;
}

function dedupe(items){
  const seen=new Set();
  return items.filter((x,i)=>{
    const k=(x.url||x.raw_url||x.github_url||x.path||x.name||"item-"+i).toLowerCase();
    if(seen.has(k))return false;seen.add(k);return true;
  }).map((x,i)=>({...x,_index:i,_id:slug(x.id||x.path||x.name)||"item-"+(i+1)}));
}
async function loadDb(url){
  activeDbUrl=url;
  if(footer)footer.textContent="Static • Loading "+url;
  const raw=await fetchJson(url);
  const items=dedupe(await collect(normalizeManifest(raw),{source:url}));
  db={items,sources:[url]};
  if(footer)footer.textContent="Static • "+items.length+" resources • AWEArchiveDB";
  return db;
}

function layout(title,subtitle,body){
  return '<div class="page"><div class="crumbs"><a href="#/">AWE</a> / '+esc(title)+'</div><div class="title-row"><div><div class="eyebrow">AWE • STATIC DATA ENGINE</div><h1>'+esc(title)+'</h1><p class="muted">'+esc(subtitle||"")+'</p></div></div>'+body+'</div>';
}
function itemCard(x){
  const id=encodeURIComponent(x._id),type=esc(x.type||"file");
  return '<a class="card" href="#/item/'+id+'"><div class="card-icon">'+(x.type==="repo"?"⌘":x.type==="image"?"▧":"◇")+'</div><h3>'+esc(x.name||x.title||"Untitled")+'</h3><p>'+esc(first(x,["description","desc","summary","about","path"],x.url||""))+'</p><div class="tags"><span class="tag">'+type+'</span>'+(x.repository?'<span class="tag">'+esc(x.repository)+'</span>':"")+'</div></a>';
}
function sourceEditor(){
  return '<div class="panel"><div class="kv"><b>Տվյալների աղբյուր</b><span>100% static browser fetch</span></div><form id="source-form" class="actions"><input id="source-url" class="search" style="flex:1" value="'+esc(activeDbUrl||sourceUrl())+'" placeholder="https://.../awedb.json"><button class="btn primary" type="submit">Բեռնել աղբյուրը →</button></form><div class="muted" style="margin-top:8px">Կարող է լինել JSON manifest, raw GitHub JSON կամ GitHub repository URL։ Repository-ի դեպքում կայքը browser-ից ստանում է repository-ի file tree-ը և յուրաքանչյուր ֆայլի raw URL-ը։</div></div>';
}
function home(){
  const items=db.items,repos=items.filter(x=>x.type==="repo").length;
  app.innerHTML='<section class="hero"><div><div class="eyebrow">AWE ECOSYSTEM / STATIC</div><h1>Մի ամբողջ<br><span>AWE</span> աշխարհ։</h1><p>AWE-ի կայքը ինքն իրեն կառուցում է AWEArchiveDB-ի manifest-ից։ Manifest-ում կարող են լինել առանձին raw ֆայլեր, JSON-ներ, GitHub repository-ներ կամ դրանց ցուցակներ։</p><div class="actions"><a class="btn primary" href="#/projects">Բացել բոլոր ֆայլերը →</a><a class="btn" href="#/archive">Տվյալների աղբյուր</a></div></div><div class="orbit"><div class="core">AWE</div></div></section><section class="section"><div class="stats"><div class="stat"><b>'+items.length+'</b><span>ռեսուրս</span></div><div class="stat"><b>'+repos+'</b><span>repository</span></div><div class="stat"><b>'+(items.length-repos)+'</b><span>ֆայլ / այլ</span></div><div class="stat"><b>100%</b><span>static</span></div></div></section><section class="section"><div class="section-head"><div><h2>Վերջին աղբյուրները</h2><div class="muted">Ամեն ինչ հավաքվում է DB-ի հղումներից։</div></div><a class="btn" href="#/projects">Բոլորը →</a></div>'+(items.length?'<div class="grid">'+items.slice(0,8).map(itemCard).join("")+'</div>':'<div class="empty">AWEArchiveDB-ում դեռ ցուցակ չկա։ Ավելացրու ֆայլերի կամ repository-ների հղումները awedb.json-ում։</div>')+'</section>';
}
function projects(){
  app.innerHTML=layout("Ֆայլեր և նախագծեր","AWEArchiveDB-ի բոլոր հավաքված աղբյուրները",'<div class="toolbar"><input id="q" class="search" placeholder="Փնտրել անունով, path-ով, repository-ով…"><div class="filters"><button class="active" data-filter="all">Բոլորը</button><button data-filter="repo">Repository</button><button data-filter="code">Code</button><button data-filter="json">JSON</button><button data-filter="image">Images</button><button data-filter="other">Այլ</button></div></div><div id="cards" class="grid"></div>');
  const render=(f="all",q="")=>{const list=db.items.filter(x=>f==="all"||(f==="other"?["repo","code","json","image"].indexOf(x.type)<0:x.type===f)).filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));document.getElementById("cards").innerHTML=list.length?list.map(itemCard).join(""):'<div class="empty" style="grid-column:1/-1">Ոչինչ չի գտնվել։</div>'};
  render();
  document.getElementById("q").oninput=e=>render(document.querySelector(".filters .active").dataset.filter,e.target.value);
  document.querySelectorAll(".filters button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filters button").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.filter,document.getElementById("q").value)});
}
function renderText(text,type){
  if(type==="json"){try{return '<pre>'+esc(JSON.stringify(JSON.parse(text),null,2))+'</pre>'}catch{}}
  if(type==="text"||type==="code")return '<pre>'+esc(text)+'</pre>';
  return "";
}
async function itemPage(id){
  const x=db.items.find(v=>v._id===id);
  if(!x){app.innerHTML=layout("Չգտնվեց","Այս ռեսուրսը DB-ում չկա.",'<div class="empty">Վերադարձիր <a href="#/projects">ֆայլերի էջ</a>։</div>');return}
  const url=first(x,["url","raw_url","href","link"],"");
  const pairs=Object.entries(x).filter(([k])=>!["_index","_id"].includes(k)).map(([k,v])=>'<div class="kv"><b>'+esc(k)+'</b><span>'+esc(typeof v==="object"?JSON.stringify(v):v)+'</span></div>').join("");
  app.innerHTML=layout(x.name||x.title,"Աղբյուր՝ "+(x.repository||x.source||url),'<div class="actions">'+(url?'<a class="btn primary" href="'+esc(url)+'" target="_blank" rel="noopener">Բացել raw ↗</a>':"")+(x.github_url?'<a class="btn" href="'+esc(x.github_url)+'" target="_blank" rel="noopener">GitHub ↗</a>':"")+'<a class="btn" href="#/projects">← Բոլոր ֆայլերը</a></div><div class="panel">'+pairs+'</div><div id="preview" class="panel"><div class="muted">Preview բեռնվում է…</div></div>');
  const preview=document.getElementById("preview");
  if(url&&["json","text","code"].includes(x.type)){
    try{const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);const t=await r.text();preview.innerHTML=renderText(t,x.type)||'<div class="muted">Preview չկա։</div>'}
    catch(e){preview.innerHTML='<div class="muted">Preview-ը հասանելի չէ (հնարավոր է CORS կամ աղբյուրը սահմանափակ է)։ <a href="'+esc(url)+'" target="_blank" rel="noopener">Բացել աղբյուրը</a></div>'}
  }else preview.innerHTML='<div class="muted">Այս տեսակի ֆայլի համար preview չի կատարվում։ Օգտագործիր աղբյուրի հղումը։</div>';
}
function archive(){
  app.innerHTML=layout("AWEArchiveDB","Միայն մեկ manifest-ից ամբողջ static կայքի կառուցում",sourceEditor()+'<div class="section"><div class="section-head"><h2>Աղբյուրներ</h2></div><div class="panel"><div class="kv"><b>Manifest</b><a href="'+esc(activeDbUrl||sourceUrl())+'" target="_blank" rel="noopener">'+esc(activeDbUrl||sourceUrl())+'</a></div><div class="kv"><b>Հավաքված ռեսուրսներ</b><span>'+db.items.length+'</span></div><div class="kv"><b>Backend</b><span>0 — browser-side only</span></div></div></div>');
  document.getElementById("source-form").onsubmit=async e=>{e.preventDefault();const u=document.getElementById("source-url").value.trim();if(!isHttp(u))return alert("Մուտքագրիր ճիշտ HTTP/HTTPS URL");try{localStorage.setItem("awe-db-url",u)}catch{}try{await loadDb(u);location.hash="#/projects"}catch(err){alert("Չհաջողվեց բեռնել աղբյուրը։ "+err.message)}};
}
function route(){
  const parts=location.hash.replace(/^#\/?/,"").split("/").filter(Boolean);
  if(!parts.length)return home();
  if(parts[0]==="projects")return projects();
  if(parts[0]==="archive")return archive();
  if(parts[0]==="item")return itemPage(decodeURIComponent(parts.slice(1).join("/")));
  home();
}
async function boot(){
  try{await loadDb(sourceUrl());route()}
  catch(e){
    db={items:[],sources:[]};
    if(footer)footer.textContent="Static • DB error";
    app.innerHTML=layout("Տվյալների աղբյուրի սխալ","Կայքը շարունակում է աշխատել առանց backend-ի.",sourceEditor()+'<div class="empty"><strong>Չհաջողվեց բեռնել manifest-ը։</strong><br>'+esc(e.message)+'<br><br>Ստուգիր URL-ը և CORS-ը։</div>');
    const f=document.getElementById("source-form");if(f)f.onsubmit=async ev=>{ev.preventDefault();const u=document.getElementById("source-url").value.trim();if(!isHttp(u))return alert("Մուտքագրիր ճիշտ HTTP/HTTPS URL");try{localStorage.setItem("awe-db-url",u);await loadDb(u);location.hash="#/projects"}catch(err){alert(err.message)}};
  }
}
window.addEventListener("hashchange",route);
boot();
