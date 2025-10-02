const MD = new showdown.Converter();
MD.setOption('tables', true);
MD.setOption('metadata', true);

const g_camps = [];
const g_newsletters = [];

// used by menu.css
function updatemenu() {
  if (document.getElementById('responsive-menu').checked == true) {
    document.getElementById('menu').style.borderBottomRightRadius = '0';
    document.getElementById('menu').style.borderBottomLeftRadius = '0';
  }else{
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
        try{
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
        } catch {}
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

function fetchSidebar() {
    try {
        const link = `/content/sidebar.md`;
        fetch(link)
        .then(response => response.text())
        .then(md => {
            const html = MD.makeHtml(md);
            const container = document.getElementById('sidebar_container');
            container.innerHTML = html;
            fixupLinks(container);
        })
        .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

function fetchContent(link) {
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

function fetchCamp(year, name) {
    try {
        const url = `content/camp/${year}/${name}.md`;
        fetch(url)
        .then(response => response.text())
        .then(md => {
            // this step is required
            const html = MD.makeHtml(md);
            const campInfo = MD.getMetadata();
            if (campInfo) {
                campInfo.url = url;
                console.log(campInfo);
                g_camps.push(campInfo);
            }
        })
        .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

function fetchCamps() {
    try {
        const link = `/data/camps.yaml`;
        fetch(link)
        .then(response => response.text())
        .then(data => {
            const campData = jsyaml.load(data);
            campData.forEach((campYear) => {
                campYear.camps.forEach((name) => {
                    fetchCamp(campYear.year, name);
                });
            });
        })
        .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

function fetchNewsletters() {
    try {
        const link = `/data/newsletters.yaml`;
        fetch(link)
        .then(response => response.text())
        .then(data => {
            const newsData = jsyaml.load(data);
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
    fetchCamps();
    fetchNewsletters();
    fetchSidebar();
};
