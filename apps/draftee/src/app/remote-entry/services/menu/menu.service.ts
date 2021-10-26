import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseDomainService } from '../../helpers/baseDomainService.service';
import { Base64 } from 'js-base64';

@Injectable({
  providedIn: 'root'
})
export class MenuService extends BaseDomainService {

  domainName: string = "menu";

  avaiableMenus: string[] | undefined;

  constructor(http: HttpClient) {
    super(http);
  }

  validate(item: any) {
    let _item = Object.assign({}, item);
    _item.hide = _item.hide ? 1 : 0;
    return _item;
  }

  getMenuTree() {
    return this.http
      .get<any>(`${this.env.apiUrl}/api/v1/${this.domainName}/getMenuTree`);
  }

  setAvailableMenus(menuHrefs: string[]) {
    this.avaiableMenus = menuHrefs;
    localStorage.setItem('availableMenus', Base64.encode(JSON.stringify(menuHrefs)));
  }

  getAvailableMenus() {
    if (!this.avaiableMenus) {
      let rtn: string | null = localStorage.getItem('availableMenus');
      if (rtn) {
        this.avaiableMenus = JSON.parse(Base64.decode(rtn));
      }
    }
    return this.avaiableMenus;
  }
}
