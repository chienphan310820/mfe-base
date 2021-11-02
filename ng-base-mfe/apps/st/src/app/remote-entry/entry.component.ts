import { Component } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ng-base-mfe-st-entry',
  template: `<div class="content" role="main">
  <h1>Page Soan Thao</h1>
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
export class RemoteEntryComponent {
  // results;
  //      // constructor(private userSevice: UserService) { }
  //   constructor(private http: HttpClient) { }

  //   ngOnInit(): void {
  //     // this.userSevice.getData().subscribe(res => {
  //     //   this.results = res;
  //     // })
  //   this.http.get("http://jsonplaceholder.typicode.com/users").subscribe(data => {
  //     console.log(data);
  //     this.results = data;
  //   });
  // }
}
