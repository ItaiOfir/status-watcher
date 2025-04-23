# Status Watcher Plugin for Obsidian

## Overview

Status Watcher is an Obsidian plugin that automatically organizes your notes based on their status frontmatter property. When the status of a note changes (e.g., from "open" to "in progress"), the plugin will move the note to the corresponding status folder.

## Features

- **Automatic Note Organization**: Moves notes between folders based on their status frontmatter
- **Intelligent Folder Detection**: Automatically identifies appropriate locations for status-based folders
- **Dynamic Folder Creation**: Creates missing status folders as needed

## How It Works

1. When you change a note's status in the frontmatter (YAML metadata at the top of the file), the plugin detects this change
2. The plugin looks for a folder with the same name as the new status value
3. If the folder exists, the note is moved there
4. If no appropriate folder exists, one is created and the note is moved to it

## Setup

### Requirements

- Obsidian v0.9.7 or higher

### Installation

1. Download and extract the release ZIP to your Obsidian plugins folder: `.obsidian/plugins/`
2. Enable the plugin in Obsidian's settings under "Community Plugins"

## Usage

### Adding Status to Notes

Add a status property to your note's frontmatter:

```yaml
---
title: My Task
status: open
---
```

### Folder Structure

The plugin works with any folder structure. Here are some common patterns:

#### Pattern 1: Status subfolders

```
tasks/
  open/
  in progress/
  in review/
  done/
```

#### Pattern 2: Status-specific notes in content folders

```
projects/
  project1/
    open/
    in progress/
    done/
```

### Changing Status

To move a note between status folders, simply edit the status in the frontmatter:

```yaml
---
title: My Task
status: in progress  # Changed from "open" to "in progress"
---
```

The plugin will automatically move the note to the "in progress" folder.

## Complementary Plugins

### Kanban Status Updater

This plugin pairs really well with the [Kanban Status Updater plugin](https://github.com/ankit-kapur/obsidian-kanban-status-updater-plugin), which updates the `status` frontmatter property when you move cards between columns in Kanban boards. 

Using these plugins together creates a powerful workflow:
1. Move a card in your Kanban board → Kanban Status Updater changes the status in frontmatter
2. Status change in frontmatter → Status Watcher moves the note to the appropriate folder

This combination keeps both your Kanban boards and folder structure perfectly in sync with your workflow.

## Troubleshooting

- **Note not moving**: Ensure the status is correctly set in the frontmatter and that you're saving the file after changes
- **Error notifications**: Check the console logs for more detailed error information

## License

This project is licensed under the MIT License - see the LICENSE file for details.