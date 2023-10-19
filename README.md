# Survos Tree Bundle

Working with hierarchical data can get complex quickly.  Fortunately, there are tools to help.  This bundle wraps 3 amazing tools together.

* a {% tree %} twig tag for recursively displaying a tree without writing a twig macro
Wrapper for jstree using ApiPlatform.  Also includes a {% tree %} twig tag.
* A stimulus controller that calls the jstree javascript library
* Some helpers to integrate with ApiPlatform for editing and creating tree nodes.

In addition to the above, the has a dependency on stof/doctrine-extensions-bundle to make doctrine entities hierarchical.

```bash
composer req survos/tree-bundle
```

## Tree Tag

The `{% tree %}` tag works almost like `{% for %}`, but inside a `{% tree %}` you can call `{% subtree var %}`  See more details at tacman/tree-tag.

```twig

{% tree item in menu %}
  {% if treeloop.first %}<ul>{% endif %}
    <li>
        <a href="{{ item.url }}">{{ item.name }}</a>
        {% subtree item.children %}
    </li>
  {% if treeloop.last %}</ul>{% endif %}
{% endtree %}


```


## Issue with AutoImport

```json
    "controllers": {
      "tree": {
        "main": "src/controllers/tree_controller.js",
        "webpackMode": "eager",
        "fetch": "lazy",
        "enabled": true,
        "autoimport": {
          "jstree/dist/themes/default/style.min.css": true
        }
      },

```
