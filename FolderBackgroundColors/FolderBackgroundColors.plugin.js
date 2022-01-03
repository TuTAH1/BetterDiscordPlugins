/**!
 * @name FolderBackgroundColors
 * @description Makes the background colors of the folders the same colors as folders, instead of standart one color for all folder backgrounds
 * @version 1.0.0
 * @author Титан
 * @authorId https://discordapp.com/users/282775588257792005/
 * @authorLink http://steamcommunity.com/id/TuTAH_1/
 * @updateUrl https://raw.githubusercontent.com/TuTAH1/BetterDiscordPlugins/main/FolderBackgroundColors/FolderBackgroundColors.js
 */

const config = {
	info: {
		name: "FolderBackgroundColors",
		description: "Makes the background colors of the folders the same colors as folders, instead of standart one color for all folder backgrounds",
		version: "1.0.0",
		author: "Титан",
		updateUrl: "https://raw.githubusercontent.com/TuTAH1/BetterDiscordPlugins/main/FolderBackgroundColors/FolderBackgroundColors.js"
	}
};


module.exports = class FolderBackgroundColors {
	getName() { return config.info.name; }
	getDescription() { return config.info.description; }
	getVersion() { return config.info.version; }
	getAuthor() { return config.info.author; }

	start() {
		console.log("starting FolderBackgroundColors...")
		const selectorPath = "div[class*=\"expandedFolderIconWrapper\"] > svg > path";
		let Folders = document.querySelectorAll("span[class*=\"expandedFolderBackground\"]");
//let ClosedFolders = все, где [class*="collapsed"]
		let cssString = "";
		let i =0;

		function getStyle(element) {
			console.log("Getting style of");
			console.log(element);
			return getComputedStyle(element, null);
		}

		function changeColorOpacity(color, newOpacity) {
			let colors = color.replaceAll(/[^\d| ]/g, '').split(" ",3);
			return "rgba(" + colors + ", " + newOpacity + ')'
		}

		function colorize(folder, background) {
			if (folder.hasAttribute("fbc_id")) return;
			i++;
			folder.setAttribute("fbc_id",i);
			let backgroundColor = getFolderBackground(folder)
			let cssRule = `{background-color: ${backgroundColor}!important}`
			cssString+=`[FBC_id="${i}"] ${cssRule}\n`;
			cssString+=`[FBC_id="${i}"][class*="collapsed"] ${cssRule}\n`;
			//folder.style.backgroundColor = backgroundColor //apply background to whole folder background
			cssString+=`[FBC_id="${i}"] [class*="folder-"] ${cssRule}\n`;
			//TODO: cssString+= css, который изменяет цвет иконки папки
			//folderIcon.parentElement.parentElement.parentElement.parentElement.style.backgroundColor = backgroundColor
		}

		function getFolderBackground(folder) {
			if (folder.className.indexOf("collapsed")>=0) {
				return getStyle(folder.parentElement.querySelector("div[class*=\"folderIconWrapper-\"]")).backgroundColor;
			} else {
				let folderIcon = folder.nextSibling.querySelector(selectorPath)
				let folderColor = getStyle(folderIcon).fill;
				return  changeColorOpacity(folderColor, 0.4);
			}
		}

		function colorizeClosed(folder) {
			if (folder.className.indexOf("colored")>=0) return;
			folder.className += " colored";


		}

		//! MAIN FUNCTION
		for(let folder of Folders) {
			colorize(folder)
		}
		BdApi.injectCSS(config.info.name,cssString);
		console.log("css string:")
		console.log(cssString)

	} // Required function. Called when the plugin is activated (including after reloads)

	stop() {
		console.log("stopping FolderBackgroundColors...")
		const Folders = document.querySelectorAll("span[class*=\"expandedFolderBackground\"]");
		for(let folder of Folders) {
			folder.removeAttribute("fbc_id");
		}
		BdApi.clearCSS(config.info.name);
		// Will be released later
	} // Required function. Called when the plugin is deactivated

	observer(changes) {} // Optional function. Observer for the `document`. Better documentation than I can provide is found here: <https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver>
}

//NOTE: Фон папок сохраняется, возможно его можно изменить не открывая папку.
