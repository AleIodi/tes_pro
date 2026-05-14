<?php
$def_is_system=true;
require_once("../../modules/config.inc.php");
require_once("config.inc.php");
echo"\n\n-------------------------------------------------------------\n\n";
echo sprintf("LAUNCH %s",basename(__FILE__,'.php'));
echo"\n\n";
//
$c_row=$def_manager["crontab"]->getOrCreateRow(array("code"=>basename(__FILE__,".php")));
$date_last_execution=$c_row["date_last_execution"];
$date_current_execution=date("Y-m-d H:i:s");
$error_catched=false;
//
try{
	$database->initTransaction();
	//
	$custom->custom_rw->sync_TruckStock(null,true);
	//
	$database->commitTransaction();
}
catch(Exception $e){
	$database->rollbackTransaction();
	$error_catched=true;
	//
	echo sprintf("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! EXCEPTION INTO %s !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n%s\n",basename(__FILE__,'.php'),$e->getMessage());
	echo sprintf("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n");
}
//
if(!$error_catched){
	$def_manager["crontab"]->updateLastExecution($c_row,$date_current_execution);
	echo "No Error: Update last execution date\n\n";
}
else{
	echo "Errors catched: Last execution date not updated\n\n";
}
//
echo "\n\n";
echo"FINISH";
echo "\n\n";
?>
