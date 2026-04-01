import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { USER_GROUP } from './services/auth.service';

import { AuthGuard } from './services/auth.guard';
import { RedirectComponent } from './components/login/redirect/redirect.component';
import { LoginComponent } from './components/login/login/login.component';
import { LogoutComponent } from './components/login/logout/logout.component';
import { RefreshComponent } from './components/shared/refresh/refresh.component';
import { WelcomeComponent } from './components/welcome/welcome/welcome.component';
import { ServiceTaskExtListComponent } from './components/service-ext/service-task-ext-list/service-task-ext-list.component';
import { ServiceOperationExtListComponent } from './components/service-ext/service-operation-ext-list/service-operation-ext-list.component';
import { ServiceExtraExtListComponent } from './components/service-ext/service-extra-ext-list/service-extra-ext-list.component';
import { ServiceExtraTypologyExtListComponent } from './components/service-ext/service-extra-typology-ext-list/service-extra-typology-ext-list.component';
import { ServiceOperationIntListComponent } from './components/service-int/service-operation-int-list/service-operation-int-list.component';
import { ServiceExtraIntListComponent } from './components/service-int/service-extra-int-list/service-extra-int-list.component';
import { ServiceExtraTypologyIntListComponent } from './components/service-int/service-extra-typology-int-list/service-extra-typology-int-list.component';
import { ReportListComponent } from './components/report/report-list/report-list.component';
import { VerbalListComponent } from './components/report/verbal-list/verbal-list.component';
import { ConsumerListComponent } from './components/consumer/consumer-list/consumer-list.component';
import { CustomerListComponent } from './components/consumer/customer-list/customer-list.component';
import { DestinationListComponent } from './components/consumer/destination-list/destination-list.component';
import { ConsumerTypologyListComponent } from './components/consumer/consumer-typology-list/consumer-typology-list.component';
import { JobListComponent } from './components/job/job-list/job-list.component';
import { JobDetailsListComponent } from './components/job/job-details-list/job-details-list.component';
import { JobDetailsActionListComponent } from './components/job/job-details-action-list/job-details-action-list.component';
import { ContactListComponent } from './components/contact/contact-list/contact-list.component';
import { MachineListComponent } from './components/machine/machine-list/machine-list.component';
import { ProductListComponent } from './components/product/product-list/product-list.component';
import { UserListComponent } from './components/user/user-list/user-list.component';
import { SyncListComponent } from './components/sync/sync-list/sync-list.component';
import { ServiceCalendarIntComponent } from './components/service-int/service-calendar-int/service-calendar-int.component';
import { ServiceCalendarExtComponent } from './components/service-ext/service-calendar-ext/service-calendar-ext.component';
import { ReportReportComponent } from './components/report/report-report/report-report.component';
import { ReportReportPublicComponent } from './components/report/report-report-public/report-report-public.component';
import { ServiceTripExtListComponent } from './components/service-ext/service-trip-ext-list/service-trip-ext-list.component';
import { ServiceTaskProductExtListComponent } from './components/service-ext/service-task-product-ext-list/service-task-product-ext-list.component';
import { VerbalReportPublicComponent } from './components/report/verbal-report-public/verbal-report-public.component';
import { ServiceCallListComponent } from './components/service-call/service-call-list/service-call-list.component';
import { ServiceCalendarCallComponent } from './components/service-call/service-calendar-call/service-calendar-call.component';
import { TruckStockListComponent } from './components/truck/truck-stock-list/truck-stock-list.component';

const routes: Routes = [
  { path: "", redirectTo: "/welcome", pathMatch: "full" },
  { path: "redirect", component: RedirectComponent, data: { title: "", hideMenu: true, hideToolbar: true, userGroupAuthList: null } },
  { path: "login", component: LoginComponent, data: { title: "Login", hideMenu: true, hideToolbar: true, userGroupAuthList: null } },
  { path: "logout", component: LogoutComponent, data: { title: "Logout", hideMenu: false, hideToolbar: false, userGroupAuthList: null } },
  { path: "refresh", component: RefreshComponent, data: { title: "", hideMenu: false, hideToolbar: false, userGroupAuthList: null } },
  //
  { path: "welcome", component: WelcomeComponent, data: { title: "Benvenuto", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  //
  { path: "service-calendar-int", component: ServiceCalendarIntComponent, data: { title: "Ore Interne", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "service-operation-int-list", component: ServiceOperationIntListComponent, data: { title: "Operazioni", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "service-extra-int-list", component: ServiceExtraIntListComponent, data: { title: "Spese", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "service-extra-typology-int-list", component: ServiceExtraTypologyIntListComponent, data: { title: "Extra", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  //
  { path: "service-calendar-ext", component: ServiceCalendarExtComponent, data: { title: "Interventi", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "service-calendar-ext-pc", component: ServiceCalendarExtComponent, data: { title: "Interventi", hideMenu: true, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "service-task-ext-list", component: ServiceTaskExtListComponent, data: { title: "Attività", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "service-operation-ext-list", component: ServiceOperationExtListComponent, data: { title: "Operazioni", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "service-trip-ext-list", component: ServiceTripExtListComponent, data: { title: "Viaggi", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "service-extra-ext-list", component: ServiceExtraExtListComponent, data: { title: "Spese", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "service-extra-typology-ext-list", component: ServiceExtraTypologyExtListComponent, data: { title: "Extra", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "service-task-product-ext-list", component: ServiceTaskProductExtListComponent, data: { title: "Prodotti", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  //
  { path: "service-calendar-call", component: ServiceCalendarCallComponent, data: { title: "Calendario", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "service-call-list", component: ServiceCallListComponent, data: { title: "Lista", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  //
  { path: "report-list", component: ReportListComponent, data: { title: "Report", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "report-report", component: ReportReportComponent, data: { title: "Report", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "report-report-public", component: ReportReportPublicComponent, data: { title: "Report", hideMenu: true, hideToolbar: true, userGroupAuthList: null, isPublic: true }, canActivate: [] },
  { path: "verbal-list", component: VerbalListComponent, data: { title: "Verbali", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "verbal-report-public", component: VerbalReportPublicComponent, data: { title: "Verbale", hideMenu: true, hideToolbar: true, userGroupAuthList: null, isPublic: true }, canActivate: [] },
  //
  { path: "consumer-list", component: ConsumerListComponent, data: { title: "Clienti", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "customer-list", component: CustomerListComponent, data: { title: "Clienti", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "destination-list", component: DestinationListComponent, data: { title: "Destinazioni", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "consumer-typology-list", component: ConsumerTypologyListComponent, data: { title: "Tipologie Cliente", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  //
  { path: "job-list", component: JobListComponent, data: { title: "Commesse", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "job-details-list", component: JobDetailsListComponent, data: { title: "Dettagli Commessa", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "job-details-action-list", component: JobDetailsActionListComponent, data: { title: "Azioni", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  //
  { path: "contact-list", component: ContactListComponent, data: { title: "Contatti", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "machine-list", component: MachineListComponent, data: { title: "Macchine", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "product-list", component: ProductListComponent, data: { title: "Prodotti", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  { path: "sync-list", component: SyncListComponent, data: { title: "Sync", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  //
  { path: "user-list", component: UserListComponent, data: { title: "Utenti", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
  //
  { path: "truck-stock-list", component: TruckStockListComponent, data: { title: "Giacenza Furgone", hideMenu: false, hideToolbar: false, userGroupAuthList: null }, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }]
})

export class AppRoutingModule { }
