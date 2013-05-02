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
  invalidateCard: function(card) {
    wizard.cards[card].unmarkVisited();
    wizard.cards[card].reload();
  },

  initDataSourceSelect: function() {
    var card = wizard.cards['data-source-select'];
    card.on('reload', function() {

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

    card.el.find('.data-source-dropdown').change(function() {
      wizardView.invalidateCard('schema-select');
    });
  },

  initSchemaSelect: function() {
    var card = wizard.cards['schema-select'];
    var $schemaBox = card.el.find('.schema-box');

    $.ajax(ROOTURL + '/schemas/' + wizardModel.dataSource)
      .success(function(data) {
        wizardModel.schemas = data;
        wizardView.renderSchemas();
      })
      .error(function() {
        if (confirm("Something went wrong while loading schemas. Try again?")) {
          wizard.cards['schema-select'].reload();
        } else {
          location.href = "/project/" + PROJECT;
        }
      });

    $schemaBox.on('click', 'a', function() {
      var $this = $(this);
      $schemaBox.find('li').removeClass('active');
      $this.parent().addClass('active');
      wizardModel.schema = $this.data('value');
      return false;
    });
  },

  renderDataSources: function() {
    var card = wizard.cards['data-source-select'];

    var $dropdown = card.el.find('.data-source-dropdown');
    $dropdown.empty();
    $dropdown.append('<option value="">Select one...</option>');
    wizardModel.dataSources.forEach(function(d) {
      $dropdown.append('<option value="' + d.dir + '">' + d.name + ' (' + d.module.name + ')</option>');
    });
  },

  renderSchemas: function() {
    var card = wizard.cards['schema-select'];
    var $schemaBox = card.el.find('.schema-box');

    $schemaBox.empty();
    Object.keys(wizardModel.schemas).forEach(function(schemaType) {
      $schemaBox.append('<li class="nav-header">' + schemaType + '</li>');
      wizardModel.schemas[schemaType].forEach(function(s) {
        $schemaBox.append('<li><a href="#" data-value="' + s.name + '">' + s.name + '</a></li>');
      });
    });
  },

  validateDataSource: function(el) {
    var val = el.val();
    if (val && val !== "Select one...") {
      return {status: true};
    } else {
      return {status: false, msg: "You must select a data source."};
    }
  },

  validateSchema: function() {
    if (wizardModel.schema) {
      return {status: true};
    } else {
      return {status: false, msg: "You must select a schema."};
    }
  }
};


$(document).ready(function () {
  
  wizard = $('#data-wizard').wizard({
    closeable: false
  });

  wizard.serialize = wizardModel.serialize;

  
  wizardView.initDataSourceSelect();
  wizardView.initSchemaSelect();

  wizard.on('submit', function() {
    $.ajax(ROOTURL, {
      type: "POST",
      contentType: 'application/json',
      data: JSON.stringify(wizardModel.serialize()),
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