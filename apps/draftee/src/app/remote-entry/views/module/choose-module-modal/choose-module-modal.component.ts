import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Organization } from '../../../models/organization/organization.model';
import { CommonService } from '../../../services/common/common.service';
import { ModuleService } from '../../../services/module/module.service';

@Component({
  selector: 'app-choose-module-modal',
  templateUrl: './choose-module-modal.component.html',
  styleUrls: ['./choose-module-modal.component.css']
})
export class ChooseModuleModalComponent implements OnInit {
  organizationLst: any;
  organization: Organization;

  constructor(public ref: DynamicDialogRef,
    public commonService: CommonService,
    public config: DynamicDialogConfig,
    private moduleService: ModuleService) { }

  ngOnInit(): void {
    this.commonService.addTotalRequest();
    this.moduleService.list().toPromise().then(orgs => {
      this.organizationLst = orgs;
      this.organizationLst.forEach(element => {
        if (element.props != null) {
          element.props = JSON.parse(element.props);
          if (element.props.style == null || element.props.style == '')
            element.props.style = "btn-big blue";
          if (element.props.icon == null || element.props.icon == '')
            element.props.icon = "fa fa-twitter fa-2x";
        } else {
          element.props.style = "btn-big blue";
          element.props.icon = "fa fa-twitter fa-2x";
        }
      });
    }).finally(() => {
      this.commonService.addCompletedRequest();
    });
  }

  onEvent(sender, data = null): void {
    switch (sender) {
      case "choose":
        this.ref.close(data?.code);
        break;
      case "logout":
        this.ref.close('logout');
        break;
    }
  }

}
