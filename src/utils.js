import $ from 'jquery';


const urlCache = {};
const gistCache = {};


function loadUrl(url) {
    const p = urlCache[url] || new Promise(function(resolve, reject) {
        $.get(url)
            .done(function(res) {
                const bundle = JSON.parse(res);
                resolve(bundle);
            })
            .fail(reject);
    });
    urlCache[url] = p;
    return p;
}


function loadGist(id, file) {
    const url = 'https://api.github.com/gists/' + id;

    const p = gistCache[id] || new Promise(function(resolve, reject) {
        $.get(url)
            .done(function(res) {
                file = file || Object.keys(res.files)[0];
                const details = res.files[file];
                resolve({
                    bundle: JSON.parse(details.content),
                    url: details.raw_url,
                });
            })
            .fail(reject);
    });
    gistCache[id] = p;
    return p;
}


function isTrue(prop) {
    return (prop != null && prop != 'false');
}


export {loadUrl, loadGist, isTrue};
