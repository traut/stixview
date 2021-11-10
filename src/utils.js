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


function isTrue(prop) {
    return (prop != null && prop != 'false');
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


export {loadUrl, loadGist, isTrue, loadUrlFromParam, readFile};
