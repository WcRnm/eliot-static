let g_campTable = null;
let g_campTBody = null;

let g_newsTable = null;
let g_newsTBody = null;

function fetchSidebar() {
    try {
        const link = `/content/sidebar.md`;
        fetch(link)
            .then(response => response.text())
            .then(md => {
                const html = MD.makeHtml(md);
                const container = document.getElementById('sidebar_container');
                container.innerHTML = html;

                let tableContainer = document.getElementById('upcomming');
                tableContainer.appendChild(g_campTable);

                tableContainer = document.getElementById('newsletters');
                tableContainer.appendChild(g_newsTable);

                fixupLinks(container, link);
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

function createRow(data, isHeader) {
    const row = DOM.elem('tr', 'camp-row');
    let i = 0;
    data.forEach(cellContent => {
        const cell = document.createElement(isHeader ? 'th' : 'td');
        if (i++ < 2) {
            // hide the first two rows - start and end date, used for sorting
            cell.classList.add('hidden');
        }
        if (typeof cellContent === 'object') {
            cell.appendChild(cellContent);
        } else {
            cell.innerHTML = cellContent;
        }
        row.appendChild(cell);
    });
    return row;
}

function addCampToTable(info, now) {
    if (info.end >= now) {
        const row = createRow([
            info.start.getTime(),
            info.end.getTime(),
            formatCampCard(info)
        ]);
        g_campTBody.appendChild(row);
        sortCampTable();
    }
}

function buildCampTable() {
    g_campTable = DOM.elem('table', 'camp-table');
    let thead = g_campTable.createTHead();
    g_campTable.appendChild(thead);

    g_campTBody = g_campTable.createTBody();
    g_campTable.appendChild(g_campTBody);

    // also build the newsletter table
    g_newsTable = DOM.elem('table', 'news-table');
    thead = g_newsTable.createTHead();
    let headerData = ['Date', 'Newsletter'];
    thead.appendChild(createNewsRow(headerData));
    g_newsTBody = g_newsTable.createTBody();
    g_newsTable.appendChild(g_newsTBody);
}

function sortTable(table, col, reverse) {
    let tb = table.tBodies[0],
        tr = Array.prototype.slice.call(tb.rows, 0), // put rows into array
        i;
    reverse = -((+reverse) || -1);
    tr = tr.sort(function (a, b) {
        return reverse // `-1 *` if want opposite order
            * (a.cells[col].textContent.trim()
                .localeCompare(b.cells[col].textContent.trim())
            );
    });
    for (i = 0; i < tr.length; ++i) tb.appendChild(tr[i]); // append each row in order
}

function sortCampTable() {
    sortTable(g_campTable, 0, 0);
}

function dateParts(date) {
    let options = { weekday: 'short', timeZone: "UTC" };
    const weekday = date.toLocaleDateString("en-US", options);
    options = { month: 'short', timeZone: "UTC" };
    const month = date.toLocaleDateString("en-US", options);
    options = { day: 'numeric', timeZone: "UTC" };
    const day = date.toLocaleDateString("en-US", options);

    return {
        "weekday": weekday,
        "month": month,
        "day": day
    }
}

function formatCampDate(date) {
    const dp = dateParts(date);

    const card = DOM.createArticle('date');

    let e = DOM.div('month');
    e.textContent = dp.month;
    card.appendChild(e);

    e = DOM.div('day');
    e.textContent = dp.day;
    card.appendChild(e);

    e = DOM.div('weekday');
    e.textContent = dp.weekday;
    card.appendChild(e);

    return card;
}

function formatCampCard(info) {
    const card = DOM.article('camp');

    const campName = DOM.div('camp-name');
    const a = DOM.anchor(`?camp=${info.year}/${info.mdFile}`, info.name);
    campName.appendChild(a);
    card.appendChild(campName);

    const dateline = DOM.div('camp-start');
    const start = dateParts(info.start);
    const end = dateParts(info.end);
    dateline.innerHTML = `${start.weekday} ${start.month} ${start.day} &mdash; ${end.weekday} ${end.month} ${end.day}`;
    card.appendChild(dateline);

    if (info.title) {
        const campTitle = DOM.div('camp-topic');
        campTitle.textContent = info.title;
        if (info.subtitle) {
            campTitle.textContent += `: ${info.subtitle}`;
        }
        card.appendChild(campTitle);
    }

    if (info.speaker) {
        const speaker = DOM.div('camp-speaker');
        speaker.textContent = `with ${info.speaker}`;
        card.appendChild(speaker);
    }

    fixupLinks(card, `card=${info.year}/${info.camp}`);

    return card;
}

function createNewsRow(data, isHeader) {
    const row = DOM.elem('tr', 'news-row');
    let i = 0;
    data.forEach(cellContent => {
        const cell = document.createElement(isHeader ? 'th' : 'td');
        if (typeof cellContent === 'object') {
            cell.appendChild(cellContent);
        } else {
            cell.innerHTML = cellContent;
        }
        row.appendChild(cell);
    });
    return row;
}

function addNewsletterToTable(news) {
    // newsletters are pre-sorted

    const url = `/pdf/news/${news.pdf}`;
    const anchor = DOM.anchor(url, news.name);
    const data = [news.date.toLocaleDateString(), anchor];
    const row = createNewsRow(data, false);
    g_newsTBody.appendChild(row);
}