import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      [
        {
          path: 'draftee',
          loadChildren: () =>
            import('draftee/Module').then((m) => m.RemoteEntryModule),
        },
        {
          path: 'desbursement',
          loadChildren: () =>
            import('desbursement/Module').then((m) => m.RemoteEntryModule),
        },
        {
          path: 'draftee/user',
          loadChildren: () =>
            import('draftee/user/Module').then((m) => m.RemoteEntryModule),
        },
      ],
      { initialNavigation: 'enabledBlocking' }
    ),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
