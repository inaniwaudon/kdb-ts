import type { KdbData } from '../types';
import { Periods } from './period';

export class Subject {
  private _code: string;
  private _name: string;
  private _credit: number;
  private _termCodes: number[][] = [];
  private _periodsArray: Periods[] = [];
  year: string;
  termStr: string;
  periodStr: string;
  room: string;
  person: string;
  abstract: string;
  note: string;
  reqA: string;
  reqB: string;
  reqC: string;
  concentration = false;
  negotiable = false;
  asneeded = false;

  constructor(line: KdbData['subject'][0]) {
    this._code = line[0];
    this._name = line[1];
    this._credit = parseFloat(line[3]);
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
}

export const subjectMap: {
  [key: string]: Subject;
} = {};
export const subjectCodeList: string[] = [];

export const initializeSubject = async () => {
  const kdb = (await import('../kdb.json')) as unknown as KdbData;
  // read a json
  const subjects = kdb.subject;
  const updatedDate = kdb.updated;

  // convert into a map
  for (let line of subjects) {
    const subject = new Subject(line);
    subjectMap[subject.code] = subject;
    subjectCodeList.push(subject.code);
  }
  return updatedDate;
};
