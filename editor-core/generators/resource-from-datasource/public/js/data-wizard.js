var wizard;

var wizardModel = {
  serialize: function() {
    var copy = $.extend({}, wizardModel);
    delete copy.dataSources;
    delete copy.serialize;

    return copy;
  }
};

var wizardView = {
  renderDataSources: function() {
    var card = wizard.cards['data-source-select'];

    var $dropdown = card.el.find('.data-source-dropdown');
    $dropdown.empty();
    $dropdown.append('<option value="">Select one...</option>');
    wizardModel.dataSources.forEach(function(d) {
      $dropdown.append('<option value="' + d.dir + '">' + d.name + ' (' + d.module.name + ')</option>');
    });
  },

  validateDataSource: function(el) {
    var val = el.val();
    if (val && val !== "Select one...") {
      return {status: true};
    } else {
      return {status: false, msg: "Must select a data source."}
    }
  }
};


$(document).ready(function () {
  
  wizard = $('#data-wizard').wizard({
    closeable: false
  });

  wizard.serialize = wizardModel.serialize;

  wizard.cards['data-source-select'].on('reload', function() {
    var card = this;

    $.ajax(ROOTURL + '/data-sources')
      .success(function(data) {
        wizardModel.dataSources = data;
        wizardView.renderDataSources();
      })
      .error(function() {
        if (confirm("Something went wrong while loading data sources. Try again?")) {
          wizard.cards['data-source-select'].reload();
        } else {
          location.href = "/project/" + PROJECT;
        }
      });
  }).on('validate', function() {
    var card = this;
    wizardModel.existingDataSource = card.el.find('.data-source-dropdown').val();
  });

  wizard.on('submit', function() {
    $.ajax(ROOTURL, {
      type: "POST",
      body: wizardModel.serialize(),
      success: function(resp) {
        wizard.submitSuccess(resp);
        wizard.hideButtons();
        wizard.updateProgressBar(0);
      }, 
      error: function() {
        console.log('error', arguments);
        wizard.submitFailure();  
        wizard.hideButtons();
      }
    })
  });

  wizard.on('submitSuccess', function(sender, resp) {
    var $card = wizard.getSubmitCard('success');
    var $actions = $card.find('ul.actions').empty();
    resp.actions.forEach(function(a) {
      $actions.append('<li>' + a.verb + ' <a href="/project/' + PROJECT + '/object/' + a.dir + '/edit">' + a.obj + ' (' + a.module + ')</a></li>');
    });
  });

  wizard.show();

});