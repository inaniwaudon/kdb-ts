import { Subject, initializeSubject, subjectCodeList, subjectMap } from './subject';
import * as timetable from './timetable';
import * as bookmark from './bookmark';
import codeTypes from './code-types.json';
import { matchesSearchOptions, SearchOptions } from './subject/search';
import { RenderSubjectAsTableRow } from './subject/render';

let dom: {
  form: HTMLFormElement;
  keyword: HTMLInputElement;
  reqA: HTMLSelectElement;
  reqB: HTMLSelectElement;
  reqC: HTMLSelectElement;
  selectModule: HTMLSelectElement | null;
  selectDay: HTMLSelectElement | null;
  selectPeriod: HTMLSelectElement | null;
  submit: HTMLAnchorElement;
  clear: HTMLAnchorElement;
  checkbox: {
    name: HTMLInputElement;
    no: HTMLInputElement;
    person: HTMLInputElement;
    room: HTMLInputElement;
    abstract: HTMLInputElement;
    bookmark: HTMLInputElement;
  };
  footer: {
    download: HTMLAnchorElement;
    updatedDate: HTMLSpanElement;
  };
  bookmarkInfo: HTMLDivElement;
  table: HTMLTableElement;
  tbody: HTMLElement;
};

let isUnder1100px: boolean;
let lineLimit: number;
let timeout: any;

const deleteOptions = (select: HTMLSelectElement) => {
  select.innerHTML = '';
};

const clear = (evt: Event) => {
  evt.stopPropagation();
  dom.keyword.value = '';
  dom.reqA.selectedIndex = 0;
  deleteOptions(dom.reqB);
  deleteOptions(dom.reqC);
  dom.form.season.value = 'null';
  dom.form.module.value = 'null';
  dom.form.online.value = 'null';
  dom.form.year.value = 'null';

  dom.checkbox.name.checked = true;
  dom.checkbox.no.checked = true;
  dom.checkbox.person.checked = false;
  dom.checkbox.room.checked = false;
  dom.checkbox.abstract.checked = false;
  dom.checkbox.bookmark.checked = false;

  timetable.clear();
};

const updateTable = (options: SearchOptions, index: number, displayedIndex: number) => {
  let bookmarks = bookmark.getBookmarks();
  if (displayedIndex >= lineLimit) {
    return;
  }

  for (;;) {
    const subject: Subject = subjectMap[subjectCodeList[index]];
    if (typeof subject === 'undefined') {
      return;
    }
    if (!matchesSearchOptions(subject, options)) {
      index++;
      continue;
    }
    const tr = RenderSubjectAsTableRow(subject);
    dom.tbody.appendChild(tr);

    // Make bookmarked buttons active
    (document.getElementById('bookmark-' + subject.code) as HTMLInputElement).checked =
      bookmarks.includes(subject.code);

    timeout = setTimeout(() => updateTable(options, index + 1, ++displayedIndex), 0);
    break;
  }
};

const search = (e: Event | null) => {
  if (e != null) {
    e.stopPropagation();
  }
  dom.tbody.innerHTML = '';

  let season: string | null = null;
  let module: string | null = null;
  if (isUnder1100px) {
    let seasonModule = dom.selectModule?.options[dom.selectModule.selectedIndex].value as string;
    if (seasonModule != 'null') {
      season = seasonModule.slice(0, 1);
      module = seasonModule.slice(1);
    }
  } else {
    if (dom.form.season.value != 'null') {
      season = dom.form.season.value;
    }
    if (dom.form.module.value != 'null') {
      module = dom.form.module.value;
    }
  }

  let options: SearchOptions = {
    keyword: dom.keyword.value,
    reqA: dom.reqA.options[dom.reqA.selectedIndex].value,
    reqB: dom.reqB.selectedIndex > -1 ? dom.reqB.options[dom.reqB.selectedIndex].value : 'null',
    reqC: dom.reqC.selectedIndex > -1 ? dom.reqC.options[dom.reqC.selectedIndex].value : 'null',
    online: dom.form.online.value,
    year: dom.form.year.value,
    containsName: dom.checkbox.name.checked,
    containsCode: dom.checkbox.no.checked,
    containsRoom: dom.checkbox.room.checked,
    containsPerson: dom.checkbox.person.checked,
    containsAbstract: dom.checkbox.abstract.checked,
    containsBookmark: dom.checkbox.bookmark.checked,
    periods: timetable.selectedPeriods,
    disablePeriods: timetable.dom.checkExcludeBookmark.checked ? timetable.disablePeriods : null,
    concentration: timetable.dom.checkConcentration.checked,
    negotiable: timetable.dom.checkNegotiable.checked,
    asneeded: timetable.dom.checkAsNeeded.checked,
    season,
    module,
  };

  clearTimeout(timeout);
  updateTable(options, 0, 0);
};

