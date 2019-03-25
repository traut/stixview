import _ from 'underscore';
import $ from 'jquery';

import cytoscape from 'cytoscape';

import klay from 'cytoscape-klay';
import euler from 'cytoscape-euler';
import coseBilkent from 'cytoscape-cose-bilkent';
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';

import autopanOnDrag from 'cytoscape-autopan-on-drag';


cytoscape.use(klay);
cytoscape.use(euler);
cytoscape.use(coseBilkent);
cytoscape.use(cola);
cytoscape.use(dagre);
autopanOnDrag(cytoscape);


const DEFAULT_LAYOUT = 'cola';
const NODE_WIDTH = 30;
const NODE_HEIGHT = 30;

const layoutProperties = {
    euler: {
        pull: 0.006,
        mass: node => 10,
        animation: false,
        dragCoeff: 0.3
    },
    'cose-bilkent': {
        animate: 'end',
        animationEasing: 'ease-out',
        animationDuration: 300,
		nodeRepulsion: 200,
        idealEdgeLength: NODE_WIDTH * 3,
        gravityRange: 50,
        gravity: 8.2,
        //nestingFactor: 10,
        padding: 50,
    },
    cola: {
        convergenceThreshold: 100, // end layout sooner, may be a bit lower quality
        animate: false
    }
}

const iconPerType = {
    'threat-actor': {
        color: '#d32b49',
        shape: 'ellipse',
        image: 'icons/threat-actor.svg',
    },
    tool: {
        color: '#6661ab',
        shape: 'star',
        image: 'icons/tool.svg',
    },
    vulnerability: {
        color: '#eaca6b',
        shape: 'diamond',
        image: 'icons/vulnerability.svg',
    },
    malware: {
        color: '#6661ab',
        shape: 'ellipse',
        image: 'icons/malware.svg',
    },
    'intrusion-set': {
        color: '#396eb6',
        shape: 'ellipse',
        image: 'icons/intrusion-set.svg',
    },
    indicator: {
        color: '#e38850',
        shape: 'pentagon',
        image: 'icons/indicator.svg',
    },
    'attack-pattern': {
        color: '#6661ab',
        shape: 'diamond',
        image: 'icons/attack-pattern.svg',
    },
    'course-of-action': {
        color: '#7fbe82',
        shape: 'ellipse',
        image: 'icons/course-of-action.svg',
    },
    campaign: {
        color: '#1d6775',
        shape: 'star',
        image: 'icons/campaign.svg',
    },
    report: {
        color: '#2d2b5f',
        shape: 'ellipse',
        image: 'icons/report.svg',
    },
    identity: {
        color: '#9c9d9d',
        shape: 'diamond',
        image: 'icons/identity.svg',
    },
    'marking-definition': {
        color: '#72d1fb',
        shape: 'tag'
    },
    sighting: {
        color: '#383839',
        shape: 'ellipse',
        image: 'icons/sighting.svg',
    },
    'observed-data': {
        color: '#AB558C',
        shape: 'ellipse',
        image: 'icons/observed-data.svg',
    },
    relationship: {
        color: '#31A9C1',
        shape: 'ellipse',
        image: 'icons/relationship.svg',
    },

    // stix2.1
    opinion: {
        color: '#881177',
        shape: 'ellipse',
        image: 'icons/opinion.svg',
    },

    // custom
    'x-eclecticiq-hypothesis': {
        color: '#009688',
        shape: 'ellipse',
        image: 'icons/x-eclecticiq-hypothesis.svg',
    },

    // placeholder node
    'idref': {
        color: '#ccc',
        shape: 'octagon',
    },
}

const TLP_HEX_COLORS = {
    red: '#ff0000',
    amber: '#ff8c00',
    green: '#7cfc00',
    white: '#ccc',
    none: '#008080',
}

const REF_FIELDS = [
    'sighting_of_ref',
    'created_by_ref',
    'object_marking_refs',
    'object_refs',
    'x_eclecticiq_alternative_hypothesis_refs']


