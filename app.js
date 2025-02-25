require("dotenv").config();

const express = require("express");
const hbs = require("hbs");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:

// Home
app.get("/", (req, res) => {
  res.render("home");
});

// Artist search
app.get("/artist-search", (req, res) => {
  spotifyApi
    // get = req.query, use name from form
    .searchArtists(req.query.albumSearch)
    .then((data) => {
      console.log("The received data from the API: ", data.body.artists);
      // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
      // send artists to view
      // use artists property in artist-search-results
      res.render("artist-search-results", { artists: data.body.artists.items });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/albums", (req, res) => {
  res.render("albums");
});

app.get("/albums/:artistsId", (req, res) => {
  spotifyApi
    .getArtistAlbums(req.params.artistsId)
    .then((albumsData) => {
      console.log("Album information: ", albumsData.body.items);
      res.render("albums", { albumResults: albumsData.body.items });
    })
    .catch((err) => console.error("Error:", err));
});

app.get("/view-tracks/:trackId", (req, res) => {
  spotifyApi
    .getAlbumTracks(req.params.trackId, { limit: 10, offset: 1 })
    .then((trackData) => {
      console.log("Track Information: ", trackData.body.items);
      res.render("viewTracks", { tracksData: trackData.body.items });
    })
    .catch((err) => {
      console.log("Something went wrong!", err);
    });
});

app.get("/:errorOccurred", (req, res) => {
  res.send("Page not found");
});

// Run server
app.listen(3000, () => {
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊");
});