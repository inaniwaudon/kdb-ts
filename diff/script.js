let main, containsUpdateDate, searchButton, subjectDiffNo;
let beforeArray, afterArray, indices;
let dmp;

window.onload = async () => {
    const beforeCsv = await fetch('../csv/kdb-20210505.csv')
    const beforeText = await beforeCsv.text();
    beforeArray = new CSV(beforeText).parse();

    const afterCsv = await fetch('../csv/kdb-20210905.csv')
    const afterText = await afterCsv.text();
    afterArray = new CSV(afterText).parse();

    indices = beforeArray[0];
    dmp = new diff_match_patch();

    main = document.getElementsByTagName('main')[0];
    containsUpdateDate = document.getElementById('contains-update-date');
    searchButton = document.getElementById('search');
    subjectDiffNo = document.getElementById('subject-diff-no');

    searchButton.addEventListener('click', () => { search() });
    search();
}


const search = () => {
    main.innerHTML = '';

    const beforeMap = {};
    beforeArray.forEach((_line) => {
        const line = [..._line];
        if (!containsUpdateDate.checked) {
            line.splice(16, 1);
        }
        beforeMap[line[0]] = line;
    });

    const afterMap = {};
    afterArray.forEach((_line) => {
        const line = [..._line];
        if (!containsUpdateDate.checked) {
            line.splice(16, 1);
        }
        afterMap[line[0]] = line;
    });

    let count = 0;
    for (const code in beforeMap) {
        if (!(code in afterMap)) {
            continue;
        }
        const beforeLine = beforeMap[code];
        const afterLine = afterMap[code];

        // diff
        let diffText = '';
        for (const key in beforeLine) {
            if (beforeLine[key] == afterLine[key]) {
                continue;
            }
            const diff = dmp.diff_main(beforeLine[key], afterLine[key]);
            let [beforeDiff, afterDiff] = ['', ''];
            for (const key in diff) {
                const item = diff[key];
                if (item[0] == 0) {
                    beforeDiff += item[1];
                    afterDiff += item[1];
                }
                if (item[0] == -1) {
                    beforeDiff += `<span class="removed">${item[1]}</span>`;
                }
                if (item[0] == 1) {
                    afterDiff += `<span class="added">${item[1]}</span>`;
                }
            }
            if (beforeDiff == '') {
                beforeDiff = '<span class="empty">（入力なし）</span>';
            }
            if (afterDiff == '') {
                afterDiff = '<span class="empty">（入力なし）</span>';
            }
            diffText += `<li><ul><li>${indices[key]}：${beforeDiff}</li><li>${indices[key]}：${afterDiff}</li></ul></li>`;
        }

        if (diffText != '') {
            const a = document.createElement('a');
            const item = document.createElement('div');
            const body = document.createElement('div');
            const diff = document.createElement('ul');
            item.className = 'item';
            body.className = 'body';
            diff.className = 'diff';
            a.href = `https://kdb.tsukuba.ac.jp/syllabi/2021/${beforeLine[0]}/jpn`;
            body.innerHTML = beforeLine;
            diff.innerHTML = diffText;
            
            item.appendChild(body);
            item.appendChild(diff);
            a.appendChild(item);
            main.appendChild(a);
            count++;
        }
    }

    subjectDiffNo.innerHTML = count;
}