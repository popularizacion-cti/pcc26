// ================================
// MÓDULO: PARTICIPANTES (PCC, EUREKA, CCYT, INTERNACIONALES)
// ================================
const SHEET_ID = "15hQVhxcA40ab78kdMh4yIv8QYi4nHuANkbnEISdJBg8"; 
const URL_PCC = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=PCC`;
const URL_EUREKA = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Eureka`;
const URL_CCYT = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=CCYT`;
const URL_INTL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Internacional`;

let dataGlobal = { PCC: [], EUREKA: [], CCYT: [], INTL: [] };
let tabActual = "PCC"; 
let dataMostrada = [];

const normalizarNombre = (str) => {
    if (!str) return "";
    return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
};

// =======================
// 1. INICIALIZACIÓN
// =======================
async function inicializarParticipantes() {
    try {
        const [resPCC, resEureka, resCCYT, resIntl] = await Promise.all([
            fetch(URL_PCC), fetch(URL_EUREKA), fetch(URL_CCYT), fetch(URL_INTL)
        ]);

        const textPCC = await resPCC.text();
        const textEureka = await resEureka.text();
        const textCCYT = await resCCYT.text();
        const textIntl = await resIntl.text();

        const parseGoogleJSON = (text) => JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)).table.rows.slice(1);

        dataGlobal.PCC = parseGoogleJSON(textPCC).map(r => ({
            pais: r.c[0]?.v || "Perú",
            region: r.c[1]?.v || "",
            institucion: r.c[2]?.v || "",
            siglas: r.c[3]?.v || "",
            tipo: r.c[4]?.v || "",
            gestion: r.c[5]?.v || ""
        })).filter(c => c.institucion !== "");

        dataGlobal.EUREKA = parseGoogleJSON(textEureka).map(r => ({
            pais: "Perú",
            region: r.c[0]?.v || "",
            dre: r.c[1]?.v || "",
            ugel: r.c[2]?.v || "",
            gestion: r.c[3]?.v || "",
            iiee: r.c[4]?.v || "",
            zona: r.c[5]?.v || "",
            distrito: r.c[6]?.v || "",
            categoria: r.c[7]?.v || "",
            area: r.c[8]?.v || "",
            titulo: r.c[9]?.v || "" 
        })).filter(c => c.iiee !== "");

        dataGlobal.CCYT = parseGoogleJSON(textCCYT).map(r => ({
            pais: "Perú",
            region: r.c[1]?.v || "",
            dre: r.c[2]?.v || "",
            ugel: r.c[3]?.v || "",
            iiee: r.c[4]?.v || "",
            gestion: r.c[5]?.v || "",
            ccyt: r.c[6]?.v || "",
            nivel: r.c[7]?.v || ""
        })).filter(c => c.ccyt !== "");

        dataGlobal.INTL = parseGoogleJSON(textIntl).map(r => ({
            pais: r.c[0]?.v || "",
            region: r.c[1]?.v || "",
            ciudad: r.c[2]?.v || "",
            iiee: r.c[3]?.v || "",
            gestion: r.c[4]?.v || "",
            proyecto: r.c[5]?.v || "",
            area: r.c[6]?.v || ""
        })).filter(c => c.pais !== "");

        await cargarMapasSVG();
        configurarInterfaz();
        cambiarTab("PCC"); 

    } catch (error) {
        console.error("Error cargando la data:", error);
    }
}

// =======================
// 2. CONFIGURACIÓN DE MAPAS
// =======================
async function cargarMapasSVG() {
    const contenedorPeru = document.getElementById('mapa-peru');
    if (contenedorPeru) {
        try {
            const resPe = await fetch('peru.svg');
            contenedorPeru.innerHTML = await resPe.text();
            prepararInteraccionesMapa('#mapa-peru svg path', true);
        } catch (err) { console.warn("Error peru.svg:", err); }
    }

    const contenedorMundo = document.getElementById('mapa-mundo');
    if (contenedorMundo) {
        try {
            const resMundo = await fetch('world.svg');
            contenedorMundo.innerHTML = await resMundo.text();
            prepararInteraccionesMapa('#mapa-mundo svg path', false);
        } catch (err) { console.warn("Error world.svg:", err); }
    }
}

