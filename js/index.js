// ===============================================================================//
//                HELPERS PARA SELECTORES Y MANEJADORES DE EVENTOS                //
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
//                           DEFINIR VARIABLES GLOBALES                           //
//================================================================================//

const spotifyIcon = $('.spotify-icon');
const clearIcon = $('.clear-icon');
const container = $('.container');



// ===============================================================================//
//                    EVENTOS CONTROLADOS AL CARGAR LA PÁGINA                     //
//================================================================================//

window.on('DOMContentLoaded', () => {
    document.on('dragstart', (event) => event.preventDefault());
    document.on('contextmenu', (event) => event.preventDefault());

    spotifyIcon.on('click', () => {
        container.innerHTML = ''
        searchBar.value = ''
        fetchTopArtists()
    });

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
//                          OBTENER ARTISTAS DESTACADOS                           //
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

        topArtistsArray.splice(40);

        topArtistsArray.forEach(artist => {

            // CREAR ELEMENTOS
            const topArtistContainer = document.createElement('div');
            const topArtistImage = document.createElement('img');
            const topArtistName = document.createElement('div');


            // MODIFICAR ELEMENTOS
            topArtistContainer.className = 'top-artist-container';

            topArtistImage.className = 'top-artist-image';
            topArtistImage.src = artist.imageUrl;
            topArtistImage.alt = artist.name;
            topArtistImage.onload = () => {
                topArtistImage.style.animation = 'artistsAnimation .4s ease-in-out forwards';
            };
    
            topArtistName.className = 'top-artist-name';
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
        artistImageContainer.className = 'artist-image-container';

        artistImage.className = 'artist-image';
        artistImage.src = data.images[1].url;
        artistImage.alt = `${data.name} - Imagen`;

        artistName.className = 'artist-name';
        artistName.textContent = `${data.name}`;

        artistFollowers.className = 'artist-followers';
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
//                   BUSCAR PISTAS MÁS POPULARES DE UN ARTISTA                    //
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
//                  NOMBRE PROVISIONAL                   //
//================================================================================//

async function searchArtists(artist, offset) {
    const token = await getToken();
    currentArtistQuery = artist;

    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=40&offset=${offset}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const artistsArray = data.artists.items.map(item => ({
            id: item.id,
            name: item.name,
            imageUrl: item.images[1] ? item.images[1].url : '/assets/icons/artist-fallback-icon.svg'
        }));
        displayResults(artistsArray, offset);
    } catch(error) {
        console.error('Error fetching artists:', error);
    }
}

let isArtistFetched = false;

function backToArtistList() {
    container.innerHTML = '';
    isArtistView = false;
    offset = 0;
    searchArtists(currentArtistQuery, offset);
}

const searchBar = $('.search-bar')

container.on('scroll', handleScroll);
searchBar.on('input', debouncedSearch);

let offset = 0;
let isLoading = false;
let isArtistView = false;
let debounceTimeout;

function handleScroll() {
    if (isArtistView) return;
    const isMainContainer = container.classList.contains('main-container');

    if (!isMainContainer && !isLoading && container.scrollTop + container.clientHeight >= container.scrollHeight - 32) {
        clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(() => {
            isLoading = true;
            offset += 40;
            searchArtists(currentArtistQuery, offset).finally(() => {
                isLoading = false;
            });
        },800);
    }
}

function debouncedSearch() {
    const artist = this.value;
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
        container.classList.remove('main-container');
        container.innerHTML = '';
        container.classList.add('artists-container');

        if (artist) {
            offset = 0;
            isArtistView = false;
            container.innerHTML = '';
            container.on('scroll', handleScroll);
            clearIcon.style.display = 'inline'
            searchArtists(artist, offset);
        } else {
            container.off('scroll', handleScroll);
            container.classList.remove('artists-container');
            container.classList.add('main-container');
            clearIcon.style.display = 'none'
            fetchTopArtists();
        }
    }, 500);
}

// let isSpotifyFetching = false;

// $('.spotify-icon').on('click', () => {
//     if (!isSpotifyFetching) {
//         isSpotifyFetching = true;
//         container.off('scroll', handleScroll);
//         searchBar.value = '';

//         setTimeout(() => {
//             container.classList.add('main-container');
//             container.classList.remove('artists-container');
//             container.innerHTML = ''
//         }, 500);

//         fetchTopArtists();
        
//         setTimeout(() => {
//             container.on('scroll', handleScroll);
//             isSpotifyFetching = false;
//         }, 1500);
//     }
// });

// function displayResults(artistsArray) {
//     artistsArray.forEach(artist => {
//         const artistElement = document.createElement('div');
//         artistElement.className = 'artist-container';

//         const artistImage = document.createElement('img');
//         artistImage.src = artist.imageUrl;
//         artistImage.alt = artist.name;
//         artistImage.className = 'artist-image';
//         artistImage.onload = () => {
//             artistImage.style.animation = 'artistsAnimation .4s ease-in-out forwards';
//         };

//         const artistName = document.createElement('div');
//         artistName.textContent = artist.name;
//         artistName.className = 'artist-name';

//         artistElement.appendChild(artistImage);
//         artistElement.appendChild(artistName);

//         artistElement.on('click', () => {
//                 container.off('scroll', handleScroll);
//                 container.innerHTML = ''
//                 searchBar.value = ''
//                 clearIcon.style.display = 'none'
//                 fetchArtistDetails(artist.id);
            
//         });

//         container.appendChild(artistElement);
//     });
// }
