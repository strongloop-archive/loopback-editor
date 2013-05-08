var wizard;

var wizardModel = {
  serialize: function() {
    var copy = $.extend({}, wizardModel);
    delete copy.dataSources;
    delete copy.schemas;
    delete copy.mappingInfo;
    delete copy.serialize;

    return copy;
  }
};

var wizardView = {
  invalidateCard: function(card) {
    wizard.cards[card].unmarkVisited();
    wizard.cards[card].reload();
  },

  datasourceHeaders: function() {
    if (wizardModel.newDataSource) {
      // TODO: encrypt this so we're not sending connection information in plaintext
      return {
        'X-New-Data-Source': JSON.stringify(wizardModel.newDataSource)
      }
    }
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

      var dataSource = $(this).val();

      if (dataSource === "!!create-oracle") {
        wizard.cards['data-source-create-oracle'].enable();
      } else {
        wizard.cards['data-source-create-oracle'].disable();
      }

      wizardView.invalidateCard('schema-select');
    });
  },

  initDataSourceCreateOracle: function() {
    var card = wizard.cards['data-source-create-oracle'];
    card.on('validate', function() {
      var $el = card.el;
      var config = {
        name: $el.find('input[name=name]').val(),
        module: 'oracle-data-source',
        config: {
          host: $el.find('input[name=host]').val(),
          port: $el.find('input[name=port]').val(),
          username: $el.find('input[name=username]').val(),
          password: $el.find('input[name=password]').val()
        }
      };
      wizardModel.newDataSource = config;
      wizardModel.dataSource = config.name;
    });
  },

  initSchemaSelect: function() {
    var card = wizard.cards['schema-select'];
    var $schemaBox = card.el.find('.schema-box');

    card.on('reload', function() {
      $.ajax(ROOTURL + '/schemas/' + wizardModel.dataSource, {
        headers: wizardView.datasourceHeaders(),
        success: function(data) {
          wizardModel.schemas = data;
          wizardModel.schema = undefined;
          wizardView.renderSchemas();
        },
        error: function() {
          if (confirm("Something went wrong while loading schemas. Try again?")) {
            wizard.cards['schema-select'].reload();
          } else {
            location.href = "/project/" + PROJECT;
          }
        }
      })
    });
    

    $schemaBox.on('click', 'a', function() {
      var $this = $(this);
      $schemaBox.find('li').removeClass('active');
      $this.parent().addClass('active');
      wizardModel.schema = $this.data('value');
      wizardView.invalidateCard('mapping-define');
      return false;
    });

    card.on('unmarkVisited', function() {
      wizardView.invalidateCard('mapping-define');
    });
  },

  initMappingDefine: function() {
    var card = wizard.cards['mapping-define'];
    card.on('reload', function() {

      $.ajax(ROOTURL + '/mapping-info/' + wizardModel.dataSource + '/' + wizardModel.schema, {
        headers: wizardView.datasourceHeaders(),
        success: function(data) {
          wizardModel.mappingInfo = data;

          wizardView.renderMappingInfo();
        },
        error: function() {
          if (confirm("Something went wrong while loading mapping information. Try again?")) {
            wizard.cards['mapping-info'].reload();
          } else {
            location.href = "/project/" + PROJECT;
          }
        }
      })
    }).on('validate', function() {
      var modelName = card.el.find('input[name=modelName]').val();
      wizardModel.modelName = modelName;

      var mapping = {};

      card.el.find('.mapping-table tbody tr').each(function() {
        var $row = $(this);
        var $input = $row.find('input[type=text]');
        var $checkbox = $row.find('input[type=checkbox]');

        if ($checkbox.is(':checked')) {
          mapping[$input.attr('name')] = $input.val();
        }
      });
      wizardModel.mapping = mapping;
    });

    card.el.find('.mapping-table').on('change', '.include-cell input', function() {
      var checked = $(this).is(':checked');
      var $row = $(this).parent().parent();
      var prop = $row.data("original-name");
      if (checked) {
        $row.removeClass('disabled');
      } else {
        $row.addClass('disabled');
      }
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
    $dropdown.append('<optgroup label="Create new....">' +
      '<option value="!!create-oracle">Oracle DataSource</option>' +
      '</optgroup>')
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

  renderMappingInfo: function() {
    var $card = wizard.cards['mapping-define'].el,
        mappingInfo = wizardModel.mappingInfo;

    $card.find('input[name=modelName]').val(mappingInfo.defaultModelName);

    var $tbody = $card.find('.mapping-table tbody').empty();

    mappingInfo.columns.forEach(function(c) {
      $tbody.append(
        '<tr>' +
          '<td class="include-cell"><input type="checkbox" name="include" checked="checked" /></td>' +
          '<td class="original-name">' + c.originalName + '</td>' +
          '<td class="arrow-cell"><i class="icon-arrow-right"></i></td>' +
          '<td><input type="text" class="input-medium" name="' + c.originalName + '" value="' + c.defaultName + '" /></td>' +
        '</tr>'
        );
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
  },

  validateRequired: function(el) { 
    if (el.val()) {
      return {status: true};
    } else {
      return {status: false, msg: "Required"};
    }
  }
};


$(document).ready(function () {
  
  wizard = $('#data-wizard').wizard({
    closeable: false
  });

  wizard.serialize = wizardModel.serialize;

  
  wizardView.initDataSourceSelect();
  wizardView.initDataSourceCreateOracle();
  wizardView.initSchemaSelect();
  wizardView.initMappingDefine();

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