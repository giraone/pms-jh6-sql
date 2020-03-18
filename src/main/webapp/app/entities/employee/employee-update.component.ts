import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { IEmployee, Employee } from 'app/shared/model/employee.model';
import { EmployeeService } from './employee.service';
import { ICompany } from 'app/shared/model/company.model';
import { CompanyService } from 'app/entities/company/company.service';

@Component({
  selector: 'jhi-employee-update',
  templateUrl: './employee-update.component.html'
})
export class EmployeeUpdateComponent implements OnInit {
  isSaving = false;
  companies: ICompany[] = [];
  dateOfBirthDp: any;

  editForm = this.fb.group({
    id: [],
    surname: [null, [Validators.required]],
    givenName: [],
    dateOfBirth: [],
    gender: [],
    postalCode: [],
    city: [],
    streetAddress: [],
    companyId: [null, Validators.required]
  });

  constructor(
    protected employeeService: EmployeeService,
    protected companyService: CompanyService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ employee }) => {
      this.updateForm(employee);

      this.companyService.query().subscribe((res: HttpResponse<ICompany[]>) => (this.companies = res.body || []));
    });
  }

  updateForm(employee: IEmployee): void {
    this.editForm.patchValue({
      id: employee.id,
      surname: employee.surname,
      givenName: employee.givenName,
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender,
      postalCode: employee.postalCode,
      city: employee.city,
      streetAddress: employee.streetAddress,
      companyId: employee.companyId
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const employee = this.createFromForm();
    if (employee.id !== undefined) {
      this.subscribeToSaveResponse(this.employeeService.update(employee));
    } else {
      this.subscribeToSaveResponse(this.employeeService.create(employee));
    }
  }

  private createFromForm(): IEmployee {
    return {
      ...new Employee(),
      id: this.editForm.get(['id'])!.value,
      surname: this.editForm.get(['surname'])!.value,
      givenName: this.editForm.get(['givenName'])!.value,
      dateOfBirth: this.editForm.get(['dateOfBirth'])!.value,
      gender: this.editForm.get(['gender'])!.value,
      postalCode: this.editForm.get(['postalCode'])!.value,
      city: this.editForm.get(['city'])!.value,
      streetAddress: this.editForm.get(['streetAddress'])!.value,
      companyId: this.editForm.get(['companyId'])!.value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IEmployee>>): void {
    result.subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  trackById(index: number, item: ICompany): any {
    return item.id;
  }
}
