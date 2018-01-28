import React, { Component } from 'react';
import Uji from './uji.js';

class Stackbox extends Component {
  constructor(props) {
    super(props);

    this.state = {'onafterupdated':props.onafterupdated || null, 'ops':props.ops || [], 'data':null, 'history':[]};

    this.afterUpdated = this.afterUpdated.bind(this);    
  }

  afterUpdated(data, origin) {
    //console.log('Stackbox.afterUpdated ${origin}');
    this.setState({'data':data});

    if(origin !== undefined) {
      let history = this.state.history;
      history.push(origin);
      this.setState({'history':history});
    }
    if(this.state.onafterupdated !== null) {
      this.state.onafterupdated(data, origin);
    }
  }

  render() {
    var nextSteps;
    if(this.state.data === null) {
      nextSteps='';
    }
    else {
      //TODO history, more ops ...
      nextSteps=<StackOp onafterupdated={this.afterUpdated} data={this.state.data} ops={this.state.ops} />
    }
    return <div id="stackbox"><LoadFileOp onafterupdated={this.afterUpdated}/>{nextSteps}</div>;
  }
}

class StackOp extends Component {
  constructor(props) {
    super(props);

    this.state = {'onafterupdated':props.onafterupdated || null, 'ops':props.ops || {}, 'data':props.data || null};

    this.afterUpdated = this.afterUpdated.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.applyOp = this.applyOp.bind(this);
  }

  afterUpdated(data, origin) {
    console.log('StackOp.afterUpdated');
    if(this.state.onafterupdated !== null) {
      this.state.onafterupdated(data, origin);
    }
  }

  handleApply(e) {
    let op = e.target.innerText;
    console.log(op,this);
    this.applyOp(op);
  }

  applyOp(op) {
    if (this.state.data !== null && this.state.data.byCol !== null) {
      let data = this.state.data;
      let calc = this.state.ops[op](data.byCol[data.headers[1]]);
      data.byCol[data.headers[1]] = calc;
      let newdata = new Uji(null,data.byCol);
      //console.log(data, newdata);
      this.setState({'data':newdata});
      //this.setState({'data':data}); //TODO move calc stack to Uji as "view"  ...
      this.afterUpdated(newdata, op);
    }
  }

  render() {
    let ops = [];
    for (var opstr in this.state.ops) {
      ops.push(<div id={`op-${opstr}`} onClick={this.handleApply} >{opstr}</div>);
    }
    return <div id="stackop">{ops}</div>
  }
  
}

class LoadFileOp extends StackOp {
  constructor(props) {
    super(props);

    //default to quandl params for example, need to APIify + handle csv ...
    this.state = {'dateCol':0,'valCols':[1],'onafterupdated':props.onafterupdated || null};

    this.parseFile = this.parseFile.bind(this);
    this.afterLoaded = this.afterLoaded.bind(this);
  }

  afterLoaded() {
    if(this.state.onafterupdated !== null) {
      this.state.onafterupdated(this.state.data, 'loadfile');
    }
  }

  parseFile(e) {
    let res = JSON.parse(e.target.result).dataset;
    let data = [res.column_names].concat(res.data).map((v) => {return v.filter((vv,i) => {return this.state.dateCol === i || this.state.valCols.includes(i)})});
    this.setState({'data': new Uji(data), 'name':res.dataset_code});
    //console.log(this.state);
    this.afterLoaded();
  }

  render() {
    return <div id="fetch" style={{fontWeight:'bold', color:'steelblue'}}><input type="file" onClick={(e) => e.target.value=''} onChange={(e) => {let fr = new FileReader(); fr.addEventListener('loadend', this.parseFile); fr.readAsText(e.target.files[0]); }} /></div>
  }
}

export default Stackbox;