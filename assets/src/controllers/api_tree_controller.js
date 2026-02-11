import { Controller } from '@hotwired/stimulus';
import { createTree, getTree, destroyTree } from '../jstree_runtime.js';

export default class extends Controller {
    static targets = ['ajax', 'message'];

    static values = {
        apiCall: { type: String, default: '' },
        labelField: { type: String, default: 'name' },
        filter: { type: String, default: '{}' },
        plugins: { type: Array, default: ['search', 'types'] },
        types: { type: Object, default: {} },
    };

    async connect() {
        this.baseUrl = this.apiCallValue;
        this.filterObj = this.parseFilter(this.filterValue);
        this.notify(`api_tree: ${this.baseUrl}`);

        if (!this.hasAjaxTarget || !this.baseUrl) {
            return;
        }

        await this.renderTree();
    }

    disconnect() {
        if (this.hasAjaxTarget) {
            this.ajaxTarget.removeEventListener('changed.jstree', this.onChanged);
            this.ajaxTarget.removeEventListener('select_node.jstree', this.onSelectNode);
            destroyTree(this.ajaxTarget);
        }
    }

    async renderTree() {
        const members = await this.fetchAllNodes();
        const data = this.toJsTreeData(members);

        this.ajaxTarget.innerHTML = '';
        createTree(this.ajaxTarget, {
            plugins: this.pluginsValue,
            core: {
                data,
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

        this.ajaxTarget.addEventListener('changed.jstree', this.onChanged);
        this.ajaxTarget.addEventListener('select_node.jstree', this.onSelectNode);
    }

    parseFilter(raw) {
        try {
            const parsed = JSON.parse(raw || '{}');
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    }

    notify(message) {
        if (this.hasMessageTarget) {
            this.messageTarget.textContent = message;
        }
    }

    async fetchAllNodes() {
        const url = new URL(this.baseUrl, window.location.origin);
        Object.entries(this.filterObj).forEach(([k, v]) => {
            if (v !== null && v !== undefined && v !== '') {
                url.searchParams.set(k, String(v));
            }
        });

        const response = await fetch(url.toString(), {
            headers: {
                Accept: 'application/ld+json, application/json',
            },
        });
        if (!response.ok) {
            this.notify(`api_tree: ${response.status} ${response.statusText}`);
            return [];
        }

        const payload = await response.json();
        const members = payload['hydra:member'] || payload.member || payload.items || payload;
        if (!Array.isArray(members)) {
            return [];
        }
        this.notify(`api_tree: loaded ${members.length} nodes`);
        return members;
    }

    toJsTreeData(members) {
        return members.map((node) => {
            const id = this.nodeId(node);
            const parent = this.nodeParent(node);
            const isDir = node.isDir === true;

            return {
                id,
                parent,
                text: this.nodeLabel(node),
                icon: isDir ? 'bi bi-folder2-open' : 'bi bi-file-earmark',
                type: isDir ? 'dir' : 'file',
                data: node,
            };
        });
    }

    nodeId(node) {
        if (node.code !== undefined && node.code !== null && node.code !== '') {
            return String(node.code);
        }
        if (node.id !== undefined && node.id !== null && node.id !== '') {
            return String(node.id);
        }
        if (node['@id']) {
            return this.normalizeApiId(node['@id']);
        }
        return String(Math.random());
    }

    nodeParent(node) {
        const parent = node.parentId ?? node.parent ?? node.parentCode ?? null;
        if (parent === null || parent === '' || parent === '#') {
            return '#';
        }
        if (typeof parent === 'object') {
            if (parent.code !== undefined && parent.code !== null) {
                return String(parent.code);
            }
            if (parent.id !== undefined && parent.id !== null) {
                return String(parent.id);
            }
            if (parent['@id']) {
                return this.normalizeApiId(parent['@id']);
            }
        }
        return this.normalizeApiId(parent);
    }

    normalizeApiId(value) {
        const str = String(value);
        if (str.includes('/')) {
            const parts = str.split('/').filter(Boolean);
            return parts.length ? parts[parts.length - 1] : str;
        }
        return str;
    }

    nodeLabel(node) {
        return node[this.labelFieldValue] ?? node.name ?? node.title ?? this.nodeId(node);
    }

    search(event) {
        const term = (event.currentTarget?.value || '').trim();
        const tree = getTree(this.ajaxTarget);
        if (tree) {
            tree.search(term);
        }
    }

    clearSearch() {
        const tree = getTree(this.ajaxTarget);
        if (tree) {
            tree.clear_search();
        }
    }

    onChanged = (event) => {
        const detail = event.detail || {};
        this.dispatchNode(detail.node || null, 'changed', detail);
    }

    onSelectNode = (event) => {
        const detail = event.detail || {};
        this.dispatchNode(detail.node || null, 'select_node', detail);
    }

    dispatchNode(node, msg = 'changed', detail = {}) {
        const data = node && node.data ? node.data : node;
        const payload = {
            msg,
            data,
            node,
            original: detail,
            hydra: data,
        };
        window.dispatchEvent(new CustomEvent('apitree_changed', { detail: payload }));
    }
}