const DEFAULT_GRAPH_STYLE = [
    {
        selector: 'node[image]',
        style: {
            shape: 'data(shape)',
            'background-color': 'data(color)',
            'background-width': '80%',
            'background-height': '80%',
            'background-position-x': '50%',
            //'background-color': '#ea8a31',
            'background-image': 'data(image)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            label: '',
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
        }
    },
    {
        selector: 'node',
        style: {
            shape: 'data(shape)',
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            'background-color': 'data(color)',
            'background-width': '80%',
            'background-height': '80%',
            'background-position-x': '50%',
            'text-valign': 'bottom',
            'text-halign': 'center',
            label: '',
            'font-size': '10pt',
            color: 'rgba(0, 0, 0, 0.5)',
            'text-max-width': '300px',
            'text-wrap': 'ellipsis',
        }
    },
    {
        selector: 'node[type="relationship"]',
        style: {
            shape: 'data(shape)',
            'background-color': 'data(color)',
            'background-width': '80%',
            'background-height': '80%',
            'background-position-x': '50%',
            'background-image': 'data(image)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            label: '',
            width: NODE_WIDTH / 2,
            height: NODE_HEIGHT / 2,
            'font-size': '8pt',
        }
    },
    {
        selector: 'node[type="idref"]',
        style: {
            shape: 'data(shape)',
            'background-color': 'data(color)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            label: '',
            width: NODE_WIDTH / 2,
            height: NODE_HEIGHT / 2,
            'font-size': '8pt',
        }
    },
    {
        selector: 'edge',
        style: {
            width: 1,
            opacity: 0.5,
            label: 'data(label)',
            //'curve-style': 'haystack',
            //'haystack-radius': 0,
            'curve-style': 'straight',
            'line-color': '#bbb',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'min-zoomed-font-size': '5pt',
        },
    },
    {
        selector: 'edge[label="x_eclecticiq_alternative_hypothesis_refs"]',
        style: {
            width: 1,
            opacity: 0.5,
            label: 'data(label)',
            //'curve-style': 'haystack',
            //'haystack-radius': 0,
            'curve-style': 'bezier',
            'control-point-step-size': 40,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'min-zoomed-font-size': '5pt',
        },
    },
    {
        selector: '.bleak',
        style: {
            opacity: 0.1
        }
    },
    {
        selector: 'edge.autorotate',
        style: {
            'font-size': '9pt',
            'color': '#222',
            'edge-text-rotation': 'autorotate',
        }
    },
    {
        selector: 'node:selected',
        style: {
            'background-color': 'black',
        }
    },
]


function makeNodeElement(obj) {
    var icon = iconPerType[obj.type];

    if (obj.type === 'marking-definition') {
        icon.color = TLP_HEX_COLORS[obj.definition.tlp];
    }

    return {
        group: 'nodes',
        data: {
            id: obj.id,
            label: obj.name,
            _raw: obj,
            shape : "ellipse",
            color : "#ccc",
            type: obj.type,
            ...icon,
        },
        selectable: true,
        grabbable: true,
        classes: [obj.type],
    }
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
    }
}

function makeIdrefNodeElement(ref, original_rel) {
    return makeNodeElement({
        id: ref,
        type: 'idref',
        name: 'IDREF ' + ref,
        original_relationship: original_rel,
    });
}


function makeEdgesForRefs(node) {
    let entity = node.data._raw;
    let edges = [];
    if (!entity) {
        return edges;
    }
    _.forEach(entity, function (val, field) {
        if (REF_FIELDS.indexOf(field) == -1) {
            return
        }
        let refs = null;
        if (typeof val === 'string') {
            refs = [val];
        } else {
            refs = val;
        }
        _.forEach(refs, function(ref) {
            let edge = makeEdgeElement({
                id: 'rel-' + entity.id + '-' + ref,
                source_ref: entity.id,
                target_ref: ref,
                relationship_type: field
            });
            edges.push(edge);
        });
    });
    return edges;
}


