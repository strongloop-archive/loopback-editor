$(document).ready(function() {

  var selectedUrl;

  $('#projects-modal .project-list a').click(function() {
    selectedUrl = $(this).attr('href');
    $('#projects-modal #open-project-btn').removeAttr('disabled');
    $('#projects-modal .project-list li').removeClass('active');
    $(this).parent().addClass('active');
    return false;
  }).dblclick(function() {
    location.href = $(this).attr('href');
  });

  $('#projects-modal #open-project-btn').click(function() {
    if (selectedUrl) location.href = selectedUrl;
  });

});