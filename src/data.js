import _ from 'underscore';

import {mostRelaxedTlp} from './utils.js';
import {iconPerType, getPlaceholderIcon} from './icons.js';


const TLP_HEX_COLORS = {
    red: 'red',
    amber: 'orange',
    green: 'green',
    white: '#f0ead6',
    none: '#008080',
};


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


function getTlpMarkings(bundle) {
    const tlpMarkings = {
        // tlp v1
        'marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9': {
            'id': 'marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9',
            'value': 'white',
            'css': 'marking-tag-tlp-white',
        },
        'marking-definition--34098fce-860f-48ae-8e50-ebd3cc5e41da': {
            'id': 'marking-definition--34098fce-860f-48ae-8e50-ebd3cc5e41da',
            'value': 'green',
            'css': 'marking-tag-tlp-green',
        },
        'marking-definition--f88d31f6-486f-44da-b317-01333bde0b82': {
            'id': 'marking-definition--f88d31f6-486f-44da-b317-01333bde0b82',
            'value': 'amber',
            'css': 'marking-tag-tlp-amber',
        },
        'marking-definition--5e57c739-391a-4eb3-b6be-7d15ca92d5ed': {
            'id': 'marking-definition--5e57c739-391a-4eb3-b6be-7d15ca92d5ed',
            'value': 'red',
            'css': 'marking-tag-tlp-red',
        },
        // tlp v2
        'marking-definition--94868c89-83c2-464b-929b-a1a8aa3c8487': {
            'id': 'marking-definition--94868c89-83c2-464b-929b-a1a8aa3c8487',
            'value': 'clear',
            'css': 'marking-tag-tlpv2-clear',
        },
        'marking-definition--bab4a63c-aed9-4cf5-a766-dfca5abac2bb': {
            'id': 'marking-definition--bab4a63c-aed9-4cf5-a766-dfca5abac2bb',
            'value': 'green',
            'css': 'marking-tag-tlpv2-green',
        },
        'marking-definition--55d920b0-5e8b-4f79-9ee9-91f868d9b421': {
            'id': 'marking-definition--55d920b0-5e8b-4f79-9ee9-91f868d9b421',
            'value': 'amber',
            'css': 'marking-tag-tlpv2-amber',
        },
        'marking-definition--939a9414-2ddd-4d32-a0cd-375ea402b003': {
            'id': 'marking-definition--939a9414-2ddd-4d32-a0cd-375ea402b003',
            'value': 'amber+strict',
            'css': 'marking-tag-tlpv2-amber-strict',
        },
        'marking-definition--e828b379-4e03-4974-9ac4-e53a884c97c1': {
            'id': 'marking-definition--e828b379-4e03-4974-9ac4-e53a884c97c1',
            'value': 'red',
            'css': 'marking-tag-tlpv2-red',
        },
    };
    bundle.objects.filter((obj) =>
        obj.type == 'marking-definition' && obj.definition && obj.definition.tlp
    ).forEach((obj) => {
        if (obj.id in tlpMarkings) {
            return;
        }
        tlpMarkings[obj.id] = {
            'value': obj.name,
            'css': 'marking-tag-tlp-custom',
        };
    });
    return tlpMarkings;
}


function getTlpMarkingsForObj(tlpMarkingsMap, obj) {
    if (!obj.object_marking_refs || !obj.object_marking_refs.length) {
        return [];
    }
    return (
        obj.object_marking_refs
            .filter((ref) => (ref in tlpMarkingsMap))
            .map((ref) => tlpMarkingsMap[ref])
    );
}

