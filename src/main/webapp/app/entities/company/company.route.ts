import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes } from '@angular/router';
import { JhiResolvePagingParams } from 'ng-jhipster';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Company } from 'app/shared/model/company.model';
import { CompanyService } from './company.service';
import { CompanyComponent } from './company.component';
import { CompanyDetailComponent } from './company-detail.component';
import { CompanyUpdateComponent } from './company-update.component';
import { ICompany } from 'app/shared/model/company.model';

@Injectable({ providedIn: 'root' })
export class CompanyResolve implements Resolve<ICompany> {
  constructor(private service: CompanyService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ICompany> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(map((company: HttpResponse<Company>) => company.body));
    }
    return of(new Company());
  }
}

export const companyRoute: Routes = [
  {
    path: '',
    component: CompanyComponent,
    resolve: {
      pagingParams: JhiResolvePagingParams
    },
    data: {
      authorities: ['ROLE_USER'],
      defaultSort: 'id,asc',
      pageTitle: 'pmssqlApp.company.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/view',
    component: CompanyDetailComponent,
    resolve: {
      company: CompanyResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'pmssqlApp.company.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: 'new',
    component: CompanyUpdateComponent,
    resolve: {
      company: CompanyResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'pmssqlApp.company.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/edit',
    component: CompanyUpdateComponent,
    resolve: {
      company: CompanyResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'pmssqlApp.company.home.title'
    },
    canActivate: [UserRouteAccessService]
  }
];
