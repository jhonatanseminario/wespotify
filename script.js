async function getToken() {
    const clientId = '';
    const clientSecret = '';
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
        const artistsArray = data.artists.items.map(item => item.name);
        console.log(artistsArray);
    } catch(error) {
        console.error('Error fetching artists:', error);
    }
}

searchArtists('Kanye West')
