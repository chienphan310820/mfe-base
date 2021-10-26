import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Base64 } from 'js-base64';
import jwt_decode from "jwt-decode";
import { Router } from '@angular/router';
import { BaseDomainService } from '../../helpers/baseDomainService.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends  BaseDomainService  {
  domainName!: string;
  private IDLE_TIME_TO_AUTO_LOGOUT: number = 3600;
  private REMAINING_TIME_TO_EXTEND_SESSION: number = 30;

  private authConfig: any = {
    idleTime: undefined,
    lastTimeActive: undefined,
    remainingTime: undefined,
    authInterval: undefined,
    accessTokenDecoded: undefined,
    needExtendSession: undefined,
    isProcessing: undefined
  }

  private currentUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public currentUser!: Observable<any>;

  constructor(http: HttpClient, private router: Router) {
    super(http);

    let rtn = localStorage.getItem('currentUser');
    if (rtn) {
      try {
        rtn = Base64.decode(rtn);
        this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(rtn));
        this.currentUser = this.currentUserSubject.asObservable();
      } catch (e) {
        console.error(e);
      }
    }

    this.authConfig.authInterval = setInterval(() => {
      if (this.authConfig.accessTokenDecoded) {
        let currentTime = new Date().getTime() / 1000;
        this.authConfig.remainingTime = this.authConfig.accessTokenDecoded['exp'] - currentTime;
        this.authConfig.idleTime = currentTime - this.authConfig.lastTimeActive;
        this.authConfig.needExtendSession = this.authConfig.remainingTime < this.REMAINING_TIME_TO_EXTEND_SESSION && this.authConfig.idleTime < this.IDLE_TIME_TO_AUTO_LOGOUT;

        if (this.authConfig.needExtendSession && !this.authConfig.isProcessing) {
          this.authConfig.isProcessing = true;
          this.sessionExtend().toPromise().finally(() => {
            this.authConfig.isProcessing = false;
          });
        }

        if (this.authConfig.idleTime > this.IDLE_TIME_TO_AUTO_LOGOUT) {
          console.log(`${new Date().getTime}: auto logout...`);
          this.logout(() => {
            this.router.navigate(['login']);
          });
        }
      }
    }, 1000);
  }

  public get currentUserValue(): any {
    let rtn = localStorage.getItem('currentUser');
    if (rtn) {
      try {
        rtn = Base64.decode(rtn);
        this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(rtn));
        return this.currentUserSubject.value;
      } catch (e) {
        console.error(e);
      }
    }
  }

  login(username: string, password: string) {
    username = username?.toLowerCase();

    return this.http.post<any>(`${this.env.apiUrl}/api/v1/user/login`, { username, password })
      .pipe(map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentUser', Base64.encode(JSON.stringify(user)));
        this.currentUserSubject.next(user);
        this.authConfig.accessTokenDecoded = jwt_decode(user.access_token);

        return user;
      }));
  }

  sessionExtend() {
    return this.http.post<any>(`${this.env.apiUrl}/api/v1/user/sessionExtend`, '{}').pipe(map(user => {
      console.log(`${new Date().getTime}: auto extend session...`);
      localStorage.setItem('currentUser', Base64.encode(JSON.stringify(user)));
      this.currentUserSubject.next(user);
      this.authConfig.accessTokenDecoded = jwt_decode(user.access_token);
      return user;
    }));
  }

  logout(successCb: any = function() {undefined}) {
    // remove user from local storage to log user out
    localStorage.clear();
    this.authConfig = {};
    this.currentUserSubject.next(null);

    this.http.get<any>(`${this.env.apiUrl}/api/v1/user/logout`).toPromise().finally(() => {
      if (successCb) {
        successCb();
      }
    });
  }

  getAccessToken() {
    let currentUser = this.currentUserValue;
    if (currentUser) {
      this.authConfig.accessTokenDecoded = jwt_decode(currentUser.access_token);
      this.authConfig.lastTimeActive = new Date().getTime() / 1000;
    }

    return currentUser?.access_token;
  }
}
