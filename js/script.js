var converter = new showdown.Converter();
converter.setOption('tables', 'on')

function updatemenu() {
  if (document.getElementById('responsive-menu').checked == true) {
    document.getElementById('menu').style.borderBottomRightRadius = '0';
    document.getElementById('menu').style.borderBottomLeftRadius = '0';
  }else{
    document.getElementById('menu').style.borderRadius = '10px';
  }
}

function insertMenu() {
    try {
        const link = `/content/menu.html`;
        fetch(link)
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById('menu_container');
            container.innerHTML = html;
        })
        .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

function insertSidebar() {
    try {
        const link = `/content/sidebar.md`;
        fetch(link)
        .then(response => response.text())
        .then(md => {
            const html = converter.makeHtml(md);
            const container = document.getElementById('sidebar_container');
            container.innerHTML = html;
        })
        .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

function handlePage(md) {
    console.log("got someting");
    const container = document.getElementById('content_container');

    const html = converter.makeHtml(md);
    container.innerHTML = html;
}

function insertContent() {
    const urlParams = new URLSearchParams(window.location.search);
    let link = null;
    for (const [key, value] of urlParams) {
        link = `${key}/${value}`;
        break;
    }
    if (link === null) {
        link = 'home';
    }

    try {
        fetch(`content/${link}.md`)
        .then(response => response.text())
        .then(md => handlePage(md))
        .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }

    return;
}

window.onload = () => {
  insertMenu();
  insertSidebar();
  insertContent();
};
