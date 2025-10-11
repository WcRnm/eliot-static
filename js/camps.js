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

async function fetchCampList(container, filter) {
    const past = filter === 'past';
    const now = new Date();
    const pastCamps = [];

    // sort descending
    g_camps.sort((a, b) => {
        return b.start - a.start;
    });

    // filter out future camps
    g_camps.forEach(info => {
        if (info.end < now) {
            pastCamps.push(info);
        }
    });

    console.log('-- past camps ---');
    pastCamps.forEach(info => {
        console.log(`  ${info.year} ${info.camp}`);
        const card = formatCampCard(info);
        container.appendChild(card);
    });
}

function storeCamp(type, year, md, mdFile) {
    const html = MD.makeHtml(md);
    const meta = MD.getMetadata();

    // TODO: validate camp metadata

    // fix up the meta data
    meta.show = meta.show == "false" ? false : true;
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
