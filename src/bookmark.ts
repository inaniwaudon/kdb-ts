import * as timetable from './timetable';
import { subjectMap } from './subject';

export const getBookmarks = () => {
  const value = localStorage.getItem('kdb_bookmarks');
  return value != null ? decodeURIComponent(value).split(',') : [];
};

const saveBookmark = (bookmarks: string[]) => {
  let value = '';
  for (let i = 0; i < bookmarks.length; i++) {
    value += ',' + bookmarks[i];
  }
  value = encodeURIComponent(value.substr(1, value.length - 1));
  localStorage.setItem('kdb_bookmarks', value);
};

const removeBookmark = (subjectCode: string) => {
  const bookmarks = getBookmarks();
  if (!bookmarks.includes(subjectCode)) {
    return false;
  } else {
    const newBookmarks = bookmarks.filter((value) => value !== subjectCode);
    saveBookmark(newBookmarks);
    return true;
  }
};

export const onBookmarkChanged = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const subjectCode = input.value;

  if (input.checked) {
    let bookmarks = getBookmarks();
    if (bookmarks.includes(subjectCode)) {
      return;
    } else {
      bookmarks.push(subjectCode);
      saveBookmark(bookmarks);
    }
  } else {
    removeBookmark(subjectCode);
  }
  update();
  if (
    subjectMap[subjectCode].termCodes.length > 0 &&
    subjectMap[subjectCode].termCodes[0].length > 0
  ) {
    switchTimetable(subjectMap[subjectCode].termCodes[0][0]);
  }
  console.log(event);
};

const clearBookmarks = () => {
  const isApproved = window.confirm('すべてのお気に入りの科目が削除されます。よろしいですか？');
  if (!isApproved) {
    return;
  }

  const bookmarks = getBookmarks();
  for (let subjectId of bookmarks) {
    removeBookmark(subjectId);
    let bookmark = document.getElementById('bookmark-' + subjectId);
    if (bookmark != null) {
      (bookmark as HTMLInputElement).checked = false;
    }
  }
  update();
};

// timetable displaying blookmarked subjects
const maxModule = 6;
let timetableWidth: number;
let moduleNo = 0;
let displaysTimetable = true;

let dom: {
  main: HTMLDivElement;
  tableList: HTMLUListElement;
  periods: HTMLLIElement[][][];
  module: HTMLSpanElement;
  credit: HTMLSpanElement;
  previous: HTMLAnchorElement;
  next: HTMLAnchorElement;
  close: HTMLAnchorElement;
  clear: HTMLAnchorElement;
};

const switchDisplayTimetable = () => {
  dom.main.style.marginBottom = displaysTimetable
    ? `calc(${-dom.main.clientHeight}px + 1.8rem)`
    : '0';
  displaysTimetable = !displaysTimetable;
  dom.close.innerHTML = displaysTimetable ? '×' : '︿';
  if (displaysTimetable) {
    dom.close.classList.remove('closed');
  } else {
    dom.close.classList.add('closed');
  }
};

const switchTimetable = (no: number) => {
  if (moduleNo != no && no < 6) {
    moduleNo = no;
    dom.tableList.style.marginLeft = timetableWidth * moduleNo * -1 + 'px';
    update();
  }
};

const shiftTimetable = (isForward: boolean) => {
  const maxModule = 5;
  if (isForward && moduleNo < maxModule) {
    switchTimetable(moduleNo + 1);
  }
  if (!isForward && moduleNo > 0) {
    switchTimetable(moduleNo - 1);
  }
};

