import { Component } from '@angular/core';

@Component({
  selector: 'ng-base-mfe-gn-entry',
  template: `<div class="remote-entry">
  <h2>Giai Ngan Component</h2>
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
