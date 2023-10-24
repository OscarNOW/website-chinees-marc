const rand = arr => arr[Math.floor(Math.random() * arr.length)];

const colors = [
    '#C7E9B0',
    '#F5F0BB',
    // '#F8EDE3',
    '#F7A4A4',
    '#D2E9E9',
    '#FFDCA9'
];

document.body.style.backgroundColor = rand(colors);