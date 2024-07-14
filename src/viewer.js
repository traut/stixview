import cytoscape from 'cytoscape';

import klay from 'cytoscape-klay';
import euler from 'cytoscape-euler';
import coseBilkent from 'cytoscape-cose-bilkent';
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import cise from 'cytoscape-cise';
import cytoscapePopper from 'cytoscape-popper';

import autopanOnDrag from 'cytoscape-autopan-on-drag';

import {readFile} from './utils.js';
import {bundleToGraphElements} from './data.js';
import {renderSidebarContent} from './sidebar.js';

import {computePosition} from '@floating-ui/dom';


cytoscape.use(klay);
cytoscape.use(euler);
cytoscape.use(coseBilkent);
cytoscape.use(cola);
cytoscape.use(dagre);
cytoscape.use(cise);

// cytoscape-popper requires an explicit factory
// https://github.com/cytoscape/cytoscape.js-popper?tab=readme-ov-file#migration-from-v2
function popperFactory(ref, content, opts) {
    function update() {
        computePosition(ref, content, opts).then(({x, y}) => {
            Object.assign(content.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });
    }
    update();
    return {update};
}

cytoscape.use(cytoscapePopper(popperFactory));

autopanOnDrag(cytoscape);

const DEFAULT_LAYOUT = 'cola';
const NODE_WIDTH = 30;
const NODE_HEIGHT = 30;

const LAYOUT_PROPS = {
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
        selector: 'node[type="extension-definition"]',
        style: {
            'width': NODE_WIDTH / 2,
            'height': NODE_HEIGHT / 2,
            'font-size': '8pt',
        },
    },
    {
        selector: 'node[type="language-content"]',
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

function addSidebarListener(cy) {
    cy.nodes().on('click', (e) => {
        e.preventDefault();
        const node = e.target.data();

        cy.sidebar.innerHTML = (
            cy.sidebarRender ? cy.sidebarRender(node) : renderSidebarContent(node));

        const closeIcon = cy.sidebar.querySelector('.sidebar-close-icon');
        if (closeIcon) {
            closeIcon.onclick = () => {
                cy.sidebar.style.display = 'none';
            };
        }
        cy.sidebar.style.display = 'block';
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
            downloadData(cy.bundle);
        };
    }

    const linkPngDownload = cy.element.querySelector('.download-png');
    if (linkPngDownload) {
        linkPngDownload.onclick = function(e) {
            e.preventDefault();
            downloadPng(cy.bundle, cy.png());
        };
    }
}


function clustersForCise(cy) {
    // See docs for more details:
    // https://github.com/iVis-at-Bilkent/cytoscape.js-cise/

    const options = {};
    const clusters = cy.elements().markovClustering(options);

    for (let i = 0; i < clusters.length; i++) {
        for (let j = 0; j < clusters[i].length; j++) {
            clusters[i][j]._private.data.clusterID = i;
        }
    };

    const arrayOfClusterArrays = [];
    cy.nodes().forEach(function (node) {
        arrayOfClusterArrays.push([node.data('id')]);
    });
    return arrayOfClusterArrays;
}


function runLayout(cy, layoutName) {
    const localProps = {};
    if (layoutName === 'cise') {
        localProps.clusters = clustersForCise(cy);
    }

    const layout = cy.layout({
        name: layoutName,
        ...LAYOUT_PROPS[layoutName],
        ...localProps,
    });
    layout.run();
    setTimeout(function() {
        layout.stop();
    }, 300);
    cy.layoutName = layoutName;
}

function initWrapper(element, options) {
    const {caption, width, height, showFooter} = options;

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
    if (showFooter) {
        const viewerFooter = document.createElement('div');
        viewerFooter.setAttribute('class', 'viewer-footer');
        viewerFooter.innerHTML = `
            made with <a href="https://traut.github.io/stixview/">Stixview</a>
            <span style="float:right">
                <a href="#" class="download-json">STIX2</a>&nbsp;
                <a href="#" class="download-png">PNG</a>
            </span>
        `;
        element.appendChild(viewerFooter);
    }
    return element;
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


function initGraph(element, viewProps, dataFetchCallback) {
    const {
        // default view settings
        layout,
        caption,
        showFooter,
        showSidebar,
        showLabels,

        allowDragDrop,
        enableMouseZoom,
        enablePanning,
        graphWidth,
        graphHeight,
        minZoom,
        maxZoom,
        // extra settings
        graphStyle,

        onClickNode,
        sidebarRender,
    } = viewProps;

    const width = graphWidth || element.clientWidth || 800;
    const height = graphHeight || 600;

    element = initWrapper(element, {width, height, caption, showFooter});
    const viewer = element.querySelector('.stix-viewer');

    if (allowDragDrop) {
        viewer.querySelector('.stix-graph').innerHTML = (
            `<div class='viewer-placeholder'>Drag and drop STIX2 json file here</div>`);
        initDragDrop(element, (bundle) => dataFetchCallback(bundle));
    }

    const cy = cytoscape({
        style: graphStyle || DEFAULT_GRAPH_STYLE,
        userZoomingEnabled: enableMouseZoom,
        userPanningEnabled: enablePanning,
    });

    cy.stixviewContainer = viewer.querySelector('.stix-graph');
    cy.minZoom(minZoom || 0.3);
    cy.maxZoom(maxZoom || 2.5);

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
    cy.stixId = element.dataset.stixViewId;
    cy.element = element;
    cy.sidebarRender = sidebarRender;

    const graph = {
        cy: cy,
        element: element,
        viewProps: {
            showLabels: showLabels,
        },
        runLayout: (layoutName) => runLayout(cy, layoutName),
        toggleLabels: (showLabels) => {
            cy.style()
                .selector('node')
                .style('label', showLabels ? 'data(label)' : '')
                .update();
        },
        fit: () => cy.fit(),
        toggleLoading: (isLoading) => {
            if (isLoading) {
                element.classList.add('loading');
                removePlaceholder(element);
            } else {
                element.classList.remove('loading');
            }
        },
        setSidebarRender: () => {
            cy.sidebarRender = sidebarRender;
        },
    };

    cy.resize();

    return graph;
}


function removePlaceholder(element) {
    const placeholder = element.querySelector('.viewer-placeholder');
    if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
    }
}


function attachTag(cy, node, tag, placement) {
    const div = document.createElement('div');
    div.innerHTML = tag.value.toUpperCase();
    div.classList.add('marking-tag');
    div.classList.add(tag.css);

    placement = placement || 'right-start';

    const popper = node.popper({
        content: () => {
            cy.element.appendChild(div);
            return div;
        },
        popper: {
            placement: placement,
        },
    });
    const update = () => {
        popper.update();
        const dim = Math.min(Math.max(cy.zoom() * 8, 2), 10);
        div.style.fontSize = dim + 'pt';
        div.style.lineHeight = Math.ceil(dim) + 'pt';
    };
    node.on('position', update);
    cy.on('pan zoom resize', update);
    return {
        element: div,
        removeListeners: () => {
            cy.off('pan zoom resize', update);
        },
    };
}


function loadGraph(graph, bundle, dataProps, callback) {
    const {
        highlightedObjects,
        hiddenObjects,
        showTlpAsTags,
        showMarkingNodes,
        showIdrefs,
    } = dataProps;

    const cy = graph.cy;
    cy.remove('node');
    cy.remove('edge');

    cy.mount(cy.stixviewContainer);

    removePlaceholder(graph.element);

    const graphElements = bundleToGraphElements(
        bundle,
        {
            highlightedObjects,
            hiddenObjects,
            showTlpAsTags,
            showMarkingNodes,
            showIdrefs,
        }
    );

    cy.add(graphElements);
    cy.bundle = bundle;
    cy.once('layoutstop', () => callback && callback(graph));

    if (cy.tags) {
        // clean up all tag elements
        cy.tags.forEach((tag) => {
            tag.removeListeners();
            const el = tag.element;
            el.parentNode && el.parentNode.removeChild(el);
        });
        cy.tags = [];
    }

    if (showTlpAsTags) {
        cy.tags = [];
        cy.nodes().forEach((node) => {
            const data = node.data();
            if (!data.tags || !data.tags.length) {
                return;
            }
            const placements = ['right-start', 'right', 'right-end'];

            // at the moment only 3 tags are supported
            const tags = data.tags.slice(0, 3);

            tags.forEach((tag, index) => {
                const placement = placements[index];
                const obj = attachTag(cy, node, tag, placement);
                cy.tags.push(obj);
            });
        });
    }
    graph.toggleLabels(graph.viewProps.showLabels);

    if (!graphElements) {
        callback && callback(graph);
    }
    initDownloadLinks(cy);

    runLayout(cy, cy.layoutName || DEFAULT_LAYOUT);

    if (cy.sidebar) {
        addSidebarListener(cy);
    }
}


export {initGraph, loadGraph};
