/**
 * pdf-optimizado.js
 * Solución definitiva para el problema de PDF cortado a la mitad y texto desbordado.
 */

function generarPDFAdaptado() {
    // 1. UI: Mostrar loader y ocultar botones
    const loader = document.getElementById('loader');
    const btnContainer = document.getElementById('downloadButtonContainer');
    if(loader) loader.classList.remove('hidden');
    if(btnContainer) btnContainer.classList.add('hidden');

    // 2. Elemento a capturar (El formulario original, NO la ventana de resultados)
    const elementToCapture = document.getElementById('form-page-container');

    // 3. Configuración crítica de HTML2PDF
    const opt = {
        margin:       [10, 10, 10, 10], // Márgenes (mm)
        filename:     `Fiscalizacion_${new Date().toISOString().slice(0,10)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 1.5, // Calidad
            useCORS: true,
            // ESTO ES LO QUE ARREGLA EL CORTE:
            scrollX: 0,
            scrollY: 0,
            windowWidth: 1280, // Forzar al navegador virtual a ser ancho (Desktop)
            width: 1280,       // Forzar el ancho del canvas
            letterRendering: true
        },
        jsPDF:        { unit: 'mm', format: 'legal', orientation: 'portrait' }
    };

    // 4. Generación con manipulación del DOM clonado
    html2pdf().from(elementToCapture).set(opt).toPdf().get('pdf').then((pdf) => {
        // Aquí podrías agregar números de página si quisieras
    }).save().then(() => {
        // Restaurar UI
        if(loader) loader.classList.add('hidden');
        if(btnContainer) btnContainer.classList.remove('hidden');
    }).catch(err => {
        console.error(err);
        alert('Error al generar PDF');
        if(loader) loader.classList.add('hidden');
        if(btnContainer) btnContainer.classList.remove('hidden');
    });
}

// Hook para inyectar estilos que evitan el desbordamiento de texto justo antes de la foto
// Esto se hace pasando una función 'onclone' a html2canvas, pero html2pdf lo abstrae.
// Solución alternativa robusta: Modificar las opciones para incluir onclone.

const originalHtml2pdf = html2pdf;
window.html2pdf = function() {
    const worker = originalHtml2pdf();
    const originalSet = worker.set;
    
    worker.set = function(opt) {
        if (opt.html2canvas) {
            opt.html2canvas.onclone = function(clonedDoc) {
                // 1. Forzar ancho del body clonado para que coincida con windowWidth
                clonedDoc.body.style.width = '1280px';
                clonedDoc.body.style.maxWidth = '1280px';
                
                // 2. Forzar contenedor principal a ocupar todo el ancho
                const container = clonedDoc.getElementById('form-page-container');
                if(container) {
                    container.style.width = '100%';
                    container.style.maxWidth = 'none';
                    container.style.margin = '0';
                    container.style.padding = '20px';
                }

                // 3. Convertir Textareas en DIVs para que se vea todo el texto
                const textareas = clonedDoc.querySelectorAll('textarea');
                textareas.forEach(textarea => {
                    const div = document.createElement('div');
                    // Copiar estilos básicos
                    div.style.width = '100%';
                    div.style.minHeight = '40px';
                    div.style.border = '1px solid #ccc';
                    div.style.padding = '8px';
                    div.style.fontSize = '14px';
                    div.style.fontFamily = 'Inter, sans-serif';
                    div.style.whiteSpace = 'pre-wrap';       // Respetar saltos de línea
                    div.style.wordBreak = 'break-word';      // Romper palabras largas
                    div.style.overflowWrap = 'break-word';   // Estándar moderno
                    div.style.backgroundColor = '#f9fafb';
                    div.innerText = textarea.value; // Usar el valor escrito

                    textarea.parentNode.replaceChild(div, textarea);
                });

                // 4. Asegurar que los inputs checkeados se vean
                const inputs = clonedDoc.querySelectorAll('input[type="radio"], input[type="checkbox"]');
                inputs.forEach(input => {
                   if(input.checked) input.setAttribute('checked', 'checked'); 
                });
            };
        }
        return originalSet.call(worker, opt);
    };
    return worker;
};
