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

function createRow(data, isHeader) {
    const row = document.createElement('tr');
    let i = 0;
    data.forEach(cellContent => {
        const th = document.createElement(isHeader ? 'th' : 'td');
        if (i++ < 2) {
            // hide the first two rows - start and end date, used for sorting
            th.classList.add('hidden');
        }
        if (typeof cellContent === 'object') {
            th.appendChild(cellContent);
        } else {
            th.innerHTML = cellContent;
        }
        row.appendChild(th);
    });
    return row;
}

function buildCampTable() {
    // first two columns are hidden
    const headerData = ['0', 'Start', 'End', 'Camp'];

    g_campTable = document.createElement('table');
    const thead = g_campTable.createTHead();
    thead.appendChild(createRow(headerData));
    g_campTable.appendChild(thead);

    g_campTBody = g_campTable.createTBody();
    g_campTable.appendChild(g_campTBody);
}

function sortCampTable() {
    let rows, i, x, y, shouldSwitch;
    let table = g_campTBody;
    let switching = true;
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = parseInt(rows[i].getElementsByTagName("td")[0].innerHTML);
            y = parseInt(rows[i + 1].getElementsByTagName("td")[0].innerHTML);
            if (x > y) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

function fetchSidebar() {
    try {
        const link = `/content/sidebar.md`;
        fetch(link)
            .then(response => response.text())
            .then(md => {
                const html = MD.makeHtml(md);
                let container = document.getElementById('sidebar_container');
                container.innerHTML = html;
                fixupLinks(container);

                container = document.getElementById('upcomming');
                container.appendChild(g_campTable);
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
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

async function fetchCamp(year, name) {
    try {
        const url = `content/camp/${year}/${name}.md`;
        fetch(url)
            .then(response => response.text())
            .then(md => {
                // this step is required
                const html = MD.makeHtml(md);
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

function formatCampDate(date) {
    let options = { weekday: 'short', timeZone: "UTC" };
    const weekday = date.toLocaleDateString("en-US", options);
    options = { month: 'short', timeZone: "UTC" };
    const month = date.toLocaleDateString("en-US", options);
    options = { day: 'numeric', timeZone: "UTC" };
    const day = date.toLocaleDateString("en-US", options);

    const card = DOM.createArticle('date');

    let e = DOM.createDiv('month');
    e.textContent = month;
    card.appendChild(e);

    e = DOM.createDiv('day');
    e.textContent = day;
    card.appendChild(e);

    e = DOM.createDiv('weekday');
    e.textContent = weekday;
    card.appendChild(e);

    return card;
}

async function fetchCampYear(year) {
    try {
        const url = `content/camp/${year}/camps.json`;
        fetch(url)
            .then(response => response.json())
            .then(camps => {
                console.log(`---- ${year} ----`)

                for (let [camp, info] of Object.entries(camps)) {
                    info.name = `${g_campData.camps[camp]}`;
                    info.year = year;
                    info.url = `content/camp/${year}/${camp}.md`;
                    if (info.md === undefined) {
                        info.md = false;
                    }
                    if (info.hide === undefined) {
                        info.hide = info.md;
                    }
                    info.start = new Date(info.start);
                    info.end = new Date(info.end);
                    console.log(info);
                    g_camps.push(info);

                    if (info.end >= now) {
                        const row = createRow([
                            info.start.getMilliseconds(),
                            info.end.getMilliseconds(),
                            formatCampDate(info.start),
                            `${info.name} ${info.year}`
                        ]);
                        g_campTBody.appendChild(row);
                    }
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
                console.log(g_campData);

                g_campData.years.forEach((year) => {
                    fetchCampYear(year);
                });

                // TODO: add each camp to table when fetched

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
