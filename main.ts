import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import sn from "supernote-cloud-api";

// This will collect files from Supernote Cloud.
// Allow users to collect the folders and select the folder they want to sync.
// Allow users to select the directory to push SN files into.
// Command pallete command to execute the sync.
// Periodically collect files.

// TODO: Figure out how to write files using the Obsidian API.
// TODO: Figure out clean way to render and select a directory.

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	snUsername: string;
	snPassword: string;
	directoryId: string;
	obsidianDirectory: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	snUsername: "",
	snPassword: "",
	directoryId: "",
	obsidianDirectory: "supernote",
};

export default class ObsidianSupernoteCloudSync extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "supernote-cloud-sync",
			name: "Grab files from Supernote Cloud",
			callback: async () => {
				await this.getFiles();
				new Notice("Supernote Cloud files synced");
			},
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async getFiles() {
		const settings = this.settings;
		const { vault } = this.app;

		const token = await sn.login(settings.snUsername, settings.snPassword);

		if (!token) {
			new Notice("Error: Unable to login to Supercloud");
		} else {
			// Get current files in the obsidian directory
			const currentFiles = vault.getFolderByPath(
				settings.obsidianDirectory
			);
			const currentFilesNames =
				currentFiles?.children.map((file) => file.name) || [];

			// Get files from Supernote Cloud
			let files = await sn.fileList(token, settings.directoryId);

			// Filter out files that are already in the obsidian directory
			files = files.filter(
				(file) => !currentFilesNames.includes(file.fileName)
			);

			new Notice("Getting files from Supernote Cloud");
			if (files.length > 0) {
				new Notice(
					`Found ${files.length} new files from Supernote Clout, writing...`
				);
				for (const file of files) {
					// Get the Suprenote URL
					const url = await sn.fileUrl(token, file.id);
					// And fetch it.
					const fileData = await fetch(url).then((res) =>
						res.arrayBuffer()
					);

					// Create the file in Obsidian
					await vault.createBinary(
						`./${settings.obsidianDirectory}/${file.fileName}`,
						fileData
					);
				}
			} else {
				new Notice("No new files found");
			}
		}
	}
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: ObsidianSupernoteCloudSync

	constructor(app: App, plugin: ObsidianSupernoteCloudSync) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Supercloud Username")
			.setDesc("Enter your Supercloud username")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.snUsername)
					.onChange(async (value) => {
						this.plugin.settings.snUsername = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Supercloud Password")
			.setDesc("Enter your Supercloud password")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.snPassword)
					.onChange(async (value) => {
						this.plugin.settings.snPassword = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Supernote Directory ID")
			.setDesc("Enter the Supernote Cloud directory ID to sync.")
			.addText((text) =>
				text
					.setPlaceholder("Enter your Supernote directory ID")
					.setValue(this.plugin.settings.directoryId)
					.onChange(async (value) => {
						this.plugin.settings.directoryId = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Obsidian Directory")
			.setDesc("What directory do you want to push supernote files to?")
			.addText((text) =>
				text
					.setPlaceholder("Enter your Obsidian directory")
					.setValue(this.plugin.settings.obsidianDirectory)
					.onChange(async (value) => {
						this.plugin.settings.obsidianDirectory = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
