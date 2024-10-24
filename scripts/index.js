//!==========================================================================!//
//!                             IMPORTAR MÓDULOS                             !//
//!==========================================================================!//

import { getToken } from './modules/access-token.js';
import { DOMLoaded, searchBar, clearIcon, container } from './modules/dom-events.js';

DOMLoaded();


//*==========================================================================*//
//*                       MOSTRAR ARTISTAS DESTACADOS                        *//
//*==========================================================================*//

export async function fetchTopArtists() {
    const token = await getToken();
    const top50GlobalPlaylistId = '37i9dQZEVXbMDoHDwVN2tF';

    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${top50GlobalPlaylistId}`, {
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

        topArtistsArray.splice(20);

        topArtistsArray.forEach(artist => {

            // CREAR ELEMENTOS
            const topArtistCard = document.createElement('div');
            const topArtistImage = document.createElement('img');
            const topArtistName = document.createElement('div');


            // MODIFICAR ELEMENTOS
            topArtistCard.className = 'artist-card';

            topArtistImage.className = 'artist-image';
            topArtistImage.src = artist.imageUrl;
            topArtistImage.alt = artist.name;
            topArtistImage.onload = () => {
                topArtistImage.style.animation = 'scaleFadeIn .4s ease-in-out forwards';
            }
    
            topArtistName.className = 'artist-name';
            topArtistName.textContent = artist.name;


            // AGREGAR ELEMENTOS
            topArtistCard.appendChild(topArtistImage);
            topArtistCard.appendChild(topArtistName);
            container.appendChild(topArtistCard);
            

            // AGREGAR EVENTOS A LOS ELEMENTOS
            topArtistCard.on('click', () => {
                searchBar.value = '';
                clearIcon.style.display = 'none';
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
        artistImage.style.backgroundImage = `url(${data.images[0].url})`

        artistName.className = 'profile-artist-name';
        artistName.textContent = `${data.name}`;
        if (data.name.length > 23) {
            artistName.classList.add('long-artist-name');
        }

        artistFollowers.className = 'profile-artist-followers';
        artistFollowers.textContent = `${data.followers.total} seguidores`;

        container.innerHTML = '';


        // AGREGAR ELEMENTOS
        container.appendChild(artistImage);
        container.appendChild(artistName);
        container.appendChild(artistFollowers);

        
        // LLAMAR FUNCIÓN PARA BUSCAR PISTAS MÁS POPULARES
        const artistTopTracksArray = await fetchArtistTopTracks(artistID);

        const artistTopTracksContainer = document.createElement('div');
        artistTopTracksContainer.className = 'profile-artist-tracks';

        artistTopTracksArray.forEach(track => {
            const topTrack = document.createElement('div');

            topTrack.className = 'top-track';
            topTrack.textContent = track.name;

            artistTopTracksContainer.appendChild(topTrack);
        });

        container.appendChild(artistTopTracksContainer);

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

export async function fetchArtists(artist) {
    const token = await getToken();

    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist`, {
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

        artistsArray.forEach(artist => {

            // CREAR ELEMENTOS
            const artistCard = document.createElement('div');
            const artistImage = document.createElement('img');
            const artistName = document.createElement('div');


            // MODIFICAR ELEMENTOS
            artistCard.className = 'artist-card';

            artistImage.className = 'artist-image';
            artistImage.src = artist.imageUrl;
            artistImage.alt = artist.name;
            artistImage.onload = () => {
                artistImage.style.animation = 'scaleFadeIn .4s ease-in-out forwards';
            }
    
            artistName.className = 'artist-name';
            artistName.textContent = artist.name;


            // AGREGAR ELEMENTOS
            artistCard.appendChild(artistImage);
            artistCard.appendChild(artistName);
            container.appendChild(artistCard);
            

            // AGREGAR EVENTOS A LOS ELEMENTOS
            artistCard.on('click', () => {
                searchBar.value = '';
                clearIcon.style.display = 'none';
                container.innerHTML = '';
                fetchArtistDetails(artist.id); 
            });
        });
        
    } catch (error) {
        console.error('Error fetching artists:', error);
    }
}
