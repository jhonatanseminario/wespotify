async function getToken() {
    const clientId = 'CLIENT_ID';
    const clientSecret = 'CLIENT_SECRET';
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

async function searchArtists(artist) {
    const token = await getToken();

    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const artistsArray = data.artists.items.map(item => ({
            name: item.name,
            imageUrl: item.images[1] ? item.images[1].url : ''
        }));
        displayResults(artistsArray);
    } catch(error) {
        console.error('Error fetching artists:', error);
    }
}

function displayResults(artistsArray) {
    const resultsContainer = document.getElementById('artists');
    resultsContainer.className = 'artists';
    if (!resultsContainer) {
        console.error('Results container not found!');
        return;
    }
    
    resultsContainer.innerHTML = '';

    artistsArray.forEach(artist => {
        const artistElement = document.createElement('div');
        artistElement.className = 'artist';

        const artistImage = document.createElement('img');
        artistImage.src = artist.imageUrl;
        artistImage.alt = artist.name;
        artistImage.className = 'artist-image';

        const artistName = document.createElement('div');
        artistName.textContent = artist.name;
        artistName.className = 'artist-name';

        artistElement.appendChild(artistImage);
        artistElement.appendChild(artistName);

        resultsContainer.appendChild(artistElement);
    });
}

document.getElementById('search-bar').addEventListener('input', function () {
    const artist = this.value;
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
        if (artist) {
            searchArtists(artist);
        }
    }, 500);
});
