import { getBookmarks } from '../bookmark';
import type { Subject } from '.';
import { Periods } from './period';

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
  disablePeriods: Periods | null;
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

export function matchesSearchOptions(subject: Subject, options: SearchOptions): boolean {
  // keyword
  const regex = new RegExp(options.keyword);
  const matchesCode = options.containsCode && subject.code.indexOf(options.keyword) > -1;
  const matchesName = options.containsName && subject.name.match(regex) != null;
  const matchesRoom = options.containsRoom && subject.room.match(regex) != null;
  const matchesPerson = options.containsPerson && subject.person.match(regex) != null;
  const matchesAbstract = options.containsAbstract && subject.abstract.match(regex) != null;
  const matchesKeyword =
    matchesCode || matchesName || matchesRoom || matchesPerson || matchesAbstract;

  // period
  let matchesPeriods =
    !(
      options.disablePeriods != null &&
      subject.periodsArray.reduce<boolean>(
        (accumulator, periods) => accumulator || periods.matches(options.disablePeriods!),
        false
      )
    ) &&
    (options.periods.length == 0 ||
      subject.periodsArray.reduce<boolean>(
        (accumulator, periods) => accumulator || periods.matches(options.periods),
        false
      ) ||
      (options.concentration && subject.concentration) ||
      (options.negotiable && subject.negotiable) ||
      (options.asneeded && subject.asneeded));

  // standard year of course
  let matchesYear;
  if (options.year == 'null') {
    matchesYear = true;
  } else if (subject.year.indexOf('-') == -1) {
    matchesYear = subject.year.indexOf(options.year) > -1;
  } else {
    let minYear = subject.year.replace(/\s-\s[1-6]/g, '');
    let maxYear = subject.year.replace(/[1-6]\s-\s/g, '');
    matchesYear = minYear <= options.year && options.year <= maxYear;
  }

  // requirements
  let matchesReqA = options.reqA == 'null' || options.reqA == subject.reqA;
  let matchesReqB = options.reqB == 'null' || options.reqB == subject.reqB;
  let matchesReqC = options.reqC == 'null' || options.reqC == subject.reqC;

  // other options
  let matchesSeason = options.season == null || subject.termStr.indexOf(options.season) > -1;
  let matchesModule = options.module == null || subject.termStr.indexOf(options.module) > -1;
  let matchesOnline = options.online == 'null' || subject.note.indexOf(options.online) > -1;
  let matchesBookmark = !options.containsBookmark || getBookmarks().includes(subject.code);

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
