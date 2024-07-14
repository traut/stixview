import _ from 'underscore';

// SDOs
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
const reportIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/report.svg');
const threatActorIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/threat-actor.svg');
const toolIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/tool.svg');
const vulnerabilityIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/vulnerability.svg');
// DOGESEC custom SDO
const weaknessIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/weakness.svg');
// SROs
const relationshipIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/relationship.svg');
const sightingIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/sighting.svg');
// SCOs
const artifactIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/artifact.svg');
const autonomousSystemIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/autonomous-system.svg');
const directoryIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/directory.svg');
const domainNameIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/domain-name.svg');
const emailAddrIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/email-addr.svg');
const emailMessageIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/email-message.svg');
const fileIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/file.svg');
const ipv4AddrIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/ipv4-addr.svg');
const ipv6AddrIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/ipv6-addr.svg');
const macAddrIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/mac-addr.svg');
const mutexIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/mutex.svg');
const networkTrafficIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/network-traffic.svg');
const processIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/process.svg');
const softwareIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/software.svg');
const urlIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/url.svg');
const userAccountIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/user-account.svg');
const windowsRegistryKeyIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/windows-registry-key.svg');
const x509CertificateIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/x509-certificate.svg');
// DOGESEC custom SCOs
const bankAccountIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/bank-account.svg');
const bankCardIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/bank-card.svg');
const cryptocurrencyTransactionIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/cryptocurrency-transaction.svg');
const cryptocurrencyWalletIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/cryptocurrency-wallet.svg');
const phoneNumberIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/phone-number.svg');
const userAgentIcon = require(
    '!svg-inline-loader?removeSVGTagAttrs=false!../icons/user-agent.svg');

function encodeSvg(icon) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(icon);
}

