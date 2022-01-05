// Declare global variables
var username = 'ryanmcslomo';
var pwd = 'enter-password-here';
var client_id = "enter-client-id-here";
var client_secret = "enter-client-secret-here";
var access_token_url = 'https://www.reddit.com/api/v1';
var userAgent = "GoogleAppsScript/0.1 by " + username;
var base = "https://oauth.reddit.com";

/******************************************************************************************************
 * 
 * Grab saved posts from Reddit and save them in a spreadsheet
 * 
 ******************************************************************************************************/

function getSavedRedditPosts() {

  // Declare variables
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  console.log(spreadsheet.getUrl());
  var savedPostOptions = {
    headers: {
      "Authorization": "bearer " + connectRedditAPI(),
    },
  };
  var afterValue = null;
  var respJSON = {};
  var respJSONArray = [];
  var count = 0;

  //  Collect saved Reddit posts
  do {
    console.log("Getting saved Reddit posts (count: " + count + ")");
    var resp = UrlFetchApp.fetch(base + "/user/" + username + "/saved" + "?after=" + afterValue + "&count=" + count, savedPostOptions);
    var respText = resp.getContentText();
    respJSON = JSON.parse(respText);
    respJSONArray = respJSONArray.concat(respJSON.data.children);
    afterValue = respJSON.data.after;
    count += respJSON.data.dist;
  }
  while (afterValue);

  // Print to sheet
  setArraySheet(respJSONArray, username + " Saved Posts", spreadsheet);
}

/******************************************************************************************************
 * 
 * Delete saved posts from Reddit
 * 
 ******************************************************************************************************/

function deleteSavedRedditPosts() {

  // Declare variables
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(username + " Saved Posts");
  var sheetRange = sheet.getDataRange();
  var sheetRangeValues = sheetRange.getDisplayValues();
  var headerRow = sheetRangeValues[0];
  var nameHeader = headerRow.indexOf("name");
  var optionsArray = [];
  var redditToken = connectRedditAPI();

  // Create request for each post
  for (var x = 1; x < sheetRangeValues.length; x++) {
    if (sheetRangeValues[x][nameHeader]) {
      optionsArray.push({
        'url': base + "/api/unsave",
        'headers': {
          "Authorization": "bearer " + redditToken,
          "User-Agent": userAgent,
        },
        'method': 'post',
        'payload': {
          'id': sheetRangeValues[x][nameHeader] // name
        },
      });
    }
  }

  //  Delete saved Reddit posts
  UrlFetchApp.fetchAll(optionsArray);
  console.log("Deleted saved posts");
}

/******************************************************************************************************
 * 
 * Get account info from Reddit
 * 
 * @return {Object} Reddit account JSON
 * 
 ******************************************************************************************************/

function getMyRedditAccount() {

  // Declare variables
  var accountOptions = {
    headers: {
      "Authorization": "bearer " + connectRedditAPI(),
    },
  };

  //  Collect account info
  var resp = UrlFetchApp.fetch(base + "/api/v1/me", accountOptions);
  var respText = resp.getContentText();
  var respJSON = JSON.parse(respText);

  // Return the object
  return respJSON;
}

/******************************************************************************************************
 * Connect to Reddit API using credentials from https://www.reddit.com/prefs/apps
 * 
 * @return {String} a Reddit Access Token
 * 
 * Sources
 * https://stackoverflow.com/questions/67341137/how-to-request-access-token-for-reddit-on-google-apps-script
 * https://dev.to/patarapolw/reddit-mass-scraping-via-api-4eem
 * https://www.reddit.com/dev/api
 * https://github.com/rjmccallumbigl/Google-Apps-Script---Spotify-to-Sheets-Connector/blob/211a21fd19d116cd0f811b14aabed8edb89d44b6/zDeprecated/connectSpotify.gs
 * 
 ******************************************************************************************************/

function connectRedditAPI() {

  // Use the cache here so we're not constantly fetching the auth token
  var cache = CacheService.getDocumentCache();
  var cacheKey = "REDDIT_CLIENT_ID=" + client_id;
  var cached = cache.get(cacheKey);
  if (cached != null) {
    console.log("Returning cached token");
    return cached;
  }

  // Building call to API
  var data = {
    // 'grant_type': 'client_credentials', // Does not work for certain commands, e.g. returning saved items
    'grant_type': 'password', // Does not work with 2FA enabled on account
    'username': username,
    'password': pwd,
    "response_type": "code",
  };
  var options = {
    'method': 'post',
    'payload': data,
    'headers': {
      'Authorization': 'Basic ' + Utilities.base64Encode(client_id + ":" + client_secret),
      "User-Agent": userAgent,
    },
    muteHttpExceptions: true,
  };

  // Call API
  console.log("Getting new token");
  var resp = UrlFetchApp.fetch(access_token_url + "/access_token", options);
  var respJSON = JSON.parse(resp.getContentText());
  console.log(respJSON);

  // Save response
  var token = respJSON.access_token;

  // Cache for 3600 seconds
  cache.put(cacheKey, token, respJSON.expires_in);
  return token;
}
