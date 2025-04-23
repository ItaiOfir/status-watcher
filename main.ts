import { Plugin, TFile, Notice } from 'obsidian';
import { dirname, join, basename } from 'path';

export default class StatusWatcher extends Plugin {
  async onload() {
    this.app.metadataCache.on("changed", async (file) => {
      if (!(file instanceof TFile) || file.extension !== "md") return;

      const metadata = this.app.metadataCache.getFileCache(file);
      const frontmatter = metadata?.frontmatter;

      if (!frontmatter || !frontmatter.status) return;

      const status = frontmatter.status.toLowerCase();

      // Log the status change
      // new Notice(`Status changed to: ${status}`);
      // console.log(`Status changed in ${file.path}: ${status}`);
      
      // Try to move the file to a subfolder with the status name
      await this.moveFileToStatusFolder(file, status);
    })
  }
  
  async moveFileToStatusFolder(file: TFile, status: string) {
    try {
      // Get the directory where the file currently resides
      const currentDir = dirname(file.path);
      const parentDir = dirname(currentDir);
      
      // Current directory name (might be a status name)
      const currentDirName = basename(currentDir);
      
      // First check if file is in what might be a status folder
      // The logic here is: if file is in a folder and another status folder exists adjacent to it,
      // then this is likely the pattern we want to follow
      const newStatusFolderInParent = join(parentDir, status);
      const parentStatusFolderExists = await this.app.vault.adapter.exists(newStatusFolderInParent);
      
      // Check if there are any other possible status folders in the parent directory
      // This helps us determine if we should create a new status folder at the parent level
      let shouldCreateInParent = false;
      
      if (currentDirName !== status) { // Don't check if we're already in the correct status folder
        // Look for any adjacent folders that might be status folders (besides the current one)
        try {
          const parentContents = await this.app.vault.adapter.list(parentDir);
          // If there's at least one folder in the parent directory (besides the current one),
          // we'll assume we should create new status folders at this level
          if (parentContents && parentContents.folders) {
            const otherFolders = parentContents.folders.filter(folder => 
              basename(folder) !== currentDirName);
            shouldCreateInParent = otherFolders.length > 0;
          }
        } catch (err) {
          console.log("Error checking parent directory contents:", err);
        }
      }
      
      if ((parentStatusFolderExists || shouldCreateInParent) && currentDirName !== status) {
        // File is likely in a status folder and needs to move to an adjacent status folder
        // or we've detected other status folders and should create a new one at this level
        
        if (!parentStatusFolderExists) {
          // Create the new status folder if it doesn't exist
          await this.app.vault.createFolder(newStatusFolderInParent);
          // new Notice(`Created new status folder: ${status}`);
        }
        
        const newPath = join(newStatusFolderInParent, file.name);
        await this.app.fileManager.renameFile(file, newPath);
        // new Notice(`Moved ${file.name} from ${currentDirName} to ${status} folder`);
      } else {
        // If we're not in what appears to be a status folder structure, 
        // check for a status subfolder in the current directory
        const statusFolder = join(currentDir, status);
        const statusFolderExists = await this.app.vault.adapter.exists(statusFolder);
        
        if (statusFolderExists) {
          // Move the file to the existing status subfolder
          const newPath = join(statusFolder, file.name);
          await this.app.fileManager.renameFile(file, newPath);
          // new Notice(`Moved ${file.name} to ${status} folder`);
        } else {
          // Create a new status subfolder and move the file there
          await this.app.vault.createFolder(statusFolder);
          const newPath = join(statusFolder, file.name);
          await this.app.fileManager.renameFile(file, newPath);
          // new Notice(`Created ${status} folder and moved ${file.name} into it`);
        }
      }
    } catch (error) {
      console.error('Error moving file:', error);
      new Notice(`Failed to move file: ${error.message}`);
    }
  }
}
