import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DomainDetailModalComponent } from '../../helpers/domain-detail-modal/domain-detail-modal.component';
import { CommonService } from '../../services/common/common.service';
import { ModuleService } from '../../services/module/module.service';

@Component({
  selector: 'app-organization',
  templateUrl: '../../helpers/domain-list-template/domain-list.component.html',
  styleUrls: ['./module.component.css']
})
export class ModuleComponent implements OnInit {
  //customerize here =============================================
  mainCardTitle: string = 'Quản trị Phân hệ';
  messageDetailKey: string = 'name'
  usingFilter: boolean = true;

  cols: any[] = [
    { field: 'id', header: 'ID', matchMode: 'equals', headerStyle: this.sanitization.bypassSecurityTrustStyle('width: 10%; text-align: center;'), dataStyle: this.sanitization.bypassSecurityTrustStyle('text-align: center;') },
    { field: 'code', header: 'code', matchMode: 'contains', headerStyle: this.sanitization.bypassSecurityTrustStyle('text-align: center;'), dataStyle: this.sanitization.bypassSecurityTrustStyle('text-align: center;') },
    { field: 'name', header: 'Name', matchMode: 'contains', headerStyle: this.sanitization.bypassSecurityTrustStyle('text-align: center;'), dataStyle: this.sanitization.bypassSecurityTrustStyle('text-align: center;') },
  ];

  detailModalWitdh: string = "50%";
  detailModalFieldItems: any[] = [
    { code: 'code', name: 'Code', type: 'text' },
    { code: 'name', name: 'Name', type: 'text' },
    { code: 'props', name: 'Properties', type: 'text' }
  ]

  constructor(private domainService: ModuleService,
    private commonService: CommonService,
    private sanitization: DomSanitizer,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public dialogService: DialogService) { }

  async ngOnInit(): Promise<any> {
  }
  //customerize here =============================================

  items: any[] = [];
  filterEnabled: boolean = true;
  selectedItems: any[];
  selectedItem: any;
  totalRecords: number;
  loading: boolean = true;
  _lazyLoadEvent: any;
  menuItems: any[] = [
    { label: 'Detail', icon: 'pi pi-fw pi-search', command: () => this.onEvent('detail', this.selectedItem) },
    { label: 'Update', icon: 'pi pi-fw pi-pencil', command: () => this.onEvent('update', this.selectedItem) },
    { label: 'Delete', icon: 'pi pi-fw pi-times', command: () => this.onEvent('delete', this.selectedItem) }
  ];

  onEvent(sender: any = null, event: any = null) {
    if (this.commonService.isLoading() && !this.commonService.ignoreLoadingSenders.includes(sender)) {
      this.messageService.add({ key: 'toast', severity: 'error', summary: 'Hệ thống đang xử lý, vui lòng đợi' });
      return;
    }
    switch (sender) {
      case 'onLazyLoad':
        event.filters = JSON.stringify(event.filters);
        this._lazyLoadEvent = event;
        this.loading = true;
        this.domainService.loadDataTable(event).toPromise().then((data: any) => {
          this.loading = false;
          this.totalRecords = data.totalRows;
          this.items = data.items;
        });
        break;
      case 'create':
        this.showDetailModal('create', event);
        break;
      case 'detail':
        this.domainService.get(event.id).toPromise().then(
          (item: any) => {
            this.showDetailModal('detail', item);
          });
        break;
      case 'update':
        this.domainService.get(event.id).toPromise().then(
          (item: any) => {
            this.showDetailModal('update', item);
          });
        break;
      case 'delete':
        this.confirmationService.confirm({
          message: 'Bạn có muốn thực hiện thao tác này?',
          defaultFocus: 'reject',
          accept: () => {
            this.domainService.delete(event.id).toPromise().then((data: any) => {
              this.messageService.add({ key: 'toast', severity: 'info', summary: 'Delete Success', detail: event[this.messageDetailKey] });
              this.loading = true;
              this.domainService.loadDataTable(this._lazyLoadEvent).toPromise().then((data: any) => {
                this.loading = false;
                this.totalRecords = data.totalRows;
                this.items = data.items;
              });
            }, (reason: any) => {
              this.messageService.add({ key: 'toast', severity: 'error', summary: 'Delete Error', detail: reason.message });
            })
          },
          reject: () => {
          }
        });
        break;
      case 'multiDelete':
        this.confirmationService.confirm({
          message: 'Bạn có muốn thực hiện thao tác xóa dữ liệu theo lô?',
          defaultFocus: 'reject',
          accept: () => {
            let ids: string[] = this.selectedItems.map(item => item.id.toString());
            this.domainService.deleteIdInList(ids).toPromise().then((data: any) => {
              this.messageService.add({ key: 'toast', severity: 'info', summary: 'Multi Delete Success', detail: ids.toString() });
              this.loading = true;
              this.domainService.loadDataTable(this._lazyLoadEvent).toPromise().then((data: any) => {
                this.loading = false;
                this.totalRecords = data.totalRows;
                this.items = data.items;
              });
            }, (reason: any) => {
              this.messageService.add({ key: 'toast', severity: 'error', summary: 'Multi Delete Error', detail: reason.message });
            })
          },
          reject: () => {
          }
        });
        break;
    }
  }

