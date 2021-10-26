import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { INavData } from '@coreui/angular';
import { CookieService } from 'ngx-cookie-service';
import { DialogService } from 'primeng/dynamicdialog';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth/auth.service';
import { CommonService } from '../../services/common/common.service';
import { FunctionService } from '../../services/function/function.service';
import { MenuService } from '../../services/menu/menu.service';
import { ModuleService } from '../../services/module/module.service';
import { UserService } from '../../services/user/user.service';
import { ChooseModuleModalComponent } from '../../views/module/choose-module-modal/choose-module-modal.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./spinner.css']
})
export class DefaultLayoutComponent implements OnInit, AfterContentChecked {
  public sidebarMinimized = false;
  // public navItems = navItems;
  public navItems: INavData[] = [];
  moduleCode: String = "";
  moduleList = [];
  menus = [];
  availableMenuHrefs: string[] = [];

  avatarUrl: string = 'assets/img/avatars/6.jpg';
  userDisplayName: string = '';

  constructor(private authService: AuthService,
    private cookieService: CookieService,
    private menuService: MenuService,
    private userService: UserService,
    private functionService: FunctionService,
    private moduleService: ModuleService,
    public commonService: CommonService,
    private dialogService: DialogService,
    private cdRef: ChangeDetectorRef,
    private router: Router) {
  }

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.userService.getCurrentUser().toPromise().then((res: any) => {
      this.avatarUrl = `${environment.apiUrl}/api/v1/user/${res.user.id}/getUserLdapAvatar`;
      this.cookieService.set("personal", JSON.stringify(res.personal));
    })

    this.userService.getCurrentUserLdapInfo().toPromise().then((attr: any) => {
      this.userDisplayName = attr.displayname ? attr.displayname : this.authService.currentUserValue.username;
    })
    
    this.loadAvailableFunctionCodes();

    this.moduleCode = this.cookieService.get("module");
    this.commonService.addTotalRequest();
    this.moduleService.list().toPromise().then((data: any[]) => {
      if (data.length == 1) {
        this.cookieService.set("module", data[0].code);
        this.getMenuTree(() => {
          //Load trang mặc định với role
          this.userService.getDefaultPage().toPromise().then((resp: any) => {
            if (this.router.routerState.snapshot.url === '/dashboard') {
              this.router.navigate([resp.value]);
            }
          })
        });
      } else {
        let org = data.find((item: any) => item.code === this.moduleCode);
        if (!org) {
          this.openChooseModuleModal();
        } else {
          this.getMenuTree(() => {
            //Load trang mặc định với role
            this.userService.getDefaultPage().toPromise().then((resp: any) => {
              if (this.router.routerState.snapshot.url === '/dashboard') {
                this.router.navigate([resp.value]);
              }
            })
          });
        }
      }
    }).finally(() => {
      this.commonService.addCompletedRequest();
    });

    if (window.innerWidth < 1336) {
      this.toggleMinimize(true);
    }

    this.commonService.registerIdleCallback('dashboard', (_idleTime: any) => {

    });
  }

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

  logout(event: Event = null) {
    this.authService.logout(() => {
      this.cookieService.deleteAll();
      this.router.navigate(['login']);
    });
    return null;
  }

  openChooseModuleModal() {
    this.cookieService.delete("module");
    this.dialogService.open(ChooseModuleModalComponent, {
      baseZIndex: 999999,
      header: "Chọn phân hệ",
      width: '30%',
      closeOnEscape: false,
      closable: false
    }).onClose.subscribe(result => {
      if (result !== "logout") {
        this.cookieService.set("module", result);
        this.getMenuTree(() => {
          this.userService.getDefaultPage().toPromise().then((resp: any) => {
            if (this.router.routerState.snapshot.url === '/dashboard') {
              this.router.navigate([resp.value]);
            }
          })
        });
      }
      else
        this.logout();
    });
  }

  getMenuTree(successCb: any = function() {undefined}) {
    this.availableMenuHrefs = [];
    this.commonService.addTotalRequest();
    this.menuService.getMenuTree().toPromise().then((items: any[]) => {
      this.navItems = [];
      while (items.length === 1) {
        if (items[0].childs?.length > 0) {
          items = items[0].childs;
        } else break;
      }

      items.forEach((element: any) => {
        let navData: INavData = {};
        navData.name = element.name;
        navData.url = element.href;
        navData.icon = element.icon;
        this.availableMenuHrefs.push(element.href);

        if (element.childs.length > 0) navData.children = [];
        element.childs.forEach((item: any) => {
          let childNavData: INavData = {};
          childNavData.name = item.name;
          childNavData.url = item.href;
          childNavData.icon = item.icon;
          this.availableMenuHrefs.push(item.href);
          if (!item.hide)
            navData.children.push(childNavData);
        })

        if (!element.hide)
          this.navItems.push(navData);
      });
      this.menuService.setAvailableMenus(this.availableMenuHrefs);

      if (successCb) {
        successCb();
      }
    }, (reason) => {
      console.error(reason);
    }).finally(() => {
      this.commonService.addCompletedRequest();
    });
  }

  loadAvailableFunctionCodes() {
    this.functionService.getAllFunctionCodesAvailableForUser().toPromise().then((data) => {
      this.functionService.setAvailableFunctionCodes(data);
    })
  }

  onEvent(sender: string = null) {
    switch (sender) {
      case "chooseModule":
        this.openChooseModuleModal();
        break;
    }
  }
}
