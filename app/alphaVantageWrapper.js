function alphaVantage(key){
	this.api = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&apikey=" + key + "&symbol=";
	this.intradayApi = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&interval=5min&apikey=" + key + "&symbol=";
	this.lastRefreshDate = "";
	this.lastRefreshTime = "";
	this.latestPrice = 0;
	this.yesterdayPrice = 0;
	this.intradayPrices = {};

}
alphaVantage.prototype.initialize = function(symbol){
	let app = this;
	return new Promise(
		function(resolve, reject){
			fetch(app.api + symbol).then(response=>{
				if(response.ok)
					return response.json();
				throw new Error("Error fetching prices");
			}).then(json=>{
				app.lastRefreshTime = json['Meta Data']['3. Last Refreshed'];
				app.lastRefreshDate = json['Meta Data']['3. Last Refreshed'].slice(0,10);
				app.latestPrice = json['Time Series (Daily)'][app.lastRefreshDate]["4. close"];
				app.yesterdayPrice = json['Time Series (Daily)'][Object.keys(json['Time Series (Daily)'])[1]]['4. close'];
				resolve();
			})
		})
};

alphaVantage.prototype.initializeIntraday = function(symbol){
	let app = this;
	return new Promise(
		function(resolve, reject){
			fetch(app.intradayApi + symbol).then(response=>{
				if(response.ok)
					return response.json();
				throw new Error("Error fetching prices");
			}).then(json=>{
				app.lastRefreshTime = json['Meta Data']['3. Last Refreshed'];
				app.lastRefreshDate = json['Meta Data']['3. Last Refreshed'].slice(0,10);
				app.intradayPrices = json['Time Series (5min)'];
				resolve();
			})
		})
}

alphaVantage.prototype.getLastRefreshTime = function(){
	return this.lastRefreshTime;
}

alphaVantage.prototype.getLastRefreshDate = function(){
	return this.lastRefreshDate;
}

alphaVantage.prototype.getLatestPrice = function(){
	return this.latestPrice;
}

alphaVantage.prototype.getYesterdayPrice = function(){
	return this.yesterdayPrice;
}

alphaVantage.prototype.test = function(){
	console.log(this.api);
}

export default alphaVantage;