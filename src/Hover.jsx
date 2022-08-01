import React from "react";
import reactLogo from "./assets/react.svg";
import "./Hover.scss";

class Hover extends React.Component {
  componentDidMount() {
    const authors = Array.from(document.getElementsByClassName("author"));

    authors.forEach((author) => {
      author.addEventListener("hover", function handleClick(event) {
        console.log("box hovered", event);
      });
    });
  }

  render() {
    return (
      <div className="App">
        <div>
          <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
            <img src="/vite.svg" className="logo" alt="Vite logo" />
          </a>
          <a href="https://reactjs.org" target="_blank" rel="noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <p>
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    );
  }
}

export default Hover;
