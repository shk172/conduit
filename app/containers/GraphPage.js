import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Graph from '../components/Graph';
import * as CounterActions from '../actions/counter';
import {withRouter} from 'react-router';

function mapStateToProps(state) {
  return {
    counter: state.counter
  };
}

function mapDispatchToProps(dispatch) {
	console.log(dispatch);
  return bindActionCreators(CounterActions, dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Graph));