function makeRelationshipNode(existingEdge) {

    var newNode = makeNodeElement({
        id: existingEdge.data.id,
        name: existingEdge.data.name || existingEdge.data.id,
        type: 'relationship',
        _raw: existingEdge.data,
    })
//        {
//            type: 'circle',
//            color: getStixIcon('relationship').color,
//            size: defaultNodeSize / 2,
//            image: getNodeImage('relationship')
//        });
    var newEdges = [
        makeEdgeElement({
            id: 'rel-' + existingEdge.data.source + '-' + newNode.data.id,
            source_ref: existingEdge.data.source,
            target_ref: newNode.data.id,
            relationship_type: existingEdge.data.label
        }),
        makeEdgeElement({
            id: 'rel-' + newNode.data.id + '-' + existingEdge.data.targer,
            source_ref: newNode.data.id,
            target_ref: existingEdge.data.target,
            relationship_type: existingEdge.data.label
        })
    ]
    return {node: newNode, edges: newEdges};
}


function showNodeDetails($sidebar, stixId, node) {
    let entity = node._raw;

//    if (sidebarNode == node) {
//        closeSidebar();
//        return;
//    } else {
//        if (sidebarNode) {
//            //deselectNode(sidebarNode);
//        }
//    }
//    sidebarNode = node;
    var tmpl = _.template(`
        <img class='sidebar-type-icon'
             src='icons/<%= obj.type %>.svg'
             onerror="this.style.display='none'"/><%= obj.type %><span class='sidebar-close-icon'>×</span>
        <h2><%- (obj.name || (
            obj.definition_type == 'tlp' ?
                (obj.definition_type + ': ' + obj.definition.tlp)
                : obj.definition_type)) %></h2>
        <p><%= obj.description %></p>
        <p><strong>Labels:</strong> <%- (obj.labels || []).join(', ') %></p>
        <p><strong>External references:</strong>
        <%= (obj.external_references || []).map(x => ((x.description ? x.description + ": ": "")+ (x.url || x.source_name || ""))).join('; ') %></p>
        <p><strong>Created</strong>: <%= obj.created %></p>
        <p><strong>ID:</strong> <%= obj.id %></p>
        <p>
            <strong>JSON:</strong>
            <br/>
            <textarea class='sidebar-textarea' readonly='yes'><%- JSON.stringify(obj, null, 4) %></textarea>
        </p>
    `);
    $sidebar.html(tmpl({obj: entity, elId: stixId}));
    $sidebar.find('.sidebar-close-icon').on('click', function() {
        $sidebar.css('display', 'none');
    });
    $sidebar.css('display', 'block');
}

function initSidebar(parentEl, stixId, cy) {
    $(parentEl).append("<div class='sidebar'></div>")
    let $sidebar = $(parentEl).find('.sidebar');

    cy.nodes().on('click', function(e){
        e.preventDefault();
        let clickedNode = e.target.data();
        showNodeDetails($sidebar, stixId, clickedNode);
    });
}


function configureKeyboardListener(cy) {
    // Configure keyboard listener
    var keyPressedMoveTimeout = null;

    // var cam = sig.camera;

    window.onkeydown = function(e) {
        var step = 20;
        var timeoutInterval = 30;
        var coord = null;
        if (e.keyCode == 87 || e.keyCode == 38) {  // w
            coord = {
                x: cam.x,
                y: cam.y - step,
            }
        }
        if (e.keyCode == 65 || e.keyCode == 37) {  // a
            coord = {
                x: cam.x - step,
                y: cam.y,
            }
        }
        if (e.keyCode == 83 || e.keyCode == 40) {  // s
            coord = {
                x: cam.x,
                y: cam.y + step,
            }
        }
        if (e.keyCode == 68 || e.keyCode == 39) {  // d
            coord = {
                x: cam.x + step,
                y: cam.y,
            }
        }
        if (e.keyCode == 81) {  // q
            coord = {
                ratio: cam.ratio * 1.1
            }
        }
        if (e.keyCode == 69) {  // e
            coord = {
                ratio: cam.ratio * 0.9
            }
        }
        if (e.keyCode == 27) {  // esc
            if (sidebarNode) {
                closeSidebar();
            }
        }
        if (e.key === 'Delete' || e.key == 'Backspace') {  // delete
            cy.$(':selected').remove();
        }
        if ((e.metaKey || e.ctrlKey) && e.keyCode == 85) { // meta +
            _.forEach(sig.graph.nodes(), function(e) {
                e.size = e.size + nodeSizeStep;
            });
            e.preventDefault();
        }
        if ((e.metaKey || e.ctrlKey) && e.keyCode == 74) { // meta +
            _.forEach(sig.graph.nodes(), function(e) {
                e.size = e.size - nodeSizeStep;
            });
            e.preventDefault();
        }
        if (keyPressedMoveTimeout) {
            return
        }
        keyPressedMoveInterval = setTimeout(function() {
            //cam.goTo(coord)
            //sig.refresh()
        }, timeoutInterval)
    }
    window.onkeyup = function(e) {
        clearTimeout(keyPressedMoveTimeout);
    }
}


