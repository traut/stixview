const $ = require('jquery');
const _ = require('underscore');
const DEFAULT_GRAPH_STYLE = require('./viewer').DEFAULT_GRAPH_STYLE;
const initGraph = require('./viewer').initGraph;
const loadGraph = require('./viewer').loadGraph;
const isTrue = require('./utils').isTrue;

// import css for webpack to include
/* eslint-disable-next-line no-unused-vars */
const classes = require('./main.css');

const graphRegistry = {};
const initCallbacks = {};
const loadCallbacks = {};


function initEmbeddedGraph(element, initCallback, loadCallback) {
    element.dataset.stixViewId = Math.random().toString(16).slice(2);

    const gistId = element.dataset.stixGistId;
    const gistFile = element.dataset.gistFile;
    const url = element.dataset.stixUrl;
    const allowDragDrop = isTrue(element.dataset.stixAllowDragdrop);
    const layout = element.dataset.graphLayout;
    const showIdrefs = isTrue(element.dataset.showIdrefs);
    const showSidebar = isTrue(element.dataset.showSidebar);
    const caption = element.dataset.caption;
    const hideFooter = element.dataset.hideFooter;
    const disableMouseZoom = isTrue(element.dataset.disableMouseZoom);
    const disablePanning = isTrue(element.dataset.disablePanning);
    const disableLabels = isTrue(element.dataset.disableLabels);
    const showMarkings = isTrue(element.dataset.showMarkings);

    const graphWidth = element.dataset.graphWidth || element.clientWidth || 800;
    const graphHeight = element.dataset.graphHeight || 600;

    const highlightedObjects = (
        element.dataset.highlightedObjects ?
            element.dataset.highlightedObjects.split(',') : []);

    const hiddenObjects = (
        element.dataset.hiddenObjects ?
            element.dataset.hiddenObjects.split(',') : []);

    const minZoom = element.dataset.minZoom;
    const maxZoom = element.dataset.maxZoom;

    const graph = graphRegistry[element.dataset.stixViewId] = initGraph(
        element,
        {
            gistId, gistFile, url, allowDragDrop,
            layout, showSidebar, disableMouseZoom, disablePanning,
            disableLabels, highlightedObjects, hiddenObjects,
            showMarkings, showIdrefs, hideFooter,
            graphWidth, graphHeight,
            minZoom, maxZoom, caption,
        },
        function(bundle) {
            loadGraph(graph, bundle, showIdrefs, loadCallback);
        },
        loadCallback);
    initCallback && initCallback(graph);
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
    initGraph: initGraph,
    DEFAULT_GRAPH_STYLE: DEFAULT_GRAPH_STYLE,
};


if (typeof window !== 'undefined') {
    window.stixview = exports;
}
