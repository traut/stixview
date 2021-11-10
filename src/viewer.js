import _ from 'underscore';

import cytoscape from 'cytoscape';

import klay from 'cytoscape-klay';
import euler from 'cytoscape-euler';
import coseBilkent from 'cytoscape-cose-bilkent';
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import cise from 'cytoscape-cise';

import autopanOnDrag from 'cytoscape-autopan-on-drag';

import {readFile} from './utils.js';
import {iconPerType, getPlaceholderIcon} from './icons.js';


cytoscape.use(klay);
cytoscape.use(euler);
cytoscape.use(coseBilkent);
cytoscape.use(cola);
cytoscape.use(dagre);
cytoscape.use(cise);

autopanOnDrag(cytoscape);

const DEFAULT_LAYOUT = 'cola';
const NODE_WIDTH = 30;
const NODE_HEIGHT = 30;

const layoutProperties = {
    'euler': {
        pull: 0.006,
        mass: (node) => 10,
        animation: false,
        dragCoeff: 0.3,
    },
    'cose-bilkent': {
        animate: 'end',
        animationEasing: 'ease-out',
        animationDuration: 300,
        nodeRepulsion: 200,
        idealEdgeLength: NODE_WIDTH * 3,
        gravityRange: 50,
        gravity: 8.2,
        // nestingFactor: 10,
        padding: 50,
    },
    'cola': {
        convergenceThreshold: 100, // end layout sooner, may be a bit lower quality
        animate: false,
    },
};

const cache = {};

const TLP_HEX_COLORS = {
    red: '#ff0000',
    amber: '#ff8c00',
    green: '#7cfc00',
    white: '#f0ead6',
    none: '#008080',
};


const DEFAULT_GRAPH_STYLE = [
    {
        selector: 'node',
        style: {
            'shape': 'data(shape)',
            'width': NODE_WIDTH,
            'height': NODE_HEIGHT,
            'background-color': 'data(color)',
            'background-width': '90%',
            'background-height': '90%',
            'background-position-x': '50%',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'label': '',
            'font-size': '10pt',
            'text-max-width': '300px',
            'text-wrap': 'ellipsis',
        },
    },
    {
        selector: 'node[image]',
        style: {
            'background-image': 'data(image)',
        },
    },
    {
        selector: 'node[type="relationship"]',
        style: {
            'background-image': 'data(image)',
            'width': NODE_WIDTH / 2,
            'height': NODE_HEIGHT / 2,
            'font-size': '8pt',
        },
    },
    {
        selector: 'node[type="marking-definition"]',
        style: {
            'width': NODE_WIDTH / 2,
            'height': NODE_HEIGHT / 2,
            'font-size': '8pt',
        },
    },
    {
        selector: 'node[type="idref"]',
        style: {
            'width': NODE_WIDTH / 2,
            'height': NODE_HEIGHT / 2,
            'font-size': '8pt',
        },
    },
    {
        selector: 'edge',
        style: {
            'width': 1,
            'opacity': 0.5,
            'label': 'data(label)',
            'curve-style': 'bezier', // 'straight',
            'line-color': '#bbb',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'min-zoomed-font-size': '5pt',
        },
    },
    {
        selector: 'edge[label="x_eclecticiq_alternative_hypothesis_refs"]',
        style: {
            'curve-style': 'bezier',
            'control-point-step-size': 40,
            'line-color': '#ccc',
        },
    },
    {
        selector: '.bleak',
        style: {
            opacity: 0.1,
        },
    },
    {
        selector: 'edge.autorotate',
        style: {
            'font-size': '9pt',
            'color': '#222',
            'edge-text-rotation': 'autorotate',
        },
    },
    {
        selector: 'node:selected',
        style: {
            'background-color': 'black',
        },
    },
];


const NODE_NAME_FIELDS = [
    'name',
    'display_name',
    'path',
    'value',
    'subject',
    'command_line',
    'key',
    'av_result',
    'region', 'country',
    'abstract',
    'opinion',
    'type',
];


