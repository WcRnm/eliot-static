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
            .catch(error => console.error(error));
    }
    catch (error) {
        console.error(error);
    }
}

function fetchWorkshop(workshopDiv, baseUrl, workshop) {
    console.log(`workshop: ${workshop}`)
    try {
        fetch(`${baseUrl}/${workshop}.md`)
            .then(response => response.text())
            .then(md => {
                const html = MD.makeHtml(md);
                const meta = MD.getMetadata();

                let e = DOM.elem('h3');
                e.innerHTML = `${meta.topic}<br>${meta.presenter}`;
                workshopDiv.appendChild(e);
            })
    }
    catch (error) {
        console.error(error);
    }

}
