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

function isEmptyObject(o) {
  return !Object.keys(o).length;
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

function normalize(identify, data) {
  const id2Value = {};
  data.forEach(item => {
    const idValue = item[identify];
    id2Value[idValue] = item;
  });
  return id2Value;
}

function distinct(target) {
  const tempArr = [];
  target.forEach(item => {
    if (!tempArr.includes(item)) {
      tempArr.push(item);
    }
  });
  return tempArr;
}

let userMap = null;

function searchBlurry(root, keyword) {
  const keywordArr = Array.from(String(keyword));
  let tempRoot = root;
  let result = [];

  for (let i = 0; i < keywordArr.length; i++) {
    const character = keywordArr[i];
    if (!tempRoot.children[character]) {
      break;
    } else {
      tempRoot = tempRoot.children[character];
    }
    if (keywordArr.length - 1 === i) {
      // 优化方案：
      result = [...tempRoot.ids, ...tempRoot.childrenIds];
      // result = [
      //   ...tempRoot.ids,
      //   ...collectChildrenInsideIds(tempRoot.children)
      // ];
    }
  }
  return distinct(result).map(id => {
    return userMap[id];
  });
}

function decorateWithChildrenIds(root) {
  const { children } = root;
  root.childrenIds = collectChildrenInsideIds(root.children);
  for (const character in children) {
    const characterLeaf = children[character];
    characterLeaf.childrenIds = collectChildrenInsideIds(
      characterLeaf.children
    );
    decorateWithChildrenIds(characterLeaf);
  }
}

fetch("https://randomuser.me/api/?results=5000&inc=gender,email,phone,cell,nat")
  .then(response => {
    return response.json();
  })
  .then(data => {
    const { results } = data;
    const root = new Leaf();
    const identifyKey = "email";

    userMap = normalize(identifyKey, results);

    results.forEach(item => {
      const identifyValue = item[identifyKey];
      Object.values(item).forEach(itemValue => {
        // 注意这里会把 Number 和 Boolean 类型也字符串化
        const stringifiedValue = String(itemValue);
        let tempRoot = root;
        const arraiedAtringifiedValue = Array.from(stringifiedValue);
        arraiedAtringifiedValue.forEach((character, characterIndex) => {
          const reachEnd =
            characterIndex === arraiedAtringifiedValue.length - 1;
          if (!tempRoot.children[character]) {
            tempRoot.children[character] = new Leaf(
              reachEnd ? identifyValue : "",
              character
            );
            tempRoot = tempRoot.children[character];
          } else {
            if (reachEnd) {
              tempRoot.children[character].share(identifyValue);
            }
            tempRoot = tempRoot.children[character];
          }
        });
      });
    });

    // 优化方案
    decorateWithChildrenIds(root);

    console.log("---------- Data Ready: ----------");
    console.log(userMap);
    console.log(root);
    const searchKeyword = "a";
    console.log(`---------- Search keyword "${searchKeyword}" ----------`);
    const startTime1 = +new Date();
    const searchResults = searchBlurry(root, searchKeyword);
    console.log(searchResults, `cost ${+new Date() - startTime1}ms`);

    const regularSearchResults = [];
    const startTime2 = +new Date();
    results.forEach(item => {
      for (const key in item) {
        const value = item[key];
        if (String(value).startsWith(searchKeyword)) {
          regularSearchResults.push(item);
          break;
        }
      }
    });
    console.log(regularSearchResults, `cost ${+new Date() - startTime2}ms`);
  });
