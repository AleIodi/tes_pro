<?php
class AjaxManager{
	public $def_config;
	public $def_manager;
	public $custom;
	//
	public $database;
	public $page;
	public $req;
	public $is_check_user_session;
	//
	public $id_user;
	public $id_user_group;
	public $id_user_group_arr;
	//
	public $ret;
	public $action_arr;
	//
	public $mi;
	//
	function __construct($database,$page,$req,$is_check_user_session=true){
		global $def_config;
		$this->def_config=$def_config;
		//
		global $def_manager;
		$this->def_manager=$def_manager;
		//
		global $custom;
		$this->custom=$custom;
		//
		if($_SERVER["CONTENT_TYPE"]=="application/json"){
			$raw_str=file_get_contents("php://input");
			$req=json_decode($raw_str,true);
		}
		//
		$this->database=$database;
		$this->page=$page;
		$this->req=$req;
		$this->is_check_user_session=$is_check_user_session;
		//
		$this->id_user=null;
		$this->id_user_group=null;
		$this->id_user_group_arr=array();
		//
		$this->ret=$this->page->getRetArray();
		$this->action_arr=$this->page->getActionArr();
	}
	//
	function __getMi($dir,$file){
		try{
			$this->mi=$this->page->getModuleInfo($dir,$file);
			//
			$this->id_user=$this->mi["ID_USER"];
			$this->id_user_group=$this->mi["ID_USER_GROUP"];
			$this->id_user_group_arr=$this->mi["ID_USER_GROUP_ARR"];
		}
		catch(Exception $e){
			$this->ret["action"]=$this->action_arr["logout"];
			throw $e;
		}
	}
	//
	function __isReqValuePresent($key){
		if(!(array_key_exists($key,$this->req)) || !isset($this->req[$key])){
			return false;
		}
		//
		return true;
	}
	//
	function __reqValidate($key_arr){
		$key_not_found_arr=array();
		foreach($key_arr as $key){
			if(!$this->__isReqValuePresent($key)){
				$key_not_found_arr[]=$key;
			}
		}
		//
		if(count($key_not_found_arr)>0){
			throw new Exception(sprintf("AJAX_ERROR_FIELD_{0}_NOT_FOUND|%s",PHP4NS::implode(",",$key_not_found_arr)));
		}
	}
	//
	function getRequestVar($key,$default=null,$check_exists=true){
		if($check_exists && $default==null){
			$this->__reqValidate(array($key));
		}
		//
		return array_key_exists($key,$this->req)?$this->req[$key]:$default;
	}
	//
	function setRequestVar($key,$value){
		$this->req[$key]=$value;
		//
		return $value;
	}
	//
	function get_select(){
		$select=",COUNT(*) OVER() AS _count";
		//
		return $select;
	}
	//
	function get_where($mainid,$last_update){
		$where_arr=array(
			"mainid"=>$this->get_mainid_where($mainid),
			"last_update"=>$this->get_last_update_where($last_update),
			"filter"=>$this->getFilterWhere($this->req["filter_arr"]??null,"AND"),
		);
		//remove null value
		$where_arr_fix=array();
		foreach($where_arr as $w){
			if($w!=null){
				$where_arr_fix[]=$w;
			}
		}
		//
		$where="";
		if(count($where_arr_fix)>0){
			$where=sprintf("WHERE %s",PHP4NS::implode(" AND ",$where_arr_fix));
		}
		//
		return $where;
	}
	//
	function get_mainid_where($mainid){
		if($mainid=="ALL"){
			return "";
		}
		//
		$mainid=$this->getRequestVar("mainid",$mainid,false);
		//
		$mainid_txt=is_array($mainid)?PHP4NS::implode(",",$mainid):$mainid;
		$where_mainid=$mainid_txt?sprintf("mainid IN (%s)",$mainid_txt):null;
		//
		return $where_mainid;
	}
	//
	function get_last_update_where($last_update){
		$last_update=$this->getRequestVar("last_update",$last_update,false);
		//
		$where_last_update=$last_update>0?sprintf("last_update > %s",$last_update):null;
		//
		return $where_last_update;
	}
	//
	function getFilterWhere($filter_arr,$logic){
		$where_filter_arr=array();
		$where_filter="";
		//
		if(!is_empty($filter_arr)){
			foreach($filter_arr as $filter){
				//
				//OR
				//
				if(!is_empty($filter["filters"])){
					$where_filter_arr[]=$this->getFilterWhere($filter["filters"],$filter["logic"]);
				}
				else if(!is_empty($filter["value"])){
					//
					//VALUE
					//
					$filter_value=$filter["value"];
					//
					if($filter["data_type"]=="boolean"){
						$filter_value=($filter_value=="true")?"1":"0";
					}
					//
					$filter_value=PHP4NS::str_replace("'","''",$filter_value);
					//
					//OPERATOR
					//
					if($filter["operator"]=="eq"){
						$where_filter_arr[]=sprintf(" %s='%s' ",$filter["field"],$filter_value);
					}
					else if($filter["operator"]=="neq"){
						$where_filter_arr[]=sprintf(" %s!='%s' ",$filter["field"],$filter_value);
					}
					else if($filter["operator"]=="gt"){
						$where_filter_arr[]=sprintf(" %s>'%s' ",$filter["field"],$filter_value);
					}
					else if($filter["operator"]=="gte"){
						$where_filter_arr[]=sprintf(" %s>='%s' ",$filter["field"],$filter_value);
					}
					else if($filter["operator"]=="lt"){
						$where_filter_arr[]=sprintf(" %s<'%s' ",$filter["field"],$filter_value);
					}
					else if($filter["operator"]=="lte"){
						$where_filter_arr[]=sprintf(" %s<='%s' ",$filter["field"],$filter_value);
					}
					else if($filter["operator"]=="contains"){
						$where_filter_arr[]=sprintf(" %s ILIKE '%s%s%s' ",$filter["field"],"%",$filter_value,"%");
					}
					else if($filter["operator"]=="startswith"){
						$where_filter_arr[]=sprintf(" %s ILIKE '%s%s' ",$filter["field"],$filter_value,"%");
					}
					else if($filter["operator"]=="endswith"){
						$where_filter_arr[]=sprintf(" %s ILIKE '%s%s' ",$filter["field"],"%",$filter_value);
					}
					else if($filter["operator"]=="doesnotcontain"){
						$where_filter_arr[]=sprintf(" %s NOT ILIKE '%s%s%s' ",$filter["field"],"%",$filter_value,"%");
					}
					else if($filter["operator"]=="endswith"){
						$where_filter_arr[]=sprintf(" %s ILIKE '%s%s' ",$filter["field"],"%",$filter_value);
					}
					else if($filter["operator"]=="doesnotcontain"){
						$where_filter_arr[]=sprintf(" %s NOT ILIKE '%s%s%s' ",$filter["field"],"%",$filter_value,"%");
					}
				}
				else{
					//
					//NO VALUE
					//
					if($filter["operator"]=="isnull"){
						$where_filter_string="";
						if($filter["data_type"]=="string"){
							$where_filter_string=sprintf("OR %s LIKE ''",$filter["field"]);
						}
						//
						$where_filter_arr[]=sprintf(" (%s IS NULL %s) ",$filter["field"],$where_filter_string);
					}
					else if($filter["operator"]=="isnotnull"){
						$where_filter_string="";
						if($filter["data_type"]=="string"){
							$where_filter_string=sprintf("AND %s NOT LIKE ''",$filter["field"]);
						}
						//
						$where_filter_arr[]=sprintf(" (%s IS NOT NULL %s) ",$filter["field"],$where_filter_string);
					}
				}
			}
			//
			if(!is_empty($where_filter_arr)){
				$where_filter=sprintf(" (%s) ",PHP4NS::implode(sprintf(" %s ",$logic),$where_filter_arr));
			}
		}
		//
		return $where_filter;
	}
	//
	function get_orderby(){
		$orderby="";
		if(isset($this->req["filter_sort"]["field"]) && isset($this->req["filter_sort"]["dir"])){
			$orderby=sprintf(" %s %s, ",$this->req["filter_sort"]["field"],$this->req["filter_sort"]["dir"]);
		}
		//
		return $orderby;
	}
	//
	function get_limit(){
		$limit=" LIMIT 1000 ";
		if(
			(isset($this->req["filter_arr"]) && is_array($this->req["filter_arr"]) && count($this->req["filter_arr"]??null)>0)
			||
			(isset($this->req["filter_sort"]) && !is_empty($this->req["filter_sort"]))
		){
			$limit=" ";
		}
		//
		return $limit;
	}
	//
	function get_ajax_data(){
		$this->__reqValidate(array("code"));
		//
		if(method_exists($this,$this->req["code"])){
			$this->{$this->req["code"]}();
			$this->page->sendJson($this->ret);
		}
		else{
			$this->get_autocomplete_data();
		}
	}
	//
	function get_autocomplete_data(){
		$this->__reqValidate(array("code"));
		//
		//TODO: libGridWindow_CreateInupForm
		$filter_value=$_REQUEST["filter"]["filters"][0]["value"]??"";
		//
		//SHARK AUTOCOMPLETE
		//
		if(SWNAME==SHARK){
			require_once(DOCUMENT_ROOT."/".SHARK."/".SWSIDE."/custom/shark_autocomplete.php");
			$custom_autocomplete=new SharkAutocomplete($this->database,$this->mi,$this->req["value"]??$filter_value);
		}
		//
		//CRASH AUTOCOMPLETE
		//
		else if(SWNAME==CRASH){
			require_once(DOCUMENT_ROOT."/".CRASH."/".SWSIDE."/custom/crash_autocomplete.php");
			$custom_autocomplete=new CrashAutocomplete($this->database,$this->mi,$this->req["value"]??$filter_value);
		}
		//
		//PROJECT AUTOCOMPLETE
		//
		else{
			require_once(SWPATH.SWSIDE."/custom/custom_autocomplete.php");
			$custom_autocomplete=new CustomAutocomplete($this->database,$this->mi,$this->req["value"]??$filter_value);
		}
		//
		//CALL
		//
		if(method_exists($custom_autocomplete,$this->req["code"])){
			$res=$custom_autocomplete->{$this->req["code"]}();
			$this->__sendResult($res);
		}
	}
	//
	function __methodExists($method=null){
		$method_to_check=$method;
		return method_exists($this,$method_to_check==null?$this->req["act"]:$method_to_check);
	}
	//
	function __doMethod($param_arr=null){
		try{
			if(!$this->__isReqValuePresent("act")){
				$method_arr=array();
				$method_all_arr=get_class_methods($this);
				//
				foreach($method_all_arr as $m){
					if(PHP4NS::substr($m,0,1)!="_"){
						$method_arr[]=$m;
					}
				}
				$this->page->sendJson($method_arr);
				//
				return;
			}
			//
			if(PHP4NS::substr($this->req["act"],0,1)=="_"){
				throw new Exception("AJAX_ERROR_INVALID_FUNCTION");
			}
			//
			if($param_arr!=null && $_SERVER["SCRIPT_FILENAME"]){
				if(!($param_arr["__is_custom"]??false)){
					$param_arr["dir"]=basename(dirname($_SERVER["SCRIPT_FILENAME"]));
					$param_arr["page"]=basename($_SERVER["SCRIPT_FILENAME"],".php");
					//
					//GESTIONE AJAX CUSTOM
					//
					$page_custom=sprintf("%s_custom",$param_arr["page"]);
					$filepath_custom=PHP4NS::str_replace($param_arr["page"],$page_custom,$_SERVER["SCRIPT_FILENAME"]);
					//
					if(file_exists($filepath_custom)){
						require_once($filepath_custom);
						//
						$ajax_custom=new AjaxCustom($this->database,$this->page,$this->req);
						//
						if($ajax_custom->__methodExists()){
							$ajax_custom->__doMethod(array("dir"=>$param_arr["dir"],"page"=>$page_custom,"__is_custom"=>true));
							//
							return;
						}
					}
				}
			}
			//
			if(!$this->__methodExists()){
				throw new Exception("AJAX_ERROR_INVALID_FUNCTION");
			}
			//
			if($this->__isReqValuePresent("is_check_user_session")){
				$this->is_check_user_session=((int)$this->req["is_check_user_session"])==1;
			}
			//
			if($this->is_check_user_session){
				$this->__checkAndUpdateUserSession($param_arr);
			}
			//
			//DO ACTION
			//
			$this->{$this->req["act"]}();
			$this->page->sendJson($this->ret);
		}
		catch(Exception $e){
			$this->ret["error"]["message"]=$e->getMessage();
			$this->page->sendJson($this->ret);
		}
	}
	//
	function __doLogin($user=null,$password=null){
		$user=$this->getRequestVar("user",$user,true);
		$password=$this->getRequestVar("password",$password,true);
		//
		try{
			$this->database->initTransaction();
			//
			//ACTIVE DIRECTORY
			//
			if(((int)($this->def_config["active_directory_user_enabled"]??0))==1){
				$u_check_res=$this->database->getItem("user",array("username"=>$user));
				//
				if(is_empty($u_check_res["id"]) || ((int)$u_check_res["row"]["is_active_directory"])==1){
					$this->def_manager["user"]->checkIfUserInActiveDirectory($user,$password);
					//
					$u_arr=array(
						"username"=>$user,
						"password"=>PHP4NS::md5($password),
						"id_user_group"=>$u_check_res["row"]["id_user_group"]??$this->def_config["user_group_arr"]["STANDARD"]["id"],
						"id_language"=>$u_check_res["row"]["id_language"]??$this->def_config["language_arr"][$this->def_config["language_code_default"]]["id"],
						"is_active_directory"=>"1",
					);
					$u_res=$this->database->inup("user",$u_arr,array("username"));
					//
					$ugl_arr=array(
						"id_user"=>$u_res["id"],
						"id_user_group"=>$u_check_res["row"]["id_user_group"]??$this->def_config["user_group_arr"]["STANDARD"]["id"],
					);
					$this->database->inup("user_group_link",$ugl_arr,array("id_user","id_user_group"));
					//
					$this->def_manager["user"]->checkUserPasswordValid($u_res["row"],true);
				}
			}
			//
			//CONTROLLO UTENTE E PASSWORD
			//
			$u_sql=sprintf("	SELECT
						u.*,
						CASE WHEN EXISTS
						(
							SELECT
							1
							
							FROM
							user_session AS us_1
							
							WHERE
							us_1.id_user=u.id
							AND
							us_1.id_module_typology=%s
						) THEN 1 ELSE 0 END AS is_busy
						
						FROM
						\"user\" AS u
						
						WHERE
						u.enabled=1
						AND
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
						AND
						MD5(u.username)='%s'
						AND
						u.password='%s'
						",
						$this->def_config["module_typology_arr"]["modules"]["id"],
						$this->def_config["module_typology_arr"]["modules"]["id"],
						PHP4NS::md5($user),
						PHP4NS::md5($password)
						);
			$u_res=$this->database->getRows($u_sql);
			//
			if($u_res["count"]>0){
				$u_row=$u_res["rows"][0];
				//
				$ug_rows=$this->def_manager["user"]->getUserGroupRows($u_row,true);
				$id_ug_arr=array_column($ug_rows,"id");
				//
				//SYSTEM_LOCK_WIP
				//
				if(((int)($this->def_config["system_lock_wip"]??"0"))==1 && !in_array($this->def_config["user_group_arr"]["SUPER"]["id"],$id_ug_arr)){
					$this->__sendActionLogout();
					//
					throw new Exception("AJAX_ERROR_SYSTEM_LOCKED_WIP");
				}
				//
				//SUSPENDED
				//
				if(!is_empty($u_row["is_suspended"]) && ((int)$u_row["is_suspended"])==1){
					throw new Exception("AJAX_ERROR_USER_DISABLED");
				}
				//
				//SESSION
				//
				if($u_row["is_busy"] && (is_empty($u_row["is_allowed_multi_sessions"]) || ((int)$u_row["is_allowed_multi_sessions"])==0)){
					//Nel caso l'utente sia già loggato in un altro PC e non sono permesse multi-sessioni
					//lo disconnetto in modo da utilizzare solo la connessione attuale
					//
					$this->def_manager["user"]->unlockUsers(array($u_row["id"]),$this->def_config["module_typology_arr"]["modules"]["id"]);
				}
				//
				$us_token=$this->page->getUserSessionToken();
				//
				//Solo un utente deve essere loggato con il mio IP+TOKEN
				//Disconnetto eventuali utenti connessi, prima di creare la mia user_session
				$this->page->removeUserSessionArr($_SERVER["REMOTE_ADDR"],$us_token);
				//
				$us_arr=array(
					"id_user"=>$u_row["id"],
					"ip"=>$_SERVER["REMOTE_ADDR"],
					"id_module_typology"=>$this->def_config["module_typology_arr"]["modules"]["id"],
					"token"=>$us_token,
					"ts"=>"NOW()",
				);
				$this->database->inup("user_session",$us_arr,array("id_user","ip","token","id_module_typology"));
				//
				$this->database->commitTransaction();
				//
				$this->__sendResult(array("u_row"=>$u_row));
			}
			else{
				throw new Exception("AJAX_ERROR_INVALID_LOGIN_DATA");
			}
		}
		catch(Exception $e){
			$this->database->rollbackTransaction();
			//
			throw $e;
		}
	}
	//
	function __checkAndUpdateUserSession($param_arr){
		if($param_arr){
			$this->__getMi($param_arr["dir"],$param_arr["page"]);
		}
		//
		if($this->id_user>0){
			$us_arr=array(
				"id_user"=>$this->id_user,
				"ip"=>$_SERVER["REMOTE_ADDR"],
				"token"=>$this->page->getUserSessionToken(),
				"id_module_typology"=>$this->def_config["module_typology_arr"]["modules"]["id"],
				"ts"=>"NOW()",
			);
			$this->database->inup("user_session",$us_arr,array("id_user","ip","token","id_module_typology"));
		}
	}
	//
	function __sendActionLogout(){
		try{
			$this->page->UserSessionLogout();
		}
		catch(Exception $e){
			$this->ret["error"]["message"]=$e->getMessage();
		}
		finally{
			$this->ret["action"]=$this->action_arr["logout"];
		}
	}
	//
	function __sendActionRefresh(){
		$this->ret["action"]=$this->action_arr["refresh"];
	}
	//
	function __checkUserSession(){
		try{
			$this->page->checkUserSession();
			$this->__sendResult();
		}
		catch(Exception $e){
			$this->ret["error"]["message"]=$e->getMessage();
			$this->__sendActionLogout();
		}
	}
	//
	function __logout(){
		try{
			$this->page->UserSessionLogout();
			$this->__sendResult();
		}
		catch(Exception $e){
			$this->ret["error"]=$e->getMessage();
		}
	}
	//
	function __sendResult($data=null){
		$this->ret["success"]=1;
		if($data!=null){
			$this->ret["count"]=is_array($data)?count($data):1;
			$this->ret["data"]=$data;
		}
	}
	//
	function __compareAndSendResult($done,$tot){
		if($done==$tot){
			$this->__sendResult();
		}
		else{
			throw new Exception(sprintf("AJAX_ERROR_COMPLETED_{0}/{1}|%s|%s",$done,$tot));
		}
	}
	//
	function insert_from_paste_arr($paste_arr=null,$transaction_parent=null){
		if(is_empty($paste_arr) || $paste_arr==null){
			$paste_arr=$this->getRequestVar("paste_arr",null,true);
		}
		//
		try{
			$this->database->initTransaction();
			//
			if(is_array($paste_arr) && count($paste_arr)>0){
				foreach($paste_arr as $paste){
					if(is_empty($paste["paste_typology"])){
						if(!is_empty($paste["solve_arr"])){
							foreach($paste["solve_arr"] as $solve){
								if(!is_empty($paste["data_arr"][$solve])){
									$s_res=$this->database->getRows($paste["data_arr"][$solve]);
									$id_s=$s_res["rows"][0]["id"];
									//
									$paste["data_arr"][$solve]=$id_s;
								}
							}
						}
						//
						foreach($paste["unique_arr"] as $unique){
							if(!isset($paste["data_arr"][$unique]) || $paste["data_arr"][$unique]==null || $paste["data_arr"][$unique]==""){
								$paste["data_arr"][$unique]="###NULL###";
							}
						}
						//
						$t_res=$this->database->inup($paste["table"],$paste["data_arr"],$paste["unique_arr"]);
					}
					else if($paste["paste_typology"]=="database"){
						$table_sql=sprintf("CREATE TABLE IF NOT EXISTS \"%s\" (id SERIAL PRIMARY KEY);",$paste["table_name"]);
						$this->database->execute($table_sql);
						//
						if($paste["col_info_arr"]["col_name"]=="id"){
							continue;
						}
						//
						$add_column_sql=sprintf("ALTER TABLE \"%s\" ADD COLUMN %s %s %s %s",$paste["table_name"],$paste["col_info_arr"]["col_name"],$paste["col_info_arr"]["col_data_type"],$paste["col_info_arr"]["col_is_not_null"]==1?"NOT NULL":"NULL",!is_empty($paste["col_info_arr"]["col_default"])?"DEFAULT ".$paste["col_info_arr"]["col_default"]:"");
						$this->database->execute($add_column_sql);
						//
						if(!is_empty($paste["col_info_arr"]["col_comment"])){
							$comment_column_sql=sprintf("COMMENT ON COLUMN \"%s\".%s IS %s",$paste["table_name"],$paste["col_info_arr"]["col_name"],$paste["col_info_arr"]["col_comment"]);
							$this->database->execute($comment_column_sql);
						}
						//
						if(!is_empty($paste["col_constraint_arr"])){
							foreach($paste["col_constraint_arr"] as $col_constraint_row){
								//
								//UNIQUE
								//
								if($col_constraint_row["constraint_type"]=="u" && !is_empty($col_constraint_row["col_unique_sql"])){
									$create_unique_sql=sprintf("ALTER TABLE \"%s\" ADD CONSTRAINT %s %s",$paste["table_name"],$col_constraint_row["constraint_name"],$col_constraint_row["col_unique_sql"]);
									$this->database->execute($create_unique_sql);
								}
								//
								//FOREIGN KEY
								//
								else if($col_constraint_row["constraint_type"]=="f"){
									$create_foreign_sql=sprintf("ALTER TABLE \"%s\" ADD CONSTRAINT %s FOREIGN KEY(%s) REFERENCES \"%s\" (%s)",$paste["table_name"],$col_constraint_row["constraint_name"],$paste["col_info_arr"]["col_name"],$col_constraint_row["objective_table_name"],$col_constraint_row["objective_column_name"]);
									$this->database->execute($create_foreign_sql);
								}
							}
						}
						//
						if(!is_empty($paste["col_index_arr"])){
							foreach($paste["col_index_arr"] as $index=>$col_index_row){
								if($paste["col_constraint_arr"][$index]["constraint_type"]=="f"){
									$index_sql=sprintf("CREATE INDEX %s ON %s(%s)",$col_index_row["index_name"],$paste["table_name"],$paste["col_info_arr"]["col_name"]);
									$this->database->execute($index_sql);
								}
							}
						}
					}
					else{
						throw new Exception("AJAX_ERROR_INVALID_FUNCTION");
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
		$this->__sendResult();
	}
	//
	//##########################################################################################################################
	//GRID
	//##########################################################################################################################
	//
	function get_grid_info_arr(){
		$grid_code=$this->getRequestVar("grid_code",null,true);
		//
		$g_row=$this->getGridRow_FromCode($grid_code);
		$gc_rows=$this->getGridColumnRows_FromGridCode($grid_code);
		$gcb_rows=$this->getGridColumnButtonRows_FromGridCode($grid_code);
		$gti_rows=$this->getGridToolbarItemRows_FromGridCode($grid_code);
		$gst_rows=$this->getGridStyleRows_FromGridCode($grid_code);
		$gse_settings_json=$this->getGridSettingsJson_FromGridCode($grid_code);
		//
		$ret_arr=array(
			"g_row"=>$g_row,
			"gc_rows"=>$gc_rows,
			"gcb_rows"=>$gcb_rows,
			"gti_rows"=>$gti_rows,
			"gst_rows"=>$gst_rows,
			"gse_settings_json"=>$gse_settings_json,
		);
		//
		$this->__sendResult($ret_arr);
	}
	//
	function getGridRow_FromCode($grid_code){
		$g_res=$this->database->getItem("grid",array("code"=>$grid_code));
		//
		if(is_empty($g_res["id"])){
			throw new Exception("AJAX_ERROR_GRID_NAME_NOT_FOUND");
		}
		//
		return $g_res["row"];
	}
	//
	function getGridColumnRows_FromGridCode($grid_code){
		$g_row=$this->getGridRow_FromCode($grid_code);
		//
		$where_gc="";
		if(!in_array($this->def_config["user_group_arr"]["SUPER"]["id"],$this->id_user_group_arr)){
			$where_gc=sprintf(" AND gc.visible=1 AND (gc.has_skill=0 OR (gc.has_skill=1 AND gc.skill_enabled_cnt>0)) ");
		}
		//
		$gc_sql=sprintf("	SELECT
					gc.*
					
					FROM
					(
						SELECT
						gc.*,
						CASE WHEN gct.id IS NOT NULL THEN gct.function_js ELSE '' END AS function_js,
						STRING_AGG(s.code,'<br/>') AS s_code_list,
						CASE WHEN COUNT(s.id)>0 THEN 1 ELSE 0 END AS has_skill,
						SUM(CASE WHEN s.enabled=1 THEN 1 ELSE 0 END) AS skill_enabled_cnt
						
						FROM
						grid_column AS gc
									LEFT JOIN
									grid_column_template AS gct
									ON
									gc.id_grid_column_template=gct.id
									
									LEFT JOIN
									skill_grid_column AS sgc
									ON
									sgc.id_grid_column=gc.id
									
									LEFT JOIN
									skill AS s
									ON
									sgc.id_skill=s.id
						
						WHERE
						gc.id_grid=%s
						
						GROUP BY
						gc.id,
						gct.id,
						gct.function_js
						
						ORDER BY
						gc.priority ASC,
						gc.id ASC
					) AS gc
					
					WHERE
					gc.id>0
					%s
					",
					$g_row["id"],
					$where_gc
					);
		$gc_res=$this->database->getRows($gc_sql);
		//
		return $gc_res["rows"];
	}
	//
	function get_grid_columns(){
		$grid_code=$this->getRequestVar("grid_code",null,true);
		//
		$gc_rows=$this->getGridColumnRows_FromGridCode($grid_code);
		//
		$this->__sendResult($gc_rows);
	}
	//
	function getGridColumnButtonRows_FromGridCode($grid_code){
		$g_row=$this->getGridRow_FromCode($grid_code);
		//
		$where_ug="";
		if(!in_array($this->def_config["user_group_arr"]["SUPER"]["id"],$this->id_user_group_arr) && !in_array($this->def_config["user_group_arr"]["ALL"]["id"],$this->id_user_group_arr)){
			$where_ug=sprintf(" AND uggcb.id_user_group IN (%s) ",PHP4NS::implode(",",$this->id_user_group_arr));
		}
		//
		$where_gcb="";
		if(!in_array($this->def_config["user_group_arr"]["SUPER"]["id"],$this->id_user_group_arr)){
			$where_gcb=sprintf(" AND gcb.visible=1 AND (gcb.has_skill=0 OR (gcb.has_skill=1 AND gcb.skill_enabled_cnt>0)) ");
		}
		//
		$gcb_sql=sprintf("	SELECT
					gcb.*
					
					FROM
					(
						SELECT
						gcb.*,
						STRING_AGG(s.code,'<br/>') AS s_code_list,
						CASE WHEN COUNT(s.id)>0 THEN 1 ELSE 0 END AS has_skill,
						SUM(CASE WHEN s.enabled=1 THEN 1 ELSE 0 END) AS skill_enabled_cnt
						
						FROM
						grid_column_button AS gcb
										LEFT JOIN
										user_group_grid_column_button AS uggcb
										ON
										uggcb.id_grid_column_button=gcb.id
										
										LEFT JOIN
										skill_grid_column_button AS sgcb
										ON
										sgcb.id_grid_column_button=gcb.id
										
										LEFT JOIN
										skill AS s
										ON
										sgcb.id_skill=s.id
						
						WHERE
						gcb.id_grid=%s
						%s
						
						GROUP BY
						gcb.id
						
						ORDER BY
						gcb.priority ASC
					) AS gcb
					
					WHERE
					gcb.id>0
					%s
					",
					$g_row["id"],
					$where_ug,
					$where_gcb
					);
		$gcb_res=$this->database->getRows($gcb_sql);
		//
		return $gcb_res["rows"];
	}
	//
	function getGridToolbarItemRows_FromGridCode($grid_code){
		$g_row=$this->getGridRow_FromCode($grid_code);
		//
		$where_ug="";
		if(!in_array($this->def_config["user_group_arr"]["SUPER"]["id"],$this->id_user_group_arr) && !in_array($this->def_config["user_group_arr"]["ALL"]["id"],$this->id_user_group_arr)){
			$where_ug=sprintf(" AND uggti.id_user_group IN (%s) ",PHP4NS::implode(",",$this->id_user_group_arr));
		}
		//
		$where_gti="";
		if(!in_array($this->def_config["user_group_arr"]["SUPER"]["id"],$this->id_user_group_arr)){
			$where_gti=sprintf(" AND gti.visible=1 AND (gti.has_skill=0 OR (gti.has_skill=1 AND gti.skill_enabled_cnt>0)) ");
		}
		//
		//TODO - un giorno rinominare icon_class in icon e sistemare la query
		//
		$gti_sql=sprintf("	SELECT
					gti.*
					
					FROM
					(
						SELECT
						gti.*,
						gti.icon_class AS icon,
						STRING_AGG(s.code,'<br/>') AS s_code_list,
						CASE WHEN COUNT(s.id)>0 THEN 1 ELSE 0 END AS has_skill,
						SUM(CASE WHEN s.enabled=1 THEN 1 ELSE 0 END) AS skill_enabled_cnt
						
						FROM
						grid_toolbar_item AS gti
										LEFT JOIN
										user_group_grid_toolbar_item AS uggti
										ON
										uggti.id_grid_toolbar_item=gti.id
										
										LEFT JOIN
										skill_grid_toolbar_item AS sgti
										ON
										sgti.id_grid_toolbar_item=gti.id
										
										LEFT JOIN
										skill AS s
										ON
										sgti.id_skill=s.id
						
						WHERE
						gti.id_grid=%s
						%s
						
						GROUP BY
						gti.id
						
						ORDER BY
						gti.priority ASC
					) AS gti
					
					WHERE
					gti.id>0
					%s
					",
					$g_row["id"],
					$where_ug,
					$where_gti
					);
		$gti_res=$this->database->getRows($gti_sql);
		//
		return $gti_res["rows"];
	}
	//
	function get_grid_toolbar_items_visible(){
		if($this->__methodExists("get_grid_toolbar_items_visible_arr")){
			$this->get_grid_toolbar_items_visible_arr();
		}
		else{
			$this->__sendResult();
		}
	}
	//
	function getGridStyleRows_FromGridCode($grid_code){
		$g_row=$this->getGridRow_FromCode($grid_code);
		//
		$gst_sql=sprintf("	SELECT
					gst.*,
					c_background.value AS gst_color_background,
					c_font.value AS gst_color_font,
					gc.code AS gst_column
					
					FROM
					grid_style AS gst
					
					LEFT JOIN color AS c_background			ON gst.id_color_background=c_background.id
					LEFT JOIN color AS c_font			ON gst.id_color_font=c_font.id
					LEFT JOIN grid_column AS gc			ON gst.id_grid_column=gc.id
					
					WHERE
					gst.id_grid=%s
					
					ORDER BY
					(CASE WHEN gst.priority IS NOT NULL THEN gst.priority ELSE 0 END) ASC,
					(CASE WHEN gst.field_row IS NOT NULL AND gst.id_grid_column IS NOT NULL THEN 1 ELSE 0 END) ASC
					",
					$g_row["id"]
					);
		$gst_res=$this->database->getRows($gst_sql);
		//
		$gst_rows=$gst_res["rows"];
		//
		return $gst_rows;
	}
	//
	function getGridSettingsJson_FromGridCode($grid_code){
		$g_row=$this->getGridRow_FromCode($grid_code);
		//
		$gs_res=$this->database->getItem("grid_settings",array("id_grid"=>$g_row["id"],"id_user"=>$this->id_user));
		//
		return $gs_res["row"]["settings"]??null;
	}
	//
	function set_grid_settings(){
		$grid_code=$this->getRequestVar("grid_code",null,true);
		$settings=$this->getRequestVar("settings",null,true);
		//
		$g_res=$this->database->getItem("grid",array("code"=>$grid_code));
		//
		if($g_res["id"]){
			if(in_array($this->def_config["user_group_arr"]["SUPER"]["id"],$this->id_user_group_arr)){
				$setting_arr=json_decode($settings,true);
				//
				$gc_priority=0;
				foreach(array_column($setting_arr["columns"],"field") as $gc_code){
					$gc_res=$this->database->getItem("grid_column",array("id_grid"=>$g_res["id"],"code"=>$gc_code));
					//
					if(!is_empty($gc_res["id"])){
						$gc_arr=array(
							"id"=>$gc_res["id"],
							"priority"=>$gc_priority,
						);
						$this->database->inup("grid_column",$gc_arr,array("id"));
						//
						$gc_priority+=100;
					}
				}
			}
			else{
				$gs_arr=array(
					"id_grid"=>$g_res["id"],
					"id_user"=>$this->id_user,
					"settings"=>$settings,
				);
				$gs_res=$this->database->inup("grid_settings",$gs_arr,array("id_grid","id_user"));
			}
			//
			$this->__sendResult();
		}
		else{
			throw new Exception("AJAX_ERROR_GRID_NAME_NOT_FOUND");
		}
	}
	//
	function delete_grid_settings(){
		$grid_code=$this->getRequestVar("grid_code",null,true);
		//
		$g_res=$this->database->getItem("grid",array("code"=>$grid_code));
		//
		if($g_res["id"]){
			$gs_res=$this->database->getItem("grid_settings",array("id_grid"=>$g_res["id"],"id_user"=>$this->id_user));
			//
			if($gs_res["id"]){
				$gs_delete=sprintf("DELETE FROM grid_settings WHERE id=%s",$gs_res["id"]);
				$this->database->delete($gs_delete);
			}
			//
			$this->__sendResult();
		}
		else{
			throw new Exception("AJAX_ERROR_GRID_NAME_NOT_FOUND");
		}
	}
	//
	function get_grid_copy_arr(){
		$id_grid=$this->getRequestVar("id_grid",null,true);
		$is_cascade=$this->getRequestVar("is_cascade",null,true);
		//
		$g_res=$this->database->getItem("grid",array("id"=>$id_grid));
		$g_row=$g_res["row"];
		//
		unset($g_row["id"]);
		//
		$copy_arr=array();
		$copy_arr[]=array(
			"table"=>"grid",
			"unique_arr"=>array("code"),
			"solve_arr"=>array(),
			"data_arr"=>$g_row,
		);
		//
		if(((int)$is_cascade)==1){
			$gc_res=$this->database->getItems("grid_column",array("id_grid"=>$id_grid),array("id"=>"ASC"));
			if($gc_res["count"]>0){
				foreach($gc_res["rows"] as $gc_row){
					$copy_arr=array_merge($copy_arr,$this->get_grid_column_copy_arr($gc_row["id"],true));
				}
			}
			//
			$gcb_res=$this->database->getItems("grid_column_button",array("id_grid"=>$id_grid),array("id"=>"ASC"));
			if($gcb_res["count"]>0){
				foreach($gcb_res["rows"] as $gcb_row){
					$copy_arr=array_merge($copy_arr,$this->get_grid_column_button_copy_arr($gcb_row["id"],true));
				}
			}
			//
			$gti_res=$this->database->getItems("grid_toolbar_item",array("id_grid"=>$id_grid),array("id"=>"ASC"));
			if($gti_res["count"]>0){
				foreach($gti_res["rows"] as $gti_row){
					$copy_arr=array_merge($copy_arr,$this->get_grid_toolbar_item_copy_arr($gti_row["id"],true));
				}
			}
		}
		//
		$this->__sendResult($copy_arr);
	}
	//
	function get_grid_column_copy_arr($id_col=null,$is_return=false){
		$id_col=$this->getRequestVar("id_col",$id_col,true);
		//
		$gc_res=$this->database->getItem("grid_column",array("id"=>$id_col));
		$gc_row=$gc_res["row"];
		unset($gc_row["id"]);
		//
		if(!is_empty($gc_row["id_grid"])){
			$g_res=$this->database->getItem("grid",array("id"=>$gc_row["id_grid"]));
			$g_row=$g_res["row"];
			//
			$gc_row["id_grid"]=sprintf("SELECT id FROM grid WHERE code='%s'",$g_row["code"]);
		}
		//
		if(!is_empty($gc_row["id_grid_column_template"])){
			$gct_res=$this->database->getItem("grid_column_template",array("id"=>$gc_row["id_grid_column_template"]));
			$gct_row=$gct_res["row"];
			//
			$gc_row["id_grid_column_template"]=sprintf("SELECT id FROM grid_column_template WHERE code='%s'",$gct_row["code"]);
		}
		//
		$copy_arr=array();
		$copy_arr[]=array(
			"table"=>"grid_column",
			"unique_arr"=>array("id_grid","code"),
			"solve_arr"=>array("id_grid","id_grid_column_template"),
			"data_arr"=>$gc_row,
			//
			"info_arr"=>array(
				"g_code"=>$g_row["code"],
				"gc_code"=>$gc_row["code"],
			),
		);
		//
		if($is_return){
			return $copy_arr;
		}
		//
		$this->__sendResult($copy_arr);
	}
	//
	function get_grid_toolbar_item_copy_arr($id_gti=null,$is_return=false){
		$id_gti=$this->getRequestVar("id_gti",$id_gti,true);
		//
		$gti_res=$this->database->getItem("grid_toolbar_item",array("id"=>$id_gti));
		$gti_row=$gti_res["row"];
		unset($gti_row["id"]);
		//
		if(!is_empty($gti_row["id_grid"])){
			$g_res=$this->database->getItem("grid",array("id"=>$gti_row["id_grid"]));
			$g_row=$g_res["row"];
			//
			$gti_row["id_grid"]=sprintf("SELECT id FROM grid WHERE code='%s'",$g_row["code"]);
		}
		//
		$copy_arr=array();
		$copy_arr[]=array(
			"table"=>"grid_toolbar_item",
			"unique_arr"=>array("id_grid","code"),
			"solve_arr"=>array("id_grid"),
			"data_arr"=>$gti_row,
			//
			"info_arr"=>array(
				"g_code"=>$g_row["code"],
				"gti_code"=>$gti_row["code"],
			),
		);
		//
		if($is_return){
			return $copy_arr;
		}
		//
		$this->__sendResult($copy_arr);
	}
	//
	function get_grid_column_button_copy_arr($id_col_btn=null,$is_return=false){
		$id_col_btn=$this->getRequestVar("id_col_btn",$id_col_btn,true);
		//
		$gcb_res=$this->database->getItem("grid_column_button",array("id"=>$id_col_btn));
		$gcb_row=$gcb_res["row"];
		unset($gcb_row["id"]);
		//
		if(!is_empty($gcb_row["id_grid"])){
			$g_res=$this->database->getItem("grid",array("id"=>$gcb_row["id_grid"]));
			$g_row=$g_res["row"];
			//
			$gcb_row["id_grid"]=sprintf("SELECT id FROM grid WHERE code='%s'",$g_row["code"]);
		}
		//
		$copy_arr=array();
		$copy_arr[]=array(
			"table"=>"grid_column_button",
			"unique_arr"=>array("id_grid","code"),
			"solve_arr"=>array("id_grid"),
			"data_arr"=>$gcb_row,
		);
		//
		if($is_return){
			return $copy_arr;
		}
		//
		$this->__sendResult($copy_arr);
	}
	//
	function add_file_to_pfs(){
		$module_code=$this->getRequestVar("module_code",null,true);
		$page_code=$this->getRequestVar("page_code",null,true);
		//
		$file_php=sprintf("[[SWPATH]]/frontend/modules/%s/%s.php",$this->mi["MODULE_CODE"],$page_code);
		$file_js=sprintf("[[SWPATH]]/frontend/modules/%s/javascripts/%s.js",$this->mi["MODULE_CODE"],$page_code);
		$file_ajax=sprintf("[[SWPATH]]/backend/modules/%s/%s_ajax.php",$this->mi["MODULE_CODE"],$page_code);
		//
		$pfsf_arr=array(
			"path"=>$file_php,
			"is_link"=>"1",
		);
		$pfsf_res=$this->database->inup("pull_from_shark_file",$pfsf_arr,array("path"));
		//
		$pfsf_arr=array(
			"path"=>$file_js,
			"is_link"=>"1",
		);
		$pfsf_res=$this->database->inup("pull_from_shark_file",$pfsf_arr,array("path"));
		//
		$pfsf_arr=array(
			"path"=>$file_ajax,
			"is_link"=>"1",
		);
		$pfsf_res=$this->database->inup("pull_from_shark_file",$pfsf_arr,array("path"));
		//
		$this->__sendResult();
	}
	//
	function get_column_print_arr(){
		$grid_code=$this->getRequestVar("grid_code",null,true);
		//
		$g_res=$this->database->getItem("grid",array("code"=>$grid_code));
		//
		if($g_res["id"]){
			$gs_res=$this->database->getItem("grid_settings",array("id_grid"=>$g_res["id"],"id_user"=>$this->id_user));
			//
			if($gs_res["id"]){
				$res_string=json_decode($gs_res["row"]["settings"],true);
				//
				if(!is_empty($res_string["column_print"])){
					$this->__sendResult($res_string["column_print"]);
				}
				else{
					$this->__sendResult();
				}
			}
		}
		else{
			throw new Exception("AJAX_ERROR_GRID_NAME_NOT_FOUND");
		}
	}
	//
	function select_data_empty(){
		$this->__sendResult(array());
	}
	//
	function inup_data(){
		$table=$this->getRequestVar("table",null,true);
		$value=$this->getRequestVar("value",null,true);
		//
		foreach($value as $i=>$v){
			if($v=="-1"){
				$value[$i]="###NULL###";
			}
		}
		//
		$i_res=$this->database->inup($table,$value,array("id"));
		//
		if($this->__methodExists("select_data")){
			$this->select_data($i_res["id"]);
		}
	}
	//
	function delete_data(){
		$table=$this->getRequestVar("table",null,true);
		$mainid=$this->getRequestVar("mainid",null,true);
		//
		$query=$this->database->createDelete($table,$mainid);
		$this->database->delete($query);
		$this->__sendResult();
	}
	//
	function get_last_update(){
		$last_update=$this->getRequestVar("last_update",null,true);
		//
		if($this->__methodExists("select_data")){
			$this->select_data(null,$last_update);
		}
	}
	//
	function get_module_copy_arr(){
		$id_module=$this->getRequestVar("id_module",null,true);
		//
		$m_res=$this->database->getItem("module",array("id"=>$id_module));
		$m_row=$m_res["row"];
		//
		unset($m_row["id"]);
		//
		if(!is_empty($m_row["id_module_parent"])){
			$mp_res=$this->database->getItem("module",array("id"=>$m_row["id_module_parent"]));
			$mp_row=$mp_res["row"];
			//
			$mpt_res=$this->database->getItem("module_typology",array("id"=>$mp_row["id_module_typology"]));
			$mpt_row=$mpt_res["row"];
			//
			$m_row["id_module_parent"]=sprintf("SELECT id FROM module WHERE code='%s' AND id_module_parent IS NULL AND id_module_typology=(SELECT id FROM module_typology WHERE code='%s')",$mp_row["code"],$mpt_row["code"]);
		}
		//
		if(!is_empty($m_row["id_module_typology"])){
			$mt_res=$this->database->getItem("module_typology",array("id"=>$m_row["id_module_typology"]));
			$mt_row=$mt_res["row"];
			//
			$m_row["id_module_typology"]=sprintf("SELECT id FROM module_typology WHERE code='%s'",$mt_row["code"]);
		}
		//
		$copy_arr=array();
		$copy_arr[]=array(
			"table"=>"module",
			"unique_arr"=>array("code","id_module_parent","id_module_typology"),
			"solve_arr"=>array("id_module_parent","id_module_typology"),
			"data_arr"=>$m_row,
		);
		//
		$this->__sendResult($copy_arr);
	}
	//
	function clone_module(){
		$id_module=$this->getRequestVar("id_module",null,true);
		//
		$module_res=$this->database->getItem("module",array("id"=>$id_module));
		$module_row=$module_res["row"];
		//
		unset($module_row["id"]);
		$module_row["code"].="_CLONE";
		//
		$module_new_res=$this->database->inup("module",$module_row,array(),true);
		//
		$this->__sendResult();
	}
	//
	function clone_grid(){
		$id_grid=$this->getRequestVar("id_grid",null,true);
		$grid_code=$this->getRequestVar("grid_code",null,true);
		//
		$grid_res=$this->database->getItem("grid",array("id"=>$id_grid));
		$grid_row=$grid_res["row"];
		//
		unset($grid_row["id"]);
		$grid_row["code"]=$grid_code;
		//
		$grid_new_res=$this->database->inup("grid",$grid_row,array(),true);
		//
		$this->__sendResult();
	}
	//
	function clone_column(){
		$id_col=$this->getRequestVar("id_col",null,true);
		$id_grid=$this->getRequestVar("id_grid",null,false);
		//
		$col_res=$this->database->getItem("grid_column",array("id"=>$id_col));
		$col_row=$col_res["row"];
		//
		unset($col_row["id"]);
		$col_row["code"]=!is_empty($id_grid)?$col_row["code"]:$col_row["code"]."_CLONE";
		$col_row["id_grid"]=!is_empty($id_grid)?$id_grid:$col_row["id_grid"];
		//
		if(is_empty($id_grid)){
			$gc_next_sql=sprintf("	SELECT
						gc.*
						
						FROM
						grid_column AS gc
						
						WHERE
						gc.id_grid=%s
						AND
						gc.priority>%s
						
						ORDER BY
						gc.priority ASC
						
						LIMIT 1
						",
						$col_row["id_grid"],
						$col_row["priority"]
						);
			$gc_next_res=$this->database->getRows($gc_next_sql);
			//
			$col_row_priority_add=50;
			if($gc_next_res["count"]>0){
				$col_row_priority_add=(((int)$gc_next_res["rows"][0]["priority"])-((int)$col_row["priority"]))/2;
			}
			//
			$col_row["priority"]+=((int)$col_row_priority_add);
		}
		//
		$col_new_res=$this->database->inup("grid_column",$col_row,null,true);
		//
		$this->__sendResult();
	}
	//
	function delete_column(){
		$id_col=$this->getRequestVar("id_col",null,true);
		//
		$gc_delete=sprintf("DELETE FROM grid_column WHERE id=%s",$id_col);
		$this->database->delete($gc_delete);
		//
		$this->__sendResult();
	}
	//
	function clone_column_button(){
		$id_col_btn=$this->getRequestVar("id_col_btn",null,true);
		$id_grid=$this->getRequestVar("id_grid",null,false);
		//
		$col_btn_res=$this->database->getItem("grid_column_button",array("id"=>$id_col_btn));
		$col_btn_row=$col_btn_res["row"];
		//
		unset($col_btn_row["id"]);
		$col_btn_row["code"]=!is_empty($id_grid)?$col_btn_row["code"]:$col_btn_row["code"]."_CLONE";
		$col_btn_row["id_grid"]=!is_empty($id_grid)?$id_grid:$col_btn_row["id_grid"];
		//
		$col_btn_new_res=$this->database->inup("grid_column_button",$col_btn_row,array(),true);
		//
		$this->__sendResult();
	}
	//
	function clone_toolbar_item(){
		$id_ti=$this->getRequestVar("id_ti",null,true);
		$id_grid=$this->getRequestVar("id_grid",null,false);
		//
		$ti_res=$this->database->getItem("grid_toolbar_item",array("id"=>$id_ti));
		$ti_row=$ti_res["row"];
		//
		unset($ti_row["id"]);
		$ti_row["code"]=!is_empty($id_grid)?$ti_row["code"]:$ti_row["code"]."_CLONE";
		$ti_row["id_grid"]=!is_empty($id_grid)?$id_grid:$ti_row["id_grid"];
		//
		$ti_new_res=$this->database->inup("grid_toolbar_item",$ti_row,array(),true);
		//
		$this->__sendResult();
	}
	//
	function create_form(){
		$form_code=$this->getRequestVar("form_code",null,true);
		//
		$f_new_arr=array(
			"code"=>$form_code,
		);
		$form_new_res=$this->database->inup("form",$f_new_arr,array(),true);
		//
		$this->__sendResult();
	}
	//
	function clone_form(){
		$id_form=$this->getRequestVar("id_form",null,true);
		$form_code=$this->getRequestVar("form_code",null,true);
		//
		$form_res=$this->database->getItem("form",array("id"=>$id_form));
		$form_row=$form_res["row"];
		//
		unset($form_row["id"]);
		$form_row["code"]=$form_code;
		//
		$form_new_res=$this->database->inup("form",$form_row,array(),true);
		//
		$this->__sendResult();
	}
	//
	function clone_form_row(){
		$id_form_row=$this->getRequestVar("id_form_row",null,true);
		$id_form=$this->getRequestVar("id_form",null,false);
		//
		$fr_res=$this->database->getItem("form_row",array("id"=>$id_form_row));
		$fr_row=$fr_res["row"];
		//
		unset($fr_row["id"]);
		$fr_row["code"]=!is_empty($id_form)?$fr_row["code"]:$fr_row["code"]."_CLONE";
		$fr_row["id_form"]=!is_empty($id_form)?$id_form:$fr_row["id_form"];
		$fr_row["id_form_row_box"]=(!is_empty($id_form) || is_empty($fr_row["id_form_row_box"]))?"###NULL###":$fr_row["id_form_row_box"];
		//
		$fr_new_res=$this->database->inup("form_row",$fr_row,null,true);
		//
		$this->__sendResult();
	}
	//
	function delete_form_row(){
		$id_form_row=$this->getRequestVar("id_form_row",null,true);
		//
		$fr_delete=sprintf("DELETE FROM form_row WHERE id=%s",$id_form_row);
		$this->database->delete($fr_delete);
		//
		$this->__sendResult();
	}
	//
	function set_todo_json(){
		$description=$this->getRequestVar("description",null,true);
		$json=$this->getRequestVar("json",null,true);
		//
		$t_arr=array(
			"id_todo_typology"=>$this->def_config["todo_typology_arr"]["JSON_PASTE"]["id"],
			"description"=>$description,
			"cmd"=>$json,
		);
		$this->database->inup("todo",$t_arr,null,true);
		//
		$this->__sendResult();
	}
	//
	function get_print_arr(){
		$label_code=$this->getRequestVar("label_code",null,true);
		//
		$print_arr=$this->def_manager["print"]->getPrinterArr($label_code);
		//
		$this->__sendResult($print_arr);
	}
	//
	function create_and_print_label(){
		$mainid_arr=$this->getRequestVar("mainid_arr",null,true);
		$id_print=$this->getRequestVar("id_print",null,true);
		$num=$this->getRequestVar("num",null,true);
		//
		$this->def_manager["print"]->createAndPrintLabel($mainid_arr,$id_print,$num);
		//
		$this->__sendResult();
	}
	//
	function fix_column_priority(){
		$grid_code=$this->getRequestVar("grid_code",null,true);
		//
		$gc_rows=$this->getGridColumnRows_FromGridCode($grid_code);
		//
		$gc_priority=0;
		foreach($gc_rows as $gc_row){
			$gc_arr=array(
				"id"=>$gc_row["id"],
				"priority"=>$gc_priority,
			);
			$this->database->inup("grid_column",$gc_arr,array("id"));
			//
			$gc_priority+=100;
		}
		//
		$this->__sendResult();
	}
	//
	function change_column_priority(){
		$id_col=$this->getRequestVar("id_col",null,true);
		$priority=$this->getRequestVar("priority",null,true);
		//
		//call fix priority
		$gc_res=$this->database->getItem("grid_column",array("id"=>$id_col));
		$g_res=$this->database->getItem("grid",array("id"=>$gc_res["row"]["id_grid"]));
		$this->setRequestVar("grid_code",$g_res["row"]["code"]);
		$this->fix_column_priority();
		//
		//refresh data, set priority and recall fix priority
		$gc_res=$this->database->getItem("grid_column",array("id"=>$id_col));
		if(!is_empty($gc_res["row"]["priority"])){
			$priority_new=$gc_res["row"]["priority"]+$priority;
			//
			$gc_arr=array(
				"id"=>$id_col,
				"priority"=>$priority_new,
			);
			$this->database->inup("grid_column",$gc_arr,array("id"));
			//
			$this->fix_column_priority();
			//
			$this->__sendResult();
		}
	}
	//
	function set_column_width(){
		$id_col=$this->getRequestVar("id_col",null,true);
		$width=$this->getRequestVar("width",null,true);
		//
		$gc_arr=array(
			"id"=>$id_col,
			"width"=>$width,
		);
		$this->database->inup("grid_column",$gc_arr,array("id"));
		//
		$this->__sendResult();
	}
	//
	function getItemsForUpdateStorage(){
		$table=$this->getRequestVar("table",null,true);
		$where_param_arr=$this->getRequestVar("where_param_arr",null,true);
		//
		$sql_res=$this->database->getItems($table,$where_param_arr);
		//
		$this->__sendResult($sql_res);
	}
	//
	//############################
	//FORM
	//############################
	//
	function get_form_info_arr(){
		$form_code=$this->getRequestVar("form_code",null,true);
		//
		//TODO - FORM_NEW - Questo parametro non servirà più una volta aggiornate tutte le form
		//
		$is_form_old=$this->getRequestVar("is_form_old",null,false);
		//
		$f_row=$this->get_form($form_code);
		$fr_rows=$this->get_form_row_arr($form_code,((int)$is_form_old)==1);
		//
		$this->__sendResult(array("f_row"=>$f_row,"fr_rows"=>$fr_rows));
	}
	//
	function get_form($form_code){
		$f_res=$this->database->getItem("form",array("code"=>$form_code));
		//
		if(is_empty($f_res["id"])){
			throw new Exception("AJAX_ERROR_FORM_CODE_NOT_FOUND");
		}
		//
		$f_data_source_param_arr=!is_empty($f_res["row"]["data_source_param"])?json_decode($f_res["row"]["data_source_param"],true):array();
		//
		$f_res["row"]["form_row_title_size"]=!is_empty($f_res["row"]["form_row_title_size"])?$f_res["row"]["form_row_title_size"]:($f_data_source_param_arr["_data_source_param_title_size"]??null);
		$f_res["row"]["form_row_field_size"]=!is_empty($f_res["row"]["form_row_field_size"])?$f_res["row"]["form_row_field_size"]:($f_data_source_param_arr["_data_source_param_field_size"]??null);
		//
		$f_res["row"]["style"]=!is_empty($f_res["row"]["style"])?$f_res["row"]["style"]:($f_data_source_param_arr["_data_source_param_form_style_custom"]??null);
		$f_res["row"]["form_row_style"]=!is_empty($f_res["row"]["form_row_style"])?$f_res["row"]["form_row_style"]:($f_data_source_param_arr["_data_source_param_form_row_style_custom"]??null);
		$f_res["row"]["form_row_title_style"]=!is_empty($f_res["row"]["form_row_title_style"])?$f_res["row"]["form_row_title_style"]:($f_data_source_param_arr["_data_source_param_title_style_custom"]??null);
		$f_res["row"]["form_row_field_style"]=!is_empty($f_res["row"]["form_row_field_style"])?$f_res["row"]["form_row_field_style"]:($f_data_source_param_arr["_data_source_param_field_style_custom"]??null);
		//
		return $f_res["row"];
	}
	//
	function get_form_row_arr($form_code,$is_form_old){
		$f_row=$this->get_form($form_code);
		//
		//CONTROLLA PER CAPIRE LA VERSIONE
		//
		$fr_column_check_sql=sprintf("	SELECT
						1 AS exists
						
						FROM
						pg_attribute AS att
						INNER JOIN pg_class AS cls		ON cls.oid=att.attrelid AND att.attnum>0 AND NOT att.attisdropped
						INNER JOIN pg_namespace AS nsp		ON nsp.oid=cls.relnamespace
						
						WHERE
						nsp.nspname='public'
						AND
						cls.relname='form_row'
						AND
						att.attname='id_form_row_box'
						");
		$fr_column_check_res=$this->database->getRows($fr_column_check_sql);
		//
		//VERSIONE NUOVA
		//
		if($fr_column_check_res["count"]>0){
			$fr_sql=sprintf("	SELECT
						fr.*,
						r.code AS field_regexp_code,
						r.regexp AS field_regexp,
						fr_box.code AS fr_box_code
						
						FROM
						form_row AS fr
						LEFT JOIN regexp AS r				ON fr.id_field_regexp=r.id
						LEFT JOIN form_row AS fr_box			ON fr.id_form_row_box=fr_box.id
						LEFT JOIN form_row AS fr_box_parent		ON fr_box.id_form_row_box=fr_box_parent.id
						
						WHERE
						fr.id_form=%s
						
						ORDER BY
						CASE WHEN fr_box.id IS NOT NULL THEN 1 ELSE 0 END ASC,
						CASE WHEN fr_box_parent.id IS NULL THEN 1 ELSE 0 END DESC,
						fr.priority_vertical ASC,
						fr.priority_horizontal ASC,
						fr.id ASC
						",
						$f_row["id"]
						);
			$fr_res=$this->database->getRows($fr_sql);
			//
			return $fr_res["rows"];
		}
		//
		//VERSIONE VECCHIA + INTERMEDIA
		//TODO - Quando sarà il momento, tenere solo la NUOVA sopra
		//
		else{
			//
			//TODO - FORM_NEW - Rimuovere completamente form_row_template da ovunque una volta aggiornate tutte le form
			//
			$fr_sql=sprintf("	SELECT
						fr.*,
						--r.code AS field_regexp_code,
						--r.regexp AS field_regexp,
						CASE WHEN frt.id IS NOT NULL THEN frt.function_js ELSE '' END AS template_js
						
						FROM
						form_row AS fr
						
						LEFT JOIN form_row_template AS frt		ON fr.id_form_row_template=frt.id
						--LEFT JOIN regexp AS r				ON fr.id_field_regexp=r.id
						
						WHERE
						fr.id_form=%s
						
						ORDER BY
						fr.priority_vertical ASC,
						fr.priority_horizontal ASC,
						fr.id ASC
						",
						$f_row["id"]
						);
			$fr_res=$this->database->getRows($fr_sql);
			//
			//TODO - FORM_NEW - Togliere una volta aggiornate tutte le form
			//
			$fr_fx_rows=array();
			foreach($fr_res["rows"] as $fr_res["row"]){
				$fr_fx_row=$fr_res["row"];
				//
				//TODO - In futuro fare scommentare la join e la select direttamente nella SQL sopra e non fare sta cosa (fatto per retrocompatibilità)
				//
				if(!is_empty($fr_fx_row["id_field_regexp"])){
					$r_res=$this->database->getItem("regexp",array("id"=>$fr_fx_row["id_field_regexp"]));
					//
					$fr_fx_row["field_regexp_code"]=$r_res["row"]["code"];
					$fr_fx_row["field_regexp"]=$r_res["row"]["regexp"];
				}
				//
				//Conversioni per retrocompatibilità
				//
				if(!$is_form_old && !array_key_exists("title_text",$fr_fx_row)){
					$fr_data_source_param_arr=!is_empty($fr_fx_row["data_source_param"])?json_decode($fr_fx_row["data_source_param"],true):array();
					//
					//BUTTONS
					//
					if($fr_fx_row["field_type"]=="button_confirm" || $fr_fx_row["field_type"]=="button_cancel"){
						continue;
					}
					//
					//FORM_ROW
					//
					$fr_fx_row["then_function"]=!is_empty($fr_fx_row["then_function"])?$fr_fx_row["then_function"]:($fr_data_source_param_arr["then"]??null);
					$fr_fx_row["style"]=!is_empty($fr_fx_row["style"])?$fr_fx_row["style"]:($fr_data_source_param_arr["form_row_style_custom"]??null);
					//
					//TITLE
					//
					$fr_fx_row["title_size"]=!is_empty($fr_fx_row["title_size"])?$fr_fx_row["title_size"]:($fr_data_source_param_arr["title_size"]??null);
					$fr_fx_row["title_style"]=!is_empty($fr_fx_row["title_style"])?$fr_fx_row["title_style"]:($fr_data_source_param_arr["title_style_custom"]??null);
					$fr_fx_row["title_text"]=!is_empty($fr_fx_row["title_text"])?$fr_fx_row["title_text"]:($fr_fx_row["label"]??null);
					$fr_fx_row["is_title_hidden"]=!is_empty($fr_fx_row["is_title_hidden"])?$fr_fx_row["is_title_hidden"]:($fr_data_source_param_arr["hide_title"]??null);
					//
					//FIELD
					//
					$fr_fx_row["field_size"]=!is_empty($fr_fx_row["field_size"])?$fr_fx_row["field_size"]:($fr_data_source_param_arr["field_size"]??null);
					$fr_fx_row["field_style"]=!is_empty($fr_fx_row["field_style"])?$fr_fx_row["field_style"]:($fr_data_source_param_arr["field_style_custom"]??null);
					$fr_fx_row["field_text"]=!is_empty($fr_fx_row["field_text"])?$fr_fx_row["field_text"]:($fr_data_source_param_arr["text"]??null);
					$fr_fx_row["field_to_dict"]=!is_empty($fr_fx_row["field_to_dict"])?$fr_fx_row["field_to_dict"]:($fr_fx_row["to_dict"]??null);
					//$fr_fx_row["field_regexp"]=!is_empty($fr_fx_row["field_regexp"])?$fr_fx_row["field_regexp"]:($fr_fx_row["regexp"]??null);
					$fr_fx_row["field_datasource_type"]=!is_empty($fr_fx_row["field_datasource_type"])?$fr_fx_row["field_datasource_type"]:($fr_fx_row["data_source_type"]??null);
					$fr_fx_row["field_datasource"]=!is_empty($fr_fx_row["field_datasource"])?$fr_fx_row["field_datasource"]:($fr_fx_row["data_source_src"]??null);
					$fr_fx_row["field_icon"]=!is_empty($fr_fx_row["field_icon"])?$fr_fx_row["field_icon"]:($fr_data_source_param_arr["icon"]??null);
					//
					$fr_field_type=$fr_fx_row["field_type"];
					if($fr_fx_row["field_type"]=="input" && $fr_fx_row["data_type"] == "string")								$fr_field_type="input_text";
					if($fr_fx_row["field_type"]=="input" && $fr_fx_row["data_type"] == "password")								$fr_field_type="input_password";
					if($fr_fx_row["field_type"]=="input" && $fr_fx_row["data_type"] == "number")								$fr_field_type="input_number";
					if($fr_fx_row["field_type"]=="range" && $fr_fx_row["data_type"] == "number")								$fr_field_type="input_range";
					if($fr_fx_row["field_type"]=="color" && $fr_fx_row["data_type"] == "string")								$fr_field_type="input_color";
					if($fr_fx_row["field_type"]=="input" && $fr_fx_row["data_type"] == "date")								$fr_field_type="datetime_date";
					if($fr_fx_row["field_type"]=="input" && $fr_fx_row["data_type"] == "time")								$fr_field_type="datetime_time";
					if($fr_fx_row["field_type"]=="input" && $fr_fx_row["data_type"] == "datetime")								$fr_field_type="datetime_datetime";
					if($fr_fx_row["field_type"]=="input" && $fr_fx_row["data_type"] == "datetime_range")							$fr_field_type="datetime_range";
					if($fr_fx_row["field_type"]=="input_multiline" && $fr_fx_row["data_type"] == "string")							$fr_field_type="textarea";
					if($fr_fx_row["field_type"]=="icon")													$fr_field_type="icon";
					if($fr_fx_row["field_type"]=="switch" && $fr_fx_row["data_type"] == "boolean")								$fr_field_type="switch";
					if($fr_fx_row["field_type"]=="button")													$fr_field_type="button";
					if($fr_fx_row["field_type"]=="image")													$fr_field_type="image";
					if($fr_fx_row["field_type"]=="label")													$fr_field_type="label";
					if($fr_fx_row["field_type"]=="precode" && $fr_fx_row["data_type"] == "string")								$fr_field_type="precode";
					if($fr_fx_row["field_type"]=="select" || $fr_fx_row["field_type"] == "autocomplete" || $fr_fx_row["field_type"] == "dropdown")		$fr_field_type="select";
					if($fr_fx_row["field_type"]=="multiselect")												$fr_field_type="select_multi";
					if($fr_fx_row["field_type"]=="upload")													$fr_field_type="upload";
					if($fr_fx_row["field_type"]=="wysiwyg" && $fr_fx_row["data_type"] == "string")								$fr_field_type="wysiwyg";
					if($fr_fx_row["field_type"]=="iframe")													$fr_field_type="iframe";
					if($fr_fx_row["field_type"]=="chips")													$fr_field_type="chips";
					if($fr_fx_row["field_type"]=="line")													$fr_field_type="line";
					$fr_fx_row["field_type"]=$fr_field_type;
					//
					$fr_fx_row["has_field_select_empty_option"]=!is_empty($fr_fx_row["has_field_select_empty_option"])?$fr_fx_row["has_field_select_empty_option"]:($fr_data_source_param_arr["has_empty_value"]??($fr_data_source_param_arr["has_empty_option"]??null));
					$fr_fx_row["field_select_empty_option_text"]=!is_empty($fr_fx_row["field_select_empty_option_text"])?$fr_fx_row["field_select_empty_option_text"]:($fr_data_source_param_arr["empty_value_label"]??($fr_data_source_param_arr["empty_option_label"]??null));
					$fr_fx_row["is_field_select_always_with_value"]=!is_empty($fr_fx_row["is_field_select_always_with_value"])?$fr_fx_row["is_field_select_always_with_value"]:($fr_data_source_param_arr["is_always_with_value"]??null);
					$fr_fx_row["field_select_max_selected_items"]=!is_empty($fr_fx_row["field_select_max_selected_items"])?$fr_fx_row["field_select_max_selected_items"]:($fr_data_source_param_arr["max_selected_items"]??null);
					$fr_fx_row["field_select_configuration_index_field"]=!is_empty($fr_fx_row["field_select_configuration_index_field"])?$fr_fx_row["field_select_configuration_index_field"]:($fr_data_source_param_arr["field_to_show"]??null);
				}
				//
				$fr_fx_rows[]=$fr_fx_row;
			}
			//
			return $fr_fx_rows;
		}
	}
	//
	function get_form_copy_arr(){
		$id_form=$this->getRequestVar("id_form",null,true);
		$is_cascade=$this->getRequestVar("is_cascade",null,true);
		//
		$f_res=$this->database->getItem("form",array("id"=>$id_form));
		$f_row=$f_res["row"];
		//
		unset($f_row["id"]);
		//
		$copy_arr=array();
		$copy_arr[]=array(
			"table"=>"form",
			"unique_arr"=>array("code"),
			"solve_arr"=>array(),
			"data_arr"=>$f_row,
		);
		//
		if(((int)$is_cascade)==1){
			$fr_res=$this->database->getItems("form_row",array("id_form"=>$id_form),array("id_form_row_box"=>"DESC","id"=>"ASC"));
			if($fr_res["count"]>0){
				foreach($fr_res["rows"] as $fr_row){
					$copy_arr=array_merge($copy_arr,$this->get_form_row_copy_arr($fr_row["id"],true));
				}
			}
		}
		//
		$this->__sendResult($copy_arr);
	}
	//
	function get_form_row_copy_arr($id_fr=null,$is_return=false){
		$id_fr=$this->getRequestVar("id_fr",$id_fr,true);
		//
		$fr_res=$this->database->getItem("form_row",array("id"=>$id_fr));
		$fr_row=$fr_res["row"];
		//
		unset($fr_row["id"]);
		//
		if(!is_empty($fr_row["id_form"])){
			$f_res=$this->database->getItem("form",array("id"=>$fr_row["id_form"]));
			$f_row=$f_res["row"];
			//
			$fr_row["id_form"]=sprintf("SELECT id FROM form WHERE code='%s'",$f_row["code"]);
		}
		//
		if(!is_empty($fr_row["id_form_row_template"])){
			$frt_res=$this->database->getItem("form_row_template",array("id"=>$fr_row["id_form_row_template"]));
			$frt_row=$frt_res["row"];
			//
			$fr_row["id_form_row_template"]=sprintf("SELECT id FROM form_row_template WHERE code='%s'",$frt_row["code"]);
		}
		//
		if(!is_empty($fr_row["id_field_regexp"])){
			$r_res=$this->database->getItem("regexp",array("id"=>$fr_row["id_field_regexp"]));
			$r_row=$r_res["row"];
			//
			$fr_row["id_field_regexp"]=sprintf("SELECT id FROM regexp WHERE code='%s'",$r_row["code"]);
		}
		//
		if(!is_empty($fr_row["id_form_row_box"])){
			$fr_box_res=$this->database->getItem("form_row",array("id"=>$fr_row["id_form_row_box"]));
			$fr_box_row=$fr_box_res["row"];
			//
			$fr_row["id_form_row_box"]=sprintf("SELECT id FROM form_row WHERE id_form=(SELECT id FROM form WHERE code='%s') AND code='%s'",$f_row["code"],$fr_box_row["code"]);
		}
		//
		$copy_arr=array();
		$copy_arr[]=array(
			"table"=>"form_row",
			"unique_arr"=>array("code","id_form"),
			"solve_arr"=>array("id_form","id_form_row_template","id_field_regexp","id_form_row_box"),
			"data_arr"=>$fr_row,
			//
			"info_arr"=>array(
				"f_code"=>$f_row["code"],
				"fr_code"=>$fr_row["code"],
			),
		);
		//
		if($is_return){
			return $copy_arr;
		}
		//
		$this->__sendResult($copy_arr);
	}
	//
	function fix_form_priority_vertical_and_horizontal(){
		$form_code=$this->getRequestVar("form_code",null,true);
		//
		$fr_rows=$this->get_form_row_arr($form_code,false);
		//
		$fr_p_vertical_old_last=0;
		$fr_p_vertical_new=0;
		$fr_p_horizontal_new=0;
		//
		foreach($fr_rows as $fr_row){
			$fr_p_vertical_old=$fr_row["priority_vertical"];
			//
			if($fr_p_vertical_old!=$fr_p_vertical_old_last){
				$fr_p_vertical_new+=100;
				$fr_p_horizontal_new=100;
			}
			//
			$fr_arr=array(
				"id"=>$fr_row["id"],
				"priority_vertical"=>$fr_p_vertical_new,
				"priority_horizontal"=>$fr_p_horizontal_new,
			);
			$this->database->inup("form_row",$fr_arr,array("id"));
			//
			$fr_p_vertical_old_last=$fr_row["priority_vertical"];
			$fr_p_horizontal_new+=100;
		}
		//
		$this->__sendResult();
	}
	//
	function change_form_priority_horizontal(){
		$id_form_row=$this->getRequestVar("id_form_row",null,true);
		$priority=$this->getRequestVar("priority",null,true);
		//
		//call fix priority
		$fr_res=$this->database->getItem("form_row",array("id"=>$id_form_row));
		$f_res=$this->database->getItem("form",array("id"=>$fr_res["row"]["id_form"]));
		$this->setRequestVar("form_code",$f_res["row"]["code"]);
		$this->fix_form_priority_vertical_and_horizontal();
		//
		//refresh data, set horizontal priority and recall fix priority
		$fr_res=$this->database->getItem("form_row",array("id"=>$id_form_row));
		if(!is_empty($fr_res["row"]["priority_horizontal"])){
			$priority_horizontal_new=$fr_res["row"]["priority_horizontal"]+$priority;
			//
			$fr_arr=array(
				"id"=>$id_form_row,
				"priority_horizontal"=>$priority_horizontal_new,
			);
			$this->database->inup("form_row",$fr_arr,array("id"));
			//
			$this->fix_form_priority_vertical_and_horizontal();
			//
			$this->__sendResult();
		}
	}
	//
	function change_form_priority_vertical(){
		$id_form_row=$this->getRequestVar("id_form_row",null,true);
		$priority=$this->getRequestVar("priority",null,true);
		//
		//call fix priority vertical
		$fr_res=$this->database->getItem("form_row",array("id"=>$id_form_row));
		$f_res=$this->database->getItem("form",array("id"=>$fr_res["row"]["id_form"]));
		$this->setRequestVar("form_code",$f_res["row"]["code"]);
		$this->fix_form_priority_vertical_and_horizontal();
		//
		//refresh data, set vertical priority and recall fix priority
		$fr_res=$this->database->getItem("form_row",array("id"=>$id_form_row));
		if(!is_empty($fr_res["row"]["priority_vertical"])){
			$priority_vertical_new=$fr_res["row"]["priority_vertical"]+$priority;
			//
			$fr_arr=array(
				"id"=>$id_form_row,
				"priority_vertical"=>$priority_vertical_new,
			);
			$this->database->inup("form_row",$fr_arr,array("id"));
			//
			$this->fix_form_priority_vertical_and_horizontal();
			//
			$this->__sendResult();
		}
	}
	//
	function field_upload_add_file(){
		$folder=$this->getRequestVar("folder",null,true);
		//
		if(is_empty($_FILES["filepond"]["name"])){
			throw new Exception("AJAX_ERROR_FILE_NOT_FOUND");
		}
		//
		$folder_path_dest=sprintf("%s",$folder);
		if(!file_exists($folder_path_dest)){
			mkdir($folder_path_dest,0700);
		}
		//
		$file_path_dest=sprintf("%s/%s",$folder_path_dest,$_FILES["filepond"]["name"]);
		//
		rename($_FILES["filepond"]["tmp_name"],$file_path_dest);
		//
		$this->__sendResult(array("file_path"=>$file_path_dest));
	}
	//
	function field_upload_remove_file(){
		$file_path=$this->getRequestVar("file_path",null,true);
		//
		if(file_exists($file_path)){
			unlink($file_path);
		}
		//
		$this->__sendResult();
	}
	//
	//TODO - Vecchio upload
	//
	function form_row_upload_get_code(){
		$code=sprintf("UP_%s%s",PHP4NS::preg_replace("/[^0-9]/","",$_SERVER["REMOTE_ADDR"]??""),PHP4NS::floor(microtime(true)*10000).PHP4NS::rand(1000000000,9999999999));
		//
		$this->__sendResult(array("code"=>$code));
	}
	//
	function form_row_upload_copy_file(){
		$upload_code=$this->getRequestVar("upload_code",null,true);
		//
		if(is_empty($_FILES["file"])){
			throw new Exception("AJAX_ERROR_FILE_NOT_FOUND");
		}
		//
		$path_dir=sprintf("/tmp/%s",$upload_code);
		$path_file=sprintf("%s/%s",$path_dir,$_FILES["file"]["name"]);
		//
		if(!file_exists($path_dir)){
			mkdir($path_dir,0700);
		}
		//
		if(file_exists($path_file)){
			$path_file=sprintf("%s/%s_%s",$path_dir,PHP4NS::floor(microtime(true)*10000),$_FILES["file"]["name"]);
		}
		//
		copy($_FILES["file"]["tmp_name"],$path_file);
		//
		$this->__sendResult(array("path"=>$path_file,"filename"=>$_FILES["file"]["name"]));
	}
	//
	function form_row_upload_remove_file(){
		$upload_code=$this->getRequestVar("upload_code",null,true);
		//
		$path_dir=sprintf("/tmp/%s",$upload_code);
		$path_file=sprintf("%s/%s",$path_dir,$_REQUEST["fileNames"]);
		//
		if(file_exists($path_file)){
			unlink($path_file);
		}
		//
		$this->__sendResult(array("path"=>$path_file,"filename"=>$_REQUEST["fileNames"]));
	}
	//
	function get_chart_info_arr(){
		$chart_code=$this->getRequestVar("chart_code",null,true);
		//
		//TODO - CUSTOM CHART
		//
		$chart_info_arr=array();
		if(!is_empty($this->custom->custom_chart) && method_exists($this->custom->custom_chart,$chart_code)){
			$chart_info_arr=$this->custom->custom_chart->{$chart_code}();
		}
		//
		$this->__sendResult(array("chart_info_arr"=>$chart_info_arr));
	}
	//
	function system_lock_wip(){
		$c_res=$this->database->getItem("configuration",array("code"=>"system_lock_wip"));
		//
		$value_new=(((int)$c_res["row"]["value"])+1)%2;
		//
		$c_arr=array(
			"id"=>$c_res["id"],
			"value"=>strval($value_new),
		);
		$this->database->inup("configuration",$c_arr,array("id"));
		//
		if($value_new==1){
			$us_delete=sprintf("DELETE FROM user_session");
			$this->database->delete($us_delete);
		}
		//
		$this->__sendResult();
	}
	//
	function get_id_from_linker_data(){
		$table=$this->getRequestVar("table",null,true);
		$field=$this->getRequestVar("field",null,true);
		$value=$this->getRequestVar("value",null,true);
		//
		$t_res=$this->database->getItem($table,array($field=>$value));
		//
		$id_t=null;
		if(!is_empty($t_res["id"])){
			$id_t=$t_res["id"];
		}
		//
		$this->__sendResult(array("id"=>$id_t));
	}
	//
	function get_dictionary_row(){
		$id=$this->getRequestVar("id",null,false);
		$code=$this->getRequestVar("code",null,false);
		//
		$d_arr=null;
		if(!is_empty($id)){
			$d_arr=array("id"=>$id);
		}
		else if(!is_empty($code)){
			$d_arr=array("code"=>$code);
		}
		//
		if(is_empty($d_arr)){
			throw new Exception("AJAX_ERROR_DICTIONARY_PARAM_NOT_FOUND");
		}
		//
		$d_res=$this->database->getItem("dictionary",$d_arr);
		//
		$this->__sendResult(array("d_row"=>$d_res["row"]));
	}
	//
	function form_GetField_String($value){
		$value_fx=!is_empty($value)?$value:"###NULL###";
		//
		return strval($value_fx);
	}
	//
	function form_GetField_Boolean($value){
		$value_fx="0";
		if($value===true || $value==="true" || ((int)$value)==1){
			$value_fx="1";
		}
		//
		return $value_fx;
	}
	//
	function save_form_rows_layout(){
		$id_form=$this->getRequestVar("id_form",null,false);
		$priority_arr=$this->getRequestVar("priority_arr",null,false);
		//
		foreach($priority_arr as $priority){
			$fr_arr=array(
				"id"=>$priority["id"],
				"priority_vertical"=>$priority["priority_vertical"],
				"priority_horizontal"=>$priority["priority_horizontal"],
			);
			$this->database->inup("form_row",$fr_arr,array("id"));
		}
		//
		$this->__sendResult();
	}
}
?>