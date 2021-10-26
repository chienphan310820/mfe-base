import { Component } from '@angular/core';

@Component({
  selector: 'ng-base-mfe-draftee-entry',
  template: `<div class="content" role="main">
  <h1>Page Draftee</h1>
  <input type="hidden" #selection>
  <a routerLink="user">Nhấn vào đây để hiển thị danh sách user</a>
</div>`,
  styles: [
    `
      .remote-entry {
        background-color: #143055;
        color: white;
        padding: 5px;
      }
    `,
  ],
})
export class RemoteEntryComponent {}
