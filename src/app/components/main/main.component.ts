import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, from, BehaviorSubject, timer } from 'rxjs';
import { filter, map, mergeMap, shareReplay, startWith, switchMap, take } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationComponent } from '../shared/notification/notification.component';
import { MatSidenav } from '@angular/material/sidenav';

import { ConnectionService } from 'src/app/services/connection.service';
import { AuthService, USER_GROUP } from '../../services/auth.service';
import { UserSettingService } from 'src/app/services/user-setting.service';
import { SyncService } from 'src/app/services/sync.service';
import * as DB from 'src/app/idb/4service-pwa.idb';
import { environment } from 'src/environments/environment';
import { ManagerService } from 'src/app/services/manager.service';
import { AboutComponent } from '../shared/about/about.component';
import { UserSignatureComponent } from '../user/user-signature/user-signature.component';
import { TruckFormComponent } from '../truck/truck-form/truck-form.component';
import { DateService } from 'src/app/services/date.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger("openClose", [
      state("open", style({})),
      state("closed", style({
        height: 0,
        visibility: "hidden",
      })),
      transition("open => closed", [
        animate("0.2s")
      ]),
      transition("closed => open", [
        animate("0.2s")
      ]),
    ]),
  ],
  standalone: false
})

export class MainComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("MainComponent"); event.stopPropagation(); } }

  appIsProduction = null;
  appVersion = null;
  hideMenu: boolean = false;
  hideToolbar: boolean = false;
  isHandset: boolean;
  isHandset$!: Observable<boolean>;
  isPublic: boolean = false;
  deferredPrompt: any;
  showPwaPrompt = false;
  askedOnce = false;
  //
  dateYear: string = formatDate(new Date(), "yyyy", "en-EN");
  user!: DB.IDB_user;
  routerTitle: string = "";
  menuOpenedName = null;
  menuList = [];
  //
  isOnline$: BehaviorSubject<boolean> = null;
  syncLastUpdate = null;
  syncAutoEnabled = false;
  syncInProgress = false;
  lastUpdateWarning = true;
  //
  currentTruck: DB.IDB_truck = null;
  currentTruckDate: string | null = null;

  get truckDateWarning(): boolean {
    if (!this.currentTruckDate) return false;
    return (new Date().getTime() - new Date(this.currentTruckDate).getTime()) > 24 * 60 * 60 * 1000;
  }
  //
  @ViewChild('drawer') sidenav!: MatSidenav;

  constructor(
    private connectionService: ConnectionService,
    private authService: AuthService,
    private userSettingService: UserSettingService,
    private syncService: SyncService,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    public snackBar: MatSnackBar,
    public managerService: ManagerService,
    public dateService:DateService
  ) {
    this.appIsProduction = environment.production;
    this.appVersion = environment.app_version;
    this.isOnline$ = this.connectionService.isOnline$;
    this.user = this.authService.getUserLogged();
    //
    this.authService.userLogged$.subscribe(
      userLogged => {
        this.getMenuList().then(menuList => {
          this.menuList = menuList;
          //
          let menuParent = this.getMenuParent(this.router.url);
          if (menuParent) {
            this.toggleMenu(menuParent.code);
          }
        });
        //
        //check user signature
        if (userLogged && !userLogged.signature) {
          this.openSignatureForm(userLogged);
        }
      }
    );
    //
    this.initComponent();
    //
    this.authService.eventLoginContext = this;
    this.authService.eventLoginEmitter.subscribe(this.onLogin);
    //
    this.syncService.getLastUpdate().then((lastUpdate) => {
      this.syncLastUpdate = lastUpdate;
    });
    //
    this.userSettingService.get(this.user, "pwa_sync_auto_enabled").then((syncAutoEnabled) => {
      this.syncAutoEnabled = (syncAutoEnabled ?? "0") == "1";
      //
      if (this.syncAutoEnabled && !this.isPublic) {
        this.syncWithServer();
      }
    });
    //
    let id_truck_current = this.userSettingService.getLocalStorage("id_truck_current");
    //
    if (id_truck_current) {
      this.managerService.truck_getFromId(parseInt(id_truck_current)).then(truck => {
        this.currentTruck = truck ?? null;
        this.currentTruckDate = this.userSettingService.getLocalStorage("date_truck_current");
      });
    }
    //
    timer(0, environment.sync_auto_interval_ms).pipe(
      map(() => {
        if (this.syncAutoEnabled && !this.isPublic) {
          this.syncWithServer();
        }
      })
    ).subscribe();
  }


  onLogin(paraObj) {
    if (paraObj && paraObj.user) {
      paraObj["context"].user = paraObj.user;
    }
  }

  ngOnInit() {
    this.isHandset$ = this.breakpointObserver.observe(['(max-width: 960px)']).pipe(
      map(result => {
        this.isHandset = result.matches;
        return result.matches;
      }),
      shareReplay()
    );
  }

  openSignatureForm(user: DB.IDB_user) {
    let dialog = this.managerService.dialog_open(UserSignatureComponent, "Benvenuto! Crea la tua firma", true, true, { disableClose: true });
    let component = dialog.componentInstance.componentInnerInstance as UserSignatureComponent;
    //
    component._saveCallback = () => {
      dialog.close();
    };
    component.user = user;
    //
    dialog.afterClosed().subscribe(() => {
      //this.refresh();
    });
  }

  acceptPwaPrompt() {
    this.showPwaPrompt = false;
    this.askedOnce = true;
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        console.log("User dismissed the A2HS prompt");
      }
      this.deferredPrompt = null;
    });
  }

  initComponent() {
    //TODO - Chiamandolo qui, dentro nella funzione non trova this.deferredPrompt
    // this.acceptPwaPrompt();
    //
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route: any) => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter((route) => route.outlet === "primary"),
      mergeMap((route: any) => route.data)).subscribe(async (event) => {
        this.hideMenu = event["hideMenu"] ?? false;
        this.hideToolbar = event["hideToolbar"] ?? false;
        this.isPublic = event["isPublic"] ?? false;
        //
        this.titleService.setTitle(event["title"]);
        this.routerTitle = event["title"];
        //
        let menuParent = this.getMenuParent(this.router.url);
        if (menuParent) {
          this.toggleMenu(menuParent.code);
        }
      })
  }

  logo_Click() {
    this.navigateOrRefresh("/welcome");
  }

  toggleMenu(menuOpenedName) {
    this.menuOpenedName = menuOpenedName;
  }

  navigateOrRefresh(newUrl: string): void {
    let currentUrl = this.router.url;
    //
    if (currentUrl == newUrl) {
      this.router.navigateByUrl("/refresh", { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
    }
    else {
      this.router.navigate([newUrl]);
    }
  }

  getMenuParent(menuChildRoute: string) {
    if (menuChildRoute && menuChildRoute != "") {
      for (let menuParentK in this.menuList) {
        let menuParent = this.menuList[menuParentK];
        //
        if (menuParent.menuList && menuParent.menuList.length > 0) {
          for (let menuChildK in menuParent.menuList) {
            let menuChild = menuParent.menuList[menuChildK];
            //
            if (menuChild.route == menuChildRoute) {
              return menuParent;
            }
          }
        }
      }
    }
    //
    return null;
  }

  async syncWithServer() {
    let success = await this.syncService.syncWithServer([], []);
    //
    if (success) {
      this.syncLastUpdate = await this.syncService.getLastUpdate();
      this.lastUpdateWarning = false;
    } else {
      this.lastUpdateWarning = true;
    }
    //
    return success;
  }

  async manualSync_Click() {
    this.syncInProgress = true;
    let success = await this.syncWithServer();
    this.syncInProgress = false;
    //
    let id_truck_current = this.userSettingService.getLocalStorage("id_truck_current");
    //
    if (id_truck_current && success) {
      let newDate = this.dateService.date_getDateTime(new Date());
      this.userSettingService.setLocalStorage("date_truck_current", newDate);
      this.currentTruckDate = newDate;
    }
    else if (id_truck_current) {
      this.currentTruckDate = this.userSettingService.getLocalStorage("date_truck_current");
    }
    //
    let currentUrl = this.router.url;
    this.snackBar.openFromComponent(NotificationComponent, {
      duration: 3000,
      data: {
        text: success ? "Completato" : "Errore"
      },
    }).afterOpened().subscribe(() => {
      this.router.navigateByUrl("/refresh", { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
    });
  }

  async syncAutoEnabled_Change(event) {
    this.userSettingService.set(this.user, "pwa_sync_auto_enabled", event.checked ? "1" : "0");
    this.syncAutoEnabled = event.checked;
  }

  openTruckForm() {
    let dialog = this.managerService.dialog_open(TruckFormComponent, "Seleziona Furgone", true, true, { width: "40%", height: "300px" });
    let component = dialog.componentInstance.componentInnerInstance as TruckFormComponent;
    //
    component.currentTruck = this.currentTruck;
    //
    dialog.afterClosed().subscribe(() => {
      let id_truck_current = this.userSettingService.getLocalStorage("id_truck_current");
      //
      if (id_truck_current) {
        this.managerService.truck_getFromId(parseInt(id_truck_current)).then(truck => {
          this.currentTruck = truck ?? null;
          this.currentTruckDate = this.userSettingService.getLocalStorage("date_truck_current");
        });
      }
      else {
        this.currentTruck = null;
        this.currentTruckDate = null;
      }
    });
  }

  async openAbout() {
    let dialog = this.managerService.dialog_open(AboutComponent, "About", false, true, { width: "500px", height: "370px" });
    let component = dialog.componentInstance.componentInnerInstance as AboutComponent;
  }

  async getMenuList() {
    let menuList = [
      {
        code: "main",
        label: "Utente",
        i18n: "@@Utente",
        icon: "mdi mdi-account",
        menuList: [
          {
            code: "logout",
            label: "Logout",
            i18n: "@@Logout",
            icon: "mdi mdi-logout-variant mdi-flip-h",
            route: "/logout",
          },
        ]
      },
      {
        code: "service_int",
        label: "Ore Interne",
        i18n: "@@Ore Interne",
        icon: "mdi mdi-clock-time-four-outline",
        isUserGroupValid: this.authService.isUserGroupValid([USER_GROUP.SUPER]),
        menuList: [
          {
            code: "service_calendar_int",
            label: "Calendario",
            i18n: "@@Calendario",
            icon: "mdi mdi-calendar-outline",
            route: "/service-calendar-int",
            isUserGroupValid: this.authService.isUserGroupValid([USER_GROUP.SUPER]),
          },
          {
            code: "service_operation_int_list",
            label: "Operazioni",
            i18n: "@@Operazioni",
            icon: "mdi mdi-format-list-bulleted",
            route: "/service-operation-int-list",
            isUserGroupValid: this.authService.isUserGroupValid([USER_GROUP.SUPER]),
          },
          {
            code: "service_extra_int_list",
            label: "Spese",
            i18n: "@@Spese",
            icon: "mdi mdi-format-list-bulleted",
            route: "/service-extra-int-list",
            isUserGroupValid: this.authService.isUserGroupValid([USER_GROUP.SUPER]),
          },
          {
            code: "service_extra_typology_int_list",
            label: "Extra",
            i18n: "@@Extra",
            icon: "mdi mdi-format-list-bulleted",
            route: "/service-extra-typology-int-list",
            isUserGroupValid: this.authService.isUserGroupValid([USER_GROUP.SUPER]),
          },
        ]
      },
      {
        code: "service_ext",
        label: "Interventi",
        i18n: "@@Interventi",
        icon: "mdi mdi-progress-wrench",
        menuList: [
          {
            code: "service_calendar_ext",
            label: "Calendario",
            i18n: "@@Calendario",
            icon: "mdi mdi-calendar-outline",
            route: "/service-calendar-ext",
          },
          {
            code: "service_task_ext_list",
            label: "Attività",
            i18n: "@@Attività",
            icon: "mdi mdi-format-list-bulleted",
            route: "/service-task-ext-list",
          },
          {
            code: "service_operation_ext_list",
            label: "Operazioni",
            i18n: "@@Operazioni",
            icon: "mdi mdi-format-list-bulleted",
            route: "/service-operation-ext-list",
          },
          {
            code: "service_extra_trip_ext_list",
            label: "Viaggi",
            i18n: "@@Viaggi",
            icon: "mdi mdi-format-list-bulleted",
            route: "/service-trip-ext-list",
          },
          {
            code: "service_extra_ext_list",
            label: "Spese",
            i18n: "@@Spese",
            icon: "mdi mdi-format-list-bulleted",
            route: "/service-extra-ext-list",
          },
          {
            code: "service_task_product_ext_list",
            label: "Prodotti",
            i18n: "@@Prodotti",
            icon: "mdi mdi-format-list-bulleted",
            route: "/service-task-product-ext-list",
          },
        ]
      },
      {
        code: "service_call",
        label: "Ticket",
        i18n: "@@Ticket",
        icon: "mdi mdi-ticket-account",
        menuList: [
          {
            code: "service_call_list",
            label: "Lista",
            i18n: "@@Lista",
            icon: "mdi mdi-format-list-bulleted",
            route: "/service-call-list",
          },
          {
            code: "service_calendar_call",
            label: "Calendario",
            i18n: "@@Calendario",
            icon: "mdi mdi-calendar-outline",
            route: "/service-calendar-call",
          },
        ]
      },
      {
        code: "report",
        label: "Report",
        i18n: "@@Report",
        icon: "mdi mdi-file-document-outline",
        menuList: [
          {
            code: "report_list",
            label: "Lista",
            i18n: "@@Lista",
            icon: "mdi mdi-format-list-bulleted",
            route: "/report-list",
          },
          {
            code: "verbal_list",
            label: "Verbali",
            i18n: "@@Verbali",
            icon: "mdi mdi-file-certificate-outline",
            route: "/verbal-list",
          },
        ]
      },
      {
        code: "job",
        label: "Commesse",
        i18n: "@@Commesse",
        icon: "mdi mdi-clipboard-outline",
        menuList: [
          {
            code: "job_list",
            label: "Lista",
            i18n: "@@Lista",
            icon: "mdi mdi-format-list-bulleted",
            route: "/job-list",
          },
          // {
          //   code: "job_details_list",
          //   label: "Dettagli",
          //   i18n: "@@Dettagli",
          //   icon: "mdi mdi-format-list-bulleted",
          //   route: "/job-details-list",
          // },
          {
            code: "job_details_action_list",
            label: "Azioni",
            i18n: "@@Azioni",
            icon: "mdi mdi-format-list-bulleted",
            route: "/job-details-action-list",
          },
        ]
      },
      {
        code: "consumer",
        label: "Anagrafiche",
        i18n: "@@Anagrafiche",
        icon: "mdi mdi-account-tie",
        menuList: [
          {
            code: "customer_list",
            label: "Clienti",
            i18n: "@@Clienti",
            icon: "mdi mdi-format-list-bulleted",
            route: "/customer-list",
          },
          {
            code: "destination_list",
            label: "Destinazioni",
            i18n: "@@Destinazioni",
            icon: "mdi mdi-format-list-bulleted",
            route: "/destination-list",
          },
          // {
          //   code: "consumer_list",
          //   label: "Lista",
          //   i18n: "@@Lista",
          //   icon: "mdi mdi-format-list-bulleted",
          //   route: "/consumer-list",
          // },
          // {
          //   code: "consumer_typology_list",
          //   label: "Tipologie",
          //   i18n: "@@Tipologie",
          //   icon: "mdi mdi-format-list-bulleted",
          //   route: "/consumer-typology-list",
          // },
        ]
      },
      {
        code: "contact",
        label: "Contatti",
        i18n: "@@Contatti",
        icon: "mdi mdi-contacts-outline",
        menuList: [
          {
            code: "contact_list",
            label: "Lista",
            i18n: "@@Lista",
            icon: "mdi mdi-format-list-bulleted",
            route: "/contact-list",
          },
        ]
      },
      {
        code: "machine",
        label: "Macchine",
        i18n: "@@Macchine",
        icon: "mdi mdi-robot-industrial",
        menuList: [
          {
            code: "machine_list",
            label: "Lista",
            i18n: "@@Lista",
            icon: "mdi mdi-format-list-bulleted",
            route: "/machine-list",
          },
        ]
      },
      {
        code: "product",
        label: "Prodotti",
        i18n: "@@Prodotti",
        icon: "mdi mdi-buffer",
        menuList: [
          {
            code: "product_list",
            label: "Lista",
            i18n: "@@Lista",
            icon: "mdi mdi-format-list-bulleted",
            route: "/product-list",
          },
        ]
      },
      {
        code: "truck",
        label: "Furgone",
        i18n: "@@Furgone",
        icon: "mdi mdi-truck",
        menuList: [
          {
            code: "truck_stock_list",
            label: "Giacenza",
            i18n: "@@Giacenza",
            icon: "mdi mdi-format-list-bulleted",
            route: "/truck-stock-list",
          },
        ]
      },
      {
        code: "user",
        label: "Utenti",
        i18n: "@@Utenti",
        icon: "mdi mdi-account-multiple",
        menuList: [
          {
            code: "user_list",
            label: "Lista",
            i18n: "@@Lista",
            icon: "mdi mdi-format-list-bulleted",
            route: "/user-list",
          },
        ]
      },
      {
        code: "sync",
        label: "Sync",
        i18n: "@@Sync",
        icon: "mdi mdi-cloud",
        //isUserGroupValid: this.authService.isUserGroupValid([USER_GROUP.SUPER, USER_GROUP.ALL]),
        menuList: [
          {
            code: "sync_list",
            label: "Lista",
            i18n: "@@Lista",
            icon: "mdi mdi-format-list-bulleted",
            route: "/sync-list",
            //isUserGroupValid: this.authService.isUserGroupValid([USER_GROUP.SUPER, USER_GROUP.ALL]),
          },
        ]
      },
    ];
    //
    return menuList;
  }
}
