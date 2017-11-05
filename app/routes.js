/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import GraphPage from './containers/GraphPage';

export default () => (
  <App>
    <Switch>
      <Route path="/graph" component={GraphPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  </App>
);
