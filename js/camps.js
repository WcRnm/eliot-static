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

        if (info.img && info.speaker) {
            const img = DOM.img(`/img/${info.img}`, info.speaker)
            DOM.addClass(img, 'float-right-300');
            card.appendChild(img);
        }

        let e = DOM.elem('h1');
        e.textContent = info.name;
        card.appendChild(e);

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

    // TODO: validate camp metadata

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
            html, // TODO: do not refetch the camp html - used the cached version
            meta
        };
        console.log(`store: ${camp.meta.name}`);

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
