// ===============================================================================//
//               HELPERS PARA SELECTORES Y ESCUCHADORES DE EVENTOS                //
//================================================================================//

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

function on(event, handler) {
    this.addEventListener(event, handler);
}

function off(event, handler) {
    this.removeEventListener(event, handler);
}

Node.prototype.on = on;
Node.prototype.off = off;



// ===============================================================================//
//                         INICIALIZAR CONSTANTES GLOBALES                        //
//================================================================================//

const spotifyIcon = $('.spotify-icon');
const searchBar = $('.search-bar')
const clearIcon = $('.clear-icon');
const container = $('.container');



// ===============================================================================//
//                     AGREGAR ESCUCHADORES AL CARGAR EL DOM                      //
//================================================================================//

window.on('DOMContentLoaded', () => {
    document.on('dragstart', (event) => event.preventDefault());
    document.on('contextmenu', (event) => event.preventDefault());

    spotifyIcon.on('click', () => {
        container.innerHTML = ''
        searchBar.value = ''
        fetchTopArtists()
    });

    searchBar.on('input', debouncedHandler);

    clearIcon.on('click', () => {
        searchBar.value = ''
    });

    fetchTopArtists();
});



// ===============================================================================//
//                  OBTENER TOKEN DE ACCESO A LA API DE SPOTIFY                   //
//================================================================================//

async function getToken() {
    const clientId = '0d2db64a6bff43769f27c1ee87901f09';
    const clientSecret = '963dc919e09344dcb5377168e44bb941';
    const endpoint = 'https://accounts.spotify.com/api/token';
    const credentials = btoa(`${clientId}:${clientSecret}`);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const token = data.access_token;
        return token;

    } catch (error) {
        console.error('Error fetching token:', error);
    }
}



// ===============================================================================//
//                          MOSTRAR ARTISTAS DESTACADOS                           //
//================================================================================//

async function fetchTopArtists() {
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
            const topArtistContainer = document.createElement('div');
            const topArtistImage = document.createElement('img');
            const topArtistName = document.createElement('div');


            // MODIFICAR ELEMENTOS
            topArtistContainer.className = 'artist-container';

            topArtistImage.className = 'artist-image';
            topArtistImage.src = artist.imageUrl;
            topArtistImage.alt = artist.name;
            topArtistImage.onload = () => {
                topArtistImage.style.animation = 'artistsAnimation .4s ease-in-out forwards';
            };
    
            topArtistName.className = 'artist-name';
            topArtistName.textContent = artist.name;


            // AGREGAR ELEMENTOS
            topArtistContainer.appendChild(topArtistImage);
            topArtistContainer.appendChild(topArtistName);
            container.appendChild(topArtistContainer);
            

            // AGREGAR EVENTOS A LOS ELEMENTOS
            topArtistContainer.on('click', () => {
                fetchArtistDetails(artist.id); 
            });
        });

    } catch (error) {
        console.error('Error fetching top artists:', error);
    }
}



// ===============================================================================//
//                           MOSTRAR PERFIL DEL ARTISTA                           //
//================================================================================//

async function fetchArtistDetails(artistID) {
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
        const artistImageContainer = document.createElement('div');
        const artistImage = document.createElement('img');
        const artistName = document.createElement('div');
        const artistFollowers = document.createElement('div');


        // MODIFICAR ELEMENTOS
        artistImageContainer.className = 'profile-artist-image-container';

        artistImage.className = 'profile-artist-image';
        artistImage.src = data.images[1].url;
        artistImage.alt = `${data.name} - Imagen`;

        artistName.className = 'profile-artist-name';
        artistName.textContent = `${data.name}`;

        artistFollowers.className = 'profile-artist-followers';
        artistFollowers.textContent = `${data.followers.total} Seguidores`;

        container.innerHTML = '';


        // AGREGAR ELEMENTOS
        artistImageContainer.appendChild(artistImage);
        container.appendChild(artistImageContainer);
        container.appendChild(artistName);
        container.appendChild(artistFollowers);

        
        // LLAMAR FUNCIÓN PARA BUSCAR PISTAS MÁS POPULARES
        const artistTopTracksArray = await fetchArtistTopTracks(artistID);

        artistTopTracksContainer = document.createElement('div');
        artistTopTracksContainer.className = 'artist-top-tracks-container';

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



// ===============================================================================//
//                      OBTENER PISTAS POPULARES DEL ARTISTA                      //
//================================================================================//

async function fetchArtistTopTracks(artistID) {
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



// ===============================================================================//
//                    MANEJADOR DE DEBOUNCING PARA LA BÚSQUEDA                    //
//================================================================================//

function debouncedHandler() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
        if (this.value) {
            container.innerHTML = '';
            fetchArtists(this.value);
        } 
    }, 400);
}



// ===============================================================================//
//                   MOSTRAR RESULTADOS DE BÚSQUEDA DE ARTISTAS                   //
//================================================================================//

async function fetchArtists(artist) {
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
            const artistContainer = document.createElement('div');
            const artistImage = document.createElement('img');
            const artistName = document.createElement('div');


            // MODIFICAR ELEMENTOS
            artistContainer.className = 'artist-container';

            artistImage.className = 'artist-image';
            artistImage.src = artist.imageUrl;
            artistImage.alt = artist.name;
            artistImage.onload = () => {
                artistImage.style.animation = 'artistsAnimation .4s ease-in-out forwards';
            };
    
            artistName.className = 'artist-name';
            artistName.textContent = artist.name;


            // AGREGAR ELEMENTOS
            artistContainer.appendChild(artistImage);
            artistContainer.appendChild(artistName);
            container.appendChild(artistContainer);
            

            // AGREGAR EVENTOS A LOS ELEMENTOS
            artistContainer.on('click', () => {
                fetchArtistDetails(artist.id); 
            });
        });
        
    } catch (error) {
        console.error('Error fetching artists:', error);
    }
}
