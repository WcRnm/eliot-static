function fetchWorkshops(workshopDiv, year, camp) {
    try {
        const baseUrl = `content/camp/${year}/${camp}`;
        fetch(`${baseUrl}/workshops.json`)
            .then(response => response.json())
            .then(json => {
                json.forEach(workshop => {
                    fetchWorkshop(workshopDiv, baseUrl, workshop);
                });
            })
            .catch(error => logger.error(error));
    }
    catch (error) {
        logger.error(error);
    }
}

function fetchWorkshop(workshopDiv, baseUrl, workshop) {
    logger.info(`workshop: ${workshop}`)
    try {
        fetch(`${baseUrl}/${workshop}.md`)
            .then(response => response.text())
            .then(md => {
                const html = MD.makeHtml(md);
                const meta = MD.getMetadata();

                logger.debug(meta.img);

                let hr = DOM.elem('hr');
                workshopDiv.appendChild(hr);

                if (meta.img) {
                    const images = meta.img.split(' ');
                    const img = DOM.img(`${baseUrl}/${images[0]}`, meta.presenter);
                    DOM.addClass(img, 'float-right-300');
                    workshopDiv.appendChild(img);
                }

                let e = DOM.elem('h3');
                e.innerHTML = `${meta.title}<br>${meta.presenter}`;
                workshopDiv.appendChild(e);

                //const card = DOM.article();
                const div = DOM.div();
                div.innerHTML = html;
                //card.appendChild(div);
                workshopDiv.appendChild(div);
            })
    }
    catch (error) {
        logger.error(error);
    }

}
