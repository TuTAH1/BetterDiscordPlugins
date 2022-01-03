/**!
 * @name FolderBackgroundColors
 * @description Makes the background colors of the folders the same colors as folders, instead of standart one color for all folder backgrounds
 * @version 1.0.0
 * @author Титан
 * @authorId https://discordapp.com/users/282775588257792005/
 * @updateUrl https://github.com/TuTAH1/BetterDiscordPlugins/blob/main/FolderBackgroundColors/FolderBackgroundColors.js
 */

const config = {
	info: {
		name: "FolderBackgroundColors",
		description: "Makes the background colors of the folders the same colors as folders, instead of standart one color for all folder backgrounds",
		version: "1.0.0",
		author: "Титан",
		updateUrl: "https://github.com/TuTAH1/BetterDiscordPlugins/blob/main/FolderBackgroundColors/FolderBackgroundColors.js"
	}
};


module.exports = class FolderBackgroundColors {
	getName() { return config.info.name; }
	getDescription() { return config.info.description; }
	getVersion() { return config.info.version; }
	getAuthor() { return config.info.author; }

	load() {
	} // Optional function. Called when the plugin is loaded in to memory

	start() {
		let selectorPath = "div[class*=\"expandedFolderIconWrapper\"] > svg > path";
		let Folders = document.querySelectorAll("span[class*=\"expandedFolderBackground\"]");
//let ClosedFolders = все, где [class*="collapsed"]
		let i = 0;

		function getStyle(element) {
			if(window.getComputedStyle) return getComputedStyle(element, null);
			else return element.currentStyle;
		}

		function changeColorOpacity(color, newOpacity) {
			let colors = color.replaceAll(/[^\d| ]/g, '').split(" ",3);
			return "rgb(" + colors + ", " + newOpacity + ')'
		}

		function colorize(folder) {
			if (folder.className.indexOf("colored")>=0) return;
			folder.className += " colored";

			let folderIcon = folder.nextSibling.querySelector(selectorPath)
			let folderColor = getStyle(folderIcon).fill;
			let backgroundColor = changeColorOpacity(folderColor, 0.4);
			folder.style.backgroundColor = backgroundColor
			folderIcon.parentElement.parentElement.parentElement.parentElement.style.backgroundColor = backgroundColor
		}

		function colorizeClosed(folder) {
			if (folder.className.indexOf("colored")>=0) return;
			folder.className += " colored";


		}

		for(let folder of Folders) {
			if (folder.className.indexOf("collapsed")>=0) {
				folder.onclick = () => colorize(folder);
				folder.querySelector("[class*=\"closedFolderIconWrapper\"]")
			}
			else {
				colorize(folder)
			}
		}
	} // Required function. Called when the plugin is activated (including after reloads)
	stop() {
		// Will be released later
	} // Required function. Called when the plugin is deactivated

	observer(changes) {} // Optional function. Observer for the `document`. Better documentation than I can provide is found here: <https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver>
}

//NOTE: Фон папок сохраняется, возможно его можно изменить не открывая папку.
