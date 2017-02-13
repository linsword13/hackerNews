import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import App, {Table, Search, Button} from './App';

describe('App', () => {
    it('renders', () => {
        const div = document.createElement('div');
        ReactDOM.render(<App />, div);
    });

    test('snapshots', () => {
        const comp = renderer.create(
            <App />
        );
        let tree = comp.toJSON();
        expect(tree).toMatchSnapshot();
    });
});

describe('Search', () => {
    it('renders', () => {
        const div = document.createElement('div');
        ReactDOM.render(<Search>Search</Search>, div);
    });

    test('snapshots', () => {
        const comp = renderer.create(
            <Search>Search</Search>
        );
        let tree = comp.toJSON();
        expect(tree).toMatchSnapshot();
    });
});

describe('Button', () => {
    it('renders', () => {
        const div = document.createElement('div');
        ReactDOM.render(<Button>More</Button>, div);
    });

    test('snapshots', () => {
        const comp = renderer.create(
            <Button>More</Button>
        );
        let tree = comp.toJSON();
        expect(tree).toMatchSnapshot();
    });
});

describe('Table', () => {
    const props = {
        list: [
            { title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y' },
            { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z' }
        ],
    };
    it('renders', () => {
        const div = document.createElement('div');
        ReactDOM.render(<Table { ...props } />, div);
    });
    test('snapshots', () => {
        const comp = renderer.create(
            <Table { ...props } />
        );
        let tree = comp.toJSON();
        expect(tree).toMatchSnapshot();
    });
});
