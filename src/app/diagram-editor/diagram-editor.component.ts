import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import * as go from 'gojs';

@Component({
  selector: 'app-diagram-editor',
  templateUrl: './diagram-editor.component.html',
  styleUrls: ['./diagram-editor.component.css']
})
export class DiagramEditorComponent implements OnInit {
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
  modelChanged = new EventEmitter<go.ChangedEvent>();

  constructor() {
    const $ = go.GraphObject.make;
    this.diagram = new go.Diagram();
    this.diagram.initialContentAlignment = go.Spot.Center;
    this.diagram.allowDrop = true;  // necessary for dragging from Palette
    this.diagram.undoManager.isEnabled = true;
    this.diagram.addDiagramListener("ChangedSelection",
        e => {
          const node = e.diagram.selection.first();
          this.nodeSelected.emit(node instanceof go.Node ? node : null);
        });
    this.diagram.addModelChangedListener(e => e.isTransactionFinished && this.modelChanged.emit(e));

    this.diagram.nodeTemplate =
      $(go.Node, "Auto",
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape,
          {
            fill: "white", strokeWidth: 0,
            portId: "", cursor: "pointer",
            // allow many kinds of links
            fromLinkable: true, toLinkable: true,
            fromLinkableSelfNode: true, toLinkableSelfNode: true,
            fromLinkableDuplicates: true, toLinkableDuplicates: true
          }, 
          new go.Binding("fill", "color")),
        $(go.TextBlock,
          { margin: 8, editable: true },
          new go.Binding("text").makeTwoWay())
      );

    this.diagram.linkTemplate =
      $(go.Link,
        // allow relinking
        { relinkableFrom: false, relinkableTo: false },
        $(go.Shape),
        $(go.Shape, { toArrow: "" })
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
    const map = atob(blob.split(',')[1]);
    const parser = new DOMParser();
    const fin = JSON.parse(map);
    ;
    /*const xml = parser.parseFromString(map, 'application/xml');
    json = this.xmlToJson(xml);*/

  
    this.palette.model.nodeDataArray = fin.Nodes;
  }
}