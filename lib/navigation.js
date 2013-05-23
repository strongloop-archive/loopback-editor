var TaskEmittter = require('sl-task-emitter'),
    _ = require('underscore');

module.exports = function getNavigationMenus(project, options, callback) {
  var files, configByType, dependencyTree;

  function iconForObject(o) {
    var editor = options.subEditors.subEditorForObject(o);
    return editor ? editor.name : "null";
  }

  function urlForObject(o) {
      return "/project/" + options.projectName + "/object/" + o.normalDir() + "/edit";
  }

  function createFilesNav(files) {
    var nav = [];
    files.forEach(function(f) {
      var node = {
        title: f.name
      };
      if (f.obj) {
        node.title += " (" + f.obj.module.name + ")";
        node.icon = iconForObject(f.obj);
        node.href = urlForObject(f.obj);
        node.key = f.obj.normalDir();
      } else {
        node.key = '_file_' + f.normalDir;
        if (f.children) {
          node.isFolder = true;
          node.children = createFilesNav(f.children);
        }
      }
      nav.push(node);
    });
    return nav;
  }

  function createDependencyTreeNav(dependencyTree) {
    var nav = [];
    dependencyTree.forEach(function(o) {
      var node = {
        title: o.name + " (" + o.module.name + ")",
        icon: iconForObject(o),
        href: urlForObject(o),
        key: o.normalDir()
      };
      var dependencyList = o.dependencyList();
      if (dependencyList && dependencyList.length) {
        node.children = createDependencyTreeNav(dependencyList);
      }
      nav.push(node);
    });
    return nav;
  }

  function createConfigByTypeNav(configByType) {
    return configByType.map(function(type) {
      var node = {
        title: type.name,
        isFolder: true,
        key: '_type_' + type.name,
      };

      node.children = type.children.map(function(o) {
        return {
          title: o.name + " (" + o.module.name + ")",
          icon: iconForObject(o),
          href: urlForObject(o),
          key: o.normalDir()
        };
      });

      return node;
    });
  }

  function wrapNavInRoot(nav, key) {
    return [{
      title: options.projectName,
      isFolder: true,
      key: key,
      expand: true,
      children: nav
    }];
  }

  var te = new TaskEmittter();
  te
    .task(project, 'filesTree')
    .on('filesTree', function(_files) {
      files = wrapNavInRoot(createFilesNav(_files), '_files-list');
    })
    .task(project, 'dependencyTree')
    .on('dependencyTree', function(_dependencyTree) {
      dependencyTree = wrapNavInRoot(createDependencyTreeNav(_dependencyTree), '_project-list');
    })
    .task(project, 'getConfigByType')
    .on('getConfigByType', function(_configByType) {
      configByType = wrapNavInRoot(createConfigByTypeNav(_configByType), '_object-list');
    })
    .on('error', function(err) {
      callback(err);
    })
    .on('done', function() {
      callback(null, {
        dependencyTree: dependencyTree,
        configByType: configByType,
        files: files
      });
    });
};