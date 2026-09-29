// ================================
// MÓDULO: PARTICIPANTES Y PLANO INTERACTIVO
// ================================

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
                stand: `PCC-${Math.floor(Math.random() * 10) + 1}`, // SIMULACIÓN DE STAND
                proyectos: []
            };
            // Leer proyectos desde la columna G (índice 6) en adelante
            for (let i = 6; i < r.c.length; i++) {
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
            gestion: r.c[3]?.v || "", // La columna 3 ahora es gestión
            iiee: r.c[4]?.v || "",
            distrito: r.c[6]?.v || "", // Se ignora la zona (índice 5)
            categoria: r.c[7]?.v || "",
            area: r.c[8]?.v || "",
            titulo: r.c[9]?.v || "",
            stand: `EUR-${Math.floor(Math.random() * 10) + 1}` // SIMULACIÓN DE STAND
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
                stand: `CYT-${Math.floor(Math.random() * 10) + 1}`, // SIMULACIÓN DE STAND
                proyectos: []
            };
            // Leer proyectos desde la columna I (índice 8) en adelante
            for (let i = 8; i < r.c.length; i++) {
                if (r.c[i] && r.c[i].v) row.proyectos.push(r.c[i].v);
            }
            return row;
        }).filter(c => c.ccyt !== "");

        generarPlanoFeriaDinamico();
        configurarInterfaz();
        cambiarTab("PCC"); 

    } catch (error) {
        console.error("Error cargando la data:", error);
    }
}

// =======================
// 2. PLANO DE STANDS (LAYOUT)
// =======================
function generarPlanoFeriaDinamico() {
    const contenedor = document.getElementById('plano-feria');
    if (!contenedor) return;

    let standsHTML = '';
    
    // Generar 10 recuadros simulados por cada categoría
    for(let i = 1; i <= 10; i++) {
        standsHTML += `<rect id="PCC-${i}" x="${i*35 - 20}" y="20" width="30" height="30" rx="4" class="stand-rect fill-slate-200 stroke-slate-300 stroke-[1.5] transition-all duration-300"/>`;
        standsHTML += `<text x="${i*35 - 5}" y="38" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle" class="pointer-events-none">PCC${i}</text>`;
        
        standsHTML += `<rect id="EUR-${i}" x="${i*35 - 20}" y="70" width="30" height="30" rx="4" class="stand-rect fill-slate-200 stroke-slate-300 stroke-[1.5] transition-all duration-300"/>`;
        standsHTML += `<text x="${i*35 - 5}" y="88" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle" class="pointer-events-none">EUR${i}</text>`;
        
        standsHTML += `<rect id="CYT-${i}" x="${i*35 - 20}" y="120" width="30" height="30" rx="4" class="stand-rect fill-slate-200 stroke-slate-300 stroke-[1.5] transition-all duration-300"/>`;
        standsHTML += `<text x="${i*35 - 5}" y="138" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle" class="pointer-events-none">CYT${i}</text>`;
    }

    contenedor.innerHTML = `
        <svg viewBox="0 0 370 170" preserveAspectRatio="xMidYMid meet">
            <text x="185" y="10" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">ZONA DE EXPOSICIÓN</text>
            ${standsHTML}
        </svg>
    `;
}

window.resaltarStandEnPlano = function(idStand) {
    // Apagar todos los stands
    document.querySelectorAll('.stand-rect').forEach(el => {
        el.classList.remove('fill-[#00B4CE]', 'stroke-[#008ba0]', 'animate-pulse');
        el.classList.add('fill-slate-200', 'stroke-slate-300');
    });

    // Encender el stand objetivo
    const standObjetivo = document.getElementById(idStand);
    if (standObjetivo) {
        standObjetivo.classList.remove('fill-slate-200', 'stroke-slate-300');
        standObjetivo.classList.add('fill-[#00B4CE]', 'stroke-[#008ba0]', 'animate-pulse');

        // Scroll automático en móviles para ver el plano
        if(window.innerWidth < 1024) {
            document.getElementById('plano-feria').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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
    
    document.querySelectorAll(".tab-btn").forEach(btn => {
        if (btn.getAttribute("data-tab") === tabActual) {
            btn.className = "tab-btn px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm transition-all duration-300 bg-brand text-white shadow-md flex items-center gap-1.5 flex-grow md:flex-grow-0 justify-center";
        } else {
            btn.className = "tab-btn px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm text-slate-500 hover:text-slate-800 transition-all duration-300 flex items-center gap-1.5 flex-grow md:flex-grow-0 justify-center bg-transparent shadow-none";
        }
    });

    if (tabActual === "PCC") {
        llenarSelect("filtro1", datasetActual.map(c => c.region), "Todas las Regiones");
        llenarSelect("filtro2", datasetActual.map(c => c.tipo), "Tipos de Institución");
        llenarSelect("filtro3", datasetActual.map(c => c.gestion), "Tipos de Gestión");
    } 
    else if (tabActual === "EUREKA") {
        llenarSelect("filtro1", datasetActual.map(c => c.region), "Todas las Regiones");
        llenarSelect("filtro2", datasetActual.map(c => c.gestion), "Tipos de Gestión"); // Cambiado a Gestión
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
            if (f2 && normalizarNombre(c.gestion) !== f2) return false; // Filtra por gestión
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
        // Tarjeta clicable para el plano interactivo
        htmlSalida += `<div onclick="resaltarStandEnPlano('${c.stand}')" class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-brand hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer">`;
        
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
                    <span class="text-md font-black text-slate-800 block">💡 ${total} Proyectos Finalistas</span>
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