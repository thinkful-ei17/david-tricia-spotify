'use strict';

const CLIENT_ID = 'eb6dfffda5534bb5996e872487be4321';

const getFromApi = function (endpoint, query = {}) {
  // You won't need to change anything in this function, but you will use this function 
  // to make calls to Spotify's different API endpoints. Pay close attention to this 
  // function's two parameters.

  const url = new URL(`https://api.spotify.com/v1/${endpoint}`);
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${localStorage.getItem('SPOTIFY_ACCESS_TOKEN')}`);
  headers.set('Content-Type', 'application/json');
  const requestObject = {
    headers
  };

  Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
  return fetch(url, requestObject).then(function (response) {
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    return response.json();
  });
};

let artist;
// search?query=Sting&type=artist&market=US&offset=0&limit=20
// artists/{id}/related-artists
// artists/{id}/top-tracks
// https://api.spotify.com/v1/artists/43ZHCT0cAZBISjO8DG9PnE/top-tracks?country=SE


const getArtist = function (name) {
  // Edit me!
  // (Plan to call `getFromApi()` several times over the whole exercise from here!)
  return getFromApi('search', {
    query: name,
    limit: 10,
    type: 'artist',
    market: 'US'
  }).then(item => {
    artist = item.artists.items[0];
    console.log('artist:', artist);
    return getFromApi(`artists/${artist.id}/related-artists`);
  }).then(item => {
    artist.related = item.artists;
    console.log('related artists:', artist.related);
    const arrayOfPromises = artist.related.map(item => {
      return getFromApi(`artists/${item.id}/top-tracks`, {country: 'US'});
    });
    console.log(arrayOfPromises);
    return Promise.all(arrayOfPromises);
  }).then(results => {
    console.log('results', results);
    results.forEach((item, index) => {
      artist.related[index].tracks = item.tracks;
    });
    console.log('artist', artist);
    return artist;
  }).catch(err => {
    console.error('something wrong', err);
  });
};





// =========================================================================================================
// IGNORE BELOW THIS LINE - THIS IS RELATED TO SPOTIFY AUTHENTICATION AND IS NOT NECESSARY  
// TO REVIEW FOR THIS EXERCISE
// =========================================================================================================
const login = function () {
  const AUTH_REQUEST_URL = 'https://accounts.spotify.com/authorize';
  const REDIRECT_URI = 'http://localhost:8080/auth.html';

  const query = new URLSearchParams();
  query.set('client_id', CLIENT_ID);
  query.set('response_type', 'token');
  query.set('redirect_uri', REDIRECT_URI);

  window.location = AUTH_REQUEST_URL + '?' + query.toString();
};

$(() => {
  $('#login').click(login);
});
