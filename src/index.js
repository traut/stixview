import $ from 'jquery';

import * as viewer from './viewer';
import initEmbeddedBlock from './embed';
import initGraph from './viewer';


import classes from './main.css';


function isTrue(prop) {
    return (prop != null && prop != 'false');
}


function initEmbeddedGraph(element) {
    element.dataset.stixViewId = Math.random().toString(16).slice(2);

    initEmbeddedBlock(element, function(bundle) {
        let layout = element.dataset.graphLayout;

        let showIdrefs = isTrue(element.dataset.showIdrefs);
        let showSidebar = isTrue(element.dataset.showSidebar);
        let disableMouseZoom = isTrue(element.dataset.disableMouseZoom);
        let disablePanning = isTrue(element.dataset.disablePanning);
        let disableLabels = isTrue(element.dataset.disableLabels);
        let showMarkings = isTrue(element.dataset.showMarkings);

        let highlightedObjects = (
            element.dataset.highlightedObjects ? 
            element.dataset.highlightedObjects.split(',') : []);

        let hiddenObjects = (
            element.dataset.hiddenObjects ?
            element.dataset.hiddenObjects.split(',') : []);

        let minZoom = element.dataset.minZoom;
        let maxZoom = element.dataset.maxZoom;

        initGraph(element, bundle, {
            layout: layout,
            showIdrefs: showIdrefs,
            showSidebar: showSidebar,
            disableMouseZoom: disableMouseZoom,
            disablePanning: disablePanning,
            disableLabels: disableLabels,
            highlightedObjects: highlightedObjects,
            hiddenObjects: hiddenObjects,
            showMarkings: showMarkings,
            minZoom: minZoom,
            maxZoom: maxZoom,
        }, function() {
            $(element).removeClass("loading");
        });

    })
}


$(function() {
    $('[data-stix-gist-id],[data-stix-url],[data-stix-allow-dragdrop]').each(
        function(i, el) { initEmbeddedGraph(el) });
});
