/**
 * autoguardado.js
 * Guarda el progreso en localStorage cada vez que el usuario escribe.
 */

const STORAGE_KEY_FISCALIZACION = 'datos_fiscalizacion_v1';

function guardarDatos() {
    const datos = {};
    
    // Inputs de texto, fecha, hora, numero
    document.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]), textarea').forEach(el => {
        if (el.id) datos[el.id] = el.value;
    });

    // Radio buttons
    const radios = document.querySelectorAll('input[type="radio"]:checked');
    radios.forEach(r => {
        datos['radio_' + r.name] = r.value;
    });

    // Checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(c => {
        if(c.id) datos['check_' + c.id] = c.checked;
    });

    localStorage.setItem(STORAGE_KEY_FISCALIZACION, JSON.stringify(datos));
}

function cargarDatos() {
    const guardado = localStorage.getItem(STORAGE_KEY_FISCALIZACION);
    if (!guardado) return;

    const datos = JSON.parse(guardado);

    Object.keys(datos).forEach(key => {
        if (key.startsWith('radio_')) {
            const name = key.replace('radio_', '');
            const val = datos[key];
            const radio = document.querySelector(`input[name="${name}"][value="${val}"]`);
            if (radio) radio.checked = true;
        } else if (key.startsWith('check_')) {
            const id = key.replace('check_', '');
            const check = document.getElementById(id);
            if (check) check.checked = datos[key];
        } else {
            const el = document.getElementById(key);
            if (el) el.value = datos[key];
        }
    });
}

// Iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    
    // Escuchar eventos para guardar
    document.body.addEventListener('input', guardarDatos);
    document.body.addEventListener('change', guardarDatos);
});
