import $ from 'jquery';
import _ from 'underscore';
import {initGraph, loadGraph} from './viewer';
import {isTrue, loadUrl, loadGist, loadUrlFromParam, readFile} from './utils.js';

// import css for webpack to include
/* eslint-disable-next-line no-unused-vars */
import classes from './main.css';

const registry = {};
const initCallbacks = {};
const loadCallbacks = {};


function init(element, props, initCallback, loadCallback) {
    element.dataset.stixViewId = Math.random().toString(16).slice(2);

    const showIdrefs = isTrue(element.dataset.showIdrefs);

    const gistId = element.dataset.stixGistId;
    const gistFile = element.dataset.gistFile;
    const url = element.dataset.stixUrl;

    const properties = {
        allowDragDrop: isTrue(element.dataset.stixAllowDragdrop),
        layout: element.dataset.graphLayout,
        showIdrefs: showIdrefs,
        showSidebar: isTrue(element.dataset.showSidebar),
        caption: element.dataset.caption,
        hideFooter: element.dataset.hideFooter,
        disableMouseZoom: isTrue(element.dataset.disableMouseZoom),
        disablePanning: isTrue(element.dataset.disablePanning),
        disableLabels: isTrue(element.dataset.disableLabels),
        showMarkings: isTrue(element.dataset.showMarkings),
        graphWidth: element.dataset.graphWidth || element.clientWidth || 800,
        graphHeight: element.dataset.graphHeight || 600,
        highlightedObjects: (
            element.dataset.highlightedObjects ?
                element.dataset.highlightedObjects.split(',') : []),
        hiddenObjects: (
            element.dataset.hiddenObjects ?
                element.dataset.hiddenObjects.split(',') : []),
        minZoom: element.dataset.minZoom,
        maxZoom: element.dataset.maxZoom,
        ...props,
    };

    const loadDataInGraph = (bundle) => {
        loadGraph(graph, bundle, showIdrefs, (graph) => {
            graph.markAsNotLoading();
            loadCallback && loadCallback(graph);
        });
    };

    let graph = registry[element.dataset.stixViewId] = initGraph(
        element,
        properties,
        loadDataInGraph);

    graph = {
        ...graph,
        showIdrefs: function(callback) {
            setTimeout(function() {
                loadGraph(graph, graph.cy.raw_data, true, loadCallback);
                callback && callback();
            }, 20);
        },
        hideIdrefs: function(callback) {
            setTimeout(function() {
                loadGraph(graph, graph.cy.raw_data, false, loadCallback);
                callback && callback();
            }, 20);
        },
        loadData: loadDataInGraph,
        loadDataFromFile: function(file) {
            if (file && file.type == 'application/json') {
                graph.markAsLoading();
                readFile(file, loadDataInGraph);
            }
        },
        loadDataFromParamUrl: function(paramName) {
            graph.markAsLoading();
            loadUrlFromParam(paramName).then(
                loadDataInGraph,
                function(error) {
                    graph.markAsNotLoading();
                    console.error(
                        'can not load a url from a parameter ' + paramName,
                        error);
                }
            );
        },
        loadDataFromGist: function(gistId, gistFile) {
            graph.markAsLoading();
            loadGist(gistId, gistFile).then(
                loadDataInGraph,
                function(error) {
                    graph.markAsNotLoading();
                    console.error('can not load gist ' + gistId, error);
                });
        },
        loadDataFromUrl: function(url) {
            graph.markAsLoading();
            loadUrl(url).then(
                loadDataInGraph,
                function(error) {
                    graph.markAsNotLoading();
                    console.error('can not load url ' + url, error);
                });
        },
    };

    initCallback && initCallback(graph);

    if (gistId || url) {
        setTimeout(
            () => {
                if (gistId) {
                    graph.loadDataFromGist(gistId, gistFile);
                } else if (url) {
                    graph.loadDataFromUrl(url);
                }
            },
            20);
    }
    return graph;
}


function getMatchingCallbacks(callbacksMap, element) {
    const matching = [];
    const $element = $(element);
    _.keys(callbacksMap).forEach(function(selector) {
        if ($element.is(selector)) {
            matching.push(callbacksMap[selector]);
        }
    });
    return matching;
}


function onInit(selector, callback) {
    initCallbacks[selector] = callback;
}

function onLoad(selector, callback) {
    loadCallbacks[selector] = callback;
}

if (typeof window !== 'undefined') {
    $(function() {
        $('[data-stix-gist-id],[data-stix-url],[data-stix-allow-dragdrop]').each(
            function(i, element) {
                init(element, null,
                    function(graph) {
                        getMatchingCallbacks(initCallbacks, element).forEach((f) => f(graph));
                    },
                    function(graph) {
                        getMatchingCallbacks(loadCallbacks, element).forEach((f) => f(graph));
                    }
                );
            }
        );
    });
    window.stixview = {registry, onInit, onLoad, init};
};

export {registry, onInit, onLoad, init};
