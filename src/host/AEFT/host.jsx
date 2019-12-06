/*

Current expressions are hilariously complex. New template should be:

let parent = thisComp.layer('line')
let path = parent.content('line').content("Path 1").path;
parent.toComp(path.points()[1])

*/
var currentTime = null;
var thisComp = setComp();
function setComp() {
    app.activeViewer.setActive();
    thisComp = app.project.activeItem;
    return thisComp || thisComp instanceof CompItem;
}
// ------------- MISC ---------------------------//
function grabAllControllerLayers() {
    var list = [];
    for (var i = thisComp.layers.length; i > 0; i--)
        if (/.*\_(anchor|in|out|stick(Out|In))\[\d*\]/gim.test(thisComp.layers[i].name))
            list.push(thisComp.layers[i]);
    return list;
}
function scrubAll() {
    thisComp = setComp();
    var layers = grabAllControllerLayers();
    layers.forEach(function (layer) {
        layer.locked = false;
        layer.remove();
    });
}
function handlePostStatus(config) {
    config = JSON.parse(config);
    var layers = grabAllControllerLayers();
    layers.forEach(function (layer) {
        layer.selected = false;
    });
    layers.forEach(function (layer) {
        layer.locked = config.locked;
    });
}
function toggleAllAttribute(attribute, state) {
    if (state === void 0) { state = false; }
    thisComp = setComp();
    var layers = grabAllControllerLayers();
    layers.forEach(function (layer) {
        var wasLocked = layer.locked;
        if (wasLocked || /select/i.test(attribute))
            layer.locked = false;
        layer[attribute] = state ? state : !layer[attribute];
        if (wasLocked && !/select/i.test(attribute))
            layer.locked = true;
    });
}
function toggleAllLock(state) {
    if (state === void 0) { state = false; }
    thisComp = setComp();
    var layers = grabAllControllerLayers();
    layers.forEach(function (layer) {
        layer.locked = state ? state : !layer.locked;
    });
}
// ------------- CREATING RECEIVERS ------------ //
// The top-level Transform values (except for Position) should be clamped on these
function createReceivers(config, list) {
    thisComp = setComp();
    list = JSON.parse(list);
    config = JSON.parse(config);
    for (var i = 0; i < list.length; i++) {
        var anchor = list[i];
        if (anchor.type == "anchor" && config.drawAnchors)
            createReceivingAnchor(config, anchor);
        else if (/tangent/i.test(anchor.type) && config.drawHandles)
            createReceivingHandle(config, anchor);
        else if (/stick/i.test(anchor.type) && config.drawSticks)
            createReceivingStick(config, anchor);
    }
    return true;
}
function deselectAll() {
    for (var i = 0; i < thisComp.layers; i++)
        thisComp.layers[i].selected = false;
}
function createReceivingStick(config, data) {
    var layer = createReceivingLayer(config, data);
    var parent = createReceivingChain(config, data, layer);
    var anchor = parent.addProperty("ADBE Vector Shape - Group");
    var anchorStroke = parent.addProperty("ADBE Vector Graphic - Stroke");
    // No need to create generic style for sticks
    anchorStroke
        .property("ADBE Vector Stroke Color")
        .setValue(config.labelOverride
        ? config.labels[layer.parent.label]
        : config.anchorColor);
    anchorStroke
        .property("ADBE Vector Stroke Width")
        .setValue(config.stickStrokeWidth);
    // Isn't this the same as a transmitter except the expression?
    // Why not just replace the expression here with a ternary:
    parent.property(1).property(2).expression = receiverPositionExpressionFactory(data, config);
    layer.transform.position.setValue([0, 0, 0]);
    // layer.transform.anchorPoint.setValue(getParentOffset(data));
    createReceivingConfig(config, data, layer);
}
function getParentOffset(data) {
    var vertex = [0, 0];
    var parent = thisComp.layers.byName(data.parentLayerName);
    return vertex.map(function (item, i) {
        return (parent.transform.position.value[i] + parent.transform.anchorPoint.value[i]);
    });
}
function createReceivingHandle(config, data) {
    var layer = createReceivingLayer(config, data);
    var parent = createReceivingChain(config, data, layer);
    var anchor = parent.addProperty("ADBE Vector Shape - Ellipse");
    anchor
        .property("ADBE Vector Ellipse Size")
        .setValue([config.handleSize, config.handleSize]);
    createReceivingStyle("handle", parent, layer, config, data);
    layer
        .property("Transform")
        .property("Position").expression = receiverPositionExpressionFactory(data, config);
    createReceivingConfig(config, data, layer);
}
function createReceivingLayer(config, data) {
    var layer = thisComp.layers.addShape();
    layer.name = data.name;
    // layer.parent = thisComp.layers.byName(data.parentLayerName);
    layer.label = thisComp.layers.byName(data.parentLayerName).label;
    return layer;
}
function createReceivingChain(config, data, layer) {
    return data.chain.length
        ? createChainedGroups(config, layer, data).property("ADBE Vectors Group")
        : layer.property("ADBE Root Vectors Group").property("ADBE Vectors Group");
}
function createReceivingStyle(type, parent, layer, config, data) {
    if (!config[type + "IsFilled"]) {
        var anchorStroke = parent.addProperty("ADBE Vector Graphic - Stroke");
        anchorStroke
            .property("ADBE Vector Stroke Color")
            .setValue(config.labelOverride
            ? config.labels[thisComp.layers.byName(data.parentLayerName).label]
            : config[type + "Color"]);
        anchorStroke
            .property("ADBE Vector Stroke Width")
            .setValue(config[type + "StrokeWidth"]);
        if (config.useCompBG) {
            var anchorFill = parent.addProperty("ADBE Vector Graphic - Fill");
            anchorFill.property("ADBE Vector Fill Color").setValue(thisComp.bgColor);
        }
    }
    else {
        var anchorFill = parent.addProperty("ADBE Vector Graphic - Fill");
        anchorFill
            .property("ADBE Vector Fill Color")
            .setValue(config.labelOverride
            ? config.labels[layer.parent.label]
            : config[type + "Color"]);
        if (config.useCompBG) {
            var anchorStroke = parent.addProperty("ADBE Vector Graphic - Stroke");
            anchorStroke
                .property("ADBE Vector Stroke Color")
                .setValue(thisComp.bgColor);
            anchorStroke
                .property("ADBE Vector Stroke Width")
                .setValue(config[type + "StrokeWidth"]);
        }
    }
}
function createReceivingAnchor(config, data) {
    var layer = createReceivingLayer(config, data);
    var parent = createReceivingChain(config, data, layer);
    var anchor = parent.addProperty("ADBE Vector Shape - Rect");
    anchor
        .property("ADBE Vector Rect Size")
        .setValue([config.anchorSize, config.anchorSize]);
    createReceivingStyle("anchor", parent, layer, config, data);
    layer
        .property("Transform")
        .property("Position").expression = receiverPositionExpressionFactory(data, config);
    createReceivingConfig(config, data, layer);
}
function createReceivingConfig(config, data, layer) {
    layer.guideLayer = config.guideLayer;
    layer.shy = config.shy;
    //
    // This alwas leaves last layer as selected
    // layer.locked = config.locked;
}
function receiverPositionExpressionFactory(data, config) {
    var datablock, datafooter;
    if (data.type == "anchor") {
        datablock = "parent.toComp(path.points()[" + data.index + "])";
    }
    else if (/tangent/i.test(data.type)) {
        datablock = "parent.toComp(add(path." + data.direction.toLowerCase() + "Tangents()[" + data.index + "], path.points()[" + data.index + "]))";
    }
    else if (/stick/i.test(data.type)) {
        datablock = "createPath([\n  parent.toComp(path.points()[" + data.index + "]), \n  parent.toComp(add(path." + data.direction.toLowerCase() + "Tangents()[" + data.index + "], path.points()[" + data.index + "]))\n]);";
    }
    var fullChain = [];
    for (var i = 0; i < data.chain.length; i++)
        fullChain.push(".content(\"" + data.chain[i] + "\")");
    var header = "const parent = thisComp.layer(\"" + data.parentLayerName + "\");\nconst path = parent" + fullChain.join("") + ".content(\"" + data.parentPathName + "\").path;";
    return "// mason v" + config.version + "\n" + header + "\n" + datablock;
}
function createChainedGroups(config, layer, data) {
    var propGroup = layer;
    var fullChain = [];
    for (var i = 0; i < data.chain.length; i++) {
        var currentChain = data.chain[i];
        if (propGroup.content.canAddProperty("ADBE Vector Group")) {
            propGroup = propGroup.content.addProperty("ADBE Vector Group");
            propGroup.name = currentChain;
            fullChain.push(currentChain);
            receiverExpressionFactory(config, data, fullChain, propGroup);
        }
    }
    return propGroup;
}
function receiverExpressionFactory(config, data, chain, propGroup) {
    var params = ["position", "rotation", "scale", "anchor point"];
    for (var i = 0; i < params.length; i++) {
        var param = params[i];
        var root = "thisComp.layer(\"" + data.parentLayerName + "\")";
        for (var e = 0; e < chain.length; e++)
            root += ".content(\"" + chain[e] + "\")";
        propGroup
            .property("Transform")
            .property("" + capitalize(param)).expression = root + ".transform." + (!/anchor/.test(param) ? param : "anchorPoint");
    }
    function capitalize(str) {
        if (/\s/.test(str)) {
            str = str.split(/\s/);
            return str[0].charAt(0).toUpperCase() +
                str[0].slice(1) + " " + (str[1].charAt(0).toUpperCase() + str[1].slice(1));
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
// ------ Scan for initial data ------------ //
function scanComp(config) {
    thisComp = setComp();
    config = JSON.parse(config);
    var results = scanLayersForValidObjects(config);
    return JSON.stringify(results);
}
function scanLayersForValidObjects(config) {
    var results = [];
    if (thisComp != null &&
        thisComp instanceof CompItem &&
        thisComp.layers.length > 0) {
        for (var i = 1; i <= thisComp.layers.length; i++)
            results.push(scanLayerForPaths(config, thisComp.layers[i]));
    }
    return results;
}
function scanLayerForPaths(config, layer) {
    var result = {
        name: layer.name,
        index: layer.index
    };
    var results = scanPropGroupPropertiesForPaths(config, [], [layer.name], layer);
    if (results)
        result["content"] = results;
    return result;
}
function scanPropGroupPropertiesForPaths(config, results, chain, propGroup) {
    var prop;
    for (var i = 1; i <= propGroup.numProperties; i++) {
        prop = propGroup.property(i);
        // CURRENTLY ONLY SUPPORTS BEZIER PATHS
        // No parametric shapes?
        if (prop.name == "Path") {
            var finalized = [];
            for (var p = 0; p < chain.length; p++)
                finalized.push(chain[p].replace("Contents", "content"));
            results.push({
                name: chain[chain.length - 1],
                anchors: prop.value.vertices,
                closed: prop.value.closed,
                inTangents: prop.value.inTangents,
                outTangents: prop.value.outTangents,
                chain: finalized
            });
        }
        if (prop.name === "Contents" ||
            prop.propertyType === PropertyType.PROPERTY ||
            prop.propertyType === PropertyType.INDEXED_GROUP ||
            prop.propertyType === PropertyType.NAMED_GROUP) {
            if (prop.propertyType === PropertyType.INDEXED_GROUP ||
                prop.propertyType === PropertyType.NAMED_GROUP) {
                results = scanPropGroupPropertiesForPaths(config, results, [].concat(chain, [prop.name]), prop);
            }
        }
    }
    return results;
}
//  ----------------------------------- //
