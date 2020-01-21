const $ = require('jquery');
const _ = require('underscore');
const initGraph = require('./viewer').initGraph;
const loadGraph = require('./viewer').loadGraph;
const isTrue = require('./utils').isTrue;

// import css for webpack to include
/* eslint-disable-next-line no-unused-vars */
const classes = require('./main.css');

const graphRegistry = {};
const initCallbacks = {};
const loadCallbacks = {};


function initEmbeddedGraph(element, props, initCallback, loadCallback) {
    element.dataset.stixViewId = Math.random().toString(16).slice(2);

    const showIdrefs = isTrue(element.dataset.showIdrefs);

    const properties = {
        gistId: element.dataset.stixGistId,
        gistFile: element.dataset.gistFile,
        url: element.dataset.stixUrl,
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

    const graph = graphRegistry[element.dataset.stixViewId] = initGraph(
        element,
        properties,
        (bundle) => loadGraph(graph, bundle, showIdrefs, loadCallback),
        loadCallback);

    initCallback && initCallback(graph);
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


$(function() {
    $('[data-stix-gist-id],[data-stix-url],[data-stix-allow-dragdrop]').each(
        function(i, element) {
            initEmbeddedGraph(
                element,
                null,
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


const exports = module.exports = {
    graphs: graphRegistry,
    onInit: function(selector, callback) {
        initCallbacks[selector] = callback;
    },
    onLoad: function(selector, callback) {
        loadCallbacks[selector] = callback;
    },
    init: initEmbeddedGraph,
};


if (typeof window !== 'undefined') {
    window.stixview = exports;
}
