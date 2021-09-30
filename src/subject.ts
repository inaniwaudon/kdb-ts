import * as timetable from './timetable';
import { getBookmarks, onBookmarkChanged } from './bookmark';

export class Periods {
  private _periods: boolean[][];

  constructor(value?: any) {
    this._periods = timetable.create(false);
    let dayArray: number[] = [];

    if (value != null && typeof value == 'string') {
      let periodStrArray = (value as string).split(',');
      for (let periodStr of periodStrArray) {
        let dayStr = periodStr.replace(/[0-9\\-]/g, '');
        let days = dayStr
          .split('・')
          .filter((day) => timetable.daysofweek.includes(day))
          .map((day) => timetable.daysofweek.indexOf(day));
        if (days.length > 0) {
          dayArray = days;
        }
        let timeArray = [];
        let timeStr = periodStr.replace(/[^0-9\\-]/g, '');

        if (timeStr.indexOf('-') > -1) {
          let timeStrArray = timeStr.split('-');
          let startTime = Number(timeStrArray[0]);
          let endTime = Number(timeStrArray[1]);
          for (let k = startTime; k <= endTime; k++) {
            timeArray.push(k);
          }
        } else {
          timeArray.push(Number(timeStr));
        }

        if (timeStr.length > 0) {
          for (let day of dayArray) {
            for (let time of timeArray) {
              this._periods[day][time - 1] = true;
            }
          }
        }
      }
    }
  }

  get length() {
    return this._periods.reduce(
      (accumulator, day) => day.reduce((sum, time) => (time ? 1 : 0) + sum, 0) + accumulator,
      0
    );
  }

  get periods() {
    return this._periods;
  }

  set(day: number, time: number, state: boolean) {
    this.periods[day][time] = state;
  }

  get(day: number, time: number) {
    return this._periods[day][time];
  }

  matches(periods: Periods) {
    for (let day in this._periods) {
      for (let time in this._periods[day]) {
        if (this._periods[day][time] && periods._periods[day][time]) {
          return true;
        }
      }
    }
    return false;
  }
}

export interface SearchOptions {
  keyword: string;
  reqA: string;
  reqB: string;
  reqC: string;
  online: string;
  year: string;
  season: string | null;
  module: string | null;
  periods: Periods;
  containsName: boolean;
  containsCode: boolean;
  containsRoom: boolean;
  containsPerson: boolean;
  containsAbstract: boolean;
  containsBookmark: boolean;
  concentration: boolean;
  negotiable: boolean;
  asneeded: boolean;
}

export class Subject {
  private _code: string;
  private _name: string;
  private year: string;
  private termStr: string;
  private periodStr: string;
  private room: string;
  private person: string;
  private abstract: string;
  private note: string;
  private reqA: string;
  private reqB: string;
  private reqC: string;
  private _credit: number;
  private _termCodes: number[][] = [];
  private _periodsArray: Periods[] = [];
  private concentration = false;
  private negotiable = false;
  private asneeded = false;

  constructor(line: any) {
    this._code = line[0];
    this._name = line[1];
    this._credit = line[3];
    this.year = line[4];
    this.termStr = line[5];
    this.periodStr = line[6];
    this.room = line[7];
    this.person = line[8];
    this.abstract = line[9];
    this.note = line[10];
    this.reqA = line[11];
    this.reqB = line[12];
    this.reqC = line[13];

    // term (season - module)
    // term code
    // : spring A-C: 0-2
    // : autumn A-C: 3-5
    // : spring, summer, autumn and winter holiday: 6-9
    let termGroups = this.termStr.split(' ');
    let allSeasons = ['春', '夏', '秋', '冬'];
    let season: string | null = null;

    for (let groupStr of termGroups) {
      let group: number[] = [];
      let charArray = Array.from(groupStr);
      for (let char of charArray) {
        if (allSeasons.includes(char)) {
          season = char;
        }
        if (season) {
          if (['A', 'B', 'C'].includes(char)) {
            let no = (season == '春' ? 0 : 3) + (char == 'A' ? 0 : char == 'B' ? 1 : 2);
            group.push(no);
          }
          if (char == '休') {
            group.push(allSeasons.indexOf(season) + 6);
          }
        }
      }
      this._termCodes.push(group);
    }

    // period (day, time)
    let termStrArray = this.periodStr.split(' ');
    for (let str of termStrArray) {
      this._periodsArray.push(new Periods(str));
      if (this.code == '1425011') {
        console.log(this.periodsArray, str);
      }
      this.concentration = str.indexOf('集中') > -1 || this.concentration;
      this.negotiable = str.indexOf('応談') > -1 || this.concentration;
      this.asneeded = str.indexOf('随時') > -1 || this.concentration;
    }
  }

  get code() {
    return this._code;
  }

  get name() {
    return this._name;
  }

  get credit() {
    return this._credit;
  }

  get termCodes() {
    return this._termCodes;
  }

  get periodsArray() {
    return this._periodsArray;
  }

