/******************************************************************************************************
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

  //  Capture players from returned data
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