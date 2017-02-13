import React, { Component } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

class App extends Component {
    constructor() {
        super();

        this.state = {
            results: null,
            searchKey: '',
            searchTerm: DEFAULT_QUERY
        };
    }

    componentDidMount() {
        const {searchTerm} = this.state;
        this.setState({searchKey: searchTerm});
        this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    }

    render() {
        const {searchTerm, results, searchKey} = this.state;
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
                    onDismiss={this.onDismiss}
                />
                <div style={{textAlign: 'center'}}>
                    <Button  onClick={() => this.fetchSearchTopstories(searchKey, page+1)}>
                        More
                    </Button>
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
            }
        });
    };

    fetchSearchTopstories = (searchTerm, page) => {
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

const Table = ({list, onDismiss}) => (
    <div className='table'>
        {list.map(item =>
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

const Button = ({onClick, className = '', children}) => (
    <button
        onClick={onClick}
        className={className}
        type='button'
    >
        {children}
    </button>
);


export default App;

export {Button, Search, Table};