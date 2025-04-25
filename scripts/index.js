//!==========================================================================!//
//!                             IMPORTAR MÓDULOS                             !//
//!==========================================================================!//

import { getToken } from './modules/access-token.js';
import { DOMLoaded, searchBar, clearIcon, container } from './modules/dom-events.js';
import { getAverageColor } from './modules/utilities.js';

DOMLoaded();


//*==========================================================================*//
//*                       MOSTRAR ARTISTAS DESTACADOS                        *//
//*==========================================================================*//

export async function fetchTopArtists() {
    const token = await getToken();
    const billboardHot100PlaylistId = '6UeSakyzhiEt4NB3UAd6NQ';

    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${billboardHot100PlaylistId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const topArtistsArray = [];

        data.tracks.items.forEach(({ track }) => {
            const { id, name } = track.artists[0];
            const imageUrl = track.album.images[1]?.url || '/assets/icons/artist-fallback-icon.svg';
        
            if (!topArtistsArray.some(artist => artist.id === id)) {
                topArtistsArray.push({ id, name, imageUrl });
            }
        });

        topArtistsArray.splice(30);

        container.innerHTML = '';

        topArtistsArray.forEach(artist => {

            // CREAR ELEMENTOS
            const topArtistCard = document.createElement('div');
            const topArtistImage = document.createElement('img');
            const topArtistName = document.createElement('div');


            // MODIFICAR ELEMENTOS
            topArtistCard.className = 'artist-card';

            topArtistImage.className = 'artist-image';
            topArtistImage.src = artist.imageUrl;
            topArtistImage.setAttribute('aria-label', artist.name);
            topArtistImage.style.backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
            topArtistImage.style.animation = 'fadeIn .2s ease-in-out forwards';
    
            topArtistName.className = 'artist-name';
            topArtistName.textContent = artist.name;


            // AGREGAR ELEMENTOS
            topArtistCard.appendChild(topArtistImage);
            topArtistCard.appendChild(topArtistName);
            container.appendChild(topArtistCard);
            

            // AGREGAR EVENTOS A LOS ELEMENTOS
            topArtistCard.on('click', () => {
                searchBar.value = '';
                clearIcon.style.opacity = '0';
                clearIcon.style.pointerEvents = 'none';
                container.innerHTML = '';
                fetchArtistDetails(artist.id); 
            });
        });

    } catch (error) {
        console.error('Error fetching top artists:', error);
    }
}


//*==========================================================================*//
//*                        MOSTRAR PERFIL DEL ARTISTA                        *//
//*==========================================================================*//

export async function fetchArtistDetails(artistID) {
    const token = await getToken();
    
    try {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistID}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        

        // CREAR ELEMENTOS
        const artistImage = document.createElement('div');
        const artistName = document.createElement('div');
        const artistFollowers = document.createElement('div');


        // MODIFICAR ELEMENTOS
        artistImage.className = 'profile-artist-image';
        const imageUrl = data.images[0]?.url || '/assets/icons/artist-fallback-icon.svg';
        artistImage.style.backgroundImage = `url(${imageUrl})`;

        artistName.className = 'profile-artist-name';
        artistName.textContent = `${data.name}`;
        if (data.name.length > 32) {
            artistName.classList.add('long-artist-name');
        }

        artistFollowers.className = 'profile-artist-followers';
        artistFollowers.textContent = `${data.followers.total.toLocaleString()} seguidores`;

        // LLAMAR FUNCIÓN PARA BUSCAR PISTAS MÁS POPULARES
        const artistTopTracksArray = await fetchArtistTopTracks(artistID);
        
        const artistTopTracksContainer = document.createElement('div');
        artistTopTracksContainer.className = 'profile-artist-tracks';

        const artistTopTracksTitle = document.createElement('div');
        artistTopTracksTitle.className = 'profile-artist-tracks-title';
        artistTopTracksTitle.textContent = 'Popular';
        
        artistTopTracksArray.forEach((track, index) => {
            const topTrack = document.createElement('div');
            topTrack.className = 'top-track';

            const trackIndex = document.createElement('div');
            const trackImage = document.createElement('img');
            const trackInfo = document.createElement('div');

            const trackName = document.createElement('div');
            const trackPopularity = document.createElement('div');
            const trackDuration = document.createElement('div');


            trackIndex.className = 'top-track-index';
            trackIndex.textContent = `${index + 1}`;

            trackImage.className = 'top-track-image';
            trackImage.src = track.album.images[2]?.url || '/assets/icons/track-fallback-icon.svg';
            trackImage.alt = track.name;

            trackInfo.className = 'top-track-info';

            trackName.className = 'top-track-name';
            trackName.textContent = track.name;

            trackPopularity.className = 'top-track-popularity';
            trackPopularity.textContent = `Popularidad del ${track.popularity}%`;

            trackDuration.className = 'top-track-duration';
            const minutes = Math.floor(track.duration_ms / 60000);
            const seconds = Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0');
            trackDuration.textContent = `${minutes}:${seconds}`;


            trackInfo.appendChild(trackName);
            trackInfo.appendChild(trackPopularity);
            trackInfo.appendChild(trackDuration);

            topTrack.appendChild(trackIndex);
            topTrack.appendChild(trackImage);
            topTrack.appendChild(trackInfo);
            
            artistTopTracksContainer.appendChild(topTrack);
        });
        
        container.innerHTML = '';

        // AGREGAR ELEMENTOS
        container.appendChild(artistImage);
        artistImage.appendChild(artistName);
        artistImage.appendChild(artistFollowers);

        artistTopTracksContainer.appendChild(artistTopTracksTitle);
        container.appendChild(artistTopTracksContainer);

        // OTROS EVENTOS
        document.title = `${data.name} | Wespotify`;

        getAverageColor(imageUrl, (color) => {
            const rgbaColor = color.replace('rgb', 'rgba').replace(')', ', 0.3)');
            artistImage.style.setProperty('--artist-gradient-color', rgbaColor);
        });

    } catch (error) {
        console.error('Error fetching artist details:', error);
    }
}


