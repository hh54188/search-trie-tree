import React from "react";
import ReactDOM from "react-dom";

import SearchTrieTree from "../src";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: ""
    };
  }
  componentDidMount() {
    fetch("https://randomuser.me/api/")
      // fetch("https://randomuser.me/api/?results=1000")
      .then(response => {
        return response.json();
      })
      .then(formattedResponse => {
        const { results } = formattedResponse;
        const tree = new SearchTrieTree({
          identify: ["login", "uuid"],
          data: results
        });
        tree.show();
      })
      .catch(error => {
        console.log(error);
      });
  }
  render() {
    const { keyword } = this.state;
    return (
      <div>
        <input value={keyword} id="search" />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#app"));
