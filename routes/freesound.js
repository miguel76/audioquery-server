const express = require('express'),
      fs = require('fs'),
      path = require('path'),
      https = require('https'),
      _ = require('lodash'),
      querystring = require('querystring');;

const router = express.Router();

const freesoundHost = 'freesound.org';
const freesoundApiPrefix = '/apiv2';
const freesoundApiToken = process.env.FREESOUND_KEY;

const stringFromQuery = (queryObj) => {
  const queryStr = querystring.stringify(queryObj);
  return queryStr ? '?' + queryStr : '';
};

router.all('*', (req, resp, next) => {
  var req2 = https.request({
    protocol: 'https:', host: freesoundHost,
    path:
      freesoundApiPrefix + req.url +
      stringFromQuery(_.extend(req.query, {token: freesoundApiToken})),
    method: req.method, headers: _.extend(req.headers, {host: freesoundHost})
  }, (resp2) => {
    resp.writeHead(resp2.statusCode, resp2.headers);
    resp2.on('data', function (d) { resp.write(d); });
    resp2.on('end', function () { resp.end(); });
  });
  req2.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    next(e);
  });
  req.on('data', (d) => req2.write(d));
  req.on('end', () => { req2.end(); });

});

module.exports = router;