//*==========================================================================*//
//*                   OBTENER PISTAS POPULARES DEL ARTISTA                   *//
//*==========================================================================*//

export async function fetchArtistTopTracks(artistID) {
    const token = await getToken();

    try {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistID}/top-tracks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.tracks;

    } catch (error) {
        console.error('Error fetching artist top tracks:', error);
    }
}


//*==========================================================================*//
//*                MOSTRAR RESULTADOS DE BÚSQUEDA DE ARTISTAS                *//
//*==========================================================================*//

let offset = 0;

export async function fetchArtists(artist, loadMore = false) {
    const token = await getToken();
    if (!loadMore) offset = 0;

    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=30&offset=${offset}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const artistsArray = [];
        
        data.artists.items.forEach((artist) => {
            const { id, name } = artist;
            const imageUrl = artist.images[1]?.url || '/assets/icons/artist-fallback-icon.svg';
            artistsArray.push({ id, name, imageUrl });
        });

        if (!loadMore) container.innerHTML = '';

        artistsArray.forEach(artist => {

            // CREAR ELEMENTOS
            const artistCard = document.createElement('div');
            const artistImage = document.createElement('img');
            const artistName = document.createElement('div');


            // MODIFICAR ELEMENTOS
            artistCard.className = 'artist-card';

            artistImage.className = 'artist-image';
            artistImage.src = artist.imageUrl;
            artistImage.setAttribute('aria-label', artist.name);
            if (!artist.imageUrl.includes('/assets/icons/artist-fallback-icon.svg')) {
                artistImage.style.backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
            }
            artistImage.style.animation = 'fadeIn .2s ease-in-out forwards';
    
            artistName.className = 'artist-name';
            artistName.textContent = artist.name;


            // AGREGAR ELEMENTOS
            artistCard.appendChild(artistImage);
            artistCard.appendChild(artistName);
            container.appendChild(artistCard);
            

            // AGREGAR EVENTOS A LOS ELEMENTOS
            artistCard.on('click', () => {
                searchBar.value = '';
                clearIcon.style.opacity = '0';
                clearIcon.style.pointerEvents = 'none';
                container.innerHTML = '';
                container.classList.remove('artists-container');
                fetchArtistDetails(artist.id); 
            });

            container.classList.add('artists-container');
        });
        
    } catch (error) {
        console.error('Error fetching artists:', error);
    }
}


//*==========================================================================*//
//*               CARGAR MÁS RESULTADOS DE BÚSQUEDA DE ARTISTAS              *//
//*==========================================================================*//

let loading = false;
let lastSearchQuery = '';

export function setLastSearchQuery(query) {
    lastSearchQuery = query;
}

export function fetchMoreArtists() {
    if (container.scrollHeight - container.scrollTop - container.clientHeight < 32 && !loading && container.classList.contains('artists-container')) {
        loading = true;
        offset += 30;
        const query = searchBar.value || lastSearchQuery;
        fetchArtists(query, true);
        setTimeout(() => loading = false, 1000);
    }
}
