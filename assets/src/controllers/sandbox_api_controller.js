// during dev, from project_dir run
// ln -s ~/survos/bundles/grid-bundle/assets/src/controllers/sandbox_api_controller.js assets/controllers/sandbox_api_controller.js
import {Controller} from "@hotwired/stimulus";
import {default as axios} from "axios";
// const $ = window.jQuery; // require('jquery');
require('jstree'); // add jstree to jquery
import $ from 'jquery'; // for jstree

const contentTypes = {
    'PATCH': 'application/merge-patch+json',
    'POST': 'application/json'
};

export default class extends Controller {
    static targets = ['ajax'];
    static values = {
        apiCall: {type: String, default: ''},
        filter: {type: String, default: '{}'}
    }

    connect() {
        super.connect(); //
        this.filter = JSON.parse(this.filterValue);

        this.url = this.apiCallValue;
        console.log('hi from ' + this.identifier + ' ' + this.url, this.filter);
        this.treeElement = this.ajaxTarget;
        this.configure($(this.treeElement));

    }


    notify(message) {
        console.log(message);
        this.messageTarget.innerHTML = message;
    }

    configure($element)
    {
        this.tree = $element
            .jstree({
                "core" : {
                    animation : 0,
                    // operation can be 'create_node', 'rename_node', 'delete_node', 'move_node', 'copy_node' or 'edit'
                    check_callback : function (operation, node, node_parent, node_position, more) {
                        switch (operation) {
                            case 'delete_node':
                                return confirm("Are you sure you want to delete " + node.text);
                            case 'create_nodex':
                                console.log(node_parent);
                                $.confirm({
                                    title: 'Create a new location',
                                    content: '' +
                                        '<form action="" class="formName">' +
                                        '<div class="form-group">' +
                                        '<label>New Location Name (in PARENT)</label>' +
                                        '<input type="text" placeholder="Location Name" class="name form-control" required />' +
                                        '</div>' +
                                        '</form>',
                                    buttons: {
                                        ok: function() {

                                            location.href = this.$target.attr('href');
                                        },
                                        cancel: function () {
                                            //close
                                        },
                                    }
                                });
                                console.warn('returning false in check_callback for ' + operation);
                                return false; // manually create a node with our name.
                            case 'create_node':
                            case 'rename_node':
                            case 'move_node':
                            case 'edit':
                                // @todo: check that we're logged in and have permission?  Or ...?
                                return true;
                            default:
                                console.error('unhandled check_callback: ' + operation);
                                return true;
                        }
                    },
                    'force_text' : true,
                    "themes" : { "stripes" : true },
                    'data' : {
                        'url' : (node) => {
                            console.log('data.url: calling ' + this.url);

                            // @todo: add params to node
                            return this.url; // + '.json'; // or set this in api_platform routes?
                        },
                        success: function(data) {
                            // we've received the jsTree formatted data.
                            // console.warn('!!', data);
                            console.warn('success!', data);
                        },

                        // api_platform calls return JSON in a certain format, but js-tree needs it in another.
                        converters:
                            {
                                "text json": function (dataString) {
                                    let data = JSON.parse(dataString);
                                    return data['hydra:member'].map( x => {
                                        return { parent: x.parentId ?? '#', id: x.id, text: x.name };
                                    });
                                }
                            },
                        // dataType: 'json', // let it come back as json-ld
                        // this is the data SENT to the server
                        'data' :  (node) => {
                            return {...this.filter, ...{'fields': ['parentId', 'name']}};
                            // return { id : node.id }; e.g. send # if root node.  Maybe send buildingId?
                        }
                    }
                },
                "types" : {
                    "#" : { "max_children" : 1, "max_depth" : 4, "valid_children" : ["root"] },
                    "root" : { "icon" : "/static/3.3.9/assets/images/tree_icon.png", "valid_children" : ["default"] },
                    "default" : { "valid_children" : ["default","file"] },
                    "file" : { "icon" : "glyphicon glyphicon-file", "valid_children" : [] }
                },
                // "plugins" : [ "search", "state", "types", "wholerow" ]
                // "plugins" : [ "contextmenu", "dnd", "search", "state", "types", "wholerow" ]
            })
            .on('xxready.jstree',  (e, data) => {
                console.warn($(e.currentTarget).attr('id'))
                console.warn(e, e.currentTarget, 'ready.jstree (configuration)');
                // $(e.currentTarget).jstree.open_all();
                // this.jstree('open_all');
                // this.tree.open_all();
                // $element.open_all();
                $(this).jstree("open_all");
                // $(this).open_all();
                // demo_save();
            })
        ;
        return this.tree;

    }

    render() {

        // this.$element.jstree(true).settings.core.data = ['New Data'];

        if (this.$element) {
            // this.$element.jstree(true).refresh();
            // this.$element.jstree('open_all');
        }
        return;


        let $element = this.$element;
        console.log('calling render()');
        // $('#jstree_demo').html('loading tree.');

        let apiUrlBase = $element.data('apiBase');
        this.$element = $element;
        this.url = apiUrlBase;
        console.log('api base: ' + this.url);
        /* @
        this.references = [];
        this.render();
         */

    }


}
