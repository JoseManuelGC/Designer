import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as go from 'gojs';
import * as _ from 'lodash';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { FileService } from './file.service';
import {saveAs} from 'file-saver';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[FileService]
})
export class AppComponent {
  imageShown: boolean;
  currentProfileImage: any;
  cardsDashboard = [
    { title: 'Modelo Profesor', cols: 8, rows: 2 },
    { title: 'Estadísticas', cols: 4, rows: 4 },
    { title: 'Modelo Alumno', cols: 8, rows: 2 }
  ];
  cardsEstadisticas = [
    { title: 'Métricas', cols: 2, rows: 2 },
    { title: 'Gráficos comparativa', cols: 2, rows: 2}
  ];
// Doughnut
public doughnutChartLabels:string[] = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
public doughnutChartData:number[] = [350, 450, 100];
public doughnutChartType:string = 'doughnut';
public barChartOptions:any = {
  scaleShowVerticalLines: false,
  responsive: true
};
public barChartLabels:string[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
public barChartType:string = 'bar';
public barChartLegend:boolean = true;
// public model3:any = new go.GraphLinksModel();
public barChartData:any[] = [
  {data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A'},
  {data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B'}
];
attachmentList:any = [];
  constructor(private _fileService:FileService, private http:HttpClient) {

  }
  public chartClickedGrafica(e:any):void {
    console.log(e);
  }
 
  public chartHoveredGrafica(e:any):void {
    console.log(e);
  }
 
  public randomize():void {
    // Only Change 3 values
    let data = [
      Math.round(Math.random() * 100),
      59,
      80,
      (Math.random() * 100),
      56,
      (Math.random() * 100),
      40];
    let clone = JSON.parse(JSON.stringify(this.barChartData));
    clone[0].data = data;
    this.barChartData = clone;
    /**
     * (My guess), for Angular to recognize the change in the dataset
     * it has to change the dataset variable directly,
     * so one way around it, is to clone the data, change it and then
     * assign it;
     */
  }
  public chartClicked(e:any):void {
    console.log(e);
  }
 
  public chartHovered(e:any):void {
    console.log(e);
  }
  /*onAction($event) {
    console.log($event.file);
    const xmlfile = $event.file;
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlfile, 'text/xml');
    const obj = this.ngxXml2jsonService.xmlToJson(xml);
    console.log(obj);
  }*/

  title = 'My First GoJS App in Angular';

  model = new go.GraphLinksModel(
    [
      { key: 1, text: "Alpha", color: "lightblue" },
      { key: 2, text: "Beta", color: "orange" },
      { key: 3, text: "Gamma", color: "lightgreen" },
      { key: 4, text: "Delta", color: "pink" }
    ],
    [
      { from: 1, to: 2, text: "represent" },
      { from: 1, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 1 }
    ]);
    model3= new go.GraphLinksModel(
      [
        { key: 1, text: "Alpha", color: "lightblue" },
        { key: 2, text: "Beta", color: "orange" }
      ],
      [
        { from: 1, to: 2 }
      ]);
    
  modelComparador = new go.GraphLinksModel(
    [
      { key: 1, text: "Alpha", color: "green" },
      { key: 2, text: "Beta", color: "green" },
      { key: 3, text: "Gamma", color: "red" },
      { key: 4, text: "Delta", color: "red" }
    ],
    [
      { from: 1, to: 2, color:"green"},
      { from: 1, to: 3 , color:"red" },
      { from: 3, to: 4, color:"red" },
      { from: 4, to: 1, color:"red" }
    ]);
   listaNodos = ['Alpha','Beta','Gamma','Delta'];
  @ViewChild('text')
  private textField: ElementRef;

  data: any;
  node: go.Node;

  showDetails(node: go.Node | null) {
    this.node = node;
    if (node) {
      // copy the editable properties into a separate Object
      this.data = {
        text: node.data.text,
        color: node.data.color
      };
    } else {
      this.data = null;
    }
  }

  onCommitDetails() {
    if (this.node) {
      const model = this.node.diagram.model;
      // copy the edited properties back into the node's model data,
      // all within a transaction
      model.startTransaction();
      model.setDataProperty(this.node.data, "text", this.data.text);
      model.setDataProperty(this.node.data, "color", this.data.color);
      model.commitTransaction("modified properties");
    }
  }

  onCancelChanges() {
    // wipe out anything the user may have entered
    this.showDetails(this.node);
  }

  onModelChanged(c: go.ChangedEvent) {
    // who knows what might have changed in the selected node and data?
    this.showDetails(this.node);
  }
  addActivity(formulario: NgForm){
    
    let fileInput: any = document.getElementById("img");
    let files = fileInput.files[0];
    let imgPromise = this.getFileBlob(files);
    imgPromise.then(blob => {
      this.asignarMapa(blob);
    });
    
  }


  /*
  *
  * Método para convertir una URL de un archivo en un
  * blob
  * @author: pabhoz
  *
  */
  getFileBlob(file) {

    var reader = new FileReader();
    return new Promise(function(resolve, reject){

      reader.onload = (function(theFile) {
        return function(e) {
             resolve(e.target.result);
        };
      })(file);

      reader.readAsDataURL(file);

    });
 
  }
  asignarMapa(blob) {
    let json: any;
    const map = atob(blob.split(',')[1]);
    const parser = new DOMParser();
    const xml = parser.parseFromString(map, 'application/xml');
    json = this.xmlToJson(xml);
    const link = [];
    const values = [];
    const  model4= new go.GraphLinksModel(
      [
        { key: 1, text: "Alpha", color: "lightblue" },
        { key: 2, text: "Beta", color: "orange" }
      ],
      [
        { from: 1, to: 2 },
        { from: 2, to: 2 }
      ]);

    const self = this;
    _.forEach(json.graph.node, element => {
        const v = '{ key:' + element.attributes.key+', text:'+ element.attributes.text+', color:'+element.attributes.color+ '}';
        values.push(v);
    });
   
      return model4;
  }
  private onDataSuccess(data: any) {
    if (data) {
      // Parse content to object
      const binary = JSON.parse(data._body);
      const parser = new DOMParser();

      // DECODE UTF-8 and insert <![CDATA[ and ]]> inside tag text

      const xmlString = decodeURIComponent(escape(window.atob(binary.content)))
        .replace(new RegExp('\<ClinicalDocument.*[^xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"].*\>', 'g'),
         '<ClinicalDocument xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">')
        .replace(new RegExp('\<text.*\>\\b|\<text.*\>', 'g'), '<text><![CDATA[')
        .replace(new RegExp('[\\b]?\<\/text\>', 'g'), ']]></text>')
        .replace(new RegExp('\<th\/\>', 'g'), '');

      const xml = parser.parseFromString(xmlString, 'application/xml');
      
      return this.xmlToJson(xml);

    }
  }


  /**
   * Create JSON from object XML
   * @param {*} xml
   * @returns
   * @memberof DocumentReferenceService
   */
  xmlToJson(xml) {

    // Create the return object
    let obj = {};

    if (xml.nodeType === 1) { // element
      // do attributes
      if (xml.attributes.length > 0) {
        obj['attributes'] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          obj['attributes'][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType === 4 || xml.nodeType === 3) { // cdata section y text
      obj = xml.nodeValue
    }

    // do children
    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;

        if (typeof (obj[nodeName]) === 'undefined') {
          obj[nodeName] = this.xmlToJson(item);
        } else {
          if (typeof (obj[nodeName].length) === 'undefined') {
            const old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          if (typeof (obj[nodeName]) === 'object') {
            obj[nodeName].push(this.xmlToJson(item));
          }
        }
      }
    }
    return obj;
  }
  exportDiag($event){
    this.saveFile();
  }
  saveFile() {
    const headers = new Headers();
    headers.append('Accept', 'text/plain');
    this.http.get('/',{
      responseType : 'blob',
      headers:new HttpHeaders().append('Accept', 'text/plain')
  }).toPromise().then(response => this.saveToFileSystem(response));
  }
 
  private saveToFileSystem(response) {
    const body = this.model.toJson();
    const blob = new Blob( [body], { type: 'application/json' });
    saveAs(blob, 'filename');
    alert('Grafo exportado con éxito.');
  }
 }
