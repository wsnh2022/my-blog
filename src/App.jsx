import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './Home';
import Post from './Post';
import NotFound from './NotFound';

const App = () => {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/post/:id" component={Post} />
                <Route component={NotFound} />
            </Switch>
        </Router>
    );
};

export default App;