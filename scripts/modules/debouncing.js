//!==========================================================================!//
//!                             IMPORTAR MÓDULOS                             !//
//!==========================================================================!//

import { container } from './dom.js';
import { fetchArtists } from '../index.js';



//*==========================================================================*//
//*                 MANEJADOR DE DEBOUNCING PARA LA BÚSQUEDA                 *//
//*==========================================================================*//

export function debouncedHandler() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
        if (this.value) {
            container.innerHTML = '';
            fetchArtists(this.value);
        } 
    }, 400);
}
