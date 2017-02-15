import React, { Component } from 'react';
import {sortBy} from 'lodash';
import {store, actions} from './Store.js';
import './App.css';

const DEFAULT_PAGE = 0;

const SORTS = {
    NONE: list => list,
    TITLE: list => sortBy(list, 'title'),
    AUTHOR: list => sortBy(list, 'author'),
    COMMENTS: list => sortBy(list, 'num_comments').reverse(),
    POINTS: list => sortBy(list, 'points').reverse(),
}

class App extends Component {
    componentDidMount() {
        store.subscribe(() => this.forceUpdate());
        const {searchTerm} = store.getState();
        store.dispatch(actions.updateSearchKey(searchTerm));
        this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    }

    render() {
        const {results, searchKey, searchTerm, isLoading, sortKey, isSortReverse} = store.getState();
        const page = (
            results && 
            results[searchKey] &&
            results[searchKey].page
        ) || 0;
        const list = (
            results &&
            results[searchKey] &&
            results[searchKey].hits
        ) || [];

        return (
            <div className='page'>
                <div className='interactions'>
                    <Search 
                        value={searchTerm}
                        onChange={this.onSearchChange}
                        onSubmit={this.onSearchSubmit}
                    >
                        Search
                    </Search>
                </div>
                <Table 
                    list={list}
                    sortKey={sortKey}
                    isSortReverse={isSortReverse}
                    onSort={this.onSort}
                    onDismiss={this.onDismiss}
                />
                <div style={{textAlign: 'center'}}>
                    <ButtonWithLoading
                        isLoading={isLoading}
                        onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}
                    >
                        More
                    </ButtonWithLoading>
                </div>
            </div>
        );
    }

    onDismiss = (id) => {
        store.dispatch(actions.setOnDismiss(id));
    };

    onSearchChange = ev => {
        store.dispatch(actions.updateSearchTerm(ev.target.value));
    };

    fetchSearchTopstories = (searchTerm, page) => {
        store.dispatch(actions.fetchEntries(searchTerm, page));
    };

    onSearchSubmit = (ev) => {
        const {searchTerm} = store.getState();
        store.dispatch(actions.updateSearchKey(searchTerm));
        ev.preventDefault();
        if (this.needsToSearchTopstories(searchTerm)) {
            this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
        }
    };

    needsToSearchTopstories = (searchTerm) => {
        return !store.getState().results[searchTerm];
    };

    onSort = (sortKey) => {
        const isSortReverse = store.getState().sortKey === sortKey && !store.getState().isSortReverse;
        store.dispatch(actions.updateSortKey(sortKey));
        store.dispatch(actions.updateIsSortReverse(isSortReverse));
    };
}

const Search = ({value, onChange, onSubmit, children}) => (
    <form onSubmit={onSubmit}>
        <input 
            type='text'
            value={value}
            onChange={onChange}
        />
        <button type='submit'>
            {children}
        </button>
    </form>
);

const Table = ({list, sortKey, isSortReverse, onSort, onDismiss}) => {
    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse
        ? sortedList.reverse()
        : sortedList;
    return (
        <div className='table'>
            <div className="table-header">
                <span style={{ width: '40%' }}>
                    <Sort
                        sortKey={'TITLE'}
                        onSort={onSort}
                        activeSortKey={sortKey}
                    >
                        Title
                    </Sort>
                </span>
                <span style={{ width: '30%' }}>
                    <Sort
                        sortKey={'AUTHOR'}
                        onSort={onSort}
                        activeSortKey={sortKey}
                    >
                        Author
                    </Sort>
                </span>
                <span style={{ width: '10%' }}>
                    <Sort
                        sortKey={'COMMENTS'}
                        onSort={onSort}
                        activeSortKey={sortKey}
                    >
                        Comments
                    </Sort>
                </span>
                <span style={{ width: '10%' }}>
                    <Sort
                        sortKey={'POINTS'}
                        onSort={onSort}
                        activeSortKey={sortKey}
                    >
                        Points
                    </Sort>
                </span>
                <span style={{ width: '10%' }}>
                    Archive
                </span>
            </div>
            {reverseSortedList.map(item =>
                <div className='table-row' key={item.objectID}>
                    <span style={{width: '40%'}}>
                        <a href={item.url} rel='noopener noreferrer' target='_blank'>{item.title}</a>
                    </span>
                    <span style={{width: '30%'}}>{item.author}</span>
                    <span style={{width: '10%'}}>{item.num_comments}</span>
                    <span style={{width: '10%'}}>{item.points}</span>
                    <span style={{width: '10%'}}>
                        <Button
                            onClick={() => onDismiss(item.objectID)}
                        >
                            Dismiss
                        </Button>
                    </span>
                </div>
            )}
        </div>
    );
};

const Button = ({onClick, className = '', children}) => (
    <button
        onClick={onClick}
        className={className}
        type='button'
    >
        {children}
    </button>
);

const Loading = () => {
    return (<div>Loading...</div>);
};

const withLoading = (Component) => ({isLoading, ...rest}) =>
    isLoading ? <Loading /> : <Component {...rest} /> 

const ButtonWithLoading = withLoading(Button);

const Sort = ({sortKey, onSort, children, activeSortKey}) => {
    const sortClass = ['button-inline'];
    if (sortKey === activeSortKey) {
        sortClass.push('button-active');
    }

    return (
        <Button className={sortClass.join(' ')} onClick={() => onSort(sortKey)}>
            {children}
        </Button>
    );
};

export default App;

export {Button, Search, Table};