function getNodeLabel(obj) {
    if (obj.type == 'marking-definition') {
        if (obj.definition_type == 'tlp') {
            return 'TLP: ' + obj.definition.tlp;
        } else if (obj.definition_type == 'statement') {
            return obj.definition.statement;
        }
    }

    for (let i = 0; i < NODE_NAME_FIELDS.length; i++) {
        if (obj[NODE_NAME_FIELDS[i]]) {
            return obj[NODE_NAME_FIELDS[i]];
        }
    }
    return obj.type;
}


function makeNodeElement(obj) {
    let icon = iconPerType[obj.type];
    if (!icon) {
        icon = getPlaceholderIcon(obj.type);
    }
    if (obj.type === 'marking-definition') {
        icon.color = TLP_HEX_COLORS[obj.definition.tlp] || '#2E8BC0';
    }
    return {
        group: 'nodes',
        data: {
            id: obj.id,
            label: getNodeLabel(obj),
            _raw: obj,
            shape: 'ellipse',
            type: obj.type,
            ...icon,
        },
        selectable: true,
        grabbable: true,
        classes: [obj.type, 'icon-' + obj.type],
    };
}


function makeEdgeElement(obj) {
    return {
        group: 'edges',
        data: {
            id: obj.id,
            source: obj.source_ref,
            target: obj.target_ref,
            label: obj.relationship_type,
            arrow: 'triangle',
            _raw: obj,
        },
        classes: ['autorotate'],
    };
}


function makeIdrefNodeElement(ref, originalRef) {
    return makeNodeElement({
        id: ref,
        type: 'idref',
        name: 'IDREF ' + ref,
        original_relationship: originalRef,
    });
}


function makeEdgesForRefs(node) {
    const entity = node.data._raw;
    const edges = [];
    if (!entity) {
        return edges;
    }

    function makeEdgeIfRef(val, field) {
        // treat all fields ending with _ref(s) as a reference fields
        if (!field.endsWith('_ref') && !field.endsWith('_refs')) {
            return;
        }
        const refs = (typeof val === 'string') ? [val] : val;
        refs.forEach((ref) => {
            const edge = makeEdgeElement({
                id: 'rel-' + entity.id + '-' + ref,
                source_ref: entity.id,
                target_ref: ref,
                relationship_type: field,
            });
            edges.push(edge);
        });
    }

    _.forEach(entity, makeEdgeIfRef);

    // check for embedded refs in extensions
    if (entity.extensions
        && entity.extensions['archive-ext']
        && entity.extensions['archive-ext']['contains_refs']) {
        makeEdgeIfRef(entity.extensions['archive-ext']['contains_refs'], 'contains_refs');
    }

    if (entity.granular_markings) {
        entity.granular_markings.forEach((r) => makeEdgeIfRef(r['marking_ref'], 'marking_ref'));
    }

    return edges;
}


function makeRelationshipNode(existingEdge) {
    const newNode = makeNodeElement({
        id: existingEdge.data.id,
        name: existingEdge.data.name || existingEdge.data.id,
        type: 'relationship',
        _raw: existingEdge.data,
    });
    const newEdges = [
        makeEdgeElement({
            id: 'rel-' + existingEdge.data.source + '-' + newNode.data.id,
            source_ref: existingEdge.data.source,
            target_ref: newNode.data.id,
            relationship_type: existingEdge.data.label,
        }),
        makeEdgeElement({
            id: 'rel-' + newNode.data.id + '-' + existingEdge.data.targer,
            source_ref: newNode.data.id,
            target_ref: existingEdge.data.target,
            relationship_type: existingEdge.data.label,
        }),
    ];
    return {node: newNode, edges: newEdges};
}

