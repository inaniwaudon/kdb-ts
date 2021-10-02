import type { Subject } from '.';
import { onBookmarkChanged } from '../bookmark';

/**
 * Subjectオブジェクトからtr要素を作るメソッド。旧Subject.createTrメソッド。
 * @param {Subject} subject もとになるSubjectのインスタンス。
 * @returns {HTMLTableRowElement} 表示するべきtr要素
 */
export function RenderSubjectAsTableRow(subject: Subject): HTMLTableRowElement {
  const methods = ['対面', 'オンデマンド', '同時双方向'].filter(
    (it) => subject.note.indexOf(it) > -1
  );

  const tr = document.createElement('tr');
  const lineBreak = () => document.createElement('br');

  const anchorOfficial = document.createElement('a');
  anchorOfficial.href = `https://kdb.tsukuba.ac.jp/syllabi/2021/${subject.code}/jpn`;
  anchorOfficial.className = 'syllabus';
  anchorOfficial.target = '_blank';
  anchorOfficial.append('シラバス');

  const anchorMirror = document.createElement('a');
  anchorMirror.href = `https://make-it-tsukuba.github.io/alternative-tsukuba-syllabus/syllabus/${subject.code}.html`;
  anchorMirror.className = 'syllabus';
  anchorMirror.target = '_blank';
  anchorMirror.append('シラバス（ミラー)');

  anchorMirror.addEventListener('click', (evt) => {
    evt.preventDefault();
    let win = document.createElement('draggable-window');
    win.innerHTML = `<div slot='title'>${subject.name} - シラバス</div><iframe slot='body' src='${anchorMirror.href}' />`;
    document.body.append(win);
  });

  const bookmarkCheckbox = document.createElement('input');
  bookmarkCheckbox.type = 'checkbox';
  bookmarkCheckbox.className = 'bookmark';
  bookmarkCheckbox.addEventListener('click', onBookmarkChanged);
  bookmarkCheckbox.id = `bookmark-${subject.code}`;
  bookmarkCheckbox.value = subject.code;

  tr.append(
    createColumn(
      subject.code,
      lineBreak(),
      subject.name,
      anchorOfficial,
      anchorMirror,
      bookmarkCheckbox
    ),
    createColumn(`${subject.credit}単位`, lineBreak(), `${subject.year}年次`),
    createColumn(subject.termStr, lineBreak(), subject.periodStr),
    createColumn(...subject.room.split(/,/g).flatMap(it => [it, lineBreak()])),
    createColumn(...subject.person.split(/,/g).flatMap(it => [it, lineBreak()])),
    methods.length < 1 ? createColumn('不詳') : createColumn(...methods.flatMap(it => [it, lineBreak()])),
    createColumn(subject.abstract),
    createColumn(subject.note)
  );

  return tr;
}

/**
 * ヘルパー関数
 * @param {(string | Node)[]} content tdの中にchildrenとして入るDOM Nodeまたは文字列
 */
function createColumn(...content: (string | Node)[]) {
  const td = document.createElement('td');
  td.append(...content);
  return td;
}
