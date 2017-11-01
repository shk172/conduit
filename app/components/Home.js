// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';

const storage = require('electron-json-storage');
const apiKey = "K2KAC8WYMD2CQHI5"
export default class Home extends Component {
  constructor(props){
    super(props);
    this.state={
      newTicker: "",
      json: {},
      tickers: [],
      tableSize: 5,
      page: 0,
      currentPage: [],
    }
    this.addTicker = this.addTicker.bind(this);
    this.clearTickers = this.clearTickers.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount(){
  	var app = this;
    storage.getAll(function(error, data){
    	if(error) throw error;
    	let importedTickers = [];
    	Object.keys(data).forEach((key)=>{
    		importedTickers.push(data[key]);
    	})
    	let page = []
    	if(importedTickers.length >= 5){
    		page = importedTickers.slice(0, 5);
    	}
    	else{
    		page = importedTickers;
    	}
    	app.setState({
    		tickers: importedTickers,
    		currentPage: page,
    	});
    });
  }

  addTicker(e){
    e.preventDefault();
    let avapi = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&interval=1min&apikey=K2KAC8WYMD2CQHI5&symbol=";
    let api = "http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?symbol=";
    var url = api + this.state.newTicker;
    let avurl = avapi + this.state.newTicker;
    fetch(url).then(response => {
      if(response.ok){
        return response.json();
      }
      throw new Error("Error fetching stock data");
    }).then(json => {
      if(json.Message === undefined){
      	json.Price = {};
		    fetch(avurl).then(response=>{
		    	if(response.ok){
		    		return response.json();
		    	}
		    	throw new Error("Error fetching stock price");
		    }).then(prices=>{
			    let lastTime = prices['Meta Data']['3. Last Refreshed'];
			    json.Price = prices['Time Series (1min)'][lastTime];
		    })      
        let tickers = this.state.tickers;
        tickers.push(json);
        storage.set(json.Symbol, json, function(error){
        	if(error) throw error;
        });
        this.setState({
          tickers: tickers,
          currentPage: tickers.slice(this.state.page * 5, (this.state.page*5) + 5),
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
  		currentPage: [],
  	})
  }

  handleChange(e){
    this.setState({newTicker: e.target.value});
  }

  nextPage(){
  	let page = this.state.page;
  	if(this.state.tickers.length <= 5){
  		alert("No more page after this");
  		return;
  	}
  	if(this.state.tickers.length - (page * 5) < 0){
  		alert("No more page after this");
  		return;
  	}
  	else{
  		page++;
  		this.setState({
  			currentPage: this.state.tickers.slice((page * 5), (page + 1)*5),
  			page: page,
  		})
  	}
  }
  prevPage(){
  	let page = this.state.page;
  	if(page - 1 < 0){
  		alert("No more page before this");
  	}
  	else{
  		this.setState({
  			currentPage: this.state.tickers.slice((page - 1) * 5, page*5),
  			page: page - 1,
  		})
  	}
  }
  render() {
    var tickers = this.state.currentPage.map((ticker)=>{
      return(
        <tr key={ticker.Symbol}>
          <td width="25%">{ticker.Symbol}</td>
          <td width="50%">{ticker.Name}</td>
          <td width="25%">{ticker.Price['4. close']}</td>
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
          	<i className="fa fa-arrow-left fa-2x" 
          		onClick={this.prevPage.bind(this)} />
          	<i className="fa fa-arrow-right fa-2x"
          		onClick={this.nextPage.bind(this)} />
          </div>
        </div>
      </div>
    );
  }
}
