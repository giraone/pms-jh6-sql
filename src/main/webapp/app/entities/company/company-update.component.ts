import { Component, OnInit } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JhiAlertService } from 'ng-jhipster';
import { ICompany, Company } from 'app/shared/model/company.model';
import { CompanyService } from './company.service';
import { IUser, UserService } from 'app/core';

@Component({
  selector: 'jhi-company-update',
  templateUrl: './company-update.component.html'
})
export class CompanyUpdateComponent implements OnInit {
  isSaving: boolean;

  users: IUser[];

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
    protected jhiAlertService: JhiAlertService,
    protected companyService: CompanyService,
    protected userService: UserService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ company }) => {
      this.updateForm(company);
    });
    this.userService
      .query()
      .pipe(
        filter((mayBeOk: HttpResponse<IUser[]>) => mayBeOk.ok),
        map((response: HttpResponse<IUser[]>) => response.body)
      )
      .subscribe((res: IUser[]) => (this.users = res), (res: HttpErrorResponse) => this.onError(res.message));
  }

  updateForm(company: ICompany) {
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

  previousState() {
    window.history.back();
  }

  save() {
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
      id: this.editForm.get(['id']).value,
      externalId: this.editForm.get(['externalId']).value,
      name: this.editForm.get(['name']).value,
      postalCode: this.editForm.get(['postalCode']).value,
      city: this.editForm.get(['city']).value,
      streetAddress: this.editForm.get(['streetAddress']).value,
      users: this.editForm.get(['users']).value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ICompany>>) {
    result.subscribe(() => this.onSaveSuccess(), () => this.onSaveError());
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackUserById(index: number, item: IUser) {
    return item.id;
  }

  getSelected(selectedVals: Array<any>, option: any) {
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
