let $  = require('jquery'),
    _  = require('underscore'),
    initGraph = require('./viewer').initGraph,
    loadGraph = require('./viewer').loadGraph,
    isTrue = require('./utils').isTrue,
    classes = require('./main.css');


const graphRegistry = {};
const initCallbacks = {};
const loadCallbacks = {};


function initEmbeddedGraph(element, initCallback, loadCallback) {
    element.dataset.stixViewId = Math.random().toString(16).slice(2);

    let gistId = element.dataset.stixGistId;
    let gistFile = element.dataset.gistFile;
    let url = element.dataset.stixUrl;
    let allowDragDrop = isTrue(element.dataset.stixAllowDragdrop)
    let layout = element.dataset.graphLayout;
    let showIdrefs = isTrue(element.dataset.showIdrefs);
    let showSidebar = isTrue(element.dataset.showSidebar);
    let caption = element.dataset.caption;
    let hideFooter = element.dataset.hideFooter;
    let disableMouseZoom = isTrue(element.dataset.disableMouseZoom);
    let disablePanning = isTrue(element.dataset.disablePanning);
    let disableLabels = isTrue(element.dataset.disableLabels);
    let showMarkings = isTrue(element.dataset.showMarkings);

    let graphWidth = element.dataset.graphWidth || element.clientWidth || 800;
    let graphHeight = element.dataset.graphHeight || 600;

    let highlightedObjects = (
        element.dataset.highlightedObjects ? 
        element.dataset.highlightedObjects.split(',') : []);

    let hiddenObjects = (
        element.dataset.hiddenObjects ?
        element.dataset.hiddenObjects.split(',') : []);

    let minZoom = element.dataset.minZoom;
    let maxZoom = element.dataset.maxZoom;

    let graph = graphRegistry[element.dataset.stixViewId] = initGraph(
        element,
        {
            gistId, gistFile, url, allowDragDrop,
            layout, showSidebar, disableMouseZoom, disablePanning,
            disableLabels, highlightedObjects, hiddenObjects,
            showMarkings, showIdrefs, hideFooter,
            graphWidth, graphHeight,
            minZoom, maxZoom, caption
        },
        function(bundle) {
            loadGraph(graph, bundle, showIdrefs, loadCallback);
        },
        loadCallback);
    initCallback && initCallback(graph);
}

function downloadLinkRawData(data) {
    $graph.find('.viewer-placeholder').remove();
    $elem.find(".download").on('click', function(e) {
        e.preventDefault();
        downloadData(bundle);
    });
}


function getMatchingCallbacks(callbacksMap, element) {
    let matching = [];
    let $element = $(element);
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
                    getMatchingCallbacks(initCallbacks, element).forEach(f => f(graph))
                },
                function(graph) {
                    getMatchingCallbacks(loadCallbacks, element).forEach(f => f(graph))
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
    }
}

if (typeof window !== 'undefined') {
    window.stixview = exports;
}
