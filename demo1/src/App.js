import React, { Component } from 'react';
import ReactDOM from 'react'
import logo from './logo.svg';
import './App.css';

import Search from './Search'
import MyTable from './MyTable'

const list = [
  {
    title: 'React',
    url: 'https://facebook.github.io/react/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      list: list,
      searchTerm: '',
    }

    this.onDismiss = this.onDismiss.bind(this)
    this.onSearchChange = this.onSearchChange.bind(this)
  }
  
  render() {
    const {searchTerm, list} = this.state;

    if (!result) { return null; }
    return (
      <div className="App">
            <Search value={searchTerm}
              onChange={this.onSearchChange}/>
            <MyTable list={list}
              pattern={searchTerm}
              onDismiss={this.onDismiss} />
      </div>
    );
  }

  onSearchChange(event) {
    console.log("Search change: " + event.target.value)
    this.setState({ searchTerm: event.target.value });
  }

  onDismiss(id) {
    console.log("Removing item id = " + id)
    const updatedList = this.state.list.filter(item => item.objectID != id);
    this.setState({list: updatedList})
  }
}

export default App;