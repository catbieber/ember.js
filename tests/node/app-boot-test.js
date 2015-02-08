/*globals global,__dirname*/

var path = require('path');
var distPath = path.join(__dirname, '../../dist');

/*jshint -W079 */
global.EmberENV = {
  FEATURES: {
    'ember-application-instance-initializers': true,
    'ember-application-visit': true
  }
};

var Ember = require(path.join(distPath, 'ember.debug.cjs'));
var compile = require(path.join(distPath, 'ember-template-compiler')).compile;
Ember.testing = true;
var DOMHelper = Ember.View.DOMHelper;
var SimpleDOM = require('simple-dom');

QUnit.module("App boot");

QUnit.test("App is created without throwing an exception", function() {
  var App;

  Ember.run(function() {
    App = Ember.Application.create();

    App.Router = Ember.Router.extend({
      location: 'none'
    });

    App.advanceReadiness();
  });

  QUnit.ok(App);
});

QUnit.test("It is possible to render a view in Node", function() {
  var View = Ember.View.extend({
    renderer: new Ember.View._Renderer(new DOMHelper(new SimpleDOM.Document())),
    template: compile("<h1>Hello</h1>")
  });

  var morph = {
    contextualElement: {},
    setContent: function(element) {
      this.element = element;
    }
  };

  var view = View.create({
    _domHelper: new DOMHelper(new SimpleDOM.Document()),
    _morph: morph
  });

  var renderer = view.renderer;

  Ember.run(function() {
    renderer.renderTree(view);
  });

  var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);
  ok(serializer.serialize(morph.element).match(/<h1>Hello<\/h1>/));
});

QUnit.test("It is possible to render a view with curlies in Node", function() {
  var View = Ember.Component.extend({
    renderer: new Ember.View._Renderer(new DOMHelper(new SimpleDOM.Document())),
    layout: compile("<h1>Hello {{location}}</h1>"),
    location: "World"
  });

  var morph = {
    contextualElement: {},
    setContent: function(element) {
      this.element = element;
    }
  };

  var view = View.create({
    _domHelper: new DOMHelper(new SimpleDOM.Document()),
    _morph: morph
  });

  var renderer = view.renderer;

  Ember.run(function() {
    renderer.renderTree(view);
  });

  var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);
  ok(serializer.serialize(morph.element).match(/<h1>Hello World<\/h1>/));
});

QUnit.test("It is possible to render a view with a nested {{view}} helper in Node", function() {
  var View = Ember.Component.extend({
    renderer: new Ember.View._Renderer(new DOMHelper(new SimpleDOM.Document())),
    layout: compile("<h1>Hello {{#if hasExistence}}{{location}}{{/if}}</h1> <div>{{view bar}}</div>"),
    location: "World",
    hasExistence: true,
    bar: Ember.View.extend({
      template: compile("<p>The files are *inside* the computer?!</p>")
    })
  });

  var morph = {
    contextualElement: {},
    setContent: function(element) {
      this.element = element;
    }
  };

  var view = View.create({
    _domHelper: new DOMHelper(new SimpleDOM.Document()),
    _morph: morph
  });

  var renderer = view.renderer;

  Ember.run(function() {
    renderer.renderTree(view);
  });

  var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);
  ok(serializer.serialize(morph.element).match(/<h1>Hello World<\/h1> <div><div id="(.*)" class="ember-view"><p>The files are \*inside\* the computer\?\!<\/p><\/div><\/div>/));
});

function createApplication() {
  var App = Ember.Application.extend().create({
    autoboot: false
  });

  App.Router = Ember.Router.extend({
    location: 'none'
  });

  return App;
}

QUnit.test("It is possible to render a view with {{link-to}} in Node", function() {
  QUnit.stop();

  var run = Ember.run;
  var app;
  var URL = require('url');

  var domHelper = new DOMHelper(new SimpleDOM.Document());
  domHelper.protocolForURL = function(url) {
    var protocol = URL.parse(url).protocol;
    return (protocol == null) ? ':' : protocol;
  };

  run(function() {
    app = createApplication();

    app.Router.map(function() {
      this.route('photos');
    });

    app.instanceInitializer({
      name: 'register-application-template',
      initialize: function(app) {
        app.registry.register('renderer:-dom', {
          create: function() {
            return new Ember.View._Renderer(domHelper);
          }
        });
        app.registry.register('template:application', compile("<h1>{{#link-to 'photos'}}Go to photos{{/link-to}}</h1>"));
      }
    });
  });

  app.visit('/').then(function(instance) {
    QUnit.start();

    var morph = {
      contextualElement: {},
      setContent: function(element) {
        this.element = element;
      }
    };

    var view = instance.view;

    view._morph = morph;

    var renderer = view.renderer;

    run(function() {
      renderer.renderTree(view);
    });

    var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);
    var serialized = serializer.serialize(morph.element);
    ok(serialized.match(/href="\/photos"/), "Rendered output contains /photos: " + serialized);
  });
});

