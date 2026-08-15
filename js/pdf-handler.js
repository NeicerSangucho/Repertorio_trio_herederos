/* =========================================================
   MANEJADOR DE PDF: Resumen general + combinado automático
   ========================================================= */
async function generarPDF(){
  toast("Generando PDF general y combinados…");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:"pt", format:"a4" });
  const marginX = 48;
  let y = 60;
  const pageH = doc.internal.pageSize.getHeight();

  doc.setFont("times","bold"); doc.setFontSize(20);
  doc.text("Repertorio Trío \"Los Herederos\"", marginX, y);
  y += 22;
  doc.setFont("courier","normal"); doc.setFontSize(10); doc.setTextColor(90);
  doc.text("Selección personalizada · " + new Date().toLocaleDateString('es-EC', {year:'numeric', month:'long', day:'numeric'}), marginX, y);
  doc.setTextColor(0);
  y += 26;

  const setsConMerge = [];

  for (const [setId, nombres] of Object.entries(state.seleccion)){
    if(!nombres.length) continue;
    const g = getGenero(setId);
    if(y > pageH - 100){ doc.addPage(); y = 60; }

    doc.setFont("times","bold"); doc.setFontSize(14);
    doc.text(`${g.genero} (${g.setLabel})`, marginX, y);
    y += 16;

    doc.setFont("courier","normal"); doc.setFontSize(9); doc.setTextColor(100);
    const metaLine = [g.ritmo, g.tempo ? g.tempo+" BPM":""].filter(Boolean).join("  ·  ");
    if(metaLine){ doc.text(metaLine, marginX, y); y += 13; }
    doc.setTextColor(0);
    y += 4;

    const candidatas = nombres.filter(n=>{
      const c = g.canciones.find(x=>x.nombre===n);
      return c && c.enlace;
    });
    if(candidatas.length){
      setsConMerge.push({g, nombres});
    }

    nombres.forEach((nombre, i)=>{
      if(y > pageH - 60){ doc.addPage(); y = 60; }
      const cancion = g.canciones.find(c=>c.nombre===nombre);
      const tono = cancion && cancion.tono ? cancion.tono : "—";
      const bpmVal = cancion && cancion.bpm !== null ? cancion.bpm : (g.tempo || "-");
      
      doc.setFont("helvetica","normal"); doc.setFontSize(11);
      doc.text(`${i+1}. ${nombre}`, marginX+10, y);
      doc.setFont("courier","normal"); doc.setFontSize(9); doc.setTextColor(100);
      doc.text(`Tono: ${tono}  ·  BPM: ${bpmVal}`, marginX+280, y);
      doc.setTextColor(0);
      y += 16;
    });
    y += 10;
  }

  doc.save("Repertorio-Los-Herederos-Seleccion.pdf");

  if(window.PDFLib && setsConMerge.length){
    toast("Generando archivos PDF por set…");
    for(const {g, nombres} of setsConMerge){ await mergeSetPDF(g, nombres); }
  }

  toast("¡Listo! Recargando para armar otro repertorio...");
  setTimeout(()=>{
    state.seleccion = {};
    location.reload();
  }, 3500);
}

async function mergeSetPDF(g, nombres){
  const { PDFDocument } = PDFLib;
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
    }catch(e){}
  }
  if(ok>0){
    const bytes = await merged.save();
    const blob = new Blob([bytes], {type:"application/pdf"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${slug(g.genero)}-letras-acordes.pdf`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
}