import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import { sortBy } from 'lodash';
import classNames from 'classnames';

// import Search from './Search'
// import MyTable from './MyTable'

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';
const DEFAULT_HPP = '10';

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

const MyTable = ({ list, sortKey, isSortReverse, onSort, onDismiss }) =>
  {
    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;
    
    return(
      <div className="table">
        <div className="tableHeader">
          <span style={{ width: '40%' }}>
            <Sort
              sortKey={'TITLE'}
              activeSortKey={sortKey}
              onSort={onSort}>Title</Sort>
          </span>
          <span style={{ width: '30%' }}>
            <Sort
              sortKey={'AUTHOR'}
              activeSortKey={sortKey}
              onSort={onSort}>Author</Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort
              sortKey={'COMMENTS'}
              activeSortKey={sortKey}
              onSort={onSort}>Comments</Sort>          
          </span>
          <span style={{ width: '10%' }}>
            <Sort
              sortKey={'POINTS'}
              activeSortKey={sortKey}
              onSort={onSort}>Points</Sort>
          </span>
          <span style={{ width: '10%' }}>
            Archive
          </span>
          
        </div>
        { reverseSortedList.map(item => 
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
        )}
    
      </div>);
  }
      

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};

const Sort = ({sortKey, activeSortKey, onSort, children}) => {
  const sortClass = classNames(
      'button-inline', 
      { 'button-active': sortKey === activeSortKey }
  );

  return (
    <button className={sortClass}
    onClick={() => onSort(sortKey)}>{children}</button>
  );  
}

class App extends Component {
  _isMounted = false;

  constructor(props) {
    super(props)

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      sortKey: 'NONE',
      isSortReverse: false,
    }

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({sortKey, isSortReverse});
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  fetchSearchTopStories(searchTerm, page=0, hitsPerPage=DEFAULT_HPP) {
    axios.get(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${hitsPerPage}`)
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({ error }));
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  componentDidMount() {
    this._isMounted = true;

    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
    this._isMounted = false;
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
    const { searchTerm, results, searchKey, error, sortKey, isSortReverse } = this.state;
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
              error ? 
              <div className="interactions">
                <p>Something went wrong.</p>
              </div> :
              results &&
              <MyTable list={list}
                sortKey={sortKey}
                isSortReverse={isSortReverse}
                onSort={this.onSort}
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
