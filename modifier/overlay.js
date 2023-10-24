const link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = '/modifier/overlay.css';
document.head.appendChild(link);

const originalImages = [...document.querySelectorAll('.modifier_overlay')];

for (const originalImage of originalImages) {
    console.log(`[/modifier/overlay.js] waiting for ${originalImage.src} to load...`)
    await waitImageLoad(originalImage);

    originalImage.classList.remove('modifier_overlay');
    const classes = originalImage.className;
    originalImage.className = '';
    originalImage.classList.add('modifier_overlay_original');

    originalImage.style.setProperty('--img-scale', originalImage.getAttribute('data-img-scale') ?? 1);
    originalImage.style.setProperty('--img-y', originalImage.getAttribute('data-img-y') ?? 0);

    originalImage.style.setProperty('--img-width', originalImage.offsetWidth + 'px');
    originalImage.style.setProperty('--img-height', originalImage.offsetHeight + 'px');

    originalImage.removeAttribute('data-img-scale');
    originalImage.removeAttribute('data-img-y');

    const parent = document.createElement('div');
    parent.className = classes;
    parent.classList.add('modifier_overlay_parent');

    const overlay = document.createElement('div');
    overlay.classList.add('modifier_overlay_overlay');

    overlay.style.setProperty('--img-width', originalImage.offsetWidth + 'px');
    overlay.style.setProperty('--img-height', originalImage.offsetHeight + 'px');

    overlay.style.setProperty('--overlay-url', `url(${originalImage.getAttribute('data-overlay')})`);
    overlay.style.setProperty('--overlay-scale', originalImage.getAttribute('data-overlay-scale') ?? 1);
    overlay.style.setProperty('--overlay-y', originalImage.getAttribute('data-overlay-y') ?? 0);
    overlay.style.setProperty('--overlay-x', originalImage.getAttribute('data-overlay-x') ?? 0);

    originalImage.removeAttribute('data-overlay');
    originalImage.removeAttribute('data-overlay-scale');
    originalImage.removeAttribute('data-overlay-y');

    originalImage.replaceWith(parent);
    parent.appendChild(originalImage);
    parent.appendChild(overlay);
}

function waitImageLoad(img) {
    return new Promise(res => {
        if (img.offsetWidth > 0 && img.offsetHeight > 0)
            res();
        else
            img.onload = () => res();
    })
}