import React, { Component } from 'react';

class MyTable extends Component {

    render() {
        const {list, pattern, onDismiss} = this.props;
        return (
          <div className="Table">
            {list.map(item => 
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
          </div>
        );
    }
}
export default MyTable;
