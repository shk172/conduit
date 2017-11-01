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
      loading: true,
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
    		loading: false,
    	});
    });
  }

  addTicker(e){
    e.preventDefault();
    this.setState({loading: true})
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
    	console.log(json);
      if(json.Message === undefined){
      	json.Price = {};
		    fetch(avurl).then(response=>{
		    	if(response.ok){
		    		return response.json();
		    	}
		    	throw new Error("Error fetching stock price");
		    }).then(prices=>{
		    	console.log(prices);
			    let lastTime = prices['Meta Data']['3. Last Refreshed'];
			    json.Price = prices['Time Series (1min)'][lastTime];
			    let tickers = this.state.tickers;
	        tickers.push(json);
	        storage.set(json.Symbol, json, function(error){
	        	if(error) throw error;
	        });
	        console.log(tickers);
	        this.setState({
	          tickers: tickers,
	          currentPage: tickers.slice(this.state.page * 5, (this.state.page*5) + 5),
	          newTicker: "",
	          loading: false,
	        });
		    })      
      }
      else{
        throw new Error(json.Message);
      }
    }).catch(error =>{
      console.log(error);
      alert(error);
      this.setState({loading: false});
    })
  }

  clearTickers(e){
  	e.preventDefault();
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
  	if(Math.ceil(this.state.tickers.length/5) <= page + 1){
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
    	let change = parseFloat(ticker.Price['4. close']).toFixed(2) - ticker.Open.toFixed(2);
      change = Math.round((change + 0.00001) * 100) / 100;
      if(change > 0){
      	change = "+" + change;
      }
      return(
        <tr key={ticker.Symbol}>
          <td width="20%" height="5">{ticker.Symbol}</td>
          <td width="40%" height="5">{ticker.Name}</td>
          <td width="20%" height="5">{parseFloat(ticker.Price['4. close']).toFixed(2)}</td>
          <td width="20%" height="5">{change}</td>
        </tr>
      )
    })
    var loading = {};
    if(this.state.loading){
    	loading =(
    		<loading><p>loading...</p></loading>
    		)
    }
    else{
    	loading = null;
    }
    return (
      <div>
        <div className={styles.container} data-tid="container">
        {loading}
        <table>
          <tbody>
            <tr>
              <th width="20%">Symbol</th>
              <th width="40%">Company Name</th>
              <th width="20%">Price</th>
              <th width="20%">Change</th>
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
            <button onClick={this.clearTickers}>Clear Tickers</button>
          </form>
          <div className={styles.navButtons}>
          	<i className="fa fa-arrow-left fa-2x" 
          		onClick={this.prevPage.bind(this)} />
          	<p>{this.state.page + 1}/{Math.ceil(this.state.tickers.length/5)}</p>
          	<i className="fa fa-arrow-right fa-2x"
          		onClick={this.nextPage.bind(this)} />
          </div>
        </div>
      </div>
    );
  }
}
