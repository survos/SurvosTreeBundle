import { Controller } from '@hotwired/stimulus';
import { createTree, getTree, destroyTree } from '../jstree_runtime.js';

export default class extends Controller {
    static values = {
        plugins: { type: Array, default: [] },
        types: { type: Object, default: {} },
        checkboxes: { type: Boolean, default: false },
    };

    static targets = ['html'];

    connect() {
        this.root = this.hasHtmlTarget ? this.htmlTarget : this.element;
        this.root.classList.add('sv-tree');
        this.initializeTree();
    }

    disconnect() {
        if (this.root) {
            this.root.removeEventListener('ready.jstree', this.onReady);
            this.root.removeEventListener('changed.jstree', this.onChanged);
            this.root.removeEventListener('select_node.jstree', this.onSelectNode);
            destroyTree(this.root);
        }
    }

    initializeTree() {
        const plugins = [...this.pluginsValue];
        if (this.checkboxesValue && !plugins.includes('checkbox')) {
            plugins.push('checkbox');
        }
        if (!plugins.includes('search')) {
            plugins.push('search');
        }
        if (Object.keys(this.typesValue || {}).length > 0 && !plugins.includes('types')) {
            plugins.push('types');
        }

        createTree(this.root, {
            plugins,
            core: {
                check_callback: true,
                themes: {
                    name: false,
                    url: false,
                    dots: false,
                    icons: true,
                },
            },
            types: this.typesValue,
        });

        this.root.addEventListener('ready.jstree', this.onReady);
        this.root.addEventListener('changed.jstree', this.onChanged);
        this.root.addEventListener('select_node.jstree', this.onSelectNode);
    }

    onReady = (event) => {
        const detail = event.detail || {};
        window.dispatchEvent(new CustomEvent('jstree.ready', {
            detail: {
                rootId: this.root.id || null,
                instance: detail.instance || null,
            },
        }));
    }

    onChanged = (event) => {
        const detail = event.detail || {};
        const payload = {
            msg: 'changed',
            data: detail,
            node: detail.node || null,
            selected: detail.selected || [],
        };
        window.dispatchEvent(new CustomEvent('jstree', { detail: payload }));
        window.dispatchEvent(new CustomEvent('apitree_changed', { detail: payload }));
    }

    onSelectNode = (event) => {
        const detail = event.detail || {};
        const payload = {
            msg: 'click',
            data: detail.node ? detail.node.data || {} : {},
            node: detail.node || null,
            selected: detail.selected || [],
        };
        window.dispatchEvent(new CustomEvent('jstree', { detail: payload }));
        window.dispatchEvent(new CustomEvent('apitree_changed', { detail: payload }));
    }

    search(event) {
        const term = (event.currentTarget?.value || '').trim();
        const tree = getTree(this.root);
        if (!tree) {
            return;
        }
        tree.search(term);
    }

    clearSearch() {
        const tree = getTree(this.root);
        if (!tree) {
            return;
        }
        tree.clear_search();
    }
}
