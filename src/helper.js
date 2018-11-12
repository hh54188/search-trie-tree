export function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}

export function isArray(a) {
  return Object.prototype.toString.call(a) === "[object Array]";
}

export function isEmptyObject(o) {
  return !Object.keys(o).length;
}

export function distinct(target) {
  const tempArr = [];
  target.forEach(item => {
    if (!tempArr.includes(item)) {
      tempArr.push(item);
    }
  });
  return tempArr;
}

export function findObjectValueByPath(target, paths) {
  let value = target;
  paths.forEach(path => {
    value = value[path];
  });
  return value;
}

export function getObjectIdValue(identify, target) {
  let id = "";
  if (isArray(identify)) {
    id = findObjectValueByPath(target, identify);
  } else {
    id = target[identify];
  }
  return id;
}

export function normalize(identify, data) {
  const id2Value = {};
  data.forEach(item => {
    const idValue = getObjectIdValue(identify, item);
    id2Value[idValue] = item;
  });
  return id2Value;
}
