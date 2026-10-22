// ================================
// MÓDULO: PARTICIPANTES Y PLANO INTERACTIVO
// ================================
// https://docs.google.com/spreadsheets/d/15hQVhxcA40ab78kdMh4yIv8QYi4nHuANkbnEISdJBg8/edit?gid=0#gid=0

const SHEET_ID = "15hQVhxcA40ab78kdMh4yIv8QYi4nHuANkbnEISdJBg8"; 
const URL_PCC = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=PCC`;
const URL_EUREKA = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Eureka`;
const URL_CCYT = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=CCYT`;

let dataGlobal = { PCC: [], EUREKA: [], CCYT: [] };
let tabActual = "PCC"; 
let dataMostrada = [];

const normalizarNombre = (str) => {
    if (!str) return "";
    return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
};

// =======================
// 1. INICIALIZACIÓN Y LECTURA
// =======================
async function inicializarParticipantes() {
    try {
        const [resPCC, resEureka, resCCYT] = await Promise.all([
            fetch(URL_PCC), fetch(URL_EUREKA), fetch(URL_CCYT)
        ]);

        const textPCC = await resPCC.text();
        const textEureka = await resEureka.text();
        const textCCYT = await resCCYT.text();

        const parseGoogleJSON = (text) => JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)).table.rows.slice(1);

        // --- DATA PCC ---
        dataGlobal.PCC = parseGoogleJSON(textPCC).map(r => {
            let row = {
                pais: r.c[0]?.v || "Perú",
                region: r.c[1]?.v || "",
                institucion: r.c[2]?.v || "",
                siglas: r.c[3]?.v || "",
                tipo: r.c[4]?.v || "",
                gestion: r.c[5]?.v || "",
                // LECTURA REAL DE LA COLUMNA O (Índice 14 en JS)
                stand: r.c[14]?.v ? String(r.c[14].v).trim() : null, 
                proyectos: []
            };
            // Leer proyectos desde la columna G (índice 6) hasta la N (índice 13)
            for (let i = 6; i < 14; i++) {
                if (r.c[i] && r.c[i].v) row.proyectos.push(r.c[i].v);
            }
            return row;
        }).filter(c => c.institucion !== "");

        // --- DATA EUREKA ---
        dataGlobal.EUREKA = parseGoogleJSON(textEureka).map(r => ({
            pais: "Perú",
            region: r.c[0]?.v || "",
            dre: r.c[1]?.v || "",
            ugel: r.c[2]?.v || "",
            gestion: r.c[3]?.v || "", 
            iiee: r.c[4]?.v || "",
            distrito: r.c[6]?.v || "", 
            categoria: r.c[7]?.v || "",
            area: r.c[8]?.v || "",
            titulo: r.c[9]?.v || "",
            // LECTURA REAL DE LA COLUMNA O (Índice 14 en JS)
            stand: r.c[14]?.v ? String(r.c[14].v).trim() : null
        })).filter(c => c.iiee !== "");

        // --- DATA CCYT ---
        dataGlobal.CCYT = parseGoogleJSON(textCCYT).map(r => {
            let row = {
                pais: "Perú",
                region: r.c[1]?.v || "",
                dre: r.c[2]?.v || "",
                ugel: r.c[3]?.v || "",
                iiee: r.c[4]?.v || "",
                gestion: r.c[5]?.v || "",
                ccyt: r.c[6]?.v || "",
                nivel: r.c[7]?.v || "",
                // LECTURA REAL DE LA COLUMNA O (Índice 14 en JS)
                stand: r.c[14]?.v ? String(r.c[14].v).trim() : null,
                proyectos: []
            };
            // Leer proyectos desde la columna I (índice 8) hasta la N (índice 13)
            for (let i = 8; i < 14; i++) {
                if (r.c[i] && r.c[i].v) row.proyectos.push(r.c[i].v);
            }
            return row;
        }).filter(c => c.ccyt !== "");

        // Inicializar interfaz visual
        configurarInterfaz();
        cambiarTab("PCC"); 

    } catch (error) {
        console.error("Error cargando la data:", error);
    }
}

// =======================
// 2. INTERACTIVIDAD DEL MAPA SVG
// =======================
window.resaltarStandEnPlano = function(idStands) {
    if (!idStands) {
        console.warn("Esta institución no tiene un ID de stand en el Google Sheets.");
        return;
    }

    // 1. Apagar TODOS los stands dentro del contenedor visible actual
    const svgActivo = document.querySelector(`#svg-container-${tabActual} svg`);
    
    if (svgActivo) {
        svgActivo.querySelectorAll('rect, path').forEach(el => {
            if(el.id && el.id.includes('-')) {
                el.style.fill = '#e2e8f0'; // slate-200 (Gris claro)
                el.style.stroke = '#cbd5e1'; // slate-300 (Borde gris)
                el.style.transition = 'all 0.4s ease';
                el.classList.remove('animate-pulse');
            }
        });
    }

    // 2. Separar los stands si hay más de uno (ej. "PCC-01, PCC-02")
    const arrayStands = String(idStands).split(',').map(s => s.trim());
    let seEncontroAlMenosUno = false;

    // 3. Encender CADA stand de la lista
    arrayStands.forEach(id => {
        const standObjetivo = document.getElementById(id);
        if (standObjetivo) {
            standObjetivo.style.fill = '#00B4CE'; // Color cyan Concytec
            standObjetivo.style.stroke = '#008ba0';
            standObjetivo.classList.add('animate-pulse'); // Animación
            seEncontroAlMenosUno = true;
        } else {
            console.warn(`No se encontró en el SVG un elemento con el ID: ${id}`);
        }
    });

    // 4. Scroll automático al plano en móviles (solo si encontró algún stand)
    if (seEncontroAlMenosUno && window.innerWidth < 1024) {
        document.getElementById('plano-feria').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// =======================
// 3. UI Y NAVEGACIÓN TABS
// =======================
function configurarInterfaz() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", (e) => cambiarTab(e.currentTarget.getAttribute("data-tab")));
    });

    document.getElementById("filtro1")?.addEventListener("change", aplicarFiltros);
    document.getElementById("filtro2")?.addEventListener("change", aplicarFiltros);
    document.getElementById("filtro3")?.addEventListener("change", aplicarFiltros);
}

