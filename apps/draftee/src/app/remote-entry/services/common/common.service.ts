import { Injectable } from '@angular/core';
import { CategoryService } from '../category/category.service';
import { get as JsScriptLoad } from 'scriptjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfService } from '../conf/conf.service';
import { ExportService } from '../export/export.service';
import { saveAs } from 'file-saver';
import { TreeNode } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { MD5 } from 'crypto-js';
import { CookieService } from 'ngx-cookie-service';

declare const DocsAPI: any;

@Injectable({
	providedIn: 'root'
})
export class CommonService {
	public loadingCounter: number = 0;
	public loadingContent: string = "Đang xử lý";
	public totalRequest: number = 0;
	public spinnerType: string = 'ball-atom';
	public spinnerTypes: string[] = ['square-jelly-box', 'ball-atom', 'ball-circus', 'ball-climbing-dot', 'ball-clip-rotate-multiple', 'timer', 'square-loader', 'pacman'];
	public spinnerIndex: number = 0;

	public static signAlias: string = '_s';
	public static transactionTimeAlias: string = '_t';
	public static fromStateAlias: string = '_f';
	public static transactionTimeExpire: number = 6000000;

	private browserVersionRequire: any;
	public ignoreLoadingSenders: string[] = ['onLazyLoad']

	constructor(private categoryService: CategoryService,
		private router: Router,
		private route: ActivatedRoute,
		public exportService: ExportService,
		public confService: ConfService,
		private spinner: NgxSpinnerService) {

		setInterval(() => {
			if (this.totalRequest > 0) {
				this.loadingCounter++;
				this.loadingCounter = this.loadingCounter == 4 ? this.loadingCounter = 0 : this.loadingCounter;
				this.loadingContent = "Đang xử lý"
				for (let i = 0; i < this.loadingCounter; i++) {
					this.loadingContent += ".";
				}
			}
		}, 1000);
	}

	showSpinner(state: boolean = true) {
		if (state) {
			this.spinner.show();
		} else {
			this.spinner.hide();
		}
	}

	addTotalRequest(count: number = 1) {
		this.totalRequest += count;
		this.showSpinner(this.totalRequest > 0);
		// console.log(`${this.totalRequest}`);
	}

	addCompletedRequest(count: number = 1) {
		this.totalRequest -= count;
		this.totalRequest = this.totalRequest < 0 ? 0 : this.totalRequest;
		if (this.totalRequest === 0) {
			this.spinnerIndex = Math.floor(Math.random() * this.spinnerTypes.length);
		}
		this.showSpinner(this.totalRequest > 0);
		// console.log(`${this.totalRequest}`);
	}

	clearRequestCount() {
		this.totalRequest = 0;
		this.showSpinner(false);
	}

	isLoading(): boolean {
		return this.totalRequest > 0;
	}

	calSign(queryParams: any = {}, key: string = "") {
		let queryParamsWithoutSign: string[] = [];
		Object.keys(queryParams).forEach(function (_key) {
			if (_key !== CommonService.signAlias)
				queryParamsWithoutSign.push(`${_key}=${queryParams[_key]}`);
		})
		queryParamsWithoutSign.push['key'] = key;
		let _queryParamsWithoutSign = queryParamsWithoutSign.join('&');
		let sign = MD5(_queryParamsWithoutSign).toString();
		return sign;
	}

	checkSign(queryParams: any = {}, key: string = "") {
		let currentTime: number = Date.now();
		if (!queryParams[CommonService.transactionTimeAlias] || parseInt(queryParams[CommonService.transactionTimeAlias]) + CommonService.transactionTimeExpire < currentTime) {
			return false;
		}
		let sign = this.calSign(queryParams, key);
		return sign === queryParams[CommonService.signAlias];
	}

