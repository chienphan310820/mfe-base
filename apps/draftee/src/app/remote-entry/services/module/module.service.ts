import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseDomainService } from '../../helpers/baseDomainService.service';

@Injectable({
  providedIn: 'root'
})
export class ModuleService extends BaseDomainService  {
  domainName: string = "module";

  constructor(http: HttpClient) {
    super(http);
  }
}
