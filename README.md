# Obsidian Supernote Cloud Sync
A dead simple plugin to grab notes from Supernote Cloud and sync them to your Obsidian vault.

Set your Supernote username and password in the settings, then run the sync command to grab all the notes from Supernote Cloud and sync them to your Obsidian vault. The tricky part is specifying the directory to sync from. You need to know the ID of the directory you want to sync from. To find the directory ID, go to the Supernote Cloud website, open the developer tools to see the network request to the /query endpoint and look for the `directoryId` parameter. I'll work on making this easier in the future, but for my personal needs, I just went with this ID for simplicity.

## TODO:
- Better handling of Supernote directory IDs.
- Clean up the settings UI.
- Add a button to sync notes, hidden behind a setting.
- Add periodic syncing.

