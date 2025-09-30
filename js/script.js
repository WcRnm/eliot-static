var converter = new showdown.Converter();
converter.setOption('tables', 'on')

// used by menu.css
function updatemenu() {
  if (document.getElementById('responsive-menu').checked == true) {
    document.getElementById('menu').style.borderBottomRightRadius = '0';
    document.getElementById('menu').style.borderBottomLeftRadius = '0';
  }else{
    document.getElementById('menu').style.borderRadius = '10px';
  }
}

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
                })
                return;
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
            const html = converter.makeHtml(md);
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
            const html = converter.makeHtml(md);
            container.innerHTML = html;
            fixupLinks(container);
        })
        .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }

    return;
}

window.onload = () => {
    fetchMenu();
    fetchSidebar();

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
};
