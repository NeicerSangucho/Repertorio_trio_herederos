/* =========================================================
   LÓGICA PRINCIPAL (v13) - JSON EXTERNO COMO FUENTE ÚNICA
   ========================================================= */
const LS_KEY = "herederosRepertorioData_v13";
const EDIT_PASSWORD = "herederos";

let DATA = null;
let editMode = false;

let state = {
  screen:"categoria", categoria:null, generoId:null,
  seleccion:{}, editingSong:null, editingSet:false,
  filtroAutor:""
};

const CATEGORIAS = {
  bailable:{ label:"Bailable", desc:"Cumbias, bombas, sanjuanitos y todo lo que mueve el piso." },
  romantico:{ label:"Romántico / Melancólico", desc:"Boleros, valses y pasillos para los momentos lentos." }
};

// Carga absoluta desde el archivo JSON externo sincronizado
async function loadData(){
  try {
    const res = await fetch('repertorio-data.json', { cache: 'no-store' });
    if (res.ok) {
      const dataJson = await res.json();
      localStorage.setItem(LS_KEY, JSON.stringify(dataJson));
      return dataJson;
    }
  } catch (e) {
    console.error("Error al cargar repertorio-data.json:", e);
  }
  
  // Si falla el fetch por motivos locales de red, intenta usar el almacenamiento local
  const ls = localStorage.getItem(LS_KEY);
  if (ls) {
    try { return JSON.parse(ls); } catch (e) {}
  }
  return [];
}

function saveLocal(){ 
  localStorage.setItem(LS_KEY, JSON.stringify(DATA)); 
}

function totalSeleccion(){ return Object.values(state.seleccion).reduce((a,arr)=>a+arr.length,0); }
function getGenero(id){ return DATA ? DATA.find(g=>g.id===id) : null; }
function escapeAttr(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }
function slug(s){ return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }

function generarRutaDefault(nombreGenero, nombreCancion) {
  return `pdf/${slug(nombreGenero)}/${slug(nombreCancion)}.pdf`;
}

function obtenerAutoresDelGenero(g) {
  const autoresSet = new Set();
  if (g && g.canciones) {
    g.canciones.forEach(c => {
      if (c.autor && c.autor.trim().length > 0) {
        autoresSet.add(c.autor.trim());
      }
    });
  }
  return Array.from(autoresSet).sort();
}

function obtenerTodosLosAutores() {
  const autoresSet = new Set();
  if (DATA) {
    DATA.forEach(g => {
      g.canciones.forEach(c => {
        if (c.autor && c.autor.trim().length > 0) {
          autoresSet.add(c.autor.trim());
        }
      });
    });
  }
  return Array.from(autoresSet).sort();
}

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

