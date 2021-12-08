import _ from 'underscore';
import {initGraph, loadGraph} from './viewer';
import {isTrue, withDefault, loadUrl, loadGist, loadUrlFromParam, readFile} from './utils.js';
// import css for webpack to include
/* eslint-disable-next-line no-unused-vars */
import classes from './main.css';

const registry = {};
const initCallbacks = {};
const loadCallbacks = {};

function init(element, initCallback, loadCallback, extraDataProps, extraViewProps) {
    if (element.stixViewId && element.stixViewId in registry) {
        return registry[element.stixViewId];
    }
    const gistId = element.dataset.stixGistId;
    const gistFile = element.dataset.gistFile;
    const url = element.dataset.stixUrl;

    // can be mutated via the `reloadData` func
    let dataProps = {
        showIdrefs: isTrue(withDefault(element.dataset.showIdrefs, false)),
        highlightedObjects: (
            element.dataset.highlightedObjects
                ? element.dataset.highlightedObjects.split(',') : []),
        hiddenObjects: (
            element.dataset.hiddenObjects
                ? element.dataset.hiddenObjects.split(',') : []),
        // fixme -- add withDefault?
        showTlpAsTags: isTrue(withDefault(element.dataset.showTlpAsTags, true)),
        showMarkingNodes: isTrue(withDefault(element.dataset.showMarkingNodes, true)),
        ...extraDataProps,
    };

    const viewProps = {
        layout: element.dataset.graphLayout,
        caption: element.dataset.caption,

        showFooter: isTrue(withDefault(element.dataset.showFooter, true)),
        showSidebar: isTrue(withDefault(element.dataset.showSidebar, true)),
        showLabels: isTrue(withDefault(element.dataset.showLabels, true)),

        allowDragDrop: isTrue(withDefault(element.dataset.stixAllowDragdrop, false)),
        enableMouseZoom: isTrue(withDefault(element.dataset.enableMouseZoom, true)),
        enablePanning: isTrue(withDefault(element.dataset.enablePanning, true)),

        graphWidth: element.dataset.graphWidth || element.clientWidth || 800,
        graphHeight: element.dataset.graphHeight || 600,
        minZoom: element.dataset.minZoom,
        maxZoom: element.dataset.maxZoom,

        ...extraViewProps,
    };

    const loadDataInGraphCallback = (bundle) => {
        loadGraph(graph, bundle, dataProps, (graph) => {
            graph.toggleLoading(false);
            loadCallback && loadCallback(graph);
        });
    };

    let graph = initGraph(
        element,
        viewProps,
        loadDataInGraphCallback);

    graph = {
        ...graph,
        dataProps: dataProps,
        viewProps: viewProps,
        loadData: loadDataInGraphCallback,
        loadDataFromFile: function(file) {
            if (file && file.type == 'application/json') {
                graph.toggleLoading(true);
                readFile(file, loadDataInGraphCallback);
            }
        },
        loadDataFromParamUrl: function(paramName) {
            graph.toggleLoading(true);
            loadUrlFromParam(paramName).then(
                loadDataInGraphCallback,
                (error) => {
                    graph.toggleLoading(false);
                    console.error('Can not load a url from a parameter ' + paramName, error);
                }
            );
        },
        loadDataFromGist: function(gistId, gistFile) {
            graph.toggleLoading(true);
            loadGist(gistId, gistFile).then(
                loadDataInGraphCallback,
                (error) => {
                    graph.toggleLoading(false);
                    console.error('Can not load gist ' + gistId, error);
                }
            );
        },
        loadDataFromUrl: function(url) {
            graph.toggleLoading(true);
            loadUrl(url).then(
                loadDataInGraphCallback,
                (error) => {
                    graph.toggleLoading(false);
                    console.error('Can not load data from url ' + url, error);
                }
            );
        },
        reloadData: function(extraDataProps, bundle, callback) {
            setTimeout(() => {
                bundle = bundle || graph.cy.bundle;
                dataProps = {
                    ...dataProps,
                    ...extraDataProps,
                };
                loadGraph(graph, bundle, dataProps, loadCallback);
                callback && callback();
            }, 20);
        },
        setSidebarRender: function(sidebarRender) {
            graph.setSidebarRender(sidebarRender);
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
            20
        );
    }

    element.dataset.stixViewId = Math.random().toString(16).slice(2);
    registry[element.dataset.stixViewId] = graph;

    element.stixViewId = element.dataset.stixViewId;

    return graph;
}


function getMatchingCallbacks(callbacksMap, element) {
    const matching = [];
    _.keys(callbacksMap).forEach(function(selector) {
        if (element.matches(selector)) {
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
    window.addEventListener('load', () => {
        const graphs = document.querySelectorAll(
            '[data-stix-gist-id],[data-stix-url],[data-stix-allow-dragdrop]');
        graphs.forEach((element) => {
            init(
                element,
                (graph) => getMatchingCallbacks(initCallbacks, element).forEach((f) => f(graph)),
                (graph) => getMatchingCallbacks(loadCallbacks, element).forEach((f) => f(graph)),
            );
        });
    });
    window.stixview = {registry, onInit, onLoad, init};
};

export {registry, onInit, onLoad, init};