function llenarSelect(selectId, opcionesValores, textoTodos) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = `<option value="">${textoTodos}</option>`;
    const opcionesUnicas = [...new Set(opcionesValores)].filter(Boolean).sort();
    opcionesUnicas.forEach(opt => select.innerHTML += `<option value="${opt}">${opt}</option>`);
}

function cambiarTab(nuevoTab) {
    tabActual = nuevoTab;
    const datasetActual = dataGlobal[tabActual];
    
    // A) Actualizar Botones visualmente
    document.querySelectorAll(".tab-btn").forEach(btn => {
        if (btn.getAttribute("data-tab") === tabActual) {
            btn.className = "tab-btn px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm transition-all duration-300 bg-brand text-white shadow-md flex items-center gap-1.5 flex-grow md:flex-grow-0 justify-center";
        } else {
            btn.className = "tab-btn px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm text-slate-500 hover:text-slate-800 transition-all duration-300 flex items-center gap-1.5 flex-grow md:flex-grow-0 justify-center bg-transparent shadow-none";
        }
    });

    // B) Mostrar el mapa SVG correspondiente y ocultar el resto
    const contenedoresSVG = ['PCC', 'EUREKA', 'CCYT'];
    contenedoresSVG.forEach(id => {
        const contenedorSVG = document.getElementById(`svg-container-${id}`);
        if (contenedorSVG) {
            if (id === tabActual) {
                contenedorSVG.classList.remove('hidden');
            } else {
                contenedorSVG.classList.add('hidden');
            }
        }
    });

    const textoInstruccion = document.getElementById("info-hover-mapa");
    if (textoInstruccion) {
        if (tabActual === "PCC") {
            textoInstruccion.classList.remove("hidden");
        } else {
            textoInstruccion.classList.add("hidden");
        }
    }
    
    // C) Actualizar Filtros y Selects
    if (tabActual === "PCC") {
        llenarSelect("filtro1", datasetActual.map(c => c.region), "Todas las Regiones");
        llenarSelect("filtro2", datasetActual.map(c => c.tipo), "Tipos de Institución");
        llenarSelect("filtro3", datasetActual.map(c => c.gestion), "Tipos de Gestión");
    } 
    else if (tabActual === "EUREKA") {
        llenarSelect("filtro1", datasetActual.map(c => c.region), "Todas las Regiones");
        llenarSelect("filtro2", datasetActual.map(c => c.gestion), "Tipos de Gestión");
        llenarSelect("filtro3", datasetActual.map(c => c.area), "Todas las Áreas");
    }
    else if (tabActual === "CCYT") {
        llenarSelect("filtro1", datasetActual.map(c => c.region), "Todas las Regiones");
        llenarSelect("filtro2", datasetActual.map(c => c.gestion), "Tipos de Gestión");
        llenarSelect("filtro3", datasetActual.map(c => c.nivel), "Niveles Educativos");
    }

    aplicarFiltros();
    actualizarEstadisticasBottom();
}

