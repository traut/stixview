import $ from 'jquery';

const urlCache = {};

function loadUrl(url) {
    const p = urlCache[url] || new Promise(function(resolve, reject) {
        if (!url) {
            reject(new Error('No URL provided'));
            return;
        }
        $.get(url).done(function(res) {
            const bundle = JSON.parse(res);
            resolve(bundle);
        }).fail(reject);
    });
    if (url) {
        urlCache[url] = p;
    }
    return p;
}


function loadGist(id, file) {
    const url = 'https://api.github.com/gists/' + id;
    const p = urlCache[url] || new Promise(function(resolve, reject) {
        $.get(url).done(function(res) {
            file = file || Object.keys(res.files)[0];
            const details = res.files[file];
            resolve(JSON.parse(details.content));
        }).fail(reject);
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


export {loadUrl, loadGist, isTrue, loadUrlFromParam};
