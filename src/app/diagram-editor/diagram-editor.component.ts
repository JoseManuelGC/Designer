import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import * as go from 'gojs';
import * as _ from 'lodash';
@Component({
  selector: 'app-diagram-editor',
  templateUrl: './diagram-editor.component.html',
  styleUrls: ['./diagram-editor.component.css']
})
export class DiagramEditorComponent implements OnInit {
  public nodesRemovePalette = [];
  private diagram: go.Diagram = new go.Diagram();
  private palette: go.Palette = new go.Palette();

  @ViewChild('diagramDiv')
  private diagramRef: ElementRef;

  @ViewChild('paletteDiv')
  private paletteRef: ElementRef;

  @Input()
  get model(): go.Model { return this.diagram.model; }
  set model(val: go.Model) { this.diagram.model = val; }
 
  @Output()
  nodeSelected = new EventEmitter<go.Node|null>();

  @Output()
  nodeDeleted= new EventEmitter<go.Node|null>();

  @Output()
  modelChanged = new EventEmitter<go.ChangedEvent>();

  @Output() onGraph = new EventEmitter<any>();
  constructor() {
    const $ = go.GraphObject.make;
    this.diagram = new go.Diagram();
    this.diagram.initialContentAlignment = go.Spot.Center;
    this.diagram.allowDrop = true;  // necessary for dragging from Palette
    this.diagram.undoManager.isEnabled = true;
    this.diagram.allowLink = true;
    this.diagram.allowRelink = false;
    this.diagram.allowUndo = true;
    this.diagram.addDiagramListener("ChangedSelection",
        e => {
          const node = e.diagram.selection.first();
          this.nodeSelected.emit(node instanceof go.Node ? node : null);
          this.nodeDeleted.emit(node instanceof go.Node ? node : null);
        });
    this.diagram.addModelChangedListener(e => {
      e.isTransactionFinished && this.modelChanged.emit(e);
    });

    this.diagram.nodeTemplate =
      $(go.Node, "Auto",
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape,
          {
            fill: "white", strokeWidth: 0,
            portId: "", cursor: "pointer",
            // allow many kinds of links
            fromLinkable: true, toLinkable: true , 
            fromLinkableSelfNode: false, toLinkableSelfNode: false,
            fromLinkableDuplicates: false, toLinkableDuplicates: false
          }, 
          new go.Binding("fill", "color")),
        $(go.TextBlock,
          { margin: 8, editable: false },
          new go.Binding("text").makeTwoWay())
      );

    this.diagram.linkTemplate =
    $(go.Link, 
      {
                        relinkableFrom: false,
                        relinkableTo: false,
                    }, // the whole link panel
      $(go.Shape,  // the link shape
        { stroke: "", }),
      $(go.Panel, "Auto",
        $(go.Shape,  // the label background, which becomes transparent around the edges
          { fill: $(go.Brush, "Radial", { 0: "rgb(240, 240, 240, 0)", 0.3: "rgb(240, 240, 240, 0)", 1: "rgba(240, 240, 240, 0)" }),
            stroke: null,
           }),
        $(go.TextBlock,  // the label text
          { textAlign: "center",
            font: "10pt helvetica, arial, sans-serif",
            stroke: "#555555",
            margin: 4,
            },
          new go.Binding("text", "text"))
      )
      );

    this.palette = new go.Palette();
    this.palette.nodeTemplateMap = this.diagram.nodeTemplateMap;

    // initialize contents of Palette
    this.palette.model.nodeDataArray = [];
  }

  ngOnInit() {
    this.diagram.div = this.diagramRef.nativeElement;
   this.palette.div = this.paletteRef.nativeElement;
  }
  changePaleta(type, node, grafoCompleto, moverTodos?){
    if(type === 'Eliminar' && !grafoCompleto && !moverTodos && node){
      const remove = _.filter(this.palette.model.nodeDataArray, t=>{
        return t.text === node.$d.text
      });
      if(remove[0]){
        this.nodesRemovePalette.push(remove[0]);
        this.palette.model.removeNodeData(remove[0]);
      }
    } else if (type === 'Añadir' && node){
      const add = _.filter(this.nodesRemovePalette, t=>{
        return t.text === node.$d.text
      });
      if (add[0]){
        this.palette.model.addNodeData(add[0]);
        const index = this.nodesRemovePalette.indexOf(add[0]);
        this.nodesRemovePalette.splice(index,1);
      } else {
        this.palette.model.addNodeData(node.$d);
      }
    } else if (type === 'Añadir Todos'){
      this.palette.model.addNodeDataCollection(this.nodesRemovePalette);
      this.nodesRemovePalette = [];
    }
   
  }
  returnPallete(){
    this.nodesRemovePalette = this.palette.model.nodeDataArray;
    this.palette.model.nodeDataArray = [];
    return this.nodesRemovePalette ;
  }
  importNodes($event){
    let files = $event.currentTarget.files[0];
    let imgPromise = this.getFileBlob(files);
    imgPromise.then(blob => {
      this.asignarMapa(blob);
    });
  }

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
    const map = decodeURIComponent(atob(blob.split(',')[1]).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const parser = new DOMParser();
    let fin;
    try {
      fin = JSON.parse(map);
      this.palette.model.nodeDataArray = fin.Nodes;
      this.onGraph.emit(fin.Nodes);
    } catch(e){
      alert('La estructura del archivo no cumple los requisitos');
    }
    /*const xml = parser.parseFromString(map, 'application/xml');
    json = this.xmlToJson(xml);*/

  
  }
}