  createTr() {
    const url = `https://kdb.tsukuba.ac.jp/syllabi/2021/${this.code}/jpn`;
    const url_m = `https://make-it-tsukuba.github.io/alternative-tsukuba-syllabus/syllabus/${this.code}.html`;
    const methods = ['対面', 'オンデマンド', '同時双方向'].filter(
      (it) => this.note.indexOf(it) > -1
    );
    const tr = document.createElement('tr');
    tr.innerHTML =
      `<td>${this.code}<br/>${this.name}<br/>` +
      `<a href="${url}" class="syllabus" target="_blank">シラバス</a><a href="${url_m}" class="syllabus" target="_blank">シラバス（ミラー)</a>` +
      `<input type="checkbox" class="bookmark" id="bookmark-${this.code}" value="${this.code}" /></td></td>`;
    tr.innerHTML += `<td>${this.credit}単位<br/>${this.year}年次</td>`;
    tr.innerHTML += `<td>${this.termStr}<br/>${this.periodStr}</td>`;
    tr.innerHTML += `<td>${this.room.replace(/,/g, '<br/>')}</td>`;
    tr.innerHTML += `<td>${this.person.replace(/,/g, '<br/>')}</td>`;
    if (methods.length < 1) {
      tr.innerHTML += '<td>不詳</td>';
    } else {
      tr.innerHTML += `<td>${methods.join('<br/>')}<br /></td>`;
    }
    tr.innerHTML += `<td>${this.abstract}</td>`;
    tr.innerHTML += `<td>${this.note}</td>`;

    let anchor = tr.children.item(0)!.children.item(3) as HTMLAnchorElement;
    anchor.addEventListener('click', (evt) => {
      evt.preventDefault();
      let win = document.createElement('draggable-window');
      win.innerHTML = `<div slot="title">${this.name} - シラバス</div><iframe slot="body" src="${anchor.href}" />`;
      document.body.append(win);
    });

    const bookmark = tr.querySelector('#bookmark-' + this.code);
    bookmark?.addEventListener('click', onBookmarkChanged);
    return tr;
  }

  matchesSearchOptions(options: SearchOptions): boolean {
    // keyword
    const regex = new RegExp(options.keyword);
    const matchesCode = options.containsCode && this.code.indexOf(options.keyword) > -1;
    const matchesName = options.containsName && this.name.match(regex) != null;
    const matchesRoom = options.containsRoom && this.room.match(regex) != null;
    const matchesPerson = options.containsPerson && this.person.match(regex) != null;
    const matchesAbstract = options.containsAbstract && this.abstract.match(regex) != null;
    const matchesKeyword =
      matchesCode || matchesName || matchesRoom || matchesPerson || matchesAbstract;

    // period
    const matchesPeriods =
      options.periods.length == 0 ||
      this._periodsArray.reduce<boolean>(
        (accumulator, periods) => accumulator || periods.matches(options.periods),
        false
      ) ||
      (options.concentration && this.concentration) ||
      (options.negotiable && this.negotiable) ||
      (options.asneeded && this.asneeded);

    // standard year of course
    let matchesYear;
    if (options.year == 'null') {
      matchesYear = true;
    } else if (this.year.indexOf('-') == -1) {
      matchesYear = this.year.indexOf(options.year) > -1;
    } else {
      let minYear = this.year.replace(/\s-\s[1-6]/g, '');
      let maxYear = this.year.replace(/[1-6]\s-\s/g, '');
      matchesYear = minYear <= options.year && options.year <= maxYear;
    }

    // requirements
    let matchesReqA = options.reqA == 'null' || options.reqA == this.reqA;
    let matchesReqB = options.reqB == 'null' || options.reqB == this.reqB;
    let matchesReqC = options.reqC == 'null' || options.reqC == this.reqC;

    // other options
    let matchesSeason = options.season == null || this.termStr.indexOf(options.season) > -1;
    let matchesModule = options.module == null || this.termStr.indexOf(options.module) > -1;
    let matchesOnline = options.online == 'null' || this.note.indexOf(options.online) > -1;
    let matchesBookmark = !options.containsBookmark || getBookmarks().includes(this.code);

    return (
      matchesKeyword &&
      matchesPeriods &&
      matchesYear &&
      matchesReqA &&
      matchesReqB &&
      matchesReqC &&
      matchesSeason &&
      matchesModule &&
      matchesOnline &&
      matchesBookmark
    );
  }
}

export const subjectMap: {
  [key: string]: Subject;
} = {};
export const subjectCodeList: string[] = [];

export const initializeSubject = async () => {
  // read a json
  const response = await fetch('kdb.json');
  const json = await response.json();
  const subjects = json.subject;
  const updatedDate = json.updated;

  // convert into a map
  for (let line of subjects) {
    const subject = new Subject(line);
    subjectMap[subject.code] = subject;
    subjectCodeList.push(subject.code);
  }
  return updatedDate;
};
