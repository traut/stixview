import _ from 'underscore';

import {getNodeIcon, getNodeLabel} from './data.js';

function renderSidebarContent(node) {
    const entity = node.raw;
    const tmpl = _.template(`
        <img class='sidebar-type-icon'
             style='background: <%= color %>'
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

    const icon = getNodeIcon(entity);

    return tmpl({
        obj: entity,
        nodeLabel: getNodeLabel(entity),
        icon: icon.image,
        color: icon.color,
    });
}

export {renderSidebarContent};
