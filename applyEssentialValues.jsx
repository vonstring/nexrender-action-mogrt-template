(function () {
    function emptyDuplicate(comp, name) {
        name = name || 'empty ' + comp.name;
        return app.project.items.addComp(
            name,
            comp.width,
            comp.height,
            comp.pixelAspect,
            comp.duration,
            comp.frameRate
        );
    }

    function compByName(name) {
        for (var i = 1; i <= app.project.items.length; i++) {
            var item = app.project.items[i];
            if (item instanceof CompItem && item.name === name) {
                return item;
            }
        }
    }

    function getAllProperties(prop, props) {
        for (var i = 1; i <= prop.numProperties; i++) {
            var currentProp = prop.property(i);
            if (currentProp.numProperties > 0) {
                getAllProperties(currentProp, props);
            } else {
                props.push(currentProp);
            }
        }
        return props;
    }

    var compName =
        (typeof _essential !== 'undefined' && _essential.get('composition')) ||
        'Comp 1';
    var essentialParameters =
        (typeof _essential !== 'undefined' &&
            _essential.get('essentialParameters')) ||
        {};

    var templateComp = compByName(compName);
    var comp = emptyDuplicate(templateComp, '__mogrt__');
    var layer = comp.layers.add(templateComp);
    var layer = comp.layers.add(templateComp);
    var essentialProperty = layer.essentialProperty;
    var essentialProperties = getAllProperties(essentialProperty, [
        essentialProperty,
    ]);

    for (var p = 0; p < essentialProperties.length; p++) {
        var prop = essentialProperties[p];
        var value = essentialParameters[prop.name];
        if (typeof value !== 'undefined') {
            if (prop.canSetAlternateSource) {
                var replacementItem = app.project.importFile(
                    new ImportOptions(new File(value))
                );
                prop.setAlternateSource(replacementItem);
            } else {
                prop.setValue(value);
            }
        }
    }
})();

