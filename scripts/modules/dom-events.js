//!==========================================================================!//
//!                             IMPORTAR MÓDULOS                             !//
//!==========================================================================!//

import { $ } from './helpers.js';
import { fetchTopArtists } from '../index.js';
import { debouncedHandler } from './debouncing.js';


//*==========================================================================*//
//*                     INICIALIZAR CONSTANTES GLOBALES                      *//
//*==========================================================================*//

export const spotifyIcon = $('.spotify-icon');
export const searchBar = $('.search-bar');
export const clearIcon = $('.clear-icon');
export const container = $('.main-container');


//*==========================================================================*//
//*                  AGREGAR ESCUCHADORES AL CARGAR EL DOM                   *//
//*==========================================================================*//

export function DOMLoaded() {
    window.addEventListener('DOMContentLoaded', () => {
        document.on('dragstart', (event) => event.preventDefault());
        document.on('contextmenu', (event) => event.preventDefault());

        spotifyIcon.on('click', () => {
            searchBar.value = '';
            clearIcon.style.display = 'none';
            container.innerHTML = '';
            fetchTopArtists();
        });

        clearIcon.on('click', () => {
            searchBar.value = '';
            clearIcon.style.display = 'none';
        });

        searchBar.on('input', () => {
            clearIcon.style.display = searchBar.value ? 'inline' : 'none';
        });

        searchBar.on('input', debouncedHandler);

        fetchTopArtists();
    });
}
