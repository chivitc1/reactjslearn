import React, { Component } from 'react';

const isSearched = searchTerm => item => item.title.toLowerCase().includes(searchTerm.toLowerCase());
class MyTable extends Component {

    render() {
        const {list, pattern, onDismiss} = this.props;
        return (
          <div className="Table">
            {list.filter(isSearched(pattern)).map(item => 
                <div key={item.objectID}>
                    <span>
                    <a href={item.url}>{item.title}</a>
                    </span>
                    <span>{item.author}</span>
                    <span>{item.num_comments}</span>
                    <span>{item.points}</span>

                    <span>
                        <button type="button" 
                            onClick={() => onDismiss(item.objectID)}>
                            Dismiss
                        </button>
                    </span>
                </div>
                )}
          </div>
        );
    }
}
export default MyTable;
