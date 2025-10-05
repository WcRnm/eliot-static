class DOM {
    static elem(type, cls) {
        const div = document.createElement(type);
        if (cls) {
            div.classList.add(cls);
        }
        return div;
    }
    static div(cls) {
        return this.elem('div', cls);
    }
    static article(cls) {
        return this.elem('article', cls);
    }
    static addClass(elem, cls) {
        elem.classList.add(cls);
    }
    static removeClass(elem, cls) {
        elem.classList.removeClass(cls);
    }
}
