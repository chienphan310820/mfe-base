import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { RemoteUserComponent } from './user.component';

@NgModule({
  declarations: [RemoteUserComponent],
  imports: [
    BrowserModule,
    RouterModule.forChild([
      {
        path: '',
        component: RemoteUserComponent,
      },
    ]),
  ],
  providers: [],
})
export class RemoteUserModule {}
