//!==========================================================================!//
//!                             IMPORTAR MÓDULOS                             !//
//!==========================================================================!//

import { $ } from './helpers.js';
import { fetchMoreArtists, fetchTopArtists, setLastSearchQuery } from '../index.js';
import { debouncedHandler } from './utilities.js';


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

        let canClick = true;

        spotifyIcon.on('click', () => {
            if (!canClick) return;
            canClick = false;

            searchBar.value = '';
            clearIcon.style.opacity = '0';
            clearIcon.style.pointerEvents = 'none';
            container.innerHTML = '';
            container.classList.remove('artists-container');
            document.title = 'Wespotify - Música para todos';
            fetchTopArtists();

            setTimeout(() => {
                canClick = true;
            }, 1000);
        });

        clearIcon.on('click', () => {
            setLastSearchQuery(searchBar.value);
            searchBar.value = '';
            clearIcon.style.opacity = '0';
            clearIcon.style.pointerEvents = 'none';
        });

        searchBar.on('input', () => {
            document.title = 'Wespotify - Buscar';
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

        document.addEventListener('click', () => {
            document.querySelectorAll('.top-track.active').forEach( el => {
                el.classList.remove('active');
            });
        });        

        fetchTopArtists();
    });
}
