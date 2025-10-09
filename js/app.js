const MD = new showdown.Converter();
MD.setOption('tables', true);
MD.setOption('metadata', true);

const g_camps = [];
const g_newsletters = [];
let g_campGeneral = {};     // camp names & years

// used by menu.css
function updatemenu() {
    if (document.getElementById('responsive-menu').checked == true) {
        document.getElementById('menu').style.borderBottomRightRadius = '0';
        document.getElementById('menu').style.borderBottomLeftRadius = '0';
    } else {
        document.getElementById('menu').style.borderRadius = '10px';
    }
}

// --------------------------------------------------------------
// For internal pages, add an onclick handler.
// For pdfs and external links, open in a separate tab
function fixupLinks(container, page) {
    const domainName = window.location.hostname;
    const anchors = container.querySelectorAll('a');
    anchors.forEach(anchor => {
        if (!anchor.href) {
            return;
        }
        try {
            const url = new URL(anchor.href);
            if (url.hostname == domainName) {
                anchor.addEventListener('click', (e) => {
                    const url = new URL(anchor.href);
                    let link = null;
                    for (const [key, value] of url.searchParams) {
                        link = `${key}/${value}`;
                        fetchContent(link);
                        e.preventDefault();
                        break;
                    }

                    if (link === null) {
                        anchor.target = '_other';
                    } else {
                        history.pushState({
                            url: anchor.href
                        }, "", url);
                    }
                })
                return;
            } else {
                anchor.target = '_other';
            }
        }
        catch (error) {
            console.log(`   error; ${anchor.href}`)
            console.error(error);
        }
    });
}

// handle the backbutton
window.addEventListener("popstate", (event) => {
    console.log(`history state: ${JSON.stringify(event.state)}`);
    if (event.state && event.state.url) {
        const url = new URL(event.state.url);
        fetchContentFromSearchParams(url.searchParams);
    }
});

function formatDateLong(date) {
    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: "UTC"
    };
    return date.toLocaleString('en-US', options);
}

function fixupCampCard(year, camp) {
    try {
        fetch(`content/camp/${year}/camps.json`)
            .then(response => response.json())
            .then(json => {
                const dateDiv = document.getElementById('camp-card');
                if (dateDiv) {
                    const campInfo = json[camp];

                    const card = DOM.article();
                    let e = DOM.elem('h1');
                    e.textContent = `${g_campGeneral.names[camp]} ${year}`;
                    card.appendChild(e);

                    e = DOM.elem('h2');
                    e.textContent = campInfo.speaker
                                        ? `"${campInfo.topic}" with ${campInfo.speaker}`
                                        : campInfo.topic;
                    card.appendChild(e);

                    e = DOM.elem('p');
                    const start = formatDateLong(new Date(campInfo.start));
                    const end = formatDateLong(new Date(campInfo.end));
                    e.textContent = `${start} -- ${end}`;
                    card.appendChild(e);

                    if (campInfo.img && campInfo.speaker) {
                        const img = DOM.img(campInfo.img, campInfo.speaker)
                        card.appendChild(img);
                    }

                    dateDiv.appendChild(card);
                }
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

function fetchMenu() {
    try {
        const link = `/content/menu.html`;
        fetch(link)
            .then(response => response.text())
            .then(html => {
                const container = document.getElementById('menu_container');
                container.innerHTML = html;
                fixupLinks(container, 'menu.html');
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

async function fetchContentFromSearchParams(params) {
    let link = null;
    for (const [key, value] of params) {
        link = `${key}/${value}`;
        break;
    }
    if (link === null) {
        link = 'info/home';
    }

    await fetchContent(link);
}

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

async function fetchContent(link) {
    try {
        fetch(`content/${link}.md`)
            .then(response => response.text())
            .then(md => {
                const container = document.getElementById('content_container');
                const html = MD.makeHtml(md);
                const meta = MD.getMetadata();
                container.innerHTML = html;
                fixupLinks(container, `${link}.md`);

                const parts = link.split('/');
                const year = parts.length > 1 ? parts[1] : null;
                const camp = parts.length > 2 ? parts[2] : null;

                if (year && camp) {
                    // is this a camp page?
                    console.log(`link: ${link}`)
                    if (link.startsWith('camp/')) {
                        fixupCampCard(year, camp);
                    }

                    const workshopDiv = document.getElementById('workshop-area');
                    if (workshopDiv) {
                        fetchWorkshops(workshopDiv, year, camp);
                    }

                } else {
                    const campDiv = document.getElementById('camp-area');
                    if (campDiv) {
                        fetchCampList(campDiv, meta.filter);
                    }
                }
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

async function fetchCampYear(year) {
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

async function fetchCamps() {
    try {
        const link = `/content/camp/general.json`;
        fetch(link)
            .then(response => response.json())
            .then(data => {
                g_campGeneral = data;

                g_campGeneral.years.forEach((year) => {
                    fetchCampYear(year);
                });
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

async function fetchNewsletters() {
    try {
        const link = `/data/newsletters.json`;
        fetch(link)
            .then(response => response.json())
            .then(newsData => {
                newsData.forEach((news) => {
                    g_newsletters.push(newsData);
                });
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

window.onload = () => {
    buildCampTable();
    fetchMenu();

    const urlParams = new URLSearchParams(window.location.search);
    fetchContentFromSearchParams(urlParams);
    fetchNewsletters();
    fetchSidebar();
    fetchCamps();
};
