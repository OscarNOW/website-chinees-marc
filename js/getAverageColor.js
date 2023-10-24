const averageColorCache = localStorage.getItem('averageImageColorCache') ?
    JSON.parse(localStorage.getItem('averageImageColorCache')) :
    {};

export function getAverageColor(imgEl) {
    if (averageColorCache[imgEl.src])
        return averageColorCache[imgEl.src];

    let blockSize = 5, // only visit every 5 pixels
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = { r: 0, g: 0, b: 0 },
        count = 0;

    if (!context) {
        throw new Error('getAverageColor is unsupported in this environment')
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch (e) {
        /* security error, img on diff domain */
        throw new Error('unable to access image data');
    }

    length = data.data.length;

    while ((i += blockSize * 4) < length) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    averageColorCache[imgEl.src] = rgb;
    localStorage.setItem('averageImageColorCache', JSON.stringify(averageColorCache));

    return rgb;

}