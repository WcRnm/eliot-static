const MD = new showdown.Converter();
MD.setOption('tables', true);
MD.setOption('metadata', true);

let g_board = [];
let g_fees = {};
let g_docs = {};
let g_links = {};

const logger = new Logger();

// --------------------------------------------------------------
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
    const tag = 'fixupLinks: <' + container.tagName.toLowerCase() + '>' + container.id;
    logger.debug('++' + tag);
    const domainName = window.location.hostname;
    const anchors = container.querySelectorAll('a');
    anchors.forEach(anchor => {
        if (anchor.href) {
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
            } catch (error) {
                logger.error(`   error; ${anchor.href}`)
                logger.error(error);
            }
        }});
    logger.debug('--' + tag);
}

// see: data/links.yaml and data/docs.yaml
function getData(data, key, tag) {
    if (data.hasOwnProperty(key)) {
        if(data[key].hasOwnProperty(tag)) {
            return data[key][tag];
        }
    }
    return '';
}
function insertData(container) {
    const elems = container.querySelectorAll('span');
    elems.forEach(elem => {
        const id = elem.id.split('.');
        if (id.length === 3) {
            const type = id[0];
            const key = id[1];
            const tag = id[2];

            let url;
            switch(type) {
                case 'doc':
                    const doc = getData(g_docs, key, tag);
                    if (doc) {
                        url = `/content/pdf/${key}/${doc}`;
                    }
                    break;
                case 'link':
                    url = getData(g_links, key, tag);
                    break
                default:
                    return;
            }
            if (url) {
                const a = DOM.anchor(url, elem.textContent);
                elem.replaceChildren(a);
            }
        }
    });
}

// see: data/docs.yaml
function insertDocs(container) {
    const elems = container.querySelectorAll('doc');
    elems.forEach(elem => {
        const id = elem.id.split('.');
        logger.debug(elem.id);
    });
}

// handle the backbutton
window.addEventListener("popstate", (event) => {
    logger.info(`history state: ${JSON.stringify(event.state)}`);
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
            .catch(error => logger.error(error));
    }
    catch (error) {
        logger.error(error);
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

async function fetchContent(link) {
    try {
        await fetch(`content/${link}.md`)
            .then(response => response.text())
            .then(md => {
                logger.debug('got content: ' + link);
                const container = document.getElementById('content_container');
                const html = MD.makeHtml(md);
                const meta = MD.getMetadata();
                container.innerHTML = html;
                container.id = link;
                insertData(container);
                fixupLinks(container);

                const parts = link.split('/');
                const year = parts.length > 1 ? parts[1] : null;
                let camp = parts.length > 2 ? parts[2] : null;
                if (camp) {
                    const firstNumber = camp.match(/[0-9]+/);
                    camp = camp.substring(0, camp.indexOf(firstNumber)); //
                }

                if (year && camp) {
                    // is this a camp page?
                    logger.info(`link: ${link}`)
                    if (link.startsWith('camp/')) {
                        const campCard = DOM.div('camp-card');
                        container.prepend(campCard);
                        fixupCampCard(campCard, year, camp);
                    }

                    const workshopDiv = document.getElementById('workshop-area');
                    if (workshopDiv) {
                        fetchWorkshops(workshopDiv, year, camp);
                    }

                } else {
                    let container = document.getElementById('camp-area');
                    if (container) {
                        showCamps(container, meta.filter);
                    }
                    container = document.getElementById('board-area');
                    if (container) {
                        showBoard(container);
                    }
                    container = document.getElementById('fee-area');
                    if (container) {
                        showFees(container);
                    }
                }
            })
            .catch(error => logger.error(error));
    }
    catch (error) {
        logger.error(error);
    }
}

function sortNews(a,b) {
    return (a.date < b.date);
}

async function fetchYaml(link, defaultVal, cb) {
    return await fetch(link)
        .then(response => response.text())
        .then(data => {
            cb(jsyaml.load(data, 'utf8'));
        })
        .catch(error => {
            logger.error(error);
            cb(defaultVal);
        });
}

async function fetchAllData() {
    logger.debug('++fetchAllData');
    fetchYaml(`/content/data/fees.yaml`, {}, fees => {
        g_fees = fees;
        logger.debug('got fees');
        updateFeeTables();
    });

    fetchYaml(`/content/data/docs.yaml`, {}, docs => {
        g_docs = docs;
        logger.debug('got docs');
    });

    fetchYaml(`/content/data/links.yaml`, {}, links => {
        g_links = links;
        logger.debug('got links');
    });

    fetchYaml('/content/data/board.yaml', [], board => {
        g_board = board;
        logger.debug('got board');
    });

    fetchYaml('/content/data/newsletters.yaml', [], newsletters => {
        newsletters.forEach((info) => {
            info.date = new Date(info.date);
            addNewsletterToTable(info);
        });
        logger.debug('got newsletters');
    });

    logger.debug('--fetchAllData');
}

async function onLoad() {
    const urlParams = new URLSearchParams(window.location.search);

    buildTables();
    fetchMenu();
    fetchAllData();
    fetchCamps();

    fetchSidebar();
    fetchContentFromSearchParams(urlParams);
}

window.onload = () => {
    onLoad();
};
