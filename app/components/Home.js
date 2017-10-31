// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';

export default class Home extends Component {
  constructor(props){
    super(props);
    this.state={
      newTicker: "",
      json: {},
      tickers: [],
    }
    this.addTicker = this.addTicker.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount(){
    
    /*
    let api = "http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?symbol=";
    var url = api + "NVDA";
    
    fetch(url).then(response => response.json())
    .then(json => {
      var tickers = this.state.tickers;
      tickers.push(json);
      this.setState({tickers: tickers});
    })
    */
  }

  addTicker(e){
    e.preventDefault();
    let api = "http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?symbol=";
    var url = api + this.state.newTicker;
    fetch(url).then(response => {
      if(response.ok){
        return response.json();
      }
      throw new Error("Error fetching stock data");
    }).then(json => {
      if(json.Message === undefined){
        console.log(json);
        var tickers = this.state.tickers;
        tickers.push(json);
        this.setState({
          tickers: tickers,
          newTicker: "",
        });
      }
      else{
        throw new Error(json.Message);
      }
    }).catch(error =>{
      console.log(error);
      alert(error)
    })
  }

  handleChange(e){
    this.setState({newTicker: e.target.value});
  }

  render() {
    var tickers = this.state.tickers.map((ticker)=>{
      return(
        <tr key={ticker.Name}>
          <td><Link to="/counter">{ticker.Symbol}</Link></td>
          <td>{ticker.Name}</td>
          <td>{ticker.LastPrice}</td>
        </tr>
      )
    })
    return (
      <div>
        <div className={styles.container} data-tid="container">
        <table>
          <tbody>
            <tr>
              <th>Symbol</th>
              <th>Company Name</th>
              <th>Last Price</th>
            </tr>
            {tickers}
          </tbody>
        </table>
          <form onSubmit={this.addTicker}>
            <input 
              type="text" 
              value={this.state.newTicker}
              onChange={this.handleChange}></input>
            <input type="submit"/>
          </form>
        </div>
      </div>
    );
  }
}
