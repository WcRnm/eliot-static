const c_campTypes = [
    "jul",
    "aug",
    "cae",
    "win"
];

const MAX_PAST_YEARS = 10;
const MAX_FUTURE_YEARS = 2;
const REFRESH_INTERVAL_SEC = 1 * 24 * 60 * 60;

let g_camps = [];
let g_now = new Date();

function fixupCampCard(container, year, camp) {
    try {
        const info = g_camps[year][camp].meta;
        const card = DOM.article();

        let e = DOM.elem('h1');
        e.textContent = info.name;
        card.appendChild(e);

        if (info.photo) {
            const url = `content/camp/${year}/img/${info.photo}`;
            const altText = info.speaker ? info.speaker : info.title;
            const photoImg = DOM.img(url, altText)
            DOM.addClass(photoImg, 'float-right-300');
            card.appendChild(photoImg);
        }

        e = DOM.elem('h2');
        e.textContent = info.speaker
            ? `"${info.title}" with ${info.speaker}`
            : info.title;
        card.appendChild(e);

        e = DOM.elem('p');
        const start = formatDateLong(new Date(info.start));
        const end = formatDateLong(new Date(info.end));
        e.textContent = `${start} -- ${end}`;
        card.appendChild(e);

        container.appendChild(card);
    }
    catch (error) {
        console.error(error);
    }
}

function storeCamp(type, year, md, mdFile) {
    const html = MD.makeHtml(md);
    const meta = MD.getMetadata();

    // fix up the meta data
    meta.show = !(meta.show == "false");
    if (meta.show === false) {
        return;
    }

    meta.year = year;
    meta.mdFile = mdFile;
    meta.start = new Date(meta.start);
    meta.end = new Date(meta.end);

    try {
        const camp = {
            html,
            meta
        };
        if (g_camps[year] === undefined) {
            g_camps[year] = [];
        }
        g_camps[year][type] = camp;

        addCampToTable(camp.meta, g_now);
    } catch (error) {
        console.error(error);
    }
}

async function fetchCamp(type, year) {
    const shortYear = year % 100;
    const mdFile = `${type}${shortYear}`;
    const url = `content/camp/${year}/${mdFile}.md`;
    let success = false;
    // content/camp/2024/jul24.md
    await fetch(url)
        .then(response => response.text())
        .then(md => {
            storeCamp(type, year, md, mdFile);
            success = true;
        })
        .catch(error => console.error(error));
    return success;
}

async function fetchCampYear(year) {
    let success = false;
    const count = c_campTypes.length;
    for (var i = 0; i < count; ++i) {
        const result = await fetchCamp(c_campTypes[i], year);
        success = success || result;
    };
    return success;
}

async function fetchCamps() {
    g_camps = [];
    g_now = new Date();
    const baseYear = new Date().getFullYear();
    await fetchCampYear(baseYear);
    let nextYear = await fetchCampYear(baseYear + 1);
    let prevYear = await fetchCampYear(baseYear - 1);

    setTimeout(fetchCamps, (REFRESH_INTERVAL_SEC * 1000));
}

function sortPast(a, b) {
    return b.meta.start - a.meta.start;
}
function sortFuture(a, b) {
    return a.meta.start - b.meta.start;
}

function getSortedCamps(past) {
    const now = new Date();
    const camps = [];

    // filter out future camps
    g_camps.forEach(campYear => {
        for (let [_, info] of Object.entries(campYear)) {
            // a currently running camp counts as a future/upcomming camp
            if (past) {
                if (now > info.meta.end) {
                    camps.push(info);
                }
            } else {
                if (info.meta.end > now) {
                    camps.push(info);
                }
            }
        }
    });

    camps.sort(past ? sortPast : sortFuture);
    return camps;
}

async function showCamps(container, filter) {
    const camps = getSortedCamps(filter === 'past');

    camps.forEach(info => {
        const card = formatCampCard(info.meta);
        container.appendChild(card);
    });
}

async function showBoard(container) {
    g_board.forEach(group => {
        const heading = DOM.elem('h2');
        heading.textContent = group.name;
        container.appendChild(heading);

        group.members.forEach(member => {
            const text = member.position
                ? `${member.name}, ${member.position}`
                : member.name;
            const figure = DOM.elem('figure');
            const caption = DOM.elem('figcaption');
            caption.textContent = text;
            figure.appendChild(caption);

            const url = `/content/img/board/${member.photo}`;
            const img = DOM.img(url, text);
            DOM.addClass(img, 'sq200');
            figure.appendChild(img);

            container.appendChild(figure);
        });
    });
}

async function showFees(container) {
    for (const [key, table] of Object.entries(g_table.fees)) {
        if (key == KEY_SURCHARGES) {
            const heading = DOM.elem('h2');
            heading.textContent = table.name;
            container.appendChild(heading);

            const list = DOM.list(false, table.desc);
            container.appendChild(list);
            container.appendChild(table.table);

        } else {
            const heading = DOM.elem('h2');
            heading.textContent = table.name;
            container.appendChild(heading);

            const list = DOM.list(false, table.desc);
            container.appendChild(list);
            container.appendChild(table.table);
        }

        // TODO: update range spans
    }
}