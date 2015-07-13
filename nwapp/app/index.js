$(function(){
    function chooseFile(value) {
        var chooser = $('#fileSelector');
        chooser.change(function(evt) {
            console.log($(this).val());
            value($(this).val())
        });

        chooser.trigger('click');
    }

    var win = global.window.nwDispatcher.requireNwGui().Window.get(),
        fs = require('fs');

    Mousetrap.bind(['shift+f12', 'f12', 'command+0'], function (e) {
	    win.showDevTools();
    });
 
    function StyleName(lang, name) {
        var self = this;
        self.lang = ko.observable(lang || 'ru');
        self.name = ko.observable(name || '');
    }

    function StyleEntry(name, value) {
        var self = this;

        self.name = ko.observable(name);
        self.value = ko.observable(value);
        self.type = (value.toString().indexOf('#') === 0) ? 'color' : 'other';
    }

    function StyleAuthor(name, email) {
        var self = this;

        self.name = ko.observable(name);
        self.email = ko.observable(email);
    }

    function Style() {
        var self = this;

        self.id = ko.observable();
        self.isDefault = ko.observable(false);
        self.version = ko.observable(2);

        self.authors = ko.observableArray([]);
        self.names = ko.observableArray([]);
        self.styles = ko.observableArray([]);

        self.availableVersions = ko.observableArray([1, 2]);
        
        self.toJSON = function () {
            var obj = {
                id: self.id(),
                'default': self.isDefault(),
                version: self.version(),
                authors: [],
                name: {},
                styles: {}
            };

            self.names().forEach(function(item) {
                obj.name[item.lang()] = item.name();
            });

            self.authors().forEach(function(item) {
                obj.authors.push = {
                    name: item.name(),
                    email: item.email()
                };
            });

            self.styles().forEach(function(item) {
                obj.styles[item.name()] = item.value();
            });

            return JSON.stringify(obj, null, 2);
        }
    }

    Style.fromJSON = function (content) {
        var style = new Style(),
            data;

        try {
            data = JSON.parse(content);
        }catch(e) {
            return style;
        }

        style.id(data.id);
        style.isDefault(data.default);
        style.version(data.version);

        for(var lang in data.name) {
            if (data.name.hasOwnProperty(lang)) {
                style.names.push(new StyleName(lang, data.name[lang]));
            }
        }

        data.authors.forEach(function (e) {
            style.authors().push(new StyleAuthor(e.name, e.email));
        });

        for(var styleKey in data.styles) {
            if (data.styles.hasOwnProperty(styleKey)) {
                style.styles.push(new StyleEntry(styleKey, data.styles[styleKey]));
            }
        }

        return style;
    };

    function AppViewModel() {
        var self = this,
            autoSaveTimer = null;

        self.state = ko.observable('select');
        self.autoSave = ko.observable(false);
        self.autoSave.subscribe(function(){
            if (self.autoSave()) {
                autoSaveTimer = setInterval(self.save, 250);
            } else {
                clearInterval(autoSaveTimer)
            }
        });

        self.currentFile = ko.observable();
        self.currentFile.subscribe(function() {
            var buffer = fs.readFileSync(self.currentFile()),
                content = buffer.toString().trim();

            self.currentStyle(Style.fromJSON(content));
            self.edit();
        });
        self.currentStyle = ko.observable(new Style());

        self.open = function () {
            chooseFile(self.currentFile);
        };

        self.save = function () {
            var content = self.currentStyle().toJSON();
            fs.writeFileSync(self.currentFile(), content);
        };

        self.edit = function (data) {
            self.state('base');
        };

        self.editColor = function (data) {
            self.state('colors');
        };

        self.quit = function(){
            global.window.nwDispatcher.requireNwGui().App.quit();
        }
    }

    ko.applyBindings(new AppViewModel());
});