require("dotenv").config();
const express = require("express");
const morgan = require('morgan');
const cors = require("cors");
const { createServer } = require("http");
const { auth, requiredScopes } = require("express-oauth2-jwt-bearer");
const {
  checkUrl,
  APP_URL, // Public URL for this app
  ISSUER_BASE_URL, // Auth0 Tenant Url
  AUDIENCE, // Auth0 API Audience List
  PORT,
} = require("./env-config");

const app = express();

app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
  stream: logger.stream
}));

// Used to normalize URL
app.use(checkUrl());

app.use(
  cors({
    origin: "*",
    methods: "GET",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

const geocode = [
  {
    lat: 47.6178819,
    lng: -122.194041
  }
];

const reverse_geocode = [
  { step: 1, action: 'Turn left' },
  { step: 2, action: 'Turn right' },
  { step: 3, action: 'Finish' }
];

const directions = [
  {
    street: '10900 NE 8th Street',
    city: 'Bellevue',
    state: 'Washington'
  }
];

/****************************
 * This method is here to allow a
 * successful response on root requests.
 * This stops content security policy
 * from preventing the user to make
 * requests via the browsers console.
 ****************************/
app.get("/", (req, res) => {
  res.status(200).end("OK");
});
/****************************/

app.get("/api", (req, res) => {
  if (req.user) {
    logger.debug('Current user: ' + req.user.sub + ' (scope=' + (req.user.scope || 'N/A') + ')');
  }
});

// 👆 public routes above 👆
app.use(auth());
// 👇 private routes below 👇

app.get("/api/location/geocode", requiredScopes("read:geocode"), (req, res) => {
  res.send(geocode);
});

app.get("/api/location/reverse-geocode", requiredScopes("read:reverse-geocode"), (req, res) => {
  res.send(reverse_geocode);
});

app.get("/api/location/directions", requiredScopes("read:directions"), (req, res) => {
  res.send(directions);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    message: err.message,
  });
});

createServer(app).listen(PORT, () => {
  logger.info(`Worldmappers API (Resource Server) listening on: ${APP_URL}`);
});