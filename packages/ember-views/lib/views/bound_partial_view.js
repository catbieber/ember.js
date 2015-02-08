/**
@module ember
@submodule ember-views
*/

import _MetamorphView from "ember-views/views/metamorph_view";
import NormalizedRerenderIfNeededSupport from "ember-views/mixins/normalized_rerender_if_needed";
import lookupPartial from "ember-views/system/lookup_partial";
import run from 'ember-metal/run_loop';
import renderView from "ember-htmlbars/system/render-view";
import emptyTemplate from "ember-htmlbars/templates/empty";

export default _MetamorphView.extend(NormalizedRerenderIfNeededSupport, {
  init: function() {
    this._super.apply(this, arguments);

    var self = this;

    this.templateNameStream.subscribe(this._wrapAsScheduled(function() {
      run.scheduleOnce('render', self, 'rerenderIfNeeded');
    }));
  },

  normalizedValue: function() {
    return this.templateNameStream.value();
  },

  render: function(buffer) {
    var templateName = this.normalizedValue();
    this._lastNormalizedValue = templateName;

    var template;
    if (templateName) {
      template = lookupPartial(this, templateName);
    }

    renderView(this, buffer, template || emptyTemplate);
  }
});
