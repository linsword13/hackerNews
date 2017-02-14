import React, { Component } from 'react';
import {sortBy} from 'lodash';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
    NONE: list => list,
    TITLE: list => sortBy(list, 'title'),
    AUTHOR: list => sortBy(list, 'author'),
    COMMENTS: list => sortBy(list, 'num_comments').reverse(),
    POINTS: list => sortBy(list, 'points').reverse(),
}

class App extends Component {
    constructor() {
        super();

        this.state = {
            results: null,
            searchKey: '',
            searchTerm: DEFAULT_QUERY,
            isLoading: false,
            sortKey: 'NONE',
            isSortReverse: false
        };
    }

    componentDidMount() {
        const {searchTerm} = this.state;
        this.setState({searchKey: searchTerm});
        this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    }

    render() {
        const {searchTerm, results, searchKey, isLoading, sortKey, isSortReverse} = this.state;
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
        const {searchKey, results} = this.state;
        const {hits, page} = results[searchKey];
        const updatedHits = hits.filter(item => item.objectID !== id);
        this.setState({
            results: {
                ...results, 
                [searchKey]: {hits: updatedHits, page}
            }
        });
    };

    onSearchChange = ev => {
        this.setState({searchTerm: ev.target.value});
    };

    setSearchTopstories = (result) => {
        const {hits, page} = result;
        const {searchKey, results} = this.state
        const oldHits = results && results[searchKey] 
            ? results[searchKey].hits 
            : [];
        const updatedHits = [...oldHits, ...hits];
        this.setState({
            results: {
                ...results, 
                [searchKey]: {hits: updatedHits, page}
            },
            isLoading: false
        });
    };

    fetchSearchTopstories = (searchTerm, page) => {
        this.setState({isLoading: true});
        const uri = encodeURI(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}\
            &${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`);
        fetch(uri)
            .then(resp => resp.json())
            .then(res => this.setSearchTopstories(res));
    };

    onSearchSubmit = (ev) => {
        const {searchTerm} = this.state;
        this.setState({searchKey: searchTerm});
        ev.preventDefault();
        if (this.needsToSearchTopstories(searchTerm)) {
            this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
        }
    };

    needsToSearchTopstories = (searchTerm) => {
        return !this.state.results[searchTerm];
    };

    onSort = (sortKey) => {
        const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
        this.setState({sortKey, isSortReverse});
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