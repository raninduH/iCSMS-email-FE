import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {apiEndpoint} from "../../app-settings/config";

@Injectable({
  providedIn: 'root'
})
export class UserChangePasswordService {

  apiUrl = `${apiEndpoint}/changePassword`;

  constructor(private http: HttpClient) { }

  changePassword(idtoken: string, accessToken:string, currentPassword:any, newPassword: any): any {
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${idtoken}`
    });
    //application/json
    return this.http.post(this.apiUrl, {
      PreviousPassword: currentPassword,
      ProposedPassword: newPassword,
      AccessToken: accessToken
    }, { headers });
  }
}
