/* 

byRow : [['LABEL 1', 'LABEL 2'],[row0col0, row0col1]...]
byCol : {'LABEL 1':[row0col0, row1col0...], 'LABEL 2':[row0col1data, row1col1...]}
dictByRow : [{'LABEL 1':row0col0, 'LABEL 2', row0col1}, {'LABEL 1':row1col0, 'LABEL 2':row1col1}]

*/
class Uji {
  // data assumed to be row array. static methods can go both ways ...
  constructor(dataByRow=null, dataByCol=null) {
    this.byRow = dataByRow || Uji.cols2rows(dataByCol);
    this.byCol = dataByCol || Uji.rows2cols(dataByRow);
    
    if (this.byRow.length > 0) {
      this.updateStats();
    }
    else {
      this.defaultStats();
    }
  }

  defaultStats() {
    this.headers = [];
    this.mincs = [];
    this.maxcs = [];
  }

  updateStats() {
    this.headers =  this.byRow[0]; //always assume headers row? TODO force A,B,C headers if row[0] is all numeric/sequential once col types are checked

    let headers = this.headers;
    let rows = this.byRow.slice(1);

    this.mincs = this.headers.map((c,ci) => Math.min(this.byCol[c]));
    this.maxcs = this.headers.map((c,ci) => Math.max(this.byCol[c]));
  }

  minFor(colid) {
    if(this.byRow.length > 0) {
      return this.byRow[this.mincs[colid]]
    }
    else {
      return 0;
    }
  }

  maxFor(colid) {
    if(this.byRow.length > 0) {
      return this.byRow[this.maxcs[colid]]
    }
    else {
      return 0;
    }
  }

  ////////////////////////////


  getHeaders(cols=[0,1]) {
    return cols.map((col) => this.byRow[0][col]);
  }

  getDataRows() {
    return this.byRow.slice(1);
  }
  /*
  nrml(min=0, max=1) {
    let range = max - min;
    let ds = this.mincs.map((min,i) => this.maxcs[i] - min);

    let scales = ds.map((d,i) => {
      if (d > range) {
        return d / range;
      }
      else {
        return 1;
      }
    });

    return this.byRow.slice(1).map((r,ri) => {
      return r.map((v,i) => {
        return v / scales[i];
      });
    });
  }*/

  ////////////////////////////////

  axes(x, y) {
    //console.log(`x:${x}, y:${y}`);
    if(this.byCol === null || this.byCol === undefined || this.headers.length < 2) {
      return [[],[]];
    }

    let data = this.view();//this.byCol[this.headers[1]]; //TODO multicol + vari col opts
    let times = this.byCol[this.headers[0]]; //TODO use viewTimes

    if (data === null || data === undefined || data.length < 1) {
      return [[],[]];
    }

    let max = Math.max(...data);
    let min = Math.min(...data);
    let diff = max - min;

    let scale = diff === 0 ? 1 : Math.min(1, y / diff);
    //let scaled = data.map((v) => (max - v) * scale);

    let xstep = ((x) / 100);
    let ystep = y / 50;

    let dx = Math.floor(times.length / xstep);
    let dy = Math.floor(scale / ystep);

    let ys = [];

    //console.log(ystep);
    for (var yy = 0; yy*50 <= y; yy++) {
      //TODO only floor for int data (round to _ digits for decimal? need to handle date data in y axis?)
      ys.push(Math.floor(min + ((yy*50)/y) * diff));
      //console.log(ys);
    }

    let xs = [];
    

    //console.log(xstep);
    for (var xx = 0; xx*100 <= x; xx++) {
      xs.push(this.byCol[this.headers[0]][Math.floor(xx*dx)]);
    }

    return [ xs, ys ] ;
  }

  sampleTimes(sampleCount=100) {
    let times = this.byCol[this.headers[0]];
  //  console.log()
    let dx = (times.length / Math.max(1,sampleCount));
    let xs = [];//'date'];
    //console.log(xstep);
    for (var xx = 1; xx < sampleCount; xx++) {
      xs.push(this.byCol[this.headers[0]][Math.floor(xx*dx)]);
    }

    return xs;
  }
  
  ////////////////////////////////