export const initialize = () => {
  dom = {
    main: document.querySelector('#bookmark-timetable .main') as HTMLDivElement,
    tableList: document.querySelector('#bookmark-timetable ul.table-list') as HTMLUListElement,
    periods: [],
    module: document.querySelector('#current-status .module') as HTMLSpanElement,
    credit: document.querySelector('#current-status .credit') as HTMLSpanElement,
    previous: document.querySelector('#current-status .previous') as HTMLAnchorElement,
    next: document.querySelector('#current-status .next') as HTMLAnchorElement,
    close: document.querySelector('#close-bookmark-table') as HTMLAnchorElement,
    clear: document.querySelector('#clear-bookmarks') as HTMLAnchorElement,
  };

  dom.clear.addEventListener('clear', () => clearBookmarks());
  dom.previous.addEventListener('click', () => shiftTimetable(false));
  dom.next.addEventListener('click', () => shiftTimetable(true));
  dom.close.addEventListener('click', () => switchDisplayTimetable());

  // create HTML elements for a table
  let firstTable = null;
  for (let termNo = 0; termNo < maxModule; termNo++) {
    let table = document.createElement('li');
    firstTable = firstTable ?? table;
    table.className = 'table tile';
    dom.periods[termNo] = timetable.create<HTMLLIElement>(null as any);

    for (let x = 0; x < timetable.daysofweek.length; x++) {
      let row = document.createElement('ul');
      row.className = 'row';

      for (let y = -1; y < timetable.maxTime; y++) {
        let item = document.createElement('li');
        if (y == -1) {
          item.innerHTML = timetable.daysofweek[x];
        }
        row.appendChild(item);
        dom.periods[termNo][x][y] = item;
      }
      table.appendChild(row);
    }
    dom.tableList.appendChild(table);
  }

  timetableWidth = (firstTable as HTMLLIElement).clientWidth;
  update();
};

export const update = () => {
  let credit = 0.0;
  let bookmarks = getBookmarks();

  // timetable
  for (let termNo = 0; termNo < maxModule; termNo++) {
    for (let time = 0; time < timetable.maxTime; time++) {
      for (let day = 0; day < timetable.daysofweek.length; day++) {
        let item = dom.periods[termNo][day][time];
        item.innerHTML = '';
        let no = 0;

        for (let code of bookmarks) {
          if (!(code in subjectMap)) {
            continue;
          }
          let subject = subjectMap[code];

          // term
          for (let subjectTermNo in subject.termCodes) {
            if (!subject.termCodes[subjectTermNo].includes(termNo)) {
              continue;
            }

            // period
            let startNo, endNo;
            [startNo, endNo] =
              subject.termCodes.length == subject.periodsArray.length
                ? [Number(subjectTermNo), Number(subjectTermNo)]
                : [0, subject.periodsArray.length - 1];

            for (let i = startNo; i <= endNo; i++) {
              let periods = subject.periodsArray[i];
              if (periods.get(day, time)) {
                let div = document.createElement('div');
                let h = 200 + no * 20;
                div.className = 'class';
                div.innerHTML = subject.name;
                div.style.margin = 0.1 * (no + 1) + 'rem';
                div.style.background = `hsl(${h}, 100%, 90%, 0.8)`;
                item.appendChild(div);
                no++;

                // remove button
                let remove = document.createElement('a');
                remove.classList.add('remove');
                remove.innerHTML = '×';
                div.appendChild(remove);

                div.addEventListener('mouseover', () => {
                  remove.classList.add('displayed');
                });
                div.addEventListener('mouseout', () => {
                  remove.classList.remove('displayed');
                });
                remove.addEventListener('click', () => {
                  removeBookmark(code);
                  let bookmark = document.getElementById('bookmark-' + code);
                  if (bookmark != null) {
                    (bookmark as HTMLInputElement).checked = false;
                  }
                  update();
                });
              }
            }
          }
        }
      }
    }
  }

  // credit
  for (let code of bookmarks) {
    if (code in subjectMap && !isNaN(subjectMap[code].credit)) {
      credit += Number(subjectMap[code].credit);
    }
  }

  // status
  let season = moduleNo < 3 ? '春' : '秋';
  let module_ = moduleNo % 3 == 0 ? 'A' : moduleNo % 3 == 1 ? 'B' : 'C';
  dom.module.innerHTML = season + module_;
  dom.credit.innerHTML = credit.toFixed(1) + '単位';
};
