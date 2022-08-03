(function () {
    function emptyDuplicate(comp, name) {
        name = name || ('empty ' + comp.name);
        return app.project.items.addComp(name, comp.width, comp.height, comp.pixelAspect, comp.duration, comp.frameRate);
    }

    function compByName(name) {
        for (var i = 1; i <= app.project.items.length; i++) {
            var item = app.project.items[i];
            if (item instanceof CompItem && item.name === name) {
                return item;
            }
        }
    }

    const compName = typeof _essential !== 'undefined' && _essential.get('composition') || 'Comp 1';
    const essentialParameters = typeof _essential !== 'undefined' && _essential.get('essentialParameters') || {};
    const templateComp = compByName(compName);
    const comp = emptyDuplicate(templateComp, "__mogrt__");
    var layer = comp.layers.add(templateComp);
    for (var i = 1; i <= layer.essentialProperty.numProperties; i++) {
        var prop = layer.essentialProperty(i);
        var value = essentialParameters[prop.name];
        if (typeof value !== "undefined") {
            prop.setValue(value)
        }
    }
})();