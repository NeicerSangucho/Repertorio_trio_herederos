/* =========================================================
   LÓGICA PRINCIPAL Y GENERADOR DE PDF CON MARCA DE AGUA
   ========================================================= */
const LS_KEY = "herederosRepertorioData_v3";
const EDIT_PASSWORD = "herederos";

let DATA = null;
let editMode = false;

let state = {
  screen:"categoria", categoria:null, generoId:null,
  seleccion:{}, editingSong:null, editingSet:false
};

const CATEGORIAS = {
  bailable:{ label:"Bailable", desc:"Cumbias, bombas, sanjuanitos y todo lo que mueve el piso." },
  romantico:{ label:"Romántico / Melancólico", desc:"Boleros, valses y pasillos para los momentos lentos." }
};

const REPERTORIO_DEFAULT = [
  {
    id:"setA", setLabel:"SET A", genero:"Boleros Románticos", categoria:"romantico",
    ritmo:"Bolero", tempo:"97", enlaceSetCompleto:"",
    canciones:[
      {nombre:"Mi Compañera", tono:"LA M", letra:"Ven Mujer, regálame", enlace:"", bpm:null},
      {nombre:"Triunfamos", tono:"la m", letra:"Une tu voz a mi voz", enlace:"", bpm:null},
      {nombre:"Contigo", tono:"", letra:"Tus besos se llegaron…", enlace:"", bpm:null},
      {nombre:"El prendedor", tono:"", letra:"En el prendedor, de mi…", enlace:"", bpm:null},
      {nombre:"Historia de un amor", tono:"", letra:"Ya no estás más a mi lado", enlace:"", bpm:null},
      {nombre:"Si tu me dices ven", tono:"", letra:"Si tu me dices ven", enlace:"", bpm:null},
      {nombre:"Novia mía", tono:"", letra:"Esta novia mía, será", enlace:"", bpm:null},
      {nombre:"Sabor a mí", tono:"", letra:"Tanto tiempo disfrutamos…", enlace:"", bpm:null},
      {nombre:"Piel Canela", tono:"", letra:"Que se quede el infinito", enlace:"", bpm:null},
      {nombre:"Te lo pido por favor", tono:"DO M", letra:"Donde esté, hoy y siempre", enlace:"", bpm:null}
    ]
  },
  {
    id:"setB", setLabel:"SET B", genero:"Cumbia", categoria:"bailable",
    ritmo:"Cumbia", tempo:"100", enlaceSetCompleto:"",
    canciones:[
      {nombre:"Amapola", tono:"fa m", letra:"Baby, baila sola", enlace:"", bpm:null},
      {nombre:"Ayayay", tono:"fa m", letra:"Soltera, porque todos", enlace:"", bpm:null},
      {nombre:"Para mirar las estrellas", tono:"", letra:"Para mirar las estrellas", enlace:"", bpm:null},
      {nombre:"El Aguajal", tono:"mi m", letra:"Si se marchó sin un adiós", enlace:"", bpm:null},
      {nombre:"Cumbia Chonera", tono:"sol m", letra:"", enlace:"", bpm:null},
      {nombre:"Llorando se fue", tono:"si m", letra:"Llorando se fue, la que…", enlace:"", bpm:null},
      {nombre:"Cariñito", tono:"mi m", letra:"Lloro, por quererte", enlace:"pdf/loquito-por-ti.pdf", bpm:null},
      {nombre:"Cumbia del indio", tono:"sib m", letra:"INSTRUMENTAL", enlace:"", bpm:null},
      {nombre:"Casarme no", tono:"re m", letra:"Muchachita, vienes tú", enlace:"pdf/loquito-por-ti.pdf", bpm:null},
      {nombre:"La novia", tono:"", letra:"Quise rezarle a dios", enlace:"", bpm:null},
      {nombre:"Solo tú", tono:"", letra:"Solo tú, bajo el cielo", enlace:"", bpm:null},
      {nombre:"Loquito por ti", tono:"sib m", letra:"Loquito por ti, loco loco", enlace:"pdf/loquito-por-ti.pdf", bpm:null}
    ]
  },
  {
    id:"setC", setLabel:"SET C", genero:"Vals Romántico", categoria:"romantico",
    ritmo:"Vals", tempo:"139", enlaceSetCompleto:"",
    canciones:[
      {nombre:"Felicitaciones", tono:"do m", letra:"En el silencio, de esta noche", enlace:"", bpm:null},
      {nombre:"Alma, Corazón y Vida", tono:"re m", letra:"Recuerdo aquella vez", enlace:"", bpm:null},
      {nombre:"Camino de la vida", tono:"si m", letra:"De prisa como el viento", enlace:"", bpm:null},
      {nombre:"Cariño Bonito", tono:"re m", letra:"Donde se duermen", enlace:"", bpm:null},
      {nombre:"Alma mía", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Propiedad Privada", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Guayaquileña", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Nuestro Secreto", tono:"", letra:"", enlace:"", bpm:null}
    ]
  },
  {
    id:"setD", setLabel:"SET D", genero:"Bombas", categoria:"bailable",
    ritmo:"Bomba", tempo:"115", enlaceSetCompleto:"",
    canciones:[
      {nombre:"Negrita Consentida", tono:"la m", letra:"Te conocí me enamoré", enlace:"", bpm:null},
      {nombre:"El camaleón", tono:"si m", letra:"El camaleón cambia de…", enlace:"", bpm:null},
      {nombre:"Voy Buscando", tono:"la m", letra:"Voy Buscando, un cariño", enlace:"", bpm:null},
      {nombre:"Sabor a Miel", tono:"mi m", letra:"Eres tú lo que más quiero", enlace:"", bpm:null},
      {nombre:"Cuerpo Sirena", tono:"la m", letra:"Solo una noche", enlace:"", bpm:null},
      {nombre:"Palabras de amor", tono:"la m", letra:"Tan solo quiero escuchar", enlace:"", bpm:null},
      {nombre:"Ven junto a mi lado", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"El chuchaqui", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Hoy aprendí", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Jamás", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Sentado en un bar", tono:"la m", letra:"Sentado en un bar", enlace:"", bpm:null},
      {nombre:"Carpuela", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Ay no se puede", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Chucta Carajo", tono:"", letra:"", enlace:"", bpm:null}
    ]
  },
  {
    id:"setE", setLabel:"SET E", genero:"Valses Nostálgicos", categoria:"romantico",
    ritmo:"Vals", tempo:"100", enlaceSetCompleto:"",
    canciones:[
      {nombre:"Mala sombra", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Mal paso", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Ingratitud", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Regresa", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Yo perdí el corazón", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Ódiame", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Cuando llora mi guitarra", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Ayer y hoy", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Engañada", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Fatalidad", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Extravío", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Reminiscencias", tono:"", letra:"", enlace:"", bpm:null}
    ]
  },
  {
    id:"setF", setLabel:"SET F", genero:"San Juanitos", categoria:"bailable",
    ritmo:"San Juanito", tempo:"114", enlaceSetCompleto:"",
    canciones:[
      {nombre:"Corazón Equivocado", tono:"mi m", letra:"Escogió mi corazón", enlace:"", bpm:null},
      {nombre:"Pobre corazón", tono:"do m", letra:"Pobre corazón, entristecido", enlace:"", bpm:null},
      {nombre:"Cantando como yo canto", tono:"do m", letra:"Cantando como yo canto", enlace:"", bpm:null},
      {nombre:"El transporte", tono:"do m", letra:"ANIMAR", enlace:"", bpm:null},
      {nombre:"Ñucta llacta", tono:"la m", letra:"Longuita, te quiero yo a vos", enlace:"", bpm:null},
      {nombre:"El travoltoso", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Mariposita", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Se acabó quien te quería", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"El Chinchinal", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Alitas Quebradas", tono:"", letra:"", enlace:"", bpm:null}
    ]
  },
  {
    id:"setG", setLabel:"SET G", genero:"Pasillos", categoria:"romantico",
    ritmo:"Pasillo", tempo:"100", enlaceSetCompleto:"",
    canciones:[
      {nombre:"El Aguacate", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Angél de Luz", tono:"la m", letra:"Ángel de luz, de aromas", enlace:"", bpm:null},
      {nombre:"17 años", tono:"mi m", letra:"Yo vivía triste", enlace:"", bpm:null},
      {nombre:"Cantares del Alma", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Te quiero, Te quiero", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Tú y yo", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Acuérdate de mí", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"El alma en los labios", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Faltándome tú", tono:"", letra:"Faltándome tu, mi vida", enlace:"", bpm:null},
      {nombre:"Por ti llorando", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Amor, Dolor", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Sombras", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Sendas Distintas", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Tu Duda y la Mía", tono:"", letra:"", enlace:"", bpm:null}
    ]
  },
  {
    id:"setH", setLabel:"SET H", genero:"Pasacalles", categoria:"bailable",
    ritmo:"Pasacalle", tempo:"110", enlaceSetCompleto:"",
    canciones:[]
  },
  {
    id:"setI", setLabel:"SET I", genero:"Bolero Rockolero", categoria:"romantico",
    ritmo:"Bolero", tempo:"95", enlaceSetCompleto:"",
    canciones:[]
  },
  {
    id:"setL_albazos", setLabel:"SET L", genero:"Albazos / Banda", categoria:"bailable",
    ritmo:"Albazo", tempo:"120", enlaceSetCompleto:"",
    canciones:[]
  },
  {
    id:"setK", setLabel:"SET K", genero:"Boleros Julio Jaramillo", categoria:"romantico",
    ritmo:"Bolero", tempo:"96", enlaceSetCompleto:"",
    canciones:[
      {nombre:"Azabache", tono:"", letra:"En el negro azabache", enlace:"", bpm:null},
      {nombre:"Niégalo todo", tono:"", letra:"No le digas a nadie", enlace:"", bpm:null},
      {nombre:"Cinco centavitos", tono:"", letra:"Quiero comprarle a la vida", enlace:"", bpm:null},
      {nombre:"Nuestro Juramento", tono:"", letra:"No puedo verte triste", enlace:"", bpm:null},
      {nombre:"Rondando tu esquina", tono:"", letra:"Esta noche tengo ganas de", enlace:"", bpm:null},
      {nombre:"El Pintor", tono:"", letra:"", enlace:"", bpm:null}
    ]
  },
  {
    id:"setL_paseitos", setLabel:"SET L", genero:"Paseítos", categoria:"bailable",
    ritmo:"Paseíto", tempo:"115", enlaceSetCompleto:"",
    canciones:[]
  },
  {
    id:"setM", setLabel:"SET M", genero:"Boleros Románticos II", categoria:"romantico",
    ritmo:"Bolero", tempo:"98", enlaceSetCompleto:"",
    canciones:[
      {nombre:"Mi Compañera", tono:"LA M", letra:"Ven Mujer, regálame", enlace:"", bpm:null},
      {nombre:"Triunfamos", tono:"la m", letra:"Une tu voz a mi voz", enlace:"", bpm:null},
      {nombre:"Contigo", tono:"", letra:"Tus besos se llegaron…", enlace:"", bpm:null},
      {nombre:"El prendedor", tono:"", letra:"En el prendedor, de mi…", enlace:"", bpm:null},
      {nombre:"Historia de un amor", tono:"", letra:"Ya no estás más a mi lado", enlace:"", bpm:null},
      {nombre:"Si tu me dices ven", tono:"", letra:"Si tu me dices ven", enlace:"", bpm:null},
      {nombre:"Novia mía", tono:"", letra:"Esta novia mía, será", enlace:"", bpm:null},
      {nombre:"Sin ti", tono:"", letra:"Sin ti, no podré vivir jamás", enlace:"", bpm:null},
      {nombre:"Sabor a mí", tono:"", letra:"Tanto tiempo disfrutamos…", enlace:"", bpm:null},
      {nombre:"Piel Canela", tono:"", letra:"Que se quede el infinito", enlace:"", bpm:null},
      {nombre:"El reloj", tono:"", letra:"Reloj, no marques la hora", enlace:"", bpm:null},
      {nombre:"Te lo pido por favor", tono:"", letra:"", enlace:"", bpm:null}
    ]
  },
  {
    id:"setL_cumbias2", setLabel:"SET L", genero:"Cumbias 2", categoria:"bailable",
    ritmo:"Cumbia", tempo:"102", enlaceSetCompleto:"",
    canciones:[
      {nombre:"La revancha", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Paso fino", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Amor de mis amores", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Te vas", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Me enamore de ti, y que", tono:"", letra:"", enlace:"", bpm:null},
      {nombre:"Desesperado", tono:"", letra:"Desesperado, desesperado", enlace:"", bpm:null},
      {nombre:"El Arbolito", tono:"", letra:"Viento tú que te alejas", enlace:"", bpm:null},
      {nombre:"Baile de la cumbia", tono:"", letra:"Busco una chica como tú", enlace:"", bpm:null},
      {nombre:"Ojitos Hechiceros", tono:"", letra:"Esos dos ojitos lindos", enlace:"", bpm:null},
      {nombre:"Flor de un día", tono:"", letra:"No ya no quiero quererte más", enlace:"", bpm:null}
    ]
  }
];

async function loadData(){
  const ls = localStorage.getItem(LS_KEY);
  if(ls){ try{ return JSON.parse(ls); }catch(e){} }
  try{
    const res = await fetch('repertorio-data.json', {cache:'no-store'});
    if(res.ok){ return await res.json(); }
  }catch(e){}
  return JSON.parse(JSON.stringify(REPERTORIO_DEFAULT));
}
function saveLocal(){ localStorage.setItem(LS_KEY, JSON.stringify(DATA)); }

function totalSeleccion(){ return Object.values(state.seleccion).reduce((a,arr)=>a+arr.length,0); }
function getGenero(id){ return DATA.find(g=>g.id===id); }
function escapeAttr(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }
function slug(s){ return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }

// Asistente visual paso a paso
function mostrarAsistenteDescarga(texto, textoBoton){
  return new Promise((resolve) => {
    let modal = document.getElementById('modalDescarga');
    if(!modal){
      modal = document.createElement('div');
      modal.id = 'modalDescarga';
      modal.style.cssText = "position:fixed; bottom:30px; right:30px; background:var(--paper); color:var(--ink); padding:20px 24px; border-radius:14px; box-shadow:0 10px 35px rgba(0,0,0,0.6); z-index:9999; font-family:'Space Grotesk', sans-serif; display:flex; flex-direction:column; gap:12px; max-width:340px; border:2px solid var(--amber);";
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="font-weight:600; font-size:14px; line-height:1.4;">${texto}</div>
      <button id="btnSigDescarga" class="btn btn-primary btn-sm" style="width:100%; text-align:center;">${textoBoton}</button>
    `;
    modal.style.display = 'flex';
    document.getElementById('btnSigDescarga').onclick = ()=>{
      modal.style.display = 'none';
      resolve();
    };
  });
}

function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._h); toast._h = setTimeout(()=>t.classList.remove('show'), 2200);
}

function toggleEditMode(){
  if(editMode){ editMode=false; }
  else{
    const pass = prompt("Contraseña para editar el repertorio:");
    if(pass===null) return;
    if(pass!==EDIT_PASSWORD){ toast("Contraseña incorrecta"); return; }
    editMode = true;
  }
  document.getElementById('editToggleBtn').textContent = editMode? "✓ Salir de edición" : "✎ Modo edición";
  renderEditToolbar();
  render();
}

function goCategoria(){ state.screen="categoria"; state.editingSong=null; state.editingSet=false; render(); }
function goGeneros(cat){ state.categoria=cat; state.screen="generos"; state.editingSong=null; state.editingSet=false; render(); }
function goCanciones(id){
  const g = getGenero(id);
  if(!g.canciones.length && !editMode){ toast("Este género aún no tiene canciones cargadas."); return; }
  state.generoId=id; state.screen="canciones"; state.editingSong=null; state.editingSet=false; render();
}

function toggleCancion(setId, nombre){
  const list = state.seleccion[setId] || [];
  const i = list.indexOf(nombre);
  if(i>-1) list.splice(i,1); else list.push(nombre);
  if(list.length) state.seleccion[setId]=list; else delete state.seleccion[setId];
}
function aceptarGenero(){ toast("Selección guardada · elige otro género"); goGeneros(state.categoria); }
function quitarCancion(setId, nombre){ toggleCancion(setId, nombre); render(); }

function render(){
  renderStepper();
  const main = document.getElementById('main');
  main.className = totalSeleccion()>0 ? "with-cart" : "";
  main.innerHTML = "";

  const panel = document.createElement('div');
  panel.className = "panel";
  if(state.screen==="categoria") panel.appendChild(renderCategoria());
  if(state.screen==="generos") panel.appendChild(renderGeneros());
  if(state.screen==="canciones") panel.appendChild(renderCanciones());

  main.appendChild(panel);
  if(totalSeleccion()>0) main.appendChild(renderCart());
}

function renderEditToolbar(){
  const el = document.getElementById('editToolbar');
  if(!editMode){ el.innerHTML=""; return; }
  el.innerHTML = `
    <div class="edit-toolbar-inner">
      <span class="mono" style="font-size:11px;color:var(--amber-light);">MODO EDICIÓN ACTIVO</span>
      <button class="btn btn-ghost btn-sm" id="btnExport">⬇ Exportar respaldo (JSON)</button>
      <button class="btn btn-ghost btn-sm" id="btnDiscard">↺ Descartar borrador local</button>
    </div>`;
  document.getElementById('btnExport').onclick = exportarJSON;
  document.getElementById('btnDiscard').onclick = ()=>{
    if(confirm("Esto borra tus cambios locales. ¿Continuar?")){
      localStorage.removeItem(LS_KEY);
      location.reload();
    }
  };
}

function exportarJSON(){
  const blob = new Blob([JSON.stringify(DATA, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download="repertorio-data.json"; a.click();
  URL.revokeObjectURL(url);
  toast("Respaldo descargado");
}

function renderStepper(){
  const s = document.getElementById('stepper');
  const steps = [
    {key:"categoria", label:"1 · Ambiente"},
    {key:"generos", label:"2 · Género"},
    {key:"canciones", label:"3 · Canciones"}
  ];
  const order = {categoria:0, generos:1, canciones:2};
  s.innerHTML = "";
  steps.forEach(st=>{
    const el = document.createElement('div');
    el.className = "step" + (state.screen===st.key ? " active" : "") + (order[st.key] < order[state.screen] ? " done" : "");
    el.textContent = st.label;
    el.onclick = ()=>{
      if(st.key==="categoria") goCategoria();
      if(st.key==="generos" && state.categoria) goGeneros(state.categoria);
      if(st.key==="canciones" && state.generoId) goCanciones(state.generoId);
    };
    s.appendChild(el);
  });
}

function renderCategoria(){
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="genre-header"><h2>¿Qué ambiente buscas?</h2></div>`;
  const grid = document.createElement('div');
  grid.className = "cat-grid";
  Object.entries(CATEGORIAS).forEach(([key,val])=>{
    const count = DATA.filter(g=>g.categoria===key).reduce((a,g)=>a+g.canciones.length,0);
    const card = document.createElement('div');
    card.className = "cat-card " + key;
    card.innerHTML = `
      <div class="count">${count} canciones</div>
      <div class="tag">${key==='bailable' ? '♪ Para bailar' : '♥ Para sentir'}</div>
      <h2>${val.label}</h2>
      <p>${val.desc}</p>`;
    card.onclick = ()=>goGeneros(key);
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
  return wrap;
}

function renderGeneros(){
  const wrap = document.createElement('div');
  const header = document.createElement('div');
  header.className = "genre-header";
  header.innerHTML = `<h2>Géneros — ${CATEGORIAS[state.categoria].label}</h2>`;
  
  const toggle = document.createElement('div');
  toggle.className = "cat-toggle";
  Object.keys(CATEGORIAS).forEach(key=>{
    const b = document.createElement('button');
    b.textContent = CATEGORIAS[key].label;
    b.className = key===state.categoria ? "active "+key : "";
    b.onclick = ()=>goGeneros(key);
    toggle.appendChild(b);
  });

  if(editMode){
    const addGenreBtn = document.createElement('button');
    addGenreBtn.className = "btn btn-primary btn-sm";
    addGenreBtn.textContent = "+ Nuevo Género";
    addGenreBtn.onclick = ()=>{
      const gName = prompt("Nombre del nuevo género:");
      if(gName){
        const newId = "set_" + Date.now();
        DATA.push({
          id: newId, setLabel: "SET " + (DATA.length + 1), genero: gName,
          categoria: state.categoria, ritmo: "", tempo: "100", enlaceSetCompleto: "", canciones: []
        });
        saveLocal(); render();
        toast("Género creado ✓");
      }
    };
    toggle.appendChild(addGenreBtn);
  }

  header.appendChild(toggle);
  wrap.appendChild(header);

  const grid = document.createElement('div');
  grid.className = "genre-grid";
  DATA.filter(g=>g.categoria===state.categoria).forEach(g=>{
    const chosen = (state.seleccion[g.id]||[]).length;
    const card = document.createElement('div');
    card.className = "genre-card" + (g.canciones.length===0 ? " empty" : "");
    card.innerHTML = `
      ${chosen? `<div class="badge">${chosen} elegidas</div>`:""}
      <div class="set-label">${g.setLabel}${g.ritmo? " · "+g.ritmo:""}</div>
      <h3>${g.genero}</h3>
      <div class="meta">${g.canciones.length} canciones${g.tempo? " · "+g.tempo+" BPM":""}</div>
    `;
    card.onclick = ()=>goCanciones(g.id);
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
  return wrap;
}

function renderCanciones(){
  const g = getGenero(state.generoId);
  const wrap = document.createElement('div');

  const back = document.createElement('div');
  back.className = "back-link";
  back.textContent = "← volver a géneros";
  back.onclick = ()=>goGeneros(state.categoria);
  wrap.appendChild(back);

  const headerRow = document.createElement('div');
  headerRow.style.cssText = "display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;";
  headerRow.innerHTML = `<h2 style="margin:0;">${g.genero}</h2>`;
  
  const rightActions = document.createElement('div');
  rightActions.style.display = "flex"; rightActions.style.gap = "8px"; rightActions.style.alignItems = "center";

  const sortBtn = document.createElement('button');
  sortBtn.className = "btn btn-ghost btn-sm";
  sortBtn.textContent = "⚡ Ordenar por BPM";
  sortBtn.onclick = ()=>{
    g.canciones.sort((a, b) => {
      let bpmA = a.bpm !== null ? a.bpm : parseInt(g.tempo) || 0;
      let bpmB = b.bpm !== null ? b.bpm : parseInt(g.tempo) || 0;
      return bpmA - bpmB;
    });
    saveLocal(); render();
    toast("Canciones ordenadas por BPM");
  };
  rightActions.appendChild(sortBtn);

  if(editMode){
    const editSetBtn = document.createElement('button');
    editSetBtn.className = "btn btn-ghost btn-sm";
    editSetBtn.textContent = "✎ Editar set";
    editSetBtn.onclick = ()=>{ state.editingSet = !state.editingSet; render(); };
    rightActions.appendChild(editSetBtn);
  }
  headerRow.appendChild(rightActions);
  wrap.appendChild(headerRow);

  if(editMode && state.editingSet){ wrap.appendChild(renderSetForm(g)); }

  const bar = document.createElement('div');
  bar.className = "song-meta-bar";
  bar.innerHTML = `
    <span class="pill">${g.setLabel}</span>
    ${g.ritmo? `<span class="pill">${g.ritmo}</span>`:""}
    ${g.tempo? `<span class="pill">BPM Set: ${g.tempo}</span>`:""}
  `;
  wrap.appendChild(bar);

  if(!g.canciones.length && !editMode){
    const empty = document.createElement('div');
    empty.className = "empty-state";
    empty.innerHTML = `Aún no hay canciones cargadas en este set.`;
    wrap.appendChild(empty);
    return wrap;
  }

  const seleccion = state.seleccion[g.id] || [];
  g.canciones.forEach((c, idx)=>{
    if(editMode && state.editingSong && state.editingSong.setId===g.id && state.editingSong.idx===idx){
      wrap.appendChild(renderSongForm(g, idx));
      return;
    }
    const checked = seleccion.includes(c.nombre);
    const effectiveBpm = c.bpm !== null ? c.bpm : (parseInt(g.tempo) || "-");
    const row = document.createElement('div');
    row.className = "song-row";
    row.innerHTML = `
      <div class="num mono">${idx+1}</div>
      <div class="checkbox ${checked? 'checked':''}"></div>
      <div class="info">
        <div class="name">${c.nombre}</div>
        ${c.letra ? `<div class="letra">${c.letra}</div>` : ""}
      </div>
      ${c.tono ? `<div class="tono">${c.tono}</div>` : `<div class="tono" style="opacity:.3;">—</div>`}
      <div class="bpm-badge mono">${effectiveBpm} BPM ${c.bpm===null?'(auto)':''}</div>
      ${c.enlace
        ? `<a class="link-ico" href="${c.enlace}" target="_blank" rel="noopener" onclick="event.stopPropagation()">letra ↗</a>`
        : `<span class="link-ico missing">sin link</span>`}
      ${editMode ? `<button type="button" class="edit-ico">✎</button>` : ""}
    `;
    row.querySelector('.checkbox').onclick = ()=>{ toggleCancion(g.id, c.nombre); render(); };
    row.querySelector('.info').onclick = ()=>{ toggleCancion(g.id, c.nombre); render(); };
    if(editMode){
      row.querySelector('.edit-ico').onclick = (e)=>{ e.stopPropagation(); state.editingSong={setId:g.id, idx}; render(); };
    }
    wrap.appendChild(row);
  });

  if(editMode){
    if(state.editingSong && state.editingSong.setId===g.id && state.editingSong.idx===null){
      wrap.appendChild(renderSongForm(g, null));
    } else {
      const addBtn = document.createElement('button');
      addBtn.className = "btn btn-ghost";
      addBtn.style.marginTop = "6px";
      addBtn.textContent = "+ Añadir canción a este set";
      addBtn.onclick = ()=>{ state.editingSong = {setId:g.id, idx:null}; render(); };
      wrap.appendChild(addBtn);
    }
  }

  const acceptBar = document.createElement('div');
  acceptBar.className = "accept-bar";
  acceptBar.innerHTML = `<span class="mono" style="font-size:12px;color:var(--muted);">${seleccion.length} canciones marcadas en este género</span>`;
  const btn = document.createElement('button');
  btn.className = "btn btn-primary";
  btn.textContent = "Aceptar selección → elegir otro género";
  btn.onclick = aceptarGenero;
  acceptBar.appendChild(btn);
  wrap.appendChild(acceptBar);

  return wrap;
}

function renderSongForm(g, idx){
  const isNew = idx===null;
  const c = isNew ? {nombre:"",tono:"",letra:"",enlace:"",bpm:null} : g.canciones[idx];
  const box = document.createElement('div');
  box.className = "song-form";
  box.innerHTML = `
    <div class="form-title">${isNew? "Nueva canción" : "Editar canción"}</div>
    <label>Nombre<input type="text" class="f-nombre" value="${escapeAttr(c.nombre)}"></label>
    <label>Tono<input type="text" class="f-tono" value="${escapeAttr(c.tono)}" placeholder="ej. la m"></label>
    <label>Primera línea / Referencia<input type="text" class="f-letra" value="${escapeAttr(c.letra)}"></label>
    <label>Enlace o ruta del PDF (ej. pdf/cancion.pdf)<input type="text" class="f-enlace" value="${escapeAttr(c.enlace)}" placeholder="pdf/nombre.pdf"></label>
    <label class="bpm-row"><input type="checkbox" class="f-bpm-default" ${c.bpm===null ? "checked" : ""}> Usar BPM automático del set (${g.tempo||"100"})</label>
    <label class="f-bpm-wrap" style="${c.bpm!==null ? "":"display:none;"}">BPM personalizado<input type="number" class="f-bpm" value="${c.bpm!==null?c.bpm:''}" min="20" max="300"></label>
    <div class="form-actions">
      <button type="button" class="btn btn-primary btn-sm f-save">Guardar</button>
      <button type="button" class="btn btn-ghost btn-sm f-cancel">Cancelar</button>
      ${!isNew? `<button type="button" class="btn btn-ghost btn-sm f-delete" style="color:#e08a9a;">Eliminar</button>`:""}
    </div>
  `;
  const chk = box.querySelector('.f-bpm-default');
  const bpmWrap = box.querySelector('.f-bpm-wrap');
  chk.onchange = ()=>{ bpmWrap.style.display = chk.checked? "none":"flex"; };

  box.querySelector('.f-save').onclick = ()=>{
    const nombre = box.querySelector('.f-nombre').value.trim();
    if(!nombre){ toast("El nombre es obligatorio"); return; }
    const nuevo = {
      nombre,
      tono: box.querySelector('.f-tono').value.trim(),
      letra: box.querySelector('.f-letra').value.trim(),
      enlace: box.querySelector('.f-enlace').value.trim(),
      bpm: chk.checked ? null : (parseInt(box.querySelector('.f-bpm').value,10) || null)
    };
    if(isNew){
      g.canciones.push(nuevo);
    } else {
      const oldNombre = g.canciones[idx].nombre;
      g.canciones[idx] = nuevo;
      if(state.seleccion[g.id]){
        const pos = state.seleccion[g.id].indexOf(oldNombre);
        if(pos>-1) state.seleccion[g.id][pos] = nuevo.nombre;
      }
    }
    saveLocal();
    state.editingSong = null;
    toast("Canción guardada ✓");
    render();
  };
  box.querySelector('.f-cancel').onclick = ()=>{ state.editingSong=null; render(); };
  if(!isNew){
    box.querySelector('.f-delete').onclick = ()=>{
      if(confirm(`¿Eliminar "${c.nombre}"?`)){
        g.canciones.splice(idx,1);
        if(state.seleccion[g.id]){
          state.seleccion[g.id] = state.seleccion[g.id].filter(n=>n!==c.nombre);
          if(!state.seleccion[g.id].length) delete state.seleccion[g.id];
        }
        saveLocal();
        state.editingSong = null;
        render();
      }
    };
  }
  return box;
}

function renderSetForm(g){
  const box = document.createElement('div');
  box.className = "song-form";
  box.innerHTML = `
    <div class="form-title">Editar configuración general del set — ${g.genero}</div>
    <label>Ritmo<input type="text" class="s-ritmo" value="${escapeAttr(g.ritmo)}"></label>
    <label>BPM general del set (por defecto)<input type="number" class="s-tempo" value="${escapeAttr(g.tempo)}" placeholder="100"></label>
    <div class="form-actions">
      <button type="button" class="btn btn-primary btn-sm sv">Guardar</button>
      <button type="button" class="btn btn-ghost btn-sm cn">Cancelar</button>
    </div>
  `;
  box.querySelector('.sv').onclick = ()=>{
    g.ritmo = box.querySelector('.s-ritmo').value.trim();
    g.tempo = box.querySelector('.s-tempo').value.trim();
    saveLocal();
    state.editingSet = false;
    toast("Set actualizado ✓");
    render();
  };
  box.querySelector('.cn').onclick = ()=>{ state.editingSet=false; render(); };
  return box;
}

function renderCart(){
  const aside = document.createElement('aside');
  aside.className = "cart";
  const total = totalSeleccion();
  aside.innerHTML = `<h3>Tu set list</h3><div class="sub">${total} canción${total===1?'':'es'} elegidas</div>`;

  if(total===0){
    aside.innerHTML += `<div class="cart-empty">Aún no has elegido canciones.</div>`;
  } else {
    Object.entries(state.seleccion).forEach(([setId, nombres])=>{
      if(!nombres.length) return;
      const g = getGenero(setId);
      const block = document.createElement('div');
      block.className = "cart-genre";
      block.innerHTML = `<div class="gname">${g.genero}</div>`;
      nombres.forEach(nombre=>{
        const item = document.createElement('div');
        item.className = "cart-item";
        item.innerHTML = `<span class="t">${nombre}</span><span class="x">✕</span>`;
        item.querySelector('.x').onclick = ()=>quitarCancion(setId, nombre);
        block.appendChild(item);
      });
      aside.appendChild(block);
    });
    const totalRow = document.createElement('div');
    totalRow.className = "cart-total";
    totalRow.innerHTML = `<span>Total</span><span>${total}</span>`;
    aside.appendChild(totalRow);
  }

  const finishBtn = document.createElement('button');
  finishBtn.className = "btn btn-wine";
  finishBtn.textContent = "Finalizar y descargar PDF";
  finishBtn.disabled = total===0;
  finishBtn.onclick = generarPDF;
  aside.appendChild(finishBtn);

  const resetBtn = document.createElement('button');
  resetBtn.className = "btn btn-ghost";
  resetBtn.textContent = "Vaciar selección";
  resetBtn.onclick = ()=>{ state.seleccion={}; render(); };
  aside.appendChild(resetBtn);

  return aside;
}

/* =========================================================
   GENERADOR SECUENCIAL DE PDF CON MARCA DE AGUA (LOGO DE FONDO)
   ========================================================= */
async function generarPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:"pt", format:"a4" });
  const marginX = 48;
  let y = 60;
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();

  // Intentar agregar el logo como marca de agua en el fondo del PDF general
  try {
    const imgData = await getBase64ImageFromURL("logo.png");
    if(imgData){
      const imgSize = 340;
      const posX = (pageW - imgSize) / 2;
      const posY = (pageH - imgSize) / 2;
      doc.addImage(imgData, 'PNG', posX, posY, imgSize, imgSize, undefined, 'FAST');
    }
  } catch(e) {
    console.log("Marca de agua omitida en PDF general.");
  }

  // Títulos formales en Times New Roman
  doc.setFont("times","bold"); doc.setFontSize(22); doc.setTextColor(20, 20, 20);
  doc.text("Repertorio Trío \"Los Herederos\"", marginX, y);
  y += 24;
  doc.setFont("times","normal"); doc.setFontSize(11); doc.setTextColor(60, 60, 60);
  doc.text("Selección personalizada · " + new Date().toLocaleDateString('es-EC', {year:'numeric', month:'long', day:'numeric'}), marginX, y);
  y += 30;

  const setsConMerge = [];

  for (const [setId, nombres] of Object.entries(state.seleccion)){
    if(!nombres.length) continue;
    const g = getGenero(setId);
    if(y > pageH - 100){ doc.addPage(); y = 60; }

    doc.setFont("times","bold"); doc.setFontSize(15); doc.setTextColor(20, 20, 20);
    doc.text(`${g.genero} (${g.setLabel})`, marginX, y);
    y += 18;

    doc.setFont("times","italic"); doc.setFontSize(10); doc.setTextColor(80, 80, 80);
    const metaLine = [g.ritmo, g.tempo ? g.tempo+" BPM":""].filter(Boolean).join("  ·  ");
    if(metaLine){ doc.text(metaLine, marginX, y); y += 15; }
    y += 4;

    const candidatas = nombres.filter(n=>{
      const c = g.canciones.find(x=>x.nombre===n);
      return c && c.enlace && c.enlace.trim().length > 0;
    });
    
    if(candidatas.length > 0){
      setsConMerge.push({ g, nombres: candidatas });
    }

    nombres.forEach((nombre, i)=>{
      if(y > pageH - 60){ doc.addPage(); y = 60; }
      const cancion = g.canciones.find(c=>c.nombre===nombre);
      const tono = cancion && cancion.tono ? cancion.tono : "—";
      const bpmVal = cancion && cancion.bpm !== null ? cancion.bpm : (g.tempo || "-");
      
      doc.setFont("times","bold"); doc.setFontSize(11); doc.setTextColor(30, 30, 30);
      doc.text(`${i+1}. ${nombre}`, marginX+10, y);
      doc.setFont("times","normal"); doc.setFontSize(10); doc.setTextColor(70, 70, 70);
      doc.text(`Tono: ${tono}  ·  BPM: ${bpmVal}`, marginX+280, y);
      y += 18;
    });
    y += 12;
  }

  // 1. Descargar Repertorio General
  doc.save("Repertorio-Los-Herederos-Seleccion.pdf");

  // 2. Procesar cada set paso a paso con el asistente flotante
  if(window.PDFLib && setsConMerge.length > 0){
    for(let i = 0; i < setsConMerge.length; i++){
      const item = setsConMerge[i];
      const esUltimoSet = (i === setsConMerge.length - 1);

      await mostrarAsistenteDescarga(
        `📥 Set listo para descargar: <b>${item.g.genero}</b><br><span style="font-size:12px; color:#666;">(Set ${i + 1} de ${setsConMerge.length})</span>`,
        esUltimoSet ? "✔ Descargar este último set" : "Siguiente descarga ➔"
      );

      await mergeSetPDF(item.g, item.nombres);
    }
  }

  await mostrarAsistenteDescarga(
    "🎉 ¡Todas las descargas se completaron con éxito!<br><span style='font-size:12px;'>La página se reiniciará para armar un nuevo repertorio.</span>",
    "Reiniciar ahora"
  );
  
  state.seleccion = {};
  location.reload();
}

// Función auxiliar segura para estampar la marca de agua en el PDF general
function getBase64ImageFromURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.globalAlpha = 0.12; // Transparencia sutil de marca de agua
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = error => reject(error);
    img.src = url;
  });
}

async function mergeSetPDF(g, nombres){
  const { PDFDocument } = window.PDFLib;
  const merged = await PDFDocument.create();
  let ok = 0;
  
  for(const nombre of nombres){
    const c = g.canciones.find(x=>x.nombre===nombre);
    if(!c || !c.enlace) continue;
    try{
      const res = await fetch(c.enlace);
      if(!res.ok) continue;
      const bytes = await res.arrayBuffer();
      const src = await PDFDocument.load(bytes, {ignoreEncryption:true});
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach(p=>merged.addPage(p));
      ok++;
    }catch(e){
      console.error(`Error al fusionar PDF de "${nombre}":`, e);
    }
  }
  
  if(ok > 0){
    const bytes = await merged.save();
    const blob = new Blob([bytes], {type:"application/pdf"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = `${slug(g.genero)}-letras-acordes.pdf`;
    document.body.appendChild(a); 
    a.click(); 
    a.remove();
    URL.revokeObjectURL(url);
  }
}

(async function init(){
  DATA = await loadData();
  render();
})();