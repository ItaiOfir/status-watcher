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
      
      // Check if we're already in the correct status folder
      if (currentDirName === status) {
        // File is already in the correct status folder, no need to move
        return;
      }
      
      // 1. First, check if a status folder exists next to the note (in the same directory)
      const sameDirectoryStatusFolder = join(currentDir, status);
      const sameDirectoryStatusFolderExists = await this.app.vault.adapter.exists(sameDirectoryStatusFolder);
      
      // 2. If not, check if a status folder exists in the parent directory
      const parentDirectoryStatusFolder = join(parentDir, status);
      const parentDirectoryStatusFolderExists = await this.app.vault.adapter.exists(parentDirectoryStatusFolder);
      
      if (sameDirectoryStatusFolderExists) {
        // Move the file to the status folder in the same directory
        const newPath = join(sameDirectoryStatusFolder, file.name);
        await this.app.fileManager.renameFile(file, newPath);
        // new Notice(`Moved ${file.name} to ${status} folder in same directory`);
      } 
      else if (parentDirectoryStatusFolderExists) {
        // Move the file to the status folder in the parent directory
        const newPath = join(parentDirectoryStatusFolder, file.name);
        await this.app.fileManager.renameFile(file, newPath);
        // new Notice(`Moved ${file.name} to ${status} folder in parent directory`);
      } 
      else {
        // 3. Create a status folder at the same level as the note
        const newStatusFolder = join(currentDir, status);
        await this.app.vault.createFolder(newStatusFolder);
        
        // Move the file to the new status folder
        const newPath = join(newStatusFolder, file.name);
        await this.app.fileManager.renameFile(file, newPath);
        // new Notice(`Created ${status} folder and moved ${file.name} into it`);
      }
    } catch (error) {
      console.error('Error moving file:', error);
      new Notice(`Failed to move file: ${error.message}`);
    }
  }
}
