var converter = new showdown.Converter();

function updatemenu() {
  if (document.getElementById('responsive-menu').checked == true) {
    document.getElementById('menu').style.borderBottomRightRadius = '0';
    document.getElementById('menu').style.borderBottomLeftRadius = '0';
  }else{
    document.getElementById('menu').style.borderRadius = '10px';
  }
}

function handleMenuText(html) {
    const container = document.getElementById('menu_container');
    container.innerHTML = html;
}

function insertMenu() {
    try {
        const link = `/content/menu.html`;
        fetch(link)
        .then(response => response.text())
        .then(html => handleMenuText(html))
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
    let page = urlParams.get('page');
    if (page === null) {
        page = 'home';
    }

    try {
        const link = `content/${page}.md`;
        fetch(link)
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
  insertContent();
};
