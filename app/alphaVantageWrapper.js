function alphaVantage(key){
	this.api = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&apikey=" + key + "&symbol=";
}
alphaVantage.prototype.getLatestPrice = function(symbol){

};
alphaVantage.prototype.test = function(){
	console.log(this.api);
}

export default alphaVantage;