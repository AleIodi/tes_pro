<?php
require_once(DOCUMENT_ROOT."/".CRASH."/".SWSIDE."/custom/crash_function.php");
//
class CustomFunction extends CrashFunction{
	public CustomRw $custom_rw;
	//
	public function init(){
		parent::init();
		//
		require_once(SWPATH.SWSIDE."/custom/custom_function_rw.php");
		//
		$this->custom_rw=new CustomRw($this->database,$this->def_config,$this->def_manager,$this);
	}
	//
	public function validateBasicAuth(){
		if(!isset($_SERVER["PHP_AUTH_USER"]) || $_SERVER["PHP_AUTH_USER"]!=$this->def_config["basic_auth_user"]){
			//throw new Exception("WS_ERROR_LOGIN_FAILED");
		}
		//
		if(!isset($_SERVER["PHP_AUTH_PW"]) || $_SERVER["PHP_AUTH_PW"]!=$this->def_config["basic_auth_password"]){
			//throw new Exception("WS_ERROR_LOGIN_FAILED");
		}
	}
	//
	function autodopVerbal_getUrl($id_autodop_verbal){
		$customer=PHP4NS::str_replace("4service_","",SWNAME);
		$environment_prefix=($_SERVER["HTTP_HOST"]=="localhost" || $_SERVER["HTTP_HOST"]=="phoenix" || getHostName()=="FNSSRV012") ? "dev" : "prod";
		//
		$server=sprintf("https://service-pwa-%s.web.app",$customer);
		if($environment_prefix=="dev"){
			$server="http://localhost:4200";
		}
		
		//
		$data_arr=array(
			"idr_autodop_verbal"=>$id_autodop_verbal,
		);
		//
		return sprintf("%s/#/verbal-report-public?datacrypt=%s",$server,$this->def_manager["service"]->encryptString(json_encode($data_arr)));
	}
	//
	public function deleteServiceTask($st_row,$bypass=false){
		$st_row=$this->database->refreshRow("service_task",$st_row,array("id"),$bypass,"AJAX_ERROR_TASK_NOT_FOUND");
		//
		//SERVICE_TASK
		$st_update=sprintf("UPDATE service_task SET enabled=0, sent_to_erp=1 WHERE id=%s",$st_row["id"]);
		$this->database->update($st_update);
		//
		//SERVICE_TASK_REPORT
		$str_update=sprintf("UPDATE service_task_report SET enabled=0, sent_to_erp=1 WHERE id_service_task=%s",$st_row["id"]);
		$this->database->update($str_update);
		//
		//SERVICE_OPERATION
		$so_update=sprintf("UPDATE service_operation SET enabled=0, sent_to_erp=1 WHERE id_service_task=%s",$st_row["id"]);
		$this->database->update($so_update);
		//
		//SERVICE_OPERATION_MACHINE
		$so_res=$this->database->getItems("service_operation",array("id_service_task"=>$st_row["id"]));
		foreach($so_res["rows"] as $so_row){
			$som_update=sprintf("UPDATE service_operation_machine SET enabled=0, sent_to_erp=1 WHERE id_service_operation=%s",$so_row["id"]);
			$this->database->update($som_update);
		}
		//
		//SERVICE_TASK_USER
		$stu_update=sprintf("UPDATE service_task_user SET enabled=0 WHERE id_service_task=%s",$st_row["id"]);
		$this->database->update($stu_update);
		//
		//SERVICE_EXTRA
		$se_update=sprintf("UPDATE service_extra SET enabled=0, sent_to_erp=1 WHERE id_service_task=%s",$st_row["id"]);
		$this->database->update($se_update);
		//
		//SERVICE_TASK_PRODUCT
		$stp_update=sprintf("UPDATE service_task_product SET enabled=0, sent_to_erp=1 WHERE id_service_task=%s",$st_row["id"]);
		$this->database->update($stp_update);
		//
		//SERVICE_TRIP
		$strp_update=sprintf("UPDATE service_trip SET enabled=0, sent_to_erp=1 WHERE id_service_task=%s",$st_row["id"]);
		$this->database->update($strp_update);
	}
	//
	//AUDIT
	//
	private function auditTable_Inup($table_name,$sc_arr,$key_arr,$only_insert=false,$param_arr=array()){
		try{
			$this->database->initTransaction();
			//
			$sc_res=$this->database->inup($table_name,$sc_arr,$key_arr,$only_insert);
			//
			$this->def_manager["audit"]->create($table_name,$sc_res["id"],$sc_res["row"],$sc_res["prev_row"],$param_arr);
			//
			$this->database->commitTransaction();
			//
			return $sc_res["row"];
		}
		catch(Exception $e){
			$this->database->rollbackTransaction();
			//
			throw $e;
		}
	}
	//
	function serviceTask_Inup($sc_arr,$key_arr,$only_insert=false){
		$param_arr=array(
			"key_changed_exclude_arr"=>array("date_update"),
		);
		//
		return $this->auditTable_Inup("service_task",$sc_arr,$key_arr,$only_insert,$param_arr);
	}
	//
	function serviceOperation_Inup($sc_arr,$key_arr,$only_insert=false){
		$param_arr=array(
			"key_changed_exclude_arr"=>array("date_update"),
		);
		//
		return $this->auditTable_Inup("service_operation",$sc_arr,$key_arr,$only_insert,$param_arr);
	}
	//
	function serviceExtra_Inup($sc_arr,$key_arr,$only_insert=false){
		$param_arr=array(
			"key_changed_exclude_arr"=>array("date_update"),
		);
		//
		return $this->auditTable_Inup("service_extra",$sc_arr,$key_arr,$only_insert,$param_arr);
	}
	//
	function serviceTrip_Inup($sc_arr,$key_arr,$only_insert=false){
		$param_arr=array(
			"key_changed_exclude_arr"=>array("date_update"),
		);
		//
		return $this->auditTable_Inup("service_trip",$sc_arr,$key_arr,$only_insert,$param_arr);
	}
	//
	function serviceOperationMachine_Inup($sc_arr,$key_arr,$only_insert=false){
		$param_arr=array(
			"key_changed_exclude_arr"=>array("date_update"),
		);
		//
		return $this->auditTable_Inup("service_operation_machine",$sc_arr,$key_arr,$only_insert,$param_arr);
	}
	//
	function serviceTaskProduct_Inup($sc_arr,$key_arr,$only_insert=false){
		$param_arr=array(
			"key_changed_exclude_arr"=>array("date_update"),
		);
		//
		return $this->auditTable_Inup("service_task_product",$sc_arr,$key_arr,$only_insert,$param_arr);
	}
}
?>