window.onload = function () {
  // initialize DOM
  dom = {
    form: document.getElementsByTagName('form')[0] as HTMLFormElement,
    keyword: document.getElementById('keyword') as HTMLInputElement,
    reqA: document.getElementById('req-a') as HTMLSelectElement,
    reqB: document.getElementById('req-b') as HTMLSelectElement,
    reqC: document.getElementById('req-c') as HTMLSelectElement,
    selectModule: null,
    selectDay: null,
    selectPeriod: null,
    submit: document.getElementById('submit') as HTMLAnchorElement,
    clear: document.getElementById('clear') as HTMLAnchorElement,
    checkbox: {
      name: document.getElementById('check-name') as HTMLInputElement,
      no: document.getElementById('check-no') as HTMLInputElement,
      person: document.getElementById('check-person') as HTMLInputElement,
      room: document.getElementById('check-room') as HTMLInputElement,
      abstract: document.getElementById('check-abstract') as HTMLInputElement,
      bookmark: document.getElementById('check-bookmark') as HTMLInputElement,
    },
    footer: {
      download: document.getElementById('download') as HTMLAnchorElement,
      updatedDate: document.getElementById('updated-date') as HTMLSpanElement,
    },
    bookmarkInfo: document.getElementById('bookmark-info') as HTMLDivElement,
    table: document.getElementById('body') as HTMLTableElement,
    tbody: document.querySelector('table#body tbody') as HTMLElement,
  };
  timetable.initialize();
  bookmark.initialize();

  // if the device is iOS, displayed lines are limited 100.
  const isIOS = ['iPhone', 'iPad', 'iPod'].some((name) => navigator.userAgent.indexOf(name) > -1);
  lineLimit = isIOS ? 100 : 1000;

  const resized = () => {
    dom.clear.removeEventListener('click', clear);
    let supportsTouch = 'ontouchend' in document;
    timetable.dom.display.removeEventListener(
      supportsTouch ? 'touchstart' : 'click',
      timetable.display
    );

    isUnder1100px = window.matchMedia('screen and (max-width: 1100px)').matches;
    if (isUnder1100px) {
      dom.selectModule = document.getElementById('select-module') as HTMLSelectElement;
      dom.selectDay = document.getElementById('select-day') as HTMLSelectElement;
      dom.selectPeriod = document.getElementById('select-period') as HTMLSelectElement;
      dom.submit = document.getElementById('submit-sp') as HTMLAnchorElement;
      dom.clear = document.getElementById('clear-sp') as HTMLAnchorElement;
      timetable.dom.display = document.getElementById('display-timetable-sp') as HTMLAnchorElement;
    } else {
      dom.submit = document.getElementById('submit') as HTMLAnchorElement;
      dom.clear = document.getElementById('clear') as HTMLAnchorElement;
      timetable.dom.display = document.getElementById('display-timetable') as HTMLAnchorElement;
    }

    timetable.dom.display.innerHTML = isUnder1100px ? '曜日・時限を選択' : '選択';
    dom.submit.addEventListener('click', search);
    dom.clear.addEventListener('click', clear);
    timetable.dom.display.addEventListener('click', timetable.display);
  };
  resized();
  window.addEventListener('resize', resized, { passive: true });

  // search
  dom.keyword.addEventListener('keydown', (evt) => {
    if (evt.key == 'Enter') {
      evt.preventDefault();
      search(evt);
    }
  });
  dom.submit.addEventListener('click', search);

  // convert table data to CSV file with utf-8 BOM
  const makeCSV = (a: HTMLAnchorElement, table: HTMLTableElement, filename: string) => {
    const escaped = /,|\r?\n|\r|"/;
    const e = /"/g;

    var bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const csv = [],
      row = [];
    for (let r = 0; r < table.rows.length; r++) {
      row.length = 0;
      for (let c = 0; c < table.rows[r].cells.length; c++) {
        const field = table.rows[r].cells[c].innerText
          .trim()
          .replace('シラバスシラバス（ミラー)', '');
        row.push(escaped.test(field) ? '"' + field.replace(e, '""') + '"' : field);
      }
      csv.push(row.join(',').replace('\n",', '",'));
    }

    var blob = new Blob([bom, csv.join('\n')], { type: 'text/csv' });

    if ((window.navigator as any).msSaveBlob) {
      // IE
      (window.navigator as any).msSaveBlob(blob, filename);
    } else {
      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
    }
  };

  // get YYYYMMDDhhmmdd
  const getDateString = () => {
    let date = new Date();
    let Y = date.getFullYear();
    let M = ('00' + (date.getMonth() + 1)).slice(-2);
    let D = ('00' + date.getDate()).slice(-2);
    let h = ('0' + date.getHours()).slice(-2);
    let m = ('0' + date.getMinutes()).slice(-2);
    let d = ('0' + date.getSeconds()).slice(-2);
    return Y + M + D + h + m + d;
  };

  // download CSV file: `kdb_YYYYMMDDhhmmdd.csv`
  dom.footer.download.addEventListener('click', () => {
    makeCSV(dom.footer.download, dom.table, `kdb_${getDateString()}.csv`);
  });

  const constructOptions = (select: HTMLSelectElement, types: { [key: string]: any }) => {
    deleteOptions(select);
    let option = document.createElement('option');
    option.value = 'null';
    option.innerHTML = '指定なし';
    select.appendChild(option);

    for (let key in types) {
      let option = document.createElement('option');
      option.innerHTML = key;
      select.appendChild(option);
    }
  };

  const selectOnChange = (isA: boolean) => {
    deleteOptions(dom.reqC);
    const selected = isA ? dom.reqA : dom.reqB;
    const selectedValue = selected.options[selected.selectedIndex].value;
    const subSelect = isA ? dom.reqB : dom.reqC;
    const reqA_value = dom.reqA.options[dom.reqA.selectedIndex].value;
    const reqB_value =
      dom.reqB.selectedIndex > -1 ? dom.reqB.options[dom.reqB.selectedIndex].value : 'null';

    if (selectedValue == 'null') {
      deleteOptions(subSelect);
    } else {
      let types = isA
        ? (codeTypes as any)[reqA_value]
        : (codeTypes as any)[reqA_value].childs[reqB_value];
      constructOptions(subSelect, types.childs);
    }
  };

  // initialize
  (async () => {
    // construct options of requirements
    constructOptions(dom.reqA, codeTypes);
    dom.reqA.addEventListener('change', () => selectOnChange(true));
    dom.reqB.addEventListener('change', () => selectOnChange(false));

    const updatedDate = await initializeSubject();
    dom.footer.updatedDate.innerHTML = updatedDate;
    search(null);

    // bookmark
    bookmark.update();

    let firstBookmark = document.querySelector('input.bookmark');
    if (!isUnder1100px && localStorage.getItem('kdb_bookmarks') == null) {
      dom.bookmarkInfo.style.opacity = '1.0';
      let bounding = firstBookmark?.getBoundingClientRect() as DOMRect;
      dom.bookmarkInfo.style.left = bounding.left + 28 + 'px';
      dom.bookmarkInfo.style.top = bounding.top + 4 + 'px';
    } else {
      dom.bookmarkInfo.style.display = 'none';
    }
  })();

  // scroll
  window.addEventListener('scroll', () => {
    dom.bookmarkInfo.style.opacity = '0';
    setTimeout(() => (dom.bookmarkInfo.style.display = 'none'), 300);
  });

  const displayMS = 200;
  document.addEventListener('click', (e: MouseEvent) => {
    let query = '#timetable, ' + (isUnder1100px ? '#display-timetable-sp' : '#display-timetable');
    if (!(e.target as HTMLElement).closest(query)) {
      timetable.dom.timetable.style.opacity = '0';
      setTimeout(() => {
        timetable.dom.timetable.style.display = 'none';
      }, displayMS);
    }
  });
};