  static cols2rows(dataByCol) {
    if(!dataByCol) {//TODO check structure, col types
      return [];
    }
    let headers = Object.keys(dataByCol);
    let rows = [headers];
    dataByCol[headers[0]].forEach((v,i) => {
      rows.push(headers.map((h,hi) => {
       return dataByCol[h][i]; 
      }));
    });
    //console.log(rows);
    return rows;
  }

  static rows2cols(dataByRow) {
    if(!dataByRow) {
      return [];
    }

    let headers = dataByRow[0]; // headers assumption todo already in constructor....
    let rows = dataByRow.slice(1);
    let columns = {};
    headers.forEach((h,hi) => {
      columns[h] = [];
    });
    rows.forEach((r,ri) => {
      headers.forEach((h,hi) => {
        var v = r[hi];
        if(hi>0) {
          try {
            v = parseFloat(v); //TODO better colType parsing
          }
          catch(ex) {}
        }

        columns[h][ri] = v;
      });
    });
    //console.log(columns);
    return columns;
  }

  static rows2rowsets(dataByRow) {
    if(dataByRow === null || dataByRow === undefined || dataByRow.length < 1) {
      return [];
    }
    let headers = dataByRow[0];
    let rows = dataByRow.slice(1);
    return rows.map((r,ri) => { 
      let rowset = {};
      headers.forEach((h,hi) => {
        rowset[h] = r[hi];
      });
      return rowset;
    });
  }


  //////////////////////////////////////////
  // TODO refactor string-based content functions into separate utility? (ie toString, ptstr)
  // TODO support multicol/colopts

  static rows2string(dataByRow, includeHeaders = true, includeDates=true) {
    if (dataByRow === null || dataByRow === undefined || dataByRow.length < 1) {
      return '';
    }
    let headers = dataByRow[0];
    let rows = dataByRow.slice(1);
    if (!includeDates) {
      headers=headers.slice(1);
      rows = rows.map((r,i) => r.slice(1));
    }

    let hstr = '';
    if (includeHeaders) {
      hstr = `${headers.join('\t')}\n`;
    }
    return `${hstr}${rows.map((r) => { return r.map((v) => {if(v!==undefined){return v.toString();} else {return '';}}).join('\t')}).join('\n')}`;
    
  }

  toString() {
    return Uji.rows2string([this.getHeaders()].concat(this.viewWithTimes()));
  }

  ptstr(x, y) {
    if(this.byCol === null || this.byCol === undefined) {
      return '';
    }

    let data = this.view();//this.byCol[this.headers[1]]; //TODO multicol + vari col opts

    if (data === null || data === undefined || data.length < 1) {
      return '';
    }

    let max = Math.max(...data);
    let min = Math.min(...data);
    let diff = max - min;

    let scale = diff === 0 ? 1 : y / diff;
    let scaled = data.map((v) => (max - v) * scale);

    let step = x / data.length;

    //TODO move str to App, return scaled/step 
    let str = scaled.map((v,i) => `${step*i},${v}`).join(' ');
    //console.log(str);
    return str;
  }


  ////////////////////////////////////////////////

  static csv2rows(csv) {
    //console.log(csv);

    return new Uji(csv);
  }





///////////////////////////////////////

  static smooth(calcVals) {
    var smoothWith = [];
    var smoothMax = 3;
    const ticksPerMonth = 21.5; //(365*(5/7))/12;
    const monthSpan = Math.round(calcVals.length / ticksPerMonth);
    if(monthSpan > 1 && monthSpan <= 6) {
      smoothMax = 7;
    }
    else if(monthSpan > 6 && monthSpan <= 12) {
      smoothMax = 21;
    }
    else if(monthSpan > 12) {
      smoothMax = Math.floor(monthSpan* (21/12));
    }

    let rtnVals = calcVals.map((v,vi) => {
      if (smoothWith.length == smoothMax) {
        smoothWith = smoothWith.slice(1);
      }
      smoothWith.push(v);

      if(smoothWith.length > 1) {
        let rv = smoothWith.reduce((acc,n) => acc+n) / smoothWith.length;
        return rv;
      }
      else {
        return v;
      }
    });

    return rtnVals;
  }

  static log(calcVals) {
    return calcVals.map((v) => Math.log(v));
  }

