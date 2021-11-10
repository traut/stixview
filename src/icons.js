import _ from 'underscore';

const attackPatternIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/attack-pattern.svg');
const campaignIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/campaign.svg');
const courseOfActionIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/course-of-action.svg');
const groupingIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/grouping.svg');
const identityIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/identity.svg');
const incidentIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/incident.svg');
const indicatorIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/indicator.svg');
const infrastructureIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/infrastructure.svg');
const intrusionSetIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/intrusion-set.svg');
const locationIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/location.svg');
const malwareAnalysisIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/malware-analysis.svg');
const malwareIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/malware.svg');
const noteIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/note.svg');
const observedDataIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/observed-data.svg');
const opinionIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/opinion.svg');
const relationshipIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/relationship.svg');
const reportIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/report.svg');
const sightingIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/sighting.svg');
const threatActorIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/threat-actor.svg');
const toolIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/tool.svg');
const vulnerabilityIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/vulnerability.svg');

const hypothesisIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/x-eclecticiq-hypothesis.svg');

function encodeSvg(icon) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(icon);
}

const iconPerType = {
    'attack-pattern': {
        color: '#2277b5',
        shape: 'ellipse',
        image: encodeSvg(attackPatternIcon),
    },
    'campaign': {
        color: '#50b682',
        shape: 'ellipse',
        image: encodeSvg(campaignIcon),
    },
    'course-of-action': {
        color: '#a1c628',
        shape: 'ellipse',
        image: encodeSvg(courseOfActionIcon),
    },
    'grouping': {
        color: '#a3358b',
        shape: 'ellipse',
        image: encodeSvg(groupingIcon),
    },
    'identity': {
        color: '#9c9d9d',
        shape: 'ellipse',
        image: encodeSvg(identityIcon),
    },
    'incident': {
        color: '#fcb617',
        shape: 'ellipse',
        image: encodeSvg(incidentIcon),
    },
    'indicator': {
        color: '#e38850',
        shape: 'ellipse',
        image: encodeSvg(indicatorIcon),
    },
    'infrastructure': {
        color: '#aed7c0',
        shape: 'ellipse',
        image: encodeSvg(infrastructureIcon),
    },
    'intrusion-set': {
        color: '#39b2c1',
        shape: 'ellipse',
        image: encodeSvg(intrusionSetIcon),
    },
    'location': {
        color: '#505657',
        shape: 'ellipse',
        image: encodeSvg(locationIcon),
    },
    'malware-analysis': {
        color: '#e776ac',
        shape: 'ellipse',
        image: encodeSvg(malwareAnalysisIcon),
    },
    'malware': {
        color: '#d3a3cb',
        shape: 'ellipse',
        image: encodeSvg(malwareIcon),
    },
    'note': {
        color: '#505657',
        shape: 'ellipse',
        image: encodeSvg(noteIcon),
    },
    'observed-data': {
        color: '#000000',
        shape: 'ellipse',
        image: encodeSvg(observedDataIcon),
    },
    'opinion': {
        color: '#505657',
        shape: 'ellipse',
        image: encodeSvg(opinionIcon),
    },
    'relationship': {
        color: '#cdd6d8',
        shape: 'ellipse',
        image: encodeSvg(relationshipIcon),
    },
    'report': {
        color: '#769279',
        shape: 'ellipse',
        image: encodeSvg(reportIcon),
    },
    'sighting': {
        color: '#eb5e2a',
        shape: 'ellipse',
        image: encodeSvg(sightingIcon),
    },
    'threat-actor': {
        color: '#e61b5c',
        shape: 'ellipse',
        image: encodeSvg(threatActorIcon),
    },
    'tool': {
        color: '#57509d',
        shape: 'ellipse',
        image: encodeSvg(toolIcon),
    },
    'vulnerability': {
        color: '#ffd100',
        shape: 'ellipse',
        image: encodeSvg(vulnerabilityIcon),
    },
    'marking-definition': {
        color: '#72d1fb',
        shape: 'tag',
    },
    // custom EclecticIQ object
    'x-eclecticiq-hypothesis': {
        color: '#009688',
        shape: 'ellipse',
        image: encodeSvg(hypothesisIcon),
    },
    // idref placeholder node
    'idref': {
        color: '#ccc',
        shape: 'octagon',
    },
};


// Cyber-observable Objects colors

const cyberObsColors = {
    'artifact': '#155126',
    'autonomous-system': '#99e5ad',
    'directory': '#2d5192',
    'domain-name': '#4cf185',
    'email-addr': '#489f90',
    'email-message': '#abd533',
    'mime-part-type': '#4233a6',
    'file': '#bfd6fa',
    'archive-ext': '#7487fb',
    'ipv4-addr': '#c338c5',
    'ipv6-addr': '#eca2d5',
    'mac-addr': '#782857',
    'mutex': '#2c97e0',
    'network-traffic': '#39970e',
    'process': '#d6061a',
    'software': '#e69976',
    'url': '#914c0f',
    'user-account': '#f4d403',
    'windows-registry-key': '#f23387',
    'x509-certificate': '#e0d59b',
};


const unknownIconTmpl = `
<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="event-icon">
    <circle id="e" cx="100" cy="100" r="100" fill="<%= color %>"/>
    <text
        x="50%" y="150"
        text-anchor="middle"
        style="font: bold 150px sans-serif"
        fill="white" stroke="white">
        <%= letter %>
    </text>
</g>
</svg>
`;


function getPlaceholderIcon(nodeType) {
    const template = _.template(unknownIconTmpl);
    const letter = nodeType.charAt(0).toUpperCase();
    const color = cyberObsColors[nodeType] || '#B99435';
    return {
        color: color,
        shape: 'ellipse',
        image: encodeSvg(template({
            nodeType: nodeType,
            color: color,
            letter: letter,
        })),
    };
}

export {iconPerType, getPlaceholderIcon};
