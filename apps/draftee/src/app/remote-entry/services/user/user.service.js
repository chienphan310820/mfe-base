"use strict";
var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.UserService = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var httpOptions = {
    headers: new http_1.HttpHeaders({ 'Content-Type': 'Application/json' })
};
var apiUrl = 'https://jsonplaceholder.typicode.com/todos/1';
var UserService = /** @class */ (function() {
    function UserService(httpClient) {
        this.httpClient = httpClient;
    }
    UserService.prototype.getAll = function() {
        listUser = this.httpClient.get(apiUrl).pipe();
        console.log('@@@@@@@@@@@@@@@', listUser);
        return listUser;
    };
    // console.log('@@@@@@@@@@@@@@@', UserService);

    UserService = __decorate([
        (0, core_1.Injectable)({
            providedIn: 'root'
        })
    ], UserService);
    // console.log('11111111111111111111111', UserService);
    return UserService;
}());
exports.UserService = UserService;