function showNodeDetails(sidebar, stixId, node) {
    const entity = node._raw;
    const tmpl = _.template(`
        <img class='sidebar-type-icon'
             src='<%= icon %>'>
        <%= obj.type %>
        <span class='sidebar-close-icon'>×</span>
        <h2 class='sidebar-title'><%- nodeLabel %></h2>
        <p><%= obj.description %></p>
        <p><strong>Labels:</strong> <%- (obj.labels || []).join(', ') %></p>
        <p><strong>External references:</strong>
            <%= (obj.external_references || [])
                .map((x) => ((x.description ? x.description + ": ": "")
                             + (x.url || x.source_name || "")))
                .join('; ') %>
        </p>
        <p><strong>Created</strong>: <%= obj.created %></p>
        <p><strong>ID:</strong> <%= obj.id %></p>
        <p>
            <strong>JSON:</strong><br/>
            <textarea class='sidebar-textarea' readonly='yes'><%- JSON.stringify(obj, null, 4) %>
            </textarea>
        </p>
    `);

    sidebar.innerHTML = tmpl({
        obj: entity,
        elId: stixId,
        nodeLabel: (
            getNodeLabel(entity) || (
                obj.definition_type == 'tlp'
                    ? (obj.definition_type + ': ' + obj.definition.tlp) : obj.definition_type)),
        icon: (iconPerType[entity.type] || getPlaceholderIcon(entity.type)).image}
    );

    sidebar.querySelector('.sidebar-close-icon').onclick = function() {
        sidebar.style.display = 'none';
    };
    sidebar.style.display = 'block';
}


function initSidebar(cy, stixId) {
    cy.nodes().on('click', (e) => {
        e.preventDefault();
        const clickedNode = e.target.data();
        showNodeDetails(cy.sidebar, stixId, clickedNode);
    });
}


function downloadData(data) {
    const hiddenElement = document.createElement('a');
    hiddenElement.href = (
        'data:application/json,' + encodeURIComponent(JSON.stringify(data, null, 4)));
    hiddenElement.download = data['id'] + '.json';
    hiddenElement.target = '_blank';
    hiddenElement.click();
}

function downloadPng(data, img) {
    const hiddenElement = document.createElement('a');
    hiddenElement.href = img;
    hiddenElement.download = 'graph-' + data['id'] + '.png';
    hiddenElement.target = '_blank';
    hiddenElement.click();
}


function initDownloadLinks(cy) {
    const linkJsonDownload = cy.element.querySelector('.download-json');
    if (linkJsonDownload) {
        linkJsonDownload.onclick = function(e) {
            e.preventDefault();
            downloadData(cy.raw_data);
        };
    }

    const linkPngDownload = cy.element.querySelector('.download-png');
    if (linkPngDownload) {
        linkPngDownload.onclick = function(e) {
            e.preventDefault();
            downloadPng(cy.raw_data, cy.png());
        };
    }
}


function runLayout(cy, layoutName) {
    const layout = cy.layout({
        name: layoutName,
        ...layoutProperties[layoutName],
    });
    layout.run();
    setTimeout(function() {
        layout.stop();
    }, 300);
    cy.layoutName = layoutName;
}


function populateIdrefEdge(nodesMap, edgesMap, edge) {
    let source = nodesMap[edge.data.source];
    let target = nodesMap[edge.data.target];

    const newNodes = [];
    const edgesToDelete = [];
    let newEdges = [];

    if (!source) {
        // a relationship to a relationship
        if (edge.data.source.startsWith('relationship')) {
            const existingEdge = edgesMap[edge.data.source];
            if (existingEdge) {
                edgesToDelete.push(existingEdge);
                const {node, edges} = makeRelationshipNode(existingEdge);
                source = node;
                newEdges = newEdges.concat(edges);
            }
        }
        source = source || makeIdrefNodeElement(edge.data.source, edge.data._raw);
        newNodes.push(source);
    }
    if (!target) {
        // a relationship to a relationship
        if (edge.data.target.startsWith('relationship')) {
            const existingEdge = edgesMap[edge.data.target];
            if (existingEdge) {
                edgesToDelete.push(existingEdge);
                const {node, edges} = makeRelationshipNode(existingEdge);
                target = node;
                newEdges = newEdges.concat(edges);
            }
        }
        target = target || makeIdrefNodeElement(edge.data.target, edge.data._raw);
        newNodes.push(target);
    }
    return {
        newNodes: newNodes,
        newEdges: newEdges,
        edgesToDelete: edgesToDelete,
    };
};