function goCategoria(){ state.screen="categoria"; state.editingSong=null; state.editingSet=false; state.filtroAutor=""; render(); }
function goGeneros(cat){ state.categoria=cat; state.screen="generos"; state.editingSong=null; state.editingSet=false; state.filtroAutor=""; render(); }
function goCanciones(id){
  const g = getGenero(id);
  if(!g.canciones.length && !editMode){ toast("Este género aún no tiene canciones cargadas."); return; }
  state.generoId=id; state.screen="canciones"; state.editingSong=null; state.editingSet=false; state.filtroAutor=""; render();
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
  if(!DATA) return;
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
      <button class="btn btn-ghost btn-sm" id="btnReload">🔄 Recargar desde JSON</button>
    </div>`;
  document.getElementById('btnExport').onclick = exportarJSON;
  document.getElementById('btnReload').onclick = async ()=>{
    localStorage.removeItem(LS_KEY);
    DATA = await loadData();
    render();
    toast("Datos recargados desde el JSON ✓");
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
          id: newId, genero: gName, categoria: state.categoria, 
          ritmo: "", tempo: "100", enlaceSetCompleto: "", canciones: []
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
  
  const generosFiltrados = DATA.filter(g=>g.categoria===state.categoria).sort((a,b)=>a.genero.localeCompare(b.genero));

  generosFiltrados.forEach(g=>{
    const chosen = (state.seleccion[g.id]||[]).length;
    const card = document.createElement('div');
    card.className = "genre-card" + (g.canciones.length===0 ? " empty" : "");
    card.innerHTML = `
      ${chosen? `<div class="badge">${chosen} elegidas</div>`:""}
      <div class="set-label">${g.ritmo ? "Ritmo: "+g.ritmo : "Género musical"}</div>
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
    editSetBtn.textContent = "✎ Editar género";
    editSetBtn.onclick = ()=>{ state.editingSet = !state.editingSet; render(); };
    rightActions.appendChild(editSetBtn);
  }
  headerRow.appendChild(rightActions);
  wrap.appendChild(headerRow);

  if(editMode && state.editingSet){ wrap.appendChild(renderSetForm(g)); }

  const bar = document.createElement('div');
  bar.className = "song-meta-bar";
  bar.innerHTML = `
    ${g.ritmo? `<span class="pill">Ritmo: ${g.ritmo}</span>`:""}
    ${g.tempo? `<span class="pill">BPM: ${g.tempo}</span>`:""}
  `;
  wrap.appendChild(bar);

  const autoresDelGenero = obtenerAutoresDelGenero(g);
  const filterBar = document.createElement('div');
  filterBar.style.cssText = "margin-bottom:18px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;";
  filterBar.innerHTML = `
    <label style="font-size:12px; color:var(--muted); display:flex; align-items:center; gap:8px; width:100%;">
      Filtrar por autor de este género:
      <select id="selectFiltroAutor" style="background:var(--bg-alt); border:1px solid rgba(255,255,255,0.15); border-radius:8px; padding:6px 10px; color:var(--cream); font-family:'Space Grotesk', sans-serif; font-size:13px; flex:1;">
        <option value="">-- Todos los autores de este género --</option>
        ${autoresDelGenero.map(aut => `<option value="${escapeAttr(aut)}" ${state.filtroAutor === aut ? 'selected' : ''}>${escapeAttr(aut)}</option>`).join('')}
      </select>
    </label>
  `;
  wrap.appendChild(filterBar);

  filterBar.querySelector('#selectFiltroAutor').onchange = (e) => {
    state.filtroAutor = e.target.value;
    render();
  };

  if(!g.canciones.length && !editMode){
    const empty = document.createElement('div');
    empty.className = "empty-state";
    empty.innerHTML = `Aún no hay canciones cargadas en este género.`;
    wrap.appendChild(empty);
    return wrap;
  }

  let cancionesMostradas = [...g.canciones].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', {sensitivity: 'base'}));

  if(state.filtroAutor) {
    cancionesMostradas = cancionesMostradas.filter(c => c.autor === state.filtroAutor);
  }

  const seleccion = state.seleccion[g.id] || [];

  if(cancionesMostradas.length === 0) {
    const empty = document.createElement('div');
    empty.className = "empty-state";
    empty.innerHTML = `No se encontraron canciones con el autor seleccionado.`;
    wrap.appendChild(empty);
  }

  cancionesMostradas.forEach((c)=>{
    const idx = g.canciones.findIndex(item => item.nombre === c.nombre);

    if(editMode && state.editingSong && state.editingSong.setId===g.id && state.editingSong.idx===idx){
      wrap.appendChild(renderSongForm(g, idx));
      return;
    }
    const checked = seleccion.includes(c.nombre);
    const effectiveBpm = c.bpm !== null ? c.bpm : (parseInt(g.tempo) || "-");
    const rutaFinal = (c.enlace && c.enlace.trim().length > 0) ? c.enlace : generarRutaDefault(g.genero, c.nombre);

    const row = document.createElement('div');
    row.className = "song-row";
    row.innerHTML = `
      <div class="checkbox ${checked? 'checked':''}"></div>
      <div class="info">
        <div class="name">${c.nombre}</div>
        <div style="font-size:12px; color:var(--amber-light); font-style:italic;">${c.autor ? c.autor : "Autor no especificado"}</div>
        ${c.letra ? `<div class="letra">${c.letra}</div>` : ""}
      </div>
      ${c.tono ? `<div class="tono">${c.tono}</div>` : `<div class="tono" style="opacity:.3;">—</div>`}
      <div class="bpm-badge mono">${effectiveBpm} BPM ${c.bpm===null?'(auto)':''}</div>
      <a class="link-ico" href="${rutaFinal}" target="_blank" rel="noopener" onclick="event.stopPropagation()">letra ↗</a>
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
      addBtn.textContent = "+ Añadir canción a este género";
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
  const c = isNew ? {nombre:"",autor:"",tono:"",letra:"",enlace:"",bpm:null} : g.canciones[idx];
  const listaAutores = obtenerTodosLosAutores();

  const box = document.createElement('div');
  box.className = "song-form";
  box.innerHTML = `
    <div class="form-title">${isNew? "Nueva canción" : "Editar canción"}</div>
    <label>Nombre<input type="text" class="f-nombre" value="${escapeAttr(c.nombre)}"></label>
    <label>Autor / Versión (Sugerencias):
      <input type="text" class="f-autor" list="sugerenciasAutores" value="${escapeAttr(c.autor)}" placeholder="ej. Los Panchos">
      <datalist id="sugerenciasAutores">
        ${listaAutores.map(aut => `<option value="${escapeAttr(aut)}">`).join('')}
      </datalist>
    </label>
    <label>Tono<input type="text" class="f-tono" value="${escapeAttr(c.tono)}" placeholder="ej. la m"></label>
    <label>Primera línea / Referencia<input type="text" class="f-letra" value="${escapeAttr(c.letra)}"></label>
    <label>Enlace personalizado o ruta manual (Déjalo vacío para usar la ruta automática)<input type="text" class="f-enlace" value="${escapeAttr(c.enlace)}" placeholder="pdf/genero/cancion.pdf"></label>
    <label class="bpm-row"><input type="checkbox" class="f-bpm-default" ${c.bpm===null ? "checked" : ""}> Usar BPM automático del género (${g.tempo||"100"})</label>
    <label class="f-bpm-wrap" style="${c.bpm!==null ? "":"display:none;"}">BPM personalizado<input type="number" class="f-bpm" value="${c.bpm!==null?c.bpm:''}" min="20" max="300"></label>
    <div class="form-actions">
      <button type="button" class="btn btn-primary btn-sm f-save">Guardar</button>
      <button type="button" class="btn btn-ghost btn-sm f-cancel">Cancelar</button>
      ${!isNew? `<button type="button" class="btn btn-ghost btn-sm f-delete" style="color:#e08a9a; ">Eliminar</button>`:""}
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
      autor: box.querySelector('.f-autor').value.trim(),
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
    state.filtroAutor = "";
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
    <div class="form-title">Editar configuración general del género</div>
    <label>Nombre del género (ej. Cumbias, Bolero Romántico)<input type="text" class="s-genero" value="${escapeAttr(g.genero)}"></label>
    <label>Ritmo (ej. Cumbia, Bolero, Vals)<input type="text" class="s-ritmo" value="${escapeAttr(g.ritmo)}"></label>
    <label>BPM general del género (por defecto)<input type="number" class="s-tempo" value="${escapeAttr(g.tempo)}" placeholder="100"></label>
    <div class="form-actions">
      <button type="button" class="btn btn-primary btn-sm sv">Guardar</button>
      <button type="button" class="btn btn-ghost btn-sm cn">Cancelar</button>
    </div>
  `;
  box.querySelector('.sv').onclick = ()=>{
    g.genero = box.querySelector('.s-genero').value.trim() || g.genero;
    g.ritmo = box.querySelector('.s-ritmo').value.trim();
    g.tempo = box.querySelector('.s-tempo').value.trim();
    saveLocal();
    state.editingSet = false;
    toast("Género actualizado ✓");
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

async function generarPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:"pt", format:"a4" });
  const marginX = 48;
  let y = 60;
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();

  try {
    const imgData = await getBase64ImageFromURL("logo.png");
    if(imgData){
      const imgSize = 340;
      const posX = (pageW - imgSize) / 2;
      const posY = (pageH - imgSize) / 2;
      doc.addImage(imgData, 'PNG', posX, posY, imgSize, imgSize, undefined, 'FAST');
    }
  } catch(e) {}

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
    doc.text(`${g.genero}`, marginX, y);
    y += 18;

    doc.setFont("times","italic"); doc.setFontSize(10); doc.setTextColor(80, 80, 80);
    const metaLine = [g.ritmo ? `Ritmo: ${g.ritmo}` : "", g.tempo ? `BPM: ${g.tempo}` : ""].filter(Boolean).join("  ·  ");
    if(metaLine){ doc.text(metaLine, marginX, y); y += 15; }
    y += 4;

    const nombresOrdenados = [...nombres].sort((a, b) => a.localeCompare(b, 'es', {sensitivity: 'base'}));

    const candidatas = nombresOrdenados.map(n => {
      const c = g.canciones.find(x => x.nombre === n);
      if(!c) return null;
      return (c.enlace && c.enlace.trim().length > 0) ? c.enlace : generarRutaDefault(g.genero, c.nombre);
    }).filter(Boolean);
    
    if(candidatas.length > 0){
      setsConMerge.push({ g, nombres: candidatas });
    }

    nombresOrdenados.forEach((nombre, i)=>{
      if(y > pageH - 60){ doc.addPage(); y = 60; }
      const cancion = g.canciones.find(c=>c.nombre===nombre);
      const tono = cancion && cancion.tono ? cancion.tono : "—";
      const bpmVal = cancion && cancion.bpm !== null ? cancion.bpm : (g.tempo || "-");
      const autorTexto = cancion && cancion.autor ? ` (${cancion.autor})` : "";
      
      doc.setFont("times","bold"); doc.setFontSize(11); doc.setTextColor(30, 30, 30);
      doc.text(`${i+1}. ${nombre}${autorTexto}`, marginX+10, y);
      doc.setFont("times","normal"); doc.setFontSize(10); doc.setTextColor(70, 70, 70);
      doc.text(`Tono: ${tono}  ·  BPM: ${bpmVal}`, marginX+280, y);
      y += 18;
    });
    y += 12;
  }

  doc.save("Repertorio-Los-Herederos-Seleccion.pdf");

  if(window.PDFLib && setsConMerge.length > 0){
    for(let i = 0; i < setsConMerge.length; i++){
      const item = setsConMerge[i];
      const esUltimoSet = (i === setsConMerge.length - 1);

      await mostrarAsistenteDescarga(
        `📥 Archivo combinado listo para descargar: <b>${item.g.genero}</b><br><span style="font-size:12px; color:#666;">(Elemento ${i + 1} de ${setsConMerge.length})</span>`,
        esUltimoSet ? "✔ Descargar este último archivo" : "Siguiente descarga ➔"
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

function getBase64ImageFromURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.globalAlpha = 0.12;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = error => reject(error);
    img.src = url;
  });
}

async function mergeSetPDF(g, rutasPdfs){
  const { PDFDocument } = window.PDFLib;
  const merged = await PDFDocument.create();
  let ok = 0;
  
  for(const ruta of rutasPdfs){
    try{
      const res = await fetch(ruta);
      if(!res.ok) continue;
      const bytes = await res.arrayBuffer();
      const src = await PDFDocument.load(bytes, {ignoreEncryption:true});
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach(p=>merged.addPage(p));
      ok++;
    }catch(e){
      console.error(`Error al fusionar PDF desde la ruta "${ruta}":`, e);
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