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
      newTickerSymbol: "",
      newTickerPrice: 0,
      newTickerNumber: 0,
      json: {},
      tickers: [],
      tableSize: 5,
      page: 0,
      currentPage: [],
      loading: true,
    }
    this.addTicker = this.addTicker.bind(this);
    this.addTickerButton = this.addTickerButton.bind(this);
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
    this.setState({
    	loading: true,
    	addingTicker: false,
    })
    let avapi = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&apikey=K2KAC8WYMD2CQHI5&symbol=";
    let api = "http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?symbol=";
    var url = api + this.state.newTickerSymbol;
    let avurl = avapi + this.state.newTickerSymbol;
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
			    json.Price = prices['Time Series (Daily)'][lastTime];
			    json.Price["bought"] = this.state.newTickerPrice;
			    json.Price["number"] = this.state.newTickerNumber;
			    json.Price["yesterdayClose"] = prices['Time Series (Daily)'][Object.keys(prices['Time Series (Daily)'])[1]]['4. close'];
			    let tickers = this.state.tickers;
	        tickers.push(json);
	        storage.set(json.Symbol, json, function(error){
	        	if(error) throw error;
	        });
	        this.setState({
	          tickers: tickers,
	          currentPage: tickers.slice(this.state.page * 5, (this.state.page*5) + 5),
	          newTickerSymbol: "",
	          newTickerPrice: 0,
	          newTickerNumber: 0,
	          loading: false
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

  addTickerButton(e){
  	e.preventDefault();
  	this.setState({
  		addingTicker: true,
  	});
  	console.log(this.state);
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

  handleChange(input, e){
  	switch(input){
  		case "symbol":
	  		this.setState({
		    	newTickerSymbol: e.target.value
		    });
  			break;
  		case "price":
	  		this.setState({
		    	newTickerPrice: e.target.value
		    });
	  		break;
	  	case "number":
	  		this.setState({
	  			newTickerNumber: e.target.value
	  		});
	  		break;
  	}
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
    	console.log(ticker);
    	let change = parseFloat(ticker.Price['4. close']).toFixed(2) - parseFloat(ticker.Price['yesterdayClose']).toFixed(2);
      change = Math.round((change + 0.00001) * 100) / 100;
      if(change > 0){
      	change = "+" + change;
      }
      return(
        <tr key={ticker.Symbol}>
          <td width="15%" height="5">{ticker.Symbol}</td>
          <td width="40%" height="5">{ticker.Name}</td>
          <td width="15%" height="5">{parseFloat(ticker.Price['4. close']).toFixed(2)}</td>
          <td width="15%" height="5">{change}</td>
          <td width="15%" height="5">
          {Math.round(((parseFloat(ticker.Price['4. close'])*ticker.Price["number"])
          	.toFixed(2) - (ticker.Price['yesterdayClose']*ticker.Price["number"]).toFixed(2) + 0.00001) * 100) / 100}
          </td>
          <td width="15%" height="5">
          {Math.round(((parseFloat(ticker.Price['4. close'])*ticker.Price["number"])
          	.toFixed(2) - (ticker.Price.bought*ticker.Price["number"]).toFixed(2) + 0.00001) * 100) / 100}
          </td>
        </tr>
      )
    })

    var addNewTicker = null
    if(this.state.addingTicker){
    	addNewTicker=(
    	<overlay>
	    	<form onSubmit={this.addTicker}>
	    		<div>
	    		Symbol:
		        <input 
		          type="text"
		          size="7" 
		          value={this.state.newTickerSymbol}
		          onChange={this.handleChange.bind(this, "symbol")}/>
	        </div>
	        <div>
		        Price Bought:
		        <input 
		          type="text"
		          size="7" 
		          value={this.state.newTickerPrice}
		          onChange={this.handleChange.bind(this, "price")}/>
	        </div>
	        <div>
		        Number of Stocks Bought:
		        <input 
		          type="text"
		          size="7" 
		          value={this.state.newTickerNumber}
		          onChange={this.handleChange.bind(this, "number")}/>
	        </div>
	        <button type="submit">Submit</button>
	      </form>
	    </overlay>
      )
    }
    	


    var loading = null;
    if(this.state.loading){
    	loading =(
    		<overlay><p>loading...</p></overlay>
    		)
    }

    return (
      <div>
        <div className={styles.container} data-tid="container">
        {loading}
        {addNewTicker}
        <table>
          <tbody>
            <tr>
              <th width="15%">Symbol</th>
              <th width="40%">Company Name</th>
              <th width="15%">Price $</th>
              <th width="15%">Change $</th>
              <th width="15%">Day's Gain $</th>
              <th width="15%">Total Gain $</th>
            </tr>
            {tickers}
          </tbody>
        </table>
        <button onClick={this.addTickerButton}>Add New Ticker</button>
        <button onClick={this.clearTickers}>Clear Tickers</button>
          <div className={styles.navButtons}>
          	<i className="fa fa-arrow-left fa-2x" 
          		onClick={this.prevPage.bind(this)} />
          	<p>{this.state.page + 1}/{(this.state.tickers.length === 0)? 1 : Math.ceil(this.state.tickers.length/5)}</p>
          	<i className="fa fa-arrow-right fa-2x"
          		onClick={this.nextPage.bind(this)} />
          </div>
        </div>
      </div>
    );
  }
}
