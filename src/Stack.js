import React, { Component } from 'react';
import Uji from './uji.js';

class Stackbox extends Component {
  constructor(props) {
    super(props);

    this.state = {'onafterupdated':props.onafterupdated || null, 'ops':props.ops || [], 'data':null, 'history':[], 'lines':[]};

    this.afterUpdated = this.afterUpdated.bind(this);    
  }

  afterUpdated(data, origin) {
    console.log(`Stackbox.afterUpdated ${origin}`);
    this.setState({'data':data});

    if(origin !== undefined) {
      const history = this.state.history;
      if(origin==='loadfile') {
        history = [origin];
      }
      else {
        history.push(origin);
      }
      this.setState({'history':history});
    }
    if(this.state.onafterupdated !== null) {
      this.state.onafterupdated(data, origin);
    }
    if (data !== undefined && origin !== undefined) {
        const pts = data.ptstr(80,50);
        if(origin === 'loadfile') {
          this.setState({'lines':[pts]})
        }
        else {
          const lines = this.state.lines;
          lines.push(pts);
          this.setState({'lines':lines});
        }
    }

  }

  render() {
    var nextSteps, hSteps;

    if(this.state.data !== null) {
      nextSteps=<StackOp onafterupdated={this.afterUpdated} data={this.state.data} ops={this.state.ops} />;
    }

    if(this.state.history !== null && this.state.lines !== null && this.state.history.length === this.state.lines.length) {
    
      hSteps = this.state.history.map((h,i,a) => {
        var prior;
        if (i > 0) {
          prior = this.state.lines[i-1];
        }
      return <UsedOp history={h} line={this.state.lines[i]} priorLine={prior}/>
    });
    }


    return <div id="stackbox"><LoadFileOp onafterupdated={this.afterUpdated}/>{hSteps}{nextSteps}</div>;
  }
}

class StackOp extends Component {
  constructor(props) {
    super(props);

    this.state = {'onafterupdated':props.onafterupdated || null, 'ops':props.ops || {}, 'data':props.data || null, 'width':props.width || 100};

    this.afterUpdated = this.afterUpdated.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.applyOp = this.applyOp.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.width) {
      this.setState({'width':props.width});
    }
    if (props.data) {
      this.setState({'data':props.data});
    }

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
    if (this.state.data !== null) { //} && this.state.data.byCol !== null) {
      let data = this.state.data;
      data.stackOn(this.state.ops[op]);

      /*
      var calc;
      calc = this.state.ops[op](data.byCol[data.headers[1]]);

      console.log(calc);
      data.byCol[data.headers[1]] = calc;
      if (data.byCol[data.headers[0]].length !== calc.length) {
        data.byCol[data.headers[0]] = data.sampleTimes(calc.length)
      }
      let newdata = new Uji(null,data.byCol);
      //console.log(data, newdata);
      this.setState({'data':newdata});
      //this.setState({'data':data}); //TODO move calc stack to Uji as "view"  ...
      this.afterUpdated(newdata, op);
      */
     this.afterUpdated(data, op);
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
    var raw = (e.target.result);
    var data,name;
    //console.log(raw);
    try {
      let json = JSON.parse(raw);
      let res = json.dataset;
      name = res.dataset_code;
      let rawdata = [res.column_names].concat(res.data).map((v) => {return v.filter((vv,i) => {return this.state.dateCol === i || this.state.valCols.includes(i)})});
      data = new Uji(rawdata);
    }
    catch(ex) {
      try {
        //TODO refactor to Uji + improve csv parsing or get a lib ...
        let rows = raw.trim().split('\n').map((r,ri) => {
          return r.split(',').map((v, i, a) => v || a[i]);
        });
        data = new Uji(rows);
      }
      catch(ex2) {
        console.log(ex2);
        data=[];
      }
      //console.log(ex);
    }
    this.setState({'data': data, 'name':name});
    //console.log(this.state);
    this.afterLoaded();
  }

  render() {
    return <div id="fetch" style={{fontWeight:'bold', color:'steelblue'}}><input type="file" onClick={(e) => e.target.value=''} onChange={(e) => {let fr = new FileReader(); fr.addEventListener('loadend', this.parseFile); fr.readAsText(e.target.files[0]); }} /></div>
  }
}

class UsedOp extends StackOp {
  constructor(props) {
    super(props) ;
    this.state = {'history':props.history || '', 'line':props.line || '', 'priorLine':props.priorLine || '', 'data':null, 'ops':null, 'onafterupdated':null};
  }

  renderLine() {
    if(this.state.line) {
      console.log(this.state.history);
      var diff;
      if(this.state.priorLine && (['smooth','ASAP','log']).includes(this.state.history)) {
        let priors = this.state.priorLine.split(' ').reverse();
        let priorstr = priors.join(' ');
        /*let pts = this.state.line.split(' ');
        let bars = pts.map((v,i,a) => {
          return <polyline points={`${v} ${priors[i]}`} stroke="url(#lg)" />
        });
        return <g>
          {bars}
        </g>
*/
        diff = <polygon points={`${this.state.line} ${priorstr}`} fill="orangered" stroke="transparent" transform="translate(0,5)" />
      }
      return <g>{diff}<polyline points={this.state.line} transform="translate(0,5)" /></g>
    }
  }

  render() {
    return <div id="stackop"><div id={`op-${this.state.history}`} className="used">{this.state.history}</div>
      <svg className="stackgraph">
        {this.renderLine()}
      </svg>
    </div>
  }
}

export default Stackbox;