<?php
class WS_METHOD{
	const GET="GET";
	const POST="POST";
	const PUT="PUT";
	const DELETE="DELETE";
}
//
class WS_AUTH_TYPE{
	const NONE="None";
	const BASIC_BODY="BasicBody";
	const BASIC="Basic";
	const BEARER="Bearer";
}
//
class WS_BODY_TYPE{
	const NONE="none";
	const RAW="raw";
	const X_WWW_FORM_URLENCODED="x-www-form-urlencoded";
	const MULTIPART="multipart";
}
//
class WS_CONTENT_TYPE{
	const TEXT_PLAIN="text/plain";
	const TEXT_XML="text/xml";
	const APPLICATION_JSON="application/json";
	const APPLICATION_X_WWW_FORM_URLENCODED="application/x-www-form-urlencoded";
}
//
class WS_RESPONSE{
	const HTTP_CODE_200="200";	//OK
	const HTTP_CODE_201="201";	//Created
	const HTTP_CODE_401="401";	//Unauthorized
	const HTTP_CODE_404="404";	//Not Found
	const HTTP_CODE_405="405";	//Method Not Allowed
}
//
const WS_ACT_GET_TOKEN="getToken";
const WS_DOMAIN_DEFAULT="default";
//
class ManagerWS_Server{
	public $database;
	public $def_manager;
	public $def_config;
	public $custom;
	//
	public $ws_domain_arr;
	public $ws_domain;
	public $ws_auth;
	public $ws_user;
	public $ws_password;
	public $ws_act;
	//
	function __construct($database,$def_manager,$def_config,$custom){
		$this->database=$database;
		$this->def_manager=$def_manager;
		$this->def_config=$def_config;
		$this->custom=$custom;
		//
		$this->ws_domain_arr=null;
		$this->ws_domain=null;
		$this->ws_auth=null;
		$this->ws_user=null;
		$this->ws_password=null;
		$this->ws_act=null;
	}
	//
	function doMethod($ws_config_arr,$param_arr){
		try{
			$id_call=uniqid().PHP4NS::rand(10000,99999);
			//
			$this->ws_domain=$param_arr["domain"]??($_SERVER["HTTP_DOMAIN"]??null);
			$this->ws_act=$param_arr["act"]??($_SERVER["HTTP_ACT"]??null);
			$this->ws_user=$param_arr["user"]??($_SERVER["PHP_AUTH_USER"]??null);
			$this->ws_password=$param_arr["password"]??($_SERVER["PHP_AUTH_PW"]??null);
			//
			Log::write(Log::INFO,sprintf("ws_server_%s",$this->ws_domain),sprintf("[CALL %s] RECEIVED %s - %s",$id_call,json_encode($_SERVER),json_encode($param_arr)));
			//
			$this->checkWs($ws_config_arr,$param_arr);
			//
			Log::write(Log::INFO,sprintf("ws_server_%s",$this->ws_domain),sprintf("[CALL %s] DOMAIN = %s - USER = %s - ACT = %s",$id_call,$this->ws_domain,$this->ws_user,$this->ws_act));
			//
			if($this->ws_act!=WS_ACT_GET_TOKEN){
				chdir($this->ws_domain);
				require_once($this->ws_act.".php");
			}
			//
			$data=null;
			//
			//FORM-DATA / X-WWW-FORM-URLENCODED
			//
			if(!is_empty($param_arr)){
				$data=$param_arr;
			}
			//
			//RAW
			//
			else{
				$raw_str=file_get_contents("php://input");
				//
				//EMPTY
				//
				if(is_empty($raw_str)){
					$data=null;
				}
				//
				//JSON
				//
				else if($_SERVER["CONTENT_TYPE"]==WS_CONTENT_TYPE::APPLICATION_JSON){
					$data=json_decode($raw_str,true);
					//
					if($data===null){
						throw new Exception("WS_ERROR_JSON_NOT_VALID");
					}
				}
				//
				//TEXT
				//
				else if($_SERVER["CONTENT_TYPE"]==WS_CONTENT_TYPE::TEXT_PLAIN){
					$data=$raw_str;
				}
				//
				//XML
				//
				else if($_SERVER["CONTENT_TYPE"]==WS_CONTENT_TYPE::TEXT_XML){
					$data=$this->def_manager["convert"]->fromXmlToArray($raw_str);
					//
					if($data===null){
						throw new Exception("WS_ERROR_XML_NOT_VALID");
					}
				}
				//
				//NOT MANAGED
				//
				else{
					throw new Exception("WS_ERROR_CONTENT_TYPE_NOT_VALID");
				}
			}
			//
			Log::write(Log::INFO,sprintf("ws_server_%s",$this->ws_domain),sprintf("[CALL %s] DATA = %s",$id_call,json_encode($data)));
			//
			$ws_ret=null;
			if($this->ws_act==WS_ACT_GET_TOKEN){
				$def_manager_ws_token=new ManagerWS_Token($this->database,$this->def_manager,$this->def_config,$this->custom);
				$wst_row=$def_manager_ws_token->generate($this->ws_domain,$this->ws_user,false,$this->ws_domain_arr["token_valid_minutes"]??60);
				//
				$ws_ret=array(
					"token"=>$wst_row["token"],
					"expiry"=>$wst_row["date_expiry"],
				);
			}
			else{
				$ws_act=new WS_Act($this->database,$this->def_manager,$this->def_config,$this->custom);
				$ws_ret=$ws_act->doMethod($data);
			}
			//
			Log::write(Log::INFO,sprintf("ws_server_%s",$this->ws_domain),sprintf("[CALL %s] SUCCESS = %s",$id_call,json_encode($ws_ret)));
			//
			$this->sendResultSuccess($ws_ret);
		}
		catch(Exception $e){
			Log::write(Log::ERROR,sprintf("ws_server_%s",$this->ws_domain),sprintf("[CALL %s] ERROR = %s",$id_call,$e->getMessage()));
			//
			$this->sendResultError($e->getMessage());
		}
	}
	//
	function checkWs($ws_config_arr,$param_arr){
		$is_check_credential=false;
		$is_check_token=false;
		//
		//CHECK URL
		//
		if(!is_empty($_SERVER["HTTP_REFERER"]) && !str_contains($_SERVER["HTTP_REFERER"],"?") && PHP4NS::substr($_SERVER["HTTP_REFERER"],-1)!="/"){
			throw new Exception("WS_ERROR_URL_NOT_VALID");//Messo in quanto gli URL senza slash finale non funzionano
		}
		//
		//CHECK DOMAIN
		//
		if(is_empty($this->ws_domain) || !array_key_exists($this->ws_domain,$ws_config_arr)){
			throw new Exception("WS_ERROR_DOMAIN_NOT_VALID");
		}
		//
		$this->ws_domain_arr=$ws_config_arr[$this->ws_domain];
		//
		//CHECK AUTH
		//
		$ws_http_authorization=$_SERVER["HTTP_AUTHORIZATION"]??null;
		$this->ws_auth=$this->ws_domain_arr["auth"]??null;
		//
		//No Auth
		if($this->ws_auth==WS_AUTH_TYPE::NONE){
			//
		}
		//
		//Basic Body (4NS Old)
		else if($this->ws_auth==WS_AUTH_TYPE::BASIC_BODY){
			$is_check_credential=true;
		}
		//
		//Basic Auth
		else if($this->ws_auth==WS_AUTH_TYPE::BASIC){
			if(!str_starts_with($ws_http_authorization,WS_AUTH_TYPE::BASIC)){
				throw new Exception("WS_ERROR_AUTH_NOT_VALID");
			}
			//
			$is_check_credential=true;
		}
		//
		//Bearer Auth - WS_ACT_GET_TOKEN
		else if($this->ws_auth==WS_AUTH_TYPE::BEARER && $this->ws_act==WS_ACT_GET_TOKEN){
			if(!str_starts_with($ws_http_authorization,WS_AUTH_TYPE::BASIC)){
				throw new Exception("WS_ERROR_AUTH_NOT_VALID");
			}
			//
			$is_check_credential=true;
		}
		//
		//Bearer Auth
		else if($this->ws_auth==WS_AUTH_TYPE::BEARER){
			if(!str_starts_with($ws_http_authorization,WS_AUTH_TYPE::BEARER)){
				throw new Exception("WS_ERROR_AUTH_NOT_VALID");
			}
			//
			$is_check_token=true;
		}
		//
		//Not Managed
		else{
			throw new Exception("WS_ERROR_AUTH_NOT_VALID");
		}
		//
		//CHECK CREDENTIAL
		//
		if($is_check_credential){
			$ws_domain_user_arr=$this->ws_domain_arr["user_arr"]??array();
			$is_credential_valid=false;
			//
			foreach($ws_domain_user_arr as $ws_domain_user){
				if(
					!is_empty($this->ws_user) && $this->ws_user==$ws_domain_user["username"] &&
					!is_empty($this->ws_password) && $this->ws_password==$ws_domain_user["password"]
				){
					$is_credential_valid=true;
					//
					break;
				}
			}
			//
			if(!$is_credential_valid){
				throw new Exception("WS_ERROR_LOGIN_FAILED");
			}
		}
		//
		//CHECK TOKEN
		//
		if($is_check_token){
			$ws_token_from_auth=trim(str_replace(WS_AUTH_TYPE::BEARER,"",$ws_http_authorization));
			$ws_token_from_cookie=$_COOKIE["token"]??null;
			//
			$ws_token=!is_empty($ws_token_from_auth)?$ws_token_from_auth:$ws_token_from_cookie;
			//
			$def_manager_ws_token=new ManagerWS_Token($this->database,$this->def_manager,$this->def_config,$this->custom);
			if(!$def_manager_ws_token->isValid($this->ws_domain,false,$ws_token)){
				throw new Exception("WS_ERROR_TOKEN_NOT_VALID");
			}
		}
		//
		//CHECK ACT
		//
		if(is_empty($this->ws_act) || ($this->ws_act!=WS_ACT_GET_TOKEN && !file_exists(sprintf("%s/%s.php",$this->ws_domain,$this->ws_act)))){
			throw new Exception("WS_ERROR_NOT_VALID_ACTION");
		}
	}
	//
	function sendResultSuccess($data_arr=null){
		if($data_arr!==null){
			$ret_arr=array(
				"success"=>1,
				"data"=>$data_arr,
			);
		}
		else{
			$ret_arr=array(
				"success"=>1,
			);
		}
		//
		$this->sendJson($ret_arr);
	}
	//
	function sendResultError($error_code){
		$error_code_exp=PHP4NS::explode("|",$error_code);
		$d_res=$this->database->getItem("dictionary",array("code"=>$error_code_exp[0]));
		//
		$error_arr=array(
			//"code"=>$error_code,
			"en"=>"Error: ".$error_code,
			"it"=>"Errore: ".$error_code,
		);
		//
		if(!is_empty($d_res["id"])){
			$d_en=$d_res["row"]["en"];
			$d_it=$d_res["row"]["it"];
			//
			if(!is_empty($error_code_exp[1])){
				$i=0;
				foreach(array_slice($error_code_exp,1) as $ece){
					$d_en=PHP4NS::str_replace(sprintf("{%s}",$i),$ece,$d_en);
					$d_it=PHP4NS::str_replace(sprintf("{%s}",$i),$ece,$d_it);
					$i++;
				}
			}
			//
			$error_arr=array(
				//"code"=>$d_res["row"]["code"],
				"en"=>$d_en,
				"it"=>$d_it,
			);
		}
		//
		$ret_arr=array(
			"success"=>0,
			"error"=>$error_arr,
		);
		//
		$this->sendJson($ret_arr);
	}
	//
	function sendJson($ret_arr){
		if(!is_empty($ret_arr["success"]) && $ret_arr["success"]==1 && is_empty($ret_arr["error"]) && error_get_last()==null){
			echo $this->compressJson(json_encode($ret_arr));
			exit(0);
		}
		//
		echo json_encode($ret_arr);
		exit(0);
	}
	//
	function compressJson($data_str){
		$supportsGzip=PHP4NS::strpos($_SERVER["HTTP_ACCEPT_ENCODING"]??null,"gzip")!==false;
		//
		if($supportsGzip){
			//15-09-21 GP Modifica effettuata per OneService
			//$content=gzencode(PHP4NS::trim(PHP4NS::preg_replace('/\s+/',' ',$data_str)),9);
			$content=gzencode(PHP4NS::trim($data_str),9);
			//
			header('Content-Encoding: gzip');
		}
		else{
			$content=$data_str;
		}
		//
		return $content;
	}
}
//
class ManagerWS_Client{
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
	public function call($param_arr){
		$param_arr=array_merge($param_arr,array(
			"method"=>$param_arr["method"]??WS_METHOD::GET,
			"url"=>$param_arr["url"]??null,
			"enable_ssl_verification"=>$param_arr["enable_ssl_verification"]??false,
			"auth_arr"=>$param_arr["auth_arr"]??array(),
			"header_arr"=>$param_arr["header_arr"]??array(),
			"body_type"=>$param_arr["body_type"]??WS_BODY_TYPE::NONE,
			"data"=>$param_arr["data"]??null,
			"debug"=>$param_arr["debug"]??false,
			"ws_domain"=>$param_arr["ws_domain"]??WS_DOMAIN_DEFAULT,
			"response_http_code_accepted_arr"=>$param_arr["response_http_code_accepted_arr"]??array(
				WS_RESPONSE::HTTP_CODE_200,
				WS_RESPONSE::HTTP_CODE_201,
			),
		));
		//
		try{
			$id_call=uniqid().PHP4NS::rand(10000,99999);
			//
			Log::write(Log::INFO,sprintf("ws_client_%s",$param_arr["ws_domain"]),sprintf("[CALL %s] PARAM: %s",$id_call,json_encode($param_arr)));
			//
			//CURL INIT
			//
			$ch=curl_init();
			//
			curl_setopt($ch,CURLOPT_URL,$param_arr["url"]);
			curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
			curl_setopt($ch,CURLOPT_POST,($param_arr["method"]==WS_METHOD::POST?true:false));
			curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,$param_arr["enable_ssl_verification"]);
			//
			//AUTH
			//
			if(!is_empty($param_arr["auth_arr"]["type"]) && $param_arr["auth_arr"]["type"]!=WS_AUTH_TYPE::NONE){
				$auth_str="";
				//
				//BASIC
				//
				if($param_arr["auth_arr"]["type"]==WS_AUTH_TYPE::BASIC){
					$auth_str=WS_AUTH_TYPE::BASIC." ".base64_encode(sprintf("%s:%s",$param_arr["auth_arr"]["user"]??null,$param_arr["auth_arr"]["password"]??null));
				}
				//
				//BEARER
				//
				else if($param_arr["auth_arr"]["type"]==WS_AUTH_TYPE::BEARER){
					$auth_str=WS_AUTH_TYPE::BEARER." ".($param_arr["auth_arr"]["token"]??null);
				}
				//
				//NOT MANAGED
				//
				else{
					throw new Exception("WS_ERROR_AUTH_TYPE_NOT_MANAGED");
				}
				//
				//SET HEADER AUTHORIZATION
				//
				$param_arr["header_arr"]=array_merge($param_arr["header_arr"],array(
					"Authorization"=>$auth_str,
				));
			}
			//
			//HEADER
			//
			if($param_arr["body_type"]==WS_BODY_TYPE::MULTIPART){
				if(isset($param_arr["header_arr"]["Content-type"])){
					unset($param_arr["header_arr"]["Content-type"]);
				}
			}
			else{
				$param_arr["header_arr"]=array_merge($param_arr["header_arr"],array(
					"Content-type"=>$param_arr["header_arr"]["Content-type"]??WS_CONTENT_TYPE::APPLICATION_JSON,
				));
			}
			//
			$header_str_arr=array();
			foreach($param_arr["header_arr"] as $k=>$v){
				$header_str_arr[]=sprintf("%s: %s",$k,$v);
			}
			//
			curl_setopt($ch,CURLOPT_HTTPHEADER,$header_str_arr);
			//
			//BODY
			//
			if(!is_empty($param_arr["body_type"]) && $param_arr["body_type"]!=WS_BODY_TYPE::NONE){
				//
				//RAW
				//
				if($param_arr["body_type"]==WS_BODY_TYPE::RAW){
					//
					//GET
					//
					if($param_arr["method"]==WS_METHOD::GET && !is_empty($param_arr["data"])){
						curl_setopt($ch,CURLOPT_CUSTOMREQUEST,WS_METHOD::GET);
						curl_setopt($ch,CURLOPT_POSTFIELDS,$param_arr["data"]);
					}
					//
					//POST
					//
					else if($param_arr["method"]==WS_METHOD::POST && !is_empty($param_arr["data"])){
						curl_setopt($ch,CURLOPT_POSTFIELDS,$param_arr["data"]);
					}
					//
					//PUT
					//
					else if($param_arr["method"]==WS_METHOD::PUT && !is_empty($param_arr["data"])){
						curl_setopt($ch,CURLOPT_CUSTOMREQUEST,WS_METHOD::PUT);
						curl_setopt($ch,CURLOPT_POSTFIELDS,$param_arr["data"]);
					}
					//
					//DELETE
					//
					else if($param_arr["method"]==WS_METHOD::DELETE){
						curl_setopt($ch,CURLOPT_CUSTOMREQUEST,WS_METHOD::DELETE);
					}
				}
				//
				//X_WWW_FORM_URLENCODED
				//
				else if($param_arr["body_type"]==WS_BODY_TYPE::X_WWW_FORM_URLENCODED){
					//
					//GET
					//
					if($param_arr["method"]==WS_METHOD::GET && !is_empty($param_arr["data"])){
						throw new Exception("WS_ERROR_BODY_TYPE_NOT_MANAGED_IN_GET");
					}
					//
					//POST
					//
					else if($param_arr["method"]==WS_METHOD::POST && !is_empty($param_arr["data"])){
						curl_setopt($ch,CURLOPT_POSTFIELDS,http_build_query($param_arr["data"]));
					}
					//
					//PUT
					//
					else if($param_arr["method"]==WS_METHOD::PUT && !is_empty($param_arr["data"])){
						curl_setopt($ch,CURLOPT_CUSTOMREQUEST,WS_METHOD::PUT);
						curl_setopt($ch,CURLOPT_POSTFIELDS,http_build_query($param_arr["data"]));
					}
				}
				//
				//MULTIPART
				//
				else if($param_arr["body_type"]==WS_BODY_TYPE::MULTIPART){
					curl_setopt($ch,CURLOPT_POST,true);
					curl_setopt($ch,CURLOPT_POSTFIELDS,$param_arr["data"]);
				}
				//
				//NOT MANAGED
				//
				else{
					throw new Exception("WS_ERROR_BODY_TYPE_NOT_MANAGED");
				}
			}
			//
			//HEADER RESPONSE
			//
			$ws_response_header_arr=array();
			curl_setopt($ch,CURLOPT_HEADERFUNCTION,function($curl,$header) use (&$ws_response_header_arr){
				$len=PHP4NS::strlen($header);
				$header_exp=PHP4NS::explode(':',$header,2);
				//
				if(count($header_exp)<2){
					return $len;
				}
				//
				$ws_response_header_arr[PHP4NS::strtolower(PHP4NS::trim($header_exp[0]))]=PHP4NS::trim($header_exp[1]);
				//
				return $len;
			});
			//
			//CALL
			//
			$ws_response_body=curl_exec($ch);
			$ws_response_http_code=curl_getinfo($ch,CURLINFO_HTTP_CODE);
			//
			if($param_arr["debug"]){
				Log::write(Log::DEBUG,sprintf("ws_client_%s",$param_arr["ws_domain"]),sprintf("[CALL %s] CURL INFO: %s",$id_call,json_encode(curl_getinfo($ch))));
				Log::write(Log::DEBUG,sprintf("ws_client_%s",$param_arr["ws_domain"]),sprintf("[CALL %s] HEADER INFO: %s",$id_call,json_encode($ws_response_header_arr)));
			}
			//
			curl_close($ch);
			//
			//RESPONSE
			//
			$response_arr=array(
				"http_code"=>$ws_response_http_code,
				"header_arr"=>$ws_response_header_arr,
				"body"=>$ws_response_body,
			);
			//
			//ERRORE: Chiamata non eseguita
			//
			if($ws_response_body===false){
				throw new Exception(sprintf("WS_ERROR_RESPONSE_NOT_VALID_{0}|%s",curl_error($ch)));
			}
			//
			//RESPONSE HTTP CODE
			//
			if(is_empty($response_arr["http_code"]) || !in_array($response_arr["http_code"],$param_arr["response_http_code_accepted_arr"])){
				throw new Exception(sprintf("WS_ERROR_RESPONSE_NOT_VALID_{0}|HTTP %s - %s",$response_arr["http_code"]??"",$response_arr["body"]??""));
			}
			//
			Log::write(Log::INFO,sprintf("ws_client_%s",$param_arr["ws_domain"]),sprintf("[CALL %s] RESPONSE: %s",$id_call,json_encode($response_arr)));
			//
			return $response_arr;
		}
		catch(Exception $e){
			Log::write(Log::ERROR,sprintf("ws_client_%s",$param_arr["ws_domain"]),sprintf("[CALL %s] %s",$id_call,$e->getMessage()));
			//
			throw $e;
		}
	}
}
//
//TODO
//
/*
------------------------------------------------------------------------
DROP TABLE IF EXISTS ws_token;
------------------------------------------------------------------------
CREATE TABLE ws_token (
	id			SERIAL					PRIMARY KEY,
	domain			TEXT					NOT NULL,
	username		TEXT					NOT NULL,
	is_ext			SMALLINT				NOT NULL DEFAULT 0,
	token			TEXT					NOT NULL,
	date_create		TIMESTAMP WITHOUT TIME ZONE		NOT NULL,
	date_expiry		TIMESTAMP WITHOUT TIME ZONE		NOT NULL
);

----

[{"table":"configuration","unique_arr":["code"],"solve_arr":[],"data_arr":{"code":"ws_config_json","value":"{\"bc\":{\"auth\":\"Bearer\",\"token_valid_minutes\":\"60\",\"user_arr\":[{\"username\":\"4ns\",\"password\":\"4ns#123\"},{\"username\":\"bc\",\"password\":\"bc#123\"}]}}","description":"Configurazione webservice","is_super":"1"}}]

*/
//
class ManagerWS_Token{
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
	public function getRow($domain,$is_ext,$token=null){
		$where_token="";
		if(!is_empty($token)){
			$where_token=sprintf("AND token='%s'",$token);
		}
		//
		$wst_sql=sprintf("	SELECT
					wst.*
					
					FROM
					ws_token AS wst
					
					WHERE
					wst.domain='%s'
					AND
					wst.is_ext=%s
					%s
					",
					$domain,
					$is_ext?"1":"0",
					$where_token
					);
		$wst_res=$this->database->getRows($wst_sql);
		//
		return $wst_res["rows"][0]??null;
	}
	//
	public function inup($wst_arr,$wst_key_arr){
		$wst_res=$this->database->inup("ws_token",$wst_arr,$wst_key_arr);
		//
		return $wst_res["row"];
	}
	//
	public function isValid($domain,$is_ext,$token=null){
		$wst_row=$this->getRow($domain,$is_ext,$token);
		//
		if(is_empty($wst_row["id"])){
			return false;
		}
		//
		$date_now_dt=new DateTime();
		$date_expiry_dt=new DateTime($wst_row["date_expiry"]);
		//
		if($date_now_dt<$date_expiry_dt){
			return true;
		}
		//
		return false;
	}
	//
	public function generate($domain,$user,$is_ext,$token_valid_minutes=60){
		$token=bin2hex(random_bytes(16));//Es. f3455d908df918a0fb1ecd0a7f464363, 313d3fe2fe36273cd616602f6e0111af
		//
		$date_create_dt=new DateTime();
		$date_create_txt=$date_create_dt->format("Y-m-d H:i:s");
		//
		$date_expiry_dt=clone $date_create_dt;
		$date_expiry_dt->modify(sprintf("+%s minutes",$token_valid_minutes));
		$date_expiry_txt=$date_expiry_dt->format("Y-m-d H:i:s");
		//
		$wst_arr=array(
			"domain"=>$domain,
			"username"=>$user,
			"is_ext"=>$is_ext?"1":"0",
			//
			"token"=>$token,
			"date_create"=>$date_create_txt,
			"date_expiry"=>$date_expiry_txt,
		);
		$wst_row=$this->inup($wst_arr,array("domain","username","is_ext"));
		//
		return $wst_row;
	}
}
?>
