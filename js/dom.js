class DOM {
    static createDiv(cls) {
        const div = document.createElement('div');
        if (cls) {
            div.classList.add(cls);
        }
        return div;
    }
    static createArticle(cls) {
        const div = document.createElement('article');
        if (cls) {
            div.classList.add(cls);
        }
        return div;
    }
    static addClass(elem, cls) {
        elem.classList.add(cls);
    }
    static removeClass(elem, cls) {
        elem.classList.removeClass(cls);
    }
}
