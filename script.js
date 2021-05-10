window.onload = function () {
	const table = document.querySelector("table#body tbody");
	const keyword_input = document.querySelector("input[type=\"text\"]");
	const form = document.getElementsByTagName("form")[0];
	const reqA_input = document.getElementById("req-a");
	const reqB_input = document.getElementById("req-b");
	const reqC_input = document.getElementById("req-c");

	let submitButton = document.getElementById("submit");
	const downloadLink = document.getElementById("download");
	const updatedDate = document.getElementById("updated-date");

	//clear button
	let clearButton = document.getElementById("clear");
	let clearButtonListener;

	// checkbox
	const checkName = document.getElementById("check-name");
	const checkNo = document.getElementById("check-no");
	const checkPerson = document.getElementById("check-person");
	const checkRoom = document.getElementById("check-room");
	const checkAbstract = document.getElementById("check-abstract");
	
	// timetable
	const selectedPeriodsSpan = document.getElementById("selected-periods");
	const timetable = document.getElementById("timetable");
	const timetableContent = document.querySelector("#timetable .content");
	const checkConcentration = document.getElementById("check-concentration");
	const checkNegotiable = document.getElementById("check-negotiable");
	const checkAsNeeded = document.getElementById("check-asneeded");
	let timetableLink = document.getElementById("display-timetable");
	let timetableListener;

	// if the device is iOS, displayed lines are limited 100.
	const isIOS = ["iPhone", "iPad", "iPod"].some(name => navigator.userAgent.indexOf(name) > -1);
	const lineLimit = 100;

	// if the device width is under 1100px
	let isUnder1100px = window.matchMedia("screen and (max-width: 1100px)").matches;
	let selectModule, selectDay, selectPeriod;

	if (isUnder1100px) {
		selectModule = document.getElementById("select-module");
		selectDay = document.getElementById("select-day");
		selectPeriod = document.getElementById("select-period");
		submitButton = document.getElementById("submit-sp");
		clearButton = document.getElementById("clear-sp");
		timetableLink = document.getElementById("display-timetable-sp");
	}

	let codeTypes = null;
	let data = null;
	let timeout = void 0;

	keyword_input.addEventListener("keydown", (evt) => {
		const KEYCODE_ENTER = 13;
		if (evt.keyCode === KEYCODE_ENTER) {
			evt.preventDefault();
			search(evt);
		}
	});

	clearButton.addEventListener('click', clearButtonListener = (evt) => {
		evt.stopPropagation();
		keyword_input.value = "";
		reqA_input.selectedIndex = 0;
		form.season.value = "null";
		form.module.value = "null";
		form.online.value = "null";
		form.year.value = "null";

		for (let periods of timetablePeriods)
			for (let period of periods)
				period.classList.remove("selected");

		checkName.checked = true;
		checkNo.checked = true;
		checkPerson.checked = false;
		checkRoom.checked = false;
		checkAbstract.checked = false;

		checkConcentration.checked = false;
		checkNegotiable.checked = false;
		checkAsNeeded.checked = false;
	});


	// timetable
	const createTimeTable = (filled) => {
		let table = new Array(daysofweek.length);
		for (let i in daysofweek)
			table[i] = new Array(maxPeriod).fill(filled);
		return table;
	};

	const daysofweek = ["月", "火", "水", "木", "金", "土", "日"];
	const maxPeriod = 6;
	let timetablePeriods = createTimeTable(null);
	let selectedPeriods = createTimeTable(false);

	{
		let displaysTimetable = false;
		let beforeSelected = null;
		let selectedDownPeriods;

		for (let y = 0; y <= maxPeriod; y++) {
			let line = document.createElement("div");
			line.classList.add("line");
			timetableContent.appendChild(line);

			for (let x = -1; x < 7; x++) {
				let item = document.createElement("div");
				item.classList.add("item");
				line.appendChild(item);

				if (y > 0 && x == -1) {
					item.innerHTML = y;
					item.classList.add("no");
				}
				else if (y == 0 && x > -1) {
					item.innerHTML = daysofweek[x];
					item.classList.add("day");
				}
				else if (y > 0 && x >= 0) {
					timetablePeriods[x][y-1] = item;
					item.classList.add("period");

					const changeSelectedPeriods = (x, y) => {
						if (!beforeSelected)
							return;
						
						for (let yi = 0; yi < maxPeriod; yi++) {
							for (let xi = 0; xi < daysofweek.length; xi++) {
								let target = timetablePeriods[xi][yi];
								if (Math.min(x, beforeSelected.x) <= xi && xi <= Math.max(x, beforeSelected.x)
									&& Math.min(y, beforeSelected.y) <= yi+1 && yi+1 <= Math.max(y, beforeSelected.y)) {
									if (selectedDownPeriods[xi][yi])
										target.classList.remove("selected");
									else
										target.classList.add("selected");								
									selectedPeriods[xi][yi] = !selectedDownPeriods[xi][yi];
								}
								else {
									if (selectedDownPeriods[xi][yi])
										target.classList.add("selected");
									else
										target.classList.remove("selected");
									selectedPeriods[xi][yi] = selectedDownPeriods[xi][yi];
								}
							}
						}
					};

					const onmousedown = (e) => {
						beforeSelected = { x: x, y: y };
						selectedDownPeriods = JSON.parse(JSON.stringify(selectedPeriods));
						changeSelectedPeriods(x, y);
					};

					const onmousemove = (e) => {
						if (selectedDownPeriods)
							changeSelectedPeriods(x, y);
					};

					const onmouseup = (e) => {
						selectedDownPeriods = null;
						beforeSelected = null;

						let text = "";
						for (let day in selectedPeriods) {
							let dayText = ""
							for (let time in selectedPeriods[day])
								if (selectedPeriods[day][time])
									dayText += Number(time) + 1;
							if (dayText.length > 0)
								text += `<span class="day-label"><span class="day">${daysofweek[day]}</span>${dayText}</span>`;
						}
						text = text.length > 0 ? text : "指定なし";
						if (isUnder1100px)
							timetableLink.innerHTML = text;
						else
							selectedPeriodsSpan.innerHTML = text;
					};

					const supportsTouch = "ontouchend" in document;
					if (supportsTouch) {
						item.addEventListener("touchstart", onmousedown);
						item.addEventListener("touchmove", onmousemove);
						item.addEventListener("touchend", onmouseup);
					}
					else {
						item.addEventListener("mousedown", onmousedown);
						item.addEventListener("mousemove", onmousemove);
						item.addEventListener("mouseup", onmouseup);
					}
				}
			}
		}

		const displayMs = 200;
		const supportsTouch = "ontouchend" in document;
	
		timetableLink.addEventListener(supportsTouch ? "touchstart" : "click", timetableListener = () => {
			let linkBounding = timetableLink.getBoundingClientRect();
			timetable.style.top = (window.pageYOffset + linkBounding.bottom + 10) + "px";
			timetable.style.left = (window.pageXOffset + linkBounding.left) + "px";
			displaysTimetable = true;
			timetable.style.display = "block";
			selectedPeriodsSpan.innerHTML = "カレンダーをクリックして曜日・時限を選択";
			setTimeout(() => {
				timetable.style.opacity = 1;
			}, 0);
		});

		document.addEventListener("click", (e) => {
			let query = "#timetable, " + (isUnder1100px ? "#display-timetable-sp" : "#display-timetable");
			if (!e.target.closest(query)) {
				timetable.style.opacity = 0;
				setTimeout(() => {
					timetable.style.display = "none";
				}, displayMs);
			}
		});
	}


	// display a line of the table
	const createLine = (line) => {
		let tr = document.createElement("tr");
		table.appendChild(tr);

		let url = `https://kdb.tsukuba.ac.jp/syllabi/2021/${line[0]}/jpn`;
		let methods = ["対面", "オンデマンド", "同時双方向"].filter(it => line[10].indexOf(it) > -1);

		tr.innerHTML += `<td>${line[0]}<br/>${line[1]}<br/><a href="${url}" class="syllabus" target="_blank">シラバス</a></td>`;
		tr.innerHTML += `<td>${line[3]}単位<br/>${line[4]}年次</td>`;
		tr.innerHTML += `<td>${line[5]}<br/>${line[6]}</td>`;
		tr.innerHTML += `<td>${line[7].replace(/,/g, "<br/>")}</td>`;
		tr.innerHTML += `<td>${line[8].replace(/,/g, "<br/>")}</td>`;

		if (methods.length < 1)
			tr.innerHTML += "<td>不詳</td>"
		else
			tr.innerHTML += `<td>${methods.join('<br/>')}<br /></td>`;

		tr.innerHTML += `<td>${line[9]}</td>`;
		tr.innerHTML += `<td>${line[10]}</td>`;
	}


	// update the table
	const updateTable = (options, index, displayedIndex) => {
		let regex = new RegExp(options.keyword);

		index = typeof index === 'undefined' ? 0 : index;
		displayedIndex = typeof displayedIndex === "undefined" ? 0 : displayedIndex;

		if (isIOS && displayedIndex >= lineLimit)
			return;

		for (; ;) {
			const line = data[index];

			if (typeof line === 'undefined') {
				return;
			}

			// keyword
			let matchesNo = checkNo.checked ? line[0].indexOf(options.keyword) != 0 : true;
			let matchesName = checkName.checked ? line[1].match(regex) == null : true;
			let matchesRoom = checkRoom.checked ? line[7].match(regex) == null : true;
			let matchesPerson = checkPerson.checked ? line[8].match(regex) == null : true;
			let matchesAbstract = checkAbstract.checked ? line[9].match(regex) == null : true;

			let matchesKeyword = options.keyword != "" &&
				(matchesNo && matchesName && matchesRoom && matchesPerson && matchesAbstract);

			// period
			if (line.length == 14) {
				let periods = {
					concentration : line[6].indexOf("集中") > -1,
					negotiable : line[6].indexOf("応談") > -1,
					asneeded : line[6].indexOf("随時") > -1,
					period: createTimeTable(false)
				};
				let originalPeriods = line[6].split(/[, ]/);
				let day = null;
				for (let period of originalPeriods) {
					let firstChar = period.substr(0,1);
					if (daysofweek.includes(firstChar))
						day = daysofweek.indexOf(firstChar);

					let time_str = period.replace(/[^0-9]/g, "");
					if (time_str.length > 0) {
						let time = Number(time_str);
						if (day != null)
							periods.period[day][time-1] = true;
					}
				}
				line.push(periods);
			}

			let missMatchesPeriod = true;
			let isNotSpecifiedPeriod = true;
			for (let day in options.period) {
				for (let time in options.period[day]) {
					if (options.period[day][time]) {
						isNotSpecifiedPeriod = false;
						if (line[14].period[day][time])
							missMatchesPeriod = false;
					}
				}
			}

			if ((options.concentration && line[14].concentration) ||
				(options.negotiable && line[14].negotiable) ||
				(options.asneeded && line[14].asneeded))
				missMatchesPeriod = false;


			if (isNotSpecifiedPeriod && !options.concentration && !options.negotiable && !options.asneeded)
				missMatchesPeriod = false;

			// other options
			let missMatchesSeason = options.season != "null" && line[5].indexOf(options.season) < 0;
			let missMatchesModule = options.module_ != "null" && line[5].indexOf(options.module_) < 0;
			let missMatchesOnline = options.online != "null" && line[10].indexOf(options.online) < 0;

			let missMatchesYear;
			if (line[4].indexOf("-") < 0) {
				missMatchesYear = options.year != "null" && line[4].indexOf(options.year) < 0;
			} else {
				let minYear = line[4].replace(/\s-\s[1-6]/g, "");
				let maxYear = line[4].replace(/[1-6]\s-\s/g, "");
				missMatchesYear = options.year != "null" && (options.year < minYear || maxYear < options.year);
			}

			let missMatchesReq_A = options.reqA != "null" && options.reqA != line[11];
			let missMatchesReq_B = options.reqB != "null" && options.reqB != line[12];
			let missMatchesReq_C = options.reqC != "null" && options.reqC != line[13];
			
			if (
				matchesKeyword ||
				missMatchesSeason ||
				missMatchesModule ||
				missMatchesPeriod ||
				missMatchesOnline ||
				missMatchesYear ||
				(missMatchesReq_A || missMatchesReq_B || missMatchesReq_C)) {
				index++;
				continue;
			}

			createLine(line);
			timeout = setTimeout(() => updateTable(options, index + 1, ++displayedIndex), 0);
			break;
		}
	}

	// convert table data to CSV file with utf-8 BOM
	const makeCSV = (a, table_, filename) => {
		var escaped = /,|\r?\n|\r|"/;
		var e = /"/g;

		var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
		var csv = [], row = [], field, r, c;
		for (r=0;  r<table_.rows.length; r++) {
			row.length = 0;
			for (c=0; c<table_.rows[r].cells.length; c++) {
				field = table_.rows[r].cells[c].innerText.trim();
				if (r !== 0 && c === 0) {
					field = field.slice(0,-5);
				}
				row.push(escaped.test(field)? '"' + field.replace(e, '""') + '"' : field);
		 	}
			csv.push(row.join(','));
		}
		var blob = new Blob([bom, csv.join('\n')], {'type': 'text/csv'});

		if (window.navigator.msSaveBlob) {
			// IE
			window.navigator.msSaveBlob(blob, filename);
		} else {
			a.download = filename;
			a.href = window.URL.createObjectURL(blob);
		}
	}

	// download CSV file: `kdb_YYYYMMDDhhmmdd.csv`
	const downloadCSV = () => {
		makeCSV(downloadLink, document.querySelector("main table"), `kdb_${getDateString()}.csv`);
	}

	// get YYYYMMDDhhmmdd
	const getDateString = () => {
		let date = new Date();
		let Y = date.getFullYear();
		let M = ("00" + (date.getMonth()+1)).slice(-2);
		let D = ("00" + date.getDate()).slice(-2);
		let h = ('0' + date.getHours()).slice(-2);
		let m = ('0' + date.getMinutes()).slice(-2);
		let d = ('0' + date.getSeconds()).slice(-2);

		return Y + M + D + h + m + d;
	  }

	// search
	const search = (e) => {
		// clear tbody contents
		table.innerHTML = '';

		if (e !== null) {
			e.stopPropagation();
		}
		let options = {};

		options.keyword = keyword_input.value;
		options.reqA = reqA_input.options[reqA_input.selectedIndex].value;
		options.reqB = reqB_input.selectedIndex > -1 ? reqB_input.options[reqB_input.selectedIndex].value : "null";
		options.reqC = reqC_input.selectedIndex > -1 ? reqC_input.options[reqC_input.selectedIndex].value : "null";
		options.online = form.online.value;
		options.year = form.year.value;
		options.period = selectedPeriods;
		options.concentration = checkConcentration.checked;
		options.negotiable = checkNegotiable.checked;
		options.asneeded = checkAsNeeded.checked;

		if (isUnder1100px) {
			let seasonModule = selectModule.options[selectModule.selectedIndex].value;
			if (seasonModule == "null") {
				options.season = "null";
				options.module_ = "null";
			}
			else {
				options.season = seasonModule.slice(0,1);
				options.module_ = seasonModule.slice(1);
			}
		}
		else {
			options.season = form.season.value;
			options.module_ = form.module.value;
		}

		clearTimeout(timeout);
		updateTable(options);
	}

	submitButton.onclick = search;
	downloadLink.onclick = downloadCSV;


	const constructOptions = (select, types) => {
		deleteOptions(select);
		{
			let option = document.createElement("option");
			option.value = "null";
			option.innerHTML = "指定なし";
			select.appendChild(option);
		}
		for (let key in types) {
			let option = document.createElement("option");
			option.innerHTML = key;
			select.appendChild(option);
		}
	}

	const deleteOptions = (select) => {
		select.innerHTML = "";
	}

	const selectOnChange = (isA) => {
		deleteOptions(reqC_input);
		const selected = isA ? reqA_input : reqB_input;
		const selectedValue = selected.options[selected.selectedIndex].value;
		const subSelect = isA ? reqB_input : reqC_input;
		const reqA_value = reqA_input.options[reqA_input.selectedIndex].value;
		const reqB_value = reqB_input.selectedIndex > -1 ? reqB_input.options[reqB_input.selectedIndex].value : "null";

		if (selectedValue == "null") {
			deleteOptions(subSelect);
		}
		else {
			let types = isA ? codeTypes[reqA_value] : codeTypes[reqA_value].childs[reqB_value];
			constructOptions(subSelect, types.childs);
		}
	}

	
	// initialize
	(async () => {
		// construct options of requirements
		let response = await fetch("code-types.json");
		codeTypes = await response.json();
		constructOptions(reqA_input, codeTypes);
		reqA_input.addEventListener("change", () => selectOnChange(true));
		reqB_input.addEventListener("change", () => selectOnChange(false));

		// read a json
		response = await fetch("kdb.json");
		kdbJson = await response.json();
		data = kdbJson.subject;
		updated = kdbJson.updated;

		search(null);
		updatedDate.innerHTML = updated;
	})();

	window.addEventListener('resize', () => {
		let supportsTouch = "ontouchend" in document
		timetableLink.removeEventListener(supportsTouch ? "touchstart" : "click", timetableListener)
		clearButton.removeEventListener('click', clearButtonListener)

		isUnder1100px = window.matchMedia("screen and (max-width: 1100px)").matches;
		if (isUnder1100px) {
			selectModule = document.getElementById("select-module");
			selectDay = document.getElementById("select-day");
			selectPeriod = document.getElementById("select-period");
			submitButton = document.getElementById("submit-sp");
			clearButton = document.getElementById("clear-sp");
			timetableLink = document.getElementById("display-timetable-sp");

		} else {
			submitButton = document.getElementById("submit");
			clearButton = document.getElementById("clear");
			timetableLink = document.getElementById("display-timetable");
		}

		submitButton.onclick = search;
		timetableLink.addEventListener(supportsTouch ? "touchstart" : "click", timetableListener);
		clearButton.addEventListener('click', clearButtonListener);
	});
};