function loadFileFromParams() {
    var url = new URL(window.location.href);
    var remoteBundle = url.searchParams.get('bundle');
    if (remoteBundle) {
        loadRemoteFile(remoteBundle);
    }
}

function readAndParseFile(file) {
    if (file.type == 'application/json') {
        var reader = new FileReader();
        reader.onload = function(e2) {
            var data = JSON.parse(e2.target.result);
            currentRawDataset = data;
            initOrReloadGraph(data);
        }
        reader.readAsText(file); // start reading the file data.
    }
}


function runLayout(cy, layoutName) {
    var layout = cy.layout({
        name: layoutName,
        ...layoutProperties[layoutName]
    })
    layout.run();
    setTimeout(function() {
        layout.stop();
    }, 300);
}


function configureButtonListeners(cy) {
    document
        .getElementById('layout-select')
        .addEventListener('change', function(e) {
            runLayout(e.target.value);
        });

    let showLabels = false;

    document
        .getElementById('toggle-labels')
        .addEventListener('click', function() {
            showLabels = !showLabels;
            if (showLabels) {
                cy.style().selector('node').style('label', 'data(label)').update();
            } else {
                cy.style().selector('node').style('label', '').update();
            }
            var toggleLabelsEl = document.getElementById('toggle-labels');
            if (showLabels) {
                toggleLabelsEl.innerText = 'Disable labels';
            } else {
                toggleLabelsEl.innerText = 'Enable labels';
            }
        });

    document.getElementById('fit-graph').addEventListener('click', function(e) {
        e.preventDefault();
        cy.fit();
    });

    document.getElementById('toggle-idrefs').addEventListener('click', function(e) {
        document.getElementById('toggle-idrefs').disabled = true;
        e.preventDefault();
        setTimeout(function() {
            showIdrefs = !showIdrefs;
            initOrReloadGraph(window.cy.raw_data)
            document.getElementById('toggle-idrefs').disabled = false;
        }, 50);
    });

}

function configureFileInput() {
	function handleFileSelect(evt) {
		var files = evt.target.files; // FileList object
		if (files.length > 1) {
			console.error("More than 1 file dropped, picking first one")
		};
		if (files.lengh == 0) {
			return
		}
		var file = files[0];
		readAndParseFile(file);
	}

	document
		.getElementById(FILE_INPUT_ID)
		.addEventListener('change', handleFileSelect, false);
}


function turnRelationshipIntoNode(rel_id) {
    let existingEdge = edgesMap[rel_id];
    if (existingEdge) {
        // remove old edge
        edges = _.without(edges, existingEdge);
        // make new node
        res = makeRelationshipNode(existingEdge);
        newNodes.push(res.node);
        newEdges = newEdges.concat(res.edges);
    }
}



