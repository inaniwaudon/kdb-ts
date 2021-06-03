class Bookmark {
	constructor() {
		/*this.content = document.querySelector("#bookmarked .content");
		this.timetable = document.querySelector("#bookmarked ul.table-list");
		this.moduleDisplay = document.querySelector("#current-status .module");
		this.credit = document.querySelector("#current-status .credit");

		this.module = 0;
		this.maxModule = 6;
		this.periodItems = [];
		this.displaysTimetable = false;
		
		// button
		const clearBookmark = document.querySelector("#clear-bookmark");
		clearBookmark.addEventListener("click", () => this.removeAll());

		const previous = document.querySelector("#current-status .previous");
		const next = document.querySelector("#current-status .next");
		const close = document.querySelector("#clear-bookmark");
		previous.addEventListener("click", () => this.shiftTimetable(false));
		next.addEventListener("click", () => this.shiftTimetable(true));
		close.addEventListener("click", () => this.switchDisplayTimetable());*/

		if (localStorage.hasOwnProperty("kdb-bookmark"))
			this.subjects = JSON.parse(localStorage.getItem("kdb-bookmark")).subjects;
		else
			this.subjects = [];

		/*// create tables
		for (let termNo = 0; termNo < this.maxModule; termNo++) {
			let table = document.createElement("li");
			table.className = "table tile";
			this.periodItems[termNo] = createTimeTable();

			for (let x = 0; x < daysofweek.length; x++) {
				let row = document.createElement("ul");
				row.className = "row";
				
				for (let y = -1; y < maxPeriod; y++) {
					let item = document.createElement("li");
					if (y == -1)
						item.innerHTML = daysofweek[x];
					row.appendChild(item);
					this.periodItems[termNo][x][y] = item;
				}
				table.appendChild(row);
			}
			this.timetable.append(table);
		}*/

		/*let firstTimetable = document.querySelector("#bookmarked ul.table-list li");
		this.width = firstTimetable.clientWidth;

		this.update();*/
	}

	/*isBookmarked(code) {
		return this.subjects.includes(code);
	}

	switch(code) {
		if (this.isBookmarked(code))
			this.remove(code);
		else
			this.add(code);
		if (subjectMap[code].terms.normalNo.length > 0) {
			this.switchTimetable(subjectMap[code].terms.normalNo[0]);
		}
	}

	add(code) {
		let tr = document.querySelector(`table#body tr[data-code=\"${code}\"] a.bookmark`)
		if (tr)
			tr.classList.add("bookmarked");

		if (this.subjects.indexOf(code) == -1)
			this.subjects.push(code);
		this.update();
	}

	remove(code) {
		let tr = document.querySelector(`table#body tr[data-code=\"${code}\"] a.bookmark`)
		if (tr)
			tr.classList.remove("bookmarked");

		if (this.subjects.indexOf(code) > -1)
			this.subjects.splice(this.subjects.indexOf(code), 1);
		this.update();
	}*/

	/*removeAll() {
		let trs = document.querySelectorAll(`table#body a.bookmarked`);
		for (let tr of trs)
			tr.classList.remove("bookmarked");

		this.subjects = [];
		this.update();
	}*/

	/*switchDisplayTimetable() {
		console.log("a");
		this.content.style.marginBottom = (this.displaysTimetable ? -this.timetable.innerHeight : 0)  + "px";
		this.displaysTimetable = !this.displaysTimetable;
	}*/

	/*shiftTimetable(isForward) {
		const maxModule = 5;
		if (isForward && this.module < maxModule)
			this.switchTimetable(this.module + 1);
		if (!isForward && this.module > 0)
			this.switchTimetable(this.module - 1);
	}

	switchTimetable(moduleNo) {
		if (this.module != moduleNo) {
			this.module = moduleNo;
			this.timetable.style.marginLeft = this.width * this.module * -1 + "px";
			this.update();
		}
	}*/

	update() {
		// timetable
		//let credit = 0.0;

		for (let termNo = 0; termNo < this.maxModule; termNo++) {
			for (let y = 0; y < maxPeriod; y++) {
				for (let x = 0; x < daysofweek.length; x++) {
					let item = this.periodItems[termNo][x][y];
					item.innerHTML = "";
					let no = 0;

					for (let code of this.subjects) {
						let subject = subjectMap[code];
						let period = subject.period.period;

						if (subject.terms.normalNo.includes(termNo) && period[x][y]) {
							let div = document.createElement("div");
							let h = 200 + no * 20;
							div.className = "class";
							div.innerHTML = subject.name;
							div.style.margin = 0.1 * (no + 1) + "rem";
							div.style.background = `hsl(${h}, 100%, 90%, 0.8)`;

							let remove = document.createElement("a");
							remove.classList.add("remove");
							remove.innerHTML = "×";
							div.appendChild(remove);

							div.addEventListener("mouseover", () => {
								remove.classList.add("displayed");
							});
							div.addEventListener("mouseout", () => {
								remove.classList.remove("displayed");
							});
							remove.addEventListener("click", () => {
								this.remove(code);
							})

							item.appendChild(div);
							no++;
						}
					}
				}
			}
		}

		for (let code of this.subjects)
			if (!isNaN(subjectMap[code].credit))
				credit += Number(subjectMap[code].credit);

		// status
		/*let season = this.module < 3 ? "春" : "秋";
		let module_ = this.module % 3 == 0 ? "A" : (this.module % 3 == 1 ? "B" : "C");
		this.moduleDisplay.innerHTML = season + module_;
		this.credit.innerHTML = credit.toFixed(1) + "単位";*/

		// save
		let objects = { "subjects" : this.subjects }
		localStorage.setItem("kdb-bookmark", JSON.stringify(objects));
	}
}