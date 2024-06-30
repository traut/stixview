const urlCache = {};

function fetch(url, onLoad, onError) {
    const xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.onload = function() {
        onLoad(JSON.parse(xhr.responseText));
    };
    xhr.addEventListener('error', onError);
    xhr.send();
}


function loadUrl(url) {
    const p = urlCache[url] || new Promise(function(resolve, reject) {
        if (!url) {
            reject(new Error('No URL provided'));
            return;
        }
        fetch(url, resolve, reject);
    });
    if (url) {
        urlCache[url] = p;
    }
    return p;
}


function loadGist(id, file) {
    const url = 'https://api.github.com/gists/' + id;
    const p = urlCache[url] || new Promise(function(resolve, reject) {
        fetch(
            url,
            function(res) {
                file = file || Object.keys(res.files)[0];
                const details = res.files[file];
                resolve(JSON.parse(details.content));
            },
            reject
        );
    });
    urlCache[url] = p;
    return p;
}


function loadUrlFromParam(paramName) {
    const url = new URL(window.location.href);
    const remoteBundleUrl = url.searchParams.get(paramName);
    return loadUrl(remoteBundleUrl);
}


function withDefault(value, defaultValue) {
    return (value == null) ? defaultValue : value;
}

function isTrue(prop) {
    return (prop && prop != 'false' && prop != 'False');
}


function readFile(file, callback) {
    if (file.type == 'application/json') {
        const reader = new FileReader();
        reader.onload = function(e2) {
            const data = JSON.parse(e2.target.result);
            callback(data);
        };
        reader.readAsText(file); // start reading the file data.
    }
}


function mostRelaxedTlp(tlpMarkings) {
    if (tlpMarkings.length == 0) {
        return;
    }
    // STIX2 TLP spectrum
    const tlp = [
        'white',
        'green',
        'amber',
        'red',
        'v2-clear',
        'v2-green',
        'v2-amber',
        'v2-amber-strict',
        'v2-red',
    ];
    const smallestIndex = (
        tlpMarkings
            .map((m) => tlp.indexOf(m.value.toLowerCase()))
            .filter((i) => i > -1)
            .sort()[0]);
    const widestTlp = tlp[smallestIndex];
    const marking = tlpMarkings.filter((m) => m.value.toLowerCase() == widestTlp)[0];
    return marking;
}


export {
    loadUrl,
    loadGist,
    isTrue,
    loadUrlFromParam,
    readFile,
    withDefault,
    mostRelaxedTlp,
};
