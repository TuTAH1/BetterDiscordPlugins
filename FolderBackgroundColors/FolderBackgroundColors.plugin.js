/**!
 * @name FolderBackgroundColors
 * @description Makes the background colors of the folders the same colors as folders, instead of standart one color for all folder backgrounds
 * @version 1.1.2.2
 * @author Титан
 * @authorId https://discordapp.com/users/282775588257792005/
 * @authorLink http://steamcommunity.com/id/TuTAH_1/
 * @updateUrl https://raw.githubusercontent.com/TuTAH1/BetterDiscordPlugins/main/FolderBackgroundColors/FolderBackgroundColors.js
 */

const config = {
	info: {
		name: "FolderBackgroundColors",
		description: "Makes the background colors of the folders the same colors as folders, instead of standart one color for all folder backgrounds",
		version: "1.1.2.2",
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
					let leftPanel = Folders[0].parentElement.parentElement
					if (Folders !== null && Folders.length > 0) {
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
				if (backgroundColor === null) return;

				FolderNumber++;
				folder.setAttribute("fbc_id", FolderNumber); //: Add css attribute
				let cssRule = `{background-color: ${backgroundColor}!important}`  //: Create css rule (set color) for this attribute
				CssString += `[FBC_id="${FolderNumber}"] ${cssRule}\n`; //: Folder background color
				CssString += `[FBC_id="${FolderNumber}"][class*="collapsed"] {background-color:transparent!important}\n`; //: I don't remember why I added this
				CssString += `[FBC_id="${FolderNumber}"][class*="expandedFolderBackground"] ${cssRule}\n`;
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


		//! Part of Titanium.js (my lib)

		if (!String.prototype.isNullOrEmpty) {
			String.prototype.isNullOrEmpty = function () {
				return (this === null || this === undefined || this === '');
			};
		}

		function swap(array, aIndex, bIndex) {
			var temp = array[aIndex];
			array[aIndex] = array[bIndex];
			array[bIndex] = temp;
		}

		if (!String.prototype.Tslice) {
			String.prototype.Tslice = function (Start, End, AlwaysReturnString = false, LastStart = false, LastEnd = true, IncludeStart = false, IncludeEnd = false) {
				if (this.isNullOrEmpty())
					if (AlwaysReturnString)
						return null;
					else
						throw new Error("String is null or empty");

				let start;
				let end;
				let BasicSlice = (typeof Start) === "number" && (typeof End) === "number";
				let result = this;

				switch (typeof Start) {
					case "number":
						start = Start;
						if (start < 0) start = this.length + start; //: count from end if negative
						if (start < 0 || start >= this.length)
							if (AlwaysReturnString)
								start = 0;
							else
								return null;
						break;
					case "string":
						start = LastStart ? this.lastIndexOf(Start) : this.indexOf(Start);
						if (start < 0) start = 0;
						if (IncludeStart) start += Start.length;
						break;
					case "object":
						if (Start instanceof RegExp) {
							let match = LastStart ? Start.exec(this)[array.length - 1] : Start.exec(this)[0];
							start = match.index >= 0 ?
								(match.index + (IncludeStart ? 0 : match[0].length)) : 0;
						} else if (Start instanceof Array && Start.every(x => typeof x == "function")) {
							start = Start.length > 0 ?
								this.indexOfT({Start, IndexOfEnd: !IncludeStart, RightDirection: !LastStart}) : 0;
							if (start < 0) start = 0;
						} else
							throw new Error("Type of Start is not supported");
						break;
					default:
						throw new Error("Type of Start is not supported");
				}

				if (!BasicSlice)
					result = this.slice(start);


				switch (typeof End) {
					case "number":
						end = End;
						if (end < 0) end = this.length + end; //: count from end if negative
						if (BasicSlice && start > end) Swap(start, end);
						if (end > this.length) end = this.length;
						break;
					case "string":
						end = (LastEnd ? this.lastIndexOf(End) : this.indexOf(End));
						if (end < 0) end = this.length;
						if (IncludeEnd) end += End.length;
						break;
					case "object":
						if (End instanceof RegExp) {
							let match = LastEnd ? End.exec(this).last() : End.exec(this);
							end = match.index >= 0 ?
								(match.index + (LastEnd ? 0 : match[0].length)) : 0;
						} else if (End instanceof Array && End.every(x => typeof x == "function")) {
							end = End.length > 0 ?
								this.indexOfT({End, IndexOfEnd: IncludeEnd, RightDirection: !LastEnd}) : 0;
							if (end < 0)
								if (AlwaysReturnString)
									end = this.length - 1;
								else
									return null;
						} else throw new Error("Type of End is not supported");
						break;
					default:
						throw new Error("Type of End is not supported");
				}

				return BasicSlice ?
					result.slice(start, (end - start)) :
					result.slice(0, end);
			}
		}

		if (!String.prototype.indexOfT) {
			String.prototype.indexOfT = function (Conditions, Start = 0, End = Infinity, RightDirection = true, IndexOfEnd = false) {
				if (End === Infinity) End = this.length - 1;
				if (Start < 0) Start = this.length + Start;
				if (Start < 0) throw new Error(`incorrect negative Start (${Start - this.length}). |Start| should be ≤ this.length (${this.length})`);
				if (End < 0) End = this.length + End;
				if (End < 0) throw new Error(`incorrect negative End (${End - this.length}). |End| should be ≤ this.length (${this.length})`);

				if (End === Start) return -2;

				if (RightDirection && End < Start ||
					!RightDirection && End > Start)
					swap(Start, End);

				let defaultCurMatchPos = RightDirection ? 0 : Conditions.length - 1;
				let curCondition = defaultCurMatchPos;
				let Result = -1;

				if (RightDirection)
					for (let i = Start; i < End; i++) {
						if (Conditions[curCondition](this[i])) {
							curCondition++;
							if (curCondition !== Conditions.length) continue;
							Result = i;
							curCondition = defaultCurMatchPos;
							//if(!LastOccuarance)
							break;
						} else {
							i -= curCondition;
							curCondition = defaultCurMatchPos;
						}
					}
				else
					for (let i = Start; i >= End; i--) {
						if (Conditions[curCondition](this[i])) {
							curCondition--;
							if (curCondition !== 0) continue;
							Result = i;
							curCondition = defaultCurMatchPos;
							//if(!LastOccuarance)
							break;
						} else {
							i += ((Conditions.length - 1) - curCondition);
							curCondition = defaultCurMatchPos;
						}
					}

				return (Result === -1 || IndexOfEnd ^ !RightDirection) ?
					Result : (Result - Conditions.length) + 1;
			}
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
