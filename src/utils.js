import $ from 'jquery';
import _ from 'underscore';


let urlCache = {};
let gistCache = {};


function loadUrl(url) {
    let p = urlCache[url] || new Promise(function(resolve, reject) {
        $.get(url)
            .done(function(res) {
                let bundle = JSON.parse(res);
                resolve(bundle);
            })
            .fail(reject);
    });
    urlCache[url] = p;
    return p;
}


function loadGist(id, file) {
    let url = 'https://api.github.com/gists/' + id;

    let p = gistCache[id] || new Promise(function(resolve, reject) {
        $.get(url)
            .done(function(res) {
                file = file || Object.keys(res.files)[0];
                let details = res.files[file];
                resolve({
                    bundle: JSON.parse(details.content),
                    url: details.raw_url
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

export { loadUrl, loadGist, isTrue };
