<?php
require_once("config.inc.php");
//
class WS_Act{
	public $database;
	public $def_manager;
	public $def_config;
	public $custom;
	//
	function __construct($database,$def_manager,$def_config,$custom){
		$this->database=$database;
		$this->def_manager=$def_manager;
		$this->def_config=$def_config;
		$this->custom=$custom;
	}
	//
	function user_Inup($data_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				$u_arr=array(
					"signature"=>$data["signature"],
				);
				//
				if(!is_empty($data["idr"])){
					$u_res=$this->database->getItem("user",array("id"=>$data["idr"]));
					if(is_empty($u_res["id"])){
						throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
					}
					//
					$u_arr["id"]=$u_res["id"];
				}
				//
				$u_res=$this->database->inup("user",$u_arr,array("id"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$u_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function userSetting_Inup($data_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				if(is_empty($data["idr_user"])){
					throw new Exception("AJAX_ERROR_USER_NOT_VALID");
				}
				//
				$u_res=$this->database->getItem("user",array("id"=>$data["idr_user"]));
				if(is_empty($u_res["id"])){
					throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
				}
				//
				$us_arr=array(
					"id_user"=>$u_res["id"],
					"code"=>$data["code"],
					"value"=>$data["value"],
					"enabled"=>$data["enabled"],
				);
				//
				$us_res=$this->database->inup("user_setting",$us_arr,array("code","id_user"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$us_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function consumer_Inup($data_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				if(is_empty($data["idr_consumer_typology"])){
					throw new Exception("AJAX_ERROR_CONSUMER_TYPOLOGY_NOT_VALID");
				}
				//
				if(!is_empty($data["idr_consumer_parent"])){
					$cns_parent_res=$this->database->getItem("consumer",array("id"=>$data["idr_consumer_parent"]));
					if(is_empty($cns_parent_res["id"])){
						throw new Exception("AJAX_ERROR_CONSUMER_NOT_FOUND");
					}
				}
				//
				$cnst_res=$this->database->getItem("consumer_typology",array("id"=>$data["idr_consumer_typology"]));
				if(is_empty($cnst_res["id"])){
					throw new Exception("AJAX_ERROR_CONSUMER_TYPOLOGY_NOT_FOUND");
				}
				//
				$cns_arr=array(
					"code"=>$data["code"],
					"name"=>$data["name"],
					"id_consumer_typology"=>$cnst_res["id"],
					"id_consumer_parent"=>$cns_parent_res["id"]??"###NULL###",
					"address"=>$data["address"],
					"city"=>$data["city"],
					"zip"=>$data["zip"],
					"province"=>$data["province"],
					"nation"=>$data["nation"],
					"trip_km"=>$data["trip_km"],
					"trip_minutes"=>$data["trip_minutes"],
				);
				//
				if(!is_empty($data["idr"])){
					$cns_res=$this->database->getItem("consumer",array("id"=>$data["idr"]));
					if(is_empty($cns_res["id"])){
						throw new Exception("AJAX_ERROR_DESTINATION_NOT_FOUND");
					}
					//
					$cns_arr["id"]=$cns_res["id"];
				}
				//
				$cns_res=$this->database->inup("consumer",$cns_arr,array("id"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$cns_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function contact_Inup($data_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				if(is_empty($data["idr_consumer"])){
					throw new Exception("AJAX_ERROR_CONSUMER_NOT_VALID");
				}
				//
				$cns_res=$this->database->getItem("consumer",array("id"=>$data["idr_consumer"]));
				if(is_empty($cns_res["id"])){
					throw new Exception("AJAX_ERROR_CONSUMER_NOT_FOUND");
				}
				//
				$c_arr=array(
					"id_consumer"=>$cns_res["id"],
					"name_first"=>$data["name_first"],
					"name_last"=>$data["name_last"],
					"email"=>$data["email"],
					"phone"=>$data["phone"],
					"enabled"=>$data["enabled"],
				);
				//
				if(!is_empty($data["idr"])){
					$cnt_res=$this->database->getItem("contact",array("id"=>$data["idr"]));
					if(is_empty($cnt_res["id"])){
						throw new Exception("AJAX_ERROR_CONTACT_NOT_FOUND");
					}
					//
					$c_arr["id"]=$cnt_res["id"];
				}
				//
				$cnt_res=$this->database->inup("contact",$c_arr,array("id"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$cnt_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function product_Inup($data_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				$p_arr=array(
					"article"=>$data["article"],
					"name"=>$data["name"],
				);
				//
				if(!is_empty($data["idr"])){
					$p_res=$this->database->getItem("product",array("id"=>$data["idr"]));
					if(is_empty($p_res["id"])){
						throw new Exception("AJAX_ERROR_PRODUCT_NOT_FOUND");
					}
					//
					$p_arr["article"]=$p_res["row"]["article"];
				}
				else{
					//$p_arr["article"]=$p_arr["article"]."_".$this->def_manager["sequence"]->getCodeFromSequence("","PRODUCT",8,$transaction_parent,array("is_managed_year"=>false));
					//
					$pt_res=$this->database->getItem("product_typology",array("code"=>"STANDARD"));
					$p_arr["id_product_typology"]=$pt_res["id"];
				}
				//
				$p_res=$this->database->inup("product",$p_arr,array("article"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$p_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function serviceCall_Inup($data_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				if(is_empty($data["idr_consumer"])){
					throw new Exception("AJAX_ERROR_CONSUMER_NOT_VALID");
				}
				//
				$scs_res=$this->database->getItem("service_call_status",array("id"=>$data["idr_service_call_status"]));
				if(is_empty($scs_res["id"])){
					throw new Exception("AJAX_ERROR_SERVICE_CALL_STATUS_NOT_FOUND");
				}
				//
				$cns_res=$this->database->getItem("consumer",array("id"=>$data["idr_consumer"]));
				if(is_empty($cns_res["id"])){
					throw new Exception("AJAX_ERROR_CONSUMER_NOT_FOUND");
				}
				//
				$u_creator_res=$this->database->getItem("user",array("id"=>$data["idr_user_creator"]));
				if(is_empty($u_creator_res["id"])){
					throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
				}
				//
				$j_res=null;
				if(!is_empty($data["idr_job"])){
					$j_res=$this->database->getItem("job",array("id"=>$data["idr_job"]));
					if(is_empty($j_res["id"])){
						throw new Exception("AJAX_ERROR_JOB_NOT_FOUND");
					}
				}
				//
				$jd_res=null;
				if(!is_empty($data["idr_job_details"])){
					$jd_res=$this->database->getItem("job_details",array("id"=>$data["idr_job_details"]));
					if(is_empty($jd_res["id"])){
						throw new Exception("AJAX_ERROR_JOB_DETAILS_NOT_FOUND");
					}
				}
				//
				$pd_res=null;
				if(!is_empty($data["idr_destination"])){
					$pd_res=$this->database->getItem("consumer",array("id"=>$data["idr_destination"],"id_consumer_typology"=>$this->def_config["consumer_typology_arr"]["DESTINATION"]["id"]));
					if(is_empty($pd_res["id"])){
						throw new Exception("AJAX_ERROR_DESTINATION_NOT_FOUND");
					}
				}
				//
				$sc_arr=array(
					"id_service_call_status"=>$scs_res["id"],
					"id_consumer"=>$cns_res["id"],
					"id_job"=>$j_res["id"]??"###NULL###",
					"id_job_details"=>$jd_res["id"]??"###NULL###",
					"id_destination"=>$pd_res["id"]??"###NULL###",
					"description"=>$data["description"]??"###NULL###",
					"date_start"=>$data["date_start"]??"###NULL###",
					"date_end"=>$data["date_end"]??"###NULL###",
					"id_user_creator"=>$u_creator_res["id"],
					"date_create"=>$data["date_create"],
					"enabled"=>$data["enabled"],
				);
				//
				if(!is_empty($data["idr"])){
					$sc_res=$this->database->getItem("service_call",array("id"=>$data["idr"]));
					if(is_empty($sc_res["id"])){
						throw new Exception("AJAX_ERROR_CALL_NOT_FOUND");
					}
					//
					$sc_arr["id"]=$sc_res["id"];
					$sc_arr["code"]=$sc_res["row"]["code"];
				}
				else{
					$sc_arr["code"]=$this->def_manager["service"]->getCallCodeFromSequence();
				}
				//
				$sc_res=$this->database->inup("service_call",$sc_arr,array("code"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$sc_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function serviceCallMachine_Inup($data_arr,$sc_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				if(!array_key_exists($data["id_service_call"],$sc_arr) && is_empty($data["idr_service_call"])){
					throw new Exception("AJAX_ERROR_SERVICE_CALL_NOT_FOUND");
				}
				//
				$m_res=$this->database->getItem("machine",array("id"=>$data["idr_machine"]));
				if(is_empty($m_res["id"])){
					throw new Exception("AJAX_ERROR_MACHINE_NOT_FOUND");
				}
				//
				$scm_arr=array(
					"id_service_call"=>$sc_arr[$data["id_service_call"]]["idr"]??$data["idr_service_call"],
					"id_machine"=>$m_res["id"],
					"enabled"=>$data["enabled"],
				);
				//
				$scm_res=$this->database->inup("service_call_machine",$scm_arr,array("id_service_call","id_machine"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$scm_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function serviceCallUser_Inup($data_arr,$sc_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				if(!array_key_exists($data["id_service_call"],$sc_arr) && is_empty($data["idr_service_call"])){
					throw new Exception("AJAX_ERROR_SERVICE_CALL_NOT_FOUND");
				}
				//
				$u_res=$this->database->getItem("user",array("id"=>$data["idr_user"]));
				if(is_empty($u_res["id"])){
					throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
				}
				//
				$scu_arr=array(
					"id_service_call"=>$sc_arr[$data["id_service_call"]]["idr"]??$data["idr_service_call"],
					"id_user"=>$u_res["id"],
					"enabled"=>$data["enabled"],
				);
				//
				$scu_res=$this->database->inup("service_call_user",$scu_arr,array("id_service_call","id_user"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$scu_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function serviceTask_Inup($data_arr,$sc_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				if(!is_empty($data["idr_job"])){
					$j_res=$this->database->getItem("job",array("id"=>$data["idr_job"]));
					if(is_empty($j_res["id"])){
						throw new Exception("AJAX_ERROR_JOB_NOT_FOUND");
					}
				}
				//
				if(!is_empty($data["idr_job_details"])){
					$jd_res=$this->database->getItem("job_details",array("id"=>$data["idr_job_details"]));
					if(is_empty($jd_res["id"])){
						throw new Exception("AJAX_ERROR_JOB_DETAIL_NOT_FOUND");
					}
				}
				//
				if(!is_empty($data["idr_contact"])){
					$cnt_res=$this->database->getItem("contact",array("id"=>$data["idr_contact"]));
					if(is_empty($cnt_res["id"])){
						throw new Exception("AJAX_ERROR_CONTACT_NOT_FOUND");
					}
				}
				//
				if(!is_empty($data["idr_destination"])){
					$dest_res=$this->database->getItem("consumer",array("id"=>$data["idr_destination"]));
					if(is_empty($dest_res["id"])){
						throw new Exception("AJAX_ERROR_DESTINATION_NOT_FOUND");
					}
				}
				//
				if(!is_empty($data["idr_user_creator"])){
					$u_creator_res=$this->database->getItem("user",array("id"=>$data["idr_user_creator"]));
					if(is_empty($u_creator_res["id"])){
						throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
					}
				}
				//
				if(!is_empty($data["idr_truck"])){
					$t_res=$this->database->getItem("truck",array("id"=>$data["idr_truck"]));
					if(is_empty($t_res["id"])){
						throw new Exception("AJAX_ERROR_TRUCK_NOT_FOUND");
					}
				}
				//
				$st_arr=array(
					"id_service_call"=>$sc_arr[$data["id_service_call"]]["idr"]??$data["idr_service_call"]??"###NULL###",
					"id_user_creator"=>$u_creator_res["id"]??"###NULL###",
					"id_job"=>$j_res["id"]??"###NULL###",
					"id_destination"=>$dest_res["id"]??"###NULL###",
					"id_job_details"=>$jd_res["id"]??"###NULL###",
					"description"=>$data["description"]??"###NULL###",
					"date_start"=>$data["date_start"],
					"date_end"=>$data["date_end"],
					"id_contact"=>$cnt_res["id"]??"###NULL###",
					"is_finished"=>$data["is_finished"]??"###NULL###",
					"enabled"=>$data["enabled"],
					"notes"=>$data["notes"]??"###NULL###",
					"notes_internal"=>$data["notes_internal"]??"###NULL###",
					"id_truck"=>$t_res["id"]??"###NULL###",
					"sent_to_erp"=>"1",
				);
				//
				if(is_empty($data["idr"])){
					$st_arr["code"]=$this->def_manager["service"]->getTaskCodeFromSequence();
				}
				else{
					$st_res=$this->database->getItem("service_task",array("id"=>$data["idr"]));
					if(is_empty($st_res["id"])){
						throw new Exception("AJAX_ERROR_SERVICE_TASK_NOT_FOUND");
					}
					//
					$st_arr["code"]=$st_res["row"]["code"];
				}
				//
				$st_res=$this->database->inup("service_task",$st_arr,array("code"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$st_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function serviceTaskProduct_Inup($data_arr,$st_arr,$p_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				if(!array_key_exists($data["id_service_task"],$st_arr) && is_empty($data["idr_service_task"])){
					throw new Exception("AJAX_ERROR_SERVICE_TASK_NOT_FOUND");
				}
				//
				if(!array_key_exists($data["id_product"],$p_arr) && is_empty($data["idr_product"])){
					throw new Exception("AJAX_ERROR_PRODUCT_NOT_FOUND");
				}
				//
				$u_res=$this->database->getItem("user",array("id"=>$data["idr_user"]));
				if(is_empty($u_res["id"])){
					throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
				}
				//
				$stp_arr=array(
					"id_service_task"=>$st_arr[$data["id_service_task"]]["idr"]??$data["idr_service_task"],
					"id_user"=>$u_res["id"],
					"id_product"=>$p_arr[$data["id_product"]]["idr"]??$data["idr_product"],
					"date_start"=>$data["date_start"],
					"value"=>$data["value"],
					"enabled"=>$data["enabled"],
					"sent_to_erp"=>"1",
				);
				//
				if(!is_empty($data["idr"])){
					$stp_res=$this->database->getItem("service_task_product",array("id"=>$data["idr"]));
					if(is_empty($stp_res["id"])){
						throw new Exception("AJAX_ERROR_SERVICE_TASK_PRODUCT_NOT_FOUND");
					}
					//
					$stp_arr["id"]=$stp_res["id"];
				}
				//
				$stp_res=$this->database->inup("service_task_product",$stp_arr,array("id"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$stp_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function serviceTaskReport_Inup($data_arr,$st_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				if(!array_key_exists($data["id_service_task"],$st_arr) && is_empty($data["idr_service_task"])){
					throw new Exception("AJAX_ERROR_SERVICE_TASK_NOT_FOUND");
				}
				//
				$u_res=$this->database->getItem("user",array("id"=>$data["idr_user"]));
				if(is_empty($u_res["id"])){
					throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
				}
				//
				$strs_res=$this->database->getItem("service_task_report_status",array("id"=>$data["idr_service_task_report_status"]));
				if(is_empty($strs_res["id"])){
					throw new Exception("AJAX_ERROR_SERVICE_TASK_REPORT_STATUS_NOT_FOUND");
				}
				//
				$str_arr=array(
					"id_service_task"=>$st_arr[$data["id_service_task"]]["idr"]??$data["idr_service_task"],
					"code"=>$data["code"],
					"id_service_task_report_status"=>$strs_res["id"],
					"date_create"=>$data["date_create"],
					"date_sent"=>$data["date_sent"]??"###NULL###",
					"date_signed"=>$data["date_signed"]??"###NULL###",
					"json"=>$data["json"]??"###NULL###",
					"id_user"=>$u_res["id"],
					"enabled"=>$data["enabled"],
					"signature"=>$data["signature"]??"###NULL###",
					"sent_to_erp"=>"1",
				);
				//
				if(!is_empty($data["idr"])){
					$str_res=$this->database->getItem("service_task_report",array("id"=>$data["idr"]));
					if(is_empty($str_res["id"])){
						throw new Exception("AJAX_ERROR_SERVICE_TASK_REPORT_NOT_FOUND");
					}
					//
					$str_arr["code"]=$str_res["row"]["code"];
				}
				//
				$str_res=$this->database->inup("service_task_report",$str_arr,array("code"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$str_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function serviceTaskReportMail_Inup($data_arr,$str_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				if(!array_key_exists($data["id_service_task_report"],$str_arr) && is_empty($data["idr_service_task_report"])){
					throw new Exception("AJAX_ERROR_SERVICE_TASK_REPORT_NOT_FOUND");
				}
				//
				$u_res=$this->database->getItem("user",array("id"=>$data["idr_user"]));
				if(is_empty($u_res["id"])){
					throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
				}
				//
				$c_res=$this->database->getItem("contact",array("id"=>$data["idr_contact"]));
				if(is_empty($c_res["id"])){
					throw new Exception("AJAX_ERROR_CONTACT_NOT_FOUND");
				}
				//
				$strm_arr=array(
					"id_service_task_report"=>$str_arr[$data["id_service_task_report"]]["idr"]??$data["idr_service_task_report"],
					"id_contact"=>$c_res["id"],
					"date_sent"=>$data["date_sent"]??"###NULL###",
					"id_user"=>$u_res["id"],
				);
				//
				$strm_res=$this->database->inup("service_task_report_mail",$strm_arr,array("id"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$strm_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function serviceTaskUser_Inup($data_arr,$st_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				if(!array_key_exists($data["id_service_task"],$st_arr) && is_empty($data["idr_service_task"])){
					throw new Exception("AJAX_ERROR_SERVICE_TASK_NOT_FOUND");
				}
				//
				$u_res=$this->database->getItem("user",array("id"=>$data["idr_user"]));
				if(is_empty($u_res["id"])){
					throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
				}
				//
				$stu_arr=array(
					"id_service_task"=>$st_arr[$data["id_service_task"]]["idr"]??$data["idr_service_task"],
					"id_user"=>$u_res["id"],
					"enabled"=>$data["enabled"],
				);
				//
				$stu_res=$this->database->inup("service_task_user",$stu_arr,array("id_service_task","id_user"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$stu_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function serviceOperation_Inup($data_arr,$sc_arr,$st_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				$jd_res=$this->database->getItem("job_details",array("id"=>$data["idr_job_details"]));
				if(is_empty($jd_res["id"])){
					throw new Exception("AJAX_ERROR_JOB_DETAIL_NOT_FOUND");
				}
				//
				$u_res=$this->database->getItem("user",array("id"=>$data["idr_user"]));
				if(is_empty($u_res["id"])){
					throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
				}
				//
				$sot_res=$this->database->getItem("service_operation_typology",array("id"=>$data["idr_service_operation_typology"]));
				if(is_empty($sot_res["id"])){
					throw new Exception("AJAX_ERROR_SERVICE_OPERATION_TYPOLOGY_NOT_FOUND");
				}
				//
				$sty_res=$this->database->getItem("service_typology",array("id"=>$data["idr_service_typology"]));
				if(is_empty($sty_res["id"])){
					throw new Exception("AJAX_ERROR_SERVICE_TYPOLOGY_NOT_FOUND");
				}
				//
				$so_arr=array(
					"id_service_task"=>$st_arr[$data["id_service_task"]]["idr"]??$data["idr_service_task"]??"###NULL###",
					"id_service_operation_typology"=>$sot_res["id"],
					"id_service_typology"=>$sty_res["id"],
					"id_job_details"=>$jd_res["id"],
					"description"=>$data["description"],
					"date_start"=>$data["date_start"],
					"date_end"=>$data["date_end"],
					"id_user"=>$u_res["id"],
					"is_external"=>$data["is_external"],
					"enabled"=>$data["enabled"],
					"sent_to_erp"=>"1",
				);
				//
				if(is_empty($data["idr"])){
					$so_arr["code"]=$this->def_manager["service"]->getOperationCodeFromSequence(null);
				}
				else{
					$so_res=$this->database->getItem("service_operation",array("id"=>$data["idr"]));
					if(is_empty($so_res["id"])){
						throw new Exception("AJAX_ERROR_OPERATION_NOT_FOUND");
					}
					//
					$so_arr["code"]=$so_res["row"]["code"];
				}
				//
				$so_res=$this->database->inup("service_operation",$so_arr,array("code"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$so_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function serviceOperationMachine_Inup($data_arr,$sc_arr,$st_arr,$so_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				if(!array_key_exists($data["id_service_operation"],$so_arr) && is_empty($data["idr_service_operation"])){
					throw new Exception("AJAX_ERROR_SERVICE_OPERATION_NOT_FOUND");
				}
				//
				$m_res=$this->database->getItem("machine",array("id"=>$data["idr_machine"]));
				if(is_empty($m_res["id"])){
					throw new Exception("AJAX_ERROR_MACHINE_NOT_FOUND");
				}
				//
				$som_arr=array(
					"id_service_operation"=>$so_arr[$data["id_service_operation"]]["idr"]??$data["idr_service_operation"],
					"id_machine"=>$m_res["id"],
					"enabled"=>$data["enabled"],
					"sent_to_erp"=>"1",
				);
				//
				if(!is_empty($data["idr"])){
					$som_res=$this->database->getItem("service_operation_machine",array("id"=>$data["idr"]));
					if(is_empty($som_res["id"])){
						throw new Exception("AJAX_ERROR_SERVICE_OPERATION_MACHINE_NOT_FOUND");
					}
					//
					$som_arr["id"]=$som_res["id"];
				}
				//
				$som_res=$this->database->inup("service_operation_machine",$som_arr,array("id"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$som_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function serviceExtra_Inup($data_arr,$st_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				$set_res=$this->database->getItem("service_extra_typology",array("id"=>$data["idr_service_extra_typology"]));
				if(is_empty($set_res["id"])){
					throw new Exception("AJAX_ERROR_SERVICE_EXTRA_TYPOLOGY_NOT_FOUND");
				}
				//
				$u_res=$this->database->getItem("user",array("id"=>$data["idr_user"]));
				if(is_empty($u_res["id"])){
					throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
				}
				//
				$sty_res=$this->database->getItem("service_typology",array("id"=>$data["idr_service_typology"]));
				if(is_empty($sty_res["id"])){
					throw new Exception("AJAX_ERROR_SERVICE_TYPOLOGY_NOT_FOUND");
				}
				//
				if(!is_empty($data["idr_job"])){
					$j_res=$this->database->getItem("job",array("id"=>$data["idr_job"]));
					if(is_empty($j_res["id"])){
						throw new Exception("AJAX_ERROR_JOB_NOT_FOUND");
					}
				}
				//
				$se_arr=array(
					"id_service_task"=>$st_arr[$data["id_service_task"]]["idr"]??$data["idr_service_task"]??"###NULL###",
					"id_job"=>$j_res["id"]??"###NULL###",
					"id_service_extra_typology"=>$set_res["id"],
					"id_service_typology"=>$sty_res["id"],
					"value"=>$data["value"],
					"date_start"=>$data["date_start"],
					"date_end"=>$data["date_end"],
					"id_user"=>$u_res["id"],
					"is_external"=>$data["is_external"],
					"enabled"=>$data["enabled"],
					"sent_to_erp"=>"1",
				);
				//
				if(is_empty($data["idr"])){
					$se_arr["code"]=$this->def_manager["service"]->getExtraCodeFromSequence();
				}
				else{
					$se_res=$this->database->getItem("service_extra",array("id"=>$data["idr"]));
					if(is_empty($se_res["id"])){
						throw new Exception("AJAX_ERROR_SERVICE_EXTRA_NOT_FOUND");
					}
					//
					$se_arr["code"]=$se_res["row"]["code"];
				}
				//
				$se_res=$this->database->inup("service_extra",$se_arr,array("code"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$se_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function serviceTrip_Inup($data_arr,$st_arr,$cns_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				$u_res=$this->database->getItem("user",array("id"=>$data["idr_user"]));
				if(is_empty($u_res["id"])){
					throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
				}
				//
				$dest_res=$this->database->getItem("consumer",array("id"=>$data["idr_destination"]??$cns_arr[$data["id_destination"]]["idr"]));
				if(is_empty($dest_res["id"])){
					throw new Exception("AJAX_ERROR_DESTINATION_NOT_FOUND");
				}
				//
				$strp_arr=array(
					"id_service_task"=>$st_arr[$data["id_service_task"]]["idr"]??$data["idr_service_task"]??"###NULL###",
					"id_destination"=>$dest_res["id"],
					"km_real"=>$data["km_real"],
					"km_invoice"=>((float)$data["km_invoice"])??"###NULL###",
					"date_start"=>$data["date_start"],
					"date_end"=>$data["date_end"],
					"id_user"=>$u_res["id"],
					"enabled"=>$data["enabled"],
					"sent_to_erp"=>"1",
				);
				//
				if(is_empty($data["idr"])){
					$strp_arr["code"]=$this->def_manager["service"]->getTripCodeFromSequence();
				}
				else{
					$strp_res=$this->database->getItem("service_trip",array("id"=>$data["idr"]));
					if(is_empty($strp_res["id"])){
						throw new Exception("AJAX_ERROR_SERVICE_TRIP_NOT_FOUND");
					}
					//
					$strp_arr["code"]=$strp_res["row"]["code"];
				}
				//
				$strp_res=$this->database->inup("service_trip",$strp_arr,array("code"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$strp_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function autodopVerbal_Inup($data_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				$u_res=$this->database->getItem("user",array("id"=>$data["idr_user"]));
				if(is_empty($u_res["id"])){
					throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
				}
				//
				$avs_res=$this->database->getItem("autodop_verbal_status",array("id"=>$data["idr_autodop_verbal_status"]));
				if(is_empty($avs_res["id"])){
					throw new Exception("AJAX_ERROR_VERBAL_STATUS_NOT_FOUND");
				}
				//
				$avt_res=$this->database->getItem("autodop_verbal_status",array("id"=>$data["idr_autodop_verbal_typology"]));
				if(is_empty($avt_res["id"])){
					throw new Exception("AJAX_ERROR_VERBAL_TYPOLOGY_NOT_FOUND");
				}
				//
				if(!is_empty($data["idr_job"])){
					$j_res=$this->database->getItem("job",array("id"=>$data["idr_job"]));
					if(is_empty($j_res["id"])){
						throw new Exception("AJAX_ERROR_JOB_NOT_FOUND");
					}
				}
				//
				$dest_res=$this->database->getItem("consumer",array("id"=>$data["idr_destination"]));
				if(is_empty($dest_res["id"])){
					throw new Exception("AJAX_ERROR_DESTINATION_NOT_FOUND");
				}
				//
				$m_res=$this->database->getItem("machine",array("id"=>$data["idr_machine"]));
				if(is_empty($m_res["id"])){
					throw new Exception("AJAX_ERROR_MACHINE_NOT_FOUND");
				}
				//
				$av_arr=array(
					"code"=>$data["code"],
					"id_autodop_verbal_status"=>$avs_res["id"],
					"id_autodop_verbal_typology"=>$avt_res["id"],
					"id_user"=>$u_res["id"],
					"id_job"=>$j_res["id"],
					"id_destination"=>$dest_res["id"],
					"id_machine"=>$m_res["id"],
					"date_create"=>$data["date_create"],
					"json"=>$data["json"]??"###NULL###",
					"enabled"=>$data["enabled"],
					"sent_to_erp"=>"1",
				);
				//
				if(!is_empty($data["idr"])){
					$av_res=$this->database->getItem("autodop_verbal",array("id"=>$data["idr"]));
					if(is_empty($av_res["id"])){
						throw new Exception("AJAX_ERROR_SERVICE_TASK_REPORT_NOT_FOUND");
					}
					//
					$av_arr["code"]=$av_res["row"]["code"];
				}
				//
				$av_res=$this->database->inup("autodop_verbal",$av_arr,array("code"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$av_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function autodopVerbalMail_Inup($data_arr,$av_arr,$transaction_parent=null){
		$ret_arr=array();
		//
		foreach($data_arr as $data){
			try{
				$this->database->initTransaction();
				//
				if(!array_key_exists($data["id_autodop_verbal"],$av_arr) && is_empty($data["idr_autodop_verbal"])){
					throw new Exception("AJAX_ERROR_VERBAL_NOT_FOUND");
				}
				//
				$u_res=$this->database->getItem("user",array("id"=>$data["idr_user"]));
				if(is_empty($u_res["id"])){
					throw new Exception("AJAX_ERROR_USER_NOT_FOUND");
				}
				//
				$c_res=$this->database->getItem("contact",array("id"=>$data["idr_contact"]));
				if(is_empty($c_res["id"])){
					throw new Exception("AJAX_ERROR_CONTACT_NOT_FOUND");
				}
				//
				$avm_arr=array(
					"id_autodop_verbal"=>$av_arr[$data["id_autodop_verbal"]]["idr"]??$data["idr_autodop_verbal"],
					"id_contact"=>$c_res["id"],
					"date_sent"=>$data["date_sent"]??"###NULL###",
					"id_user"=>$u_res["id"],
					"enabled"=>$data["enabled"],
					"date_create"=>$data["date_create"],
				);
				//
				$avm_res=$this->database->inup("service_task_report_mail",$avm_arr,array("id"));
				//
				$ret_arr[$data["id"]]=array("id"=>$data["id"],"idr"=>$avm_res["id"]);
				//
				$this->database->commitTransaction();
			}
			catch(Exception $e){
				$this->database->rollbackTransaction();
				//
				throw $e;
			}
		}
		//
		return $ret_arr;
	}
	//
	function getFieldFixed($field_value){
		return mb_convert_encoding(PHP4NS::trim($field_value),"UTF-8","ISO-8859-1");
	}
	//
	function doMethod($param_arr){
		$user_arr=array();
		$user_setting_arr=array();
		$consumer_arr=array();
		$contact_arr=array();
		$product_arr=array();
		$service_call_arr=array();
		$service_call_machine_arr=array();
		$service_call_user_arr=array();
		$service_task_arr=array();
		$service_task_product_arr=array();
		$service_task_report_arr=array();
		$service_task_report_mail_arr=array();
		$service_task_user_arr=array();
		$service_operation_arr=array();
		$service_operation_machine_arr=array();
		$service_extra_arr=array();
		$service_trip_arr=array();
		$autodop_verbal_arr=array();
		$autodop_verbal_mail_arr=array();
		//
		$ts_start=microtime(true);
		//
		try{
			$this->database->initTransaction();
			//
			//CHECK AUTHORIZAZION
			$this->custom->validateBasicAuth();
			//
			//CHECK PARAM
			//
			$id_user=$this->getFieldFixed($param_arr["id_user"]??null);
			$check_user=(int)$this->getFieldFixed($param_arr["check_user"]??"1");
			//
			if($check_user==1 && $id_user==null){
				throw new Exception("WS_ERROR_USER_NOT_VALID");
			}
			//
			if($check_user==1){
				$u_res=$this->database->getItem("user",array("id"=>$id_user));
				if(is_empty($u_res["id"])){
					throw new Exception("WS_ERROR_USER_NOT_VALID");
				}
			}
			//
			if(is_array($param_arr["data"]) && count($param_arr["data"])>0){
				foreach($param_arr["data"] as $table=>$data_arr){
					if(!is_empty($data_arr)){
						if($table=="user"){
							$user_arr=$this->user_Inup($data_arr,null);
						}
						else if($table=="user_setting"){
							$user_setting_arr=$this->userSetting_Inup($data_arr,null);
						}
						else if($table=="consumer"){
							$consumer_arr=$this->consumer_Inup($data_arr,null);
						}
						else if($table=="contact"){
							$contact_arr=$this->contact_Inup($data_arr,null);
						}
						else if($table=="product"){
							$product_arr=$this->product_Inup($data_arr,null);
						}
						else if($table=="service_call"){
							$service_call_arr=$this->serviceCall_Inup($data_arr,null);
						}
						else if($table=="service_call_machine"){
							$service_call_machine_arr=$this->serviceCallMachine_Inup($data_arr,$service_call_arr,null);
						}
						else if($table=="service_call_user"){
							$service_call_user_arr=$this->serviceCallUser_Inup($data_arr,$service_call_arr,null);
						}
						else if($table=="service_task"){
							$service_task_arr=$this->serviceTask_Inup($data_arr,$service_call_arr,null);
						}
						else if($table=="service_task_product"){
							$service_task_product_arr=$this->serviceTaskProduct_Inup($data_arr,$service_task_arr,$product_arr,null);
						}
						else if($table=="service_task_report"){
							$service_task_report_arr=$this->serviceTaskReport_Inup($data_arr,$service_task_arr,null);
						}
						else if($table=="service_task_report_mail"){
							$service_task_report_mail_arr=$this->serviceTaskReportMail_Inup($data_arr,$service_task_report_arr,null);
						}
						else if($table=="service_task_user"){
							$service_task_user_arr=$this->serviceTaskUser_Inup($data_arr,$service_task_arr,null);
						}
						else if($table=="service_operation"){
							$service_operation_arr=$this->serviceOperation_Inup($data_arr,$service_call_arr,$service_task_arr,null);
						}
						else if($table=="service_operation_machine"){
							$service_operation_machine_arr=$this->serviceOperationMachine_Inup($data_arr,$service_call_arr,$service_task_arr,$service_operation_arr,null);
						}
						else if($table=="service_extra"){
							$service_extra_arr=$this->serviceExtra_Inup($data_arr,$service_task_arr,null);
						}
						else if($table=="service_trip"){
							$service_trip_arr=$this->serviceTrip_Inup($data_arr,$service_task_arr,$consumer_arr,null);
						}
						else if($table=="autodop_verbal"){
							$autodop_verbal_arr=$this->autodopVerbal_Inup($data_arr,null);
						}
						else if($table=="autodop_verbal_mail"){
							$autodop_verbal_mail_arr=$this->autodopVerbalMail_Inup($data_arr,$autodop_verbal_arr,null);
						}
					}
				}
			}
			//
			$this->database->commitTransaction();
		}
		catch(Exception $e){
			$this->database->rollbackTransaction();
			//
			throw $e;
		}
		//
		$ret_arr=array(
			"table_arr"=>array(
				"user"=>$user_arr,
				"user_setting"=>$user_setting_arr,
				"consumer"=>$consumer_arr,
				"contact"=>$contact_arr,
				"product"=>$product_arr,
				"service_call"=>$service_call_arr,
				"service_call_machine"=>$service_call_machine_arr,
				"service_call_user"=>$service_call_user_arr,
				"service_task"=>$service_task_arr,
				"service_task_product"=>$service_task_product_arr,
				"service_task_report"=>$service_task_report_arr,
				"service_task_report_mail"=>$service_task_report_mail_arr,
				"service_task_user"=>$service_task_user_arr,
				"service_operation"=>$service_operation_arr,
				"service_operation_machine"=>$service_operation_machine_arr,
				"service_extra"=>$service_extra_arr,
				"service_trip"=>$service_trip_arr,
				"autodop_verbal_mail"=>$autodop_verbal_mail_arr,
				"autodop_verbal"=>$autodop_verbal_arr,
			),
			"ts_execution"=>number_format((float)(microtime(true)-$ts_start),3,".",""),
		);
		//
		return $ret_arr;
	}
}
