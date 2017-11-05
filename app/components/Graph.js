// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Graph.css';
import alphaVantage from '../alphaVantageWrapper';
var LineChart = require("react-chartjs").Line;
const apiKey = "K2KAC8WYMD2CQHI5"
var av = new alphaVantage(apiKey);
av.test();

const data = {
  labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [{
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      borderColor: 'rgba(255, 255, 255, 0.7)',
      borderWidth: 1,

  }]
}
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

  componentWillMount(){
    console.log(this.props);
    av.initializeIntraday("nvda").then(()=>{
      console.log(av);
      console.log(av.intradayPrices);
    });
  }

  render() {
    const { increment, incrementIfOdd, incrementAsync, decrement, counter } = this.props;
    return (
      /*
      <div className={`counter ${styles.counter}`} data-tid="counter">
          {counter}
        </div>
        <div className={styles.btnGroup}>
          <button className={styles.btn} onClick={increment} data-tclass="btn">
            <i className="fa fa-plus" />
          </button>
          <button className={styles.btn} onClick={decrement} data-tclass="btn">
            <i className="fa fa-minus" />
          </button>
          <button className={styles.btn} onClick={incrementIfOdd} data-tclass="btn">odd</button>
          <button className={styles.btn} onClick={() => incrementAsync()} data-tclass="btn">async</button>
        </div>
      */

      <div>
        <div className={styles.top}>
          <div className={styles.backButton} data-tid="backButton">
            <Link to="/">
              <i className="fa fa-arrow-left fa-2x" />
            </Link>
          </div>
          <div className={styles.title}>
            {this.props.location.query.symbol}
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
