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
    debugLevel: 0
  });

});