const iconPerType = {
    // SDOs
    'attack-pattern': {
        color: '#2277b5',
        shape: 'ellipse',
        image: encodeSvg(attackPatternIcon),
    },
    'campaign': {
        color: '#50b61e',
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
        color: '#9c9afe',
        shape: 'ellipse',
        image: encodeSvg(identityIcon),
    },
    'incident': {
        color: '#fbb616',
        shape: 'ellipse',
        image: encodeSvg(incidentIcon),
    },
    'indicator': {
        color: '#dc9547',
        shape: 'ellipse',
        image: encodeSvg(indicatorIcon),
    },
    'infrastructure': {
        color: '#aed7bf',
        shape: 'ellipse',
        image: encodeSvg(infrastructureIcon),
    },
    'intrusion-set': {
        color: '#38b2c1',
        shape: 'ellipse',
        image: encodeSvg(intrusionSetIcon),
    },
    'location': {
        color: '#fc9f9d',
        shape: 'ellipse',
        image: encodeSvg(locationIcon),
    },
    'malware-analysis': {
        color: '#e776ac',
        shape: 'ellipse',
        image: encodeSvg(malwareAnalysisIcon),
    },
    'malware': {
        color: '#d4a3cb',
        shape: 'ellipse',
        image: encodeSvg(malwareIcon),
    },
    'note': {
        color: '#88c881',
        shape: 'ellipse',
        image: encodeSvg(noteIcon),
    },
    'observed-data': {
        color: '#fcccb8',
        shape: 'ellipse',
        image: encodeSvg(observedDataIcon),
    },
    'opinion': {
        color: '#909dc7',
        shape: 'ellipse',
        image: encodeSvg(opinionIcon),
    },
    'report': {
        color: '#779279',
        shape: 'ellipse',
        image: encodeSvg(reportIcon),
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
    // DOGESEC custom SDO
    'weakness': {
        color: '#5e3180',
        shape: 'ellipse',
        image: encodeSvg(weaknessIcon),
    },
    // SROs
    'relationship': {
        color: '#94f38b',
        shape: 'ellipse',
        image: encodeSvg(relationshipIcon),
    },
    'sighting': {
        color: '#eb5e2a',
        shape: 'ellipse',
        image: encodeSvg(sightingIcon),
    },
    // SCOs
    'artifact': {
        color: '#95e5fa',
        shape: 'ellipse',
        image: encodeSvg(artifactIcon),
    },
    'autonomous-system': {
        color: '#a1f880',
        shape: 'ellipse',
        image: encodeSvg(autonomousSystemIcon),
    },
    'directory': {
        color: '#b7f5ce',
        shape: 'ellipse',
        image: encodeSvg(directoryIcon),
    },
    'domain-name': {
        color: '#ffb9a7',
        shape: 'ellipse',
        image: encodeSvg(domainNameIcon),
    },
    'email-addr': {
        color: '#9180f2',
        shape: 'ellipse',
        image: encodeSvg(emailAddrIcon),
    },
    'email-message': {
        color: '#f981e5',
        shape: 'ellipse',
        image: encodeSvg(emailMessageIcon),
    },
    'file': {
        color: '#c794bb',
        shape: 'ellipse',
        image: encodeSvg(fileIcon),
    },
    'ipv4-addr': {
        color: '#de82ab',
        shape: 'ellipse',
        image: encodeSvg(ipv4AddrIcon),
    },
    'ipv6-addr': {
        color: '#de82ab',
        shape: 'ellipse',
        image: encodeSvg(ipv6AddrIcon),
    },
    'mac-addr': {
        color: '#f7b8cb',
        shape: 'ellipse',
        image: encodeSvg(macAddrIcon),
    },
    'mutex': {
        color: '#f0e499',
        shape: 'ellipse',
        image: encodeSvg(mutexIcon),
    },
    'network-traffic': {
        color: '#84cff0',
        shape: 'ellipse',
        image: encodeSvg(networkTrafficIcon),
    },
    'process': {
        color: '#bbc799',
        shape: 'ellipse',
        image: encodeSvg(processIcon),
    },
    'software': {
        color: '#e991ca',
        shape: 'ellipse',
        image: encodeSvg(softwareIcon),
    },
    'url': {
        color: '#cecff1',
        shape: 'ellipse',
        image: encodeSvg(urlIcon),
    },
    'user-account': {
        color: '#d5bf84',
        shape: 'ellipse',
        image: encodeSvg(userAccountIcon),
    },
    'windows-registry-key': {
        color: '#84c4aa',
        shape: 'ellipse',
        image: encodeSvg(windowsRegistryKeyIcon),
    },
    'x509-certificate': {
        color: '#f6a0f2',
        shape: 'ellipse',
        image: encodeSvg(x509CertificateIcon),
    },
    // DOGESEC SCOs
    'bank-account': {
        color: '#e8e4aa',
        shape: 'ellipse',
        image: encodeSvg(bankAccountIcon),
    },
    'bank-card': {
        color: '#91b2b5',
        shape: 'ellipse',
        image: encodeSvg(bankCardIcon),
    },
    'cryptocurrency-transaction': {
        color: '#dee9a7',
        shape: 'ellipse',
        image: encodeSvg(cryptocurrencyTransactionIcon),
    },
    'cryptocurrency-wallet': {
        color: '#9cdab8',
        shape: 'ellipse',
        image: encodeSvg(cryptocurrencyWalletIcon),
    },
    'phone-number': {
        color: '#e2bdef',
        shape: 'ellipse',
        image: encodeSvg(phoneNumberIcon),
    },
    'user-agent': {
        color: '#98c7ef',
        shape: 'ellipse',
        image: encodeSvg(userAgentIcon),
    },
    // SMOs
    'extension-definition': {
        color: '#b0d799',
        shape: 'tag',
    },
    'marking-definition': {
        color: '#72d1fb',
        shape: 'tag',
    },
    'language-content': {
        color: '#ff1744',
        shape: 'tag',
    },
    // idref placeholder node
    'idref': {
        color: '#ccc',
        shape: 'octagon',
    },
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
    const color = '#B99435'; // Default color for an icon without an image file
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
