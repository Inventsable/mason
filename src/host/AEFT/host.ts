let currentTime = null;
let thisComp = setComp();

function setComp() {
  app.activeViewer.setActive();
  thisComp = app.project.activeItem;
  return thisComp || thisComp instanceof CompItem;
}

// ------------- MISC ---------------------------//

function grabAllControllerLayers() {
  let list = [];
  for (let i = thisComp.layers.length; i > 0; i--)
    if (
      /.*\_(anchor|in|out|stick(Out|In))\[\d*\]/gim.test(
        thisComp.layers[i].name
      )
    )
      list.push(thisComp.layers[i]);
  return list;
}

function scrubAll() {
  thisComp = setComp();
  let layers = grabAllControllerLayers();
  layers.forEach(layer => {
    layer.locked = false;
    layer.remove();
  });
}

function handlePostStatus(config) {
  config = JSON.parse(config);
  let layers = grabAllControllerLayers();
  layers.forEach(layer => {
    layer.selected = false;
  });
  layers.forEach(layer => {
    layer.locked = config.locked;
  });
}

function toggleAllAttribute(attribute, state = false) {
  thisComp = setComp();
  let layers = grabAllControllerLayers();
  layers.forEach(layer => {
    let wasLocked = layer.locked;
    if (wasLocked || /select/i.test(attribute)) layer.locked = false;
    layer[attribute] = state ? state : !layer[attribute];
    if (wasLocked && !/select/i.test(attribute)) layer.locked = true;
  });
}

