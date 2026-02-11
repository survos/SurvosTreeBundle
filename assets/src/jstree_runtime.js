import $ from 'jquery';

if (!window.jQuery) {
    window.jQuery = $;
}
if (!window.$) {
    window.$ = $;
}

await import('@tacman1123/jstree-esm/jquery-plugin');

export {
    createTree,
    getTree,
    hasTree,
    callTree,
    destroyTree,
    configureDefaults,
    version
} from '@tacman1123/jstree-esm/browser-module';
