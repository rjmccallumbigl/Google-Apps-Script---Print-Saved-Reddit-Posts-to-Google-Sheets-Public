/******************************************************************************************************
 * 
 * Convert array into sheet
 * 
 * @param {Array} array The array that we need to map to a sheet
 * @param {String} sheetName The name of the sheet the array is being mapped to
 * @param {Object} spreadsheet The source spreadsheet
 * 
 ******************************************************************************************************/

function setArraySheet(array, sheetName, spreadsheet) {

  // Declare variables
  var spreadsheet = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  var keyArray = [];
  var memberArray = [];
  var sheetRange = "";

  // Define an array of all the returned object's keys to act as the Header Row
  keyArray.length = 0;
  keyArray = Object.keys(array[0].data);
  memberArray.length = 0;
  memberArray.push(keyArray);

  //  Capture members from returned data
  for (var x = 0; x < array.length; x++) {
    memberArray.push(keyArray.map(function (key) {
      return array[x].data[key];
    }));
  }

  // Select or create the sheet
  try {
    sheet = spreadsheet.insertSheet(sheetName);
  } catch (e) {
    sheet = spreadsheet.getSheetByName(sheetName).clear();
  }

  // Set values  
  sheetRange = sheet.getRange(1, 1, memberArray.length, memberArray[0].length);
  sheetRange.setValues(memberArray);

}

/******************************************************************************************************
 * 
 * Delete rows with URLS after sending to JDownloader so the only rows left in the spreadsheet are text posts I should read.
 * 
 ******************************************************************************************************/
function deleteRowsWithURLs() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getActiveSheet();
  var sheetName = sheet.getName();
  var sheet = spreadsheet.getSheetByName(sheetName);
  var sheetRange = sheet.getDataRange();
  var sheetRangeValues = sheetRange.getDisplayValues();
  var headerRow = sheetRangeValues[0];
var urlHeader = headerRow.indexOf("url");
  var linkHeader = headerRow.indexOf("permalink");
  var newSheetContents = [];
  newSheetContents.push(headerRow);

  // Push to new sheet contents if a text post with no link
  for (var x = 1; x < sheetRangeValues.length; x++) {
    if (sheetRangeValues[x][urlHeader] == "") {
      sheetRangeValues[x][linkHeader] = "https://old.reddit.com" + sheetRangeValues[x][linkHeader];
      newSheetContents.push(sheetRangeValues[x]);
      console.log("https://old.reddit.com" + sheetRangeValues[x][linkHeader]);
    }
  }
  // Select and clear the sheet
  sheet.clear();

  // Set values  
  sheetRange = sheet.getRange(1, 1, newSheetContents.length, newSheetContents[0].length);
  sheetRange.setValues(newSheetContents);
}

/*********************************************************************************************************
*
* Update Google Sheet menu allowing script to be run from the spreadsheet.
*
*********************************************************************************************************/

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Functions')
    .addItem('Grab Saved Posts From Reddit', 'getSavedRedditPosts')
    .addItem('Delete Saved Posts From Reddit', 'deleteSavedRedditPosts')
    .addItem('Pass to jDownloader from Google Drive', 'jdownloader')
    .addItem("Delete Links and Leave Posts for Reading", "deleteRowsWithURLs")
    .addToUi();
}