function makeElements(bundle, showIdrefs, highlighted, hidden, showMarkings) {
    let nodes = [];
    const nodesMap = {};
    // create nodes for every non-relationship object in a bundle
    bundle.objects.forEach((obj) => {
        if (obj.type === 'relationship') {
            return;
        }
        const node = makeNodeElement(obj);
        if ((highlighted.length > 0 && highlighted.indexOf(node.data.id) == -1)
            || (hidden.length > 0 && hidden.indexOf(node.data.id) > -1)) {
            // skip hidden node
            return;
        }
        if (!showMarkings && obj.type === 'marking-definition') {
            return;
        }
        nodes.push(node);
        nodesMap[node.data.id] = node;
    });

    let edges = [];
    const edgesMap = {};
    // create edges for every relationship object in a bundle
    bundle.objects.forEach((obj) => {
        if (obj.type != 'relationship') {
            return;
        }
        const edge = makeEdgeElement(obj);
        if ((highlighted.length > 0
                && (highlighted.indexOf(edge.data.source) == -1
                    || highlighted.indexOf(edge.data.target) == -1))
            || (hidden.length > 0
                && (hidden.indexOf(edge.data.source) > -1
                    || highlighted.indexOf(edge.data.target) > -1))) {
            // skip relationship if one of nodes was hidden
            return;
        }
        edges.push(edge);
        edgesMap[edge.data.id] = edge;
    });

    // create nodes and edges for all references in fields
    nodes.forEach((node) => {
        const refEdges = makeEdgesForRefs(node);
        edges = edges.concat(refEdges);
    });

    if (showIdrefs) {
        // create IDREF placeholder entities for hanging edges
        const idrefEdges = edges.filter((e) => (
            !(nodesMap[e.data.source] && nodesMap[e.data.target]))
        );
        idrefEdges.forEach((edge) => {
            const {newNodes, newEdges, edgesToDelete} = populateIdrefEdge(nodesMap, edgesMap, edge);
            edges = _.difference(edges, edgesToDelete);
            nodes = nodes.concat(newNodes);
            edges = edges.concat(newEdges);
        });
    } else {
        // Removing hanging entities
        edges = edges.filter(
            (e) => (nodesMap[e.data.source] && nodesMap[e.data.target]));
    }
    const elements = nodes.concat(edges);
    return elements;
};


function initWrapper(element, options) {
    const {caption, width, height, hideFooter} = options;

    element.classList.add('stix-viewer-block');

    const stixViewer = document.createElement('div');
    stixViewer.classList.add('stix-viewer');
    element.appendChild(stixViewer);

    const stixGraph = document.createElement('div');
    stixGraph.classList.add('stix-graph');
    stixViewer.appendChild(stixGraph);

    element.style.width = (isNaN(width) && width) || (width + 'px');
    stixGraph.style.width = '100%';
    stixGraph.style.height = (isNaN(height) && height) || (height + 'px');

    if (caption) {
        const captionDiv = document.createElement('div');
        captionDiv.setAttribute('class', 'viewer-header');
        captionDiv.innerText = caption;
        element.insertBefore(captionDiv, element.firstChild);
    }
    if (!hideFooter) {
        const viewerFooter = document.createElement('div');
        viewerFooter.setAttribute('class', 'viewer-footer');
        viewerFooter.innerHTML = `
            made with <a href="https://traut.github.io/stixview/">stixview</a>
            <span style="float:right">
                <a href="#" class="download-json">STIX2</a>&nbsp;
                <a href="#" class="download-png">PNG</a>
            </span>
        `;
        element.appendChild(viewerFooter);
    }
}


function initDragDrop(elem, callback) {
    elem.addEventListener('dragover', (e) => {
        e.stopPropagation();
        e.preventDefault();
        elem.classList.add('dragover-active');
        e.dataTransfer.dropEffect = 'copy';
    });
    elem.addEventListener('dragleave', (e) => {
        e.stopPropagation();
        e.preventDefault();
        elem.classList.remove('dragover-active');
    });
    elem.addEventListener('drop', (e) => {
        e.stopPropagation();
        e.preventDefault();
        elem.classList.remove('dragover-active');
        const files = e.dataTransfer.files; // Array of all files
        if (files.length > 1) {
            console.error('More than 1 file dropped, picking the first one', files);
        };
        if (files.lengh == 0) {
            return;
        }
        const file = files[0];
        readFile(file, callback);
    });
}


