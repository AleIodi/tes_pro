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
//TRUCK
//
$erp_t_sql=sprintf("	SELECT
			fr.CodiceFurgone AS CodiceFurgone,
			fr.DescrizioneFurgone AS DescrizioneFurgone
			
			FROM
			vFurgoniReady AS fr
			
			ORDER BY
			fr.CodiceFurgone ASC
			");
$erp_t_res=$custom->custom_rw->database_erp->getRows($erp_t_sql);
//
if($erp_t_res["count"]>0){
	foreach($erp_t_res["rows"] as $erp_t_row){
		try{
			$database->initTransaction();
			//
			if(is_empty($erp_t_row["CodiceFurgone"])){
				throw new Exception("AJAX_ERROR_CODE_NOT_FOUND");
			}
			//
			$t_arr=array(
				"code"=>$custom->custom_rw->getTextFixed($erp_t_row["CodiceFurgone"]),
				"name"=>$custom->custom_rw->getTextFixed($erp_t_row["DescrizioneFurgone"]??""),
			);
			$database->inup("truck",$t_arr,array("code"));
			//
			$database->commitTransaction();
		}
		catch(Exception $e){
			$database->rollbackTransaction();
			$error_catched=true;
			//
			echo sprintf("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! EXCEPTION INTO %s !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n%s\n",basename(__FILE__,'.php'),$e->getMessage());
			pr($erp_t_row);
			echo sprintf("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n");
		}
	}
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
