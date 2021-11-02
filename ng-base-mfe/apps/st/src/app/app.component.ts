import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ng-base-mfe-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit{
    title = 'st';
    results;
        // constructor(private userSevice: UserService) { }
      constructor(private http: HttpClient) { }

      ngOnInit(): void {
        // this.userSevice.getData().subscribe(res => {
        //   this.results = res;
        // })
      this.http.get("http://jsonplaceholder.typicode.com/users").subscribe(data => {
        console.log(data);
        this.results = data;
      });
  }
}
