import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes, Router } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Employee } from '../../shared/model/employee.model';
import { EmployeeService } from '../../entities/employee/employee.service';
import { EmployeeComponent } from './employee.component';
import { IEmployee } from '../../shared/model/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeResolve implements Resolve<IEmployee> {
  constructor(private service: EmployeeService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IEmployee> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((employee: HttpResponse<Employee>) => {
          if (employee.body) {
            return of(employee.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Employee());
  }
}

export const employeeRoute: Routes = [
  {
    path: 'employee-query',
    component: EmployeeComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'pmssqlApp.query.pageTitleMain'
    },
    canActivate: [UserRouteAccessService]
  }
];
