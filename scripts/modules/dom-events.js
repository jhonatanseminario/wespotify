//!==========================================================================!//
//!                             IMPORTAR MÓDULOS                             !//
//!==========================================================================!//

import { $ } from './helpers.js';
import { fetchMoreArtists, fetchTopArtists, setLastSearchQuery } from '../index.js';
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
            container.classList.remove('artists-container');
            fetchTopArtists();
        });

        clearIcon.on('click', () => {
            setLastSearchQuery(searchBar.value);
            searchBar.value = '';
            clearIcon.style.opacity = '0';
            clearIcon.style.pointerEvents = 'none';
        });

        searchBar.on('input', () => {
            if (searchBar.value) {
                clearIcon.style.opacity = '1';
                clearIcon.style.pointerEvents = 'auto';
            } else {
                clearIcon.style.opacity = '0';
                clearIcon.style.pointerEvents = 'none';
            }
        });

        searchBar.on('input', debouncedHandler);
        container.on('scroll', fetchMoreArtists);

        fetchTopArtists();
    });
}
