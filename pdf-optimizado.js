/**
 * pdf-optimizado.js
 * Lógica corregida para evitar que el PDF salga cortado o desplazado.
 */

function generarPDFAdaptado() {
    // 1. Mostrar loader y ocultar botones
    const loader = document.getElementById('loader');
    const btnContainer = document.getElementById('downloadButtonContainer');
    if(loader) loader.classList.remove('hidden');
    if(btnContainer) btnContainer.classList.add('hidden');

    // 2. Elemento a capturar: El formulario principal
    const elementToCapture = document.getElementById('form-page-container');

    // 3. Configuración robusta de HTML2PDF
    const opt = {
        margin:       [10, 10, 10, 10], // Márgenes del PDF en mm
        filename:     `Fiscalizacion_${new Date().toISOString().slice(0,10)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 1.5, // Buena resolución
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            // ESTO EVITA QUE SE CORTE: Forzamos al navegador a renderizar como escritorio
            windowWidth: 1200,
            width: 1200, 
            letterRendering: true
        },
        jsPDF:        { unit: 'mm', format: 'legal', orientation: 'portrait' }
    };

    // 4. Modificación del clon antes de imprimir
    // Usamos el hook interno de html2pdf modificando las opciones antes de llamar
    
    // Nota: html2pdf no expone fácilmente el hook onclone en su API simple,
    // pero podemos usar html2canvas options directamente.
    
    const worker = html2pdf().from(elementToCapture).set(opt).toPdf().get('pdf').then((pdf) => {
        // Procesamiento posterior si fuera necesario
    }).save().then(() => {
        // Éxito: Restaurar interfaz
        if(loader) loader.classList.add('hidden');
        if(btnContainer) btnContainer.classList.remove('hidden');
    }).catch(err => {
        console.error(err);
        alert('Error al generar PDF');
        if(loader) loader.classList.add('hidden');
        if(btnContainer) btnContainer.classList.remove('hidden');
    });
}

// Sobrescribir html2canvas options para inyectar lógica de onclone
// Esto es necesario porque la librería html2pdf a veces oculta este acceso.
const originalHtml2pdf = window.html2pdf;
if (originalHtml2pdf) {
    window.html2pdf = function() {
        const worker = originalHtml2pdf();
        const originalSet = worker.set;
        
        worker.set = function(opt) {
            if (!opt.html2canvas) opt.html2canvas = {};
            
            // Inyectar función onclone
            opt.html2canvas.onclone = function(clonedDoc) {
                // 1. Forzar ancho del body y eliminar márgenes de centrado
                const clonedBody = clonedDoc.body;
                clonedBody.style.width = '1200px';
                clonedBody.style.margin = '0';
                clonedBody.style.padding = '0';
                
                // 2. Ajustar contenedor principal para que ocupe todo el ancho (sin margin auto)
                const container = clonedDoc.getElementById('form-page-container');
                if(container) {
                    container.style.width = '100%';
                    container.style.maxWidth = 'none';
                    container.style.margin = '0';
                    container.style.padding = '20px';
                }

                // 3. Inyectar estilos para romper textos largos (wrap)
                const style = clonedDoc.createElement('style');
                style.innerHTML = `
                    /* Clase para reemplazo de textareas */
                    .textarea-contenido-pdf {
                        display: block;
                        width: 100%;
                        min-height: 40px;
                        padding: 8px;
                        font-family: 'Inter', sans-serif;
                        font-size: 11px;
                        line-height: 1.3;
                        background-color: #fff;
                        border: 1px solid #ccc;
                        white-space: pre-wrap !important;
                        word-break: break-word !important;
                        overflow-wrap: break-word !important;
                        text-align: justify;
                    }
                    /* Ocultar elementos innecesarios */
                    .no-print, button { display: none !important; }
                `;
                clonedDoc.head.appendChild(style);

                // 4. Reemplazar Textareas por Divs (para evitar corte de texto)
                const textareas = clonedDoc.querySelectorAll('textarea');
                textareas.forEach(textarea => {
                    const div = clonedDoc.createElement('div');
                    div.className = 'textarea-contenido-pdf';
                    // Usar el valor actual, no el HTML
                    div.innerText = textarea.value; 
                    
                    if(textarea.parentNode) {
                        textarea.parentNode.replaceChild(div, textarea);
                    }
                });

                // 5. Marcar inputs seleccionados visualmente
                const inputs = clonedDoc.querySelectorAll('input[type="radio"], input[type="checkbox"]');
                inputs.forEach(input => {
                    if(input.checked) input.setAttribute('checked', 'checked');
                });
            };
            
            return originalSet.call(worker, opt);
        };
        return worker;
    };
}
