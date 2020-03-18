import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { ICompany, Company } from 'app/shared/model/company.model';
import { CompanyService } from './company.service';
import { IUser } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';

@Component({
  selector: 'jhi-company-update',
  templateUrl: './company-update.component.html'
})
export class CompanyUpdateComponent implements OnInit {
  isSaving = false;
  users: IUser[] = [];

  editForm = this.fb.group({
    id: [],
    externalId: [null, [Validators.required]],
    name: [],
    postalCode: [],
    city: [],
    streetAddress: [],
    users: []
  });

  constructor(
    protected companyService: CompanyService,
    protected userService: UserService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ company }) => {
      this.updateForm(company);

      this.userService.query().subscribe((res: HttpResponse<IUser[]>) => (this.users = res.body || []));
    });
  }

  updateForm(company: ICompany): void {
    this.editForm.patchValue({
      id: company.id,
      externalId: company.externalId,
      name: company.name,
      postalCode: company.postalCode,
      city: company.city,
      streetAddress: company.streetAddress,
      users: company.users
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const company = this.createFromForm();
    if (company.id !== undefined) {
      this.subscribeToSaveResponse(this.companyService.update(company));
    } else {
      this.subscribeToSaveResponse(this.companyService.create(company));
    }
  }

  private createFromForm(): ICompany {
    return {
      ...new Company(),
      id: this.editForm.get(['id'])!.value,
      externalId: this.editForm.get(['externalId'])!.value,
      name: this.editForm.get(['name'])!.value,
      postalCode: this.editForm.get(['postalCode'])!.value,
      city: this.editForm.get(['city'])!.value,
      streetAddress: this.editForm.get(['streetAddress'])!.value,
      users: this.editForm.get(['users'])!.value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ICompany>>): void {
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

  trackById(index: number, item: IUser): any {
    return item.id;
  }

  getSelected(selectedVals: IUser[], option: IUser): IUser {
    if (selectedVals) {
      for (let i = 0; i < selectedVals.length; i++) {
        if (option.id === selectedVals[i].id) {
          return selectedVals[i];
        }
      }
    }
    return option;
  }
}
