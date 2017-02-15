import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

const DEFAULT_QUERY = 'mathematica';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

// const SORTS = {
//     NONE: list => list,
//     TITLE: list => sortBy(list, 'title'),
//     AUTHOR: list => sortBy(list, 'author'),
//     COMMENTS: list => sortBy(list, 'num_comments').reverse(),
//     POINTS: list => sortBy(list, 'points').reverse(),
// }

const reducer = combineReducers({
    results: resultsReducer,
    searchKey: searchKeyReducer,
    searchTerm: searchTermReducer,
    isLoading: isLoadingReducer,
    sortKey: sortKeyReducer,
    isSortReverse: isSortReverseReducer
});

const store = createStore(
    reducer, 
    applyMiddleware(thunk)
);

const actions = {
    fetchEntries,
    setSearchTopstories,
    setOnDismiss,
    updateSearchKey,
    updateSearchTerm,
    updateIsLoading,
    updateSortKey,
    updateIsSortReverse,
};

function updateSearchTerm(term) {
    return {
        type: 'UpdateSearchTerm',
        term,
    };
}

function searchTermReducer(state = DEFAULT_QUERY, action) {
    if (action.type === 'UpdateSearchTerm') {
        return action.term;
    }
    return state;
}

function updateIsLoading(value) {
    return {
        type: 'UpdateIsLoading',
        value,
    };
}

function isLoadingReducer(state = false, action) {
    if (action.type === 'UpdateIsLoading') {
        return action.value;
    }
    return state;
}

function updateSortKey(key) {
    return {
        type: 'UpdateSortKey',
        key,
    };
}

function sortKeyReducer(state = 'NONE', action) {
    if (action.type === 'UpdateSortKey') {
        return action.key;
    }
    return state;
}

function updateIsSortReverse(value) {
    return {
        type: 'UpdateIsSortReverse',
        value,
    };
}

function isSortReverseReducer(state = false, action) {
    if (action.type === 'UpdateIsSortReverse') {
        return action.value;
    }
    return state;
}

function updateSearchKey(key) {
    return {
        type: 'UpdateSearchKey',
        key,
    };
}

function searchKeyReducer(state = '', action) {
    if (action.type === 'UpdateSearchKey') {
        return action.key;
    }
    return state;
}

function resultsReducer(state = null, action) {
    switch (action.type) {
    case 'setSearchTopstories': {
        const {hits, page} = action.result;
        const {searchKey, results} = store.getState();
        const oldHits = results && results[searchKey] 
            ? results[searchKey].hits 
            : [];
        const updatedHits = [...oldHits, ...hits];
        return {
            ...results,
            [searchKey]: {hits: updatedHits, page},
        };
    }
    case 'setOnDismiss': {
        const {results, searchKey} = store.getState();
        const {hits, page} = results[searchKey];
        const updatedHits = hits.filter(item => item.objectID !== action.id);
        return {
            ...results, 
            [searchKey]: {hits: updatedHits, page},
        };
    }
    default:
        return state;
    }
}

function fetchEntries(term, page) {
    const uri = encodeURI(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${term}\
        &${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`);
    return (dispatch) => {
        dispatch(updateIsLoading(true));
        return fetch(uri)
            .then(resp => resp.json())
            .then(res => dispatch(setSearchTopstories(res)))
            .then(() => dispatch(updateIsLoading(false)));
    };
}

function setSearchTopstories(result) {
    return {
        type: 'setSearchTopstories',
        result,
    };
}

function setOnDismiss(id) {
    return {
        type: 'setOnDismiss',
        id,
    };
}

// this.state = {
//     results: null,
//     searchKey: '',
//     searchTerm: DEFAULT_QUERY,
//     isLoading: false,
//     sortKey: 'NONE',
//     isSortReverse: false
// };

export {store, actions};