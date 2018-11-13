import React from "react";
import ReactDOM from "react-dom";

import SearchTrieTree from "../src";

import { isObject } from "../src/helper";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: "",
      data: null,
      root: null
    };
    this.keywordChangeHandler = this.keywordChangeHandler.bind(this);
    this.regularSearch = this.regularSearch.bind(this);
  }
  keywordChangeHandler(event) {
    const { data, root } = this.state;
    const value = event.target.value;

    this.setState(
      {
        keyword: value
      },
      () => {
        console.clear();

        const startTime1 = +new Date();
        const treeSearchResults = root.searchBlurry(value);
        console.log(+new Date() - startTime1, treeSearchResults);

        const startTime2 = +new Date();
        const regularSearchResults = this.regularSearch();
        console.log(+new Date() - startTime2, regularSearchResults);
      }
    );
  }
  regularSearch() {
    const { data, keyword } = this.state;
    const results = [];

    const checkInObject = target => {
      let successFlag = false;
      for (const key in target) {
        const value = target[key];
        if (isObject(value) && checkInObject(value)) {
          successFlag = true;
          break;
        } else {
          if (keyword && String(value).startsWith(keyword)) {
            successFlag = true;
            break;
          }
        }
      }
      return successFlag;
    };

    data.forEach(item => {
      if (checkInObject(item)) {
        results.push(item);
      }
    });
    return results;
  }
  componentDidMount() {
    const self = this;
    fetch("https://randomuser.me/api/?results=1000")
      .then(response => {
        return response.json();
      })
      .then(formattedResponse => {
        const { results } = formattedResponse;
        const tree = new SearchTrieTree({
          identify: ["login", "uuid"],
          data: results
        });
        self.setState({
          root: tree,
          data: results
        });
      })
      .catch(error => {
        console.log(error);
      });
  }
  render() {
    const { keyword, root, data } = this.state;
    return (
      <div>
        <input
          disabled={!root || !data}
          onChange={this.keywordChangeHandler}
          value={keyword}
          id="search"
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#app"));
