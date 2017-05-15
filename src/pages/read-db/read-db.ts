import { Chart } from './../chart/chart';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';
import { File } from '@ionic-native/file';

import * as moment from 'moment';

/**
 * Generated class for the ReadDB page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-read-db',
  templateUrl: 'read-db.html',
})
export class ReadDB {

  db;
  chartOption = {};

  dateStart = '2017-02-01';
  dateEnd = '2017-03-01';

  chartType = 'calendar';
  

  constructor(private file: File, public navCtrl: NavController, private sqlite: SQLite,private toast: Toast) {
    this.dateEnd = moment().format('YYYY-MM-DD');
    this.dateStart = moment().subtract(21,'days').format('YYYY-MM-DD');
    this.loadDB();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReadDB');
  }


  loadDB(){
    console.log('loadDB!');
    this.sqlite.create({name:'Gadgetbridge', location:'default'}).then((db)=> {
      this.db = db;
      console.log('db loaded ');
      this.toast.show('Database opened successfully!', '2200', 'bottom').subscribe(
          toast => {
            console.log(toast);
          });
    }, (err) => {
      console.error('Unable to open database: ', err);
        this.dberror(err);
    });
  }

  readDBandgiveBackTable(sqlText:string, sqlParameters, columns=['value1']){
    //input: complete SQL
    //output: data = [[row],[row]] or ....
    let data = [];

    return this.db.executeSql(sqlText, sqlParameters).then((result) => {
      console.log('gab-readDB - executed! results are here', JSON.stringify(result));

      for(let x = 0; x < result.rows.length; x++) {
          //console.log("row: ", result.rows.item(x));
          let row = [];
          for(let col of columns){
            //console.log(col, columns);
            row.push(result.rows.item(x)[col]);
          }
          data.push(row);//result.rows.item(x)
      }
      return data;
    }, (err) => {
      console.error('Unable to execute sql: ', err);
      this.dberror(err);
    });

  }

  openChart(chartOpt){
    this.navCtrl.push(Chart,{'chartOption':chartOpt})
  }

  showStepsPerDay(){

    let startDays = moment().diff(moment(this.dateStart),'days').toString();
    let endDays = moment().diff(moment(this.dateEnd),'days').toString();
    console.log(startDays, endDays);

    let sqlText = `select SUM(STEPS) as daysteps, date(ROUND(AVG(timestamp)), 'unixepoch') as datum, timestamp
from MI_BAND_ACTIVITY_SAMPLE
where (timestamp between strftime('%s','now','-` + startDays + ` days') and strftime('%s','now','-` + endDays + ` days'))
group by timestamp/(3600*24);`

    let parameters = {'start':startDays.toString(),'end':endDays.toString()};
    let columns = ['datum','daysteps'];

    let data = this.readDBandgiveBackTable(sqlText, parameters, columns).then(res=>{
      //console.log('results:')
      //console.log(res)
      if(this.chartType=='bar'){
        let seriesData1 = res.map(x=> x[1]);
        let seriesxAxis= res.map(x=> x[0]);
        console.log(seriesData1)
        console.log(seriesxAxis)
        this.showSimpleChart1(seriesxAxis,seriesData1);
      } else {

        this.showCalenderChart1(res);
      }
    });
  }


  showCalenderChart1(mixedData){

    console.log('show calendar-graph!', mixedData);
    console.log('range: ', this.dateStart, this.dateEnd, mixedData[0][0]);
    let days = moment(this.dateEnd).diff(moment(this.dateStart),'days');
    if(days<0){days= -days;}
    let cellSizeScale = (1800 / days);
    console.log('CellSizeScale: ', cellSizeScale, cellSizeScale*4000/8000, days);

    let chartOption = {
      calendar: [{
          top: 'middle',
          left: 'center',
          orient: 'vertical',
          cellSize: ['auto', cellSizeScale],
          range: [this.dateStart, this.dateEnd]
      }],
      visualMap: {
          min: 0,
          max: 15000,
          calculable: true,
          orient: 'vertical',
          left: '670',
          top: 'center'
      },
      series: [{
          type: 'scatter',
          coordinateSystem: 'calendar',
          data: mixedData,
          symbolSize: function(val){return cellSizeScale * Math.sqrt(val[1])/60;},
          itemStyle: {
              normal: {
                  color: '#ddb926'
              }
          }
      },
      {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: mixedData,
          symbolSize: function(val){return cellSizeScale * Math.sqrt(val[1])/60;},
      }]
    };
    this.openChart(chartOption);
  }



  showSimpleChart1(seriesxAxis,seriesData1){
    
    let chartOption = {
      title: {
        text: 'Test Chart'
      },
      tooltip : {
        trigger: 'axis'
      },
      toolbox: {
          show : true,
          feature : {
            mark : {show: true},
            dataView : {show: true, readOnly: false},
            magicType : {show: true, type: ['line', 'bar']}
          }
      },
      dataZoom: {
          show: true,
          start : 60,
          end : 100
      },
      legend: {
        data:['Steps per day']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis : [
        {
          type : 'category',
          boundaryGap : false,
        data:seriesxAxis
        }
      ],
      yAxis : [
        {
          type : 'value'
        }
      ],
      series : [
        {
          name:'Steps per day',
          type:'bar',
          stack: 'jey',
          data:seriesData1,
          markLine : {
              data : [
                  {type : 'average', name: 'Average'}
              ]
          }
        },
      ]
    };
    this.openChart(chartOption);
  }

  setCahrt1() {

    this.chartOption = {
    };

  }


  success(){
    console.log('gab- success 4!!');
    alert('yo!');
  }

  dberror(e){
    console.log('gab- error 5!!',e);
    alert('och nö!');
    alert(JSON.stringify(e));
  }
}
