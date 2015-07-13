ko.bindingHandlers.colorpicker = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();

        $(element).colorpicker({color: value()})
        .on('create.colorpicker', function(event){
            console.log('create picker',  value())
            $(element).colorpicker('setValue', value())
        })
        .on('changeColor.colorpicker', function(event) {
            var color = event.color.toHex(),
                unwrap = ko.unwrap(value);

            if (color.toLowerCase() !== unwrap.toLowerCase()) {
                value(color);
            }
        });
    },
    update: function(element, valueAccessor) {
    }
};

