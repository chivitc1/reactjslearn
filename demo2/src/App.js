import React, { Component } from 'react';
import './App.css';

// import Search from './Search'
// import MyTable from './MyTable'

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';

const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}`

console.log(url)

// const userList = ['Robin', 'Andrew', 'Dan']; const additionalUser = 'Jordan';
// const allUsers = [ ...userList, additionalUser ];
// const oldUsers = ['Robin', 'Andrew'];
// const newUsers = ['Dan', 'Jordan'];
// const allUsers = [ ...oldUsers, ...newUsers ];
// console.log(allUsers);
// const userNames = { firstname: 'Robin', lastname: 'Wieruch' }; const age = 28;
// const user = { ...userNames, age };
// console.log(user);
// const userNames = { firstname: 'Robin', lastname: 'Wieruch' }; const userAge = { age: 28 };
// const user = { ...userNames, ...userAge };
// console.log(user);

const Search = ({
  value,
  onChange,
  onSubmit,
  children
}) =>
  <form onSubmit={onSubmit}>
    <input
      type="text"
      value={value}
      onChange={onChange}
    />
    <button type="submit">
      {children}
    </button>
</form>

const MyTable = ({ list, onDismiss }) =>
  <div className="table">
    {
      list.map(item => 
                <div key={item.objectID}>
                    <li>
                    <a href={item.url}>{item.title}</a>
                    </li>
                    <li>{item.author}</li>
                    <li>{item.num_comments}</li>
                    <li>{item.points}</li>

                    <span>
                        <button type="button" 
                            onClick={() => onDismiss(item.objectID)}>
                            Dismiss
                        </button>
                    </span>
                </div>
                )
    }
</div>

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY,
    }

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
  }

  fetchSearchTopStories(searchTerm) {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(error => console.log(error));
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state
    this.fetchSearchTopStories(searchTerm);
    event.preventDefault();
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    
    this.fetchSearchTopStories(searchTerm);
  }

  setSearchTopStories(result) {
    this.setState({result});
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onDismiss(id) {
    console.log("Removing item id = " + id)
    const updatedHits = this.state.result.hits.filter(item => item.objectID !== id);
    this.setState({
      result: { ...this.state.result, hits: updatedHits }
    })
  }

  render() {
    const { searchTerm, result } = this.state;

    return (
      <div className="App">
            <div className="interactions">
              <Search
              value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}> 
              Search
              </Search>
            </div>
            { 
              result &&
              <MyTable list={result.hits}
                pattern={searchTerm}
                onDismiss={this.onDismiss} />
            }
      </div>
    );
  }
}

export default App;
