import React, { Component } from 'react';
import './App.css';

// import Search from './Search'
// import MyTable from './MyTable'

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';
const DEFAULT_HPP = '20';

const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}`

console.log(url)

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
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
    }

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  fetchSearchTopStories(searchTerm, page=0, hitsPerPage=DEFAULT_HPP) {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${hitsPerPage}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(error => console.log(error));
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    
    this.fetchSearchTopStories(searchTerm);
  }

  setSearchTopStories(result) {
    // get the hits and page from the result
    const { hits, page } = result;

    const { searchKey, results } = this.state;

    // check if there are already old hits. When the page is 0, it is a new search => The hits are empty
    // when you click the “More” button to fetch paginated data the page isn’t 0. It is the next page. 
    // The old hits are already stored in your state and thus can be used    
    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];

    // you don’t want to override the old hits. You can merge old and new hits from the recent API request
    const updatedHits = [...oldHits, ...hits];

    // set the merged hits and page in the local component state
    // searchKey will be used as the key to save the updated hits and page in a results map
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });

  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    
    const updatedHits = hits.filter(isNotId);
    this.setState({
      results: { 
        ...results, 
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }

  render() {
    const { searchTerm, results, searchKey } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (
      results && results[searchKey] && results[searchKey].hits
    ) || [];

    return (
      <div className="App">
            <div className="interactions">
              <Search
              value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}> 
              Search
              </Search>
            </div>
            { 
              results &&
              <MyTable list={list}
                onDismiss={this.onDismiss} />
            }
            <div className="interactions">
              <button onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>More</button>
            </div>
      </div>
    );
  }
}

export default App;
