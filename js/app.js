const MD = new showdown.Converter();
MD.setOption('tables', true);
MD.setOption('metadata', true);

const g_camps = [];
const g_newsletters = [];
let g_campData = {};        // camp names & years
let g_campTable = null;     // sidebar table
let g_campTBody = null;     // sidebar table
let now = new Date();

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
function fixupLinks(container) {
    const domainName = window.location.hostname;
    const anchors = container.querySelectorAll('a');
    anchors.forEach(anchor => {
        try {
            const url = new URL(anchor.href);
            if (url.hostname == domainName) {
                anchor.addEventListener('click', (e) => {
                    const url = new URL(anchor.href);
                    console.log(`onClick ${url.searchParams}`);
                    let link = null;
                    for (const [key, value] of url.searchParams) {
                        link = `${key}/${value}`;
                        fetchContent(link);
                        e.preventDefault();
                        break;
                    }

                    if (link === null) {
                        anchor.target = '_other';
                    }
                })
                return;
            } else {
                anchor.target = '_other';
            }
        } catch { }
    });
}

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

                    let e = DOM.elem('h2');
                    e.textContent = campInfo.speaker
                                        ? `"${campInfo.topic}" with ${campInfo.speaker}`
                                        : campInfo.topic;
                    card.appendChild(e);

                    e = DOM.elem('p');
                    e.textContent = campInfo.speaker;
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
                fixupLinks(container);
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

async function fetchContent(link) {
    try {
        fetch(`content/${link}.md`)
            .then(response => response.text())
            .then(md => {
                const container = document.getElementById('content_container');
                const html = MD.makeHtml(md);
                container.innerHTML = html;
                fixupLinks(container);

                // is this a camp page?
                console.log(`link: ${link}`)
                if (link.startsWith('camp/')) {
                    const parts = link.split('/');
                    const year = parts[1];
                    const camp = parts[2];
                    fixupCampCard(year, camp);
                }
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

async function fetchCampYear(year) {
    try {
        const url = `content/camp/${year}/camps.json`;
        fetch(url)
            .then(response => response.json())
            .then(camps => {
                for (let [camp, info] of Object.entries(camps)) {
                    info.camp = camp;
                    info.name = `${g_campData.camps[camp]}`;
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
                    addCampToTable(info);
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
        now = new Date();
        const link = `/data/camps.json`;
        fetch(link)
            .then(response => response.json())
            .then(data => {
                g_campData = data;
                //console.log(g_campData);

                g_campData.years.forEach((year) => {
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
    let link = null;
    for (const [key, value] of urlParams) {
        link = `${key}/${value}`;
        break;
    }
    if (link === null) {
        link = 'info/home';
    }

    fetchContent(link);
    fetchNewsletters();
    fetchSidebar();
    fetchCamps();
};
