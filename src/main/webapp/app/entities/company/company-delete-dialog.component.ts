import { Component } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { ICompany } from 'app/shared/model/company.model';
import { CompanyService } from './company.service';

@Component({
  templateUrl: './company-delete-dialog.component.html'
})
export class CompanyDeleteDialogComponent {
  company: ICompany;

  constructor(protected companyService: CompanyService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

  clear() {
    this.activeModal.dismiss('cancel');
  }

  confirmDelete(id: number) {
    this.companyService.delete(id).subscribe(() => {
      this.eventManager.broadcast({
        name: 'companyListModification',
        content: 'Deleted an company'
      });
      this.activeModal.dismiss(true);
    });
  }
}
