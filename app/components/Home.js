// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';
import alphaVantage from '../alphaVantageWrapper';
const storage = require('electron-json-storage');
const apiKey = "K2KAC8WYMD2CQHI5"
const api = "http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?symbol=";

var av = new alphaVantage(apiKey);
av.test();

function Ticker(symbol, name, numStock, priceBought, latestPrice, yesterdayPrice){
	this.symbol = symbol;
	this.numStock = numStock;
	this.priceBought = priceBought;
	this.latestPrice = latestPrice;
	this.name = name;
	this.yesterdayPrice = yesterdayPrice;

	this.updateLatestPrice = function(price){
		this.latestPrice = price;
	}

	this.getNumStock = function(){
		return this.numStock;
	}

	this.getSymbol = function(){
		return this.symbol;
	}

	this.getName = function(){
		return this.name;
	}

	this.getPriceBought = function(){
		return this.priceBought;
	}

	this.getLatestPrice = function(){
		return this.latestPrice;
	}

	this.setYesterdayPrice = function(yesterdayPrice){
		this.yesterdayPrice = yesterdayPrice;
	}
	this.getYesterdayPrice = function(){
		return this.yesterdayPrice;
	}
}


function Data(){
	this.tickers = {};

	this.importTickers = function(tickers){
		this.tickers = tickers;
	}

	this.addTicker = function(ticker){
		this.tickers[ticker.symbol] = ticker;
	}

	this.updateTicker = function(symbol, ticker){
		this.tickers[symbol] = ticker;
	}

	this.removeTicker = function(symbol){
		delete this.tickers[symbol];
	}

	this.getTicker = function(symbol){
		return this.tickers[symbol];
	}
	this.getTickers = function(){
		return this.tickers;
	}
	this.getKeys = function(){
		return Object.keys(this.tickers);
	}
}



export default class Home extends Component {
  constructor(props){
    super(props);
    this.state={
      newTickerSymbol: "",
      newTickerPrice: 0,
      newTickerNumber: 0,
      tableSize: 5,
      page: 0,
      currentPage: [],
      loading: false,

      data: new Data(),
      refreshTime: 1,
    }
    this.addTicker = this.addTicker.bind(this);
    this.addTickerButton = this.addTickerButton.bind(this);
    this.clearTickers = this.clearTickers.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.refreshTimer = this.refreshTimer.bind(this);
    this.timer = this.timer.bind(this);
  }

  componentWillMount(){
  	var app = this;
    storage.get("Data", function(error, data){
    	if(error) throw error;
    	let newData = new Data();
    	newData.importTickers(data.tickers);
    	newData.getKeys().forEach(symbol=>{
    		let ticker = newData.getTicker(symbol);
				let newTicker = new Ticker(ticker.symbol, ticker.name, ticker.numStock, ticker.priceBought, ticker.latestPrice, ticker.yesterdayPrice)
				newData.updateTicker(symbol, newTicker);
			})
    	console.log(newData);
    	app.setState({
    		data: newData,
    		currentPage: newData.getKeys().slice(0,5),
    		loading: false,
    	});
    });
  }

	componentDidMount() {
	   var intervalId = setInterval(this.timer, 15000);
	   var timerId = setInterval(this.refreshTimer, 1000);
	   // store intervalId in the state so it can be accessed later:
	   this.setState({intervalId: intervalId});
	}


	componentWillUnmount() {
	   // use intervalId from the state to clear the interval
	   clearInterval(this.state.intervalId);
	}

	refreshTimer(){
		this.setState({
			refreshTime: this.state.refreshTime + 1,
		})
	}

	timer() {
		this.state.data.getKeys().forEach(symbol=>{
			av.initialize(symbol).then(()=>{
				this.state.data.getTicker(symbol).updateLatestPrice(av.getLatestPrice());
				this.state.data.getTicker(symbol).setYesterdayPrice(av.getYesterdayPrice());
		    storage.set("Data", this.state.data, function(error){
		    	if(error) throw error;
		    });
		  })
		})
		this.setState({
      refreshTime: 0,
    });
	}

