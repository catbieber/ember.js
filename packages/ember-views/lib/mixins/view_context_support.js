import { Mixin } from "ember-metal/mixin";
import { computed } from "ember-metal/computed";
import { get } from "ember-metal/property_get";
import { set } from "ember-metal/property_set";

var ViewContextSupport = Mixin.create({
  /**
    The object from which templates should access properties.

    This object will be passed to the template function each time the render
    method is called, but it is up to the individual function to decide what
    to do with it.

    By default, this will be the view's controller.

    @property context
    @type Object
  */
  context: computed(function(key, value) {
    if (arguments.length === 2) {
      set(this, '_context', value);
      return value;
    } else {
      return get(this, '_context');
    }
  }).volatile(),

  /**
    Private copy of the view's template context. This can be set directly
    by Handlebars without triggering the observer that causes the view
    to be re-rendered.

    The context of a view is looked up as follows:

    1. Supplied context (usually by Handlebars)
    2. Specified controller
    3. `parentView`'s context (for a child of a ContainerView)

    The code in Handlebars that overrides the `_context` property first
    checks to see whether the view has a specified controller. This is
    something of a hack and should be revisited.

    @property _context
    @private
  */
  _context: computed(function(key, value) {
    if (arguments.length === 2) {
      return value;
    }

    var parentView, controller;

    if (controller = get(this, 'controller')) {
      return controller;
    }

    parentView = this._parentView;
    if (parentView) {
      return get(parentView, '_context');
    }

    return null;
  }),

  _controller: null,

  /**
    The controller managing this view. If this property is set, it will be
    made available for use by the template.

    @property controller
    @type Object
  */
  controller: computed(function(key, value) {
    if (arguments.length === 2) {
      this._controller = value;
      return value;
    }

    if (this._controller) {
      return this._controller;
    }

    var parentView = this._parentView;
    return parentView ? get(parentView, 'controller') : null;
  })
});

export default ViewContextSupport;
