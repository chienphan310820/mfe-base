import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { observable, Observable, of } from 'rxjs';
import { User } from '../../models/user.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'Application/json' })
}
const apiUrl = 'https://jsonplaceholder.typicode.com/todos/1 ';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<User[]> {
    console.log('success')
    return this.httpClient.get<User[]>(apiUrl).pipe(
    )
  }
}


// =================================================

// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import * as moment from 'moment';
// import { BaseDomainService } from '../../helpers/baseDomainService.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserService extends BaseDomainService {
//   domainName: string = "user";

//   constructor(http: HttpClient) {
//     super(http);
//   }

//   analyze(item: any) {
//     let _item = Object.assign({}, item);

//     try {
//       _item.props = _item.props === null ? {} : JSON.parse(_item.props);
//     } catch (e) {
//       _item.props = {};
//     }
//     if (item.dob) {
//       _item.dob = moment(item.dob).toDate();
//     }
//     _item.employeePosition = _item.props.employeePosition;
//     return _item;
//   }

//   validate(item: any) {
//     let _item = Object.assign({}, item);
//     try {
//       _item.props = _item.props === null ? {} : JSON.parse(_item.props);
//     } catch (e) {
//       _item.props = {};
//     }
//     _item.props.employeePosition = _item.employeePosition;
//     _item.props = JSON.stringify(_item.props);
//     _item.employeePosition = undefined;
//     if (item.dob) {
//       _item.dob = moment(item.dob).toISOString();
//     }
//     return _item;
//   }

//   downloadTemplate() {
//     return this.http
//       .get<any>(`${this.env.apiUrl}/api/v1/script/UserExImHandlerImpl/exec`, { params: { method: 'exportTemplate' } });
//   }

//   upload(item: any) {
//     return this.http
//       .post<any>(`${this.env.apiUrl}/api/v1/uploadFile/uploadFile`, item);
//   }

//   getCurrentUser() {
//     return this.http
//       .get<any>(`${this.env.apiUrl}/api/v1/${this.domainName}/getCurrentUser`);
//   }

//   getCurrentUserLdapInfo() {
//     return this.http
//       .get<any>(`${this.env.apiUrl}/api/v1/${this.domainName}/getCurrentUserLdapInfo`);
//   }

//   getDefaultPage() {
//     return this.http
//       .get<any>(`${this.env.apiUrl}/api/v1/${this.domainName}/getDefaultPage`);
//   }

//   getUserWithRoles(params: any) {
//     return this.http
//       .get<any>(`${this.env.apiUrl}/api/v1/${this.domainName}/getUserWithRoles`, { params: params });
//   }
// }