function initGraph(element, options, dataFetchCallback) {
    const {
        allowDragDrop,
        caption,
        layout,
        showSidebar,
        disableMouseZoom,
        disablePanning,
        highlightedObjects,
        hiddenObjects,
        hideFooter,
        showMarkings=true,
        minZoom,
        maxZoom,
        graphWidth,
        graphHeight,
        style,
        onClickNode,
    } = options;

    const width = graphWidth || element.clientWidth || 800;
    const height = graphHeight || 600;

    initWrapper(element, {width, height, caption, hideFooter});

    const viewer = element.querySelector('.stix-viewer');

    if (allowDragDrop) {
        viewer.querySelector('.stix-graph').innerHTML = (
            `<div class='viewer-placeholder'>Drag and drop STIX2 json file here</div>`);
        initDragDrop(element, (bundle) => dataFetchCallback(bundle));
    }

    const stixId = element.dataset.stixViewId;

    const cy = cache[stixId] = cytoscape({
        style: style || DEFAULT_GRAPH_STYLE,
        userZoomingEnabled: !disableMouseZoom,
        userPanningEnabled: !disablePanning,
    });

    cy.stixviewContainer = viewer.querySelector('.stix-graph');
    cy.minZoom(minZoom || 0.3);
    cy.maxZoom(maxZoom || 2.5);

    cy.highlightedObjects = highlightedObjects || [];
    cy.hiddenObjects = hiddenObjects || [];
    cy.showMarkings = showMarkings;

    if (showSidebar) {
        const sidebar = document.createElement('div');
        sidebar.setAttribute('class', 'sidebar');
        viewer.appendChild(sidebar);
        cy.sidebar = sidebar;
    }

    if (onClickNode) {
        cy.on('click', 'node', (e) => {
            e.preventDefault();
            const clickedNode = e.target.data();
            onClickNode(clickedNode);
        });
    }

    cy.layoutName = layout;
    cy.stixId = stixId;
    cy.element = element;

    const graph = {
        cy: cy,
        element: element,
        options: options,
        runLayout: function(layoutName) {
            return runLayout(cy, layoutName);
        },
        enableLabels: function() {
            cy.style()
                .selector('node')
                .style('label', 'data(label)')
                .update();
        },
        disableLabels: function() {
            cy.style()
                .selector('node')
                .style('label', '')
                .update();
        },
        fit: function() {
            cy.fit();
        },
        markAsLoading: function() {
            element.classList.add('loading');
            removePlaceholder(element);
        },
        markAsNotLoading: function() {
            element.classList.remove('loading');
        },
    };

    // ??? not the right place to fix mouse drift
    cy.resize();

    return graph;
}

function removePlaceholder(element) {
    const placeholder = element.querySelector('.viewer-placeholder');
    if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
}

function loadGraph(graph, bundle, showIdrefs, callback) {
    const cy = graph.cy;
    cy.remove('node');
    cy.remove('edge');

    cy.mount(cy.stixviewContainer);

    removePlaceholder(graph.element);

    const graphElements = makeElements(
        bundle,
        showIdrefs,
        cy.highlightedObjects,
        cy.hiddenObjects,
        cy.showMarkings);

    cy.add(graphElements);
    cy.raw_data = bundle;
    cy.once('layoutstop', () => callback && callback(graph));

    if (!graph.options.disableLabels) {
        cy.style()
            .selector('node')
            .style('label', 'data(label)')
            .update();
    }

    if (!graphElements) {
        callback && callback(graph);
    }
    initDownloadLinks(cy);

    runLayout(cy, cy.layoutName || DEFAULT_LAYOUT);
    if (cy.sidebar) {
        initSidebar(cy, cy.stixId);
    }
}

//    function htmlToElement(html) {
//        var template = document.createElement('template');
//        html = html.trim(); // Never return a text node of whitespace as the result
//        template.innerHTML = html;
//        return template.content.firstChild;
//    }


export {initGraph, loadGraph};
