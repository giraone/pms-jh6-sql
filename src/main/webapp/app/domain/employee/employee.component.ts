import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription, Subject } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';

import { IEmployee } from '../../shared/model/employee.model';
import { ICompany } from '../../shared/model/company.model';
import { AccountService } from 'app/core/auth/account.service';
import { JhiLanguageService } from 'ng-jhipster';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { EmployeeService } from '../../entities/employee/employee.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'jhi-employee',
  templateUrl: './employee.component.html'
})
export class EmployeeComponent implements OnInit, OnDestroy {
  input: String;
  inputSubject: Subject<String> = new Subject();
  employees: IEmployee[];
  currentAccount: any;
  currentAccountIsAdmin: boolean;
  currentCompanies: ICompany[];
  currentCompany: ICompany;
  eventSubscriber: Subscription;
  itemsPerPage: number;
  links: any;
  page: any;
  predicate: any;
  queryCount: any;
  reverse: any;
  totalItems: number;
  languageKey: string;
  lastTimer: number;
  useTypeAhead: boolean;

  constructor(
    protected employeeService: EmployeeService,
    protected jhiAlertService: JhiAlertService,
    protected eventManager: JhiEventManager,
    protected parseLinks: JhiParseLinks,
    protected accountService: AccountService,
    private languageService: JhiLanguageService
  ) {
    this.input = '';
    this.employees = [];
    this.currentCompanies = [];
    this.currentCompany = null;
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0
    };
    this.predicate = 'id';
    this.reverse = true;
    this.totalItems = 0;

    this.languageKey = 'de';
    this.languageService.getCurrent().then(current => {
      this.languageKey = current;
    });
    this.lastTimer = 0;
    this.useTypeAhead = false;

    this.inputSubject
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.search();
      });
  }

  load() {
    const filterValue = this.input.trim();
    const params = {
      companyExternalId: this.getExternalCompanyId(),
      filter: filterValue,
      page: this.page,
      size: this.itemsPerPage,
      sort: this.sort()
    };
    this.employeeService.query(params).subscribe(
      (res: HttpResponse<IEmployee[]>) => {
        const timer = parseInt(res.headers.get('X-Timer'), 10);
        if (!isNaN(timer)) {
          if (this.lastTimer > timer) {
            // Skip older request
            return;
          }
          this.lastTimer = timer;
        }
        this.paginateEmployees(res.body, res.headers);
      },
      (res: HttpErrorResponse) => {
        if (res.status === 404) {
          this.onError('pmssqlApp.query.error.notFound');
        } else {
          this.onError('pmssqlApp.query.error.other', { statusText: res.statusText });
        }
      }
    );
  }

  filterChanged() {
    this.inputSubject.next(this.input);
  }

  reset() {
    this.page = 0;
    this.employees = [];
  }

  search() {
    this.reset();
    this.load();
    return false;
  }

  loadPage(page) {
    this.page = page;
    this.load();
  }

  ngOnInit() {
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
      this.currentAccountIsAdmin = this.accountService.hasAnyAuthority(['ROLE_ADMIN']);
    });
    this.employeeService.findCompanies().subscribe(
      (res: HttpResponse<ICompany[]>) => {
        this.currentCompanies = res.body;
        this.currentCompany = this.currentCompanies.length === 0 ? null : this.currentCompanies[0];
        this.load();
      },
      (res: HttpErrorResponse) => {
        if (res.message) {
          this.onError(res.message);
        } else {
          this.onError('pmssqlApp.query.error.other', { statusText: res.statusText });
        }
      }
    );

    this.registerChangeInEmployees();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  trackId(index: number, item: IEmployee) {
    return item.id;
  }

  registerChangeInEmployees() {
    this.eventSubscriber = this.eventManager.subscribe('employeeListModification', () => this.reset());
  }

  sort() {
    const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  isAdmin() {
    return this.currentAccountIsAdmin;
  }

  protected paginateEmployees(data: IEmployee[], headers: HttpHeaders) {
    this.links = this.parseLinks.parse(headers.get('link'));
    this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
    if (this.page === 0) {
      this.employees.length = 0;
    }
    for (let i = 0; i < data.length; i++) {
      this.employees.push(data[i]);
    }
  }

  protected onError(errorMessage: string, params?: any) {
    this.jhiAlertService.error(errorMessage, params, null);
  }

  protected getExternalCompanyId() {
    if (this.currentCompany == null) {
      return 'NO-COMPANY';
    }
    return this.currentCompany.externalId;
  }
}