  showDetailModal(action: string = null, item: any = null) {
    let _item: any;
    if (item === null) _item = {};
    else {
      _item = this.domainService.analyze(item);
    }

    let header: string;
    switch (action) {
      case "create":
        header = "Create";
        break;
      case "update":
        header = "Update";
        break;
      default:
        header = "Detail";
        break;
    }

    let requiredFieldsWhenCreate: string[] = ['code', 'name', 'props'];
    let readonlyFieldsWhenUpdate: string[] = ['code'];
    let requiredFieldsWhenUpdate: string[] = ['code', 'name', 'props'];
    this.detailModalFieldItems = this.commonService.setFieldValidator(this.detailModalFieldItems, {
      readonlyFieldsWhenUpdate: readonlyFieldsWhenUpdate,
      requiredFieldsWhenCreate: requiredFieldsWhenCreate,
      requiredFieldsWhenUpdate: requiredFieldsWhenUpdate,
      action: action
    });

    const ref = this.dialogService.open(DomainDetailModalComponent, {
      header: header,
      width: this.detailModalWitdh,
      data: {
        fieldItems: this.detailModalFieldItems,
        item: _item,
        action: action,
        onEvent: (sender: any, data: any) => {
          switch (sender) {
            case "create":
              data = this.domainService.validate(data);
              this.domainService.create(data).toPromise().then((item: any) => {
                this.messageService.add({ key: 'toast', severity: 'info', summary: 'Create Success', detail: item[this.messageDetailKey] });
                this.loading = true;
                this.domainService.loadDataTable(this._lazyLoadEvent).toPromise().then((data: any) => {
                  this.loading = false;
                  this.totalRecords = data.totalRows;
                  this.items = data.items;
                });
              }).catch((reason: any) => {
                this.messageService.add({ key: 'toast', severity: 'error', summary: 'Create Error', detail: reason });
              });
              ref.close();
              break;
            case "update":
              data = this.domainService.validate(data);
              this.domainService.update(data).toPromise().then((item: any) => {
                this.messageService.add({ key: 'toast', severity: 'info', summary: 'Update Success', detail: item[this.messageDetailKey] });
                this.loading = true;
                this.domainService.loadDataTable(this._lazyLoadEvent).toPromise().then((data: any) => {
                  this.loading = false;
                  this.totalRecords = data.totalRows;
                  this.items = data.items;
                });
              }).catch((reason: any) => {
                this.messageService.add({ key: 'toast', severity: 'error', summary: 'Update Error', detail: reason });
              });
              ref.close();
              break;
          }
        }
      }
    });
  }
}
