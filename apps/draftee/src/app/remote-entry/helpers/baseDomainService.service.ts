import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export abstract class BaseDomainService {

  abstract domainName: string;  
  env = environment;

  constructor(protected http: HttpClient) { }

  analyze(item: any): any {
    return item;
  }

  validate(item: any): any {
    return item;
  }

  list(params: any = {}): any {
    return this.http
      .get<any>(`${this.env.apiUrl}/${this.domainName}`, { params: params });
  }

  create(item: any): any {
    item.id = undefined;
    item.version = undefined;
    return this.http
      .post<any>(`${this.env.apiUrl}/${this.domainName}`, item);
  }

  get(id: number): any {
    return this.http
      .get<any>(`${this.env.apiUrl}/${this.domainName}/${id}`);
  }

  update(item: any): any {
    item.version = undefined;
    return this.http
      .put<any>(`${this.env.apiUrl}/${this.domainName}/${item.id}`, item);
  }

  delete(id: number): any {
    return this.http
      .delete<any>(`${this.env.apiUrl}/${this.domainName}/${id}`);
  }

  deleteIdInList(ids: string[]): any {
    return this.http
      .delete<any>(`${this.env.apiUrl}/api/v1/${this.domainName}/deleteIdInList`, { params: { ids: ids } });
  }

  loadDataTable(params: any = {}): any {
    return this.http
      .get<any>(`${this.env.apiUrl}/api/v1/${this.domainName}/loadDataTable`, { params: params });
  }
}
