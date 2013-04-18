$(document).ready(function() {
  
  // Try to keep the view consistent
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
  $('#editor-sidebar .sidebar-list').dynatree({
    fx: { height: "toggle", duration: 200 },
    autoCollapse: true,
    debugLevel: 0,

    onQueryExpand: function(flag, node) {
      // prevent collapsing of root node
      if (!flag && !node.getParent() || !node.getParent().getParent()) {
        return false;
      }
    }
  }).each(function() {
    // Expand nodes so that the current object is visible
    $(this).dynatree("getSelectedNodes").forEach(function(n) {
      n.makeVisible();
    });
  })

});