function bundleToGraphElements(bundle, dataProps) {
    const {
        highlightedObjects,
        hiddenObjects,
        showTlpAsTags,
        showMarkingNodes,
        showIdrefs,
    } = dataProps;

    let nodes = [];
    const nodesMap = {};
    const omittedNodesMap = {};

    const bundleNodeObjects = bundle.objects.filter((obj) => obj.type != 'relationship');
    const bundleRelationshipObjects = bundle.objects.filter((obj) => obj.type == 'relationship');

    const tlpMarkingMap = getTlpMarkings(bundle);

    function addNodeFiltered(node) {
        if (node.data.id in nodesMap) {
            return;
        }
        nodes.push(node);
        nodesMap[node.data.id] = node;
    }

    // create nodes for every non-relationship object in a bundle
    bundleNodeObjects.forEach((obj) => addNodeFiltered(makeNodeElement(obj)));

    let edges = [];
    const edgesMap = {};

    function addEdgeFiltered(edge) {
        if (edge.data.id in edgesMap) {
            return;
        }
        edges.push(edge);
        edgesMap[edge.data.id] = edge;
    }

    // create edges for every relationship object in a bundle
    bundleRelationshipObjects.forEach((obj) => addEdgeFiltered(makeEdgeElement(obj)));

    // create edges for all references in inline fields
    nodes.forEach((node) => makeEdgesForRefs(node).forEach(addEdgeFiltered));

    // create edges for all extensions in object.extensions
    nodes.forEach((node) => makeEdgesForExtensions(node).forEach(addEdgeFiltered));

    // creates nodes for all missing TLP marking-definitions
    edges
        .filter((e) => !(nodesMap[e.data.source] && nodesMap[e.data.target]))
        .forEach((e) => {
            if (e.data.source in tlpMarkingMap && !(e.data.source in nodesMap)) {
                const marking = tlpMarkingMap[e.data.source];
                const node = makeTlpNode(marking);
                addNodeFiltered(node);
            }
            if (e.data.target in tlpMarkingMap && !(e.data.target in nodesMap)) {
                const marking = tlpMarkingMap[e.data.target];
                const node = makeTlpNode(marking);
                addNodeFiltered(node);
            }
        });

    if (showIdrefs) {
        // create IDREF placeholder entities for hanging edges
        const edgesToAddAll = [];
        const edgesToDeleteAll = [];
        edges
            .filter((e) => (
                // filter out relations with both nodes present
                !(nodesMap[e.data.source] && nodesMap[e.data.target])
            ))
            .forEach((edge) => {
                const {
                    newNodes, newEdges, edgesToDelete,
                } = expandIdref(nodesMap, edgesMap, edge);
                edgesToDeleteAll.push(...edgesToDelete);
                edgesToAddAll.push(...newEdges);

                newNodes.forEach(addNodeFiltered);
            });

        edges = _.difference(edges, edgesToDeleteAll);
        edgesToAddAll.forEach(addEdgeFiltered);
    } else {
        // Removing hanging entities
        edges = edges.filter((e) => (
            // filter out relations with one of nodes missing
            (nodesMap[e.data.source] && nodesMap[e.data.target])
        ));
    }


    // filter out the data

    nodes = nodes.filter((node) => {
        if (node.data.id in omittedNodesMap) {
            return false;
        }
        if ((highlightedObjects.length > 0 && highlightedObjects.indexOf(node.data.id) == -1)
                || (hiddenObjects.length > 0 && hiddenObjects.indexOf(node.data.id) > -1)) {
            // skip hidden nodes
            omittedNodesMap[node.data.id] = node;
            return false;
        } else if (node.data.id.startsWith('marking-definition')
                && (node.data.raw.definition && 'tlp' in node.data.raw.definition)
                && showTlpAsTags) {
            // hide marking definitions for TLP (even idrefs) if `showTlpAsTags` is set
            omittedNodesMap[node.data.id] = node;
            return false;
        } else if (node.data.id.startsWith('marking-definition') && !showMarkingNodes) {
            // hide all marking definitions (even idrefs) if `showMarkingNodes` is NOT set
            omittedNodesMap[node.data.id] = node;
            return false;
        }
        return true;
    });

    edges = edges.filter((e) => (
        // filter out relations where one of the nodes is omitted
        !(omittedNodesMap[e.data.source] || omittedNodesMap[e.data.target])
    ));

    setTags(
        nodes,
        bundle,
        {
            showTlpAsTags: showTlpAsTags,
            showAttackAsTags: true,
        },
        tlpMarkingMap,
    );

    const elements = nodes.concat(edges);
    return elements;
};


