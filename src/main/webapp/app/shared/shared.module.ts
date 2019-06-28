import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PmssqlSharedCommonModule, JhiLoginModalComponent, HasAnyAuthorityDirective } from './';

@NgModule({
  imports: [PmssqlSharedCommonModule],
  declarations: [JhiLoginModalComponent, HasAnyAuthorityDirective],
  entryComponents: [JhiLoginModalComponent],
  exports: [PmssqlSharedCommonModule, JhiLoginModalComponent, HasAnyAuthorityDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PmssqlSharedModule {
  static forRoot() {
    return {
      ngModule: PmssqlSharedModule
    };
  }
}
