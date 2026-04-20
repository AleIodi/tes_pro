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
	function getFieldFixed($field_value){
		return mb_convert_encoding(PHP4NS::trim($field_value),"ISO-8859-1","UTF-8");
	}
	//
	function doMethod($param_arr){
		$ret_arr=array();
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
			$table_info_arr=$param_arr["table_info_arr"]??null;
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
			$pull_param_fixed_arr=array();
			//
			//PULL WITH TYPE
			//
			if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
				$pull_param_fixed_arr["type"]=$param_arr["pull_param_arr"]["type"];
				//
				$datacrypt=$this->def_manager["service"]->decryptString($param_arr["pull_param_arr"]["datacrypt"]);
				$datacrypt_arr=json_decode($datacrypt,true);
				//
				//TYPE = SERVICE_TASK_REPORT
				//
				if($param_arr["pull_param_arr"]["type"]=="SERVICE_TASK_REPORT"){
					$str_res=$this->database->getItem("service_task_report",array("id"=>$datacrypt_arr["idr_service_task_report"]));
					$pull_param_fixed_arr["id_str_arr"][]=$str_res["id"];
					//
					$st_res=$this->database->getItem("service_task",array("id"=>$str_res["row"]["id_service_task"]));
					$pull_param_fixed_arr["id_st_arr"][]=$st_res["id"];
					//
					if(!is_empty($st_res["row"]["id_contact"])){
						$cnt_res=$this->database->getItem("contact",array("id"=>$st_res["row"]["id_contact"]));
						$pull_param_fixed_arr["id_cnt_arr"][]=$cnt_res["id"];
					}
					//
					//SERVICE_OPERATION
					$so_res=$this->database->getItems("service_operation",array("id_service_task"=>$str_res["row"]["id_service_task"]));
					$pull_param_fixed_arr["id_so_arr"]=array_column($so_res["rows"],"id");
					//
					foreach($so_res["rows"] as $so_row){
						$u_check_res=$this->database->getItem("user",array("id"=>$so_row["id_user"]));
						$this->pushIfNotExists($pull_param_fixed_arr,"id_u_arr",$u_check_res["id"]);
						//
						//USER_GROUP
						//
						$ugl_check_res=$this->database->getItems("user_group_link",array("id_user"=>$u_check_res["id"]));
						foreach($ugl_check_res["rows"] as $ugl_check_row){
							$this->pushIfNotExists($pull_param_fixed_arr,"id_ug_arr",$ugl_check_row["id_user_group"]);
						}
						//
						$jd_res=$this->database->getItem("job_details",array("id"=>$so_row["id_job_details"]));
						$this->pushIfNotExists($pull_param_fixed_arr,"id_jd_arr",$jd_res["id"]);
						//
						$jda_res=$this->database->getItem("job_details_action",array("id"=>$jd_res["row"]["id_job_details_action"]));
						$this->pushIfNotExists($pull_param_fixed_arr,"id_jda_arr",$jda_res["id"]);
						//
						$j_res=$this->database->getItem("job",array("id"=>$jd_res["row"]["id_job"]));
						$this->pushIfNotExists($pull_param_fixed_arr,"id_j_arr",$j_res["id"]);
						//
						$cns_res=$this->database->getItem("consumer",array("id"=>$j_res["row"]["id_consumer"]));
						$this->pushIfNotExists($pull_param_fixed_arr,"id_cns_arr",$cns_res["id"]);
						//
						//SERVICE_OPERATION_MACHINE
						$som_res=$this->database->getItems("service_operation_machine",array("id_service_operation"=>$so_row["id"]));
						//
						foreach($som_res["rows"] as $som_row){
							$this->pushIfNotExists($pull_param_fixed_arr,"id_som_arr",$som_row["id"]);
							//
							$m_res=$this->database->getItem("machine",array("id"=>$som_row["id_machine"]));
							$this->pushIfNotExists($pull_param_fixed_arr,"id_m_arr",$m_res["id"]);
						}
					}
					//
					//SERVICE_EXTRA
					$se_res=$this->database->getItems("service_extra",array("id_service_task"=>$st_res["id"]));
					$pull_param_fixed_arr["id_se_arr"]=array_column($se_res["rows"],"id");
					//
					foreach($se_res["rows"] as $se_row){
						$u_check_res=$this->database->getItem("user",array("id"=>$se_row["id_user"]));
						$this->pushIfNotExists($pull_param_fixed_arr,"id_u_arr",$u_check_res["id"]);
						//
						//USER_GROUP
						//
						$ugl_check_res=$this->database->getItems("user_group_link",array("id_user"=>$u_check_res["id"]));
						foreach($ugl_check_res["rows"] as $ugl_check_row){
							$this->pushIfNotExists($pull_param_fixed_arr,"id_ug_arr",$ugl_check_row["id_user_group"]);
						}
						//
						$j_res=$this->database->getItem("job",array("id"=>$se_row["id_job"]));
						$this->pushIfNotExists($pull_param_fixed_arr,"id_j_arr",$j_res["id"]);
					}
					//
					//SERVICE_TASK_PRODUCT
					$stp_res=$this->database->getItems("service_task_product",array("id_service_task"=>$st_res["row"]["id"]));
					$pull_param_fixed_arr["id_stp_arr"]=array_column($stp_res["rows"],"id");
					//
					foreach($stp_res["rows"] as $stp_row){
						$u_check_res=$this->database->getItem("user",array("id"=>$stp_row["id_user"]));
						$this->pushIfNotExists($pull_param_fixed_arr,"id_u_arr",$u_check_res["id"]);
						//
						//USER_GROUP
						//
						$ugl_check_res=$this->database->getItems("user_group_link",array("id_user"=>$u_check_res["id"]));
						foreach($ugl_check_res["rows"] as $ugl_check_row){
							$this->pushIfNotExists($pull_param_fixed_arr,"id_ug_arr",$ugl_check_row["id_user_group"]);
						}
						//
						$p_res=$this->database->getItem("product",array("id"=>$stp_row["id_product"]));
						$this->pushIfNotExists($pull_param_fixed_arr,"id_p_arr",$p_res["id"]);
					}
					//
					//SERVICE_TRIP
					$strp_res=$this->database->getItems("service_trip",array("id_service_task"=>$st_res["row"]["id"]));
					$pull_param_fixed_arr["id_strp_arr"]=array_column($strp_res["rows"],"id");
					//
					foreach($strp_res["rows"] as $strp_row){
						$cns_res=$this->database->getItem("consumer",array("id"=>$strp_row["id_destination"]));
						$this->pushIfNotExists($pull_param_fixed_arr,"id_cns_arr",$cns_res["id"]);
						//
						$cns_res=$this->database->getItem("consumer",array("id"=>$cns_res["row"]["id_consumer_parent"]));
						$this->pushIfNotExists($pull_param_fixed_arr,"id_cns_arr",$cns_res["id"]);
					}
					//
					//SERVICE_TASK_USER
					$stu_res=$this->database->getItems("service_task_user",array("id_service_task"=>$st_res["row"]["id"]));
					$pull_param_fixed_arr["id_stu_arr"]=array_column($stu_res["rows"],"id");
					//
					foreach($stu_res["rows"] as $stu_row){
						$u_check_res=$this->database->getItem("user",array("id"=>$stu_row["id_user"]));
						$this->pushIfNotExists($pull_param_fixed_arr,"id_u_arr",$u_check_res["id"]);
						//
						//USER_GROUP
						//
						$ugl_check_res=$this->database->getItems("user_group_link",array("id_user"=>$u_check_res["id"]));
						foreach($ugl_check_res["rows"] as $ugl_check_row){
							$this->pushIfNotExists($pull_param_fixed_arr,"id_ug_arr",$ugl_check_row["id_user_group"]);
						}
					}
				}
				//
				//TYPE = AUTODOP_VERBAL
				//
				else if($param_arr["pull_param_arr"]["type"]=="AUTODOP_VERBAL"){
					$av_res=$this->database->getItem("autodop_verbal",array("id"=>$datacrypt_arr["idr_autodop_verbal"]));
					$pull_param_fixed_arr["id_av_arr"][]=$av_res["id"];
					//
					$u_check_res=$this->database->getItem("user",array("id"=>$av_res["row"]["id_user"]));
					$this->pushIfNotExists($pull_param_fixed_arr,"id_u_arr",$u_check_res["id"]);
					//
					$ugl_check_res=$this->database->getItems("user_group_link",array("id_user"=>$u_check_res["id"]));
					foreach($ugl_check_res["rows"] as $ugl_check_row){
						$this->pushIfNotExists($pull_param_fixed_arr,"id_ug_arr",$ugl_check_row["id_user_group"]);
					}
					//
					$j_res=$this->database->getItem("job",array("id"=>$av_res["row"]["id_job"]));
					$this->pushIfNotExists($pull_param_fixed_arr,"id_j_arr",$j_res["id"]);
					//
					$cns_res=$this->database->getItem("consumer",array("id"=>$av_res["row"]["id_destination"]));
					$this->pushIfNotExists($pull_param_fixed_arr,"id_cns_arr",$cns_res["id"]);
					//
					$cns_res=$this->database->getItem("consumer",array("id"=>$cns_res["row"]["id_consumer_parent"]));
					$this->pushIfNotExists($pull_param_fixed_arr,"id_cns_arr",$cns_res["id"]);
					//
					$m_res=$this->database->getItem("machine",array("id"=>$av_res["row"]["id_machine"]));
					$pull_param_fixed_arr["id_m_arr"][]=$m_res["id"];
				}
			}
			else{
				$pull_param_fixed_arr=$param_arr["pull_param_arr"];
			}
			//
			$date_pull=date("Y-m-d H:i:s");
			//
			$ret_table_arr=array();
			foreach($table_info_arr as $table_info){
				$function_name=sprintf("get%sArr",$this->underscore2firstLowerCase($table_info["table"]));
				//
				$get_param_arr=array(
					"id_user"=>$u_res["id"]??null,
					"last_update"=>$table_info["last_update"]??null,
					"pull_param_arr"=>$pull_param_fixed_arr,
					"table_column_arr"=>$table_info["table_column_arr"]??null,
				);
				//
				$ret_table_arr[$table_info["table"]]["rows"]=$this->$function_name($get_param_arr);
				$ret_table_arr[$table_info["table"]]["last_update"]=$date_pull;
			}
			//
			$ret_arr["table_arr"]=$ret_table_arr;
			//
			$this->database->commitTransaction();
		}
		catch(Exception $e){
			$this->database->rollbackTransaction();
			//
			throw $e;
		}
		//
		$ret_arr["ts_execution"]=number_format((float)(microtime(true)-$ts_start),3,".","");
		//
		return $ret_arr;
	}
	//
	function underscore2firstLowerCase($text){
		return lcfirst(PHP4NS::str_replace(" ","",ucwords(PHP4NS::str_replace("_"," ",$text))));
	}
	//
	function pushIfNotExists(&$array,$array_key,$value){
		if(!array_key_exists($array_key,$array)){
			$array[$array_key]=array();
		}
		//
		if(!in_array($value,$array[$array_key])){
			$array[$array_key][]=$value;
		}
	}
	//
	public function getSelectExceptColumnString($table,$table_alias=null,$table_column_arr=array()){
		$table_alias=$table_alias?$table_alias.".":"";
		//
		$select_sql=sprintf("
				SELECT
				STRING_AGG('%s' || QUOTE_IDENT(attname) || ' AS ' || REPLACE(QUOTE_IDENT(attname),'id_','idr_'),', ' ORDER BY attnum) AS column_list
				
				FROM
				pg_attribute
				
				WHERE
				attrelid='public.%s'::regclass
				AND
				NOT ATTISDROPPED
				AND
				attnum>0
				AND
				attname IN ('%s')
				",
				$table_alias,
				$table,
				PHP4NS::implode("','",$table_column_arr)
				);
		$select_res=$this->database->getRows($select_sql);
		//
		return $select_res["rows"][0]["column_list"];
	}
	//
	//GET TABLE DATA ARR
	//
	public function getUserGroupArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_ug_arr"])){
				$where.=sprintf(" AND ug.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_ug_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND ug.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("user_group","ug",$param_arr["table_column_arr"]);
		//
		$ug_sql=sprintf("
					SELECT
					ug.id AS idr,
					%s
					
					FROM
					user_group AS ug
					
					WHERE
					ug.id_module_typology=%s
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$this->def_config["module_typology_arr"]["modules"]["id"],
					$where
					);
		$ug_res=$this->database->getRows($ug_sql);
		//
		return $ug_res["rows"];
	}
	//
	public function getUserArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_u_arr"])){
				$where.=sprintf(" AND u.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_u_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND u.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$table_column_arr=array_diff($param_arr["table_column_arr"],array("id_user_group"));
		$select=$this->getSelectExceptColumnString("user","u",$table_column_arr);
		//
		$u_sql=sprintf("
					SELECT
					u.id AS idr,
					(
						SELECT
						MIN(ugl_1.id_user_group) AS id_ug

						FROM
						user_group_link AS ugl_1

						WHERE
						ugl_1.id_user=u.id
					) AS idr_user_group,
					%s
					
					FROM
					\"user\" AS u
					
					WHERE
					EXISTS
					(
						SELECT
						1
						
						FROM
						user_group_link AS ugl_1
						INNER JOIN user_group AS ug_1		ON ugl_1.id_user_group=ug_1.id
						
						WHERE
						ugl_1.id_user=u.id
						AND
						ug_1.id_module_typology=%s
					)
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$this->def_config["module_typology_arr"]["modules"]["id"],
					$where
					);
		$u_res=$this->database->getRows($u_sql);
		//
		return $u_res["rows"];
	}
	//
	public function getUserUserChildArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			return array();
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND ucc.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("user_user_child","ucc",$param_arr["table_column_arr"]);
		//
		$ucc_sql=sprintf("
					SELECT
					ucc.id AS idr,
					%s
					
					FROM
					user_user_child AS ucc
					
					WHERE
					ucc.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$ucc_res=$this->database->getRows($ucc_sql);
		//
		return $ucc_res["rows"];
	}
	//
	public function getUserSettingArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			return array();
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND uss.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("user_setting","uss",$param_arr["table_column_arr"]);
		//
		$uss_sql=sprintf("
					SELECT
					uss.id AS idr,
					%s
					
					FROM
					user_setting AS uss
					INNER JOIN \"user\" AS u		ON uss.id_user=u.id
					
					WHERE
					EXISTS
					(
						SELECT
						1
						
						FROM
						user_group_link AS ugl_1
						INNER JOIN user_group AS ug_1		ON ugl_1.id_user_group=ug_1.id
						
						WHERE
						ugl_1.id_user=u.id
						AND
						ug_1.id_module_typology=%s
					)
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$this->def_config["module_typology_arr"]["modules"]["id"],
					$where
					);
		$uss_res=$this->database->getRows($uss_sql);
		//
		return $uss_res["rows"];
	}
	//
	public function getConsumerTypologyArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			$where.="";
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND cnst.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("consumer_typology","cnst",$param_arr["table_column_arr"]);
		//
		$cnst_sql=sprintf("
					SELECT
					cnst.id AS idr,
					%s
					
					FROM
					consumer_typology AS cnst
					
					WHERE
					cnst.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$cnst_res=$this->database->getRows($cnst_sql);
		//
		return $cnst_res["rows"];
	}
	//
	public function getConsumerArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_cns_arr"])){
				$where.=sprintf(" AND cns.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_cns_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND cns.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("consumer","cns",$param_arr["table_column_arr"]);
		//
		$cns_sql=sprintf("
					SELECT
					cns.id AS idr,
					%s
					
					FROM
					consumer AS cns
					
					WHERE
					cns.id>0
					%s
					
					ORDER BY cns.id_consumer_typology ASC,idr ASC
					",
					$select,
					$where
					);
		$cns_res=$this->database->getRows($cns_sql);
		//
		return $cns_res["rows"];
	}
	//
	public function getJobArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_j_arr"])){
				$where.=sprintf(" AND j.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_j_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND j.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("job","j",$param_arr["table_column_arr"]);
		//
		$j_sql=sprintf("
					SELECT
					j.id AS idr,
					%s
					
					FROM
					job AS j
					INNER JOIN consumer AS cns		ON j.id_consumer=cns.id
					
					WHERE
					1=1
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$j_res=$this->database->getRows($j_sql);
		//
		return $j_res["rows"];
	}
	//
	public function getJobTypologyArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			$where.="";
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND jt.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("job_typology","jt",$param_arr["table_column_arr"]);
		//
		$jt_sql=sprintf("
					SELECT
					jt.id AS idr,
					%s
					
					FROM
					job_typology AS jt
					
					WHERE
					jt.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$jt_res=$this->database->getRows($jt_sql);
		//
		return $jt_res["rows"];
	}
	//
	public function getJobDetailsActionArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_jda_arr"])){
				$where.=sprintf(" AND jda.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_jda_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND jda.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("job_details_action","jda",$param_arr["table_column_arr"]);
		//
		$jda_sql=sprintf("
					SELECT
					jda.id AS idr,
					%s
					
					FROM
					job_details_action AS jda
					
					WHERE
					jda.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$jda_res=$this->database->getRows($jda_sql);
		//
		return $jda_res["rows"];
	}
	//
	public function getJobDetailsArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_jd_arr"])){
				$where.=sprintf(" AND jd.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_jd_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND jd.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("job_details","jd",$param_arr["table_column_arr"]);
		//
		$jd_sql=sprintf("
					SELECT
					jd.id AS idr,
					%s
					
					FROM
					job_details AS jd
					INNER JOIN job AS j				ON j.id=jd.id_job
					INNER JOIN job_details_action AS jda		ON jd.id_job_details_action=jda.id
					
					WHERE
					1=1
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$jd_res=$this->database->getRows($jd_sql);
		//
		return $jd_res["rows"];
	}
	//
	public function getContactArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_cnt_arr"])){
				$where.=sprintf(" AND cnt.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_cnt_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND cnt.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("contact","cnt",$param_arr["table_column_arr"]);
		//
		$cnt_sql=sprintf("
					SELECT
					cnt.id AS idr,
					%s
					
					FROM
					contact AS cnt
					INNER JOIN consumer AS cns		ON cnt.id_consumer=cns.id
					
					WHERE
					1=1
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$cnt_res=$this->database->getRows($cnt_sql);
		//
		return $cnt_res["rows"];
	}
	//
	public function getMachineTypologyArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			$where.="";
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND mt.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("machine_typology","mt",$param_arr["table_column_arr"]);
		//
		$mt_sql=sprintf("
					SELECT
					mt.id AS idr,
					%s
					
					FROM
					machine_typology AS mt
					
					WHERE
					mt.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$mt_res=$this->database->getRows($mt_sql);
		//
		return $mt_res["rows"];
	}
	//
	public function getMachineArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_m_arr"])){
				$where.=sprintf(" AND m.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_m_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND m.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("machine","m",$param_arr["table_column_arr"]);
		//
		$m_sql=sprintf("
					SELECT
					m.id AS idr,
					%s
					
					FROM
					machine AS m
					
					WHERE
					m.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$m_res=$this->database->getRows($m_sql);
		//
		return $m_res["rows"];
	}
	//
	public function getProductTypologyArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			$where.="";
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND pt.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("product_typology","pt",$param_arr["table_column_arr"]);
		//
		$pt_sql=sprintf("
					SELECT
					pt.id AS idr,
					%s
					
					FROM
					product_typology AS pt
					
					WHERE
					pt.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$pt_res=$this->database->getRows($pt_sql);
		//
		return $pt_res["rows"];
	}
	//
	public function getProductArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_p_arr"])){
				$where.=sprintf(" AND p.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_p_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND p.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("product","p",$param_arr["table_column_arr"]);
		//
		$p_sql=sprintf("
					SELECT
					p.id AS idr,
					%s
					
					FROM
					product AS p
					
					WHERE
					p.id>0
					
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$p_res=$this->database->getRows($p_sql);
		//
		return $p_res["rows"];
	}
	//
	public function getServiceTypologyArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			$where.="";
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND sty.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("service_typology","sty",$param_arr["table_column_arr"]);
		//
		$st_sql=sprintf("
					SELECT
					sty.id AS idr,
					%s
					
					FROM
					service_typology AS sty
					
					WHERE
					sty.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$st_res=$this->database->getRows($st_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($st_res["rows"])));
		//
		return $st_res["rows"];
	}
	//
	public function getServiceCallStatusArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			$where="";
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND scs.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("service_call_status","scs",$param_arr["table_column_arr"]);
		//
		$scs_sql=sprintf("	SELECT
					scs.id AS idr,
					%s
					
					FROM
					service_call_status AS scs
					
					WHERE
					scs.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$scs_res=$this->database->getRows($scs_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($scs_res["rows"])));
		//
		return $scs_res["rows"];
	}
	//
	public function getServiceCallArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_sc_arr"])){
				$where.=sprintf(" AND sc.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_sc_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND sc.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$where_user="";
		if(isset($param_arr["id_user"])){
			$u_res=$this->database->getItem("user",array("id"=>$param_arr["id_user"]));
			//
			$ug_rows=$this->def_manager["user"]->getUserGroupRows($u_res["row"],true);
			$id_ug_arr=array_column($ug_rows,"id");
			//
			if(
				!in_array($this->def_config["user_group_arr"]["SUPER"]["id"],$id_ug_arr) &&
				!in_array($this->def_config["user_group_arr"]["ALL"]["id"],$id_ug_arr)
			){
				$where_user=sprintf("	AND
							(
								NOT EXISTS
								(
									SELECT
									1
									
									FROM
									service_call_user
									
									WHERE
									id_service_call=sc.id
									AND
									enabled=1
								)
								OR
								EXISTS
								(
									SELECT
									1
									
									FROM
									service_call_user
									
									WHERE
									id_service_call=sc.id
									AND
									enabled=1
									AND
									id_user=%s
								)
								OR
								EXISTS
								(
									SELECT
									1
									
									FROM
									service_task_user
									
									WHERE
									id_service_task=st.id
									AND
									enabled=1
									AND
									id_user=%s
								)
								OR
								sc.id_user_creator=%s
							)
							",
							$param_arr["id_user"],
							$param_arr["id_user"],
							$param_arr["id_user"]
							);
			}
		}
		//
		$select=$this->getSelectExceptColumnString("service_call","sc",$param_arr["table_column_arr"]);
		//
		$sc_sql=sprintf("
					SELECT
					sc.id AS idr,
					%s
					
					FROM
					service_call AS sc
					LEFT JOIN service_task AS st		ON st.id_service_call=sc.id
					
					WHERE
					sc.id>0
					%s
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where_user,
					$where
					);
		$sc_res=$this->database->getRows($sc_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($sc_res["rows"])));
		//
		return $sc_res["rows"];
	}
	//
	public function getServiceCallMachineArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_scm_arr"])){
				$where.=sprintf(" AND scm.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_scm_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND scm.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		if(isset($param_arr["id_user"])){
			$u_res=$this->database->getItem("user",array("id"=>$param_arr["id_user"]));
			//
			$ug_rows=$this->def_manager["user"]->getUserGroupRows($u_res["row"],true);
			$id_ug_arr=array_column($ug_rows,"id");
			//
			if(
				!in_array($this->def_config["user_group_arr"]["SUPER"]["id"],$id_ug_arr) &&
				!in_array($this->def_config["user_group_arr"]["ALL"]["id"],$id_ug_arr)
			){
				$scu_sql=sprintf("	SELECT DISTINCT
							scu.id_service_call AS id_service_call
							
							FROM
							service_call_user AS scu
							INNER JOIN service_call AS sc		ON scu.id_service_call=sc.id
							
							WHERE
							sc.enabled=1
							AND
							scu.enabled=1
							AND
							(
								scu.id_user=%s
								OR
								sc.id_user_creator=%s
							)
							",
							$param_arr["id_user"],
							$param_arr["id_user"],
							);
				$scu_res=$this->database->getRows($scu_sql);
				//
				if($scu_res["count"]>0){
					$id_sc_arr=array_unique(array_column($scu_res["rows"],"id_service_call"));
					//
					$where.=sprintf(" AND (scu.id_user=%s OR sc.id IN (%s)) ",$param_arr["id_user"],PHP4NS::implode(",",$id_sc_arr));
				}
				else{
					$where.=sprintf(" AND scu.id_user=%s ",$param_arr["id_user"]);
				}
			}
		}
		//
		$select=$this->getSelectExceptColumnString("service_call_machine","scm",$param_arr["table_column_arr"]);
		//
		$scm_sql=sprintf("
					SELECT DISTINCT
					scm.id AS idr,
					%s
					
					FROM
					service_call_machine AS scm
					INNER JOIN service_call AS sc			ON scm.id_service_call=sc.id
					INNER JOIN service_call_user AS scu		ON scu.id_service_call=sc.id
					
					WHERE
					sc.enabled=1
					AND
					scm.enabled=1
					AND
					scu.enabled=1
					
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$scm_res=$this->database->getRows($scm_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($scm_res["rows"])));
		//
		return $scm_res["rows"];
	}
	//
	public function getServiceCallUserArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_scu_arr"])){
				$where.=sprintf(" AND scu.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_scu_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND scu.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		if(isset($param_arr["id_user"])){
			$u_res=$this->database->getItem("user",array("id"=>$param_arr["id_user"]));
			//
			$ug_rows=$this->def_manager["user"]->getUserGroupRows($u_res["row"],true);
			$id_ug_arr=array_column($ug_rows,"id");
			//
			if(
				!in_array($this->def_config["user_group_arr"]["SUPER"]["id"],$id_ug_arr) &&
				!in_array($this->def_config["user_group_arr"]["ALL"]["id"],$id_ug_arr)
			){
				$where.=sprintf(" AND scu.id_user=%s ",$param_arr["id_user"]);
			}
		}
		//
		$select=$this->getSelectExceptColumnString("service_call_user","scu",$param_arr["table_column_arr"]);
		//
		$scu_sql=sprintf("	SELECT
					scu.id AS idr,
					%s
					
					FROM
					service_call_user AS scu
					INNER JOIN service_call AS sc		ON scu.id_service_call=sc.id
					
					WHERE
					sc.enabled=1
					AND
					scu.enabled=1
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$scu_res=$this->database->getRows($scu_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($scu_res["rows"])));
		//
		return $scu_res["rows"];
	}
	//
	public function getServiceTaskArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_st_arr"])){
				$where.=sprintf(" AND st.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_st_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND st.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$where_user="";
		if(isset($param_arr["id_user"])){
			$where_user=sprintf("	AND
						(
							/*
							NOT EXISTS
							(
								SELECT
								1
								
								FROM
								service_task_user
								
								WHERE
								id_service_task=st.id
								AND
								enabled=1
							)
							OR
							*/
							EXISTS
							(
								SELECT
								1
								
								FROM
								service_task_user
								
								WHERE
								id_service_task=st.id
								AND
								enabled=1
								AND
								id_user=%s
							)
							OR
							st.id_user_creator=%s
							OR
							EXISTS
							(
								SELECT
								1
								
								FROM
								service_operation
								
								WHERE
								id_service_task=st.id
								AND
								enabled=1
								AND
								id_user=%s
							)
						)
						",
						$param_arr["id_user"],
						$param_arr["id_user"],
						$param_arr["id_user"]
						);
		}
		//
		$select=$this->getSelectExceptColumnString("service_task","st",$param_arr["table_column_arr"]);
		//
		$st_sql=sprintf("	SELECT
					st.id AS idr,
					%s
					
					FROM
					service_task AS st
					
					WHERE
					st.id>%s
					AND
					st.enabled=1
					AND
					st.revision_number=0
					AND
					st.is_revision_wip=0
					%s
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$this->def_config["ws_pull_id_service_task_start"]??"0",
					$where_user,
					$where
					);
		$st_res=$this->database->getRows($st_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($st_res["rows"])));
		//
		return $st_res["rows"];
	}
	//
	public function getServiceOperationTypologyArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			$where.="";
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND sot.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("service_operation_typology","sot",$param_arr["table_column_arr"]);
		//
		$sot_sql=sprintf("
					SELECT
					sot.id AS idr,
					%s
					
					FROM
					service_operation_typology AS sot
					
					WHERE
					sot.enabled=1
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$sot_res=$this->database->getRows($sot_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($sot_res["rows"])));
		//
		return $sot_res["rows"];
	}
	//
	public function getServiceOperationArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_so_arr"])){
				$where.=sprintf(" AND so.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_so_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND so.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		if(isset($param_arr["id_user"])){
			$stu_sql=sprintf("	SELECT DISTINCT
						stu.id_service_task AS id_service_task
						
						FROM
						service_task_user AS stu
						INNER JOIN service_task AS st			ON stu.id_service_task=st.id
						
						WHERE
						st.enabled=1
						AND
						st.revision_number=0
						AND
						st.is_revision_wip=0
						AND
						stu.enabled=1
						AND
						(
							stu.id_user=%s
							OR
							st.id_user_creator=%s
						)
						AND
						stu.id_service_task>%s
						",
						$param_arr["id_user"],
						$param_arr["id_user"],
						$this->def_config["ws_pull_id_service_task_start"]??"0"
						);
			$stu_res=$this->database->getRows($stu_sql);
			//
			if($stu_res["count"]>0){
				$id_st_arr=array_unique(array_column($stu_res["rows"],"id_service_task"));
				//
				$where.=sprintf(" AND (so.id_user=%s OR st.id IN (%s)) ",$param_arr["id_user"],PHP4NS::implode(",",$id_st_arr));
			}
			else{
				$where.=sprintf(" AND so.id_user=%s ",$param_arr["id_user"]);
			}
		}
		//
		$select=$this->getSelectExceptColumnString("service_operation","so",$param_arr["table_column_arr"]);
		//
		$so_sql=sprintf("	SELECT
					so.id AS idr,
					%s
					
					FROM
					service_operation AS so
					INNER JOIN service_task AS st			ON so.id_service_task=st.id
					
					WHERE
					so.enabled=1
					AND
					st.enabled=1
					AND
					st.revision_number=0
					AND
					st.is_revision_wip=0
					AND
					st.id>%s
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$this->def_config["ws_pull_id_service_task_start"]??"0",
					$where
					);
		$so_res=$this->database->getRows($so_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($so_res["rows"])));
		//
		return $so_res["rows"];
	}
	//
	public function getServiceOperationMachineArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_som_arr"])){
				$where.=sprintf(" AND som.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_som_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND som.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		if(isset($param_arr["id_user"])){
			$stu_sql=sprintf("	SELECT DISTINCT
						stu.id_service_task AS id_service_task
						
						FROM
						service_task_user AS stu
						INNER JOIN service_task AS st			ON stu.id_service_task=st.id
						
						WHERE
						st.enabled=1
						AND
						stu.enabled=1
						AND
						st.revision_number=0
						AND
						st.is_revision_wip=0
						AND
						(
							stu.id_user=%s
							OR
							st.id_user_creator=%s
						)
						AND
						stu.id_service_task>%s
						",
						$param_arr["id_user"],
						$param_arr["id_user"],
						$this->def_config["ws_pull_id_service_task_start"]??"0"
						);
			$stu_res=$this->database->getRows($stu_sql);
			//
			if($stu_res["count"]>0){
				$id_st_arr=array_unique(array_column($stu_res["rows"],"id_service_task"));
				//
				$where.=sprintf(" AND (so.id_user=%s OR so.id_service_task IN (%s)) ",$param_arr["id_user"],PHP4NS::implode(",",$id_st_arr));
			}
			else{
				$where.=sprintf(" AND so.id_user=%s ",$param_arr["id_user"]);
			}
		}
		//
		$select=$this->getSelectExceptColumnString("service_operation_machine","som",$param_arr["table_column_arr"]);
		//
		$som_sql=sprintf("
					SELECT
					som.id AS idr,
					%s
					
					FROM
					service_operation_machine AS som
					INNER JOIN service_operation AS so		ON som.id_service_operation=so.id
					INNER JOIN service_task AS st			ON so.id_service_task=st.id
					
					WHERE
					st.enabled=1
					AND
					so.enabled=1
					AND
					som.enabled=1
					AND
					st.revision_number=0
					AND
					st.is_revision_wip=0
					AND
					so.id_service_task>%s
					
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$this->def_config["ws_pull_id_service_task_start"]??"0",
					$where
					);
		$som_res=$this->database->getRows($som_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($som_res["rows"])));
		//
		return $som_res["rows"];
	}
	//
	public function getServiceTaskProductArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_stp_arr"])){
				$where.=sprintf(" AND stp.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_stp_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND stp.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		if(isset($param_arr["id_user"])){
			$stu_sql=sprintf("	SELECT DISTINCT
						stu.id_service_task AS id_service_task
						
						FROM
						service_task_user AS stu
						INNER JOIN service_task AS st			ON stu.id_service_task=st.id
						
						WHERE
						st.enabled=1
						AND
						stu.enabled=1
						AND
						st.revision_number=0
						AND
						st.is_revision_wip=0
						AND
						(
							stu.id_user=%s
							OR
							st.id_user_creator=%s
						)
						AND
						stu.id_service_task>%s
						",
						$param_arr["id_user"],
						$param_arr["id_user"],
						$this->def_config["ws_pull_id_service_task_start"]??"0"
						);
			$stu_res=$this->database->getRows($stu_sql);
			//
			if($stu_res["count"]>0){
				$id_st_arr=array_unique(array_column($stu_res["rows"],"id_service_task"));
				//
				$where.=sprintf(" AND (stp.id_service_task IN (%s)) ",PHP4NS::implode(",",$id_st_arr));
			}
			else{
				$where.=sprintf(" AND stp.id_user=%s ",$param_arr["id_user"]);
			}
		}
		//
		$select=$this->getSelectExceptColumnString("service_task_product","stp",$param_arr["table_column_arr"]);
		//
		$stp_sql=sprintf("	SELECT
					stp.id AS idr,
					%s
					
					FROM
					service_task_product AS stp
					INNER JOIN service_task AS st			ON stp.id_service_task=st.id
					
					WHERE
					st.enabled=1
					AND
					stp.enabled=1
					AND
					st.revision_number=0
					AND
					st.is_revision_wip=0
					AND
					stp.id_service_task>%s
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$this->def_config["ws_pull_id_service_task_start"]??"0",
					$where
					);
		$stp_res=$this->database->getRows($stp_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($stp_res["rows"])));
		//
		return $stp_res["rows"];
	}
	//
	public function getServiceTaskReportArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_str_arr"])){
				$where.=sprintf(" AND str.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_str_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND str.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		//estraggo tutti i imiei task (senza guardare la data) e aggiorno solo i report dei task che trovo
		$param_fixed_arr=$param_arr;
		unset($param_fixed_arr["last_update"]);
		//
		$st_arr=$this->getServiceTaskArr($param_fixed_arr);
		if(count($st_arr)==0){
			return array();
		}
		$st_code_arr=array_column($st_arr,"code");
		//
		$where.=sprintf(" AND st.code IN ('%s') ",PHP4NS::implode("','",$st_code_arr));
		//
		$select=$this->getSelectExceptColumnString("service_task_report","str",$param_arr["table_column_arr"]);
		//
		$str_sql=sprintf("	SELECT
					str.id AS idr,
					%s
					
					FROM
					service_task_report AS str
					INNER JOIN service_task AS st			ON str.id_service_task=st.id
					
					WHERE
					st.enabled=1
					AND
					str.enabled=1
					AND
					st.revision_number=0
					AND
					st.is_revision_wip=0
					AND
					st.id>%s
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$this->def_config["ws_pull_id_service_task_start"]??"0",
					$where
					);
		$str_res=$this->database->getRows($str_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($str_res["rows"])));
		//
		return $str_res["rows"];
	}
	//
	public function getServiceTaskReportStatusArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			$where="";
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND strs.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("service_task_report_status","strs",$param_arr["table_column_arr"]);
		//
		$strs_sql=sprintf("	SELECT
					strs.id AS idr,
					%s
					
					FROM
					service_task_report_status AS strs
					
					WHERE
					strs.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$strs_res=$this->database->getRows($strs_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($strs_res["rows"])));
		//
		return $strs_res["rows"];
	}
	//
	public function getServiceTaskReportMailArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			return array();
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND strm.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		//estraggo tutti i imiei task (senza guardare la data) e aggiorno solo i report dei task che trovo
		$param_fixed_arr=$param_arr;
		unset($param_fixed_arr["last_update"]);
		//
		$st_arr=$this->getServiceTaskArr($param_fixed_arr);
		if(count($st_arr)==0){
			return array();
		}
		$st_code_arr=array_column($st_arr,"code");
		//
		$where.=sprintf(" AND st.code IN ('%s') ",PHP4NS::implode("','",$st_code_arr));
		//
		$select=$this->getSelectExceptColumnString("service_task_report_mail","strm",$param_arr["table_column_arr"]);
		//
		$strm_sql=sprintf("	SELECT
					strm.id AS idr,
					%s
					
					FROM
					service_task_report_mail AS strm
					INNER JOIN service_task_report AS str		ON strm.id_service_task_report=str.id
					INNER JOIN service_task AS st			ON str.id_service_task=st.id
					
					WHERE
					st.enabled=1
					AND
					str.enabled=1
					AND
					st.revision_number=0
					AND
					st.is_revision_wip=0
					AND
					str.id_service_task>%s
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$this->def_config["ws_pull_id_service_task_start"]??"0",
					$where
					);
		$strm_res=$this->database->getRows($strm_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($strm_res["rows"])));
		//
		return $strm_res["rows"];
	}
	//
	public function getServiceTaskUserArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_stu_arr"])){
				$where.=sprintf(" AND stu.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_stu_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND stu.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		if(isset($param_arr["id_user"])){
			$where.=sprintf(" AND stu.id_user=%s ",$param_arr["id_user"]);
		}
		//
		$select=$this->getSelectExceptColumnString("service_task_user","stu",$param_arr["table_column_arr"]);
		//
		$stu_sql=sprintf("	SELECT
					stu.id AS idr,
					%s
					
					FROM
					service_task_user AS stu
					INNER JOIN service_task AS st			ON stu.id_service_task=st.id
					
					WHERE
					st.enabled=1
					AND
					stu.enabled=1
					AND
					st.revision_number=0
					AND
					st.is_revision_wip=0
					AND
					stu.id_service_task>%s
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$this->def_config["ws_pull_id_service_task_start"]??"0",
					$where
					);
		$stu_res=$this->database->getRows($stu_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($stu_res["rows"])));
		//
		return $stu_res["rows"];
	}
	//
	public function getServiceExtraArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_se_arr"])){
				$where.=sprintf(" AND se.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_se_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND se.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$where_user="";
		if(isset($param_arr["id_user"])){
			$where_user=sprintf("	OR
						EXISTS
						(
							SELECT
							1
							
							FROM
							service_task_user
							
							WHERE
							id_service_task=st.id
							AND
							enabled=1
							AND
							id_user=%s
							AND
							id_service_task>%s
						)
						",
						$param_arr["id_user"],
						$this->def_config["ws_pull_id_service_task_start"]??"0"
						);
		}
		//
		$select=$this->getSelectExceptColumnString("service_extra","se",$param_arr["table_column_arr"]);
		//
		$se_sql=sprintf("	SELECT
					se.id AS idr,
					%s
					
					FROM
					service_extra AS se
					
					LEFT JOIN service_task AS st			ON se.id_service_task=st.id AND st.enabled=1
					
					WHERE
					se.enabled=1
					AND
					st.revision_number=0
					AND
					st.is_revision_wip=0
					AND
					(
						(
							se.id_service_task IS NULL
							AND
							se.id_user=%s
						)
						OR
						(
							se.id_service_task IS NOT NULL
							AND
							(
								/*
								NOT EXISTS
								(
									SELECT
									1
									
									FROM
									service_task_user
									
									WHERE
									id_service_task=st.id
									AND
									enabled=1
								)
								*/
								1=1
								%s
							)
							AND
							se.id_service_task>%s
						)
					)
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$param_arr["id_user"]??"0",
					$where_user,
					$this->def_config["ws_pull_id_service_task_start"]??"0",
					$where
					);
		$se_res=$this->database->getRows($se_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($se_res["rows"])));
		//
		return $se_res["rows"];
	}
	//
	public function getServiceExtraTypologyArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			$where.="";
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND set.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("service_extra_typology","set",$param_arr["table_column_arr"]);
		//
		$set_sql=sprintf("
					SELECT
					set.id AS idr,
					%s
					
					FROM
					service_extra_typology AS set
					
					WHERE
					set.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$set_res=$this->database->getRows($set_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($set_res["rows"])));
		//
		return $set_res["rows"];
	}
	//
	public function getServiceTripArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_strp_arr"])){
				$where.=sprintf(" AND strp.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_strp_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND strp.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		if(isset($param_arr["id_user"])){
			$stu_sql=sprintf("	SELECT DISTINCT
						stu.id_service_task AS id_service_task
						
						FROM
						service_task_user AS stu
						INNER JOIN service_task AS st			ON stu.id_service_task=st.id
						
						WHERE
						st.enabled=1
						AND
						stu.enabled=1
						AND
						st.revision_number=0
						AND
						st.is_revision_wip=0
						AND
						(
							stu.id_user=%s
							OR
							st.id_user_creator=%s
						)
						AND
						stu.id_service_task>%s
						",
						$param_arr["id_user"],
						$param_arr["id_user"],
						$this->def_config["ws_pull_id_service_task_start"]??"0"
						);
			$stu_res=$this->database->getRows($stu_sql);
			//
			if($stu_res["count"]>0){
				$id_st_arr=array_unique(array_column($stu_res["rows"],"id_service_task"));
				//
				$where.=sprintf(" AND (strp.id_user=%s OR strp.id_service_task IN (%s)) ",$param_arr["id_user"],PHP4NS::implode(",",$id_st_arr));
			}
			else{
				$where.=sprintf(" AND strp.id_user=%s ",$param_arr["id_user"]);
			}
		}
		//
		$select=$this->getSelectExceptColumnString("service_trip","strp",$param_arr["table_column_arr"]);
		//
		$strp_sql=sprintf("	SELECT
					strp.id AS idr,
					%s
					
					FROM
					service_trip AS strp
					INNER JOIN service_task AS st			ON strp.id_service_task=st.id
					
					WHERE
					st.enabled=1
					AND
					strp.enabled=1
					AND
					st.revision_number=0
					AND
					st.is_revision_wip=0
					AND
					strp.id_service_task>%s
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$this->def_config["ws_pull_id_service_task_start"]??"0",
					$where
					);
		$strp_res=$this->database->getRows($strp_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($strp_res["rows"])));
		//
		return $strp_res["rows"];
	}
	//
	public function getAutodopVerbalTypologyArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND avt.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("autodop_verbal_typology","avt",$param_arr["table_column_arr"]);
		//
		$avt_sql=sprintf("
					SELECT
					avt.id AS idr,
					%s
					
					FROM
					autodop_verbal_typology AS avt
					
					WHERE
					avt.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$avt_res=$this->database->getRows($avt_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($avt_res["rows"])));
		//
		return $avt_res["rows"];
	}
	//
	public function getAutodopVerbalStatusArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND avs.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("autodop_verbal_status","avs",$param_arr["table_column_arr"]);
		//
		$avs_sql=sprintf("	SELECT
					avs.id AS idr,
					%s
					
					FROM
					autodop_verbal_status AS avs
					
					WHERE
					avs.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$avs_res=$this->database->getRows($avs_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($avs_res["rows"])));
		//
		return $avs_res["rows"];
	}
	//
	public function getAutodopVerbalArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_av_arr"])){
				$where.=sprintf(" AND av.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_av_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND av.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("autodop_verbal","av",$param_arr["table_column_arr"]);
		//
		$av_sql=sprintf("
					SELECT
					av.id AS idr,
					%s
					
					FROM
					autodop_verbal AS av
					
					WHERE
					av.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$av_res=$this->database->getRows($av_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($av_res["rows"])));
		//
		return $av_res["rows"];
	}
	//
	public function getAutodopVerbalMailArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			return array();
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND avm.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("autodop_verbal_mail","avm",$param_arr["table_column_arr"]);
		//
		$avm_sql=sprintf("	SELECT
					avm.id AS idr,
					%s
					
					FROM
					autodop_verbal_mail AS avm
					
					WHERE
					avm.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$avm_res=$this->database->getRows($avm_sql);
		//
		Log::write(Log::DEBUG,"pull",sprintf("%s - ret_arr: %s",__FUNCTION__,json_encode($avm_res["rows"])));
		//
		return $avm_res["rows"];
	}
	//
	public function getTruckArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && isset($param_arr["pull_param_arr"]["type"])){
			if(!is_empty($param_arr["pull_param_arr"]["id_t_arr"])){
				$where.=sprintf(" AND t.id IN (%s)",PHP4NS::implode(",",$param_arr["pull_param_arr"]["id_t_arr"]));
			}
			else{
				return array();
			}
		}
		//
		if(isset($param_arr["last_update"])){
			$where.=sprintf(" AND t.date_update>'%s' ",$param_arr["last_update"]);
		}
		//
		$select=$this->getSelectExceptColumnString("truck","t",$param_arr["table_column_arr"]);
		//
		$t_sql=sprintf("
					SELECT
					t.id AS idr,
					%s
					
					FROM
					truck AS t
					
					WHERE
					t.id>0
					
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$t_res=$this->database->getRows($t_sql);
		//
		return $t_res["rows"];
	}
	//
	public function getTruckStockArr($param_arr=array()){
		$where="";
		//
		if(isset($param_arr["pull_param_arr"]) && !is_empty($param_arr["pull_param_arr"]["idr_truck"])){
			$where.=sprintf(" AND ts.id_truck=%s",$param_arr["pull_param_arr"]["idr_truck"]);
		}
		else{
			return array();
		}
		//
		$select=$this->getSelectExceptColumnString("truck_stock","ts",$param_arr["table_column_arr"]);
		//
		$ts_sql=sprintf("	SELECT
					ts.id AS idr,
					%s,
					ts.qnt AS qnt_tot,
					COALESCE(stp_not_sent_to_erp.qnt_tot,0) AS qnt_not_sent,
					ts.qnt-COALESCE(stp_not_sent_to_erp.qnt_tot,0) AS qnt
					
					FROM
					truck_stock AS ts
					
					LEFT JOIN
					(
						SELECT
						st.id_truck AS id_truck,
						stp.id_product AS id_product,
						SUM(stp.value) AS qnt_tot
						
						FROM
						service_task_product AS stp
						INNER JOIN service_task AS st		ON stp.id_service_task=st.id AND st.enabled=1
						
						WHERE
						stp.sent_to_erp<2
						AND
						stp.enabled=1
						
						GROUP BY
						st.id_truck,
						stp.id_product
					) AS stp_not_sent_to_erp
					ON
					stp_not_sent_to_erp.id_product=ts.id_product
					AND
					stp_not_sent_to_erp.id_truck=ts.id_truck
					
					WHERE
					ts.id>0
					%s
					
					ORDER BY idr ASC
					",
					$select,
					$where
					);
		$ts_res=$this->database->getRows($ts_sql);
		//
		return $ts_res["rows"];
	}
}
