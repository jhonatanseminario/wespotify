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
//                    EVENTOS CONTROLADOS AL CARGAR LA PÁGINA                     //
//================================================================================//

window.on('DOMContentLoaded', () => {
    document.on('dragstart', (event) => event.preventDefault());
    document.on('contextmenu', (event) => event.preventDefault());

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
        console.log(data)
        const topArtistsArray = [];

        data.tracks.items.forEach(({ track }) => {
            const { id, name } = track.artists[0];
            const imageUrl = track.album.images[1]?.url || '/assets/icons/artist-fallback-icon.svg';
        
            if (!topArtistsArray.some(artist => artist.id === id)) {
                topArtistsArray.push({ id, name, imageUrl });
            }   
        });

        topArtistsArray.splice(40);
        displayResults(topArtistsArray, 0);

    } catch (error) {
        console.error('Error fetching top artists:', error);
    }
}



// ===============================================================================//
//                  OBTENER TOKEN DE ACCESO A LA API DE SPOTIFY                   //
//================================================================================//

let isSpotifyFetching = false;

$('.spotify-icon').on('click', () => {
    if (!isSpotifyFetching) {
        isSpotifyFetching = true;
        resultsContainer.off('scroll', handleScroll);
        searchBar.value = '';

        setTimeout(() => {
            resultsContainer.classList.add('main-container');
            resultsContainer.classList.remove('artists-container');
            resultsContainer.innerHTML = ''
        }, 500);

        fetchTopArtists();
        
        setTimeout(() => {
            resultsContainer.on('scroll', handleScroll);
            isSpotifyFetching = false;
        }, 1500);
    }
});

const clearIcon = $('.clear-icon');

clearIcon.on('click', () => {
    searchBar.value = ''
    resultsContainer.innerHTML = ''
    resultsContainer.classList.remove('artists-container');
    resultsContainer.classList.add('main-container');
    clearIcon.style.display = 'none'
    fetchTopArtists()
});

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

function displayResults(artistsArray, offset) {
    if (!resultsContainer) {
        console.error('Results container not found!');
        return;
    }

    if (offset === 0) {
        resultsContainer.innerHTML = '';
    }

    artistsArray.forEach(artist => {
        const artistElement = document.createElement('div');
        artistElement.className = 'artist-container';

        const artistImage = document.createElement('img');
        artistImage.src = artist.imageUrl;
        artistImage.alt = artist.name;
        artistImage.className = 'artist-image';
        artistImage.onload = () => {
            artistImage.style.animation = 'artistsAnimation .4s ease-in-out forwards';
        };

        const artistName = document.createElement('div');
        artistName.textContent = artist.name;
        artistName.className = 'artist-name';

        artistElement.appendChild(artistImage);
        artistElement.appendChild(artistName);

        artistElement.on('click', () => {
            if (!isArtistFetched) {
                isArtistFetched = true;
                resultsContainer.off('scroll', handleScroll);
                resultsContainer.innerHTML = ''
                searchBar.value = ''
                clearIcon.style.display = 'none'
                fetchArtistDetails(artist.id);
        
                setTimeout(() => {
                    isArtistFetched = false;
                }, 1000);
            }
        });

        resultsContainer.appendChild(artistElement);
    });
}

async function fetchArtistTopTracks(artistID) {
    const token = await getToken();
    
    try {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=US`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }

        const topTracksData = await response.json();
        return topTracksData.tracks;

    } catch (error) {
        console.error('Error fetching artist top tracks:', error);
    }
}

async function fetchArtistDetails(artistID) {
    const token = await getToken();
    
    try {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistID}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }

        const artistDetails = await response.json();
        isArtistView = true;
        resultsContainer.innerHTML = '';

        const artistCover = document.createElement('div');
        artistCover.className = 'cover-image';

        const artistImage = document.createElement('img');
        artistImage.src = artistDetails.images[1].url;
        artistImage.alt = `${artistDetails.name} - Imagen`;
        artistImage.className = 'profile-image';

        const artistInfo = document.createElement('div');
        artistInfo.textContent = `${artistDetails.name}`;
        artistInfo.className = 'artist-info';

        const followersInfo = document.createElement('div');
        followersInfo.textContent = `${artistDetails.followers.total} Seguidores`;
        followersInfo.className = 'followers-info';

        artistCover.appendChild(artistImage);
        resultsContainer.appendChild(artistCover);
        resultsContainer.appendChild(artistInfo);
        resultsContainer.appendChild(followersInfo);

        const topTracks = await fetchArtistTopTracks(artistID);

        let tracksContainer = resultsContainer.querySelector('.tracks-container');
        if (tracksContainer) {
            tracksContainer.remove();
        }

        tracksContainer = document.createElement('div');
        tracksContainer.className = 'tracks-container';

        topTracks.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.className = 'track-item';
            trackElement.textContent = track.name;
            tracksContainer.appendChild(trackElement);
        });

        resultsContainer.appendChild(tracksContainer);

    } catch (error) {
        console.error('Error fetching artist details:', error);
    }
}

function backToArtistList() {
    resultsContainer.innerHTML = '';
    isArtistView = false;
    offset = 0;
    searchArtists(currentArtistQuery, offset);
}

const resultsContainer = $('.container');
const searchBar = $('.search-bar')

resultsContainer.on('scroll', handleScroll);
searchBar.on('input', debouncedSearch);

let offset = 0;
let isLoading = false;
let isArtistView = false;
let debounceTimeout;

function handleScroll() {
    if (isArtistView) return;
    const isMainContainer = resultsContainer.classList.contains('main-container');

    if (!isMainContainer && !isLoading && resultsContainer.scrollTop + resultsContainer.clientHeight >= resultsContainer.scrollHeight - 32) {
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
        resultsContainer.classList.remove('main-container');
        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('artists-container');

        if (artist) {
            offset = 0;
            isArtistView = false;
            resultsContainer.innerHTML = '';
            resultsContainer.on('scroll', handleScroll);
            clearIcon.style.display = 'inline'
            searchArtists(artist, offset);
        } else {
            resultsContainer.off('scroll', handleScroll);
            resultsContainer.classList.remove('artists-container');
            resultsContainer.classList.add('main-container');
            clearIcon.style.display = 'none'
            fetchTopArtists();
        }
    }, 500);
}
