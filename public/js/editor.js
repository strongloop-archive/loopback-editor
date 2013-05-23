$(document).ready(function() {

  // Try to keep the navigation view consistent
  var preferredView = (window.localStorage && window.localStorage.getItem("editorSidebarView"))
                        || "#sidebar-objects-view";

  if (preferredView) {
    $('#editor-sidebar a[href="' + preferredView + '"]').click();
  }
  
  if (window.localStorage) {
    $('#editor-sidebar .nav-tabs li > a').click(function() {
      window.localStorage.setItem("editorSidebarView", $(this).attr('href'));
    });
  }

  // Set up treeviews
  $('#editor-sidebar .sidebar-list').each(function() {

    var dynatreeOptions = {
      fx: { height: "toggle", duration: 200 },
      debugLevel: 0,
      imagePath: '/_icon/',

      onQueryExpand: function(flag, node) {
        // prevent collapsing of root node
        if (!flag && !node.getParent() || !node.getParent().getParent()) {
          return false;
        }
      },

      onDblClick: function(node, event) {
        if (node.data.href) {
          location.href = node.data.href;
        }
      }
    };
    var listId = $(this).attr("id");

    if (listId === 'sidebar-files-list') {
      dynatreeOptions.children = EDITOR_SIDEBAR_NAVIGATION.files;
    } else if (listId === 'sidebar-project-list') {
      dynatreeOptions.children = EDITOR_SIDEBAR_NAVIGATION.dependencyTree;
    } else if (listId === 'sidebar-objects-list') {
      dynatreeOptions.children = EDITOR_SIDEBAR_NAVIGATION.configByType;
    }
      

    $(this).dynatree(dynatreeOptions);

    var tree = $(this).dynatree("getTree");

    if (CURRENT_OBJECT_DIR) {
      tree.visit(function(n) {
        if (n.data.key === CURRENT_OBJECT_DIR) {
          n.select();
          n.makeVisible(); // Expand nodes so that the current object is visible
        }
      });
    }

    if (window.localStorage) {
      var storageKey = 'expandedNodes:' + listId;

      try {
        var expandedNodes = window.localStorage.getItem(storageKey);
        expandedNodes = JSON.parse(expandedNodes);
        expandedNodes.forEach(function(nK) {
          var node = tree.getNodeByKey(nK);
          if (node) {
            node.expand();
          }
        });
      } catch(ex) {}

      $(window).on('beforeunload', function() {
        var expandedNodes = [];
        tree.visit(function(n) {
          if (n.isExpanded()) {
            expandedNodes.push(n.data.key);
          }
        });
        window.localStorage.setItem(storageKey, JSON.stringify(expandedNodes));
      });
    }
  });

  $('#editor-sidebar').on('click', '.create-link', function(e) {
    var type = $(this).data('module-type');
    var $modal = $('<div class="modal create-config-object-modal fade" tabindex="-1" role="dialog">' +
        '<div class="modal-header">' +
          '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
          '<h3>Create ' + type + '</h3>' +
        '</div>' +
        '<div class="modal-body">' +
          '<form class="form-inline">' +
            '<div class="control-group">' +
              '<label>Name: </label>' +
              '<input type="text" name="module-instance-name" />' + 
            '</div>' +
          '</form>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-primary create-btn">Create</button>' +
        '</div>' +
      '</div>');
    $modal.modal();

    var submitting = false;

    function submit(e) {
      e.preventDefault();
      if (submitting) return;
      var name = $modal.find('input[name="module-instance-name"]').val();
      if (name.match(/^[a-z_][a-z_0-9]*$/i)) {
        submitting = true;
        $modal.find('form .control-group').removeClass('error');
        $modal.find('.modal-body .alert-error').remove();
        $modal.find('.create-btn').addClass('disabled');
        $.ajax('/project/' + PROJECT + '/object/' + name, {
          type: "POST",
          data: {module: type},
          success: function() {
            $modal.modal('hide');
            location.href = '/project/' + PROJECT + '/object/' + name + '/edit';
          },
          error: function() {
            alert("Something went wrong creating this " + type + ".");
            $modal.modal('hide');
          }
        });
      } else {
        $modal.find('form .control-group').addClass('error');
        if (!$modal.has('.modal-body .alert-error').length) {
          $modal.find('.modal-body').prepend('<div class="alert alert-error">Must be a valid JSON name</div>');
        }
      }
    }

    $modal.find('form').on('submit', submit);
    $modal.find('.create-btn').on('click', submit);

    $modal.on('shown', function() {
      $modal.find('input[name="module-instance-name"]').focus();
    });

    $modal.on('hidden', function() {
      $modal.remove();
    });
    e.preventDefault();
  });

});