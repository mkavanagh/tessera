ds.register_dashboard_item('timerstat', function() {
  'use strict';

  var createModel = function(options) {
    var model = limivorous.observable()
        .property('title')
        .property('index')
        .property('scale', {init: 1})
        .property('precision', {init: 2})
        .property('transform', {init: 'mean'})
        .extend(ds.models.item, {item_type: 'timerstat'})
        .build();

    model.requires_data = true;

    if (options) {
      model.title = options.title;
      model.index = options.index;
      model.scale = Number(options.scale) || model.scale;
      model.precision = Number(options.precision) || model.precision;
      model.transform = options.transform || model.transform;
    }

    ds.models.item.init(model, options);

    model.toJSON = function() {
      var properties = ds.models.item.json(this);
      properties.title = this.title;
      properties.index = this.index;
      properties.scale = this.scale;
      properties.precision = this.precision;
      properties.transform = this.transform;
      return properties;
    };

    return model;
  };

  var getMillis = function(query, options) {
    var data;
    if (options.index) {
      data = query.data[options.index];
    } else {
      data = query;
    }

    return data.summation[options.transform] * options.scale;
  };

  var getTimeParts = function(millis, options) {
    var humanized = humanizeDuration(millis, {round: true, delimiter: ' '});
    var tokens = humanized.split(' ')
      .slice(0, options.precision * 2);

    var timeParts = [];
    for (var i = 0; i < tokens.length; i += 2) {
      timeParts.push({value: tokens[i], unit: tokens[i + 1]});
    }
    return timeParts;
  };

  var renderData = function(query, options) {
    var millis = getMillis(query, options),
      timeParts = getTimeParts(millis, options);

    $('#' + options.item_id + ' .data')
      .empty()
      .append(ds.templates.models.timerstat_body({part: timeParts}));
  };

  return {
    display_name: 'Timer Stat',
    icon: 'fa fa-tachometer',
    category: 'data-table',

    template: ds.templates.models.timerstat,
    interactive_properties: [
      'title',
      { id: 'index', type: 'number' },
      'scale',
      { id: 'precision', type: 'number' },
      'transform'
    ].concat(ds.models.item.interactive_properties),

    constructor: createModel,
    data_handler: renderData
  };
}());
