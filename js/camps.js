const c_campTypes = [
    "jul",
    "aug",
    "cae",
    "win"
];

const MAX_PAST_YEARS = 10;
const MAX_FUTURE_YEARS = 2;

const g_camps = [];

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

async function fetchCampYearPrev(year) {
    const now = new Date();
    try {
        const url = `content/camp/${year}/camps.json`;
        fetch(url)
            .then(response => response.json())
            .then(camps => {
                for (let [camp, info] of Object.entries(camps)) {
                    info.camp = camp;
                    info.name = `${g_campGeneral.names[camp]}`;
                    info.year = year;
                    info.url = `content/camp/${year}/${camp}.md`;
                    if (info.md === undefined) {
                        info.md = false;
                    }
                    if (info.hide === undefined) {
                        info.hide = info.md === undefined;
                    }
                    info.start = new Date(info.start);
                    info.end = new Date(info.end);

                    g_camps.push(info);
                    addCampToTable(info, now);
                }
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

async function fetchCampsPrev() {
    try {
        const link = `/content/camp/general.json`;
        fetch(link)
            .then(response => response.json())
            .then(data => {
                g_campGeneral = data;

                g_campGeneral.years.forEach((year) => {
                    fetchCampYearPrev(year);
                });
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

function storeCamp(type, year, md) {
    const html = MD.makeHtml(md);
    const meta = MD.getMetadata();
    try {
        const camp = {
            html,
            meta
        };

        if (g_camps[year] === undefined) {
            g_camps[year] = [];
        }
        g_camps[year][type] = camp;

        console.log(`store: ${camp.meta.name}`);
    } catch (error) {
        console.error(error);
    }
}

async function fetchCamp(type, year) {
    const shortYear = year % 100;
    const url = `content/camp/${year}/${type}${shortYear}.md`;
    let success = false;
    // content/camp/2024/jul24.md
    await fetch(url)
        .then(response => response.text())
        .then(md => {
            storeCamp(type, year, md);
            // todo: update camp info
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
    const baseYear = new Date().getFullYear();
    let success = await fetchCampYear(baseYear);
}
