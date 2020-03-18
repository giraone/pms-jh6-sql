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
  currentAccountIsAdmin = false;
  currentCompanies: ICompany[];
  currentCompany: ICompany | null = null;
  eventSubscriber: Subscription | null = null;
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

    this.inputSubject.pipe(debounceTime(200), distinctUntilChanged()).subscribe(() => {
      this.search();
    });
  }

  load(): void {
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
        const xTimer: string | null = res.headers.get('X-Timer');
        const timer = parseInt(xTimer != null ? xTimer : '10', 10);
        if (!isNaN(timer)) {
          if (this.lastTimer > timer) {
            // Skip older request
            return;
          }
          this.lastTimer = timer;
        }
        if (res.body) {
          this.paginateEmployees(res.body, res.headers);
        }
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

  filterChanged(): void {
    this.inputSubject.next(this.input);
  }

  reset(): void {
    this.page = 0;
    this.employees = [];
  }

  search(): boolean {
    this.reset();
    this.load();
    return false;
  }

  loadPage(page: number): void {
    this.page = page;
    this.load();
  }

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
      this.currentAccountIsAdmin = this.accountService.hasAnyAuthority(['ROLE_ADMIN']);
    });
    this.employeeService.findCompanies().subscribe(
      (res: HttpResponse<ICompany[]>) => {
        this.currentCompanies = res.body ? res.body : [];
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

  ngOnDestroy(): void {
    if (this.eventSubscriber) {
      this.eventManager.destroy(this.eventSubscriber);
    }
  }

  trackId(index: number, item: IEmployee): number | undefined {
    return item.id;
  }

  registerChangeInEmployees(): void {
    this.eventSubscriber = this.eventManager.subscribe('employeeListModification', () => this.reset());
  }

  sort(): string[] {
    const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  isAdmin(): boolean {
    return this.currentAccountIsAdmin;
  }

  protected paginateEmployees(data: IEmployee[], headers: HttpHeaders): void {
    const linkHeader: string | null = headers.get('link');
    if (linkHeader) {
      this.links = this.parseLinks.parse(linkHeader);
    }

    this.totalItems = Number(headers.get('X-Total-Count'));
    if (this.page === 0) {
      this.employees.length = 0;
    }
    for (let i = 0; i < data.length; i++) {
      this.employees.push(data[i]);
    }
  }

  protected onError(errorMessage: string, params?: any): void {
    this.jhiAlertService.error(errorMessage, params);
  }

  protected getExternalCompanyId(): string {
    if (this.currentCompany == null || this.currentCompany.externalId == null) {
      return 'NO-COMPANY';
    }
    return this.currentCompany.externalId;
  }
}