  addTicker(e){
    e.preventDefault();
    this.setState({
    	loading: true,
    	addingTicker: false,
    })
    var url = api + this.state.newTickerSymbol;

    //Get Stock's Basic Info
    fetch(url).then(response => {
      if(response.ok){
        return response.json();
      }
      throw new Error("Error fetching stock data");
    }).then(json => {
      if(json.Message === undefined){
      	av.initialize(this.state.newTickerSymbol).then(()=>{
      		var ticker = new Ticker(json.Symbol, json.Name, this.state.newTickerNumber, this.state.newTickerPrice, av.getLatestPrice(), av.getYesterdayPrice());
	      	ticker.setYesterdayPrice(av.getYesterdayPrice());

					this.state.data.addTicker(ticker);
	        storage.set("Data", this.state.data, function(error){
	        	if(error) throw error;
	        });
	        this.setState({
	          currentPage: this.state.data.getKeys().slice(this.state.page * 5, (this.state.page*5) + 5),
	          newTickerSymbol: "",
	          newTickerPrice: 0,
	          newTickerNumber: 0,
	          loading: false
	        });    
      	});
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
  }

  clearTickers(e){
  	e.preventDefault();
  	storage.clear(function(error){
  		if(error) throw error;
  	});
  	this.setState({
  		data: new Data(),
  		currentPage: [],
  		page: 0,
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
    var tickers = null;
    
    var tickers = this.state.currentPage.map((symbol)=>{
    	let ticker = this.state.data.getTicker(symbol);
    	let change = parseFloat(ticker.getLatestPrice()).toFixed(2) - parseFloat(ticker.getYesterdayPrice()).toFixed(2);
      change = Math.round((change + 0.00001) * 100) / 100;
      if(change > 0){
      	change = "+" + change;
      }
      return(
        <tr key={ticker.getSymbol()}>
          <td width="10%" height="5">{ticker.getSymbol()}</td>
          <td width="40%" height="5">{ticker.getName()}</td>
          <td width="12%" height="5">{parseFloat(ticker.getLatestPrice()).toFixed(2)}</td>
          <td width="12%" height="5">{change}</td>
          <td width="12%" height="5">
          {Math.round(((parseFloat(ticker.getLatestPrice())*ticker.getNumStock())
          	.toFixed(2) - (ticker.getYesterdayPrice()*ticker.getNumStock()).toFixed(2) + 0.00001) * 100) / 100}
          </td>
          <td width="14%" height="5">
          {Math.round(((parseFloat(ticker.getLatestPrice())*ticker.getNumStock())
          	.toFixed(2) - (ticker.getPriceBought()*ticker.getNumStock()).toFixed(2) + 0.00001) * 100) / 100}
          </td>
        </tr>
      )
    })

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
        Refreshed {this.state.refreshTime} seconds ago.
        <table>
          <tbody>
            <tr>
              <th width="10%">Symbol</th>
              <th width="40%">Company Name</th>
              <th width="12%">Price $</th>
              <th width="12%">Change $</th>
              <th width="12%">Day's Gain $</th>
              <th width="14%">Total Gain $</th>
            </tr>
            {tickers}
          </tbody>
        </table>
          <div className={styles.nav}>
          	<div className={styles.navButtons}>
          		<button onClick={this.addTickerButton}>Add New Ticker</button>
        			<button onClick={this.clearTickers}>Clear Tickers</button>
          	</div>
          	<div className={styles.navDirections}>
	          	<i className="fa fa-arrow-left fa" 
	          		onClick={this.prevPage.bind(this)} />
	          	<p>{this.state.page + 1}/{(this.state.data.getKeys().length === 0)? 1 : Math.ceil(this.state.data.getKeys().length/5)}</p>
	          	<i className="fa fa-arrow-right fa"
	          		onClick={this.nextPage.bind(this)} />
	          </div>
          </div>
        </div>
      </div>
    );
  }
}
