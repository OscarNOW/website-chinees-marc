import { getAverageColor } from './getAverageColor.js';

const images = [...document.querySelectorAll('img')]
    .filter(image => !image.classList.contains('no-zoom'));

const originalTitle = document.title;
let closeImage = () => { };
const openImageFromIndex = index => {
    if (index === null)
        closeImage(true);
    else {
        const image = images[index];
        if (!image) throw new Error(`Image with index ${index} not found`);
        closeImage(true);
        handleImageClick(image, index, true);
    }
};

const imageClickHandlers = new Map();
const createImageClickHandler = (image, index) => {
    if (!imageClickHandlers.get(image))
        imageClickHandlers.set(image, () => handleImageClick(image, index));

    return imageClickHandlers.get(image);
};

for (const imageInd in images) {
    const image = images[imageInd];
    makeImageZoomable(image, parseInt(imageInd));
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('image'))
    try {
        const index = parseInt(urlParams.get('image'));

        openImageFromIndex(index);
        history.replaceState(index, '', `?image=${index}`);
    } catch (error) {
        console.error(error)
        alert(`${error.message || error}`);
    }

window.addEventListener('popstate', e => {
    openImageFromIndex(e.state);
    updateTitle(e.state);
});

function updateHistory(index) {
    if (index === null)
        history.pushState(null, '', `${document.location.origin}${window.location.pathname}`);
    else
        history.pushState(index, '', `?image=${index}`);

    updateTitle(index);
}

function updateTitle(index) {
    if (index === null)
        document.title = originalTitle;
    else
        document.title = `Afbeelding ${index} - ${originalTitle}`;
}

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

function handleImageClick(image, index, preventHistory) {
    const overlay = document.createElement('div');

    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';

    overlay.style.width = '100dvw';
    overlay.style.height = '100dvh';

    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    overlay.style.backdropFilter = 'blur(5px)';
    overlay.style.zIndex = 1;

    const dialog = document.createElement('dialog');
    dialog.classList.add('zoomable-image-dialog');

    dialog.style.display = 'flex';
    dialog.style.justifyContent = 'center';
    dialog.style.alignItems = 'center';

    dialog.style.padding = '0';
    dialog.style.border = 'none';
    dialog.style.maxWidth = '70vw';
    dialog.style.maxHeight = '70vw';
    dialog.style.borderRadius = '10px';
    dialog.style.overflow = 'none';

    dialog.style.cursor = 'zoom-out';
    dialog.style.boxShadow = '0px 0px 140px 28px rgba(0,0,0,0.5)';

    closeImage = preventHistory => {
        for (const navbar of [...document.querySelectorAll('.navbar')]) {
            navbar.parentElement.removeChild(navbar);
            document.body.appendChild(navbar);

            navbar.style.cursor = null;
        };

        dialog.close();
        dialog.parentNode.removeChild(dialog);

        overlay.parentNode.removeChild(overlay);
        document.body.style.overflow = null;

        closeImage = () => { };

        if (preventHistory)
            updateTitle(index);
        else
            updateHistory(null);
    };

    dialog.addEventListener('click', function (e) {
        if (e.target === this)
            closeImage()
    });
    dialog.addEventListener('close', () => closeImage());

    const closeButton = document.createElement('button');
    /*
    right: 0;
    top: 0;
    position: absolute;
    width: 3.5vmax;
    height: 3.5vmax;
    background-color: rgb(255 255 255 / 70%);
    border-bottom-left-radius: 10px;
    backdrop-filter: blur(5px);
    */

    closeButton.style.cursor = 'pointer';

    closeButton.style.position = 'absolute';
    closeButton.style.right = '0';
    closeButton.style.top = '0';

    closeButton.style.width = '3.5vmax';
    closeButton.style.height = '3.5vmax';

    closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    closeButton.style.borderBottomLeftRadius = '10px';
    closeButton.style.backdropFilter = 'blur(5px)';

    closeButton.addEventListener('click', () => closeImage());

    const closeIcon = document.createElement('span');
    closeIcon.innerText = '✕';
    // closeIcon.innerText = '✖';

    closeIcon.style.fontSize = '2.5vmax';

    closeIcon.style.position = 'relative';
    closeIcon.style.top = '-3.5px';

    closeButton.appendChild(closeIcon);

    const imageClone = image.cloneNode();
    insertAfter(imageClone, image);
    image.parentNode.removeChild(image);

    image.className = '';
    image.removeAttribute('style');
    for (const dataKey in image.dataset)
        delete image.dataset[dataKey];

    image.style.cursor = 'zoom-out';
    image.style.display = 'block';

    image.style.maxWidth = '90vw';
    image.style.maxHeight = '90vh';

    image.style.width = 'auto';
    image.style.height = 'auto';

    image.addEventListener('click', () => closeImage());

    dialog.appendChild(image);
    dialog.appendChild(closeButton);

    for (const navbar of [...document.querySelectorAll('.navbar')]) {
        navbar.parentElement.removeChild(navbar);
        dialog.appendChild(navbar);

        navbar.style.cursor = 'auto';
    };

    if (imageClickHandlers.get(image)) {
        image.removeEventListener('click', imageClickHandlers.get(image));
        imageClickHandlers.delete(image);
    }
    makeImageZoomable(imageClone, index);

    if (preventHistory)
        updateTitle(index);
    else
        updateHistory(index);

    document.body.style.overflow = 'hidden';
    document.body.appendChild(dialog);
    document.body.appendChild(overlay);
    dialog.showModal();

    try {
        const averageColor = getAverageColor(image);
        overlay.style.backgroundColor = `rgba(${averageColor.r},${averageColor.g},${averageColor.b},0.7)`;
    } catch (e) {
        console.error(e)
    }
}


function makeImageZoomable(image, index) {
    image.style.cursor = 'zoom-in';
    image.addEventListener('click', createImageClickHandler(image, index))
}