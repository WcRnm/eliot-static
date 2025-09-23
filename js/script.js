function updatemenu() {
  if (document.getElementById('responsive-menu').checked == true) {
    document.getElementById('menu').style.borderBottomRightRadius = '0';
    document.getElementById('menu').style.borderBottomLeftRadius = '0';
  }else{
    document.getElementById('menu').style.borderRadius = '10px';
  }
}

function handleMenuText(html) {
    const menu_container = document.getElementById('menu_container');
    menu_container.innerHTML = html;
}

function insertMenu() {
    try {
        const html_file = `/content/menu.html`;
        fetch(html_file)
        .then(response => response.text())
        .then(html => handleMenuText(html))
        .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}


window.onload = () => {
  insertMenu();
};