	routerNavigate(commands: any[], queryParams: any = {}, blank: boolean = false) {
		Object.keys(queryParams).forEach((key) => {
			if (queryParams[key] === undefined || queryParams[key] === null) {
				delete queryParams[key];
			}
		})

		if (!queryParams[CommonService.fromStateAlias]) {
			queryParams[CommonService.fromStateAlias] = this.router.routerState.snapshot.url.split('?')[0];
		}
		if (!queryParams[CommonService.transactionTimeAlias]) {
			queryParams[CommonService.transactionTimeAlias] = Date.now();
		}
		queryParams[CommonService.signAlias] = this.calSign(queryParams);

		if (blank) {
			let url = this.router.serializeUrl(this.router.createUrlTree(commands, { queryParams: queryParams }));
			let baseUrl = window.location.href.replace(this.router.url, '');
			window.open(baseUrl + url, '_blank');
		} else {
			this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate(commands, { queryParams: queryParams }));
		}
	}

	routeToPreviousPage(queryParams: any = {}) {
		let previousPage = this.route.snapshot.queryParamMap.get(CommonService.fromStateAlias)
		previousPage = previousPage ? previousPage : '/'
		this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.routerNavigate([previousPage], { queryParams: queryParams }));
	}

	showPreviewPageBeforePrint(title: string, targetElementId: string = 'viewTemplate', print: boolean = false,
		options: any = { hasHeader: 0, hasQrCode: 0, docTemplateId: null, docDetailId: null, docNeedListId: null, sender: null }, successCb: () => void = null) {

		let contentEditableElements;
		let notPrintIfEmptyElements;
		let editableElementOldBackground: any = {};
		let notPrintElementOldBackground: any = {};
		if (print) {
			//Xoa mau noi dung [contenteditable=true]
			let el_view = document.querySelector("#viewTemplate");
			contentEditableElements = el_view.querySelectorAll('[contenteditable]');
			contentEditableElements.forEach((element: any) => {
				editableElementOldBackground[element.id] = element['style'].backgroundColor
				element['style'].backgroundColor = 'rgba(255, 255, 255, .1)';
			})

			notPrintIfEmptyElements = el_view.querySelectorAll('[notPrintIfEmpty]');
			notPrintIfEmptyElements.forEach((element: any) => {
				notPrintElementOldBackground[element.id] = element['style'].backgroundColor
				element['style'].backgroundColor = '#ffffff';
			})
		}

		let divContents = document.getElementById(targetElementId).innerHTML;

		if (print) {
			this.addTotalRequest();
			this.exportService.fromHtml(divContents,
				options.hasHeader,
				options.hasQrCode,
				options.docDetailId,
				options.docTemplateId,
				options.docNeedListId,
				options.sender).toPromise().then(resp => {
					this.saveFileAs(resp);
					if (successCb) {
						successCb();
					}
				}, reason => {
					console.log(reason);
				}).finally(() => {
					contentEditableElements.forEach(element => {
						element['style'].backgroundColor = editableElementOldBackground[element.id];
					})
					notPrintIfEmptyElements.forEach(element => {
						element['style'].backgroundColor = notPrintElementOldBackground[element.id];
					})
					this.addCompletedRequest();
				})
		} else {
			let a = window.open('', '', 'height=600, width=1000');
			a.document.write('<html>');
			a.document.write('<head>');
			a.document.write(`<title>${title}</title>`);
			a.document.write('<style>');
			a.document.write('@media print{color: $primary;}')
			a.document.write('@page{margin-left: 1cm;margin-right: 1cm;margin-top: 1.5cm;margin-bottom: 1.5cm;}');
			a.document.write('</style>');
			a.document.write('</head>');
			a.document.write('<body>');
			a.document.write('<div>');
			let pattern = new RegExp('contenteditable="true"', 'g');
			divContents = divContents.replace(pattern, 'contenteditable="false"');
			a.document.write(divContents);
			a.document.write('</div>');
			a.document.write('</body></html>');
			a.document.close();
			a.onload = () => {
				if (print) {
					a.print();
					if (successCb) {
						successCb();
					}
				}
			}
		}
	}

	previewBeforePrint(title: string, targetElementId: string = 'viewTemplate', print: boolean = false) {
		let contentEditableElements;
		let notPrintIfEmptyElements;
		let editableElementOldBackground: any = {};
		let notPrintElementOldBackground: any = {};
		if (print) {
			//Xoa mau noi dung [contenteditable=true]
			let el_view = document.querySelector("#viewTemplate");
			contentEditableElements = el_view.querySelectorAll('[contenteditable = "true"]');
			contentEditableElements.forEach(element => {
				editableElementOldBackground[element.id] = element['style'].backgroundColor
				element['style'].backgroundColor = '#ffffff';
			})

			notPrintIfEmptyElements = el_view.querySelectorAll('[notPrintIfEmpty]');
			notPrintIfEmptyElements.forEach(element => {
				notPrintElementOldBackground[element.id] = element['style'].backgroundColor
				element['style'].backgroundColor = '#ffffff';
			})
		}

		let divContents = document.getElementById(targetElementId).innerHTML;
		this.exportService.preview(divContents).toPromise().then((resp: any) => {
			if (resp.code == 0) {
				let a = window.open('', '', 'height=600, width=1000');
				a.document.write('<html>');
				a.document.write('<head>');
				a.document.write(`<title>${title}</title>`);
				a.document.write('<style>');
				a.document.write('@media print{color: $primary;}')
				a.document.write('@page{margin-left: 1cm;margin-right: 1cm;margin-top: 1.5cm;margin-bottom: 1.5cm;}');
				a.document.write('</style>');
				a.document.write('</head>');
				a.document.write('<body>');
				a.document.write('<div>');
				let pattern = new RegExp('contenteditable="true"', 'g');
				let content = resp.value.replace(pattern, 'contenteditable="false"');
				a.document.write(content);
				a.document.write('</div>');
				a.document.write('</body></html>');
				a.document.close();
				contentEditableElements.forEach(element => {
					element['style'].backgroundColor = editableElementOldBackground[element.id];
				})
				notPrintIfEmptyElements.forEach(element => {
					element['style'].backgroundColor = notPrintElementOldBackground[element.id];
				})
				this.addCompletedRequest();
			}
		})
	}

	exportWord(targetElementId: string = 'viewTemplate',
		options: any = { hasHeader: 0, hasQrCode: 0, docTemplateId: null, docDetailId: null, docNeedListId: null, sender: null }, successCb: () => void = null) {

		let contentEditableElements;
		let editableElementOldBackground: any = {};
		let el_view = document.querySelector("#viewTemplate");
		contentEditableElements = el_view.querySelectorAll('[contenteditable]');
		contentEditableElements.forEach(element => {
			editableElementOldBackground[element.id] = element['style'].backgroundColor
			element['style'].backgroundColor = 'rgba(255, 255, 255, .1)';
		})

		let divContents = document.getElementById(targetElementId).innerHTML;

		this.addTotalRequest();
		this.exportService.exportDocx(divContents,
			options.hasHeader,
			options.hasQrCode,
			options.docDetailId,
			options.docTemplateId,
			options.docNeedListId,
			options.sender).toPromise().then(resp => {
				this.saveFileAs(resp);

				if (successCb) {
					successCb();
				}
			}).finally(() => {
				contentEditableElements.forEach(element => {
					element['style'].backgroundColor = editableElementOldBackground[element.id];
				})
				this.addCompletedRequest();
			})
	}

	saveFileAs(response) {
		// console.log(response.headers);
		var contentDisposition = response.headers.get("Content-Disposition");
		//Retrieve file name from content-disposition
		let fileName: string = 'export.pdf'
		if (contentDisposition) {
			fileName = contentDisposition.substr(contentDisposition.indexOf("filename=") + 9);
			fileName = fileName.replace(/\"/g, "");
		}
		var contentType = response.headers.get("content-type");
		var blob = new Blob([response.body], { type: contentType });
		saveAs(blob, fileName);
	}

	async showDoc(elementId: string, fileName: string, fileType: string, fileUrl: string): Promise<void> {
		try {
			let categoryDataLst: any[] = await this.categoryService.getCategoryDataByCategoryCode("onlyoffice").toPromise();

			let apiUrl: string = undefined;
			let documentServerUrl: string = undefined;
			categoryDataLst.forEach(categoryData => {
				switch (categoryData.code) {
					case 'documentJsApiUrl':
						apiUrl = categoryData.value;
						break;
					case 'documentServerUrl':
						documentServerUrl = categoryData.value;
						break;
				}
			})

			if (!apiUrl || !documentServerUrl) return;

			JsScriptLoad(apiUrl, () => {
				let fileTypeRegex: RegExp = /\.([\w]+)$/g;
				let fileType = this.getFileExtension(fileName);
				let iframeHeight: number = window.innerHeight - 200;
				iframeHeight = iframeHeight < 600 ? 600 : iframeHeight;
				new DocsAPI.DocEditor(elementId,
					{
						"document": {
							"fileType": fileType,
							"permissions": { "download": false, "print": true, "edit": false, },
							"title": fileName,
							"url": `${documentServerUrl}/${fileUrl}`
						},
						"height": iframeHeight.toString(), "width": "100%",
						"compactToolbar": true
					}
				);
			});
		} catch (ex) {
			console.error(ex);
		}
	}

	getFileExtension(fileName: string) {
		let fileTypeRegex: RegExp = /\.([\w]+)$/g;
		let match = fileTypeRegex.exec(fileName);
		let fileType: string = 'unknown'
		if (match.length >= 2) {
			fileType = match[1];
		}
		return fileType;
	}

	sayswho() {
		var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
		if (/trident/i.test(M[1])) {
			tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
			return 'IE ' + (tem[1] || '');
		}
		if (M[1] === 'Chrome') {
			tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
			if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
		}
		M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
		if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
		return M.join(' ');
	};

	checkBrowserVer() {
		let browserVer: string = this.sayswho();
		console.log(browserVer);
		let regExp: RegExp = new RegExp('^([\\w]+) (\\d+)$', 'g');
		let rs = regExp.exec(browserVer);
		this.showSpinner(true);
		if (rs.length === 3) {
			let browser: string = rs[1].toLowerCase();
			let version: number = parseFloat(rs[2]);
			if (!this.browserVersionRequire) {
				this.confService.getBrowserVersionRequire().toPromise().then(resp => {
					this.browserVersionRequire = resp;
					if (this.browserVersionRequire && this.browserVersionRequire[browser] > version) {
						alert(`Bạn đang sử dụng trình duyệt ${browserVer}. Vui lòng nâng cấp lên phiên bản >= ${this.browserVersionRequire[browser]} để tiếp tục sử dụng.`);
						return;
					}
				}).finally(() => {
					this.showSpinner(false);
				});
			} else {
				if (this.browserVersionRequire[browser] > version) {
					alert(`Bạn đang sử dụng trình duyệt ${browserVer}. Vui lòng nâng cấp lên phiên bản >= ${this.browserVersionRequire[browser]} để tiếp tục sử dụng.`);
					return;
				} else {
					this.showSpinner(false);
				}
			}
		} else {
			alert(`Trình duyệt không được hỗ trợ, xin vui lòng chuyển sang Chrome hoặc Firefox`);
			return;
		}
	}

	//fill data vao bieu mau
	setContent({ variable, keyPath, contentEditableElements, hiddenAttrElements = null, locale = 'vi-VN', element }) {
		var arrayConstructor = [].constructor;
		var objectConstructor = ({}).constructor;
		
		let eolPattern = new RegExp('\\n', 'g');
		let spacePattern = new RegExp('[ ]+$', 'g');

		Object.keys(variable).forEach(key => {
			if (variable[key] === null) return;
			let _keyPath = keyPath === "" ? key : keyPath + "." + key
			if (!variable[key]) return;
			let valContructor = variable[key].constructor;
			if (valContructor === objectConstructor) {
				// console.log(_keyPath);
				this.setContent({
					variable: variable[key],
					keyPath: _keyPath,
					contentEditableElements: contentEditableElements,
					hiddenAttrElements: hiddenAttrElements,
					locale: locale,
					element: element
				});
			} else if (valContructor === arrayConstructor) {
				// console.log(_keyPath);
				let id = `${_keyPath.split(".").join("\\.")}`
				id = `${id.split("[").join("\\[")}`
				id = `${id.split("]").join("\\]")}`
				let arrEle: any;
				if (element) {
					arrEle = element.querySelector(`#${id}`);
				} else {
					arrEle = document.querySelector(`#${id}`);
				}
				let orgInnerHtml: string = arrEle?.innerHTML;

				variable[key].forEach((item: any, index: number) => {
					let __keyPath = `${_keyPath}[${index}]`;
					if (arrEle && index > 0) {
						let newInnerHtml: string;
						let pattern = new RegExp(_keyPath + '\\[\\d+\\]', 'g');
						newInnerHtml = orgInnerHtml.replace(pattern, `${_keyPath}[${index}]`);
						arrEle.innerHTML += newInnerHtml
						this.setContent({
							variable: variable[key][index],
							keyPath: __keyPath,
							contentEditableElements: arrEle.parentElement.querySelectorAll('[contenteditable]'),
							hiddenAttrElements: hiddenAttrElements,
							locale: locale,
							element: element
						});
					} else {
						this.setContent({
							variable: variable[key][index],
							keyPath: __keyPath,
							contentEditableElements: contentEditableElements,
							hiddenAttrElements: hiddenAttrElements,
							locale: locale,
							element: element
						});
					}
				});
			} else {
				contentEditableElements.forEach(el => {
					try {
						if (el.id === _keyPath) {
							// console.log(key);
							let val: any;

							if (key.startsWith('i_')) {
								val = parseInt(variable[key]);
								if (!val) {
									val = variable[key];
								} else {
									val = val.toLocaleString(locale);
								}
								el.innerHTML = val;
							} else if (key.startsWith('f_')) {
								val = parseFloat(variable[key]);
								if (!val) {
									val = variable[key];
								} else {
									val = val.toLocaleString(locale);
								}
								el.innerHTML = val;
							} else if (key.startsWith('s_')) {
								let val = variable[key];
								val = val.replace(eolPattern, "<br>");
								el.innerHTML = val;
							} else {
								switch (valContructor.name) {
									case 'Number':
										el.innerHTML = variable[key].toLocaleString(locale);
										break;
									default:
										let content = variable[key];
										content = content.replace(eolPattern, "<br>");
										content = content.replace(spacePattern, "&nbsp;");
										// console.log(`[${el.innerHTML}] ? [${content}]`);
										el.innerHTML = content;
										break;
								}
							}
						}
					} catch (ex) {
						console.error(ex);
					}
				});
			}
		});
	}

	//get data tu bieu mau
	getContent({ variable,
		keyPath = "",
		contentEditableElements,
		locale = 'vi-VN',
		element }) {
		var arrayConstructor = [].constructor;
		var objectConstructor = ({}).constructor;

		let brPattern = new RegExp('<br>', 'g');

		Object.keys(variable).forEach(key => {
			let _keyPath = keyPath === "" ? key : keyPath + "." + key

			if (variable[key] === null) {
				contentEditableElements.forEach((el: any) => {
					if (el.id === _keyPath) {
						variable[key] = el.innerHTML;
					}
				});
				return;
			}

			let valContructor = variable[key]?.constructor;
			if (valContructor === objectConstructor) {
				this.getContent({
					variable: variable[key],
					keyPath: _keyPath,
					contentEditableElements: contentEditableElements,
					locale: locale,
					element: element
				});
			} else if (valContructor === arrayConstructor) {
				let id = `${_keyPath.split(".").join("\\.")}`
				id = `${id.split("[").join("\\[")}`
				id = `${id.split("]").join("\\]")}`
				let arrEle: any;
				if (element) {
					arrEle = element.querySelector(`#${id}`);
				} else {
					arrEle = document.querySelector(`#${id}`);
				}

				variable[key].forEach((item: any, index: number) => {
					let __keyPath = `${_keyPath}[${index}]`;

					if (arrEle && index > 0) {
						this.getContent({
							variable: variable[key][index],
							keyPath: __keyPath,
							contentEditableElements: arrEle.parentElement.querySelectorAll('[contenteditable = "true"]'),
							locale: locale,
							element: element
						});
					} else {
						this.getContent({
							variable: variable[key][index],
							keyPath: __keyPath,
							contentEditableElements: contentEditableElements,
							locale: locale,
							element: element
						});
					}
				});
			} else {
				contentEditableElements.forEach(el => {
					if (el.id === _keyPath) {
						switch (valContructor.name) {
							case 'Number':
								let value: string;
								if (locale === 'vi-VN') {
									value = el['innerText'].replace(/\./g, '');	//vi-VN;
									value = value.replace(/\,/g, '.'); //convert to en-US
								}
								variable[key] = Number.parseFloat(value);
								break;
							default:
								variable[key] = el['innerText']
								// variable[key] = variable[key].replace(/\.{3,}/g, '').trim();
								variable[key] = variable[key].replace(brPattern, "\\n")
								break;

						}
					}
				});
			}
		});
	}

	//get data tu bieu mau
	getContentV2({ variable,
		keyPath = "",
		contentEditableElements,
		locale = 'vi-VN',
		element }) {
		var arrayConstructor = [].constructor;
		var objectConstructor = ({}).constructor;

		contentEditableElements = Array.from(contentEditableElements);
		contentEditableElements.sort((a: any, b: any) => {
			if (a.id < b.id) {
				return -1;
			}
			if (a.id > b.id) {
				return 1;
			}
			return 0;
		});
		contentEditableElements.forEach((element: any) => {
			if (element.id) {
				let path: string[] = element.id.split('.').map(item => item.trim());
				this.setValueByPath(variable, path, element.innerText);
			}
		});
	}

	getValueByPath(obj: any, path: string[], value: any) {
		let arrayKeyRegex: RegExp = new RegExp(/(\w+)\[(\d+)\]/g)
		var result = obj, i;
		for (i = 0; i < path.length; i++) {
			try {
				let rs = arrayKeyRegex.exec(path[i]);
				if (rs) {
					result = result[rs[1]][rs[2]];
				} else {
					result = result[path[i]];
				}
			}
			catch (e) {
				return undefined;
			}
		}
		return result
	}

	setValueByPath(obj: any, path: string[], value: any) {
		let result = obj, i;
		for (i = 0; i < path.length - 1; i++) {
			try {
				let _path = path[i];
				let arrayKeyRegex: RegExp = new RegExp(/(\w+)\[(\d+)\]/g)
				let rs = arrayKeyRegex.exec(_path);
				if (rs) {
					if (!result[rs[1]]) {
						result[rs[1]] = [];
					}
					if (!result[rs[1]][rs[2]]) {
						result[rs[1]][rs[2]] = {};
					}
					result = result[rs[1]][rs[2]];
				} else {
					result[_path] = result[_path] ? result[_path] : {}
					result = result[_path];
				}
			}
			catch (e) {
				console.log(e);
				return;
			}
		}

		let key: string = path[i];
		if (key.startsWith('i_') || key.startsWith('f_')) {
			value = value.replace(/\./g, '');	//vi-VN;
			value = value.replace(/\,/g, '.');	//convert to en-US
			value = parseFloat(value);
			result[path[i]] = value;
		} else if (key.startsWith('s_')) {
			value = this.modifyString(value)
			result[path[i]] = value;
		} else {
			let valContructor = result[path[i]]?.constructor;
			if (!valContructor) {
				result[path[i]]
			}
			switch (valContructor?.name) {
				case 'Number':
					value = value.replace(/\./g, '');	//vi-VN;
					value = value.replace(/\,/g, '.');	//convert to en-US
					result[path[i]] = Number.parseFloat(value);
					break;
				default:
					value = this.modifyString(value)
					result[path[i]] = value;
					break;
			}
		}
	}

	modifyString(value: string): string {
		let _value: string = value

		//Nếu nội dung kết thúc bằng >=3 dấu xuống dòng thì không xóa <br>
		if (!_value.endsWith('\n\n\n')) {
			_value = _value.replace(new RegExp('[\n]+$', 'g'), '');
		}

		if (_value === '') _value = ' ';

		return _value
	}

	getTreeView(items: any[]) {
		let treeView: TreeNode[] = [];
		items.forEach((item: any) => {
			let label: string;
			if (item.no) {
				label = `${item.no}. ${item.name}`;
			} else {
				label = item.name;
			}

			let _paths = item.path?.split("/");
			_paths = _paths ? _paths : [];
			let _branch: TreeNode;
			let i: number;
			if (_paths.length === 0) {
				_branch = { label: label, icon: "pi pi-file-o", data: item, children: [] };
				treeView.push(_branch);
			} else {
				for (i = 0; i < _paths.length; i++) {
					_branch = this.getTreeBranch(treeView, _branch, _paths[i])
				}
				if (_branch.label === item.code) {
					_branch.label = label;
					_branch.icon = "pi pi-file-o";
					_branch.data = item;
					_branch?.parent?.children?.sort((a: any, b: any) => {
						if (a.label < b.label) {
							return -1;
						}
						if (a.label > b.label) {
							return 1;
						}
						return 0;
					})
				} else {
					_branch.children.push({ label: item.name, icon: "pi pi-file-o", data: item });
				}
			}

			treeView.sort((a: any, b: any) => {
				if (a.label < b.label) {
					return -1;
				}
				if (a.label > b.label) {
					return 1;
				}
				return 0;
			})
		})
		return treeView
	}

	getTreeBranch(root: TreeNode[], parent: TreeNode, branchName: string) {
		let childrens = parent ? parent.children : root;
		childrens = childrens ? childrens : [];

		let _branch: TreeNode = childrens.find((treeNode: TreeNode) => {
			if (treeNode.data) {
				return treeNode.data.code === branchName;
			}
			return treeNode.label === branchName;
		})
		if (!_branch) {
			_branch = {
				label: branchName,
				expandedIcon: 'pi pi-folder-open',
				collapsedIcon: 'pi pi-folder',
				children: []
			}
			childrens.push(_branch)
			childrens.sort((a: any, b: any) => {
				if (a.label < b.label) {
					return -1;
				}
				if (a.label > b.label) {
					return 1;
				}
				return 0;
			})
		}
		return _branch
	}

	setFieldValidator(fieldItems: any[], { requiredFieldsWhenCreate = null, requiredFieldsWhenUpdate = null, readonlyFieldsWhenUpdate = null, action = 'detail' }) {
		let _fieldItems = Object.assign([], fieldItems);
		_fieldItems.forEach((fieldItem: any) => {
			fieldItem.required = false;
			fieldItem.readonly = false;
			switch (action) {
				case 'create':
					if (requiredFieldsWhenCreate?.includes(fieldItem.code)) {
						fieldItem.required = true;
					} else {
						fieldItem.required = false;
					}
					break;
				case 'update':
					if (readonlyFieldsWhenUpdate?.includes(fieldItem.code)) {
						fieldItem.readonly = true;
					} else {
						fieldItem.readonly = false;
					}
					if (requiredFieldsWhenUpdate?.includes(fieldItem.code)) {
						fieldItem.required = true;
					} else {
						fieldItem.required = false;
					}
					break;
				default:
					fieldItem.required = false;
					fieldItem.readonly = true;
					break;
			}
		})
		return _fieldItems;
	}

	convertToNumber(value: any, locale: string = 'vi-VN') {
		value = value ? value.toString() : "0";
		if (locale === 'vi-VN') {
			value = value.replace(/\./g, '');	//vi-VN;
			value = value.replace(/\,/g, '.'); //convert to en-US
		}
		try {
			let num = Number.parseFloat(value);
			return num
		} catch (ex) {
			console.log(ex)
			return value
		}
	}

	syntaxHighlight(json: any) {
		if (typeof json != 'string') {
			json = JSON.stringify(json, undefined, 2);
		}
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
			var cls = 'number';
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = 'key';
				} else {
					cls = 'string';
				}
			} else if (/true|false/.test(match)) {
				cls = 'boolean';
			} else if (/null/.test(match)) {
				cls = 'null';
			}
			return '<span class="' + cls + '">' + match + '</span>';
		});
	}

	/**
   * Set trạng thái cho fieldItem
   * @param item
   * @param fieldItem
   * @param attrValue
   * @param defaultAttrValue
   * @param refFieldItemCode
   * @param values
   * @param options
   */
	setFieldAttrWhenOtherFieldValueIn(item: any,
		fieldItem: any,
		attrValue: any = {
			readonly: false,
			required: true,
		},
		defaultAttrValue: any = {
			readonly: true,
			required: false,
		},
		refFieldItemCode: any,
		values: any[],
		options: any = { clearData: true }) {
		Object.keys(attrValue).forEach((key: string) => {
			fieldItem[key] = defaultAttrValue[key];
		});
		if (Array.isArray(item[refFieldItemCode])) {
			let code = item[refFieldItemCode].find((_item: any) => {
				return values.includes(_item)
			});
			if (code) {
				Object.keys(attrValue).forEach((key: string) => {
					fieldItem[key] = attrValue[key];
				});
			} else {
				if (options.clearData) {
					item[fieldItem.code] = null;
				}
			}
		} else {
			if (values.includes(item[refFieldItemCode])) {
				Object.keys(attrValue).forEach((key: string) => {
					fieldItem[key] = attrValue[key];
				});
			} else {
				if (options.clearData) {
					item[fieldItem.code] = null;
				}
			}
		}
	}

	base64StringToFile(fileData: string, fileName: string, mimeType: string) {
		let bstr = atob(fileData);
		let n = bstr.length;
		let u8arr = new Uint8Array(n);

		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}

		var blob = new Blob([u8arr], { type: mimeType });
		saveAs(blob, fileName);
	}

	updateMenuVisible(availableFunctionCodes: any[], menus: any[]) {
		menus.forEach((menu: any) => {
			if (menu.code) {
				menu.visible = availableFunctionCodes.includes(menu.code);
			}
			if (menu.items && menu.items.length > 0) {
				this.updateMenuVisible(availableFunctionCodes, menu.items);
			}
		})
	}

	idleTime: number;
	idleMonitoringInitedFlag: boolean = false;
	idleMonitoringInterval: any;
	idleCbs: any = {};
	lastimeActive: any;
	registerIdleCallback(cbName: string, idleCb: (idleTime: any) => void) {
		if (!this.idleMonitoringInitedFlag) {
			this.idleMonitoringInitedFlag = true;

			let body = document.querySelector("#body")
			this.lastimeActive = new Date();
			body.addEventListener('mousemove', e => {
				this.lastimeActive = new Date();
			});
		}

		this.idleCbs[cbName] = idleCb;

		if (!this.idleMonitoringInterval) {
			this.idleMonitoringInterval = setInterval(() => {
				this.idleTime = new Date().getTime() - this.lastimeActive.getTime();

				Object.keys(this.idleCbs).forEach((key) => {
					if (this.idleCbs[key]) {
						this.idleCbs[key](this.idleTime);
					}
				})
			}, 1000);
		}
	}
	unregisterIdleCallback(cbName: string) {
		this.idleCbs[cbName] = undefined;
	}
	clearIdleTime() {
		this.lastimeActive = new Date();
	}
}
