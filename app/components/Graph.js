// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Graph.css';
import alphaVantage from '../alphaVantageWrapper';
var LineChart = require("react-chartjs").Line;
const apiKey = "K2KAC8WYMD2CQHI5"
var av = new alphaVantage(apiKey);
av.test();

const options = { 
  scales:{
    xAxes:[{
      scaleLabel:{
        display: true,
        labelString: "Time",
        fontColor: "white",
      },
      ticks:{
        fontColor: "rgba(255,255,255,1)",
      },
      gridLines:{
        color:"rgba(255,255,255,0.5)",
        zeroLineColor:"rgba(255,255,255,1)"
      }
    }],
    yAxes:[{
      ticks:{
        fontColor: "rgba(255,255,255,1)",
      },
      scaleLabel:{
        display: true,
        labelString: "Price",
        fontColor: "white",
      },
      gridLines:{
        color:"rgba(255,255,255,0.5)",
        zeroLineColor:"rgba(255,255,255,1)"
      }
    }],
  },
  legend:{labels:{fontColor: 'white'}}
}

class Counter extends Component {
  props: {
    increment: () => void,
    incrementIfOdd: () => void,
    incrementAsync: () => void,
    decrement: () => void,
    counter: number
  };
  constructor(props){
    super(props);
    this.state={
      keys: [],
      data: [],
      openPrice: [],
      error: false,
    }
  }
  componentWillMount(){
    this.setState({loading: true})
    av.initializeIntraday(this.props.location.query.symbol).then((error)=>{
      console.log(error);
    }).then(()=>{
      Object.keys(av.intradayPrices).forEach((time)=>{
        let key = time.slice(11, 20);
        if(time.slice(0,10) == av.lastRefreshDate){
          this.state.keys.unshift(key);
          this.state.data.unshift(av.intradayPrices[time]['4. close']);
          this.state.openPrice.push(this.props.location.query.openPrice);
        } 
      })
      this.setState({loading: false})
    }).catch((error)=>{
      console.log(error);
      this.setState({error: true})
    });
  }

  render() {
    const { increment, incrementIfOdd, incrementAsync, decrement, counter } = this.props;
    var loading = null;
    if(this.state.loading){
      loading =(
        <overlay><l>loading...</l></overlay>
        )
    }

    var data = {
      labels: this.state.keys,
      datasets: [{
          label: 'Price',
          data: this.state.data,
          borderColor: 'rgba(255, 255, 255, 0.7)',
          borderWidth: 1,
          pointRadius: 0,

      },
      {
        label: 'Price at open',
        data: this.state.openPrice,
        borderColor: 'rgba(255, 0, 0, 1)',
        borderWidth: 1,
        pointRadius: 0,
      }]
    }
    if(this.state.error){
      return(
        <div>
          <overlay><l>There was an error retrieving the data. Please try again later.</l></overlay>
          <div className={styles.top}>
            <div className={styles.backButton} data-tid="backButton">
              <Link to="/">
                <i className="fa fa-arrow-left fa-2x" />
              </Link>
            </div>
          </div>
        </div>
        )
    }
    return (
      <div>
        {loading}
        <div className={styles.top}>
          <div className={styles.backButton} data-tid="backButton">
            <Link to="/">
              <i className="fa fa-arrow-left fa-2x" />
            </Link>
          </div>
          <div className={styles.title}>
            {this.props.location.query.name} ({this.props.location.query.symbol})
          </div>
        </div>
        <div className={styles.graph}>
          <LineChart data={data} 
            options={options} 
            width="420px" 
            height="180px" /> 
          </div>      
      </div>
    );
  }
}

export default Counter;
