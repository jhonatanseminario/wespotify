function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function on(event, handler) {
    this.addEventListener(event, handler);
}

Node.prototype.on = on;

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

async function searchArtists(artist, offset) {
    const token = await getToken();
    currentArtistQuery = artist;

    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=30&offset=${offset}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const artistsArray = data.artists.items.map(item => ({
            id: item.id,
            name: item.name,
            imageUrl: item.images[1] ? item.images[1].url : '/fallback-icon.svg'
        }));
        displayResults(artistsArray, offset);
    } catch(error) {
        console.error('Error fetching artists:', error);
    }
}

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
            fetchArtistDetails(artist.id);
        });

        resultsContainer.appendChild(artistElement);
    });
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

        artistCover.appendChild(artistImage);
        resultsContainer.appendChild(artistCover);
        resultsContainer.appendChild(artistInfo);

    } catch (error) {
        console.error('Error fetching artist details:', error);
    }
}

const resultsContainer = $('.artists-container');
const searchBar = $('.search-bar')

resultsContainer.on('scroll', handleScroll);
searchBar.on('input', debouncedSearch);

let isLoading = false;

function handleScroll() {
    if (!isLoading && resultsContainer.scrollTop + resultsContainer.clientHeight >= resultsContainer.scrollHeight - 32) {
        isLoading = true;
        offset += 30;
        searchArtists(currentArtistQuery, offset).finally(() => {
            isLoading = false;
        });
    }
}

function debouncedSearch() {
    const artist = this.value;
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
        if (artist) {
            offset = 0;
            searchArtists(artist, offset);
        }
    }, 500);
}
