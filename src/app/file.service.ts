import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from "@angular/core";
import 'rxjs';
import {Observable} from 'rxjs';


@Injectable()

export class FileService {

    constructor(private _http:HttpClient){}

    downloadFile(file:String){
        var body = {filename:file};

        return this._http.post('http://localhost:4200/',body,{
            responseType : 'blob',
            headers:new HttpHeaders().append('Content-Type','application/json')
        });
    }
}