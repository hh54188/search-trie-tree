import {
  isObject,
  isArray,
  isEmptyObject,
  distinct,
  getObjectIdValue,
  normalize
} from "./helper";

function traverseArray(root, excludedKeys, target, identify, belongingId) {
  let id = belongingId ? belongingId : "";
  if (!id) {
    target.forEach(item => {
      id = getObjectIdValue(identify, item);
      traverseObject(root, id, excludedKeys, item);
    });
  }
}

function traverseObject(root, belongingId, excludedKeys, target) {
  Object.keys(target).forEach(itemKey => {
    if (excludedKeys && excludedKeys.length && excludedKeys.includes(itemKey)) {
      return;
    }
    const itemValue = target[itemKey];
    if (isObject(itemValue)) {
      traverseObject(root, belongingId, (excludedKeys = []), itemValue);
    } else if (isArray(itemValue)) {
      traverseArray(root, (excludedKeys = []), itemValue, "", belongingId);
    } else {
      // debugger;
      // 注意这里会把 Number 和 Boolean 类型也字符串化
      const stringifiedValue = String(itemValue);
      let tempRoot = root;
      const arraiedAtringifiedValue = Array.from(stringifiedValue);
      arraiedAtringifiedValue.forEach((character, characterIndex) => {
        const reachEnd = characterIndex === arraiedAtringifiedValue.length - 1;
        if (!tempRoot.children[character]) {
          tempRoot.children[character] = new Leaf(
            reachEnd ? belongingId : "",
            character
          );
          tempRoot = tempRoot.children[character];
        } else {
          if (reachEnd) {
            tempRoot.children[character].share(belongingId);
          }
          tempRoot = tempRoot.children[character];
        }
      });
    }
  });
  return root;
}

function collectChildrenInsideIds(children) {
  return Object.values(children).reduce((acc, child) => {
    const result = [
      ...acc,
      ...(child.ids || []),
      ...(isEmptyObject(child.children) && child.children
        ? []
        : collectChildrenInsideIds(child.children))
    ];
    return result;
  }, []);
}

class Leaf {
  constructor(id = "", value = "") {
    this.ids = id ? [id] : [];
    this.value = value;
    this.children = {};
  }
  share(id) {
    this.ids.push(id);
  }
}

export default class SearchTrieTree {
  constructor({ identify = "id", excludedKeys = [], data = [] }) {
    this.root = new Leaf();
    this.id2value = normalize(identify, data);
    traverseArray(this.root, excludedKeys, data, identify);
  }
  show() {
    console.log(this.root);
  }
  searchBlurry(keyword) {
    const keywordArr = Array.from(String(keyword));
    let tempRoot = this.root;
    let result = [];

    for (let i = 0; i < keywordArr.length; i++) {
      const character = keywordArr[i];
      if (!tempRoot.children[character]) {
        break;
      } else {
        tempRoot = tempRoot.children[character];
      }
      if (keywordArr.length - 1 === i) {
        result = [
          ...tempRoot.ids,
          ...collectChildrenInsideIds(tempRoot.children)
        ];
      }
    }
    return distinct(result).map(id => {
      return this.id2value[id];
    });
  }
  searchExactly(keyword) {
    const keywordArr = Array.from(String(keyword));
    let tempRoot = this.root;
    let result = [];

    for (let i = 0; i < keywordArr.length; i++) {
      const character = keywordArr[i];
      if (!tempRoot.children[character]) {
        break;
      } else {
        tempRoot = tempRoot.children[character];
      }
      if (keywordArr.length - 1 === i) {
        result = tempRoot.ids;
      }
    }

    return distinct(result).map(id => {
      return this.id2value[id];
    });
  }
}
