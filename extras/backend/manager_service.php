<?php
class ManagerService extends Manager{
	protected $manager_service_custom;
	//
	function init($custom,$u_res){
		parent::init($custom,$u_res);
		//
		//MANAGER CUSTOM
		//
		if(SWNAME==CRASH){
			require_once(DOCUMENT_ROOT."/".CRASH."/".SWSIDE."/custom/crash_manager_service.php");
			//
			$this->manager_service_custom=new CrashManagerService($this->database,$this->def_config,$this->custom);
		}
		else{
			require_once(SWPATH.SWSIDE."/custom/custom_manager_service.php");
			//
			$this->manager_service_custom=new CustomManagerService($this->database,$this->def_config,$this->custom);
		}
	}
	//
	//#######################################################################################################################################################################
	// MANAGER SERVICE ###########################################################################################################################################################
	//#######################################################################################################################################################################
	//
	function getCallCodeFromSequence($transaction_parent=null){
		return $this->def_manager["sequence"]->getCodeFromSequence("CL","CALL",8,$transaction_parent);
	}
	//
	function getTaskCodeFromSequence($transaction_parent=null){
		return $this->def_manager["sequence"]->getCodeFromSequence("TS","TASK",8,$transaction_parent);
	}
	//
	function getOperationCodeFromSequence($id_st,$transaction_parent=null){
		if($id_st==$this->def_config["service_typology_arr"]["EXTERNAL"]["id"]){
			return $this->def_manager["sequence"]->getCodeFromSequence("SE","OPERATION_EXTERNAL",8,$transaction_parent);
		}
		else if($id_st==$this->def_config["service_typology_arr"]["INTERNAL"]["id"]){
			return $this->def_manager["sequence"]->getCodeFromSequence("SI","OPERATION_INTERNAL",8,$transaction_parent);
		}
		else if($id_st==$this->def_config["service_typology_arr"]["ASSISTANCE"]["id"]){
			return $this->def_manager["sequence"]->getCodeFromSequence("SA","OPERATION_ASSISTANCE",8,$transaction_parent);
		}
		else{
			return $this->def_manager["sequence"]->getCodeFromSequence("SX","OPERATION",8,$transaction_parent);
		}
	}
	//
	function getReportCodeFromSequence(){
		$u_res=$this->database->getItem("user",array("id"=>$this->id_user));
		//
		$code_prefix=sprintf("%s",$u_res["row"]["ext_code"]);
		//
		return $this->def_manager["sequence"]->getCodeFromSequence($code_prefix,$u_res["row"]["ext_code"],3);
	}
	//
	function getExtraCodeFromSequence($transaction_parent=null){
		return $this->def_manager["sequence"]->getCodeFromSequence("EX","EXTRA",8,$transaction_parent);
	}
	//
	function getTripCodeFromSequence($transaction_parent=null){
		return $this->def_manager["sequence"]->getCodeFromSequence("TR","TRIP",8,$transaction_parent);
	}
	//
	function getSpecCodeFromSequence($transaction_parent=null){
		return $this->def_manager["sequence"]->getCodeFromSequence("OF","OFFER",4,$transaction_parent);
	}
	//
	function serviceTaskReport_getUrl($id_service_task_report){
		$customer=PHP4NS::str_replace("4service_","",SWNAME);
		$environment_prefix=($_SERVER["HTTP_HOST"]=="localhost" || $_SERVER["HTTP_HOST"]=="phoenix" || getHostName()=="FNSSRV012") ? "dev" : "prod";
		//
		$server=sprintf("https://service-pwa-%s.web.app",$customer);
		if($environment_prefix=="dev"){
			$server="http://localhost:4200";
		}
		
		//
		$data_arr=array(
			"idr_service_task_report"=>$id_service_task_report,
		);
		//
		return sprintf("%s/#/report-report-public?datacrypt=%s",$server,$this->encryptString(json_encode($data_arr)));
	}
	//
	function getContractCodeFromSequence($transaction_parent=null){
		return $this->def_manager["sequence"]->getCodeFromSequence("CT","CONTRACT",8,$transaction_parent);
	}
	//
	function getJobCodeFromSequence(){
		return $this->def_manager["sequence"]->getCodeFromSequence("C","JOB",3);
	}
	//
	//TOKEN URL EMAIL ENCRYPTION
	//
	function encryptString($string_to_encrypt){
		return base64_encode(openssl_encrypt($string_to_encrypt,"aes-256-ecb","4NS_TOKEN_".SWNAME));
	}
	//
	function decryptString($string_to_decrypt){
		return openssl_decrypt(base64_decode($string_to_decrypt),"aes-256-ecb","4NS_TOKEN_".SWNAME);
	}
	//
	//DATE
	//
	function getDateByFormat($date,$format,$interval_to_add_string=null){
		$date_to_format=PHP4NS::date_create($date);
		//
		if($interval_to_add_string!=null){
			$date_to_format=date_add($date_to_format,date_interval_create_from_date_string($interval_to_add_string));
		}
		//
		return PHP4NS::date_format($date_to_format,$format);
	}
}
?>