function prepararInteraccionesMapa(selector, esPeru) {
    document.querySelectorAll(selector).forEach(p => {
        p.classList.add('cursor-pointer', 'transition-all', 'duration-300', 'region-path');
        p.style.stroke = "#ffffff";
        p.style.strokeWidth = "1px";
        
        p.addEventListener('click', () => {
            const id = p.getAttribute('id') || p.getAttribute('name');
            if (!id) return;

            if (esPeru && tabActual === "INTL") return;
            if (!esPeru && tabActual !== "INTL") return;

            const selectFiltro1 = document.getElementById('filtro1');
            const targetNorm = normalizarNombre(id);
            let matchedValue = "";
            
            for (let option of selectFiltro1.options) {
                if (normalizarNombre(option.value) === targetNorm) {
                    matchedValue = option.value; break;
                }
            }
            selectFiltro1.value = (selectFiltro1.value === matchedValue) ? "" : matchedValue;
            aplicarFiltros();
        });
        
        p.addEventListener('mousemove', () => {
            const id = p.getAttribute('id') || p.getAttribute('name');
            const infoHover = document.getElementById('info-hover-mapa');
            if (!id || !infoHover) return;
            
            let datasetActual = dataGlobal[tabActual];
            let cantidad = 0;

            if (esPeru && tabActual !== "INTL") {
                cantidad = datasetActual.filter(c => normalizarNombre(c.region) === normalizarNombre(id)).length;
            } else if (!esPeru && tabActual === "INTL") {
                cantidad = datasetActual.filter(c => normalizarNombre(c.pais) === normalizarNombre(id)).length;
            }

            let term = "Participantes";
            if (tabActual === "CCYT") term = "Clubes";
            else if (tabActual === "EUREKA" || tabActual === "INTL") term = "Proyectos";
            else term = "Instituciones";

            infoHover.innerHTML = `<span class="text-brand font-black text-base">${id}</span> • ${cantidad} ${term}`;
        });
        
        p.addEventListener('mouseout', () => {
            const infoHover = document.getElementById('info-hover-mapa');
            if (infoHover) infoHover.innerHTML = "Seleccione una ubicación para ver detalles";
        });
    });
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
    
    // Activar estilo en botón seleccionado
    document.querySelectorAll(".tab-btn").forEach(btn => {
        if (btn.getAttribute("data-tab") === tabActual) {
            btn.className = "tab-btn px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm transition-all duration-300 bg-brand text-white shadow-md flex items-center gap-1.5 flex-grow md:flex-grow-0 justify-center";
        } else {
            btn.className = "tab-btn px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm text-slate-500 hover:text-slate-800 transition-all duration-300 flex items-center gap-1.5 flex-grow md:flex-grow-0 justify-center bg-transparent shadow-none";
        }
    });

    // Configurar Filtros
    if (tabActual === "PCC") {
        llenarSelect("filtro1", datasetActual.map(c => c.region), "Todas las Regiones");
        llenarSelect("filtro2", datasetActual.map(c => c.tipo), "Tipos de Institución");
        llenarSelect("filtro3", datasetActual.map(c => c.gestion), "Tipos de Gestión");
    } 
    else if (tabActual === "EUREKA") {
        llenarSelect("filtro1", datasetActual.map(c => c.region), "Todas las Regiones");
        llenarSelect("filtro2", datasetActual.map(c => c.zona), "Todas las Zonas");
        llenarSelect("filtro3", datasetActual.map(c => c.area), "Todas las Áreas");
    }
    else if (tabActual === "CCYT") {
        llenarSelect("filtro1", datasetActual.map(c => c.region), "Todas las Regiones");
        llenarSelect("filtro2", datasetActual.map(c => c.gestion), "Tipos de Gestión");
        llenarSelect("filtro3", datasetActual.map(c => c.nivel), "Niveles Educativos");
    }
    else if (tabActual === "INTL") {
        llenarSelect("filtro1", datasetActual.map(c => c.pais), "Todos los Países");
        llenarSelect("filtro2", datasetActual.map(c => c.gestion), "Tipos de Gestión");
        llenarSelect("filtro3", datasetActual.map(c => c.area), "Todas las Áreas");
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
            if (f2 && normalizarNombre(c.zona) !== f2) return false;
            if (f3 && normalizarNombre(c.area) !== f3) return false;
        }
        else if (tabActual === "CCYT") {
            if (f1 && normalizarNombre(c.region) !== f1) return false;
            if (f2 && normalizarNombre(c.gestion) !== f2) return false;
            if (f3 && normalizarNombre(c.nivel) !== f3) return false;
        }
        else if (tabActual === "INTL") {
            if (f1 && normalizarNombre(c.pais) !== f1) return false;
            if (f2 && normalizarNombre(c.gestion) !== f2) return false;
            if (f3 && normalizarNombre(c.area) !== f3) return false;
        }
        return true;
    });

    renderizarTarjetas();
    actualizarIluminacionMapas(f1);
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
        htmlSalida += `<div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-brand/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group">`;
        
        if (tabActual === "PCC") {
            const badgeTipo = c.tipo ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">${c.tipo}</span>` : '';
            htmlSalida += `
                <div class="space-y-2 mb-4">
                    <span class="text-[10px] font-black uppercase tracking-wider block text-brand mb-1">${c.siglas}</span>
                    <h4 class="text-sm font-bold text-slate-800 leading-snug group-hover:text-brand transition-colors">${c.institucion}</h4>
                    <div class="flex flex-wrap gap-2 pt-1">${badgeTipo}</div>
                </div>
                <div class="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <p><span class="font-bold text-slate-700">📍 Región:</span> ${c.region || c.pais}</p>
                    <p><span class="font-bold text-slate-700">🏢 Gestión:</span> ${c.gestion}</p>
                </div>`;
        } 
        else if (tabActual === "EUREKA") {
            // Colores por Área en Eureka
            const areaStr = c.area.toLowerCase();
            let colorArea = 'bg-slate-100 text-slate-700';
            if (areaStr.includes('sociales')) colorArea = 'bg-purple-100 text-purple-700';
            else if (areaStr.includes('indagación') || areaStr.includes('indagacion')) colorArea = 'bg-blue-100 text-blue-700';
            else if (areaStr.includes('soluciones') || areaStr.includes('tecnológicas')) colorArea = 'bg-emerald-100 text-emerald-700';

            htmlSalida += `
                <div class="space-y-2 mb-4">
                    <div class="flex flex-wrap gap-2 pt-1">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider block text-slate-500 bg-slate-100">${c.categoria} </span>
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider block ${colorArea}">${c.area}</span>
                    </div>
                    <h4 class="text-md font-extrabold text-brand/80 leading-snug group-hover:text-brand transition-colors uppercase">${c.region}</h4>
                    <h4 class="text-[14px] font-extrabold text-slate-600 leading-snug group-hover:text-dark/90 transition-colors uppercase">${c.titulo}</h4>
                    <p class="text-[11px] text-slate-600 font-medium">🏫 I.E. ${c.iiee}</p>
                </div>
                <div class="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <p><span class="font-bold text-slate-700">📍 Región:</span> ${c.dre}</p>
                    <p><span class="font-bold text-slate-700">🏢 UGEL:</span> ${c.ugel}</p>
                    <p><span class="font-bold text-slate-700">📌 Distrito:</span> ${c.distrito}</p>
                    <p><span class="font-bold text-slate-700">🏙️ Zona:</span> ${c.zona}</p>
                </div>`;
        } 
        else if (tabActual === "CCYT") {
            // Colores por Nivel en CCYT
            const nivelStr = c.nivel.toLowerCase();
            let colorNivel = 'bg-slate-100 text-slate-700';
            if (nivelStr.includes('primaria')) colorNivel = 'bg-orange-100 text-orange-700';
            else if (nivelStr.includes('secundaria')) colorNivel = 'bg-indigo-100 text-indigo-700';

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
                </div>`;
        }
        else if (tabActual === "INTL") {
            htmlSalida += `
                <div class="space-y-2 mb-4">
                    <div class="flex flex-wrap gap-2 pt-1">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider block text-slate-500 bg-slate-100">${c.area} </span>
                    </div>
                    <h4 class="text-md font-extrabold text-brand/80 leading-snug group-hover:text-brand transition-colors uppercase">${c.pais}</h4>
                    <h4 class="text-xs font-extrabold text-slate-600 leading-snug group-hover:text-dark transition-colors uppercase">${c.proyecto}</h4>
                    <p class="text-[11px] text-slate-600 font-medium">🏫 ${c.iiee}</p>
                    <div class="flex flex-wrap gap-2 pt-1">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">${c.gestion}</span>
                    </div>
                </div>
                <div class="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <p><span class="font-bold text-slate-700">🌎 País:</span> ${c.pais}</p>
                    <p><span class="font-bold text-slate-700">📍 Ciudad:</span> ${c.ciudad}</p>
                </div>`;
        }
        
        htmlSalida += `</div>`;
    });
    
    contenedor.innerHTML = htmlSalida;
}

function actualizarIluminacionMapas(filtro1Activo) {
    const mapaPeru = document.getElementById("mapa-peru");
    const mapaMundo = document.getElementById("mapa-mundo");
    const datasetActual = dataGlobal[tabActual];

    if (tabActual === "INTL") {
        mapaPeru.classList.replace("opacity-100", "opacity-0");
        mapaPeru.classList.add("pointer-events-none", "z-0");
        mapaMundo.classList.replace("opacity-0", "opacity-100");
        mapaMundo.classList.remove("pointer-events-none");
        mapaMundo.classList.add("z-10");

        const paisesConData = {};
        datasetActual.forEach(c => paisesConData[normalizarNombre(c.pais)] = true);
        
        document.querySelectorAll('#mapa-mundo svg path').forEach(p => {
            const id = normalizarNombre(p.getAttribute('id') || p.getAttribute('name'));
            p.style.fill = "";
            if (filtro1Activo && id === filtro1Activo) p.style.fill = "#00B4CE"; 
            else if (paisesConData[id]) p.style.fill = "#B4BD10"; 
            else p.style.fill = "#E2E8F0"; 
        });

    } else {
        mapaMundo.classList.replace("opacity-100", "opacity-0");
        mapaMundo.classList.add("pointer-events-none", "z-0");
        mapaPeru.classList.replace("opacity-0", "opacity-100");
        mapaPeru.classList.remove("pointer-events-none");
        mapaPeru.classList.add("z-10");

        const conteoRegiones = datasetActual.filter(c => normalizarNombre(c.pais) === "PERU").reduce((acc, c) => {
            acc[normalizarNombre(c.region)] = true; return acc;
        }, {});

        document.querySelectorAll('#mapa-peru svg path').forEach(p => {
            const id = normalizarNombre(p.getAttribute('id') || p.getAttribute('name'));
            p.style.fill = ""; 
            if (filtro1Activo && id === filtro1Activo) p.style.fill = "#00B4CE"; 
            else if (conteoRegiones[id]) p.style.fill = "#B4BD10"; 
            else p.style.fill = "#E2E8F0"; 
        });
    }
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
    else if (tabActual === "INTL") {
        const cantPaises = [...new Set(data.map(c => normalizarNombre(c.pais)))].length;
        contenedor.innerHTML = `
            <div class="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-brand flex items-center justify-between gap-4">
                <div class="space-y-1">
                    <span class="text-md font-black text-slate-800 block">🌍 ${total} Proyectos Internacionales</span>
                    <p class="text-xs md:text-sm font-medium text-slate-500">Delegaciones invitadas representando a ${cantPaises} países extranjeros.</p>
                </div>
            </div>`;
    }
}

document.addEventListener("DOMContentLoaded", inicializarParticipantes);