import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconRegistry, MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { MaterialModule } from './material.module';
import { LayoutModule } from '@angular/cdk/layout';

import { NgChartsModule } from 'ng2-charts';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';

import { FullCalendarModule } from '@fullcalendar/angular';

import { AuthGuard } from './services/auth.guard';
import { AuthService } from './services/auth.service';
import { IdbService } from './services/idb.service';
import { ConnectionService } from './services/connection.service';

import { AppComponent } from './components/app/app.component';
import { GridComponent } from './components/shared/grid/grid.component';
import { ConfirmComponent } from './components/shared/confirm/confirm.component';
import { MainComponent } from './components/main/main.component';
import { ProductListComponent } from './components/product/product-list/product-list.component';
import { ConsumerListComponent } from './components/consumer/consumer-list/consumer-list.component';
import { ConsumerTypologyListComponent } from './components/consumer/consumer-typology-list/consumer-typology-list.component';
import { ServiceDetailsIntComponent } from './components/service-int/service-details-int/service-details-int.component';
import { ServiceTaskExtListComponent } from './components/service-ext/service-task-ext-list/service-task-ext-list.component';
import { ServiceOperationExtListComponent } from './components/service-ext/service-operation-ext-list/service-operation-ext-list.component';
import { ServiceExtraExtListComponent } from './components/service-ext/service-extra-ext-list/service-extra-ext-list.component';
import { ServiceOperationExtFormComponent } from './components/service-ext/service-operation-ext-form/service-operation-ext-form.component';
import { ServiceExtraTypologyExtListComponent } from './components/service-ext/service-extra-typology-ext-list/service-extra-typology-ext-list.component';
import { ServiceExtraExtFormComponent } from './components/service-ext/service-extra-ext-form/service-extra-ext-form.component';
import { JobListComponent } from './components/job/job-list/job-list.component';
import { JobDetailsListComponent } from './components/job/job-details-list/job-details-list.component';
import { JobDetailsActionListComponent } from './components/job/job-details-action-list/job-details-action-list.component';
import { ContactListComponent } from './components/contact/contact-list/contact-list.component';
import { SyncListComponent } from './components/sync/sync-list/sync-list.component';
import { ReportListComponent } from './components/report/report-list/report-list.component';
import { CalendarComponent } from './components/service-shared/calendar/calendar.component';
import { LoginComponent } from './components/login/login/login.component';
import { ServiceCalendarIntComponent } from './components/service-int/service-calendar-int/service-calendar-int.component';
import { ServiceCalendarExtComponent } from './components/service-ext/service-calendar-ext/service-calendar-ext.component';
import { CalendarServiceOperationEventComponent } from './components/service-shared/calendar-service-operation-event/calendar-service-operation-event.component';
import { CalendarServiceTaskEventComponent } from './components/service-shared/calendar-service-task-event/calendar-service-task-event.component';
import { CalendarServiceTripEventComponent } from './components/service-shared/calendar-service-trip-event/calendar-service-trip-event.component';
import { ReportReportComponent } from './components/report/report-report/report-report.component';
import { NotificationComponent } from './components/shared/notification/notification.component';
import { WelcomeComponent } from './components/welcome/welcome/welcome.component';
import { LogoutComponent } from './components/login/logout/logout.component';
import { OneChartComponent } from './components/welcome/one-chart/one-chart.component';
import { RefreshComponent } from './components/shared/refresh/refresh.component';
import { RedirectComponent } from './components/login/redirect/redirect.component';
import { CalendarServiceDayCellComponent } from './components/service-shared/calendar-service-day-cell/calendar-service-day-cell.component';
import { ServiceOperationIntListComponent } from './components/service-int/service-operation-int-list/service-operation-int-list.component';
import { ServiceOperationIntFormComponent } from './components/service-int/service-operation-int-form/service-operation-int-form.component';
import { ServiceExtraIntFormComponent } from './components/service-int/service-extra-int-form/service-extra-int-form.component';
import { ServiceExtraIntListComponent } from './components/service-int/service-extra-int-list/service-extra-int-list.component';
import { ServiceExtraTypologyIntListComponent } from './components/service-int/service-extra-typology-int-list/service-extra-typology-int-list.component';
import { ServiceOperationListComponent } from './components/service-shared/service-operation-list/service-operation-list.component';
import { ServiceExtraListComponent } from './components/service-shared/service-extra-list/service-extra-list.component';
import { ServiceTaskDetailsExtComponent } from './components/service-ext/service-task-details-ext/service-task-details-ext.component';
import { SignatureComponent } from './components/shared/signature/signature.component';
import { UserListComponent } from './components/user/user-list/user-list.component';
import { UserSignatureComponent } from './components/user/user-signature/user-signature.component';
import { ReportSignatureComponent } from './components/report/report-signature/report-signature.component';
import { ServiceTaskProductExtListComponent } from './components/service-ext/service-task-product-ext-list/service-task-product-ext-list.component';
import { ServiceTaskProductExtFormComponent } from './components/service-ext/service-task-product-ext-form/service-task-product-ext-form.component';
import { ProductFormComponent } from './components/product/product-form/product-form.component';
import { ContactFormComponent } from './components/contact/contact-form/contact-form.component';
import { ReportMailDetailsComponent } from './components/report/report-mail-details/report-mail-details.component';
import { ReportReportPublicComponent } from './components/report/report-report-public/report-report-public.component';
import { BaseComponent } from './components/shared/base/base.component';
import { DialogComponent } from './components/shared/dialog/dialog.component';
import { ServiceTripExtListComponent } from './components/service-ext/service-trip-ext-list/service-trip-ext-list.component';
import { ServiceTripExtFormComponent } from './components/service-ext/service-trip-ext-form/service-trip-ext-form.component';
import { FormFieldErrorComponent } from './components/shared/form-field-error/form-field-error.component';
import { FormFieldComponent } from './components/shared/form-field/form-field.component';
import { ChartDailyHoursComponent } from './components/welcome/chart-daily-hours/chart-daily-hours.component';
import { ChartReportStatusComponent } from './components/welcome/chart-report-status/chart-report-status.component';
import { ChartJobHoursComponent } from './components/welcome/chart-job-hours/chart-job-hours.component';
import { ChartMontlyHoursComponent } from './components/welcome/chart-montly-hours/chart-montly-hours.component';
import { CustomerListComponent } from './components/consumer/customer-list/customer-list.component';
import { DestinationListComponent } from './components/consumer/destination-list/destination-list.component';
import { DestinationFormComponent } from './components/consumer/destination-form/destination-form.component';
import { AboutComponent } from './components/shared/about/about.component';
import { MachineListComponent } from './components/machine/machine-list/machine-list.component';
import { CustomValidator } from './classes/custom-validator';
import { UserSelectFormComponent } from './components/user/user-select-form/user-select-form.component';
import { ServiceTaskReportMailExtListComponent } from './components/service-ext/service-task-report-mail-ext-list/service-task-report-mail-ext-list.component';
import { VerbalListComponent } from './components/report/verbal-list/verbal-list.component';
import { VerbalFormComponent } from './components/report/verbal-form/verbal-form.component';
import { VerbalCollaudoErgonReportComponent } from './components/report/verbal-collaudo-ergon-report/verbal-collaudo-ergon-report.component';
import { VerbalCollaudoErgonFormComponent } from './components/report/verbal-collaudo-ergon-form/verbal-collaudo-ergon-form.component';
import { VerbalMailListComponent } from './components/report/verbal-mail-list/verbal-mail-list.component';
import { VerbalMailDetailsComponent } from './components/report/verbal-mail-details/verbal-mail-details.component';
import { VerbalReportPublicComponent } from './components/report/verbal-report-public/verbal-report-public.component';
import { VerbalAddestramentoErgonReportComponent } from './components/report/verbal-addestramento-ergon-report/verbal-addestramento-ergon-report.component';
import { VerbalAddestramentoErgonFormComponent } from './components/report/verbal-addestramento-ergon-form/verbal-addestramento-ergon-form.component';
import { VerbalCollaudoDionisoReportComponent } from './components/report/verbal-collaudo-dioniso-report/verbal-collaudo-dioniso-report.component';
import { VerbalCollaudoKronosReportComponent } from './components/report/verbal-collaudo-kronos-report/verbal-collaudo-kronos-report.component';
import { VerbalCollaudoElettraReportComponent } from './components/report/verbal-collaudo-elettra-report/verbal-collaudo-elettra-report.component';
import { VerbalCollaudoMaiaReportComponent } from './components/report/verbal-collaudo-maia-report/verbal-collaudo-maia-report.component';
import { VerbalCollaudoAlcioneReportComponent } from './components/report/verbal-collaudo-alcione-report/verbal-collaudo-alcione-report.component';
import { VerbalAddestramentoDionisoReportComponent } from './components/report/verbal-addestramento-dioniso-report/verbal-addestramento-dioniso-report.component';
import { VerbalAddestramentoKronosReportComponent } from './components/report/verbal-addestramento-kronos-report/verbal-addestramento-kronos-report.component';
import { VerbalAddestramentoElettraReportComponent } from './components/report/verbal-addestramento-elettra-report/verbal-addestramento-elettra-report.component';
import { VerbalAddestramentoMaiaReportComponent } from './components/report/verbal-addestramento-maia-report/verbal-addestramento-maia-report.component';
import { VerbalAddestramentoAlcioneReportComponent } from './components/report/verbal-addestramento-alcione-report/verbal-addestramento-alcione-report.component';
import { VerbalCollaudoDionisoFormComponent } from './components/report/verbal-collaudo-dioniso-form/verbal-collaudo-dioniso-form.component';
import { VerbalCollaudoKronosFormComponent } from './components/report/verbal-collaudo-kronos-form/verbal-collaudo-kronos-form.component';
import { VerbalCollaudoElettraFormComponent } from './components/report/verbal-collaudo-elettra-form/verbal-collaudo-elettra-form.component';
import { VerbalCollaudoMaiaFormComponent } from './components/report/verbal-collaudo-maia-form/verbal-collaudo-maia-form.component';
import { VerbalCollaudoAlcioneFormComponent } from './components/report/verbal-collaudo-alcione-form/verbal-collaudo-alcione-form.component';
import { VerbalAddestramentoDionisoFormComponent } from './components/report/verbal-addestramento-dioniso-form/verbal-addestramento-dioniso-form.component';
import { VerbalAddestramentoKronosFormComponent } from './components/report/verbal-addestramento-kronos-form/verbal-addestramento-kronos-form.component';
import { VerbalAddestramentoElettraFormComponent } from './components/report/verbal-addestramento-elettra-form/verbal-addestramento-elettra-form.component';
import { VerbalAddestramentoMaiaFormComponent } from './components/report/verbal-addestramento-maia-form/verbal-addestramento-maia-form.component';
import { VerbalAddestramentoAlcioneFormComponent } from './components/report/verbal-addestramento-alcione-form/verbal-addestramento-alcione-form.component';
import { ServiceCalendarCallComponent } from './components/service-call/service-calendar-call/service-calendar-call.component';
import { ServiceCallFormComponent } from './components/service-call/service-call-form/service-call-form.component';
import { ServiceCallListComponent } from './components/service-call/service-call-list/service-call-list.component';
import { ServiceCallSelectFormComponent } from './components/service-call/service-call-select-form/service-call-select-form.component';
import { CalendarServiceCallEventComponent } from './components/service-shared/calendar-service-call-event/calendar-service-call-event.component';
import { ServiceCallMailFormComponent } from './components/service-call/service-call-mail-form/service-call-mail-form.component';
import { TruckListComponent } from './components/truck/truck-list/truck-list.component';
import { TruckStockListComponent } from './components/truck/truck-stock-list/truck-stock-list.component';
import { TruckFormComponent } from './components/truck/truck-form/truck-form.component';