function setTags(nodes, bundle, props, tlpMarkingMap) {
    if (props.showTlpAsTags) {
        nodes.forEach((node) => {
            const tlpTags = getTlpMarkingsForObj(tlpMarkingMap, node.data.raw);
            if (tlpTags.length == 0) {
                return;
            }
            let tlpTag = null;
            if (tlpTags.length > 1) {
                // pick only the most relaxed tag
                console.warn(
                    'More than one TLP marking for ' + node.data.id
                    + ', showing the most relaxed one'
                );
                tlpTag = mostRelaxedTlp(tlpTags);
            } else {
                tlpTag = tlpTags[0];
            }
            if (!tlpTag) {
                return;
            }
            node.data.tags.push(tlpTag);
        });
    }

    if (props.showAttackAsTags) {
        const attackMap = getAttackMarkings(bundle);
        nodes.forEach((node) => {
            const attackTags = getAttackTags(attackMap, node.data.raw, bundle);
            if (attackTags.length == 0) {
                return;
            }
            const attackTagsStr = attackTags.sort().join(', ');
            node.data.tags.push(attackTagsStr);
        });
    }
    return nodes;
}

function getAttackMarkings(bundle) {
    return {};
};

function getAttackTags(attackMap, obj, bundle) {
    // find relations
    // find related TTPs
    return [];
}


function expandIdref(nodesMap, edgesMap, edge) {
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
        source = source || makeIdrefNodeElement(edge.data.source, edge.data.raw);
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
        target = target || makeIdrefNodeElement(edge.data.target, edge.data.raw);
        newNodes.push(target);
    }
    return {
        newNodes: newNodes,
        newEdges: newEdges,
        edgesToDelete: edgesToDelete,
    };
};


function makeIdrefNodeElement(ref, originalRef) {
    return makeNodeElement({
        id: ref,
        type: 'idref',
        name: ref,
        original_relationship: originalRef,
        raw: {},
    });
}


function makeEdgesForRefs(node) {
    const entity = node.data.raw;
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


function makeEdgesForExtensions(node) {
    const entity = node.data.raw;
    const edges = [];
    if (!entity?.extensions) {
        return edges;
    }
    Object.keys(entity.extensions).forEach((def) => {
        const edge = makeEdgeElement({
            id: 'rel-' + entity.id + '-' + def,
            source_ref: entity.id,
            target_ref: def,
            relationship_type: 'extension-definition',
        });
        edges.push(edge);
    });
    return edges;
}

function makeTlpNode(marking) {
    return makeNodeElement({
        id: marking.id,
        // in accordance to STIX2 spec
        // https://docs.oasis-open.org/cti/stix/v2.1/csprd01/stix-v2.1-csprd01.html#_Toc16070766
        name: 'TLP:' + marking.value.toUpperCase(),
        type: 'marking-definition',
        definition_type: 'tlp',
        definition: {
            tlp: marking.value,
        },
    });
}


function makeRelationshipNode(existingEdge) {
    const newNode = makeNodeElement({
        id: existingEdge.data.id,
        name: existingEdge.data.name || existingEdge.data.id,
        type: 'relationship',
        raw: existingEdge.data,
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


function makeNodeElement(obj) {
    const icon = getNodeIcon(obj);
    return {
        group: 'nodes',
        data: {
            id: obj.id,
            label: getNodeLabel(obj),
            shape: 'ellipse',
            type: obj.type,
            tags: [],
            raw: obj,
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
            raw: obj,
        },
        classes: ['autorotate'],
    };
}

function getNodeLabel(obj) {
    if (obj.type == 'marking-definition') {
        if (obj.definition_type == 'tlp') {
            return obj.name;
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

function getNodeIcon(obj) {
    const icon = iconPerType[obj.type] || getPlaceholderIcon(obj.type);
    if (obj.type === 'marking-definition') {
        if (obj.definition && obj.definition.tlp) {
            const tlpValue = obj.definition.tlp.toLowerCase();
            icon.color = TLP_HEX_COLORS[tlpValue] || '#2E8BC0';
        } else {
            icon.color = '#2E8BC0';
        }
    }
    return icon;
}


export {bundleToGraphElements, getNodeLabel, getNodeIcon};
