/******************************************************************************************************
 * 
 * Add saved posts from Reddit to an instance of Jdownloader from Google Drive. Names the file based on
 * the Reddit title, subreddit, and author. Also attempts to attach the correct file extension.
 * 
 * Steps (prereq: run getSavedRedditPosts() to populate Google Sheets with your Saved images/videos)
 * 1. Install JDownloader.
 * 2. Install the Google Drive application for your computer.
 * 3. Create a folder in Google Drive called JDownloader. Configure this folder to always be available offline on your computer (go up a level, right click on JDownloader folder -> Offline access -> Available offline).
 * 4. Create a file called "GAS.crawljob". The name doesn't matter, but the extension does. 
 * 5. Save the ID of this file in var crawljobID. It is the long string in the URL: https://drive.google.com/open?id={ID}. 
 * 5. Create a subfolder in the JDownloader folder called Monitor. Save the ID of this folder in var monitoringFolderID.
 * 6. Set the name of your sheet in var sheet.
 * 7. [Optional] Specify your download folder in var downloadFolder.
 * 8. In JDownloader, activate the Folder Watch extension in Settings.
 * 9. Set your FolderWatch: Folders to your Google Drive folder like so: [ "G:\\My Drive\\Jdownloader\\monitor" ] (the default is %homepath%\AppData\Local\JDownloader 2.0\folderwatch).
 * 10. Your primary crawljob file will be in the Jdownloader folder. When you run this script, it will update the file and save a copy to the monitor subfolder, which will be processed by local JDownloader.
 * 
 * Sources
 * https://support.jdownloader.org/Knowledgebase/Article/View/folder-watch-basic-usage
 * 
 ******************************************************************************************************/

function jdownloader() {

  // Declare variables
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // var sheet = spreadsheet.getActiveSheet();
  var sheet = spreadsheet.getSheetByName(USERNAME + " Saved Posts");
  var sheetRange = sheet.getDataRange();
  var sheetRangeValues = sheetRange.getDisplayValues();
  var headerRow = sheetRangeValues[0];
  var nameHeader = headerRow.indexOf("title");
  var urlHeader = headerRow.indexOf("url");
  var subredditHeader = headerRow.indexOf("subreddit");
  var authorHeader = headerRow.indexOf("author");
  var crawljobID = "ID";
  var crawljobFile = DriveApp.getFileById(crawljobID);
  var monitoringFolderID = "ID";
  var monitoringFolder = DriveApp.getFolderById(monitoringFolderID);
  var downloadFolder = "F:\\wallpapers";
  var downloadArray = [];
  var fileFormat = "";
  var url = "";
  var title = "";
  var packageName = "";
  var fileExtension = "";
  var fileName = "";
  var subreddit = "";
  var author = "";

  // Get possible image and video file extension types
  var imageResponse = UrlFetchApp.fetch("https://raw.githubusercontent.com/rjmccallumbigl/image-extensions/master/image-extensions.json");
  var imageResponseText = imageResponse.getContentText();
  var imageResponseTextJSON = JSON.parse(imageResponseText);

  var videoResponse = UrlFetchApp.fetch("https://raw.githubusercontent.com/rjmccallumbigl/video-extensions-list/master/video-extensions.json");
  var videoResponseText = videoResponse.getContentText();
  var videoResponseTextJSON = JSON.parse(videoResponseText);

  // Push to crawljob
  for (var x = 1; x < sheetRangeValues.length; x++) {

    url = "";
    title = "";
    subreddit = "";
    author = "";
    fileFormat = "";
    fileExtension = "";

    if (sheetRangeValues[x][urlHeader]) {
      url = sheetRangeValues[x][urlHeader];
      title = sheetRangeValues[x][nameHeader];
      subreddit = sheetRangeValues[x][subredditHeader];
      author = sheetRangeValues[x][authorHeader];
      fileExtension = url.substring(url.lastIndexOf('.') + 1);

      // Determine file format, include source information
      if (url.indexOf("gfycat") > -1 || url.indexOf("redgifs") > -1) {
        fileFormat = "mp4";
        fileName = "Reddit - " + subreddit + " by " + author + " - " + title + "." + fileFormat;
        packageName = "";
        // Add vids to root folder
      } else if (videoResponseTextJSON.includes(fileExtension)) {
        fileFormat = fileExtension;
        fileName = "Reddit - " + subreddit + " by " + author + " - " + title + "." + fileFormat;
        packageName = "";
        // Add pics to a picture subfolder (designated by the Jdownloader package)
      } else if (imageResponseTextJSON.includes(fileExtension)) {
        fileFormat = fileExtension;
        fileName = "Reddit - " + subreddit + " by " + author + " - " + title + "." + fileFormat;
        packageName = "pics";
        // Otherwise let JDownloader handle it
      } else {
        fileName = "";
        packageName = "";
      }

      // Create array for crawljob
      downloadArray.push({
        "enabled": "TRUE",
        "text": url, // url
        "packageName": packageName,
        "filename": fileName.replace(/[\uD800-\uDFFF]/gi, ""),  // sanitize to remove any emojis
        "autoConfirm": "TRUE",
        "autoStart": "TRUE",
        "forcedStart": "TRUE",
        "downloadFolder": downloadFolder,
        "overwritePackagizerEnabled": false
      })
    }
  }

  // Save to Google Drive
  crawljobFile.setContent(JSON.stringify(downloadArray));

  // Make a copy that will get processed by JDownloader on my local computer
  crawljobFile.makeCopy(monitoringFolder);
}
