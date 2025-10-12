const MD = new showdown.Converter();
MD.setOption('tables', true);
MD.setOption('metadata', true);

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
                let camp = parts.length > 2 ? parts[2] : null;
                if (camp) {
                    const firstNumber = camp.match(/[0-9]+/);
                    camp = camp.substring(0, camp.indexOf(firstNumber)); //
                }

                if (year && camp) {
                    // is this a camp page?
                    console.log(`link: ${link}`)
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
                    const campDiv = document.getElementById('camp-area');
                    if (campDiv) {
                        showCamps(campDiv, meta.filter);
                    }
                }
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

function sortNews(a,b) {
    return (a.date < b.date);
}

async function fetchNewsletters() {
    console.log("fetch Newsletters");
    try {
        const link = `/content/newsletters.json`;
        fetch(link)
            .then(response => response.json())
            .then(newsletters => {
                newsletters.forEach((news) => {
                    news.date = new Date(news.date);
                    addNewsletterToTable(news);
                });
            })
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

async function onLoad() {
    const urlParams = new URLSearchParams(window.location.search);

    buildCampTable();
    fetchMenu();
    fetchNewsletters();
    fetchSidebar();
    await fetchCamps();
    fetchContentFromSearchParams(urlParams);
}

window.onload = () => {
    onLoad();
};
