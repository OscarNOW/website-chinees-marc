import { getAverageColor } from './getAverageColor.js';
const wait = ms => new Promise(res => setTimeout(res, ms));
let originalBackgroundColor = null;

const images = [...document.querySelectorAll('img')]
    .filter(image => !image.classList.contains('no-zoom'));

const originalTitle = document.title;
let closeImage = () => { };
const openImageFromIndex = (index, preventOpenAnimations, preventClosingAnimations) => {
    if (index === null)
        closeImage(true, preventClosingAnimations);
    else {
        const image = images[index];
        if (!image) throw new Error(`Image with index ${index} not found`);
        closeImage(true, preventClosingAnimations);
        handleImageClick(image, index, true, preventOpenAnimations);
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

        openImageFromIndex(index, true);
        history.replaceState(index, '', `?image=${index}`);
    } catch (error) {
        console.error(error)
        alert(`${error.message || error}`);
    }

window.addEventListener('popstate', e => {
    openImageFromIndex(e.state, true, true);
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

async function handleImageClick(image, index, preventHistory, preventOpenAnimations) {
    const overlay = document.createElement('div');

    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';

    overlay.style.width = '100dvw';
    overlay.style.height = '100dvh';

    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    overlay.style.backdropFilter = 'blur(5px)';
    overlay.style.zIndex = 1;

    if (!preventOpenAnimations)
        overlay.style.transition = 'all 1s ease';

    const dialog = document.createElement('dialog');
    dialog.classList.add('zoomable-image-dialog');

    dialog.style.display = 'flex';
    dialog.style.justifyContent = 'center';
    dialog.style.alignItems = 'center';

    dialog.style.padding = '0';
    dialog.style.border = 'none';
    dialog.style.outline = 'none';
    dialog.style.maxWidth = '70vw';
    dialog.style.maxHeight = '70vw';
    dialog.style.borderRadius = '10px';
    dialog.style.overflow = 'none';

    dialog.style.cursor = 'zoom-out';
    dialog.style.boxShadow = '0px 0px 140px 28px rgba(0,0,0,0.5)';

    closeImage = async (preventHistory, preventClosingAnimations) => {
        for (const navbar of [...document.querySelectorAll('.navbar')]) {
            navbar.parentElement.removeChild(navbar);
            document.body.appendChild(navbar);

            navbar.style.cursor = null;
        };

        let oldBodyTransition = document.body.style.transition;
        if (preventClosingAnimations) document.body.style.transition = null;
        document.body.style.backgroundColor = originalBackgroundColor;

        dialog.style.pointerEvents = 'none';
        overlay.style.pointerEvents = 'none';
        document.body.style.overflow = null;

        closeImage = () => { };

        if (preventHistory)
            updateTitle(index);
        else
            updateHistory(null);

        await wait(50);
        if (preventClosingAnimations) document.body.style.transition = oldBodyTransition;

        if (!preventClosingAnimations) {
            dialog.style.transition = 'opacity 0.5s ease';
            overlay.style.transition = 'opacity 1s ease';
        }

        dialog.style.opacity = '0';
        overlay.style.opacity = '0';
        await wait(1000);

        dialog.close();
        dialog.remove();
        overlay.remove();
    };

    dialog.addEventListener('click', function (e) {
        if (e.target === this)
            closeImage(false)
    });
    dialog.addEventListener('close', () => closeImage(false));
    document.body.appendChild(dialog);
    document.body.style.overflow = 'hidden';
    document.body.appendChild(overlay);

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
    closeButton.style.border = 'none';

    closeButton.addEventListener('click', () => closeImage());
    closeButton.style.opacity = '0';
    if (!preventOpenAnimations)
        closeButton.style.transition = 'opacity 0.5s ease';

    const closeIcon = document.createElement('span');
    closeIcon.innerText = '✕';
    // closeIcon.innerText = '✖';

    closeIcon.style.fontSize = '2.5vmax';

    closeIcon.style.position = 'relative';
    closeIcon.style.top = '-3.5px';

    closeButton.appendChild(closeIcon);

    const oldImagePosition = image.getBoundingClientRect();

    const newImageStyles = {
        cursor: 'zoom-out',
        display: 'block',
        maxWidth: '90vw',
        maxHeight: '90vh',
        width: 'auto',
        height: 'auto'
    };

    const imageClone = image.cloneNode();
    const imageClonePosition = document.createElement('span');
    insertAfter(imageClonePosition, image);
    image.parentNode.removeChild(image);
    dialog.appendChild(image);

    image.className = '';
    image.removeAttribute('style');
    for (const dataKey in image.dataset)
        delete image.dataset[dataKey];

    for (const [key, value] of Object.entries(newImageStyles))
        image.style[key] = value;

    dialog.style.opacity = '0';
    dialog.showModal();
    const newImagePosition = image.getBoundingClientRect();

    image.removeAttribute('style');

    image.style.position = 'fixed';
    image.style.left = `${oldImagePosition.left}px`;
    image.style.top = `${oldImagePosition.top}px`;
    image.style.width = `${oldImagePosition.width}px`;
    image.style.height = `${oldImagePosition.height}px`;

    if (!preventOpenAnimations)
        image.style.transition = 'all 1s ease';

    dialog.style.opacity = null;

    image.addEventListener('click', () => closeImage());

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

    await wait(0);

    let averageColor;
    try {
        averageColor = getAverageColor(image);
    } catch (e) {
        console.error(e)
    }

    let oldBodyTransition = document.body.style.transition;
    if (preventOpenAnimations) document.body.style.transition = null;
    if (averageColor) {
        overlay.style.backgroundColor = `rgba(${averageColor.r},${averageColor.g},${averageColor.b},0.7)`;
        dialog.style.backgroundColor = `rgb(${averageColor.r},${averageColor.g},${averageColor.b})`;
    } else
        overlay.style.backgroundColor = 'rgba(0,0,0,0.4)';
    if (preventOpenAnimations) document.body.style.transition = oldBodyTransition;

    if (originalBackgroundColor === null)
        originalBackgroundColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = null;

    image.style.position = 'fixed';
    image.style.left = `${newImagePosition.left}px`;
    image.style.top = `${newImagePosition.top}px`;
    image.style.width = `${newImagePosition.width}px`;
    image.style.height = `${newImagePosition.height}px`;
    image.style.boxShadow = dialog.style.boxShadow;
    image.style.borderRadius = dialog.style.borderRadius;

    await wait(1000);

    image.removeAttribute('style');
    for (const [key, value] of Object.entries(newImageStyles))
        image.style[key] = value;

    closeButton.style.opacity = null;

    imageClone.style.opacity = '0';
    insertAfter(imageClone, imageClonePosition);
    imageClonePosition.remove();

    await wait(500);

    imageClone.style.transition = 'opacity 3s ease';
    imageClone.style.opacity = '1';
}


function makeImageZoomable(image, index) {
    image.style.cursor = 'zoom-in';
    image.addEventListener('click', createImageClickHandler(image, index))
}