function toggleAllLock(state = false) {
  thisComp = setComp();
  let layers = grabAllControllerLayers();
  layers.forEach(layer => {
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
    let anchor = list[i];
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
  for (var i = 0; i < thisComp.layers; i++) thisComp.layers[i].selected = false;
}

function createReceivingStick(config, data) {
  let layer = createReceivingLayer(config, data);
  let parent = createReceivingChain(config, data, layer);
  let anchor = parent.addProperty("ADBE Vector Shape - Group");
  let anchorStroke = parent.addProperty("ADBE Vector Graphic - Stroke");
  // No need to create generic style for sticks
  anchorStroke
    .property("ADBE Vector Stroke Color")
    .setValue(
      config.labelOverride
        ? config.labels[layer.parent.label]
        : config.anchorColor
    );
  anchorStroke
    .property("ADBE Vector Stroke Width")
    .setValue(config.stickStrokeWidth);

  // Isn't this the same as a transmitter except the expression?
  // Why not just replace the expression here with a ternary:
  parent.property(1).property(2).expression = receiverPositionExpressionFactory(
    data
  );
  createReceivingConfig(config, data, layer);
}

function createReceivingHandle(config, data) {
  let layer = createReceivingLayer(config, data);
  let parent = createReceivingChain(config, data, layer);
  let anchor = parent.addProperty("ADBE Vector Shape - Ellipse");
  anchor
    .property("ADBE Vector Ellipse Size")
    .setValue([config.handleSize, config.handleSize]);
  createReceivingStyle("handle", parent, layer, config, data);
  layer
    .property("Transform")
    .property("Position").expression = receiverPositionExpressionFactory(data);
  createReceivingConfig(config, data, layer);
}

function createReceivingLayer(config, data) {
  let layer = thisComp.layers.addShape();
  layer.name = data.name;
  layer.parent = thisComp.layers.byName(data.parentLayerName);
  layer.label = layer.parent.label;
  return layer;
}

function createReceivingChain(config, data, layer) {
  return data.chain.length
    ? createChainedGroups(config, layer, data).property("ADBE Vectors Group")
    : layer.property("ADBE Root Vectors Group").property("ADBE Vectors Group");
}

function createReceivingStyle(type, parent, layer, config, data) {
  if (!config[type + "IsFilled"]) {
    let anchorStroke = parent.addProperty("ADBE Vector Graphic - Stroke");
    anchorStroke
      .property("ADBE Vector Stroke Color")
      .setValue(
        config.labelOverride
          ? config.labels[layer.parent.label]
          : config[type + "Color"]
      );
    anchorStroke
      .property("ADBE Vector Stroke Width")
      .setValue(config[type + "StrokeWidth"]);
    if (config.useCompBG) {
      let anchorFill = parent.addProperty("ADBE Vector Graphic - Fill");
      anchorFill.property("ADBE Vector Fill Color").setValue(thisComp.bgColor);
    }
  } else {
    let anchorFill = parent.addProperty("ADBE Vector Graphic - Fill");
    anchorFill
      .property("ADBE Vector Fill Color")
      .setValue(
        config.labelOverride
          ? config.labels[layer.parent.label]
          : config[type + "Color"]
      );
    if (config.useCompBG) {
      let anchorStroke = parent.addProperty("ADBE Vector Graphic - Stroke");
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
  let layer = createReceivingLayer(config, data);
  let parent = createReceivingChain(config, data, layer);
  let anchor = parent.addProperty("ADBE Vector Shape - Rect");
  anchor
    .property("ADBE Vector Rect Size")
    .setValue([config.anchorSize, config.anchorSize]);
  createReceivingStyle("anchor", parent, layer, config, data);
  layer
    .property("Transform")
    .property("Position").expression = receiverPositionExpressionFactory(data);
  createReceivingConfig(config, data, layer);
}

function createReceivingConfig(config, data, layer) {
  layer.guideLayer = config.guideLayer;
  layer.shy = config.shy;
  //
  // This alwas leaves last layer as selected
  // layer.locked = config.locked;
}

function receiverPositionExpressionFactory(data) {
  let datablock, datafooter;
  if (data.type == "anchor") {
    datablock = `let vertices = [0];

const data = {
  vertex: parentPath.points()[${data.index}]
};`;
    datafooter = `vertices.map((index, i) => {
  let offsetX = 0;
  let offsetY = 0;
  Object.keys(data).forEach((val, e) => {
    offsetX = offsetX + data[val][0];
    offsetY = offsetY + data[val][1];
  });
  return [offsetX, offsetY];
})[0];`;
  } else if (/tangent/i.test(data.type)) {
    datablock = `let vertices = [0];
    
const data = {
  vertex: parentPath.points()[${data.index}],
  tangent: parentPath.${data.direction.toLowerCase()}Tangents()[${data.index}]
};`;
    datafooter = `vertices.map((index, i) => {
  let offsetX = 0;
  let offsetY = 0;
  Object.keys(data).forEach((val, e) => {
    offsetX = offsetX + data[val][0];
    offsetY = offsetY + data[val][1];
  });
  return [offsetX, offsetY];
})[0];`;
  } else if (/stick/i.test(data.type)) {
    datablock = `let vertices = [0, 1];
    
const data = {
  vertex: parentPath.points()[${data.index}],
  tangent: parentPath.${data.direction.toLowerCase()}Tangents()[${data.index}]
};`;
    datafooter = `createPath(
  vertices.map((index, i) => {
    let offsetX = 0;
    let offsetY = 0;
    Object.keys(data).forEach((val, e) => {
      if (i < 1 || val !== "tangent") {
        offsetX = offsetX + data[val][0];
        offsetY = offsetY + data[val][1];
      }
    });
    return [offsetX, offsetY];
  }), [], [], false
);
`;
  }

  let fullChain = [];
  for (var i = 0; i < data.chain.length; i++)
    fullChain.push(`.content("${data.chain[i]}")`);

  return `const parentLayer = thisComp.layer("${data.parentLayerName}");
const parentPath = parentLayer${fullChain.join("")}.content("${
    data.parentPathName
  }").path;
${datablock}

${datafooter}`;
}

function createChainedGroups(config, layer, data) {
  let propGroup = layer;
  let fullChain = [];
  for (var i = 0; i < data.chain.length; i++) {
    let currentChain = data.chain[i];
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
  let params = ["position", "rotation", "scale", "anchor point"];
  for (var i = 0; i < params.length; i++) {
    let param = params[i];
    let root = `thisComp.layer("${data.parentLayerName}")`;
    for (var e = 0; e < chain.length; e++) root += `.content("${chain[e]}")`;
    propGroup
      .property("Transform")
      .property(`${capitalize(param)}`).expression = `${root}.transform.${
      !/anchor/.test(param) ? param : "anchorPoint"
    }`;
  }
  function capitalize(str) {
    if (/\s/.test(str)) {
      str = str.split(/\s/);
      return `${str[0].charAt(0).toUpperCase() +
        str[0].slice(1)} ${str[1].charAt(0).toUpperCase() + str[1].slice(1)}`;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// ------ Scan for initial data ------------ //

function scanComp(config) {
  thisComp = setComp();
  config = JSON.parse(config);
  let results = scanLayersForValidObjects(config);
  return JSON.stringify(results);
}

function scanLayersForValidObjects(config) {
  let results = [];
  if (
    thisComp != null &&
    thisComp instanceof CompItem &&
    thisComp.layers.length > 0
  ) {
    for (var i = 1; i <= thisComp.layers.length; i++)
      results.push(scanLayerForPaths(config, thisComp.layers[i]));
  }
  return results;
}

function scanLayerForPaths(config, layer) {
  let result = {
    name: layer.name,
    index: layer.index
  };
  let results = scanPropGroupPropertiesForPaths(
    config,
    [],
    [layer.name],
    layer
  );
  if (results) result["content"] = results;
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
    if (
      prop.name === "Contents" ||
      prop.propertyType === PropertyType.PROPERTY ||
      prop.propertyType === PropertyType.INDEXED_GROUP ||
      prop.propertyType === PropertyType.NAMED_GROUP
    ) {
      if (
        prop.propertyType === PropertyType.INDEXED_GROUP ||
        prop.propertyType === PropertyType.NAMED_GROUP
      ) {
        results = scanPropGroupPropertiesForPaths(
          config,
          results,
          [].concat(chain, [prop.name]),
          prop
        );
      }
    }
  }
  return results;
}
//  ----------------------------------- //
