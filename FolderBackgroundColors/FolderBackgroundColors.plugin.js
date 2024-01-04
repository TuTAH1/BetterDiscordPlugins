/**!
 * @name FolderBackgroundColors
 * @description Makes the background colors of the folders the same colors as folders, instead of standart one color for all folder backgrounds
 * @version 1.1.3.2
 * @author Титан
 * @authorId https://discordapp.com/users/282775588257792005/
 * @authorLink http://steamcommunity.com/id/TuTAH_1/
 * @updateUrl https://raw.githubusercontent.com/TuTAH1/BetterDiscordPlugins/main/FolderBackgroundColors/FolderBackgroundColors.js
 */

const config = {
	info: {
		name: "FolderBackgroundColors",
		description: "Makes the background colors of the folders the same colors as folders, instead of standart one color for all folder backgrounds",
		version: "1.1.3.2",
		author: "Титан",
		authorId: "https://discordapp.com/users/282775588257792005/",
		authorLink: "http://steamcommunity.com/id/TuTAH_1/",
		updateUrl: "https://raw.githubusercontent.com/TuTAH1/BetterDiscordPlugins/main/FolderBackgroundColors/FolderBackgroundColors.js"
	}
};

module.exports = class FolderBackgroundColors {
	getName() { return config.info.name; }
	getDescription() { return config.info.description; }
	getVersion() { return config.info.version; }
	getAuthor() { return config.info.author; }

	async start() {
		const logging = true;

		function log(message) {
			if (logging) {
				if (typeof message === "string") {
					console.log(`%c[FolderBackgroundColors] %c${message}`, "color: #23a3df; font-weight: bold;", "");
				} else {
					console.log(`%c[FolderBackgroundColors]`, "color: #23a3df; font-weight: bold;");
					console.log(message);
				}
			}
		}

		log("starting FolderBackgroundColors...")
		const FoldericonSelector = "div[class*=\"expandedFolderIconWrapper\"] > svg > path";
		const FoldersSelector = "span[class*=\"expandedFolderBackground\"]";
		let CssString = ""; //test
		let FolderNumber = 0;
		let observerFoundFolders = false; // костыль for this ugly disguasting MutationObserver

		function handleMutation(mutationsList, observer) {
			for (let mutation of mutationsList) {
				//: If element is added/removed or folder attributes changed

				if ((mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) || mutation.type === 'attributes') {
					let Folders = document.querySelectorAll(FoldersSelector);
					if (Folders == null && Folders.length <= 0) continue;
					let leftPanel = Folders[0].parentElement.parentElement;
					if (leftPanel.contains(mutation.target)) {
						// if (!observerFoundFolders) { //set observer to observe only folders
						// 	observer.disconnect();
						// 	observer = new MutationObserver(handleMutation);
						// 	observer.observe(leftPanel, { childList: true, subtree: true })
						// }
						main(Folders); // plugin work
						// if (observerFoundFolders) { //set observer to observe all body
						// 	observer.disconnect();
						// 	observer = new MutationObserver(handleMutation);
						// 	observer.observe(document.body, { childList: true, subtree: true })
						// }
					}
					
				}
			}
		}

		this.observer = new MutationObserver(handleMutation);
		this.observer.observe(document.body, { childList: true, subtree: true });


		//! MAIN FUNCTION
		function main(Folders) {
			let OldCss = CssString;

			//: Add css classes for all folders FBC_id="i"
			for (let folder of Folders) {
				colorize(folder)
			}

			//: Inject css for those classes (looks like [FBC_id="*"] [class*="folder-"] {background-color: *})
			if (OldCss != CssString) {
				BdApi.injectCSS(config.info.name, CssString);
				log("css string:")
				log(CssString)
			}
		}

		function colorize(folder, background) {

			let fbc_id = folder.getAttribute("fbc_id");
			if (fbc_id != null) { //: If applied, check if color changed
				// //: Actual folder color
				// let backgroundColor = getFolderBackground(folder)
				// if (backgroundColor === null) return;
				// //: Color stored in CssString
				// let cssBackgroundColor = CssString.slice()
				// 	.Tslice(`[FBC_id="${fbc_id}"] {`, "!important}", false, false, false, false, false)
				// log("cssBackgroundColor: " + cssBackgroundColor)


			} else {
				let backgroundColor = getFolderBackground(folder)
				if (backgroundColor === null || backgroundColor === 'rgba(0, 0, 0, 0)') return;

				FolderNumber++;
				folder.setAttribute("fbc_id", FolderNumber); //: Add css attribute
				let cssRule = `{background-color: ${backgroundColor}!important}`  //: Create css rule (set color) for this attribute
				CssString += `[FBC_id="${FolderNumber}"][class*="expandedFolderBackground"]:not([class*="collapsed"] ) ${cssRule}\n`;
			}
		}

		function getFolderBackground(folder) {
			if (folder.className.indexOf("collapsed") >= 0) {
				return getStyle(folder.parentElement.querySelector("div[class*=\"folderIconWrapper_\"]")).backgroundColor;
			} else {
				let folderIcon = folder.nextSibling.querySelector(FoldericonSelector) //svg
				if (folderIcon === null) { //: It's custom BetterFolder icon
					return null; //: remove after adding support for custom icons
				}

				let folderColor = getStyle(folderIcon).color;
				if (folderColor === null) return null;

				return changeColorOpacity(folderColor, 0.4);
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

	} // Required function. Called when the plugin is activated (including after reloads)

	stop() {
		let logging = false;

		function log(message) {
			if (logging) console.log("[FolderBackgroundColors] " + message);
		}

		log("stopping FolderBackgroundColors...")
		const Folders = document.querySelectorAll(`span[class*="expandedFolderBackground"]`);
		if (Folders == null) {
			log("FBC error: no folders found"); return
		}
		for(let folder of Folders) {
			folder.removeAttribute("fbc_id");
		}
		this.observer.disconnect();
		BdApi.clearCSS(config.info.name);
	} // Required function. Called when the plugin is deactivated

	observer(changes) {} // Optional function. Observer for the `document`. Better documentation than I can provide is found here: <https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver>
}

//NOTE: Фон папок сохраняется, возможно его можно изменить не открывая папку.
