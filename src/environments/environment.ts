// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  app_version: require('../../package.json').version + '-dev',
  //
  server: {
    local: {
      protocol: "http",
      host: "172.30.250.12",
      port: 80,
    },
    remote: {
      protocol: "https",
      host: "4ns.duckdns.org",
      port: 10443,
    },
  },
  //
  project: "4service_autodop",
  user: "4ns",
  password: "4ns4ns",
  //
  database_name:"4service_pwa_autodop_dev",
  //
  user_session_minutes_max: 480,
  sync_auto_interval_ms: 20000,
  //
  //TODO gestire minuti oltre il 60 (controllare funzioni roundToNearestMinutes)
  calendar_step_duration: "00:15:00",
  service_trip_step_minutes: 15,
  service_operation_step_minutes: 15,
  //
  dialog_confirm_width: "350px",
  dialog_confirm_height: "200px",
  dialog_confirm_width_xl: "500px",
  dialog_confirm_height_xl: "250px",
  //
  id_consumer_autodop: 5,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
