// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';

const storage = require('electron-json-storage');

export default class Home extends Component {
  constructor(props){
    super(props);
    this.state={
      newTicker: "",
      json: {},
      tickers: [],
    }
    this.addTicker = this.addTicker.bind(this);
    this.clearTickers = this.clearTickers.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount(){
  	var app = this;
    storage.getAll(function(error, data){
    	if(error) throw error;
    	var importedTickers = [];
    	Object.keys(data).forEach((key)=>{
    		importedTickers.push(data[key]);
    	})
    	app.setState({tickers: importedTickers});
    });
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
        storage.set(json.Symbol, json, function(error){
        	if(error) throw error;
        });
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

  clearTickers(){
  	storage.clear(function(error){
  		if(error) throw error;
  	});
  	this.setState({
  		tickers: [],
  	})
  }

  handleChange(e){
    this.setState({newTicker: e.target.value});
  }

  render() {
    var tickers = this.state.tickers.map((ticker)=>{
      return(
        <tr key={ticker.Symbol}>
          <td width="25%">{ticker.Symbol}</td>
          <td width="50%">{ticker.Name}</td>
          <td width="25%">{ticker.LastPrice}</td>
        </tr>
      )
    })
    return (
      <div>
        <div className={styles.container} data-tid="container">
        <table>
          <tbody>
            <tr>
              <th width="25%">Symbol</th>
              <th width="50%">Company Name</th>
              <th width="25%">Price</th>
            </tr>
            {tickers}
          </tbody>
        </table>
          <form onSubmit={this.addTicker}>
            <input 
              type="text"
              size="10" 
              value={this.state.newTicker}
              onChange={this.handleChange}></input>
            <input type="submit"/>
          </form>
          <button onClick={this.clearTickers}>Clear Tickers</button>
          <div>
          	<i className="fa fa-arrow-left fa-2x" />
          	<i className="fa fa-arrow-right fa-2x" />
          </div>
        </div>
      </div>
    );
  }
}
