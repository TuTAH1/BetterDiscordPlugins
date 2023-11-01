/**!
 * @name FolderBackgroundColors
 * @description Makes the background colors of the folders the same colors as folders, instead of standart one color for all folder backgrounds
 * @version 1.1.0
 * @author Титан
 * @authorId https://discordapp.com/users/282775588257792005/
 * @authorLink http://steamcommunity.com/id/TuTAH_1/
 * @updateUrl https://raw.githubusercontent.com/TuTAH1/BetterDiscordPlugins/main/FolderBackgroundColors/FolderBackgroundColors.js
 */

const config = {
	info: {
		name: "FolderBackgroundColors",
		description: "Makes the background colors of the folders the same colors as folders, instead of standart one color for all folder backgrounds",
		version: "1.1.0",
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
		let logging = true;

		function log(message) {
			if (logging) console.log(message);
		}

		log("starting FolderBackgroundColors...")
		const FoldericonSelector = "div[class*=\"expandedFolderIconWrapper\"] > svg > path";
		const FoldersSelector = "span[class*=\"expandedFolderBackground\"]";
		let CssString;
		let FolderNumber = 0;
		let observerFoundFolders = false; // костыль for this ugly disguasting MutationObserver

		function handleMutation(mutationsList, observer) {
			for (let mutation of mutationsList) {
				if (mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
					let Folders = document.querySelectorAll(FoldersSelector);
					if (Folders !== null) {
						if (!observerFoundFolders) { //set observer to observe only folders
							observer.disconnect();
							observer = new MutationObserver(handleMutation);
							observer.observe(Folders[0].parentElement.parentElement, { childList: true, subtree: true })
						}
						main(Folders); // plugin work
					} else if (observerFoundFolders) { //set observer to observe all body
						observer.disconnect();
						observer = new MutationObserver(handleMutation);
						observer.observe(document.body, { childList: true, subtree: true })
					}
				}
			}
		}

		const observer = new MutationObserver(handleMutation);
		observer.observe(document.body, { childList: true, subtree: true });


		//! MAIN FUNCTION
		function main(Folders) {
			let OldCss = CssString;

			for (let folder of Folders) {
				colorize(folder)
			}

			if (OldCss != CssString) {
				BdApi.injectCSS(config.info.name, CssString);
				log("css string:")
				log(CssString)
			}
		}

		function getStyle(element) {
			if (element === null) {
				log("FBC GetStyle error: elements is null")
				return null;
			}
			log("Getting style of");
			log(element);
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
				return getStyle(folder.parentElement.querySelector("div[class*=\"folderIconWrapper_\"]")).backgroundColor;
			} else {
				let folderIcon = folder.nextSibling.querySelector(FoldericonSelector) //svg
				let folderColor = getStyle(folderIcon).color;
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

	} // Required function. Called when the plugin is activated (including after reloads)

	stop() {
		let logging = true;

		function log(message) {
			if (logging) console.log(message);
		}

		log("stopping FolderBackgroundColors...")
		const Folders = document.querySelectorAll("span[class*=\"expandedFolderBackground\"]");
		if (Folders == null) {
			log("FBC error: no folders found"); return
		}
		for(let folder of Folders) {
			folder.removeAttribute("fbc_id");
		}
		BdApi.clearCSS(config.info.name);
	} // Required function. Called when the plugin is deactivated

	observer(changes) {} // Optional function. Observer for the `document`. Better documentation than I can provide is found here: <https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver>
}

//NOTE: Фон папок сохраняется, возможно его можно изменить не открывая папку.