// =======================
// 4. FILTROS Y RENDERIZADO
// =======================
function aplicarFiltros() {
    const f1 = normalizarNombre(document.getElementById("filtro1").value);
    const f2 = normalizarNombre(document.getElementById("filtro2").value);
    const f3 = normalizarNombre(document.getElementById("filtro3").value);
    
    let datasetActual = dataGlobal[tabActual];

    dataMostrada = datasetActual.filter(c => {
        if (tabActual === "PCC") {
            if (f1 && normalizarNombre(c.region) !== f1) return false;
            if (f2 && normalizarNombre(c.tipo) !== f2) return false;
            if (f3 && normalizarNombre(c.gestion) !== f3) return false;
        } 
        else if (tabActual === "EUREKA") {
            if (f1 && normalizarNombre(c.region) !== f1) return false;
            if (f2 && normalizarNombre(c.gestion) !== f2) return false;
            if (f3 && normalizarNombre(c.area) !== f3) return false;
        }
        else if (tabActual === "CCYT") {
            if (f1 && normalizarNombre(c.region) !== f1) return false;
            if (f2 && normalizarNombre(c.gestion) !== f2) return false;
            if (f3 && normalizarNombre(c.nivel) !== f3) return false;
        }
        return true;
    });

    renderizarTarjetas();
}

