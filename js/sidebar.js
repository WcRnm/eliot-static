const g_table = {
    camps: {
        table: null,
        body: null,
    },
    news: {
        table: null,
        body: null,
    },
    fees: {}
};

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
                tableContainer.appendChild(g_table.camps.table);

                tableContainer = document.getElementById('newsletters');
                tableContainer.appendChild(g_table.news.table);

                fixupLinks(container, link);
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

function createCampTableRow(data, isHeader) {
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
        const row = createCampTableRow([
            info.start.getTime(),
            info.end.getTime(),
            formatCampCard(info)
        ]);
        g_table.camps.body.appendChild(row);
        sortCampTable();
    }
}

function buildTables() {
    let table = g_table.camps;
    table.table = DOM.elem('table', 'camp-table');
    let thead = table.table.createTHead();
    table.table.appendChild(thead);

    table.body = table.table.createTBody();
    table.table.appendChild(table.body);

    // also build the newsletter table
    table = g_table.news;
    table.table = DOM.elem('table', 'news-table');
    thead = table.table.createTHead();
    table.body = table.table.createTBody();
    table.table.appendChild(table.body);
}

function sortTable(table, col, reverse) {
    let tr = Array.prototype.slice.call(table.body.rows, 0), // put rows into array
        i;
    reverse = -((+reverse) || -1);
    tr = tr.sort(function (a, b) {
        return reverse // `-1 *` if want opposite order
            * (a.cells[col].textContent.trim()
                .localeCompare(b.cells[col].textContent.trim())
            );
    });
    for (i = 0; i < tr.length; ++i) table.body.appendChild(tr[i]); // append each row in order
}

function sortCampTable() {
    sortTable(g_table.camps, 0, 0);
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

function createTableRow(data, isHeader, className) {
    const row = DOM.elem('tr', className);
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

function formatNewsletterDate(date) {
    let options = { month: 'numeric',
                day: 'numeric',
                year: '2-digit',
                timeZone: "UTC" };
    return date.toLocaleDateString("en-US", options);
}

function addNewsletterToTable(news) {
    // newsletters are pre-sorted

    const url = `/content/pdf/news/${news.pdf}`;
    const anchor = DOM.anchor(url, news.name);
    const dateString = formatNewsletterDate(news.date);
    const data = [anchor, dateString];
    const row = createTableRow(data, false, 'news-row');
    g_table.news.body.appendChild(row);
}

function buildFeeTable(key, name, buildings) {
    const table = DOM.elem('table', 'fee-table');
    const thead = table.createTHead();
    const tbody = table.createTBody();
    table.appendChild(tbody);

    g_table.fees[key] = {
        name: name,
        buildings: buildings,
        table: table,
        head: thead,
        body: tbody,
    }
}

function updateFeeTables() {
    g_table.fees = {};

    const cols = g_fees.fee_columns;

    for (tier of g_fees.tiers) {
        console.log(tier.key);
        buildFeeTable(tier.key, tier.name, tier.buildings);
        const row = createTableRow(cols, true, 'fee-row');
        g_table.fees[tier.key].head.appendChild(row);

        const tierData = g_fees.fees[tier.key];

        for (let i=0; i<g_fees.fee_rows.length; ++i) {
            const rowData = [g_fees.fee_rows[i]].concat(tierData[i]);
            const row = createTableRow(rowData, true, 'fee-row');
            g_table.fees[tier.key].body.appendChild(row);
        }
    }

    const key = 'surcharges'
    const surchargeRows = g_fees.surcharges.rows;
    const surchargeData = g_fees.surcharges.data;
    console.log(key);
    buildFeeTable(key);
    const row = createTableRow(cols, true, 'fee-row');
    g_table.fees[key].head.appendChild(row);
    for (let i=0; i<surchargeData.length; ++i) {
        const rowData = [surchargeRows[i]].concat(surchargeData[i]);
        const row = createTableRow(rowData, true, 'fee-row');
        g_table.fees[key].body.appendChild(row);
    }
}