  static index(calcVals) {
    //console.log(this.maxcs, this.mincs, calcVals);
    return calcVals.map((v,i,a) => (v/a[0])*100); 
  }

  //////////////////////////////////////

  static combine(cols, data) {
    let rd = data.map((row) => 
            cols.map((vc) => parseFloat(row[vc]))
              .reduce((acc,n) => acc*n)
    );

    return rd;
  }

  flatten(vals) {
    if(this.stack) {
      this.stack.forEach((transform,i) => {
        vals = transform(vals);
      });
    }
    return vals;
  }

  flattenStack(cols, data) {
    return this.flatten(Uji.combine(cols, data));
  }

  stackOn(transform) {
    if(!this.stack) {
      this.stack=[transform];
    }
    else if (!this.stack.includes(transform)) {
      this.stack.push(transform);
    }
  }

  static stackOff(transform) {
    if(this.stack && this.stack.includes(transform)) {
      this.stack.splice(this.stack.indexOf(transform),1);
    }
  }

  viewTimes(viewData) {
    return this.sampleTimes((viewData || this.view()).length);
  }

  view(cols=[1]) {
    //TODO colopts
    return this.flattenStack(cols,this.getDataRows());
  }

  viewWithTimes(cols=[1]) {
    let vv = this.view(cols);
    let tt = this.viewTimes(vv);

    //TODO opt headers?
    return tt.map((tv, ti) => {
      return [tv, vv[ti]];
    });
  }


  ////////////////////////////////////////////////
  
  // the following code comes from http://futuredata.stanford.edu/asap/#code
  
  static ASAP(data) {//, resolution=100) {
    const minResolution = 50;
    let resolution = Math.max(minResolution,Math.floor(data.length / 21));
    //console.log(resolution);
    if (resolution < data.length) {
        data = Uji.SMA(data, Math.trunc(data.length / resolution),
            Math.trunc(data.length / resolution));
    }
    var metrics = new Metrics(data);
    var originalKurt = metrics.kurtosis();
    var minObj = metrics.roughness();
    var windowSize = 1;
    for (var w = Math.round(data.length / 10);
            w >= 2; w -=1) {
        var smoothed = Uji.SMA(data, w, 1);
        metrics = new Metrics(smoothed);
        var roughness = metrics.roughness();
        if (roughness < minObj) {
            if (metrics.kurtosis() >= originalKurt) {
                minObj = roughness;
                windowSize = w;
            }
        }
    }
    return Uji.SMA(data, windowSize, 1);
  }


  static SMA(data, range, slide) {
      var windowStart = 0;
      var sum = 0;
      var count = 0;
      var values = [];

      for (var i = 0; i < data.length; i ++) {
          if (isNaN(data[i])) { data[i] = 0; }
          if (i - windowStart >= range) {
              values.push(sum / count);
              var oldStart = windowStart;
              while (windowStart < data.length && windowStart - oldStart < slide) {
                  sum -= data[windowStart];
                  count -= 1;
                  windowStart += 1;
              }
          }
          sum += data[i];
          count += 1;
      }
      if (count == range) {
          values.push(sum / count);
      }
      return values;
  }


}

class Metrics {
  constructor(values) {
      this.len = values.length;
      this.values = values;
      this.m = Metrics.mean(values);
  }

  static mean(values) {
      var m = 0;
      for (var i = 0; i < values.length; i += 1) {
          m += values[i];
      }
      return m / values.length;
  }

  static std(values) {
      var m = Metrics.mean(values);
      var std = 0;
      for (var i = 0; i < values.length; i += 1) {
          std += Math.pow((values[i] - m), 2);
      }
      return Math.sqrt(std / values.length);
  }

  kurtosis() {
      var u4 = 0, variance = 0;
      for (var i = 0; i < this.len; i ++) {
          u4 += Math.pow((this.values[i] - this.m), 4);
          variance += Math.pow((this.values[i] - this.m), 2);
      }
      return this.len * u4 / Math.pow(variance, 2);
  }

  roughness() {
      return Metrics.std(this.diffs());
  }

  diffs() {
       var diff = new Array(this.len - 1);
       for (var i = 1; i < this.len; i += 1) {
          diff[i - 1] = this.values[i] - this.values[i - 1];
       }
       return diff;
  }
} 

export default Uji;