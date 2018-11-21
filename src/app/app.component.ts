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
  attachmentList:any = [];
  constructor(private _fileService:FileService, private http:HttpClient) {

  }
  title = 'Graphic Edit';

  model = new go.GraphLinksModel(
    [
    ],
 [] );

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
 }
