import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as go from 'gojs';
import * as _ from 'lodash';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { FileService } from './file.service';
import {saveAs} from 'file-saver';
import { DiagramEditorComponent } from './diagram-editor/diagram-editor.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[FileService]
})
export class AppComponent {
  public load:Boolean = false;
  public grafoCompleto: Boolean = false;
  public moverTodos: Boolean = false;
  public nodeSelect;
  imageShown: boolean;
  currentProfileImage: any;
  attachmentList:any = [];
  constructor(private _fileService:FileService, private http:HttpClient) {

  }
  title = 'Graphic Edit';

  model = new go.GraphLinksModel(
    [
    ],
 [] );
 nodesModelPaleta = [];
 nodesModificadoPaleta = [];
 @ViewChild(DiagramEditorComponent) diagramModel: DiagramEditorComponent;
  @ViewChild('text')
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
      this.diagramModel.changePaleta('Eliminar',this.node, this.grafoCompleto, this.moverTodos);
      this.nodeSelect = node;
      this.grafoCompleto = false;
      this.moverTodos = false;
    } else {
        this.diagramModel.changePaleta('Añadir',this.nodeSelect, null);
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

  graph($event){
    this.nodesModelPaleta = $event;
  }
  onCancelChanges() {
    // wipe out anything the user may have entered
    this.showDetails(this.node);
  }

  onModelChanged(c: go.ChangedEvent) {
    const model: any = c;
    if (model && model.Ls && model.Ls.Sb === 'Linking'){
      let to;
      let from;
      const self = this;
      _.forEach(model.model.linkDataArray, link => {
        _.forEach(model.model.linkDataArray, t =>{ 
          if (t.from === link.to && link.from === t.to){
            to = t.to;
            from  = t.from;
          }  
        });
      });
      const remove = _.filter(model.model.linkDataArray, t=>{
        return t.to === to && t.from === from
      });
      this.model.removeLinkData(remove[0]);
      this.model.linkDataArray = model.model.linkDataArray;
    }
    // who knows what might have changed in the selected node and data?
    this.showDetails(this.node);
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
    saveAs(blob, 'Graph');
    alert('Grafo exportado con éxito.');
  }
  deleteDetail($event){
   // console.log($event);
  }
  limpiarGrafo($event){
    this.diagramModel.changePaleta('Añadir Todos', null, null);
    this.nodeSelect = null;
    this.grafoCompleto = true;
    this.model.linkDataArray = [];
    this.model.nodeDataArray = [];
  }
  moverTodosNodos($event){
   const palette= this.diagramModel.returnPallete();
   let fila = 0;
   let columna = 0
   for (let i = 0; i< palette.length;i++){
     if (i % 2 === 1){ // impar
       palette[i].loc = "" + fila + " " + columna + "";
        fila = 0;
        columna += 40;
     } else { // par
      palette[i].loc = "" + fila + " " + columna + "";
      fila = -200;
      columna = columna;
     }
   }
   this.model.nodeDataArray = palette;
   this.moverTodos = true;

  }
  importNodes($event){
    this.diagramModel.importNodes($event);
    this.load = true;
  }
 }
