/**
 * autoguardado.js
 * Guarda automáticamente el progreso del formulario en el navegador.
 */

const STORAGE_KEY = 'formulario_fiscalizacion_data';

// Función para guardar datos
function guardarDatos() {
    const data = {};
    
    // Guardar inputs de texto, fecha, time, number
    const inputs = document.querySelectorAll('input[type="text"], input[type="date"], input[type="time"], input[type="number"]');
    inputs.forEach(input => {
        if(input.id) data[input.id] = input.value;
    });

    // Guardar textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(area => {
        if(area.id) data[area.id] = area.value;
    });

    // Guardar radios (solo el seleccionado)
    const radiosChecked = document.querySelectorAll('input[type="radio"]:checked');
    radiosChecked.forEach(radio => {
        if(radio.name) data['radio_' + radio.name] = radio.value;
    });

    // Guardar checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        if(cb.id) data['check_' + cb.id] = cb.checked;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Datos guardados automáticamente.');
}

// Función para cargar datos
function cargarDatos() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if(!saved) return;

    const data = JSON.parse(saved);

    // Cargar inputs y textareas
    Object.keys(data).forEach(key => {
        if(key.startsWith('radio_')) {
            // Cargar radios
            const name = key.replace('radio_', '');
            const value = data[key];
            const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
            if(radio) radio.checked = true;
        } else if (key.startsWith('check_')) {
            // Cargar checkboxes
            const id = key.replace('check_', '');
            const cb = document.getElementById(id);
            if(cb) cb.checked = data[key];
        } else {
            // Cargar standard inputs
            const el = document.getElementById(key);
            if(el) el.value = data[key];
        }
    });
    console.log('Datos restaurados.');
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();

    // Escuchar cambios para autoguardado
    const form = document.getElementById('fiscalizacionForm');
    if(form) {
        form.addEventListener('change', guardarDatos);
        form.addEventListener('input', guardarDatos);
    }
});
