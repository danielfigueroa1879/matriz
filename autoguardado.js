/**
 * autoguardado.js
 * Guarda datos en localStorage.
 */

const STORAGE_KEY = 'fiscalizacion_data_v2';

function guardar() {
    const data = {};
    
    // Inputs simples
    document.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]), textarea').forEach(el => {
        if (el.id) data[el.id] = el.value;
    });

    // Radios
    document.querySelectorAll('input[type="radio"]:checked').forEach(el => {
        data['radio_' + el.name] = el.value;
    });

    // Checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(el => {
        if(el.id) data['check_' + el.id] = el.checked;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function cargar() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);

    Object.keys(data).forEach(key => {
        if (key.startsWith('radio_')) {
            const name = key.replace('radio_', '');
            const el = document.querySelector(`input[name="${name}"][value="${data[key]}"]`);
            if(el) el.checked = true;
        } else if (key.startsWith('check_')) {
            const id = key.replace('check_', '');
            const el = document.getElementById(id);
            if(el) el.checked = data[key];
        } else {
            const el = document.getElementById(key);
            if(el) el.value = data[key];
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargar();
    document.body.addEventListener('input', guardar);
    document.body.addEventListener('change', guardar);
});