function populateIdrefEdge(nodesMap, edgesMap, edge) {
    let source = nodesMap[edge.data.source];
    let target = nodesMap[edge.data.target];

    let newNodes = [];
    let newEdges = [];
    let edgesToDelete = [];

    if (!source) {
        // a relationship to a relationship
        if (edge.data.source.startsWith('relationship')) {
            let existingEdge = edgesMap[edge.data.source];
            if (existingEdge) {
                edgesToDelete.push(existingEdge);
                let { node, edges } = makeRelationshipNode(existingEdge);
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
            let existingEdge = edgesMap[edge.data.target];
            if (existingEdge) {
                edgesToDelete.push(existingEdge);
                let { node, edges } = makeRelationshipNode(existingEdge);
                target = node;
                newEdges = newEdges.concat(edges);
            }
        }
        target = target || makeIdrefNodeElement(edge.data.target, edge.data._raw);
        newNodes.push(target)
    }
    return {
        newNodes: newNodes,
        newEdges: newEdges,
        edgesToDelete: edgesToDelete,
    }
};

function makeElements(bundle, showIdrefs, highlighted) {
    let nodes = [];
    let nodesMap = {};
    _.forEach(bundle.objects, function (obj) {
        if (obj.type === 'relationship') {
            return
        }
        let node = makeNodeElement(obj);
        if (highlighted.length > 0 && highlighted.indexOf(node.data.id) == -1) {
            // skip
            return;
        }
        nodes.push(node)
        nodesMap[node.data.id] = node;
    })

    let edges = [];
    let edgesMap = {};
    _.forEach(bundle.objects, function (obj) {
        if (obj.type != 'relationship') {
            return
        }
        let edge = makeEdgeElement(obj);
        if (highlighted.length > 0
                && (highlighted.indexOf(edge.data.source) == -1
                    || highlighted.indexOf(edge.data.target) == -1)) {
            // skip
            return;
        }
        edges.push(edge)
        edgesMap[edge.data.id] = edge;
    })

    // create nodes and edges for all field references
    nodes.forEach(function(node) {
        let refEdges = makeEdgesForRefs(node);
        edges = edges.concat(refEdges);
    })

    if (showIdrefs) {
        // Create IDREF placeholder entities for hanging edges
        let idrefEdges = _.filter(edges, function(e) {
            return !(nodesMap[e.data.source] && nodesMap[e.data.target]);
        });
        idrefEdges.forEach(function(edge) {
            let {
                newNodes,
                newEdges,
                edgesToDelete
            } = populateIdrefEdge(nodesMap, edgesMap, edge);

            edges = _.difference(edges, edgesToDelete);
            nodes = nodes.concat(newNodes);
            edges = edges.concat(newEdges);
        });
    } else {
        // Removing hanging entities
        let connectedEdges = _.filter(edges, function(e) {
            return (nodesMap[e.data.source] && nodesMap[e.data.target]);
        });
        let idrefsCount = edges.length - connectedEdges.length;
        edges = connectedEdges;
    }
    let elements = nodes.concat(edges);
    return elements;
}

let cache = {};

function initGraph(element, bundle, options, callback) {
    const {
        layout,
        showIdrefs,
        showSidebar,
        disableMouseZoom,
        disablePanning,
        disableLabels,
        highlightedObjects,
        minZoom,
        maxZoom,
    } = options;

    let stixId = element.dataset.stixViewerId;
    let cy = cache[stixId];
    let viewer = $(element).find(".stix-viewer");
    let graph = $(element).find(".stix-graph");

    if (cy) {
        cy.remove("node");
        cy.remove("edge");
    } else {
        cy = cache[element.dataset.stixViewerId] = cytoscape({
            container: graph,
            style: DEFAULT_GRAPH_STYLE,
            layout: layout,
            userZoomingEnabled: !disableMouseZoom,
            userPanningEnabled: !disablePanning,
        });
        cy.minZoom(minZoom || 0.3);
        cy.maxZoom(maxZoom || 2.5);

        cy.on('layoutstop', callback);

//        setInterval(function() {
//            if (!element.hidden) {
//                if (cy.headless()) {
//                    cy.mount();
//                    console.info("mounted", cy.headless(), element.dataset.stixViewerId);
//                }
//            } else {
//                if (!cy.headless()) {
//                    cy.unmount();
//                    console.info("unmounted", cy.headless(), element.dataset.stixViewerId);
//                }
//            }
//        }, 1000);

        //cy.autopanOnDrag({enabled: true});
        //configureKeyboardListener(cy);
        //configureButtonListeners(cy);
    }
    let graphElements = makeElements(bundle, showIdrefs, highlightedObjects);

    cy.add(graphElements);
    cy.raw_data = bundle;
    cy.style().selector('node').style('label', 'data(label)').update();

    runLayout(cy, layout || DEFAULT_LAYOUT);

    if (showSidebar) {
        initSidebar(viewer, stixId, cy);
    }
    if (!graphElements) {
        callback()
    }
}

function isScrolledIntoView(el) {
    var rect = el.getBoundingClientRect();
    var elemTop = rect.top;
    var elemBottom = rect.bottom;

    // Only completely visible elements return true:
    var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    // Partially visible elements return true:
    //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
    return isVisible;
}

export default initGraph;