function renderizarTarjetas() {
    const contenedor = document.getElementById("lista-contenedor");
    document.getElementById("total-lista").innerText = dataMostrada.length;
    
    if (dataMostrada.length === 0) {
        contenedor.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 font-medium bg-white rounded-xl border border-dashed border-slate-300">🔍 No se encontraron resultados.</div>`;
        return;
    }

    let htmlSalida = "";
    
    dataMostrada.forEach(c => {
        // Tarjeta clicable
        let eventosClick = tabActual === "PCC" ? `onclick="resaltarStandEnPlano('${c.stand}')"` : "";
        let clasesHover = tabActual === "PCC" ? "hover:border-brand hover:shadow-md cursor-pointer" : "cursor-default";
        htmlSalida += `<div ${eventosClick} class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 transition-all duration-300 flex flex-col justify-between h-full group ${clasesHover}">`;        
        
        if (tabActual === "PCC") {
            const badgeTipo = c.tipo ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">${c.tipo}</span>` : '';
            const badgeGestion = c.gestion ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">${c.gestion}</span>` : '';
            
            let bloqueProyectos = '';
            if (c.proyectos && c.proyectos.length > 0) {
                bloqueProyectos = `
                    <div class="mt-3 pt-3 border-t border-slate-100">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Proyectos a exponer:</p>
                        <ul class="list-disc list-inside text-[11px] text-slate-600 space-y-1 ml-1 leading-snug">
                            ${c.proyectos.map(p => `<li>${p}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            htmlSalida += `
                <div class="space-y-2 mb-4">
                    <span class="text-[10px] font-black uppercase tracking-wider block text-brand mb-1">${c.siglas}</span>
                    <h4 class="text-sm font-bold text-slate-800 leading-snug group-hover:text-brand transition-colors">${c.institucion}</h4>
                    <div class="flex flex-wrap gap-2 pt-1">${badgeTipo} ${badgeGestion}</div>
                </div>
                <div class="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <p><span class="font-bold text-slate-700">📍 Región:</span> ${c.region || c.pais}</p>
                </div>
                ${bloqueProyectos}`;
        } 
        else if (tabActual === "EUREKA") {
            const areaStr = c.area.toLowerCase();
            let colorArea = 'bg-slate-100 text-slate-700';
            if (areaStr.includes('sociales')) colorArea = 'bg-purple-100 text-purple-700';
            else if (areaStr.includes('indagación') || areaStr.includes('indagacion')) colorArea = 'bg-blue-100 text-blue-700';
            else if (areaStr.includes('soluciones') || areaStr.includes('tecnológicas')) colorArea = 'bg-emerald-100 text-emerald-700';

            const badgeGestion = c.gestion ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">${c.gestion}</span>` : '';

            htmlSalida += `
                <div class="space-y-2 mb-4">
                    <div class="flex flex-wrap gap-2 pt-1">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider block text-slate-500 bg-slate-100">${c.categoria} </span>
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider block ${colorArea}">${c.area}</span>
                        ${badgeGestion}
                    </div>
                    <h4 class="text-md font-extrabold text-brand/80 leading-snug group-hover:text-brand transition-colors uppercase">${c.region}</h4>
                    <h4 class="text-[14px] font-extrabold text-slate-600 leading-snug group-hover:text-dark/90 transition-colors uppercase">${c.titulo}</h4>
                    <p class="text-[11px] text-slate-600 font-medium">🏫 I.E. ${c.iiee}</p>
                </div>
                <div class="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <p><span class="font-bold text-slate-700">📍 Región:</span> ${c.dre}</p>
                    <p><span class="font-bold text-slate-700">🏢 UGEL:</span> ${c.ugel}</p>
                    <p class="col-span-2"><span class="font-bold text-slate-700">📌 Distrito:</span> ${c.distrito}</p>
                </div>`;
        } 
        else if (tabActual === "CCYT") {
            const nivelStr = c.nivel.toLowerCase();
            let colorNivel = 'bg-slate-100 text-slate-700';
            if (nivelStr.includes('primaria')) colorNivel = 'bg-orange-100 text-orange-700';
            else if (nivelStr.includes('secundaria')) colorNivel = 'bg-indigo-100 text-indigo-700';

            let bloqueProyectos = '';
            if (c.proyectos && c.proyectos.length > 0) {
                bloqueProyectos = `
                    <div class="mt-3 pt-3 border-t border-slate-100">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Proyectos a exponer:</p>
                        <ul class="list-disc list-inside text-[11px] text-slate-600 space-y-1 ml-1 leading-snug">
                            ${c.proyectos.map(p => `<li>${p}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            htmlSalida += `
                <div class="space-y-2 mb-4">
                    <h4 class="text-md font-extrabold text-brand/80 leading-snug group-hover:text-brand transition-colors uppercase">${c.region}</h4>
                    <h4 class="text-[14px] font-extrabold text-slate-600 leading-snug group-hover:text-dark transition-colors uppercase">🔬 CCYT ${c.ccyt}</h4>
                    <p class="text-[11px] text-slate-600 font-medium">🏫 I.E. ${c.iiee}</p>
                    <div class="flex flex-wrap gap-2 pt-1">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${colorNivel}">${c.nivel}</span>
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">${c.gestion}</span>
                    </div>
                </div>
                <div class="pt-3 border-t border-slate-100 grid grid-cols-1 gap-2 text-[11px] text-slate-500">
                    <p><span class="font-bold text-slate-700">📍 Región:</span> ${c.dre}</p>
                    <p><span class="font-bold text-slate-700">🏢 UGEL:</span> ${c.ugel}</p>
                </div>
                ${bloqueProyectos}`;
        }
        
        htmlSalida += `</div>`;
    });
    
    contenedor.innerHTML = htmlSalida;
}

function actualizarEstadisticasBottom() {
    const contenedor = document.getElementById("estadisticas-contenedor");
    const data = dataGlobal[tabActual];
    const total = data.length;

    if (tabActual === "PCC") {
        contenedor.innerHTML = `
            <div class="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-brand flex items-center justify-between gap-4">
                <div class="space-y-1">
                    <span class="text-md font-black text-slate-800 block">🏛️ ${total} Instituciones Participantes</span>
                    <p class="text-xs md:text-sm font-medium text-slate-500">Universidades, IPIs y Organizaciones de la sociedad civil.</p>
                </div>
            </div>`;
    } 
    else if (tabActual === "EUREKA") {
        contenedor.innerHTML = `
            <div class="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-accent flex items-center justify-between gap-4">
                <div class="space-y-1">
                    <span class="text-md font-black text-slate-800 block">💡 78 Proyectos Finalistas y 3 Proyectos Ganadores</span>
                    <p class="text-xs md:text-sm font-medium text-slate-500">Los mejores proyectos escolares de ciencia y tecnología a nivel nacional</p>
                </div>
            </div>`;
    } 
    else if (tabActual === "CCYT") {
        contenedor.innerHTML = `
            <div class="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-dark flex items-center justify-between gap-4">
                <div class="space-y-1">
                    <span class="text-md font-black text-slate-800 block">🔬 ${total} CCYT Participantes</span>
                    <p class="text-xs md:text-sm font-medium text-slate-500">Clubes de Ciencia y Tecnología de las diferentes regiones del Perú</p>
                </div>
            </div>`;
    }
}

document.addEventListener("DOMContentLoaded", inicializarParticipantes);