@NgModule({ declarations: [
        GridComponent,
        AppComponent,
        MainComponent,
        ProductListComponent,
        ConsumerListComponent,
        ConsumerTypologyListComponent,
        ServiceTaskExtListComponent,
        ServiceOperationExtListComponent,
        ServiceExtraExtListComponent,
        ServiceOperationExtFormComponent,
        JobListComponent,
        JobDetailsListComponent,
        JobDetailsActionListComponent,
        ContactListComponent,
        SyncListComponent,
        ConfirmComponent,
        ReportListComponent,
        CalendarComponent,
        LoginComponent,
        ServiceCalendarIntComponent,
        ServiceCalendarExtComponent,
        CalendarServiceOperationEventComponent,
        ServiceExtraTypologyExtListComponent,
        CalendarServiceTaskEventComponent,
        ReportReportComponent,
        NotificationComponent,
        WelcomeComponent,
        LogoutComponent,
        OneChartComponent,
        RefreshComponent,
        RedirectComponent,
        ServiceDetailsIntComponent,
        ServiceExtraExtFormComponent,
        CalendarServiceDayCellComponent,
        ServiceOperationIntListComponent,
        ServiceOperationIntFormComponent,
        ServiceExtraIntFormComponent,
        ServiceExtraIntListComponent,
        ServiceExtraTypologyIntListComponent,
        ServiceOperationListComponent,
        ServiceExtraListComponent,
        ServiceTaskDetailsExtComponent,
        SignatureComponent,
        UserListComponent,
        UserSignatureComponent,
        ReportSignatureComponent,
        ServiceTaskProductExtListComponent,
        ServiceTaskProductExtFormComponent,
        ProductFormComponent,
        ContactFormComponent,
        ReportMailDetailsComponent,
        ReportReportPublicComponent,
        BaseComponent,
        DialogComponent,
        ServiceTripExtListComponent,
        ServiceTripExtFormComponent,
        FormFieldErrorComponent,
        FormFieldComponent,
        ChartDailyHoursComponent,
        ChartReportStatusComponent,
        ChartJobHoursComponent,
        ChartMontlyHoursComponent,
        CustomerListComponent,
        DestinationListComponent,
        DestinationFormComponent,
        AboutComponent,
        MachineListComponent,
        CalendarServiceTripEventComponent,
        UserSelectFormComponent,
        ServiceTaskReportMailExtListComponent,
        VerbalListComponent,
        VerbalFormComponent,
        VerbalCollaudoErgonReportComponent,
        VerbalCollaudoErgonFormComponent,
        VerbalMailListComponent,
        VerbalMailDetailsComponent,
        VerbalReportPublicComponent,
        VerbalAddestramentoErgonReportComponent,
        VerbalAddestramentoErgonFormComponent,
        VerbalCollaudoDionisoReportComponent,
        VerbalCollaudoKronosReportComponent,
        VerbalCollaudoElettraReportComponent,
        VerbalCollaudoMaiaReportComponent,
        VerbalCollaudoAlcioneReportComponent,
        VerbalAddestramentoDionisoReportComponent,
        VerbalAddestramentoKronosReportComponent,
        VerbalAddestramentoElettraReportComponent,
        VerbalAddestramentoMaiaReportComponent,
        VerbalAddestramentoAlcioneReportComponent,
        VerbalCollaudoDionisoFormComponent,
        VerbalCollaudoKronosFormComponent,
        VerbalCollaudoElettraFormComponent,
        VerbalCollaudoMaiaFormComponent,
        VerbalCollaudoAlcioneFormComponent,
        VerbalAddestramentoDionisoFormComponent,
        VerbalAddestramentoKronosFormComponent,
        VerbalAddestramentoElettraFormComponent,
        VerbalAddestramentoMaiaFormComponent,
        VerbalAddestramentoAlcioneFormComponent,
        ServiceCalendarCallComponent,
        ServiceCallFormComponent,
        ServiceCallListComponent,
        ServiceCallSelectFormComponent,
        CalendarServiceCallEventComponent,
        ServiceCallMailFormComponent,
        TruckListComponent,
        TruckStockListComponent,
        TruckFormComponent
    ],
    exports: [
        MaterialModule,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        ServiceWorkerModule.register("ngsw-worker.js", { enabled: environment.production }),
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        LayoutModule,
        MatIconModule,
        AngularSignaturePadModule,
        NgChartsModule,
        FullCalendarModule], providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: (idbService: IdbService) => () => idbService.connect(),
            deps: [IdbService],
            multi: true
        },
        {
            provide: APP_INITIALIZER,
            useFactory: (connectionService: ConnectionService) => () => { },
            deps: [ConnectionService],
            multi: true
        },
        {
            provide: LOCALE_ID,
            useValue: 'it'
        },
        AuthService,
        AuthGuard,
        provideHttpClient(withInterceptorsFromDi())
    ] })

export class AppModule {
  constructor() {
  }
}
