import $ from 'jquery';
import {
    createTree,
    getTree,
    hasTree,
    callTree,
    destroyTree,
    configureDefaults,
    version
} from '@tacman1123/jstree-esm';

if (!window.jQuery) {
    window.jQuery = $;
}
if (!window.$) {
    window.$ = $;
}

export { createTree, getTree, hasTree, callTree, destroyTree, configureDefaults, version };
