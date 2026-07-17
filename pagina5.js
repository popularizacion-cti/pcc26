// ================================
// MÓDULO: CARRUSEL GALERÍA DE FOTOS
// ================================
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. BASE DE DATOS DE IMÁGENES (Rutas de las fotos)
    const imagenesData = {
        pasacalle: [
            "assets/img/galeria/pasacalle-01.jpg",
            "assets/img/galeria/pasacalle-02.jpg",
            "assets/img/galeria/pasacalle-03.jpg",
            "assets/img/galeria/pasacalle-04.jpg",
            "assets/img/galeria/pasacalle-05.jpg",
            "assets/img/galeria/pasacalle-06.jpg",
            "assets/img/galeria/pasacalle-07.jpg",
            "assets/img/galeria/pasacalle-08.jpg",
            "assets/img/galeria/pasacalle-09.jpg",
            "assets/img/galeria/pasacalle-10.jpg",
            "assets/img/galeria/pasacalle-11.jpg",
            "assets/img/galeria/pasacalle-12.jpg",
            "assets/img/galeria/pasacalle-13.jpg",
            "assets/img/galeria/pasacalle-14.jpg",
            "assets/img/galeria/pasacalle-15.jpg",
            "assets/img/galeria/pasacalle-16.jpg"
        ],
        pcc: [
            "assets/img/galeria/pcc-01.jpg",
            "assets/img/galeria/pcc-02.jpg",
            "assets/img/galeria/pcc-03.jpg",
            "assets/img/galeria/pcc-04.jpg",
            "assets/img/galeria/pcc-05.jpg",
            "assets/img/galeria/pcc-06.jpg",
            "assets/img/galeria/pcc-07.jpg",
            "assets/img/galeria/pcc-08.jpg",
            "assets/img/galeria/pcc-09.jpg",
            "assets/img/galeria/pcc-10.jpg",
            "assets/img/galeria/pcc-11.jpg",
            "assets/img/galeria/pcc-12.jpg",
            "assets/img/galeria/pcc-13.jpg",
            "assets/img/galeria/pcc-14.jpg",
            "assets/img/galeria/pcc-15.jpg",
            "assets/img/galeria/pcc-16.jpg",
            "assets/img/galeria/pcc-17.jpg",
            "assets/img/galeria/pcc-18.jpg",
            "assets/img/galeria/pcc-19.jpg",
            "assets/img/galeria/pcc-20.jpg",
            "assets/img/galeria/pcc-21.jpg",
            "assets/img/galeria/pcc-22.jpg",
            "assets/img/galeria/pcc-23.jpg",
            "assets/img/galeria/pcc-24.jpg",
            "assets/img/galeria/pcc-25.jpg",
            "assets/img/galeria/pcc-26.jpg",
            "assets/img/galeria/pcc-27.jpg",
            "assets/img/galeria/pcc-28.jpg",
            "assets/img/galeria/pcc-29.jpg",
            "assets/img/galeria/pcc-30.jpg",
            "assets/img/galeria/pcc-31.jpg",
            "assets/img/galeria/pcc-32.jpg",
            "assets/img/galeria/pcc-33.jpg",
            "assets/img/galeria/pcc-34.jpg",
            "assets/img/galeria/pcc-35.jpg",
            "assets/img/galeria/pcc-36.jpg",
            "assets/img/galeria/pcc-37.jpg",
            "assets/img/galeria/pcc-38.jpg",
            "assets/img/galeria/pcc-39.jpg",
            "assets/img/galeria/pcc-40.jpg",
            "assets/img/galeria/pcc-41.jpg",
            "assets/img/galeria/pcc-42.jpg",
            "assets/img/galeria/pcc-43.jpg",
            "assets/img/galeria/pcc-44.jpg",
            "assets/img/galeria/pcc-45.jpg"
        ],
        eureka: [
            "assets/img/galeria/eureka-01.jpg",
            "assets/img/galeria/eureka-02.jpg",
            "assets/img/galeria/eureka-03.jpg",
            "assets/img/galeria/eureka-04.jpg",
            "assets/img/galeria/eureka-05.jpg",
            "assets/img/galeria/eureka-06.jpg",
            "assets/img/galeria/eureka-07.jpg",
            "assets/img/galeria/eureka-08.jpg",
            "assets/img/galeria/eureka-09.jpg",
            "assets/img/galeria/eureka-10.jpg",
            "assets/img/galeria/eureka-11.jpg",
            "assets/img/galeria/eureka-12.jpg",
            "assets/img/galeria/eureka-13.jpg",
            "assets/img/galeria/eureka-14.jpg",
            "assets/img/galeria/eureka-15.jpg",
            "assets/img/galeria/eureka-16.jpg",
            "assets/img/galeria/eureka-17.jpg",
            "assets/img/galeria/eureka-18.jpg"
        ],
        ccyt: [
            "assets/img/galeria/ccyt-01.jpg",
            "assets/img/galeria/ccyt-02.jpg",
            "assets/img/galeria/ccyt-03.jpg",
            "assets/img/galeria/ccyt-04.jpg",
            "assets/img/galeria/ccyt-05.jpg",
            "assets/img/galeria/ccyt-06.jpg",
            "assets/img/galeria/ccyt-07.jpg",
            "assets/img/galeria/ccyt-08.jpg",
            "assets/img/galeria/ccyt-09.jpg",
            "assets/img/galeria/ccyt-10.jpg",
            "assets/img/galeria/ccyt-11.jpg",
            "assets/img/galeria/ccyt-12.jpg",
            "assets/img/galeria/ccyt-13.jpg",
            "assets/img/galeria/ccyt-14.jpg",
            "assets/img/galeria/ccyt-15.jpg",
            "assets/img/galeria/ccyt-16.jpg",
            "assets/img/galeria/ccyt-17.jpg",
            "assets/img/galeria/ccyt-18.jpg",
            "assets/img/galeria/ccyt-19.jpg",
            "assets/img/galeria/ccyt-20.jpg",
            "assets/img/galeria/ccyt-21.jpg",
            "assets/img/galeria/ccyt-22.jpg",
            "assets/img/galeria/ccyt-23.jpg",
            "assets/img/galeria/ccyt-24.jpg",
            "assets/img/galeria/ccyt-25.jpg"
        ],
        exposiciones: [
            "assets/img/galeria/escenario-01.jpg",
            "assets/img/galeria/escenario-02.jpg",
            "assets/img/galeria/escenario-03.jpg",
            "assets/img/galeria/escenario-04.jpg",
            "assets/img/galeria/escenario-05.jpg",
            "assets/img/galeria/escenario-06.jpg",
            "assets/img/galeria/escenario-07.jpg",
            "assets/img/galeria/escenario-08.jpg",
            "assets/img/galeria/escenario-09.jpg",
            "assets/img/galeria/escenario-10.jpg",
            "assets/img/galeria/escenario-11.jpg",
            "assets/img/galeria/escenario-12.jpg",
            "assets/img/galeria/escenario-13.jpg",
            "assets/img/galeria/escenario-14.jpg",
            "assets/img/galeria/escenario-15.jpg",
            "assets/img/galeria/escenario-16.jpg",
            "assets/img/galeria/escenario-17.jpg",
            "assets/img/galeria/escenario-18.jpg",
            "assets/img/galeria/escenario-19.jpg",
            "assets/img/galeria/escenario-20.jpg",
            "assets/img/galeria/escenario-21.jpg",
            "assets/img/galeria/escenario-22.jpg",
            "assets/img/galeria/escenario-23.jpg",
            "assets/img/galeria/escenario-24.jpg",
            "assets/img/galeria/escenario-25.jpg",
            "assets/img/galeria/escenario-26.jpg",
            "assets/img/galeria/escenario-27.jpg",
            "assets/img/galeria/escenario-28.jpg",
            "assets/img/galeria/escenario-29.jpg",
            "assets/img/galeria/escenario-30.jpg",
            "assets/img/galeria/escenario-31.jpg",
            "assets/img/galeria/escenario-32.jpg",
            "assets/img/galeria/escenario-33.jpg",
            "assets/img/galeria/escenario-34.jpg",
            "assets/img/galeria/escenario-35.jpg",
            "assets/img/galeria/escenario-36.jpg",
            "assets/img/galeria/escenario-37.jpg",
            "assets/img/galeria/escenario-38.jpg",
            "assets/img/galeria/escenario-39.jpg",
            "assets/img/galeria/escenario-40.jpg",
            "assets/img/galeria/escenario-41.jpg",
            "assets/img/galeria/escenario-42.jpg"
        ],
        monologos: [
            "assets/img/galeria/monologos-01.jpg",
            "assets/img/galeria/monologos-02.jpg",
            "assets/img/galeria/monologos-03.jpg",
            "assets/img/galeria/monologos-04.jpg",
            "assets/img/galeria/monologos-05.jpg",
            "assets/img/galeria/monologos-06.jpg",
            "assets/img/galeria/monologos-07.jpg",
            "assets/img/galeria/monologos-08.jpg",
            "assets/img/galeria/monologos-09.jpg",
            "assets/img/galeria/monologos-10.jpg",
            "assets/img/galeria/monologos-11.jpg",
            "assets/img/galeria/monologos-12.jpg",
            "assets/img/galeria/monologos-13.jpg",
            "assets/img/galeria/monologos-14.jpg",
            "assets/img/galeria/monologos-15.jpg",
            "assets/img/galeria/monologos-16.jpg",
            "assets/img/galeria/monologos-17.jpg",
            "assets/img/galeria/monologos-18.jpg",
            "assets/img/galeria/monologos-19.jpg",
            "assets/img/galeria/monologos-20.jpg",
            "assets/img/galeria/monologos-21.jpg",
            "assets/img/galeria/monologos-22.jpg",
            "assets/img/galeria/monologos-23.jpg",
            "assets/img/galeria/monologos-24.jpg",
            "assets/img/galeria/monologos-25.jpg",
            "assets/img/galeria/monologos-26.jpg"
        ]

    };

    // 2. ELEMENTOS DEL DOM
    const modal = document.getElementById("modal-carrusel");
    const imgModal = document.getElementById("imagen-actual");
    const tituloModal = document.getElementById("modal-titulo");
    const contadorModal = document.getElementById("modal-contador");
    const btnCerrar = document.getElementById("cerrar-modal");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const tarjetasGaleria = document.querySelectorAll(".card-galeria");

    // Variables de estado
    let categoriaActiva = "";
    let indiceActual = 0;
    let fotosActivas = [];

    // 3. FUNCIONES DEL CARRUSEL
    function abrirModal(categoria, titulo) {
        categoriaActiva = categoria;
        fotosActivas = imagenesData[categoria] || [];
        
        if (fotosActivas.length === 0) return; // Si no hay fotos, no abre
        
        indiceActual = 0;
        tituloModal.textContent = titulo;
        
        actualizarImagen();
        
        // Mostrar Modal (Clases Tailwind)
        modal.classList.remove("opacity-0", "pointer-events-none");
        document.body.style.overflow = "hidden"; // Evita scroll en la web
    }

    function cerrarModal() {
        modal.classList.add("opacity-0", "pointer-events-none");
        document.body.style.overflow = ""; // Restaura scroll
        setTimeout(() => { imgModal.src = ""; }, 300); // Limpia imagen tras animación
    }

    function actualizarImagen() {
        // Efecto fade-out suave
        imgModal.style.opacity = 0;
        
        setTimeout(() => {
            imgModal.src = fotosActivas[indiceActual];
            contadorModal.textContent = `${indiceActual + 1} / ${fotosActivas.length}`;
            // Efecto fade-in suave
            imgModal.style.opacity = 1;
        }, 150);
    }

    function prevImagen(e) {
        if(e) e.stopPropagation();
        indiceActual = (indiceActual === 0) ? fotosActivas.length - 1 : indiceActual - 1;
        actualizarImagen();
    }

    function nextImagen(e) {
        if(e) e.stopPropagation();
        indiceActual = (indiceActual === fotosActivas.length - 1) ? 0 : indiceActual + 1;
        actualizarImagen();
    }

    // 4. EVENT LISTENERS
    // Clic en las tarjetas para abrir
    tarjetasGaleria.forEach(tarjeta => {
        tarjeta.addEventListener("click", () => {
            const categoria = tarjeta.getAttribute("data-gallery");
            const titulo = tarjeta.getAttribute("data-titulo");
            abrirModal(categoria, titulo);
        });
    });

    // Botones del modal
    btnCerrar.addEventListener("click", cerrarModal);
    btnPrev.addEventListener("click", prevImagen);
    btnNext.addEventListener("click", nextImagen);

    // Cerrar al hacer clic fuera de la imagen (en el fondo oscuro)
    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModal();
    });

    // Soporte para teclado (Flechas y ESC)
    document.addEventListener("keydown", (e) => {
        if (modal.classList.contains("opacity-0")) return; // Solo si está abierto
        
        if (e.key === "Escape") cerrarModal();
        if (e.key === "ArrowLeft") prevImagen();
        if (e.key === "ArrowRight") nextImagen();
    });

});