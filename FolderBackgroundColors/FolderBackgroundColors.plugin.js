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

	async start() {
		console.log("starting FolderBackgroundColors...")
		const FoldericonSelector = "div[class*=\"expandedFolderIconWrapper\"] > svg > path";
		const FoldersSelector = "span[class*=\"expandedFolderBackground\"]"
		let Folders = await waitForElm(FoldersSelector); // Несколько бесполезно, поскольку всё равно сбивается при старте. Надо сделать выполнение main при каждой "мутации"
		let CssString;
		let FolderNumber = 0;
		let MainInterval;

		function getStyle(element) {
			if (element === null) {
				console.log("FBC GetStyle error: elements is null")
				return null;
			}
			console.log("Getting style of");
			console.log(element);
			return getComputedStyle(element, null);
		}

		function changeColorOpacity(color, newOpacity) {
			let colors = color.replaceAll(/[^\d| ]/g, '').split(" ", 3);
			return "rgba(" + colors + ", " + newOpacity + ')'
		}

		function colorize(folder, background) {
			if (folder.hasAttribute("fbc_id")) return "alreadyDone";
			FolderNumber++;
			folder.setAttribute("fbc_id", FolderNumber);
			let backgroundColor = getFolderBackground(folder)
			let cssRule = `{background-color: ${backgroundColor}!important}`
			CssString += `[FBC_id="${FolderNumber}"] ${cssRule}\n`;
			CssString += `[FBC_id="${FolderNumber}"][class*="collapsed"] {background-color:transparent!important}\n`;
			CssString += `[FBC_id="${FolderNumber}"] [class*="folder-"] ${cssRule}\n`;
		}

		function getFolderBackground(folder) {
			if (folder.className.indexOf("collapsed") >= 0) {
				return getStyle(folder.parentElement.querySelector("div[class*=\"folderIconWrapper-\"]")).backgroundColor;
			} else {
				let folderIcon = folder.nextSibling.querySelector(FoldericonSelector)
				let folderColor = getStyle(folderIcon).fill;
				if (folderColor === null) return null;

				return changeColorOpacity(folderColor, 0.4);
			}
		}

		function colorizeClosed(folder) {
			if (folder.className.indexOf("colored") >= 0) return;
			folder.className += " colored";
		}


		// Ext funcs
		function waitForElm(selector) {
			return new Promise(resolve => {
				if (document.querySelectorAll(selector)) {
					return resolve(document.querySelectorAll(selector));
				}

				const observer = new MutationObserver(mutations => {
					if (document.querySelectorAll(selector)) {
						resolve(document.querySelectorAll(selector));
						observer.disconnect();
					}
				});

				observer.observe(document.body, {
					childList: true,
					subtree: true
				});
			});
		}

		//! MAIN FUNCTION
		function main() {
			Folders = document.querySelectorAll(FoldersSelector);
			if (Folders === null) {
				//console.log("Folders: Почему ты меня не подождал? Observer: Да");
				return
			}
			let OldCss = CssString;

			for (let folder of Folders) {
				colorize(folder)
			}

			if (OldCss != CssString) {
				BdApi.injectCSS(config.info.name, CssString);
				console.log("css string:")
				console.log(CssString)
			}
		}

		MainInterval = setInterval(main,5000);

	} // Required function. Called when the plugin is activated (including after reloads)

	stop() {
		console.log("stopping FolderBackgroundColors...")
		const Folders = document.querySelectorAll("span[class*=\"expandedFolderBackground\"]");
		if (Folders == null) {
			console.log("FBC error: no folders found"); return
		}
		for(let folder of Folders) {
			folder.removeAttribute("fbc_id");
		}
		BdApi.clearCSS(config.info.name);
		clearInterval(MainInterval);
	} // Required function. Called when the plugin is deactivated

	observer(changes) {} // Optional function. Observer for the `document`. Better documentation than I can provide is found here: <https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver>
}

//NOTE: Фон папок сохраняется, возможно его можно изменить не открывая папку.
