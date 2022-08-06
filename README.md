# Google-Apps-Script---Print-Saved-Reddit-Posts-to-Google-Sheets-Public

Add saved posts from Reddit to an instance of Jdownloader from Google Drive. Names the file based on the Reddit title, subreddit, and author. Also attempts to attach the correct file extension.

Steps (prereq: run getSavedRedditPosts() to populate Google Sheets with your Saved images/videos)

1. Install JDownloader.
2. Install the Google Drive application for your computer.
3. Create a folder in Google Drive called JDownloader. Configure this folder to always be available offline on your computer (go up a level, right click on JDownloader folder -> Offline access -> Available offline).
4. Create a file called "GAS.crawljob". The name doesn't matter, but the extension does.
5. Save the ID of this file in var crawljobID. It is the long string in the URL: https://drive.google.com/open?id={ID}.
6. Create a subfolder in the JDownloader folder called Monitor. Save the ID of this folder in var monitoringFolderID.
7. Set the name of your sheet in var sheet.
8. [Optional] Specify your download folder in var downloadFolder.
9. In JDownloader, activate the Folder Watch extension in Settings.
10. Set your FolderWatch: Folders to your Google Drive folder like so: [ "G:\\My Drive\\Jdownloader\\monitor" ] (the default is %homepath%\AppData\Local\JDownloader 2.0\folderwatch).
11. Your primary crawljob file will be in the Jdownloader folder. When you run this script, it will update the file and save a copy to the monitor subfolder, which will be processed by local JDownloader.

## Sources

https://support.jdownloader.org/Knowledgebase/Article/View/folder-watch-basic-usage
