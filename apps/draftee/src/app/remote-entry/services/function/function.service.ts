import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Base64 } from 'js-base64';
import { environment } from '../../../environments/environment';
import { BaseDomainService } from '../../helpers/baseDomainService.service';

@Injectable({
  providedIn: 'root'
})
export class FunctionService extends BaseDomainService {
  domainName: string = "function"
  availableFunctionCodes: any[] | undefined;

  constructor(http: HttpClient) {
    super(http);
  }

  setAvailableFunctionCodes(availableFunctionCodes: string[]) {
    this.availableFunctionCodes = availableFunctionCodes;
    localStorage.setItem('availableFunctionCodes', Base64.encode(JSON.stringify(availableFunctionCodes)));
  }

  getAvailableFunctionCodes() {
    if (!this.availableFunctionCodes) {
      let rtn: string | null = localStorage.getItem('availableFunctionCodes');
      if (rtn) {
        this.availableFunctionCodes = JSON.parse(Base64.decode(rtn));
      }
    }
    return this.availableFunctionCodes;
  }

  getRoles(item: any) {
    return this.http
      .get<any>(`${environment.apiUrl}/api/v1/${this.domainName}/${item.id}/getRoles`)
  }

  updateRoles(item: any, ids: number[]) {
    return this.http
      .post<any>(`${environment.apiUrl}/api/v1/${this.domainName}/${item.id}/updateRoles`, JSON.stringify(ids))
  }

  getAllFunctionsAvailableForUser() {
    return this.http
      .get<any>(`${environment.apiUrl}/api/v1/${this.domainName}/getAllFunctionsAvailableForUser`)
  }

  getAllFunctionCodesAvailableForUser() {
    return this.http
      .get<any>(`${environment.apiUrl}/api/v1/${this.domainName}/getAllFunctionCodesAvailableForUser`)
  }
}
