// tree-bundle/assets/src/controllers/tree_controller.js

import {Controller} from "@hotwired/stimulus";
import jQuery from 'jquery';
import 'jstree';

export default class extends Controller {

    static values = {
        msg: { type: String, default: '/bill' },
        // interval: { type: Number, default: 5 },
        // clicked: { type: Boolean, default: false },
    }

    static targets = [ "html", "ajax" ]

    connect() {
        console.log('hello from ' + this.identifier);
        // this.element.textContent = msg;
        if (this.hasHtmlTarget) {
            this.html(this.htmlTarget);
        }
    }

    addListeners($element) {
        console.log('adding listeners. ', $element);
        $element
            .on('changed.jstree', this.onChanged) // triggered when selection changes, can be multiple, data is tree data, not node data
            .on('ready.jstree', (e, data) => {
                console.warn('ready.jstree fired, so opening_all');
                // $element.jstree('open_all');
            })
    }


    html(el) {
        // jQuery.tree.reference(el );
        let $el = $(el);
        $el.jstree(
            {
                "plugins": ['checkbox', 'theme', "html_data", "types"]
            }
        );
        this.addListeners($el);

    }
}
