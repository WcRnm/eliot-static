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

    static anchor(url, text) {
        const a = DOM.elem('a');
        a.href = url;
        a.title = text;
        a.textContent = text;
        return a;
    }

    static img(path, altText) {
        const img = DOM.elem('img');
        img.src = path;
        img.alt = altText;

        if (altText) {
            img.setAttribute("alt", altText);
        }

        return img;
    }

    static addClass(elem, cls) {
        elem.classList.add(cls);
    }
    static removeClass(elem, cls) {
        elem.classList.removeClass(cls);
    }
}
